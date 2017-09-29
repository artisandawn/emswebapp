<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="PamManageBookings" Title="<%$Resources:PageTitles, PamManageBookings %>" CodeBehind="PamManageBookings.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Newtonsoft.Json" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" runat="Server">
    <%# Styles.Render("~/Content/plugin/book-grid") %>
    <style>
        #book-grid-container .column-container {
            margin-left: 0;
            height: auto !important;
        }

        #book-grid-container .time-box-overflow {
            width: 215px;
            left: 0;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <div id="room-request-content">
        <div class="header-container">
            <div id="breadcrumb" class="row" style="margin-bottom: 15px;">
                <div style="float: left;">
                    <a data-bind="attr: { href: breadcrumb().link }"><i class="fa fa-chevron-left"></i>
                        &nbsp;
                    <span data-bind="text: vems.decodeHtml(breadcrumb().text)"></span>
                        <span data-bind="text: '(' + reservationId() + ')'"></span>
                    </a>
                </div>
                <Dea:HelpButton runat="server" ID="VEMSMultiBookingHelp" CssClass="floatRight" LookupKey="VEMSMultiBookingHelp" ParentType="WebTemplate" />
            </div>
        </div>
        <div class="room-request-container" id="room-request-container">
            <div class="row main-header-row hidden-xs" id="room-request-header-row">
                <div class="col-md-8">
                    <div class="main-header-text">
                        <span><%= ScreenText.EditBooking %> </span>
                    </div>
                </div>
                <div class="col-md-4">
                    <button class="btn btn-primary" style="margin-top: 12px; float: right;" id="notify-attendees-btn" data-bind="visible: !isVideoConference, click: loadNotifyModal"><%= ScreenText.UpdateAndNotify %></button>
                    <button type="button" class="btn btn-primary" style="margin-top: 12px; float: right;" data-bind="visible: isVideoConference, click: loadNotifyModal, enable: changed() || fromRoomRequest" data-dismiss="modal" id="update-bookings-header"><%= ScreenText.UpdateBookingParenPlural %></button>
                </div>
            </div>
            <div id="bookings">
                <div class="row" id="filter-result-row">
                    <div class="col-md-4 col-sm-5 col-xs-12" id="filter-column">
                        <div class="panel-group" id="filters-panel" role="tablist" aria-multiselectable="true">
                            <div class="panel panel-default" id="event-detail-filters">
                                <div class="panel-heading" role="tab" id="event-detail-filters-header">
                                    <h4 class="panel-title">
                                        <%= string.Format(ScreenText.EventDetails, EmsParameters.EventsTitleSingular) %>
                                    </h4>
                                </div>
                                <div id="event-detail-collapse" role="tabpanel" aria-labelledby="event-detail-filters-header">
                                    <div class="form-group" style="padding-top: 15px; padding-right: 15px;">
                                        <label for="event-name" class="required"><%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular) %></label>
                                        <input type="text" class="form-control" id="event-name-edit" required="required" data-bind="disable: disableAllFields, textInput: filters.eventName, attr: { 'maxLength': eventNameMaxLength }">
                                    </div>
                                    <div class="form-group" style="padding-right: 15px;">
                                        <label for="event-type" class="required"><%= string.Format(ScreenText.EventType, EmsParameters.EventsTitleSingular) %></label>
                                        <select class="form-control" id="event-type-edit" required="required" data-bind="disable: disableAllFields, value: eventType, options: templateRules().EventTypes, optionsText: function(item){ return vems.decodeHtml(item.Description); }, optionsValue: 'Id'"></select>
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
                                    <div class="date-container">
                                        <div style="float: left;">
                                            <%= ScreenText.Date %>
                                            <div class='date input-group' id="booking-date" data-bind="disable: disableAllFields, datePicker: filters.date, datepickerOptions: { format: 'ddd L', minDate: templateRules().FirstAllowedBookingDate, maxDate: templateRules().LastAllowedBookingDate, keepInvalid: true }">
                                                <input type='text' class='form-control' />
                                                <span class="input-group-addon"><span class="fa fa-calendar"></span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="time-container">
                                        <div style="float: left;">
                                            <%= ScreenText.StartTime %>
                                            <div class='date input-group' id="booking-start" data-bind="disable: disableAllFields, timePicker: filters.start, datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %>}">
                                                <input type='text' class='form-control' />
                                                <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>
                                            </div>
                                        </div>
                                        <div class="end-container" style="float: right; margin-right: 5px;">
                                            <%= ScreenText.EndTime %>
                                            <div class='date input-group' id="booking-end" data-bind="disable: disableAllFields, timePicker: filters.end, datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %>}">
                                                <input type='text' class='form-control' />
                                                <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>
                                            </div>
                                            <div class="next-day-indicator" data-bind="visible: filters.end().isBefore(filters.start())">
                                                <span><%= ScreenText.EndsNextDayIndicator %></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <button class="btn btn-primary" style="margin-top: 12px; margin-left: 3px; width: 315px;" id="add-location-btn" data-bind="visible: allowAddBooking, click: addLocation, enable: enableAddLocation"><%= ScreenText.AddLocation %></button>
                                </div>
                                <div class="row error-message" data-bind="visible: conflictedRooms().length > 0">
                                    <span><%= Messages.PamManageConflictWarning %></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8 col-sm-7 col-xs-12" id="result-columns">
                        <div class="row" id="pamContainer" data-bind="visible: templateRules().AllowInvitations && isPam()">
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
                                <%-- <span data-bind="visible: setupTypeValidation() > 0 ">
                                    <a class="setup-link" href="#" data-bind="click: setupModalLinkClicked">
                                        <i class="fa fa-pencil"></i>
                                        <span style="padding-left: 5px;"><%= ScreenText.AttendanceAndSetupType %></span>
                                    </a>
                                </span>--%>
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
                                                            <th data-bind="visible: setupTypeValidation() > 0"><%= ScreenText.Attendance %></th>
                                                            <th data-bind="visible: setupTypeValidation() > 1"><%= ScreenText.SetupType %></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody data-bind="foreach: bookings">
                                                        <tr>
                                                            <td><a data-bind="text: buildLocationString($data), click: function() { alert('location details'); }" href="#"></a></td>
                                                            <td class="setup-count" data-bind="visible: setupTypeValidation() > 0">
                                                                <input class="form-control attendance-edit numeric" type="number" value="1" style="width: 80px" data-bind="textInput: Attendance, event: { change: function(d, e) { setupCountChangedFromCart(e.currentTarget); } }, attr: { min: Min, max: Max, required: setupTypeValidation() == 2  }" />
                                                            </td>
                                                            <td class="setup-type" data-bind="visible: $root.setupTypeValidation() > 1">
                                                                <select class="form-control setupType-edit" data-bind="value: DefaultSetupTypeId, event: { change: setupTypeChangedFromCart }, options: templateRules().SetupTypes, optionsText: function(st) { return vems.decodeHtml(st.Description); }, optionsValue: 'Id', value: DefaultSetupTypeId, attr: { required: setupTypeValidation() == 2 }"></select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-primary" data-bind="click: $root.updateSetupFromModal" data-dismiss="modal" id="setup-modal-save"><%= ScreenText.Update %></button>
                                                <button type="button" class="btn btn-default" data-bind="click: $root.cancelUpdateSetupFromModal" data-dismiss="modal" id="setup-modal-cancel"><%= ScreenText.Cancel %></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div id="result-filter-row">
                                    <div class="events-loading-overlay">
                                        <img class="loading-animation" src="Images/Loading.gif" /></div>
                                    <div id="book-grid-container"></div>
                                </div>
                            </div>
                            <div class="row" id="edit-btn-container" style="margin-top: 15px;">
                                <div>
                                    <button type="button" class="btn btn-primary" data-bind="click: loadNotifyModal, enable: changed() || fromRoomRequest" data-dismiss="modal" id="update-bookings"><%= ScreenText.UpdateBookingParenPlural %></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Notify Attendees modal -->
        <div id="notify-modal" class="modal" role="dialog" aria-labelledby="notify-modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="notify-modal-close-icon"><span aria-hidden="true">&times;</span></button>
                        <h3 class="modal-title" id="template-x-modal-title"><%= ScreenText.NotifyAttendees %></h3>
                    </div>
                    <div class="modal-body">
                        <div style="padding-bottom: 10px;">
                            <%= Messages.NotifyAttendeesModalMessage %>
                        </div>
                        <div class="form-group">
                            <label for="subject"><%= ScreenText.Subject %></label>
                            <input id="subject" class="form-control" data-bind="textInput: subject" />
                        </div>
                        <div class="form-group">
                            <label for="message"><%= ScreenText.Message %></label>
                            <textarea id="message" class="form-control" data-bind="text: message" style="height: 300px;"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal" id="notify-modal-changed-only" data-bind="click: function() { updateBookings(false); }"><%= ScreenText.NotifyChanged %></button>
                        <button type="button" class="btn btn-default" data-dismiss="modal" id="notify-modal-all" data-bind="click: function() { updateBookings(true); }"><%= ScreenText.NotifyAll %></button>
                        <button type="button" class="btn btn-default" data-dismiss="modal" id="notify-modal-cancel"><%= ScreenText.Cancel %></button>
                    </div>
                </div>
            </div>
        </div>
        <div id="booking-details-container" data-bind='component: { name: "booking-details-component", params: { ScreenText: {
    TimeText: "<%= escapeQuotes(ScreenText.Time) %>    ",
        DateText: "<%= escapeQuotes(ScreenText.Date) %>    ",
        EventNameText: "<%= escapeQuotes(string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular)) %>    ",
        LocationText: "<%= escapeQuotes(ScreenText.Location) %>    ",
        GroupNameText: "<%= escapeQuotes(string.Format(ScreenText.GroupName, EmsParameters.GroupTitleSingular)) %>    ",
        NoBookingsMessage: "<%= escapeQuotes(Messages.BookingDetailsNoBookings) %>    ",
        BookingDetailsText: "<%= escapeQuotes(ScreenText.BookingDetails) %>    ",
        EventDetailsText: "<%= escapeQuotes(string.Format(ScreenText.EventDetails, EmsParameters.EventsTitleSingular)) %>    ",
        RelatedEventsText: "<%= escapeQuotes(string.Format(ScreenText.RelatedEvents, EmsParameters.EventsTitlePlural)) %>    ",
        DownloadIcsText: "<%= escapeQuotes(ScreenText.DownloadIcs) %>    ",
        ShareText: "<%= escapeQuotes(ScreenText.Share) %>    ",
        CloseText: "<%= escapeQuotes(ScreenText.Close) %>    ",
        EditText: "<%= escapeQuotes(ScreenText.Edit.ToLowerInvariant()) %>    ",
        FirstBookingText: "<%= escapeQuotes(ScreenText.FirstBooking) %>    ",
        LastBookingText: "<%= escapeQuotes(ScreenText.LastBooking) %>    ",
        CheckedInText: "<%= escapeQuotes(ScreenText.IsCheckedIn) %>    ",
        CheckInText: "<%= escapeQuotes(ScreenText.Checkin) %>    ",
        CancelText: "<%= escapeQuotes(ScreenText.Cancel) %>    ",
        EndNowText: "<%= escapeQuotes(ScreenText.EndNow) %>    ",
        EndNowConfirmText: "<%= escapeQuotes(Messages.EndNowConfirm) %>    ",
        YesEndBookingText: "<%= escapeQuotes(ScreenText.YesEndBooking) %>    ",
        NoDontEndText: "<%= escapeQuotes(HttpUtility.HtmlEncode(ScreenText.NoDontEnd)) %>    ",
        CancelBookingQuestionText: "<%= escapeQuotes(ScreenText.CancelBookingQuestion) %>    ",
        CancelReasonText: "<%= escapeQuotes(ScreenText.CancelReason) %>    ",
        CancelNotesText: "<%= escapeQuotes(ScreenText.CancelNotes) %>    ",
        YesCancelText: "<%= escapeQuotes(ScreenText.YesCancel) %>    ",
        NoCancelText: "<%= escapeQuotes(HttpUtility.HtmlEncode(ScreenText.NoCancel)) %>    "} } }'>
        </div>
        <!-- cancel modal -->
        <div class="modal fade" id="cancel-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content" id="cancel-modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h3 class="modal-title"></h3>
                    </div>
                    <div class="modal-body">
                        <div class="reason dropdown form-group">
                            <label class="control-label required" for="cancel-reason"><%= ScreenText.CancelReason %></label>
                            <select class="form-control required" name="cancel-reason" id="cancel-reason" data-bind="foreach: cancelReasons">
                                <!-- ko if: $index() === 0 -->
                                <option value=""></option>
                                <!-- /ko -->
                                <option data-bind="text: vems.decodeHtml(CancelReason), value: ID, attr: { 'data-notes-required': RequireNotes }"></option>
                            </select>
                        </div>
                        <div class="notes form-group">
                            <label class="control-label" for="cancel-notes"><%= ScreenText.CancelNotes %></label>
                            <textarea name="cancel-notes" id="cancel-notes" class="form-control" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" id="cancel-btn-yes" data-bind="click: removeLocationFromModal"><%= ScreenText.YesCancel %></button>
                        <button type="button" class="btn btn-primary" id="cancel-btn-no" data-dismiss="modal"><%= ScreenText.NoCancel %></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- location details modal -->
    <div id="location-details-comp" data-bind='component: { name: "location-details-component", params: { } }'></div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/typeahead") %>
    <%= Scripts.Render("~/bundles/pam-manage-bookings") %>
    <%= Scripts.Render("~/bundles/booking-details") %>
    <%= Scripts.Render("~/bundles/location-details-component") %>

    <script type="text/javascript">
        vems.browse = vems.browse || {};
        vems.roomRequest = vems.roomRequest || {};
        vems.browse.PAMServiceError = ko.observable('<%= PAMServiceError %>');
        vems.browse.PAMServiceErrorMessage = '<%= escapeQuotes(Messages.PamErrorAccessingService) %>';

        vems.browse.capLabel = '<%= escapeQuotes(ScreenText.Cap) %>';

        vems.roomRequest.roomsYouCanReserveLabel =  '<%= escapeQuotes(string.Format(ScreenText.RoomsYouCanReserve, EmsParameters.RoomTitlePlural)) %>';
        vems.roomRequest.roomsYouCanRequestLabel = '<%= escapeQuotes(string.Format(ScreenText.RoomsYouCanRequest, EmsParameters.RoomTitlePlural)) %>';

        vems.browse.startTime = "<%= ScreenText.StartTime %>";
        vems.browse.date = "<%= ScreenText.Date %>";
        vems.browse.eventNameText = "<%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular) %>";
        vems.browse.locationText = "<%= ScreenText.Location %>";
        vems.browse.groupNameText = "<%= string.Format(ScreenText.GroupName, EmsParameters.GroupTitleSingular) %>";
        vems.browse.noBookingsMessage = "<%= Messages.BookingDetailsNoBookings %>";

        vems.browse.enterValidDate = '<%= escapeQuotes(string.Format(Messages.EnterValid, ScreenText.Date)) %>';
        vems.browse.enterValidTime = '<%= escapeQuotes(string.Format(Messages.EnterValid, ScreenText.Time)) %>';
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
        vems.browse.AvailabilityLegendLabel = '<%= escapeQuotes(ScreenText.AvailabilityLegend) %>';

        //force collapse of sidemenu in desktop view
        if (!DevExpress.devices.real().phone) { 
            $('#wrapper').css('padding-left', 0);
            vems.toggleSideBar();
        }

        var defaults = {
            date: moment(<%= JsonConvert.SerializeObject(PageStart.Date) %>),
            start: moment(<%= JsonConvert.SerializeObject(PageStart) %>),
            end: moment(<%= JsonConvert.SerializeObject(PageEnd) %>),
            eventName: vems.decodeHtml('<%= escapeQuotes(BreadcrumbText) %>'),
            timeZoneId: <%= TimeZoneId %> 
            };

        $(document).ready(function(){
            // templateId, templateRules, defaults, labels
            var pamManageVM = new pamManageBookingsModel( <%= ReservationId %>, <%= BookingId %>, <%= TemplateId %>, <%= TemplateRules %>,  <%= PageOptions %>, defaults);

            pamManageVM.setupTypeValidation(<%= SetupTypeValidation %>);

            pamManageVM.isPam = ko.observable(Ems_isPam);

            pamManageVM.subject(vems.decodeHtml(<%= JsonConvert.SerializeObject(PamSubject) %>));
            pamManageVM.message(<%= JsonConvert.SerializeObject(PamMessage) %>);

            pamManageVM.breadcrumb({
                link: '<%= BreadcrumbLink %>',
                text: vems.decodeHtml('<%= escapeQuotes(BreadcrumbText) %>')
            });

            pamManageVM.attendees = new attendeeViewModel('', pamManageVM);
            pamManageVM.cancelReasons = ko.observableArray(<%= cancelReasonData %>);
            pamManageVM.conflictedRooms = ko.observableArray(<%= string.IsNullOrEmpty(ConflictedRooms) ? "[]" : ConflictedRooms %>);
            pamManageVM.bookGridBookings = <%= BookGridBookings %>;
            pamManageVM.initialBookings = pamManageVM.bookGridBookings;
            pamManageVM.bookGridModel = <%= BookGridModel %>;
            pamManageVM.availableBuildings = <%=AvailableBuildingsTimeZones%>;

            pamManageVM.currentNumberOfBookingsBeforeLastDate(<%=CurrentNumberOfBookingsBeforeLastDate%>);

            ko.mapping.fromJS(<%= Attendees %>, {}, pamManageVM.attendees.attendeeList);

            pamManageVM.fromRoomRequest = <%= RedirectedFromRoomRequest.ToString().ToLower() %>;

            pamManageVM.setEnableAddBooking();
            ko.applyBindings(pamManageVM, document.getElementById('room-request-content'));
            ko.applyBindings(null, $('#location-details-comp')[0]);

            $('#book-grid-container').bookGrid({
                buildings: [],
                bookings: [],
                enableEditing: false,
                canBook: false,
                useCalculatedHeight: false,
                mode: 'exchange',
                isVideoConference: pamManageVM.isVideoConference,
                showSetupTeardown: pamManageVM.showSetupTeardown,
                labels: {
                    roomsYouCanReserveLabel: vems.roomRequest.roomsYouCanReserveLabel,
                    roomsYouCanRequestLabel: vems.roomRequest.roomsYouCanRequestLabel
                },
                legendItems: [
                    { name: vems.browse.freeLabel, color: 'transparent' },
                    { name: vems.browse.someoneElsesBookingLabel, color: '#536D93' },
                    { name: vems.browse.myNewBookingLabel, color: '#D3C51C' },
                    { name: vems.browse.myExistingBookingLabel, color: '#84D31C' },
                    { name: vems.browse.closureLabel, color: '#DCDEE0' }
                ],
                availableBuildings: pamManageVM.availableBuildings,
                bookOptions: {
                    bookStartDate: defaults.date,
                    startHour: new Date(defaults.start).getHours(),
                    highlightBoxMinutes: createHighlightBoxMinutes(pamManageVM.filters),
                    bookingClicked: function (bookingId) {
                        vems.bookingDetailsVM.show(bookingId, 0);
                    },
                    onCancelBookingClick: function (e) {
                        var target = $(e.currentTarget);

                        var rowParent = target.parent().parent().parent();
                        var roomId = rowParent.data('roomId');

                        pamManageVM.removeLocation(roomId, target);
                    },
                    onEditBookingClick: function (e) {
                        var target = $(e.currentTarget);

                        var rowParent = target.parent().parent().parent();
                        var roomId = rowParent.data('roomId');

                        var bookingId = $.grep(pamManageVM.roomBookingMap, function(v, i){
                            return v.RoomId == roomId;
                        });

                        window.location = pamManageVM.editBookingLink() 
                            + "&<%= Dea.Ems.Web.Sites.VirtualEms.Constants.Querystring.BookingId %>=" + bookingId[0].Id
                            + "&st=" + pamManageVM.filters.start() 
                            + "&et=" + pamManageVM.filters.end() 
                            + "&bd=" + pamManageVM.filters.date()
                            + "&tzid=" + $('#ems_TimezoneId').val();
                    },
                    onEventsDrawn: function(){
                        $('#book-grid-container .room-column .column-text').removeClass('conflict');

                        $.each(pamManageVM.conflictedRooms(), function(i, v){
                            var roomElement = $('#book-grid-container .room-column[data-room-id=' + v + '] .column-text');

                            if(roomElement && roomElement.length === 1){
                                roomElement.addClass('conflict');
                            }
                        });
                    },
                    gridRowsRendered: function(gridContainer){
                        $.each(pamManageVM.initialBookings.Bookings, function(i, v){
                            var roomElement = gridContainer.find('.room-column[data-room-id=' + v.RoomId + '] .column-text');
                            
                            if(roomElement.length === 1){
                                if(v.CanEdit){
                                    roomElement.find('.book-action-icon.book-edit').parent().show();
                                }

                                if(v.CanCancel){
                                    roomElement.find('.book-action-icon.book-cancel').parent().show();
                                }
                            }
                        });
                    }
                }
            });

            
            $('#book-grid-container').data('bookGrid').setRequestedDates(pamManageVM.filters.start(), pamManageVM.filters.end());
            $('#book-grid-container').data('bookGrid').rebuildGrid(pamManageVM.bookGridModel,  pamManageVM.bookGridBookings, pamManageVM.filters.date());

            function enableAttendeeGridAndEvents(){                
                if(pamManageVM.templateRules().AllowInvitations && pamManageVM.isPam()){
                    pamManageVM.attendees.initializeAttendeeGrid(defaults.date, new Date(defaults.start).getHours(), { 
                        ScreenText: {
                            NoMatchingResults: "<%= escapeQuotes(ScreenText.NoMatchingAttendees) %>",
                            AddAttendeeText: "<%= escapeQuotes(string.Format("{0}", ScreenText.FindAttendee)) %>",
                            AttendeeText: "<%= escapeQuotes(string.Format("{0}", ScreenText.Attendees)) %>",
                            EmailText: "<%= escapeQuotes(string.Format("{0}", ScreenText.EmailAddress)) %>",
                            JobTitleText: "<%= escapeQuotes(string.Format("{0}", ScreenText.JobTitle)) %>"
                        } 
                    });            

                    pamManageVM.attendees.attendeeRefreshCallback = function(){pamManageVM.attendees.GetAttendeeAvailability(); }
                    pamManageVM.attendees.attendeeRefreshCallback();
                }             
            }

            setTimeout(function(){ pamManageVM.eventType(<%= EventTypeId %>); }, 0);
            setTimeout(function(){
                enableAttendeeGridAndEvents();
            }, 280);

            $("#booking-date").on('dp.change', function (ev) {
                //valid date, so remove error class if it exists
                var inputel = $(ev.currentTarget).find('input').first();
                inputel.prop('required', false);
                inputel.siblings('.input-group-addon').prop('required', false);
                $("#booking-start").find('input').first().trigger('change');
                if(pamManageVM.templateRules().AllowInvitations && pamManageVM.isPam()){
                    pamManageVM.attendees.attendeeRefreshCallback();
                }
                var selectedDate = pamManageVM.filters.date();
                pamManageVM.syncGridsOnDateChange(selectedDate);
            });

            $("#booking-date").on('dp.error', function (ev) {
                var inputel = $(ev.currentTarget).find('input').first();
                inputel.val(ev.date.format(ev.actualFormat));
                if (!inputel.prop('required')){                        
                    inputel.closest('.input-group').after($("<div class='validation-error-message'>").append(vems.browse.enterValidDate));
                    inputel.siblings('.input-group-addon').prop('required', true);
                    inputel.prop('required', true);
                }
            });

            $("#booking-end, #booking-start").on('dp.change', function(e){            
                if (validateTimeFields(e)) {
                    $('#book-grid-container').data('bookGrid').setHighlightBoxMinutes(createHighlightBoxMinutes(pamManageVM.filters));
                    $('#book-grid-container').data('bookGrid').setRequestedDates(pamManageVM.filters.start(), pamManageVM.filters.end());
                    $('#book-grid-container').data('bookGrid').rebuildGrid(pamManageVM.bookGridModel,  pamManageVM.bookGridBookings, pamManageVM.filters.date(), pamManageVM.availableBuildings );
                    
                    if(pamManageVM.templateRules().AllowInvitations && pamManageVM.isPam()){
                        pamManageVM.attendees.attendeeRefreshCallback();
                    }
                }
            });

            function validateTimeFields(e){
                var t = e.currentTarget;
                var theTime = moment(e.date);
                var inp = $("#booking-date").find('input').first();
                var selectedDate = pamManageVM.filters.date(); //moment(inp.val()); 
                theTime = selectedDate.hour(theTime.hour()).minute(theTime.minute());
                var minTime = pamManageVM.getTemplateMinDate();
                var maxTime = pamManageVM.getTemplateMaxDate();
                var inputel = $(e.currentTarget).find('input').first(); 
                if (inputel.val().length == 0 || theTime < minTime || theTime > maxTime){
                
                    if (!inputel.hasClass('required')){
                        inputel.siblings('.input-group-addon').addClass('required');                     
                        inputel.addClass('required');
                    }
                    if (inputel.closest('.time-container').find('.validation-error-message').length == 0){
                        //var lbl = inputel.closest('.input-group').siblings('.time-label').text();
                        inputel.closest('.time-container').append($("<span class='validation-error-message'>").append(vems.browse.enterValidTime));
                    }
                    return false;
                }
                else {
                    inputel.siblings('.input-group-addon').removeClass('required');
                    inputel.removeClass('required');
                    inputel.closest('.time-container').find('.validation-error-message').remove();
                    return true;
                }
            };

            $('#notify-modal').on('shown.bs.modal', function(){
                $('#message').htmlarea({
                    toolbar: [
                        ["html"],
                        ["bold", "italic", "underline", "strikethrough"],
                        ["link", "unlink", "image"],
                        ["orderedlist", "unorderedlist", "superscript", "subscript", "indent", "outdent"],
                        ["justifyleft", "justifycenter", "justifyright", "increasefontsize", "decreasefontsize", "forecolor", "horizontalrule" ]
                    ]
                });
            });
        });

        function createHighlightBoxMinutes(filters) {
            var startMinutes = filters.start()
               ? moment(filters.start()).hours() * 60 + moment(filters.start()).minutes()
               : 0;

            var endMinutes = filters.end()
                ? moment(filters.end()).hours() * 60 + moment(filters.end()).minutes()
                : 0;

            return [startMinutes, endMinutes];
        }
    </script>
</asp:Content>
