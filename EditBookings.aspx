<%@ Page Title="<%$Resources:PageTitles, BrowseReservations %>" Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="EditBookings" EnableViewState="false" Codebehind="EditBookings.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<asp:Content ID="headContent" runat="server" ContentPlaceHolderID="headContentHolder">
    <style>
        #wrapper {
            padding-left: 0;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <div id="booking-tools">
        <div class="row" id="breadcrumb">
            <a class="clickable" data-bind="attr: { href: breadcrumbLink }">
                <i class="fa fa-chevron-left"></i>
                <span data-bind="text: ' ' + vems.decodeHtml(eventName()) + ' (' + reservationId() + ')'"></span>
            </a>
            <Dea:HelpButton runat="server" ID="VEMSEditBookingsHelp" CssClass="floatRight" LookupKey="VEMSEditBookingsHelp" ParentType="WebTemplate" />
        </div>
        <div class="row booking-tools-banner">
            <div class="booking-tools-subheading"><%= ScreenText.BookingTools %></div>
            <button id="booking-tools-update-btn" role="button" class="btn btn-primary" data-bind="click: updateSelectedBookings, enable: valid">
                <%= ScreenText.UpdateBookingPlural %>
            </button>
        </div>
        <div class="row booking-tools-section">
            <div class="col-sm-4 col-xs-5">
                <div class="row datetime-label"><%= ScreenText.Date %></div>
                <div class="row form-group datetime-container">
                    <select class="form-control" data-bind="options: dateOptions, optionsText: 'Value', optionsValue: 'Key', value: dateChangeMode"></select>
                </div>
                <div class="row datetime-container">
                    <div class="datetime-edit-container">
                        <div class="col-xs-12 form-group row-no-float" data-bind="visible: dateChangeMode() === 1 || dateChangeMode() === 2">
                            <div class="edit-label"><%= ScreenText.DaysCapital %></div>
                            <div class="col-xs-5 col-sm-2 edit-input">
                                <input class="form-control" type="text" maxlength="3" data-bind="numeric, value: numberOfDays" />
                            </div>
                        </div>
                        <div class="col-xs-12 row-no-float" data-bind="visible: dateChangeMode() === 3">
                            <div class="edit-label"><%= ScreenText.Date %></div>
                            <div class="col-xs-8 col-sm-7 col-md-6 input-group date edit-input" data-bind="datePicker: specificDate, datepickerOptions: { format: 'ddd ll' }">
                                <input class="form-control" type="text" />
                                <span class="input-group-addon">
                                    <i class="fa fa-calendar"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xs-1"></div>
            <div class="col-sm-4 col-xs-5">
                <div class="row datetime-label"><%= ScreenText.Time %></div>
                <div class="row form-group datetime-container">
                    <select class="form-control" data-bind="options: timeOptions, optionsText: 'Value', optionsValue: 'Key', value: timeChangeMode"></select>
                </div>
                <div class="row datetime-container">
                    <div class="datetime-edit-container">
                        <div class="col-xs-12 form-group row-no-float" data-bind="visible: timeChangeMode() >= 2 && timeChangeMode() <= 7">
                            <div class="col-xs-6 col-sm-5 edit-input-left">
                                <select class="form-control" data-bind="options: hourMinuteOptions, optionsText: 'Value', optionsValue: 'Key', value: hoursOrMinutes"></select>
                            </div>
                            <div class="col-xs-5 col-sm-2 edit-input">
                                <input class="form-control" type="text" maxlength="3" data-bind="numeric, value: numberOfHoursOrMinutes" />
                            </div>
                        </div>
                        <div class="col-xs-12 row-no-float" data-bind="visible: timeChangeMode() === 1">
                            <div class="row row-no-margin">
                                <div class="col-xs-5 col-sm-3 edit-input-left">
                                    <%= ScreenText.StartTime %>
                                </div>
                                <div class="col-xs-5 col-sm-3 edit-input-left">
                                    <%= ScreenText.EndTime %>
                                </div>
                                <div class="col-xs-11 col-sm-5 edit-input">
                                    <%= ScreenText.TimeZone %>
                                </div>
                            </div>
                            <div class="row form-group row-no-margin">
                                <div class="col-xs-5 col-sm-3 input-group edit-input-left date" data-bind="datePicker: specificStartTime, datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %> }">
		                            <input type="text" class="form-control" />
		                            <span class="input-group-addon">
			                            <i class="fa fa-clock-o"></i>
		                            </span>
	                            </div>
	                            <div class="col-xs-5 col-sm-3 input-group edit-input-left date" data-bind="datePicker: specificEndTime, datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %> }">
		                            <input type="text" class="form-control" />
		                            <span class="input-group-addon">
			                            <i class="fa fa-clock-o"></i>
		                            </span>
	                            </div>
                                <div class="col-xs-11 col-sm-5 edit-input">
                                    <select class="form-control" data-bind="options: timeZones, optionsText: 'TimeZone', optionsValue: 'TimeZoneID', value: timeZoneId"></select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-3 col-xs-1"></div>
        </div>
        <div class="row booking-tools-section grid-section">
             <div class="table-responsive" id="bookings-grid-container">
                <table id="bookings-grid" class="table table-striped table-sort">
                    <thead>
                        <tr>
                            <th data-bind="click: toggleAllBookings">
                                <i id="select-all-cb" class="fa fa-square-o cancel-bookings-cb"></i>
                            </th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.Date %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.StartTime %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.EndTime %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.TimeZone %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.Location %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.Status %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.ResultTableHeading %></div></th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- ko if: bookingList().length > 0 -->
                        <!-- ko foreach: bookingList -->
                        <tr>
                            <td>
                                <i class="fa cancel-bookings-cb" data-bind="css: { 'fa-check-square-o': $root.selectedBookingIds.indexOf(Id()) !== -1, 'fa-square-o': $root.selectedBookingIds.indexOf(Id()) === -1 }, click: $root.toggleBookingSelection"></i>
                            </td>
                            <td><a href="#" data-bind="text: moment(EventStart()).format('ddd ll'), click: function () { vems.bookingDetailsVM.show(Id(), $root.reservationId()); }"></a></td>
                            <td data-bind="text: moment(EventStart()).format('LT')"></td>
                            <td data-bind="text: moment(EventEnd()).format('LT')"></td>
                            <td data-bind="text: TimeZone"></td>
                            <td><a href="#" data-bind="text: vems.decodeHtml(Location()), click: function (data) { vems.locationDetailsVM.show(data.BuildingId(), data.RoomId()); }"></a></td>
                            <td data-bind="text: vems.decodeHtml(Status())"></td>
                            <td><span data-bind="text: vems.decodeHtml(Results()), style: { color: Changed() ? '#000' : 'red' }"></span></td>
                        </tr>
                        <!-- /ko -->
                        <!-- /ko -->
                        <!-- ko ifnot: bookingList().length > 0 -->
                        <tr>
                            <td colspan="8" class="no-bookings-message"><%= ScreenText.EditBookingsNoBookings %></td>
                        </tr>
                        <!-- /ko -->
                    </tbody>
                </table>
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

        <!-- location details modal -->
        <div id="location-details-comp" data-bind='component: { name: "location-details-component", params: { } }'></div>
    </div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/booking-tools") %>
    <%= Scripts.Render("~/bundles/booking-details") %>
    <%= Scripts.Render("~/bundles/location-details-component") %>
    <script type="text/javascript">
        vems.reservationSummary.updateFailedText = '<%= escapeQuotes(Messages.ReservationUpdateFailed) %>';
        vems.reservationSummary.updateSuccessfulMessage = '<%= escapeQuotes(Messages.EditBookingsUpdateSuccessful) %>';
        vems.reservationSummary.updateUnsuccessfulMessage = '<%= escapeQuotes(Messages.EditBookingsUpdateFailed) %>';

        if (!DevExpress.devices.real().phone) { vems.toggleSideBar(); }  //force collapse of sidemenu in desktop view

        $.tablesorter.addParser({
            id: 'moment-dates',
            is: function (s) {
                return false;
            },
            format: function (s) {
                return moment(s)._d.getTime();
            },
            type: 'numeric'
        });

        $(document).ready(function () {
            var data = ko.mapping.fromJS(<%= jsonViewModel %>);
            vems.reservationSummary.bookingToolsViewModel = new vems.reservationSummary.bookingToolsVM(data);
            ko.applyBindings(vems.reservationSummary.bookingToolsViewModel, $("#booking-tools")[0]);

            $('#bookings-grid').tablesorter({
                sortList: [[1, 0]],
                headers: {
                    0: { sorter: false },
                    1: { sorter: 'moment-dates' }
                }
            });
        });
    </script>
</asp:Content>
