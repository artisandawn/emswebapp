<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="CustomBrowseEvents" Title="<%$Resources:PageTitles, CustomEvents %>" CodeBehind="CustomBrowseEvents.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Dea.Ems.Web.Sites.VirtualEms.Helpers" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="server">
    <%# Styles.Render("~/Content/dynamic-filters") %>
    <%# Styles.Render("~/Content/plugin/book-grid") %>
    <%# Styles.Render("~/Content/calendar-scroller") %>
    <style>
        .dx-widget + .dx-widget {
            display: none;
        }

        #nav-logo-section button {
            display: none !important;
        }

        #user-menu-section .navbar-nav {
            /*display: none;*/
        }

        .help-text-icon {
            padding: 5px 10px 0 0;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <div id="BrowseEvents">
         <Dea:HelpButton runat="server" ID="VEMSCustomEventsTop" CssClass="floatRight" LookupKey="VEMSCustomEventsTop" ParentType="None" />
        <%--Mobile panel--%>
        <div class="vems-panel-light" style="margin-top: 10px;">
            <div id="grid-container-mobile" style="display: none;">
                <div class="row bordered">
                    <div class="text-center">
                        <div id="sliderContainer"></div>
                    </div>
                </div>
                <div class="row bordered" style="border-top: none;">
                    <div class="text-center">
                        <div id="mobileEventResults" data-bind="dxDataGrid: mobileGridOptions" style="margin: 0;">
                        </div>
                        <script id="mobileGridRow" type="text/html">
                            <tbody class="event-grid" style="font-size: 12px;">
                                <tr data-bind="attr: { 'class': (rowIndex % 2 == 0) ? 'evenRows ':'oddRows ' + ((data.StatusId() == 3) ? 'row-cancelled' : (data.IsHoliday() ? 'holiday' : '')) }">
                                    <!-- ko if: (data.IsHoliday() || data.IsAllDayEvent()) -->
                                    <td data-bind="text: data.EventStart()" colspan="2" class="mobile-filter-left"></td>
                                    <!-- /ko -->
                                    <!-- ko if: (!data.IsHoliday() && !data.IsAllDayEvent()) -->
                                    <td data-bind="text: moment(data.EventStart()).format('LT')" style="white-space: nowrap" class="mobile-filter-left"></td>
                                    <td data-bind="text: moment(data.EventEnd()).format('LT'), visible: viewModel.ShowEndTime()" style="white-space: nowrap" class="mobile-filter-left"></td>
                                    <!-- /ko -->
                                    <td class="mobile-ellipsis-text mobile-filter-left text-left" data-bind="css: {'row-cancelled': (data.StatusId() == 3) }">
                                        <!-- ko if: data.StatusId() == 3 -->
                                        <div>(<%= ScreenText.Cancelled.ToUpperInvariant() %>) </div>
                                        <!-- /ko -->
                                        <a href="#" data-bind="text: vems.decodeHtml(data.EventName()), 
    click: function(){vems.popBookingOrResDetail(data)},
    attr: {'data-bookingid': data.Id, 'data-reservationid':data.ReservationId }, 
    css : {'row-cancelled': (data.StatusId() == 3) }"
                                            class="elipsis"></a>
                                    </td>
                                    <!-- ko if: viewModel.ShowLocation()   -->
                                    <td class="mobile-ellipsis-text mobile-filter-left text-left">
                                        <!-- ko if: viewModel.UserCanViewLocations()   -->
                                        <!-- ko if: data.ShowFloorMap()   -->
                                        <a href="#" data-bind="visible: data.ImageId()>0, click: function () { $root.showMap($data); },  css: { 'row-cancelled': (data.StatusId() == 3)}">
                                            <i class="icon-ems-floorplan"></i></a>&nbsp;&nbsp;
                                            <!-- /ko -->
                                        <a href="#" data-bind="text: vems.decodeHtml(data.Location()),attr: { href: data.LocationLink()}, css: { 'row-cancelled': (data.StatusId() == 3)}"
                                            class="mobile-ellipsis-text"></a>
                                        <!-- /ko -->
                                        <!-- ko if: !viewModel.UserCanViewLocations()   -->
                                        <span data-bind="text: vems.decodeHtml(data.Location()), css: { 'row-cancelled': (data.StatusId() == 3)}"></span>
                                        <!-- /ko -->
                                    </td>
                                    <!-- /ko -->
                                </tr>
                            </tbody>
                        </script>
                        <div id="mobile-no-daily-bookings-wrap" class="no-bookings-wrap" style="display: none; margin: 0;">
                            <h3 data-bind="text: vems.browse.NoResultsDailyMessage.replace('{0}', moment(viewModel.ListDate()).format('dddd, MMMM Do YYYY'))"></h3>
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
                                    <%--<pre data-bind="text: ko.toJSON(moment(ListDate()), null, 2)"></pre>--%>
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
                            <script id="gridRow" type="text/html">
                                <tbody class="event-grid">
                                    <tr data-bind="attr: { 'class': (rowIndex % 2 == 0) ? 'evenRows ':'oddRows ' + ((data.StatusId() == 3) ? 'row-cancelled' : (data.IsHoliday() ? 'holiday' : '')) }">
                                        <!-- ko if: (data.IsHoliday() || data.IsAllDayEvent()) -->
                                        <td data-bind="text: data.EventStart()" colspan="3"></td>
                                        <!-- /ko -->
                                        <!-- ko if: (!data.IsHoliday() && !data.IsAllDayEvent()) -->
                                        <td data-bind="text: moment(data.EventStart()).format('LT')"></td>
                                        <td data-bind="text: moment(data.EventEnd()).format('LT'), visible: viewModel.ShowEndTime()"></td>
                                        <td data-bind="text: data.TimezoneAbbreviation()"></td>
                                        <!-- /ko -->
                                        <td data-bind="css: {'row-cancelled': (data.StatusId() == 3) }">
                                            <!-- ko if: data.StatusId() == 3 -->
                                            <span>(<%= ScreenText.Cancelled.ToUpperInvariant() %>) </span>
                                            <!-- /ko -->
                                            <%--<a href="#" data-bind="text: vems.decodeHtml(data.EventName()), click: function() { $('#booking-details').data('vems_bookingDetailsModal').show(data.Id()); }, css : {'row-cancelled': (data.StatusId() == 3) }"></a>--%>
                                            <a href="#" data-bind="text: vems.decodeHtml(data.EventName()), click: function () { vems.popBookingOrResDetail(data); }"></a>
                                        </td>
                                        <!-- ko if: viewModel.ShowLocation()   -->
                                        <td>
                                            <!-- ko if: viewModel.UserCanViewLocations()   -->
                                            <!-- ko if: data.ShowFloorMap()   -->
                                            <a href="#gridRow" data-bind="visible: data.ImageId()>0, click: function () { $root.showMap(data); }, attr: { 'class': (data.StatusId() == 3) ? 'row-cancelled' : '' }">
                                                <i class="icon-ems-floorplan"></i></a>&nbsp;&nbsp;
                                            <!-- /ko -->
                                            <a href="#" data-bind="text: vems.decodeHtml(data.Location()), attr: { href: data.LocationLink(), 'class': (data.StatusId() == 3) ? 'row-cancelled' : '' }"></a>
                                            <!-- /ko -->
                                            <!-- ko if: !viewModel.UserCanViewLocations()   -->
                                            <span data-bind="text: vems.decodeHtml(data.Location()), attr: {'class': (data.StatusId() == 3) ? 'row-cancelled' : '' }"></span>
                                            <!-- /ko -->
                                        </td>
                                        <!-- /ko -->
                                        <!-- ko if: viewModel.ShowGroupName()   -->
                                        <td data-bind="text: vems.decodeHtml(data.GroupName())"></td>
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
                            <div id="weeklyResults" data-bind="dxDataGrid: weeklyGridOptions" style="margin: 0;">
                            </div>
                            <script id="weeklyCell" type="text/html">
                                <div class="calendar-cell-container">
                                    <div class="calendar-event text-right" data-bind="text: moment(value.thisDate).format('D')"></div>
                                    <%--<pre data-bind="text: ko.toJSON((value.events.length - $index), null, 2)"></pre>--%>

                                    <div data-bind="foreach: value.events.slice(0, viewModel.BrowseNumberOfEventsToDisplayOnWeeklyView()+value.holidayCount)" style="margin: 0 10px 0 4px;">
                                        <div class="browse-calendar-event weekly-event" data-bind="css: { owner: $data.WebUserIsOwner,  'calendar-cell-cancelled': ($data.StatusId == 3), holiday : $data.IsHoliday }">
                                            <div data-bind="attr: {'data-bookingid': $data.Id, 'data-reservationid':$data.ReservationId, 'class': !$data.IsHoliday ? 'booking-event' : 'nonclickable-event'}">
                                                <!-- ko if: $data.IsHoliday -->
                                                <div data-bind="text: $data.EventStart"></div>
                                                <!-- /ko -->
                                                <div class="ellipsis">
                                                    <!-- ko if: $data.StatusId == 3 -->
                                                    <span>(<%= ScreenText.Cancelled.ToUpperInvariant() %>) </span>
                                                    <!-- /ko -->
                                                    <%--<a href="#" style="font-style: italic;" data-bind="text: vems.decodeHtml($data.EventName), attr: { href: $data.ReservationSummaryUrl, 'class': ($data.StatusId == 3) ? 'row-cancelled' : '' }"></a>--%>
                                                    <span style="font-style: italic;" data-bind="text: vems.decodeHtml($data.EventName)"></span>
                                                    <div data-bind="visible: ( viewModel.RollupBookingsToReservation && $data.EventCount > 1), text: '('+vems.browse.MultipleBookingsExistText+')'"></div>
                                                </div>
                                                <!-- ko if: !$data.IsHoliday && !$data.IsAllDayEvent -->
                                                <div>
                                                    <span data-bind="text: moment($data.EventStart).format('LT').toLowerCase().replace(' ', '')"></span>
                                                    <span data-bind="text: ' - ' + moment($data.EventEnd).format('LT').toLowerCase().replace(' ', ''), visible: (viewModel.ShowEndTime() && $data.EventCount <= 1)"></span>
                                                </div>
                                                <!-- /ko -->
                                                <!-- ko if: !$data.IsHoliday && viewModel.ShowLocation() -->
                                                <div class="ellipsis" data-bind="visible: $data.EventCount <= 1">
                                                    <!-- ko if: viewModel.UserCanViewLocations()   -->
                                                    <a href="#" style="font-style: italic;" data-bind="text: vems.decodeHtml($data.Location), attr: { href: $data.LocationLink }"></a>
                                                    <!-- /ko -->
                                                    <!-- ko if: !viewModel.UserCanViewLocations()   -->
                                                    <span style="font-style: italic;" data-bind="text: vems.decodeHtml($data.Location)"></span>
                                                    <!-- /ko -->
                                                </div>
                                                <!-- /ko -->
                                            </div>
                                        </div>
                                    </div>
                                    <!-- ko if: value.events.length > viewModel.BrowseNumberOfEventsToDisplayOnWeeklyView() -->
                                    <div><a href="#" data-bind="text: '+ ' + (value.events.length-viewModel.BrowseNumberOfEventsToDisplayOnWeeklyView()) + ' more events', attr: {'data-date': value.thisDate}" class="more-events"></a></div>
                                    <!-- /ko -->
                                </div>
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

    </div>
</asp:Content>

<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/custom-browse-events") %>
    <%= Scripts.Render("~/bundles/booking-details") %>
    <script type="text/javascript">
        <%--vems.browse.capLabel = '<%= ScreenText.Cap %>';--%>
        var vmdata = ko.mapping.fromJS(<%=browseEventsViewModel %>);
        var IsMobile = DevExpress.devices.real().phone;

        vems.browse.GroupNameText = "<%= escapeQuotes(EmsParameters.GroupTitleSingular) %>";
        vems.browse.EventNameText = "<%= escapeQuotes(string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular)) %>";
        vems.browse.LocationText = "<%= escapeQuotes(ScreenText.Location) %>";
        vems.browse.StartTimeText = "<%= escapeQuotes(ScreenText.StartTime) %>";
        vems.browse.EndTimeText = "<%= escapeQuotes(ScreenText.EndTime) %>";
        vems.browse.TimeZoneText = "<%= escapeQuotes(ScreenText.TimeZone) %>";
        vems.browse.DateText = "<%= escapeQuotes(ScreenText.Date) %>";
        vems.browse.NoResultsDailyMessage = "<%= escapeQuotes(Messages.BrowseEventsNoResultsDaily) %>";
        vems.browse.NoResultsWeeklyMessage = "<%= escapeQuotes(Messages.BrowseEventsNoResultsWeekly) %>";
        vems.browse.NoResultsMonthlyMessage = "<%= escapeQuotes(Messages.BrowseEventsNoResultsMonthly) %>";
        vems.browse.NoBookingsMessage = "<%= escapeQuotes(Messages.BookingDetailsNoBookings) %>";
        vems.browse.MultipleBookingsExistText = "<%= escapeQuotes(ScreenText.MultipleBookingsExist) %>";

        vems.browse.CustomBrowseData = <%=browseEventsDataModel %>;

        if (!DevExpress.devices.real().phone) { 
            $('#wrapper').css('padding-left', 0);
            vems.toggleSideBar();
        } 

        if(vems.browse.CustomBrowseData.HeaderUrl.length > 0){
            $('.ems-logo-link img').attr('src', vems.browse.CustomBrowseData.HeaderUrl)
        }

        $(document).ready(function () {
            $("body").addClass('body-dark-background');

            viewModel = new vems.EventsViewModel(vmdata);

            ko.applyBindings(viewModel, $("#BrowseEvents")[0]);

            if (DevExpress.devices.real().phone) {                
                $("#grid-container-mobile").show();
                $("#grid-container-mobile button.nav-button").css('min-width','25px');
                $("#grid-container-mobile").css('margin-left', '-5px').css('margin-right', '-5px');

                $('#sliderContainer').calendarScroller({
                    startDate: viewModel.ListDate(),
                    eventDates: [viewModel.ListDate()],    //[new Date(2016, 0, 20), new Date(2016, 0, 22)],
                    dateSelected: function(date) {
                        viewModel.ListDate(moment(date));
                        vems.setAndShowMobileGrid(viewModel.ListDate());                        
                    }
                });
                vems.setAndShowMobileGrid(viewModel.ListDate());                
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

            // set to daily for phones
            if (DevExpress.devices.real().phone) { 
                vems.browse.CustomBrowseData.Format = 0;
            }
            switch(vems.browse.CustomBrowseData.Format){
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
