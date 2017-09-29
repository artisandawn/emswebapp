<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="Reservations_ReservationSummary"
    Title="<%$Resources:PageTitles, BrowseReservations %>" EnableViewState="false" EnableEventValidation="false" CodeBehind="ReservationSummary.aspx.cs" %>

<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ Import Namespace="Dea.Ems.Web.Sites.VirtualEms" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>

<asp:Content ID="headContent" runat="server" ContentPlaceHolderID="headContentHolder">
    <style>
        #wrapper {
            padding-left: 0;
        }

        .summary-cancelled-checkbox {
            top: 1em;
            position: relative;
            text-transform: none;
        }

            .summary-cancelled-checkbox #include-cancelled {
                margin-top: 0 !important;
            }

        .udf-container .location-udf-row:nth-child(even) {
            background-color: #F9F9F9;
        }
    </style>
</asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <div id="reservation-summary">
        <div class="row" id="breadcrumb">
            <a href="BrowseReservations.aspx" data-bind="visible: !viewOnly()"><i class="fa fa-chevron-left"></i>&nbsp;<%= ScreenText.MyEvents %></a>
            <span class="breadcrumb-text" data-bind="text: vems.decodeHtml(breadcrumbText())"></span>
            <span class="grey-text breadcrumb-text" data-bind="text: '(' + reservation().ReservationId + ')'"></span>
            <Dea:HelpButton runat="server" ID="VEMSReservationSummaryQMark" CssClass="floatRight" LookupKey="VEMSReservationSummaryQMark" ParentType="WebTemplate" />
        </div>
        <div class="row" id="reservation-container">
            <div class="col-sm-9" data-bind="css: { 'col-sm-9': (!viewOnly() && (reservationActions().length > 0 || reservationViewActions().length > 0)), 'col-sm-12': (viewOnly() || (reservationActions().length == 0 && reservationViewActions().length == 0)) }">
                <div>
                    <ul id="main-tabs" class="nav nav-tabs" role="tablist">
                        <li role="presentation" class="active"><a href="#reservation-details" aria-controls="reservation-details" role="tab" data-toggle="tab"><%= ScreenText.ReservationDetails %></a></li>
                        <li role="presentation" data-bind="visible: !viewOnly() && (comments().length > 0 || userDefinedFields().length > 0)"><a href="#additional-info" aria-controls="additional-info" role="tab" data-toggle="tab"><%= ScreenText.AdditionalInformation %></a></li>
                        <li role="presentation" data-bind="visible: !viewOnly() && AllowAttachments"><a href="#attachments" aria-controls="attachments" role="tab" data-toggle="tab"><%= ScreenText.Attachments %></a></li>
                    </ul>
                </div>
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane active" id="reservation-details">
                        <div class="table-responsive" id="reservation-details-table">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th class="sr-only">Property</th>
                                        <th class="sr-only">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr data-bind="visible: allowReservationEdit && editReservationLink.length > 0">
                                        <td class="edit-reservation-cell" colspan="99">
                                            <a data-bind="attr: { href: editReservationLink }"><i class="fa fa-pencil"></i>&nbsp;<%= ScreenText.EditReservationDetails %></a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular)%></td>
                                        <td data-bind="text: vems.decodeHtml(reservation().EventName)"></td>
                                    </tr>
                                    <tr>
                                        <td><%= string.Format(ScreenText.EventType, EmsParameters.EventsTitleSingular)%></td>
                                        <td data-bind="text: vems.decodeHtml(reservation().EventType)"></td>
                                    </tr>
                                    <tr>
                                        <td><%= EmsParameters.GroupTitleSingular%></td>
                                        <td data-bind="text: vems.decodeHtml(reservation().GroupName)"></td>
                                    </tr>
                                    <tr>
                                        <td><%= string.Format(ScreenText.ContactName, EmsParameters.FirstContactTitle) %></td>
                                        <td data-bind="text: vems.decodeHtml(reservation().PrimaryContact)"></td>
                                    </tr>
                                    <tr>
                                        <td data-bind="text: vems.decodeHtml(reservation().PhoneLabel)"></td>
                                        <td data-bind="text: vems.decodeHtml(reservation().Phone)"></td>
                                    </tr>
                                    <!-- ko if: reservation().ShowAltContact -->
                                    <tr data-bind="visible: reservation().AltContact.length > 0">
                                        <td><%= string.Format(ScreenText.ContactName, EmsParameters.AlternateContactTitle) %></td>
                                        <td data-bind="text: vems.decodeHtml(reservation().AltContact)"></td>
                                    </tr>
                                    <tr data-bind="visible: reservation().AltContact.length > 0">
                                        <td data-bind="text: vems.decodeHtml(reservation().AltPhoneLabel)"></td>
                                        <td data-bind="text: vems.decodeHtml(reservation().AltPhone)"></td>
                                    </tr>
                                    <!-- /ko -->
                                    <tr data-bind="visible: reservation().ShowBillingReference && reservation().BillingReference && reservation().BillingReference.length > 0 ">
                                        <td><%= EmsParameters.BillingReferenceTitleSingular %></td>
                                        <td data-bind="text: vems.decodeHtml(reservation().BillingReference)"></td>
                                    </tr>
                                    <tr data-bind="visible: reservation().ShowPONumber && reservation().PONumber && reservation().PONumber.length > 0 ">
                                        <td><%= EmsParameters.PONumberTitle %></td>
                                        <td data-bind="text: vems.decodeHtml(reservation().PONumber)"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="additional-info">
                        <div class="row" style="padding: 15px 0; background-color: #F9F9F9;" data-bind="visible: (allowReservationEdit && editReservationLink.length > 0 && reservation().AllowEditUdf == 1)">
                            <div class="col-sm-12"><a style="padding-left: 15px;" data-bind="attr: { href: editReservationLink + '&ai=1' }"><i class="fa fa-pencil"></i>&nbsp;<%= ScreenText.EditAdditionalInformation %></a></div>
                        </div>
                        <div id="comments-container" data-bind="foreach: comments">
                            <div class="row" style="padding: 15px 0;">
                                <div class="col-sm-3" data-bind="text: vems.decodeHtml(Description)"></div>
                                <div class="col-sm-9" style="white-space: pre-wrap;" data-bind="text: vems.decodeHtml(Notes)"></div>
                            </div>
                        </div>
                        <div class="udf-container">
                            <div>
                                <!-- ko foreach: userDefinedFields -->
                                <div class="row col-xs-12 location-udf-row" style="padding: 10px 0;">
                                    <div class="row col-xs-12 location-udf-sub-row">
                                        <div class="col-xs-6 col-sm-4 location-udf-cell" data-bind="text: vems.decodeHtml(Description)"></div>
                                        <div class="col-xs-6 col-sm-8 location-udf-cell" data-bind="text: IsDate ? moment(Value).format('l ddd') : vems.decodeHtml(Value)"></div>
                                    </div>

                                    <!-- ko foreach: Children -->
                                    <div class="row col-xs-12 location-udf-sub-row">
                                        <div class="col-xs-6 col-sm-4 location-udf-child-desc" data-bind="text: vems.decodeHtml(Description)"></div>
                                        <div class="col-xs-6 col-sm-8 location-udf-child" data-bind="text: IsDate ? moment(Value).format('l ddd') : vems.decodeHtml(Value)"></div>
                                    </div>
                                    <!-- /ko -->
                                </div>
                                <!-- /ko -->
                            </div>
                        </div>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="attachments" style="position: relative;">
                        <div id="res-attach-loading" class="events-loading-overlay">
	                        <img class="loading-animation" src="Images/Loading.gif"/>
                        </div>
                        <span id="reservation-attachments-header"><%= ScreenText.ReservationAttachments %></span>
                        <div id="attachments-container" data-bind="foreach: attachments ">
                            <div class="row" style="margin: 0;">
                                <div class="col-xs-12 col-md-6">
                                    <div class="attachment-row" style="width: 100%;">
                                        <a class="filename ellipsis-text" data-bind="text: name, attr: { 'data-id': Id, 'href': Link }"></a>
                                        <!-- ko if: AllowWebDelete -->
                                        <a class="attachment-delete" href="#" data-bind="click: function(){ $root.removeFile($data);}"><i class="fa fa-trash-o fa-3"></i></a>
                                        <!-- /ko -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div data-bind="visible: attachments && attachments().length <= 0"><%= ScreenText.NoAttachments %></div>
                        <div data-bind="visible: allowReservationEdit && AllowAttachments">
                        <div id="fileUploader"></div>
                            </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-3" id="reservation-actions-container" data-bind="visible: !viewOnly() && (reservationActions().length > 0 || reservationViewActions().length > 0)">
                <div class="reservation-summary-header"><%= ScreenText.ReservationTasks %></div>
                <div id="reservation-actions">
                    <div id="edit-actions" data-bind="foreach: reservationActions">
                        <div class="reservation-action">
                            <a class="reservation-action-link" data-bind="attr: { href: Link }, click: Description === vems.reservationSummary.cancelReservationText ? $root.cancelReservation : null">
                                <!-- ko if: Icon && Icon.length > 0 -->
                                <i data-bind="css: Icon"></i>
                                <!-- /ko -->
                                <span data-bind="text: Description"></span>
                            </a>
                        </div>
                    </div>
                    <div data-bind="foreach: reservationViewActions">
                        <div class="reservation-action">
                            <a class="reservation-action-link" data-bind="attr: { href: Link ? Link : '#', onclick: ClickAction}">
                                <!-- ko if: Icon && Icon.length > 0 -->
                                <i data-bind="css: Icon"></i>
                                <!-- /ko -->
                                <span data-bind="text: Description"></span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row" id="booking-container">
            <div class="col-xs-12 reservation-summary-header"><%= ScreenText.ReservationSummaryGridCaption %></div>
            <div>
                <ul id="booking-tabs" class="nav nav-tabs" role="tablist">
                    <li role="presentation" class="active"><a href="#bookings" aria-controls="bookings" role="tab" data-toggle="tab" data-type="0"><%= ScreenText.Current %></a></li>
                    <li role="presentation"><a href="#" aria-controls="past-bookings" role="tab" data-toggle="tab" data-type="1"><%= ScreenText.Past %></a></li>
                    <div class="summary-cancelled-checkbox">
                        <span class="include-cancelled-label">
                            <%= ScreenText.IncludeCancelledBookings %>
                        </span>
                        <span id="include-cancelled" class="include-cancelled-icon" role="checkbox" data-bind="click: toggleShowCancelled, checked: includeCancelledBookings">
                            <i data-bind="css: includeCancelledBookings() ? 'fa fa-check-square-o' : 'fa fa-square-o'"></i>
                        </span>
                    </div>
                </ul>
            </div>
            <div class="tab-content">
                <div role="tabpanel" class="tab-pane active" id="bookings">
                    <div class="row" id="booking-action-header">
                        <a id="cancel-bookings" data-bind="visible: cancelBookingsLink && cancelBookingsLink.length > 0, attr: { href: cancelBookingsLink }"><%= ScreenText.CancelBookings %></a>
                        <a id="booking-tools" data-bind="visible: multiEditBookingLink && multiEditBookingLink.length > 0, attr: { href: multiEditBookingLink }"><%= ScreenText.BookingTools %></a>
                        <a id="new-booking" class="btn btn-primary" role="button" data-bind="visible: addBookingLink && addBookingLink.length > 0, attr: { href: addBookingLink }"><%= ScreenText.NewBooking %></a>
                    </div>
                    <div class="row">
                        <div class="table-responsive" id="bookings-grid-container">
                            <table id="bookings-grid" class="table table-striped table-sort">
                                <thead>
                                    <tr>
                                        <%--<th style="display: none;"></th>--%>
                                        <th></th>
                                        <th></th>
                                        <th><%= ScreenText.Date %></th>
                                        <th><%= ScreenText.StartTime %></th>
                                        <th><%= ScreenText.EndTime %></th>
                                        <th><%= ScreenText.TimeZone %></th>
                                        <th><%= ScreenText.Location %></th>
                                        <th data-bind="visible: $root.reservation().VideoConference"><%= ScreenText.Host %></th>
                                        <th data-bind="if: !$root.serviceOnly() && ($root.setupTypeValidation() == 2 || $root.setupTypeValidation() == 3)"><%= ScreenText.Attendance %></th>
                                        <th data-bind="if: !$root.serviceOnly() && ($root.setupTypeValidation() == 2 || $root.setupTypeValidation() == 3)"><%= ScreenText.SetupType %></th>
                                        <th><%= ScreenText.Status %></th>
                                        <th style="display: none;">GMT</th>
                                    </tr>
                                </thead>
                                <tbody data-bind="template: {name: 'bookings-template', foreach: bookings()}">
                                </tbody>
                            </table>
                            <script type="text/html" id="bookings-template">
                                <tr data-bind="visible: $root.ShowBooking($data), css: { child: ExchangeChild || ($root.reservation().VideoConference && !IsHost()) }, attr: {'data-bookingid' : Id, 'data-vcgroupid' : VCUniqueId }">
                                    <%--<td style="display: none;" data-bind="text: VCUniqueId"></td>--%>
                                    <td class="table-action"><a href="#" class="fa fa-pencil"
                                        data-bind="visible: $root.isBookingEditable($data), click: $root.editFromGrid"></a></td>
                                    <td class="table-action"><a href="#" class="fa fa-minus-circle"
                                        data-bind="visible: $root.isBookingCancellable($data), click: (IsHost() && (OccurrenceCount > 1) && !IsExchange) ? $root.popVCHostWarning : $root.cancelFromGrid, css: {'grey-text': $root.reservation().VideoConference && IsHost() && (OccurrenceCount > 1) && !IsExchange}"></a></td>
                                    <td>
                                        <span data-bind="text: moment(TimeBookingStart).format('ddd ll'), css: { 'child-indent': ExchangeChild || ($root.reservation().VideoConference && !IsHost()) }"></span>
                                    </td>
                                    <td data-bind="text: moment(EventStart).format('LT')"></td>
                                    <td data-bind="text: moment(EventEnd).format('LT')"></td>
                                    <td data-bind="text: TimeZoneAbbreviation"></td>
                                    <td><a data-bind="text: vems.decodeHtml(Location), click: function(data){ vems.locationDetailsVM.show(data.BuildingId, data.RoomId); }" href="#"></a></td>
                                    <td data-bind="visible: $root.reservation().VideoConference" style="text-indent: 0;">
                                        <div class="checkbox">
                                            <label>
                                                <input type="checkbox" class="cart-host-check" data-bind="checked: IsHost, enable: CanEditBooking, attr: {'data-bookingid' : Id, 'data-vcgroupid' : VCUniqueId }">
                                            </label>
                                        </div>
                                    </td>
                                    <td class="setup-count" data-bind="if: !$root.serviceOnly() && ($root.setupTypeValidation() == 2 || $root.setupTypeValidation() == 3)">
                                        <!-- ko if: <%= HideSetupEditOnGrid.ToString().ToLower() %>  || InPast || StatusTypeId == -12 -->
                                        <span data-bind="text: SetupCount"></span>
                                        <!-- /ko -->
                                        <!-- ko if: !<%= HideSetupEditOnGrid.ToString().ToLower() %> && !InPast && StatusTypeId != -12 -->
                                        <input class="form-control attendance-edit" type="number" value="1" style="width: 80px" data-bind="textInput: SetupCount, event: { change: function (d, e) { $root.setupCountChangedFromGrid(e.currentTarget); } }, attr: { min: MinCapacity, max: Capacity, required: $root.setupTypeValidation() == 2 }" />
                                        <!-- /ko -->

                                    </td>
                                    <td class="setup-type" data-bind="if: !$root.serviceOnly() && ($root.setupTypeValidation() == 2 || $root.setupTypeValidation() == 3)">
                                        <!-- ko if: <%= HideSetupEditOnGrid.ToString().ToLower() %> || InPast || StatusTypeId == -12 -->
                                        <span data-bind="text: vems.decodeHtml(SetupType)"></span>
                                        <!-- /ko -->
                                        <!-- ko if: !<%= HideSetupEditOnGrid.ToString().ToLower() %> && !InPast && StatusTypeId != -12 -->
                                        <select class="form-control setupType-edit" data-bind="event: { change: $root.setupTypeChangedFromGrid }, options: SetupTypes, optionsText: function(st) { return vems.decodeHtml(st.Description); }, optionsValue: 'Id', value: SetupTypeId, attr: { required: $root.setupTypeValidation() == 2 }"></select>
                                        <!-- /ko -->
                                    </td>
                                    <td data-bind="text: vems.decodeHtml(Status)"></td>
                                    <td style="display: none;" data-bind="text: moment(GmtStartTime).valueOf()"></td>
                                </tr>
                                <!-- ko if: HasServices -->
                                <tr class="expand-child child" data-bind="visible: $root.ShowBooking($data), attr: {'data-bookingid' : Id, 'data-vcgroupid' : VCUniqueId }">
                                    <td colspan="99">
                                        <span class="booking-warning" data-bind="visible: IsConflict">
                                            <i class="fa fa-warning"></i>
                                            <span><%= ScreenText.WarningAltTag %></span>
                                        </span>
                                        <span class="service-buttons">
                                            <a href="#" data-bind="click: $root.loadServices"><%= ScreenText.ViewServices %></a>
                                            <!-- ko if: StatusTypeId != -12 -->
                                            <span data-bind="visible: ShowAddServices">| </span>
                                            <a href="#" data-bind="visible: ShowAddServices, click: $root.manageServices"><%= ScreenText.ManageServices %></a>
                                            <!-- /ko --> 
                                        </span>
                                    </td>
                                </tr>
                                <tr class="services-component-container expand-child" style="display: none;" data-bind="attr: {'data-bookingid' : Id, 'data-vcgroupid' : VCUniqueId }">
                                    <td colspan="99" data-bind="component: { name: 'summary-services-component', params: $root }"></td>
                                </tr>
                                <!-- /ko -->
                            </script>
                        </div>
                    </div>
                </div>
                <div role="tabpanel" class="tab-pane" id="past-bookings">
                </div>
            </div>
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
                        <p class="date"></p>
                        <p class="event-name"></p>
                        <p class="location"></p>
                        <div class="reason dropdown form-group" style="display: none;">
                            <label class="control-label" for="cancel-reason"><%= ScreenText.CancelReason %></label>
                            <select class="form-control required" name="cancel-reason" data-bind="foreach: cancelReasons, value: $root.defaultCancelReason">
                                <!-- ko if: $index() === 0 -->
                                <option value=""></option>
                                <!-- /ko -->
                                <option data-bind="text: vems.decodeHtml(CancelReason), value: ID, attr: { 'data-notes-required': RequireNotes }"></option>
                            </select>
                        </div>
                        <div class="notes form-group" style="display: none;">
                            <label class="control-label" for="cancel-notes"><%= ScreenText.CancelNotes %></label>
                            <textarea name="cancel-notes" class="form-control" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" id="cancel-btn-yes"></button>
                        <button type="button" class="btn btn-primary" id="cancel-btn-no" data-dismiss="modal"></button>
                    </div>
                </div>
            </div>
        </div>

        <!-- service availability modal -->
        <div class="modal fade" id="service-availability-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content" id="service-availability-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <Dea:HelpButton runat="server" ID="VEMSCategoryAvailabilityHelp" CssClass="floatRight" LookupKey="VEMSCategoryAvailabilityHelp" ParentType="WebTemplate" />
                        <h3 class="modal-title"><%= ScreenText.ServiceAvailability %></h3>
                    </div>
                    <div class="modal-body">
                        <div class="tt-scrollable" style="border: 2px solid lightgray; border-radius: 4px; padding: 10px; max-height: 350px;"
                            data-bind="foreach: serviceAvailability().Categories">
                            <section class="collapse-toggle">
                                <div data-bind="text: Category"></div>
                                <div style="margin-left: 10px" data-bind="text: TimeRestriction"></div>
                                <div style="margin-left: 10px" data-bind="visible: $data.CategoryBuildings().length > 0">
                                    <i class="indicator fa fa-caret-down"></i>
                                    <a href="#" data-toggle="collapse" data-bind="attr: {'href': '#buildings' + ID(), 'aria-controls': 'buildings'+ID()}" aria-expanded="false"><%= GetAvailableToBuildingsText%></a>
                                    <div data-bind="foreach: $data.CategoryBuildings, attr: {'id': 'buildings'+ID()}" class="collapse">
                                        <ul>
                                            <li style="margin-left: 10px" data-bind="text: Description"></li>
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="close-btn" data-dismiss="modal"><%= ScreenText.Close %></button>
                    </div>
                </div>
            </div>
        </div>
        <!-- VC Cancel modal -->
        <div class="modal fade" id="vc-cancel-warning-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div>
                    <div class="modal-body">
                        <%=Messages.CantCancelVideoConferenceHost %>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal"><%= ScreenText.Ok %></button>
                    </div>
                </div>
            </div>
        </div>

        <!-- send ICS modal -->
        <div class="modal fade" id="send-ics-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content" id="send-ics-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h3 class="modal-title"><%= ScreenText.SendInvitation %></h3>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="ics-email"><%= ScreenText.EmailAddress %></label>
                            <input type="email" class="form-control" id="ics-email" data-bind="event: { keyup: icsEmailKeyup }">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" id="send-ics-ok-btn" data-dismiss="modal" data-bind="click: sendIcs" disabled="disabled"><%= ScreenText.Send %></button>
                        <button type="button" class="btn btn-primary" id="send-ics-cancel-btn" data-dismiss="modal"><%= ScreenText.Cancel %></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- location details modal -->
    <div id="location-details-comp" data-bind='component: { name: "location-details-component", params: { } }'></div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/reservation-summary") %>
    <%= Scripts.Render("~/bundles/location-details-component") %>
    <script type="text/javascript">
        vems.reservationSummary.cancelReservationText = '<%= escapeQuotes(ScreenText.CancelReservation) %>';
        vems.reservationSummary.cancelBookingQuestionText = '<%= escapeQuotes(ScreenText.CancelBookingQuestion) %>';
        vems.reservationSummary.cancelReservationQuestionText = '<%= escapeQuotes(ScreenText.CancelReservationQuestion) %>';
        vems.reservationSummary.cancelReservationConfirmText = '<%= escapeQuotes(Messages.CancelReservationConfirmMessage) %>';
        vems.reservationSummary.yesCancelBookingText = '<%= escapeQuotes(ScreenText.YesCancel) %>';
        vems.reservationSummary.yesCancelReservationText = '<%= escapeQuotes(ScreenText.YesCancelReservation) %>';
        vems.reservationSummary.noCancelBookingText = '<%= escapeQuotes(ScreenText.NoCancel) %>';
        vems.reservationSummary.noCancelReservationText = '<%= escapeQuotes(ScreenText.NoCancelReservation) %>';
        vems.reservationSummary.AttachmentAddedText = '<%= escapeQuotes(Messages.AttachmentAdded) %>';
        vems.reservationSummary.AttachmentUploadErrorText = '<%= escapeQuotes(Messages.AttachmentUploadError) %>';
        var fileUploadErrMsg = vems.reservationSummary.AttachmentUploadErrorText + '  ' + '<%= escapeQuotes(Errors.FileExceedsSize) %>';

        vems.reservationSummary.viewServices = '<%= escapeQuotes(ScreenText.ViewServices) %>';
        vems.reservationSummary.hideServices = '<%= escapeQuotes(ScreenText.HideServices) %>';

        if (!DevExpress.devices.real().phone) { vems.toggleSideBar(); }  //force collapse of sidemenu in desktop view

        vems.reservationSummary.breadcrumbLabel = '<%= escapeQuotes(ScreenText.XBeginningY) %>';
        vems.reservationSummary.RoomCapacityViolationMessage = '<%= escapeQuotes(Messages.RoomHasAMinimumCapacityOfXPersonAndAMaximumOfY) %>';

        $(document).ready(function () {
            reservationSummaryModel = new reservationSummaryModel(<%= ViewModelData %>);
            reservationSummaryModel.setupTypeValidation(<%= SetupTypeValidation %>);
            ko.applyBindings(reservationSummaryModel, $('#reservation-summary')[0]);
            reservationSummaryModel.initialized = true;

            ko.applyBindings(null, $('#location-details-comp')[0]);

            $('#bookings-grid').tablesorter({
                sortForce: reservationSummaryModel.reservation().VideoConference ? [7,1] : [2,0],
                sortList: reservationSummaryModel.reservation().VideoConference ? [[11,0],[7,1]] : [[2,0]],
                headers: {
                    2: { sorter: 'moment-dates' },
                    7: { sorter: 'checkbox' },
                    8: { sorter: false },
                    9: { sorter: false }
                },
                cssChildRow: 'expand-child',
            });

            if(<%= ShowBookingEditedMessage.ToString().ToLower() %>)
               vems.showToasterMessage('', '<%= escapeQuotes(Messages.EditBookingSuccess) %>', 'success', 2000);

            if(<%= ShowBookingAddedMessage.ToString().ToLower() %>)
                vems.showToasterMessage('', '<%= escapeQuotes(Messages.AddBookingSuccess) %>', 'success', 2000);

            if(<%= ShowAttendeesUpdateMessage.ToString().ToLower() %>)
                vems.showToasterMessage('', '<%= escapeQuotes(Messages.AttendeeUpdatedSuccess) %>', 'success', 2000);

            if(<%= ShowServicesCancelledMessage.ToString().ToLower() %>)
                vems.showToasterMessage('', '<%= escapeQuotes(string.Format(Messages.CancelServicesSuccess, "<strong>" + CancelledServicesCount + " " + (CancelledServicesCount == 1 ? ScreenText.Booking : ScreenText.Bookings) + "</strong>")) %>', 'success', 2000);

            if(<%= ShowServicesAddedMessage.ToString().ToLower() %>)
                vems.showToasterMessage('', '<%= escapeQuotes(string.Format(Messages.AddServicesSuccessMessage, "<strong>" + AddedServicesCount + " " + (AddedServicesCount == 1 ? ScreenText.Booking : ScreenText.Bookings) + "</strong>")) %>', 'success', 2000);

            if(<%= showCheckinSuccess %> > 0)
                vems.showToasterMessage('', "<%= escapeQuotes(Messages.CheckinSuccessful) %>", 'success', 2147483647);

            if(<%= showCheckinUnavailable %> > 0)
                vems.showToasterMessage('', "<%= escapeQuotes(Messages.CheckinUnsuccessful) %>", 'danger', 2147483647);
            
            if (reservationSummaryModel.AllowAttachments()) {
                $("#fileUploader").dxFileUploader({
                    selectButtonText: '<%= escapeQuotes(ScreenText.SelectYourFiles) %>',
                    labelText: '<%= escapeQuotes(ScreenText.DragDropFiles) %>',
                    multiple: false,
                    accept: '*', //it will be verified on the server.
                    showFileList: false,
                    uploadMode: "instantly", //"instantly", useButtons
                    uploadUrl: "UploadHandler.ashx?attachmentType=1&parentId="+reservationSummaryModel.reservation().ReservationId+"&ParentTypeId=-42&auditName=" + "<%= WebUser.AuditName.Replace("'", "\'").Replace("\"", "\\\"") %>" + "&TemplateId="+reservationSummaryModel.TemplateId(),            
                    onUploaded: reservationSummaryModel.fileUploaded,  
                    onUploadError: reservationSummaryModel.fileUploadError,  
                    uploadFailedMessage: fileUploadErrMsg,
                    onValueChanged: function(e) {
                        $('#res-attach-loading').show();
                    }
                });
            }

            //if res is VC, disable New Booking button, only 1 host per Res allowed now
            //if (reservationSummaryModel.reservation().VideoConference){
            //    var f = $.grep(reservationSummaryModel.bookings(), function (c) {
            //        return (c.IsHost === true);
            //    });
            //    if ($.isArray(f) && f.length > 0) {
            //        $("#new-booking").hide();
            //    }                
            //}
        });

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

        $.tablesorter.addParser({
            id: 'checkbox',
            is: function (s) {
                return false;
            },
            format: function (s, table, cell) {
                return $(cell).find("input").prop('checked') ? 1 : 0;
            },
            type: 'numeric'
        });
    </script>
</asp:Content>
