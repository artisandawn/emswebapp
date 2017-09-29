var vems = vems || {};
vems.roomRequest = vems.roomRequest || {};
vems.roomRequest.stopGridInitializationFilter = false;

vems.roomRequest.initializeGrid = function (buildings, startHour, roomRequestVM, filterValues) {
    $('#book-grid-container').bookGrid({
        buildings: [],
        bookings: [],
        enableEditing: false,
        canBook: false,
        useCalculatedHeight: false,
        mode: 'reserve',
        hideFloorMap: roomRequestVM.templateRules().VideoConference,
        showSetupTeardown: vems.roomRequest.showSetupTeardown,
        labels: {
            roomsYouCanReserveLabel: vems.roomRequest.roomsYouCanReserveLabel,
            roomsYouCanRequestLabel: vems.roomRequest.roomsYouCanRequestLabel
        },
        legendItems: [
            { name: vems.browse.freeLabel, color: 'transparent' },
            { name: vems.browse.someoneElsesBookingLabel, color: '#536D93' },
            { name: vems.browse.myNewBookingLabel, color: '#D3C51C' },
            { name: vems.browse.myExistingBookingLabel, color: '#84D31C' },
            { name: vems.browse.closureLabel, color: '#DCDEE0' }
        ],
        bookOptions: {
            bookStartDate: Date.now(),
            startHour: startHour,
            highlightBoxMinutes: createHighlightBoxMinutes(roomRequestVM.filters),
            bookingClicked: function (bookingId) {
                //calls web component viewmodel function
                vems.bookingDetailsVM.show(bookingId, 0);
                //$('#booking-details').data('vems_bookingDetailsModal').show(bookingId, 0);
            },
            onAddBookingClick: function (e) {
                var target = $(e.currentTarget);

                var rowParent = target.parent().parent().parent();
                var roomId = rowParent.data('roomId');

                roomRequestVM.cart.addFromScheduleView(roomId, roomRequestVM.filters, $('#timeZoneDrop'));
            }
        }
    });

    if (!vems.roomRequest.stopGridInitializationFilter)
        vems.roomRequest.filterBookings(filterValues, roomRequestVM);
};

function createHighlightBoxMinutes(filters, buildings) {
    var startMinutes = filters.start()
       ? moment(filters.start()).hours() * 60 + moment(filters.start()).minutes()
       : 0;

    var endMinutes = filters.end()
        ? moment(filters.end()).hours() * 60 + moment(filters.end()).minutes()
        : 0;

    var offsetMod = 0;

    if ($('#book-grid-container').data('bookGrid')) {
        var buildingArray = buildings
            ? buildings
            : $('#book-grid-container').data('bookGrid').buildings.length > 0
                ? $('#book-grid-container').data('bookGrid').buildings
                : [];

        var tzItem = $.grep(buildingArray, function (v, i) {
            return v.TimeZoneId == filters.timeZoneId();
        });

        var offset = tzItem.length > 0 ? tzItem[0].OffsetMinutes : 0;
        offsetMod = offset % 60;

        if (moment().utcOffset() != offset && tzItem.length > 0) {
            if (tzItem[0].TimeZoneId == filters.timeZoneId()) {
                startMinutes = startMinutes - offsetMod;
                endMinutes = endMinutes - offsetMod;
            } else {
                startMinutes = startMinutes + moment().utcOffset() - offset;
                endMinutes = endMinutes + moment().utcOffset() - offset;

                startMinutes = startMinutes - offsetMod;
                endMinutes = endMinutes - offsetMod;
            }
        }
    }

    if (startMinutes >= 1440)
        startMinutes = startMinutes - 1440;

    if (endMinutes >= 1440)
        endMinutes = endMinutes - 1440;

    return [startMinutes, endMinutes, offsetMod];
};

vems.roomRequest.filterBookings = function (filterValues, roomRequestVM, changedFilterName) {
    var buildings;
    var events;
    var availableBuildingTZs;

    var vmData = roomRequestVM;
    var templateId = vmData.template().Id;

    $.each(filterValues, function (i, v) {
        if (v.filterName === "SetupTypes" && v.value === "0")
            v.value = "-1";
    });

    filterValues.push({
        "filterName": "StartDate",
        "value": moment(vmData.filters.date()).startOf('day').format('YYYY-MM-D HH:mm:ss'),
        "displayValue": null,
        "filterType": 3
    }, {
        "filterName": "EndDate",
        "value": moment(vmData.filters.date()).endOf('day').format('YYYY-MM-D HH:mm:ss'),
        "filterType": 3,
        "displayValue": null
    }, {
        "filterName": "TimeZone",
        "value": vmData.filters.timeZoneId(),
        "displayValue": "Mountain Time",
        "filterType": 2
    });
    vems.pageLoading(true);

    var filterData = jQuery.extend(true, {}, roomRequestVM.availabilityFilterData);
    filterData.Start = filterData.Start.format('YYYY-MM-D HH:mm:ss');
    filterData.End = filterData.End.format('YYYY-MM-D HH:mm:ss');

    for (var i = 0; i < filterData.Dates.length; i++) {
        filterData.Dates[i] = moment(filterData.Dates[i]).format('YYYY-MM-D HH:mm:ss');
    }

    vems.ajaxPost(
       {
           url: vems.serverApiUrl() + '/GetBrowseLocationsRoomsForRoomRequest',
           data: JSON.stringify({ templateId: templateId, searchData: filterData, filterData: { filters: filterValues } }),
           success: function (results) {
               var data = JSON.parse(results.d);
               buildings = data.Buildings;
               availableBuildingTZs = data.AvailableBuildings;

               vems.ajaxPost(
                 {
                     url: vems.serverApiUrl() + '/GetBrowseLocationsBookingsForRoomRequest',
                     data: JSON.stringify({ templateId: templateId, filterData: { filters: filterValues } }),
                     success: function (results) {
                         events = JSON.parse(results.d);
                         var bookGrid = $('#book-grid-container').data('bookGrid');
                         bookGrid.setHighlightBoxMinutes(createHighlightBoxMinutes(roomRequestVM.filters, data.Buildings));
                         bookGrid.setRequestedDates(filterData.Start, filterData.End);
                         bookGrid.rebuildGrid(data.Buildings, events, moment(filterData.Dates[0]), availableBuildingTZs);
                     },
                     error: function (xhr, ajaxOptions, thrownError) {
                         console.log(thrownError);
                         return false;
                     }
                 });
           },
           error: function (xhr, ajaxOptions, thrownError) {
               console.log(thrownError);
               return false;
           }
       });
};

vems.roomRequest.refreshPage = function () {
    window.location.reload();
};

vems.roomRequest.syncLocationAndTzFromFilterChange = function (filterValues, changedFilterName) {
    if (changedFilterName === "Locations" && vems.roomRequest.pageMode != 'EditPamLocation' && vems.roomRequest.pageMode != 'AddPamLocation' && $('#datetime-overlay-lock :visible').length === 0) {
        var locationFilterValues = $.grep(filterValues, function (v) { return v.filterName == "Locations"; })[0].value.split(',');
        if (locationFilterValues.length === 1) {
            var facilityRecord = $.grep(roomRequestModel.templateRules().Facilities, function (v) { return v.Id == locationFilterValues[0]; });

            if (facilityRecord.length === 1 && facilityRecord[0].TimeZoneId > 0) {
                var buildingTz = facilityRecord[0].TimeZoneId;
                $('#timeZoneDrop').val(buildingTz);
                roomRequestModel.filters.timeZoneId(buildingTz);

                // if necessary, update the recurrence object to reflect the time zone change
                if (roomRequestModel.recurrence.recurrenceCount() > 0) {
                    roomRequestModel.recurrence.timeZoneId(buildingTz);
                    var displayText = roomRequestModel.recurrence.getRecurrenceDisplay();
                    $('#recurrence-pattern-overlay').html(displayText.pattern + '<span class="grey-text">' + displayText.occurrences + '</span>');
                }
            }
        }
    }
};

$('#search-room-filters, #specific-room-filters').on('show.bs.collapse', function () {
    $('#search-filters-overlay').height($('#search-room-filters').outerHeight() + $('#specific-room-filters').outerHeight());
    $('#search-room-filters, #specific-room-filters').find('a i.fa').toggleClass('fa-chevron-circle-up fa-chevron-circle-down');
}).on('hidden.bs.collapse', function () {
    $('#search-filters-overlay').height($('#search-room-filters').outerHeight() + $('#specific-room-filters').outerHeight());
    // both panels are collapsed, open the one not closed as part of this event
    if ($('#search-room-filters .panel-collapse').hasClass('collapse') && $('#specific-room-filters .panel-collapse').hasClass('collapse')) {
        if (this.id === 'search-room-filters')
            $('#specific-room-filters .panel-heading a').click();
        else
            $('#search-room-filters .panel-heading a').click();
    }
});

aboutTemplateModalAfterRender = function () {
    if (roomRequestModel.templateId() > 0)
        $('#bookNowBtn').hide();
    else
        $('#bookNowBtn').show();
};

function setFormByPageMode(vm) {
    vems.pageLoading(true);

    if (vems.roomRequest.pageMode === "InitialRequest") {
        if (vm.defaults.roomId && vm.defaults.roomId.length > 0) { // coming from the book
            vems.roomRequest.stopGridInitializationFilter = true;

            $('#result-tabs li[data-resulttype=1] a').click();
            $('#filter-container').data('dynamicFilters').setFilterValue('Locations', [-1], vems.browse.DropDownAllText);

            vm.getAvailability(false, [{
                'filterName': 'RoomId',
                'value': vm.defaults.roomId,
                'displayValue': null,
                'filterType': 2
            }]);

            vems.roomRequest.stopGridInitializationFilter = false;
        }
    }

    if (vems.roomRequest.pageMode == 'ServiceOnlyRequest') {
        $('#search-room-filters').hide();
        $('#specific-room-filters').hide();
        $('#od-room-filters').show();

        $('#cart-header-container').hide();

        $('#result-columns').hide();
        $('#category-availability-columns').show();

        $('#main-tabs li a').eq(0).html("<span>1 </span>" + vems.roomRequest.serviceAvailabilityLabel);

        // set the timezone to the selected building for service only
        $('#timeZoneDrop').prop('disabled', 'disabled');
        $('#recurrence-tz').prop('disabled', 'disabled');

        if (vems.roomRequest.buildingDefaultItem && vems.roomRequest.buildingDefaultItem != null && vems.roomRequest.buildingDefaultItem.length > 0 && vems.roomRequest.buildingDefaultItem.indexOf(',') === -1) {
            var buildingId = parseInt(vems.roomRequest.buildingDefaultItem, 10);

            if (!isNaN(buildingId)) {
                roomRequestModel.filters.specificBuildingId(buildingId);
            }
        }

        var selectedBuildingId = roomRequestModel.filters.specificBuildingId();

        var selectedBuilding = $.grep(roomRequestModel.templateRules().Facilities, function (v) {
            if (v.Id == selectedBuildingId) {
                return v;
            }
        });

        if (selectedBuilding.length > 0) {
            var selectedBuildingTZ = selectedBuilding[0].TimeZoneId;
            roomRequestModel.filters.timeZoneId(selectedBuildingTZ);
            $('#timeZoneDrop').val(selectedBuildingTZ);
        }
    }

    if (vems.roomRequest.pageMode === 'AddPamLocation' || vems.roomRequest.pageMode === 'EditPamLocation') {
        if (vems.roomRequest.pageMode === 'AddPamLocation') { }

        if (vems.roomRequest.pageMode === 'EditPamLocation') { }
    }

    if (vems.roomRequest.pageMode === 'EditBooking' || vems.roomRequest.pageMode === 'EditPamLocation') {
        vems.roomRequest.stopGridInitializationFilter = true;
        var editData = roomRequestEditData;

        if (DevExpress.devices.real().phone) {
            $('#page-title-responsive').hide();
            $('#breadcrumb').hide();
            $('#responsive-save-btn').text(vems.roomRequest.updateBooking);

            $('#responsive-setup-type-container').removeClass('col-xs-12').addClass('form-group').css('margin-right', '20px');
            $('#responsive-setup-type-container').appendTo($('#event-detail-collapse'));
            $('#responsive-setup-type').val(editData.SetupTypeId);

            vm.reservationDetails.pamSubject(vems.roomRequest.pamOptions.Subject);
            vm.reservationDetails.pamMessage('');
            //vm.reservationDetails.pamMessage(vems.roomRequest.pamOptions.Message);

            $('#pam-options-container').hide();
            $('#subject').parent().hide();
            $('#show-time-as').parent().hide();
            $('#reminder').parent().hide();
            $('#calendaring-details-panel .panel').hide();

            $('#calendaring-details-panel').css('padding-top', '6px').appendTo($('#responsive-attendee-panel'));

            $('#responsive-actions-top-container').removeClass('visible-xs').addClass('hidden-xs');
        }

        $('#result-tabs li[data-resulttype=1] a').click();
        $('#filter-container').data('dynamicFilters').setFilterValue('Locations', [editData.BuildingId], editData.BuildingDescription);
        $('#filter-container').data('dynamicFilters').setFilterValue('SetupTypes', [-1], vems.browse.DropDownAllText);

        vm.cart.supressSubscriptionUpdatesForDateTime = true;

        vm.filters.date(moment(editData.EventStart).startOf('day'));
        vm.filters.start(moment(editData.EventStart));
        vm.filters.end(moment(editData.EventEnd));
        vm.filters.timeZoneId(editData.TimeZoneId);

        vm.reservationDetails.eventName(vems.decodeHtml(editData.EventName));
        vm.reservationDetails.eventType(editData.EventTypeId);

        vm.hasResults(true);

        editData.Date = moment(editData.EventStart).startOf('day')._d;
        editData.Start = new Date(editData.EventStart);
        editData.End = new Date(editData.EventEnd);
        editData.TimeZone = editData.TimeZoneId;

        editData.Timezone = editData.TimeZoneId;
        editData.LocalDate = editData.Date;
        editData.LocalStart = editData.Start;
        editData.LocalEnd = editData.End;
        editData.IsHost = false;

        editData.StatusName = '';
        editData.Conflict = false;
        editData.Attendance = editData.SetupCount;
        editData.DefaultSetupTypeId = editData.SetupTypeId;
        editData.Min = editData.MinCapacity;
        editData.Max = editData.Capacity;
        editData.Holidays = [];

        editData.Price = '';

        vm.cart.bookingEditing(ko.mapping.fromJS(editData));
        vm.cart.bookingEditingOriginalData(editData);
        vm.cart.bookings.push(vm.cart.bookingEditing());

        vm.getAvailability(false, [{
            'filterName': 'RoomId',
            'value': editData.RoomId,
            'displayValue': null,
            'filterType': 2
        }]);

        vems.roomRequest.stopGridInitializationFilter = true;

        if (DevExpress.devices.real().phone) {
            vm.resultType(0); // set to list view for mobile
        }

        $('#timeZoneDrop').prop('disabled', true);
    }

    if (vm.templateRules().VideoConference && $('#result-tabs li.active').data('resulttype') == 2) {
        $('#result-tabs li[data-resulttype=0] a').click();
    }

    setTimeout(function () {
        vm.cart.supressSubscriptionUpdatesForDateTime = false;
    }, 1000);

    vems.pageLoading(false);
};

$('#setup-add-modal').on('show.bs.modal', function () {
    if (vems.roomRequest.pageMode != 'AddPamLocation' && (roomRequestModel.cart.bookings().length === 0 || roomRequestModel.recurrence.remainingDates().length > 0)) {
        $('#add-host-check')
            .prop('checked', 'checked')
            .prop('disabled', 'disabled');

    } else {
        $('#add-host-check')
           .prop('checked', '')
           .prop('disabled', '');
    }
});

if (!DevExpress.devices.real().phone) {
    $(window).scroll(function () {
        var detailsTabActive = $('#main-tabs li:visible.active').data('type') === 'details';

        if ($(this).scrollTop() >= 50 && !detailsTabActive) {
            $('#return-to-top').fadeIn(200);
        } else {
            $('#return-to-top').fadeOut(200);
        }
    });

    $('#return-to-top').on('click', function () {
        $('body,html').animate({
            scrollTop: 0
        }, 500);
    });
};
vems.roomRequest.touchStartPosition = [];


$(document).on('touchstart', function (e) {
    vems.roomRequest.touchStartPosition.length = 0;
    vems.roomRequest.touchStartPosition.push(e.clientX);
    vems.roomRequest.touchStartPosition.push(e.clientY);
});
