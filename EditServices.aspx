<%@ Page Title="<%$Resources:PageTitles, BrowseReservations %>" Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" CodeBehind="EditServices.aspx.cs" Inherits="EditServices" EnableViewState="false" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" runat="Server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <div id="edit-services-container">
        <div class="row" id="breadcrumb">
            <div class="col-md-6 col-xs-6">
                <a data-bind="attr: { 'href': reservationSummaryUrl() }"><i class="fa fa-chevron-left"></i>&nbsp;
                    <span data-bind="html: breadcrumbText()"></span>
                </a>
                <span class="grey-text breadcrumb-text" data-bind="text: '(' + reservationId() + ')'"></span>
            </div>
            <Dea:HelpButton runat="server" ID="VEMSCategoryGroupsHelp" CssClass="floatRight" LookupKey="VEMSCategoryGroupsHelp" ParentType="WebTemplate" />
        </div>
        <div class="row booking-tools-banner">
            <div class="booking-tools-subheading"><%= ScreenText.ManageServices %></div>
            <button type="button" class="btn btn-primary" data-bind="click: function(){ window.location = reservationSummaryUrl(); }"><%= ScreenText.ReservationDetails %></button>
        </div>
        <div class="row" id="services-container">
            <div data-bind='component: { name: "booking-services-component", params: { 
    Services: services,
    ServiceOrders: serviceOrders,
    LoadServices: true,
    showNextStep: false,
    onSummaryAdd: vems.onSummaryAdd,
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
        <div class="row" id="additional-bookings-container" style="display: none;">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th data-bind="click: toggleAllBookings">
                            <i id="select-all-cb" class="fa fa-square-o cancel-bookings-cb"></i>
                        </th>
                        <th><%= ScreenText.Date %></th>
                        <th><%= ScreenText.Time %></th>
                        <th><%= ScreenText.Title %></th>
                        <th><%= ScreenText.Location %></th>
                        <th><%= ScreenText.Status %></th>
                        <th><%= ScreenText.Attendance %></th>
                    </tr>
                </thead>
                <tbody data-bind="foreach: additionalBookings">
                    <tr>
                        <td>
                            <i class="fa cancel-bookings-cb" data-bind="css: { 'fa-check-square-o': $root.selectedBookingIds.indexOf(Id) !== -1, 'fa-square-o':  $root.selectedBookingIds.indexOf(Id) === -1 }, click:  $root.toggleBookingSelection"></i>
                        </td>
                        <td data-bind="text: moment(Date).format('LL ddd')"></td>
                        <td>
                            <span data-bind="text: moment(StartTime).format('LT')"></span>
                            <span>- </span>
                            <span data-bind="text: moment(EndTime).format('LT')"></span>
                            <span data-bind="text: TimezoneAbbreviation"></span>
                        </td>
                        <td data-bind="text: vems.decodeHtml(EventName)"></td>
                        <td data-bind="text: vems.decodeHtml(LocationDisplay)"></td>
                        <td data-bind="text: vems.decodeHtml(Status)"></td>
                        <td data-bind="text: vems.decodeHtml(SetupCount)"></td>
                    </tr>
                </tbody>
            </table>
            <div class="row">
                <button class="btn btn-default" style="float: right; margin-right: 20px;" id="apply-to-additional-btn" data-bind="enable: selectedBookingIds().length > 0, click: addToAdditionalBookings"><%= ScreenText.Save %></button>
            </div>
        </div>
          <div class="row" id="additional-so-container" style="display: none;">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th data-bind="click: toggleAllServiceOrders">
                            <i id="select-all-so-cb" class="fa fa-square-o cancel-bookings-cb"></i>
                        </th>
                        <th><%= ScreenText.Date %></th>
                        <th><%= ScreenText.ServiceStart %></th>
                        <th><%= ScreenText.ServiceEnd %></th>
                        <th><%= ScreenText.Location %></th>
                        <th><%= ScreenText.CategoryLabel %></th>
                        <th><%= ScreenText.ServiceType %></th>
                    </tr>
                </thead>
                <tbody data-bind="foreach: additionalServiceOrders">
                    <tr>
                        <td>
                            <i class="fa cancel-bookings-cb" data-bind="css: { 'fa-check-square-o': $root.selectedServiceOrderIds.indexOf(Id) !== -1, 'fa-square-o':  $root.selectedServiceOrderIds.indexOf(Id) === -1 }, click:  $root.toggleServiceOrderSelection"></i>
                        </td>
                        <td data-bind="text: moment(Date).format('LL ddd')"></td>
                        <td data-bind="text: moment(TimeStart).year() == 1 ? '' : moment(TimeStart).format('LT')"></td>
                        <td data-bind="text: moment(TimeEnd).year() == 1 ? '' : moment(TimeEnd).format('LT')"></td>
                        <td data-bind="text: vems.decodeHtml(Location)"></td>
                        <td data-bind="text: vems.decodeHtml(Category)"></td>
                        <td data-bind="text: vems.decodeHtml(Service)"></td>
                    </tr>
                </tbody>
            </table>
            <div class="row">
                <button class="btn btn-default" style="float: right; margin-right: 20px;" id="apply-to-additional-so-btn" data-bind="enable: selectedServiceOrderIds().length > 0, click: addToAdditionalServiceOrders"><%= ScreenText.Save %></button>
            </div>
        </div>
        <!-- confirmation modal -->
        <div class="modal fade" id="confirm-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content" id="confirm-modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h3 class="modal-title"><%= ScreenText.ApplyToAdditionalBookings %></h3>
                    </div>
                    <div class="modal-body">
                        <span><%= Messages.ApplyToAdditionalBookingsMessage %></span>
                        <div style="margin-top: 10px;" data-bind="visible: additionalBookingExclusions().length > 0">
                            <label><%= Messages.ResourcesExcludedFromRooms %>:</label>
                            <div data-bind="foreach: additionalBookingExclusions">
                                <div data-bind="html: Location"></div>
                                <ul data-bind="foreach: Resources">
                                    <li data-bind="html: Description"></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" id="confirm-btn-yes" data-bind="click: showAdditionalContent"><%= ScreenText.Yes %></button>
                        <button type="button" class="btn btn-primary" id="confirm-btn-no" data-dismiss="modal"><%= ScreenText.No %></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/typeahead") %>
    <%= Scripts.Render("~/bundles/user-defined-fields") %>
    <%= Scripts.Render("~/bundles/edit-services") %>
    <script type="text/javascript">
        vems.browse = vems.browse || {};
        vems.screentext.successMessage = '<%= escapeQuotes(Messages.Success) %>';
        vems.browse.addRemoveLabel = "<%= escapeQuotes(ScreenText.AddRemove) %>";
        vems.browse.ResourcesExcludedFromRooms = "<%= escapeQuotes(Messages.ResourcesExcludedFromRooms) %>";

        //BR/PO screentext
        vems.screentext.BRPOScreenText = {
            ScreenText: {
                NoMatchingResults: "<%= escapeQuotes(ScreenText.NoMatchingItems) %>",
                PONumberText: "<%= escapeQuotes(EmsParameters.PONumberTitle) %>",
                DescriptionText: "<%= escapeQuotes(ScreenText.Description) %>",
                NotesText: "<%= escapeQuotes(ScreenText.Notes) %>",
                BillingReferenceText: "<%= escapeQuotes(EmsParameters.BillingReferenceTitleSingular) %>"
            }
        };

        $(document).ready(function () {
            //force collapse of sidemenu in desktop view
            if (!DevExpress.devices.real().phone) {
                $('#wrapper').css('padding-left', 0);
                vems.toggleSideBar();
            }

            vems.editServicesVM = new editServicesViewModel(<%= PageData %>);

            ko.applyBindings(vems.editServicesVM, $('#edit-services-container')[0]);

            vems.bookingServicesVM.billingReference = vems.editServicesVM.data.BillingReference;
            vems.bookingServicesVM.poNumber = vems.editServicesVM.data.PONumber;
        });

        vems.onSummaryAdd = function(category, resource){
            vems.editServicesVM.updateServices();
        };

        vems.bookingServicesAfterRender = function(){
            if (vems.editServicesVM.data.ShowBillingReferenceLookup) {
                $(".billingReference-input").BillingRefLookup({
                    ScreenText: vems.screentext.BRPOScreenText.ScreenText,
                    value: vems.editServicesVM.data.BillingReference,
                    callBack: function (data) {
                        vems.bookingServicesVM.billingReference(data.BillingReference);
                    }
                });
            } else {
                $(".billingReference-input").parent().find(".input-icon-embed").hide();
            }

            if (vems.editServicesVM.data.ShowPoNumberLookup) {
                $(".PONumber-input").poLookup({
                    ScreenText:  vems.screentext.BRPOScreenText.ScreenText,
                    value:  vems.editServicesVM.data.PONumber,
                    callBack: function (data) {
                        vems.bookingServicesVM.poNumber(data.PONumber);
                    }
                });
            } else {
                $(".PONumber-input").parent().find(".input-icon-embed").hide();
            }

            for (var i = 0; i < vems.bookingServicesVM.serviceOrders().length; i++) {
                var categoryObjs = $.grep(vems.bookingServicesVM.Services().AvailableCategories(), function(val){
                    return val.CategoryId() == vems.bookingServicesVM.serviceOrders()[i].CategoryId() 
                        && val.InstanceCount() == vems.bookingServicesVM.serviceOrders()[i].InstanceCount();
                });

                if(categoryObjs.length > 0){
                    categoryObjs[0].ServiceStartTime(vems.bookingServicesVM.serviceOrders()[i].TimeStart());
                    categoryObjs[0].ServiceEndTime(vems.bookingServicesVM.serviceOrders()[i].TimeEnd());
                    vems.bookingServicesVM.serviceOrders()[i].CategoryObj(categoryObjs[0]);
                    vems.bookingServicesVM.hideCategoryEditButtons(categoryObjs[0]);
                }                
            }

            vems.bookingServicesVM.billingReference(vems.editServicesVM.data.BillingReference);
            vems.bookingServicesVM.poNumber(vems.editServicesVM.data.PONumber);
        };
    </script>
</asp:Content>
