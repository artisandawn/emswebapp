var vems = vems || {};
vems.myEvents = vems.myEvents || {};

vems.myEvents.myEventsVM = function (data) {
    var self = this;
    self.activeTab = ko.observable('reservations');  // 'reservations' or 'bookings'
    self.reservationTab = ko.observable('current');  // 'current' or 'past'
    self.bookingTab = ko.observable('day');  // 'day', 'week', or 'month'
    self.lastBookingUpdate = ko.observable();  // used to prevent multiple DB calls when updating various calendars

    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);

        data.bookingListDate(moment(data.bookingListDate()).add(moment().utcOffset() * -1, 'minute')._d);
        self.lastBookingUpdate(moment(data.bookingListDate()));
    }
};

vems.myEvents.toggleShowCancelled = function () {
    vems.myEvents.myEventsViewModel.showCancelledEvents(!vems.myEvents.myEventsViewModel.showCancelledEvents());
    vems.myEvents.myEventsViewModel.currentReservations.pageIndex(0);
    vems.myEvents.myEventsViewModel.pastReservations.pageIndex(0);
    vems.myEvents.myEventsViewModel.dailyBookings.pageIndex(0);
    vems.myEvents.updateReservations();
    vems.myEvents.updateBookings();
};

// used to determine whether a page number should be shown in an event grid
vems.myEvents.showPageButton = function (idx, activeIdx, pageCount) {
    if (idx <= 1 || idx >= pageCount - 2) {
        return true;
    } else if (activeIdx <= 4) {
        return idx <= 9;
    } else if (activeIdx >= pageCount - 5) {
        return idx >= pageCount - 10;
    } else {
        return idx >= activeIdx - 3 && idx <= activeIdx + 3;
    }
};

/* reservations tab */
vems.myEvents.sortReservations = function (sortProp) {
    if (vems.myEvents.myEventsViewModel.reservationTab() === 'past') {
        if (vems.myEvents.myEventsViewModel.pastReservations.sortProperty() === sortProp) {
            vems.myEvents.myEventsViewModel.pastReservations.sortDescending(
                !vems.myEvents.myEventsViewModel.pastReservations.sortDescending());
        } else {
            vems.myEvents.myEventsViewModel.pastReservations.sortDescending(false);
        }
        vems.myEvents.myEventsViewModel.pastReservations.sortProperty(sortProp);
        vems.myEvents.myEventsViewModel.pastReservations.pageIndex(0);
    } else {
        if (vems.myEvents.myEventsViewModel.currentReservations.sortProperty() === sortProp) {
            vems.myEvents.myEventsViewModel.currentReservations.sortDescending(
                !vems.myEvents.myEventsViewModel.currentReservations.sortDescending());
        } else {
            vems.myEvents.myEventsViewModel.currentReservations.sortDescending(false);
        }
        vems.myEvents.myEventsViewModel.currentReservations.sortProperty(sortProp);
        vems.myEvents.myEventsViewModel.currentReservations.pageIndex(0);
    }
    vems.myEvents.updateReservations();
};

vems.myEvents.changeReservationPage = function (pageIdx) {
    if (vems.myEvents.myEventsViewModel.reservationTab() === 'past') {
        vems.myEvents.myEventsViewModel.pastReservations.pageIndex(pageIdx);
    } else {
        vems.myEvents.myEventsViewModel.currentReservations.pageIndex(pageIdx);
    }
    vems.myEvents.updateReservations();
};

vems.myEvents.searchReservations = function () {
    vems.myEvents.myEventsViewModel.reservationSearchText($('#reservation-search').val());
    vems.myEvents.updateReservations();
};

vems.myEvents.clearReservationSearch = function () {
    $('#reservation-search').val('');
    vems.myEvents.myEventsViewModel.currentReservations.pageIndex(0);
    vems.myEvents.myEventsViewModel.pastReservations.pageIndex(0);
    vems.myEvents.searchReservations();
};

vems.myEvents.updateReservations = function () {
    $('.events-loading-overlay').show();
    var jsVm = ko.toJS(vems.myEvents.myEventsViewModel);
    jsVm.bookingListDate = moment(jsVm.bookingListDate).format('YYYY-MM-DD');
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/PopulateReservationList',
        data: JSON.stringify({ vm: jsVm }),
        success: function (result) {
            var response = ko.mapping.fromJS(JSON.parse(result.d));
            vems.myEvents.myEventsViewModel.currentReservations.eventList(response.currentReservations.eventList());
            vems.myEvents.myEventsViewModel.currentReservations.pageCount(response.currentReservations.pageCount());
            vems.myEvents.myEventsViewModel.currentReservations.eventCount(response.currentReservations.eventCount());
            vems.myEvents.myEventsViewModel.pastReservations.eventList(response.pastReservations.eventList());
            vems.myEvents.myEventsViewModel.pastReservations.pageCount(response.pastReservations.pageCount());
            vems.myEvents.myEventsViewModel.pastReservations.eventCount(response.pastReservations.eventCount());
            $('.events-loading-overlay').fadeOut();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
};
/* end reservations tab */

/* bookings tab */
vems.myEvents.buildDatePicker = function () {
    var currentDate = moment(vems.myEvents.myEventsViewModel.bookingListDate());
    var dp = $('#bookings-datepicker').data('DateTimePicker');
    if (!dp) {  // if datepicker doesn't exist, create it, otherwise set the date
        $('#bookings-datepicker').datetimepicker({
            locale: moment.locale(),
            defaultDate: currentDate,
            format: 'LL',  // prevents time-selection
            ignoreReadonly: true,
            showTodayButton: true,
            icons: {
                today: "date-picker-today-btn"
            },
            widgetPositioning: {
                horizontal: 'left'
            }
        });
        $('#bookings-datepicker').on('dp.change', function (e) {
            var newDate = moment(e.date);
            if (!newDate.isSame(vems.myEvents.myEventsViewModel.lastBookingUpdate(), 'day')) {  // only update bookings when date actually changed
                vems.myEvents.myEventsViewModel.bookingListDate(newDate);
                vems.myEvents.clearBookingSearch();
            }
        });
    } else {
        dp.date(currentDate);
    }
};

vems.myEvents.buildWeeklyCalendar = function () {
    $('#bookings-calendar-week').dxCalendar({
        value: vems.myEvents.myEventsViewModel.bookingListDate()._d,
        width: '100%',
        cellTemplate: function (data, index, element) {
            var cellDate = moment($(element).data('value'));
            var container = $('<div>').addClass('calendar-cell-container');
            if (cellDate.isoWeekday() >= 6) {
                $(element).addClass('calendar-cell-weekend');
            }
            if (cellDate.isSame(moment(vems.myEvents.myEventsViewModel.bookingListDate()), 'day')) {
                $(element).addClass('dx-calendar-selected-date');  // force 'selection' on initial render
                $(element).parent().css('display', 'table-row');
            }

            container.append($('<div>').text(data.text));  // add day number
            // check for a number as the value to avoid drawing events when looking at months
            if (typeof data.text === 'number') {
                if (cellDate.weekday() === 0) {
                    $(element).append($('<div class="events-loading-overlay"></div>'));
                }

                var eventCount = 0;
                var cellDateKey = cellDate.format('YYYY-MM-DD');
                // add special dates to current cell
                var todaysSds = vems.myEvents.myEventsViewModel.specialDateList[cellDateKey];
                if (todaysSds) {
                    $.each(todaysSds(), function (idx, sd) {
                        eventCount++;
                        if (eventCount < 8) {
                            var event = $('<div>').addClass('calendar-cell-event').addClass('special-date');
                            event.text(vems.decodeHtml(sd.Description())).attr('title', vems.decodeHtml(sd.Notes() ? sd.Notes() : sd.Description()));
                            container.append(event);
                        } else {
                            return false;
                        }
                    });
                }

                // add events to current cell
                var todaysEvents = vems.myEvents.myEventsViewModel.monthlyBookings[cellDateKey];
                if (todaysEvents) {
                    $.each(todaysEvents.eventList(), function (idx, booking) {
                        eventCount++;
                        if (eventCount < 8) {
                            var event = $('<div>').addClass('calendar-cell-event');
                            if (booking.webUserIsOwner()) {
                                event.addClass('owned');
                            }
                            event.text(moment(booking.userStart()).format('LT').toLowerCase().replace(' ', '') + ' ' + vems.decodeHtml(booking.name()) + ', ' + vems.decodeHtml(booking.location()));
                            if (booking.statusId() === vems.myEvents.cancelledStatusId) {
                                event.addClass('cancelled');
                                event.text('(' + vems.myEvents.cancelledText + ') ' + event.text);
                            }
                            event.on('mousedown touchstart', function (e) {
                                e.preventDefault();
                                vems.bookingDetailsVM.show(booking.id(), booking.reservationId());
                            });
                            container.append(event);
                        } else {
                            return false;
                        }
                    });
                }

                // add 'more' link to cell when necessary
                eventCount = (todaysSds ? todaysSds().length : 0) + (todaysEvents ? todaysEvents.eventList().length : 0);
                if (eventCount > 7) {
                    var moreText = $('<div>').addClass('calendar-cell-more');
                    moreText.append($('<a>').text('+ ' + (eventCount - 7) + ' ' + vems.decodeHtml(vems.myEvents.moreText)));
                    container.append(moreText);
                }
            }

            container.on('click', function () {
                $('#bookings-grid-tabs a:first').click();
            });
            return container;
        },
        onValueChanged: function (data) {
            var newDate = moment(data.value);
            if (!newDate.isSame(vems.myEvents.myEventsViewModel.lastBookingUpdate(), 'day')) {
                vems.myEvents.myEventsViewModel.bookingListDate(moment(data.value));
                vems.myEvents.clearBookingSearch();
            }
        }
    });
};

vems.myEvents.buildMonthlyCalendar = function () {
    $('#bookings-calendar-month').dxCalendar({
        value: vems.myEvents.myEventsViewModel.bookingListDate()._d,
        width: '100%',
        cellTemplate: function (data, index, element) {
            var cellDate = moment($(element).data('value'));
            var container = $('<div>').addClass('calendar-cell-container');
            if (cellDate.isoWeekday() >= 6) {
                $(element).addClass('calendar-cell-weekend');
            }
            if (cellDate.isSame(moment(vems.myEvents.myEventsViewModel.bookingListDate()), 'day')) {
                $(element).addClass('dx-calendar-selected-date');  // force 'selection' on initial render
            }

            container.append($('<div>').text(data.text));  // add day number
            // check for a number as the value to avoid drawing events when looking at months
            if (typeof data.text === 'number') {
                if ($(element).parent().parent().find('.events-loading-overlay').length === 0) {
                    $(element).append($('<div class="events-loading-overlay"></div>'));
                }

                var eventCount = 0;
                var cellDateKey = cellDate.format('YYYY-MM-DD');
                // add special dates to current cell
                var todaysSds = vems.myEvents.myEventsViewModel.specialDateList[cellDateKey];
                if (todaysSds) {
                    $.each(todaysSds(), function (idx, sd) {
                        eventCount++;
                        if (eventCount < 4) {
                            var event = $('<div>').addClass('calendar-cell-event').addClass('special-date');
                            event.text(vems.decodeHtml(sd.Description())).attr('title', vems.decodeHtml(sd.Notes() ? sd.Notes() : sd.Description()));
                            container.append(event);
                        } else {
                            return false;
                        }
                    });
                }
                
                // add events to current cell
                var todaysEvents = vems.myEvents.myEventsViewModel.monthlyBookings[cellDateKey];
                if (todaysEvents) {
                    $.each(todaysEvents.eventList(), function (idx, booking) {
                        eventCount++;
                        if (eventCount < 4) {
                            var event = $('<div>').addClass('calendar-cell-event');
                            if (booking.webUserIsOwner()) {
                                event.addClass('owned');
                            }
                            event.text(moment(booking.userStart()).format('LT').toLowerCase().replace(' ', '') + ' ' + vems.decodeHtml(booking.name()) + ', ' + vems.decodeHtml(booking.location()));
                            if (booking.statusId() === vems.myEvents.cancelledStatusId) {
                                event.addClass('cancelled');
                                event.text('(' + vems.myEvents.cancelledText + ') ' + event.text);
                            }
                            event.on('mousedown touchstart', function (e) {
                                e.preventDefault();
                                vems.bookingDetailsVM.show(booking.id(), booking.reservationId());
                            });
                            container.append(event);
                        } else {
                            return false;
                        }
                    });
                }

                // add 'more' link to cell when necessary
                eventCount = (todaysSds ? todaysSds().length : 0) + (todaysEvents ? todaysEvents.eventList().length : 0);
                if (eventCount > 3) {
                    var moreText = $('<div>').addClass('calendar-cell-more');
                    moreText.append($('<a>').text('+ ' + (eventCount - 3) + ' ' + vems.decodeHtml(vems.myEvents.moreText)));
                    container.append(moreText);
                }
            }

            container.on('click', function () {
                $('#bookings-grid-tabs a:first').click();
            });
            return container;
        },
        onValueChanged: function (data) {
            var newDate = moment(data.value);
            if (!newDate.isSame(vems.myEvents.myEventsViewModel.lastBookingUpdate(), 'day')) {
                vems.myEvents.myEventsViewModel.bookingListDate(moment(data.value));
                vems.myEvents.clearBookingSearch();
            }
        }
    });
};

vems.myEvents.buildCalendarControls = function () {
    vems.myEvents.buildDatePicker();
    vems.myEvents.buildWeeklyCalendar();
    vems.myEvents.buildMonthlyCalendar();
};

vems.myEvents.sortBookings = function (sortProp) {
    if (vems.myEvents.myEventsViewModel.dailyBookings.sortProperty() === sortProp) {
        vems.myEvents.myEventsViewModel.dailyBookings.sortDescending(
            !vems.myEvents.myEventsViewModel.dailyBookings.sortDescending());
    } else {
        vems.myEvents.myEventsViewModel.dailyBookings.sortDescending(false);
    }
    vems.myEvents.myEventsViewModel.dailyBookings.sortProperty(sortProp);
    vems.myEvents.myEventsViewModel.dailyBookings.pageIndex(0);
    vems.myEvents.updateBookings();
};

vems.myEvents.changeBookingPage = function (pageIdx) {
    vems.myEvents.myEventsViewModel.dailyBookings.pageIndex(pageIdx);
    vems.myEvents.updateBookings();
};

vems.myEvents.searchBookings = function () {
    vems.myEvents.myEventsViewModel.bookingSearchText($('#booking-search').val());
    vems.myEvents.updateBookings();
};

vems.myEvents.clearBookingSearch = function () {
    $('#booking-search').val('');
    vems.myEvents.myEventsViewModel.dailyBookings.pageIndex(0);
    vems.myEvents.searchBookings();
};

vems.myEvents.myBookingsPrevious = function () {
    var currentDate = moment(vems.myEvents.myEventsViewModel.bookingListDate());
    switch (vems.myEvents.myEventsViewModel.bookingTab()) {
        case 'day':
            currentDate.subtract(1, 'days');
            break;
        case 'week':
            currentDate.subtract(7, 'days');
            break;
        case 'month':
            currentDate.subtract(1, 'months');
            break;
    }
    vems.myEvents.myEventsViewModel.bookingListDate(currentDate);
    vems.myEvents.buildDatePicker();
};

vems.myEvents.myBookingsToday = function () {
    vems.myEvents.myEventsViewModel.bookingListDate(moment().startOf('day'));
    vems.myEvents.buildDatePicker();
};

vems.myEvents.myBookingsNext = function () {
    var currentDate = moment(vems.myEvents.myEventsViewModel.bookingListDate());
    switch (vems.myEvents.myEventsViewModel.bookingTab()) {
        case 'day':
            currentDate.add(1, 'days');
            break;
        case 'week':
            currentDate.add(7, 'days');
            break;
        case 'month':
            currentDate.add(1, 'months');
            break;
    }
    vems.myEvents.myEventsViewModel.bookingListDate(currentDate);
    vems.myEvents.buildDatePicker();
};

vems.myEvents.showDailyBookings = function () {
    vems.myEvents.myEventsViewModel.bookingTab('day');
};

vems.myEvents.showWeeklyBookings = function () {
    vems.myEvents.myEventsViewModel.bookingTab('week');

    // manually localize calendar day abbreviations
    var dayLabels = $('#bookings-calendar-week thead th');
    if (dayLabels.length > 0) {
        $.each(dayLabels, function (idx, dayTh) {
            var day = $(dayTh);
            switch (day.text().toLowerCase()) {
                case 'sun':
                    day.text(moment().isoWeekday(7).format('ddd'));
                    break;
                case 'mon':
                    day.text(moment().isoWeekday(1).format('ddd'));
                    break;
                case 'tue':
                    day.text(moment().isoWeekday(2).format('ddd'));
                    break;
                case 'wed':
                    day.text(moment().isoWeekday(3).format('ddd'));
                    break;
                case 'thu':
                    day.text(moment().isoWeekday(4).format('ddd'));
                    break;
                case 'fri':
                    day.text(moment().isoWeekday(5).format('ddd'));
                    break;
                case 'sat':
                    day.text(moment().isoWeekday(6).format('ddd'));
                    break;
            }
        });
    }
};

vems.myEvents.showMonthlyBookings = function () {
    vems.myEvents.myEventsViewModel.bookingTab('month');

    // manually localize calendar day abbreviations
    var dayLabels = $('#bookings-calendar-month thead th');
    if (dayLabels.length > 0) {
        $.each(dayLabels, function (idx, dayTh) {
            var day = $(dayTh);
            switch (day.text().toLowerCase()) {
                case 'sun':
                    day.text(moment().isoWeekday(7).format('ddd'));
                    break;
                case 'mon':
                    day.text(moment().isoWeekday(1).format('ddd'));
                    break;
                case 'tue':
                    day.text(moment().isoWeekday(2).format('ddd'));
                    break;
                case 'wed':
                    day.text(moment().isoWeekday(3).format('ddd'));
                    break;
                case 'thu':
                    day.text(moment().isoWeekday(4).format('ddd'));
                    break;
                case 'fri':
                    day.text(moment().isoWeekday(5).format('ddd'));
                    break;
                case 'sat':
                    day.text(moment().isoWeekday(6).format('ddd'));
                    break;
            }
        });
    }
};

vems.myEvents.checkInToBooking = function (booking, event) {
    $('.events-loading-overlay').show();
    $(event.target).closest('.btn-xs').hide();  // hide the check-in button immediately to prevent multiple clicks
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/CheckInToBooking',
        data: JSON.stringify({ bookingId: booking.id() }),
        success: function (response) {
            var retObj = JSON.parse(response.d);
            if (retObj.Success) {
                var b = JSON.parse(retObj.JsonData);

                if (b.IsCheckedIn) {
                    vems.showToasterMessage('', retObj.SuccessMessage, 'success');
                } else {
                    vems.showErrorToasterMessage(retObj.ErrorMessage);
                }
            } else {
                vems.showErrorToasterMessage(retObj.ErrorMessage);
            }
            vems.myEvents.updateBookings();  // refresh bookings to ensure up-to-date data is displayed
        }
    });
};

vems.myEvents.cancelBooking = function (booking, event) {
    var form = $('#VirtualEmsForm');
    var modal = $('#cancel-modal');
    var confirmBtn = $('#cancel-btn-yes', modal);
    var date = $('.date', modal);
    var eventName = $('.event-name', modal);
    var location = $('.location', modal);
    var reason = $('.reason select', modal);
    var notes = $('.notes textarea', modal);
    var cancelBtn = $(event.target).closest('.btn-xs');

    // enable validation for modal
    form.validate(vems.validationClasses);

    // populate booking date/name/location details in modal
    date.html('<strong>' + moment(booking.userStart()).format('dddd, LL, [from] LT [to {0}]').replace('{0}', moment(booking.end()).format('LT')) + '</strong>');
    eventName.text(vems.htmlDecode(booking.name()));
    location.text(vems.htmlDecode(booking.location()));

    // show/hide cancel reason/notes sections as necessary and add validation rules
    if (booking.requireCancelReason()) {
        $('.reason', modal).show();
        $('.notes', modal).show();
        reason.rules('add', { required: true });
        notes.rules('add', { sanitize: true });

        reason.on('change', function (e) {
            if ($('option:selected', this).data('notes-required')) {
                notes.rules('add', { required: true, trim: true });
            } else if (notes.rules() && Object.keys(notes.rules()).length > 0) {
                notes.rules('remove', 'required');
                notes.rules('remove', 'trim');
                form.data('validator').resetForm();
            }
        });
    } else {
        $('.reason', modal).hide();
        $('.notes', modal).hide();
    }

    // initialize the modal and bind show/hide events
    modal.modal();
    modal.on('shown.bs.modal', function (event) {
        form.data('validator').resetForm();
        reason.val(booking.defaultCancelReason()).change();  // set default cancel reason and trigger change for required notes validation
    });
    modal.on('hidden.bs.modal', function (event) {
        reason.val('');
        notes.val('');
        notes.rules('remove');
        confirmBtn.off('click');
    });

    // bind cancel confirmation event
    confirmBtn.on('click', function (e) {
        if (!form.valid()) {
            return false;
        }

        var dataCollection = {
            reservationId: booking.reservationId(),
            bookingId: booking.id(),
            cancelReason: booking.requireCancelReason() ? reason.val() : 0,
            cancelNotes: booking.requireCancelReason() ? notes.val() : ''
        };

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/CancelBooking',
            data: JSON.stringify(dataCollection),
            success: function (response) {
                var retObj = JSON.parse(response.d);
                if (retObj.Success) {
                    cancelBtn.hide();
                    modal.modal('hide');
                    vems.myEvents.updateBookings();
                    var msg = retObj.SuccessMessage.replace('{0}', '<b>' + booking.name() + '</b>');
                    vems.showToasterMessage('', msg, 'success');
                } else {
                    vems.showErrorToasterMessage(retObj.ErrorMessage);
                    return false;
                }
            }
        });
    });
};

vems.myEvents.endBookingNow = function (booking, event) {
    var modal = $('#endnow-modal');
    var confirmBtn = $('#endnow-btn-yes', modal);
    var date = $('.date', modal);
    var eventName = $('.event-name', modal);
    var location = $('.location', modal);
    var endNowBtn = $(event.target).closest('.btn-xs');

    // populate booking date/name/location details in modal
    date.html('<strong>' + moment(booking.userStart()).format('dddd, LL, [from] LT [to {0}]').replace('{0}', moment(booking.end()).format('LT')) + '</strong>');
    eventName.text(vems.htmlDecode(booking.name()));
    location.text(vems.htmlDecode(booking.location()));

    // initialize modal
    modal.modal();

    // bind end now confirmation event
    var dataCollection = {
        reservationId: booking.reservationId(),
        bookingId: booking.id()
    };
    confirmBtn.on('click', function () {
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/EndBookingNow',
            data: JSON.stringify(dataCollection),
            success: function (response) {
                var retObj = JSON.parse(response.d);
                if (retObj.Success) {
                    var newbooking = JSON.parse(retObj.JsonData);
                    endNowBtn.hide();
                    modal.modal('hide');
                    vems.myEvents.updateBookings();
                    var msg = retObj.SuccessMessage.replace('{0}', '<b>' + newbooking.EventName + '</b>');
                    vems.showToasterMessage('', msg, 'success');
                } else {
                    vems.showErrorToasterMessage(retObj.ErrorMessage);
                }
            }
        });
    });
};

vems.myEvents.updateBookings = function () {
    $('.events-loading-overlay').show();
    vems.myEvents.myEventsViewModel.lastBookingUpdate(moment(vems.myEvents.myEventsViewModel.bookingListDate()));
    var jsVm = ko.toJS(vems.myEvents.myEventsViewModel);
    jsVm.bookingListDate = moment(jsVm.bookingListDate).format('YYYY-MM-DD');
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/PopulateBookingList',
        data: JSON.stringify({ vm: jsVm }),
        success: function (result) {
            var response = ko.mapping.fromJS(JSON.parse(result.d));
            vems.myEvents.myEventsViewModel.dailyBookings.eventList(response.dailyBookings.eventList());
            vems.myEvents.myEventsViewModel.dailyBookings.pageCount(response.dailyBookings.pageCount());
            vems.myEvents.myEventsViewModel.dailyBookings.eventCount(response.dailyBookings.eventCount());
            vems.myEvents.myEventsViewModel.monthlyBookings = response.monthlyBookings;
            vems.myEvents.myEventsViewModel.specialDateList = response.specialDateList;
            vems.myEvents.buildCalendarControls();
            $('.events-loading-overlay').fadeOut();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            $('.events-loading-overlay').fadeOut();
        }
    });
};
/* end bookings tab */


