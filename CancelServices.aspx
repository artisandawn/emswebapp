<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="CancelServices" Title="<%$Resources:PageTitles, BrowseReservations %>" Codebehind="CancelServices.aspx.cs" %>

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
    <div id="cancel-services">
        <div class="row" id="breadcrumb">
            <a class="clickable" data-bind="attr: { href: breadcrumbLink }">
                <i class="fa fa-chevron-left"></i>
                <span data-bind="text: ' ' + vems.decodeHtml(eventName()) + ' (' + reservationId() + ')'"></span>
            </a>
             <Dea:HelpButton runat="server" ID="VEMSCancelServicesHelp" CssClass="floatRight" LookupKey="VEMSCancelServicesHelp" ParentType="WebTemplate" />
        </div>
        <div class="row booking-tools-banner">
            <div class="booking-tools-subheading"><%= ScreenText.CancelServices %></div>
            <button id="booking-tools-update-btn" role="button" class="btn btn-primary" data-bind="click: cancelSelectedServices, enable: valid">
                <%= ScreenText.CancelServices %>
            </button>
        </div>
        <div class="row booking-tools-section">
            <div class="col-xs-12">
                <div class="row form-group cancel-services-ddl-section">
                    <span class="category-dropdown-label"><%= ScreenText.CancelServicesCategoryLabel %></span>
                    <select class="form-control category-dropdown" data-bind="options: serviceCategories, optionsText: 'Value', optionsValue: 'Key', value: serviceCategoryId, optionsCaption: '', event: { change: populateBookingList }"></select>
                </div>
            </div>
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
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.BookingTime %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.TimeZone %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.Location %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular) %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= string.Format(ScreenText.EventType, EmsParameters.EventsTitleSingular) %></div></th>
                            <th><div class="cancel-bookings-sort-header"><%= ScreenText.ServiceTime %></div></th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- ko if: bookingList().length > 0 -->
                        <!-- ko foreach: bookingList -->
                        <tr>
                            <td>
                                <i class="fa cancel-bookings-cb" data-bind="css: { 'fa-check-square-o': $root.selectedServiceOrderIds.indexOf(ServiceOrderId()) !== -1, 'fa-square-o': $root.selectedServiceOrderIds.indexOf(ServiceOrderId()) === -1 }, click: $root.toggleBookingSelection"></i>
                            </td>
                            <td data-bind="text: moment(EventStart()).format('ddd ll')"></td>
                            <td data-bind="text: moment(EventStart()).format('LT') + ' - ' + moment(EventEnd()).format('LT')"></td>
                            <td data-bind="text: vems.decodeHtml(TimeZone())"></td>
                            <td><a data-bind="text: vems.decodeHtml(Location()), attr: { href: LocationLink }"></a></td>
                            <td data-bind="text: vems.decodeHtml(EventName())"></td>
                            <td data-bind="text: vems.decodeHtml(EventType())"></td>
                            <td>
                                <!-- ko if: moment(ServiceStartTime()).year() > 1 -->
                                <span data-bind="text: moment(ServiceStartTime()).format('LT') + ' - ' + moment(ServiceEndTime()).format('LT')"></span>
                                <!-- /ko -->
                            </td>
                        </tr>
                        <!-- /ko -->
                        <!-- /ko -->
                        <!-- ko ifnot: bookingList().length > 0 -->
                        <tr>
                            <td colspan="8" class="no-bookings-message"><%= ScreenText.CancelServicesEmptyData %></td>
                        </tr>
                        <!-- /ko -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/cancel-services") %>
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
            vems.reservationSummary.cancelServicesViewModel = new vems.reservationSummary.cancelServicesVM(data);
            ko.applyBindings(vems.reservationSummary.cancelServicesViewModel, $("#cancel-services")[0]);

            $('#bookings-grid').tablesorter({
                sortList: [[1, 0]],
                headers: {
                    0: { sorter: false },
                    1: { sorter: 'moment-dates' }
                }
            });

            vems.reservationSummary.bookingListFailureMessage = '<%= Messages.FailedToRetrieveBookings %>';
        });
    </script>
</asp:Content>
