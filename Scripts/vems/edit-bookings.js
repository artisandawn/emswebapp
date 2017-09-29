var vems = vems || {};
vems.reservationSummary = vems.reservationSummary || {};

vems.reservationSummary.bookingToolsVM = function (data) {
    var self = this;
    self.specificStartTime = ko.observable(null);
    self.specificEndTime = ko.observable(null);

    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);
        self.specificStartTime(data.specificStartTime());
        self.specificEndTime(data.specificEndTime());
    }

    self.specificStartTime.subscribe(function (newValue) {
        if (newValue) {
            self.specificEndTime(moment(newValue).add(1, 'hour'));
        }
    });

    self.specificEndTime.subscribe(function (newValue) {
        if (!self.specificStartTime()) {
            self.specificStartTime(moment(newValue).subtract(1, 'hour'));
        }
    });

    self.valid = ko.computed(function () {
        var dateMode = self.dateChangeMode();
        var timeMode = self.timeChangeMode();

        if (self.selectedBookingIds().length === 0) {
            return false;
        }

        if (dateMode === 0 && timeMode === 0) {
            return false;
        }

        if ((dateMode === 1 || dateMode === 2) && (!self.numberOfDays() || parseInt(self.numberOfDays()) === 0)) {
            return false;
        }

        if (dateMode === 3 && (!self.specificDate() || moment(self.specificDate()).year() <= 1900)) {
            return false;
        }        

        if ((timeMode >= 2 && timeMode <= 7) && (!self.numberOfHoursOrMinutes() || parseInt(self.numberOfHoursOrMinutes()) === 0)) {
            return false;
        }

        if (timeMode === 1 && (!self.specificStartTime() || !self.specificEndTime() || self.timeZoneId() === -1)) {
            return false;
        }

        return true;
    });

    self.toggleBookingSelection = function (booking) {
        if (self.selectedBookingIds.indexOf(booking.Id()) !== -1) {
            self.selectedBookingIds.remove(booking.Id());
        } else {
            self.selectedBookingIds.push(booking.Id());
        }
        self.updateSelectAllCb();
    };

    self.toggleAllBookings = function () {
        if (self.selectedBookingIds().length === self.bookingList().length) {
            self.selectedBookingIds.removeAll();
        } else {
            var idList = self.bookingList().map(function (booking) {
                return booking.Id();
            });
            self.selectedBookingIds(idList);
        }
        self.updateSelectAllCb();
    };

    // manual toggling required because length of observable arrays didn't seem to update UI (css classes) as observable arrays changed
    self.updateSelectAllCb = function () {
        var selectAllCb = $('#select-all-cb');
        selectAllCb.removeClass('fa-square-o');
        selectAllCb.removeClass('fa-check-square-o');
        if (self.selectedBookingIds().length === self.bookingList().length) {
            selectAllCb.addClass('fa-check-square-o');
        } else {
            selectAllCb.addClass('fa-square-o');
        }
    };

    self.updateSelectedBookings = function () {
        if (!self.valid()) { return false; }
        var jsVm = ko.toJS(self);

        // adjust dates and times to universal format
        if (jsVm.specificStartTime && jsVm.specificEndTime) {
            jsVm.specificStartTime = moment(jsVm.specificStartTime).format('YYYY-MM-D HH:mm:ss');
            jsVm.specificEndTime = moment(jsVm.specificEndTime).format('YYYY-MM-D HH:mm:ss');
        }
        if (jsVm.specificDate) {
            jsVm.specificDate = moment(jsVm.specificDate).format('YYYY-MM-D HH:mm:ss');
        }

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/BookingToolsSave',
            data: JSON.stringify({ vm: jsVm }),
            success: function (result) {
                var response = ko.mapping.fromJS(JSON.parse(result.d));

                if (response.bookingList().length > 0) {
                    // remove old booking records from bookingList and add in new (updated) records with results
                    var updatedBookingList = self.bookingList().slice();
                    var failedUpdateCount = 0;
                    updatedBookingList = $.grep(updatedBookingList, function (booking) {
                        return self.selectedBookingIds.indexOf(booking.Id()) === -1;
                    });
                    $.each(updatedBookingList, function (idx, booking) {
                        booking.Results('');  // clear old results values
                    });
                    $.each(response.bookingList(), function (idx, booking) {
                        updatedBookingList.push(booking);
                        if (!booking.Changed()) {
                            failedUpdateCount += 1;
                        }
                    });

                    $('#bookings-grid tbody > tr').remove();  // clear html grid elements to prevent tablesorter duplication
                    self.bookingList([]);  // manually update to cause DOM re-creation
                    self.bookingList(updatedBookingList);
                    $('#bookings-grid').trigger('update');

                    self.selectedBookingIds.removeAll();  // uncheck all items

                    // reset date/time change options
                    self.dateChangeMode(0);
                    self.timeChangeMode(0);

                    // display toast confirmation/warning
                    if (failedUpdateCount === 0) {
                        vems.showToasterMessage('', vems.reservationSummary.updateSuccessfulMessage, 'success');
                    } else {
                        vems.showToasterMessage('', vems.reservationSummary.updateUnsuccessfulMessage, 'warning');
                    }
                } else {
                    vems.showToasterMessage('', vems.reservationSummary.updateFailedText, 'danger');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };
};

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

            options.locale = moment.locale();
            options.ignoreReadonly = true;

            options.showTodayButton = true;
            options.icons = {};
            options.icons.today = "date-picker-today-btn";

            options.widgetPositioning = {
                horizontal: 'left'
            }

            $(element).datetimepicker(options).on('dp.change', function (ev) {
                var observable = valueAccessor();
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