var vems = vems || {};
vems.browse = vems.browse || {};
vems.browse.viewModels = vems.browse.viewModels || {};

vems.browse.mobileRoomAvailVM = function () {
    var self = this;

    self.date = ko.observable(moment());
    self.room = ko.observable({});
    self.building = ko.observable({});
    self.timezoneId = ko.observable({});
    self.timezones = ko.observable([]);
    self.events = ko.observable([]);
    self.buildingHours = ko.observable([]);

    self.todayText = ko.pureComputed(function () {
        var dateFormat = DevExpress.devices.real().phone ? 'L' : 'ddd LL';

        return self.date().format(dateFormat) + ' (' + (
        self.timezone().TimeZoneAbbreviation || self.timezone().TimeZone) + ')';
    });
    self.prevBtnHtml = ko.pureComputed(function () {
        return '<i class="fa fa-chevron-left"></i>&nbsp;' + moment(self.date()).subtract(1, 'day').format('ddd');
    });
    self.nextBtnHtml = ko.pureComputed(function () {
        return moment(self.date()).add(1, 'day').format('ddd') + '&nbsp;<i class="fa fa-chevron-right"></i>';
    });
    self.timezone = ko.pureComputed(function () {
        return $.grep(self.timezones(), function (el) {
            return el.TimeZoneID === self.timezoneId();
        })[0];
    });
    self.buildingTimezone = ko.pureComputed(function () {
        return $.grep(self.timezones(), function (el) {
            return el.TimeZoneID === self.building().TimeZoneId;
        })[0];
    });

    self.timezoneId.subscribe(function (newTzId) {
        if (vems.browse.dynamicFilters) {
            vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue('TimeZone', newTzId);
        }
    });
};

vems.browse.showMobileLocations = function () {
    // hide the mobile room avail section
    $('#room-avail-filter-mobile').hide();
    $('#room-avail-grid-mobile').hide();

    // show the mobile locations section
    $('#locations-filter-mobile').show();
    $('#locations-grid-mobile').show();
    return false;
};

vems.browse.showMobileRoomAvail = function (buildingId, roomId) {
    // hide the mobile locations section
    $('#locations-filter-mobile').hide();
    $('#locations-grid-mobile').hide();

    // set the roomId and buildingId filter values to build the room avail grid
    var building = $.grep(vems.browse.bookGridData.Buildings, function (el) {
        return el.Id === buildingId;
    })[0];
    var room = $.grep(building.Rooms, function (el) {
        return el.Id === roomId;
    })[0];
    vems.browse.dynamicFilters.data('dynamicFilters').suppressUpdate = true;
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue('BuildingId', building.Id);
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue('TimeZone', building.TimeZoneId);
    vems.browse.dynamicFilters.data('dynamicFilters').suppressUpdate = false;
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue('RoomId', room.Id, room.Description, vems.browse.filterTypes.number, false);

    // set the header vm properties
    vems.browse.viewModels.mobileRoomAvail.building(building);
    vems.browse.viewModels.mobileRoomAvail.room(room);
    vems.browse.viewModels.mobileRoomAvail.timezoneId(building.TimeZoneId);

    // show the mobile room avail section
    $('#room-avail-filter-mobile').show();
    $('#room-avail-grid-mobile').show();
    return false;
};

vems.browse.buildMobileLocationsGrid = function () {
    var locationsHtml = '';

    if (vems.browse.bookGridData.Buildings.length === 0) {
        locationsHtml += '<div>There are no locations that match your filter settings.</div>';
    } else {
        $.each(vems.browse.bookGridData.Buildings, function (idx, building) {
            // add a header row for each building
            locationsHtml += '<div class="row mobile-grid-header"><div class="col-xs-9 ellipsis-text mobile-building-row"><a href="';
            locationsHtml += building.LocationLink;
            locationsHtml += '">';
            locationsHtml += building.DisplayText;
            locationsHtml += ' (';
            locationsHtml += building.TimeZone;
            locationsHtml += ')</a></div><div class="col-xs-3 mobile-grid-center">Cap</div></div>';

            $.each(building.Rooms, function (i, room) {
                // add a grid row for each room
                locationsHtml += '<div class="row"><div class="col-xs-2"><button class="mobile-button" style="cursor: pointer;" onclick="return vems.browse.showMobileRoomAvail(';
                locationsHtml += building.Id;
                locationsHtml += ',';
                locationsHtml += room.Id;
                locationsHtml += ');">';
                locationsHtml += '<i class="fa fa-th"></i></button></div><div class="col-xs-7 ellipsis-text mobile-room-row"><a href="';
                locationsHtml += room.LocationLink;
                locationsHtml += '">';
                locationsHtml += room.DisplayText;
                locationsHtml += '</a></div><div class="col-xs-3 mobile-grid-center">';
                locationsHtml += room.Capacity >= 0 ? room.Capacity : '';
                locationsHtml += '</div></div>';
            });
        });
    }

    $('#locations-grid-mobile-content').html(locationsHtml);
    $('body').scrollTo('#grid-container-mobile');
};

vems.browse.mobileTouchX = 0;
vems.browse.mobileTouchY = 0;
vems.browse.buildMobileRoomAvailGrid = function () {
    var filterDate = vems.browse.viewModels.mobileRoomAvail.date();
    var date = moment({ y: filterDate.year(), M: filterDate.month(), d: filterDate.date(), h: 0, m: 0, s: 0, ms: 0 });
    var tzMinuteBias = vems.browse.viewModels.mobileRoomAvail.buildingTimezone()
        ? vems.browse.viewModels.mobileRoomAvail.buildingTimezone().MinuteBias - vems.browse.viewModels.mobileRoomAvail.timezone().MinuteBias
        : 0;

    // set up building closure time objects
    var buildingId = vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue('BuildingId');
    var buildingHours = $.grep(vems.browse.viewModels.mobileRoomAvail.buildingHours(), function (el) {
        return el.BuildingId === buildingId;
    })[0];
    var openTime = buildingHours ? moment({
        y: filterDate.year(), M: filterDate.month(), d: filterDate.date(),
        h: moment(buildingHours.OpenTime).hours(), m: moment(buildingHours.OpenTime).minutes()
    }) : moment({ y: 1900 });
    var closeTime = buildingHours ? moment({
        y: filterDate.year(), M: filterDate.month(), d: filterDate.date(),
        h: moment(buildingHours.CloseTime).hours(), m: moment(buildingHours.CloseTime).minutes()
    }) : moment({ y: 9999 });
    var closedText = 'Closed';

    var roomSetupMinutes = $.isFunction(vems.browse.viewModels.mobileRoomAvail.room) ? vems.browse.viewModels.mobileRoomAvail.room().SetupHours * 60 : 0;
    var roomTeardownMinutes = $.isFunction(vems.browse.viewModels.mobileRoomAvail.room) ? vems.browse.viewModels.mobileRoomAvail.room().TeardownHours * 60 : 0;

    // begin building availability grid
    var prevDate;
    var raGridHtml = '<div class="col-xs-12" style="height: 10px;"></div>'; // space at top of grid
    for (var i = 0; i <= 48; i++) { // start at 0: 48 half hours + 1 line for midnight next day
        raGridHtml += '<div class="col-xs-2 mobile-filter-left mobile-time-row">';
        prevDate = moment(date);
        if (i % 2 === 0) {
            raGridHtml += '<span class="mobile-time-cell">';
            raGridHtml += date.format('h a');
            raGridHtml += '</span>';
        }
        date.add(30, 'minutes');
        raGridHtml += '</div><div data-half-hour="';
        raGridHtml += i;
        raGridHtml += '" data-availability="';

        // calculate availability for current half hour by analyzing overlapping events
        var overlappingEvents = $.grep(vems.browse.viewModels.mobileRoomAvail.events(), function (el) {
            return moment(el.TimeBookingStart).add(-1 * roomTeardownMinutes, 'minutes') >= moment(prevDate)
                && moment(el.TimeBookingStart).add(-1 * roomTeardownMinutes, 'minutes') < moment(date)
                || (moment(el.TimeBookingEnd).add(roomSetupMinutes, 'minutes') >= moment(prevDate)
                && moment(el.TimeBookingEnd).add(roomSetupMinutes, 'minutes') < moment(date));
        });
        if (overlappingEvents.length > 0) {
            var earliestStart = moment(date);
            $.each(overlappingEvents, function (idx, event) {
                earliestStart = moment(event.TimeBookingStart).add(-1 * roomTeardownMinutes, 'minutes') < earliestStart
                    ? moment(event.TimeBookingStart).add(-1 * roomTeardownMinutes, 'minutes') : earliestStart;
            });
            var latestEnd = moment(prevDate);
            $.each(overlappingEvents, function (idx, event) {
                latestEnd = moment(event.TimeBookingEnd).add(roomSetupMinutes, 'minutes') > latestEnd
                    ? moment(event.TimeBookingEnd).add(roomSetupMinutes, 'minutes') : latestEnd;
            });

            var frontAvail = earliestStart.diff(moment(prevDate), 'minutes');
            var backAvail = latestEnd.diff(moment(date), 'minutes');
            frontAvail = frontAvail < 0 ? 0 : frontAvail;
            backAvail = backAvail > 0 ? 0 : backAvail;

            if (Math.abs(frontAvail) > Math.abs(backAvail)) {
                raGridHtml += frontAvail;
            } else {
                raGridHtml += backAvail;
            }
        } else {
            // check for events that completely cover the half hour
            var coveringEvents = $.grep(vems.browse.viewModels.mobileRoomAvail.events(), function (el) {
                return moment(el.TimeBookingStart).add(-1 * roomTeardownMinutes, 'minutes') <= moment(prevDate)
                    && moment(el.TimeBookingEnd).add(roomSetupMinutes, 'minutes') >= moment(date);
            });
            raGridHtml += coveringEvents.length > 0 ? '0' : '30';
        }

        raGridHtml += '" class="col-xs-9 mobile-time-row mobile-time-section';

        // add building closure styles if necessary
        if (moment(prevDate) < openTime || moment(prevDate) >= closeTime) {
            raGridHtml += ' building-closed">';
            raGridHtml += closedText;
            closedText = '';
        } else {
            raGridHtml += '">';
            closedText = 'Closed';
        }

        // draw events starting in current half hour
        var currEvents = $.grep(vems.browse.viewModels.mobileRoomAvail.events(), function (el) {
            return moment(el.TimeBookingStart) >= moment(prevDate)
                && moment(el.TimeBookingStart) < moment(date);
        });
        $.each(currEvents, function (idx, event) {
            var startTime = moment(event.TimeBookingStart);
            var eventStart = moment(event.EventStart);
            var endTime = moment(event.TimeBookingEnd);
            var eventEnd = moment(event.EventEnd);
            var showSetupTeardown = event.TeardownWidth > 0 || event.SetupWidth > 0;

            var setupTime = showSetupTeardown ? Math.abs(startTime.diff(eventStart, 'minutes')) : 0;
            var eventTime = showSetupTeardown ? Math.abs(eventStart.diff(eventEnd, 'minutes')) : Math.abs(startTime.diff(endTime, 'minutes'));
            var teardownTime = showSetupTeardown ? Math.abs(endTime.diff(eventEnd, 'minutes')) : 0;

            // draw extra setup/teardown on events to account for time needed on any new event created (prevents confusion in perceived availability)
            if (vems.browse.bookGridData.ShowSetupTeardown) {
                setupTime += roomTeardownMinutes;
                teardownTime += roomSetupMinutes;
            } else {
                eventTime += roomSetupMinutes + roomTeardownMinutes;
            }

            var top = (startTime.minutes() >= 30 ? Math.abs(30 - startTime.minutes()) : startTime.minutes()) - 1 - roomTeardownMinutes;
            if (setupTime > 0) {
                raGridHtml += '<div class="mobile-event-setup';
                if (event.WebUserIsOwner) {
                    raGridHtml += ' owned';
                }
                raGridHtml += '" style="height:';
                raGridHtml += setupTime;
                raGridHtml += 'px;top:';
                raGridHtml += top;
                raGridHtml += 'px;" data-booking-id="';
                raGridHtml += event.Id;
                raGridHtml += '" data-private="';
                raGridHtml += !event.DisplayDetails;
                raGridHtml += '"></div>';
            }
            raGridHtml += '<div class="mobile-event';
            if (event.WebUserIsOwner) {
                raGridHtml += ' owned';
            }
            raGridHtml += '" style="height:';
            raGridHtml += eventTime;
            raGridHtml += 'px;top:';
            raGridHtml += top + setupTime;
            raGridHtml += 'px;" data-booking-id="';
            raGridHtml += event.Id;
            raGridHtml += '" data-private="';
            raGridHtml += !event.DisplayDetails;
            raGridHtml += '">';
            raGridHtml += event.DisplayText;
            raGridHtml += '</div>';
            if (teardownTime > 0) {
                raGridHtml += '<div class="mobile-event-setup';
                if (event.WebUserIsOwner) {
                    raGridHtml += ' owned';
                }
                raGridHtml += '" style="height:';
                raGridHtml += teardownTime;
                raGridHtml += 'px;top:';
                raGridHtml += top + setupTime + eventTime;
                raGridHtml += 'px;" data-booking-id="';
                raGridHtml += event.Id;
                raGridHtml += '" data-private="';
                raGridHtml += !event.DisplayDetails;
                raGridHtml += '"></div>';
            }
        });

        raGridHtml += '</div><div class="col-xs-1 mobile-filter-right mobile-time-row"></div>';
    }

    // add grid to page and scroll to preset starting point
    $('#room-avail-grid-mobile-content').html(raGridHtml);
    $('#room-avail-grid-mobile-content').scrollTop(vems.browse.startHour * 60);

    // bind touch/click events for grid
    $('.mobile-event, .mobile-event-setup, .mobile-time-section').bind('touchstart mousedown', function (e) {
        vems.browse.mobileTouchX = e.clientX;
        vems.browse.mobileTouchY = e.clientY;
    });
    $('.mobile-event, .mobile-event-setup').bind('touchend mouseup', function (e) {
        var xDiff = Math.abs(vems.browse.mobileTouchX - e.clientX);
        var yDiff = Math.abs(vems.browse.mobileTouchY - e.clientY);
        if (xDiff > 30 || yDiff > 30) { return false; }  // prevent click action when scrolling

        var bookId = $(this).attr('data-booking-id');
        var isPrivate = $(this).data('private');
        if (!isPrivate) {  // do nothing if it's a private event
            vems.bookingDetailsVM.show(bookId, 0);  // call web component viewmodel function
        }

        return false;
    });
    $('.mobile-time-section:not(.building-closed)').bind('touchend mouseup', function (e) {
        var xDiff = Math.abs(vems.browse.mobileTouchX - e.clientX);
        var yDiff = Math.abs(vems.browse.mobileTouchY - e.clientY);
        if (xDiff > 30 || yDiff > 30) { return false; }  // prevent click action when scrolling

        var time = parseInt($(this).attr('data-half-hour'));
        var avail = parseInt($(this).attr('data-availability'));
        var nextHalfHour = $(this).next().next().next('.mobile-time-section:not(.building-closed)')[0];
        var firstHalf = time % 2 === 0;
        var eventTop = -1;
        var eventHeight = 0;

        if (avail === 0 || time === 48) {  // event(s) completely overlapping or this is first half hour of TOMORROW
            return false;
        } else if (avail > 0 && avail < 30) {  // event(s) overlapping middle/end of half hour, but not beginning
            eventHeight = avail;
        } else if (avail === 30) {  // no events touching this half hour
            if (firstHalf && nextHalfHour) {
                var addlTime = parseInt($(nextHalfHour).attr('data-availability'));
                eventHeight = addlTime > 0 ? 30 + addlTime : 30;
            } else {
                eventHeight = 30;
            }
        } else if (avail < 0) {  // event(s) overlapping beginning of half hour, but not end
            eventTop = 29 + avail;
            if (firstHalf && nextHalfHour) {
                var addlTime = parseInt($(nextHalfHour).attr('data-availability'));
                eventHeight = addlTime > 0 ? Math.abs(avail) + addlTime : Math.abs(avail);
            } else {
                eventHeight = Math.abs(avail);
            }
        }

        var hrs = time / 2;
        var mins = eventTop + (firstHalf ? 1 : 31);
        var newStart = moment({ y: filterDate.year(), M: filterDate.month(), d: filterDate.date(), h: hrs, m: mins, s: 0, ms: 0 });
        if (moment(newStart).add(tzMinuteBias, 'minutes') < moment()) { return false; }  // don't allow event creation in the past

        var newEnd = moment(newStart).add(eventHeight, 'minutes');
        var room = $.grep($.grep(vems.browse.bookGridData.Buildings, function (el) {
            return el.Id === buildingId;
        })[0].Rooms, function (el) {
            return el.Id === vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue('RoomId');
        })[0];

        // add new event to grid and display create reservation modal
        $(this).append('<div class="mobile-event new" style="height:' + eventHeight + 'px;top:' + eventTop + 'px;"></div>');
        vems.browse.showMobileReservationModal(room.Id, room.DisplayText, newStart, newEnd);
        return false;
    });
};

vems.browse.showMobileReservationModal = function (roomId, roomName, start, end) {
    $('#reservation-modal .date-message').text(moment(start).format('ddd LL') + ' ' + vems.browse.inLabel + ' ' + vems.htmlDecode(roomName));
    $('#reservation-modal-start').data('DateTimePicker').date(start);
    $('#reservation-modal-end').data('DateTimePicker').date(end);

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetTemplatesForRoom',
        data: JSON.stringify({ roomId: roomId }),
        success: function (results) {
            var templates = JSON.parse(results.d);

            if (templates.length === 0) {
                $(".event-container.new").remove();
                $(".mobile-event.new").remove();
                return false;
            }

            $('#reservation-modal-template option').remove();
            $.each(templates, function (i, v) {
                $('#reservation-modal-template').append($('<option></option>').val(v.key).html(v.value));
            });

            if (templates.length == 1) {
                $('#reservation-modal-template').attr('disabled', 'disabled');
            } else {
                $('#reservation-modal-template').removeAttr('disabled');
            }

            $('#reservation-modal').modal({
                backdrop: 'static',
                keyboard: false
            });

            $('#reservation-modal-continue').data('roomId', roomId);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};

vems.browse.incrementDate = function (days) {
    var start = moment(vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("StartDate"));
    if (!start.isValid()) {
        start = moment(vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("StartDate"), "YYYY-MM-D");
    }
    vems.browse.dynamicFilters.data('dynamicFilters').suppressUpdate = true;
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("StartDate", moment(start).add(days, 'days'));
    vems.browse.dynamicFilters.data('dynamicFilters').suppressUpdate = false;
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("EndDate", moment(start).add(days + 1, 'days').add(-1, 'minutes'));
};

vems.browse.setDate = function (date) {
    date = moment(date);
    if (moment.isMoment(date) && !date.isValid()) {
        date = moment(date, "YYYY-MM-D");
    }
    vems.browse.dynamicFilters.data('dynamicFilters').suppressUpdate = true;
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("StartDate", moment(date).startOf('day'));
    vems.browse.dynamicFilters.data('dynamicFilters').suppressUpdate = false;
    vems.browse.dynamicFilters.data('dynamicFilters').setFilterValue("EndDate", moment(date).startOf('day').add(1, 'days').add(-1, 'minutes'));
};

vems.browse.toggleToday = function (filterDate) {
    if (moment(filterDate).startOf('day').isSame(moment().startOf('day'))) {
        $('#todayBtn').hide();
    } else {
        $('#todayBtn').show();
    }
};

vems.browse.setHeaderControlText = function () {
    var start = moment(vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("StartDate"));

    if (!start.isValid()) {
        start = moment(vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("StartDate"), "YYYY-MM-D");
    }

    var end = moment(start);

    $('#previousDayBtn span').text(moment(start).add(-1, 'days').format('ddd'));
    $('#nextDayBtn span').text(moment(end).add(1, 'days').format('ddd'));

    $('#dateHeader span').first().text(moment(start).format('ddd LL'));
    //removed 18969
    //$('#dateHeader span').last().text(vems.browse.dynamicFilters.data('dynamicFilters').getFilterDisplayValue("TimeZone"));

};

vems.browse.initializeControls = function () {
    vems.browse.setHeaderControlText();

    $('#previousDayBtn').on('click', function () {
        vems.browse.incrementDate(-1);
    });

    $('#nextDayBtn').on('click', function () {
        vems.browse.incrementDate(1);
    });

    $('#todayBtn').on('click', function () {
        var today = getTodayMoment();
        vems.browse.setDate(today);
    });
};

vems.browse.initializeGrid = function () {
    $('#book-grid-container').bookGrid({
        buildings: vems.browse.bookGridData.Buildings,
        bookings: [],
        enableEditing: false,
        availableBuildings: vems.browse.bookGridData.AvailableBuildings,
        showSetupTeardown: vems.browse.bookGridData.ShowSetupTeardown,
        bookOptions: {
            bookStartDate: Date.now(),
            startHour: vems.browse.startHour,
            canBook: vems.browse.bookGridData.CanBook,
            bookingClicked: function (bookingId) {
                //calls web component viewmodel function
                vems.bookingDetailsVM.show(bookingId, 0);
                //$('#booking-details').data('vems_bookingDetailsModal').show(bookingId, 0);
            }
        }
    });

    vems.browse.filterBookings(vems.browse.dynamicFilters.data('dynamicFilters').getFilterValueCollection());
};

vems.browse.filtersThatCauseRoomUpdates = ['Locations', 'Capacity', 'Features', 'Floors', 'Room', 'RoomTypes', 'SetupTypes'];

vems.browse.filterBookings = function (filterValues, changedFilterName) {
    if (!DevExpress.devices.real().phone) {
        vems.pageLoading(true);
    }

    vems.browse.toggleToday(filterValues[0].value);
    var forDate = moment(vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("StartDate"));
    if (!forDate.isValid()) {
        forDate = moment(vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue("StartDate"), "YYYY-MM-D");
    }

    for (var i = 0; i < filterValues.length; i++) {
        if (filterValues[i].filterName === "StartDate" || filterValues[i].filterName === "EndDate") {
            var filterDate = moment(filterValues[i].value);
            if (filterDate.isValid()) {
                filterValues[i].value = filterDate.format('YYYY-MM-D HH:mm:ss');
            } else {
                filterValues[i].value = moment(filterValues[i].value, 'YYYY-MM-D').format('YYYY-MM-D HH:mm:ss');
            }
        }
    }

    if (changedFilterName == undefined || $.inArray(changedFilterName, vems.browse.filtersThatCauseRoomUpdates) >= 0) {
        var buildings;
        var events;

        vems.ajaxPost(
           {
               url: vems.serverApiUrl() + '/GetBrowseLocationsRooms',
               data: JSON.stringify({ filterData: { filters: filterValues } }),
               success: function (results) {
                   var data = JSON.parse(results.d);                                   
                   vems.browse.bookGridData.Buildings = data.Buildings;

                   vems.ajaxPost(
                     {
                         url: vems.serverApiUrl() + '/GetBrowseLocationsBookings',
                         data: JSON.stringify({ filterData: { filters: filterValues } }),
                         success: function (results) {
                             events = JSON.parse(results.d);

                             if (DevExpress.devices.real().phone) {
                                 vems.browse.buildMobileLocationsGrid();
                             } else {
                                 vems.browse.setHeaderControlText();                                 
                                 $('#book-grid-container').data('bookGrid').rebuildGrid(data.Buildings, events, forDate);
                             }
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
    } else {
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetBrowseLocationsBookings',
            data: JSON.stringify({ filterData: { filters: filterValues } }),
            success: function (results) {
                var events = JSON.parse(results.d);

                if (DevExpress.devices.real().phone) {
                    vems.browse.viewModels.mobileRoomAvail.date(forDate);
                    vems.browse.viewModels.mobileRoomAvail.events(events.Bookings);
                    vems.browse.viewModels.mobileRoomAvail.buildingHours(events.BuildingHours);
                    vems.browse.buildMobileRoomAvailGrid();
                } else {
                    vems.browse.setHeaderControlText();
                    $('#book-grid-container').data('bookGrid').setEvents(events, forDate);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                return false;
            }
        });
    }
};

$(document).ready(function () {
    if (DevExpress.devices.real().phone) {
        // hide desktop view
        $('#filterContainer').hide();
        $('#locationsContainer').hide();
        $('#book-grid-container').hide();

        // change background color of body and show mobile view
        $('body').addClass('mobile-body');
        $('#grid-container-mobile').show();
        $('#filter-container-mobile').show();

        vems.browse.buildMobileLocationsGrid();

        $('#list-room-filter').appendTo($('#mobile-grid-room-search'));

        // truncate TZ fields on mobile to better fit the screen.
        $('#tz-select option').each(function (i, v) {
            if ($(v).text().length > 30)
                $(v).text($(v).text().substring(0, 30) + '...');
        })
    } else {
        vems.browse.initializeControls();
        vems.browse.initializeGrid();

        $('#book-grid-container .close').on('click', function () {
            $('.event-container').remove();
        });
    }

    $('#reservation-modal .date').datetimepicker({
        locale: moment.locale(),
        format: 'LT',
        ignoreReadonly: true,
        stepping: 15,
        widgetPositioning: {
            horizontal: 'left'
        }
    }).on('dp.change', function () {
        var validationElement = $("#" + this.id + '-error');

        if ($(this).data("DateTimePicker").date() == null) {
            validationElement.text(vems.browse.pleaseSelectALabel + " " + $(this).siblings('label').eq(0).text());

            validationElement.show();

            return;
        } else {
            validationElement.hide();
        }

        if ($('#reservation-modal-end').data("DateTimePicker").date() != null && $('#reservation-modal-start').data("DateTimePicker").date() != null) {
            var startDate = moment([1900, 1, 1, $('#reservation-modal-start').data('DateTimePicker').date().hour(), $('#reservation-modal-start').data('DateTimePicker').date().minute()]);
            var endDate = moment([1900, 1, 1, $('#reservation-modal-end').data('DateTimePicker').date().hour(), $('#reservation-modal-end').data('DateTimePicker').date().minute()]);

            if ($('#reservation-modal-end').data('DateTimePicker').date().hour() == 0) // midnight, assume next day
                endDate.add(1, 'day');

            if (!endDate.isAfter(startDate)) {
                $('#reservation-modal-end-error').text(vems.decodeHtml(vems.browse.endBeforeStartLabel)).show();

                $('#reservation-modal-end-error').show();
            } else {
                $('#reservation-modal-end-error').hide();
            }
        }
        if (moment($('#dateHeader span').eq(0).text()).date() == moment().date()) { // booking for today
            var startDate = moment([1900, 1, 1, $('#reservation-modal-start').data('DateTimePicker').date().hour(), $('#reservation-modal-start').data('DateTimePicker').date().minute()]);
            var modifiedNow = moment([1900, 1, 1, moment().hour(), moment().minute()]);

            if (modifiedNow.isAfter(startDate)) {
                $('#reservation-modal-end-error').text(vems.decodeHtml(vems.browse.startCannotBeBeforeCurrntTime)).show();

                $('#reservation-modal-end-error').show();
            }
        }
    });

    $('#reservation-modal .date input').on('keypress', function (e) {
        console.log(e.keyCode);
        if (e.keyCode === 13) {
            return false;
        }
    });

    $('#reservation-modal-cancel').on('click', function () {
        $(".event-container.new").remove();
        $(".mobile-event.new").remove();
        $('#reservation-modal').modal('hide');
        return false;
    });

    $('#reservation-modal-close-icon').on('click', function () {
        $(".event-container.new").remove();
        $(".mobile-event.new").remove();
        $('#reservation-modal').modal('hide');
        return false;
    });

    $('#reservation-modal-continue').on('click', function () {
        if ($('.error:hidden').length == 2) {

            var dateInputs = $(this).parent().siblings('.modal-body').find('input');

            var date = $('.dynamic-filter-row  .date').data('DateTimePicker').date();

            var startTime = $(this).parent().siblings('.modal-body').find('input').eq(0).parent().data('DateTimePicker').date();
            var endTime = $(this).parent().siblings('.modal-body').find('input').eq(1).parent().data('DateTimePicker').date();

            var fullStart = moment(date).hours(startTime.hours()).minutes(startTime.minutes());
            var fullEnd = moment(date).hours(endTime.hours()).minutes(endTime.minutes());

            var templateId = $(this).parent().siblings('.modal-body').find('select').val();
            var timezoneId = DevExpress.devices.real().phone ? $('#room-avail-tz-mobile').val() : $('#tz-select').val();

            window.location = "RoomRequest.aspx?start=" + fullStart.format('YYYY-MM-D HH:mm:ss') + "&end=" + fullEnd.format('YYYY-MM-D HH:mm:ss') + "&roomid=" + $('#reservation-modal-continue').data('roomId') + "&ProcessTemplateId=" + templateId + "&timezoneid=" + timezoneId;

            $('#reservation-modal').modal('hide');
        }
        return false;
    });
});

$(document).on('keypress', '#find-a-room-filter', function (e) {
    if (e.which == 13) {
        $('#find-a-room-filter-btn').click();
    }
});

$(document).on('click', '#find-a-room-filter-btn', function () {
    vems.pageLoading(true);
    var searchVal = $('#find-a-room-filter').val();

    if (DevExpress.devices.real().phone) {
        $('#locations-grid-mobile .mobile-grid-header').show();
        $('#locations-grid-mobile .row').show();

        if (searchVal == undefined || searchVal.length === 0) {
            return false;
        }

        $('#locations-grid-mobile .mobile-room-row').each(function (i, v) {
            if ($(v).text().toLowerCase().indexOf(searchVal.toLowerCase()) >= 0) {
                $(v).parent().show();
            } else {
                $(v).parent().hide();
            }
        });

        $('#locations-grid-mobile .mobile-grid-header').each(function (i, v) {
            var bc = $(v);
            if (bc.nextAll('.row:visible').eq(0).hasClass('mobile-grid-header')) {
                bc.hide();
            } else {
                bc.show();
            }
        });
    } else {
        if ($('#book-grid-container').data('bookGrid')) {
            $('#book-grid-container').data('bookGrid').filterByRoomName(searchVal);
        }
    }

    vems.pageLoading(false);
});


function getTodayMoment() {
    var date = new Date();
    return moment(Date().Year, Date().Month, Date().Day);
}