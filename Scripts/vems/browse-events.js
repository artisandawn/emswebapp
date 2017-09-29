var viewModel = viewModel || {};
var vems = vems || {};
vems.browse = vems.browse || {};
vems.browse.ResultTypes = {
    Daily: "Daily",
    Weekly: "Weekly",
    Monthly: "Monthly"
};

var headerTemplate = function (header, info) {
    $('<div class="text-center">').html(info.column.caption).addClass('column-header').appendTo(header);
};
var weeklyHeaderTemplate = function (header, info) {
    $('<div class="text-center">').html(info.column.caption).addClass('column-header').appendTo(header);
};

vems.EventsViewModel = function (data) {
    var self = this;
    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);
        self.ListDate(moment());
    }
    self.weeklyEvents = ko.observableArray([]);
    self.DailyCounts = ko.observable({});

    mobileGridOptions = {
        paging: { enabled: false },
        showColumnLines: false,
        wordWrapEnabled: true,
        scrolling: { showScrollbar: 'always' },
        rowTemplate: $("#mobileGridRow"),
        columnWidth: 'auto',
        columns: [
        {
            dataField: 'EventStart',
            caption: "Start",
            dataType: 'date',
            width: '20%'
        },
        {
            dataField: 'EventEnd',
            dataType: 'date',
            caption: "End",
            width: '20%',
            visible: self.ShowEndTime()
        },
        {
            dataField: 'EventName',
            caption: vems.browse.EventNameText,
            width: '30%'
        },
        {
            dataField: 'Location',
            caption: vems.browse.LocationText,
            visible: self.ShowLocation(),
            width: '20%'
        }],
        customizeColumns: function (columns) {
            $.each(columns, function (_, element) {
                element.headerCellTemplate = headerTemplate;
            });
        }
    };

    dailyGridOptions = {
        paging: { enabled: false },
        width: '100%',
        showColumnLines: false,
        wordWrapEnabled: true,
        scrolling: { showScrollbar: 'always' },
        rowTemplate: $('#gridRow'),
        columnWidth: 'auto',
        columns: [
        {
            dataField: 'EventStart',
            caption: vems.browse.StartTimeText,
            dataType: 'date',
            width: '8%'
        },
        {
            dataField: 'EventEnd',
            dataType: 'date',
            caption: vems.browse.EndTimeText,
            width: '8%',
            visible: self.ShowEndTime()
        },
        {
            dataField: 'TimezoneAbbreviation',
            width: '8%',
            caption: vems.browse.TimeZoneText
        },
        {
            dataField: 'EventName',
            caption: vems.browse.EventNameText,
            width: '35%'
        },
        {
            dataField: 'Location',
            caption: vems.browse.LocationText,
            visible: self.ShowLocation()
        },
        {
            dataField: 'GroupName',
            caption: vems.browse.GroupNameText,
            visible: self.ShowGroupName()
        }],
        customizeColumns: function (columns) {
            $.each(columns, function (_, element) {
                element.headerCellTemplate = headerTemplate;
            });
        }
    };

    reloadDailyDate = function (numDays, data, event) {
        vems.setAndShowDaysEvents(moment(self.ListDate()).add(numDays, 'd'));
    }

    reloadMonthlyDate = function (date, data, event) {
        viewModel.ListDate(moment(date));
        setMonthlyEvents(false);
    }

    reloadWeeklyDate = function (date, data, event) {
        viewModel.ListDate(moment(date));
        viewModel.setWeeklyEvents();
    }

    self.showMap = function (bookingData) {
        var FloorMapRoomInfo = buildFloorMapRoomInfo(bookingData);
        vems.floorPlanModalVM.precheckIconAvailability(true);
        var filterValues = vems.browse.dynamicFilters.data('dynamicFilters').getFilterValueCollection();
        for (var i = 0; i < filterValues.length; i++) {
            if (filterValues[i].filterName == 'StartDate' || filterValues[i].filterName == 'EndDate') {
                filterValues[i].value = moment(filterValues[i].value).format('YYYY-MM-D HH:mm:ss');
            }
        }
        var start = vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("StartDate");
        var end = vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("EndDate");
        
        vems.floorPlanModalVM.buildModalMapForRoom(FloorMapRoomInfo, start, end);

        return false;
    };

    self.setWeeklyEvents = function () {
        var weekstart = moment(viewModel.ListDate()).startOf('week');
        $('#weeklyContainer').find('.events-loading-overlay').show();
        getMonthlyEvents(vems.browse.ResultTypes.Weekly).done(function () {
            var weekevents = viewModel.MonthlyBookingResults();
            var eventcnt = 0;
            var weekArr = [];
            for (i = 0; i <= 6; i++) {
                var cellVM = new vems.weeklyCellViewModel();
                cellVM.thisDate = weekstart;
                cellVM.day = moment(weekstart).format('ddd');
                var cellevents = $.grep(weekevents, function (n, i) {
                    return moment(n.EventStart()).startOf('day').isSame(weekstart);
                });
                var arr = addHolidaysToArray(cellevents, weekstart);
                eventcnt += arr.length;
                var alldayevents = $.grep(arr, function (n, i) {
                    return (n.IsHoliday() || n.IsAllDayEvent());
                });
                if ($.isArray(alldayevents) && alldayevents.length > 0)
                    cellVM.holidayCount = alldayevents.length;

                cellVM.events = arr;
                weekArr.push(ko.toJS(cellVM));
                weekstart = moment(weekstart).add(1, 'day');
            }
            self.weeklyEvents(weekArr);
            if (eventcnt == 0) {
                $("#no-weekly-bookings-wrap").show();
            }

            $('#weeklyContainer').find('.events-loading-overlay').fadeOut();
            vems.bindWeeklyCalendarEvents();
        });
    };

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

    self.refreshWeeklyLayout = function () {
        var container = $('#weeklyContainer');
        var newwidth = Math.round((container.width() / 7)) - 20;
        $('#weeklyResults').width(container.width()-6);
        $('#weeklyResults td.calendar-cell-container-weekly').width(newwidth + 'px');
        $('#weeklyResults th.calendar-cell-container-weekly').width(newwidth + 'px');
        $('#weeklyResults .events-container').width((newwidth - 5) + 'px');
        $('#weeklyResults').find('.weekly-event .booking-event').width((newwidth - 5) + 'px');
        $('#weeklyResults .weekly-eventname').width((newwidth - 8) + 'px');
    };

};

function refreshCalLayout(cal) {
    cal.endUpdate();
    cal.repaint();
    var tbl = $('#bookings-monthly-calendar .dx-calendar-body .dx-widget table');
    $(cal._$element).height($(cal._$element).height(tbl.height() + 40));
    resizeCellWidths();
};

vems.weeklyCellViewModel = function () {
    var self = this;
    self.day = '';
    self.thisDate = null;
    self.events = [];
    self.holidayCount = 0;
};

vems.browse.newMinEventObject = function () {
    return {
        "EventName": "",
        "GroupId": 0,
        "GroupName": "",
        "Location": "",
        "Building": null,
        "BuildingId": 0,
        "Room": "",
        "RoomTypeId": 0,
        "ShowFloorMap": false,
        "ReserveType": 0,
        "StatusType": 0,
        "Status": null,
        "StatusId": 0,
        "StatusTypeId": 0,
        "IsCheckedIn": false,
        "CanCheckIn": false,
        "ShowCheckinButton": false,
        "RequiresCheckIn": false,
        "CheckInMinutes": 0,
        "AllowCancel": false,
        "AllowCancelPamInstance": false,
        "RequiresCancelReason": false,
        "AllowEndNow": false,
        "AllowEdit": false,
        "ReservationSummaryUrl": "",
        "EventLink": null,
        "LocationLink": "",
        "TotalNumberOfBookings": 0,
        "WebUserIsOwner": false,
        "IsHoliday": false,
        "Id": 0,
        "EventCount": 0,
        "ReservationId": 0,
        "RoomId": 0,
        "Date": null,
        "EventStart": "0001-01-01T00:00:00",
        "EventEnd": "0001-01-01T00:00:00",
        "TimeBookingStart": "0001-01-01T00:00:00",
        "TimeBookingEnd": "0001-01-01T00:00:00"
    }
};

vems.setWeeklyEvents = function () {
    var weekstart = moment(viewModel.ListDate()).startOf('week');
    $('#weeklyContainer').find('.events-loading-overlay').show();
    getMonthlyEvents(vems.browse.ResultTypes.Weekly).done(function () {
        var weekevents = viewModel.MonthlyBookingResults();
        var eventcnt = 0;
        var weekArr = [];
        for (i = 0; i <= 6; i++) {
            var cellVM = new vems.weeklyCellViewModel();
            cellVM.thisDate = weekstart;
            cellVM.day = moment(weekstart).format('D');
            var cellevents = $.grep(weekevents, function (n, i) {
                return moment(n.TimeBookingStart()).startOf('day').isSame(weekstart);
            });
            var arr = addHolidaysToArray(cellevents, weekstart);
            eventcnt += arr.length;
            var alldayevents = $.grep(arr, function (n, i) {
                return (n.IsHoliday() || n.IsAllDayEvent());
            });
            if ($.isArray(alldayevents) && alldayevents.length > 0)
                cellVM.holidayCount = alldayevents.length;

            cellVM.events = arr;
            weekArr.push(weekArr);
            weekstart = moment(weekstart).add(1, 'day');
        }
        self.weeklyEvents(weekArr);
        if (eventcnt == 0) {
            $("#no-weekly-bookings-wrap").show();
        }

        $('#weeklyContainer').find('.events-loading-overlay').fadeOut();
    });
};

vems.initializeWeeklyScroller = function () {
    $('#sliderContainer').data('ems_calendarScroller', null);
    $("#grid-container-mobile").show();
    $("#grid-container-mobile button.nav-button").css('min-width', '25px');
    $("#browse-events").css('margin-left', '-15px').css('margin-right', '-15px');
    $("#grid-container-mobile").css('margin-left', '-5px').css('margin-right', '-5px');
    $('#sliderContainer').calendarScroller({
        startDate: viewModel.ListDate(),
        eventDates: [viewModel.ListDate()],
        dateSelected: function (date) {
            viewModel.ListDate(moment(date).clone());
            vems.setAndShowMobileGrid(viewModel.ListDate());
        }
    });
};

vems.setAndShowMobileGrid = function (date) {

    viewModel.ListDate(moment(date));     

    $('#grid-container-mobile').find('.events-loading-overlay').show();
    getMonthlyEvents(vems.browse.ResultTypes.Weekly).done(function () {
                
        vems.getDaysEvents()
            .done(function () {
                var grid = $('#mobileEventResults').dxDataGrid('instance');
                var daysevents = viewModel.DailyBookingResults();
                grid.option('dataSource', daysevents);

                if ($.isArray(daysevents) && daysevents.length == 0) {
                    grid.option('visible', false);
                    $("#mobile-no-daily-bookings-wrap").show();
                }
                else {
                    $("#mobile-no-daily-bookings-wrap").hide();
                    grid.option('visible', true);
                    grid.refresh();
                }
                $('#sliderContainer').data('ems_calendarScroller').bookingsChanged(getDatesWithEvents());
                $('#grid-container-mobile').find('.events-loading-overlay').hide();
                $('body').scrollTo('#mobileEventResults');
            });
    });

};

function getDatesWithEvents() {
    var weekstart = moment(viewModel.ListDate()).startOf('week');
    var weekevents = viewModel.MonthlyBookingResults();
    var datesWithEvents = [];
    for (i = 0; i <= 6; i++) {
        var cellevents = $.grep(weekevents, function (n, i) {
            return moment(n.EventStart()).startOf('day').isSame(weekstart);
        });
        var arr = addHolidaysToArray(cellevents, weekstart);
        if ($.isArray(arr) && arr.length > 0) {
            datesWithEvents.push(weekstart);
        }
        weekstart = moment(weekstart).add(1, 'day');
    }
    return datesWithEvents;
};

vems.setAndShowDaysEvents = function (date) {
    viewModel.ListDate(moment(date));
    $('#dailyContainer').find('.events-loading-overlay').show();
    vems.getDaysEvents().done(function () {
        var daysevents = viewModel.DailyBookingResults();
        var grid = $('#eventResults').dxDataGrid('instance');
        grid.option('dataSource', daysevents);
        if ($.isArray(daysevents) && daysevents.length == 0) {
            grid.option('visible', false);
            $("#no-daily-bookings-wrap").show();
        }
        else {
            $("#no-daily-bookings-wrap").hide();
            grid.option('visible', true);
            grid.refresh();
        }
        $('#dailyContainer').find('.events-loading-overlay').fadeOut();
    });
};

vems.getRollupEventsToReservationValue = function () {
    return vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("RollupEventsToReservation");
};

vems.getDaysEvents = function () {
    var chosenDate = moment(viewModel.ListDate()).startOf('day');
    vems.browse.dynamicFilters.data('dynamicFilters').suppressUpdate = true;
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("RollupEventsToReservation", "false");
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("StartDate", moment(chosenDate).startOf('day'));
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("EndDate", moment(chosenDate).add(1, 'day').startOf('day'));
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("ResultType", vems.browse.ResultTypes.Daily.toString());
    vems.browse.dynamicFilters.data('dynamicFilters').suppressUpdate = false;

    return vems.fetchFilteredEvents().success(function (result) {
        var bookings = JSON.parse(result.d);
        ko.mapping.fromJS(bookings.DailyBookingResults, {}, viewModel.DailyBookingResults);
        ko.mapping.fromJS(bookings.Holidays, {}, viewModel.Holidays);
        viewModel.DailyBookingResults(addHolidaysToArray(viewModel.DailyBookingResults(), chosenDate));
        viewModel.DailyCounts(bookings.DailyCounts);
        var nextdate = bookings.NextBookingDate === null ? null : moment(bookings.NextBookingDate);
        viewModel.NextBookingDate(nextdate);
    });
};

function getMonthlyEvents(weeklyOrMonthly) {
    var date = moment(viewModel.ListDate());
    var start = moment(date).startOf('month');
    var end = moment(date).startOf('month').add(1, 'month');

    if (weeklyOrMonthly === vems.browse.ResultTypes.Weekly) {
        start = moment(date).startOf('week');
        end = moment(date).startOf('week').add(1, 'month');
    }

    vems.browse.dynamicFilters.data('dynamicFilters').suppressUpdate = true;
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("RollupEventsToReservation", viewModel.RollupBookingsToReservation().toString());
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("StartDate", start);
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("EndDate", end);
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("ResultType", weeklyOrMonthly.toString());
    vems.browse.dynamicFilters.data('dynamicFilters').suppressUpdate = false;

    return vems.fetchFilteredEvents()
        .success(function (result) {
            var bookings = JSON.parse(result.d);
            ko.mapping.fromJS(bookings.MonthlyBookingResults, {}, viewModel.MonthlyBookingResults);
            ko.mapping.fromJS(bookings.Holidays, {}, viewModel.Holidays);
            viewModel.DailyCounts(bookings.DailyCounts);
            var nextdate = bookings.NextBookingDate === null ? null : moment(bookings.NextBookingDate);
            viewModel.NextBookingDate(nextdate);
            if ($('#sliderContainer').data('ems_calendarScroller')) {
                $('#sliderContainer').data('ems_calendarScroller').setLock(false);
            }
        });
};

function setMonthlyEvents(refilterData) {
    $('#monthlyContainer').find('.events-loading-overlay').show();
    getMonthlyEvents(vems.browse.ResultTypes.Monthly).done(function () {
        var cal = $('#bookings-monthly-calendar').data('dxCalendar');

        if ($.isArray(viewModel.MonthlyBookingResults()) && viewModel.MonthlyBookingResults().length == 0) {
            cal.option('visible', false);
            $("#no-monthly-bookings-wrap").show();
        } else {
            cal.option('value', viewModel.ListDate()._d);
            cal.option('visible', true);
            $("#no-monthly-bookings-wrap").hide();
            refreshCalLayout(cal);
        }        

        // manually localize calendar day abbreviations
        var dayLabels = $('#bookings-monthly-calendar thead th');
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
        $('#monthlyContainer').find('.events-loading-overlay').fadeOut();

    });
};

vems.fetchFilteredEvents = function () {
    var filterValues = vems.browse.dynamicFilters.data('dynamicFilters').getFilterValueCollection();

    for (var i = 0; i < filterValues.length; i++) {
        if (filterValues[i].filterName == 'StartDate' || filterValues[i].filterName == 'EndDate') {
            filterValues[i].value = moment(filterValues[i].value).format('YYYY-MM-D HH:mm:ss');
        }
    }
    var strData = JSON.stringify({ filterData: { filters: filterValues } });
    return vems.ajaxPost({
        url: vems.serverApiUrl() + '/BrowseEvents',
        data: strData,
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
};

function addHolidaysToArray(events, date) {

    var alldayevents = $.grep(events, function (n, i) {
        return ((ko.utils.unwrapObservable(n.IsAllDayEvent) === true) && (moment(n.EventStart()).startOf('day').isSame(date)));
    });
    var regularevents = $.grep(events, function (n, i) {
        return ((ko.utils.unwrapObservable(n.IsAllDayEvent) != true) && (moment(n.EventStart()).startOf('day').isSame(date)));
    });
    if ($.isArray(alldayevents) && alldayevents.length > 0) {
        $.each(alldayevents, function (key, value) {
            value.EventStart(vems.browse.AllDayText);
            value.EventEnd(vems.browse.AllDayText);
            value.IsAllDayEvent = ko.observable(true);
            regularevents.splice(0, 0, value);
        });
    }
    if (viewModel.Holidays().length > 0) {
        var holidayEvents = $.grep(viewModel.Holidays(), function (n, i) {
            return moment(n.Date()).startOf('day').isSame(date);
        });
        if (holidayEvents && holidayEvents.length > 0) {
            $.each(holidayEvents, function (key, value) {
                var newevent = ko.mapping.fromJS(new vems.browse.newMinEventObject());
                newevent.EventName(value.Description());
                newevent.EventStart(vems.browse.AllDayText);
                newevent.EventEnd(vems.browse.AllDayText);
                newevent.IsHoliday(ko.observable(true));
                newevent.Room(value.Notes());

                if (value.BuildingId() == -1) { // all bulidings
                    newevent.Location(vems.browse.allBuildingsText);
                } else {
                    newevent.Location(value.Location());
                }
                
                regularevents.splice(0, 0, newevent);
            });
        }
    }
    events = regularevents;
    return regularevents;
};

vems.EventsViewModel.buildCalendar = function () {
    $('#bookings-monthly-calendar').dxCalendar({
        value: new Date(),
        min: new Date(1990, 0, 1),
        max: new Date(2150, 0, 1),
        height: '100%',
        width: '100%',
        cellTemplate: function (data, index, element) {
            var calendarDate = new Date($(element).data('value'));
            var formattedDate = moment(calendarDate).format("M/D/YYYY");

            var container = $('<div>').addClass('calendar-cell-container');

            if (calendarDate.getDay() === 6 || calendarDate.getDay() === 0) { // weekend
                container.addClass('calendar-cell-weekend');
            }
            container.append($('<div>').addClass('calendar-event').append($('<div>').addClass('calendar-cell-text-right').text(data.text)));
            var eventStyle = 'browse-calendar-event';
            // check for a number as the value to avoid drawing bars when looking at months
            if (typeof data.text === 'number') {
                var allevents = addHolidaysToArray(viewModel.MonthlyBookingResults(), calendarDate);

                if ($.isArray(allevents) && allevents.length > 0) {
                    var totalBookings = allevents.length;
                    if (viewModel.DailyCounts())
                        totalBookings = viewModel.DailyCounts()[formattedDate];

                    var cnt = 0;
                    $.each(allevents, function (key, value) {
                        if (!value.IsHoliday() && !value.IsAllDayEvent())
                            cnt++;  //don't include holidays in the count                                               

                        if (cnt <= viewModel.BrowseNumberOfEventsToDisplayOnMonthlyView()) {
                            var baseTxt = '';
                            if (!value.IsHoliday()) {
                                baseTxt = value.EventStart() === vems.browse.AllDayText ? value.EventStart()
                                    : moment(value.EventStart()).format('LT').toLowerCase().replace(' ', '');
                            }

                            baseTxt += ' ' + value.EventName();

                            var loc = '', titleLoc='';
                            if (value.Location() != null && value.Location().length > 0){
                                loc = ', ' + '<span style="font-style: italic;">' + value.Location() + '</span>';
                                titleLoc = baseTxt + ', ' + value.Location();
                            }
                            var multiples = '';
                            var bookingId = value.Id();
                            if (value.EventCount() > 1) {
                                multiples = '<div>(' + vems.browse.MultipleBookingsExistText + ')</div>';
                                bookingId = 0;  //suppress booking id so that booking details shows whole reservation
                            }
                            var evTxt = baseTxt + loc + multiples;
                            var style = value.WebUserIsOwner() ? ' owner' : '';
                            style = value.IsHoliday() ? ' holiday' : '';
                            if (value.StatusTypeId() === vems.browse.cancelledStatusTypeId)
                                style = ' calendar-cell-cancelled';
                            container.append($('<div>').addClass(eventStyle + style + ' booking-event').html(evTxt).attr('title', titleLoc).attr('data-bookingid', bookingId).attr('data-reservationid', value.ReservationId()));
                        }
                        else if (cnt > viewModel.BrowseNumberOfEventsToDisplayOnMonthlyView() || totalBookings > viewModel.BrowseNumberOfEventsToDisplayOnMonthlyView() + 1) {
                            //just in case it made it this far.
                            container.append($('<a>').html('+ ' + (totalBookings - (cnt - 1)) + ' more events').addClass('more-events'));
                        }
                    });

                    if (totalBookings > viewModel.BrowseNumberOfEventsToDisplayOnMonthlyView() ) {
                        container.append($('<a>').html('+ ' + (totalBookings - (cnt - 1)) + ' more events').addClass('more-events'));
                    }
                }
                else {
                    container.append($('<div>').addClass(eventStyle).css('background-color', 'transparent').css('border', 'none'));
                }
            }
            return container;
        },
        onContentReady: function () {
            vems.bindCalendarEvents();
        },
    });

    // Unbind the DX swipe events to prevent the monthly calendar from acting weird under mouse control.
    $('#bookings-monthly-calendar').unbind('dxswipe');
    $('#bookings-monthly-calendar').unbind('dxswipestart');
    $('#bookings-monthly-calendar').unbind('dxswipeend');

    $(window).on('resize', function () {
        var cal = $('#bookings-monthly-calendar').data('dxCalendar');
        refreshCalLayout(cal);
        viewModel.refreshWeeklyLayout();
    });
};

//this is so hacky but couldn't find a way to get the divs to widen
function resizeCellWidths() {
    var container = $('#monthlyContainer');    
    var newwidth = Math.round((container.width() / 7)) - 10;
    $('#bookings-monthly-calendar .browse-calendar-event').width((newwidth - 10) + 'px');
    $('#bookings-monthly-calendar .browse-calendar-event .holiday').width((newwidth - 2) + 'px');
    $('#bookings-monthly-calendar .dx-calendar-cell').width(newwidth + 'px');
    $('#bookings-monthly-calendar .calendar-cell-container').width(newwidth + 'px');
    $('#bookings-monthly-calendar .dx-calendar-cell').has('.calendar-cell-weekend').css('background-color', '#F2F2EA');
};

vems.browse.filtersThatCauseUpdates = ['StartDate', 'Locations', 'Room', 'GroupName', 'EventName', 'GroupTypes', 'EventTypes'];

vems.bindWeeklyCalendarEvents = function () {
    $('#weeklyResults .booking-event').on('click', function (e) {
        return vems.popBookingDetail(e);
    });
    $('#weeklyResults').on('click', '.more-events, .weekly-day', function () {
        var date = moment($(this).data('date'));
        viewModel.ListDate(date);
        $('#browse-tabs a:first').tab('show');
    });
};

vems.bindCalendarEvents = function () {
    $('#bookings-monthly-calendar').off('click', '.booking-event')
    $('#bookings-monthly-calendar').on('click', '.booking-event', function (e) {
        return vems.popBookingDetail(e);
    });

    $('#bookings-monthly-calendar').on('click', '.calendar-cell-container', function (e) {
        var parentcell = $(this).closest('.dx-calendar-cell');
        var date = moment(parentcell.data('value'), 'YYYY/M/DD');
        viewModel.ListDate(date);
        $('#browse-tabs a:first').tab('show');
    });

    $('#bookings-monthly-calendar').on('click', '.more-events', function () {
        var parentcell = $(this).closest('.dx-calendar-cell');
        var date = moment(parentcell.data('value'), 'YYYY/M/DD');
        viewModel.ListDate(date);
        $('#browse-tabs a:first').tab('show');
    });
};

vems.popBookingDetail = function (e) {
    e.preventDefault();
    var bookingid = $(e.currentTarget).data('bookingid');
    var reservationid = $(e.currentTarget).data('reservationid');
    return vems.popBookingOrResDetail(bookingid, reservationid);
};

vems.popBookingOrResDetail = function (bookingid, reservationid) {
    vems.bookingDetailsVM.show(bookingid, reservationid);  // calls web component viewmodel function
    return false;
};

vems.fetchAndFillGrids = function (tabTarget) {
    if (tabTarget === 'day') {
        if (DevExpress.devices.real().phone) {
            vems.setAndShowMobileGrid(viewModel.ListDate());
        } else {
            vems.setAndShowDaysEvents(viewModel.ListDate());
        }        
    } else if (tabTarget === 'week') {
        viewModel.setWeeklyEvents();
    } else if (tabTarget === 'month') {
        setMonthlyEvents(true);
    }
};

vems.browse.filterBookings = function (filterValues, changedFilterName) {
    var filterDate = moment(vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("StartDate"));
    if (!filterDate.isValid()) {
        filterDate = moment(vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("StartDate"), "YYYY-MM-D");
    }

    viewModel.ListDate(filterDate);
    if (DevExpress.devices.real().phone) {
        $('#sliderContainer').data('ems_calendarScroller').removeInstance();
        vems.initializeWeeklyScroller();
    }

    var tabtype = $('#browse-tabs li.active').data('tabtype');
    vems.fetchAndFillGrids(tabtype);
};




