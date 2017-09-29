function pamManageBookingsModel(reservationId, bookingId, templateId, templateRules, pageOptions, defaults, labels) {
    var self = this;

    self.originalFilters = defaults;

    self.reservationId = ko.observable(reservationId);
    self.bookingId = ko.observable(bookingId);

    self.templateId = ko.observable(templateId);
    self.templateRules = ko.observable(templateRules);
    self.breadcrumb = ko.observable();

    self.allowAddBooking = ko.observable(pageOptions.allowAddBooking);
    self.addLocationLink = ko.observable(pageOptions.addLocationLink);
    self.editBookingLink = ko.observable(pageOptions.editLink);
    self.enableAddLocation = ko.observable(true);

    self.requireCancelReason = ko.observable(pageOptions.requireCancelReason);
    self.eventNameMaxLength = ko.observable(pageOptions.eventNameMaxLength);
    self.disableAllFields = ko.observable(pageOptions.disableAllFields);

    self.roomBookingMap = pageOptions.roomBookingMap;

    self.isVideoConference = pageOptions.isVideoConference;
    self.showSetupTeardown = pageOptions.showSetupTeardown;

    self.subject = ko.observable('');
    self.message = ko.observable('');

    self.filters = new filterViewModel(defaults, self);

    self.eventType = ko.observable();
    self.setupTypeValidation = ko.observable();

    self.bookings = ko.observableArray([]);
    self.bookGridBookings = {};
    self.bookGridModel = {};
    self.availableBuildings = {};

    self.currentNumberOfBookingsBeforeLastDate = ko.observable(1);

    self.changed = ko.observable(false);
    self.changed.subscribe(function (newValue) {
        self.setEnableAddBooking();
    });

    self.setEnableAddBooking = function () {
        //check to see if booking rules are violated
        if (self.currentNumberOfBookingsBeforeLastDate() >= self.templateRules().MaxBookings) {
            self.enableAddLocation(false);
        }
        else {
            self.enableAddLocation(true);
        }
    };

    self.loadNotifyModal = function () {
        if (Ems_SuppressAttendeeOptions || (self.attendees && self.attendees.attendeeList().length < 2)) {
            self.updateBookings(true);
        } else {
            $('#notify-modal').modal('show');
        }
    };

    self.updateBookings = function (notifyAll) {
        var start = new Date(self.filters.date().year(), self.filters.date().month(), self.filters.date().date(), self.filters.start().hours(), self.filters.start().minutes(), 0);
        var end = new Date(self.filters.date().year(), self.filters.date().month(), self.filters.date().date(), self.filters.end().hours(), self.filters.end().minutes(), 0);

        var saveData = {
            templateId: self.templateId(),
            data: {
                bookingId: self.bookingId(),
                eventName: self.filters.eventName(),
                eventTypeId: self.eventType(),
                eventStart: moment(start).format('YYYY-MM-D HH:mm:ss'),
                eventEnd: moment(end).format('YYYY-MM-D HH:mm:ss'),
                PamSubject: self.subject(),
                PamMessage: $('#message').htmlarea('html'),
                SendToAll: notifyAll
            }
        };

        vems.pageLoading(true);

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/PamManageBookingsSave',
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
    };

    self.addLocation = function (event, data) {
        window.location = self.addLocationLink()
            + "&st=" + (self.filters.start().hour() * 60 + self.filters.start().minute())
            + "&et=" + (self.filters.end().hour() * 60 + self.filters.end().minute())
            + "&bd=" + self.filters.date().format('YYYY-MM-D HH:mm:ss')
            + "&tzid=" + $('#ems_TimezoneId').val();

        return false;
    };

    self.removeLocation = function (roomId, element) {
        var vm = this;

        element.hide();

        if (vm.requireCancelReason()) {
            $('#cancel-modal').data('roomid', roomId);

            // enable validation for modal and show it
            var validator = $('#VirtualEmsForm').validate(vems.validationClasses);
            $('#cancel-modal #cancel-reason').rules('add', { required: true });
            $('#cancel-modal #cancel-reason').off('change').on('change', function () {
                if ($('#cancel-modal #cancel-reason :selected').data('notesRequired')) {
                    $('#cancel-modal #cancel-notes').rules('add', { required: true });
                    $('#cancel-modal #cancel-notes').addClass('required');
                } else {
                    $('#cancel-modal #cancel-notes').rules('remove', 'required');
                    $('#cancel-modal #cancel-notes').removeClass('required');
                    $('#cancel-modal .notes').removeClass('has-error');
                }
                validator.resetForm();
            });
            $('#cancel-modal').modal('show');

            element.show();
        } else {
            removeLocationFromSession(vm, roomId, 0, '');
        }
    };

    self.removeLocationFromModal = function (event, data) {
        var roomId = $('#cancel-modal').data('roomid');
        var cancelReason = $('#cancel-modal #cancel-reason').val();
        var cancelNote = $('#cancel-modal #cancel-notes').val();

        if (!$('#VirtualEmsForm').valid()) {
            return false;
        }

        removeLocationFromSession(this, roomId, cancelReason, cancelNote);
        $('#cancel-modal').modal('hide');
    };

    function removeLocationFromSession(vm, roomId, cancelReason, cancelNotes) {
        var cancelData = {
            templateId: vm.templateId(),
            reservationId: vm.reservationId(),
            bookingId: vm.bookingId(),
            bookDate: moment(vm.filters.date()).format('YYYY-MM-D HH:mm:ss'),
            roomId: roomId,
            cancelReason: cancelReason,
            cancelNotes: cancelNotes
        };

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/PamManageBookingsRemove',
            data: JSON.stringify(cancelData),
            success: function (result) {
                var response = JSON.parse(result.d);
                var jsonData = JSON.parse(response.JsonData);
                
                self.bookGridBookings = JSON.parse(jsonData.bookings);
                self.bookGridModel = jsonData.buildings;
                self.availableBuildings = jsonData.availableBuildings;

                //decrement booking count
                vm.currentNumberOfBookingsBeforeLastDate(vm.currentNumberOfBookingsBeforeLastDate() - 1);
                $('#book-grid-container').data('bookGrid').rebuildGrid(self.bookGridModel, self.bookGridBookings, vm.filters.date(), self.availableBuildings);
                vm.changed(true);
                if (vm.conflictedRooms && vm.conflictedRooms().length > 0) {
                    vm.conflictedRooms($.grep(vm.conflictedRooms(), function (v) { return v != roomId }));
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    self.setupModalLinkClicked = function (event, data) {
        if ($(event.currentTarget).hasClass('disabled'))
            return false;

        $('#setup-edit-modal').modal('show');
    };

    self.getTemplateMaxDate = function () {
        var lastDateMoment = moment(self.templateRules().LastAllowedBookingDate).endOf('day');
        var maxDateMoment = moment(self.templateRules().MaxDate).endOf('day');
        var maxDate = moment.max(maxDateMoment, lastDateMoment);  // max() usable because max days and date can't be set concurrently
        return maxDate;
    };

    self.getTemplateMinDate = function () {
        var firstDateMoment = moment(self.templateRules().FirstAllowedBookingDate).startOf('day');
        var minDateMoment = moment(self.templateRules().MinDate).startOf('day');
        var minDate = moment.max(minDateMoment, firstDateMoment);  // max() usable because min days/hours and date can't be set concurrently
        return minDate;
    };

    self.syncGridsOnDateChange = function (date) {
        self.attendees.attendeeRefreshCallback();

        $('#result-filter-row').find('.events-loading-overlay').show();
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetPamBookData',
            data: JSON.stringify({ reservationId: self.reservationId(), bookingId: self.bookingId(), templateId: self.templateId(), bookStart: moment(date).format('YYYY-MM-D HH:mm:ss'), bookingsXml: '' }),
            success: function (result) {
                var response = JSON.parse(result.d);
                self.bookGridBookings = JSON.parse(response.bookings);
                self.bookGridModel = response.buildings;
                self.availableBuildings = response.availableBuildings;
                $('#book-grid-container').data('bookGrid').setHighlightBoxMinutes(createHighlightBoxMinutes(self.filters));
                $('#book-grid-container').data('bookGrid').rebuildGrid(self.bookGridModel, self.bookGridBookings, self.filters.date(), self.availableBuildings);
                $('#result-filter-row').find('.events-loading-overlay').hide();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                vems.pageLoading(false);
            }
        });
    }
};

function filterViewModel(defaults, parentModel) {
    var self = this;

    self.date = ko.observable(moment(defaults.date));
    self.start = ko.observable(moment(defaults.start));
    self.end = ko.observable(moment(defaults.end));
    self.timeZoneId = ko.observable(defaults.timeZoneId);

    self.eventName = ko.observable(defaults.eventName);

    self.date.subscribe(function (newValue) {
        if (parentModel.changed() || !moment(parentModel.originalFilters.date).isSame(newValue)) {
            parentModel.changed(true);
            //syncGridsOnDateChange(parentModel.reservationId(), parentModel.bookingId(), parentModel.templateId(), newValue);
        }
    });

    self.start.subscribeChanged(function (newValue, oldValue) {
        if (parentModel.changed() || !moment(parentModel.originalFilters.start).isSame(newValue)) {
            parentModel.changed(true);
        }

        if (newValue) {
            // maintain time difference between end and start when changing values - selected date must be used to avoid DST issues during calculation
            var selYear = self.date().year();
            var selMonth = self.date().month();
            var selDate = self.date().date();
            var newValMoment = moment(newValue).year(selYear).month(selMonth).date(selDate);
            var oldValMoment = moment(oldValue).year(selYear).month(selMonth).date(selDate);
            var minuteDuration = moment(self.end()).year(selYear).month(selMonth).date(selDate).diff(oldValMoment, 'minutes');
            self.end(newValMoment.add(minuteDuration, 'minutes'));
        }
    });

    self.end.subscribe(function (newValue) {
        if (parentModel.changed() || !moment(parentModel.originalFilters.end).isSame(newValue)) {
            parentModel.changed(true);
        }
    });

    self.eventName.subscribe(function (newValue) {
        if (parentModel.changed() || parentModel.originalFilters.eventName != newValue) {
            parentModel.changed(true);
        }
    });
        
}

function attendeeViewModel(data, parentModel) {
    var self = this;

    self.parentModel = parentModel;

    self.minuteIncrementsForDisplay = 15;
    self.timezoneId = self.parentModel.filters.timeZoneId;
    self.attendeeList = ko.observableArray([]);  //List<PAMAttendee>
    self.attendeeRefreshCallback = function () { };

    self.GetAttendeeAvailability = function (typeahead, bIncludeUser) {
        bIncludeUser = (bIncludeUser) ? bIncludeUser : true;  //default to true

        var startDate = self.parentModel.filters.date().isValid() ? self.parentModel.filters.date() : moment(Date.now());
        self.timezoneId = $('#ems_TimezoneId').length > 0 ? $('#ems_TimezoneId').val() : self.parentModel.filters.timeZoneId();

        var jstring = {
            startDateTime: startDate.format('YYYY-MM-D HH:mm:ss'),
            attendees: self.attendeeList(),
            timeZoneId: self.timezoneId,
            minuteIncrements: self.minuteIncrementsForDisplay,
            includeWebUser: bIncludeUser
        };

        $('#attendee-grid-container').find('.events-loading-overlay').show();

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/PAMGetAvailability',
            data: ko.mapping.toJSON(jstring),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    //ko.mapping.fromJSON(response.JsonData, {}, self.attendeeList);
                    var arr = ko.mapping.fromJSON(response.JsonData);
                    var me = [];
                    if ($.isArray(arr()) && arr().length > 0) {
                        me = arr().splice(0, 1);
                    }
                    arr().sort(function (a, b) {
                        return a.DisplayName().localeCompare(b.DisplayName());
                    });
                    arr().splice(0, 0, me[0]); //insert user back at top
                    self.attendeeList(arr());
                    vems.browse.PAMServiceError("");
                }
                else {
                    vems.browse.PAMServiceError(vems.browse.PAMServiceErrorMessage);
                    console.log(response.ErrorMessage);
                }
                self.rebuildAttendeeGrid();
                $('#attendee-grid-container').find('.events-loading-overlay').hide();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    self.initializeAttendeeGrid = function (bookStartDate, bookStartHour, screenText) {

        var filterValues = self.parentModel.filters;
        self.timezoneId = self.parentModel.filters.timeZoneId();

        $('#attendee-grid-container').attendeeGrid({
            attendees: self.attendeeList,
            timezoneId: self.timezoneId,
            timeIncrement: self.minuteIncrementsForDisplay,
            useCalculatedHeight: false,
            recurrenceExists: false,
            mode: 'browse',
            legendItems: [
                {
                    name: vems.browse.freeLabel, color: 'transparent', 'itemClass': ''
                },
                {
                    name: vems.browse.BusyLabel, color: '#536D93', 'itemClass': 'attendee-busy'
                },
                {
                    name: vems.browse.OutOfOfficeLabel, color: '#D3C51C', 'itemClass': 'attendee-outofoffice'
                },
                {
                    name: vems.browse.TentativeLabel, color: '#84D31C', 'itemClass': 'attendee-tentative'
                },
                //{
                //    name: vems.browse.WorkingElsewhereLabel, color: '#DCDEE0', 'itemClass': 'attendee-workingelsewhere'
                //},
                { name: vems.browse.NoInfoLabel, color: '#DCDEE0', 'itemClass': 'attendee-noinfo' }
            ],
            ScreenText: screenText.ScreenText,
            bookOptions: {
                bookStartDate: bookStartDate,
                startHour: bookStartHour,
                highlightBoxMinutes: createHighlightBoxMinutes(filterValues)
            },
            onRemoveAttendeeClick: function (attendeeId, e) {
                var target = $(e.currentTarget);
                target.parent().css('visibility', 'hidden');
                self.removeAttendee(attendeeId);
            },
            onExplodeDistributionClick: function (attendeeId, e) {
                //var target = $(e.currentTarget);                    
                self.explodeDistributionList(attendeeId);
            },
            onSelectedAttendee: function (event, attendee) {
                self.addAttendee(attendee);
            }
        });

        //this stupid little hack is for Safari's rendering engine.
        $('.input-icon-embed').css('position', 'static');
        setTimeout(function () {
            $('.input-icon-embed').css('position', 'absolute');
        }, 50);
    };

    self.explodeDistributionList = function (attendeeId) {

        var groupEmail, groupName;
        var at = $.grep(self.attendeeList(), function (c) {
            if (c.AttendeeGuid() == attendeeId) {
                groupEmail = c.Email();
                groupName = c.DisplayName();
                return true;
            }
        });
        if ($.isArray(at) && at.length > 0) {
            var startDate = self.parentModel.filters.date().isValid() ? self.parentModel.filters.date() : moment(Date.now());
            self.timezoneId = self.parentModel.filters.timeZoneId();
            var jstring = {
                startDateTime: startDate.format(),
                groupToExplodeEmail: groupEmail,
                groupToExplodeName: groupName,
                timeZoneId: self.timezoneId,
                minuteIncrements: self.minuteIncrementsForDisplay,
                attendees: self.attendeeList()
            };
        }
        else {
            return false;
        }

        $('#attendee-grid-container').find('.events-loading-overlay').show();
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/ExplodeGroup',
            data: ko.mapping.toJSON(jstring),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {

                    var arr = ko.mapping.fromJSON(response.JsonData);
                    var me = [];
                    if ($.isArray(arr()) && arr().length > 0) {
                        me = arr().splice(0, 1);
                    }
                    arr().sort(function (a, b) {
                        return a.DisplayName().localeCompare(b.DisplayName());
                    });
                    arr().splice(0, 0, me[0]); //insert user back at top
                    self.attendeeList(arr());

                    parentModel.changed(true);
                }
                else {
                    console.log(response.ErrorMessage);
                }
                self.rebuildAttendeeGrid();
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
        var arr = self.attendeeList();

        var at = $.grep(arr, function (c) {
            return (c.AttendeeGuid() == attendeeId);
        });
        if ($.isArray(at) && at.length > 0) {
            var indexnum = $.inArray(at[0], arr);
            arr.splice(indexnum, 1);

            removeAttendeeToSession(at[0].Email());
        }
        self.attendeeList(arr);
        self.rebuildAttendeeGrid();

        parentModel.changed(true);
    };

    self.addAttendee = function (attendee) {
        var arr = self.attendeeList();
        var at = $.grep(arr, function (c) {
            if (c.Email() == attendee.Email) {
                c = ko.mapping.fromJS(attendee);
                return true;
            }
        });
        if (!($.isArray(at) && at.length > 0)) {
            arr.push(ko.mapping.fromJS(attendee));

            addAttendeeToSession(attendee);
        }
        self.attendeeList(arr);
        self.attendeeRefreshCallback();

        parentModel.changed(true);
    };

    self.rebuildAttendeeGrid = function () {
        if ($('#attendee-grid-container').data('attendeeGrid')) {
            //let the attendance grid know it has switched to recurring.
            $('#attendee-grid-container').data('attendeeGrid').recurrenceExists = false;
            $('#attendee-grid-container').data('attendeeGrid').setHighlightBoxMinutes(createHighlightBoxMinutes(self.parentModel.filters));
            $('#attendee-grid-container').data('attendeeGrid').rebuildGrid(self.parentModel.attendees.attendeeList);
            $('#attendeeLookup').val('');
        }
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
};

ko.bindingHandlers.datePicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        try {
            var options = allBindingsAccessor().datepickerOptions || {
            };

            if (options.minDate) {
                if (moment(options.minDate).year() > 1900)
                    options.minDate = moment(options.minDate).startOf('day');
                else
                    options.minDate = moment().startOf('day');
            }

            if (options.maxDate) {
                if (moment(options.maxDate).year() > 1900)
                    options.maxDate = moment(options.maxDate).endOf('day');
                else
                    delete options['maxDate'];
            }

            options.locale = moment.locale();
            options.ignoreReadonly = true;

            options.showTodayButton = true;
            options.icons = {};
            options.icons.today = "date-picker-today-btn";

            if (DevExpress.devices.real().phone) {
                options.widgetPositioning = {
                    horizontal: 'right'
                };

                options.widgetParent = $('.time-container');

                $(element).datetimepicker(options).on('dp.show', function (ev) {
                    $('.bootstrap-datetimepicker-widget.dropdown-menu').css('right', 'auto');
                });
            } else {
                options.widgetPositioning = {
                    horizontal: 'left'
                };
            }

            $(element).datetimepicker(options).on('dp.change', function (ev) {
                var observable = valueAccessor();
                if (ev.date)
                 observable(ev.date);
            });

            return ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);
        } catch (e) {
            return false;
        }
    },
    update: function (element, valueAccessor) {
        try {
            var value = ko.toJS(ko.utils.unwrapObservable(valueAccessor()));

            $(element).data('DateTimePicker').date(value == false ? null : value);

            return ko.bindingHandlers.value.update(element, valueAccessor);
        } catch (e) {
            return false;
        }
    }
};

ko.bindingHandlers.timePicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        try {
            var options = allBindingsAccessor().datepickerOptions || {
            };

            if (options.minDate) {
                if (moment(options.minDate).year() > 1900)
                    options.minDate = moment(options.minDate).startOf('day');
                else
                    options.minDate = moment().startOf('day');
            }

            if (options.maxDate) {
                if (moment(options.maxDate).year() > 1900)
                    options.maxDate = moment(options.maxDate).endOf('day');
                else
                    delete options['maxDate'];
            }

            options.locale = moment.locale();
            options.ignoreReadonly = true;

            if (DevExpress.devices.real().phone) {
                options.widgetPositioning = {
                    horizontal: 'right'
                };

                options.widgetParent = $('.time-container');

                $(element).datetimepicker(options).on('dp.show', function (ev) {
                    $('.bootstrap-datetimepicker-widget.dropdown-menu').css('right', 'auto');
                });
            } else {
                options.widgetPositioning = {
                    horizontal: 'left'
                };
            }

            $(element).datetimepicker(options).on('dp.change', function (ev) {
                var observable = valueAccessor();
                if (ev.date)
                    observable(ev.date);
            });

            return ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);
        } catch (e) {
            return false;
        }
    },
    update: function (element, valueAccessor) {
        try {
            var value = ko.toJS(ko.utils.unwrapObservable(valueAccessor()));

            if (element.id != 'booking-date') {
                var date = $('#booking-date').data('DateTimePicker').date() ? $('#booking-date').data('DateTimePicker').date()._d : moment()._d;
                var time = value._d;
                var newDate = moment(new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), 0));

                value = newDate;
            }

            $(element).data('DateTimePicker').date(value == false ? null : value);

            return ko.bindingHandlers.value.update(element, valueAccessor);
        } catch (e) {
            return false;
        }
    }
};