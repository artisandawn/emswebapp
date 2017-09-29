var Dea = Dea || {};
Dea.BrowseEvents = function () { };

var vems = vems || {};
vems.browse = vems.browse || {};
var viewModel = viewModel || {};

//resultType enum
vems.browse.ResultTypes = {
    Daily: "Daily",
    Weekly: "Weekly",
    Monthly: "Monthly"
};

var headerTemplate = function (header, info) {
    $('<div class="text-center">').html(info.column.caption).addClass('column-header').appendTo(header);
};
var weeklyHeaderTemplate = function (header, info) {
    //if (info.column.caption == moment(new Date).format('ddd')) {
    //    $(header).parent().addClass('weekly-current-day');
    //}
    $('<div class="text-center">').html(info.column.caption).addClass('column-header').appendTo(header);
};

vems.EventsViewModel = function (data) {
    var self = this;
    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);
    }
    mobileGridOptions = {
        //dataSource: function () { return getDaysEvents() },
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
        //dataSource: function () { return getDaysEvents() },
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

    weeklyGridOptions = {
        paging: { enabled: false },
        showColumnLines: true,
        wordWrapEnabled: true,
        scrolling: { showScrollbar: 'always' },
        columnWidth: 'auto',
        customizeColumns: function (columns) {
            $.each(columns, function (_, element) {
                element.headerCellTemplate = weeklyHeaderTemplate;
                element.cellTemplate = $('#weeklyCell');
            });
        },
        onCellPrepared: function (e) {
            if (e.rowType == 'data') {
                if (moment(ko.utils.unwrapObservable(e.value.thisDate)).format('D') == moment(new Date).format('D')) {
                    $(e.cellElement).addClass('weekly-current-day');
                }
            }
        },
        onContentReady: function () {
            vems.bindWeeklyCalendarEvents();
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
        vems.setWeeklyEvents();
    }
};

function refreshCalLayout(cal) {
    cal.endUpdate();
    cal.repaint();
    //cal.option('width', (cal._$element[0].parentNode.clientWidth-100)+'px');
    var tbl = $('#bookings-monthly-calendar .dx-calendar-body .dx-widget table');
    $(cal._$element).height($(cal._$element).height(tbl.height() + 40));    
    
    resizeCellWidths();
    
};

vems.weeklyCellViewModel = function () {
    var self = this;
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
        "TimeBookingStart": "0001-01-01T00:00:00",
        "TimeBookingEnd": "0001-01-01T00:00:00",
        "EventStart": "0001-01-01T00:00:00",
        "EventEnd": "0001-01-01T00:00:00"
    }
};

vems.setWeeklyEvents = function () {
    var weekstart = moment(viewModel.ListDate()).startOf('week');
    getMonthlyEvents(vems.browse.ResultTypes.Weekly).done(function () {
        var weeklygrid = $('#weeklyResults').dxDataGrid('instance');
        var weekevents = viewModel.MonthlyBookingResults();
        var eventcnt = 0;
        var code1 = ' {';
        for (i = 0; i <= 6; i++) {
            var cellVM = new vems.weeklyCellViewModel();
            cellVM.thisDate = weekstart;
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
            code1 += (i == 0 ? '' : ',') + '"' + weekstart.format("ddd") + '": ' + ko.toJSON(cellVM);
            weekstart = moment(weekstart).add(1, 'day');
        }

        if (eventcnt == 0) {
            weeklygrid.option('visible', false);
            $("#no-weekly-bookings-wrap").show();
        }
        else {
            var row1 = JSON.parse(code1 + "}");
            var data = [row1];
            weeklygrid.option('visible', true);
            $("#no-weekly-bookings-wrap").hide();
            weeklygrid.option('dataSource', data);
            weeklygrid.refresh();
        }
    });
};

vems.setAndShowMobileGrid = function (date) {
    viewModel.ListDate(moment(date));

    getMonthlyEvents(vems.browse.ResultTypes.Weekly).done(function () {
        //get event count per day
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
                    //grid.focus();
                }
                $('#sliderContainer').data('ems_calendarScroller').bookingsChanged(datesWithEvents);
                $('body').scrollTo('#mobileEventResults');
            });
    });

};

vems.setAndShowDaysEvents = function (date) {
    viewModel.ListDate(moment(date));
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
    });
};

vems.getDaysEvents = function () {
    var chosenDate = moment(viewModel.ListDate()).startOf('day');

    return vems.fetchFilteredEvents().success(function (result) {
        var bookings = JSON.parse(result.d);
        ko.mapping.fromJS(bookings.DailyBookingResults, {}, viewModel.DailyBookingResults);
        ko.mapping.fromJS(bookings.Holidays, {}, viewModel.Holidays);
        viewModel.DailyBookingResults(addHolidaysToArray(viewModel.DailyBookingResults(), chosenDate));
        var nextdate = bookings.NextBookingDate === null ? null : moment(bookings.NextBookingDate);
        viewModel.NextBookingDate(nextdate);
        if ($('#sliderContainer').data('ems_calendarScroller')) {
            $('#sliderContainer').data('ems_calendarScroller').setLock(false);
        }
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

    return vems.fetchFilteredEvents()
        .success(function (result) {
            var bookings = JSON.parse(result.d);
            ko.mapping.fromJS(bookings.MonthlyBookingResults, {}, viewModel.MonthlyBookingResults);
            ko.mapping.fromJS(bookings.Holidays, {}, viewModel.Holidays);
            var nextdate = bookings.NextBookingDate === null ? null : moment(bookings.NextBookingDate);
            viewModel.NextBookingDate(nextdate);
        });
};

function setMonthlyEvents(refilterData) {
    $('#monthlyContainer').find('.events-loading-overlay').show();
    getMonthlyEvents(vems.browse.ResultTypes.Monthly).done(function () {
        var cal = $('#bookings-monthly-calendar').data('dxCalendar');

        if ($.isArray(viewModel.MonthlyBookingResults()) && viewModel.MonthlyBookingResults().length == 0) {
            cal.option('visible', false);
            $("#no-monthly-bookings-wrap").show();
        }
        else {
            //cal.option('dataSource', viewModel.MonthlyBookingResults());
            cal.option('value', viewModel.ListDate()._d);
            cal.option('visible', true);
            $("#no-monthly-bookings-wrap").hide();
            refreshCalLayout(cal);
        }
        $('#monthlyContainer').find('.events-loading-overlay').fadeOut();

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
    });
};

vems.fetchFilteredEvents = function () {
    vems.browse.CustomBrowseData.Format = $('#browse-tabs li.active').index();

    var strData = JSON.stringify({
        date: moment(viewModel.ListDate()).format('YYYY-MM-D HH:mm:ss'),
        data: vems.browse.CustomBrowseData
    });

    return vems.ajaxPost({
        url: vems.serverApiUrl() + '/CustomBrowseEvents',
        //async: false,
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
            //value.EventStart(moment(ko.utils.unwrapObservable(value.StartDate)).startOf('day'));
            value.EventStart('All Day');
            value.EventEnd('All Day');
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
                newevent.EventStart("All Day");
                newevent.EventEnd("All Day");
                newevent.IsHoliday(ko.observable(true));
                newevent.Room(value.Notes());
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
                    var cnt = 0;
                    $.each(allevents, function (key, value) {
                        if (!value.IsHoliday() && !value.IsAllDayEvent())
                            cnt++;  //don't include holidays in the count

                        if (cnt <= viewModel.BrowseNumberOfEventsToDisplayOnMonthlyView()) {
                            var baseTxt = '';
                            if (!value.IsHoliday()) { baseTxt = moment(value.EventStart()).format('LT').toLowerCase().replace(' ', ''); }
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
                            container.append($('<div>').addClass(eventStyle + style + ' booking-event').html(evTxt).attr('title', titleLoc).attr('data-bookingid', bookingId).attr('data-reservationid', value.ReservationId()));
                        }
                        else if (cnt == viewModel.BrowseNumberOfEventsToDisplayOnMonthlyView() + 1) {
                            container.append($('<a>').html('+ ' + (totalBookings - (cnt - 1)) + ' more events').addClass('more-events'));
                        }
                    });
                }
                else {
                    container.append($('<div>').addClass(eventStyle).css('background-color', 'transparent').css('border', 'none'));
                }
            }
            return container;
        },
        onContentReady: function () {
            vems.bindCalendarEvents();
        }
    });

    $(window).on('resize', function () {
        var cal = $('#bookings-monthly-calendar').data('dxCalendar');
        refreshCalLayout(cal);
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
    //$('#weeklyResults.dx-widget').off('click');
    $('#weeklyResults .booking-event').on('click', function (e) {
        return vems.popBookingDetail(e);
    });
    $('#weeklyResults').on('click', '.more-events', function () {
        //var parentcell = $(this).closest('.grid-cell');
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

vems.popBookingOrResDetail = function (data, reservationId) {
    var bookingid = typeof(data) == "number" ? data : data.Id();
    var reservationid = reservationId == undefined ? data.ReservationId() : reservationId;

    //calls web component viewmodel function
    vems.bookingDetailsVM.show(bookingid, reservationid);
    return false;
};

vems.fetchAndFillGrids = function (tabTarget) {
    
    if (tabTarget === 'day') {
        if (DevExpress.devices.real().phone) {
            vems.setAndShowMobileGrid(viewModel.ListDate());
        }
        else {
            vems.setAndShowDaysEvents(viewModel.ListDate());
        }        
    }
    else if (tabTarget === 'week') {
        vems.setWeeklyEvents();
    }
    else if (tabTarget === 'month') {
        setMonthlyEvents(true);
    }
};