/// <reference path="vems.js" />
var vems = vems || {};
vems.home = vems.home || {};
vems.home.viewModels = vems.home.viewModels || {};

// note: these should match the background-color values in the corresponding css classes
vems.home.colorPalette = ['#b5c6de', //status-reserved
                          '#375581', //status-request
                          '#142a4b', //status-conflict
                          '#6881a5', //status-cancelled
                          '#809CC7',
                          '#e9ecf1', //status-past
                          'transparent' //unknown status
];
vems.home.hoverColorPalette = ['#cfe0f8', //status-reserved
                               '#516f9b', //status-request
                               '#2e4465', //status-conflict
                               '#829bbf' //status-cancelled
];

vems.home.getBookingCounts = function (date) {
    var safeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetEventCountsBydate',
        data: '{ date : \'' + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + '\' }',
        success: function (results) {
            vems.home.bookingCounts = JSON.parse(results.d);

            if (typeof $('#bookings-monthly-calendar').data('dxCalendar') !== 'undefined') {
                $('#bookings-monthly-calendar').data('dxCalendar').repaint();
                $('#bookings-monthly-calendar .dx-calendar-cell').has('.calendar-cell-weekend').css('background-color', '#F2F2EA');
            }
        }
    });
};

vems.home.calendarButtonClicked = false;

vems.home.buildCalendar = function () {
    $('#bookings-monthly-calendar').dxCalendar({
        value: new Date(),
        min: new Date(1990, 0, 1),
        max: new Date(2150, 0, 1),
        height: '400px',
        width: '100%',
        cellTemplate: function (data, index, element) {
            var calendarDate = new Date($(element).data('value'));

            var container = $('<div>').addClass('calendar-cell-container');

            if (calendarDate.getDay() === 6 || calendarDate.getDay() === 0) { // weekend
                container.addClass('calendar-cell-weekend');
            }

            container.append($('<div>').addClass('calendar-cell-text').text(data.text));

            var gaugeHeight = 0;

            // check for a number as the value to avoid drawing bars when looking at months
            if (typeof data.text === 'number' && vems.home.bookingCounts && vems.home.bookingCounts.EventCounts) {
                var dateCount = $.grep(vems.home.bookingCounts.EventCounts, function (n, i) {
                    return moment(n.Date).isSame(calendarDate) && n.ReserveType !== 3; // Exclude cancelled from calendar
                });
                if (dateCount && dateCount.length > 0) {

                    var totalBookings = 0;

                    $.each(dateCount, function (key, value) {
                        totalBookings += value.BookingCount;
                    });

                    gaugeHeight = totalBookings * 5;
                }
                container.append($('<div>').addClass('calendar-cell-gauge').height(gaugeHeight));
            }
            return container;
        },
        onOptionChanged: function (data) {
            if (data.name === 'currentDate') {
                vems.home.getBookingCounts(new Date(data.value));
            }
        },
        onValueChanged: function (data) {
            if (vems.home.calendarButtonClicked) {
                vems.home.calendarButtonClicked = false;
                return true;
            }

            $('#my-bookings-tabs a:first').tab('show');

            getEventsForDay(new Date(data.value));
        }
    });

    $('#bookings-monthly-calendar .dx-calendar-cell').has('.calendar-cell-weekend').css('background-color', '#F2F2EA');

    $('#bookings-monthly-calendar').on('dxswipeend', function (event) {
        var el = $(this);
        var nd = el.data('dxCalendar')._newDate;

        //GG - We need to set the date this way because $(this).data('dxCalendar').option('value', nd) locks up the calendar.
        //     NOTE: changing the value this way does NOT fire the value changed event.
        el.data('dxCalendar')._options.value = nd;

        vems.home.viewModels.myBookings.localeDate(moment(nd).format('MMMM YYYY'));
    });

    $('#bookings-monthly-calendar').on('click', '.dx-calendar-selected-date', function () {
        var date = $('#bookings-monthly-calendar').data('dxCalendar').option('value');

        $('#my-bookings-tabs a:first').tab('show');

        getEventsForDay(date);
    });
};

vems.home.buildEventPieChart = function (element, chartType) {
    var dataSource = [];

    var date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    var bookingCount = 0;

    var getSourceItems = function (reserveType) {
        return $.grep(dataSource, function (nn) {
            return nn.reserveType === reserveType;
        });
    };

    var start, end;

    if (chartType === 'day') {
        $.each(vems.home.bookingCounts.EventCounts, function (n, i) {
            var itemDate = new Date(moment(i.Date.split('T')[0]).format());

            if (moment(itemDate).isSame(date)) {

                var items = $.grep(dataSource, function (n) {
                    return n.reserveType === i.ReserveType;
                });

                if (items.length === 0) {
                    dataSource.push({ reserveType: i.ReserveType, bookingCount: i.BookingCount });
                } else {
                    items[0].bookingCount = items[0].bookingCount + i.BookingCount;
                }

                bookingCount += i.BookingCount;
            }
        });

        $('#day-chart-count').text(bookingCount);

        start = date;
        end = date;
    } else if (chartType === 'week') {
        var weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        var weekEnd = new Date(date.setDate(date.getDate() - date.getDay() + 6));

        $.each(vems.home.bookingCounts.EventCounts, function (n, i) {
            var itemDate = new Date(moment(i.Date.split('T')[0]).format());

            if (itemDate >= weekStart && itemDate <= weekEnd) {

                var sourceItems = getSourceItems(i.ReserveType);

                if (sourceItems && sourceItems.length > 0) {
                    sourceItems[0].bookingCount += i.BookingCount;
                } else {
                    dataSource.push({ reserveType: i.ReserveType, bookingCount: i.BookingCount });
                }

                bookingCount += i.BookingCount;
            }
        });

        $('#week-chart-count').text(bookingCount);

        start = weekStart;
        end = weekEnd;

    } else if (chartType === 'month') {
        var monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        var monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        $.each(vems.home.bookingCounts.EventCounts, function (n, i) {
            var itemDate = new Date(moment(i.Date.split('T')[0]).format());

            if (itemDate >= monthStart && itemDate <= monthEnd) {
                var sourceItems = getSourceItems(i.ReserveType);

                if (sourceItems && sourceItems.length > 0) {
                    sourceItems[0].bookingCount += i.BookingCount;
                } else {
                    dataSource.push({ reserveType: i.ReserveType, bookingCount: i.BookingCount });
                }

                bookingCount += i.BookingCount;
            }
        });

        $('#month-chart-count').text(bookingCount);

        start = monthStart;
        end = monthEnd;
    }

    $.each(dataSource, function (i, n) {
        switch (n.reserveType) {
            case 0: // Reserved
                n.typeLabel = vems.home.bookingCounts.ReservedLabel;
                break;
            case 1: // Requested
                n.typeLabel = vems.home.bookingCounts.RequestedLabel;
                break;
            case 2: // Conflicting
                n.typeLabel = vems.home.bookingCounts.ConflictingLabel;
                break;
            case 3: // Cancelled
                n.typeLabel = vems.home.bookingCounts.CancelledLabel;
                break;
        }
    });

    dataSource = dataSource.sort(function (a, b) {
        var aVal = parseInt(a.reserveType, 10);
        var bVal = parseInt(b.reserveType, 10);

        if (aVal < bVal) {
            return -1;
        }

        if (aVal === bVal) {
            return 0;
        }

        if (aVal > bVal) {
            return 1;
        }
    });

    $(element).dxPieChart({
        dataSource: dataSource,
        legend: {
            horizontalAlignment: 'right',
            verticalAlignment: 'top',
            font: {
                family: '"Open Sans", sans-serif'
            },
            customizeText: function (arg) {
                for (var i = 0; i < dataSource.length; i++) {
                    if (dataSource[i].typeLabel === arg.pointName) {
                        return dataSource[i].bookingCount + ' ' + arg.pointName;
                    }
                }
            }
        },
        series: [
            {
                argumentField: 'typeLabel',
                valueField: 'bookingCount',
                label: {
                    visible: false,
                    position: 'inside'
                },
                hoverStyle: {
                    hatching: {
                        direction: 'none'
                    }
                }
            }
        ],
        tooltip: {
            enabled: true,
            font: {
                family: '"Open Sans", sans-serif'
            },
            customizeTooltip: function (arg) {
                return {
                    html: '<div>' + arg.value + ' ' + arg.argument + ' (' + arg.percentText + ')</div>'
                };
            }
        },
        customizePoint: function (point) {
            var color = '';
            var hoverColor = '';
            switch (point.argument) {
                case vems.home.bookingCounts.ReservedLabel: // Reserved
                    color = vems.home.colorPalette[0];
                    hoverColor = vems.home.hoverColorPalette[0];
                    break;
                case vems.home.bookingCounts.RequestedLabel: // Requested
                    color = vems.home.colorPalette[1];
                    hoverColor = vems.home.hoverColorPalette[1];
                    break;
                case vems.home.bookingCounts.ConflictingLabel: // Conflicting
                    color = vems.home.colorPalette[2];
                    hoverColor = vems.home.hoverColorPalette[2];
                    break;
                case vems.home.bookingCounts.CancelledLabel: // Cancelled
                    color = vems.home.colorPalette[3];
                    hoverColor = vems.home.hoverColorPalette[3];
                    break;
            }

            return {
                color: color,
                hoverStyle: {
                    color: hoverColor
                }
            };
        },
        onPointClick: function (e) {
            var reserveType;
            switch (e.target.argument) {
                case vems.home.bookingCounts.ReservedLabel: // Reserved
                    reserveType = 0;
                    break;
                case vems.home.bookingCounts.RequestedLabel: // Requested
                    reserveType = 1;
                    break;
                case vems.home.bookingCounts.ConflictingLabel: // Conflicting
                    reserveType = 2;
                    break;
                case vems.home.bookingCounts.CancelledLabel: // Cancelled
                    reserveType = 3;
                    break;
                default:
                    reserveType = -1;
            }

            function textDate(dateObj) {
                return dateObj.getFullYear() + '-' + dateObj.getMonth() + 1 + '-' + dateObj.getDate();
            }

            window.location = 'BrowseReservations.aspx?startdate=' + textDate(start) + '&enddate=' + textDate(end) + '&reservetype=' + reserveType;
        },
        onDone: function (e) {
            if (e.target) {
                $.each(e.target._legend._patterns, function (i, v) {
                    if (v.element)
                        $(v.element).remove();
                    else
                        $(v.path.element).remove();
                });
            }
        }
    });
};

vems.home.buildDatePicker = function () {
    var currentDate = vems.home.viewModels.myBookings.currentDailyDate;
    var dp = $('#my-bookings-datepicker').data('DateTimePicker');
    if (!dp) {  // if datepicker doesn't exist, create it, otherwise set the date
        $('#my-bookings-datepicker').datetimepicker({
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
        $('#my-bookings-datepicker').on('dp.change', function (e) {
            if (!e.date.startOf('day').isSame(e.oldDate)) {
                $('#my-bookings-tabs a:first').tab('show');
                getEventsForDay(e.date);
            }
        });
    } else {
        dp.date(currentDate);
    }
};

vems.home.templateVM = function () {
    var self = this;
    self.templates = ko.observableArray(vems.webTemplates);

    self.templateClick = function (data, event) {
        window.location = data.NavigateUrl;
    };
};

vems.home.myBookingsVM = function () {
    var self = this;
    var today = new Date();
    var events = vems.todaysEventsForUser.EventData && vems.todaysEventsForUser.EventData.length > 0 ?
                vems.todaysEventsForUser.EventData[0].Events :
                [];

    self.localeDate = ko.observable(moment(today).format('LL'));
    self.events = ko.observableArray(events);
    self.nextBookingDate = ko.observable(vems.todaysEventsForUser.NextBookingDate);
    self.userTimeZone = ko.observable(vems.todaysEventsForUser.UserTimeZone);
    self.userTimeZoneAbbr = ko.observable(vems.todaysEventsForUser.UserTimeZoneAbbr);
    self.selectedTab = ko.observable($('#my-bookings-tabs').children().index($('#my-bookings-tabs li.active'))); // 0 = daily, 1 = monthly

    self.cancelReasons = vems.cancelReasons;
    self.currentDailyDate = moment(today);
    self.activeBooking = ko.observable(events[0]);

    self.getReserveType = function (reserveType, eventEnd) {
        var mToday = moment(today);
        var est = moment(eventEnd);
        var rt = reserveType;
        if (reserveType === -1) { //unknown status
            rt = 6;
        } else if (est.diff(mToday) < 0) { //past status
            rt = 5;
        }

        return vems.home.colorPalette[rt];
    };

    self.previousTodayNextHandler = function (increment) {
        var today = new Date();

        if (self.selectedTab() === 0) { // Daily
            self.currentDailyDate = increment === 0 ?
                moment(today) :
                self.currentDailyDate.add(increment, 'Days');

            getEventsForDay(self.currentDailyDate);
        }
        else if (self.selectedTab() === 1) { // Monthly
            vems.home.calendarButtonClicked = true;

            var calendarVal = $('#bookings-monthly-calendar').data('dxCalendar').option('value');

            if (increment === 0) { // Today
                calendarVal = new Date();
            } else {
                var year = calendarVal.year ? calendarVal.year() : calendarVal.getFullYear();
                var month = calendarVal.month ? calendarVal.month() : calendarVal.getMonth();

                calendarVal = new Date(year, month + increment, 1);
            }

            $('#bookings-monthly-calendar').data('dxCalendar').option('value', calendarVal);

            vems.home.viewModels.myBookings.localeDate(moment(calendarVal).format('MMMM YYYY'));
        }
    };

    self.cancelBooking = function (booking, event) {
        self.activeBooking(booking);
        var form = $('#VirtualEmsForm');
        var modal = $('#cancel-modal');
        var confirmBtn = $('#cancelBookingBtn', modal);
        var clickedRow = $(event.target).closest('.row');
        var reason = $('.reason select', modal);
        var notes = $('.notes textarea', modal);
        var bookingWasCancelled = false;

        form.validate(vems.validationClasses);

        if (booking.RequiresCancelReason) {
            reason.rules('add', { required: true });
            notes.rules('add', { sanitize: true });

            if ($('option:selected', reason).data().notesRequired) {
                notes.rules('add', { required: true, trim: true });
            }

            reason.on('change', function (e) {
                if ($('option:selected', this).data('notes-required')) {
                    notes.rules('add', { required: true, trim: true });
                } else if (notes.rules() && Object.keys(notes.rules()).length > 0) {
                    notes.rules('remove', 'required');
                    notes.rules('remove', 'trim');
                    form.data('validator').resetForm();
                }
            });
        }

        modal.modal();

        confirmBtn.on('click', function (e) {
            if (!form.valid()) {
                return false;
            }

            var dataCollection = {
                reservationId: booking.ReservationId,
                bookingId: booking.Id,
                cancelReason: booking.RequiresCancelReason ? reason.val() : 0,
                cancelNotes: booking.RequiresCancelReason ? notes.val() : ""
            };

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/CancelBooking',
                data: JSON.stringify(dataCollection),
                success: function (response) {
                    var retObj = JSON.parse(response.d);
                    if (retObj.Success) {
                        bookingWasCancelled = true;
                        modal.modal('hide');
                        var msg = retObj.SuccessMessage.replace('{0}', '<b>' + booking.EventName + '</b>');
                        vems.showToasterMessage('', msg, 'success');
                    }
                    else {
                        vems.showErrorToasterMessage(retObj.ErrorMessage);
                        return false;
                    }
                }
            });
        });

        //GG - The validator can't reset the form if any elements are hidden, so we have to do it on load
        modal.on('shown.bs.modal', function (event) {
            form.data('validator').resetForm();
        });

        modal.on('hidden.bs.modal', function (event) {
            if (bookingWasCancelled) {
                clickedRow.fadeOut(function () {
                    $(this).remove();
                    self.events.remove(booking);

                    if (self.events().length === 0 && moment(self.nextBookingDate()).diff(moment(booking.EventStart)) === 0) {
                        self.nextBookingDate(null);
                    }
                });
            }

            if (reason.length > 0 && notes.length > 0) {
                reason.val('');
                notes.val('');
                notes.rules('remove');
                confirmBtn.off('click');
            }
        });
    };

    self.endBookingNow = function (booking, event) {
        var modal = $('#endnow-modal');
        var confirmBtn = $('#endBookingBtn', modal);
        var date = $('.date', modal);
        var eventName = $('.event-name', modal);
        var location = $('.location', modal);
        var clickedRow = $(event.target).closest('tr');

        date.html('<strong>' + moment(booking.UserEventStart).format('dddd, MMMM Do, YYYY, [from] h:mm [to {0}] A').replace('{0}', moment(booking.UserEventEnd).format('h:mm')) + '</strong>');
        eventName.text(booking.EventName);
        location.text(booking.Building + ' - ' + booking.Room);

        modal.modal();

        var dataCollection = {
            reservationId: booking.ReservationId,
            bookingId: booking.Id
        };

        confirmBtn.one('click', function () {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/EndBookingNow',
                data: JSON.stringify(dataCollection),
                success: function (response) {
                    var retObj = JSON.parse(response.d);
                    if (retObj.Success) {
                        var newBooking = JSON.parse(retObj.JsonData);

                        // replace the booking in the event list
                        var eventList = vems.home.viewModels.myBookings.events();
                        if (eventList.length > 0) {
                            var indexNum = $.inArray(booking, eventList);
                            if (indexNum >= 0) {
                                vems.home.viewModels.myBookings.events.splice(indexNum, 1, newBooking);
                            }
                        }

                        // replace the booking in the search results list
                        var searchResults = vems.home.viewModels.myBookings.searchResults();
                        if (searchResults.length > 0) {
                            var srIndexNum = $.inArray(booking, searchResults);
                            if (srIndexNum >= 0) {
                                vems.home.viewModels.myBookings.searchResults.splice(srIndexNum, 1, newBooking);
                            }
                        }

                        modal.modal('hide');
                        var msg = retObj.SuccessMessage.replace('{0}', '<b>' + newBooking.EventName + '</b>');
                        var alert = vems.showToasterMessage('', msg, 'success');
                    }
                    else {
                        vems.showErrorToasterMessage(retObj.ErrorMessage);
                    }
                }
            });
        });
    };

    self.checkInToEvent = function (booking, event) {
        $('.events-loading-overlay').show();
        $(event.target).hide();
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/CheckInToBooking',
            data: JSON.stringify({ bookingId: booking.Id }),
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
                getEventsForDay(vems.home.viewModels.myBookings.currentDailyDate);  // refresh bookings to ensure up-to-date data is displayed
            }
        });
    };

    self.searchForBookings = function () {
        $('#booking-search-instructions').hide();
        $('#booking-search-results').show();
        $('#booking-search-count').show();

        var searchText = $('#booking-search-box').val();

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/searchForBookings',
            data: JSON.stringify({ searchText: searchText }),
            success: function (results) {
                var result = JSON.parse(results.d);
                self.searchResults(result.EventData[0].Events);
                sortResults();

                if (self.searchRecordCount() === 0) {
                    $('#booking-no-results-head').text(vems.decodeHtml(vems.screenText.NoSearchResults.replace("{0}", searchText)));
                    $('#booking-no-results').show();
                    $('#booking-search-results').hide();
                }
                else {
                    $('#booking-no-results').hide();
                    $('#booking-search-results').show();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                return false;
            }
        });
    };

    self.searchResults = ko.observableArray();

    self.searchRecordCount = ko.pureComputed(function () {
        return self.searchResults().length;
    });

    self.searchRecordCountLabel = ko.pureComputed(function () {
        if (self.searchResults().length === 1) {
            return self.searchResults().length + ' ' + vems.decodeHtml(vems.screenText.Result);
        } else {
            return self.searchResults().length + ' ' + vems.decodeHtml(vems.screenText.Results);
        }
    });

    var column = "EventStart";
    var direction = "ASC";

    var sortResults = function () {
        var comparer = function (a, b) {
            if (a[column] < b[column])
                return direction == "ASC" ? -1 : 1;
            else if (a[column] > b[column])
                return direction == "ASC" ? 1 : -1;
            else
                return 0;
        };

        self.searchResults.sort(comparer);
    };

    self.sortSearchResults = function (data, event) {
        var target = $(event.target);
        var sortIndicator = $(event.target).find('i');

        switch ($(event.target).attr('id')) {
            case "booking-search-header-title":
                column = "EventName";
                break;
            case "booking-search-header-location":
                column = "Location";
                break;
            case "booking-search-header-date":
                column = "EventStart";
                break;
        }

        if (sortIndicator.length > 0) { // previously sorted column, adjust direction
            if (sortIndicator.eq(0).hasClass('fa-angle-up')) {
                direction = "DES";
                sortIndicator.eq(0).removeClass('fa-angle-up').addClass('fa-angle-down');
            } else {
                direction = "ASC";
                sortIndicator.eq(0).removeClass('fa-angle-down').addClass('fa-angle-up');
            }
        } else { // No previous sort, add sort indicator
            direction = "ASC";

            $('#booking-search-sort-indicator').remove();
            $("<i id='booking-search-sort-indicator' class='fa fa-angle-up'></i>").appendTo(target);
        }

        sortResults();
    };

    self.showMap = function (booking) {
        var bookingData = ko.mapping.fromJS(booking);
        var FloorMapRoomInfo = buildFloorMapRoomInfo(bookingData);
        vems.floorPlanModalVM.buildModalMapForRoom(FloorMapRoomInfo);
        return false;
    };

    $('#my-bookings-tabs').on('show.bs.tab', function (event) {
        self.selectedTab($(this).children().index($(event.target).parent()));
    });
};

function getEventsForDay(date) {
    var momentDate = moment(date);
    var dateStr = momentDate.year() + '-' + (momentDate.month() + 1) + '-' + momentDate.date();
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/SetMyRequestDataVar',
        data: '{date : \'' + dateStr + '\'}'
    }).success(function (result) {
        var data = JSON.parse(result.d);
        var nextDate = data.NextBookingDate === null ? null : moment(data.NextBookingDate);
        var dateFormat = vems.home.viewModels.myBookings.selectedTab() === 0 ? 'LL' : 'MMMM YYYY';

        if ($('#sliderContainer').data('ems_calendarScroller') && date == vems.home.viewModels.myBookings.nextBookingDate()) {
            $('#sliderContainer').data('ems_calendarScroller').setDate(date);
        }

        vems.home.viewModels.myBookings.events(data.EventData[0].Events);
        vems.home.viewModels.myBookings.currentDailyDate = momentDate;
        vems.home.viewModels.myBookings.localeDate(momentDate.format(dateFormat));
        vems.home.viewModels.myBookings.nextBookingDate(nextDate);

        if (!DevExpress.devices.real().phone) {
            vems.home.buildDatePicker();  // refresh datepicker with current date when in desktop mode
        }

        if ($('#sliderContainer').data('ems_calendarScroller')) {
            $('#sliderContainer').data('ems_calendarScroller').setLock(false);
        }

        $('.events-loading-overlay').fadeOut();
    }).error(function (xhr, ajaxOptions, thrownError) {
        window.location.reload(true);
    });
}

function buildFloorMapRoomInfo(roomData) {
    var ri = new FloorMapRoomInfo();
    if (roomData.Floor)
        ri.Floor(roomData.Floor());
    ri.FloorMapID(roomData.ImageId());
    ri.RoomID(roomData.RoomId());
    ri.RoomCode(roomData.RoomCode());
    ri.RoomDescription(roomData.Location());
    if (roomData.RoomType)
        ri.RoomType(roomData.RoomType());
    ri.FloorMapHash(FloorMapHash);
    ri.FloorMapWebserviceUrl(FloorMapWebServiceUrl);
    ri.ImageWidth(roomData.ImageWidth());
    ri.ImageHeight(roomData.ImageHeight());
    if (roomData.ReservationSummaryUrl)
        ri.ReservationSummaryUrl(roomData.ReservationSummaryUrl)
    return ri;
};

$(document).on('click', '#my-bookings-search-tab a', function () {
    setTimeout(function () { $('#booking-search-box')[0].focus(); }, 500);
});