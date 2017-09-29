<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="CancelBookings" Title="<%$Resources:PageTitles, BrowseReservations %>" Codebehind="CancelBookings.aspx.cs" %>

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
    <div id="cancel-bookings">
        <div class="row" id="breadcrumb">
            <a class="clickable" data-bind="attr: { href: breadcrumbLink }">
                <i class="fa fa-chevron-left"></i>
                <span data-bind="text: ' ' + vems.decodeHtml(eventName()) + ' (' + reservationId() + ')'"></span>
            </a>
             <Dea:HelpButton runat="server" ID="VEMSCancelBookingsHelp" CssClass="floatRight" LookupKey="VEMSCancelBookingsHelp" ParentType="WebTemplate" />
        </div>
        <div class="row">
            <h3><%= ScreenText.CancelBookings %></h3>
        </div>
        <div class="row cancel-bookings-button-div">
            <button role="button" class="btn btn-primary" data-bind="click: cancelSelectedBookings, enable: selectedBookingIds().length > 0">
                <%= ScreenText.CancelSelectedBookings %>
            </button>
        </div>
        <div class="row">
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
                            <td data-bind="text: TimezoneAbbreviation"></td>
                            <td><a href="#" data-bind="text: vems.decodeHtml(Location()), click: function (data) { vems.locationDetailsVM.show(data.BuildingId(), data.RoomId()); }"></a></td>
                            <td data-bind="text: vems.decodeHtml(Status())"></td>
                        </tr>
                        <!-- /ko -->
                        <!-- /ko -->
                        <!-- ko ifnot: bookingList().length > 0 -->
                        <tr>
                            <td colspan="7" class="no-bookings-message"><%= ScreenText.CancelBookingsNoBookings %></td>
                        </tr>
                        <!-- /ko -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- cancel modal -->
        <div class="modal fade" id="cancel-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content" id="cancel-modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h3 class="modal-title"><%= ScreenText.CancelBookingsQuestion %></h3>
                    </div>
                    <div class="modal-body">
				        <p class="cancel-bookings-msg"><%= Messages.CancelBookingsConfirmMessage %></p>
                        <div class="reason dropdown form-group" style="display: none;">
                            <label class="control-label required" for="cancel-reason"><%= ScreenText.CancelReason %></label>
                            <select class="form-control required" name="cancel-reason" data-bind="foreach: cancelReasons, value: $root.DefaultCancelReason">
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
                        <button type="button" class="btn btn-default" id="cancel-btn-yes"><%= ScreenText.YesCancelPlural %></button>
                        <button type="button" class="btn btn-primary" id="cancel-btn-no" data-dismiss="modal"><%= ScreenText.NoCancelPlural %></button>
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

        <!-- location details modal -->
        <div id="location-details-comp" data-bind='component: { name: "location-details-component", params: { } }'></div>
    </div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/cancel-bookings") %>
    <%= Scripts.Render("~/bundles/booking-details") %>
    <%= Scripts.Render("~/bundles/location-details-component") %>
    <script type="text/javascript">
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
            vems.reservationSummary.cancelBookingsViewModel = new vems.reservationSummary.cancelBookingsVM(data);
            ko.applyBindings(vems.reservationSummary.cancelBookingsViewModel, $("#cancel-bookings")[0]);

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