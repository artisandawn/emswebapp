function classicRequestModel(templateRules, pageData) {
    var self = this;
    self.pageData = ko.observable(pageData);
    self.templateRules = ko.observable(templateRules);

    self.template = ko.observable({
        Id: -1,
        Text: templateRules.MenuText,
        NavigateUrl: ''
    });

    self.setupTypeValidation = ko.observable(pageData.SetupTypeValidationRule);
    self.setupTypes = ko.observableArray(pageData.SetupTypes);
    self.setupTypeId = ko.observable(pageData.SetupTypeId);
    self.setupCount = ko.observable(pageData.Attendance);

    self.TimeZones = ko.observableArray(pageData.TimeZones);
    self.roomResourceExclusions = ko.observableArray(pageData.RoomResourceExclusions);

    // convert start and end times to moment objects
    var startDate = pageData.BookingDate ? pageData.BookingDate : '';
    var today = startDate.length > 0 ? moment(startDate) : moment({ year: new Date().getFullYear(), month: new Date().getMonth(), day: new Date().getDate() });
    pageData.StartTime = moment(today).add(pageData.StartTime, 'minutes');
    pageData.EndTime = moment(today).add(pageData.EndTime, 'minutes');

    self.filters = new filterViewModel(pageData, self);
    self.availabilityFilterData = {};

    self.recurrence = new recurrenceViewModel(pageData, self);

    self.cart = new BookingCartViewModel(self);
    self.roomResults = ko.observableArray();
    self.hasResults = ko.observable(false);

    self.services = ko.observable(JSON.parse(pageData.Services));
    self.serviceOrders = ko.observableArray([]);

    self.ShowBillingReferences = ko.computed(function () {
        if (!self.templateRules || self.templateRules() == undefined)
            return false;

        var bVal = self.templateRules().Parameters.ReservationsShowBillingReference;

        $.each(self.cart.bookings(), function (i, r) {
            if (r.PromptForBillingReference && r.PromptForBillingReference()) {
                bVal = true;
            }
        });

        return bVal;
    });

    self.reservationDetails = new reservationDetailsViewModel(vems.browse.FirstContactTitle, vems.browse.AlternateContactTitle, vems.browse.eventNameMaxLength);
    self.reservationDetails.eventName(pageData.eventName);

    self.validateSearchForm = function () {
        var dateSet = self.filters.date().toString() != "Invalid date" && self.filters.date() != false;
        var startSet = self.filters.start().toString() != "Invalid date" && self.filters.start() != false;
        var endSet = self.filters.end().toString() != "Invalid date" && self.filters.end() != false;

        $('#booking-date input').prop('required', !dateSet)
        $('#booking-start input').prop('required', !startSet)
        $('#booking-end input').prop('required', !endSet)

        var valid = startSet && endSet && dateSet;

        setTimeout(function () {
            self.showSearchOverlay(valid);
        }, 200);

        return valid;
    };

    self.showSearchOverlay = function (timesSet) {
        var notInPast = false;

        if (timesSet && $('#timeZoneDrop').val() != null) {
            var selectedTZ = $.grep(self.TimeZones(), function (v, i) {
                return v.TimeZoneId == $('#timeZoneDrop').val();
            });

            var filterDate = moment(self.filters.date());
            var filterStart = moment(self.filters.start());

            var offset = selectedTZ[0].MinuteBias * -1;

            var filterStartUTC = moment(new Date(
                filterDate.year(),
                filterDate.month(),
                filterDate.date(),
                filterStart.hour(),
                filterStart.minute(),
                0)).add(offset, 'minute');

            var utcNow = moment().add(new Date().getTimezoneOffset(), 'minute');

            if (filterStartUTC.isAfter(utcNow))
                notInPast = true;
        }

        $('#search-filters-overlay').height($('#search-room-filters').outerHeight() + $('#specific-room-filters').outerHeight());

        if (self.pageData().ShowRooms || self.pageData().ShowAvailability) {
            if ((timesSet && notInPast) || DevExpress.devices.real().phone)
                $('#search-filters-overlay').hide();
            else
                $('#search-filters-overlay').show();
        }
    }

    self.nextStepClicked = function () {
        if (!DevExpress.devices.real().phone) {
            var activeTab = $('#main-tabs li:visible').index($('.active'));
            $('#main-tabs li:visible').eq(activeTab + 1).find('a').click();
        } else {
            $('#bookings').toggleClass('active');
            $('#details').toggleClass('active');
        }
    };

    self.prevStepClicked = function () {
        var activeTab = $('#main-tabs li:visible').index($('.active'));
        $('#main-tabs li:visible').eq(activeTab - 1).find('a').click();
    };

    self.getAvailability = function (typeAhead, additionalFilters) {
        if (!self.validateSearchForm())
            return false;

        self.availabilityFilterData.TemplateId = -1;
        self.availabilityFilterData.Start = self.filters.start().format('YYYY-MM-D HH:mm:ss');
        self.availabilityFilterData.End = self.filters.end().format('YYYY-MM-D HH:mm:ss');

        // recurrence should populate this w/ more than one date
        if (self.recurrence.recurrenceCount() > 0) {
            if (self.recurrence.remainingDates && self.recurrence.remainingDates().length > 0) {
                self.availabilityFilterData.Dates = $.map(self.recurrence.remainingDates(), function (el) { return moment(el).format('YYYY-MM-D HH:mm:ss'); })
            } else {
                self.availabilityFilterData.Dates = $.map(self.recurrence.recurrences(), function (el) { return moment(el.start).format('YYYY-MM-D HH:mm:ss'); });
            }
        } else {
            self.availabilityFilterData.Dates = [moment(self.filters.date()).format('YYYY-MM-D HH:mm:ss')];
        }

        self.availabilityFilterData.TimeZoneId = self.filters.timeZoneId();
        self.availabilityFilterData.FilterType = 0;
        self.availabilityFilterData.IsPam = false;
        self.availabilityFilterData.BookingId = -1;
        self.availabilityFilterData.IsVCEdit = false;

        self.availabilityFilterData.Cart = [];

        var filterValues = $('#filter-container').data('dynamicFilters').getFilterValueCollection().slice();

        if (additionalFilters && additionalFilters.length > 0) {
            $.merge(filterValues, additionalFilters);
        }

        $.each(filterValues, function (i, v) {
            if (moment.isMoment(v.value)) {
                v.value = v.value.toJSON();
            }

            if ($.isArray(v.value)) {
                v.value = v.value.join(',');
            }
        });

        var locationIds = [];

        if (typeAhead) {
            locationIds.push($('#specific-building-drop').val());
        } else {
            locationIds = $('#filter-container').data('dynamicFilters').getFilterValue('Locations').split(',');
        }

        if (!typeAhead)
            self.hasResults(true);

        if (self.pageData().ShowAvailability) {
            var data = {
                searchData: self.availabilityFilterData,
                locationIds: locationIds,
                setupTypeId: $('#setup-type').val(),
                setupCount: $('#setup-count').val()
            };

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/GetClassicRequestAvailability',
                data: JSON.stringify(data),
                success: function (result) {
                    $('#result-filter-row').show(); // this could be hidden if they selected an unavailable room from the typeAhead

                    var response = JSON.parse(result.d);

                    if (typeAhead) {
                        var rooms = $.map(response.Availability, function (val, i) {
                            if (val.RoomDescription.toLowerCase().indexOf(typeAhead.qry.toLowerCase()) >= 0) {
                                var inCart = $.grep(self.cart.bookings(), function (booking) {
                                    return self.roomMatchesCart(booking.ID ? booking.ID : booking.RoomId, val.RoomId, booking.Date, booking.Start, booking.End);
                                });

                                if (DevExpress.devices.real().phone && val.UnavailableReason != 0) {
                                    return;
                                }

                                var availForAllDays = self.recurrence.recurrenceCount() > 0 ? (val.DaysAvailable === self.recurrence.recurrenceCount()) : true;
                                if (inCart.length === 0 && availForAllDays) { // skip records that area already in the cart
                                    return {
                                        ID: val.RoomId,
                                        RoomId: val.RoomId,
                                        BuildingId: val.BuildingId,
                                        RoomDescription: vems.htmlDecode(val.RoomDescription),
                                        BuildingDescription: vems.htmlDecode(val.BuildingDescription),
                                        Floor: val.Floor,
                                        DefaultSetupTypeId: val.DefaultSetupTypeId,
                                        TimeZone: val.TimeZone,
                                        UnavailableReason: val.UnavailableReason,
                                        ShowAlert: val.ShowAlert,
                                        Alert: val.Alert,
                                        RecordType: val.RecordType,
                                        Favorite: val.Favorite,
                                        AvailableSetupTypes: val.AvailableSetupTypes,
                                        MinCapacity: val.MinCapacity,
                                        Capacity: val.Capacity,
                                        Price: self.templateRules().Parameters.ShowRoomPricing ? val.Price : '',
                                        FloorPlanIndicatorID: val.FloorPlanIndicatorID,
                                        LocationDetailsLink: val.LocationDetailsLink,
                                        DaysAvailable: val.DaysAvailable,
                                        RoomType: val.RoomType
                                    };
                                }
                            }
                        });

                        typeAhead.asyncCall(rooms);

                        return false;
                    }


                    var existingItemIndices = [];
                    for (var i = 0; i < response.Availability.length; i++) {
                        var inCart = $.grep(self.cart.bookings(), function (booking) {
                            return self.roomMatchesCart(booking.RoomId(), response.Availability[i].RoomId, booking.Date(), booking.Start(), booking.End());
                        });

                        if (inCart.length > 0)
                            existingItemIndices.push(i);

                        response.Availability[i] = ko.mapping.fromJS(response.Availability[i]);
                    }

                    if (existingItemIndices.length > 0) {
                        existingItemIndices.reverse();

                        for (var i = 0; i < existingItemIndices.length; i++) {
                            response.Availability.splice(existingItemIndices[i], 1);
                        }
                    }

                    // clear the table before rebinding so the sorter doesn't duplicate records
                    $('#available-list').find('tbody').empty();

                    self.roomResults(response.Availability);

                    $('#remaining-dates-popover').popover();

                    $('#available-list').trigger('update');

                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        } else {
            var data = {
                locationId: $('#specific-building-drop').val(),
                templateId: -1
            };

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/GetClassicRequestRoomsForFacility',
                data: JSON.stringify(data),
                success: function (result) {
                    $('#result-filter-row').show(); // this could be hidden if they selected an unavailable room from the typeAhead

                    var response = JSON.parse(result.d);

                    var rooms = $.map(response, function (val, i) {
                        if (val.RoomDescription.toLowerCase().indexOf(typeAhead.qry.toLowerCase()) >= 0) {
                            var inCart = $.grep(self.cart.bookings(), function (booking) {
                                return self.roomMatchesCart(booking.ID ? booking.ID : booking.RoomId, val.RoomId, booking.Date, booking.Start, booking.End);
                            });

                            if (DevExpress.devices.real().phone && val.UnavailableReason != 0) {
                                return;
                            }

                            if (inCart.length === 0) { // skip records that area already in the cart
                                return {
                                    ID: val.RoomId,
                                    RoomId: val.RoomId,
                                    BuildingId: val.BuildingId,
                                    RoomDescription: vems.htmlDecode(val.RoomDescription),
                                    BuildingDescription: vems.htmlDecode(val.BuildingDescription),
                                    TimeZone: val.Timezone,
                                };
                            }
                        }
                    });

                    typeAhead.asyncCall(rooms);

                    return false;
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        }
    };

    self.roomMatchesCart = function (cartRoomId, roomId, bookingDate, bookingStart, bookingEnd) {
        var roomMatches = cartRoomId == roomId;

        var filters = self.filters;

        var filterDate = moment(filters.date());
        var bDate = moment(bookingDate);

        var filterStart = moment(new Date(filterDate.year(), filterDate.month(), filterDate.date(), moment(filters.start()).hour(), moment(filters.start()).minute(), 0));
        var filterEnd = moment(new Date(filterDate.year(), filterDate.month(), filterDate.date(), moment(filters.end()).hour(), moment(filters.end()).minute(), 0));

        var start = moment(new Date(bDate.year(), bDate.month(), bDate.date(), moment(bookingStart).hour(), moment(bookingStart).minute(), 0));
        var end = moment(new Date(bDate.year(), bDate.month(), bDate.date(), moment(bookingEnd).hour(), moment(bookingEnd).minute(), 0));

        var startSameOrAfter = start.isSame(filterStart) || start.isAfter(filterStart);
        var endSameOrBefore = end.isSame(filterEnd) || end.isBefore(filterEnd);

        var dateTimeMatches = (startSameOrAfter && endSameOrBefore) || start.isBetween(filterStart, filterEnd) || end.isBetween(filterStart, filterEnd);

        return roomMatches && dateTimeMatches;
    }
    self.captchaShown = false;
    self.saveRequest = function () {
        var errMsgArr = [];

        if (!self.validateSearchForm()) {
            errMsgArr.push(vems.roomRequest.DateAndTimeAreRequired);
        }

        if (self.reservationDetails.eventName() == undefined || self.reservationDetails.eventName().length === 0) {
            errMsgArr.push(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=event-name]').eq(0).text()))
        }

        if ($('#event-type').val() == null || $('#event-type').val().length === 0 || $('#event-type').val() == 0)
            errMsgArr.push(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=event-type]').eq(0).text()))

        if ($("#1stContactName").attr('required') == 'required' && $.trim($('#1stContactName').val()) == "")
            errMsgArr.push(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=1stContactName]').text()))

        if ($("#1stContactPhone").attr('required') == 'required' && $.trim($('#1stContactPhone').val()) == "")
            errMsgArr.push(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=1stContactPhone]').text()))

        if ($("#1stContactEmail").attr('required') == 'required' && $.trim($('#1stContactEmail').val()) == "")
            errMsgArr.push(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=1stContactEmail]').text()))

        if ($('#terms-and-conditions').length === 1 && $('#terms-and-conditions').prop('checked') != true)
            errMsgArr.push(vems.roomRequest.IsRequiredMessage.replace('{0}', $('#terms-and-conditions').parent().find('a').text()))

        $.each($('#udf-container [required=required]:visible'), function (i, v) {
            if ($(v).hasClass('multiselect-container')) {
                if ($(v).find('.multiselect-value-label').text().length == 0) {
                    errMsgArr.push(vems.roomRequest.IsRequiredMessage.replace('{0}', $(v).parent().find('label').eq(0).text()));
                }
            } else if (!$(v).val() || $(v).val().length == 0) {
                var labelText = $(v).parent().hasClass('date') ? $(v).parent().parent().find('label').text() : $(v).parent().find('label').text();
                errMsgArr.push(vems.roomRequest.IsRequiredMessage.replace('{0}', labelText));
            }
        });

        if (errMsgArr.length > 0) {
            var reqErrMsg = '';
            $.each(errMsgArr, function (idx, err) {
                reqErrMsg += err;
                if (idx < errMsgArr.length - 1) { reqErrMsg += '<br/><br/>' }
            });
            if (reqErrMsg) {
                vems.showToasterMessage('', reqErrMsg, 'danger');
                return false;
            }
            return false;
        }

        if (!self.captchaShown && self.pageData().ShowCaptcha) {
            $('#confirm-modal').modal('show');
            self.captchaShown = true;

            return false;
        }


        vems.pageLoading(true);

        var dates = new Array(), start = '', end = '', buildingId = -1, roomId = -1;

        if (self.cart.bookings().length > 0) {
            dates = self.cart.bookings()[0].Dates();
            start = self.cart.bookings()[0].Start();
            end = self.cart.bookings()[0].End();

            buildingId = self.cart.bookings()[0].BuildingId();
            roomId = self.cart.bookings()[0].RoomId();
        } else {
            dates.push(self.filters.date());
            start = self.filters.start();
            end = self.filters.end();
        }

        if (buildingId == -1 && $('#specific-building-drop').val() > 0)
            buildingId = $('#specific-building-drop').val();

        var data = {
            templateId: -1,
            saveModel: {
                Dates: dates,
                Start: start,
                End: end,
                EventName: self.reservationDetails.eventName(),
                EventTypeId: self.reservationDetails.eventType(),
                GroupName: self.reservationDetails.GroupName(),
                ContactName: self.reservationDetails.FirstContactName(),
                Phone: self.reservationDetails.FirstPhoneOne(),
                Fax: self.reservationDetails.FirstPhoneTwo(),
                EmailAddress: self.reservationDetails.FirstEmail(),
                BuildingId: buildingId,
                RoomId: roomId,
                SetupCount: $('#setup-count').val(),
                SetupTypeId: $('#setup-type').val()
            },
            udfs: self.reservationDetails.userDefinedFields.getUdfsForSave(),
            serviceOrders: ko.mapping.toJS(self.serviceOrders())
        }

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/SaveClassicRequest',
            data: JSON.stringify(data),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    var jsonData = JSON.parse(response.JsonData);

                    window.location = jsonData.Link;
                }
                else {
                    var msgArr = response.ErrorMessage.split('\n');
                    for (i = 0; i <= msgArr.length - 1; i++) {
                        vems.showErrorToasterMessage(msgArr[i]);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            },
            complete: function () {
                vems.pageLoading(false);
            }
        });
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

    self.updateRoomResourceExclusions = function () {
        var excludedResources = [];

        // populate excluded resource list, based on room(s) in the cart
        if (self.cart.bookings().length > 0) {
            var roomId = self.cart.bookings()[0].RoomId();
            var roomRre = $.grep(self.roomResourceExclusions(), function (rre) {
                return rre.RoomId === roomId;
            })[0];

            if (roomRre) {
                excludedResources = roomRre.ResourceIds;
            }
        }

        // set the 'Excluded' property of all resources accordingly
        $.each(self.services().AvailableCategories(), function (catIdx, cat) {
            $.each(cat.CategoryGroups(), function (cgIdx, cg) {
                $.each(cg.Resources(), function (resIdx, res) {
                    res.Excluded($.inArray(res.ResourceId(), excludedResources) > -1);
                });
            });
        });
    };
}

function filterViewModel(defaults, parentModel) {
    var self = this;

    self.date = ko.observable(moment(defaults.BookingDate));
    self.start = ko.observable(moment(defaults.StartTime));
    self.end = ko.observable(moment(defaults.EndTime));
    self.timeZoneId = ko.observable(defaults.DefaultTimeZone);

    self.date.subscribe(function (newValue) {
        parentModel.validateSearchForm();
    });

    self.start.subscribe(function (newValue) {
        parentModel.validateSearchForm();
        var suppressUpdateForStartChange = false;

        if (newValue) {
            suppressUpdateForStartChange = true;
            self.end(moment(newValue).add(defaults.Duration, 'minutes'));
        }

        parentModel.recurrence.updateRecurrenceCount();
    });

    self.end.subscribe(function (newValue) {
        parentModel.validateSearchForm();

        parentModel.recurrence.updateRecurrenceCount();
    });

    self.timeZoneId.subscribe(function (newValue) {
        parentModel.validateSearchForm();
    });
}

function recurrenceViewModel(defaults, parentModel) {
    var self = this;

    self.recurrenceTypes = ko.observableArray([]);
    self.recurrenceType = ko.observable();
    self.recurrences = ko.observableArray([]);
    self.recurrenceCount = ko.computed(function () {
        return self.remainingDates && self.remainingDates().length ? self.remainingDates().length : self.recurrences().length;
    });
    self.tempRecurrences = ko.observableArray([]);
    self.tempRecurrenceCount = ko.computed(function () {
        return self.tempRecurrences().length;
    });
    self.tempRecurrenceDisplay = ko.computed(function () {
        return '(' + self.tempRecurrenceCount() + ' ' +
            (self.tempRecurrenceCount() === 1 ? vems.roomRequest.occurrenceText : vems.roomRequest.occurrencesText) + ')';
    });
    self.reqValidationMsg = ko.observable('');

    self.dailyType = ko.observable('everydays');
    self.dailyCount = ko.observable(1);

    self.weeklyCount = ko.observable(1);
    self.weeklyDays = ko.observableArray([]);

    self.monthlyType = ko.observable('everymonths');
    self.monthlyDay = ko.observable(moment().date());
    self.monthlyCount = ko.observable(1);
    self.monthlyWeek = ko.observable(1);  // 1=First, 2=Second, 3=Third, 4=Fourth, 5=Last
    self.monthlyWeekDay = ko.observable(0);  // 0-6 = Sun-Sat (locale-specific)
    self.monthlyWeekDayCount = ko.observable(1);

    self.randomDates = ko.observableArray([]);

    self.endDate = ko.observable(moment(defaults.date).add(1, 'days'));
    self.dateType = ko.observable('enddate');
    self.dateCount = ko.observable(1);

    self.cartObject;
    // store remaining dates for a recurrence so we can do a subset search
    self.remainingDates = ko.observableArray();

    self.recurrenceType.subscribe(function (newValue) {
        self.updateRecurrenceCount();
    });

    self.dailyType.subscribe(function (newValue) {
        self.updateRecurrenceCount();
    });

    self.dailyCount.subscribe(function (newValue) {
        self.dailyType('everydays');
        if (parseInt(newValue) < 1) {
            self.dailyCount(1);
        }
        self.updateRecurrenceCount();
    });

    self.weeklyCount.subscribe(function (newValue) {
        if (parseInt(newValue) < 1) {
            self.weeklyCount(1);
        }
        self.updateRecurrenceCount();
    });

    self.monthlyType.subscribe(function (newValue) {
        self.updateRecurrenceCount();
    });

    self.monthlyDay.subscribe(function (newValue) {
        self.monthlyType('everymonths');
        if (parseInt(newValue) < 1) {
            self.monthlyDay(1);
        } else if (parseInt(newValue) > 31) {
            self.monthlyDay(31);
        }
        self.updateRecurrenceCount();
    });

    self.monthlyCount.subscribe(function (newValue) {
        self.monthlyType('everymonths');
        if (parseInt(newValue) < 1) {
            self.monthlyCount(1);
        }
        self.updateRecurrenceCount();
    });

    self.monthlyWeek.subscribe(function (newValue) {
        self.updateRecurrenceCount();
    });

    self.monthlyWeekDay.subscribe(function (newValue) {
        self.updateRecurrenceCount();
    });

    self.monthlyWeekDayCount.subscribe(function (newValue) {
        self.monthlyType('monthdays');
        if (parseInt(newValue) < 1) {
            self.monthlyWeekDayCount(1);
        }
        self.updateRecurrenceCount();
    });

    self.endDate.subscribe(function (newValue) {
        if (moment(newValue).isBefore(parentModel.filters.date())) {
            parentModel.filters.date(moment(newValue));
        }
        self.updateRecurrenceCount();
    });

    self.dateCount.subscribe(function (newValue) {
        self.dateType('endafter');
        if (parseInt(newValue) === 0) {
            self.dateCount(1);
        }
    });

    self.dateType.subscribe(function (newValue) {
        if (newValue === 'enddate') {
            self.updateRecurrenceCount();
        }
    });

    self.updateRecurrenceCount = function () {
        if (self.validateRequiredFields()) {
            self.generateRecurrence(false);
        } else {
            self.tempRecurrences.removeAll();
        }
    };

    self.applyRecurrence = function () {
        if (!self.validateRequiredFields()) {
            self.showReqValidationMessage();
            return false;
        }

        // if it's monthly with a date > 28, get confirmation
        if (self.recurrenceType() === 'monthly' && self.monthlyType() === 'everymonths' && parseInt(self.monthlyDay()) > 28) {
            var warnMsg = vems.roomRequest.someMonthsFewerDays.replace('{0}', self.monthlyDay());
            vems.showModalMessageWithButtons(warnMsg, '', vems.roomRequest.okText, vems.roomRequest.cancelText,
                self.generateRecurrence, function () { return false; });
        } else {
            self.generateRecurrence(true);
        }
    };

    self.generateRecurrence = function (apply) {  // apply = boolean telling whether or not to actually apply recurrence
        self.tempRecurrences.removeAll();
        if (!apply && self.dateType() === 'endafter') {
            return false;
        }  // don't update display when 'end after' date type selected

        var startDate = moment(parentModel.filters.date());
        var endDate = moment(self.endDate());
        var tempEndDate = moment(endDate);

        var endNextDay = moment(parentModel.filters.end()).isBefore(moment(parentModel.filters.start()));
        var adjustedEnd = endNextDay ? moment(parentModel.filters.end()).add(1, 'days') : moment(parentModel.filters.end());
        var bookLength = moment.duration(adjustedEnd.diff(moment(parentModel.filters.start()))).asMinutes();

        startDate.hours(parentModel.filters.start().hours());
        startDate.minutes(parentModel.filters.start().minutes());

        endDate.hours(parentModel.filters.end().hours());
        endDate.minutes(parentModel.filters.end().minutes());
        if (endNextDay) {
            endDate.add(1, 'days');
        }

        switch (self.recurrenceType()) {
            case 'daily':
                while ((self.dateType() === 'enddate' && startDate.isBefore(endDate)) ||
                    (self.dateType() === 'endafter' && (self.tempRecurrenceCount() < self.dateCount()))) {
                    var bookStart = moment(startDate);
                    var bookEnd = moment(bookStart).add(bookLength, 'minutes');

                    if (self.dailyType() === 'everydays') {  // every x days
                        self.tempRecurrences.push({
                            start: bookStart, end: bookEnd
                        });
                        startDate.add(self.dailyCount(), 'days');
                    } else {  // weekdays only
                        if (startDate.isoWeekday() < 6) {
                            self.tempRecurrences.push({ start: bookStart, end: bookEnd });
                        }
                        startDate.add(1, 'days');
                    }

                    if (self.dateType() === 'endafter' && apply) {
                        tempEndDate = moment(bookStart);
                    }  // update enddate for display purposes
                }
                break;
            case 'weekly':
                while ((self.dateType() === 'enddate' && startDate.isBefore(endDate)) ||
                    (self.dateType() === 'endafter' && (self.tempRecurrenceCount() < self.dateCount()))) {
                    var bookStart = moment(startDate);
                    var bookEnd = moment(bookStart).add(bookLength, 'minutes');

                    // add a recurrence if the current day is one of the selected options
                    if (self.weeklyDays.indexOf(startDate.weekday()) !== -1) {
                        self.tempRecurrences.push({ start: bookStart, end: bookEnd });
                    }

                    if (startDate.weekday() === 6) {  // conditionally go to next day or start of next weekly cycle
                        startDate.weekday(0).add(self.weeklyCount(), 'weeks');
                    } else {
                        startDate.add(1, 'days');
                    }

                    if (self.dateType() === 'endafter' && apply) {
                        tempEndDate = moment(bookStart);
                    }  // update enddate for display purposes
                }
                break;
            case 'monthly':
                while ((self.dateType() === 'enddate' && startDate.isBefore(endDate)) ||
                    (self.dateType() === 'endafter' && (self.tempRecurrenceCount() < self.dateCount()))) {
                    var bookStart = moment(startDate);
                    var bookEnd = moment(bookStart).add(bookLength, 'minutes');

                    if (self.monthlyType() === 'everymonths') {
                        // 'End of Month' method for 29th/30th/31st (used by Outlook) - adds last day of month when fewer days than the 'on day' number
                        if (startDate.date() === parseInt(self.monthlyDay())) {
                            self.tempRecurrences.push({
                                start: bookStart, end: bookEnd
                            });
                            startDate.add(self.monthlyCount(), 'months');
                        } else if (startDate.date() < parseInt(self.monthlyDay())) {
                            // adjust the start date to the correct date (or end of the month)
                            var origMonth = startDate.month();
                            startDate.date(self.monthlyDay());
                            if (startDate.month() !== origMonth) {  // hit end of the month and went to the start of the next
                                startDate.subtract(startDate.date(), 'days');  // adjust accordingly
                            }

                            // re-check the end date (if it applies), then add the recurrence
                            if (self.dateType() === 'endafter' || (self.dateType() === 'enddate' && startDate.isBefore(endDate))) {
                                bookStart = moment(startDate);
                                bookEnd = moment(bookStart).add(bookLength, 'minutes');
                                self.tempRecurrences.push({ start: bookStart, end: bookEnd });
                            }
                            startDate.add(self.monthlyCount(), 'months');
                        } else {  // should only happen on the FIRST occurrence
                            startDate.add(1, 'months');  // just go to the next month to find the first occurrence
                            startDate.date(self.monthlyDay());
                        }
                    } else {  // 'monthdays' monthly type
                        if (self.monthlyWeek() < 5) {  // first, second, third, or fourth week
                            while (startDate.weekday() !== parseInt(self.monthlyWeekDay())) {
                                startDate.add(1, 'days');  // add days until the correct weekday is reached
                            }
                            var weekNum = parseInt(startDate.date() / 7) + (startDate.date() % 7 === 0 ? 0 : 1);

                            while (weekNum < parseInt(self.monthlyWeek())) {
                                startDate.add(7, 'days');  // add weeks until the correct week number is reached
                                weekNum = parseInt(startDate.date() / 7) + (startDate.date() % 7 === 0 ? 0 : 1);
                            }
                            if (weekNum === parseInt(self.monthlyWeek()) && startDate.weekday() === parseInt(self.monthlyWeekDay())) {
                                // re-check the end date (if it applies), then add the recurrence
                                if (self.dateType() === 'endafter' || (self.dateType() === 'enddate' && startDate.isBefore(endDate))) {
                                    bookStart = moment(startDate);
                                    bookEnd = moment(bookStart).add(bookLength, 'minutes');
                                    self.tempRecurrences.push({ start: bookStart, end: bookEnd });
                                }
                            }
                        } else {  // 'last' week
                            var origStartDate = moment(startDate);
                            startDate = startDate.endOf('month');  // jump to the end of the current month and work backward

                            // subtract days until the 'last' occurrence of that weekday is reached
                            while (startDate.weekday() !== parseInt(self.monthlyWeekDay())) {
                                startDate.subtract(1, 'days');
                            }
                            if (!startDate.isBefore(origStartDate)) {
                                // re-check the end date (if it applies), then add the recurrence
                                if (self.dateType() === 'endafter' || (self.dateType() === 'enddate' && startDate.isBefore(endDate))) {
                                    bookStart = moment(startDate);
                                    bookEnd = moment(bookStart).add(bookLength, 'minutes');
                                    self.tempRecurrences.push({ start: bookStart, end: bookEnd });
                                }
                            }
                        }

                        // move the date to the start of the next month in the recurrence for the next iteration
                        startDate = startDate.date(1).add(self.tempRecurrenceCount() === 0 ? 1 : self.monthlyWeekDayCount(), 'months');
                    }

                    if (self.dateType() === 'endafter' && apply) {
                        tempEndDate = moment(bookStart);
                    }  // update enddate for display purposes
                }
                break;
            case 'random':
                $.each(self.randomDates(), function (idx, el) {
                    var bookStart = moment(el).hours(startDate.hours()).minutes(startDate.minutes());
                    var bookEnd = moment(bookStart).add(bookLength, 'minutes');
                    self.tempRecurrences.push({ start: bookStart, end: bookEnd });
                });

                if (apply) {
                    // set filter start/end dates based on min/max moments in recurrences array
                    var randomMomentArr = $.map(self.tempRecurrences(), function (el) { return el.start; });
                    parentModel.filters.date(moment.min(randomMomentArr));
                    tempEndDate = moment.max(randomMomentArr);
                }
                break;
        }

        if (apply) {
            self.recurrences(self.tempRecurrences().slice());
            var origEndDate = self.endDate();
            self.endDate(moment(tempEndDate));  // set new end date for validation

            if (!self.validateTemplateRules()) {
                self.recurrences.removeAll();
                self.endDate(origEndDate);  // reset end date if validation failed
                return false;
            }

            parentModel.availabilityFilterData.Dates = $.map(self.recurrences(), function (el) { return el.start._d; });

            var displayText = self.getRecurrenceDisplay();
            $('#recurrence-pattern-overlay').html(displayText.pattern + '<span class="grey-text">' + displayText.occurrences + '</span>');

            // Select the list view and hide the schedule view
            $('#result-tabs li[data-resulttype=0] a').click();
            $('#result-tabs li[data-resulttype=1]').hide();

            $('#recurrence-modal').modal('hide');
            var locFilterHeight = $('#location-filter-container').is(':visible') ? $('#location-filter-container').outerHeight() : 0;
            $('#datetime-overlay-lock').height($('#date-time-collapse').outerHeight() - locFilterHeight);
        }
    };

    self.removeRecurrence = function () {
        self.recurrences.removeAll();
        $('#recurrence-weekly-btns button.btn-primary').removeClass('btn-primary').addClass('btn-default');
        self.randomDates.removeAll();
        $('th.next')[0].click();  // force calendar update to clear selected day UI
        $('th.prev')[0].click();
        $('#recurrence-modal').modal('hide');
        $('#result-tabs li[data-resulttype=1]').show();
        var locFilterHeight = $('#location-filter-container').is(':visible') ? $('#location-filter-container').outerHeight() : 0;
        $('#datetime-overlay-lock').height($('#date-time-collapse').outerHeight() - locFilterHeight);

        self.remainingDates.removeAll();
    };

    self.validateRequiredFields = function () {
        var errMsgArr = [];

        // daily-specific
        if (self.recurrenceType() === 'daily' && self.dailyType() === 'everydays' && !self.dailyCount()) {
            errMsgArr.push(vems.roomRequest.enterValidEveryDays);
        }

        // weekly-specific
        if (self.recurrenceType() === 'weekly') {
            if (!self.weeklyCount()) {
                errMsgArr.push(vems.roomRequest.enterValidEveryWeeks);
            }

            // populate the weeklyDays array and check for validity
            self.weeklyDays.removeAll();
            var selectedDays = $('#recurrence-weekly-btns > .btn-primary');
            $.each(selectedDays, function (idx, el) {
                self.weeklyDays.push($(el).data('daynum'));
            });
            if (self.weeklyDays().length < 1) {
                errMsgArr.push(vems.roomRequest.selectOneDay);
            }
        }

        // monthly-specific
        if (self.recurrenceType() === 'monthly') {
            if (self.monthlyType() === 'everymonths' && !(self.monthlyDay() && self.monthlyCount())) {
                errMsgArr.push(vems.roomRequest.enterValidEveryMonths);
            }

            if (self.monthlyType() === 'monthdays' && !self.monthlyWeekDayCount()) {
                errMsgArr.push(vems.roomRequest.enterValidEveryDayEveryMonths);
            }
        }

        // random-specific
        if (self.recurrenceType() === 'random' && self.randomDates().length < 1) {
            errMsgArr.push(vems.roomRequest.selectOneDate);
        }

        if (!moment(parentModel.filters.date()).isValid()) {
            errMsgArr.push(vems.roomRequest.enterValidStartDate);
        }
        if (self.dateType() === 'enddate' && !moment(self.endDate()).isValid()) {
            errMsgArr.push(vems.roomRequest.enterValidEndDate);
        }
        if (self.dateType() === 'endafter' && !self.dateCount()) {
            errMsgArr.push(vems.roomRequest.enterValidAfterOccurrences);
        }
        if (!moment(parentModel.filters.start()).isValid()) {
            errMsgArr.push(vems.roomRequest.enterValidStartTime);
        }
        if (!moment(parentModel.filters.end()).isValid()) {
            errMsgArr.push(vems.roomRequest.enterValidEndTime);
        }

        var reqErrMsg = '';
        $.each(errMsgArr, function (idx, err) {
            reqErrMsg += err;
            if (idx < errMsgArr.length - 1) {
                reqErrMsg += '<br/><br/>';
            }
        });

        self.reqValidationMsg(reqErrMsg);
        if (reqErrMsg) {
            return false;
        }
        return true;
    };

    self.showReqValidationMessage = function () {
        vems.showToasterMessage('', self.reqValidationMsg(), 'danger', '', '', '#recurrence-modal-content');
    };

    self.validateTemplateRules = function () {
        var errMsgArr = [];
        var maxBookings = (parentModel.templateRules().NumberOfAllowedBookingsBeforeLastAllowedDate > 0
            && parentModel.templateRules().NumberOfAllowedBookingsBeforeLastAllowedDate < parentModel.templateRules().MaxBookings)
                ? parentModel.templateRules().NumberOfAllowedBookingsBeforeLastAllowedDate
                : parentModel.templateRules().MaxBookings;
        if (maxBookings > 0 && self.recurrenceCount() > maxBookings) {
            errMsgArr.push(vems.roomRequest.templateMaxBookings.replace('{0}', '<b>' + maxBookings + '</b>'));
        }

        var maxDate = classicRequestModel.getTemplateMaxDate();
        if (maxDate.year() > 1900 && self.endDate().isAfter(moment(maxDate))) {
            errMsgArr.push(vems.roomRequest.templateMaxDate.replace('{0}', '<b>' + maxDate.format('ddd MMM D, YYYY') + '</b>'));
        }
        
        var minDate = classicRequestModel.getTemplateMinDate();
        if (minDate.year() > 1900 && moment(self.recurrences()[0].start).isBefore(minDate)) {
            errMsgArr.push(vems.roomRequest.templateMinDate.replace('{0}', '<b>' + minDate.format('ddd MMM D, YYYY') + '</b>')
                .replace('{1}', '<b>' + minDate.format('LT') + '</b>'));
        }

        var reqErrMsg = '';
        $.each(errMsgArr, function (idx, err) {
            reqErrMsg += err;
            if (idx < errMsgArr.length - 1) {
                reqErrMsg += '<br/><br/>';
            } else {
                reqErrMsg += '<br/><br/>';
                reqErrMsg += vems.roomRequest.adjustYourDateSelections;
            }
        });
        if (reqErrMsg) {
            vems.showToasterMessage('', reqErrMsg, 'danger', '', '', '#recurrence-modal-content');
            return false;
        }
        return true;
    };

    self.getRecurrenceDisplay = function () {
        var displayStr;
        switch (self.recurrenceType()) {
            case 'daily':
                displayStr = vems.roomRequest.dailyDisplayText;
                var dayText = self.dailyType() === 'everydays' ? (parseInt(self.dailyCount()) === 1 ? vems.roomRequest.dayText : self.dailyCount() + ' ' + vems.roomRequest.daysText)
                    : (moment().isoWeekday(1).format('dddd') + ', ' + moment().isoWeekday(2).format('dddd') + ', ' + moment().isoWeekday(3).format('dddd')
                            + ', ' + moment().isoWeekday(4).format('dddd') + ' ' + vems.roomRequest.andText + ' ' + moment().isoWeekday(5).format('dddd'));
                displayStr = displayStr.replace('{5}', dayText);
                break;
            case 'weekly':
                displayStr = vems.roomRequest.weeklyDisplayText;
                var weekText = parseInt(self.weeklyCount()) === 1 ? vems.roomRequest.weekText : self.weeklyCount() + ' ' + vems.roomRequest.weeksText;
                displayStr = displayStr.replace('{6}', weekText);
                var weekDayText = '';
                if (self.weeklyDays().length === 1) {
                    weekDayText = moment().weekday(self.weeklyDays()[0]).format('dddd');
                } else {
                    $.each(self.weeklyDays(), function (idx, dayNum) {
                        weekDayText += moment().weekday(parseInt(dayNum)).format('dddd');
                        if (idx !== self.weeklyDays().length - 1) {
                            if (idx === self.weeklyDays().length - 2) {
                                weekDayText += ' ' + vems.roomRequest.andText + ' ';
                            } else {
                                weekDayText += ', ';
                            }
                        }
                    });
                }
                displayStr = displayStr.replace('{5}', weekDayText);
                break;
            case 'monthly':
                displayStr = vems.roomRequest.monthlyDisplayText;
                if (self.monthlyType() === 'everymonths') {
                    displayStr = displayStr.replace('{6}', vems.roomRequest.dayText + ' ' + self.monthlyDay());
                    displayStr = displayStr.replace('{5}', parseInt(self.monthlyCount()) === 1 ? vems.roomRequest.monthText
                        : self.monthlyCount() + ' ' + vems.roomRequest.monthsText);
                } else {
                    displayStr = displayStr.replace('{6}', vems.roomRequest.theText + ' ' + $('#recurrence-monthlyweek-ddl option:selected').text().toLowerCase()
                        + ' ' + moment().weekday(self.monthlyWeekDay()).format('dddd'));
                    displayStr = displayStr.replace('{5}', parseInt(self.monthlyWeekDayCount()) === 1 ? vems.roomRequest.monthText
                        : self.monthlyWeekDayCount() + ' ' + vems.roomRequest.monthsText);
                }
                break;
            case 'random':
                displayStr = vems.roomRequest.randomDisplayText;
                break;
        }
        displayStr = displayStr.replace('{4}', parentModel.filters.date().format('ddd MMM D, YYYY'));
        displayStr = displayStr.replace('{3}', self.endDate().format('ddd MMM D, YYYY'));
        displayStr = displayStr.replace('{2}', parentModel.filters.start().format('LT'));
        displayStr = displayStr.replace('{1}', parentModel.filters.end().format('LT'));
        displayStr = displayStr.replace('{0}', $.grep(parentModel.TimeZones(), function (el) {
            return parentModel.filters.timeZoneId() === el.TimeZoneId
        })[0].TimeZone);

        var occurrences = self.remainingDates && self.remainingDates().length > 0
            ? '(' + self.remainingDates().length + ')'
            : ' (' + self.recurrenceCount() + ' ' + (self.recurrenceCount() === 1 ? vems.roomRequest.occurrenceText : vems.roomRequest.occurrencesText) + ')';

        return {
            pattern: displayStr, occurrences: occurrences
        };
    };
}

function BookingCartViewModel(parentModel) {
    var self = this;
    self.bookings = ko.observableArray();
    self.bookings.subscribe(function () {
        parentModel.serviceOrders.removeAll();  // remove all previously-added service orders
        parentModel.updateRoomResourceExclusions();  // exclude/include resources as needed when cart is updated
    });

    self.add = function (roomData, filters, tzDrop) {
        if (roomData == undefined)
            return false;

        parentModel.hasResults(true);

        var unavailableReason = $.isFunction(roomData.UnavailableReason) ? roomData.UnavailableReason() : roomData.UnavailableReason;
        if (unavailableReason === 9999) {

            if (roomData.cartObj) {
                self.bookings.remove(roomData.cartObj);
                roomData.cartObj = null;
                roomData.UnavailableReason(0);
            }

            return false;
        }

        var room = ko.toJS(roomData);
        room.TempRoomDescription = ''

        var roomId = room.ID ? room.ID : room.RoomId;

        room.Date = moment(filters.date())._d;
        room.Start = moment(filters.start())._d;
        room.End = moment(filters.end())._d;
        room.TimeZone = tzDrop.find(':selected').text();
        room.TimeZoneId = tzDrop.find(':selected').val();

        room.Dates = parentModel.availabilityFilterData.Dates;

        self.bookings.push(ko.mapping.fromJS(room));
    };

    self.remove = function (item, supressConfirm) {
        if (!item)
            item = this;

        self.bookings.remove(item);
    };

    self.responsiveRemove = function () {
        if ($('#specific-room-search').data('ttTypeahead'))
            $('#specific-room-search').typeahead('val', '')

        $.each(self.bookings(), function (i, v) {
            self.remove(v);
        });
    };
}

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
                var date = $('#booking-date').data('DateTimePicker').date()._d;
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

ko.bindingHandlers.multiDatePicker = {
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
            options.inline = true;
            options.enabledDates = [moment()];
            options.format = 'LL';

            $(element).datetimepicker(options).on('dp.update', function (ev) {
                bindMultiDayCssAndEvents();  // fires when month/view changed
            });

            return ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);
        } catch (e) {
            return false;
        }
    },
    update: function (element, valueAccessor) {
        bindMultiDayCssAndEvents();  // fires when date selected
    }
};
function bindMultiDayCssAndEvents() {  // function used by multiDatePicker ko binding for functionality/styling
    var minDate = moment(classicRequestModel.templateRules().FirstAllowedBookingDate).startOf('day');
    var maxDate = moment(classicRequestModel.templateRules().LastAllowedBookingDate).endOf('day');

    $.each($('#recurrence-random-calendar td.day'), function (idx, el) {
        var currDay = $(el);
        if (!moment(currDay.data('day')).isBefore(minDate) && !moment(currDay.data('day')).isAfter(maxDate)) {
            currDay.removeClass('avail-day avail-day-oldnew');  // properly style available/valid dates 
            if (!currDay.hasClass('old') && !currDay.hasClass('new')) {
                currDay.addClass('avail-day');
            } else {
                currDay.addClass('avail-day-oldnew');
            }

            if (classicRequestModel.recurrence.randomDates.indexOf(currDay.data('day')) !== -1) {
                currDay.addClass('recurrence-day');  // highlight dates already selected
            }
        }
    });

    $('#recurrence-random-calendar td.day').off('click').on('click', function (ev) {
        var targetDay = $(ev.target);
        if (!moment(targetDay.data('day')).isBefore(minDate) && !moment(targetDay.data('day')).isAfter(maxDate)) {
            if (classicRequestModel.recurrence.randomDates.indexOf(targetDay.data('day')) === -1) {
                targetDay.addClass('recurrence-day');  // add date if not in random array
                classicRequestModel.recurrence.randomDates.push(targetDay.data('day'));
            } else {
                targetDay.removeClass('recurrence-day');  // remove date if in random array
                classicRequestModel.recurrence.randomDates.remove(targetDay.data('day'));
            }
        }
        return false;
    });
}

$(document).on('keydown', '#bookings .numeric', function (event) {
    if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                (event.keyCode == 65 && event.ctrlKey === true) || (event.keyCode == 173 || event.keyCode == 189 || event.keyCode == 190 || event.keyCode == 110) ||
                (event.keyCode >= 35 && event.keyCode <= 39)) {  //|| event.keyCode == 188  // don't allow commas on IE
        return;
    } else {
        // stop the key press when necessary
        if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
        }
    }
}).on('keyup', '#bookings .numeric', function (event) {
    if ($(this).val() < 0) {
        $(this).val(0);
    }

    if ($(this).val() > 999999) {
        $(this).val(999999);
    }
});

ko.bindingHandlers.numeric = {
    init: function (element, valueAccessor) {
        $(element).on('keydown', function (event) {
            // allow backspace, delete, tab, escape, enter, Ctrl+A, period, comma, home, end, left, and right
            if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                (event.keyCode == 65 && event.ctrlKey === true) || (event.keyCode == 188 || event.keyCode == 190 || event.keyCode == 110) ||
                (event.keyCode >= 35 && event.keyCode <= 39)) {
                return;
            } else {
                // stop the key press when necessary
                if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                    event.preventDefault();
                }
            }
        });
    }
};

$('#search-room-filters, #specific-room-filters').on('show.bs.collapse', function () {
    $('#search-filters-overlay').height($('#search-room-filters').outerHeight() + $('#specific-room-filters').outerHeight());
    $('#search-room-filters, #specific-room-filters').find('a i.fa').toggleClass('fa-chevron-circle-up fa-chevron-circle-down');
}).on('hidden.bs.collapse', function () {
    $('#search-filters-overlay').height($('#search-room-filters').outerHeight() + $('#specific-room-filters').outerHeight());
    // both panels are collapsed, open the one not closed as part of this event
    if ($('#search-room-filters .panel-collapse').hasClass('collapse') && $('#specific-room-filters .panel-collapse').hasClass('collapse')) {
        if (this.id === 'search-room-filters')
            $('#specific-room-filters .panel-heading a').click();
        else
            $('#search-room-filters .panel-heading a').click();
    }
});