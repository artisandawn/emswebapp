function validateTimeFields() {
    var startValid = true;
    var endValid = true;
    var selectedDate = moment($("#booking-date-input").val(), 'ddd L');
    var startTime = moment($('#booking-start').find('input').first().val() ? $('#booking-start').val() : null);
    var endTime = moment($('#booking-end').find('input').first().val() ? $('#booking-end').val() : null);

    if (startTime.isValid() && endTime.isValid()) {  // if both times are entered, check against template rules and current time
        startTime = moment(selectedDate).hour(startTime.hour()).minute(startTime.minute());
        endTime = moment(selectedDate).hour(endTime.hour()).minute(endTime.minute());

        if (endTime.hour() < startTime.hour() || (endTime.hour() === startTime.hour() && endTime.minute() === startTime.minute())) {
            endTime.add(1, 'day');  // set end time's date to tomorrow when booking is overnight
        }

        // adjust times to UTC, based on currently-selected time zone
        var offset = 0;
        if ($('#timeZoneDrop').val() != null) {
            var selectedTZ = $.grep(roomRequestModel.templateRules().TimeZones, function (v, i) {
                return v.TimeZoneID == roomRequestModel.filters.timeZoneId();
            })[0];
            if (!selectedTZ) {  // if no selected TZ found from filter VM value, use the value from the drop-down itself
                selectedTZ = $.grep(roomRequestModel.templateRules().TimeZones, function (v, i) {
                    return v.TimeZoneID == $('#timeZoneDrop').val();
                })[0];
            }

            if (selectedTZ) {  // if a selected TZ was found, offset the start/end times for validation
                offset = selectedTZ.MinuteBias * -1;
                startTime = moment(new Date(startTime.year(), startTime.month(), startTime.date(), startTime.hour(), startTime.minute(), 0)).add(offset, 'minute');
                endTime = moment(new Date(endTime.year(), endTime.month(), endTime.date(), endTime.hour(), endTime.minute(), 0)).add(offset, 'minute');
            }
        }

        var utcNow = moment().add((new Date()).getTimezoneOffset(), 'minute');  // current time (in UTC)
        var minTime = roomRequestModel.getTemplateMinDate();  // start of first available day
        minTime.add(offset, 'minutes');  // convert minTime to UTC for accuracy
        var maxTime = roomRequestModel.getTemplateMaxDate();  // end of last available day
        if (startTime.isBefore(minTime) || startTime.isBefore(utcNow) || startTime.isAfter(maxTime)) {
            startValid = false;
        }
        if (endTime.isBefore(minTime) || endTime.isAfter(maxTime)) {
            endValid = false;
        }
    } else {  // at least one of the times isn't entered
        startValid = startTime.isValid();
        endValid = endTime.isValid();
    }

    if (!startValid || !endValid) {  // set appropriate borders based on which time(s) aren't valid
        if (!startValid) {
            $('#booking-start').find('input').first().addClass('required');
            $('#booking-start').find('span.input-group-addon').addClass('required');
        } else {
            $('#booking-start').find('input').first().removeClass('required');
            $('#booking-start').find('span.input-group-addon').removeClass('required');
        }

        if (!endValid) {
            $('#booking-end').find('input').first().addClass('required');
            $('#booking-end').find('span.input-group-addon').addClass('required');
        } else {
            $('#booking-end').find('input').first().removeClass('required');
            $('#booking-end').find('span.input-group-addon').removeClass('required');
        }

        if ($('#booking-start').closest('.time-container').find('.validation-error-message').length === 0) {
            $('#booking-start').closest('.time-container').append($('<span class="validation-error-message">').append(vems.roomRequest.enterValidTime));
        }
        return false;
    } else {  // remove any red borders and error messages
        $('#booking-start').find('input').first().removeClass('required');
        $('#booking-start').find('span.input-group-addon').removeClass('required');
        $('#booking-end').find('input').first().removeClass('required');
        $('#booking-end').find('span.input-group-addon').removeClass('required');
        $('#booking-start').closest('.time-container').find('.validation-error-message').remove();
        return true;
    }
}

function roomRequestViewModel(templateCollection, templateId, labels, defaults) {
    var self = this;

    self.defaults = defaults;

    self.templates = ko.observableArray(templateCollection);
    self.templateId = ko.observable(templateId);

    vems.helpText.parentId = self.templateId();

    self.template = ko.computed(function () {
        var templateItem = ko.utils.arrayFirst(self.templates(), function (item) {
            return item.Id === self.templateId();
        });

        return templateItem ? templateItem : { "Text": "", "NavigateUrl": "", "Id": 0, "Target": null, "Selectable": true, "IconClass": null, "IsMainMenuItem": false, "ChildMenus": [] };
    });

    self.resultType = ko.observable(0);

    self.templateRules = ko.observable();

    self.roomSetupTypes = ko.observableArray([]);

    self.filteredRoomSetupTypes = function (roomData) {
        var room = ko.toJS(roomData);
        var setupTypes = ko.toJS(self.templateRules().SetupTypes);

        if (self.setupTypeValidation() == 2 && room.AvailableSetupTypes && room.AvailableSetupTypes != null) { // show and validate
            var roomSetupTypes = $.map(self.templateRules().SetupTypes, function (v, i) {
                if ($.inArray(v.Id.toString(), room.AvailableSetupTypes.substring(0, room.AvailableSetupTypes.length - 1).split(',')) >= 0)
                    return v;
            });
        }

        if ($.isArray(roomSetupTypes) && roomSetupTypes.length > 0)
            setupTypes = roomSetupTypes;

        return setupTypes;
    };

    self.Groups = ko.observableArray([]);
    self.AddedGroups = ko.observableArray([]);
    self.Contacts = ko.observableArray([]);
    self.AltContacts = ko.observableArray([]);

    self.filters = new filterViewModel(defaults, self);
    self.filteredEditMode = ko.observable(false);  // used when editing a booking to indicate whether or not a full search has been performed

    self.disableTimeFields = ko.observable(vems.roomRequest.pageMode === 'AddPamLocation' || (vems.roomRequest.pageMode === 'EditPamLocation' && !DevExpress.devices.real().phone));

    self.recurrence = new recurrenceViewModel(defaults);

    //if (DevExpress.devices.real().phone) { // changes to date time on a phone should remove bookings from the cart
    //    var dateTimeChangeResetCart = function (newValue) {
    //        self.cart.bookings.removeAll();
    //        $('#specific-room-search').typeahead("val", "");
    //    };

    //    self.filters.date.subscribe(dateTimeChangeResetCart);
    //    self.filters.start.subscribe(dateTimeChangeResetCart);
    //    self.filters.end.subscribe(dateTimeChangeResetCart);
    //}

    self.createReservationButtonText = ko.pureComputed(function () {
        return labels.createReservation;
    });

    self.timeZones = ko.observableArray();
    self.setupTypeValidation = ko.observable();
    self.attendees = new attendeeViewModel('');
    self.roomResults = ko.observableArray();
    self.listRoomResults = ko.computed(function () {
        return $.grep(self.roomResults(), function (rm) {
            return rm.UnavailableReason() === 0 || rm.UnavailableReason() === 9999;
        });
    });
    self.roomConflicts = ko.observableArray();
    self.floorMaps = ko.observableArray();
    self.floormapBuildings = ko.observableArray([]);
    self.floormapImages = ko.observableArray([]);
    self.floormapBuildingId = ko.observable(-1);
    self.chosenFloorMap = ko.observable(-1);
    self.floormapRooms = ko.observableArray([]);
    self.floormapRoomFilterSelectedId = ko.observable(-1);
    self.hasResults = ko.observable(false);
    self.attendanceCount = ko.observable(0);
    self.attendanceCountComputed = function () {
        //if another booking already in cart, use defaultattendance
        if (self.cart.bookings && self.cart.bookings().length > 0 && vems.roomRequest.defaultAttendance) {
            return vems.roomRequest.defaultAttendance;
        }
        return self.attendanceCount();
    };

    // used to store the last values used in retrieving service data for service-only requests
    self.soLastDate = ko.observable('');
    self.soLastStart = ko.observable('');
    self.soLastEnd = ko.observable('');
    self.soLastBuildingId = ko.observable(-1);
    self.soLastRoom = ko.observable('');

    // the filter object sent back on availability search
    self.availabilityFilterData;

    // do these two need their own models to handle edits, rules, etc.?
    self.cart = new BookingCartViewModel(self);
    self.services = ko.observable({});
    self.serviceOrders = ko.observableArray([]);

    self.bookingCount = ko.computed(function () {
        // this will need to filter out recurrence parents
        return self.cart.bookings().length;
    });

    self.displayDateTimeOverlay = function () {
        if (!self.templateRules || self.templateRules() == undefined) {
            return false;
        }

        return (self.templateRules().AllowInvitations && self.cart.bookings().length > 0) || (self.templateRules().AllowInvitations && self.cart.bookingEditing() != null && self.cart.bookingEditing().isOccurrence);
    };

    self.reservationDetails = new reservationDetailsViewModel(vems.browse.FirstContactTitle, vems.browse.AlternateContactTitle, vems.browse.eventNameMaxLength);
    self.reservationDetails.eventName(defaults.eventName);
    self.reservationDetails.pamSubject(defaults.eventName);
    self.reservationDetails.pamShowTimeAs(defaults.showTimeAs);
    self.reservationDetails.pamReminder(defaults.reminder);

    self.ShowBillingReferences = ko.computed(function () {
        if (!self.templateRules || self.templateRules() == undefined)
            return false;
        var bVal = self.templateRules().Parameters.ReservationsShowBillingReference;
        //check rooms that require BR
        $.each(self.cart.bookings(), function (i, r) {
            if (r.PromptForBillingReference && r.PromptForBillingReference())
                bVal = true;
        });

        //if (vems.bookingServicesVM && ko.isObservable(vems.bookingServicesVM.ShowBillingReferences) && vems.bookingServicesVM.ShowBillingReferences() === true)
        //    bVal = true;
        return bVal;
    });
    self.ShowPONumber = ko.computed(function () {
        if (!self.templateRules || self.templateRules() == undefined)
            return false;
        var bVal = self.templateRules().Parameters.ReservationsShowPONumber;

        //if (vems.bookingServicesVM && ko.isObservable(vems.bookingServicesVM.ShowPONumber) && vems.bookingServicesVM.ShowPONumber() === true)
        //    bVal = true;
        return bVal;
    });

    self.getTemplateMaxDate = function () {
        var lastDateMoment = self.getMaxDateForCalendar();
        var maxDateMoment = moment(self.templateRules().MaxDate).endOf('day');
        var maxDate = moment.max(maxDateMoment, lastDateMoment);  // max() usable because max days and date can't be set concurrently
        return maxDate;
    };

    self.getTemplateMinDate = function () {
        var firstDateMoment = self.getMinDateForCalendar();
        var minDateMoment = moment(self.templateRules().MinDate).startOf('day');
        var minDate = moment.max(minDateMoment, firstDateMoment);  // max() usable because min days/hours and date can't be set concurrently
        return minDate;
    };

    self.getMinDateForCalendar = function () {
        if (roomRequestModel.templateRules().TimeZones == null)
            return moment();

        var selectedTZ = $.grep(roomRequestModel.templateRules().TimeZones, function (v, i) {
            return v.TimeZoneID == $('#timeZoneDrop').val();
        });

        if (selectedTZ.length > 0) {
            var templateRuleDate = moment(self.templateRules().FirstAllowedBookingDateGMT);
            return moment(templateRuleDate).add(selectedTZ[0].MinuteBias - moment().utcOffset(), 'minute').startOf('day');
        }

        return moment(self.templateRules().FirstAllowedBookingDateGMT).startOf('day');
    };

    self.getMaxDateForCalendar = function () {
        if (roomRequestModel.templateRules().TimeZones == null)
            return moment();

        var selectedTZ = $.grep(roomRequestModel.templateRules().TimeZones, function (v, i) {
            return v.TimeZoneID == $('#timeZoneDrop').val();
        });

        if (selectedTZ.length > 0) {
            var templateRuleDate = moment(self.templateRules().LastAllowedBookingDateGMT);

            var lastBookingDateNow = new Date(templateRuleDate.year(), templateRuleDate.month(), templateRuleDate.date(), moment().utc().hour(), moment().utc().minute(), moment().utc().second());
            return moment(lastBookingDateNow).add(selectedTZ[0].MinuteBias, 'minute').endOf('day');
        }

        return moment(self.templateRules().LastAllowedBookingDateGMT).endOf('day');
    };

    self.onServicesLoaded = function () {
        self.bindBRPOplugins(vems.roomRequest.BRPOScreenText);
    };
    self.bindBRPOplugins = function (screenText) {
        if (roomRequestModel.templateRules() && roomRequestModel.templateRules().Parameters.ShowPONumberLookup) {
            $(".PONumber-input").poLookup({
                ScreenText: screenText.ScreenText,
                callBack: function (po) {
                    roomRequestModel.reservationDetails.poNumber(po.PONumber);
                }
            });
        }
        if (roomRequestModel.templateRules() && !roomRequestModel.templateRules().Parameters.ShowPONumberLookup) {
            $(".PONumber-input").parent().find(".input-icon-embed").hide();
        }
        if (roomRequestModel.templateRules() && roomRequestModel.templateRules().Parameters.ShowBillingReferenceLookup) {
            $(".billingReference-input").BillingRefLookup({
                ScreenText: screenText.ScreenText,
                callBack: function (data) {
                    roomRequestModel.reservationDetails.billingReference(data.BillingReference);
                }
            });
        }
        if (roomRequestModel.templateRules() && !roomRequestModel.templateRules().Parameters.ShowBillingReferenceLookup) {
            $(".billingReference-input").parent().find(".input-icon-embed").hide();
        }
        //this stupid little hack is for Safari's rendering engine.
        $('.input-icon-embed').css('position', 'static');
        setTimeout(function () {
            $('.input-icon-embed').css('position', 'absolute');
        }, 50);
    };

    self.templateClick = function () {
        window.location = this.NavigateUrl;
        //self.templateId(this.Id);
        //vems.ajaxPost({
        //    url: vems.serverApiUrl() + '/GetProcessTemplateData',
        //    data: '{ templateId : \'' + this.Id + '\'}',
        //    success: function (result) {
        //        var response = JSON.parse(result.d);
        //        self.templateRules(response);
        //    },
        //    error: function (xhr, ajaxOptions, thrownError) {
        //        console.log(thrownError);
        //    }
        //});

        return false;
    };

    self.fillServiceOnlyServices = function () {
        var dateAndTimeSet = self.filters.date() && self.filters.start() && self.filters.end();
        var locationSet = $('#od-location').val().length > 0;

        var errMsgArr = [];

        if (!dateAndTimeSet) {
            errMsgArr.push(vems.roomRequest.DateAndTimeAreRequired);
        }

        if (!locationSet) {
            errMsgArr.push(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=od-location]').eq(0).text()))
        }

        var reqErrMsg = '';
        if (errMsgArr.length > 0) {
            $.each(errMsgArr, function (idx, err) {
                reqErrMsg += err;
                if (idx < errMsgArr.length - 1) {
                    reqErrMsg += '<br/><br/>';
                }
            });

            vems.showToasterMessage('', reqErrMsg, 'danger');
            return false;
        } else { // get categories
            var buildingId = $('#od-building-drop').val();

            self.availabilityFilterData.TemplateId = self.templateId();
            self.availabilityFilterData.Start = self.filters.start();
            self.availabilityFilterData.End = self.filters.end();

            if (self.recurrence.recurrenceCount() > 0) {
                if (self.recurrence.remainingDates && self.recurrence.remainingDates().length > 0) {
                    self.availabilityFilterData.Dates = self.recurrence.remainingDates();
                } else {
                    self.availabilityFilterData.Dates = $.map(self.recurrence.recurrences(), function (el) {
                        return el.start._d
                    });
                }
            } else {
                self.availabilityFilterData.Dates = [moment(self.filters.date())._d];
            }

            var filterData = jQuery.extend(true, {}, self.availabilityFilterData);
            filterData.Start = filterData.Start.format('YYYY-MM-D HH:mm:ss');
            filterData.End = filterData.End.format('YYYY-MM-D HH:mm:ss');

            for (var i = 0; i < filterData.Dates.length; i++) {
                filterData.Dates[i] = moment(filterData.Dates[i]).format('YYYY-MM-D HH:mm:ss');
            }

            // check the current category count - if categories got overwritten by the plugin being reloaded, (due to date/time changes) reload services
            var loadedCategoryCount = self.services && self.services().AvailableCategories ? self.services().AvailableCategories().length : 0;
            if (self.soLastStart() === filterData.Start && self.soLastEnd() === filterData.End && self.soLastBuildingId() === buildingId
                && self.soLastRoom() === $('#od-location').val() && self.soLastDate() === filterData.Dates.join(',') && loadedCategoryCount !== 0) {  // skip service data call when no filter values changed 
                return true;
            } else {  // otherwise, store old filter values to prevent unintentional future calls
                self.soLastDate(filterData.Dates.join(','));
                self.soLastStart(filterData.Start);
                self.soLastEnd(filterData.End);
                self.soLastBuildingId(buildingId);
                self.soLastRoom($('#od-location').val());
                self.serviceOrders.removeAll();  // get rid of all currently-selected SO's, because those services might no longer be available
            }

            var data = {
                templateId: self.templateId(),
                buildingId: buildingId,
                locationText: $('#od-location').val(),
                searchData: filterData
            };

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/GetServicesForServiceOnlyRequest',
                data: JSON.stringify(data),
                success: function (result) {
                    roomRequestModel.cart.bookings().length = 0;
                    var response = JSON.parse(result.d);
                    var jsonData = JSON.parse(response.JsonData);
                    if (jsonData) {
                        var room = {
                            RoomId: jsonData.RoomId,
                            RoomCode: '',
                            RoomDescription: '',
                            Date: self.filters.date()._d,
                            LocalDate: self.filters.date()._d,
                            Start: self.filters.start()._d,
                            LocalStart: self.filters.start()._d,
                            End: self.filters.end()._d,
                            LocalEnd: self.filters.end()._d,
                            GmtStart: jsonData.GmtStart,
                            GmtEnd: jsonData.GmtEnd,
                            TimeZoneId: -1,
                            Timezone: '',
                            SetupCount: 1,
                            Attendance: 1,
                            SetupTypeId: -1,
                            DefaultSetupTypeId: -1,
                            StatusName: '',
                            Conflict: false,
                            Min: 1,
                            Max: 1,
                            RoomType: 3,
                            RecordType: jsonData.RecordType,
                            TempRoomDescription: $('#od-location').val(),
                            IsHost: false,
                            Holidays: [],
                            Price: ''
                        };

                        var soBooking;
                        if (self.availabilityFilterData.Dates.length > 1 || (self.recurrence.remainingDates && self.recurrence.remainingDates().length > 0)) { // recurrence
                            var occurrences = [];

                            $.each(jsonData.RecurrenceData, function (i, v) {
                                var occurrence = $.extend(true, {}, room);
                                occurrence.Date = ko.observable(moment(v.Date));
                                occurrence.GmtStart = ko.observable(moment(v.GmtStart));
                                occurrence.GmtEnd = ko.observable(moment(v.GmtEnd));
                                occurrence.occurrences = null;
                                occurrence.isOccurrence = true;
                                occurrence.isVariant = false;

                                occurrences.push(ko.mapping.fromJS(occurrence));
                            });

                            room.occurrences = occurrences;
                            room.occurrences.sort(function (left, right) {
                                return left.Date() == right.Date()
                                    ? 0
                                    : (left.Date() < right.Date() ? -1 : 1)
                            });

                            soBooking = ko.mapping.fromJS(room);
                            soBooking.recurrenceDescription = "";

                            self.cart.bookings.push(soBooking);
                        } else {
                            soBooking = ko.mapping.fromJS(room);
                            self.cart.bookings.push(soBooking);
                        }

                        self.services().load(jsonData.Services, self.filters.start(), self.filters.end());
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                },
                complete: function () {
                    vems.pageLoading(false);
                }
            });
        }

        return true;
    };

    self.displayTabChanged = function (data, event) {
        self.resultType($(event.currentTarget).parent().data('resulttype'));
        var editMode = !!self.cart.bookingEditing();

        if (editMode) {
            if (vems.roomRequest.pageMode == 'InitialRequest') {
                return false;
            } else if (self.filteredEditMode()) {
                self.getAvailability(false, [{
                    'filterName': 'RoomId',
                    'value': self.cart.bookingEditing().RoomId(),
                    'displayValue': null,
                    'filterType': self.setupTypeValidation()
                }]);

                return false;
            }
        }

        if (self.hasResults()) {
            self.getAvailability();
        }
    };

    self.nextStepClicked = function () {
        var activeTab = $('#main-tabs li:visible').index($('.active'));

        $('#main-tabs li:visible').eq(activeTab + 1).find('a').click();
    };

    self.prevStepClicked = function () {
        var activeTab = $('#main-tabs li:visible').index($('.active'));
        $('#main-tabs li:visible').eq(activeTab - 1).find('a').click();
    };

    self.overrideDescriptionBuildingChanged = function (data, event) {
        var selectedBuildingId = $(event.currentTarget).val();

        var selectedBuilding = $.grep(data.templateRules().Facilities, function (v) {
            if (v.Id == selectedBuildingId) {
                return v;
            }
        });

        if (selectedBuilding.length > 0) {
            var selectedBuildingTZ = selectedBuilding[0].TimeZoneId;
            data.filters.timeZoneId(selectedBuildingTZ);

            // update the recurrence object to reflect the time change
            if (data.recurrence.recurrenceCount() > 0) {
                data.recurrence.timeZoneId(selectedBuildingTZ);
                var displayText = data.recurrence.getRecurrenceDisplay();
                $('#recurrence-pattern-overlay').html(displayText.pattern + '<span class="grey-text">' + displayText.occurrences + '</span>');
            }
        }
    };

    self.resetModel = function () {
        // reset the model
        return false;
    };

    self.roomFilterKeyPress = function (data, event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            $('#find-a-room-filter-btn').click();
            return false;
        }
        return true;
    };

    self.floormapBuildingId.subscribe(function (newValue) {
        self.floormapFilterByBuilding(newValue);
    });

    self.showChosenMap = function (imageId) {
        if (!imageId)
            imageId = $("#floormap-filter").val();

        var barr = $.grep(self.floormapImages(), function (f, index) {
            return f.ImageId() == parseInt(imageId);
        });
        if (barr.length > 0) {
            setTimeout(function () {
                self.showMapInline(barr[0]);
            }, 50);
        } else {
            $('#no-floormap-msg').show();  // show 'no floormap' message when none match the search criteria
        }
    };

    self.floormapFilterByBuilding = function (buildingId) {
        $('.floormap-roomfilter-input').val('');  //reset room filter

        if (buildingId && buildingId > 0) {
            $("#floormap-filter").off('change');  //turn off change handler since buildavailability below will reset the map.

            //filter building list by building id
            var barr = $.grep(self.floorMaps(), function (f, index) {
                return f.BuildingID() == buildingId;
            });
            self.floormapImages(barr);

            //get the data
            var filterData = jQuery.extend(true, {}, self.availabilityFilterData);
            filterData.Start = filterData.Start.format('YYYY-MM-D HH:mm:ss');
            filterData.End = filterData.End.format('YYYY-MM-D HH:mm:ss');

            for (var i = 0; i < filterData.Dates.length; i++) {
                filterData.Dates[i] = moment(filterData.Dates[i]).format('YYYY-MM-D HH:mm:ss');
            }

            var roomData = buildFloorMapFromRoomResults(barr[0]);
            var filterValues = prepAndGetFilterValues();
            if (vems.floorPlanVM.buildAvailabilityMap) {  //make sure the floorplan vm has been instantiated
                vems.floorPlanVM.buildAvailabilityMap(roomData, filterData, filterValues, buildingId);
            }
        } else {
            self.floormapImages(self.floorMaps()); //reset the list
        }

        self.rebindFloormapSelect();
    };

    self.floormapsFilterByRoom = function (room) {
        var roomData = buildFloorMapFromRoomResults(ko.mapping.fromJS(room));

        //filter carousel down to single building
        var b;
        $.each(self.floorMaps(), function (i, f) {
            if (f.ImageId() == roomData.FloorMapID())
                b = f;
        });
        //var barr = $.grep(self.floorMaps(), function (f, index) {
        //    return f.ImageId() == roomData.ImageId();
        //});
        //if (b)
        //    self.floormapImages([b]);
        //else
        //    console.log("room filter should have found a room result");


        self.floormapImages(self.floorMaps());  //reset the list
        self.chosenFloorMap(b.ImageId());  //set the map that should be shown.

        var filterData = jQuery.extend(true, {}, self.availabilityFilterData);
        filterData.Start = filterData.Start.format('YYYY-MM-D HH:mm:ss');
        filterData.End = filterData.End.format('YYYY-MM-D HH:mm:ss');

        for (var i = 0; i < filterData.Dates.length; i++) {
            filterData.Dates[i] = moment(filterData.Dates[i]).format('YYYY-MM-D HH:mm:ss');
        }
        var filterValues = prepAndGetFilterValues();
        vems.floorPlanVM.buildAvailabilityMap(roomData, filterData, filterValues, roomData.BuildingId(), roomData.RoomID());

        //rebindJCarousel("floormap-container");
        self.rebindFloormapSelect();
    };

    self.initFloormapRoomFilter = function (filterValues) {
        var originalElement = $('.floormap-roomfilter-input');
        //weed out rooms with no floormapindicator, and filter by available floormaps if filtered by floor or building
        var floors = [-1];
        $.each(filterValues, function (i, v) {
            if (v.filterName == 'Floors' && v.value) {
                floors = v.value.split(',');
            }
        });
        var rlist = [];
        $.each(self.roomResults(), function (i, v) {
            if (v.FloorPlanIndicatorID() && v.FloorPlanIndicatorID() > 0) {
                var barr = $.grep(rlist, function (b, index) {
                    return (v.RoomId() == b.RoomId());
                });
                if (!$.isArray(barr) || ($.isArray(barr) && barr.length == 0)) {
                    if (floors.length > 0 && floors[0] != -1) {
                        for (var i = 0; i < floors.length; i++) {
                            if (parseInt(floors[i]) == v.FloorID()) {
                                rlist.push(v);
                            }
                        }
                    }
                    else
                        rlist.push(v);
                }
            }
        });
        self.floormapRooms(rlist);

        var searchSource = new Bloodhound({
            local: ko.mapping.toJS(self.floormapRooms()),
            datumTokenizer: function (d) {
                return Bloodhound.tokenizers.whitespace(d.RoomDescription);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });
        $(originalElement).typeahead('destroy');
        vems.bindLoadingGifsToTypeAhead($(originalElement).typeahead({
            minLength: 1
        },
        {
            source: searchSource.ttAdapter(),
            limit: 20,
            displayKey: 'RoomDescription',
            display: function (result) { return vems.htmlDecode(result.RoomDescription); },
            classNames: {
                suggestion: 'br-suggestion'
            },
            templates: {
                suggestion: function (result) {
                    var row = $('<div class="text-left ellipsis-text">');
                    var showchk = '';
                    var chk = $('<span style="margin-right:20px"></span>');
                    if (result.UnavailableReason <= 0) {
                        chk = $('<span><i class="fa fa-check fa-1 available-check" style="width:20px"></i></span>');
                    }
                    row.append(chk);
                    var rmtype = '';
                    if (result.RoomTypeDescription && result.RoomTypeDescription.length > 0)
                        rmtype = ' - ' + vems.htmlDecode(result.RoomTypeDescription);
                    row.append('<span class="ellipsis-text">' +
                            vems.htmlDecode(result.RoomDescription) + rmtype + '</span>');
                    var r = $('<div>').append(row);
                    return r.html();
                },
                notFound: '<div class="delegate-typeahead-notfound">' + vems.roomRequest.NoMatchingResults + '</div>'
            }
        }).unbind('typeahead:select').bind('typeahead:select', function (event, ref) {
            self.floormapsFilterByRoom(ref);
            $(originalElement).blur();
        }));

        $("#floormap-room-filter").find(".twitter-typeahead").css('display', '-ms-inline-flexbox');
    };

    self.floormapRoomAdded = function (roomData) {
        var r = $.grep(self.roomResults(), function (v, i) {
            return v.RoomId() == roomData.RoomID();
        });
        if ($.isArray(r) && r.length > 0) {
            roomData = r[0];
        }
        self.cart.add(roomData, self.filters, $('#timeZoneDrop'));
    };

    self.showMap = function (bookingData) {
        var FloorMapRoomInfo = buildFloorMapFromRoomResults(bookingData);
        var filterValues = prepAndGetFilterValues();
        vems.floorPlanModalVM.buildModalMapForRoom(FloorMapRoomInfo, self.availabilityFilterData, filterValues);
        return false;
    };

    self.showMapInline = function (bookingData) {
        if (vems.floorPlanVM && vems.floorPlanVM.buildAvailabilityMap) { //make sure the floorplan vm has been instantiated
            var filterData = jQuery.extend(true, {}, self.availabilityFilterData);
            filterData.Start = filterData.Start.format('YYYY-MM-D HH:mm:ss');
            filterData.End = filterData.End.format('YYYY-MM-D HH:mm:ss');

            for (var i = 0; i < filterData.Dates.length; i++) {
                filterData.Dates[i] = moment(filterData.Dates[i]).format('YYYY-MM-D HH:mm:ss');
            }

            var roomData = buildFloorMapFromRoomResults(bookingData);
            var filterValues = prepAndGetFilterValues();
            vems.floorPlanVM.buildAvailabilityMap(roomData, filterData, filterValues);
        }
        return false;
    };

    self.rebindFloormapSelect = function () {
        $("#floormap-filter").off('change').on('change', function (e) {
            //var t = $(e.currentTarget).find('option:selected')[0];
            $('.floormap-roomfilter-input').val('');  //reset room filter
            var id = $(e.currentTarget).val();
            if (id && id > 0) {
                var barr = $.grep(self.floormapImages(), function (f, index) {
                    return f.ImageId() == parseInt(id);
                });
                if (barr.length > 0) {
                    self.showMapInline(barr[0]);
                }
            }
        });
    };

    function buildFloorMapFromRoomResults(roomData) {
        var ri = new FloorMapRoomInfo();
        if (roomData.Floor)
            ri.Floor(roomData.Floor());
        if (roomData.FloorID)
            ri.FloorId(roomData.FloorID());
        if (roomData.BuildingID)
            ri.BuildingId(roomData.BuildingID());
        if (roomData.BuildingId)
            ri.BuildingId(roomData.BuildingId());
        if (roomData.ImageId)
            ri.FloorMapID(roomData.ImageId());
        if (roomData.RoomId) {
            ri.RoomID(roomData.RoomId());
            ri.RoomId(roomData.RoomId());
        }
        if (roomData.RoomCode)
            ri.RoomCode(roomData.RoomCode());
        if (roomData.Location)
            ri.RoomDescription(roomData.Location());
        if (roomData.RecordType)
            ri.RecordType(roomData.RecordType());
        if (roomData.RoomType)
            ri.RoomType(roomData.RoomType());
        if (roomData.RoomTypeDescription)
            ri.RoomTypeDescription(roomData.RoomTypeDescription());
        if (roomData.RoomDescription)
            ri.RoomDescription(roomData.RoomDescription());
        if (roomData.BuildingDescription)
            ri.BuildingDescription(roomData.BuildingDescription());
        ri.FloorMapHash(FloorMapHash);
        ri.FloorMapWebserviceUrl(FloorMapWebServiceUrl);
        if (roomData.UnavailableReason) {
            ri.Available(roomData.UnavailableReason() > 0 ? false : true);
            ri.AllowReservation(roomData.UnavailableReason() > 0 ? false : true);
            ri.UnavailableReason(roomData.UnavailableReason());
        }
        if (roomData.FloorPlanIndicatorID)
            ri.FloorPlanIndicatorID(roomData.FloorPlanIndicatorID());
        if (roomData.XCoord)
            ri.XCoord(roomData.XCoord());
        if (roomData.YCoord)
            ri.YCoord(roomData.YCoord());
        return ri;
    };

    self.filterAvailableBookings = function (data, event) {
        self.availabilityFilterData.RoomName = $('#find-a-room-filter').val().toLowerCase();
        self.availabilityFilterData.FavoritesOnly = $('#favorites-only-chk').prop('checked');

        self.getAvailability();
        return false;
    };

    self.newBooking = function (data, event) {
        if ($('#bookingCart tr').hasClass('booking-editing')) {
            $("#abandon-edit-modal").modal('show');
        } else {
            self.resetSearch();

            $('#specific-room-search').typeahead("val", "");

            $('#main-tabs li a').first().click();
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

    self.validateSearchForm = function () {
        var dateSet = self.filters.date().toString() != "Invalid date" && self.filters.date() != false;
        var startSet = self.filters.start().toString() != "Invalid date" && self.filters.start() != false;
        var endSet = self.filters.end().toString() != "Invalid date" && self.filters.end() != false;
        $('#booking-date input').prop('required', !dateSet)
        var valid = startSet && endSet && dateSet;
        self.showSearchOverlay(valid);
        return valid;
    };

    self.showSearchOverlay = function (timesSet) {
        var notInPast = false;

        if (timesSet && $('#timeZoneDrop').val() != null) {
            var selectedTZ = $.grep(roomRequestModel.templateRules().TimeZones, function (v, i) {
                return v.TimeZoneID == $('#timeZoneDrop').val();
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

        if ((timesSet && notInPast) || DevExpress.devices.real().phone)
            $('#search-filters-overlay').hide();
        else {
            if (vems.roomRequest.pageMode == "ServiceOnlyRequest") {
                $('#search-filters-overlay').height($('#od-room-filters').height());
            } else {
                $('#search-filters-overlay').height($('#search-room-filters').outerHeight() + $('#specific-room-filters').outerHeight());
            }

            $('#search-filters-overlay').show();
        }
    }

    self.buildValidationMessages = function (message, tab) {
        var tabMessage = '';

        if (tab.length > 0) {
            var tabText = $('#main-tabs li[data-type=' + tab + '] a').text();
            tabMessage = vems.roomRequest.requiredTabMessage.replace('{0}', tabText.substring(2, tabText.length));
        }

        return message + ' ' + tabMessage;
    };

    self.validateReservationDetails = function (validateCoreOnly) {
        var errMsgArr = [];

        if (self.cart.bookings().length == 0) {
            errMsgArr.push(self.buildValidationMessages(vems.roomRequest.AtLeastOneRoomIsRequired, 'bookings'));
        }

        if (self.reservationDetails.eventName() == undefined || self.reservationDetails.eventName().length === 0) {
            errMsgArr.push(self.buildValidationMessages(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=event-name]').eq(0).text()), 'details'));
        }

        if ($('#event-type').val() == null || $('#event-type').val().length === 0 || $('#event-type').val() == 0)
            errMsgArr.push(self.buildValidationMessages(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=event-type]').eq(0).text()), 'details'));

        if (!validateCoreOnly) {
            if ($('#availablegroups').val() == null || ($('#availablegroups').val() != null && $('#availablegroups').val().length === 0))
                errMsgArr.push(self.buildValidationMessages(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=availablegroups]').text()), 'details'));

            // handle required contact phone/email (when necessary)
            if ($("#1stContactPhone1").attr('required') == 'required' && !$.trim($('#1stContactPhone1').val())) {
                errMsgArr.push(self.buildValidationMessages(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=1stContactPhone1]').text()), 'details'));
            }
            if ($("#1stContactEmail").attr('required') == 'required' && !$.trim($('#1stContactEmail').val())) {
                errMsgArr.push(self.buildValidationMessages(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=1stContactEmail]').text()), 'details'));
            }

            // handle temporary contacts
            if ($('#1stcontact').val() == 0 && $("#1stContactName").attr('required') == 'required' &&
                ($.trim($('#1stcontact option:selected').text()) === $.trim($("#1stContactName").val()) || $.trim($('#1stContactName').val()) == ""))
                errMsgArr.push(self.buildValidationMessages(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=1stContactName]').text()), 'details'));

            if ($('#2ndcontact').val() == 0 &&
                ($.trim($('#2ndcontact option:selected').text()) === $.trim($("#2ndContactName").val()) || $.trim($('#2ndContactName').val()) == ""))
                errMsgArr.push(self.buildValidationMessages(vems.roomRequest.IsRequiredMessage.replace('{0}', $('[for=2ndContactName]').text()), 'details'));

            if ($('#terms-and-conditions').length === 1 && $('#terms-and-conditions').prop('checked') != true)
                errMsgArr.push(self.buildValidationMessages(vems.roomRequest.IsRequiredMessage.replace('{0}', $('#terms-and-conditions').parent().find('a').text()), 'details'));

            $.each($('#udf-container [required=required]'), function (i, v) {
                if ($(v).hasClass('multiselect-container')) {
                    if ($(v).find('.multiselect-value-label').text().length == 0) {
                        errMsgArr.push(self.buildValidationMessages(vems.roomRequest.IsRequiredMessage.replace('{0}', $(v).parent().find('label').eq(0).text()), 'details'));
                    }
                } else if (!$(v).val() || $(v).val().length == 0) {
                    var labelText = $(v).parent().hasClass('date') ? $(v).parent().parent().find('label').text() : $(v).parent().find('label').text();
                    errMsgArr.push(self.buildValidationMessages(vems.roomRequest.IsRequiredMessage.replace('{0}', labelText), 'details'));
                }
            });
        }

        $.each(self.cart.bookings(), function (i, v) {
            if (v.RoomType && v.RoomType() == 3 && v.TempRoomDescription().length === 0) {
                errMsgArr.push(self.buildValidationMessages(vems.roomRequest.IsRequiredMessage.replace('{0}', $('#bookingCart thead th')[6].innerText), 'cart'));
                return false;
            }
        });

        if (errMsgArr.length === 0)
            return true;
        else {
            var reqErrMsg = '';
            $.each(errMsgArr, function (idx, err) {
                reqErrMsg += err;
                if (idx < errMsgArr.length - 1) {
                    reqErrMsg += '<br/><br/>';
                }
            });
            if (reqErrMsg) {
                vems.showToasterMessage('', reqErrMsg, 'danger');
                return false;
            }
            return false;
        }
    };

    self.validateReservation = function () {
        var bookingsWithZeroSetupCount = $.grep(self.cart.bookings(), function (val) {
            return val.Attendance() <= 0;
        });

        if (bookingsWithZeroSetupCount.length > 0) {
            vems.showToasterMessage('', vems.roomRequest.AttendanceGreaterThanZeroMessage, 'danger');
            return false;
        }

        return true;
    };

    self.responsiveSaveReservation = function (data, events) {
        var tabState = $('#main-tabs li.active').data('type');

        if (vems.roomRequest.pageMode == "EditBooking") {
            self.cart.updateBooking();
            return;
        }

        if (vems.roomRequest.pageMode == "EditPamLocation") {
            self.cart.updateBooking();
            return;
        }

        if (tabState != 'details') { // they're selecting rooms and now attempting to move to step 2
            if (!self.cart.bookings() || self.cart.bookings().length == 0) { // They have not picked a room
                vems.showToasterMessage('', vems.roomRequest.pleaseSelectARoomMessage, 'danger');
                return false;
            }

            $('#main-tabs li[data-type=details] a').click();
            $(document).scrollTop(0);
        } else { // they're trying to create their event, do the validation, etc.
            self.saveReservation();
        }
    };

    self.saveReservation = function (data, events) {
        // we don't need to check for valid reservation details when adding a booking to an existing reservation
        if (vems.roomRequest.pageMode != "AddBooking" && vems.roomRequest.pageMode != "AddPamLocation") {
            var reservationDetailsValid = self.validateReservationDetails();
            var reservationValid = self.validateReservation();

            if (!reservationValid || !reservationDetailsValid) {
                return false;
            }

            if (!vems.bookingServicesVM.validateServices()) {
                $('a[href="#services"]').tab('show');
                return false;
            }
        }

        vems.pageLoading(true);

        if (vems.roomRequest.pageMode == "AddBooking") {
            var data = {
                reservationId: vems.roomRequest.reservationId,
                templateId: self.templateId(),
                cartBookings: self.buildCartBookingsForSave()
            }

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/AddBookings',
                data: JSON.stringify(data),
                success: function (result) {
                    var response = JSON.parse(result.d);
                    if (response.Success) {
                        window.location = vems.roomRequest.breadcrumb.updateLink;
                    }
                    else {
                        var msgArr = response.ErrorMessage.split('\n');
                        for (i = 0; i <= msgArr.length - 1; i++) {
                            vems.showErrorToasterMessage(msgArr[i], 10000);
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
        } else {
            // determine earliest booking from a local perspective, (using booking time, not event time) as this will be used for service order time validation on the server
            var firstBooking = self.cart.bookings()[0];
            $.each(self.cart.bookings(), function (idx, booking) {
                if (moment(firstBooking.LocalStart()).isAfter(moment(booking.LocalStart()))) {
                    firstBooking = booking;
                }
            });

            // adjust SO start/end times for selected time zone (can't use LocalEventStart, because it doesn't exist for Service-Only requests)
            var fbDateMoment = moment(firstBooking.Date());  // date MUST be used when calculating differences to ensure DST changes don't fall within the range
            var minuteBias = firstBooking.SetupMinutes
                ? moment(firstBooking.LocalStart()).year(fbDateMoment.year()).month(fbDateMoment.month()).date(fbDateMoment.date())
                    .diff(moment(firstBooking.Start()).year(fbDateMoment.year()).month(fbDateMoment.month()).date(fbDateMoment.date()), 'minutes') + firstBooking.SetupMinutes()
                : moment(firstBooking.LocalStart()).year(fbDateMoment.year()).month(fbDateMoment.month()).date(fbDateMoment.date())
                    .diff(moment(firstBooking.Start()).year(fbDateMoment.year()).month(fbDateMoment.month()).date(fbDateMoment.date()), 'minutes');
            var sosForSave = ko.mapping.toJS(self.serviceOrders());
            $.each(sosForSave, function (idx, so) {
                // convert service order start/end times to ISO format
                if (so.CategoryTypeCode === 0 /*CAT*/ || so.CategoryTypeCode === 4 /*RSO*/) {
                    if (moment(so.TimeStart).isValid()) {
                        so.TimeStart = moment(so.TimeStart).add(minuteBias, 'minutes').format('YYYY-MM-D HH:mm:ss');
                    } else {  // if time entered is invalid, default to first booking's start time (protects against poor service config)
                        so.TimeStart = moment(firstBooking.LocalStart()).add(firstBooking.SetupMinutes ? firstBooking.SetupMinutes() : 0, 'minutes').format('YYYY-MM-D HH:mm:ss');
                    }

                    if (moment(so.TimeEnd).isValid()) {
                        so.TimeEnd = moment(so.TimeEnd).add(minuteBias, 'minutes').format('YYYY-MM-D HH:mm:ss');
                    } else {  // if time entered is invalid, default to first booking's end time (protects against poor service config)
                        so.TimeEnd = moment(firstBooking.LocalEnd()).subtract(firstBooking.TeardownMinutes ? firstBooking.TeardownMinutes() : 0, 'minutes').format('YYYY-MM-D HH:mm:ss');
                    }
                }
            });

            var data = {
                reservationId: vems.roomRequest.reservationId,
                bookingId: vems.roomRequest.bookingId,
                templateId: self.templateId(),
                pageMode: vems.roomRequest.pageMode,
                cartBookings: self.buildCartBookingsForSave(),
                reservationDetails: self.buildReservationDetailsForSave(),
                files: ko.mapping.toJS(self.reservationDetails.attachments()),
                udfs: self.reservationDetails.userDefinedFields.getUdfsForSave(),
                recurrences: self.buildRecurrencesForSave(self.recurrence),
                serviceOrders: sosForSave
            };

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/SaveReservation',
                data: JSON.stringify(data),
                success: function (result) {
                    self.addCount = 0;
                    var response = JSON.parse(result.d);

                    try {  // trigger custom event to provide reservation creation details (res id, res summary link, etc.)
                        var responseObj = JSON.parse(response.SuccessMessage);
                        $(document).trigger('reservationCreated', [response.Success, responseObj]);
                    } catch (e) { /* don't trigger reservationCreated event when responseObj is invalid (editing a reservation) */ }

                    if (response.Success) {
                        if (vems.roomRequest.pageMode == 'AddPamLocation' || vems.roomRequest.pageMode == 'EditPamLocation') {
                            window.location = response.SuccessMessage;
                            return;
                        }

                        var responseObj = JSON.parse(response.SuccessMessage);

                        if (responseObj.EmailSentMessage && responseObj.EmailSentMessage.length > 0) {
                            $('#email-sent-to-container').text(responseObj.EmailSentMessage);
                        }

                        if (self.templateRules().Parameters.ShowAddToPersonalCalendar) {
                            $('#add-to-calendar-ics-row').show();

                            $('#add-to-calendar-ics-row a').on('click', function (e) {
                                vems.GetICSDownload(0, responseObj.ReservationId, e);
                            });
                        }

                        if (DevExpress.devices.real().phone) {
                            $('#edit-reservation-row').hide();
                        }

                        if (!self.templateRules().Parameters.AllowReservationEdits) {
                            $('#edit-this-reservation-action').hide();
                        }

                        if (!self.templateRules().Parameters.ShowAddToPersonalCalendar && !self.templateRules().Parameters.AllowReservationEdits) {
                            $('#reservation-created-header').hide();
                        }

                        $('#edit-this-reservation-action').prop('href', responseObj.ReservationSummaryLink);

                        var errorMessages = [];
                        if (responseObj.EmailError && responseObj.EmailErrorMsg && responseObj.EmailErrorMsg.length > 0) {
                            errorMessages.push(responseObj.EmailErrorMsg);
                        }
                        if (responseObj.PamError && responseObj.PamErrorMsg && responseObj.PamErrorMsg.length > 0) {
                            errorMessages.push(responseObj.PamErrorMsg);
                        }
                        if (!responseObj.UploadSuccess && responseObj.UploadErrorMessage && responseObj.UploadErrorMessage.length > 0) {
                            errorMessages.push(responseObj.UploadErrorMessage);
                        }
                        if (errorMessages.length > 0) {
                            vems.showToasterMessage('', errorMessages.join('\n'), 'danger');
                        }

                        $("#room-request-container").hide({  // only hide loading overlay AFTER all 'create reservation' content has been hidden
                            complete: function () { vems.pageLoading(false); }
                        });
                        $('#reservation-created-dialog').show();

                        if (responseObj.ServiceOrderViolation) {
                            $('#resource-warning-row').show();
                        }

                        if (responseObj.HasBookingConflict) {
                            $('#conflict-warning-row').show();
                        }

                        //force collapse of sidemenu in desktop view
                        if (!DevExpress.devices.real().phone) {
                            $('#wrapper').css('padding-left', 250);
                            vems.toggleSideBar();
                        }

                        if ($('#pc_VEMSReservationSummaryHelp').length > 0) {
                            $('#pc_VEMSReservationSummaryHelp').click();
                        }
                    } else {
                        var msgArr = response.ErrorMessage.split('\n');
                        for (i = 0; i <= msgArr.length -1; i++) {
                            vems.showErrorToasterMessage(msgArr[i], 10000);
                        }
                        vems.pageLoading(false);
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    self.addCount = 0;
                    console.log(thrownError);
                    vems.pageLoading(false);
                }
            });
        }
    };

    self.resetSearch = function (executeSearch) {
        $('#available-list').find('tbody').empty();
        self.roomResults.removeAll();
        $('#available-list').trigger('update');

        if ($('#book-grid-container').data('bookGrid')) {
            $('#book-grid-container').data('bookGrid').rebuildGrid([], []);
        }

        if (executeSearch) {
            $('#find-a-room-filter-btn').click();
        }
    };

    self.buildCartBookingsForSave = function () {
        var cartBookings = [];

        $.each(self.cart.bookings(), function (i, v) {
            if (v.occurrences && v.occurrences().length > 0) {
                $.each(v.occurrences(), function (oI, occurrence) {
                    var cartBooking = {
                        RoomId: occurrence.RoomId(),
                        Date: moment(occurrence.Date()).format('YYYY-MM-D HH:mm:ss'),
                        Start: moment(occurrence.Start()).format('YYYY-MM-D HH:mm:ss'),
                        End: moment(occurrence.End()).format('YYYY-MM-D HH:mm:ss'),
                        TimeZoneId: occurrence.TimeZoneId(),
                        SetupCount: occurrence.Attendance(),
                        SetupTypeId: occurrence.DefaultSetupTypeId(),
                        RoomType: occurrence.RoomType(),
                        TempRoomDescription: occurrence.TempRoomDescription ? occurrence.TempRoomDescription() : '',
                        IsHost: occurrence.IsHost ? occurrence.IsHost() : false,
                        GmtStart: '',
                        GmtEnd: '',
                    };

                    if (v.GmtStart) {
                        cartBooking.GmtStart = moment(occurrence.GmtStart()).format('YYYY-MM-D HH:mm:ss');
                        cartBooking.GmtEnd = moment(occurrence.GmtEnd()).format('YYYY-MM-D HH:mm:ss');
                        cartBooking.RecordType = occurrence.RecordType();
                    }

                    cartBookings.push(cartBooking);
                });
            } else {
                var cartBooking = {
                    RoomId: v.RoomId ? v.RoomId() : (v.ID) ? v.ID() : (v.RoomID ? v.RoomID() : null),
                    Date: moment(v.Date()).format('YYYY-MM-D HH:mm:ss'),
                    Start: moment(v.Start()).format('YYYY-MM-D HH:mm:ss'),
                    End: moment(v.End()).format('YYYY-MM-D HH:mm:ss'),
                    TimeZoneId: v.TimeZoneId(),
                    SetupCount: v.Attendance(),
                    SetupTypeId: v.DefaultSetupTypeId(),
                    RoomType: v.RoomType ? v.RoomType() : 1,
                    TempRoomDescription: v.TempRoomDescription ? v.TempRoomDescription() : '',
                    IsHost: v.IsHost ? v.IsHost() : false,
                };

                if (v.GmtStart) {
                    cartBooking.GmtStart = moment(v.GmtStart()).format('YYYY-MM-D HH:mm:ss');
                    cartBooking.GmtEnd = moment(v.GmtEnd()).format('YYYY-MM-D HH:mm:ss');

                    if (v.RecordType) {
                        cartBooking.RecordType = v.RecordType();
                    }
                }

                cartBookings.push(cartBooking);
            }
        });

        return cartBookings;
    }

    self.buildRecurrencesForSave = function (recurrence) {
        // list only necessary for PAM recurrence reservations - may not be accurate for reservations with multiple cart items
        var pamRecurrenceArr = [];
        if (roomRequestModel.cart.bookings()[0].occurrences) {
            pamRecurrenceArr = roomRequestModel.cart.bookings()[0].occurrences().map(function (occ) {
                var start = moment(occ.Start());
                var end = moment(occ.End());
                return {
                    Start: moment(occ.Date()).hours(start.hours()).minutes(start.minutes()),
                    End: moment(occ.Date()).hours(end.hours()).minutes(end.minutes())
                };
            });
        }
        return {
            RecurrenceType: recurrence.recurrenceType(),
            Recurrences: pamRecurrenceArr,
            RandomDates: recurrence.randomDates(),
            EndDate: recurrence.endDate(),
            DateType: recurrence.dateType(),
            DailyCount: recurrence.dailyCount(),
            DailyType: recurrence.dailyType(),
            DateCount: recurrence.dateCount(),
            WeeklyCount: recurrence.weeklyCount(),
            WeeklyDays: recurrence.weeklyDays(),
            MonthlyType: recurrence.monthlyType(),
            MonthlyDay: recurrence.monthlyDay(),
            MonthlyCount: recurrence.monthlyCount(),
            MonthlyWeek: recurrence.monthlyWeek(),
            MonthlyWeekDay: recurrence.monthlyWeekDay(),
            MonthlyWeekDayCount: recurrence.monthlyWeekDayCount(),
            IsoStartOfWeek: moment().startOf('week').isoWeekday()  // required to tell server locale of end user
        };
    }

    self.buildReservationDetailsForSave = function () {
        return {
            EventName: self.reservationDetails.eventName(),
            EventTypeId: self.reservationDetails.eventType(),
            Comment: self.reservationDetails.comment(),
            GroupId: self.reservationDetails.ChosenGroupId(),
            FirstContactId: self.reservationDetails.FirstContactId(),
            FirstContactName: self.reservationDetails.FirstContactName(),
            FirstPhoneOne: self.reservationDetails.FirstPhoneOne(),
            FirstPhoneTwo: self.reservationDetails.FirstPhoneTwo(),
            FirstEmail: self.reservationDetails.FirstEmail(),
            SecondContactId: self.reservationDetails.SecondContactId(),
            SecondContactName: self.reservationDetails.SecondContactName(),
            SecondContactPhoneOne: self.reservationDetails.SecondPhoneOne(),
            SecondContactPhoneTwo: self.reservationDetails.SecondPhoneTwo(),
            SecondContactEmail: self.reservationDetails.SecondEmail(),
            BillingReference: self.reservationDetails.billingReference() == 0 ? '' : self.reservationDetails.billingReference(), //ensure 0's are converted to empty string
            PoNumber: self.reservationDetails.poNumber() == 0 ? '' : self.reservationDetails.poNumber(),
            AddReservationToCalendar: self.reservationDetails.addReservationToCalendar(),
            TermsAndConditionsAccepted: self.reservationDetails.termsAndConditionsAccepted(),
            SendInvitation: self.reservationDetails.SendInvitation(),
            TimezoneId: roomRequestModel.filters.timeZoneId(),
            PamMessage: $('#message').htmlarea('html'),//self.reservationDetails.pamMessage()
            PamPrivate: self.reservationDetails.pamPrivate(),
            PamReminderMinutes: self.reservationDetails.pamReminder(),
            PamShowTimeAs: self.reservationDetails.pamShowTimeAs(),
            PamSubject: self.reservationDetails.pamSubject(),
            Attendees: ko.toJS(self.attendees.attendeeList())
        };
    }

    self.fileUploaded = function (e) {
        var resp = JSON.parse(e.jQueryEvent.currentTarget.responseText);
        var arr = self.reservationDetails.attachments();
        var f = $.grep(arr, function (c) {
            return (c.name === e.file.name);
        });
        if (!$.isArray(f) || f.length == 0) {
            arr.push(e.file);
            self.reservationDetails.attachments(arr);
        }
        if (!resp.Success) {
            //e.element.find(".dx-fileuploader-files-container").find(".dx-fileuploader-file-container").each(function (i) {
            //    if ($(this).find(".dx-fileuploader-file-name").html() == e.file.name) {
            //        $(this).find(".dx-fileuploader-file-status-message").html(resp.ErrorMessage);                    
            //    }
            //});

            $("#attachments-panel").find(".attachment-row").each(function (i) {
                if ($(this).find(".filename").html() == e.file.name) {
                    $(this).find(".error").remove();
                    $('<span class="error" style="margin-left: 15px;">Error: ' + resp.ErrorMessage + '</span>').insertAfter($(this).find(".filename"));
                }
            });
        } else {
            $("#attachments-panel").find(".attachment-row").each(function (i) {
                if ($(this).find(".filename").html() == e.file.name) {
                    $(this).find(".error").remove();
                }
            });
        }

        $('#res-attach-loading').fadeOut();
    };

    self.fileUploadError = function (e, uploaderSource) {
        vems.showErrorToasterMessage(fileUploadErrMsg);
        if (uploaderSource && uploaderSource === 'pam') {
            self.removeAttendeeFile(e.file);
        } else {
            self.removeFile(file);
        }

        $('#res-attach-loading').fadeOut();
    };

    self.removeFile = function (file) {
        var arr = self.reservationDetails.attachments();
        var indexnum = $.inArray(file, arr);
        arr.splice(indexnum, 1);
        self.reservationDetails.attachments(arr);

        //we've got to keep the dxuploader in sync with our list
        self.removeFileFromUploadWidget("fileUploader", file);
    };

    self.removeFileFromUploadWidget = function (uploaderDivId, file) {
        var c = $("#" + uploaderDivId).dxFileUploader('instance');
        var files = c.option('values');
        var f = $.grep(files, function (c) {
            return (c.name === file.name);
        });
        if ($.isArray(f) && f.length > 0) {
            indexnum = $.inArray(f[0].value, files);
            files.splice(indexnum, 1);
            c.option('values', files);
        }
    };

    self.attendeeFileUploaded = function (e) {
        var resp = JSON.parse(e.jQueryEvent.currentTarget.responseText);
        var arr = self.reservationDetails.attendeeAttachments();
        var f = $.grep(arr, function (c) {
            return (c.name === e.file.name);
        });
        if (!$.isArray(f) || f.length == 0) {
            arr.push(e.file);
            self.reservationDetails.attendeeAttachments(arr);
        }
        if (!resp.Success) {
            $("#calendaring-details-panel").find(".attachment-row").each(function (i) {
                if ($(this).find(".filename").html() == e.file.name) {
                    $(this).find(".error").remove();
                    $('<span class="error" style="margin-left: 15px;">Error: ' + resp.ErrorMessage + '</span>').insertAfter($(this).find(".filename"));
                }
            });
        } else {
            $("#calendaring-details-panel").find(".attachment-row").each(function (i) {
                if ($(this).find(".filename").html() == e.file.name) {
                    $(this).find(".error").remove();
                }
            });
        }
        //PAM messages are limited to 1 attachment for now
        var f = $("#fileUploaderPAM").dxFileUploader('instance');
        if (arr.length >= 1) {
            f.disabled = true;
            $("#calendaring-details-panel").find(".dx-fileuploader-input-wrapper").hide();
        } else {
            f.disabled = false;
            $("#calendaring-details-panel").find(".dx-fileuploader-input-wrapper").show();
        }

        $('#att-attach-loading').fadeOut();
    };

    self.removeAttendeeFile = function (file) {
        var arr = self.reservationDetails.attendeeAttachments();
        var indexnum = $.inArray(file, arr);
        arr.splice(indexnum, 1);
        self.reservationDetails.attendeeAttachments(arr);
        //PAM messages are limited to 1 attachment for now
        var f = $("#fileUploaderPAM").dxFileUploader('instance');
        if (arr.length >= 1) {
            f.disabled = true;
            $("#calendaring-details-panel").find(".dx-fileuploader-input-wrapper").hide();
        }
        else {
            f.disabled = false;
            $("#calendaring-details-panel").find(".dx-fileuploader-input-wrapper").show();
        }

        //we've got to keep the dxuploader in sync with our list
        self.removeFileFromUploadWidget("fileUploaderPAM", file);
    };

    function prepAndGetFilterValues(additionalFilters) {
        self.availabilityFilterData.TemplateId = self.templateId();
        self.availabilityFilterData.Start = self.filters.start().set('seconds', 0);
        self.availabilityFilterData.End = self.filters.end().set('seconds', 0);

        // recurrence should populate this w/ more than one date
        if (self.recurrence.recurrenceCount() > 0) {
            if (self.recurrence.remainingDates && self.recurrence.remainingDates().length > 0)
                self.availabilityFilterData.Dates = self.recurrence.remainingDates();
            else
                self.availabilityFilterData.Dates = $.map(self.recurrence.recurrences(), function (el) { return el.start._d });
        }
        else
            self.availabilityFilterData.Dates = [moment(self.filters.date())._d];

        self.availabilityFilterData.TimeZoneId = self.filters.timeZoneId();
        self.availabilityFilterData.FilterType = self.setupTypeValidation();
        self.availabilityFilterData.IsPam = false;
        self.availabilityFilterData.BookingId = -1;
        self.availabilityFilterData.IsVCEdit = false;

        self.availabilityFilterData.Cart = [];

        var filterValues = $('#filter-container').data('dynamicFilters').getFilterValueCollection().slice();

        if (additionalFilters && additionalFilters.length > 0) {
            $.merge(filterValues, additionalFilters);
        }

        $.each(filterValues, function (i, v) {
            if (v.filterName === 'Locations' && DevExpress.devices.real().phone && self.filters.locations()) {
                v.value = self.filters.locations();  // use locations value from mobile filter when applicable
            } else {
                if (moment.isMoment(v.value)) {
                    v.value = v.value.toJSON();
                }

                if ($.isArray(v.value)) {
                    v.value = v.value.join(',');
                }
            }
        });

        return filterValues;
    };

    self.getAvailability = function (typeAhead, additionalFilters, scheduleViewCallback) {
        if (!self.validateSearchForm())
            return false;

        self.filteredEditMode(additionalFilters && additionalFilters.length > 0);  // if performing a search with a room id filter, must be in filtered edit mode

        var filterValues = prepAndGetFilterValues(additionalFilters);

        $('#resultsContainer').find('.results-loader').show();

        if (scheduleViewCallback && $.isFunction(scheduleViewCallback)) {
            setListAvailability(self, filterValues, typeAhead, scheduleViewCallback).done(function () {
                $('#resultsContainer').find('.results-loader').hide();
            });
            return false;
        }

        if (self.resultType() == 0 || typeAhead) { // List
            setListAvailability(self, filterValues, typeAhead).done(function () {
                $('#resultsContainer').find('.results-loader').hide();
            });

            if (!typeAhead)
                self.hasResults(true);
        } else if (self.resultType() == 1) { // Schedule
            if (!typeAhead)
                $('#result-filter-row').show();

            if ($('#book-grid-container').data('bookGrid')) { // already initialized
                vems.roomRequest.filterBookings(filterValues, self);
            } else {
                vems.roomRequest.initializeGrid([], vems.browse.startHour, self, filterValues);
            }

            self.hasResults(true);
            $('#resultsContainer').find('.results-loader').hide();
        } else { // floor map
            $('#no-floormap-msg').hide();  // hide 'no floormaps found' message while search is in progress

            if (typeAhead) {
                $.merge(filterValues, [{
                    'filterName': 'BuildingId',
                    'value': self.filters.specificBuildingId(),
                    'displayValue': null,
                    'filterType': parentModel.setupTypeValidation()
                }]);
            }

            self.floormapBuildingId(-1);
            //self.chosenFloorMap(-1);
            $('.floormap-roomfilter-input').typeahead('val', '');

            self.initFloormapRoomFilter(filterValues);
            //right now the floormaps are in the List results, so we have to get those first
            setListAvailability(self, filterValues, typeAhead, null, true).done(function () {
                //rebindJCarousel("floormap-container"); //, self.selectAndShowFloorMap);              

                self.rebindFloormapSelect();
                $('#resultsContainer').find('.results-loader').hide();
                //selectInitialActiveFloormap();
                self.showChosenMap();
            });

            if (!typeAhead)
                self.hasResults(true);
        }
    };

    var origContactChoice;
    self.showAddContactsModal = function () {
        origContactChoice = self.reservationDetails.FirstContactId();
        vems.addAContactVM.show(self.reservationDetails.ChosenGroupId());

    };

    self.getContactsForGroup = function (groupId, templateId, successCallback) {
        var grp;
        $.grep(self.Groups(), function (c) {
            if (c.GroupId() === groupId) {
                grp = c;
                return true;
            }
            return false;
        });

        if (groupId && groupId > 0) {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/GetContactsForGroupTemplate',
                data: JSON.stringify({ groupId: groupId, templateId: templateId, contactsRequired: grp.ContactsRequired() }),
                success: function (result) {
                    var response = JSON.parse(result.d);
                    self.Contacts(response.Contacts);
                    self.AltContacts(response.AlternateContacts);
                    //set defaults for drop downs
                    if (self.Contacts && self.Contacts().length > 0) {
                        var contact = $.grep(self.Contacts(), function (c) {
                            return (c.IsDefault === true);
                        });
                        if ($.isArray(contact) && contact.length > 0) {
                            self.reservationDetails.FirstContactId(contact[contact.length - 1].Id);
                            self.reservationDetails.FirstContactId.valueHasMutated();  // force update to subscribers after setting default (for phone labels)
                        }
                    }
                    if (successCallback) {
                        successCallback();
                    }
                }
            });
        }
    };

    self.onCloseAddGroup = function (groups) {
        ko.mapping.fromJS(groups, {}, self.Groups);
        //self.Groups(groups);
    };

    self.onCloseContactsModal = function () {
        var successCallback = function () {
            if ($.isNumeric(origContactChoice) && self.reservationDetails.FirstContactId() != origContactChoice)
                self.reservationDetails.FirstContactId(origContactChoice);
        }
        self.getContactsForGroup(self.reservationDetails.ChosenGroupId(), self.templateId(), successCallback);
    };

    self.reservationDetails.ChosenGroupId.subscribe(function (newValue) {
        if (newValue && newValue > 0) {
            self.getContactsForGroup(newValue, self.templateId());

            // set BR / PO Number defaults when applicable
            var group = $.grep(self.Groups(), function (grp) {
                return grp.GroupId() === newValue;
            })[0];
            if ($(".PONumber-input.tt-input").data('ems_poLookup') != undefined) {
                $(".PONumber-input.tt-input").data('ems_poLookup').groupId = newValue; //make sure plugin gets updated Groupid
            }
            if (group && group.PONumber() && !$(".PONumber-input").val()) {
                setTimeout(function () {
                    $(".PONumber-input").val(group.PONumber()).trigger('change');
                }, 0);
            }

            if ($(".billingReference-input.tt-input").data('ems_BillingRefLookup') != undefined) {
                $(".billingReference-input.tt-input").data('ems_BillingRefLookup').groupId = newValue; //make sure plugin gets updated Groupid
            }
            if (group && group.BillingReference() && !$(".billingReference-input").val()) {
                setTimeout(function () {
                    $(".billingReference-input").val(group.BillingReference()).trigger('change');
                }, 0);
            }
        }
    });

    self.reservationDetails.FirstContactId.subscribe(function (newValue) {
        if (self.Contacts() && self.Contacts().length > 0) {
            var contact = $.grep(self.Contacts(), function (c) {
                return (c.Id == newValue);
            });
            if ($.isArray(contact) && contact.length > 0) {
                self.reservationDetails.FirstContactName(contact[0].Name);
                self.reservationDetails.FirstPhoneOne(contact[0].PhoneOne);
                self.reservationDetails.FirstPhoneTwo(contact[0].PhoneTwo);
                self.reservationDetails.FirstPhoneOneLabel(contact[0].PhoneOneLabel);
                self.reservationDetails.FirstPhoneTwoLabel(contact[0].PhoneTwoLabel);
                self.reservationDetails.FirstEmail(contact[0].Email);
            }
        }
    });
    self.reservationDetails.SecondContactId.subscribe(function (newValue) {
        if (self.AltContacts() && self.AltContacts().length > 0) {
            var contact = $.grep(self.AltContacts(), function (c) {
                return (c.Id == newValue);
            });
            if ($.isArray(contact) && contact.length > 0) {
                self.reservationDetails.SecondContactName(contact[0].Name);
                self.reservationDetails.SecondPhoneOne(contact[0].PhoneOne);
                self.reservationDetails.SecondPhoneTwo(contact[0].PhoneTwo);
                self.reservationDetails.SecondPhoneOneLabel(contact[0].PhoneOneLabel);
                self.reservationDetails.SecondPhoneTwoLabel(contact[0].PhoneTwoLabel);
                self.reservationDetails.SecondEmail(contact[0].Email);
            }
        }
    });

    self.openMobileLocationsFilter = function () {
        $('#search-room-filters-header a').click();
        //$('#filter-container').data('dynamicFilters').suppressFilterChanged(true);

        $('#filter-container .dynamic-filter-item-add').eq(0).click();

        $('#filterModal').off('hide.bs.modal').on('hide.bs.modal', function () {
            $('#specific-room-filters-header a').click();

            //$('#filter-container').data('dynamicFilters').suppressFilterChanged(false);

            $('#filterModal').off('hide.bs.modal');
        });
    };

    self.setDateTimeDefaults = function (defaults) {
        if (roomRequestModel && $.isFunction(roomRequestModel.templateRules) && roomRequestModel.templateRules().TimeZones && roomRequestModel.templateRules().TimeZones.length > 0) {
            // set up default date with current time in selected time zone
            var initDateTime = moment(roomRequestModel.filters.date()).hours(moment().hour()).minutes(moment().minutes()).seconds(0).milliseconds(0);
            var selectedTz = $.grep(roomRequestModel.templateRules().TimeZones, function (v, i) {
                return v.TimeZoneID === defaults.timeZoneId;
            })[0];
            var selectedTzOffset = selectedTz ? selectedTz.MinuteBias : roomRequestModel.templateRules().TimeZones[0].MinuteBias;  // if no default tz, use first tz available in list
            initDateTime.add(selectedTzOffset - moment().utcOffset(), 'minutes');

            // set up default start and end times
            var defaultStart = moment(defaults.start).year(initDateTime.year()).month(initDateTime.month()).date(initDateTime.date());
            var defaultEnd = moment(defaults.end).year(initDateTime.year()).month(initDateTime.month()).date(initDateTime.date());
            defaultEnd.add(defaultEnd.isBefore(defaultStart) ? 1 : 0, 'day');  // move date to next day when it's an overnight default

            // boolean for default date/time logic
            var isFutureDate = moment().add(selectedTzOffset - moment().utcOffset(), 'minutes').isBefore(initDateTime);  // check if current time in selected tz is before default date

            // adjust default start time, end time, and date according to business rules
            if (vems.roomRequest.startConfigured && vems.roomRequest.endConfigured && !isFutureDate) {  // both start and end time defaults set and default date is today
                if (initDateTime.isAfter(defaultEnd)) {  // start and end times have passed - adjust everything to the next day
                    initDateTime.add(1, 'day');
                    defaultStart.add(1, 'day');
                    defaultEnd.add(1, 'day');
                } else if (initDateTime.isAfter(defaultStart)) {  // start time has passed, but end time hasn't
                    var newStart = moment(initDateTime).add(30 - initDateTime.minutes() % 30, 'minutes');  // get nearest 'current' half hour (in selected tz time)
                    if (newStart.isBefore(defaultEnd)) {
                        defaultStart = newStart;
                    } else {  // if nearest 'current' half hour is equal to (or after) default end time, adjust everything to the next day
                        initDateTime.add(1, 'day');
                        defaultStart.add(1, 'day');
                        defaultEnd.add(1, 'day');
                    }
                }
            } else if (vems.roomRequest.startConfigured && !vems.roomRequest.endConfigured) {  // just start time default set
                if (initDateTime.isAfter(defaultStart) && !isFutureDate) {  // if start time has passed, set to nearest 'current' half hour (in selected tz time)
                    defaultStart = moment(initDateTime).add(30 - initDateTime.minutes() % 30, 'minutes');
                }
                defaultEnd = moment(defaultStart).add(1, 'hour');
            } else if (vems.roomRequest.endConfigured && !vems.roomRequest.startConfigured) {  // just end time default set
                if (isFutureDate) {  // if default date is in the future, default the start time to midnight on that day
                    defaultStart.hours(0).minutes(0);
                } else {  // if default date is today, try to set the start time to the nearest 'current' half hour (in selected tz time)
                    var startForEndDefault = moment(initDateTime).add(30 - initDateTime.minutes() % 30, 'minutes');
                    if (moment(startForEndDefault).add(1, 'hour').isAfter(defaultEnd)) {  // if nearest half hour (+1 hr) is after end time, skip to midnight of the next day
                        initDateTime.add(1, 'day');
                        defaultStart.add(1, 'day').hours(0).minutes(0);
                    } else {
                        defaultStart = startForEndDefault;
                    }
                }
                defaultEnd = moment(defaultStart).add(1, 'hour');
            } else if (!vems.roomRequest.endConfigured && !vems.roomRequest.startConfigured) {  // no default times set
                defaultStart = moment(initDateTime).add(30 - initDateTime.minutes() % 30, 'minutes');  // set start to nearest 'current' half hour (in selected tz time)
                defaultEnd = moment(defaultStart).add(1, 'hour');

                // skip date to next day when default start is midnight
                if (defaultStart.hours() === 0 && defaultStart.minutes() === 0) {
                    initDateTime.add(1, 'day');
                }
            }

            // reset filter values to adjusted default date and start/end times
            var minDate = moment(roomRequestModel.getTemplateMinDate());  // adjust for potential new booking cutoff date restriction missed during time zone adjustment
            roomRequestModel.filters.date(moment(initDateTime.isBefore(minDate) ? minDate : initDateTime).hours(0).minutes(0));
            roomRequestModel.filters.start(defaultStart);
            roomRequestModel.filters.end(defaultEnd);
            return true;
        }

        return false;
    };

    // show abandon action modals when they try to leave a tab
    $('#main-tabs a, #cart-header-container').on('click', function (e) {
        if ($(this).attr('href') == '#bookings')
            return;

        if (self.recurrence.cartObject) {
            $('#skip-occurrences-modal').modal('show');

            e.preventDefault();
            return false;
        }

        if (self.cart.bookingEditing() != null) {
            $('#abandon-edit-modal').modal('show');

            e.preventDefault();
            return false;
        }

        if (vems.roomRequest.pageMode == "ServiceOnlyRequest") {
            if (!self.fillServiceOnlyServices()) {
                return false;
            }
        }
    });
};

function setListAvailability(self, filterValues, typeAhead, scheduleViewCallback, inclFloorMaps) {
    if (!inclFloorMaps) { inclFloorMaps = false; }

    var filterData = jQuery.extend(true, {}, self.availabilityFilterData);
    filterData.Start = filterData.Start.format('YYYY-MM-D HH:mm:ss');
    filterData.End = filterData.End.format('YYYY-MM-D HH:mm:ss');

    for (var i = 0; i < filterData.Dates.length; i++) {
        filterData.Dates[i] = moment(filterData.Dates[i]).format('YYYY-MM-D HH:mm:ss');
    }

    return vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetAvailabilityList',
        data: JSON.stringify({ searchData: filterData, filterData: { filters: filterValues }, includeFloorMaps: inclFloorMaps }),
        success: function (result) {
            if (!result.d) {
                vems.showToasterMessage('', vems.browse.genericErrorMessage, 'danger');
                return false;
            }

            $('#result-filter-row').show(); // this could be hidden if they selected an unavailable room from the typeAhead

            var response = JSON.parse(result.d);

            var favoriteSort = function (rooms) {
                // sort favorites to the top
                rooms.sort(function (a, b) {
                    var aVal = parseInt(a.Favorite, 10);
                    var bVal = parseInt(b.Favorite, 10);

                    if (aVal < bVal)
                        return 1;

                    if (aVal > bVal)
                        return -1;

                    return 0;
                });
            };
            var buildMobileRoomObject = function (val) {
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
            };

            if (typeAhead) {
                var rooms = $.map(response.Availability, function (val, i) {
                    if (val.RoomDescription.toLowerCase().indexOf(typeAhead.qry.toLowerCase()) >= 0) {
                        var inCart = $.grep(self.cart.bookings(), function (booking) {
                            return self.roomMatchesCart(booking.ID ? booking.ID : booking.RoomId, val.RoomId, booking.Date, booking.Start, booking.End);
                        });

                        if (DevExpress.devices.real().phone && val.UnavailableReason != 0) {
                            return;
                        }

                        // skip records that are already in the cart or not available for all days
                        var availForAllDays = self.recurrence.recurrenceCount() > 0 ? (val.DaysAvailable === self.recurrence.recurrenceCount()) : true;
                        if (inCart.length === 0 && availForAllDays) {
                            return buildMobileRoomObject(val);
                        }
                    }
                });

                favoriteSort(rooms);

                typeAhead.asyncCall(rooms);

                return false;
            } else if (DevExpress.devices.real().phone) { // using the search on a device
                var rooms = $.map(response.Availability, function (val, i) {
                    // filter out things that don't match the filter selections
                    if (!val.RoomTypeMatch || !val.SetupTypeMatch || !val.FloorMatch || !val.FeatureMatch || val.UnavailableReason != 0) {
                        return;
                    }

                    var inCart = $.grep(self.cart.bookings(), function (booking) {
                        return self.roomMatchesCart(booking.ID ? booking.ID : booking.RoomId, val.RoomId, booking.Date, booking.Start, booking.End);
                    });

                    if (inCart.length === 0) { // skip records that area already in the cart
                        return buildMobileRoomObject(val);
                    }
                });

                favoriteSort(rooms);


                vems.roomRequest.responsiveViewModel.responsiveSearchResults(rooms);

                var reservableRooms = new Array();
                var requestableRooms = new Array();

                $.each(rooms, function (i, v) {
                    if (v.RecordType == 2) { // request
                        requestableRooms.push(v);
                    } else { // reserve
                        reservableRooms.push(v);
                    }
                });

                vems.roomRequest.responsiveViewModel.responsiveReservableSearchResults(reservableRooms);
                vems.roomRequest.responsiveViewModel.responsiveRequestableSearchResults(requestableRooms);

                if (rooms.length > 0) {
                    $('#responsive-search-list .no-results').hide();
                } else {
                    $('#responsive-search-list .no-results').show();
                }

                if ($.grep(filterValues, function (v) { return v.filterName == "RoomId" }).length === 0) {

                    $('#responsive-search-back').off('click').on('click', function () {
                        $('#page-title-responsive h1').removeClass('title-highlight');
                        $('#room-request-container').show();
                        $('#responsive-actions-top-container').removeClass('hidden-xs').addClass('visible-xs');

                        $('#responsive-search-list').hide();
                    });

                    $('#page-title-responsive h1').addClass('title-highlight');
                    $('#room-request-container').hide();
                    $('#responsive-actions-top-container').removeClass('visible-xs').addClass('hidden-xs');

                    $('#responsive-search-list').show();
                }
                return false;
            }

            var resultItemMapping = {
                create: function (options) {
                    var vm = ko.mapping.fromJS(options.data);

                    vm.Match = ko.pureComputed(function () {
                        if (options.data.UnavailableReason !== 0 && options.data.UnavailableReason !== 9999)
                            return 0;

                        var matchCount = 0;

                        if (options.data.FloorMatch)
                            matchCount++;
                        if (options.data.RoomTypeMatch)
                            matchCount++;
                        if (options.data.SetupTypeMatch)
                            matchCount++;
                        if (options.data.CapacityMatch)
                            matchCount++;
                        if (options.data.FeatureMatch)
                            matchCount++;

                        return (matchCount / 5) * 100;
                    });

                    return vm;
                }
            };

            var existingItemIndices = [];
            for (var i = 0; i < response.Availability.length; i++) {
                var rmId = ko.isObservable(response.Availability[i].RoomId) ? response.Availability[i].RoomId() : response.Availability[i].RoomId;
                var daysAvail = ko.isObservable(response.Availability[i].DaysAvailable) ? response.Availability[i].DaysAvailable() : response.Availability[i].DaysAvailable;
                //if there are bookings with recurrences, we need to check each room within the occurences
                if (self.cart.bookings().length > 0 && self.recurrence.recurrenceCount() > 0) {
                    $.each(self.cart.bookings(), function (bindex, booking) {
                        if (booking.occurrences && booking.occurrences().length > 0) {
                            for (var o = 0; o < booking.occurrences().length; o++) {
                                var occ = booking.occurrences()[o];
                                if (self.roomMatchesCart(occ.RoomId(), rmId, occ.Date(), occ.Start(), occ.End())) {
                                    //daysavailable is coming from db, if it's pam and the rooms match just remove from availability list
                                    if (self.templateRules().AllowInvitations || (daysAvail == occ.DaysAvailable() || booking.occurrences().length == occ.DaysAvailable())) {
                                        if ($.inArray(existingItemIndices, i) <= 0)
                                            existingItemIndices.push(i);  //this will be removed from avail list below
                                        break;
                                    } else {
                                        response.Availability[i].DaysAvailable = ko.observable(booking.occurrences().length - occ.DaysAvailable());
                                    }
                                }
                            }
                        } else {  // it's a single booking in the cart along with a recurrence
                            if (self.roomMatchesCart(booking.RoomId(), rmId, booking.Date(), booking.Start(), booking.End())) {
                                existingItemIndices.push(i);
                            }
                        }
                    }); //end $.each
                } else {
                    var inCart = $.grep(self.cart.bookings(), function (booking) {
                        return self.roomMatchesCart(booking.RoomId(), rmId, booking.Date(), booking.Start(), booking.End());
                    });
                    if (inCart.length > 0) {
                        if (vems.roomRequest.pageMode == 'EditBooking') {
                            existingItemIndices.push(i);  //builds the array for later removing the items from the list
                        } else {
                            // just set UnavailableReason property when room is in cart - don't remove it from the list
                            var availObj = response.Availability[i];
                            if ($.isFunction(availObj.UnavailableReason)) {
                                availObj.UnavailableReason(9999);
                            } else {
                                availObj.UnavailableReason = 9999;
                            }
                            availObj.cartObj = inCart[0];
                        }
                    }
                }

                response.Availability[i] = ko.mapping.fromJS(response.Availability[i], resultItemMapping);
            }

            if (existingItemIndices.length > 0) {
                existingItemIndices.reverse();

                for (var i = 0; i < existingItemIndices.length; i++) {
                    response.Availability.splice(existingItemIndices[i], 1);
                }
            }

            if (response.FloorMaps) {
                ko.mapping.fromJS(response.FloorMaps, {}, self.floorMaps);

                var filterList = filterFloormapImagesByAvailability(self.floorMaps(), response.Availability);
                self.floorMaps(filterList);

                //build distinct floor/bldg list
                var flist = []
                var floors = [-1];
                $.each(filterValues, function (i, v) {
                    if (v.filterName == 'Floors' && v.value) {
                        floors = v.value.split(',');
                    }
                });

                $.each(self.floorMaps(), function (i, v) {
                    var barr = $.grep(flist, function (b, index) {
                        return (v.BuildingID() == b.BuildingID() && v.ImageId() == b.ImageId());
                    });
                    if (!$.isArray(barr) || ($.isArray(barr) && barr.length == 0)) {
                        if (floors.length > 0 && floors[0] != -1) {
                            for (var i = 0; i < floors.length; i++) {
                                if (parseInt(floors[i]) == v.FloorID()) {
                                    flist.push(v);
                                }
                            }
                        }
                        else
                            flist.push(v);
                    }
                });
                self.floorMaps(flist);

                //build buildings list
                var blist = [{
                    BuildingID: ko.observable(-1),
                    BuildingDescription: ko.observable("Select A Building"),
                }];
                $.each(self.floorMaps(), function (i, v) {
                    var barr = $.grep(blist, function (b, index) {
                        return (v.BuildingID() == b.BuildingID());
                    });
                    if (!$.isArray(barr) || ($.isArray(barr) && barr.length == 0)) {
                        blist.push(v);
                    }
                });
                self.floormapBuildings(blist);

                self.floormapImages(self.floorMaps());

                //this ensures the initial tab is showing the filters
                $('#floormap-filters').show();
                $('#list-room-filter').hide();
            }

            if (scheduleViewCallback && $.isFunction(scheduleViewCallback)) {
                scheduleViewCallback(response);
                return false;
            }

            // clear the table before rebinding so the sorter doesn't duplicate records
            $('#available-list').find('tbody').empty();

            self.roomResults(response.Availability);
            self.roomConflicts(response.Conflict);

            $('#available-list tbody tr[data-recordType=1]').eq(0).before('<tr class="requestreserve-header-row"><td colspan="10"><span>' + vems.roomRequest.roomsYouCanReserveLabel + '</span></td><td style="display: none;">0</td></tr>');
            $('#available-list tbody tr[data-recordType=2]').eq(0).before('<tr class="requestreserve-header-row"><td colspan="10"><span>' + vems.roomRequest.roomsYouCanRequestLabel + '</span></td><td style="display: none;">1.5</td></tr>');
            //self.roomResults.push(ko.mapping.fromJS({ Id: -1, RoomCode: 'Res', RoomDescription: 'Res', BuildingCode: 'Res', BuildingDescription: 'Res', Floor: '', TimeZone: '', Capacity: '', UnavailableReason: 99, FloorPlanIndicatorID: 0, DaysAvailable: 0, Match: 100, RecordType: -1 }));
            //self.roomResults.push(ko.mapping.fromJS({ Id: -1, RoomCode: 'Req', RoomDescription: 'Req', BuildingCode: 'Req', BuildingDescription: 'Req', Floor: '', TimeZone: '', Capacity: '', UnavailableReason: 99, FloorPlanIndicatorID: 0, DaysAvailable: 0, Match: 100, RecordType: 1.5 }));

            $('#remaining-dates-popover').popover();

            if (self.recurrence.recurrenceCount() > 0)
                $('#available-list').data('tablesorter').sortList = [[10, 0], [3, 1]]; // available columns
            else
                $('#available-list').data('tablesorter').sortList = [[10, 0], [9, 1]];

            $('#available-list').trigger('update');

            if ($('#book-grid-container').data('bookGrid'))
                $('#book-grid-container').data('bookGrid').rebuildGrid([], [])
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
};

function filterFloormapImagesByAvailability(floormapArr, roomListArr) {

    //filter room list for only rooms that have floormapindicator
    var filtered = $.grep(roomListArr, function (b, index) {
        return (b.FloorPlanIndicatorID() != null);
    });
    var newFPlist = [];
    var roomsUsed = [];
    //filter floormaps with room list
    newFPlist = $.map(floormapArr, function (v, i) {
        var barr = $.grep(filtered, function (b, index) {
            return (v.BuildingID() == b.BuildingId() && v.FloorID() == b.FloorID() && v.ImageId() == b.ImageId());
        });
        if ($.isArray(barr) && barr.length > 0 && $.inArray(barr[0].RoomId(), roomsUsed) < 0) {
            roomsUsed.push(barr[0].RoomId());
            return v;
        }
    });
    return newFPlist;
}

function filterViewModel(defaults, parentModel) {
    var self = this;

    self.date = ko.observable(moment(defaults.date));
    self.start = ko.observable(moment(defaults.start));
    self.end = ko.observable(moment(defaults.end));
    self.timeZoneId = ko.observable(defaults.timeZoneId);
    self.locations = ko.observable(defaults.locations);
    self.floors = ko.observable(defaults.floors);
    self.setupTypes = ko.observable(defaults.setupTypes);
    self.roomTypes = ko.observable(defaults.roomTypes);
    self.features = ko.observable(defaults.features);
    self.capacity = ko.observable(defaults.capacity);
    self.specificBuildingId = ko.observable(defaults.buildingId);

    self.date.subscribe(function (newValue) {
        var editMode = !!parentModel.cart.bookingEditing();

        if (!DevExpress.devices.real().phone) {
            if (editMode && parentModel.filteredEditMode()) {
                parentModel.getAvailability(false, [{
                    'filterName': 'RoomId',
                    'value': parentModel.cart.bookingEditing().RoomId(),
                    'displayValue': null,
                    'filterType': parentModel.setupTypeValidation()
                }]);
            } else if (parentModel.hasResults() && !parentModel.cart.supressSubscriptionUpdatesForDateTime) {
                parentModel.getAvailability();
            }
        }

        if (typeof (validateTimeFields) !== 'undefined') {
            validateTimeFields();  // re-trigger time validation after date changes
        }
        parentModel.validateSearchForm();
    });

    self.start.subscribeChanged(function (newValue, oldValue) {
        var suppressUpdateForStartChange = false;
        var editMode = !!parentModel.cart.bookingEditing();

        if (newValue) {
            suppressUpdateForStartChange = true;

            // maintain time difference between end and start when changing values - selected date must be used to avoid DST issues during calculation
            var selYear = self.date().year();
            var selMonth = self.date().month();
            var selDate = self.date().date();
            var newValMoment = moment(newValue).year(selYear).month(selMonth).date(selDate);
            var oldValMoment = moment(oldValue).year(selYear).month(selMonth).date(selDate);
            var minuteDuration = moment(self.end()).year(selYear).month(selMonth).date(selDate).diff(oldValMoment, 'minutes');
            self.end(newValMoment.add(minuteDuration, 'minutes'));
        }

        if (!DevExpress.devices.real().phone && !editMode && !newValue.isSame(oldValue)) {
            if (!suppressUpdateForStartChange && parentModel.hasResults() && !parentModel.cart.supressSubscriptionUpdatesForDateTime) {
                parentModel.getAvailability();
            }
        }

        parentModel.validateSearchForm();
    });

    self.end.subscribeChanged(function (newValue, oldValue) {
        var editMode = !!parentModel.cart.bookingEditing();

        if (!DevExpress.devices.real().phone && !editMode && !newValue.isSame(oldValue)) {
            if (parentModel.hasResults() && !parentModel.cart.supressSubscriptionUpdatesForDateTime)
                parentModel.getAvailability();
        }

        parentModel.validateSearchForm();
    });

    self.timeZoneId.subscribe(function (newValue) {
        parentModel.validateSearchForm();
        if (vems.roomRequest && vems.roomRequest.pageMode && vems.roomRequest.pageMode === "EditPamLocation" && typeof(validateTimeFields) !== 'undefined') {
            validateTimeFields();  // re-perform time validation after tz id set on EditPamLocation page load (b/c change isn't triggered when dropdown is disabled)
        }
    });
}

function attendeeViewModel(data) {
    var self = this;
    self.minuteIncrementsForDisplay = 15;
    self.timezoneId = 0;
    self.attendeeList = ko.observableArray([]);  //List<PAMAttendee>
    self.attendeeListChanged = ko.observable(false);
    self.attendeeRefreshCallback = function () { };

    self.GetAttendeeAvailability = function (typeahead, bIncludeUser) {
        bIncludeUser = (bIncludeUser) ? bIncludeUser : true;  //default to true

        var startDate = roomRequestModel.filters.date().isValid() ? roomRequestModel.filters.date() : moment(Date.now());
        self.timezoneId = roomRequestModel.filters.timeZoneId();

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

    self.initializeAttendeeGrid = function (screenText) {

        var filterValues = roomRequestModel.filters;
        self.timezoneId = roomRequestModel.filters.timeZoneId();

        $('#attendee-grid-container').attendeeGrid({
            attendees: self.attendeeList,
            timezoneId: self.timezoneId,
            timeIncrement: self.minuteIncrementsForDisplay,
            useCalculatedHeight: false,
            recurrenceExists: (roomRequestModel.recurrence.recurrenceCount() > 0),
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
            {
                name: vems.browse.NoInfoLabel, color: '#DCDEE0', 'itemClass': 'attendee-noinfo'
            }
            ],
            ScreenText: screenText.ScreenText,
            bookOptions: {
                bookStartDate: Date.now(),
                startHour: vems.browse.startHour,
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
            var startDate = roomRequestModel.filters.date().isValid() ? roomRequestModel.filters.date() : moment(Date.now());
            self.timezoneId = roomRequestModel.filters.timeZoneId();
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
        }
        self.attendeeList(arr);
        self.rebuildAttendeeGrid();

        self.attendeeListChanged(true);
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
        }
        self.attendeeList(arr);
        self.attendeeRefreshCallback();

        self.attendeeListChanged(true);
    };

    self.rebuildAttendeeGridCallback = function () { };
    self.rebuildAttendeeGrid = function () {
        if ($('#attendee-grid-container').data('attendeeGrid')) {
            //let the attendance grid know it has switched to recurring.
            $('#attendee-grid-container').data('attendeeGrid').recurrenceExists = (roomRequestModel.recurrence.recurrenceCount() > 0 || roomRequestModel.cart.HasRecurrences());
            $('#attendee-grid-container').data('attendeeGrid').setHighlightBoxMinutes(createHighlightBoxMinutes(roomRequestModel.filters));
            $('#attendee-grid-container').data('attendeeGrid').rebuildGrid(roomRequestModel.attendees.attendeeList);
            $('#attendeeLookup').val('');
        }
    };
};

function recurrenceViewModel(defaults) {
    var self = this;

    self.recurrenceTypes = ko.observableArray([]);
    self.recurrenceType = ko.observable();
    self.recurrenceTypeInUse = ko.observable();
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

    self.date = ko.observable(moment(defaults.date));
    self.endDate = ko.observable(moment(defaults.date).add(1, 'days'));
    self.dateType = ko.observable('enddate');
    self.dateCount = ko.observable(1);
    self.start = ko.observable(moment(defaults.start));
    self.end = ko.observable(moment(defaults.end));
    self.timeZoneId = ko.observable(defaults.timeZoneId);

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

    self.start.subscribe(function (newValue) {
        if (newValue) {
            self.end(moment(newValue).add(1, 'hour'));
        }
        self.updateRecurrenceCount();
    });

    self.end.subscribe(function (newValue) {
        self.updateRecurrenceCount();
    });

    self.date.subscribe(function (newValue) {
        var endDate = moment(self.endDate());
        if (newValue && (moment(newValue).isAfter(endDate)) || !endDate.isValid()) {
            self.endDate(moment(newValue).add(1, 'days'));
        }
        self.updateRecurrenceCount();
    });

    self.endDate.subscribe(function (newValue) {
        self.dateCount(1);  // reset 'end after' occurrence count
        if (moment(newValue).isBefore(self.date())) {
            self.date(moment(newValue));
        }
        self.updateRecurrenceCount();
        self.dateType('enddate');  // select the 'enddate' option
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
            roomRequestModel.attendees.attendeeRefreshCallback();
        }
    };

    self.generateRecurrence = function (apply) {  // apply = boolean telling whether or not to actually apply recurrence
        self.tempRecurrences.removeAll();
        if (!apply && self.dateType() === 'endafter') {
            return false;
        }  // don't update display when 'end after' date type selected

        var startDate = moment(self.date());
        var endDate = moment(self.endDate());
        var tempEndDate = moment(endDate);

        var endNextDay = moment(self.end()).isBefore(moment(self.start()));
        var adjustedEnd = endNextDay ? moment(self.end()).add(1, 'days') : moment(self.end());
        var bookLength = moment.duration(adjustedEnd.diff(moment(self.start()))).asMinutes();

        startDate.hours(self.start().hours());
        startDate.minutes(self.start().minutes());

        endDate.hours(self.end().hours());
        endDate.minutes(self.end().minutes());
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
                    var bookStart = moment(el, 'YYYY-MM-D').hours(startDate.hours()).minutes(startDate.minutes());
                    var bookEnd = moment(bookStart).add(bookLength, 'minutes');
                    self.tempRecurrences.push({ start: bookStart, end: bookEnd });
                });

                if (apply) {
                    // set filter start/end dates based on min/max moments in recurrences array
                    var randomMomentArr = $.map(self.tempRecurrences(), function (el) { return el.start; });
                    self.date(moment.min(randomMomentArr));
                    tempEndDate = moment.max(randomMomentArr);
                }
                break;
        }

        if (apply) {
            self.recurrences(self.tempRecurrences().slice());
            var origEndDate = self.endDate();
            var origDateType = self.dateType();
            var origDateCount = self.dateCount();
            self.endDate(moment(tempEndDate));  // set new end date for validation

            if (!self.validateTemplateRules()) {
                self.recurrences.removeAll();
                self.endDate(origEndDate);  // reset end date if validation failed

                if (origDateType === 'endafter') {  // reset date count when end date subscription overwrites it
                    self.dateCount(origDateCount);
                }
                return false;
            }

            if (origDateType === 'endafter') {  // reset date count when end date subscription overwrites it
                self.dateCount(origDateCount);
            }

            self.recurrenceTypeInUse(self.recurrenceType());  // save newly-applied recurrence type

            // update room request filter, availability, and attendee data after successful application of recurrence
            roomRequestModel.filters.date(moment(self.date()));
            roomRequestModel.filters.start(moment(self.start()));
            roomRequestModel.filters.end(moment(self.end()));
            roomRequestModel.filters.timeZoneId(self.timeZoneId());
            roomRequestModel.availabilityFilterData.Dates = $.map(self.recurrences(), function (el) { return el.start._d; });
            roomRequestModel.attendees.rebuildAttendeeGrid();

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

    self.removeRecurrence = function (resetDefaults) {
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

        if (resetDefaults) {  // reset default recurrence values when necessary
            self.recurrenceType(self.recurrenceTypes()[0].value);
            self.recurrenceTypeInUse(self.recurrenceType());
            self.dailyType('everydays');
            self.dailyCount(1);
            self.weeklyCount(1);
            self.weeklyDays([]);
            self.monthlyType('everymonths');
            self.monthlyDay(moment().date());
            self.monthlyCount(1);
            self.monthlyWeek(1);
            self.monthlyWeekDay(0);
            self.monthlyWeekDayCount(1);
            self.dateCount(1);
            self.date(moment(roomRequestModel.filters.date()));
            self.endDate(moment(defaults.date).add(1, 'days'));
            self.dateType('enddate');
            self.start(moment(roomRequestModel.filters.start()));
            self.end(moment(roomRequestModel.filters.end()));
            self.timeZoneId(roomRequestModel.filters.timeZoneId());
        }

        roomRequestModel.attendees.rebuildAttendeeGrid();
        if ($('#find-a-room-filter-btn').is(':visible')) {
            $('#find-a-room-filter-btn').click();
        }
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

        if (!moment(roomRequestModel.filters.date()).isValid()) {
            errMsgArr.push(vems.roomRequest.enterValidStartDate);
        }
        if (self.dateType() === 'enddate' && !moment(self.endDate()).isValid()) {
            errMsgArr.push(vems.roomRequest.enterValidEndDate);
        }
        if (self.dateType() === 'endafter' && !self.dateCount()) {
            errMsgArr.push(vems.roomRequest.enterValidAfterOccurrences);
        }
        if (!moment(roomRequestModel.filters.start()).isValid()) {
            errMsgArr.push(vems.roomRequest.enterValidStartTime);
        }
        if (!moment(roomRequestModel.filters.end()).isValid()) {
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
        var maxBookings = (roomRequestModel.templateRules().NumberOfAllowedBookingsBeforeLastAllowedDate > 0
            && roomRequestModel.templateRules().NumberOfAllowedBookingsBeforeLastAllowedDate < roomRequestModel.templateRules().MaxBookings)
                ? roomRequestModel.templateRules().NumberOfAllowedBookingsBeforeLastAllowedDate
                : roomRequestModel.templateRules().MaxBookings;
        if (maxBookings > 0 && self.recurrenceCount() > maxBookings) {
            errMsgArr.push(vems.roomRequest.templateMaxBookings.replace('{0}', '<b>' + maxBookings + '</b>'));
        }

        var maxDate = roomRequestModel.getTemplateMaxDate();
        if (maxDate.year() > 1900 && self.endDate().isAfter(moment(maxDate))) {
            errMsgArr.push(vems.roomRequest.templateMaxDate.replace('{0}', '<b>' + maxDate.format('ddd MMM D, YYYY') + '</b>'));
        }

        var minDate = roomRequestModel.getTemplateMinDate();
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
        displayStr = displayStr.replace('{4}', roomRequestModel.filters.date().format('ddd MMM D, YYYY'));
        displayStr = displayStr.replace('{3}', self.endDate().format('ddd MMM D, YYYY'));
        displayStr = displayStr.replace('{2}', roomRequestModel.filters.start().format('LT'));
        displayStr = displayStr.replace('{1}', roomRequestModel.filters.end().format('LT'));
        displayStr = displayStr.replace('{0}', $.grep(roomRequestModel.timeZones(), function (el) {
            return roomRequestModel.filters.timeZoneId() === el.TimeZoneID
        })[0].TimeZone);

        var occurrences = self.remainingDates && self.remainingDates().length > 0
            ? '(' + self.remainingDates().length + ')'
            : ' (' + self.recurrenceCount() + ' ' + (self.recurrenceCount() === 1 ? vems.roomRequest.occurrenceText : vems.roomRequest.occurrencesText) + ')';

        return {
            pattern: displayStr, occurrences: occurrences
        };
    };

    $('#recurrence-modal').off('shown.bs.modal').on('shown.bs.modal', function () {
        // set default dates/times based on current selection from reservation date & time section
        self.date(moment(roomRequestModel.filters.date()));
        self.start(moment(roomRequestModel.filters.start()));
        self.end(moment(roomRequestModel.filters.end()));
        self.timeZoneId(roomRequestModel.filters.timeZoneId());
        $('#recurrence-pattern-dropdown').focus();  // focus on 'Repeats' dropdown when modal shown

        if (vems.roomRequest && vems.roomRequest.pageMode && vems.roomRequest.pageMode == "ServiceOnlyRequest") {
            $('#recurrence-tz').prop('disabled', 'disabled');
        }
    });
    $('#recurrence-modal').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        self.recurrenceType(self.recurrenceTypeInUse());  // re-select applied type after closing the modal
    });
}

function BookingCartViewModel(parentModel) {
    var self = this;
    self.bookings = ko.observableArray();

    self.bookingEditing = ko.observable(null);
    self.bookingEditingOriginalData = ko.observable(null);

    // We need to be able to supress subscription based availability updates when we need to trigger manual changes to date/time
    self.supressSubscriptionUpdatesForDateTime = false;

    self.showUnavailableToast = function (unavailableReason) {
        //NoTimeZone = 1,
        //Exceeds24Hours = 2,
        //CutoffTimeRestriction = 3,
        //CutoffHoursRestriction = 4,
        //InPast = 5,
        //BuildingHoursStartViolation = 6,
        //BuilingHoursEndViolation = 7,
        //BuildingClosure = 8,
        //NumberOfBookingsPerDate = 11

        vems.showToasterMessage('', unavailableReason, 'danger');
    };

    self.roomIsInCart = function (roomId) {
        var roomMatches = $.grep(self.bookings(), function (val) {
            return val.RoomId = roomId;
        });

        return roomMatches > 0;
    };

    self.HasRecurrences = ko.computed(function () {
        var bHasRecurrence = false;
        var at = $.grep(self.bookings(), function (c) {
            if (bHasRecurrence) {
                return true;
            }
            if (c.occurrences && c.occurrences().length > 0) {
                var oc = $.grep(c.occurrences(), function (o) {
                    if (o.isOccurrence()) {
                        bHasRecurrence = true;
                        return true;
                    }
                    return false;
                });
            }
        });
        return bHasRecurrence;
    });

    self.getBookingsInCartByDate = function (date) {
        return $.grep(self.bookings(), function (val) {
            return moment(val.Date).isSame(date);
        });
    };

    self.chosenAttendance = ko.observable(-1);

    self.addCount = 0;
    self.add = function (roomData, filters, tzDrop, fromScheduleView) {
        if (roomData == undefined) {
            return false;
        }

        var unavailableReason = $.isFunction(roomData.UnavailableReason) ? roomData.UnavailableReason() : roomData.UnavailableReason;
        if (unavailableReason === 9999) {
            if (roomData.cartObj) {
                self.bookings.remove(function (b) {  // use roomMatchesCart function for equality check, so object reference doesn't have to match exactly
                    return parentModel.roomMatchesCart(b.RoomId(), roomData.cartObj.RoomId(), parentModel.filters.date(), parentModel.filters.start(), parentModel.filters.end());
                });

                roomData.cartObj = null;
                roomData.UnavailableReason(0);
            }
            return false;
        }

        var editMode = self.bookingEditing() != null;

        var room = ko.toJS(roomData);
        room.TempRoomDescription = '';

        var roomId = room.ID ? room.ID : (room.RoomId ? room.RoomId : (room.RoomID ? room.RoomID : null));

        self.addCount++;

        if (!parentModel.templateRules().VideoConference && parentModel.setupTypeValidation() == 0) {
            self.processAdd(roomId, room, roomData, editMode, filters, tzDrop, fromScheduleView, 1, 0);
        } else {
            if (parentModel.setupTypeValidation() == 2 && room.AvailableSetupTypes && room.AvailableSetupTypes != null) { // show and validate
                //filter available setuptypes by WPT settings
                var roomTypeList = room.AvailableSetupTypes.substring(0, room.AvailableSetupTypes.length - 1).split(',');
                var roomSetupTypes = $.map(parentModel.templateRules().SetupTypes, function (v, i) {
                    if ($.inArray(v.Id.toString(), roomTypeList) >= 0)
                        return v;
                });
                if ($.isArray(roomSetupTypes) && roomSetupTypes.length > 0) {
                    parentModel.roomSetupTypes(roomSetupTypes);
                } else {
                    parentModel.roomSetupTypes(parentModel.templateRules().SetupTypes);
                }

                var filterSetupTypes = vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("SetupTypes");
                if (filterSetupTypes && filterSetupTypes.length > 0) {
                    var setuptypes = filterSetupTypes.split(',');
                    var roomsetups = $.map(parentModel.roomSetupTypes(), function (r) { return parseInt(r.Id) });

                    if (setuptypes.length == 1 && setuptypes[0] > 0) { //if "no preference" for setuptype, suppress warning.
                        var roomHasSelectedSetup = false;
                        $.each(setuptypes, function (i, s) {
                            if ($.inArray(parseInt(s), roomsetups) >= 0) {
                                roomHasSelectedSetup = true;
                            }
                        });

                        if (!roomHasSelectedSetup) {
                            setTimeout(function () {
                                vems.showToasterMessage('', vems.roomRequest.setupTypeNotAvailableForThisLocation, 'danger');
                            }, 250);
                        }
                    }
                }
            } else {
                parentModel.roomSetupTypes(parentModel.templateRules().SetupTypes);
            }

            self.setupCountChangedFromAddModal = function (setup, min, max) {
                var setupCount = setup;

                // we're actually getting passed an element
                if (typeof setupCount == 'object') {
                    min = $(setupCount).prop('min');
                    max = $(setupCount).prop('max');
                    setupCount = $(setup).val();
                }

                if (min == 0) {
                    min = 1;
                }

                setupCountChanged(setupCount, min, max, room, room.RoomDescription);
            };

            var roomMin = room.MinCapacity > 0 ? room.MinCapacity : 1;

            $('#setup-add-count').prop('min', roomMin);
            $('#setup-add-count').prop('max', room.Capacity);

            var capacity = vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("Capacity");
            var setupCount = capacity == undefined || capacity === 0 ? vems.roomRequest.defaultAttendance : capacity;

            if (parentModel.setupTypeValidation() == 2) {
                setupCountChanged(setupCount, room.MinCapacity, room.Capacity, room, room.RoomDescription);
            }

            $('#setup-add-count').val(setupCount);
            $('#setup-add-type').val(room.DefaultSetupTypeId);

            if ($('#setup-add-type').val() === null) {
                $('#setup-add-type').css('border-color', '');
            }

            if (!self.setupTypeDrop)
                self.setupTypeDrop = $('#setup-add-type');

            if ($('#setup-add-type :selected').length === 0 && $('#setup-add-type option').length === 1) {
                $('#setup-add-type').val($('#setup-add-type option').eq(0).val());
            }

            setupTypeChanged(roomId, self.setupTypeDrop.val(), $('#setup-add-count'));

            if (room.RoomType === 3) { // override Description
                $('#setup-add-modal #od-location-container label').text(room.RoomDescription);
                $('#setup-add-modal #od-location-container').show();
            } else {
                $('#setup-add-modal #od-location-container').hide();
            }

            $('#setup-add-modal').modal('show');

            // Hide the setup type dropdown when set to ValidateButDoNotShow
            //if (parentModel.setupTypeValidation() == 1)
            //    $('#setup-add-type').parent().hide();
            //else
            //    $('#setup-add-type').parent().show();

            $('#setup-add-type').data('roomid', roomId);

            self.addToCartFromSetup = function () {
                var setupCount = $('#setup-add-count').is(":visible") ? $('#setup-add-count').val() : 1;
                var setupType = parseInt($('#setup-add-type').val(), 10);
                room.TempRoomDescription = $('#setup-add-modal #od-location-add:visible').length > 0 ? $('#setup-add-modal #od-location-add').val() : '';

                if (($('#setup-add-count').is(':visible') && (setupCount == null || setupCount.length === 0)) || ($('#setup-add-type').is(':visible') && isNaN(setupType))) {
                    return false;
                }

                room.DefaultSetupTypeId = setupType;  //this looks like a hack to set the cart binding accurately.
                room.Attendance = setupCount;
                parentModel.attendanceCount(setupCount);

                if (parentModel.templateRules().VideoConference) {
                    if (room.RoomType == 3 && room.TempRoomDescription.length === 0) {
                        return false;
                    }

                    room.IsHost = $('#add-host-check')[0].checked;

                    // don't remove the host field when the user is completing a broken recurrence
                    var recurrenceHasRemainingDates = parentModel.recurrence.recurrences().length > 0 && parentModel.recurrence.remainingDates().length > 0;

                    if (room.IsHost && !recurrenceHasRemainingDates) {
                        $.each(self.bookings(), function (i, v) {
                            v.IsHost(false);

                            if (v.occurrences && v.occurrences().length > 0) {
                                $.each(v.occurrences(), function (oI, occurrence) {
                                    occurrence.IsHost(false);
                                });
                            }
                        });
                    }
                } else {
                    room.IsHost = false;
                }

                var min = parseInt($('#setup-add-count').attr("min"), 10);
                var max = parseInt($('#setup-add-count').attr("max"), 10);

                if (setupCount <= 0) {
                    vems.showToasterMessage('', vems.roomRequest.AttendanceGreaterThanZeroMessage, 'danger');
                    return false;
                } else if (parentModel.setupTypeValidation() == 2 || parentModel.setupTypeValidation() == 1) {
                    if (setupCount < min || setupCount > max) {
                        return false;
                    }
                }

                //set to chosen setuptype capacities, which was set on the numeric control by the setuptypecheck ajax call for that setuptype
                room.Min = room.MinCapacity = min;
                room.Max = room.Capacity = max;

                self.processAdd(roomId, room, roomData, editMode, filters, tzDrop, fromScheduleView, setupCount, setupType);

                $('#setup-add-modal').modal('hide');

                // reset the form
                $('#setup-add-modal #od-location-add').val('');
            };
        }
    };

    self.processAdd = function (roomId, room, roomData, editMode, filters, tzDrop, fromScheduleView, setupCount, setupType) {
        if (typeof (room.IsHost) == 'undefined')
            room.IsHost = false;

        if (DevExpress.devices.real().phone) {
            $('#responsive-setup-type').val(setupType);
        }

        if (setupType === undefined || setupType === null) {
            setupType = 0;
        }

        if (!fromScheduleView) {
            if (room.UnavailableReason > 0 && !editMode) {
                parentModel.getAvailability(false, [{
                    'filterName': 'RoomId',
                    'value': roomId,
                    'displayValue': null,
                    'filterType': parentModel.setupTypeValidation()
                }]);

                $('#result-filter-row').hide(); // hide the filter row above the grid
                //$('.nav-pills li[data-resulttype=1] a').click(); // select the schedule view

                return false;
            } else {
                $('#result-filter-row').show();
            }
        }

        parentModel.availabilityFilterData.Cart = $.map(parentModel.cart.bookings(), function (v) {
            // don't include the current booking being edited in the availability check
            if (editMode && parentModel.roomMatchesCart(v.RoomId(), roomId, filters.date(), filters.start(), filters.end()))
                return;

            var start = moment(v.Date()).startOf('day').add(v.Start().getHours(), 'hours').add(v.Start().getMinutes(), 'minutes')._d
            var end = moment(v.Date()).startOf('day').add(v.End().getHours(), 'hours').add(v.End().getMinutes(), 'minutes')._d

            if (v.occurrences && v.occurrences().length > 0) {
                return $.map(v.occurrences(), function (ov) {
                    var oStart = moment(ov.Date()).startOf('day').add(ov.Start().getHours(), 'hours').add(ov.Start().getMinutes(), 'minutes')._d
                    var oEnd = moment(ov.Date()).startOf('day').add(ov.End().getHours(), 'hours').add(ov.End().getMinutes(), 'minutes')._d

                    return {
                        TimeEventStart: oStart,
                        TimeEventEnd: oEnd,
                        RoomId: ov.RoomId()
                    };
                });
            } else {
                return {
                    TimeEventStart: start,
                    TimeEventEnd: end,
                    RoomId: v.RoomId ? v.RoomId() : v.ID()
                };
            }
        });

        if (setupCount.length === 0)
            setupCount = vems.roomRequest.defaultAttendance;

        if (setupCount === 0 && parentModel.setupTypeValidation() != 2)
            setupCount = 1;

        var searchData = jQuery.extend({}, parentModel.availabilityFilterData);
        searchData.DatesGmt = new Array();

        var selectedTZ = $.grep(roomRequestModel.templateRules().TimeZones, function (v, i) {
            return v.TimeZoneID == $('#timeZoneDrop').val();
        });

        for (var i = 0; i < searchData.Cart.length; i++) {
            searchData.Cart[i].TimeEventStart = moment(searchData.Cart[i].TimeEventStart).format('YYYY-MM-D HH:mm:ss');
            searchData.Cart[i].TimeEventEnd = moment(searchData.Cart[i].TimeEventEnd).format('YYYY-MM-D HH:mm:ss');
        }

        for (var i = 0; i < searchData.Dates.length; i++) {
            var date = moment(searchData.Dates[i]);
            if (!date.isValid()) {
                date = moment(searchData.Dates[i], "YYYY-MM-D");
            }

            searchData.Dates[i] = date.startOf('day').format('YYYY-MM-D HH:mm:ss');
            searchData.DatesGmt.push(date.add(selectedTZ[0].MinuteBias * -1, 'minute').startOf('day').format('YYYY-MM-D HH:mm:ss'));
        }

        searchData.Start = searchData.Start.format('YYYY-MM-D HH:mm:ss');
        searchData.End = (searchData.End).set('second', 0).format('YYYY-MM-D HH:mm:ss');

        var hideResponsiveList = function () {
            // hide the search list and selected room indicators
            if (DevExpress.devices.real().phone && self.bookings().length > 0) {
                $('#page-title-responsive h1').removeClass('title-highlight');
                $('#room-request-container').show();
                $('#responsive-actions-top-container').removeClass('hidden-xs').addClass('visible-xs');
                $('#responsive-search-list').hide();

                $('#search-room-filters').hide();
                $('#specific-room-filters').hide();

                $('#responsive-room-selected-container').show();
                $('#responsive-room-selected-container .responsive-room-selected-item span').text(self.bookings()[0].RoomDescription());
            }
        };

        searchData.PageMode = vems.roomRequest.pageMode;

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/AddToCartCheck',
            data: JSON.stringify({
                roomId: roomId, attendance: setupCount, setupTypeId: setupType, searchData: searchData
            }),
            success: function (result) {
                var response = JSON.parse(result.d);
                // Data = "ReleatedRooms", "AvailableDates", "ServiceDetails", "CountOfBookingsByDate"
                // UnavailableMessages = unavailableMessages
                // parentModel.availabilityFilterData.Dates.length === 1 && 
                var conflictMessageShown = false;

                if (response.UnavailableMessages && response.UnavailableMessages.length > 0) {
                    var violations = $.grep(response.UnavailableMessages, function (val) {
                        return val.UnavailableReason == -1;
                    });

                    if (violations.length > 0) {
                        self.showUnavailableToast(violations[0].UnavailableMessage);
                        conflictMessageShown = true;
                        conflictAllowAdd = false;

                        if (DevExpress.devices.real().phone) {
                            $('#specific-room-search').typeahead("val", "");
                        }

                        // allow the user to add if the booking is in conflict and PAM and single date AND parameter allows
                        if (parentModel.templateRules().AllowInvitations && response.PamAllowAllowSingleDayConflicts && parentModel.availabilityFilterData.Dates.length == 1 && response.UnavailableMessages[0].UnavailableReason == 9) {
                            conflictAllowAdd = true;
                        } else {
                            return false;
                        }
                    }
                }

                if (response.UnavailableMessages && response.UnavailableMessages.length >= parentModel.availabilityFilterData.Dates.length) {
                    self.showUnavailableToast(response.UnavailableMessages[0].UnavailableMessage);
                    conflictMessageShown = true;

                    if (DevExpress.devices.real().phone) {
                        $('#specific-room-search').typeahead("val", "");
                    }

                    if (parentModel.templateRules().AllowInvitations && response.PamAllowAllowSingleDayConflicts && parentModel.availabilityFilterData.Dates.length == 1 && response.UnavailableMessages[0].UnavailableReason == 9) {
                        conflictAllowAdd = true;
                    } else {
                        return false;
                    }
                }

                if (editMode && (vems.roomRequest.pageMode == 'EditBooking' || vems.roomRequest.pageMode == 'EditPamLocation')) {
                    var roomId = typeof roomData.ID == "undefined" ? (ko.isObservable(roomData.RoomId) ? roomData.RoomId() : roomData.RoomId) : roomData.ID;

                    self.bookingEditing().RoomId(roomId);
                    self.bookingEditing().RoomDescription($.isFunction(roomData.RoomDescription) ? roomData.RoomDescription() : roomData.RoomDescription);

                    var date = moment(filters.date())._d;
                    var start = moment(filters.start())._d;
                    var end = moment(filters.end())._d;

                    self.bookingEditing().EventStart(new Date(date.getFullYear(), date.getMonth(), date.getDate(), start.getHours(), start.getMinutes()));
                    self.bookingEditing().EventEnd(new Date(date.getFullYear(), date.getMonth(), date.getDate(), end.getHours(), end.getMinutes()));

                    self.bookingEditing().TimeZoneId(tzDrop.find(':selected').val());

                    self.bookingEditing().DefaultSetupTypeId(room.DefaultSetupTypeId);
                    self.bookingEditing().SetupTypeId(room.DefaultSetupTypeId);
                    if (room.Attendance) {
                        self.bookingEditing().Attendance(room.Attendance);
                        self.bookingEditing().SetupCount(room.Attendance);
                    }

                    if ($.isFunction(roomData.UnavailableReason))
                        roomData.UnavailableReason(9999);
                    else
                        roomData.UnavailableReason = 9999;

                    parentModel.getAvailability(false, [{
                        'filterName': 'RoomId',
                        'value': roomId,
                        'displayValue': null,
                        'filterType': parentModel.setupTypeValidation()
                    }]);

                    hideResponsiveList();

                    vems.showToasterMessage('', vems.browse.bookingAddedMessage, 'info', 2000, null, null, false);  //don't clear other errors

                    if (vems.floorPlanVM.refreshMap) {
                        vems.floorPlanVM.refreshMap(self.bookings);
                    }

                    return false;
                }

                addToCartCheckPopulateRoom(room, filters, tzDrop, response.Data.AvailableDates[0], response.Data.Holidays, parentModel);

                if (editMode) {
                    // update cart w/ changes
                    self.bookingEditing().RoomId(room.RoomId);
                    self.bookingEditing().Date(room.Date);
                    self.bookingEditing().Start(room.Start);
                    self.bookingEditing().End(room.End);
                    self.bookingEditing().TimeZone(room.TimeZone);
                    self.bookingEditing().RoomCode(room.RoomCode);
                    self.bookingEditing().RoomDescription(room.RoomDescription);
                    self.bookingEditing().Attendance(room.Attendance);
                    self.bookingEditing().DefaultSetupTypeId(room.DefaultSetupTypeId);
                    self.bookingEditing().StatusId(room.StatusId);
                    self.bookingEditing().StatusName(room.StatusName);

                    if (self.bookingEditing().isOccurrence && self.bookingEditing().isOccurrence())
                        self.bookingEditing().isVariant(true);


                } else {
                    if (parentModel.availabilityFilterData.Dates.length > 1 || (parentModel.recurrence.remainingDates && parentModel.recurrence.remainingDates().length > 0)) { // recurrence

                        var occurrences = [];
                        var hasRemainingDates = parentModel.recurrence.remainingDates().length > 0;

                        parentModel.recurrence.remainingDates.removeAll();
                        $.each(response.Data.AvailableDates, function (i, v) {
                            if (!parentModel.templateRules().AllowInvitations && v.Available === 0) {
                                parentModel.recurrence.remainingDates.push(v.Date);
                                hasRemainingDates = true;

                                return true;
                            }

                            var occurrence = $.extend(true, {}, room);

                            occurrence.Date = v.Date;
                            occurrence.occurrences = null;
                            occurrence.isOccurrence = true;
                            occurrence.isVariant = parentModel.recurrence.cartObject;

                            if (v.Available == 0) {
                                occurrence.StatusName = "Unavailable";
                            }

                            occurrences.push(ko.mapping.fromJS(occurrence));
                        });

                        var realRoom = parentModel.recurrence.cartObject && hasRemainingDates
                            ? parentModel.recurrence.cartObject
                            : room;

                        var recurrenceDisplay = parentModel.recurrence.getRecurrenceDisplay();

                        if (!realRoom.recurrenceDescription) {
                            realRoom.recurrenceTotal = ko.observable(parentModel.recurrence.recurrences().length);
                            realRoom.recurrenceDescription = ko.observable();
                        }

                        realRoom.recurrenceDescription(recurrenceDisplay.pattern + ' (' + (realRoom.occurrences ? realRoom.occurrences().length + occurrences.length : occurrences.length) + ')');

                        var sortOccurences = function (left, right) {
                            return left.Date() == right.Date()
                                ? 0
                                : (left.Date() < right.Date() ? -1 : 1)
                        };

                        if ($.isArray(realRoom.occurrences) || $.isFunction(realRoom.occurrences)) {
                            var realRoomOccurences = realRoom.occurrences();
                            ko.utils.arrayPushAll(realRoomOccurences, occurrences);
                            realRoom.occurrences.sort(sortOccurences);

                            realRoom.occurrences.valueHasMutated();

                            var remainingWithoutOccurrences = $.each(occurrences, function (i, occurrenceVal) {
                                var remainingIndex = $.inArray(occurrenceVal.Date(), parentModel.recurrence.remainingDates());

                                if (remainingIndex > -1)
                                    parentModel.recurrence.remainingDates.splice(remainingIndex, 1);
                            });
                        } else {
                            realRoom.occurrences = ko.mapping.fromJS(occurrences);
                            realRoom.occurrences.sort(sortOccurences);

                            var reservation = ko.mapping.fromJS(realRoom);
                            var inCart = false;
                            $.each(self.bookings(), function (idx, book) {
                                if (book.BuildingId() === reservation.BuildingId() && book.RoomId() === reservation.RoomId()
                                    && moment(book.Date()).diff(moment(reservation.Date()), 'minutes') === 0
                                    && moment(book.Start()).diff(moment(reservation.Start()), 'minutes') === 0
                                    && moment(book.End()).diff(moment(reservation.End()), 'minutes') === 0) {
                                    inCart = true;
                                    return false;
                                }
                            });
                            if (!inCart) {  // prevent duplicate cart additions
                                parentModel.recurrence.cartObject = reservation;
                                self.bookings.push(reservation);
                            }
                        }


                        // we've filled all the dates
                        if (parentModel.recurrence.recurrences().length == realRoom.occurrences().length) {
                            hasRemainingDates = false;
                            parentModel.recurrence.remainingDates.removeAll();
                            parentModel.recurrence.cartObject = null;
                            parentModel.resetSearch(true);
                        } else {
                            if (!parentModel.templateRules().AllowInvitations && hasRemainingDates) {
                                parentModel.getAvailability(null, [], null);
                            }
                        }
                    } else { // single date
                        if (!room.RoomId)
                            room.RoomId = room.ID;

                        var mappedRoom = ko.mapping.fromJS(room);
                        var inCart = false;
                        $.each(self.bookings(), function (idx, book) {
                            if (book.BuildingId() === mappedRoom.BuildingId() && book.RoomId() === mappedRoom.RoomId()
                                && moment(book.Date()).diff(moment(mappedRoom.Date()), 'minutes') === 0
                                && moment(book.Start()).diff(moment(mappedRoom.Start()), 'minutes') === 0
                                && moment(book.End()).diff(moment(mappedRoom.End()), 'minutes') === 0) {
                                inCart = true;
                                return false;
                            }
                        });
                        if (!inCart) {  // prevent duplicate cart additions
                            self.bookings.push(mappedRoom);
                            
                            // hide add icon on schedule view
                            var schedRoomEl = $('.room-column[data-room-id=\'' + mappedRoom.RoomId() + '\']');
                            schedRoomEl.find('.column-text.available').hide();
                            schedRoomEl.find('.column-text.unavailable').show();
                        }
                    }

                    //a computed value will assess room level permissions
                    //self.setRoomLevelParameters();

                    if (vems.floorPlanVM.refreshMap) {
                        vems.floorPlanVM.refreshMap(self.bookings);
                    }
                    // don't show the toast on phones
                    if (!DevExpress.devices.real().phone) {
                        var lastBookingIdx = self.bookings().length - 1;  // used to perform check only on LAST booking added (for multi-location reservations)
                        if (parentModel.templateRules().Parameters.ReservationsWarnIfDateMissing && parentModel.recurrence.remainingDates && parentModel.recurrence.remainingDates().length > 0) {
                            vems.showToasterMessage('', vems.browse.locationPickNotAvailableMessage, 'warning', 6000);
                        } else if (parentModel.templateRules().Parameters.ReservationsWarnIfDateMissing && parentModel.templateRules().AllowInvitations && self.bookings()[lastBookingIdx].recurrenceTotal != undefined && self.bookings()[lastBookingIdx].recurrenceTotal() != self.bookings()[lastBookingIdx].DaysAvailable()) {
                            vems.showToasterMessage('', vems.browse.locationPickNotAvailableMessage, 'warning', 6000);
                        } else {
                            if (!conflictMessageShown) {  //let it fall through to the save reservation call
                                vems.showToasterMessage('', vems.browse.bookingAddedMessage, 'info', 2000, null, null, false);  //don't clear other errors
                            }
                        }
                    }

                    //setup popover for special dates
                    $('#bookingCart [data-toggle="popover"]').popover();
                }

                if ($.isFunction(roomData.UnavailableReason)) {
                    roomData.UnavailableReason(9999);
                } else {
                    roomData.UnavailableReason = 9999;
                }

                roomData.cartObj = self.bookings()[self.bookings().length - 1];

                $('#specific-room-search').typeahead("val", "");
                $('[data-room-id=' + roomId + ']').hide();

                if (vems.roomRequest.pageMode != 'AddPamLocation') {  // check for services when not just adding locations
                    vems.bookingServicesVM.GetServices(vems.roomRequest.reservationId,
                        parentModel.templateId(), parentModel.buildCartBookingsForSave(),
                        parentModel.reservationDetails.eventType());
                }

                hideResponsiveList();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };


    self.addFromScheduleView = function (roomId, filters, tzDrop) {

        var scheduleViewCallback = function (response) {
            var roomData = response.Availability;

            self.add(roomData[0], filters, tzDrop, true)
        };

        parentModel.getAvailability(false, [{
            'filterName': 'RoomId',
            'value': roomId,
            'displayValue': null,
            'filterType': parentModel.setupTypeValidation()
        }], scheduleViewCallback);
    }

    self.addToCartFromSetup = function () {
        // this is actually set as part of self.add
    };

    self.cancelAddToCartFromSetup = function (data, event) {
        $('#setup-add-modal').modal('hide');

        if ($('#specific-room-search').data('ttTypeahead'))
            $('#specific-room-search').typeahead('val', '')

        self.addCount--;
    };

    self.responsiveRemove = function () {
        $.each(self.bookings(), function (i, v) {
            self.remove(v);
        });

        $('#search-room-filters').show();
        $('#specific-room-filters').show();

        $('#responsive-room-selected-container').hide();
    };

    self.remove = function (item, supressConfirm) {
        if (!item)
            item = this;

        if (item.cartObjs && item.cartObjs().length > 0) {
            var recurrenceItem = item.cartObjs()[0];

            if (parentModel.templateRules().AllowInvitations) {
                var recurrenceParent;

                $.each(self.bookings(), function (i, v) {
                    if (v.occurrences && v.occurrences().length > 0) {
                        var filteredOccurrences = $.grep(v.occurrences(), function (occurrenceItem) {
                            return occurrenceItem.RoomId() == recurrenceItem.RoomId() && occurrenceItem.Date() == recurrenceItem.Date() && occurrenceItem.Start() == recurrenceItem.Start() && occurrenceItem.End() == recurrenceItem.End();
                        });

                        if (filteredOccurrences.length > 0)
                            recurrenceParent = v;
                    }
                });

                self.bookings.remove(recurrenceParent);

            } else {
                $.each(item.cartObjs(), function (i, v) {
                    self.remove(v);
                });
            }

            $('[data-room-id=' + item.RoomId() + ']').show();

            var roomElement = $('[data-room-id=' + item.RoomId() + ']')[0];

            if (roomElement)
                ko.dataFor(roomElement).UnavailableReason(0);

            $(item).remove();

            // search again when removing a recurrence parent
            parentModel.getAvailability();
            return true;
        }

        $('#specific-room-search').typeahead("val", "");
        if (item.isOccurrence && item.isOccurrence() && !parentModel.templateRules().AllowInvitations) {
            var recurrenceParent;

            $.each(self.bookings(), function (i, v) {
                if (v.occurrences && v.occurrences().length > 0) {
                    var filteredOccurrences = $.grep(v.occurrences(), function (occurrenceItem) {
                        return occurrenceItem.RoomId() == item.RoomId() && occurrenceItem.Date() == item.Date() && occurrenceItem.Start() == item.Start() && occurrenceItem.End() == item.End();
                    });

                    for (var j = 0; j < filteredOccurrences.length; j++) {
                        v.occurrences.remove(filteredOccurrences[j]);

                        if (v.occurrences().length === 0) {
                            recurrenceParent = v;
                        }
                    }
                }
            });

            if (recurrenceParent && recurrenceParent.occurrences().length === 0) {
                self.bookings.remove(recurrenceParent);
            }
        } else {
            var roomId = typeof item.RoomId != "undefined" ? item.RoomId() : item.ID();

            var roomRows = $('[data-room-id=' + roomId + ']');
            if (roomRows.length > 0) {
                var rowData = ko.dataFor(roomRows[0]);

                if (rowData.UnavailableReason)
                    rowData.UnavailableReason(0);

                $('[data-room-id=' + roomId + ']').show();
            }

            if (DevExpress.devices.real().phone && (vems.roomRequest.pageMode === 'EditBooking' || vems.roomRequest.pageMode === 'EditPamLocation')) {
                item.RoomId(0);
                item.RoomDescription('');
                item.RoomCode('');
                return;
            } else {
                var removingVcHost = $.isFunction(item.IsHost) && item.IsHost();

                self.bookings.remove(item);

                // if vc host is removed and other bookings still exist, make next booking the host
                if (removingVcHost && self.bookings().length > 0) {
                    self.bookings()[0].IsHost(true);
                }

                // hide add icon on schedule view
                var schedRoomEl = $('.room-column[data-room-id=\'' + item.RoomId() + '\']');
                schedRoomEl.find('.column-text.available').show();
                schedRoomEl.find('.column-text.unavailable').hide();

                if (item.occurrences && item.occurrences().length > 0) {
                    // search again when removing a recurrence parent
                    parentModel.getAvailability();
                }
            }
        }
    };

    self.editFromCart = function (data, event) {
        if (parentModel.templateRules().AllowInvitations)
            return false;

        var parentRow = $(event.currentTarget).parent().parent();

        if (parentRow.hasClass('booking-editing'))
            return false;

        if (parentRow.siblings().hasClass('booking-editing')) {
            var cancelEdit = self.cancelEdit();
        }

        self.bookingEditing(data);
        self.bookingEditingOriginalData(ko.toJS(data));

        $('#main-tabs li a').first().click();
        $(document).scrollTop(0);
        $('#result-tabs li[data-resulttype=1] a').click(); // select the schedule view

        parentRow.addClass('booking-editing');

        //$('#bookingCart tbody tr:not(.booking-editing)').hide();

        self.supressSubscriptionUpdatesForDateTime = true;

        parentModel.filters.date(moment(data.Date()));
        parentModel.filters.start(moment(data.Start()));
        parentModel.filters.end(moment(data.End()));

        parentModel.getAvailability(false, [{
            'filterName': 'RoomId',
            'value': data.RoomId(),
            'displayValue': null,
            'filterType': parentModel.setupTypeValidation()
        }]);

        self.supressSubscriptionUpdatesForDateTime = false;

        $('#result-filter-row').hide(); // hide the filter row above the grid
        var locFilterHeight = $('#location-filter-container').is(':visible') ? $('#location-filter-container').outerHeight() : 0;
        $('#datetime-overlay-lock').height($('#date-time-collapse').outerHeight() - locFilterHeight);
    };

    self.updateBooking = function () {
        if (vems.roomRequest.pageMode === 'EditBooking' || vems.roomRequest.pageMode === 'EditPamLocation') {
            editModeUpdateBooking();
            return false;
        } else if (vems.roomRequest.pageMode === 'AddPamLocation') {
            parentModel.saveReservation();
            return false;
        }

        parentModel.resetSearch();

        $('#bookingCart tr').removeClass('booking-editing');
        $('#bookingCart tbody tr:not(.booking-editing)').show();

        self.bookingEditing(null);
        vems.showToasterMessage('', vems.browse.bookingUpdatedMessage, 'info', 2000);
    };

    function editModeUpdateBooking() {
        if (!parentModel.validateReservationDetails(true))
            return false;

        var date = moment(parentModel.filters.date());
        var start = moment(date.startOf('day').add(parentModel.filters.start()._d.getHours(), 'hours').add(parentModel.filters.start()._d.getMinutes(), 'minutes'));
        var end = moment(date.startOf('day').add(parentModel.filters.end()._d.getHours(), 'hours').add(parentModel.filters.end()._d.getMinutes(), 'minutes'));

        var timeUnchanged = start.isSame(parentModel.cart.bookingEditing().EventStart())
            && end.isSame(parentModel.cart.bookingEditing().EventEnd())
            && parentModel.cart.bookingEditing().TimeZoneId() === parentModel.filters.timeZoneId();

        var eventInfoUnchanged = parentModel.cart.bookingEditing().EventName() === parentModel.reservationDetails.eventName() && parentModel.cart.bookingEditing().EventTypeId() === parentModel.reservationDetails.eventType()
        var setupUnchanged = parentModel.cart.bookingEditing().SetupTypeId() == roomRequestModel.cart.bookingEditingOriginalData().SetupTypeId && parentModel.cart.bookingEditing().SetupCount() == roomRequestModel.cart.bookingEditingOriginalData().SetupCount;

        var attendeesUnchanged = true;
        if (DevExpress.devices.real().phone) {
            attendeesUnchanged = !parentModel.attendees.attendeeListChanged();
        }

        var noChanges = timeUnchanged && eventInfoUnchanged && setupUnchanged && attendeesUnchanged
                        && roomRequestModel.cart.bookingEditing().RoomId() === roomRequestModel.cart.bookingEditingOriginalData().RoomId;
        if (noChanges && !DevExpress.devices.real().phone) {  // always run the update call on mobile, as it's needed to get the reservation edit url
            vems.showToasterMessage('', vems.browse.bookingNoChangeMessage, 'info', 2000);
        } else {
            // do an update
            parentModel.cart.bookingEditing().EventStart(start);
            parentModel.cart.bookingEditing().EventEnd(end);
            parentModel.cart.bookingEditing().TimeZoneId(parentModel.filters.timeZoneId());
            parentModel.cart.bookingEditing().EventName(parentModel.reservationDetails.eventName());
            parentModel.cart.bookingEditing().EventTypeId(parentModel.reservationDetails.eventType());

            var data = {
                templateId: parentModel.templateId(),
                reservationId: parentModel.cart.bookingEditing().ReservationId(),
                bookingId: parentModel.cart.bookingEditing().Id(),
                eventName: parentModel.cart.bookingEditing().EventName(),
                eventTypeId: parentModel.cart.bookingEditing().EventTypeId(),
                attendance: parentModel.cart.bookingEditing().SetupCount(),
                roomId: parentModel.cart.bookingEditing().RoomId(),
                eventStart: parentModel.cart.bookingEditing().EventStart().format('YYYY-MM-D HH:mm:ss'),
                eventEnd: parentModel.cart.bookingEditing().EventEnd().format('YYYY-MM-D HH:mm:ss'),
                setupTypeId: parentModel.cart.bookingEditing().SetupTypeId()
            };

            if (vems.roomRequest.pageMode === 'EditPamLocation') {
                var editPamData = {
                    templateId: data.templateId,
                    reservationId: data.reservationId,
                    bookingId: data.bookingId,
                    roomId: data.roomId,
                    setupCount: data.attendance,
                    setupTypeId: data.setupTypeId,
                    overrideDescriptionLocation: '',
                    bookingData: null
                };

                // let them edit attendees on mobile
                if (DevExpress.devices.real().phone) {
                    var filterStart = moment(new Date(parentModel.filters.date().year(), parentModel.filters.date().month(), parentModel.filters.date().date(), moment(parentModel.filters.start()).hour(), moment(parentModel.filters.start()).minute(), 0));
                    var filterEnd = moment(new Date(parentModel.filters.date().year(), parentModel.filters.date().month(), parentModel.filters.date().date(), moment(parentModel.filters.end()).hour(), moment(parentModel.filters.end()).minute(), 0));

                    editPamData.bookingData = {
                        BookingId: vems.roomRequest.bookingId,
                        EventName: parentModel.reservationDetails.eventName(),
                        EventTypeId: parentModel.reservationDetails.eventType(),
                        EventStart: filterStart.format('YYYY-MM-D HH:mm:ss'),
                        EventEnd: filterEnd.format('YYYY-MM-D HH:mm:ss'),
                        PamSubject: parentModel.reservationDetails.pamSubject(),
                        PamMessage: $('#message').htmlarea('html'),//parentModel.reservationDetails.pamMessage()
                        SendToAll: false,
                        Attendees: ko.toJS(parentModel.attendees.attendeeList()),
                    };
                }

                vems.ajaxPost({
                    url: vems.serverApiUrl() + '/PamManageBookingsEdit',
                    data: JSON.stringify(editPamData),
                    success: function (result) {
                        var response = JSON.parse(result.d);

                        if (response.Success) {
                            if (DevExpress.devices.real().phone) {
                                var jsonData = JSON.parse(response.JsonData);
                                vems.roomRequest.editReservationLink = jsonData.EditReservationLink;

                                // if no actual updates were made, simply go to the 'edit reservation details' page (ajax call was required to get the edit link)
                                if (noChanges) {
                                    window.location = vems.roomRequest.editReservationLink;
                                } else {
                                    $('#edit-reservation-details-modal').modal('show');
                                }
                            } else {
                                window.location = response.SuccessMessage;
                            }
                        } else {
                            vems.showToasterMessage('', response.ErrorMessage, 'danger', 2000);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                    },
                    complete: function () {
                        vems.pageLoading(false);
                    }
                });
            } else {
                if (data.roomId > 0) {
                    vems.ajaxPost({
                        url: vems.serverApiUrl() + '/EditBooking',
                        data: JSON.stringify(data),
                        success: function (result) {
                            var response = JSON.parse(result.d);

                            if (response.Success) {
                                var jsonData = JSON.parse(response.JsonData);

                                // show a modal to ask if they want to edit reservation details
                                if (DevExpress.devices.real().phone && typeof (jsonData.EditReservationLink) != 'undefined' && jsonData.EditReservationLink.length > 0) {
                                    vems.roomRequest.editReservationLink = jsonData.EditReservationLink;

                                    $('#edit-reservation-details-modal').modal('show');
                                }
                                else {
                                    window.location = vems.roomRequest.breadcrumb.updateLink;
                                }
                            } else {
                                vems.showToasterMessage('', response.SuccessMessage, 'danger', 2000);
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(thrownError);
                        },
                        complete: function () {
                            vems.pageLoading(false);
                        }
                    });
                }
            }
        }
    }

    self.cancelEdit = function (newBooking) {
        if (vems.roomRequest.pageMode === 'EditBooking' || vems.roomRequest.pageMode === 'EditPamLocation') {
            window.location = $('#breadcrumb a').attr('href');
            return false;
        }

        $('#available-list').find('tbody').empty();
        parentModel.roomResults.removeAll();
        $('#available-list').trigger('update');

        if ($('#book-grid-container').data('bookGrid'))
            $('#book-grid-container').data('bookGrid').rebuildGrid([], [])


        $('#bookingCart tr').removeClass('booking-editing');
        $('#bookingCart tbody tr:not(.booking-editing)').show();


        // reset the booking in the cart using the original data we captured on edit start
        self.bookingEditing().RoomId(self.bookingEditingOriginalData().RoomId);
        self.bookingEditing().Date(self.bookingEditingOriginalData().Date);
        self.bookingEditing().Start(self.bookingEditingOriginalData().Start);
        self.bookingEditing().End(self.bookingEditingOriginalData().End);
        self.bookingEditing().TimeZone(self.bookingEditingOriginalData().TimeZone);
        self.bookingEditing().RoomCode(self.bookingEditingOriginalData().RoomCode);
        self.bookingEditing().RoomDescription(self.bookingEditingOriginalData().RoomDescription);
        self.bookingEditing().Attendance(self.bookingEditingOriginalData().Attendance);
        self.bookingEditing().DefaultSetupTypeId(self.bookingEditingOriginalData().DefaultSetupTypeId);
        self.bookingEditing().StatusId(self.bookingEditingOriginalData().StatusId);
        self.bookingEditing().StatusName(self.bookingEditingOriginalData().StatusName);

        if (self.bookingEditing().isOccurrence && self.bookingEditing().isOccurrence())
            self.bookingEditing().isVariant(self.bookingEditingOriginalData().isVariant);

        self.bookingEditing(null);
    }

    self.removeRecurrenceItemFromList = function (data, event) {
        var indexes = [];

        $.each(parentModel.recurrence.cartObject.occurrences(), function (i, v) {
            if (v.RoomId() == data.id) {
                indexes.push(i);
                parentModel.recurrence.remainingDates.push(v.Date());
            }
        });

        if (parentModel.recurrence.cartObject.occurrences().length == indexes.length) {
            $.each(parentModel.cart.bookings(), function (i, v) {
                if (v == parentModel.recurrence.cartObject) {
                    parentModel.cart.bookings.remove(v);
                    return false;
                }
            });

            parentModel.recurrence.cartObject = null;

        } else {

            $.each(indexes.reverse(), function (i, v) {
                parentModel.recurrence.cartObject.occurrences().splice(v, 1);
            });
        }

        parentModel.getAvailability(null, [], null);
        //$(event.currentTarget).parent('.recurrence-row-item').remove();
    };

    self.occurrenceRoomItems = function () {
        var roomItems = [];

        if (parentModel.recurrence.cartObject && parentModel.recurrence.cartObject != null && parentModel.recurrence.cartObject.occurrences && parentModel.recurrence.cartObject.occurrences().length > 0) {
            $.each(parentModel.recurrence.cartObject.occurrences(), function (i, v) {
                var items = $.grep(roomItems, function (itemVal) {
                    return v.RoomId() == itemVal.id;
                });

                if (items.length > 0) {
                    items[0].count++;
                }
                else {
                    roomItems.push({
                        description: v.RoomDescription(),
                        id: v.RoomId(),
                        count: 1
                    });
                }
            });
        }

        return roomItems.reverse();
    };

    self.skipRemainingClicked = function (data, event) {
        parentModel.recurrence.remainingDates.removeAll();
        parentModel.recurrence.cartObject = null;
        parentModel.resetSearch(true);
    };

    self.setupTypeChangedFromCart = function (data, event) {

        if (DevExpress.devices.real().phone && self.bookings().length == 1 && typeof self.bookings()[0].SetupTypeId != "undefined") {
            var ddlSetupTypeId = $('#responsive-setup-type').val();
            if (ddlSetupTypeId !== null) {
                self.bookings()[0].SetupTypeId(ddlSetupTypeId);
            }
        }

        if (parentModel.setupTypeValidation() != 2 || self.bookings().length === 0)
            return false;

        self.setupTypeDrop = $(event.currentTarget);
        setupTypeDropVal = self.setupTypeDrop.val().length > 0 ? parseInt(self.setupTypeDrop.val(), 10) : 0;

        var roomId = ko.toJS(data.ID ? data.ID : data.RoomId);

        if (DevExpress.devices.real().phone && vems.roomRequest.pageMode != 'InitialRequest') {
            roomId = self.bookings()[0].RoomId ? self.bookings()[0].RoomId() : self.bookings()[0].RoomID();
        }

        var setupTypeId = setupTypeDropVal === 0 && data.DefaultSetupTypeId ? data.DefaultSetupTypeId() : setupTypeDropVal;

        // if we can't see the setup dropdown it means knockout changed it not us so ignore the value.
        if (!self.setupTypeDrop.is(':visible') && data.DefaultSetupTypeId) {
            setupTypeId = data.DefaultSetupTypeId();
        }

        setupTypeChanged(roomId, setupTypeId, self.setupTypeDrop.parent().siblings('.setup-count').children('input'), true);
    };

    self.setupTypeChangedFromAddModal = function (data, event) {
        self.setupTypeDrop = $('#setup-add-type');

        setupTypeChanged(self.setupTypeDrop.data('roomid'), self.setupTypeDrop.val(), $('#setup-add-count'));
    };

    function setupTypeChanged(roomId, setupTypeId, setupCountInput, fromCart) {
        if (roomId === undefined || setupTypeId == null)
            return false;

        if (parentModel.setupTypeValidation() != 2)
            return true;

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/SetupTypeChanged',
            data: JSON.stringify({
                roomId: roomId, setupTypeId: setupTypeId
            }),
            success: function (result) {
                var response = JSON.parse(result.d);

                if (response.length > 0) {
                    setupCountInput.prop('min', response[0].MinCapacity);
                    setupCountInput.prop('max', response[0].Capacity);

                    if (fromCart)
                        self.setupCountChangedFromCart(setupCountInput);
                    else
                        self.setupCountChangedFromAddModal($('#setup-add-count').val(), response[0].MinCapacity, response[0].Capacity);
                }
                //suppressing this warning. It was not comparing chosen filter to available. That logic is now above.
                //else if (vems.roomRequest.pageMode != "ServiceOnlyRequest") {
                //    var filterSetupTypes = vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("SetupTypes");
                //    if (filterSetupTypes && filterSetupTypes != "-1") {  //if "no preference" for setuptype, suppress warning.
                //        setTimeout(function () {
                //            vems.showToasterMessage('', vems.roomRequest.setupTypeNotAvailableForThisLocation, 'danger');
                //        }, 250);
                //    }
                //}
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    self.setupCountChangedFromCart = function (element, refreshServices) {
        var setupCount = $(element).val();
        var min = $(element).prop('min');
        var max = $(element).prop('max');

        var roomData = ko.dataFor(element.length > 0 ? element[0] : element);

        if (roomData == undefined)
            return;

        //room info should have been updated with new capacities by now
        //min = roomData.MinCapacity();
        //max = roomData.Capacity();

        var booking = ko.dataFor($(element)[0]);
        if (!setupCountChanged(setupCount, min, max, roomData, booking.RoomDescription())) {
            if (parseInt(setupCount) < parseInt(min)) {
                booking.Attendance(min);
            } else if (parseInt(setupCount) > parseInt(max)) {
                booking.Attendance(max);
            }
        }

        if (refreshServices) {  // when actually updated manually from cart page, update services (to reflect attendance count updates)
            vems.bookingServicesVM.GetServices(vems.roomRequest.reservationId, parentModel.templateId(), parentModel.buildCartBookingsForSave(),
                parentModel.reservationDetails.eventType());
        }
    };

    self.setupCountChangedFromAddModal = function () {
        // this is actually set as part of self.add
    };

    function setupCountChanged(setupCount, min, max, roomData, roomDescription) {
        if (setupCount == 0) {
            vems.showToasterMessage('', vems.roomRequest.AttendanceGreaterThanZeroMessage, 'danger');
            return false;
        }

        if (parentModel.setupTypeValidation() != 1 && parentModel.setupTypeValidation() != 2)
            return true;

        self.chosenAttendance(setupCount);

        var valid = self.setupCountValid(parseInt(setupCount, 10), parseInt(min, 10), parseInt(max, 10));

        if (!valid) {
            //if (roomData.Attendance) {
            //    if ($.isFunction(roomData.Attendance))
            //        roomData.Attendance(min);
            //    else
            //        roomData.Attendance = min;
            //}
            //else
            //    roomData.Attendance = min;

            //$('#setup-add-count').val(min);

            //{0} has a minimum capacity of {1}, and a maximum of {2}.
            var violationMessage = vems.browse.RoomCapacityViolationMessage
                .replace('{0}', roomDescription)
                .replace('{1}', min)
                .replace('{2}', max);

            vems.showToasterMessage('', violationMessage, 'danger', 5000);
            return false;
        }
    }

    self.setupCountValid = function (count, min, max) {
        if (parentModel.setupTypeValidation() != 1 && parentModel.setupTypeValidation() != 2)
            return true;

        return count >= min && count <= max;
    };

    self.setupModalLinkClicked = function (data, event) {
        if ($(event.currentTarget).hasClass('disabled'))
            return false;

        $('#setup-edit-modal').modal('show');
    };

    self.updateSetupFromModal = function (data, event) {
        var hasZeroQuantity = $.grep($('#setup-list input.attendance-edit'), function (val) {
            return $(val).val() == 0;
        });

        if (hasZeroQuantity.length > 0)
            return false;

        if (vems.roomRequest.pageMode == 'EditBooking' || vems.roomRequest.pageMode == 'EditPamLocation') {
            parentModel.cart.bookingEditing().SetupTypeId(parentModel.cart.bookings()[0].DefaultSetupTypeId());
            parentModel.cart.bookingEditing().SetupCount(parentModel.cart.bookings()[0].Attendance());
        } else {
            // update services (to reflect attendance count updates)
            vems.bookingServicesVM.GetServices(vems.roomRequest.reservationId, parentModel.templateId(), parentModel.buildCartBookingsForSave(),
                parentModel.reservationDetails.eventType());
        }

        $('#setup-edit-modal').modal('hide');
    };

    self.cancelUpdateSetupFromModal = function (data, event) {
        if (vems.roomRequest.pageMode == 'EditBooking' || vems.roomRequest.pageMode == 'EditPamLocation') {
            parentModel.cart.bookings()[0].DefaultSetupTypeId(parentModel.cart.bookingEditing().SetupTypeId());
            parentModel.cart.bookings()[0].Attendance(parentModel.cart.bookingEditing().SetupCount());
        }
    };

    self.myCartClicked = function (data, event) {
        $('#main-tabs li a').last().click();
    };

    self.selectedRoomInstanceCount = 0;

    self.occurencesInConflict = function (data) {
        var instance = $.grep(data.cartObjs(), function (v) {
            return data.RoomId() == v.RoomId();
        });
        if ($.isArray(instance) && instance.length > 0) {
            if (data.total() != instance[0].DaysAvailable())
                return data.total() - instance[0].DaysAvailable();
        }

        return 0;
    };

    self.getSelectedRoomsForRecurrence = function (data) {
        var instances = [];

        if (vems.roomRequest.pageMode == "ServiceOnlyRequest") {
            return instances;
        }

        $.each(data.occurrences(), function (i, v) {
            var instance = $.grep(instances, function (val) {
                return val.RoomId() == v.RoomId();
            });

            if (instance.length == 0) {
                instances.push(ko.mapping.fromJS({
                    RoomId: v.RoomId(),
                    BuildingId: v.BuildingId(),
                    RoomDescription: v.RoomDescription(),
                    FloorPlanIndicatorID: v.FloorPlanIndicatorID(),
                    count: 1,
                    total: data.recurrenceTotal(),
                    LocationDetailsLink: data.LocationDetailsLink(),
                    cartObjs: new Array(v)
                }));
            } else {
                instance[0].count(instance[0].count() + 1); //v.DaysAvailable() ); 
                instance[0].total(data.recurrenceTotal());
                instances[0].cartObjs.push(v);
            }
        });

        self.selectedRoomInstanceCount = instances.length;
        return instances;
    };

    self.buildLocationString = function (data) {
        if (data.occurrences && data.occurrences().length > 0) {
            var roomDescriptions = getRoomDescriptionsOfOccurrences(data);

            return vems.decodeHtml(roomDescriptions.length > 1
                ? roomDescriptions[0] + ' ' + vems.roomRequest.andXOthersLabel.replace('{0}', roomDescriptions.length - 1)
                : roomDescriptions[0]);
        }

        return vems.decodeHtml(data.RoomDescription());
    };

    self.variantsText = function (data) {
        var variants = $.grep(data.occurrences(), function (val, i) {
            return val.RoomDescription() != data.RoomDescription();
        });

        return variants.length > 0 ? ' | ' + vems.roomRequest.variantsLink.replace('{0}', variants.length) : '';
    };

    self.viewOccurrencesClicked = function (data, event) {
        var target = $(event.currentTarget).parents('tr');
        var occurrenceTable = target.next('.occurrences');

        occurrenceTable.find('tr').show(); // show all rows

        if (!target.data('viewState'))
            target.data('viewState', 0);

        switch (target.data('viewState')) {
            case 0: // hidden
                occurrenceTable.show();
                target.data('viewState', 1);
                break;
            case 1: // showing
                occurrenceTable.hide();
                target.data('viewState', 0);
                break;
            case 2: // variants showing                
                target.data('viewState', 1);
                break;
        }
    };

    self.ViewVariantsClicked = function (data, event) {
        var target = $(event.currentTarget).parents('tr');
        var occurrenceTable = target.next('.occurrences');

        occurrenceTable.find('tr:not(.variant)').hide(); // hide the non-variant rows

        if (!target.data('viewState'))
            target.data('viewState', 0);

        switch (target.data('viewState')) {
            case 0: // hidden
                occurrenceTable.show();
                target.data('viewState', 2);
                break;
            case 1: // showing
                target.data('viewState', 2);
                break;
            case 2: // variants showing
                occurrenceTable.hide();
                target.data('viewState', 0);
                break;
        }
    };

    self.availableDaysClicked = function (data, event) {
        var availableCount = $(event.currentTarget).text().split('/');

        if (!availableCount || availableCount.length == 0 || availableCount[0] === availableCount[1])
            return false;

        $('#available-days-modal').data('roomId', data.RoomId());
        $('#available-days-modal').data('roomName', data.RoomDescription());
        $('#available-days-modal').modal('show');
    };

    function getRoomDescriptionsOfOccurrences(data) {
        var roomDescriptions = [];
        roomDescriptions.push(data.RoomDescription());

        $.each(data.occurrences(), function (i, v) {
            if ($.inArray(v.RoomDescription(), roomDescriptions) == -1)
                roomDescriptions.push(v.RoomDescription());
        });

        return roomDescriptions;
    }

    function addToCartCheckPopulateRoom(room, filters, tzDrop, availableDates, holidays, parentModel) {
        if (room.ShowAlert && room.Alert.length > 0) {
            alert(vems.decodeHtml(room.Alert));
        }

        if (holidays.length > 0) {
            var h = $.map(holidays, function (v) {
                return v.Description;
            });

            room.Holidays = h.join('\n');
        } else {
            room.Holidays = '';
        }

        room.Date = moment(filters.date())._d;
        room.Start = moment(filters.start())._d;
        room.End = moment(filters.end()).set('second', 0)._d;

        var localStart = moment(availableDates.LocalStart);

        room.LocalDate = new Date(localStart.year(), localStart.month(), localStart.date());
        room.LocalStart = localStart._d;
        room.LocalEnd = moment(availableDates.LocalEnd)._d;
        room.SetupMinutes = availableDates.SetupMinutes;
        room.TeardownMinutes = availableDates.TeardownMinutes;

        // set localized date/time data for cart display
        room.LocalEventStart = moment(availableDates.EventStart)._d;
        room.LocalEventEnd = moment(availableDates.EventEnd)._d;
        room.LocalEventDate = new Date(room.LocalEventStart.getFullYear(), room.LocalEventStart.getMonth(), room.LocalEventStart.getDate());
        room.LocalTimeZone = availableDates.TimeZoneDescription;

        //room.Timezone = availableDates.Timezone;
        room.Timezone = tzDrop.find(':selected').text();
        room.TimeZone = tzDrop.find(':selected').text();
        room.TimeZoneId = tzDrop.find(':selected').val();
        room.Conflict = '';
        room.PromptForBillingReference = availableDates.PromptForBillingReference;

        room.Min = room.MinCapacity;
        room.Max = room.Capacity;

        //room.Min = availableDates.MinCapacity == -1 ? 0 : availableDates.MinCapacity;
        //room.Max = availableDates.MaxCapacity == -1 ? 999999 : availableDates.MaxCapacity;

        if (room.RecordType == 1) {
            room.StatusName = vems.roomRequest.reserveLabel;//parentModel.templateRules().ReserveStatus;
            room.StatusId = parentModel.templateRules().ReserveStatusId;
        } else if (room.RecordType == 2) {
            room.StatusName = vems.roomRequest.requestLabel;//parentModel.templateRules().RequestStatus;
            room.StatusId = parentModel.templateRules().RequestStatusId;
        }

        if (self.chosenAttendance() > 0) {  //choseAttendance was set from Add Modal
            room.Attendance = self.chosenAttendance();
        }
        else if (!room.Attendance) {
            room.Attendance = vems.roomRequest.defaultAttendance == 0
                ? 1
                : vems.roomRequest.defaultAttendance;
        }
    }

    $('#available-days-modal').on('show.bs.modal', function (e) {
        var roomId = $(this).data("roomId");
        $('#available-days-header-msg span').text(vems.decodeHtml($(this).data('roomName')));


        var filterData = jQuery.extend(true, {}, parentModel.availabilityFilterData);
        filterData.Start = filterData.Start.format('YYYY-MM-D HH:mm:ss');
        filterData.End = filterData.End.format('YYYY-MM-D HH:mm:ss');

        for (var i = 0; i < filterData.Dates.length; i++) {
            filterData.Dates[i] = moment(filterData.Dates[i]).format('YYYY-MM-D HH:mm:ss');
        }

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetRoomRecurrenceConflicts',
            data: JSON.stringify({
                roomId: roomId, searchData: filterData
            }),
            success: function (result) {
                var response = JSON.parse(result.d);
                $('#available-days-conflict-table tbody').children().remove();

                var dates = [];
                var unavailableRows = new Array();

                $.each(parentModel.roomConflicts(), function (i, v) {
                    if (v.RoomID == roomId && v.UnavailableReasonFlag > 0) {
                        var date = moment(v.Date).startOf('day')._d.getTime();
                        var firstDate = $.inArray(date, dates) === -1;

                        if (firstDate)
                            dates.push(date);

                        var row = $("<tr>"
                            + "<td>" + (firstDate ? moment(v.Date).format('ddd L') : '') + "</td>"
                            + "<td colspan='3'>" + v.UnavailableMessage + "</td>"
                            + "</tr>");

                        unavailableRows.push({ date: date, rows: [row] });
                    }
                });

                $.each(response, function (i, v) {
                    var date = moment(v.TimeBookingStart).startOf('day')._d.getTime();
                    var firstDate = $.inArray(date, dates) === -1;

                    var row = $("<tr>"
                        + "<td>" + (firstDate ? moment(v.TimeBookingStart).format('ddd L') : '') + "</td>"
                        + "<td>" + (moment(v.TimeBookingStart).format('LT') + ' - ' + moment(v.TimeBookingEnd).format('LT')) + "</td>"
                        + "<td>" + vems.decodeHtml(v.EventName) + "</td>"
                        + (v.EmailAddress.length > 0
                            ? "<td><a href='mailto:" + v.EmailAddress + "'>" + vems.decodeHtml(v.GroupName) + "</a></td>"
                            : '<td>' + vems.decodeHtml(v.GroupName) + '</td>')
                    + "</tr>");

                    if (firstDate) {
                        dates.push(date);

                        unavailableRows.push({ date: date, rows: [row] });
                    } else {
                        var dateRow = $.grep(unavailableRows, function (val) {
                            return val.date == date;
                        });

                        if (dateRow.length > 0) {
                            dateRow[0].rows.push(row);
                        }
                    }
                });

                unavailableRows.sort(function (a, b) {
                    return a.date > b.date;
                });

                $.each(unavailableRows, function (i, v) {
                    $('#available-days-conflict-table tbody').append(v.rows);
                });

            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    });

    self.hostChanged = function (data, event) {
        // they've unselected all hosts, select the first booking.
        if (!data.IsHost()) {
            self.bookings()[0].IsHost(true);

            if (self.bookings()[0].occurrences && self.bookings()[0].occurrences().length > 0) {
                $.each(self.bookings()[0].occurrences(), function (oI, occurrence) {
                    occurrence.IsHost(true);
                });
            }
        } else {
            $.each(self.bookings(), function (i, v) {
                if (v != data) {
                    v.IsHost(false);

                    if (v.occurrences && v.occurrences().length > 0) {
                        $.each(v.occurrences(), function (oI, occurrence) {
                            occurrence.IsHost(false);
                        });
                    }
                } else {
                    if (v.occurrences && v.occurrences().length > 0) {
                        $.each(v.occurrences(), function (oI, occurrence) {
                            occurrence.IsHost(true);
                        });
                    }
                }
            });
        }
        return true;  // required to allow normal checkbox behavior to continue
    };
}


ko.bindingHandlers.datePicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        try {
            var options = allBindingsAccessor().datepickerOptions || {};

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

            if (options.minDate && options.maxDate && options.minDate.isAfter(options.maxDate))
                options.minDate = moment(options.maxDate._d);

            options.locale = moment.locale();
            options.ignoreReadonly = true;

            options.showTodayButton = true;
            options.icons = {};
            options.icons.today = "date-picker-today-btn";

            if (DevExpress.devices.real().phone) {
                options.focusOnShow = false;
                options.showClose = true;

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

            if (DevExpress.devices.real().phone) {  // auto-scroll to top of popup on mobile
                $(element).datetimepicker(options).on('dp.show', function (ev) {
                    var popupTop = $('.bootstrap-datetimepicker-widget.dropdown-menu').position().top;
                    $(window).scrollTop(popupTop);
                });
            }

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
                options.focusOnShow = false;
                options.showClose = true;

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

            if (DevExpress.devices.real().phone) {  // auto-scroll to top of popup on mobile
                $(element).datetimepicker(options).on('dp.show', function (ev) {
                    var popupTop = $('.bootstrap-datetimepicker-widget.dropdown-menu').position().top;
                    $(window).scrollTop(popupTop);
                });
            }

            return ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);
        } catch (e) {
            return false;
        }
    },
    update: function (element, valueAccessor) {
        try {
            var value = ko.toJS(ko.utils.unwrapObservable(valueAccessor()));

            if (element.id != 'booking-date') {
                var date = $('#booking-date').data('DateTimePicker').date() ? $('#booking-date').data('DateTimePicker').date()._d : roomRequestModel.filters.date()._d;
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
    var minDate = moment(roomRequestModel.templateRules().FirstAllowedBookingDate).startOf('day');
    var maxDate = roomRequestModel.getMaxDateForCalendar();// moment(roomRequestModel.templateRules().LastAllowedBookingDate).endOf('day');

    $.each($('#recurrence-random-calendar td.day'), function (idx, el) {
        var currDay = $(el);
        if (!moment(currDay.data('day')).isBefore(minDate) && !moment(currDay.data('day')).isAfter(maxDate)) {
            currDay.removeClass('avail-day avail-day-oldnew');  // properly style available/valid dates 
            if (!currDay.hasClass('old') && !currDay.hasClass('new')) {
                currDay.addClass('avail-day');
            } else {
                currDay.addClass('avail-day-oldnew');
            }

            if (roomRequestModel.recurrence.randomDates.indexOf(currDay.data('day')) !== -1) {
                currDay.addClass('recurrence-day');  // highlight dates already selected
            }
        }
    });

    $('#recurrence-random-calendar td.day').off('click').on('click', function (ev) {
        var targetDay = $(ev.target);
        if (!moment(targetDay.data('day')).isBefore(minDate) && !moment(targetDay.data('day')).isAfter(maxDate)) {
            if (roomRequestModel.recurrence.randomDates.indexOf(targetDay.data('day')) === -1) {
                targetDay.addClass('recurrence-day');  // add date if not in random array
                roomRequestModel.recurrence.randomDates.push(targetDay.data('day'));
            } else {
                targetDay.removeClass('recurrence-day');  // remove date if in random array
                roomRequestModel.recurrence.randomDates.remove(targetDay.data('day'));
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

function removeMobileLocationsItem(id) {
    $('#mobile-locations-modal .selected-group div[data-item-val=' + id + ']').remove();
    $('#mobile-locations-modal .checkbox input[value=' + id + ']').removeAttr('checked');
};

//function rebindJCarousel(elements) {
//    //deal with a timing issue 
//    setTimeout(function () {
//        var active = $("#floormap-image-carousel .carousel").find('li.active')[0];
//        $(active).click();
//        if (roomRequestModel.floormapImages && roomRequestModel.floormapImages().length > 0)
//            roomRequestModel.showMapInline(roomRequestModel.floormapImages()[0]);
//    }, 500);
//};

//!!!!!!!!  NOT CURRENTLY USED, BUT KEEPING HERE IN CASE THEY WANT THE CAROUSEL BACK
// This is the connector function.
// It connects one item from the navigation carousel to one item from the
// stage carousel.
// The default behaviour is, to connect items with the same index from both
// carousels. This might _not_ work with circular carousels!
//var connector = function (itemNavigation, carouselStage) {
//    return carouselStage.jcarousel('items').eq(itemNavigation.index());
//};
//function rebindJCarousel(parentContainerId, chosenItemCallback) {
//    // Setup the carousels. Adjust the options for both carousels here.
//    //var carouselStage = $('#' + parentContainerId + ' .carousel-stage').jcarousel();
//    //var carousel = $('#' + parentContainerId).jcarousel('reload');    
//    var carouselNavigation = $('#' + parentContainerId + ' .carousel-navigation').jcarousel();
//    //carouselNavigation.jcarousel('reload');
//    //// We loop through the items of the navigation carousel and set it up
//    //// as a control for an item from the stage carousel.
//    carouselNavigation.jcarousel('items').each(function () {
//        var item = $(this);
//        // This is where we actually connect to items.
//        //var target = connector(item, carouselStage);

//        item
//            .on('jcarouselcontrol:active', function () {
//                carouselNavigation.jcarousel('scrollIntoView', this);
//                item.addClass('active');
//                //get data
//                //var data = item.data('dataitem');
//                //chosenItemCallback(data);
//            })
//            .on('jcarouselcontrol:inactive', function () {
//                item.removeClass('active');
//            })
//            .jcarouselControl({
//                target: item,
//                carousel: carouselNavigation //carouselStage
//            });
//    });

//    // Setup controls for the navigation carousel
//    $('#' + parentContainerId + ' .prev-navigation')
//        .on('jcarouselcontrol:inactive', function () {
//            $(this).addClass('inactive');
//        })
//        .on('jcarouselcontrol:active', function () {
//            $(this).removeClass('inactive');
//        })
//        .jcarouselControl({
//            target: '-=1'
//        });

//    $('#' + parentContainerId + ' .next-navigation')
//        .on('jcarouselcontrol:inactive', function () {
//            $(this).addClass('inactive');
//        })
//        .on('jcarouselcontrol:active', function () {
//            $(this).removeClass('inactive');
//        })
//        .jcarouselControl({
//            target: '+=1'
//        });
//};

