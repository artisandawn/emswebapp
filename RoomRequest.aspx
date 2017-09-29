<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="Reservations_RoomRequest" Title="<%$Resources:PageTitles, RoomRequest %>" EnableViewState="false" CodeBehind="RoomRequest.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="server">
    <%# Styles.Render("~/Content/plugin/book-grid") %>
    <%# Styles.Render("~/Content/dynamic-filters") %>
    <style>
        #book-grid-container {
            margin-left: 0;
            margin-right: 0;
        }

        .column-container {
            margin-left: 15px;
            height: auto !important;
        }

        .time-box-overflow {
            left: 15px;
            width: 210px;
        }
    </style>
</asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <div id="room-request-content">

        <div id="template-container" style="display: none;" data-bind="visible: templateId() <= 0">
            <div id="my-reservation-templates">
                <h2><%= ScreenText.MyReservationTemplates %></h2>
                <div>
                    <div id="templates-no-results" class="no-bookings-wrap" style="display: none;">
                        <h3><%= Messages.YouHaveNoTemplatesConfigured %></h3>
                    </div>
                    <div id="templates-grid" class="booking-grid col-xs-12">
                        <div data-bind="template: { name: 'my-reservation-templates-template', foreach: templates }"></div>
                    </div>
                </div>
            </div>
        </div>
        <div id="room-request-container" style="display: none;" data-bind="visible: templateId() > 0">
            <div class="row request-head hidden-xs" data-bind="visible: vems.roomRequest.pageMode == 'InitialRequest' || vems.roomRequest.pageMode == 'ServiceOnlyRequest'">
                <div class="col-md-6 ellipsis-text template-head">
                    <a href="#" class="fa fa-times" data-toggle="modal" data-target="#template-x-modal"></a>
                    <span class="template-head-text" data-bind="text: vems.decodeHtml(template().Text)"></span>
                    <a href="#" class="fa fa-info-circle" data-bind="attr: { 'data-navigateurl': template().NavigateUrl, 'data-templateid': template().Id }" data-toggle="modal" data-target="#template-modal"></a>
                </div>
                <div class="col-md-6">
                    <span class="float-right">
                        <button type="button" class="btn btn-success" data-bind="click: function(){ return saveReservation(); }"><%= ScreenText.CreateReservation %></button>
                    </span>
                    <span id="cart-header-container" class="cart-header-container float-right" data-bind="click: $root.cart.myCartClicked">
                        <i class="fa fa-shopping-cart"></i>
                        <span><%= ScreenText.MyCart %></span>
                        <span data-bind="text: ' (' + $root.cart.bookings().length + ')'"></span>
                    </span>
                </div>
                <!-- template X modal -->
                <div id="template-x-modal" class="modal" role="dialog" aria-labelledby="template-x-modal-title">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="template-x-modal-close-icon"><span aria-hidden="true">&times;</span></button>
                                <h3 class="modal-title" id="template-x-modal-title"><%= ScreenText.StartOver %></h3>
                            </div>
                            <div class="modal-body" style="white-space: pre-line;">
                                <%= Messages.TemplateCloseStartOver %>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-default" data-bind="click: function(){ window.location = 'RoomRequest.aspx'; }" data-dismiss="modal" id="template-x-modal-new-template"><%= ScreenText.SelectANewTemplate %></button>
                                <button type="button" class="btn btn-default" data-bind="click: vems.roomRequest.refreshPage" data-dismiss="modal" id="template-x-modal-reset"><%= ScreenText.UseTheCurrentTemplate %></button>
                                <button type="button" class="btn btn-primary" data-dismiss="modal" id="template-x-modal-continue"><%= ScreenText.StayHere %></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="text-align: center;" id="main-tabs-container" data-bind="visible: vems.roomRequest.pageMode == 'InitialRequest' || vems.roomRequest.pageMode == 'ServiceOnlyRequest'">
                <ul id="main-tabs" class="nav nav-tabs hidden-xs" role="tablist">
                    <li role="presentation" class="active" data-type="bookings"><a href="#bookings" aria-controls="bookings" role="tab" data-toggle="tab"><span>1 </span><%= BookingTabLabel %></a></li>
                    <i class="fa fa-caret-right"></i>
                    <li role="presentation" data-type="services" data-bind="visible: roomRequestModel.templateRules().ServicesPossible"><a id="services-tab" href="#services" aria-controls="services" role="tab" data-toggle="tab">
                        <span>2 </span><%= ScreenText.Services %></a></li>
                    <i class="fa fa-caret-right" data-bind="visible: roomRequestModel.templateRules().ServicesPossible"></i>
                    <li role="presentation" data-type="details"><a href="#details" aria-controls="details" role="tab" data-toggle="tab"><span data-bind="text: roomRequestModel.templateRules().ServicesPossible ? '3 ' : '2 '"></span><%= ScreenText.ReservationDetails %></a></li>
                    <li role="presentation" data-type="cart" style="display: none;"><a href="#cart" aria-controls="cart" role="tab" data-toggle="tab"><%= ScreenText.Cart %></a></li>
                </ul>
            </div>
            <div id="breadcrumb" class="row" style="margin-bottom: 15px;" data-bind="visible: vems.roomRequest.pageMode != 'InitialRequest' && vems.roomRequest.pageMode != 'ServiceOnlyRequest'">
                <div class="col-md-4">
                    <a data-bind="attr: { href: vems.roomRequest.breadcrumb.link }"><i class="fa fa-chevron-left"></i>
                        &nbsp;
                    <span data-bind="text: vems.decodeHtml(vems.roomRequest.breadcrumb.text)"></span>
                        <!-- ko if: vems.roomRequest.bookingId > 0 -->
                        <span data-bind="text: '(' + vems.roomRequest.bookingId + ')'"></span>
                        <!-- /ko -->
                    </a>
                </div>
                <div class="col-md-8" data-bind="visible: vems.roomRequest.pageMode == 'AddBooking'">
                    <span class="float-right" style="padding-left: 15px">
                        <Dea:HelpButton runat="server" ID="VEMSAddBookingHelp" CssClass="floatRight" LookupKey="VEMSAddBookingHelp" ParentType="WebTemplate" />
                    </span>
                    <span class="float-right">
                        <button type="button" class="btn btn-success" data-bind="click: function(){ return saveReservation(); }"><%= ScreenText.UpdateReservation %></button>
                    </span>
                    <span id="bc-cart-header-container" class="cart-header-container float-right" data-bind="click: $root.cart.myCartClicked">
                        <i class="fa fa-shopping-cart"></i>
                        <span><%= ScreenText.MyCart %></span>
                        <span data-bind="text: ' (' + $root.cart.bookings().length + ')'"></span>
                    </span>
                </div>
                <div class="col-md-8" data-bind="visible: vems.roomRequest.pageMode == 'EditBooking'">
                    <Dea:HelpButton runat="server" ID="VEMSEditBookingHelp" CssClass="floatRight" LookupKey="VEMSEditBookingHelp" ParentType="WebTemplate" />
                </div>
            </div>
            <div class="tab-content">
                <div role="tabpanel" class="tab-pane active" id="bookings">
                    <div class="row main-header-row hidden-xs" id="room-request-header-row">
                        <div class="col-md-10">
                            <div id="new-booking-header-text" class="main-header-text">
                                <span data-bind="if: filters.date() && cart.bookingEditing() == null">
                                    <span><%= ScreenText.NewBookingFor %> </span>
                                    <span data-bind="text: moment(filters.date()).format('ddd ll')"></span>
                                </span>
                                <span data-bind="if: filters.date() && cart.bookingEditing() != null">
                                    <span><%= ScreenText.EditBooking %> </span>
                                    <span data-bind="text: moment(filters.date()).format('ddd ll')"></span>
                                </span>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <button type="button" class="btn btn-primary next-step-btn" id="next-step-btn" data-bind="click: nextStepClicked, visible: cart.bookingEditing() == null && (vems.roomRequest.pageMode == 'InitialRequest' || vems.roomRequest.pageMode == 'ServiceOnlyRequest')"><%= ScreenText.NextStep %></button>
                            <button type="button" class="btn btn-primary next-step-btn" data-bind="click: $root.cart.updateBooking, visible: $root.cart.bookingEditing() != null" data-dismiss="modal" id="update-booking-header"><%= ScreenText.UpdateBooking %></button>
                            <button id="add-location-done" type="button" class="btn btn-primary next-step-btn" data-bind="click: $root.cart.updateBooking, visible: vems.roomRequest.pageMode == 'AddPamLocation' && $root.cart.bookings().length > 0" data-dismiss="modal"><%= ScreenText.Done %></button>
                        </div>
                    </div>
                    <div class="row" id="filter-result-row">
                        <div class="col-md-4 col-sm-5 col-xs-12" id="filter-column">
                            <div class="row visible-xs" id="responsive-actions-top-container" style="margin-bottom: 15px;">
                                <div class="col-xs-6">
                                    <button type="button" id="responsive-cancel-top-btn" class="btn btn-default" data-bind="click: function(){ window.location = vems.roomRequest.pageMode == 'InitialRequest' ? 'RoomRequest.aspx' : 'Default.aspx'; }"><%= ScreenText.Cancel %></button>
                                </div>
                                <div class="col-xs-6">
                                    <button type="button" id="responsive-save-top-btn" class="btn btn-primary" style="float: right;" data-bind="click: function(){ return responsiveSaveReservation(); }"><%= ScreenText.NextStep %></button>
                                </div>
                            </div>
                            <div class="panel-group" id="filters-panel" role="tablist" aria-multiselectable="true">
                                <div class="panel panel-default" id="event-detail-filters" data-bind="visible: vems.roomRequest.pageMode == 'EditBooking'">
                                    <div class="panel-heading" role="tab" id="event-detail-filters-header">
                                        <h4 class="panel-title">
                                            <%= string.Format(ScreenText.EventDetails, EmsParameters.EventsTitleSingular) %>
                                        </h4>
                                    </div>
                                    <div id="event-detail-collapse" role="tabpanel" aria-labelledby="event-detail-filters-header">
                                        <div class="form-group" style="padding-top: 15px; padding-right: 15px;">
                                            <label for="event-name" class="required"><%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular) %></label>
                                            <input type="text" class="form-control" id="event-name-edit" required="required" data-bind="textInput: reservationDetails.eventName" maxlength="255">
                                        </div>
                                        <div class="form-group" style="padding-right: 15px;">
                                            <label for="event-type" class="required"><%= string.Format(ScreenText.EventType, EmsParameters.EventsTitleSingular) %></label>
                                            <select class="form-control" id="event-type-edit" required="required" data-bind="value: reservationDetails.eventType, options: templateRules().EventTypes, optionsText: function(item){ return vems.decodeHtml(item.Description); }, optionsValue: 'Id'"></select>
                                        </div>
                                    </div>
                                </div>
                                <div class="panel panel-default" id="date-time-filters">
                                    <div class="panel-heading" role="tab" id="date-time-filters-header">
                                        <h4 class="panel-title">
                                            <%= ScreenText.DateAndTime %>
                                        </h4>
                                    </div>
                                    <div id="date-time-collapse" class="" role="tabpanel" aria-labelledby="date-time-filters-header">
                                        <div id="recurrence-pattern-overlay" data-bind="visible: recurrence.recurrenceCount() > 0"></div>
                                        <div class="date-container">
                                            <div style="float: left;" data-bind="visible: recurrence.recurrenceCount() <= 0">
                                                <%= ScreenText.Date %>
                                                <div class="date input-group" id="booking-date" data-bind="datePicker: filters.date, datepickerOptions: { format: 'ddd L', minDate: templateRules().FirstAllowedBookingDate, maxDate: templateRules().LastAllowedBookingDate, keepInvalid: true }">
                                                    <input type="text" id="booking-date-input" class="form-control" data-bind="disable: disableTimeFields" />
                                                    <span class="input-group-addon"><span class="fa fa-calendar"></span></span>
                                                </div>
                                            </div>
                                            <button type="button" class="btn btn-default btn-main hidden-xs" id="recurrenceBtn" data-toggle="modal" data-target="#recurrence-modal" data-bind="visible: (vems.roomRequest.pageMode == 'InitialRequest' || vems.roomRequest.pageMode == 'ServiceOnlyRequest' || vems.roomRequest.pageMode == 'AddBooking') && recurrence.recurrenceTypes().length > 0">
                                                <%= ScreenText.Recurrence %>
                                            </button>
                                        </div>
                                        <div class="time-container" data-bind="visible: recurrence.recurrenceCount() <= 0">
                                            <div style="float: left;">
                                                <span class="time-label"><%= ScreenText.StartTime %></span>
                                                <div class='date input-group' id="booking-start" data-bind="timePicker: filters.start, datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %>}">
                                                    <input type='text' class='form-control' data-bind="disable: disableTimeFields" />
                                                    <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>
                                                </div>
                                            </div>
                                            <div class="end-container" style="float: right; margin-right: 5px;">
                                                <span class="time-label"><%= ScreenText.EndTime %></span>
                                                <div class='date input-group' id="booking-end" data-bind="timePicker: filters.end, datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %>}">
                                                    <input type='text' class='form-control' data-bind="disable: disableTimeFields" />
                                                    <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>
                                                </div>
                                            </div>
                                            <div class="next-day-indicator" data-bind="visible: filters.end().hour() < filters.start().hour() || (filters.end().hour() === filters.start().hour() && (filters.end().minute() === filters.start().minute()))">
                                                <span><%= ScreenText.EndsNextDayIndicator %></span>
                                            </div>
                                        </div>
                                        <div data-bind="visible: recurrence.recurrenceCount() <= 0">
                                            <div class="form-group" style="margin: 10px 20px 0 5px; padding-bottom: 10px;">
                                                <%= ScreenText.CreateBookingInThisTimeZone %>
                                                <select class="form-control" id="timeZoneDrop" data-bind="disable: disableTimeFields, value: filters.timeZoneId, options: templateRules().TimeZones, optionsText: function(t){return vems.htmlDecode(t.TimeZone);}, optionsValue: 'TimeZoneID'">
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <div id="location-filter-container"></div>
                                        </div>
                                        <div id="datetime-overlay-lock" data-bind="visible: vems.roomRequest.pageMode != 'EditPamLocation' && vems.roomRequest.pageMode != 'AddPamLocation' && ((templateRules().AllowInvitations || templateRules().VideoConference) && cart.bookings().length > 0) || ((templateRules().AllowInvitations || templateRules().VideoConference) && cart.bookingEditing() != null && cart.bookingEditing().isOccurrence)">
                                            <span>
                                                <%= string.Format(Messages.DateTimeOverlayLockText, EmsParameters.RoomTitleSingular) %>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div id="search-filters-overlay" style="display: none;">
                                    <span style="white-space: pre-line;"><%= string.Format(Messages.RoomRequestFilterOverlayMessage, EmsParameters.RoomTitleSingular) %></span>
                                </div>
                                <div class="panel panel-default" id="search-room-filters">
                                    <div class="panel-heading action-panel" role="tab" id="search-room-filters-header">
                                        <h4 class="panel-title">
                                            <a id="let-me-search-collapse" role="button" class="collapsed" data-toggle="collapse" data-parent="#filters-panel" href="#search-room-collapse" aria-expanded="false" aria-controls="#search-room-collapse">
                                                <i class="fa fa-chevron-circle-up" style="margin-right: 10px;"></i><%= string.Format(ScreenText.LetMeSearchForARoom, EmsParameters.RoomTitleSingular) %>
                                            </a>
                                        </h4>
                                    </div>
                                    <div id="search-room-collapse" class="panel-collapse collapse" role="tabpanel" aria-labelledby="search-room-filters-header">
                                        <div id="filter-container"></div>
                                    </div>
                                </div>

                                <div class="panel panel-default" id="specific-room-filters">
                                    <div class="panel-heading action-panel" role="tab" id="specific-room-filters-header">
                                        <h4 class="panel-title">
                                            <a role="button" data-toggle="collapse" data-parent="#filters-panel" href="#specific-room-collapse" aria-expanded="true" aria-controls="#specific-room-collapse">
                                                <i class="fa fa-chevron-circle-down" style="margin-right: 10px;"></i><%= string.Format(ScreenText.IKnowWhatRoomIWant, EmsParameters.RoomTitleSingular) %>
                                            </a>
                                        </h4>
                                    </div>
                                    <div id="specific-room-collapse" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="specific-room-filters-header">
                                        <!-- ko if: DevExpress.devices.real().phone -->
                                        <div style="margin-top: 15px;">
                                            <button style="width: 100%;" class="btn btn-main" data-bind="click: openMobileLocationsFilter">
                                                <%= string.Format(ScreenText.FilterByX, ScreenText.Location) %>
                                                <span data-bind="visible: filters.locations(), text: ' (' + (filters.locations() ? filters.locations().split(',').length : 0) + ')'"></span>
                                            </button>
                                        </div>
                                        <!-- /ko -->

                                        <div style="position: relative; padding-top: 10px; padding-bottom: 5px;">
                                            <%= string.Format(ScreenText.RoomName, EmsParameters.RoomTitleSingular) %>
                                            <span data-bind="visible: !DevExpress.devices.real().phone || (DevExpress.devices.real().phone && ((cart.bookings && cart.bookings().length === 0) || (cart.bookings && cart.bookings().length > 0 && cart.bookings()[0].RoomId() == 0)))">
                                                <input class="form-control specific-room-input" id="specific-room-search" type="text" data-bind="enable: validateSearchForm" />
                                                <i class="fa fa-search input-icon-embed"></i>
                                            </span>
                                            <div id="responsive-room-input-display" data-bind="visible: DevExpress.devices.real().phone && ((vems.roomRequest.pageMode == 'InitialRequest' && cart.bookings && cart.bookings().length > 0) || cart.bookings && cart.bookings().length > 0 && cart.bookings()[0].RoomId() > 0)">
                                                <div data-bind="foreach: cart.bookings">
                                                    <span class="responsive-room-item" data-bind="click: $root.cart.remove"><span class="fa fa-minus-circle"></span><span data-bind="text: vems.decodeHtml(RoomDescription())"></span></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="panel panel-default" id="od-room-filters" style="display: none;">
                                    <div class="panel-heading" role="tab" id="od-room-filters-header">
                                        <h4 class="panel-title">
                                            <%= ScreenText.LocationDetails %>
                                        </h4>
                                    </div>
                                    <div id="od-room-collapse" class="" role="tabpanel" aria-labelledby="od-room-filters-header">
                                        <div style="margin-top: 5px; margin-right: 20px;">
                                            <%= EmsParameters.BuildingTitlePlural %>
                                            <select class="form-control" id="od-building-drop" data-bind="event: { change: overrideDescriptionBuildingChanged }, value: filters.specificBuildingId, options: templateRules().Facilities, optionsText: function(item){ return vems.decodeHtml(item.Description); }, optionsValue: 'Id'">
                                            </select>
                                        </div>
                                        <div class="form-group" style="position: relative; padding-top: 10px; padding-bottom: 5px; padding-right: 20px;">
                                            <label for="od-location" class="required"><%= ScreenText.Location %></label>
                                            <input type="text" class="form-control" id="od-location" required="required">
                                        </div>
                                    </div>
                                </div>

                                <div class="panel panel-default" id="responsive-room-selected-container" style="display: none;">
                                    <div class="responsive-room-selected-item">
                                        <a href="#" title="remove" data-bind="click: $root.cart.responsiveRemove"><i class="fa fa-minus-circle"></i></a>
                                        <span></span>
                                    </div>
                                </div>

                                <div class="panel-default" id="responsive-attendee-panel" data-bind="visible: DevExpress.devices.real().phone && $root.templateRules().AllowInvitations">
                                    <div class="panel-heading visible-xs" id="responsive-attendee-header">
                                        <h4 class="panel-title">
                                            <%= ScreenText.Attendees %>
                                        </h4>
                                    </div>
                                    <div id="responsive-attendee-collapse" >
                                        <div data-bind="foreach: roomRequestModel.attendees.attendeeList">
                                            <span class="responsive-attendee-item">
                                                <a href="#" class="remove-attendee" data-bind="visible: !IsOwner(), click: function(e){ $root.attendees.removeAttendee(AttendeeGuid())}"><i class="fa fa-minus-circle"></i></a>
                                                <span data-bind="text: DisplayName"></span>
                                            </span>
                                        </div>
                                        <div style="padding-top: 15px;">
                                            <span id="reponsive-attendee-typeahead-container"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="row visible-xs" id="responsive-actions-container">
                                    <div class="col-xs-6">
                                        <button type="button" id="responsive-cancel-btn" class="btn btn-default" data-bind="click: function(){ window.location = vems.roomRequest.pageMode == 'InitialRequest' ? 'RoomRequest.aspx' : 'Default.aspx'; }"><%= ScreenText.Cancel %></button>
                                    </div>
                                    <div class="col-xs-6">
                                        <button type="button" id="responsive-save-btn" class="btn btn-primary" style="float: right;" data-bind="click: function(){ return responsiveSaveReservation(); }"><%= ScreenText.NextStep %></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8 col-sm-7 col-xs-12" id="result-columns" data-bind="visible: !DevExpress.devices.real().phone">
                            <div class="row" id="selectedRoomsContainer" data-bind="visible: vems.roomRequest.pageMode == 'InitialRequest' || vems.roomRequest.pageMode == 'AddBooking' || vems.roomRequest.pageMode == 'AddPamLocation'">
                                <div id="selected-rooms-header" class="result-container-header">
                                    <span><%= string.Format(ScreenText.SelectedRooms, EmsParameters.RoomTitlePlural) %></span>
                                    <span data-bind="visible: setupTypeValidation() > 0 && vems.roomRequest.pageMode == 'InitialRequest' || vems.roomRequest.pageMode == 'ServiceOnlyRequest' || vems.roomRequest.pageMode == 'AddBooking'">
                                        <a class="setup-link" href="#" data-bind="visible: cart.bookings().length > 0, css: { 'disabled': cart.bookings().length == 0 }, click: cart.setupModalLinkClicked">
                                            <i class="fa fa-pencil"></i>
                                            <span style="padding-left: 5px;"><%= ScreenText.AttendanceAndSetupType %></span>
                                        </a>
                                    </span>
                                </div>
                                <div id="selected-rooms-content">
                                    <div style="padding: 10px 15px;" data-bind="visible: cart.bookings().length == 0"><%= string.Format(Messages.YourSelectedRoomsWillAppearHere, EmsParameters.RoomTitlePlural) %></div>
                                    <div class="selected-rooms-container" data-bind="foreach: { data: cart.bookings, as: 'booking' }">
                                        <div class="selected-room-item">
                                            <!-- ko if: typeof(occurrences) != 'undefined' -->
                                            <div data-bind="foreach: $root.cart.getSelectedRoomsForRecurrence(booking)">
                                                <span class="selected-room-remove">
                                                    <a href="#" class="fa fa-minus-circle" data-bind="click: $root.cart.remove"></a>
                                                </span>
                                                <span class="selected-room-floormap" data-bind="if: typeof(FloorPlanIndicatorID) != 'undefined' && FloorPlanIndicatorID() > 0 && <%= HasFloorMap.ToString().ToLowerInvariant() %>">
                                                    <a class="floor-map" href="#selected-rooms-content" data-bind="click: function () { $root.showMap($data); }"><i class="icon-ems-floorplan"></i></a>
                                                </span>
                                                <span>
                                                    <a class="selected-room-name" href="#" data-bind="click: function(data){ vems.locationDetailsVM.show(BuildingId(), RoomId()); }, text: vems.decodeHtml(RoomDescription())"></a>
                                                </span>
                                                (<span data-bind="text: '<%= ScreenText.XOfYOccurrences %> '.replace('{0}', count()).replace('{1}', total())"></span><span class="validation-error-message" 
                                                    data-bind="visible: $root.cart.occurencesInConflict($data) > 0, text: '<%= ScreenText.WithXConflicts %>'.replace('{0}', $root.cart.occurencesInConflict($data))"></span>)
                                                <!-- ko if: $index() < $root.cart.selectedRoomInstanceCount - 1 -->
                                                <span>, </span>
                                                <!-- /ko -->
                                            </div>
                                            <!-- /ko -->
                                            <!-- ko if: typeof(occurrences) === 'undefined' -->
                                            <span class="selected-room-remove">
                                                <a href="#" class="fa fa-minus-circle" data-bind="click: $root.cart.remove"></a>
                                            </span>
                                            <span class="selected-room-floormap" data-bind="if: typeof(FloorPlanIndicatorID) != 'undefined' && FloorPlanIndicatorID() > 0 && <%= HasFloorMap.ToString().ToLowerInvariant() %>">
                                                <a class="floor-map" href="#selected-rooms-content" data-bind="click: function () { $root.showMap($data); }"><i class="icon-ems-floorplan"></i></a>
                                            </span>
                                            <span>
                                                <a class="selected-room-name" href="#" data-bind="click: function(data){ vems.locationDetailsVM.show(BuildingId(), RoomId()); }, text: vems.decodeHtml(RoomDescription())"></a>
                                            </span>
                                            <!-- /ko -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row" id="pamContainer" data-bind="visible: templateRules().AllowInvitations && !disableTimeFields()">
                                <div id="pam-container-header" class="result-container-header">
                                    <span><%= ScreenText.Attendees %></span>
                                </div>
                                <div class="row" style="margin-left: 15px; margin-top: 10px;" data-bind="visible: vems.browse.PAMServiceError().length > 0, text: vems.browse.PAMServiceError"></div>
                                <div class="row" style="margin-bottom: 10px;">
                                    <div class="col-md-12 col-xs-12" data-bind="visible: vems.browse.PAMServiceError().length == 0">
                                        <div id="attendee-grid-container" style="margin-left: 15px;"></div>
                                        <%--<div id="attendee-avail-grid-mobile" class="row" style="display: none;">
                                    <div id="attendee-avail-grid-mobile-content" class="mobile-row mobile-grid-content"></div>
                                </div>--%>
                                    </div>
                                </div>
                            </div>
                            <div class="row" id="resultsContainer">
                                <div id="room-container-header" class="result-container-header">
                                    <span><%= string.Format(ScreenText.RoomSearchResults, EmsParameters.RoomTitleSingular) %></span>
                                    <span data-bind="visible: setupTypeValidation() > 0 && vems.roomRequest.pageMode != 'InitialRequest' && vems.roomRequest.pageMode != 'ServiceOnlyRequest' && vems.roomRequest.pageMode != 'AddBooking' && vems.roomRequest.pageMode != 'AddPamLocation'">
                                        <a class="setup-link" href="#" data-bind="visible: cart.bookings().length > 0, css: { 'disabled': cart.bookings().length == 0 }, click: cart.setupModalLinkClicked">
                                            <i class="fa fa-pencil"></i>
                                            <span style="padding-left: 5px;"><%= ScreenText.AttendanceAndSetupType %></span>
                                        </a>
                                    </span>
                                </div>
                                <div data-bind="visible: !hasResults()" style="padding-left: 15px; padding-top: 10px;">
                                    <span><%= string.Format(ScreenText.RoomsMatchingYourSearchCriteriaWillAppearHere, EmsParameters.RoomTitlePlural) %></span>
                                </div>
                                <div data-bind="visible: hasResults">
                                    <div class="row" id="result-filter-row">

                                        <div class="col-md-12">
                                            <div class="row">
                                                <ul id="result-tabs" class="nav nav-tabs" role="tablist">
                                                    <li role="presentation" data-resulttype="0" data-bind="css: { active: <%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.ResultsAs] %> === 0 }">
                                                        <a href="#list" aria-controls="list" role="tab" data-toggle="tab" data-bind="click: displayTabChanged"><%= ScreenText.List %></a>
                                                    </li>
                                                    <li role="presentation" data-resulttype="1" data-bind="css: { active: <%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.ResultsAs] %> === 1 }">
                                                        <a href="#schedule" aria-controls="schedule" role="tab" data-toggle="tab" data-bind="click: displayTabChanged"><%= ScreenText.Schedule %></a>

                                                    </li>
                                                    <li role="presentation" data-resulttype="2" data-bind="visible: <%= HasFloorMap.ToString().ToLowerInvariant() %>, css: { active: <%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.ResultsAs] %> === 2 }">
                                                        <a href="#floorMap" aria-controls="floorMap" role="tab" data-toggle="tab" data-bind="click: displayTabChanged"><%= ScreenText.FloorMap %></a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-2 col-sm-5">
                                                    <div class="checkbox" style="margin-left: 15px;">
                                                        <label class="ellipsis-text">
                                                            <input type="checkbox" id="favorites-only-chk" value="" data-bind="event: { change: $root.filterAvailableBookings }">
                                                            <%= string.Format(ScreenText.FavoriteRoomsOnly, EmsParameters.RoomTitlePlural) %>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-10 col-sm-7">
                                                    <div id="floormap-filters" class="form-group" style="display: none;">
                                                         <select class="form-control" style="width: 200px;" id="floormap-building-filter"
                                                            data-bind="value: floormapBuildingId, options: floormapBuildings, optionsText: function(item){ return vems.decodeHtml(item.BuildingDescription()); }, optionsValue: 'BuildingID'">
                                                        </select>    
                                                        <select class="form-control" style="width: 200px; margin-left: 5px;" id="floormap-filter"
                                                            data-bind="options: floormapImages, value: chosenFloorMap, optionsValue: 'ImageId', optionsText: function(item){ return vems.decodeHtml(item.Description() + (item.FloorID()>0 ? ' - ' + item.Floor(): '')); }">
                                                        </select>                                                    
                                                        <div id="floormap-room-filter" style="margin-left: 20px;">
                                                            <div class="input-wrapper-for-icon" style="width: 200px;">
                                                                <input class="form-control floormap-roomfilter-input" type="text" placeholder="<%= string.Format(ScreenText.FindARoom, EmsParameters.RoomTitleSingular) %>" data-bind="" />
                                                                <i class="fa fa-search input-icon-embed"></i>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div id="list-room-filter" style="padding-left: 9px; white-space: nowrap;">
                                                        <button id="find-a-room-filter-btn" class="btn btn-primary float-right" data-bind="click: $root.filterAvailableBookings"><%= ScreenText.Search %></button>
                                                        <input type="text" style="width: 165px; margin-right: 9px;" class="form-control float-right" id="find-a-room-filter" data-bind="event: {'keypress': $root.roomFilterKeyPress }" placeholder="<%= string.Format(ScreenText.FindARoom, EmsParameters.RoomTitleSingular) %>">
                                                    </div>

                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    <div class="tab-content">

                                        <div class="events-loading-overlay results-loader" style="position: relative;">
                                            <img class="loading-animation" src="Images/Loading.gif" />
                                        </div>
                                        <div role="tabpanel" class="tab-pane" id="list" data-bind="css: { active: <%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.ResultsAs] %> === 0 }">
                                            <div class="table-responsive">
                                                <!-- ko if: !$root.templateRules().AllowInvitations && listRoomResults().length === 0 && $root.recurrence.remainingDates && $root.recurrence.remainingDates().length > 0 -->
                                                <span><%= Messages.NoSpaceAvailable %> </span>
                                                <a href="#" data-bind="click: $root.cart.skipRemainingClicked"><%=ScreenText.Skip %> <span data-bind="    text: $root.recurrence.remainingDates().length"></span></a>
                                                <!-- /ko -->
                                                <div data-bind="visible: listRoomResults().length === 0 && (!$root.recurrence.remainingDates || $root.recurrence.remainingDates().length===0)"><%= Messages.NoSpaceAvailable %></div>
                                                <table class="table table-striped table-sort" id="available-list" data-bind="visible: listRoomResults().length > 0">
                                                    <thead>
                                                        <tr>
                                                            <th></th>
                                                            <th></th>
                                                            <th><%= EmsParameters.RoomTitleSingular %></th>
                                                            <th data-bind="visible: $root.recurrence.recurrenceCount() > 0" style="min-width: 100px;"><%= ScreenText.Available %></th>
                                                            <th><%= ScreenText.Location %></th>
                                                            <th><%= ScreenText.Floor %></th>
                                                            <th><%= ScreenText.TZ %></th>
                                                            <th><%= ScreenText.Cap %></th>
                                                            <th data-bind="visible: $root.templateRules().Parameters.ShowRoomPricing"><%= ScreenText.Price %></th>
                                                            <th style="min-width: 75px;"><%= ScreenText.Match %></th>
                                                            <th style="display: none;">RecordType</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody data-bind="foreach: listRoomResults">
                                                        <!-- ko if: !$root.templateRules().AllowInvitations && $root.recurrence.remainingDates && $root.recurrence.remainingDates().length > 0 && $index() === 0 -->
                                                        <tr class="static recurrence-row" data-row-index="0" data-bind="attr: { 'data-recordType': RecordType }">
                                                            <td colspan="10">
                                                                <span data-bind="text: $root.recurrence.recurrences().length"></span><span> <%= ScreenText.Occurrences %>: </span>
                                                                <span data-bind="foreach: $root.cart.occurrenceRoomItems()">
                                                                    <span class="recurrence-row-item">
                                                                        <a href="#" class="fa fa-minus-circle" data-bind="click: $root.cart.removeRecurrenceItemFromList" style="margin-left: 5px;"></a>
                                                                        <span data-bind="text: count"></span>
                                                                        <span><%= ScreenText.In %></span>
                                                                        <span data-bind="text: vems.decodeHtml(description)" style="margin-right: 5px;"></span>
                                                                    </span>
                                                                </span>
                                                                <a href="#" id="remaining-dates-popover" data-toggle="popover" data-bind="attr: { 'title': $root.recurrence.remainingDates().length + ' ' + vems.roomRequest.occurrencesRemainingLabel, 'data-content': $.map($root.recurrence.remainingDates(), function(val){ return moment(val).format('ddd L'); }).join(', ') }">
                                                                    <span data-bind="text: $root.recurrence.remainingDates().length + ' '"></span>
                                                                    <%= ScreenText.Remaining %>
                                                                </a>
                                                                <span>| </span>
                                                                <a href="#" data-bind="click: $root.cart.skipRemainingClicked"><%=ScreenText.Skip %> <span data-bind="    text: $root.recurrence.remainingDates().length"></span></a>
                                                            </td>
                                                        </tr>
                                                        <!-- /ko -->
                                                        <tr data-bind="css: { unavailable: UnavailableReason() > 0 }, attr: { 'data-recordType': RecordType, 'data-room-id': RoomId }">
                                                            <td class="action-button-column">
                                                                <a class="add-to-cart" href="#" data-bind="css: { disabled: UnavailableReason() > 0 && UnavailableReason() != 9999 }, click: function(data, event) { $root.cart.add(data, $root.filters, $('#timeZoneDrop')) }, visible: !$root.filteredEditMode()">
                                                                    <i class="fa" data-bind="css: { 'fa-plus-circle': UnavailableReason() == 0, 'fa-minus-circle': UnavailableReason() == 9999 }"></i>
                                                                </a>
                                                            </td>
                                                            <td class="action-button-column" data-bind="if: FloorPlanIndicatorID() > 0 && <%= HasFloorMap.ToString().ToLowerInvariant() %>">
                                                                <a class="floor-map" data-bind="attr: { title: vems.browse.ViewOnMapText }, click: function () { $root.showMap($data); }"
                                                                    href="#"><i class="icon-ems-floorplan"></i></a>
                                                            </td>
                                                            <td>
                                                                <a data-bind="click: function(data){ vems.locationDetailsVM.show(data.BuildingId(), data.RoomId()); }, text: vems.decodeHtml(RoomDescription())"></a>
                                                                <%--<span data-bind="text: vems.decodeHtml(RoomDescription())"></span>--%>
                                                            </td>
                                                            <td data-bind="visible: $root.recurrence.recurrenceCount() > 0">
                                                                <a href="#" data-bind="text: DaysAvailable() + '/' + $root.recurrence.recurrenceCount(), click: $root.cart.availableDaysClicked"></a>
                                                            </td>
                                                            <td>
                                                                <a data-bind="text:  vems.decodeHtml(BuildingDescription()), click: function(data){ vems.locationDetailsVM.show(data.BuildingId(), data.RoomId()); }" href="#"></a>
                                                            </td>
                                                            <td data-bind="text: vems.decodeHtml(Floor())"></td>
                                                            <td data-bind="text: TimeZone"></td>
                                                            <td data-bind="text: Capacity"></td>
                                                            <td data-bind="text: Price, visible:$root.templateRules().Parameters.ShowRoomPricing"></td>
                                                            <td>
                                                                <div class="progress" style="margin-bottom: 0;" data-bind="style: { opacity: Match() === 0 ? .2 : (Match() / 100) } ">
                                                                    <div data-bind="attr: { 'aria-valuenow': Match }, style: { 'width': Match() + '%' }" class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 40%">
                                                                        <span class="sr-only" data-bind="text: Match() + '%'"></span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style="display: none;" data-bind="text: RecordType"></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- available days modal -->
                                                <div id="available-days-modal" class="modal" role="dialog" aria-labelledby="available-days-modal-title">
                                                    <div class="modal-dialog" role="document">
                                                        <div class="modal-content">
                                                            <div class="modal-header">
                                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="available-days-modal-close-icon"><span aria-hidden="true">&times;</span></button>
                                                                <h3 class="modal-title" id="available-days-modal-title"><%= ScreenText.UnavailableDatesAndTimes%></h3>
                                                            </div>
                                                            <div class="modal-body">
                                                                <div class="row" id="available-days-header-msg">
                                                                    <div class="col-md-12" style="padding-bottom: 10px;">
                                                                        <span></span><%= ScreenText.IsUnavailableForTheOccurencesShownBelow %>
                                                                    </div>
                                                                </div>
                                                                <div class="table-responsive">
                                                                    <table id="available-days-conflict-table" class="table">
                                                                        <%--<thead>
                                                                            <tr>
                                                                                <th><%= ScreenText.Date %></th>
                                                                                <th><%= ScreenText.Time %></th>
                                                                                <th><%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular) %></th>
                                                                                <th><%= EmsParameters.GroupTitlePlural %></th>
                                                                            </tr>
                                                                        </thead>--%>
                                                                        <tbody></tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                            <div class="modal-footer">
                                                                <button type="button" class="btn btn-primary" data-dismiss="modal" id="available-days-modal-continue"><%= ScreenText.Close %></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div role="tabpanel" class="tab-pane" id="schedule" data-bind="css: { active: <%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.ResultsAs] %>  ===  1 }">
                                            <div id="book-grid-container"></div>
                                        </div>
                                        <div role="tabpanel" class="tab-pane" id="floorMap" data-bind="visible: <%= HasFloorMap.ToString().ToLowerInvariant() %>, css: { active: <%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.ResultsAs] %>  === 2 }">
                                            <div id="floormap-container" class="floormap-container">
                                                <div id="no-floormap-msg" class="text-center" style="display:none;"><%= Messages.NoFloormapsForYourFilter %> </div>
                                                <!-- ko if: floormapImages().length > 0 -->
                                                <div id="floorplan-component" data-bind="component: { name: 'floorplans-reserve', params: { RoomInfo: new FloorMapRoomInfo(), 
    addRoomClicked: floormapRoomAdded,
    renderType: 'inline',
    ScreenText: {
        RequestText: '<%= escapeQuotes(ScreenText.Request) %>',
        ReserveText: '<%= escapeQuotes(ScreenText.Reserve) %>',
        RoomDetailsText: '<%= escapeQuotes(string.Format(ScreenText.RoomDetails, EmsParameters.RoomTitleSingular)) %>',
        RoomCodeText: '<%= escapeQuotes(string.Format(ScreenText.RoomCode, EmsParameters.RoomTitleSingular)) %>',
        RoomDescriptionText: '<%= escapeQuotes(ScreenText.Description) %>',
        RoomTypeText: '<%= escapeQuotes(string.Format(ScreenText.RoomType, EmsParameters.RoomTitleSingular)) %>',
        AvailabilityText: '<%= escapeQuotes(ScreenText.Availability) %>',
        AvailableText: '<%= escapeQuotes(ScreenText.Available) %>',
        UnavailableText: '<%= escapeQuotes(ScreenText.Unavailable) %>',
        StartTimeText: '<%= escapeQuotes(ScreenText.StartTime) %>',
        EndTimeText: '<%= escapeQuotes(ScreenText.EndTime) %>',
        TitleText: '<%= escapeQuotes(ScreenText.Title) %>',
        GroupNameText: '<%= escapeQuotes(EmsParameters.GroupTitleSingular) %>'
} } }">
                                                    </div>
                                                <!-- /ko -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row" id="edit-btn-container" data-bind="visible: $root.cart.bookingEditing() != null || vems.roomRequest.pageMode == 'AddPamLocation'">
                                    <div>
                                        <button type="button" class="btn btn-primary" data-bind="click: $root.cart.updateBooking, visible: vems.roomRequest.pageMode != 'AddPamLocation'" data-dismiss="modal" id="update-booking"><%= ScreenText.UpdateBooking %></button>
                                        <button type="button" class="btn btn-default" data-bind="click: $root.cart.cancelEdit, visible: vems.roomRequest.pageMode != 'AddPamLocation'" data-dismiss="modal" id="cancel-edit"><%= ScreenText.Cancel %></button>
                                        <button type="button" class="btn btn-primary" data-bind="click: $root.cart.updateBooking, visible: vems.roomRequest.pageMode == 'AddPamLocation' && $root.cart.bookings().length > 0" data-dismiss="modal"><%= ScreenText.Done %></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8 col-sm-7 hidden-xs" id="category-availability-columns" style="display: none;">
                            <div data-bind="foreach: vems.roomRequest.serviceAvailability" style="padding: 15px 0 0 5px;">
                                <section class="collapse-toggle" style="padding-bottom: 15px;">
                                    <div data-bind="text: Category"></div>
                                    <div style="margin-left: 10px" data-bind="text: TimeRestriction"></div>
                                    <div style="margin-left: 10px" data-bind="visible: $data.CategoryBuildings.length > 0">
                                        <i class="indicator fa fa-caret-down"></i>
                                        <a href="#" data-toggle="collapse" data-bind="attr: {'href': '#buildings' + ID, 'aria-controls': 'buildings'+ID}" aria-expanded="false"><%= string.Format(ScreenText.AvailableToBuildings, EmsParameters.BuildingTitleSingular) %></a>
                                        <div data-bind="foreach: $data.CategoryBuildings, attr: {'id': 'buildings'+ID}" class="collapse">
                                            <ul>
                                                <li style="margin-left: 10px" data-bind="text: vems.decodeHtml(Description)"></li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                    <!-- setup edit modal -->
                    <div id="setup-edit-modal" class="modal" role="dialog" aria-labelledby="setup-modal-title">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="setup-modal-close-icon"><span aria-hidden="true">&times;</span></button>
                                    <h3 class="modal-title" id="setup-modal-title"><%= ScreenText.AttendanceAndSetupType %></h3>
                                </div>
                                <div class="modal-body">
                                    <table class="table table-striped table-sort" id="setup-list">
                                        <thead>
                                            <tr>
                                                <th><%= ScreenText.Location %></th>
                                                <th data-bind="visible: $root.setupTypeValidation() > 0"><%= ScreenText.Attendance %></th>
                                                <th data-bind="visible: $root.setupTypeValidation() > 1"><%= ScreenText.SetupType %></th>
                                            </tr>
                                        </thead>
                                        <tbody data-bind="foreach: cart.bookings">
                                            <tr>
                                                <td><a data-bind="text: $root.cart.buildLocationString($data), click: function(data){ vems.locationDetailsVM.show(data.BuildingId(), data.RoomId()); }" href="#"></a></td>
                                                <td class="setup-count" data-bind="visible: $root.setupTypeValidation() > 0">
                                                    <input class="form-control attendance-edit numeric" type="number" value="1" style="width: 80px" data-bind="textInput: Attendance, event: { change: function(d, e) { $root.cart.setupCountChangedFromCart(e.currentTarget); } }, attr: { min: Min, max: Max, required: $root.setupTypeValidation() == 2  }" />
                                                </td>
                                                <td class="setup-type" data-bind="visible: $root.setupTypeValidation() > 1">
                                                    <select class="form-control setupType-edit setup-list-edit" data-bind="event: { change: $root.cart.setupTypeChangedFromCart }, options: $root.filteredRoomSetupTypes($data), optionsText: function(st) { return vems.decodeHtml(st.Description); }, optionsValue: 'Id', value: DefaultSetupTypeId, attr: { required: $root.setupTypeValidation() == 2 }"></select>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-primary" data-bind="click: $root.cart.updateSetupFromModal" id="setup-modal-save"><%= ScreenText.Update %></button>
                                    <button type="button" class="btn btn-default" data-bind="click: $root.cart.cancelUpdateSetupFromModal" data-dismiss="modal" id="setup-modal-cancel"><%= ScreenText.Cancel %></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- abandon edit modal -->
                    <div id="abandon-edit-modal" class="modal" role="dialog" aria-labelledby="abandon-modal-title">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="abandon-modal-close-icon"><span aria-hidden="true">&times;</span></button>
                                    <h3 class="modal-title" id="abandon-modal-title"><%= ScreenText.SaveBookingQuestion %></h3>
                                </div>
                                <div class="modal-body">
                                    <%= Messages.AbandonBookingEdit %>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-primary" data-bind="click: $root.cart.updateBooking" data-dismiss="modal" id="abandon-modal-save"><%= ScreenText.SaveChanges %></button>
                                    <button type="button" class="btn btn-default" data-bind="click: $root.cart.cancelEdit" data-dismiss="modal" id="abandon-modal-discard"><%= ScreenText.IgnoreChanges %></button>
                                    <button type="button" class="btn btn-default" data-dismiss="modal" id="abandon-modal-continue"><%= ScreenText.StayHere %></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- skip occurrences modal -->
                    <div id="skip-occurrences-modal" class="modal" role="dialog" aria-labelledby="skip-occurrences-modal-title">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="skip-occurrences-modal-close-icon"><span aria-hidden="true">&times;</span></button>
                                    <h3 class="modal-title" id="skip-occurrences-modal-title"><%= ScreenText.SkipRemainingOccurrencesQuestion%></h3>
                                </div>
                                <div class="modal-body">
                                    <%= string.Format(Messages.DoYouWantToSkipRemainingOccurrences, EmsParameters.RoomTitlePlural) %>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-default" data-bind="click: $root.cart.skipRemainingClicked" data-dismiss="modal" id="skip-occurrences-modal-discard"><%= ScreenText.SkipOccurrences %></button>
                                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="skip-occurrences-modal-continue"><%= ScreenText.StayHere %></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div role="tabpanel" class="tab-pane" id="services">
                    <%--<pre data-bind="text: ko.toJSON(services, null, 2)"></pre>--%>

                    <div class="row main-header-row" id="service-header-row">
                        <div class="col-md-8">
                            <div id="service-header-text" class="main-header-text">
                                <%= ScreenText.ServicesForYourReservation %>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-primary next-step-btn" data-bind="click: nextStepClicked"><%= ScreenText.NextStep %></button>
                        </div>
                    </div>
                    <div data-bind='component: { name: "booking-services-component", params: { 
    startDateTime: filters.start(),
    endDateTime: filters.end(),
    attendance: $root.attendanceCountComputed,
    Services: $root.services,
    ServiceOrders: $root.serviceOrders,
    PONumberField: $root.reservationDetails.poNumber,
    BillingReferenceField: $root.reservationDetails.billingReference,
    onServicesLoaded: $root.onServicesLoaded,
    onNavToNextStep: $root.nextStepClicked,
    onNavToPreviousStep: $root.prevStepClicked,
    ScreenText: {
        ServicesUnavailableMessage: "<%= escapeQuotes(Messages.ServicesUnavailableMessage) %>",
        ServicesText: "<%= escapeQuotes(ScreenText.Services) %>",
        ServicesAdjustYourSelectionText: "<%= escapeQuotes(ScreenText.ServicesAdjustYourSelection) %>",
        OkText: "<%= escapeQuotes(ScreenText.ActAsOkButton) %>",
        CancelText: "<%= escapeQuotes(ScreenText.ActAsCancelButton) %>",
        SpecialInstructionsText: "<%= escapeQuotes(ScreenText.SpecialInstructions) %>",
        MinText: "<%= escapeQuotes(ScreenText.Min) %>",
        AvailableInventoryText: "<%= escapeQuotes(ScreenText.AvailableInventory) %>",
        ServesText: "<%= escapeQuotes(ScreenText.Serves.ToLowerInvariant()) %>",
        QuantityWarningMessage: "<%= escapeQuotes(Messages.QuantityWarning) %>",
        ConfirmProceedMessage: "<%= escapeQuotes(Messages.ConfirmProceed) %>",
        YesKeepQuantityText: "<%= escapeQuotes(ScreenText.YesKeepQuantity) %>",
        NoChangeQuantityText: "<%= escapeQuotes(ScreenText.NoChangeQuantity) %>",
        SelectionInstructionsMessage: "<%= escapeQuotes(Messages.SelectionInstructions) %>",
        AddCategoryAttendeeText: "<%= escapeQuotes(ScreenText.AddCategoryAttendee) %>",
        IsRequiredMessage: "<%= escapeQuotes(Messages.IsRequiredForFormat) %>",
        TermsAndConditionsText: "<%= escapeQuotes(ScreenText.TermsAndConditions) %>",
        EstimatedCountText: "<%= escapeQuotes(ScreenText.EstimatedCount) %>",
        MustBeGreaterThanMessage: "<%= escapeQuotes(Messages.MustBeGreaterThan) %>",
        SaveChangesText: "<%= escapeQuotes(ScreenText.SaveChanges) %>",
        ServicesSummaryText: "<%= escapeQuotes(ScreenText.ServicesSummary) %>",
        ServiceOrderLockoutMessage: "<%= escapeQuotes(Messages.ServiceOrderLockoutMessage) %>",
        AvailableQuantityExceededMessage: "<%= escapeQuotes(Messages.AvailableQuantityExceeded) %>",
        MinimumQuantityExceededMessage: "<%= escapeQuotes(Messages.MinimumQuantityExceeded) %>",
        NextStepText: "<%= escapeQuotes(ScreenText.NextStep) %>",
        ServicesNextStepText: "<%= escapeQuotes(ScreenText.ServicesNextStep) %>" } } }'>
                    </div>
                    <div class="row"></div>
                </div>

                <div role="tabpanel" class="tab-pane" id="details">
                    <div class="row main-header-row hidden-xs" id="details-header-row">
                        <div class="col-md-12">
                            <div id="details-header-text" class="main-header-text">
                                <%= ScreenText.ReservationDetails %>
                            </div>
                        </div>
                    </div>
                    <div class="form row">
                        <div class="panel panel-default" id="event-details-panel">
                            <div class="panel-heading">
                                <span><%= string.Format(ScreenText.EventDetails, EmsParameters.EventsTitleSingular) %></span>
                                <Dea:HelpButton runat="server" ID="VEMSResDetailsEventHelp" CssClass="floatRight" LookupKey="VEMSResDetailsEventHelp" ParentType="WebTemplate" />
                            </div>
                            <div class="panel-body">
                                <div class="row">
                                    <div class="form-group col-md-3 col-sm-4 col-xs-12">
                                        <label for="event-name" class="required"><%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular) %></label>
                                        <input type="text" class="form-control" id="event-name" required="required" data-bind="textInput: reservationDetails.eventName">
                                    </div>
                                    <div class="form-group col-md-3 col-sm-4 col-xs-12">
                                        <label for="event-type" class="required"><%= string.Format(ScreenText.EventType, EmsParameters.EventsTitleSingular) %></label>
                                        <select class="form-control" id="event-type" required="required" data-bind="value: reservationDetails.eventType, options: templateRules().EventTypes, optionsText: function(item){ return vems.decodeHtml(item.Description); }, optionsValue: 'Id'"></select>
                                    </div>
                                    <div class="col-xs-12 hidden-sm hidden-md hidden-lg" id="responsive-setup-type-container" data-bind="visible: $root.setupTypeValidation() > 1">
                                        <label for="responsive-setup-type" data-bind="css: { required:  $root.setupTypeValidation() == 2 }"><%= ScreenText.SetupType %></label>
                                        <select class="form-control setupType-edit" id="responsive-setup-type" data-bind="event: { change: $root.cart.setupTypeChangedFromCart }, options: $root.filteredRoomSetupTypes($root.cart.bookings().length > 0 ? $root.cart.bookings()[0] : ''), optionsText: function(st) { return vems.decodeHtml(st.Description); }, optionsValue: 'Id', attr: { required: $root.setupTypeValidation() == 2 }"></select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <%--<pre data-bind="text: ko.toJSON(attendees, null, 2)"></pre>--%>
                        <div class="panel panel-default" id="calendaring-details-panel" data-bind="visible: templateRules().AllowInvitations">
                            <div class="panel-heading">
                                <span><%= ScreenText.CalendaringDetails %></span>
                                <Dea:HelpButton runat="server" ID="VEMSResCheckoutMessageHelp" CssClass="floatRight" LookupKey="VEMSResCheckoutMessageHelp" ParentType="WebTemplate" />
                            </div>
                            <div class="panel-body">
                                <div class="row" id="pam-options-container">
                                    <div class="col-xs-6 col-md-3">
                                        <div class="checkbox">
                                            <label>
                                                <input type="checkbox" id="add-to-calendar" data-bind="checked: reservationDetails.SendInvitation ">
                                                <%= ScreenText.MakeCalendarItem %>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-xs-4 col-md-3">
                                        <div class="checkbox">
                                            <label>
                                                <input type="checkbox" id="private" data-bind="checked: reservationDetails.pamPrivate">
                                                <%= ScreenText.PrivateLabel %>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">

                                    <div class="form-group col-md-2 col-sm-4 col-xs-12">
                                        <label for="subject"><%= ScreenText.Subject %></label>
                                        <input type="text" class="form-control" id="subject" data-bind="textInput: reservationDetails.pamSubject">
                                    </div>
                                    <div class="form-group col-md-2 col-sm-12 col-xs-12">
                                        <label for="show-time-as"><%= ScreenText.ShowTimeAs %></label>
                                        <select class="form-control" id="show-time-as" data-bind="value: reservationDetails.pamShowTimeAs, options: reservationDetails.exchangeStates, optionsText:'text', optionsValue: 'value'"></select>
                                    </div>
                                    <div class="form-group col-md-2 col-sm-12 col-xs-12">
                                        <label for="reminder"><%= ScreenText.Reminder %></label>
                                        <select class="form-control" id="reminder" data-bind="value: reservationDetails.pamReminder, options: reservationDetails.reminderTimes, optionsText:'text', optionsValue: 'value'"></select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="form-group col-md-6 col-sm-6 col-xs-12">
                                        <label for="message"><%= ScreenText.Message %></label>
                                        <textarea class="form-control" id="message" data-bind="textInput: reservationDetails.pamMessage" style="height: 300px;"></textarea>
                                    </div>
                                </div>
                                <div class="panel panel-default col-md-6 col-sm-6 col-xs-12" data-bind="visible: AllowPAMAttachments">
                                    <div class="panel-heading" style="line-height: 8px;"><%= ScreenText.AttachFile %></div>
                                    <div class="panel-body">
                                        <div id="att-attach-loading" class="events-loading-overlay">
	                                        <img class="loading-animation" src="Images/Loading.gif"/>
                                        </div>
                                        <div data-bind="foreach: reservationDetails.attendeeAttachments ">
                                            <div class="row" style="margin: 0;">
                                                <div class="col-xs-12 col-md-12">
                                                    <div class="attachment-row" style="width: 100%;">
                                                        <span class="filename ellipsis-text" data-bind="text: name"></span>
                                                        <a class="attachment-delete" href="#" data-bind="click: function(){ $root.removeAttendeeFile($data);}"><i class="fa fa-trash-o fa-3"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div id="fileUploaderPAM"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <%--<pre data-bind="text: ko.toJSON(templateRules(), null, 2)"></pre>--%>
                        <div class="panel panel-default" id="group-panel">
                            <div class="panel-heading">
                                <span><%= string.Format(ScreenText.GroupDetails, Dea.Ems.Configuration.EmsParameters.GroupTitleSingular) %></span>
                                <Dea:HelpButton runat="server" ID="VEMSResDetailsGroupHelp" CssClass="floatRight" LookupKey="VEMSResDetailsGroupHelp" ParentType="WebTemplate" />
                            </div>
                            <div class="panel-body">
                                <div class="row">
                                    <div class="col-xs-12 col-md-3 form-group search-text-box">
                                        <label for="availablegroups" class="required"><%= string.Format(EmsParameters.GroupTitleSingular) %></label>
                                        <select class="form-control" style="display: inline;" id="availablegroups" name="availablegroups" required="required"
                                            data-bind="options: Groups, optionsText: function(item) { return vems.decodeHtml(item.GroupName()); }, optionsValue: 'GroupId', value: reservationDetails.ChosenGroupId">
                                        </select>
                                    </div>
                                    <div class="col-md-2 hidden-xs form-group" style="vertical-align: bottom; line-height: 25px;" data-bind="visible: templateRules().AllowAddGroups">
                                        <div>&nbsp;</div>
                                        <button class="btn btn-default" type="button" data-bind="click: function () { vems.addAGroupVM.show(); }">
                                            <i class="fa fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                        <label for="1stcontact"><%= EmsParameters.FirstContactTitle %></label>
                                        <select class="form-control" id="1stcontact" name="1stcontact"
                                            data-bind="options: Contacts, optionsText: function(item) { return vems.decodeHtml(item.Name); }, optionsValue: 'Id', value: reservationDetails.FirstContactId, enable: Contacts() && Contacts().length > 0">
                                        </select>
                                    </div>
                                    <div class="col-xs-2 col-md-2 form-group" style="vertical-align: bottom; line-height: 25px;"
                                        data-bind="visible: (templateRules().AllowAddContacts && (Groups().length > 0 && reservationDetails.ChosenGroupId() != 0))">
                                        <div>&nbsp;</div>
                                        <button class="btn btn-default hidden-xs" type="button" data-bind="click: function () { showAddContactsModal(); }">
                                            <i class="fa fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                                <%--<pre data-bind="text: ko.toJSON(Groups,null,2)"></pre>--%>
                                <div data-bind="visible: (reservationDetails.FirstContactId && $.isNumeric(reservationDetails.FirstContactId()))">
                                    <%--Temp contanct is 0 for the id --%>
                                    <div class="row" data-bind="visible: reservationDetails.FirstContactId()==0">
                                        <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                            <label for="1stContactName" data-bind="css: { required: reservationDetails.FirstContactId() == 0}"><%= string.Format(ScreenText.ContactName, EmsParameters.FirstContactTitle ) %></label>
                                            <input class="form-control" id="1stContactName" name="1stContactName" maxlength="50" type="text" data-bind="value: reservationDetails.FirstContactName, 
    click: function(){ if (reservationDetails.FirstContactId() == 0){ reservationDetails.FirstContactName('');} },
    attr: {'required': (reservationDetails.FirstContactId() == 0) ? 'required' : null }" />
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                            <label for="1stContactPhone1" data-bind="text: reservationDetails.FirstPhoneOneLabelComputed, css: { required: templateRules().Parameters.ReservationsRequireContactPhone }"></label>
                                            <input id="1stContactPhone1" class="form-control" type="text" data-bind="value: reservationDetails.FirstPhoneOne, attr: {'required': (templateRules().Parameters.ReservationsRequireContactPhone == true) ? 'required' : null }" maxlength="50" />
                                        </div>
                                        <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                            <label data-bind="text: reservationDetails.FirstPhoneTwoLabelComputed"></label>
                                            <input class="form-control" type="text" data-bind="value: reservationDetails.FirstPhoneTwo" maxlength="50" />
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                            <label for="1stContactEmail" data-bind="css: { required: templateRules().Parameters.ReservationsRequireContactEmail }"><%= string.Format("{0} {1}", EmsParameters.FirstContactTitle, ScreenText.EmailAddress) %></label>
                                            <input id="1stContactEmail" class="form-control" type="text" data-bind="value: reservationDetails.FirstEmail, attr: {'required': (templateRules().Parameters.ReservationsRequireContactEmail == true) ? 'required' : null}" maxlength="75" />
                                        </div>
                                    </div>
                                </div>

                                <div class="row" data-bind="visible: templateRules().Parameters.ReservationsShowAltContact && AltContacts().length > 0">
                                    <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                        <label for="2ndcontact"><%= EmsParameters.AlternateContactTitle %></label>
                                        <select class="form-control" id="2ndcontact" name="2ndcontact"
                                            data-bind="options: AltContacts, optionsText: function(item) { return vems.decodeHtml(item.Name); }, optionsValue: 'Id', value: reservationDetails.SecondContactId">
                                        </select>
                                    </div>
                                </div>
                                <div data-bind="visible: (templateRules().Parameters.ReservationsShowAltContact && reservationDetails.SecondContactId && $.isNumeric(reservationDetails.SecondContactId()))">
                                    <%--Temp contanct is 0 for the id --%>
                                    <div class="row" data-bind="visible: reservationDetails.SecondContactId()==0">
                                        <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                            <label for="2ndContactName"><%= string.Format(ScreenText.ContactName, EmsParameters.AlternateContactTitle ) %></label>
                                            <input class="form-control" type="text" maxlength="50" id="2ndContactName"
                                                data-bind="value: reservationDetails.SecondContactName, attr: {'disabled': reservationDetails.SecondContactId() == -1},
    click: function(){ if (reservationDetails.SecondContactId() == 0){ reservationDetails.SecondContactName('');} }" />
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                            <label data-bind="text: reservationDetails.SecondPhoneOneLabelComputed"></label>
                                            <input class="form-control" type="text" data-bind="value: reservationDetails.SecondPhoneOne, attr: {'disabled': reservationDetails.SecondContactId() == -1}" maxlength="50" />
                                        </div>
                                        <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                            <label data-bind="text: reservationDetails.SecondPhoneTwoLabelComputed"></label>
                                            <input class="form-control" type="text" data-bind="value: reservationDetails.SecondPhoneTwo, attr: {'disabled': reservationDetails.SecondContactId() == -1}" maxlength="50" />
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                            <label><%= string.Format("{0} {1}", EmsParameters.AlternateContactTitle, ScreenText.EmailAddress) %></label>
                                            <input class="form-control" type="text" data-bind="value: reservationDetails.SecondEmail, attr: {'disabled': reservationDetails.SecondContactId() == -1}" maxlength="75" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div class="panel panel-default hidden-xs" id="attachments-panel" data-bind="visible: templateRules().Parameters.AllowAttachments">
                            <div class="panel-heading">
                                <span><%= ScreenText.Attachments %></span>
                            </div>
                            <div class="panel-body" style="position: relative;">
                                <div id="res-attach-loading" class="events-loading-overlay">
	                                <img class="loading-animation" src="Images/Loading.gif"/>
                                </div>
                                <div data-bind="foreach: reservationDetails.attachments ">
                                    <div class="row" style="margin: 0;">
                                        <div class="col-xs-12 col-md-6">
                                            <div class="attachment-row" style="width: 100%;">
                                                <span class="filename ellipsis-text" data-bind="text: name"></span>
                                                <a class="attachment-delete" href="#" data-bind="click: function(){ $root.removeFile($data);}"><i class="fa fa-trash-o fa-3"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="fileUploader"></div>
                            </div>
                        </div>
                        <div class="panel panel-default" id="udf-panel" data-bind="visible: (reservationDetails.userDefinedFields.Udfs && reservationDetails.userDefinedFields.Udfs().length > 0) || <%= ShowComment.ToString().ToLowerInvariant() %>">
                            <div class="panel-heading">
                                <span><%= ScreenText.AdditionalInformation %></span>
                                <Dea:HelpButton runat="server" ID="VEMSResDetailsTicklerHelp" CssClass="floatRight" LookupKey="VEMSResDetailsTicklerHelp" ParentType="WebTemplate" />
                            </div>
                            <div class="panel-body">
                                <div class="row" data-bind="visible: <%= ShowComment.ToString().ToLowerInvariant() %>">
                                    <div class="form-group col-md-4 col-sm-8 col-xs-12">
                                        <label for="comment"><%= CommentLabel %></label>
                                        <textarea class="form-control" rows="3" id="comment" data-bind="value: reservationDetails.comment"></textarea>
                                    </div>
                                </div>
                                <div class="row" data-bind="visible: reservationDetails.userDefinedFields.Udfs && reservationDetails.userDefinedFields.Udfs().length > 0">
                                    <div class="col-md-4 col-sm-8 col-sx-12">
                                        <div id="udf-container" data-bind='component: {name: "udf-display-component", params: reservationDetails.userDefinedFields.Udfs }'></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="reservation-details-billing">
                            <div class="panel panel-default" data-bind="visible: (ShowBillingReferences() || templateRules().Parameters.ReservationsShowPONumber)">
                                <div class="panel-heading">
                                    <span><%= ScreenText.BillingInfo %></span>
                                    <Dea:HelpButton runat="server" ID="VemsResDetailsPayHelp" CssClass="floatRight" LookupKey="VemsResDetailsPayHelp" ParentType="WebTemplate" />
                                </div>
                                <div class="panel-body">
                                    <div class="row">
                                        <div class="col-md-4 col-xs-12" data-bind="visible: ShowBillingReferences()">
                                            <div>
                                                <label data-bind="css: { required: templateRules().Parameters.ReservationsBillingReferenceValidation >= 1 }"><%= string.Format(ScreenText.BillingReference, EmsParameters.BillingReferenceTitleSingular) %></label>
                                                <div class="input-wrapper-for-icon">
                                                    <input class="form-control billingReference-input" type="text"
                                                        data-bind="textInput: reservationDetails.billingReference, attr: {'required': (templateRules().Parameters.ReservationsBillingReferenceValidation >= 1) ? 'required' : null }" maxlength="100" />
                                                    <i class="fa fa-search input-icon-embed"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4 col-xs-12" data-bind="visible: ShowPONumber()">
                                            <div>
                                                <label data-bind="css: { required: templateRules().Parameters.ReservationsPOValidation >= 1 }"><%= string.Format(ScreenText.PONumber, EmsParameters.PONumberTitle) %></label>
                                                <div class="input-wrapper-for-icon">
                                                    <input class="form-control PONumber-input" type="text"
                                                        data-bind="textInput: reservationDetails.poNumber, attr: {'required': (templateRules().Parameters.ReservationsPOValidation >= 1) ? 'required' : null }" maxlength="100" />
                                                    <i class="fa fa-search input-icon-embed"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-xs-12">
                                <div data-bind="if: $root.templateRules().TermsAndConditions && $root.templateRules().TermsAndConditions.length > 0">
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" id="terms-and-conditions" required="required">
                                            <span><%= ScreenText.IHaveReadAndAgreeToThe %> <a href="#" data-toggle="modal" data-target="#tc-modal"><%= ScreenText.TermsAndConditions %></a></span>
                                        </label>
                                    </div>
                                    <!-- terms and conditions modal -->
                                    <div class="modal fade" id="tc-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content" id="tc-modal-content">
                                                <div class="modal-header">
                                                    <button type="button" data-dismiss="modal" class="close" aria-label="Close" id="tc-modal-close-icon"><span aria-hidden="true">&times;</span></button>
                                                    <h3 class="modal-title" id="tc-modal-title"><%= ScreenText.TermsAndConditions%></h3>
                                                </div>
                                                <div class="modal-body" data-bind="html: vems.decodeHtml($root.templateRules().TermsAndConditions)">
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="tc-modal-ok"><%= ScreenText.Close %></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <span data-bind="visible: DevExpress.devices.real().phone">
                                <button type="button" class="btn btn-default" data-bind="click: function(){   $('#main-tabs li[data-type=bookings] a').click(); }"><%= ScreenText.GoBack %></button>
                            </span>
                            <span class="float-right">
                                <button type="button" class="btn btn-success" data-bind="click: function(){ return saveReservation(); }"><%= ScreenText.CreateReservation %></button>
                            </span>
                        </div>
                    </div>
                </div>
                <div role="tabpanel" class="tab-pane" id="cart">
                    <div class="row main-header-row" id="cart-header-row">
                        <div class="col-md-10">
                            <div id="cart-header-text" class="main-header-text">
                                <%= ScreenText.MyCart %>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-primary next-step-btn" id="new-booking-btn" data-bind="visible: !templateRules().AllowInvitations && !templateRules().VideoConference, click: newBooking"><%= ScreenText.NewBooking %></button>
                        </div>
                    </div>
                    <div class="row">
                        <div class="table-responsive" data-bind="visible: bookingCount() > 0">
                            <table id="bookingCart" class="table table-striped">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th><%= ScreenText.Date %></th>
                                        <th><%= ScreenText.StartTime %></th>
                                        <th><%= ScreenText.EndTime %></th>
                                        <th><%= ScreenText.TimeZone %></th>
                                        <th><%= ScreenText.Location %></th>
                                        <th data-bind="visible: $root.templateRules().VideoConference"><%= ScreenText.Host %></th>
                                        <th data-bind="if: $root.setupTypeValidation() > 0"><%= ScreenText.Attendance %></th>
                                        <th data-bind="if: $root.setupTypeValidation() == 2 || $root.setupTypeValidation() == 3"><%= ScreenText.SetupType %></th>
                                        <th><%= ScreenText.Status %></th>
                                        <th><%= ScreenText.Conflict %></th>
                                        <th data-bind="visible: $root.templateRules().Parameters.ShowRoomPricing"><%= ScreenText.Price %></th>
                                    </tr>
                                </thead>
                                <tbody data-bind="foreach: cart.bookings">
                                    <tr>
                                        <!-- ko if: typeof(occurrences) != 'undefined' -->
                                        <td></td>
                                        <td><a href="#" class="fa fa-minus-circle" data-bind="click: $parent.cart.remove"></a></td>
                                        <td colspan="3">
                                            <div data-bind="text: recurrenceDescription"></div>
                                            <div>
                                                <a href="#" data-bind="click: $root.cart.viewOccurrencesClicked"><%= ScreenText.ViewOccurrences %></a>
                                                <a href="#" data-bind="text: $root.cart.variantsText($data), click: $root.cart.ViewVariantsClicked"></a>
                                            </div>
                                        </td>
                                        <!-- /ko -->
                                        <!-- ko if: typeof(occurrences) === 'undefined' -->
                                        <td>
                                            <!-- ko if: !$root.templateRules().AllowInvitations && !$root.templateRules().VideoConference -->
                                            <a href="#" class="fa fa-pencil" data-bind="click: $parent.cart.editFromCart"></a>
                                            <!-- /ko -->
                                        </td>
                                        <td>
                                            <!-- ko if: !$parent.templateRules().VideoConference || !IsHost() || ($parent.templateRules().VideoConference && IsHost() && $parent.cart.bookings().length === 1) -->
                                            <a href="#" class="fa fa-minus-circle" data-bind="click: $parent.cart.remove"></a>
                                            <!-- /ko -->
                                        </td>
                                        <td>
                                            <span data-bind="text: $data.LocalEventDate ? moment($data.LocalEventDate()).format('ddd L') : moment($data.LocalDate()).format('ddd L')"></span>
                                            <span data-bind="if: Holidays().length > 0">
                                                <a href="#" data-toggle="popover" title="<%= ScreenText.SpecialDate %>" class="fa fa-info-circle" data-bind="attr: { 'data-content': vems.decodeHtml(Holidays()) }"></a>
                                            </span>
                                        </td>
                                        <td data-bind="text: $data.LocalEventStart ? moment($data.LocalEventStart()).format('LT') : moment($data.Start()).format('LT')"></td>
                                        <td data-bind="text: $data.LocalEventEnd ? moment($data.LocalEventEnd()).format('LT') : moment($data.End()).format('LT')"></td>
                                        <!-- /ko -->
                                        <td data-bind="text: $data.LocalTimeZone ? $data.LocalTimeZone() : $data.Timezone()"></td>
                                        <td>
                                            <a data-bind="text: $root.cart.buildLocationString($data), click: function(data){ vems.locationDetailsVM.show(data.BuildingId(), data.RoomId()); }" href="#"></a>
                                            <!-- ko if: typeof(RoomType) != 'undefined' && RoomType() == 3 -->
                                            <input class="form-control od-location-cart" data-bind="textInput: TempRoomDescription" required="required" />
                                            <!-- /ko -->
                                        </td>
                                        <td data-bind="visible: $root.templateRules().VideoConference">
                                            <div class="checkbox">
                                                <label>
                                                    <input type="checkbox" class="cart-host-check" data-bind="checked: IsHost, click: $root.cart.hostChanged">
                                                </label>
                                            </div>
                                        </td>
                                        <td class="setup-count" data-bind="if: $root.setupTypeValidation() > 0">
                                            <input class="form-control attendance-edit cart-attendance" type="number" value="1" style="width: 80px" data-bind="textInput: Attendance, event: { change: function(d, e) { $root.cart.setupCountChangedFromCart(e.currentTarget, true); } }, attr: { min: Min, max: Max, required: $root.setupTypeValidation() == 2  }" />
                                        </td>
                                        <td class="setup-type" data-bind="if: $root.setupTypeValidation() == 2 || $root.setupTypeValidation() == 3">
                                            <select class="form-control setupType-edit cart-setup" data-bind="event: { change: $root.cart.setupTypeChangedFromCart }, options: $root.filteredRoomSetupTypes($data), optionsText: function(st) { return vems.decodeHtml(st.Description); }, optionsValue: 'Id', value: DefaultSetupTypeId, attr: { required: $root.setupTypeValidation() == 2 }"></select>
                                        </td>
                                        <td data-bind="text: StatusName, value: StatusName"></td>
                                        <td data-bind="text: Conflict"></td>
                                        <td data-bind="text: Price, visible:$root.templateRules().Parameters.ShowRoomPricing"></td>
                                    </tr>
                                    <!-- ko if: typeof(occurrences) != 'undefined' -->
                                    <tr class="occurrences" style="display: none;">
                                        <td colspan="99">
                                            <table class="table">
                                                <thead>
                                                    <tr>
                                                        <th></th>
                                                        <th></th>
                                                        <th><%= ScreenText.Date %></th>
                                                        <th><%= ScreenText.StartTime %></th>
                                                        <th><%= ScreenText.EndTime %></th>
                                                        <th><%= ScreenText.TimeZone %></th>
                                                        <th><%= ScreenText.Location %></th>
                                                        <th data-bind="if: $root.setupTypeValidation() > 0"><%= ScreenText.Attendance %></th>
                                                        <th data-bind="if: $root.setupTypeValidation() == 2 || $root.setupTypeValidation() == 3"><%= ScreenText.SetupType %></th>
                                                        <th><%= ScreenText.Status %></th>
                                                        <th><%= ScreenText.Conflict %></th>
                                                        <th data-bind="visible: $root.templateRules().Parameters.ShowRoomPricing"><%= ScreenText.Price %></th>
                                                    </tr>
                                                </thead>
                                                <tbody data-bind="foreach: occurrences">
                                                    <tr data-bind="css: { variant: isVariant }">
                                                        <td><a href="#" class="fa fa-pencil" data-bind="visible: !$root.templateRules().AllowInvitations, click: $root.cart.editFromCart"></a></td>
                                                        <td><a href="#" class="fa fa-minus-circle" data-bind="visible: !$root.templateRules().AllowInvitations, click: $root.cart.remove"></a></td>
                                                        <td>
                                                            <span data-bind="text: moment(Date()).format('ddd L')"></span>
                                                            <span data-bind="if: Holidays().length > 0">
                                                                <a href="#" data-toggle="popover" title="<%= ScreenText.SpecialDate %>" class="fa fa-info-circle" data-bind="attr: { 'data-content': vems.decodeHtml(Holidays()) }"></a>
                                                            </span>
                                                        </td>
                                                        <td data-bind="text: moment(Start()).format('LT')"></td>
                                                        <td data-bind="text: moment(End()).format('LT')"></td>
                                                        <td data-bind="text: Timezone"></td>
                                                        <td data-bind="css: { variant: isVariant }"><a data-bind="    text: vems.decodeHtml(RoomDescription()), click: function(data){ vems.locationDetailsVM.show(data.BuildingId(), data.RoomId()); }" href="#"></a></td>
                                                        <td class="setup-count" data-bind="if: $root.setupTypeValidation() > 0">
                                                            <input class="form-control attendance-edit" type="number" value="1" style="width: 80px" data-bind="textInput: Attendance, event: { change: function(d, e) { $root.cart.setupCountChangedFromCart(e.currentTarget); } }, attr: { min: Min, max: Max, required: $root.setupTypeValidation() == 2  }" />
                                                        </td>
                                                        <td class="setup-type" data-bind="if: $root.setupTypeValidation() == 2 || $root.setupTypeValidation() == 3">
                                                            <select class="form-control setupType-edit" data-bind="event: { change: $root.cart.setupTypeChangedFromCart }, options: $root.filteredRoomSetupTypes($data), optionsText: function(st) { return vems.decodeHtml(st.Description); }, optionsValue: 'Id', value: DefaultSetupTypeId, attr: { required: $root.setupTypeValidation() == 2 }"></select>
                                                        </td>
                                                        <td data-bind="text: StatusName, value: StatusName"></td>
                                                        <td data-bind="text: Conflict"></td>
                                                        <td data-bind="text: Price, visible:$root.templateRules().Parameters.ShowRoomPricing"></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    <!-- /ko -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="reservation-created-dialog" style="display: none;">
            <div class="row">
                <h1><%= ScreenText.ReservationCreated %></h1>
            </div>
            <div id="conflict-warning-row" class="row" style="margin: 10px; display: none;">
                <span class="text-danger" style="font-size: 1.2em; white-space: pre;"><%= Messages.ReservationCreatedWithConflictMessage %></span>
            </div>
            <div class="row">
                <div><%= Messages.ReservationCreatedOnRoomRequest %></div>
                <div id="email-sent-to-container"></div>
            </div>
            <div id="resource-warning-row" class="row" style="margin-top: 15px; display: none;">
                <span class="text-danger" style="font-size: 1.3em;"><%= Messages.ServiceReset %></span>
            </div>
            <div class="row" style="margin-top: 15px;">
                <div id="reservation-created-header" style="margin-bottom: 10px;"><%= Messages.WhatWouldYouLikeToDoNow %></div>
                <div id="add-to-calendar-ics-row" style="margin-bottom: 10px; display: none;">
                    <a href="#"><i class="fa fa-chevron-right" style="padding-right: 10px;"></i><%= ScreenText.AddToMyCalendar %></a>
                </div>
                <div id="edit-reservation-row">
                    <a id="edit-this-reservation-action"><i class="fa fa-chevron-right" style="padding-right: 10px;"></i><%= ScreenText.EditThisReservation %></a>
                </div>
            </div>
        </div>
        <!-- recurrence modal -->
        <div class="modal fade" id="recurrence-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content" id="recurrence-modal-content" data-bind="component: { name: 'recurrence-modal-component', params: $root }"></div>
            </div>
        </div>

        <div id="floorplan-component-modal" data-bind='component: { name: "floorplans-reserve-modal", params: { RoomInfo: new FloorMapRoomInfo(), 
        addRoomClicked: floormapRoomAdded,    
        bookings: $root.cart.bookings,
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

        <div data-bind='component: { name: "add-a-group-modal", params: { 
         Groups: $root.Groups,
         templateId: $root.templateId,
         onCloseCallback: $root.onCloseAddGroup,
         helpTextElementId: "<%= VEMSManageUserGroupsHelp.ClientID %>",
         ScreenText: { AddGroupsHeaderText: "<%= escapeQuotes(string.Format(ScreenText.GroupsYouCanBookFor, EmsParameters.GroupTitlePlural)) %>",
        GroupSearchPlaceHolder: "<%= escapeQuotes(string.Format(ScreenText.GroupNameContains, EmsParameters.GroupTitleSingular)) %>",
        GroupNameText: "<%= escapeQuotes(string.Format(EmsParameters.GroupTitleSingular)) %>",
        GroupTypeText: "<%= escapeQuotes(string.Format(ScreenText.GroupType, EmsParameters.GroupTitleSingular)) %>",
        RemoveText: "<%= escapeQuotes(ScreenText.ClickToRemove) %>",
        CityText: "<%= escapeQuotes(ScreenText.City) %>",
        NoMatchingGroupsText: "<%= escapeQuotes(string.Format(ScreenText.NoMatchingGroups, EmsParameters.GroupTitlePlural)) %>"
}
}}'>
        </div>

        <div data-bind='component: { name: "add-contacts-modal", params: { 
        Contacts: $root.reservationDetails.AddedContacts,
        templateId: $root.templateId,
        CanSetDefaultContact: templateRules().CanSetDefaultContact,
        onCloseCallback: onCloseContactsModal,
        helpTextElementId: "<%= VEMSFindContacts.ClientID %>",
        ScreenText: { AddContactsHeaderText: "<%= escapeQuotes(string.Format(ScreenText.CurrentContacts, EmsParameters.FirstContactTitle)) %>",
        GroupSearchPlaceHolder: "<%= escapeQuotes(string.Format(ScreenText.GroupNameContains, EmsParameters.FirstContactTitle)) %>",
        NameText: "<%= escapeQuotes(string.Format(ScreenText.Name, EmsParameters.FirstContactTitle)) %>",
        PhoneField1Text: "<%= escapeQuotes(ScreenText.PhoneField1) %>",
        MakeDefaultText: "<%= escapeQuotes(ScreenText.MakeDefault) %>",
        ActiveText: "<%= escapeQuotes(ScreenText.Active) %>",
        AltPhoneText: "<%= escapeQuotes(ScreenText.AltPhone) %>",
        EmailText: "<%= escapeQuotes(ScreenText.Email) %>",
        IsDefaultText: "<%= escapeQuotes(ScreenText.IsDefault) %>",
        NoMatchingGroupsText: "<%= escapeQuotes(string.Format(ScreenText.NoMatchingGroups, EmsParameters.FirstContactTitle)) %>"  } } }'>
        </div>

        <div id="booking-details-container" data-bind='component: { name: "booking-details-component", params: { ScreenText: {
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

        <!-- setup add modal -->
        <div id="setup-add-modal" class="modal" role="dialog" aria-labelledby="setup-modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="setup-add-modal-close-icon" data-bind="click: $root.cart.cancelAddToCartFromSetup"><span aria-hidden="true">&times;</span></button>
                        <h3 class="modal-title" id="setup--add-modal-title" data-bind="text: vems.roomRequest.setupAddModalTitle"></h3>
                    </div>
                    <div class="modal-body">
                        <div data-bind="text: vems.roomRequest.setupAddModalMessage"></div>
                        <div>
                            <div class="form-group" id="VChost" data-bind="visible: templateRules().VideoConference">
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" id="add-host-check">
                                        <%= string.Format(ScreenText.ThisRoomIsTheHost, EmsParameters.RoomTitleSingular) %>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group" data-bind="visible: $root.setupTypeValidation() > 0">
                                <label for="setup-add-count" data-bind="css: { required:  $root.setupTypeValidation() == 2 }"><%= ScreenText.NumberOfAttendees %></label>
                                <input id="setup-add-count" class="form-control attendance-edit numeric" type="number" value="1" style="width: 80px" data-bind="event: { change: function(d, e) { $root.cart.setupCountChangedFromAddModal(e.currentTarget); } }, attr: { min: 0, max: 1, required: $root.setupTypeValidation() == 2  }" />
                            </div>
                            <div class="form-group" data-bind="visible: $root.setupTypeValidation() > 1">
                                <label for="setup-add-type" data-bind="css: { required:  $root.setupTypeValidation() == 2 }"><%= ScreenText.SetupType %></label>
                                <select id="setup-add-type" class="form-control setupType-edit" data-bind="event: { change: $root.cart.setupTypeChangedFromAddModal }, options: $root.roomSetupTypes, optionsText: function(st) { return vems.decodeHtml(st.Description); }, optionsValue: 'Id', attr: { required: $root.setupTypeValidation() == 2 }"></select>
                            </div>
                            <div class="form-group" id="od-location-container" style="display: none;">
                                <label for="od-location-add" class="required"></label>
                                <input id="od-location-add" class="form-control" maxlength="50" required="required" />
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bind="click: $root.cart.addToCartFromSetup" id="setup--add-modal-save"><%= string.Format(ScreenText.AddRoom, EmsParameters.RoomTitleSingular) %></button>
                        <button type="button" class="btn btn-default" data-bind="click: $root.cart.cancelAddToCartFromSetup" data-dismiss="modal" id="setup-add-modal-cancel"><%= ScreenText.Cancel %></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="responsive-search-list" style="display: none;">
        <div class="row">
            <span style="margin-left: 15px; font-size: 1.4em;">
                <a href="#" id="responsive-search-back"><%= ScreenText.Back %></a>
            </span>
            <span style="margin-left: 15px; font-size: 1.4em;">
                <%= string.Format(ScreenText.RoomSearchResults, EmsParameters.RoomTitleSingular) %>
            </span>
        </div>
        <div class="row no-results" style="text-align: center;">
            <span style="display: inline-block; font-size: 1.3em; margin-top: 15px;"><%= Messages.NoSpaceAvailable %></span>
        </div>
        <div class="row" id="responsive-search-result">
            <div class="row responsive-search-item responsive-rooms-recordtypeheader" data-bind="visible: responsiveReservableSearchResults() && responsiveReservableSearchResults().length > 0">
                <span><%= string.Format(ScreenText.RoomsYouCanReserve, EmsParameters.RoomTitlePlural) %></span>
            </div>
            <div data-bind="foreach: responsiveReservableSearchResults">
                <div class="row responsive-search-item">
                    <div class="col-xs-8 responsive-room-info" data-bind="click: $root.addToCart">
                        <div>
                            <span data-bind="text: vems.encodeHtml(RoomDescription)" class="responsive-room"></span>
                        </div>
                        <div>
                            <span data-bind="text:  vems.encodeHtml(BuildingDescription)" class="responsive-building"></span>
                        </div>
                    </div>
                    <div class="col-xs-2 responsive-capacity">
                        <div>
                            <i class="fa fa-users"></i>
                            <span data-bind="text: Capacity"></span>
                        </div>
                    </div>
                    <div class="col-xs-2 responsive-info">
                        <div>
                            <a href="#" data-bind="click: $root.showRoomInfo"><i class="fa fa-info-circle"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row responsive-search-item responsive-rooms-recordtypeheader" data-bind="visible: responsiveRequestableSearchResults() && responsiveRequestableSearchResults().length > 0">
                <span><%= string.Format(ScreenText.RoomsYouCanRequest, EmsParameters.RoomTitlePlural) %></span>
            </div>
            <div data-bind="foreach: responsiveRequestableSearchResults">
                <div class="row responsive-search-item">
                    <div class="col-xs-8 responsive-room-info" data-bind="click: $root.addToCart">
                        <div>
                            <span data-bind="text: vems.encodeHtml(RoomDescription)" class="responsive-room"></span>
                        </div>
                        <div>
                            <span data-bind="text:  vems.encodeHtml(BuildingDescription)" class="responsive-building"></span>
                        </div>
                    </div>
                    <div class="col-xs-2 responsive-capacity">
                        <div>
                            <i class="fa fa-users"></i>
                            <span data-bind="text: Capacity"></span>
                        </div>
                    </div>
                    <div class="col-xs-2 responsive-info">
                        <div>
                            <a href="#" data-bind="click: $root.showRoomInfo"><i class="fa fa-info-circle"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- about template modal -->
    <div class="modal fade" id="template-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content" id="template-modal-content" data-bind="component: { name: 'web-template-modal-component', params: $root }"></div>
        </div>
    </div>

    <script type="text/html" id="my-reservation-templates-template">
        <!-- ko if: (DevExpress.devices.real().phone && IsMobile) || (!DevExpress.devices.real().phone && IsWebApp) -->
        <div class="row" data-bind="attr: {'data-mobile': IsMobile, 'data-webapp': IsWebApp }">
            <div class="col-xs-12 col-sm-6 ellipsis-text">
                <span data-bind="text: vems.decodeHtml(Text)"></span>
            </div>
            <div class="col-xs-12 col-sm-6 table-buttons">
                <button type="button" class="btn btn-primary btn-xs" data-bind="event: { mousedown: $root.templateClick }"><%= ScreenText.BookNow %></button>
                <button type="button" class="btn btn-primary btn-xs hidden-xs" data-bind="attr: { 'data-navigateurl': NavigateUrl, 'data-templateid': Id }" data-toggle="modal" data-target="#template-modal"><%= ScreenText.About %></button>
            </div>
        </div>
        <!-- /ko -->
    </script>

    <!-- Mobile Edit Reservation Modal -->
    <div class="modal fade" id="edit-reservation-details-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content" id="edit-reservation-details-modal-content">
                <div class="modal-header">
                    <button type="button" data-dismiss="modal" class="close" aria-label="Close" id="edit-reservation-details-modal-close-icon"><span aria-hidden="true">&times;</span></button>
                    <h3 class="modal-title" id="edit-reservation-details-modal-title"><%= ScreenText.BookingUpdated%></h3>
                </div>
                <div class="modal-body">
                    <%= Messages.BookingDetailsUpdateFromMobile %>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal" id="edit-reservation-details-modal-edit"><%= ScreenText.YesEditReservation %></button>
                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="edit-reservation-details-modal-home"><%= ScreenText.NoGoHome %></button>
                </div>
            </div>
        </div>
    </div>
    <div style="display: none">
        <Dea:HelpButton runat="server" ID="VEMSManageUserGroupsHelp" LookupKey="VEMSManageUserGroupsHelp" ParentType="WebTemplate" />
        <Dea:HelpButton runat="server" ID="VEMSFindContacts" LookupKey="VEMSFindContacts" ParentType="WebTemplate" />
        <Dea:HelpButton runat="server" ID="VEMSReservationSummaryHelp" LookupKey="VEMSReservationSummaryHelp" ParentType="WebTemplate" />
        <Dea:HelpButton runat="server" ID="VEMSReservationRecurrenceHelp" LookupKey="VEMSReservationRecurrenceHelp" ParentType="WebTemplate" />
    </div>
    <!-- location details modal -->
    <div id="location-details-comp" data-bind='component: { name: "location-details-component", params: { } }'></div>

    <%-- mobile location filter modal --%>
    <div class="modal fade" id="mobile-locations-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content" id="mobile-locations-modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title"><%= ScreenText.Locations %></h4>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="input-group">
                            <input type="text" class="form-control filter-modal-typeahead" id="mobile-locations-search-input" placeholder="<%= string.Format(ScreenText.FindByX, ScreenText.Locations.ToLowerInvariant()) %>" />
                            <i class="fa fa-search"></i>
                        </div>
                    </div>
                    <div class="row">
                        <div class="checkbox-group"></div>
                    </div>
                    <div class="row ">
                        <div class="col-xs-12 selected-group-label"><%= string.Format(ScreenText.SelectedRooms, ScreenText.Locations) %></div>
                        <div class="selected-group"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="mobile-locations-update-btn"><%= ScreenText.Update + " " + ScreenText.Locations %></button>
                    <button type="button" class="btn btn-default" id="mobile-locations-close-btn" data-dismiss="modal"><%= ScreenText.Close %></button>
                </div>
            </div>
        </div>
    </div>

    <a href="#" id="return-to-top"><i class="fa fa-chevron-up"></i></a>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/typeahead") %>
    <%= Scripts.Render("~/bundles/room-request") %>
    <%= Scripts.Render("~/bundles/user-defined-fields") %>
    <%= Scripts.Render("~/bundles/booking-details") %>
    <%= Scripts.Render("~/bundles/location-details-component") %>
    <%= Styles.Render("~/Content/leaflet") %>
    <%= Scripts.Render("~/bundles/leaflet") %>
    <%= Scripts.Render("~/bundles/jcarousel") %>

    <script type="text/javascript">
        vems.browse.startHour = <%=  EmsParameters.BookStartTime.Hours %>;
        vems.browse.capLabel = '<%= escapeQuotes(ScreenText.Cap) %>';
        vems.browse.closedLabel = '<%= escapeQuotes(ScreenText.Closed) %>';
        vems.browse.inLabel = '<%= escapeQuotes(ScreenText.In) %>';
        vems.browse.pleaseSelectALabel = '<%= escapeQuotes(Messages.PleaseSelectA) %>';
        vems.browse.endBeforeStartLabel =  '<%= escapeQuotes(Messages.ReservationEndTimeCannotBeBeforeStartTime) %>';
        vems.browse.startCannotBeBeforeCurrntTime = '<%= escapeQuotes(Messages.ReservationStartTimeCannotBeBeforeCurrentTime) %>';
        vems.browse.RoomCapacityViolationMessage = '<%= escapeQuotes(Messages.RoomHasAMinimumCapacityOfXPersonAndAMaximumOfY) %>';
        vems.browse.reservationDetailsTabValidationMsg = '<%= escapeQuotes(Messages.AllRequiredFormFieldsMustBeFilledOutUnderTheReservationDetailsTab) %>';
        vems.browse.AvailabilityLegendLabel = '<%= escapeQuotes(ScreenText.AvailabilityLegend) %>';
        vems.browse.FirstContactTitle = '<%= escapeQuotes(EmsParameters.FirstContactTitle) %>';
        vems.browse.AlternateContactTitle = '<%= escapeQuotes(EmsParameters.AlternateContactTitle) %>';
        vems.browse.eventNameMaxLength = <%= EmsParameters.EventNameMaxLength %>;
        vems.browse.genericErrorMessage = '<%= escapeQuotes(Errors.GenericError) %>';

        vems.browse.ViewOnMapText = '<%= escapeQuotes(ScreenText.ViewOnMap) %>';
        vems.browse.freeLabel = '<%= escapeQuotes(ScreenText.Free) %>';
        vems.browse.someoneElsesBookingLabel = '<%= escapeQuotes(ScreenText.SomeoneElsesBooking) %>';
        vems.browse.myNewBookingLabel = '<%= escapeQuotes(ScreenText.MyNewBooking) %>';
        vems.browse.myExistingBookingLabel = '<%= escapeQuotes(ScreenText.MyExistingBooking) %>';
        vems.browse.closureLabel = '<%= escapeQuotes(ScreenText.Closure) %>';
        vems.browse.BusyLabel = '<%= escapeQuotes(ScreenText.Busy) %>';
        vems.browse.OutOfOfficeLabel = '<%= escapeQuotes(ScreenText.OutOfOffice) %>';
        vems.browse.TentativeLabel = '<%= escapeQuotes(ScreenText.Tentative) %>';
        vems.browse.WorkingElsewhereLabel = '<%= escapeQuotes(ScreenText.WorkingElsewhere) %>';
        vems.browse.NoInfoLabel = '<%= escapeQuotes(ScreenText.NoStatusInformation) %>';

        vems.browse.addRemoveLabel = "<%= ScreenText.AddRemove %>";

        vems.browse.bookingAddedMessage = '<%= escapeQuotes(ScreenText.BookingAdded) %>';
        vems.browse.bookingUpdatedMessage = '<%= escapeQuotes(ScreenText.BookingUpdated) %>';
        vems.browse.bookingNoChangeMessage = '<%= escapeQuotes(Messages.EditBookingNoChange) %>';
        vems.browse.locationPickNotAvailableMessage = '<%= escapeQuotes(Messages.RecurrenceLocationsUnavailableMessage) %>';

        vems.browse.AddGroupsHeaderText = "<%= ScreenText.GroupsYouCanBookFor %>";
        vems.browse.GroupSearchPlaceHolder= "<%= ScreenText.GroupNameContains %>";
        vems.browse.GroupNameText= "<%= ScreenText.GroupName %>";
        vems.browse.GroupTypeText= "<%= ScreenText.GroupType %>";
        vems.browse.RemoveText= "<%= ScreenText.ClickToRemove %>";
        vems.browse.CityText= "<%= ScreenText.City %>";
        vems.browse.NoMatchingGroupsText= "<%= ScreenText.NoMatchingGroups %>";
        vems.browse.NoneText = "<%= ScreenText.None %>";
        vems.browse.DropDownAllText = "<%= ScreenText.DropDownAll %>";

       vems.roomRequest.AttendanceGreaterThanZeroMessage = '<%= escapeQuotes(Messages.AttendanceGreaterThanZero) %>';

        // recurrence required validation messages
        vems.roomRequest.enterValidEveryDays = '<%= escapeQuotes(Messages.EnterValidEveryDays) %>';
        vems.roomRequest.enterValidEveryWeeks = '<%= escapeQuotes(Messages.EnterValidEveryWeeks) %>';
        vems.roomRequest.enterValidEveryMonths = '<%= escapeQuotes(Messages.EnterValidEveryMonths) %>';
        vems.roomRequest.enterValidEveryDayEveryMonths = '<%= escapeQuotes(Messages.EnterValidEveryMonths) %>';
        vems.roomRequest.enterValidDate = '<%= escapeQuotes(string.Format(Messages.EnterValid, ScreenText.Date)) %>';
        vems.roomRequest.enterValidTime = '<%= escapeQuotes(string.Format(Messages.EnterValid, ScreenText.Time)) %>';
        vems.roomRequest.enterValidStartDate = '<%= escapeQuotes(string.Format(Messages.EnterValid, "<b>" + ScreenText.StartDate + "</b>")) %>';
        vems.roomRequest.enterValidEndDate = '<%= escapeQuotes(string.Format(Messages.EnterValid, "<b>" + ScreenText.EndDate + "</b>")) %>';
        vems.roomRequest.enterValidAfterOccurrences = '<%= escapeQuotes(Messages.EnterValidAfterOccurrences) %>';
        vems.roomRequest.enterValidStartTime = '<%= escapeQuotes(string.Format(Messages.EnterValid, "<b>" + ScreenText.StartTime + "</b>")) %>';
        vems.roomRequest.enterValidEndTime = '<%= escapeQuotes(string.Format(Messages.EnterValid, "<b>" + ScreenText.EndTime + "</b>")) %>';
        vems.roomRequest.selectOneDay = '<%= escapeQuotes(Messages.SelectOneDay) %>';
        vems.roomRequest.selectOneDate = '<%= escapeQuotes(Messages.SelectOneDate) %>';
        vems.roomRequest.IsRequiredMessage = '<%= escapeQuotes(Messages.IsRequiredFormat) %>';

        // recurrence template rule validation messages
        vems.roomRequest.adjustYourDateSelections = '<%= escapeQuotes(string.Format(Messages.AdjustYour, ScreenText.DateSelections)) %>';
        vems.roomRequest.templateMaxBookings = '<%= escapeQuotes(Messages.TemplateMaxBookings) %>';
        vems.roomRequest.templateMaxDate = '<%= escapeQuotes(Messages.TemplateMaxDate) %>';
        vems.roomRequest.templateMinDate = '<%= escapeQuotes(Messages.TemplateMinDate) %>';
        vems.roomRequest.someMonthsFewerDays = '<%= escapeQuotes(Messages.SomeMonthsFewerDays) %>';
        vems.roomRequest.okText = '<%= escapeQuotes(ScreenText.ActAsOkButton) %>';
        vems.roomRequest.cancelText = '<%= escapeQuotes(ScreenText.ActAsCancelButton) %>';

        vems.roomRequest.variantsLink = '<%= escapeQuotes(ScreenText.ViewVariants) %>';
        vems.roomRequest.andXOthersLabel = '<%= escapeQuotes(ScreenText.AndXOthers) %>';
        vems.roomRequest.occurrencesRemainingLabel = '<%= escapeQuotes(ScreenText.OccurrencesRemaining) %>';
        vems.roomRequest.pleaseSelectARoomMessage = '<%= escapeQuotes(string.Format("{0} {1}", Messages.PleaseSelectA, EmsParameters.RoomTitleSingular)) %>';

        vems.roomRequest.roomsYouCanReserveLabel =  '<%= escapeQuotes(string.Format(ScreenText.RoomsYouCanReserve, EmsParameters.RoomTitlePlural)) %>';
        vems.roomRequest.roomsYouCanRequestLabel = '<%= escapeQuotes(string.Format(ScreenText.RoomsYouCanRequest, EmsParameters.RoomTitlePlural)) %>';

        vems.roomRequest.DateAndTimeAreRequired = '<%= escapeQuotes(Messages.DateAndTimeAreRequired) %>';

        vems.roomRequest.serviceAvailabilityLabel = '<%= escapeQuotes(ScreenText.ServiceAvailability) %>';
        vems.roomRequest.serviceAvailability = <%= CategoryAvailabilityData %>;

        // recurrence display text
        vems.roomRequest.dailyDisplayText = '<%= escapeQuotes(ScreenText.DailyRecurrence) %>';
        vems.roomRequest.weeklyDisplayText = '<%= escapeQuotes(ScreenText.WeeklyRecurrence) %>';
        vems.roomRequest.monthlyDisplayText = '<%= escapeQuotes(ScreenText.MonthlyRecurrence) %>';
        vems.roomRequest.randomDisplayText = '<%= escapeQuotes(ScreenText.RandomRecurrence) %>';
        vems.roomRequest.andText = '<%= escapeQuotes(ScreenText.And) %>';
        vems.roomRequest.theText = '<%= escapeQuotes(ScreenText.The) %>';
        vems.roomRequest.dayText = '<%= escapeQuotes(ScreenText.DaySingular) %>';
        vems.roomRequest.daysText = '<%= escapeQuotes(ScreenText.DayPlural) %>';
        vems.roomRequest.weekText = '<%= escapeQuotes(ScreenText.WeekSingular) %>';
        vems.roomRequest.weeksText = '<%= escapeQuotes(ScreenText.WeekPlural) %>';
        vems.roomRequest.monthText = '<%= escapeQuotes(ScreenText.MonthSingular) %>';
        vems.roomRequest.monthsText = '<%= escapeQuotes(ScreenText.MonthPlural) %>';
        vems.roomRequest.occurrenceText = '<%= escapeQuotes(ScreenText.OccurrenceSingular) %>';
        vems.roomRequest.occurrencesText = '<%= escapeQuotes(ScreenText.OccurrencePlural) %>';
        vems.browse.PAMServiceError = ko.observable('<%= escapeQuotes(PAMServiceError) %>');
        vems.browse.PAMServiceErrorMessage = '<%= escapeQuotes(Messages.PamErrorAccessingService) %>';
        vems.roomRequest.NoMatchingResults = "<%=ScreenText.NoMatchingItems %>";
        vems.roomRequest.AttachmentUploadErrorText = '<%= escapeQuotes(Messages.AttachmentUploadError) %>';
        var fileUploadErrMsg = vems.roomRequest.AttachmentUploadErrorText + '  ' + '<%= escapeQuotes(Errors.FileExceedsSize) %>';
        //BR/PO screentext
        vems.roomRequest.BRPOScreenText = {
            ScreenText: {
                NoMatchingResults: "<%= escapeQuotes(ScreenText.NoMatchingItems) %>",
                PONumberText: "<%= escapeQuotes(EmsParameters.PONumberTitle) %>",
                DescriptionText: "<%= escapeQuotes(ScreenText.Description) %>",
                NotesText: "<%= escapeQuotes(ScreenText.Notes) %>",
                BillingReferenceText: "<%= escapeQuotes(EmsParameters.BillingReferenceTitleSingular) %>"
            }
        };
        vems.roomRequest.reserveLabel = '<%= escapeQuotes(ScreenText.Reserve) %>';
        vems.roomRequest.requestLabel = '<%= escapeQuotes(ScreenText.Request) %>';
        vems.roomRequest.updateBooking = '<%= escapeQuotes(ScreenText.UpdateBooking) %>';

        vems.roomRequest.pageMode = '<%= PageMode.ToString() %>';
        vems.roomRequest.reservationId = <%= ReservationID %>;
        vems.roomRequest.bookingId = <%= BookingID %>;

        vems.roomRequest.defaultAttendance = <%= DefaultAttendanceValue %>;
        vems.roomRequest.showSetupTeardown = <%= EmsParameters.BookShowSetupTearDown.ToString().ToLower() %>;

        vems.roomRequest.startConfigured = <%= DefaultStartConfigured.ToString().ToLowerInvariant() %>;
        vems.roomRequest.endConfigured = <%= DefaultEndConfigured.ToString().ToLowerInvariant() %>;

        vems.roomRequest.breadcrumb = {
            link: '<%= BreadcrumbLink %>',
            text: '<%= BreadcrumbText %>',
            updateLink: '<%= BreadcrumbBookingUpdatedLink %>'
        };

        vems.roomRequest.requiredTabMessage = '<%= escapeQuotes(Messages.OnTheXTab) %>';
        vems.roomRequest.AtLeastOneRoomIsRequired = '<%= escapeQuotes(string.Format(Messages.AtLeastOneRoomIsRequired, EmsParameters.RoomTitleSingular)) %>';
        vems.roomRequest.setupTypeNotAvailableForThisLocation = '<%= escapeQuotes(Messages.SetupTypeNotAvailableForThisLocation) %>';

        vems.roomRequest.pamOptions = <%= PamOptions.Length == 0 ? "" : PamOptions %>;
        vems.roomRequest.buildingDefaultItem = '<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.Facility] %>';
        var roomRequestModel;

        var roomRequestLabels = {
            createReservation: '<%= escapeQuotes(ScreenText.CreateReservation) %>',
            reservationDetails: '<%= escapeQuotes(ScreenText.ReservationDetails) %>'
        };

        var groups = <%= AvailableGroups %>;
        var contacts = <%= AvailableContacts %>;
        var templates = <%= WebTemplates %>;
        var templateRules = <%= TemplateRules %>;
        var attendees = <%= Attendees %>;
        var FloorMapHash = '<%=FloorMapHash%>';
        var FloorMapWebServiceUrl = '<%=FloorMapWebServiceUrl%>';

        var startDate = <%= Defaults.Keys.Contains(Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.Date) ? Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.Date] : "''" %>;
        var today = startDate.length > 0 ? moment(startDate) : moment({ year: new Date().getFullYear(), month: new Date().getMonth(), day: new Date().getDate() });
        var AllowPAMAttachments = <%=AllowPAMAttachments.ToString().ToLower()%>;

        today.hour(0).minute(0);

        var defaults = {
            date: today,
            start: moment(today).add(<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.StartTime] %>, 'minutes'),
            end: moment(today).add(<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.EndTime] %>, 'minutes'),
            eventName: Dea.htmlDecode('<%= escapeQuotes(Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.EventName]) %>'),
            showTimeAs: '<%= escapeQuotes(Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.PamShowTimeAs]) %>',
            reminder: <%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.PamReminder] %>,
            timeZoneId: <%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.Timezone] %>,
            roomId: '<%= Defaults.ContainsKey(Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.RoomId) ? escapeQuotes(Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.RoomId]) : string.Empty %>',
            eventTypeId: '<%= Defaults.ContainsKey(Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.EventType) ? escapeQuotes(Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.EventType]) : string.Empty %>'
        };
        
        $(document).ready(function () {
            roomRequestModel = new roomRequestViewModel(templates, <%= TemplateId %>, roomRequestLabels, defaults);
            roomRequestModel.reservationDetails.eventType(<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.EventType] %>);

            ko.mapping.fromJS(groups, {}, roomRequestModel.Groups);
            //roomRequestModel.Groups(groups);
            roomRequestModel.Contacts(contacts);                     
            //roomRequestModel.attendees.attendeeList(attendees); 

            if(templateRules != null){
                roomRequestModel.templateRules(templateRules);
                roomRequestModel.timeZones(templateRules.TimeZones);

                roomRequestModel.reservationDetails.userDefinedFields = new vems.userDefinedFieldViewModel( <%= UDFs %>);

                roomRequestModel.reservationDetails.SendInvitation(roomRequestModel.templateRules().Parameters.CheckMakeCalendarItemByDefault);

                if (roomRequestModel.templateRules().FirstAllowedBookingDate && roomRequestModel.templateRules().FirstAllowedBookingDate.length > 0) {
                    if (!roomRequestModel.filters.date().isAfter(moment(roomRequestModel.templateRules().FirstAllowedBookingDate))) {
                        roomRequestModel.filters.date(moment(roomRequestModel.templateRules().FirstAllowedBookingDate));
                    }
                }

                roomRequestModel.setupTypeValidation(<%= SetupTypeValidation %>);

                if(roomRequestModel.templateRules().VideoConference){
                    if(roomRequestModel.setupTypeValidation() > 1){
                        vems.roomRequest.setupAddModalTitle = '<%= escapeQuotes(ScreenText.HostAttendanceAndSetupType) %>';
                        vems.roomRequest.setupAddModalMessage = '<%= escapeQuotes(string.Format(Messages.HostAttendanceAndSetupModalMessage, EmsParameters.RoomTitleSingular)) %>';
                    } else {
                        vems.roomRequest.setupAddModalTitle = '<%= escapeQuotes(ScreenText.Host) %>';
                        vems.roomRequest.setupAddModalMessage = '<%= escapeQuotes(string.Format(Messages.HostModalMessage, EmsParameters.RoomTitleSingular)) %>';
                    }
                } else {
                    vems.roomRequest.setupAddModalTitle = '<%= escapeQuotes(ScreenText.AttendanceAndSetupType) %>';
                    vems.roomRequest.setupAddModalMessage = '<%= escapeQuotes(string.Format(Messages.AttendanceAndSetupModalMessage, EmsParameters.RoomTitleSingular)) %>';
                }

                roomRequestModel.availabilityFilterData = <%= Newtonsoft.Json.JsonConvert.SerializeObject(new Dea.Ems.Web.Sites.VirtualEms.Models.AvailabilityFilterData())%>;
                roomRequestModel.resultType(<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.ResultsAs] %>);

                // populate exchange data
                roomRequestModel.reservationDetails.exchangeStates.push({ value: 'BUSY', text: vems.decodeHtml('<%= escapeQuotes(ScreenText.Busy) %>') });
                roomRequestModel.reservationDetails.exchangeStates.push({ value: 'TENTATIVE', text: vems.decodeHtml('<%= escapeQuotes(ScreenText.Tentative) %>') });
                roomRequestModel.reservationDetails.exchangeStates.push({ value: 'FREE', text: vems.decodeHtml('<%= escapeQuotes(ScreenText.Free) %>') });

                roomRequestModel.reservationDetails.reminderTimes.push({ value: -1, text: vems.decodeHtml('<%= escapeQuotes(ScreenText.None) %>') });
                roomRequestModel.reservationDetails.reminderTimes.push({ value: 0, text: vems.decodeHtml('<%= escapeQuotes(ScreenText.ZeroMinutes) %>') });
                roomRequestModel.reservationDetails.reminderTimes.push({ value: 5, text: vems.decodeHtml('<%= escapeQuotes(ScreenText.FiveMinutes) %>') });
                roomRequestModel.reservationDetails.reminderTimes.push({ value: 10, text: vems.decodeHtml('<%= escapeQuotes(ScreenText.TenMinutes) %>') });
                roomRequestModel.reservationDetails.reminderTimes.push({ value: 15, text: vems.decodeHtml('<%= escapeQuotes(ScreenText.FifteenMinutes) %>') });
                roomRequestModel.reservationDetails.reminderTimes.push({ value: 30, text: vems.decodeHtml('<%= escapeQuotes(ScreenText.ThirtyMinutes) %>') });
                roomRequestModel.reservationDetails.reminderTimes.push({ value: 60, text: vems.decodeHtml('<%= escapeQuotes(ScreenText.OneHour) %>') });
                roomRequestModel.reservationDetails.reminderTimes.push({ value: 120, text: vems.decodeHtml('<%= escapeQuotes(ScreenText.TwoHours) %>') });

                // set available recurrence patterns
                if (parseInt(roomRequestModel.templateRules().MaxBookings) !== 1) {
                    if (!roomRequestModel.templateRules().Parameters.HideDailyRecurrence) {
                        roomRequestModel.recurrence.recurrenceTypes.push({ label: vems.decodeHtml('<%= escapeQuotes(ScreenText.Daily) %>'), value: 'daily' });
                    }
                    if (!roomRequestModel.templateRules().Parameters.HideWeeklyRecurrence) {
                        roomRequestModel.recurrence.recurrenceTypes.push({ label: vems.decodeHtml('<%= escapeQuotes(ScreenText.Weekly) %>'), value: 'weekly' });
                    }
                    if (!roomRequestModel.templateRules().Parameters.HideMonthlyRecurrence) {
                        roomRequestModel.recurrence.recurrenceTypes.push({ label: vems.decodeHtml('<%= escapeQuotes(ScreenText.Monthly) %>'), value: 'monthly' });
                    }
                    if (!roomRequestModel.templateRules().Parameters.HideRandomRecurrence && !roomRequestModel.templateRules().AllowInvitations) {
                        roomRequestModel.recurrence.recurrenceTypes.push({ label: vems.decodeHtml('<%= escapeQuotes(ScreenText.Random) %>'), value: 'random' });
                    }
                    if (roomRequestModel.recurrence.recurrenceTypes().length > 0) {
                        roomRequestModel.recurrence.recurrenceType(roomRequestModel.recurrence.recurrenceTypes()[0]);
                    }
                }
            } else {
                roomRequestModel.templateRules(<%= Newtonsoft.Json.JsonConvert.SerializeObject(new Dea.Ems.Web.Sites.VirtualEms.Models.RoomRequestProcessTemplateModel()) %>);
            }

            ko.mapping.fromJS(attendees, {}, roomRequestModel.attendees.attendeeList);

            initializePlugins();
            
            ko.applyBindings(roomRequestModel, $('#room-request-content')[0]);
            roomRequestModel.filters.timeZoneId(defaults.timeZoneId);
            $('#timeZoneDrop').val(defaults.timeZoneId);
            roomRequestModel.recurrence.timeZoneId(defaults.timeZoneId);

            if (defaults.eventTypeId && defaults.eventTypeId > 0)
                roomRequestModel.reservationDetails.eventType(parseInt(defaults.eventTypeId, 10));

            ko.applyBindings(null, $('#location-details-comp')[0]);

            setTimeout(function(){
                if(!roomRequestModel.setDateTimeDefaults(defaults)){
                    var filterToday = moment(roomRequestModel.filters.date()).set('hours', 0).set('minutes', 0);
                    roomRequestModel.filters.end(filterToday.add(<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.EndTime] %>, 'minutes'));
                };

                if(defaults.showTimeAs)
                    roomRequestModel.reservationDetails.pamShowTimeAs(defaults.showTimeAs);

                if(defaults.reminder)
                    roomRequestModel.reservationDetails.pamReminder(defaults.reminder);
               
                setFormByPageMode(roomRequestModel);

                if($('#<%= VEMSReservationRecurrenceHelp.ClientID%>').length > 0){
                     $('#recurrence-modal .modal-header .close').after($('#<%= VEMSReservationRecurrenceHelp.ClientID%>'));
                }
            }, 250);

            vems.roomRequest.responsiveViewModel = {
                responsiveSearchResults: ko.observableArray([]),
                responsiveReservableSearchResults: ko.observableArray([]),
                responsiveRequestableSearchResults: ko.observableArray([]),
                modalLoading: ko.observable(false),
                addToCart: function(room, event){
                    if(vems.roomRequest.touchStartPosition.length == 2){
                        var xDist = Math.abs(vems.roomRequest.touchStartPosition[0] - event.clientX);
                        var yDist = Math.abs(vems.roomRequest.touchStartPosition[1] - event.clientY);

                        if(xDist > 30 || yDist > 30)
                            return false;
                    }

                      roomRequestModel.cart.add(room, roomRequestModel.filters, $('#timeZoneDrop'));
                },
                showRoomInfo: function(room){
                    // prevent multi clicks from launching this repeatedly
                    if(!vems.roomRequest.responsiveViewModel.modalLoading()){
                        vems.roomRequest.responsiveViewModel.modalLoading(true);
                        vems.locationDetailsVM.show(room.BuildingId, room.RoomId, vems.roomRequest.responsiveViewModel.modalLoading);
                    }
                }
            };

            ko.applyBindings(vems.roomRequest.responsiveViewModel, document.getElementById('responsive-search-result'));

            //force collapse of sidemenu in desktop view
            if (!DevExpress.devices.real().phone) { 
                if(roomRequestModel.templateId() > 0){
                    $('#wrapper').css('padding-left', 0);
                    vems.toggleSideBar();
                }
            } 
                        
            function enableAttendeeGridAndEvents(){
                if(roomRequestModel.templateRules().AllowInvitations && !roomRequestModel.disableTimeFields() && vems.browse.PAMServiceError().length == 0){
                    roomRequestModel.attendees.initializeAttendeeGrid({ ScreenText: {
                        NoMatchingResults: "<%= escapeQuotes(ScreenText.NoMatchingAttendees) %>",
                        AddAttendeeText: "<%= escapeQuotes(string.Format("{0}", ScreenText.FindAttendee)) %>",
                        AttendeeText: "<%= escapeQuotes(string.Format("{0}", ScreenText.Attendees)) %>",
                        EmailText: "<%= escapeQuotes(string.Format("{0}", ScreenText.EmailAddress)) %>",
                        JobTitleText: "<%= escapeQuotes(string.Format("{0}", ScreenText.JobTitle)) %>"
                    } 
                    } );               
                
                    $("#attendee-grid-container").find('.time-row').css('margin-left', '10px');
                    $("#attendee-grid-container").find('.time-box-overflow').css('width', '275px');

                    roomRequestModel.attendees.attendeeRefreshCallback = function(){roomRequestModel.attendees.GetAttendeeAvailability(); }

                    if(!DevExpress.devices.real().phone){
                        roomRequestModel.attendees.attendeeRefreshCallback();
                    }

                    roomRequestModel.attendees.rebuildAttendeeGridCallback = roomRequestModel.attendees.rebuildAttendeeGrid;

                    if(DevExpress.devices.real().phone){
	                    var attendeeLookup = $('#attendeeGrid-container').detach();
	                    $('#reponsive-attendee-typeahead-container').append(attendeeLookup);
                    };
                }             
             }

            setTimeout(function(){
                enableAttendeeGridAndEvents();
            }, 280);

            $("#timeZoneDrop").on('change', function (ev) {
                roomRequestModel.attendees.attendeeRefreshCallback();
                if (validateTimeFields() && !DevExpress.devices.real().phone) {  // prevent search execution on mobile web
                    roomRequestModel.getAvailability();
                }
            });

            if (roomRequestModel.templateRules().Parameters.AllowAttachments) {
                $("#fileUploader").dxFileUploader({
                    selectButtonText: vems.decodeHtml('<%= escapeQuotes(ScreenText.SelectYourFiles) %>'),
                    labelText: vems.decodeHtml('<%= escapeQuotes(ScreenText.DragDropFiles) %>'),
                    multiple: true,
                    accept: '*', //checked on the server
                    showFileList: false,
                    uploadMode: "instantly", //"instantly", useButtons
                    uploadUrl: "UploadHandler.ashx?attachmentType=1&parentId=-1&ParentTypeId=-42&auditName=" + "<%= WebUser.AuditName.Replace("'", "\'").Replace("\"", "\\\"") %>" + "&TemplateId=<%= TemplateId %>",            
                    uploadFailedMessage: fileUploadErrMsg,
                    onUploaded: roomRequestModel.fileUploaded,
                    onUploadError: roomRequestModel.fileUploadError,
                    onValueChanged: function(e) {
                        $('#res-attach-loading').show();
                    }
                });
            }

            if (roomRequestModel.templateRules().AllowInvitations) {
                $("#fileUploaderPAM").dxFileUploader({
                    selectButtonText: vems.decodeHtml('<%= escapeQuotes(ScreenText.SelectYourFile) %>'),
                    labelText: vems.decodeHtml('<%= escapeQuotes(ScreenText.DragDropFile) %>'),
                    multiple: false,
                    accept: '*', //checked on the server
                    showFileList: false,
                    uploadMode: "instantly", //"instantly", useButtons
                    uploadUrl: "UploadHandler.ashx?attachmentType=2&parentId=-1&ParentTypeId=-42&auditName=" + "<%= WebUser.AuditName.Replace("'", "\'").Replace("\"", "\\\"") %>" + "&TemplateId=<%= TemplateId %>",            
                    onUploaded: roomRequestModel.attendeeFileUploaded, 
                    uploadFailedMessage: fileUploadErrMsg,
                    onUploadError: function(e){
                        roomRequestModel.fileUploadError(e, 'pam');
                    },   
                    onInitialized: function(e) { // this is an overload to prevent drag/drop from allowing multiple files
                        var baseCall = e.component._dropHandler;
                        e.component._dropHandler = function(args) {
                            if (this.option('multiple') == false && args.originalEvent.dataTransfer.files.length > 1) {
                                args.preventDefault();
                                this._dragEventsCount = 0;
                                this.element().removeClass("dx-fileuploader-dragover");              
                                return;
                            }
                            baseCall.apply(this, arguments);
                        }
                    },
                    onValueChanged: function(e) {
                        $('#att-attach-loading').show();
                    }
                });
            }

            $('#template-modal').on('show.bs.modal', function(event) {
                vems.templateModalShowing(event);
            });

            $('#available-list').tablesorter({
                widgets: ['staticRow'],
                sortForce: [[10, 0]], // always sort on recordtype
                sortList: [[10, 0], [9, 1]] // recordType & match
            });

            if(!DevExpress.devices.real().phone && <%= EmsParameters.IntiallyShowAdditionalFilters ? "true" : "false" %>){
                $('#search-room-filters-header a').click();
            }

            $('form input').keydown(function (event) {
                if (event.keyCode == 13) {
                    event.preventDefault();
                    return false;
                }
            });

            $("#booking-date").on('dp.change', function (ev) {
                //valid date, so remove error class if it exists
                var inputel = $(ev.currentTarget).find('input').first();
                inputel.prop('required', false);
                inputel.siblings('.input-group-addon').prop('required', false);
                if (roomRequestModel.templateRules().AllowInvitations) {
                    roomRequestModel.attendees.attendeeRefreshCallback();
                }
            });
        
            $("#booking-date").on('dp.error', function (ev) {
                var inputel = $(ev.currentTarget).find('input').first();
                //inputel.val(ev.date.format(ev.actualFormat));
                if (!inputel.prop('required')){                        
                    inputel.closest('.input-group').after($("<div class='validation-error-message'>").append(vems.roomRequest.enterValidDate));
                    inputel.siblings('.input-group-addon').prop('required', true);
                    inputel.prop('required', true);
                }
            });

            var locFilterHeight = $('#location-filter-container').is(':visible') ? $('#location-filter-container').outerHeight() : 0;
            $('#datetime-overlay-lock').height($('#date-time-collapse').outerHeight() - locFilterHeight);
            if (DevExpress.devices.real().phone) {  // account for cancel/next step button row on mobile web
                $('#datetime-overlay-lock').css('top', '90px');
            }

            $("#booking-end, #booking-start").on('dp.change', function(e){
                if (validateTimeFields() && !DevExpress.devices.real().phone) {  // don't trigger search when on mobile web
                    roomRequestModel.attendees.rebuildAttendeeGridCallback();
                }
            });

            $('a[href="#services"]').on('hidden.bs.tab', function (e) {
                //services validation
                if (!vems.bookingServicesVM.validateServices()){
                    $(this).tab('show');
                }
            });            
                  
            $('#result-tabs a[href="#floorMap"]').on('hidden.bs.tab', function (e) {
                $('#floormap-filters').hide();
                $('#list-room-filter').show();
            }).on('shown.bs.tab', function (e) {
                $('#floormap-filters').show();
                $('#list-room-filter').hide();
            });

            // initialize htmlarea after tab is shown so width is properly inherited (for responsiveness)
            $('a[href="#details"]').on('shown.bs.tab', function (e) {
                if ($('#details').hasClass('active')) {  // don't initialize if tab is still hidden (validation failed on services tab)
                    $('#message').htmlarea({
                        toolbar: [
                            ["html"],
                            ["bold", "italic", "underline", "strikethrough"],
                            ["link", "unlink", "image"],
                            ["orderedlist", "unorderedlist", "superscript", "subscript", "indent", "outdent"],
                            ["justifyleft", "justifycenter", "justifyright", "increasefontsize", "decreasefontsize", "forecolor", "horizontalrule" ]
                        ]
                    });
                    $('body').scrollTop(0);  // prevent intermittent scrolling issue caused by htmlarea initialization
                }
            });

            if(DevExpress.devices.real().phone && vems.roomRequest.pageMode == 'InitialRequest'){
                roomRequestModel.resultType(0);
            };

            var eventNameCopied = false;
            $("#event-name").blur(function(d){
                if (!eventNameCopied && roomRequestModel.reservationDetails.SendInvitation() == true){
                    $("#subject").val($("#event-name").val());
                    eventNameCopied = true;
                }
            });  
            $("#add-to-calendar").on('change',function(d){
                if ($(this).prop("checked") == true && roomRequestModel.reservationDetails.SendInvitation() == true){
                    $("#subject").val($("#event-name").val());
                    eventNameCopied = true;
                }
            });

            validateTimeFields();
        });


        function initializePlugins() {
            $('#specific-room-search').typeahead('destroy');
            vems.bindLoadingGifsToTypeAhead( $('#specific-room-search').typeahead({
                minLength: 2,
                highlight: true
            }, {
                source: function(query, sync, async){
                    roomRequestModel.getAvailability({ qry: query, asyncCall: async });
                },
                limit: <%= EmsParameters.RowCount %>,
                displayKey: 'RoomDescription',
                templates:{
                    suggestion: function (room) {
                        var availableBox = room.UnavailableReason == 0 ? "<span class='fa fa-check' style='margin-right: 5px; color: green;'></span>" : '';
                        var favoriteClass = room.Favorite == 1 ? 'favorite' : '';

                        var rowText = (room.RecordType == 1 ? '(<%= escapeQuotes(ScreenText.Reserve) %>)' : '(<%= escapeQuotes(ScreenText.Request) %>)' ) + ' - ' + vems.encodeHtml(room.BuildingDescription) + ' - ' + vems.encodeHtml(room.TimeZone);

                        if(room.Price.length > 0){
                            rowText += " (" + vems.encodeHtml(room.Price) + ")";;
                        }

                        return '<div class="'+ favoriteClass +'">' + availableBox + vems.encodeHtml(room.RoomDescription) + ' <span class="room-typeahead">' + rowText + '</span></div>'
                    },
                    notFound: '<div class="delegate-typeahead-notfound"><%= escapeQuotes(string.Format(ScreenText.NoMatchingRooms, EmsParameters.RoomTitlePlural)) %></div>'
                },
            }).unbind('typeahead:select').bind('typeahead:select', function (event, room) {
                // filter out unavailable rooms on the phone
                if (DevExpress.devices.real().phone && room.UnavailableReason > 0) {
                    $(this).typeahead("val", "");
                    return false;
                }
                roomRequestModel.cart.add(room, roomRequestModel.filters, $('#timeZoneDrop'));
                $('.specific-room-input').val('');
                $('#specific-room-search').blur();
            }) );
            
            if(!DevExpress.devices.real().phone && vems.roomRequest.pageMode != 'ServiceOnlyRequest'){
                vems.browse.locationFilter = $('#location-filter-container').dynamicFilters({
                    filterParent: vems.browse.filterParents.browseLocations,
                    displaymode: 'roomrequest',
                    templateId:  <%= TemplateId %>,
                    compactViewMode: vems.browse.compactMode.verycompact,
                    filterLabel: "<%= ScreenText.Filter %>",
                    filtersLabel: "<%= ScreenText.Filters %>",
                    compactViewLabel: "<%= ScreenText.CompactView %>",
                    editViewLabel: "<%= ScreenText.EditView %>",
                    findARoomLabel: "<%= string.Format(ScreenText.FindARoom, EmsParameters.RoomTitleSingular) %>",
                    savedFiltersLabel: "<%= ScreenText.SavedFilters %>",
                    saveLabel: "<%= ScreenText.Save %>",
                    addRemoveLabel: "<%= ScreenText.AddRemove %>",
                    saveFilterLabel: "<%= ScreenText.SaveFilter %>",
                    saveFiltersLabel: "<%= ScreenText.SaveFilters %>",
                    closeLabel: "<%= ScreenText.Close %>",
                    updateLabel: "<%= ScreenText.Update %>",
                    cancelLabel: "<%= ScreenText.Cancel %>",
                    nameLabel: "<%= ScreenText.Name %>",
                    dateSavedLabel: "<%= ScreenText.DateSaved %>",
                    loadFilterLabel: "<%= ScreenText.LoadFilter %>",
                    deleteFilterLabel: "<%= ScreenText.DeleteFilter %>",
                    whatWouldYouLikeToNameThisSetOfFiltersLabel: "<%= Messages.WhatWouldYouLikeToNameThisSetOfFilters %>",
                    findByXLabel: "<%= ScreenText.FindX %>",
                    selectedXLabel: "<%= ScreenText.SelectedRooms %>",
                    buildingsLabel: "<%= EmsParameters.BuildingTitlePlural %>",
                    viewsLabel: "<%= ScreenText.Views %>",
                    showAllAreasLabel: "<%= string.Format(ScreenText.ShowAllX, EmsParameters.AreaTitlePlural) %>",
                    filterByAreaLabel: "<%= string.Format(ScreenText.FilterByX, EmsParameters.AreaTitleSingular) %>",
                    searchForAnAreaLabel: "<%= string.Format(ScreenText.SearchForAnX, EmsParameters.AreaTitleSingular) %>",
                    ungroupedBuildingsLabel: "<%= string.Format(ScreenText.UngroupedX, EmsParameters.BuildingTitlePlural) %>",
                    selectAllXLabel: "<%= ScreenText.SelectAllX %>",
                    searchText: "<%= ScreenText.Search %>",
                    requiredFilters: [
                            { filterName: "Locations", filterLabel: "<%= ScreenText.Locations %>", filterType: vems.browse.filterTypes.locationMultiSelect, value: [<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.Facility] %>], displayValue: '<%= escapeQuotes(Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.FacilityDescription]) %>', defaultDisplayValue: '<%= escapeQuotes(ScreenText.DropDownAll) %>' },
                    ],
                    optionalFilters: [ ],
                    filterChanged: function(filterValues, changedFilterName){
                    }
                });
            }

            roomRequestModel.bindBRPOplugins(vems.roomRequest.BRPOScreenText);

            var filters = [];

            if(DevExpress.devices.real().phone){
                filters.push({ filterName: "Locations", filterLabel: "<%= ScreenText.Locations %>", filterType: vems.browse.filterTypes.locationMultiSelect, value: [<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.Facility] %>], displayValue: '<%= escapeQuotes(Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.FacilityDescription]) %>', defaultDisplayValue: '<%= escapeQuotes(ScreenText.DropDownAll) %>' });
            }

            // hide these if they don't have any
            if(<%= HasFloors.ToString().ToLowerInvariant() %>)
                filters.push({ filterName: "Floors", filterLabel: "<%= ScreenText.Floors %>", filterType: vems.browse.filterTypes.advancedMultiSelect, value: [<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.Floor] %>], displayValue: '<%= escapeQuotes(Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.FloorDescription]) %>', defaultDisplayValue: '<%= escapeQuotes(ScreenText.DropDownAll) %>' });
            if(<%= HasSetupTypes.ToString().ToLowerInvariant() %> && roomRequestModel.setupTypeValidation() > 1)
                filters.push({ filterName: "SetupTypes", filterLabel: "<%= ScreenText.SetupTypes %>", filterType: vems.browse.filterTypes.advancedMultiSelect, value: [<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.SetupType] %>], displayValue: '<%= escapeQuotes(Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.SetupTypeDescription]) %>', defaultDisplayValue: '<%= escapeQuotes(ScreenText.NoPreference) %>' });
            if(<%= HasRoomTypes.ToString().ToLowerInvariant() %>)
                filters.push({ filterName: "RoomTypes", filterLabel: "<%= string.Format(ScreenText.RoomTypes, EmsParameters.RoomTitleSingular) %>", filterType: vems.browse.filterTypes.advancedMultiSelect, value: [<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.RoomType] %>], displayValue: '<%= escapeQuotes(Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.RoomTypeDescription]) %>', defaultDisplayValue: '<%= escapeQuotes(ScreenText.DropDownAll) %>' });

            if(<%= HasFeatures.ToString().ToLowerInvariant() %>)
                filters.push({ filterName: "Features", filterLabel: "<%= ScreenText.Features %>", filterType: vems.browse.filterTypes.advancedMultiSelect, value: [<%= Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.Feature] %>], displayValue: '<%= escapeQuotes(ScreenText.None) %>', defaultDisplayValue: '<%= escapeQuotes(ScreenText.None) %>', hide: roomRequestModel.templateRules().VideoConference });

            if(<%= ShowAttendance.ToString().ToLowerInvariant() %>)
                filters.push({ filterName: "Capacity", filterLabel: "<%= ScreenText.NumberOfPeople %>", filterType: vems.browse.filterTypes.number, value: <%= string.IsNullOrEmpty(Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.Attendance]) ? "0" : Defaults[Dea.Ems.Web.Sites.VirtualEms.Constants.PersonalizationKeys.Attendance] %> });

            vems.browse.suppressFilterInit = vems.roomRequest.pageMode === 'EditBooking' || vems.roomRequest.pageMode === 'EditPamLocation';

            vems.browse.dynamicFilters = $('#filter-container').dynamicFilters({
                filterParent: vems.browse.filterParents.browseLocations,
                displaymode: 'roomrequest',
                templateId:  <%= TemplateId %>,
                compactViewMode: vems.browse.compactMode.verycompact,
                filterLabel: "<%= ScreenText.Filter %>",
                filtersLabel: "<%= ScreenText.Filters %>",
                compactViewLabel: "<%= ScreenText.CompactView %>",
                editViewLabel: "<%= ScreenText.EditView %>",
                findARoomLabel: "<%= string.Format(ScreenText.FindARoom, EmsParameters.RoomTitleSingular) %>",
                savedFiltersLabel: "<%= ScreenText.SavedFilters %>",
                saveLabel: "<%= ScreenText.Save %>",
                addRemoveLabel: "<%= ScreenText.AddRemove %>",
                saveFilterLabel: "<%= ScreenText.SaveFilter %>",
                saveFiltersLabel: "<%= ScreenText.SaveFilters %>",
                closeLabel: "<%= ScreenText.Close %>",
                updateLabel: "<%= ScreenText.Update %>",
                cancelLabel: "<%= ScreenText.Cancel %>",
                nameLabel: "<%= ScreenText.Name %>",
                dateSavedLabel: "<%= ScreenText.DateSaved %>",
                loadFilterLabel: "<%= ScreenText.LoadFilter %>",
                deleteFilterLabel: "<%= ScreenText.DeleteFilter %>",
                whatWouldYouLikeToNameThisSetOfFiltersLabel: "<%= Messages.WhatWouldYouLikeToNameThisSetOfFilters %>",
                findByXLabel: "<%= ScreenText.FindX %>",
                selectedXLabel: "<%= ScreenText.SelectedRooms %>",
                buildingsLabel: "<%= EmsParameters.BuildingTitlePlural %>",
                viewsLabel: "<%= ScreenText.Views %>",
                showAllAreasLabel: "<%= string.Format(ScreenText.ShowAllX, EmsParameters.AreaTitlePlural) %>",
                filterByAreaLabel: "<%= string.Format(ScreenText.FilterByX, EmsParameters.AreaTitleSingular) %>",
                searchForAnAreaLabel: "<%= string.Format(ScreenText.SearchForAnX, EmsParameters.AreaTitleSingular) %>",
                selectAllXLabel: "<%= ScreenText.SelectAllX %>",
                ungroupedBuildingsLabel: "<%= string.Format(ScreenText.UngroupedX, EmsParameters.BuildingTitlePlural) %>",                
                searchText: "<%= ScreenText.Search %>",
                requiredFilters: filters,
                optionalFilters: [],
                filterChanged: function(filterValues, changedFilterName){
                    // set the tz dropdown to the selected facility when a single value is selected
                    vems.roomRequest.syncLocationAndTzFromFilterChange(filterValues, changedFilterName);

                    if(vems.browse.suppressFilterInit || DevExpress.devices.real().phone)  // prevent unintentional searching on mobile web
                    {
                        vems.browse.suppressFilterInit = false;
                        return;
                    }
                    roomRequestModel.getAvailability();
                },
                findARoomClicked: function(){
                    roomRequestModel.getAvailability();
                }
            });
        }

        $(document).on('click', '#edit-reservation-details-modal-edit', function(){
            window.location = vems.roomRequest.editReservationLink;
        });

        $(document).on('click', '#edit-reservation-details-modal-home', function(){
            window.location = 'Default.aspx';
        });
    </script>
</asp:Content>
