/// <reference path="../Scripts/jquery-1.11.0.min.js" />
/// <reference path="../Scripts/knockout-3.3.0.js" />
/// <reference path="../Scripts/knockout.mapping-latest.js" />
/// <reference path="../Scripts/dx.webappjs.js" />
/// <reference path="../Scripts/devextreme-modules/dx.module-widgets-web.js" />
/// <reference path="../Scripts/devextreme-modules/dx.module-widgets-base.js" />

vems.LG = {};
vems.LG.deviceType = DevExpress.devices.real();

var headerTemplate = function (header, info) {
    $('<div class="text-center">').html(info.column.caption).addClass('column-header').appendTo(header);
    $(header).parent().addClass('column-header-dark');
};

vems.LG.GroupLocateVM = function (data) {
    var self = this;
    ko.mapping.fromJS(data, {}, self);
    self.searchString = ko.observable('');
    self.Groups = ko.observable([]);
    
    self.tempBookingDetail = new BookingDetail();

    self.getGridHeight = function () {
        if (vems.LG.deviceType.phone) { return (document.documentElement.clientHeight - 240); }
        else { return (document.documentElement.clientHeight - 260); }
    };

    self.emptyTextMessage = ko.observable('')

    function formatNoTextMessage(searchString) {
        return vems.screenText.EmptyDataText.replace('{0}', "\"" + searchString + "\"");
    };

    self.groupSearchInit = function () {
        
        vems.bindLoadingGifsToTypeAhead( $('#group-search').typeahead({
            minLength: 3,
            highlight: true,
        }, {
            //source: vems.LG.searchSource.ttAdapter(),
            source: function (query, sync, async) {
                vems.LG.searchGroups({ qry: query, asyncCall: async });
            },
            limit: 'Infinity', //see https://github.com/twitter/typeahead.js/issues/1232
            display: function (result) { return vems.decodeHtml(result.GroupName); },
            templates: {
                suggestion: function (result) {
                    return '<div>' + vems.decodeHtml(result.GroupName) + '</div>'
                },
                notFound: '<div class="delegate-typeahead-notfound">' + vems.screenText.NoMatchingGroupsText + '</div>'
            }
        }).unbind('typeahead:select').bind('typeahead:select', function (event, group) {
            //vems.LG.getGroups(group.GroupName);
            self.fetchAndLoadBookingDetails(group);
            $('#group-search').blur();
        }) );
        
        $('#group-search').bind('typeahead:asyncreceive', function (e) {
            $(e.target).parent().find('.group-tt-count-content').remove();

            var countContent = $('<span class="group-tt-count-content"><span>' + vems.screenText.typeaheadCountText.replace('{0}', vems.LG.searchCounts.count).replace('{1}', vems.LG.searchCounts.total) + '</span></span>');

            $(e.target).parent().find('.tt-menu').append(countContent);
        });

        $(".twitter-typeahead").find(".tt-menu").css('line-height', '20px').css('width', '100%');
        $(".twitter-typeahead").find(".tt-menu").css('z-index', '1000 !important');
        $('#group-search').focus();  // re-focus on input after search

        //this stupid little hack is for Safari's rendering engine.
        $('.input-icon-embed').css('position', 'static');
        setTimeout(function () {
            $('.input-icon-embed').css('position', 'absolute');
        }, 50);
    };

    self.previousTodayNextHandler = function (increment) {
        var today = new Date();

        //if (self.selectedTab() === 0) { // Daily
        //    self.currentDailyDate = increment === 0 ?
        //        moment(today) :
        //        self.currentDailyDate.add(increment, 'Days');

        //    getEventsForDay(self.currentDailyDate);
        //}
        //else if (self.selectedTab() === 1) { // Monthly
        //    vems.home.calendarButtonClicked = true;

        //    var calendarVal = $('#bookings-monthly-calendar').data('dxCalendar').option('value');

        //    if (increment === 0) { // Today
        //        calendarVal = new Date();
        //    } else {
        //        var year = calendarVal.year ? calendarVal.year() : calendarVal.getFullYear();
        //        var month = calendarVal.month ? calendarVal.month() : calendarVal.getMonth();

        //        calendarVal = new Date(year, month + increment, 1);
        //    }

        //    $('#bookings-monthly-calendar').data('dxCalendar').option('value', calendarVal);

        //    vems.home.viewModels.myBookings.localeDate(moment(calendarVal).format('MMMM YYYY'));
        //}
    };

    self.fetchAndLoadBookingDetails = function (group) {
        //var currentRowData = options.data;
        //var groupId = currentRowData.GroupId();
        //var outerdiv = $('<div/>');
       vems.ajaxPost({
            //async: false,
            url: vems.serverApiUrl() + '/getBookingsJson',
            data: '{groupId : ' + group.GroupId + '}',
            success: function (result) {

                ko.mapping.fromJSON(result.d, {}, self.tempBookingDetail);
                //var newdivId = 'bookings-' + self.tempBookingDetail.GroupId();
                //var newdiv = $('<div/>').attr('id', newdivId);
                //newdiv.addClass('dx-scrollable');
                //var parentGridWidth = $('#groupListGrid').width() - 50;
                //var parentGridHeight = $(window).height() - 70;

                self.emptyTextMessage(formatNoTextMessage(group.GroupName));
                $("#eventListContainer").show();
                $("#locate-help-text").hide();
                if (DevExpress.devices.real().phone) {
                    $(".grid-text").css('padding-left', '3px').css('padding-right', '3px');
                }
                $('#group-search').val('');
                $('#group-search').typeahead('val', '');
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };
     
    self.showMap = function (bookingData) {

        var FloorMapRoomInfo = buildFloorMapRoomInfo(bookingData); // buildFloorMapRoomInfo();
        vems.floorPlanModalVM.precheckIconAvailability(true);
        vems.floorPlanModalVM.buildModalMapForRoomNoFilters(FloorMapRoomInfo, bookingData.EventStart(), bookingData.EventEnd());

        return false;
    };

    function buildFloorMapRoomInfo(roomData) {
        var ri = new FloorMapRoomInfo();
        ri.Floor(roomData.Floor());
        ri.FloorMapID(roomData.ImageId());
        ri.RoomID(roomData.RoomId());
        ri.RoomCode(roomData.RoomCode());
        ri.RoomDescription(roomData.Location());
        ri.RoomType(roomData.RoomType());
        ri.FloorMapHash(self.FloorMapHash());
        ri.FloorMapWebserviceUrl(webServiceUrl);
        ri.ImageWidth(roomData.ImageWidth());
        ri.ImageHeight(roomData.ImageHeight());
        return ri;
    };

};

var BookingDetail = function (data) {
    var self = this;
    self.Caption = ko.observable('');
    self.Bookings = ko.observableArray([]);
};

vems.LG.eventsSortProp = '';  // must be valid property name of delegate object
vems.LG.eventsSortDir = -1;  // -1 = descending, 1 = ascending
vems.LG.sortEvents = function (propertyName) {
    if (propertyName) {  // adjust sort direction and column if necessary
        vems.LG.eventsSortDir = vems.LG.eventsSortProp === propertyName ? -(vems.LG.eventsSortDir) : -1;
        vems.LG.eventsSortProp = propertyName;
    }
    var bookings = vems.LG.ViewModel.tempBookingDetail.Bookings();
    bookings.sort(function (delOne, delTwo) {
        if (delOne[vems.LG.eventsSortProp]().toLowerCase() < delTwo[vems.LG.eventsSortProp]().toLowerCase()) {
            return 1 * vems.LG.eventsSortDir;
        } else if (delOne[vems.LG.eventsSortProp]().toLowerCase() > delTwo[vems.LG.eventsSortProp]().toLowerCase()) {
            return -1 * vems.LG.eventsSortDir;
        } else {
            return 0;
        }
    });
    vems.LG.ViewModel.tempBookingDetail.Bookings(bookings);
    $('#events-grid-header').find('#events-grid-sort-indicator').remove();
    $('#events-grid-header-' + vems.LG.eventsSortProp.toLowerCase()).append(
        '<i id="events-grid-sort-indicator" class="fa fa-angle-'
        + (vems.LG.eventsSortDir === -1 ? 'up' : 'down')
        + '"></i>');
};

vems.LG.searchCounts = {
    count: 0,
    total: 0
};

vems.LG.searchGroups = function (typeAhead) {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/getGroupsJson',
        data: '{ searchString : \'' + typeAhead.qry.replace('\'', '\\\'') + '\'}',
        success: function (result) {
            var response = JSON.parse(result.d);

            vems.LG.searchCounts.count = response.data.length;
            vems.LG.searchCounts.total = response.total;

            typeAhead.asyncCall(response.data);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
};

//calls web component viewmodel function
vems.LG.showBookingDetails = function (bookingId) {
    vems.bookingDetailsVM.show(bookingId, 0);
};