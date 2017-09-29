<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="AddServices" Title="<%$Resources:PageTitles, BrowseReservations %>" EnableViewState="false" Codebehind="AddServices.aspx.cs" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<asp:Content ID="headContent" runat="server" ContentPlaceHolderID="headContentHolder"></asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <div id="add-services">
        <div class="row" id="breadcrumb">
            <!-- ko if: pageMode() === AddServicesPageModes.ServiceSelection || pageMode() === AddServicesPageModes.AddResults -->
            <a class="clickable" data-bind="attr: { href: breadcrumbLink }">
                <i class="fa fa-chevron-left"></i>
                <span data-bind="text: ' ' + vems.decodeHtml(eventName())"></span>
            </a>
            <span class="grey-text breadcrumb-text" data-bind="text: ' (' + reservationId() + ')'"></span>
            <!-- /ko -->
            <!-- ko if: pageMode() === AddServicesPageModes.BookingSelection -->
            <a class="clickable" data-bind="click: prevStep">
                <i class="fa fa-chevron-left"></i>
                <span><%= ScreenText.SelectServices %></span>
            </a>
            <span class="grey-text breadcrumb-text">&nbsp;/&nbsp;</span>
            <span class="breadcrumb-text" data-bind="text: vems.decodeHtml(eventName())"></span>
            <span class="grey-text breadcrumb-text" data-bind="text: ' (' + reservationId() + ')'"></span>
            <!-- /ko -->
            <Dea:HelpButton runat="server" ID="VEMSCategoryGroupsHelp" CssClass="floatRight" LookupKey="VEMSCategoryGroupsHelp" ParentType="WebTemplate" />
        </div>
        <div class="row booking-tools-banner" style="margin-bottom:0;">
            <!-- ko if: pageMode() === AddServicesPageModes.ServiceSelection -->
            <div class="booking-tools-subheading"><%= ScreenText.SelectServices %></div>
            <button id="add-services-next-btn" role="button" class="btn btn-primary" data-bind="click: nextStep, enable: serviceOrdersValid">
                <%= ScreenText.NextStep %>
            </button>
            <!-- /ko -->
            <!-- ko if: pageMode() === AddServicesPageModes.BookingSelection -->
            <div class="booking-tools-subheading"><%= ScreenText.AddServices %></div>
            <button id="add-services-add-btn" role="button" class="btn btn-primary" data-bind="click: addServicesToBookings, enable: bookingsValid">
                <%= ScreenText.AddServices %>
            </button>
            <!-- /ko -->
            <!-- ko if: pageMode() === AddServicesPageModes.AddResults -->
            <div class="booking-tools-subheading"><%= ScreenText.AddServices %></div>
            <button id="add-services-res-details-btn" role="button" class="btn btn-primary" data-bind="click: navToResSummary">
                <%= ScreenText.ReservationDetails %>
            </button>
            <!-- /ko -->
        </div>
        <div class="row booking-tools-section" data-bind="visible: pageMode() === AddServicesPageModes.ServiceSelection">
            <div data-bind='component: { name: "booking-services-component", params: { 
                Services: services,
                ServiceOrders: serviceOrders,
                LoadServices: true,
                BillingReferenceField: billingReference,
                PONumberField: poNumber,
                showNextStep: true,
                onNavToNextStep: nextStep,
                onServicesLoaded: toggleCategoryLocks,
                startDateTime: defaultStartTime(),
                endDateTime: defaultEndTime(),
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
        <!-- ko if: pageMode() === AddServicesPageModes.BookingSelection || pageMode() === AddServicesPageModes.AddResults -->
        <div class="row booking-tools-section grid-section">
             <div class="table-responsive" id="bookings-grid-container">
                <table id="bookings-grid" class="table table-striped table-sort">
                    <thead>
                        <tr>
                            <th data-bind="click: toggleAllBookings">
                                <i id="select-all-cb" class="fa fa-square-o cancel-bookings-cb" data-bind="visible: pageMode() !== AddServicesPageModes.AddResults"></i>
                            </th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.Date %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.BookingTime %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.TimeZone %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.Location %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular) %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= string.Format(ScreenText.EventType, EmsParameters.EventsTitleSingular) %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.ResultTableHeading %></div></th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- ko if: filteredBookingList().length > 0 -->
                        <!-- ko foreach: filteredBookingList -->
                        <tr>
                            <td>
                                <i class="fa cancel-bookings-cb" data-bind="css: { 'fa-check-square-o': $root.selectedBookingIds.indexOf(Id()) !== -1, 'fa-square-o': $root.selectedBookingIds.indexOf(Id()) === -1 }, click: $root.toggleBookingSelection, visible: $root.pageMode() !== AddServicesPageModes.AddResults"></i>
                            </td>
                            <td data-bind="text: moment(EventStart()).format('ddd ll')"></td>
                            <td data-bind="text: moment(EventStart()).format('LT') + ' - ' + moment(EventEnd()).format('LT')"></td>
                            <td data-bind="text: vems.decodeHtml(TimeZone())"></td>
                            <td><a data-bind="text: vems.decodeHtml(Location()), attr: { href: LocationLink }"></a></td>
                            <td data-bind="text: vems.decodeHtml(EventName())"></td>
                            <td data-bind="text: vems.decodeHtml(EventType())"></td>
                            <td><span data-bind="text: vems.decodeHtml(Results()), style: { color: Changed() ? '#000' : 'red' }"></span></td>
                        </tr>
                        <!-- /ko -->
                        <!-- /ko -->
                        <!-- ko ifnot: filteredBookingList().length > 0 -->
                        <tr>
                            <td colspan="8" class="no-bookings-message"><%= ScreenText.AddServicesNoBookings %></td>
                        </tr>
                        <!-- /ko -->
                    </tbody>
                </table>
            </div>
        </div>
        <!-- /ko -->        
    </div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/typeahead") %>
    <%= Scripts.Render("~/bundles/add-services") %>
    <%= Scripts.Render("~/bundles/user-defined-fields") %>
    <script type="text/javascript">
        vems.browse = vems.browse || {};
        vems.reservationSummary.servicesAddedText = '<%= escapeQuotes(Messages.AddServicesSuccess) %>';
        vems.browse.addRemoveLabel = "<%= escapeQuotes(ScreenText.AddRemove) %>";
        vems.browse.ResourceExcludedFromRoom = "<%= escapeQuotes(Messages.ResourceExcludedFromRoom) %>";

        //BR/PO screentext
        vems.screentext = vems.screentext ? vems.screentext : {};
        vems.screentext.BRPOScreenText = {
            ScreenText: {
                NoMatchingResults: "<%= escapeQuotes(ScreenText.NoMatchingItems) %>",
                PONumberText: "<%= escapeQuotes(EmsParameters.PONumberTitle) %>",
                DescriptionText: "<%= escapeQuotes(ScreenText.Description) %>",
                NotesText: "<%= escapeQuotes(ScreenText.Notes) %>",
                BillingReferenceText: "<%= escapeQuotes(EmsParameters.BillingReferenceTitleSingular) %>"
            }
        };

        if (!DevExpress.devices.real().phone) {  // force collapse of sidemenu in desktop view
            $('#wrapper').css('padding-left', 0);
            vems.toggleSideBar();
        }

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
            vems.reservationSummary.addServicesViewModel = new vems.reservationSummary.addServicesVM(data);
            ko.applyBindings(vems.reservationSummary.addServicesViewModel, $("#add-services")[0]);

            vems.bookingServicesVM.billingReference = vems.reservationSummary.addServicesViewModel.billingReference;
            vems.bookingServicesVM.poNumber = vems.reservationSummary.addServicesViewModel.poNumber;

            $('#bookings-grid').tablesorter({
                sortList: [[1, 0]],
                headers: {
                    0: { sorter: false },
                    1: { sorter: 'moment-dates' }
                }
            });

            vems.bookingServicesAfterRender = function(){
                if (vems.reservationSummary.addServicesViewModel.showBillingReferenceLookup()) {
                    $(".billingReference-input").BillingRefLookup({
                        ScreenText: vems.screentext.BRPOScreenText.ScreenText,
                        value: vems.reservationSummary.addServicesViewModel.billingReference(),
                        callBack: function (data) {
                            vems.bookingServicesVM.billingReference(data.BillingReference);
                        }
                    });
                } else {
                    $(".billingReference-input").parent().find(".input-icon-embed").hide();
                }

                if (vems.reservationSummary.addServicesViewModel.showPONumberLookup()) {
                    $(".PONumber-input").poLookup({
                        ScreenText:  vems.screentext.BRPOScreenText.ScreenText,
                        value:  vems.reservationSummary.addServicesViewModel.poNumber(),
                        callBack: function (data) {
                            vems.bookingServicesVM.poNumber(data.PONumber);
                        }
                    });
                } else {
                    $(".PONumber-input").parent().find(".input-icon-embed").hide();
                }

                //this stupid little hack is for Safari's rendering engine.
                $('.input-icon-embed').css('position', 'static');
                setTimeout(function () {
                    $('.input-icon-embed').css('position', 'absolute');
                }, 50);

            };
        });
    </script>
</asp:Content>