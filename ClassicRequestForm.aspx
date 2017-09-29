<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="ClassicRequestForm" Title="<%$Resources:PageTitles, ClassicRequestForm %>" CodeBehind="ClassicRequestForm.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="server">
    <%# Styles.Render("~/Content/dynamic-filters") %>
</asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <div id="room-request-content">
        <div class="row request-head hidden-xs">
            <div class="col-md-6 ellipsis-text template-head">
                <a href="default.aspx" class="fa fa-times"></a>
                <span class="template-head-text" data-bind="text: vems.decodeHtml(template().Text)"></span>
                <a href="#" class="fa fa-info-circle" data-bind="attr: { 'data-navigateurl': template().NavigateUrl, 'data-templateid': template().Id }" data-toggle="modal" data-target="#template-modal"></a>
            </div>
            <div class="col-md-6">
                <span class="float-right">
                    <button type="button" class="btn btn-success" data-bind="click: function(){ return saveRequest(); }"><%= ScreenText.CreateRequest %></button>
                </span>
            </div>
        </div>
        <div class="request-container" id="room-request-container">
            <div style="text-align: center;" id="main-tabs-container">
                <ul id="main-tabs" class="nav nav-tabs hidden-xs" role="tablist">
                    <li role="presentation" class="active" data-type="bookings"><a href="#bookings" aria-controls="bookings" role="tab" data-toggle="tab"><%= string.Format(ScreenText.RoomSearch, EmsParameters.RoomTitleSingular) %></a></li>
                    <i class="fa fa-caret-right"></i>
                    <li role="presentation" data-type="services" data-bind="visible: templateRules().ServicesPossible"><a href="#services" aria-controls="services" role="tab" data-toggle="tab"><%= ScreenText.Services %></a></li>
                    <i class="fa fa-caret-right" data-bind="visible: templateRules().ServicesPossible && pageData().ShowAvailability"></i>
                    <li role="presentation" data-type="details"><a href="#details" aria-controls="details" role="tab" data-toggle="tab"><%= ScreenText.RequestDetails %></a></li>
                </ul>
            </div>
            <div class="tab-content">
                <div role="tabpanel" class="tab-pane active" id="bookings">
                    <div class="row main-header-row hidden-xs" id="request-header-row">
                        <div class="col-md-8">
                            <div class="main-header-text">
                                <span><%= ScreenText.NewBookingFor %> </span>
                                <span data-bind="text: moment(filters.date()).format('ddd ll')"></span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-primary" style="margin-top: 12px; float: right;" id="rooms-next-step-btn" data-bind="click: nextStepClicked"><%= ScreenText.NextStep %></button>
                        </div>
                    </div>
                    <div class="row" id="filter-result-row">
                        <div class="col-md-4 col-sm-5 col-xs-12" id="filter-column">
                            <div class="panel-group" id="filters-panel" role="tablist" aria-multiselectable="true">
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
                                                <div class='date input-group' id="booking-date" data-bind="datePicker: filters.date, datepickerOptions: { format: 'ddd L', minDate: templateRules().FirstAllowedBookingDate, maxDate: templateRules().LastAllowedBookingDate, keepInvalid: true }">
                                                    <input type='text' class='form-control' />
                                                    <span class="input-group-addon"><span class="fa fa-calendar"></span></span>
                                                </div>
                                            </div>
                                            <button type="button" class="btn btn-default btn-main hidden-xs" id="recurrenceBtn" data-toggle="modal" data-target="#recurrence-modal" data-bind="visible: recurrence.recurrenceTypes().length > 0">
                                                <%= ScreenText.Recurrence %>
                                            </button>
                                        </div>
                                        <div class="time-container" data-bind="visible: recurrence.recurrenceCount() <= 0">
                                            <div style="float: left;" data-bind="visible: recurrence.recurrenceCount() <= 0">
                                                <%= ScreenText.StartTime %>
                                                <div class='date input-group' id="booking-start" data-bind="timePicker: filters.start, datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %>}">
                                                    <input type='text' class='form-control' />
                                                    <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>
                                                </div>
                                            </div>
                                            <div class="end-container" style="float: left;" data-bind="visible: recurrence.recurrenceCount() <= 0">
                                                <%= ScreenText.EndTime %>
                                                <div class='date input-group' id="booking-end" data-bind="timePicker: filters.end, datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %>}">
                                                    <input type='text' class='form-control' />
                                                    <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>
                                                </div>
                                                <div class="next-day-indicator" data-bind="visible: filters.end().hour() < filters.start().hour() || (filters.end().hour() === filters.start().hour() && (filters.end().minute() === filters.start().minute()))">
                                                    <span><%= ScreenText.EndsNextDayIndicator %></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div data-bind="visible: recurrence.recurrenceCount() <= 0 && vems.roomRequest.showTimezone">
                                            <div class="form-group" style="margin: 10px 20px 0 5px; padding-bottom: 10px;">
                                                <%= ScreenText.CreateBookingInThisTimeZone %>
                                                <select class="form-control" id="timeZoneDrop" data-bind="value: filters.timeZoneId, options: TimeZones, optionsText: 'TimeZone', optionsValue: 'TimeZoneId'">
                                                </select>
                                            </div>
                                        </div>
                                        <div class="setup-container" data-bind="visible: $root.setupTypeValidation() > 1">
                                            <div style="background-color: #FAFAFA;">
                                                <div style="margin-right: 20px; padding-bottom: 10px;">
                                                    <%= ScreenText.SetupType %>
                                                    <select class="form-control setupType-edit" id="setup-type" data-bind="event: { change: $root.cart.setupTypeChangedFromCart }, options: setupTypes, optionsText: function(st) { return vems.decodeHtml(st.Description); }, optionsValue: 'Id', attr: { required: $root.setupTypeValidation() == 2 }"></select>
                                                </div>
                                            </div>
                                            <div style="padding-bottom: 10px;">
                                                <%= ScreenText.Attendance %>
                                                <input type="number" class="form-control numeric" id="setup-count" data-bind="value: setupCount" min="0" max="999999" style="width: 100px">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="search-filters-overlay" style="display: none;">
                                    <span style="white-space: pre-line;"><%= string.Format(Messages.RoomRequestFilterOverlayMessage, EmsParameters.RoomTitleSingular) %></span>
                                </div>
                                <div class="panel panel-default hidden-xs" id="search-room-filters">
                                    <div class="panel-heading action-panel" role="tab" id="search-room-filters-header">
                                        <h4 class="panel-title">
                                            <a role="button" data-toggle="collapse" data-parent="#filters-panel" href="#search-room-collapse" aria-expanded="false" aria-controls="#search-room-collapse">
                                                <i class="fa fa-chevron-circle-up" style="margin-right: 10px;"></i><%= string.Format(ScreenText.LetMeSearchForARoom, EmsParameters.RoomTitleSingular) %>
                                            </a>
                                        </h4>
                                        <button type="button" class="btn btn-primary btn-filter-search" data-bind="click: function(){ if(!$('#search-room-collapse').hasClass('in')) $('#search-room-filters .panel-title a').click(); $('.find-a-room').click(); }"><i class="fa fa-search"></i></button>
                                    </div>
                                    <div id="search-room-collapse" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="search-room-filters-header">
                                        <div id="filter-container"></div>
                                    </div>
                                </div>
                                <div class="panel panel-default" id="specific-room-filters" data-bind="visible: vm.pageData().ShowRooms">
                                    <div class="panel-heading hidden-xs action-panel" role="tab" id="specific-room-filters-header">
                                        <h4 class="panel-title">
                                            <a role="button" data-toggle="collapse" data-parent="#filters-panel" href="#specific-room-collapse" aria-expanded="true" aria-controls="#specific-room-collapse">
                                                <i class="fa fa-chevron-circle-down" style="margin-right: 10px;"></i><%= string.Format(ScreenText.IKnowWhatRoomIWant, EmsParameters.RoomTitleSingular) %>
                                            </a>
                                        </h4>
                                    </div>
                                    <div class="panel-heading visible-xs" role="tab" id="specific-room-filters-responsive">
                                        <h4 class="panel-title">
                                            <%= string.Format(ScreenText.SelectARoom, EmsParameters.RoomTitleSingular) %>
                                        </h4>
                                    </div>
                                    <div id="specific-room-collapse" class="panel-collapse collapse" role="tabpanel" aria-labelledby="specific-room-filters-header">
                                        <div style="margin-top: 5px; margin-right: 20px;">
                                            <%= EmsParameters.BuildingTitlePlural %>
                                            <select class="form-control" id="specific-building-drop" data-bind="value: filters.specificBuildingId, options: templateRules().Facilities, optionsText: 'Description', optionsValue: 'Id'">
                                            </select>
                                        </div>
                                        <div style="position: relative; padding-top: 10px; padding-bottom: 5px;">
                                            <%= string.Format(ScreenText.RoomName, EmsParameters.RoomTitleSingular) %>
                                            <span data-bind="visible: !DevExpress.devices.real().phone || (DevExpress.devices.real().phone && cart.bookings && cart.bookings().length === 0)">
                                                <input class="form-control specific-room-input" id="specific-room-search" type="text" data-bind="enable: validateSearchForm" />
                                                <i class="fa fa-search input-icon-embed"></i>
                                            </span>
                                            <div id="responsive-room-selected-container">
                                              <div class="responsive-room-selected-item" data-bind="visible: DevExpress.devices.real().phone && cart.bookings && cart.bookings().length > 0">
                                                <a href="#" title="remove" data-bind="click: cart.responsiveRemove"><span class="fa fa-minus-circle"></span></a>
                                                <span data-bind="text: cart.bookings && cart.bookings().length > 0 ? cart.bookings()[0].RoomDescription() : ''"></span>
                                              </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8 col-sm-7 col-xs-12" id="result-columns">
                            <span id="help-text" style="display: none;">
                                <Dea:WebText ID="CoreHelpText" runat="server" ParentType="none" PersonalizationKey="VemsShowHelpText" IsHelpText="true" EditPage="EditWebText.aspx" LookupKey="VemsClassicRequestTopHelp"></Dea:WebText>
                            </span>
                            <div class="row" id="selectedRoomsContainer" data-bind="visible: vm.pageData().ShowRooms || vm.pageData().ShowAvailability">
                                <div id="selected-rooms-header" class="result-container-header">
                                    <span><%= string.Format(ScreenText.SelectedRooms, EmsParameters.RoomTitlePlural) %></span>
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
                                                <span class="selected-room-name" data-bind="text: vems.decodeHtml(RoomDescription())"></span>
                                                <span data-bind="text:'(<%= ScreenText.XOfYOccurrences %>)'.replace('{0}', count()).replace('{1}', total())"></span>
                                                <!-- ko if: $index() < $root.cart.selectedRoomInstanceCount - 1 -->
                                                <span>, </span>
                                                <!-- /ko -->
                                            </div>
                                            <!-- /ko -->
                                            <!-- ko if: typeof(occurrences) === 'undefined' -->
                                            <span class="selected-room-remove">
                                                <a href="#" class="fa fa-minus-circle" data-bind="click: $root.cart.remove"></a>
                                            </span>
                                            <span class="selected-room-name" data-bind="text: vems.decodeHtml(RoomDescription())"></span>
                                            <!-- /ko -->
                                        </div>
                                    </div>
                                </div>
                                <button class="btn btn-primary" style="margin-top: 12px; float: right;" id="mobile-next-step-btn" data-bind="click: $root.nextStepClicked, visible: DevExpress.devices.real().phone">
                                    <%= ScreenText.NextStep %>
                                </button>
                            </div>
                            <div id="details-sub-container"></div>
                            <div class="row" id="resultsContainer" data-bind="visible: hasResults() && pageData().ShowAvailability && !DevExpress.devices.real().phone">
                                <div id="room-container-header" class="result-container-header">
                                    <span><%= string.Format(ScreenText.RoomSearchResults, EmsParameters.RoomTitleSingular) %></span>
                                </div>
                                <div class="table-responsive">
                                    <table class="table table-striped table-sort" id="available-list">
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th><%= EmsParameters.RoomTitleSingular %></th>
                                                <th style="min-width: 100px;"><%= ScreenText.Available %></th>
                                                <th><%= ScreenText.Location %></th>
                                                <th><%= ScreenText.TZ %></th>
                                                <th><%= ScreenText.Cap %></th>
                                                <th><%= ScreenText.SetupType %></th>
                                                <th style="display: none;">RecordType</th>
                                            </tr>
                                        </thead>
                                        <tbody data-bind="foreach: roomResults">
                                            <tr data-bind="css: { unavailable: UnavailableReason() > 0 }, attr: { 'data-recordType': RecordType, 'data-room-id': RoomId }">
                                                <td class="action-button-column">
                                                    <a class="add-to-cart" href="#" data-bind="visible: $root.cart.bookings().length == 0, css: { disabled: UnavailableReason() > 0 && UnavailableReason() != 9999 }, click: function(data, event) { $root.cart.add(data, $root.filters, $('#timeZoneDrop')) }">
                                                        <i class="fa fa-plus-circle"></i>
                                                    </a>
                                                </td>
                                                <td data-bind="text: vems.decodeHtml(RoomDescription())"></td>
                                                <td>
                                                    <a href="#" data-bind="text: DaysAvailable() + '/' + ($root.recurrence.recurrenceCount() == 0 ? 1 : $root.recurrence.recurrenceCount()), click: $root.cart.availableDaysClicked"></a>
                                                </td>
                                                <td data-bind="text: vems.decodeHtml(BuildingDescription())"></td>
                                                <td data-bind="text: TimeZone"></td>
                                                <td data-bind="text: Capacity() === -1 ? $root.setupCount() : Capacity()"></td>
                                                <td data-bind="text: $('#setup-type :selected').text()"></td>
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
                        </div>
                    </div>
                </div>
                <div role="tabpanel" class="tab-pane" id="services">
                    <div data-bind='component: { name: "booking-services-component", params: { 
    startDateTime: $root.filters.start(),
    endDateTime: $root.filters.end(),
    Services: services,
    ServiceOrders: serviceOrders,
    PONumberField: $root.reservationDetails.poNumber,
    BillingReferenceField: $root.reservationDetails.billingReference,
    LoadServices: true,
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
                </div>
                <div role="tabpanel" class="tab-pane" id="details">
                    <div class="row main-header-row hidden-xs" id="details-header-row">
                        <div class="col-md-12">
                            <div id="details-header-text" class="main-header-text">
                                <%= ScreenText.RequestDetails %>
                            </div>
                        </div>
                    </div>
                    <div class="form row">
                        <div class="panel panel-default" id="event-details-panel">
                            <div class="panel-heading"><%= string.Format(ScreenText.EventDetails, EmsParameters.EventsTitleSingular) %></div>
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
                                    <div class="col-xs-12 visible-xs">
                                        <label for="responsive-setup-type"><%= ScreenText.SetupType %></label>
                                        <select class="form-control setupType-edit" id="responsive-setup-type" data-bind="event: { change: $root.cart.setupTypeChangedFromCart }, options: setupTypes, optionsText: function(st) { return vems.decodeHtml(st.Description); }, optionsValue: 'Id', attr: { required: $root.setupTypeValidation() == 2 }"></select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <%--<pre data-bind="text: ko.toJSON(templateRules(), null, 2)"></pre>--%>
                        <div class="panel panel-default" id="group-panel">
                            <div class="panel-heading"><%= string.Format(ScreenText.GroupDetails, EmsParameters.GroupTitleSingular) %></div>
                            <div class="panel-body">
                                <div class="row">
                                    <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                        <label for="group" class="required"><%= EmsParameters.GroupTitleSingular %></label>
                                        <input class="form-control" id="group" name="1stContactName" maxlength="50" type="text" data-bind="value: reservationDetails.GroupName" required="required" />
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                        <label for="1stContactName" class="required"><%= string.Format(ScreenText.ContactName, EmsParameters.FirstContactTitle ) %></label>
                                        <input class="form-control" id="1stContactName" name="1stContactName" maxlength="50" type="text" data-bind="value: reservationDetails.FirstContactName" required="required" />
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                        <label for="1stContactPhone" class="required"><%= EmsParameters.DefaultPhoneLabel %></label>
                                        <input class="form-control" id="1stContactPhone" type="text" data-bind="value: reservationDetails.FirstPhoneOne" required="required" />
                                    </div>
                                    <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                        <label for="1stContactPhoneTwo"><%= EmsParameters.DefaultFaxLabel %></label>
                                        <input class="form-control" id="1stContactPhoneTwo" type="text" data-bind="value: reservationDetails.FirstPhoneTwo" />
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                        <label for="1stContactEmail" class="required"><%= string.Format("{0} {1}", EmsParameters.FirstContactTitle, ScreenText.EmailAddress) %></label>
                                        <input class="form-control" id="1stContactEmail" type="text" data-bind="value: reservationDetails.FirstEmail" required="required" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="panel panel-default" id="udf-panel" data-bind="visible: (reservationDetails.userDefinedFields.Udfs && reservationDetails.userDefinedFields.Udfs().length > 0)">
                            <div class="panel-heading"><%= ScreenText.AdditionalInformation %> </div>
                            <div class="panel-body">
                                <div class="row" data-bind="visible: reservationDetails.userDefinedFields.Udfs && reservationDetails.userDefinedFields.Udfs().length > 0">
                                    <div class="col-md-4 col-sm-8 col-sx-12">
                                        <div id="udf-container" data-bind='component: {name: "udf-display-component", params: reservationDetails.userDefinedFields.Udfs }'></div>
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
                                <button type="button" class="btn btn-default" data-bind="click: function(){ $('#bookings').toggleClass('active'); $('#details').toggleClass('active'); }"><%= ScreenText.GoBack %></button>
                            </span>
                            <span class="float-right">
                                <button type="button" class="btn btn-success" data-bind="click: function(){ return saveRequest(); }"><%= ScreenText.CreateRequest %></button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- recurrence modal -->
        <div class="modal fade" id="recurrence-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content" id="recurrence-modal-content" data-bind="component: { name: 'recurrence-modal-component', params: $root }"></div>
            </div>
        </div>
    </div>

    <!-- about template modal -->
    <div class="modal fade" id="template-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content" id="template-modal-content" data-bind="component: { name: 'web-template-modal-component', params: $root }"></div>
        </div>
    </div>

    <!-- confirmation modal -->
     <div class="modal fade" id="confirm-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
                <div class="modal-dialog" role="document">
                    <div class="modal-content" id="confirm-modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title"><%= ScreenText.ReadyToContinue %></h4>
                        </div>
                        <div class="modal-body">
                          <div class="row col-xs-12">
                                <%= Messages.ClassicRequestConfirmationMessage %>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" id="confirm-yes-btn" onclick="classicRequestModel.saveRequest()"">
                                <%= ScreenText.YesCreateRequest %>
                            </button>
                            <button type="button" class="btn btn-primary" id="confirm-no-btn" data-dismiss="modal"><%= ScreenText.NoNotYet %></button>
                        </div>
                    </div>
                </div>
            </div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/typeahead") %>
    <%= Scripts.Render("~/bundles/classic-request") %>
    <%= Scripts.Render("~/bundles/user-defined-fields") %>

    <script type="text/javascript">
        vems.browse = vems.browse || {};
        vems.roomRequest = vems.roomRequest || {};
        vems.roomRequest = vems.roomRequest || {};

        vems.browse.FirstContactTitle = '<%= EmsParameters.FirstContactTitle %>';
        vems.browse.AlternateContactTitle = '<%= EmsParameters.AlternateContactTitle %>';
        vems.browse.addRemoveLabel = "<%= ScreenText.AddRemove %>";

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

        vems.roomRequest.reserveLabel = '<%= escapeQuotes(ScreenText.Reserve) %>';
        vems.roomRequest.requestLabel = '<%= escapeQuotes(ScreenText.Request) %>';

        vems.roomRequest.showTimezone = <%= EmsParameters.ShowTimezones.ToString().ToLower() %>;
         
        //force collapse of sidemenu in desktop view
        if (!DevExpress.devices.real().phone) {       
            $('#wrapper').css('padding-left', 0);
            vems.toggleSideBar();
        } 
        
        var vm = new classicRequestModel(<%= TemplateRules %>, <%= PageData %>);
        var classicRequestModel = vm;
       
        $('#template-modal').on('show.bs.modal', function(event) {
            vems.templateModalShowing(event);
        });

        if(!vm.pageData().ShowAvailability){
            $('#search-room-filters').hide();
            $('#specific-room-filters .panel-heading a').click();

            $('#main-tabs i').eq(1).hide();
            $('#main-tabs li').eq(2).hide();

            $('#main-tabs li a').eq(0).text($('#main-tabs li a').eq(2).text());
            $('#details-sub-container').append($('#details > div:not(#details-header-row)'));

            if(!vm.pageData().ShowRooms){
                $('#specific-room-filters').hide();
            }
        }

        $(document).ready(function(){
            if (!vm.templateRules().Parameters.HideDailyRecurrence) {
                vm.recurrence.recurrenceTypes.push({ label: '<%= escapeQuotes(ScreenText.Daily) %>', value: 'daily' });
            }
            if (!vm.templateRules().Parameters.HideWeeklyRecurrence) {
                vm.recurrence.recurrenceTypes.push({ label: '<%= escapeQuotes(ScreenText.Weekly) %>', value: 'weekly' });
            }
            if (!vm.templateRules().Parameters.HideMonthlyRecurrence) {
                vm.recurrence.recurrenceTypes.push({ label: '<%= escapeQuotes(ScreenText.Monthly) %>', value: 'monthly' });
            }
            if (!vm.templateRules().Parameters.HideRandomRecurrence) {
                vm.recurrence.recurrenceTypes.push({ label: '<%= escapeQuotes(ScreenText.Random) %>', value: 'random' });
            }
            if (vm.recurrence.recurrenceTypes().length > 0) {
                vm.recurrence.recurrenceType(vm.recurrence.recurrenceTypes()[0]);
            }

            vm.reservationDetails.userDefinedFields = new vems.userDefinedFieldViewModel( <%= UserDefinedFields %>);

            ko.applyBindings(vm, $('#room-request-content')[0]);
            setupDynamicFilters(vm.pageData());

            setupTypeAhead(vm);

            $('#available-list').tablesorter({
                widgets: ['staticRow'],
                emptyTo: 'bottom',
                sortList: [[2, 1], [1, 0]]
            });

            aboutTemplateModalAfterRender = function () {
                $('#bookNowBtn').hide();
            };


            $("#booking-date").on('dp.change', function (ev) {
                //valid date, so remove error class if it exists
                var inputel = $(ev.currentTarget).find('input').first();
                inputel.prop('required', false);
                inputel.siblings('.input-group-addon').prop('required', false);
                validateTimeFields();
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

            $("#booking-end, #booking-start").on('dp.change', function(e){            
                validateTimeFields();
            });

            $("#timeZoneDrop").on('change', function(e){            
                validateTimeFields();
            });

            function validateTimeFields(){
                var startValid = true;
                var endValid = true;
                var selectedDate = moment($("#booking-date").val(), 'ddd L');
                var startTime = moment($('#booking-start').find('input').first().val() ? $('#booking-start').val() : null);
                var endTime = moment($('#booking-end').find('input').first().val() ? $('#booking-end').val() : null);

                if (startTime.isValid() && endTime.isValid()) {  // if both times are entered, check against template rules and current time
                    startTime = moment(selectedDate).hour(startTime.hour()).minute(startTime.minute());
                    endTime = moment(selectedDate).hour(endTime.hour()).minute(endTime.minute());

                    if (endTime.hour() < startTime.hour() || (endTime.hour() === startTime.hour() && endTime.minute() === startTime.minute())) {
                        endTime.add(1, 'day');  // set end time's date to tomorrow when booking is overnight
                    }

                    // adjust times based on currently-selected time zone
                    if ($('#timeZoneDrop').val() != null) {
                        var selectedTZ = $.grep(classicRequestModel.TimeZones(), function (v, i) {
                            return v.TimeZoneId == $('#timeZoneDrop').val();
                        })[0];

                        var offset = selectedTZ.MinuteBias * -1;
                        startTime = moment(new Date(startTime.year(), startTime.month(), startTime.date(),startTime.hour(), startTime.minute(), 0)).add(offset, 'minute');
                        endTime = moment(new Date(endTime.year(), endTime.month(), endTime.date(), endTime.hour(), endTime.minute(), 0)).add(offset, 'minute');
                    }

                    var utcNow = moment().add((new Date()).getTimezoneOffset(), 'minute');
                    var minTime = classicRequestModel.getTemplateMinDate();
                    var maxTime = classicRequestModel.getTemplateMaxDate();
                    if (startTime.isBefore(minTime) || startTime.isBefore(utcNow) || startTime.isAfter(maxTime)) {
                        startValid = false;
                    }
                    if (endTime.isBefore(minTime) || endTime.isAfter(maxTime)) {
                        endValid = false;
                    }
                } else {  // at least one of the times isn't entered
                    startValid = startTime.isValid();
                    endValid = endTime.isValid();
                }

                if (!startValid || !endValid) {  // set appropriate borders based on which time(s) aren't valid
                    if (!startValid) {
                        $('#booking-start').find('input').first().addClass('required');
                        $('#booking-start').find('span.input-group-addon').addClass('required');
                    } else {
                        $('#booking-start').find('input').first().removeClass('required');
                        $('#booking-start').find('span.input-group-addon').removeClass('required');
                    }

                    if (!endValid) {
                        $('#booking-end').find('input').first().addClass('required');
                        $('#booking-end').find('span.input-group-addon').addClass('required');
                    } else {
                        $('#booking-end').find('input').first().removeClass('required');
                        $('#booking-end').find('span.input-group-addon').removeClass('required');
                    }

                    if ($('#booking-start').closest('.time-container').find('.validation-error-message').length === 0) {
                        $('#booking-start').closest('.time-container').append($('<span class="validation-error-message">').append(vems.roomRequest.enterValidTime));
                    }
                    return false;
                } else {  // remove any red borders and error messages
                    $('#booking-start').find('input').first().removeClass('required');
                    $('#booking-start').find('span.input-group-addon').removeClass('required');
                    $('#booking-end').find('input').first().removeClass('required');
                    $('#booking-end').find('span.input-group-addon').removeClass('required');
                    $('#booking-start').closest('.time-container').find('.validation-error-message').remove();
                    return true;
                }
            };

            if (DevExpress.devices.real().phone) {       
                $('#specific-room-collapse').removeClass('collapse');
                $('#selected-rooms-header').hide();
                $('#selected-rooms-content').hide();
            }
        });

        function setupDynamicFilters(pageData){
            var filters = [
                { filterName: "Locations", filterLabel: "<%= ScreenText.Locations %>", filterType: vems.browse.filterTypes.locationMultiSelect, value: [pageData.FavoriteId], displayValue: pageData.FavoriteDescription, defaultDisplayValue: '<%= ScreenText.DropDownAll %>' },
            ];

            vems.browse.dynamicFilters = $('#filter-container').dynamicFilters({
                filterParent: vems.browse.filterParents.browseLocations,
                displaymode: 'roomrequest',
                templateId:  -1,
                compactViewMode: vems.browse.compactMode.verycompact,
                filterLabel: "<%= ScreenText.Filter %>",
                filtersLabel: "<%= ScreenText.Filters %>",
                compactViewLabel: "<%= ScreenText.CompactView %>",
                editViewLabel: "<%= ScreenText.EditView %>",
                findARoomLabel: "<%= string.Format(ScreenText.FindARoom, EmsParameters.RoomTitleSingular) %>",
                savedFiltersLabel: "<%= ScreenText.SavedFilters %>",
                saveLabel: "<%= ScreenText.Save %>",
                addRemoveLabel: "<%= ScreenText.AddRemove %>",
                addFilterLabel: "<%= ScreenText.AddFilter %>",
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
                    vm.getAvailability();
                },
                findARoomClicked: function(){
                    vm.getAvailability();
                }
            });
        };

        function setupTypeAhead(vm){
            $('#specific-room-search').typeahead('destroy');
            vems.bindLoadingGifsToTypeAhead( $('#specific-room-search').typeahead({
                minLength: 2,
                highlight: true
            }, {
                source: function(query, sync, async){
                    vm.getAvailability({ qry: query, asyncCall: async });
                },
                limit: 16,
                displayKey: 'RoomDescription',
                templates:{
                    suggestion: function (room) {
                        var availableBox = room.UnavailableReason == 0 ? "<span class='fa fa-check' style='margin-right: 5px; color: green;'></span>" : '';
                        var favoriteClass = room.Favorite == 1 ? 'favorite' : '';

                        var rowText = (room.RecordType == 1 ? '(<%= escapeQuotes(ScreenText.Reserve) %>)' : '(<%= escapeQuotes(ScreenText.Request) %>)' ) + ' - ' + room.BuildingDescription + ' - ' + room.TimeZone;

                        return '<div class="'+ favoriteClass +'">' + availableBox + room.RoomDescription + ' <span class="room-typeahead">' + rowText + '</span></div>'
                    },
                    notFound: '<div class="delegate-typeahead-notfound"><%= escapeQuotes(string.Format(ScreenText.NoMatchingRooms, EmsParameters.RoomTitlePlural)) %></div>'
                },
            }).unbind('typeahead:select').bind('typeahead:select', function (event, room) {
                // filter out unavailable rooms on the phone
                if (DevExpress.devices.real().phone && room.UnavailableReason > 0) {
                    $(this).typeahead("val", "");
                    return false;
                }

                vm.cart.add(room, vm.filters, $('#timeZoneDrop'));
                $('.specific-room-input').val('');
                $('#specific-room-search').blur();
            }) );
        };
    </script>
</asp:Content>
