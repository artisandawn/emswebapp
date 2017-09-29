<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="Reservations_BrowseReservations"
    Title="<%$Resources:PageTitles, BrowseReservations %>" Codebehind="BrowseReservations.aspx.cs" %>

<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<%@ Register Assembly="DevExpress.Web.v15.1, Version=15.1.8.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a"
    Namespace="DevExpress.Web" TagPrefix="dx" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>

<asp:Content ID="headContent" runat="server" ContentPlaceHolderID="headContentHolder"></asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <div id="my-events-div">
        <ul id="my-events-tabs" class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active"><a href="#reservations-container" aria-controls="reservations-container" role="tab" 
                data-toggle="tab" data-bind="html: vems.myEvents.reservationsText, click: function () { vems.myEvents.myEventsViewModel.activeTab('reservations'); }"></a></li>
            <li role="presentation"><a href="#bookings-container" aria-controls="bookings-container" role="tab" data-toggle="tab" 
                data-bind="html: vems.myEvents.bookingsText, click: function () { vems.myEvents.myEventsViewModel.activeTab('bookings'); }"></a></li>
              <Dea:HelpButton runat="server" ID="VEMSBrowseReservationsHelp" CssClass="floatRight" LookupKey="VEMSBrowseReservationsHelp" ParentType="None" />
        </ul>
        <div class="tab-content">
            <div id="reservations-container" role="tabpanel" class="tab-pane fade in active">
                <div class="row form-group events-container-row">
                    <div class="col-xs-4">
                        <input id="reservation-search" type="text" class="form-control"/>
                    </div>
                    <div class="col-xs-4">
                        <button type="button" class="btn btn-default btn-main" data-bind="click: vems.myEvents.searchReservations">
                            <%= ScreenText.SearchReservations %>
                        </button>
                        <span class="events-clear-search" data-bind="click: vems.myEvents.clearReservationSearch, visible: reservationSearchText()">
                            <i class="fa fa-times-circle"></i>&nbsp;<%= ScreenText.ClearResults %>
                        </span>
                    </div>
                    <div class="col-xs-4">
                        <div class="include-cancelled-label">
                            <%= ScreenText.IncludeCancelledReservations %>
                        </div>
                        <div class="include-cancelled-icon" role="checkbox" data-bind="click: vems.myEvents.toggleShowCancelled, checked: showCancelledEvents">
                            <i data-bind="css: showCancelledEvents() ? 'fa fa-check-square-o' : 'fa fa-square-o'"></i>
                        </div>
                    </div>
                </div>
                <div>
                    <ul id="reservations-tabs" class="nav nav-tabs" role="tablist">
                        <li role="presentation" class="active"><a href="#reservations-grid-current" aria-controls="reservations-grid-current" role="tab" data-toggle="tab" 
                            data-bind="html: vems.myEvents.currentText + (reservationSearchText() ? ' (' + currentReservations.eventCount() + ')' : ''), click: function () { vems.myEvents.myEventsViewModel.reservationTab('current'); }"></a></li>
                        <li role="presentation"><a href="#reservations-grid-past" aria-controls="reservations-grid-past" role="tab" data-toggle="tab" 
                            data-bind="html: vems.myEvents.pastText + (reservationSearchText() ? ' (' + pastReservations.eventCount() + ')' : ''), click: function () { vems.myEvents.myEventsViewModel.reservationTab('past'); }"></a></li>
                    </ul>
                    <div class="tab-content">
                        <div id="reservations-grid-current" role="tabpanel" class="tab-pane fade in active">
                            <div class="events-container-row">
                                <div class="row sortable-grid-header">
		                            <div class="col-xs-12">
			                            <div class="col-xs-3 grid-text" data-bind="click: function () { vems.myEvents.sortReservations('Name'); }">
                                            <%= ScreenText.Name %>
                                            <!-- ko if: currentReservations.sortProperty() === 'Name' -->
                                            &nbsp;<i data-bind="css: currentReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
			                            <div class="col-xs-2 grid-text" data-bind="click: function () { vems.myEvents.sortReservations('Start'); }">
				                            <%= ScreenText.FirstLastBooking %>
                                            <!-- ko if: currentReservations.sortProperty() === 'Start' -->
                                            &nbsp;<i data-bind="css: currentReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
			                            <div class="col-xs-2 grid-text" data-bind="click: function () { vems.myEvents.sortReservations('Location'); }">
				                            <%= ScreenText.Location %>
                                            <!-- ko if: currentReservations.sortProperty() === 'Location' -->
                                            &nbsp;<i data-bind="css: currentReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
			                            <div class="col-xs-1 grid-text" data-bind="visible: showGroupColumn, click: function () { vems.myEvents.sortReservations('GroupName'); }">
                                            <%= EmsParameters.GroupTitleSingular %>
                                            <!-- ko if: currentReservations.sortProperty() === 'GroupName' -->
                                            &nbsp;<i data-bind="css: currentReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
			                            <div class="col-xs-1 grid-text grid-text-center" data-bind="click: function () { vems.myEvents.sortReservations('HasServices'); }">
                                            <%= ScreenText.Services %>
                                            <!-- ko if: currentReservations.sortProperty() === 'HasServices' -->
                                            &nbsp;<i data-bind="css: currentReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
                                        <div class="col-xs-1 grid-text" data-bind="click: function () { vems.myEvents.sortReservations('Id'); }">
                                            <%= ScreenText.IdUppercase %>
                                            <!-- ko if: currentReservations.sortProperty() === 'Id' -->
                                            &nbsp;<i data-bind="css: currentReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
                                        <div class="col-xs-2 grid-text" data-bind="click: function () { vems.myEvents.sortReservations('Status'); }">
                                            <%= ScreenText.Status %>
                                            <!-- ko if: currentReservations.sortProperty() === 'Status' -->
                                            &nbsp;<i data-bind="css: currentReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
		                            </div>
	                            </div>
                                <div class="booking-grid sortable-grid-content col-xs-12 grid-no-height">
                                    <div class="events-loading-overlay"><img class="loading-animation" src="Images/Loading.gif"/></div>
		                            <div>
			                            <!-- ko if: currentReservations.eventCount() > 0 -->
			                            <!-- ko foreach: currentReservations.eventList -->
			                            <div class="row" data-bind="css: { 'grey-text': statusId() === vems.myEvents.cancelledStatusId }">
				                            <div class="col-xs-3 grid-text-wrap">
                                                <span data-bind="visible: statusId() === vems.myEvents.cancelledStatusId, text: '(' + vems.myEvents.cancelledText + ')'"></span>
                                                <a class="ellipsis-text" data-bind="text: vems.decodeHtml(name()), attr: { href: editLink, title: vems.decodeHtml(name()) }, css: { 'grey-text': statusId() === vems.myEvents.cancelledStatusId }"></a>
				                            </div>
				                            <div class="col-xs-2 grid-text">
                                                <span data-bind="html: moment(start()).format('ddd ll') + '/<br/>' + moment(end()).format('ddd ll') + '<br/>'"></span>
                                                <span class="grey-text" data-bind="text: '(' + (bookingCount() > 1 ? vems.decodeHtml(vems.myEvents.multiBookingText) : vems.decodeHtml(vems.myEvents.singleBookingText)) + ')'">(<%= ScreenText.MultiBooking %>)</span>
				                            </div>
				                            <div class="col-xs-2 grid-text-wrap">
                                                <!-- ko ifnot: location().toLowerCase() === 'multiple' -->
                                                <a class="ellipsis-text" data-bind="attr: {title: vems.decodeHtml(location())}, text: vems.decodeHtml(location()), click: function(data){ vems.locationDetailsVM.show(data.buildingId(), data.roomId()); }, css: { 'grey-text': statusId() === vems.myEvents.cancelledStatusId }"></a>
                                                <!-- /ko -->
                                                <!-- ko if: location().toLowerCase() === 'multiple' -->
                                                <span class="ellipsis-text" data-bind="attr: {title: vems.decodeHtml(location())}, text: vems.decodeHtml(location())"></span>
                                                <!-- /ko -->
				                            </div>
				                            <div class="col-xs-1 grid-text" data-bind="visible: $root.showGroupColumn">
                                                <span data-bind="text: vems.decodeHtml(groupName())"></span>
				                            </div>
				                            <div class="col-xs-1 grid-text-center">
                                                <i class="fa fa-check" data-bind="visible: hasServices"></i>
				                            </div>
                                            <div class="col-xs-1 grid-text">
                                                <span data-bind="text: vems.decodeHtml(id())"></span>
                                            </div>
                                            <div class="col-xs-2 grid-text">
                                                <span data-bind="text: vems.decodeHtml(status())"></span>
                                            </div>
			                            </div>
			                            <!-- /ko -->
			                            <!-- /ko -->
			                            <!-- ko ifnot: currentReservations.eventCount() > 0 -->
			                            <div class="row">
				                            <div class="col-xs-12 grid-text-center">
                                                <%= string.Format(ScreenText.NoReservationsToShow, ScreenText.Current.ToLower()) %>
				                            </div>
			                            </div>
			                            <!-- /ko -->
		                            </div>
	                            </div>
                                <div class="row col-xs-12 grid-page-nav" data-bind="visible: currentReservations.pageCount() > 1">
                                    <span class="grid-page-text-left" data-bind="css: { disabled: currentReservations.pageIndex() === 0 }, click: function () { if (currentReservations.pageIndex() > 0) { vems.myEvents.changeReservationPage(currentReservations.pageIndex() - 1, 'current'); } }">
                                        <%= ScreenText.Previous %>
                                    </span>
                                    <!-- ko foreach: new Array(currentReservations.pageCount()) -->
                                    <!-- ko if: vems.myEvents.showPageButton($index(), $root.currentReservations.pageIndex(), $root.currentReservations.pageCount()) -->
                                    <span class="grid-page-btn" data-bind="text: $index() + 1, css: { active: $index() === $root.currentReservations.pageIndex() },
                                        click: function () { vems.myEvents.changeReservationPage($index(), 'current'); }"></span>
                                    <!-- /ko -->
                                    <!-- ko ifnot: vems.myEvents.showPageButton($index(), $root.currentReservations.pageIndex(), $root.currentReservations.pageCount()) -->
                                    <span class="page-ellipsis">...</span>
                                    <!-- /ko -->
                                    <!-- /ko -->
                                    <span class="grid-page-text-right" data-bind="css: { disabled: currentReservations.pageIndex() >= (currentReservations.pageCount() - 1) }, click: function () { if (currentReservations.pageIndex() < (currentReservations.pageCount() - 1)) { vems.myEvents.changeReservationPage(currentReservations.pageIndex() + 1, 'current'); } }">
                                        <%= ScreenText.Next %>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div id="reservations-grid-past" role="tabpanel" class="tab-pane fade">
                            <div class="events-container-row">
                                <div class="row sortable-grid-header">
		                            <div class="col-xs-12">
			                            <div class="col-xs-3 grid-text" data-bind="click: function () { vems.myEvents.sortReservations('Name'); }">
                                            <%= ScreenText.Name %>
                                            <!-- ko if: pastReservations.sortProperty() === 'Name' -->
                                            &nbsp;<i data-bind="css: pastReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
			                            <div class="col-xs-2 grid-text" data-bind="click: function () { vems.myEvents.sortReservations('End'); }">
				                            <%= ScreenText.FirstLastBooking %>
                                            <!-- ko if: pastReservations.sortProperty() === 'End' -->
                                            &nbsp;<i data-bind="css: pastReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
			                            <div class="col-xs-2 grid-text" data-bind="click: function () { vems.myEvents.sortReservations('Location'); }">
				                            <%= ScreenText.Location %>
                                            <!-- ko if: pastReservations.sortProperty() === 'Location' -->
                                            &nbsp;<i data-bind="css: pastReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
			                            <div class="col-xs-1 grid-text" data-bind="visible: showGroupColumn, click: function () { vems.myEvents.sortReservations('GroupName'); }">
                                            <%= EmsParameters.GroupTitleSingular %>
                                            <!-- ko if: pastReservations.sortProperty() === 'GroupName' -->
                                            &nbsp;<i data-bind="css: pastReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
			                            <div class="col-xs-1 grid-text grid-text-center" data-bind="click: function () { vems.myEvents.sortReservations('HasServices'); }">
                                            <%= ScreenText.Services %>
                                            <!-- ko if: pastReservations.sortProperty() === 'HasServices' -->
                                            &nbsp;<i data-bind="css: pastReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
                                        <div class="col-xs-1 grid-text" data-bind="click: function () { vems.myEvents.sortReservations('Id'); }">
                                            <%= ScreenText.IdUppercase %>
                                            <!-- ko if: pastReservations.sortProperty() === 'Id' -->
                                            &nbsp;<i data-bind="css: pastReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
                                        <div class="col-xs-2 grid-text" data-bind="click: function () { vems.myEvents.sortReservations('Status'); }">
                                            <%= ScreenText.Status %>
                                            <!-- ko if: pastReservations.sortProperty() === 'Status' -->
                                            &nbsp;<i data-bind="css: pastReservations.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                            <!-- /ko -->
			                            </div>
		                            </div>
	                            </div>
                                <div class="booking-grid sortable-grid-content col-xs-12 grid-no-height">
                                    <div class="events-loading-overlay"><img class="loading-animation" src="Images/Loading.gif"/></div>
		                            <div>
			                            <!-- ko if: pastReservations.eventCount() > 0 -->
			                            <!-- ko foreach: pastReservations.eventList -->
			                            <div class="row" data-bind="css: { 'grey-text': statusId() === vems.myEvents.cancelledStatusId }">
				                            <div class="col-xs-3 grid-text-wrap">
                                                <span data-bind="visible: statusId() === vems.myEvents.cancelledStatusId, text: '(' + vems.myEvents.cancelledText + ')'"></span>
                                                <a class="ellipsis-text" data-bind="text: vems.decodeHtml(name()), attr: { href: editLink, title: vems.decodeHtml(name()) }, css: { 'grey-text': statusId() === vems.myEvents.cancelledStatusId }"></a>
				                            </div>
				                            <div class="col-xs-2 grid-text">
                                                <span data-bind="html: moment(start()).format('ddd ll') + '/<br/>' + moment(end()).format('ddd ll') + '<br/>'"></span>
                                                <span class="grey-text" data-bind="text: '(' + (bookingCount() > 1 ? vems.decodeHtml(vems.myEvents.multiBookingText) : vems.decodeHtml(vems.myEvents.singleBookingText)) + ')'">(<%= ScreenText.MultiBooking %>)</span>
				                            </div>
				                            <div class="col-xs-2 grid-text-wrap">
                                                <!-- ko ifnot: location().toLowerCase() === 'multiple' -->
                                                <a class="ellipsis-text" data-bind="attr:{title: vems.decodeHtml(location())}, text: vems.decodeHtml(location()), click: function(data){ vems.locationDetailsVM.show(data.buildingId(), data.roomId()); }, css: { 'grey-text': statusId() === vems.myEvents.cancelledStatusId }"></a>
                                                <!-- /ko -->
                                                <!-- ko if: location().toLowerCase() === 'multiple' -->
                                                <span class="ellipsis-text" data-bind="attr:{title: vems.decodeHtml(location())}, text: vems.decodeHtml(location())"></span>
                                                <!-- /ko -->
				                            </div>
				                            <div class="col-xs-1 grid-text" data-bind="visible: $root.showGroupColumn">
                                                <span data-bind="text: vems.decodeHtml(groupName())"></span>
				                            </div>
				                            <div class="col-xs-1 grid-text-center">
                                                <i class="fa fa-check" data-bind="visible: hasServices"></i>
				                            </div>
                                            <div class="col-xs-1 grid-text">
                                                <span data-bind="text: vems.decodeHtml(id())"></span>
                                            </div>
                                            <div class="col-xs-2 grid-text">
                                                <span data-bind="text: vems.decodeHtml(status())"></span>
                                            </div>
			                            </div>
			                            <!-- /ko -->
			                            <!-- /ko -->
			                            <!-- ko ifnot: pastReservations.eventCount() > 0 -->
			                            <div class="row">
				                            <div class="col-xs-12 grid-text-center">
                                                <%= string.Format(ScreenText.NoReservationsToShow, ScreenText.Past.ToLower()) %>
				                            </div>
			                            </div>
			                            <!-- /ko -->
		                            </div>
	                            </div>
                                <div class="row col-xs-12 grid-page-nav" data-bind="visible: pastReservations.pageCount() > 1">
                                    <span class="grid-page-text-left" data-bind="css: { disabled: pastReservations.pageIndex() === 0 }, click: function () { if (pastReservations.pageIndex() > 0) { vems.myEvents.changeReservationPage(pastReservations.pageIndex() - 1, 'past'); } }">
                                        <%= ScreenText.Previous %>
                                    </span>
                                    <!-- ko foreach: new Array(pastReservations.pageCount()) -->
                                    <!-- ko if: vems.myEvents.showPageButton($index(), $root.pastReservations.pageIndex(), $root.pastReservations.pageCount()) -->
                                    <span class="grid-page-btn" data-bind="text: $index() + 1, css: { active: $index() === $root.pastReservations.pageIndex() }, click: function () { vems.myEvents.changeReservationPage($index(), 'past'); }"></span>
                                    <!-- /ko -->
                                    <!-- ko ifnot: vems.myEvents.showPageButton($index(), $root.pastReservations.pageIndex(), $root.pastReservations.pageCount()) -->
                                    <span class="page-ellipsis">...</span>
                                    <!-- /ko -->
                                    <!-- /ko -->
                                    <span class="grid-page-text-right" data-bind="css: { disabled: pastReservations.pageIndex() >= (pastReservations.pageCount() - 1) }, click: function () { if (pastReservations.pageIndex() < (pastReservations.pageCount() - 1)) { vems.myEvents.changeReservationPage(pastReservations.pageIndex() + 1, 'past'); } }">
                                        <%= ScreenText.Next %>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="bookings-container" role="tabpanel" class="tab-pane fade">
                <div class="row form-group events-container-row">
                    <div id="my-bookings-tabs" class="col-xs-4"><%-- id required for shared styling --%>
                        <div id="bookings-datepicker" class="date input-group">
                            <input type="text" readonly />
                            <a id="booking-date-btn" class="input-group-addon" data-bind="visible: !bookingSearchText() || vems.myEvents.myEventsViewModel.bookingTab() !== 'day'">
                                <div class="bookings-datepicker-text">
                                    <span data-bind="text: moment(bookingListDate()).format('ddd ll')"></span>&nbsp;<i class="fa fa-angle-down"></i>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="col-xs-4 events-nav-pills">
                        <div data-bind="visible: bookingSearchText()">&nbsp;</div><%-- placeholder div for formatting when search hides pill nav --%>
                        <ul id="bookings-grid-tabs" class="nav nav-pills center-pills" data-bind="visible: !bookingSearchText()">
                            <li class="active">
                                <a href="#bookings-grid-day" class="bookings-grid-tab" data-toggle="pill" role="tab" data-bind="click: vems.myEvents.showDailyBookings"><%= ScreenText.Day %></a>
                            </li>
                            <li>
                                <a href="#bookings-grid-week" class="bookings-grid-tab" data-toggle="pill" role="tab" data-bind="click: vems.myEvents.showWeeklyBookings"><%= ScreenText.Week %></a>
                            </li>
                            <li>
                                <a href="#bookings-grid-month" class="bookings-grid-tab" data-toggle="pill" role="tab" data-bind="click: vems.myEvents.showMonthlyBookings"><%= ScreenText.Month %></a>
                            </li>
                        </ul>
                    </div>
                    <div class="col-xs-4">
                        <div class="include-cancelled-label">
                            <%= ScreenText.IncludeCancelledBookings %>
                        </div>
                        <div class="include-cancelled-icon" role="checkbox" data-bind="click: vems.myEvents.toggleShowCancelled, checked: showCancelledEvents">
                            <i data-bind="css: showCancelledEvents() ? 'fa fa-check-square-o' : 'fa fa-square-o'"></i>
                        </div>
                    </div>
                </div>
                <div class="row form-group my-events-tz-row">
                    <div class="col-xs-12">
                        <span data-bind="text: vems.decodeHtml(vems.myEvents.myEventsViewModel.userTimeZone()) + (vems.myEvents.myEventsViewModel.userTimeZoneAbbr() ? ' [' + vems.myEvents.myEventsViewModel.userTimeZoneAbbr() + ']' : '')"></span>
                    </div>
                </div>
                <div class="row form-group events-container-row">
                    <div class="col-xs-4">
                        <input class="form-control" id="booking-search" type="text" data-bind="visible: vems.myEvents.myEventsViewModel.bookingTab() === 'day'" />
                    </div>
                    <div class="col-xs-4">
                        <button type="button" class="btn btn-default btn-main" data-bind="click: vems.myEvents.searchBookings, visible: vems.myEvents.myEventsViewModel.bookingTab() === 'day'">
                            <%= ScreenText.SearchBookings %>
                        </button>
                        <span data-bind="visible: vems.myEvents.myEventsViewModel.bookingTab() === 'day'">
                            <span class="events-clear-search" data-bind="click: vems.myEvents.clearBookingSearch, visible: bookingSearchText()">
                                <i class="fa fa-times-circle"></i>&nbsp;<%= ScreenText.ClearResults %>
                            </span>
                        </span>
                    </div>
                    <div class="col-xs-4 grid-page-nav events-day-nav" data-bind="visible: !bookingSearchText() || vems.myEvents.myEventsViewModel.bookingTab() !== 'day'">
                        <span class="grid-page-text-left" data-bind="click: vems.myEvents.myBookingsPrevious"><%= ScreenText.Previous %></span>
                        <span class="grid-page-text-left" data-bind="click: vems.myEvents.myBookingsToday"><%= ScreenText.Today %></span>
                        <span class="grid-page-text-left" data-bind="click: vems.myEvents.myBookingsNext"><%= ScreenText.Next %></span>
                    </div>
                </div>

                <div class="tab-content">
                    <div id="bookings-grid-day" role="tabpanel" class="tab-pane fade in active">
                        <div class="events-container-row">
                            <div class="events-grid-separator"></div>
                            <div class="row sortable-grid-header">
		                        <div class="col-xs-12">
			                        <div class="col-xs-2 grid-text" data-bind="click: function () { vems.myEvents.sortBookings('Start'); }">
                                        <!-- ko ifnot: bookingSearchText() -->
                                        <%= ScreenText.Time %>
                                        <!-- /ko -->
                                        <!-- ko if: bookingSearchText() -->
                                        <%= ScreenText.DateAndTime %>
                                        <!-- /ko -->
                                        <!-- ko if: dailyBookings.sortProperty() === 'Start' -->
                                        &nbsp;<i data-bind="css: dailyBookings.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                        <!-- /ko -->
			                        </div>
			                        <div class="col-xs-3 grid-text" data-bind="click: function () { vems.myEvents.sortBookings('Name'); }">
				                        <%= ScreenText.Name %>
                                        <!-- ko if: dailyBookings.sortProperty() === 'Name' -->
                                        &nbsp;<i data-bind="css: dailyBookings.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                        <!-- /ko -->
			                        </div>
			                        <div class="col-xs-2 grid-text" data-bind="click: function () { vems.myEvents.sortBookings('Location'); }">
				                        <%= ScreenText.Location %>
                                        <!-- ko if: dailyBookings.sortProperty() === 'Location' -->
                                        &nbsp;<i data-bind="css: dailyBookings.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                        <!-- /ko -->
			                        </div>
                                    <div class="col-xs-2 grid-text" data-bind="click: function () { vems.myEvents.sortBookings('Status'); }">
				                        <%= ScreenText.Status %>
                                        <!-- ko if: dailyBookings.sortProperty() === 'Status' -->
                                        &nbsp;<i data-bind="css: dailyBookings.sortDescending() ? 'fa fa-angle-down' : 'fa fa-angle-up'"></i>
                                        <!-- /ko -->
			                        </div>
                                    <div class="col-xs-3 grid-text"></div>
		                        </div>
	                        </div>
                            <div class="booking-grid sortable-grid-content col-xs-12 grid-no-height">
                                <div class="events-loading-overlay"><img class="loading-animation" src="Images/Loading.gif"/></div>
		                        <div>
			                        <!-- ko if: dailyBookings.eventCount() > 0 -->
			                        <!-- ko foreach: dailyBookings.eventList -->
			                        <div class="row" data-bind="css: { 'grey-text': statusId() === vems.myEvents.cancelledStatusId }">
				                        <div class="col-xs-2 grid-text-wrap">
                                            <!-- ko ifnot: vems.myEvents.myEventsViewModel.bookingSearchText() -->
                                            <span data-bind="html: moment(userStart()).format('LT') + ' - ' + moment(userEnd()).format('LT') + ' ' + vems.myEvents.myEventsViewModel.userTimeZoneAbbr() + (userStart() !== start() ? ' /' : '')"></span>
                                            <!-- ko if: userStart() !== start() -->
                                            <br /><span class="grey-text" data-bind="html: moment(start()).format('LT') + ' - ' + moment(end()).format('LT') + ' ' + timeZoneAbbr()"></span>
                                            <!-- /ko -->
                                            <!-- /ko -->
                                            <!-- ko if: vems.myEvents.myEventsViewModel.bookingSearchText() -->
                                            <span data-bind="html: moment(userStart()).format('ddd ll')"></span>
                                            <br /><span data-bind="html: moment(userStart()).format('LT') + ' - ' + moment(userEnd()).format('LT') + ' ' + vems.myEvents.myEventsViewModel.userTimeZoneAbbr() + (userStart() !== start() ? ' /' : '')"></span>
                                            <!-- ko if: userStart() !== start() -->
                                            <br /><span class="grey-text" data-bind="html: moment(start()).format('LT') + ' - ' + moment(end()).format('LT') + ' ' + timeZoneAbbr()"></span>
                                            <!-- /ko -->
                                            <!-- /ko -->
				                        </div>
				                        <div class="col-xs-3 grid-text-wrap">
                                            <span data-bind="visible: statusId() === vems.myEvents.cancelledStatusId, text: '(' + vems.myEvents.cancelledText + ')'"></span>
                                            <a data-bind="text: vems.decodeHtml(name()), attr: { href: editLink }, css: { 'grey-text': statusId() === vems.myEvents.cancelledStatusId }, click: function () { vems.bookingDetailsVM.show(id(), 0); }"></a>
				                        </div>
				                        <div class="col-xs-2 grid-text-wrap">
                                            <a data-bind="text: vems.decodeHtml(location()), click: function(data){ vems.locationDetailsVM.show(data.buildingId(), data.roomId()); }, css: { 'grey-text': statusId() === vems.myEvents.cancelledStatusId }"></a>
				                        </div>
                                        <div class="col-xs-2 grid-text-wrap">
                                            <span data-bind="text: vems.decodeHtml(status()), css: { 'grey-text': statusId() === vems.myEvents.cancelledStatusId }"></span>
				                        </div>
				                        <div class="col-xs-3 grid-text-wrap table-buttons" data-bind="visible: statusId() !== vems.myEvents.cancelledStatusId">
                                            <button type="button"  class="btn btn-primary btn-xs disabled" disabled="disabled" data-toggle="modal" data-bind="visible: CheckedIn"><%= ScreenText.IsCheckedIn %></button>
                                            <button class="btn btn-xs" data-bind="click: vems.myEvents.checkInToBooking, visible: canCheckIn"><%= ScreenText.Checkin %></button>
                                            <!-- ko if: !videoConferenceHost() || (occurrenceCount() === 1) -->
                                            <button class="btn btn-xs" data-bind="click: vems.myEvents.cancelBooking, visible: canCancel"><%= ScreenText.Cancel %></button>
                                            <!-- /ko -->
                                            <button class="btn btn-xs" data-bind="click: vems.myEvents.endBookingNow, visible: canEndNow"><%= ScreenText.EndNow %></button>
				                        </div>
			                        </div>
			                        <!-- /ko -->
			                        <!-- /ko -->
			                        <!-- ko ifnot: dailyBookings.eventCount() > 0 -->
			                        <div class="row">
				                        <div class="col-xs-12 grid-text-center" data-bind="text: vems.decodeHtml(vems.myEvents.myEventsViewModel.bookingSearchText() ? vems.myEvents.noBookingsSearchText.replace('{0}', vems.myEvents.myEventsViewModel.bookingSearchText()) : vems.myEvents.noBookingsText.replace('{0}', moment(bookingListDate()).format('ddd ll')))"></div>
			                        </div>
			                        <!-- /ko -->
		                        </div>
	                        </div>
                            <div class="row col-xs-12 grid-page-nav" data-bind="visible: dailyBookings.pageCount() > 1">
                                <span class="grid-page-text-left" data-bind="css: { disabled: dailyBookings.pageIndex() === 0 }, click: function () { if (dailyBookings.pageIndex() > 0) { vems.myEvents.changeBookingPage(dailyBookings.pageIndex() - 1); } }">
                                    <%= ScreenText.Previous %>
                                </span>
                                <!-- ko foreach: new Array(dailyBookings.pageCount()) -->
                                <!-- ko if: vems.myEvents.showPageButton($index(), $root.dailyBookings.pageIndex(), $root.dailyBookings.pageCount()) -->
                                <span class="grid-page-btn" data-bind="text: $index() + 1, css: { active: $index() === $root.dailyBookings.pageIndex() }, click: function () { vems.myEvents.changeBookingPage($index()); }"></span>
                                <!-- /ko -->
                                <!-- ko ifnot: vems.myEvents.showPageButton($index(), $root.dailyBookings.pageIndex(), $root.dailyBookings.pageCount()) -->
                                <span class="page-ellipsis">...</span>
                                <!-- /ko -->
                                <!-- /ko -->
                                <span class="grid-page-text-right" data-bind="css: { disabled: dailyBookings.pageIndex() >= (dailyBookings.pageCount() - 1) }, click: function () { if (dailyBookings.pageIndex() < (dailyBookings.pageCount() - 1)) { vems.myEvents.changeBookingPage(dailyBookings.pageIndex() + 1); } }">
                                    <%= ScreenText.Next %>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div id="bookings-grid-week" role="tabpanel" class="tab-pane fade">
                        <div id="bookings-calendar-week" class="event-calendar"></div>
                    </div>
                    <div id="bookings-grid-month" role="tabpanel" class="tab-pane fade">
                        <div id="bookings-calendar-month" class="event-calendar"></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- booking details modal -->
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
        <!-- cancel modal -->
        <div class="modal fade" id="cancel-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content" id="cancel-modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h3 class="modal-title"><%= ScreenText.CancelBookingQuestion %></h3>
                    </div>
                    <div class="modal-body">
				        <p class="date"></p>
				        <p class="event-name"></p>
				        <p class="location"></p>
                        <div class="reason dropdown form-group" style="display: none;">
                            <label class="control-label" for="cancel-reason"><%= ScreenText.CancelReason %></label>
                            <select class="form-control required" name="cancel-reason" data-bind="foreach: cancelReasons">
                                <!-- ko if: $index() === 0 -->
                                <option value=""></option>
                                <!-- /ko -->
                                <option data-bind="text: vems.decodeHtml(Reason()), value: Id(), attr: { 'data-notes-required': RequireNotes() }"></option>
                            </select>
                        </div>
                        <div class="notes form-group" style="display: none;">
                            <label class="control-label" for="cancel-notes"><%= ScreenText.CancelNotes %></label>
                            <textarea name="cancel-notes" class="form-control" rows="3"></textarea>
                        </div>
			        </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" id="cancel-btn-yes"><%= ScreenText.YesCancel %></button>
                        <button type="button" class="btn btn-primary" id="cancel-btn-no" data-dismiss="modal"><%= ScreenText.NoCancel %></button>
                    </div>
                </div>
            </div>
        </div>
        <!-- end now modal -->
        <div class="modal fade" id="endnow-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content" id="endnow-modal-content">
                    <div class="modal-header">
                        <button id="close-endnow-button" type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h3 class="modal-title"><%= Messages.EndNowConfirm %></h3>
                    </div>
                    <div class="modal-body">
				        <p class="date"></p>
				        <p class="event-name"></p>
				        <p class="location"></p>
			        </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" id="endnow-btn-yes"><%= ScreenText.YesEndBooking %></button>
                        <button type="button" class="btn btn-primary" id="endnow-btn-no" data-dismiss="modal"><%= ScreenText.NoDontEnd %></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- location details modal -->
    <div id="location-details-comp" data-bind='component: { name: "location-details-component", params: { } }'></div>

</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/browse-reservations") %>
    <%= Scripts.Render("~/bundles/booking-details") %>
    <%= Scripts.Render("~/bundles/location-details-component") %>

    <script type="text/javascript">
        vems.myEvents.reservationsText = '<%= escapeQuotes(ScreenText.Reservations) %>';
        vems.myEvents.bookingsText = '<%= escapeQuotes(ScreenText.Bookings) %>';
        vems.myEvents.currentText = '<%= escapeQuotes(ScreenText.Current) %>';
        vems.myEvents.pastText = '<%= escapeQuotes(ScreenText.Past) %>';
        vems.myEvents.multiBookingText = '<%= escapeQuotes(ScreenText.MultiBooking) %>';
        vems.myEvents.singleBookingText = '<%= escapeQuotes(ScreenText.SingleBooking) %>';
        vems.myEvents.cancelledText = '<%= escapeQuotes(ScreenText.Cancelled.ToUpper()) %>';
        vems.myEvents.cancelledStatusId = parseInt(<%= (int)Dea.Ems.Configuration.StatusType.Cancel %>);
        vems.myEvents.noBookingsText = '<%= escapeQuotes(Messages.NoBookingsForDate) %>';
        vems.myEvents.noBookingsSearchText = '<%= escapeQuotes(Messages.NothingWasFoundForSearchString) %>';
        vems.myEvents.moreText = '<%= escapeQuotes(ScreenText.More) %>';
        vems.myEvents.checkedInText = '<%= escapeQuotes(ScreenText.CheckedInStatus) %>';
        vems.myEvents.notCheckedInText = '<%= escapeQuotes(ScreenText.NotCheckedInStatus) %>';

        $(document).ready(function () {
            var data = ko.mapping.fromJS(<%= jsonViewModel %>);
            vems.myEvents.myEventsViewModel = new vems.myEvents.myEventsVM(data);
            ko.applyBindings(vems.myEvents.myEventsViewModel, $("#my-events-div")[0]);
            ko.applyBindings(null, $('#location-details-comp')[0]);

            $('#reservation-search').keypress(function (e) {
                if (e.which === 13) {
                    vems.myEvents.searchReservations();
                    return false;
                }
            });
            $('#booking-search').keypress(function (e) {
                if (e.which === 13) {
                    vems.myEvents.searchBookings();
                    return false;
                }
            });
            vems.myEvents.buildCalendarControls();

            if (DevExpress.devices.real().phone) {
                $('.nav li').click(function () {  // manually switch tabs in mobile
                    var tabSectionId = $(this).find('a').attr('href');
                    $('.nav a[href="' + tabSectionId + '"]').tab('show');
                });
            }
        });
    </script>
</asp:Content>
