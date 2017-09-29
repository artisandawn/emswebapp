<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="EditServiceOnlyBooking" Title="<%$Resources:PageTitles, EditServiceOnlyBooking %>" CodeBehind="EditServiceOnlyBooking.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" runat="Server">
    <style>
        .booking-tools-banner {
            margin-bottom: 0;
        }

        #field-container {
            padding-left: 0;
            padding-right: 0;
            border: 2px solid #fafafa;
            width: 310px;
        }

        .date-container {
            margin-top: 0 !important;
        }

        .time-container {
            height: 90px;
        }

        .service-order-container {
            border: none !important;
        }

        .category-head, .summary-service-table {
            width: 100% !important;
        }

        #date-time-collapse{
             padding-left: 0;
            padding-right: 0;
        }
        #filter-result-row .panel-heading {
            font-weight: normal;
            font-size: 16px;
            color: #333 !important;
            background-color: #f5f5f5 !important;
            border-color: #ddd !important;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <div id="service-only-edit-container">
        <div class="row" id="breadcrumb">
            <div class="col-md-6 col-xs-6">
                <a data-bind="attr: { 'href': reservationSummaryUrl() }"><i class="fa fa-chevron-left"></i>&nbsp;
                <span data-bind="html: breadcrumbText()"></span></a>
                <span class="grey-text" data-bind="text: '(' + reservationId() + ')'"></span>
            </div>
            <div class="col-md-6  hidden-xs">
                 <Dea:HelpButton runat="server" ID="VEMSEditServiceOnlyBooking" CssClass="floatRight" LookupKey="VEMSEditServiceOnlyBooking" ParentType="WebTemplate" />
            </div>
        </div>
        <div class="row booking-tools-banner">
            <div class="booking-tools-subheading"><%= ScreenText.EditBooking %></div>
            <button type="button" class="btn btn-primary" data-bind="click: updateBooking"><%= ScreenText.UpdateBooking %></button>
        </div>
        <div class="row">
            <div class="col-md-4" id="field-container">
                <div id="bookings">
                    <div id="filter-result-row">
                        <div class="panel panel-default">
                            <div class="panel-heading"><%= ScreenText.BookingInformation %></div>
                            <div class="panel-body">
                                <div class="form-group">
                                    <label for="event-name"><%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular) %></label>
                                    <input type="text" class="form-control" id="event-name" data-bind="textinput: eventName">
                                </div>
                                <div class="form-group">
                                    <label for="event-type"><%= string.Format(ScreenText.EventType, EmsParameters.EventsTitleSingular) %></label>
                                    <select class="form-control" id="event-type" data-bind="value: eventType, options: eventTypes, optionsText: function(item){ return vems.decodeHtml(item.Description); }, optionsValue: 'Id'"></select>
                                </div>
                            </div>
                        </div>

                        <div class="panel panel-default" id="date-time-filters">
                            <div class="panel-heading" role="tab" id="date-time-filters-header">
                                <h4 class="panel-title">
                                    <%= ScreenText.DateAndTime %>
                                </h4>
                            </div>
                            <div class="panel-body" id="date-time-collapse">
                                <div class="date-container">
                                    <div style="float: left;">
                                        <%= ScreenText.Date %>
                                        <div class='date input-group' id="booking-date" data-bind="datePicker: date, datepickerOptions: { format: 'ddd L', minDate: templateRules().FirstAllowedBookingDate, maxDate: templateRules().LastAllowedBookingDate }">
                                            <input type='text' class='form-control' />
                                            <span class="input-group-addon"><span class="fa fa-calendar"></span></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="time-container">
                                    <div style="float: left;">
                                        <%= ScreenText.StartTime %>
                                        <div class='date input-group' id="booking-start" data-bind="timePicker: start, datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %>}">
                                            <input type='text' class='form-control' />
                                            <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>
                                        </div>
                                    </div>
                                    <div class="end-container" style="float: right; margin-right: 5px;">
                                        <%= ScreenText.EndTime %>
                                        <div class='date input-group' id="booking-end" data-bind="timePicker: end, datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %>}">
                                            <input type='text' class='form-control' />
                                            <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>
                                        </div>
                                        <div class="next-day-indicator" data-bind="visible: end().hour() < start().hour()">
                                            <span><%= ScreenText.EndsNextDayIndicator %></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="panel panel-default">
                            <div class="panel-heading"><%= ScreenText.LocationDetails %></div>
                            <div class="panel-body">
                                <div class="form-group">
                                    <label for="location" class="required"><%= ScreenText.Location %></label>
                                    <input type="text" class="form-control" id="location" data-bind="textInput: vems.decodeHtml(location())" required="required">
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
            <div class="col-md-8" id="data-container">
                <div id="booking-container">
                    <div class="services-component-container">
                        <div data-bind="component: { name: 'summary-services-component', params: $root }"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/edit-service-only") %>
    <script type="text/javascript">
        vems.screentext.IsRequiredMessage = '<%= escapeQuotes(Messages.IsRequiredFormat) %>';
        vems.screentext.DateAndTimeAreRequired = '<%= escapeQuotes(Messages.DateAndTimeAreRequired) %>';

        $(document).ready(function(){
            //force collapse of sidemenu in desktop view
            if (!DevExpress.devices.real().phone) { 
                $('#wrapper').css('padding-left', 0);
                vems.toggleSideBar();
            } 

            var vm = new editServiceOnlyViewModel(<%= PageData %>);

            ko.applyBindings(vm, $('#service-only-edit-container')[0]);
        });
    </script>
</asp:Content>
