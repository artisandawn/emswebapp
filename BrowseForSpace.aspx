<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="BrowseForSpace" Title="<%$Resources:PageTitles, BrowseForSpace %>" EnableViewState="false" CodeBehind="BrowseForSpace.aspx.cs" %>

<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="headContent" runat="server" ContentPlaceHolderID="headContentHolder">
    <%# Styles.Render("~/Content/plugin/book-grid") %>
    <%# Styles.Render("~/Content/dynamic-filters") %>
    <style>
        body {
            background-color: #F8F8F2 !important;
        }

        #locationsContainer {
            background-color: #fff;
            margin-top: 15px;
            border-radius: 2px;
            padding-bottom: 18px;
        }

        #dateHeader {
            color: #53585F;
            font-size: 20px;
            height: 34px;
            line-height: 34px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .column-container {
            width: 235px !important;
        }

        .building-row.grid-row {
            margin-left: 200px !important;
        }

        .help-text-icon {
            padding: 5px 10px 0 0;
        }

        #book-grid-container {
            margin-right: -15px;
        }
    </style>
</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">

    <div class="row" id="filterContainer">
        <div class="row">
            <div class="col-sm-12">
                <Dea:HelpButton runat="server" ID="VEMSBrowseForSpaceHelp" CssClass="floatRight" LookupKey="VEMSBrowseForSpaceHelp" ParentType="None" />
            </div>
        </div>
    </div>

    <div class="row" id="locationsContainer">
        <div class="col-md-12">
            <h2><%= ScreenText.Locations %></h2>
        </div>
        <div >
            <div style="float: left; margin-left: 10px;">
                <button class="btn btn-default btn-main" type="button" id="previousDayBtn">
                    <i class="fa fa-chevron-left"></i>
                    <span></span>

                </button>
            </div>
            <div style="float: left; margin:0 10px;">
                <div id="dateHeader">
                    <span></span>
                    <span></span>
                </div>
            </div>

            <div style="float: left;">
                <button class="btn btn-default btn-main" type="button" id="nextDayBtn">
                    <span></span>
                    <i class="fa fa-chevron-right"></i>

                </button>
            </div>
            <div style="float: left; margin-left: 5px;">
                <button class="btn btn-default btn-main" type="button" id="todayBtn" style="display: none;">
                    <span><%= ScreenText.Today %></span>
                </button>
            </div>
            <div id="list-room-filter" style="float: right; white-space: nowrap; padding-bottom: 10px;">
                <div class="row">
                    <div class="col-xs-8" style="padding-right: 0px;">
                        <input type="text" style="width: 100%" class="form-control" id="find-a-room-filter" placeholder="<%= string.Format(ScreenText.FindARoom, EmsParameters.RoomTitleSingular) %>">
                    </div>
                    <div class="col-xs-4">
                        <button id="find-a-room-filter-btn" style="margin-right: 15px; width: 95%;" class="btn btn-primary" type="button"><%= ScreenText.Search %></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="book-grid-container"></div>

    <div id="filter-container-mobile" class="row mobile-container" style="display: none;">
        <!-- browse locations -->
        <div class="row col-xs-12" id="locations-filter-mobile"></div>

        <!-- room availability -->
        <div class="row" id="room-avail-filter-mobile" style="display: none;">
            <div class="row mobile-row mobile-filter-row">
                <div class="col-xs-6 mobile-ellipsis-text mobile-filter-left">
                    <a role="button" href="#" onclick="vems.browse.showMobileLocations(); return false;"><%= ScreenText.Back %></a>&nbsp;&gt;
                    <a data-bind="attr: { href: room().LocationLink }, text: vems.decodeHtml(room().DisplayText)"></a>
                </div>
                <div class="col-xs-6 mobile-filter-right">
                    <%= ScreenText.TimeZone %>&nbsp;
                    <select id="room-avail-tz-mobile" data-bind="options: timezones, optionsText: 'TimeZone', optionsValue: 'TimeZoneID', value: timezoneId, event: { change: function() {vems.browse.buildMobileRoomAvailGrid(); return false;} }"></select>
                </div>
            </div>
            <div class="row mobile-row">
                <div class="col-xs-12 mobile-ellipsis-text">
                    <button id="prev-day-btn-mobile" class="mobile-button" onclick="vems.browse.incrementDate(-1); return false;">
                        <span class="mobile-button-content" data-bind="html: prevBtnHtml"></span>
                    </button>
                    <button id="next-day-btn-mobile" class="mobile-button" onclick="vems.browse.incrementDate(1); return false;">
                        <span class="mobile-button-content" data-bind="html: nextBtnHtml"></span>
                    </button>
                    <span id="today-span-mobile" data-bind="text: todayText"></span>
                </div>
            </div>
        </div>
    </div>

    <div id="grid-container-mobile" class="row mobile-container" style="display: none;">
        <!-- browse locations -->
        <div id="locations-grid-mobile" class="booking-grid">
            <div class="row col-xs-12 mobile-grid-title">
                <h2>Locations</h2>
            </div>
            <div class="row col-xs-12" id="mobile-grid-room-search">
            </div>
            <div id="locations-grid-mobile-content" class="col-xs-12 mobile-grid-content"></div>
        </div>

        <!-- room availability -->
        <div id="room-avail-grid-mobile" class="row" style="display: none;">
            <div id="room-avail-grid-mobile-content" class="mobile-row mobile-grid-content"></div>
        </div>
    </div>

    <!-- location details modal -->
    <div id="location-details-comp" data-bind='component: { name: "location-details-component", params: { } }'>
    </div>

    <div id="reservation-modal" class="modal" role="dialog" aria-labelledby="reservation-modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" aria-label="Close" id="reservation-modal-close-icon"><span aria-hidden="true">&times;</span></button>
                    <h3 class="modal-title" id="reservation-modal-title"><%= Messages.CreateANewReservation%></h3>
                </div>
                <div class="modal-body">
                    <h4 class="date-message"></h4>
                    <div class="form-group">
                        <label class="control-label col-sm-2"><%= ScreenText.StartTime %></label>
                        <div class="date input-group col-sm-3" id="reservation-modal-start">
                            <input type='text' class='form-control' />
                            <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>

                        </div>
                        <div class="col-sm-2"></div>
                        <label id="reservation-modal-start-error" class="error col-sm-10" for="reservation-modal-start" style="display: none;"></label>
                    </div>
                    <div class="form-group">
                        <label class="control-label col-sm-2"><%= ScreenText.EndTime %></label>
                        <div class='date input-group col-sm-3' id="reservation-modal-end">
                            <input type='text' class='form-control' />
                            <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>
                        </div>
                        <div class="col-sm-2"></div>
                        <label id="reservation-modal-end-error" class="error col-sm-10" for="reservation-modal-start" style="display: none;"></label>
                    </div>
                    <div class="form-group" style="margin-bottom: 30px;">
                        <label class="control-label col-sm-2"><%= ScreenText.Template %></label>
                        <select id="reservation-modal-template" class="form-control col-sm-10" style="width: 250px;"></select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="reservation-modal-continue"><%= ScreenText.Continue %></button>
                    <button type="button" class="btn btn-default" data-dismiss="modal" id="reservation-modal-cancel"><%= ScreenText.Cancel %></button>
                </div>
            </div>
        </div>
    </div>

    <div id="booking-details-container" data-bind='component: { name: "booking-details-component", params: { ScreenText: {
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

</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/browse-for-space") %>
    <%= Scripts.Render("~/bundles/booking-details") %>
    <%= Scripts.Render("~/bundles/location-details-component") %>

    <script type="text/javascript">
        vems.browse.capLabel = '<%= escapeQuotes(ScreenText.Cap) %>';
        vems.browse.closedLabel = '<%= escapeQuotes(ScreenText.Closed) %>';
        vems.browse.inLabel = '<%= escapeQuotes(ScreenText.In) %>';
        vems.browse.pleaseSelectALabel = '<%= escapeQuotes(Messages.PleaseSelectA) %>';
        vems.browse.endBeforeStartLabel =  '<%= escapeQuotes(Messages.ReservationEndTimeCannotBeBeforeStartTime) %>';
        vems.browse.startCannotBeBeforeCurrntTime = '<%= escapeQuotes(Messages.ReservationStartTimeCannotBeBeforeCurrentTime) %>';

        vems.browse.bookGridData = <%= EventGridJSON %>;
        vems.browse.filterModel = <%= FilterJSON %>;
        vems.browse.startHour = <%= EmsParameters.BookStartTime.Hours %>;

        vems.browse.timeZones = <%= TimeZoneJSON %>;

        if (DevExpress.devices.real().phone) {
            vems.browse.viewModels.mobileRoomAvail = new vems.browse.mobileRoomAvailVM();
            vems.browse.viewModels.mobileRoomAvail.timezones(vems.browse.timeZones);
            ko.applyBindings(vems.browse.viewModels.mobileRoomAvail, $('#room-avail-filter-mobile')[0]);
        }

        var filterContainerId = DevExpress.devices.real().phone ? '#locations-filter-mobile' : '#filterContainer';
        vems.browse.dynamicFilters = $(filterContainerId).dynamicFilters({
            filterParent: vems.browse.filterParents.browseLocations,
            compactViewMode: vems.browse.compactMode.verycompact,
            filterLabel: '<%= escapeQuotes(ScreenText.Filter) %>',
            filtersLabel: '<%= escapeQuotes(ScreenText.Filters) %>',
            compactViewLabel: '<%= escapeQuotes(ScreenText.CompactView) %>',
            editViewLabel: '<%= escapeQuotes(ScreenText.EditView) %>',
            savedFiltersLabel: '<%= escapeQuotes(ScreenText.SavedFilters) %>',
            saveLabel: '<%= escapeQuotes(ScreenText.Save) %>',
            addRemoveLabel: '<%= escapeQuotes(ScreenText.AddRemove) %>',
            addFilterLabel: "<%= escapeQuotes(ScreenText.AddFilter) %>",
            saveFilterLabel: '<%= escapeQuotes(ScreenText.SaveFilter) %>',
            saveFiltersLabel: '<%= escapeQuotes(ScreenText.SaveFilters) %>',
            closeLabel: '<%= escapeQuotes(ScreenText.Close) %>',
            updateLabel: '<%= escapeQuotes(ScreenText.Update) %>',
            cancelLabel: '<%= escapeQuotes(ScreenText.Cancel) %>',
            nameLabel: '<%= escapeQuotes(ScreenText.Name) %>',
            dateSavedLabel: '<%= escapeQuotes(ScreenText.DateSaved) %>',
            loadFilterLabel: '<%= escapeQuotes(ScreenText.LoadFilter) %>',
            deleteFilterLabel: '<%= escapeQuotes(ScreenText.DeleteFilter) %>',
            whatWouldYouLikeToNameThisSetOfFiltersLabel: '<%= escapeQuotes(Messages.WhatWouldYouLikeToNameThisSetOfFilters) %>',
            findByXLabel: '<%= escapeQuotes(ScreenText.FindX) %>',
            selectedXLabel: "<%= escapeQuotes(ScreenText.SelectedRooms) %>",
            showTimeZoneOnFirstRow: true,
            timeZoneLabel: '<%= escapeQuotes(ScreenText.TimeZone) %>',
            applyFilterLabel: '<%= escapeQuotes(ScreenText.ApplyFilter) %>',
            buildingsLabel: "<%= escapeQuotes(EmsParameters.BuildingTitlePlural) %>",
            viewsLabel: "<%= escapeQuotes(ScreenText.Views) %>",
            showAllAreasLabel: "<%= escapeQuotes(string.Format(ScreenText.ShowAllX, EmsParameters.AreaTitlePlural)) %>",
            filterByAreaLabel: "<%= escapeQuotes(string.Format(ScreenText.FilterByX, EmsParameters.AreaTitleSingular)) %>",
            searchForAnAreaLabel: "<%= escapeQuotes(string.Format(ScreenText.SearchForAnX, EmsParameters.AreaTitleSingular)) %>",
            selectAllXLabel: "<%= escapeQuotes(ScreenText.SelectAllX) %>",
            ungroupedBuildingsLabel: "<%= escapeQuotes(string.Format(ScreenText.UngroupedX, EmsParameters.BuildingTitlePlural)) %>",
            unauthenticated: <%= WebUser.UserId <= 0 ? "true" : "false" %>,
            requiredFilters: vems.browse.filterModel.RequiredFilters,
            optionalFilters: vems.browse.filterModel.OptionalFilters,
            filterChanged: function(filterValues, changedFilterName){
                vems.browse.filterBookings(filterValues, changedFilterName);

                if($("#book-grid-container").data('bookGrid'))
                    $("#book-grid-container").data('bookGrid').resize();
            },
            summaryViewToggled: function(){
                if ($("#book-grid-container").data('bookGrid'))
                    $("#book-grid-container").data('bookGrid').resize();
            }
        });

        $(document).ready(function(){
            ko.applyBindings({}, $('#booking-details-container')[0]);
            ko.applyBindings(null, $('#location-details-comp')[0]);
        });
    </script>
</asp:Content>
