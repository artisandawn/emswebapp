<%@ Page Title="" Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="ReconfirmBookings" CodeBehind="ReconfirmBookings.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<asp:Content ID="Content3" ContentPlaceHolderID="pc" runat="Server">
    <div id="reconfirm-bookings">
          <Dea:HelpButton runat="server" ID="VEMSReconfirmBookingsHelp" CssClass="floatRight" LookupKey="VEMSReconfirmBookingsHelp" ParentType="WebTemplate" />
        <div>
            <h1 data-bind="text: eventName" style="margin-top: 0;"></h1>
            <h3><%= Messages.ReconfirmBookingsInstructionsMessage %></h3>
        </div>
        <div class="row reconfirm-bookings-button-div">
            <div class="col-sm-9">
                <button role="button" class="btn btn-default" data-bind="enable: selectedBookingId() > 0, click: reconfirmSelectedBookings, enable: selectedBookingIds().length > 0">
                    <%= ScreenText.ReconfirmBookings %>
                </button>
            </div>
            <div class="col-sm-3">
                <a data-bind="attr: { href: breadcrumbLink }" style="float: right;"><%= ScreenText.ReservationSummary %></a>
            </div>
        </div>
        <div class="row">
            <div class="table-responsive" id="bookings-grid-container">
                <table id="bookings-grid" class="table table-striped table-sort">
                    <thead>
                        <tr>
                            <th data-bind="click: toggleAllBookings">
                                <i id="select-all-cb" class="fa fa-square-o cancel-bookings-cb"></i>
                            </th>
                            <th>
                                <div class="cancel-bookings-sort-header"><%= ScreenText.Date %></div>
                            </th>
                            <th>
                                <div class="cancel-bookings-sort-header"><%= ScreenText.StartTime %></div>
                            </th>
                            <th>
                                <div class="cancel-bookings-sort-header"><%= ScreenText.EndTime %></div>
                            </th>
                            <th>
                                <div class="cancel-bookings-sort-header"><%= ScreenText.TimeZone %></div>
                            </th>
                            <th>
                                <div class="cancel-bookings-sort-header"><%= ScreenText.Location %></div>
                            </th>
                            <th>
                                <div class="cancel-bookings-sort-header"><%= ScreenText.Status %></div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- ko if: bookings().length > 0 -->
                        <!-- ko foreach: bookings -->
                        <tr>
                            <td>
                                <i class="fa cancel-bookings-cb" data-bind="css: { 'fa-check-square-o': $root.selectedBookingIds.indexOf(Id()) !== -1, 'fa-square-o': $root.selectedBookingIds.indexOf(Id()) === -1 }, click: $root.toggleBookingSelection"></i>
                            </td>
                            <td><a href="#" data-bind="text: moment(EventStart()).format('ddd ll'), click: function () { vems.bookingDetailsVM.show(Id(), $root.reservationId()); }"></a></td>
                            <td data-bind="text: moment(EventStart()).format('LT')"></td>
                            <td data-bind="text: moment(EventEnd()).format('LT')"></td>
                            <td data-bind="text: TimezoneAbbreviation"></td>
                            <td><a data-bind="text: vems.decodeHtml(Location()), attr: { href: LocationLink }"></a></td>
                            <td data-bind="text: vems.decodeHtml(Status())"></td>
                        </tr>
                        <!-- /ko -->
                        <!-- /ko -->
                        <!-- ko ifnot: bookings().length > 0 -->
                        <tr>
                            <td colspan="7" class="no-bookings-message"><%= ScreenText.ReconfirmBookingsNoData %></td>
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
    </div>
</asp:Content>

<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/reconfirm-bookings") %>
    <%= Scripts.Render("~/bundles/booking-details") %>
    <script type="text/javascript">
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
            vems.reservationSummary.reconfirmBookingsViewModel = new vems.reservationSummary.reconfirmBookingsVM(data);
            ko.applyBindings(vems.reservationSummary.reconfirmBookingsViewModel, $("#reconfirm-bookings")[0]);

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
