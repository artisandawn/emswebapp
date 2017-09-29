<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="LocateGroup" CodeBehind="LocateGroup.aspx.cs" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Register TagPrefix="Dea" Namespace="Dea.Ems.Web.Sites.VirtualEms.Controls" Assembly="Dea.Ems.Web.Sites.VirtualEms.Controls" %>

<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="server">
    <%# Styles.Render("~/Content/plugin/book-grid") %>
    <style>
        .sortable-grid-header .grid-text {
            padding-left: 15px;
        }

        .sortable-grid-content {
            max-height: none;
            overflow-y: visible;
        }

        .help-text-icon {
            padding: 5px 10px 0 0;
        }
    </style>
</asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <div id="locateGroup">
        <Dea:HelpButton runat="server" ID="VEMSLocateGroupHelp" CssClass="floatRight" LookupKey="VEMSLocateGroupHelp" ParentType="None" />
        <div class="vems-panel-light">
            <div class="row">
                <div class="col-xs-12 col-md-10" style="line-height: 30px;">
                    <label style="margin-right: 20px; font-size: 16px;"><%= string.Format(ScreenText.GroupName, EmsParameters.GroupTitleSingular) %>:</label>
                    <div class="input-wrapper-for-icon" style="width: 250px;">
                        <input class="form-control" id="group-search" type="text" placeholder="<%=ScreenText.EnterNamePlaceholder %>" data-bind="textInput: searchString" />
                        <i class="fa fa-search input-icon-embed"></i>
                    </div>
                </div>
            </div>
            <br />
            <div id="eventListContainer" style="display: none;">
                <div style="padding:10px;">
                    <div class="row">
                        <div class="col-xs-8 col-md-8" style="padding: 5px; font-size: 16px; font-weight: bold;" data-bind="text: vems.LG.ViewModel.tempBookingDetail.Caption()"></div>
                    </div>
                    <div class="row" style="border-top: none;">
                        <div class="col-md-12 col-xs-12" style="padding-left: 0; padding-right: 0;">
                            <div class="row sortable-grid-header" id="events-grid-header" style="margin-right: 0; margin-left: 0;">
                                <div id="events-grid-header-eventstart" class="col-sm-4 col-xs-4 mobile-ellipsis-text grid-text"
                                    data-bind="click: function () { vems.LG.sortEvents('EventStart'); }">
                                    <%= ScreenText.Time %>
                                </div>
                                <div id="events-grid-header-eventname" class="col-sm-5 col-xs-5 mobile-ellipsis-text grid-text"
                                    data-bind="click: function () { vems.LG.sortEvents('EventName'); }">
                                    <%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular) %>
                                </div>
                                <div id="events-grid-header-location" class="col-sm-3 col-xs-3 mobile-ellipsis-text grid-text"
                                    data-bind="click: function () { vems.LG.sortEvents('Location'); }">
                                    <%= ScreenText.Location %>
                                </div>
                            </div>
                            <div class="booking-grid">
                                <div id="events-grid" class="sortable-grid-content">
                                    <!-- ko if: vems.LG.ViewModel.tempBookingDetail.Bookings().length > 0 -->
                                    <!-- ko foreach: vems.LG.ViewModel.tempBookingDetail.Bookings -->
                                    <div class="row" style="margin-right: 0; margin-left: 0;">
                                        <div class="col-sm-4 col-xs-4 mobile-ellipsis-text grid-text">
                                            <span data-bind="text: moment(EventStart()).format('h:mm A')"></span>- 
                                            <span data-bind="text: moment(EventEnd()).format('h:mm A')"></span>&nbsp;
                                            <span data-bind="text: TimezoneAbbreviation()"></span>
                                        </div>
                                        <div class="col-sm-5 col-xs-5 ellipsis-text grid-text">
                                            <a href="#" data-bind="attr: { title: vems.decodeHtml(EventName())}, text: vems.decodeHtml(EventName()), click: function () { vems.LG.showBookingDetails(Id()); }"></a>
                                        </div>
                                        <div class="col-sm-3 col-xs-3 grid-text">
                                            <!-- ko if: vems.LG.ViewModel.ShowViewMapCol() && ImageId() > 0 -->
                                            <a href="#" class="ellipsis-text" data-bind="click: function (data) { $root.showMap(data); }, attr: { title: vems.screenText.ViewOnMapText }">
                                                <i class="icon-ems-floorplan"></i>
                                            </a>&nbsp;&nbsp;
                                            <!-- /ko -->
                                            <a href="#" class="ellipsis-text" data-bind="attr: { title: vems.decodeHtml(Location())}, text: vems.decodeHtml(Location()), click: function(data){ vems.locationDetailsVM.show(data.BuildingId(), data.RoomId()); }"></a>
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                    <!-- /ko -->
                                    <!-- ko ifnot: vems.LG.ViewModel.tempBookingDetail.Bookings().length > 0 -->
                                    <div class="row">
                                        <div class="col-xs-12 grid-text-center" data-bind="text: vems.decodeHtml(emptyTextMessage())">
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- floor plan modal -->
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

    <!-- location details modal -->
    <div id="location-details-comp" data-bind='component: { name: "location-details-component", params: { } }'></div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Styles.Render("~/Content/leaflet") %>
    <%= Scripts.Render("~/bundles/leaflet") %>
    <%= Scripts.Render("~/bundles/locate-group") %>
    <%= Scripts.Render("~/bundles/typeahead") %>
    <%= Scripts.Render("~/bundles/booking-details") %>
    <%= Scripts.Render("~/bundles/location-details-component") %>

    <script type="text/javascript">
        //Set db driven text strings
        var vmdata = ko.mapping.fromJS(<%=LocateModelJson %>);

        vems.screenText.LocateText = '<%= escapeQuotes(string.Format(ScreenText.LocateGroup, EmsParameters.GroupTitleSingular)) %>';
        vems.screenText.SearchText = '<%= escapeQuotes(ScreenText.Search) %>';
        vems.screenText.GroupNameText = '<%= escapeQuotes(string.Format(ScreenText.GroupName, EmsParameters.GroupTitleSingular)) %>';
        vems.screenText.NoMatchingGroupsText = '<%= escapeQuotes(ScreenText.NoMatchingGroups) %>';
        vems.screenText.GroupTypeText = '<%= escapeQuotes(string.Format(ScreenText.GroupType, EmsParameters.GroupTitleSingular)) %>';
        vems.screenText.GroupsMatchingYourSearchText = '<%= escapeQuotes(string.Format(ScreenText.GroupsMatchingYourSearch, EmsParameters.GroupTitlePlural)) %>';
        vems.screenText.GroupCityText = '<%= escapeQuotes(string.Format(ScreenText.City, EmsParameters.GroupTitleSingular)) %>';

        vems.screenText.GroupsGridSummaryText = '<%= escapeQuotes(ScreenText.GroupsGridSummary) %>';
        vems.screenText.ViewOnMapText = '<%= escapeQuotes(ScreenText.ViewOnMap) %>';
        vems.screenText.BookingsSummaryText = '<%= escapeQuotes(ScreenText.BookingsSummary) %>';
        vems.screenText.TimeText = '<%= escapeQuotes(ScreenText.Time) %>';
        vems.screenText.CheckOutText = '<%= escapeQuotes(ScreenText.CheckOut) %>';
        vems.screenText.CheckinText = '<%= escapeQuotes(ScreenText.Checkin) %>';
        vems.screenText.TitleText = '<%= escapeQuotes(ScreenText.Title) %>';
        vems.screenText.LocationText = '<%= escapeQuotes(ScreenText.Location) %>';
        vems.screenText.CheckinCheckoutText = '<%= escapeQuotes(ScreenText.CheckinCheckout) %>';
        vems.screenText.EndBookingNowText = '<%= escapeQuotes(ScreenText.EndBookingNow) %>';
        vems.screenText.TodayText = '<%= escapeQuotes(ScreenText.Today) %>';
        vems.screenText.BookingsText = '<%= escapeQuotes(ScreenText.Bookings) %>';
        vems.screenText.BookingsCaptionText = '<%= escapeQuotes(ScreenText.BookingsCaption) %>';
        vems.screenText.CheckedInText = '<%= escapeQuotes(ScreenText.IsCheckedIn) %>';
        vems.screenText.CheckedOutText = '<%= escapeQuotes(ScreenText.GroupIsCheckedOut) %>';
        vems.screenText.EndBookingNowText = '<%= escapeQuotes(ScreenText.EndBookingNow) %>';
        vems.screenText.EndNowConfirmationMessage = '<%= escapeQuotes(Resources.Messages.EndNowConfirmationMessage) %>';
        vems.screenText.EmptyDataText = '<%= escapeQuotes(ScreenText.BookingsEmptyText) %>';
        vems.screenText.reservationDetailsLabel = '<%= escapeQuotes(ScreenText.ReservationDetails) %>';
        vems.screenText.bookingDetailsLabel = '<%= escapeQuotes(ScreenText.BookingDetails) %>';

        vems.screenText.typeaheadCountText = '<%= escapeQuotes(ScreenText.XOutOfYResultsAreShown) %>';

        $(document).ready(function () {
            $("body").addClass('body-dark-background');
            if (DevExpress.devices.real().phone) {
                $("#locateGroup").css('margin-left', '-15px').css('margin-right', '-15px');
            }
            vems.LG.ViewModel = new vems.LG.GroupLocateVM(vmdata);

            ko.applyBindings(vems.LG.ViewModel, document.getElementById('locateGroup'));
            ko.applyBindings(null, $('#location-details-comp')[0]);
            
            vems.LG.ViewModel.groupSearchInit();

            if (vems.LG.ViewModel.SearchString() && vems.LG.ViewModel.SearchString().length > 0) {
                $('#group-search').val(vems.LG.ViewModel.SearchString());
            }

            //suppress asp.net webform postback
            $('form').on('submit', function (e) {
                return false;
            });
            $(document).off('touchend');
            $(document).off('dxpointerdown');
            $(document).off('dxpointerup');

            vems.LG.sortEvents('EventStart');
        });
    </script>
</asp:Content>
