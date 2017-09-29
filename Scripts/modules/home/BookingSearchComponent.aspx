<%@ Import Namespace="Resources" %>
<div class="row" id="booking-search-header">
    <div id="booking-search-header-title" class="col-md-4 col-sm-12 col-xs-12" data-bind="click: $root.sortSearchResults">
        <%= ScreenText.Title %>
    </div>
    <div id="booking-search-header-location" class="col-md-3 hidden-xs hidden-sm" data-bind="click: $root.sortSearchResults">
        <%= ScreenText.Location %>
    </div>
    <div id="booking-search-header-date" class="col-md-4 hidden-xs hidden-sm" data-bind="click: $root.sortSearchResults">
        <%= ScreenText.DateAndTime %>
        <i id="booking-search-sort-indicator" class="fa fa-angle-up"></i>
    </div>
</div>
<div data-bind="template: { foreach: searchResults, as: 'ev' }">
    <div class="row">

        <div class="col-md-4 hidden-xs hidden-sm ellipsis-text">
            <div class="status" data-bind="style: { backgroundColor: $root.getReserveType(ev.ReserveType, ev.UserEventEnd) }"></div>
            <a href="#" data-bind="text: vems.decodeHtml(ev.EventName), click: function () { vems.bookingDetailsVM.show(Id, 0); }"></a>
        </div>

        <div class="col-md-3 hidden-xs hidden-sm ellipsis-text">
            <a href="#" data-bind="text: vems.decodeHtml(ev.Location), click: function (data) { vems.locationDetailsVM.show(data.BuildingId, data.RoomId); }"></a>
        </div>

        <div class="col-md-3 col-sm-8 col-xs-7">
            <div class="hidden-lg hidden-md status" data-bind="style: { backgroundColor: $root.getReserveType(ev.ReserveType, ev.UserEventEnd) }"></div>
            <div class="row" style="float: left; width: 99%;">
                <div class="hidden-md hidden-lg col-sm-12 col-xs-12">
                    <a href="#" data-bind="text: vems.decodeHtml(ev.EventName), click: function () { vems.bookingDetailsVM.show(Id, 0); }"></a>
                </div>
                <div class="col-md-12 hidden-sm hidden-xs">
                    <span data-bind="text: moment(ev.UserEventStart).format('LLL') + ' - ' + moment(ev.UserEventEnd).format('LT')"></span>
                </div>
                <div class="hidden-md hidden-lg col-sm-12 col-xs-12">
                    <div class="float" data-bind="text: moment(ev.UserEventStart).format('LL')"></div>
                    <div class="float clear" data-bind="text: moment(ev.UserEventStart).format('LT') + ' - ' + moment(ev.UserEventEnd).format('LT')"></div>
                </div>
            </div>
        </div>


        <div class="col-md-2 col-sm-4 col-xs-5 table-buttons">
            <button type="button"  class="btn btn-primary btn-xs disabled" disabled="disabled" data-toggle="modal" data-bind="visible: ev.IsCheckedIn">
                <%= ScreenText.IsCheckedIn %>
            </button>
            <button type="button" class="btn btn-primary btn-xs" data-toggle="modal" data-bind="visible: ev.ShowCheckinButton, click: $root.checkInToEvent.bind(ev), attr: { id: 'checkin-' + ev.Id }">
                <%= ScreenText.CheckIn %>
            </button>
            <button type="button" class="btn btn-primary btn-xs" data-toggle="modal" data-bind="visible: (ev.AllowEndNow && !ev.ShowCheckinButton), click: $root.endBookingNow.bind(ev), attr: { id: 'endnow-' + ev.Id }">
                <%= ScreenText.EndNow %>
            </button>
            <!-- ko if: ev.AllowCancel && (!ev.VideoConferenceHost || (ev.OccurrenceCount === 1)) -->
            <button type="button" class="btn btn-primary btn-xs" data-toggle="modal" data-bind="click: $root.cancelBooking.bind(ev), attr: { id: 'cancel-' + ev.Id }">
                <%= ScreenText.Cancel %>
            </button>
            <!-- /ko -->
        </div>
    </div>
</div>

