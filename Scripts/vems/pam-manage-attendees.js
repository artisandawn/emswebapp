function pamManageBookingsModel(pageOptions) {
    var self = this;

    self.reservationId = ko.observable(pageOptions.ReservationId);
    self.bookingId = ko.observable(pageOptions.BookingId);
    self.templateId = ko.observable(pageOptions.TemplateId);
    self.timezoneId = ko.observable(pageOptions.TimezoneId);

    self.breadcrumb = ko.observable(pageOptions.Breadcrumb);

    self.hideNotifyChangedOnly = ko.observable(pageOptions.HideNotifyChangedOnly);

    self.changed = ko.observable(false);

    self.loadNotifyModal = function () {
        $('#notify-modal').modal('show');
    };

    self.updateAttendees = function (notifyAll) {
        vems.pageLoading(true);

        var saveData = {
            templateId: self.templateId(),
            reservationId: self.reservationId(),
            sendToAll: notifyAll
        };

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/PamManageAttendeesSave',
            data: JSON.stringify(saveData),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    window.location = response.SuccessMessage;
                }
                else {
                    vems.pageLoading(false);
                    vems.showToasterMessage('', response.ErrorMessage, 'danger');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                vems.pageLoading(false);
            }
        });
    }

    self.breadcrumbClicked = function () {
        if (self.changed()) {
            $('#notify-modal').modal('show');
        } else {
            window.location = self.breadcrumb().Link;
        }
    };
};

function attendeeViewModel(data, parentModel) {
    var self = this;

    self.parentModel = parentModel;

    self.minuteIncrementsForDisplay = 15;
    self.timezoneId = self.timezoneId;
    self.attendeeList = ko.observableArray(data);  //List<PAMAttendee>

    self.initTypeAhead = function (targetElement) {
        var timeout;

        $(targetElement).typeahead('destroy');
        vems.bindLoadingGifsToTypeAhead($(targetElement).typeahead({
            minLength: 3,
        },
        {
            source: function (query, sync, async) {
                if (timeout) {
                    clearTimeout(timeout);
                }

                timeout = setTimeout(function () {
                    onSearchItems({ qry: query, asyncCall: async });
                }, 400);

            },
            limit: 25,
            displayKey: 'DisplayName',
            templates: {
                suggestion: function (result) {

                    var txt = '<div class="row" style="margin: 0;"><span class="col-md-3 col-xs-5"><a href="#" onclick="return false;"><i class="fa fa-plus-circle" style="margin-right: 5px"></i></a>' +
                        vems.htmlDecode(result.DisplayName) + '</span><span class="col-md-5 col-xs-6">' +
                        vems.htmlDecode(result.Email) + '</span><span class="col-md-4 col-xs-3">' +
                        vems.htmlDecode(result.JobTitle) + '</span></div>';
                    return txt;
                },
                notFound: '<div class="delegate-typeahead-notfound">' + vems.NoMatchingResults + '</div>'
            }
        }).unbind('typeahead:select').bind('typeahead:select', function (event, attendee) {
            self.addAttendee(attendee);
            $(targetElement).blur();
        }).unbind('typeahead:close').bind('typeahead:close', function (event) {
            $(targetElement).val('');
        }).unbind('typeahead:asynccancel').bind('typeahead:asynccancel', function (event, query, async) {
            if (timeout) {
                clearTimeout(timeout);
            }

            $(targetElement).parent().parent().find('i.fa-search').css('display', 'inline');
            $(targetElement).parent().parent().find('.search-loading').css('display', 'none');
        }));

        $(targetElement).siblings(".tt-menu").css('width', '600px');
        $(targetElement).find(".twitter-typeahead").css('display', 'inline');
    };

    self.GetAttendeeAvailability = function (typeahead, bIncludeUser) {
        bIncludeUser = (bIncludeUser) ? bIncludeUser : true;  //default to true
        var startDate = moment();

        var jstring = {
            startDateTime: startDate.format('YYYY-MM-D HH:mm:ss'),
            attendees: self.attendeeList(),
            timeZoneId: parentModel.timezoneId(),
            minuteIncrements: self.minuteIncrementsForDisplay,
            includeWebUser: bIncludeUser
        };

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/PAMGetAvailability',
            data: ko.mapping.toJSON(jstring),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    var arr = JSON.parse(response.JsonData);
                    var me = [];

                    if ($.isArray(arr) && arr.length > 0) {
                        me = arr.splice(0, 1);
                    }

                    arr.sort(function (a, b) {
                        return a.DisplayName.localeCompare(b.DisplayName);
                    });

                    arr.splice(0, 0, me[0]); //insert user back at top

                    $('#attendee-list').find('tbody').empty();
                    self.attendeeList(arr);
                    $('#attendee-list').trigger('update');

                    $('#attendee-loading-overlay').hide();
                }
                else {
                    console.log(response.ErrorMessage);
                }
                $('#attendee-grid-container').find('.events-loading-overlay').hide();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    self.LookupAndAddAttendee = function (emailAddress) {

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/LookupAttendee',
            data: "{ emailAddress: \'" + emailAddress + "\' }",
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    var att = ko.mapping.fromJSON(response.JsonData);
                    self.addAttendee(att);


                }
                else {
                    console.log(response.ErrorMessage);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    self.removeAttendee = function (attendeeId) {
        $('#attendee-loading-overlay').show();

        var arr = self.attendeeList();

        var at = $.grep(arr, function (c) {
            return (c.AttendeeGuid == attendeeId);
        });

        if ($.isArray(at) && at.length > 0) {
            var indexnum = $.inArray(at[0], arr);
            arr.splice(indexnum, 1);

            removeAttendeeToSession(at[0].Email);
        }

        self.attendeeList(arr);
        self.GetAttendeeAvailability();
        parentModel.changed(true);
    };

    self.addAttendee = function (attendee) {
        $('#attendee-loading-overlay').show();

        var arr = self.attendeeList();

        var at = $.grep(arr, function (c) {
            if (c.Email == attendee.Email) {
                c = attendee;
                return true;
            }
        });
        if (!($.isArray(at) && at.length > 0)) {
            arr.push(attendee);

            addAttendeeToSession(attendee);
        }
        self.attendeeList(arr);
        self.GetAttendeeAvailability();

        parentModel.changed(true);
    };

    function addAttendeeToSession(attendee) {
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/PamManageBookingsAddAttendee',
            data: JSON.stringify({ templateId: parentModel.templateId(), displayName: attendee.DisplayName, email: attendee.Email, isDistributionList: attendee.IsDistributionList }),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (!response.Success) {
                    console.log(response.ErrorMessage);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    }

    function removeAttendeeToSession(attendeeEmail) {
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/PamManageBookingsRemoveAttendee',
            data: JSON.stringify({ templateId: parentModel.templateId(), email: attendeeEmail }),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (!response.Success) {
                    console.log(response.ErrorMessage);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    }

    function onSearchItems(typeAhead) {
        var jsonObj = {
            searchString: typeAhead.qry,
            timezoneId: parentModel.timezoneId()
        };
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/PAMSearchAttendees',
            data: JSON.stringify(jsonObj),
            success: function (result) {
                var response = JSON.parse(result.d);
                var temp = ko.observableArray([]);
                if (response.Success) {
                    temp = JSON.parse(response.JsonData);
                }
                else {
                    console.log(response.ErrorMessage);
                }

                typeAhead.asyncCall(temp);

                return false;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };
};

