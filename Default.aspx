<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="_Default" %>

<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>

<asp:content id="headContent" contentplaceholderid="headContentHolder" runat="Server">
    <%# Styles.Render("~/Content/leaflet") %>
    <%# Scripts.Render("~/bundles/leaflet") %>
    <%# Scripts.Render("~/bundles/home") %>
    <%# Styles.Render("~/Content/calendar-scroller") %>
    <style>
        #page-title-responsive h1 {
            float: left;
        }

        #new-booking {
            float: right;
            line-height: 2.5em;
        }

        .calendar-scroller-container .calendar-scroller-cal {
            height: 60px;
        }

        .calendar-cell-container {
            height: 50px !important;
        }
    </style>
</asp:content>
<asp:content id="Content1" contentplaceholderid="pc" runat="Server">
    <span style="display: none">
        <Dea:ApplicationLabelText ID="ApplicationTitle" runat="server" CssClass="ApplicationTitle" LookupKey="VemsApplicationTitle" ParentType="None" />
    </span>
    <div id="home" style="height: 100%;">
        <a id="loginHelpEdit" runat="server" style="float: right; margin-left: 5px;" href="default.aspx?loginedit=1"><%= string.Format("{0} {1}", ScreenText.Edit, ScreenText.Login) %></a>
        <ul id="default-tablist" class="nav nav-tabs" role="tablist">
            <li role="presentation" id="site-home-tab"><a href="#site-home" data-toggle="tab" role="tab"><%= ScreenText.SiteHome %></a></li>
            <li role="presentation" id="my-home-tab"><a href="#my-home" data-toggle="tab" role="tab"><%= ScreenText.MyHome %></a></li>
            <Dea:HelpButton runat="server" ID="guestHelp" CssClass="floatRight" LookupKey="VEMSDefaultPageHelpForGuests" ParentType="None" />
            <Dea:HelpButton runat="server" ID="userHelp" CssClass="floatRight" LookupKey="VEMSDefaultPageHelp" ParentType="None" />
        </ul>

        <!-- Tab panes -->
        <div class="tab-content">
            <div role="tabpanel" class="tab-pane fade" id="site-home">
                <div class="default-page-help-text">
                    <Dea:WebText ID="HomeHelp" runat="server" ParentType="none" PersonalizationKey="VemsShowHelpText" isHelpText="true"
                                 EditPage="EditWebText.aspx" LookupKey="vemsDefaultPageMainHelp" CssClass="default-page-help-text-content"></Dea:WebText>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane fade" id="my-home">

                <div id="conf-msg" style="display:none;">
                    <div data-bind="visible: <%= ConfMsgType.Equals(Dea.Ems.Web.Sites.VirtualEms.Constants.ConfirmationTypes.ActivateAccount).ToString().ToLower() %>">
                        <h1 class="confirm-head"><%= Messages.SignUpComplete %></h1>
                        <div class="confirm-row"><%= Messages.CongratsSignInBelow %></div>
                    </div>
                    <div data-bind="visible: <%= ConfMsgType.Equals(Dea.Ems.Web.Sites.VirtualEms.Constants.ConfirmationTypes.PasswordReset).ToString().ToLower() %>">
                        <h1 class="confirm-head"><%= Messages.YourPasswordReset %></h1>
                        <div class="confirm-row"><%= string.Format(Messages.SuccessSignInBelow, ConfEmail) %></div>
                    </div>
                </div>

                <div class="container-fluid vems-panel" id="signin-panel" style="display: none;">
                    <div class="row">
                        <div class="col-md-6 left-subpanel" data-bind="visible: AllowSignIn" style="display: none;">
                            <h4><%=ScreenText.Login %></h4>
                            <div id="login" style="height:100%">
                                <div class="clear">
                                    <Dea:WebText ID="WebText1" runat="server" ParentType="none" PersonalizationKey="VemsShowHelpText" IsHelpText="true"
                                        EditPage="EditWebText.aspx" LookupKey="VemsLoginPageMainContent"></Dea:WebText>
                                        <!-- /*** edits Dawn Russell - Web Services Team - October 2017**/ -->
                                        <p class="custom-sign-in-text">Students, Faculty, and Staff can login with your UserID and password in the fields below.<br /> (Do not include the @mtholyoke.edu)</p>
                                        <!-- /*** End of edits Dawn Russell ***/ -->
                                </div>
                                <div class="loginDiv">
                                    <div id="timeoutMsg" class="timeout-message center-block" style="display: none;">
                                        <span class="fa fa-exclamation-circle timeout-icon"></span>
                                        <span><%= Messages.SessionExpired %><br /><%= Messages.LogInAgain %></span>
                                    </div>
                                    <div id="login-standard-div" class="center-block" style="width: 60%; display: none;">
                                        <div class="form-group">
                                            <label for="userID_input" class="required"><%= EmsParameters.UserIdLabel %></label>
                                                <asp:TextBox runat="server" ClientIDMode="Static" ID="userID_input" required="required" CssClass="userId form-control"></asp:TextBox>

                                        </div>
                                        <div class="form-group">
                                            <label for="password_input" class="required"><%=ScreenText.Password %></label>
                                        <input type="password" class="form-control" id="password_input" required="required" name="password_input">
                                            <input type="hidden" id="pwdhid" name="pwdhid" />
                                      </div>
                                            <Dea:DropDownWithLabel ID="DomainList" runat="server" Prompt="<%$ Resources:ScreenText, DomainList %>" LabelSizeClass="moveLeft"
                                            IsRequired="true" />

                                        <div class="validation-error-message" style="margin-bottom: 10px"><asp:Literal id="litValidationMsg" runat="server"></asp:Literal> </div>

                                        <div class="form group text-left" >
                                            <asp:Button ID="btnLogin" runat="server"  Text="<%$ Resources:ScreenText, btnLogin %>" OnClick="btnLogin_Click"  CssClass="btn btn-primary" />
                                            <!-- /*** edits Dawn Russell - Web Services Team - October 2017***/ -->
                                              <div class="custom-sign-in-text">
                                              <h3>Instructions for first time users:</h3>
                                                  <p>When making a reservation, in the sponsor field click on the search/spy glass and start typing the name of your department/organization. Choose the correct affiliation and click close. Then in the Sponsor field, click on the down arrow and select the sponsor name. If your name is not listed as a contact for that department/org, you can choose the option of "temporary contact" and fill in the appropriate fields.</p>
                                              </div>
                                            <!-- /*** end of edits Dawn Russell ***/ -->
                                        </div>
                                        <div class="form-group text-left" style="margin-top: 15px;" id="forgotPasswordContainer" runat="server">
                                            <a href="ForgotPassword.aspx"><i class="fa fa-exclamation-triangle fa-3"></i> <%= Resources.ScreenText.IveForgottenMyPassword %></a>
                                        </div>
                                    </div>
                                    <div id="login-sso-div" class="center-block" style="display: none;">
                                        <div class="text-center">
                                            <button type="button" class="btn btn-primary" onclick="window.location = Dea.loginOverrideUrl"><%= ScreenText.Login %></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6" id="guest-actions" data-bind="visible: (ShowCreateAccountButton() || AllowUnauthenticatedRequest())" style=" display: none; vertical-align: middle">
                            <div>
                                <h4><%= ScreenText.WelcomeGuest %></h4>
                            </div>
                            <div id="create-acct" class="text-center" style="margin-top: 1em;" data-bind="visible: ShowCreateAccountButton">
                                <a class="btn btn-success" type="button" href="AccountManagement.aspx" data-bind="html: AccountButtonText"></a>
                            </div>
                            <div id="create-request-unauth" class="text-center" style="margin-top: 1em;" data-bind="visible: AllowUnauthenticatedRequest">
                                <a class="btn btn-success" type="button" href="<%= ClassicRequestLink %>" data-bind="html: RequestRoomText"></a>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="my-home-content" style="display: none;">
                    <!-- My Reservation Templates -->
                    <div id="my-reservation-templates" class="hidden-xs">
                        <h2><%= ScreenText.MyReservationTemplates %></h2>
                        <div>
                            <div id="templates-no-results" class="no-bookings-wrap" style="display: none;">
                                 <h3><%= Messages.YouHaveNoTemplatesConfigured %></h3>
                             </div>
                            <div id="templates-grid" class="booking-grid daily col-xs-12">
                                <div data-bind="template: { name: 'my-reservation-templates-template', foreach: templates }"></div>
                            </div>
                        </div>
                    </div>

                    <!-- My Reservations -->
                    <div id="my-reservations">
                        <h2><%= ScreenText.MyBookings %></h2>
                        <ul class="nav nav-tabs" role="tablist" id="my-bookings-main-tabs">
                            <li id="my-bookings-title" role="presentation" class="active"><a href="#my-bookings" data-toggle="tab" role="tab" data-bind="text: localeDate()"></a></li>
                            <li id="my-bookings-search-tab" role="presentation"><a href="#my-bookings-search" data-toggle="tab" role="tab"><%= ScreenText.Search %></a></li>
                            <span class="time-zone-heading" data-bind="text: vems.decodeHtml(userTimeZone()) + (userTimeZoneAbbr() ? ' [' + userTimeZoneAbbr() + ']' : '')"></span>
                        </ul>
                        <div class="tab-content">
                            <div role="tabpanel" class="tab-pane fade in active" id="my-bookings">
                                <div class="events-loading-overlay"><img class="loading-animation" src="Images/Loading.gif"/></div>
                                <div class="text-center">
                                    <div class="row bordered">
                                        <div class="text-center">
                                            <div id="sliderContainer"></div>
                                        </div>
                                    </div>
                                    <ul id="my-bookings-tabs" class="nav nav-pills center-pills">
                                        <li role="presentation" class="active" data-tabtype="day"><a href="#my-bookings-daily" data-toggle="tab" role="tab"><%= ScreenText.Day %></a></li>
                                        <li role="presentation" data-tabtype="month"><a href="#my-bookings-monthly" data-toggle="tab" role="tab"><%= ScreenText.Month %></a></li>
                                        <li role="presentation" data-tabtype="search">
                                            <div class="date input-group" id="my-bookings-datepicker">
                                                <input type="text" readonly>
                                                <a class="input-group-addon">
                                                    <div>
                                                        <%= ScreenText.Date %>&nbsp;
                                                        <i class="fa fa-angle-down"></i>
                                                    </div>
                                                </a>
                                            </div>
                                        </li>
                                    </ul>

                                    <div class="previous-today-next pull-right">
                                        <a class="hidden-sm hidden-xs" data-bind="click: previousTodayNextHandler.bind($data, -1)"><%= ScreenText.Previous %></a>
                                        <a class="hidden-md hidden-lg fa fa-chevron-left" data-bind="click: previousTodayNextHandler.bind($data, -1)"></a>
                                        <a data-bind="click: previousTodayNextHandler.bind($data, 0)"><%= ScreenText.Today %></a>
                                        <a class="hidden-sm hidden-xs" data-bind="click: previousTodayNextHandler.bind($data, 1)"><%= ScreenText.Next %></a>
                                        <a class="hidden-md hidden-lg fa fa-chevron-right" data-bind="click: previousTodayNextHandler.bind($data, 1)"></a>
                                    </div>
                                </div>

                                <div class="tab-content">
                                    <div role="tabpanel" class="tab-pane fade in active" id="my-bookings-daily">
                                        <!-- ko if: events().length > 0 -->
                                        <div class="booking-grid daily col-xs-12">
                                            <div data-bind="template: { name: 'my-bookings-template', foreach: events, as: 'ev' }">
                                            </div>
                                        </div>
                                        <!-- /ko -->
                                        <!-- ko if: events().length == 0 -->
                                        <div id="no-bookings-wrap" class="no-bookings-wrap">
                                            <h3 data-bind="text: vems.decodeHtml(vems.noBookingsForDate.replace('{0}', localeDate()))"></h3>
                                            <h4 data-bind="visible: nextBookingDate() !== null, click: getEventsForDay.bind($data, nextBookingDate())">
                                                <a><i class="fa fa-external-link-square"></i><%= Messages.ToNextBooking %></a>
                                            </h4>
                                        </div>
                                        <!-- /ko -->
                                    </div>
                                    <div role="tabpanel" class="tab-pane fade" id="my-bookings-monthly">
                                        <div id="bookings-monthly-calendar"></div>
                                    </div>
                                </div>
                            </div>
                            <div role="tabpanel" class="tab-pane fade" id="my-bookings-search">
                                <!-- Simple search -->
                                <div class="form-inline simple-search">
		                            <div class="form-group">
			                            <input type="text" class="form-control" id="booking-search-box">
		                            </div>

		                            <button type="button" class="btn btn-default" id="booking-search-button" data-bind="click: $root.searchForBookings"><%=ScreenText.Search %></button>
                                    <span id="booking-search-count" class="result-count" style="display: none;" data-bind="text: searchRecordCountLabel"></span>

                                    <!-- ko if: searchRecordCount() == 20 && !DevExpress.devices.real().phone -->
		                            <span>&nbsp;<%= Messages.WantToSeeMore %> <a href="BrowseReservations.aspx"><%= ScreenText.ManageMyReservations %></a>.</span>
                                    <!-- /ko -->
	                            </div>

                                <div class="simple-search-results">
                                    <p class="inline-instructions" id="booking-search-instructions"><%= Messages.SearchForBookingsByTitleOrLocation %></p>
                                    <div id="booking-no-results" class="col-md-offset-4" style="display: none;">
                                        <h3 id="booking-no-results-head"></h3>
                                        <ul>
                                            <li><%= Messages.StartWithASimpleSearch %></li>
                                            <li><%= Messages.RememberOnlyBookingTitleAndLocationAreSearchable %></li>
                                        </ul>
                                    </div>
                                    <div id="booking-search-results" class="booking-grid daily col-xs-12" style="display: none;" data-bind="component: { name: 'booking-search-component', params: $root }">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div data-bind='component: {name: "cancel-reason-dialog", params: $root}'></div>
                    </div>

                    <!-- Infographics -->
                    <div id="my-infographics" class="hidden-xs" style="display:none;">
                        <h2><%= ScreenText.MyInfographics %></h2>
                        <div class="row">
                            <div class="col-xs-12 col-md-4">
                                <div class="ig-container">
                                    <div class="date-time-header"><%= ScreenText.Today %></div>
                                    <div class="ig-subhead"><span id="day-chart-count"></span> <%= ScreenText.Bookings %></div>
                                    <div id="ig-today" class="booking-chart-container"></div>
                                </div>
                            </div>
                            <div class="col-xs-12 col-md-4">
                                <div class="ig-container">
                                    <div class="date-time-header"><%= ScreenText.ThisWeek %></div>
                                    <div class="ig-subhead"><span id="week-chart-count"></span> <%= ScreenText.Bookings %></div>
                                    <div id="ig-week" class="booking-chart-container"></div>
                                </div>
                            </div>
                            <div class="col-xs-12 col-md-4">
                                <div class="ig-container">
                                    <div class="date-time-header"><%= ScreenText.ThisMonth %></div>
                                    <div class="ig-subhead"><span id="month-chart-count"></span> <%= ScreenText.Bookings %></div>
                                    <div id="ig-month" class="booking-chart-container"></div>
                                </div>
                            </div>
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
    <!-- endnow modal -->
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
                    <button type="button" class="btn btn-default" id="endBookingBtn"><%= ScreenText.YesEndBooking %></button>
                    <button id="no-endnow-button" type="button" class="btn btn-primary" data-dismiss="modal"><%= ScreenText.NoDontEnd %></button>
                </div>
            </div>
        </div>
    </div>

    <!-- booking details modal -->
    <div id="booking-details-comp" data-bind='component: { name: "booking-details-component", params: { ScreenText: {
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
    <div id="location-details-comp" data-bind='component: { name: "location-details-component", params: { } }'>
    </div>

    <!-- floor plan modal -->
    <div id="floorplan-component-modal" data-bind='component: { name: "floorplans-reserve-modal", params: {
    RoomInfo: new FloorMapRoomInfo(),
    renderType: "modal",
    ScreenText: {
        RequestText: "<%= escapeQuotes(ScreenText.Request) %>    ",
        ReserveText: "<%= escapeQuotes(ScreenText.Reserve) %>    ",
        RoomDetailsText: "<%= escapeQuotes(string.Format(ScreenText.RoomDetails, EmsParameters.RoomTitleSingular)) %>    ",
        RoomCodeText: "<%= escapeQuotes(string.Format(ScreenText.RoomCode, EmsParameters.RoomTitleSingular)) %>    ",
        RoomDescriptionText: "<%= escapeQuotes(ScreenText.Description) %>    ",
        RoomTypeText: "<%= escapeQuotes(string.Format(ScreenText.RoomType, EmsParameters.RoomTitleSingular)) %>    ",
        AvailabilityText: "<%= escapeQuotes(ScreenText.Availability) %>    ",
        AvailableText: "<%= escapeQuotes(ScreenText.Available) %>    ",
        UnavailableText: "<%= escapeQuotes(ScreenText.Unavailable) %>    ",
        StartTimeText: "<%= escapeQuotes(ScreenText.StartTime) %>    ",
        EndTimeText: "<%= escapeQuotes(ScreenText.EndTime) %>    ",
        TitleText: "<%= escapeQuotes(ScreenText.Title) %>    ",
        GroupNameText: "<%= escapeQuotes(EmsParameters.GroupTitleSingular) %>    "
} } }'>
    </div>

    <script type="text/html" id="my-reservation-templates-template">
        <!-- ko if: (DevExpress.devices.real().phone && IsMobile) || IsWebApp -->
        <div class="row" data-bind="attr: {'data-mobile': IsMobile, 'data-webapp': IsWebApp }">
            <div class="col-xs-6 ellipsis-text">
                <span data-bind="text: vems.decodeHtml(Text)"></span>
            </div>
            <div class="col-xs-6 table-buttons">
                <button type="button" class="btn btn-primary btn-xs" data-bind="event: { mousedown: $root.templateClick }"><%= ScreenText.BookNow %></button>
                <button type="button" class="btn btn-primary btn-xs" data-bind="attr: { 'data-navigateurl': NavigateUrl, 'data-templateid': Id }" data-toggle="modal" data-target="#template-modal"><%= ScreenText.About %></button>
            </div>
        </div>
        <!-- /ko -->
    </script>

    <script type="text/html" id="my-bookings-template">
        <div class="row">
            <div class="col-md-2 col-sm-2 col-xs-7 ellipsis-text grid-lesspad-right">
                <div class="row">
                    <div class="col-sm-12 col-xs-12">
                        <span data-bind="text: moment(ev.UserEventStart).format('LT') + ' - ' + moment(ev.UserEventEnd).format('LT')"></span>
                    </div>
                    <div class="hidden-sm hidden-md hidden-lg col-sm-12 col-xs-12 ellipsis-text">
                        <a href="#" data-bind="text: vems.decodeHtml(ev.EventName), click: function () { vems.bookingDetailsVM.show(Id, 0); }"></a>
                    </div>
                </div>
            </div>
            <div class="col-md-3 col-sm-3 hidden-xs ellipsis-text grid-lesspad">
                <a href="#" data-bind="text: vems.decodeHtml(ev.EventName), click: function () { vems.bookingDetailsVM.show(Id, 0); }, attr: {title: vems.decodeHtml(ev.EventName)}"></a>
            </div>
            <div class="col-md-2 col-sm-2 col-xs-5 ellipsis-text grid-lesspad">
                <!-- ko if: ShowFloorMap && (ImageId > 0) -->
	            <a href="#" data-bind="click: vems.home.viewModels.myBookings.showMap">
	                <i class="icon-ems-floorplan"></i>
	            </a>&nbsp;&nbsp;
                <!-- /ko -->
                <a href="#" data-bind="text: vems.decodeHtml(ev.Location), click: function(data){ vems.locationDetailsVM.show(data.BuildingId, data.RoomId); }, attr:{'title': vems.decodeHtml(ev.Location)}"></a>
            </div>
            <div class="col-md-1 col-sm-2 hidden-xs ellipsis-text grid-lesspad">
                <span data-bind="text: vems.decodeHtml(ev.Status), attr:{'title': vems.decodeHtml(ev.Status)}"></span>
            </div>
            <div class="col-md-4 col-sm-3 hidden-xs table-buttons grid-lesspad-left">
                <button type="button"  class="btn btn-primary btn-xs disabled" disabled="disabled" data-toggle="modal" data-bind="visible: ev.IsCheckedIn">
                    <%= ScreenText.IsCheckedIn %>
                </button>
                <button type="button"  class="btn btn-primary btn-xs" data-toggle="modal" data-bind="visible: ev.ShowCheckinButton, click: $root.checkInToEvent.bind(ev), attr: { id: 'checkin-' + ev.Id }">
                    <%= ScreenText.Checkin %>
                </button>
                <button type="button"  class="btn btn-primary btn-xs" data-toggle="modal" data-bind="visible: ev.AllowEndNow, click: $root.endBookingNow.bind(ev), attr: { id: 'endnow-' + ev.Id }">
                    <%= ScreenText.EndNow %>
                </button>
                <!-- ko if: ev.AllowCancel && (!ev.VideoConferenceHost || (ev.OccurrenceCount === 1)) -->
                <button type="button" class="btn btn-primary btn-xs" data-toggle="modal" data-bind="click: $root.cancelBooking.bind(ev), attr: { id: 'cancel-' + ev.Id }">
                    <%= ScreenText.Cancel %>
                </button>
                <!-- /ko -->
            </div>
        </div>
    </script>

</asp:content>
<asp:content id="jsBottomOfPage" contentplaceholderid="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/booking-details") %>
    <%= Scripts.Render("~/bundles/location-details-component") %>
    <script type="text/javascript">
        vems.eventCountsForMonth = <%= EventCountsForMonth %>;
        vems.webTemplates =  <%= WebTemplates %>;
        vems.autoRefreshBookings =  <%= AutoRefreshBookings.ToString().ToLowerInvariant() %>;
        vems.autoRefreshInterval =  <%= AutoRefreshInterval %>;
        vems.showInfographics = <%= EmsParameters.ShowInfographicsOnMyHome.ToString().ToLowerInvariant() %>;
        vems.noBookingsForDate = '<%= escapeQuotes(Messages.NoBookingsForDate) %>';
        vems.screenText.Result = '<%= escapeQuotes(ScreenText.Result) %>';
        vems.screenText.Results = '<%= escapeQuotes(ScreenText.Results) %>';
        vems.screenText.NoSearchResults = '<%= escapeQuotes(Messages.NothingWasFoundForSearchString) %>';
        var sSignInJson = '<%=SignInViewModelJson%>';
        vems.home.viewModels.signin = {};

        var FloorMapHash = '<%= FloorMapHash %>';
        var FloorMapWebServiceUrl = '<%= FloormapWebserviceUrl %>';

        var showSiteHome = $('.default-page-help-text-content').text().trim().length == 0;
        if (showSiteHome) {
            $('#site-home-tab').remove();
        }

        if(typeof(loadAsLogin) != "undefined" && loadAsLogin){
            vems.isAuthd = false;
        }

        if (vems.isAuthd) {
            if (DevExpress.devices.real().phone) {
                $('#default-tablist').hide();
                $('#my-reservations > h2').hide();

                $('#my-bookings-title a').attr('data-bind', '');
                $('#my-bookings-title a').text('<%= escapeQuotes(ScreenText.MyBookings) %>');

                $('#page-title-responsive').append($("<a href='RoomRequest.aspx' id='new-booking'><i class='fa fa-plus' style='padding-right: 9px;'></i>" + '<%= escapeQuotes(ScreenText.NewBooking) %>' + "</a>"));

                $('#my-bookings-tabs, .previous-today-next').hide();
                $('#sliderContainer').calendarScroller({
                    startDate: moment(),
                    eventDates: [],    //[new Date(2016, 0, 20), new Date(2016, 0, 22)],
                    dateSelected: function(date) {
                        getEventsForDay(moment(date));
                    }
                });
            }

            $("#my-home-content").show();
        } else {
            $("#signin-panel").show();
        }

        $('#template-modal').on('show.bs.modal', function(event) {
            vems.templateModalShowing(event);
        });

        $('#my-bookings-tabs').on('show.bs.tab', function(event) {
            var tabType = $(event.target).parent().data('tabtype');

            if (tabType === 'day') {
                vems.home.viewModels.myBookings.localeDate(vems.home.viewModels.myBookings.currentDailyDate.format('LL'));
            } else if (tabType === 'month') {
                $('#bookings-monthly-calendar').data('dxCalendar').option('value', vems.home.viewModels.myBookings.currentDailyDate._d);
                vems.home.viewModels.myBookings.localeDate(moment($('#bookings-monthly-calendar').data('dxCalendar').option('value')).format('MMMM YYYY'));

                // manually localize calendar day abbreviations
                var dayLabels = $('#bookings-monthly-calendar thead th');
                if (dayLabels.length > 0) {
                    $.each(dayLabels, function (idx, dayTh) {
                        var day = $(dayTh);
                        switch (day.text().toLowerCase()) {
                            case 'sun':
                                day.text(moment().isoWeekday(7).format('ddd'));
                                break;
                            case 'mon':
                                day.text(moment().isoWeekday(1).format('ddd'));
                                break;
                            case 'tue':
                                day.text(moment().isoWeekday(2).format('ddd'));
                                break;
                            case 'wed':
                                day.text(moment().isoWeekday(3).format('ddd'));
                                break;
                            case 'thu':
                                day.text(moment().isoWeekday(4).format('ddd'));
                                break;
                            case 'fri':
                                day.text(moment().isoWeekday(5).format('ddd'));
                                break;
                            case 'sat':
                                day.text(moment().isoWeekday(6).format('ddd'));
                                break;
                        }
                    });
                }
            }
        });

        $("body").on('keypress', '#booking-search-box', function(e){
            if(e.which == 13){
                ko.dataFor($('#booking-search-box')[0]).searchForBookings();
                return false;
            }
        });

        $(document).ready(function () {
            if(<%= (!string.IsNullOrEmpty(LoadActionMessage)).ToString().ToLower() %>)
                vems.showToasterMessage('', '<%= LoadActionMessage %>', 'success', 2000);

            ko.mapping.fromJSON(sSignInJson, {}, vems.home.viewModels.signin);
            ko.applyBindings(vems.home.viewModels.signin, $('#signin-panel')[0]);
            vems.home.viewModels.templates = new vems.home.templateVM();
            ko.applyBindings(vems.home.viewModels.templates, $('#my-reservation-templates')[0]);

            var defaultTabId = vems.isAuthd ? vems.home.viewModels.signin.DefaultTab() : vems.home.viewModels.signin.DefaultTabUnauthenticated();

            if (defaultTabId === 0 || showSiteHome || DevExpress.devices.real().phone) {
                $('#my-home-tab').addClass('active');
                $('#my-home').addClass('in active');
            } else {
                $('#site-home-tab').addClass('active');
                $('#site-home').addClass('in active');
            }

            if(vems.home.viewModels.templates.templates().length === 0){
                $('#templates-no-results').show();
                $('#templates-grid').hide();
            }

            vems.home.bookingCounts = vems.eventCountsForMonth;
            vems.home.buildCalendar();

            vems.home.viewModels.myBookings = new vems.home.myBookingsVM();
            ko.applyBindings(vems.home.viewModels.myBookings, $('#my-reservations')[0]);

            ko.applyBindings(null, $('#booking-details-comp')[0]);
            ko.applyBindings(null, $('#location-details-comp')[0]);
            ko.applyBindings(null, $('#floorplan-component-modal')[0]);

            vems.home.buildDatePicker();
            if (vems.showInfographics && !DevExpress.devices.real().phone) {
                vems.home.buildEventPieChart($('#ig-today'), 'day');
                vems.home.buildEventPieChart($('#ig-week'), 'week');
                vems.home.buildEventPieChart($('#ig-month'), 'month');
                $('#my-infographics').show();
            }

            ko.applyBindings(null, $('#conf-msg')[0]);  // allow if/ifnot bindings to work for confirmation messages
            $('#conf-msg').show();  // supplements functionality to prevent temporary showing of messages while page loading

            if (vems.isAuthd && vems.autoRefreshBookings) {  // refresh booking list every X milliseconds if applicable (minimum 60000)
                var autoRefresh = setInterval(function () { getEventsForDay(vems.home.viewModels.myBookings.currentDailyDate); }, vems.autoRefreshInterval);
            }

            setTimeout(function(){
                // the pie charts can end up sized outside their container so we call render for them to fix themselves.
                if($('#ig-today').data('dxPieChart'))
                    $('#ig-today').data('dxPieChart').render();

                if($('#ig-week').data('dxPieChart'))
                    $('#ig-week').data('dxPieChart').render();

                if($('#ig-month').data('dxPieChart'))
                    $('#ig-month').data('dxPieChart').render();
            }, 100);
        });

        /* login logic */
        function validatePage() {

        }

        $(document).ready(function () {
            if(Dea.loginOverrideUrl && Dea.loginOverrideUrl.length > 0){
                $('#login-sso-div').show();
            }else{
                $('#login-standard-div').show();
            }

            $(".userId").attr('name','userID_input');
            $(".userId").attr('ID','userID_input');

            var loginValidation = {
                //debug: true,
                rules: {
                    "userID_input": {required: true },
                    "password_input": {required: true },
                },
                messages: {
                    "userID_input": {required: "Please type a valid <%= EmsParameters.UserIdLabel.ToLower() %>."},
                    "password_input": {required:"Please type a valid <%=ScreenText.Password.ToLower() %>."},
                },
                submitHandler: function (form) {
                    var escaped = vems.htmlEncode($("#password_input").val());
                    $("#pwdhid").val(escaped);
                    $("#password_input").val('');  //clear out pw
                    form.submit();
                }
            };
            jQuery.extend(loginValidation, vems.validationClasses);
            var validator = $("#VirtualEmsForm").validate(loginValidation);

            if ($('#userID_input').val().length > 0) {
                $("#password_input").focus();
            } else {
                $('#userID_input').focus();
            }

            if ('<%= Timeout.ToString().ToLower() %>' === 'true') {
                $("#timeoutMsg").show();
            }

        });
        /* end of login logic*/
    </script>
</asp:content>
