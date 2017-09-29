<%@ Page Language="C#" AutoEventWireup="true" Inherits="BrowseEvents"
    MasterPageFile="~/MasterVirtualEms.master" EnableViewState="false" Title="<%$Resources:PageTitles, BrowseEvents %>" CodeBehind="BrowseEvents.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Dea.Ems.Web.Sites.VirtualEms.Helpers" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ Register Src="Controls/BookingDetails.ascx" TagName="BookingDetails" TagPrefix="EMS" %>
<%@ Register Src="Controls/ReservationDetails.ascx" TagName="ReservationDetails" TagPrefix="EMS" %>
<%@ Register TagPrefix="Dea" Namespace="Dea.Ems.Web.Sites.VirtualEms.Controls" Assembly="Dea.Ems.Web.Sites.VirtualEms.Controls" %>
<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="server">
    <%# Styles.Render("~/Content/dynamic-filters") %>
    <%# Styles.Render("~/Content/plugin/book-grid") %>
    <%# Styles.Render("~/Content/calendar-scroller") %>
    <style>
        .dx-widget + .dx-widget {
            display: none;
        }

        .help-text-icon {
            padding: 5px 10px 0 0;
        }
    </style>
</asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <div id="browse-events">
        <Dea:HelpButton runat="server" ID="VEMSBrowseEventsHelp" CssClass="floatRight" LookupKey="VEMSBrowseEventsHelp" ParentType="None" />
        <div class="vems-panel-light">
            <div class="row" id="filterContainer">
            </div>
        </div>
        <%--Mobile panel--%>
        <div class="vems-panel-light" style="margin-top: 10px;">
            <div id="grid-container-mobile" style="display: none;">
                <div class="mobile-grid-title">
                    <h2><%= escapeQuotes(EmsParameters.EventsTitlePlural) %></h2>
                </div>
                <div class="row bordered">
                    <div class="text-center">
                        <div id="sliderContainer"></div>
                    </div>
                </div>
                <div class="row bordered" style="border-top: none;">
                    <div class="text-center">
                        <div class="events-loading-overlay">
                            <img class="loading-animation" src="Images/Loading.gif" />
                        </div>
                        <div id="mobileEventResults" data-bind="dxDataGrid: mobileGridOptions" style="margin: 0;">
                        </div>
                        <script id="mobileGridRow" type="text/html">
                            <tbody class="event-grid" style="font-size: 12px;">
                                <tr data-bind="attr: { 'class': (rowIndex % 2 == 0) ? 'evenRows ':'oddRows ' + ((data.StatusTypeId() === vems.browse.cancelledStatusTypeId) ? 'row-cancelled' : (data.IsHoliday() ? 'holiday' : '')) }">
                                    <!-- ko if: (data.IsHoliday() || data.IsAllDayEvent()) -->
                                    <td data-bind="text: data.EventStart()" colspan="2" class="mobile-filter-left"></td>
                                    <!-- /ko -->
                                    <!-- ko if: (!data.IsHoliday() && !data.IsAllDayEvent()) -->
                                    <td data-bind="text: moment(data.EventStart()).format('LT')" style="white-space: nowrap" class="mobile-filter-left"></td>
                                    <td data-bind="text: moment(data.EventEnd()).format('LT'), visible: viewModel.ShowEndTime()" style="white-space: nowrap" class="mobile-filter-left"></td>
                                    <!-- /ko -->
                                    <td class="mobile-ellipsis-text mobile-filter-left text-left" data-bind="css: {'row-cancelled': (data.StatusTypeId() === vems.browse.cancelledStatusTypeId) }">
                                        <!-- ko if: data.StatusTypeId() === vems.browse.cancelledStatusTypeId -->
                                        <div>(<%= ScreenText.Cancelled.ToUpperInvariant() %>) </div>
                                        <!-- /ko -->
                                        <a href="#" data-bind="text: vems.decodeHtml(data.EventName()), 
    click: function(){vems.popBookingOrResDetail(data.Id(), data.ReservationId())},
    attr: {'data-bookingid': data.Id, 'data-reservationid':data.ReservationId }, 
    css : {'row-cancelled': (data.StatusTypeId() === vems.browse.cancelledStatusTypeId) }"
                                            class="elipsis"></a>
                                    </td>
                                    <!-- ko if: viewModel.ShowLocation() -->
                                    <td class="mobile-ellipsis-text mobile-filter-left text-left">
                                        <!-- ko if: viewModel.UserCanViewLocations()   -->
                                        <!-- ko if: data.ShowFloorMap()   -->
                                        <a href="#" data-bind="visible: data.ImageId()>0, click: function () { $root.showMap(data); },  css: { 'row-cancelled': (data.StatusTypeId() === vems.browse.cancelledStatusTypeId)}">
                                            <i class="icon-ems-floorplan"></i></a>&nbsp;&nbsp;
                                            <!-- /ko -->
                                        <a href="#" data-bind="text: vems.decodeHtml(data.Location()), 
    attr: { href: data.LocationLink()}, css: { 'row-cancelled': (data.StatusTypeId() === vems.browse.cancelledStatusTypeId)}"
                                            class="mobile-ellipsis-text"></a>
                                        <!-- /ko -->
                                        <!-- ko if: !viewModel.UserCanViewLocations()   -->
                                        <span data-bind="text: vems.decodeHtml(data.Location()), css: { 'row-cancelled': (data.StatusTypeId() === vems.browse.cancelledStatusTypeId)}"></span>
                                        <!-- /ko -->
                                    </td>
                                    <!-- /ko -->
                                </tr>
                            </tbody>
                        </script>
                        <div id="mobile-no-daily-bookings-wrap" class="no-bookings-wrap" style="display: none; margin: 0;">
                            <h3 data-bind="text: vems.browse.NoResultsDailyMessage.replace('{0}', moment(viewModel.ListDate()).format('dddd, MMMM Do YYYY'))"></h3>
                            <h4 data-bind="click: vems.setAndShowMobileGrid.bind($data, viewModel.NextBookingDate())">
                                <a><i class="fa fa-external-link-square"></i><%= Messages.BrowseEventsNoResultsNextLink %></a>
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
            <%--End Mobile Panel--%>

            <div id="browse-events-tabbed-panel" style="display: none;">
                <div>
                    <ul id="browse-tabs" class="nav nav-tabs pull-right" role="tablist" style="margin-right: 10px;">
                        <li role="presentation" data-tabtype="day">
                            <a href="#dailyContainer" aria-controls="dailyContainer" role="tab" data-toggle="tab"><%= ScreenText.DailyList %></a></li>
                        <li role="presentation" data-tabtype="week">
                            <a href="#weeklyContainer" aria-controls="weeklyContainer" role="tab" data-toggle="tab"><%= ScreenText.WeeklyList %></a></li>
                        <li role="presentation" data-tabtype="month">
                            <a href="#monthlyContainer" aria-controls="monthlyContainer" role="tab" data-toggle="tab"><%= ScreenText.MonthlyList %></a></li>
                    </ul>
                </div>
                <div class="tab-content" style="clear: both;">
                    <div id="dailyContainer" role="tabpanel" class="tab-pane">
                        <div class="row bordered" style="">
                            <div class="col-xs-12 col-md-12 text-center" style="padding: 5px;">
                                <div>
                                    <button class="btn btn-sm btn-default btn-main nav-button"
                                        data-bind="click: function (data, event) { reloadDailyDate(-1, data, event) }">
                                        <i class="fa fa-chevron-left"></i>
                                        <span data-bind="text: moment(ListDate()).add(-1, 'd').format('ddd')"></span>
                                    </button>
                                    <span data-bind="text: moment(ListDate()).format('dddd, MMMM Do YYYY')" style="font-weight: bold;"></span>
                                    <button class="btn btn-sm btn-default btn-main nav-button" data-bind="click: function (data, event) { reloadDailyDate(1, data, event) }">
                                        <span data-bind="text: moment(ListDate()).add(1, 'd').format('ddd')"></span>
                                        <i class="fa fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="row bordered" style="border-top: none;">
                            <div id="eventResults" data-bind="dxDataGrid: dailyGridOptions" style="margin: 0;">
                            </div>
                            <div class="events-loading-overlay">
                                <img class="loading-animation" src="Images/Loading.gif" />
                            </div>
                            <script id="gridRow" type="text/html">
                                <tbody class="event-grid">
                                    <tr data-bind="attr: { 'class': (rowIndex % 2 == 0) ? 'evenRows ':'oddRows ' + ((data.StatusTypeId() === vems.browse.cancelledStatusTypeId) ? 'row-cancelled' : (data.IsHoliday() ? 'holiday' : '')) }">
                                        <!-- ko if: (data.IsHoliday() || data.IsAllDayEvent()) -->
                                        <td data-bind="text: data.EventStart()" colspan="3"></td>
                                        <!-- /ko -->
                                        <!-- ko if: (!data.IsHoliday() && !data.IsAllDayEvent()) -->
                                        <td data-bind="text: moment(data.EventStart()).format('LT'), css: { 'grey-text': data.StatusTypeId() === vems.browse.cancelledStatusTypeId }"></td>
                                        <td data-bind="text: moment(data.EventEnd()).format('LT'), visible: viewModel.ShowEndTime(), css: { 'grey-text': data.StatusTypeId() === vems.browse.cancelledStatusTypeId }"></td>
                                        <td data-bind="text: data.TimezoneAbbreviation(), css: { 'grey-text': data.StatusTypeId() === vems.browse.cancelledStatusTypeId }"></td>
                                        <!-- /ko -->
                                        <td data-bind="css: { 'grey-text': data.StatusTypeId() === vems.browse.cancelledStatusTypeId }">
                                            <div class="ellipsis-text">
                                            <!-- ko if: data.StatusTypeId() === vems.browse.cancelledStatusTypeId -->
                                            <span>(<%= ScreenText.Cancelled.ToUpperInvariant() %>) </span>
                                            <!-- /ko -->
                                            <a href="#" class="ellipsis-text" data-bind="attr: {title: vems.decodeHtml(data.EventName())}, text: vems.decodeHtml(data.EventName()), click: function () { vems.popBookingOrResDetail(data.Id(), 0); }, css: { 'grey-text': data.StatusTypeId() === vems.browse.cancelledStatusTypeId }"></a>
                                                </div>
                                        </td>
                                        <!-- ko if: viewModel.ShowLocation()   -->
                                        <td data-bind="css: { 'grey-text': data.StatusTypeId() === vems.browse.cancelledStatusTypeId }">
                                            <!-- ko if: viewModel.UserCanViewLocations()   -->
                                                <div class="ellipsis-text">
                                                <!-- ko if: data.ShowFloorMap()   -->
                                                    <a href="#gridRow" data-bind="visible: data.ImageId()>0, click: function () { $root.showMap(data); }, css: { 'grey-text': data.StatusTypeId() === vems.browse.cancelledStatusTypeId }">
                                                        <i class="icon-ems-floorplan"></i></a>&nbsp;&nbsp;
                                                <!-- /ko -->
                                                <a href="#" class="ellipsis-text" data-bind="attr: {title: vems.decodeHtml(data.Location())}, text: vems.decodeHtml(data.Location()), click: function(data){ vems.locationDetailsVM.show(data.data.BuildingId(), data.data.RoomId()); }, css: { 'grey-text': data.StatusTypeId() === vems.browse.cancelledStatusTypeId }"></a>
                                                </div>
                                            <!-- /ko -->
                                            <!-- ko if: !viewModel.UserCanViewLocations()   -->
                                            <div class="ellipsis-text" data-bind="attr: {title: vems.decodeHtml(data.Location())}, text: vems.decodeHtml(data.Location()), css: { 'grey-text': data.StatusTypeId() === vems.browse.cancelledStatusTypeId }"></div>
                                            <!-- /ko -->
                                        </td>
                                        <!-- /ko -->
                                        <!-- ko if: viewModel.ShowGroupName()   -->
                                        <td data-bind="attr: {title: vems.decodeHtml(data.GroupName())},text: vems.decodeHtml(data.GroupName()), css: { 'grey-text': data.StatusTypeId() === vems.browse.cancelledStatusTypeId }"></td>
                                        <!-- /ko -->
                                    </tr>
                                </tbody>
                            </script>
                            <div id="no-daily-bookings-wrap" class="no-bookings-wrap" style="display: none; margin: 0;">
                                <h3 data-bind="text: vems.browse.NoResultsDailyMessage.replace('{0}', moment(viewModel.ListDate()).format('dddd, MMMM Do YYYY'))"></h3>
                                <h4 data-bind="click: vems.setAndShowDaysEvents.bind($data, viewModel.NextBookingDate()), visible: viewModel.NextBookingDate() != null">
                                    <a><i class="fa fa-external-link-square"></i><%= Messages.BrowseEventsNoResultsNextLink %></a>
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div id="weeklyContainer" role="tabpanel" class="tab-pane fade">
                        <div class="row bordered" style="">
                            <div class="col-xs-12 col-md-12 text-center" style="padding: 5px;">
                                <div>
                                    <button class="btn btn-sm btn-default btn-main nav-button"
                                        data-bind="click: function (data, event) { reloadWeeklyDate(moment(ListDate()).add(-1, 'week'), data, event) }">
                                        <i class="fa fa-chevron-left"></i>
                                        <span><%= ScreenText.Prev %></span>
                                    </button>
                                    <span data-bind="text: moment(ListDate()).startOf('week').format('dddd, MMMM Do YYYY')" style="font-weight: bold;"></span>- 
                                <span data-bind="text: moment(ListDate()).endOf('week').format('dddd, MMMM Do YYYY')" style="font-weight: bold;"></span>
                                    <button class="btn btn-sm btn-default btn-main nav-button" data-bind="click: function (data, event) { reloadWeeklyDate(moment(ListDate()).add(1, 'week'), data, event) }">
                                        <span><%= ScreenText.Next %></span>
                                        <i class="fa fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="row bordered" style="border-top: none;">
                            <div class="events-loading-overlay">
                                <img class="loading-animation" src="Images/Loading.gif" />
                            </div>
                            <div id="weeklyResultsContainer">
                                <table id="weeklyResults" class="table table-bordered">
                                    <thead>
                                        <tr data-bind="foreach: weeklyEvents">
                                            <th class="text-center column-header" data-bind="html: $data.day.replace('.','')"></th>
                                        </tr>
                                    </thead>

                                    <tbody class="row">
                                        <tr data-bind="template: {name: 'weeklyCell', data: weeklyEvents(), afterRender: refreshWeeklyLayout}">
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <script id="weeklyCell" type="text/html">
                                <!-- ko foreach: $data -->
                                <td class="calendar-cell-container-weekly" style="width: 14.28%" data-bind="css: {'weekly-current-day': moment($data.thisDate).format('D') == moment(new Date).format('D'), 'weekend-cell' : (moment($data.thisDate).day() == 6 || moment($data.thisDate).day() == 0)}">
                                    <div class="calendar-event text-right"><a href="#" class="weekly-day" data-bind="text: moment($data.thisDate).format('D')"></a></div>
                                    <div data-bind="foreach: ko.toJS($data.events)" class="events-container">
                                        <div class="browse-calendar-event-weekly weekly-event" data-bind="css: { owner: $data.WebUserIsOwner,  'calendar-cell-cancelled': ($data.StatusTypeId === vems.browse.cancelledStatusTypeId), holiday : $data.IsHoliday }">
                                            <div data-bind="attr: {'data-bookingid': $data.Id, 'data-reservationid':$data.ReservationId, 'class': !$data.IsHoliday ? 'booking-event' : 'nonclickable-event'}">
                                                <!-- ko if: $data.IsHoliday -->
                                                <div data-bind="text: $data.EventStart"></div>
                                                <!-- /ko -->
                                                <div class="ellipsis-text weekly-eventname">
                                                    <!-- ko if: $data.StatusTypeId === vems.browse.cancelledStatusTypeId -->
                                                    <span data-bind="attr: { title: vems.decodeHtml($data.EventName) }">(<%= ScreenText.Cancelled.ToUpperInvariant() %>) </span>
                                                    <!-- /ko -->
                                                    <a style="font-style: italic;" class="ellipsis-text" href="#" data-bind="text: vems.decodeHtml($data.EventName), 
    click: function(){vems.popBookingOrResDetail($data.Id, $data.ReservationId)},
    attr: {'data-bookingid': $data.Id, 'data-reservationid':$data.ReservationId, title: vems.decodeHtml($data.EventName) }, 
    css : {'row-cancelled': ($data.StatusTypeId === vems.browse.cancelledStatusTypeId) }"></a>
                                                    <div data-bind="visible: ( viewModel.RollupBookingsToReservation && $data.EventCount > 1), text: '('+vems.browse.MultipleBookingsExistText+')'"></div>
                                                </div>
                                                <!-- ko if: !$data.IsHoliday && !$data.IsAllDayEvent -->
                                                <div>
                                                    <span data-bind="text: moment($data.EventStart).format('LT').toLowerCase().replace(' ', '')"></span>
                                                    <span data-bind="text: ' - ' + moment($data.EventEnd).format('LT').toLowerCase().replace(' ', ''), visible: (viewModel.ShowEndTime() && $data.EventCount <= 1)"></span>
                                                </div>
                                                <!-- /ko -->
                                                <!-- ko if: viewModel.ShowLocation() -->
                                                <div class="ellipsis-text" data-bind="visible: $data.EventCount <= 1, css: {'row-cancelled': ($data.StatusTypeId === vems.browse.cancelledStatusTypeId)}">
                                                    <!-- ko if: viewModel.UserCanViewLocations()   -->
                                                    <a href="#" class="ellipsis-text" style="font-style: italic;" data-bind="attr:{title: vems.decodeHtml($data.Location), href: $data.LocationLink}, text: vems.decodeHtml($data.Location)"></a>
                                                    <!-- /ko -->
                                                    <!-- ko if: !viewModel.UserCanViewLocations()   -->
                                                    <div class="ellipsis-text" style="font-style: italic;" data-bind="attr:{title: vems.decodeHtml($data.Location)}, text: vems.decodeHtml($data.Location)"></div>
                                                    <!-- /ko -->
                                                </div>
                                                <!-- /ko -->
                                            </div>
                                        </div>
                                    </div>
                                    <!-- ko if: viewModel.DailyCounts()[moment($data.thisDate).format('M/D/YYYY')] > viewModel.BrowseNumberOfEventsToDisplayOnWeeklyView() -->
                                    <div class="text-center"><a href="#" data-bind="text: '+ ' + (viewModel.DailyCounts()[moment($data.thisDate).format('M/D/YYYY')] -viewModel.BrowseNumberOfEventsToDisplayOnWeeklyView()) + ' more events', attr: {'data-date': $data.thisDate}" class="more-events"></a></div>
                                    <!-- /ko -->
                                </td>
                                <!-- /ko -->
                            </script>
                            <div id="no-weekly-bookings-wrap" class="no-bookings-wrap" style="display: none; margin: 0;">
                                <h3 data-bind="text: vems.browse.NoResultsWeeklyMessage.replace('{0}', moment(ListDate()).startOf('week').format('dddd, MMMM Do YYYY')).replace('{1}', moment(ListDate()).endOf('week').format('dddd, MMMM Do YYYY'))"></h3>
                                <h4 data-bind="click: reloadWeeklyDate.bind($data, moment(NextBookingDate())), visible: viewModel.NextBookingDate() != null">
                                    <a><i class="fa fa-external-link-square"></i><%= Messages.BrowseEventsNoResultsNextLink %></a>
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div id="monthlyContainer" role="tabpanel" class="tab-pane fade">
                        <div class="row bordered" style="">
                            <div class="col-xs-12 col-md-12 text-center" style="padding: 5px;">
                                <div>
                                    <button class="btn btn-sm btn-default btn-main nav-button"
                                        data-bind="click: function (data, event) { reloadMonthlyDate(moment(ListDate()).add(-1, 'month'), data, event) }">
                                        <i class="fa fa-chevron-left"></i>
                                        <span data-bind="text: moment(ListDate()).add(-1, 'M').format('MMM')"></span>
                                    </button>
                                    <span data-bind="text: moment(ListDate()).format('MMMM YYYY')" style="font-weight: bold;"></span>
                                    <button class="btn btn-sm btn-default btn-main nav-button" data-bind="click: function (data, event) { reloadMonthlyDate(moment(ListDate()).add(1, 'month'), data, event) }">
                                        <span data-bind="text: moment(ListDate()).add(1, 'M').format('MMM')"></span>
                                        <i class="fa fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="row bordered">
                            <div class="events-loading-overlay">
                                <img class="loading-animation" src="Images/Loading.gif" />
                            </div>
                            <div id="bookings-monthly-calendar"></div>
                            <div id="no-monthly-bookings-wrap" class="no-bookings-wrap" style="display: none; margin: 0;">
                                <h3 data-bind="text: vems.browse.NoResultsMonthlyMessage.replace('{0}', moment(ListDate()).format('MMMM YYYY'))"></h3>
                                <h4 data-bind="click: reloadMonthlyDate.bind($data, moment(NextBookingDate())), visible: viewModel.NextBookingDate() != null">
                                    <a><i class="fa fa-external-link-square"></i><%= Messages.BrowseEventsNoResultsNextLink %></a>
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div data-bind='component: { name: "booking-details-component", params: { ScreenText: {
        TimeText: "<%= escapeQuotes(ScreenText.Time) %>",
        DateText: "<%= escapeQuotes(ScreenText.Date) %>",
        EventNameText: "<%= escapeQuotes(string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular)) %>",
        LocationText: "<%= escapeQuotes(ScreenText.Location) %>",
        GroupNameText: "<%= escapeQuotes(string.Format(ScreenText.GroupName, EmsParameters.GroupTitleSingular)) %>",
        NoBookingsMessage: "<%= escapeQuotes(Messages.BookingDetailsNoBookings) %>",
        BookingDetailsText: "<%= escapeQuotes(ScreenText.BookingDetails) %>",
        EventDetailsText: "<%= escapeQuotes(string.Format(ScreenText.EventDetails, EmsParameters.EventsTitleSingular)) %>",
        RelatedEventsText: "<%= escapeQuotes(string.Format(ScreenText.RelatedEvents, EmsParameters.EventsTitlePlural)) %>",
        DownloadIcsText: "<%= escapeQuotes(ScreenText.DownloadIcs) %>",
        ShareText: "<%= escapeQuotes(ScreenText.Share) %>",
        CloseText: "<%= escapeQuotes(ScreenText.Close) %>",
        EditText: "<%= escapeQuotes(ScreenText.Edit.ToLowerInvariant()) %>",
        FirstBookingText: "<%= escapeQuotes(ScreenText.FirstBooking) %>",
        LastBookingText: "<%= escapeQuotes(ScreenText.LastBooking) %>",
        CheckedInText: "<%= escapeQuotes(ScreenText.IsCheckedIn) %>",
        CheckInText: "<%= escapeQuotes(ScreenText.Checkin) %>",
        CancelText: "<%= escapeQuotes(ScreenText.Cancel) %>",
        EndNowText: "<%= escapeQuotes(ScreenText.EndNow) %>",
        EndNowConfirmText: "<%= escapeQuotes(Messages.EndNowConfirm) %>",
        YesEndBookingText: "<%= escapeQuotes(ScreenText.YesEndBooking) %>",
        NoDontEndText: "<%= escapeQuotes(HttpUtility.HtmlEncode(ScreenText.NoDontEnd)) %>",
        CancelBookingQuestionText: "<%= escapeQuotes(ScreenText.CancelBookingQuestion) %>",
        CancelReasonText: "<%= escapeQuotes(ScreenText.CancelReason) %>",
        CancelNotesText: "<%= escapeQuotes(ScreenText.CancelNotes) %>",
        YesCancelText: "<%= escapeQuotes(ScreenText.YesCancel) %>",
        NoCancelText: "<%= escapeQuotes(HttpUtility.HtmlEncode(ScreenText.NoCancel)) %>"} } }'>
        </div>

        <div id="floorplan-component-modal" data-bind='component: { name: "floorplans-reserve-modal", params: { RoomInfo: new FloorMapRoomInfo(),     
    renderType: "modal",
    ScreenText: {
        RequestText: "<%= escapeQuotes(ScreenText.Request) %>",
        ReserveText: "<%= escapeQuotes(ScreenText.Reserve) %>",
        RoomDetailsText: "<%= escapeQuotes(string.Format(ScreenText.RoomDetails, EmsParameters.RoomTitleSingular)) %>",
        RoomCodeText: "<%= escapeQuotes(string.Format(ScreenText.RoomCode, EmsParameters.RoomTitleSingular)) %>",
        RoomDescriptionText: "<%= escapeQuotes(ScreenText.Description) %>",
        RoomTypeText: "<%= escapeQuotes(string.Format(ScreenText.RoomType, EmsParameters.RoomTitleSingular)) %>",
        AvailabilityText: "<%= escapeQuotes(ScreenText.Availability) %>",
        AvailableText: "<%= escapeQuotes(ScreenText.Available) %>",
        UnavailableText: "<%= escapeQuotes(ScreenText.Unavailable) %>",
        StartTimeText: "<%= escapeQuotes(ScreenText.StartTime) %>",
        EndTimeText: "<%= escapeQuotes(ScreenText.EndTime) %>",
        TitleText: "<%= escapeQuotes(ScreenText.Title) %>",
        GroupNameText: "<%= escapeQuotes(EmsParameters.GroupTitleSingular) %>"
} } }'>
        </div>

    </div>

    <!-- location details modal -->
    <div id="location-details-comp" data-bind='component: { name: "location-details-component", params: { } }'></div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Styles.Render("~/Content/leaflet") %>
    <%= Scripts.Render("~/bundles/leaflet") %>
    <%= Scripts.Render("~/bundles/browse-events") %>
    <%= Scripts.Render("~/bundles/booking-details") %>
    <%= Scripts.Render("~/bundles/location-details-component") %>

    <script type="text/javascript">
        var vmdata = ko.mapping.fromJS(<%=browseEventsViewModel %>);
        vems.browse.filterModel = <%= Newtonsoft.Json.JsonConvert.SerializeObject(FilterModel) %>;
        var IsMobile = DevExpress.devices.real().phone;

        var FloorMapHash = '<%=FloorMapHash%>';
        var FloorMapWebServiceUrl = '<%=FloormapWebserviceUrl%>';

        vems.browse.GroupNameText = '<%= escapeQuotes(EmsParameters.GroupTitleSingular) %>';
        vems.browse.EventNameText = '<%= escapeQuotes(string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular)) %>';
        vems.browse.LocationText = '<%= escapeQuotes(ScreenText.Location) %>';
        vems.browse.StartTimeText = '<%= escapeQuotes(ScreenText.StartTime) %>';
        vems.browse.EndTimeText = '<%= escapeQuotes(ScreenText.EndTime) %>';
        vems.browse.TimeZoneText = '<%= escapeQuotes(ScreenText.TimeZone) %>';
        vems.browse.DateText = '<%= escapeQuotes(ScreenText.Date) %>';
        vems.browse.NoResultsDailyMessage = '<%= escapeQuotes(Messages.BrowseEventsNoResultsDaily) %>';
        vems.browse.NoResultsWeeklyMessage = '<%= escapeQuotes(Messages.BrowseEventsNoResultsWeekly) %>';
        vems.browse.NoResultsMonthlyMessage = '<%= escapeQuotes(Messages.BrowseEventsNoResultsMonthly) %>';
        vems.browse.NoBookingsMessage = '<%= escapeQuotes(Messages.BookingDetailsNoBookings) %>';
        vems.browse.MultipleBookingsExistText = '<%= escapeQuotes(ScreenText.MultipleBookingsExist) %>';
        vems.browse.cancelledStatusTypeId = parseInt(<%= (int)Dea.Ems.Configuration.StatusType.Cancel %>);
        vems.browse.allBuildingsText = '<%= escapeQuotes(string.Format(ScreenText.AllBuildings, EmsParameters.BuildingTitlePlural)) %>';
        vems.browse.AllDayText = '<%= escapeQuotes(ScreenText.AllDay) %>';

        $(document).ready(function () {
            $("body").addClass('body-dark-background');

            viewModel = new vems.EventsViewModel(vmdata);
            ko.applyBindings(viewModel, $("#browse-events")[0]);
            ko.applyBindings(null, $('#location-details-comp')[0]);

            var filterContainerId = '#filterContainer';
            //var filterContainerId = DevExpress.devices.real().phone ? '#locations-filter-mobile' : '#filterContainer';
            vems.browse.dynamicFilters = $(filterContainerId).dynamicFilters({
                filterParent: vems.browse.filterParents.browseEvents,
                filterLabel: "<%= ScreenText.Filter %>",
                filtersLabel: "<%= ScreenText.Filters %>",
                compactViewLabel: "<%= ScreenText.CompactView %>",
                editViewLabel: "<%= ScreenText.EditView %>",
                savedFiltersLabel: "<%= ScreenText.SavedFilters %>",
                saveLabel: '<%= escapeQuotes(ScreenText.Save) %>',
                addRemoveLabel: "<%= ScreenText.AddRemove %>",
                addFilterLabel: "<%= ScreenText.AddFilter %>",
                saveFilterLabel: "<%= ScreenText.SaveFilter %>",
                saveFiltersLabel: "<%= ScreenText.SaveFilters %>",
                closeLabel: "<%= ScreenText.Close %>",
                updateLabel: "<%= ScreenText.Update %>",
                cancelLabel: "<%= ScreenText.Cancel %>",
                nameLabel: "<%= ScreenText.Name %>",
                unauthenticated: <%= WebUser.UserId <= 0 ? "true" : "false" %>,
                dateSavedLabel: "<%= ScreenText.DateSaved %>",
                loadFilterLabel: "<%= ScreenText.LoadFilter %>",
                deleteFilterLabel: "<%= ScreenText.DeleteFilter %>",
                whatWouldYouLikeToNameThisSetOfFiltersLabel: "<%= Messages.WhatWouldYouLikeToNameThisSetOfFilters %>",
                findByXLabel: "<%= ScreenText.FindX %>",
                selectedXLabel: "<%= ScreenText.SelectedRooms %>",
                applyFilterLabel: "<%= ScreenText.ApplyFilter %>",
                buildingsLabel: "<%= EmsParameters.BuildingTitlePlural %>",
                viewsLabel: "<%= ScreenText.Views %>",
                showAllAreasLabel: "<%= string.Format(ScreenText.ShowAllX, EmsParameters.AreaTitlePlural) %>",
                filterByAreaLabel: "<%= string.Format(ScreenText.FilterByX, EmsParameters.AreaTitleSingular) %>",
                searchForAnAreaLabel: "<%= string.Format(ScreenText.SearchForAnX, EmsParameters.AreaTitleSingular) %>",
                selectAllXLabel: "<%= ScreenText.SelectAllX %>",
                ungroupedBuildingsLabel: "<%= string.Format(ScreenText.UngroupedX, EmsParameters.BuildingTitlePlural) %>",
                ResultType: vems.browse.filterModel.ResultType,
                requiredFilters: vems.browse.filterModel.RequiredFilters,
                optionalFilters: vems.browse.filterModel.OptionalFilters,
                filterChanged: function(filterValues, changedFilterName) {
                    vems.browse.filterBookings(filterValues, changedFilterName);
                }
            });

            if (DevExpress.devices.real().phone) {  
                $(document).off('touchstart');  //this was interfering with mobile scrollCalendar
                vems.initializeWeeklyScroller();
                vems.setAndShowMobileGrid(moment(viewModel.ListDate()).clone());                
            } else {
                $("#browse-events-tabbed-panel").show();
                $('#browse-tabs').on('shown.bs.tab', function (event) {
                    var tabType = $(event.target).parent().data('tabtype');
                    vems.fetchAndFillGrids(tabType);
                });  
                var daygrid = $('#eventResults').dxDataGrid('instance');
                daygrid.option('dataSource', viewModel.DailyBookingResults());
                daygrid.refresh();
                vems.EventsViewModel.buildCalendar();
            }

            switch(viewModel.BrowseEventsDefaultDisplayFormat()){
                case 0:
                    $('#browse-tabs a[href="#dailyContainer"]').tab('show');
                    break; 
                case 1:
                case 3:                    
                    $('#browse-tabs a[href="#weeklyContainer"]').tab('show');
                    break;
                case 2:
                case 4:                    
                    $('#browse-tabs a[href="#monthlyContainer"]').tab('show');
                    break;
                default:
                    break;
            }

        });
    </script>
</asp:Content>
