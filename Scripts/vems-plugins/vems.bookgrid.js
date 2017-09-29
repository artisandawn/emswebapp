(function ($) {
    var self;
    var originalElement;
    var settings;
    var minutesInDay = 1440;
    var pixelsPerHour = 60;

    $.fn.bookGrid = function (options) {
        var self = this;
        originalElement = this;
        var data = this.data("deaBook");
        var current;

        if (data) {
            return data;
        }

        this.each(function () {
            var b = new bookGrid(options);
            b.init();

            var container = self.data("bookGrid", b);
            current = current ? current.add(container) : container;
        });

        return current ? current : this;
    };
    $.fn.bookGrid.defaults = {
        buildings: [],
        bookings: [],
        timeIncrement: 15,
        enableEditing: true,
        canBook: true,
        useCalculatedHeight: true,
        mode: 'browse', // 'reserve', 'exchange'
        showSetupTeardown: true,
        labels: {
            roomsYouCanReserveLabel: '',
            roomsYouCanRequestLabel: ''
        }
    };

    function bookGrid(options) {
        self = this;
        settings = $.extend({}, $.fn.bookGrid.defaults, options);
        self.forDate = null;
        self.startDate = null;
        self.endDate = null;
        self.availableBuildingTimeZones = options.availableBuildings ? options.availableBuildings : [];

        $.extend(self, {
            buildings: [],
            events: [],
            buildingHours: [],
            init: function () {
                originalElement.addClass('book-grid-container');
                originalElement.append(generateTimeRow(true));

                buildGrid();

                bindDeferredEvents();
            },
            setRequestedDates: function (start, end) {
                self.startDate = moment(start);
                self.endDate = moment(end);
                if (self.endDate.hour() < self.startDate.hour() || (self.endDate.hour() === self.startDate.hour() && (self.endDate.minute() === self.startDate.minute()))) {
                    self.endDate = self.endDate.clone().add(1, 'day');
                }
            },
            resize: function () {
                var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
                var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

                originalElement.find('.column-container').css('height', h - getExistingElementHeights() - getScrollSizes()[1]);
                originalElement.find($('.grid-scroll').css('height', h - getExistingElementHeights()));

                if (settings.mode === "browse") {
                    var timeRowContainer = originalElement.find('.time-row-container');
                    originalElement.find('.column-container').css('top', timeRowContainer.position().top + timeRowContainer.height());
                }
            },
            rebuildGrid: function (buildings, bookingData, forDate, availableBuildings) {
                originalElement.find('.grid').remove();
                originalElement.find('.grid-scroll').remove();
                if (forDate) { settings.forDate = forDate; }
                settings.buildings = buildings;
                if (availableBuildings) {
                    self.availableBuildingTimeZones = availableBuildings;
                }

                buildGrid();

                self.buildings = buildings;
                self.events = bookingData;
                this.setEvents(bookingData, forDate, buildings);

                vems.pageLoading(false);
            },
            setEvents: function (bookingData, forDate, buildings) {
                vems.pageLoading(true);

                originalElement.find('.event-container').remove();
                if (forDate) { settings.forDate = forDate; }
                settings.bookings = bookingData.Bookings;

                var bldgHrs = bookingData.BuildingHours;

                self.buildingHours = bldgHrs; //for use later in drawevents()
                this.redrawBuildingHours(bldgHrs);
                drawEvents();

                self.buildings = buildings; //settings.buildings;
                self.events = bookingData;

                vems.pageLoading(false);
            },
            filterByRoomName: function (roomName) {
                originalElement.find('.building-column').show();
                originalElement.find('.building-row').show();
                originalElement.find('.room-column').show();
                originalElement.find('.room-row').show();

                if (roomName == undefined || roomName.length === 0) {
                    return false;
                }

                originalElement.find('.room-column').each(function (i, v) {
                    var roomRow = originalElement.find('.room-row[data-room-id=' + $(v).data('roomId') + ']');
                    var roomElementName = $(v).find('.location').text().toLowerCase();

                    if (roomElementName.indexOf(roomName.toLowerCase()) >= 0) {
                        $(v).show();
                        roomRow.show();
                    } else {
                        $(v).hide();
                        roomRow.hide();
                    }
                });

                originalElement.find('.building-column').each(function (i, v) {
                    var bc = $(v);
                    var buildingRow = originalElement.find('.building-row[data-building-id=' + $(v).data('buildingId') + ']');

                    if (bc.nextAll('.column:visible').eq(0).hasClass('building-column')) {
                        bc.hide();
                        buildingRow.hide();
                    } else {
                        bc.show();
                        buildingRow.show();
                    }
                });
            },
            redrawBuildingHours: function (buildingHours) {
                originalElement.find('.building-hours').remove();

                if (!buildingHours || buildingHours.length === 0) {
                    return false;
                }

                if (settings.forDate) { //filter building hours for that date only
                    if (!moment.isMoment(settings.forDate)) {
                        settings.forDate = moment(settings.forDate);
                    }
                }
                var selectedTZOffset = getChosenOffsetMinutes();

                $.each(settings.buildings, function (buildingIndex, building) {
                    var prevCloseTime = settings.forDate.startOf('day');
                    var prevClosePosition = 0;
                    var filteredBldHrs = $.grep(buildingHours, function (b) {
                        return ((moment(b.Date).isSame(settings.forDate.startOf('day'), 'day') ||
                            moment(b.Date).isSame(settings.forDate.clone().startOf('day').subtract(1, 'd'), 'day')) && b.BuildingId == building.Id);
                    });
                    var numOfBldgHours = filteredBldHrs ? filteredBldHrs.length : 0;

                    $.each(filteredBldHrs, function (i, hours) {
                        var buildingRoomRows = originalElement.find('.room-row[data-building-id=' + hours.BuildingId + ']');
                        var buildingHoursOpenTemplate;
                        var buildingHoursCloseTemplate;

                        if (hours.ClosedAllDay && moment(hours.Date).isSame(settings.forDate.startOf('day'), 'day')) {
                            buildingHoursOpenTemplate = $('<div class="building-hours">')
                                .css('width', "100%")
                                .css('left', 0)
                                .append($("<div class='closed-element l'>").text(vems.browse.closedLabel))
                                .append($("<div class='closed-element r'>").text(vems.browse.closedLabel));

                            if (buildingHoursOpenTemplate) {
                                buildingRoomRows.append(buildingHoursOpenTemplate.clone());
                            }
                        } else {
                            var offset = getActualBuildingOffset(building.Id);
                            offset = selectedTZOffset + (-1 * offset);

                            //handle overnight building hour config
                            if (hours.OpenTime > hours.CloseTime) {

                                if (moment(hours.Date).isBefore(settings.forDate.startOf('day'), 'day')) { //if prev day
                                    prevClosePosition = hours.CloseTimePosition;  //save for next iteration
                                    prevCloseTime = moment(hours.GMTClose);

                                    if (numOfBldgHours == 1) {  //not guaranteed to have 2 rows
                                        buildingHoursCloseTemplate = $('<div class="building-hours">')
                                              .css('width', minutesInDay - hours.CloseTimePosition)
                                              .css('left', prevClosePosition)
                                           .append($("<div class='closed-element l'>").text(vems.browse.closedLabel))
                                           .append($("<div class='closed-element r'>").text(vems.browse.closedLabel));

                                        if (buildingHoursCloseTemplate) {
                                            buildingRoomRows.append(buildingHoursCloseTemplate.clone());
                                        }
                                    }
                                } else {  //for the current day, but is also overnighter
                                    //var currduration = moment(hours.OpenTime).diff(moment(hours.OpenTime).startOf('day'), 'minutes');
                                    var currduration = moment(hours.OpenTime).diff(moment(hours.OpenTime).startOf('day'), 'minutes') + offset;

                                    if ((prevClosePosition && prevClosePosition > 0)) {
                                        currduration = moment(hours.GMTOpen).diff(prevCloseTime, 'minutes');
                                    }

                                    buildingHoursCloseTemplate = $('<div class="building-hours">')
                                        .css('width', currduration)
                                        .css('left', prevClosePosition)
                                        .append($("<div class='closed-element l'>").text(vems.browse.closedLabel))
                                        .append($("<div class='closed-element r'>").text(vems.browse.closedLabel));

                                    if (buildingHoursCloseTemplate) {
                                        buildingRoomRows.append(buildingHoursCloseTemplate.clone());
                                    }
                                }
                            } else {  //normal hours with open/close on same day
                                var prevduration = 0
                                if ((prevClosePosition && prevClosePosition > 0)) {
                                    //now we can calc length of prev
                                    prevduration = moment(hours.GMTOpen).diff(prevCloseTime, 'minutes') + offset;

                                    buildingHoursCloseTemplate = $('<div class="building-hours">')
                                        .css('width', prevduration)
                                        .css('left', prevClosePosition)
                                        .append($("<div class='closed-element l'>").text(vems.browse.closedLabel))
                                        .append($("<div class='closed-element r'>").text(vems.browse.closedLabel));

                                    if (buildingHoursOpenTemplate) {
                                        buildingRoomRows.append(buildingHoursOpenTemplate.clone());
                                    }

                                    if (buildingHoursCloseTemplate) {
                                        buildingRoomRows.append(buildingHoursCloseTemplate.clone());
                                    }
                                }

                                buildingHoursCloseTemplate = null;
                                buildingHoursOpenTemplate = null;
                                if (moment(hours.Date).isSame(settings.forDate.startOf('day'), 'day')) {
                                    if ((!prevClosePosition || prevClosePosition == 0)) {
                                        buildingHoursOpenTemplate = $('<div class="building-hours">')
                                            .css('width', hours.OpenTimeLength + offset)
                                            .css('left', 0)
                                            .append($("<div class='closed-element l'>").text(vems.browse.closedLabel))
                                            .append($("<div class='closed-element r'>").text(vems.browse.closedLabel));
                                    }

                                    currduration = moment(hours.GMTClose).diff(hours.GMTOpen, 'minutes') + offset;
                                    buildingHoursCloseTemplate = $('<div class="building-hours">')
                                        .css('width', 1440 - hours.CloseTimePosition)
                                        .css('left', hours.CloseTimePosition + offset)
                                        .append($("<div class='closed-element l'>").text(vems.browse.closedLabel))
                                        .append($("<div class='closed-element r'>").text(vems.browse.closedLabel));

                                    if (buildingHoursOpenTemplate) {
                                        buildingRoomRows.append(buildingHoursOpenTemplate.clone());
                                    }

                                    if (buildingHoursCloseTemplate) {
                                        buildingRoomRows.append(buildingHoursCloseTemplate.clone());
                                    }
                                }
                            }
                        }
                    });
                });
            },
            setHighlightBoxMinutes: function (boxMinutes) {
                settings.bookOptions.highlightBoxMinutes = boxMinutes;
            }
        });
    }

    function generateTimeRow(includeOverflow, building) {
        var timeRow = $('<div class="time-row">');
        var date = new Date(1900, 1, 2, 0, 0, 0);
        var offsetMinutes = 0;

        if (building) {  // only need to calculate offset minutes from the selected tz when drawing building rows
            var selectedTZOffset = getChosenOffsetMinutes();
            offsetMinutes = getActualBuildingOffset(building.Id);
            offsetMinutes = offsetMinutes + (-1 * selectedTZOffset);
        }
        var gmt = moment(date).add(offsetMinutes, 'minute');
        date = new Date(gmt.year(), gmt.month(), gmt.date(), gmt.hour(), 0, 0, 0);

        //test to see if locale is 24hr format or not
        var is24hrFormat = vems.isLocale24HrFormat();
        for (var i = 23; i >= 0; i--) {
            date = new Date(date.setHours(date.getHours() - 1));
            var hourString = moment(date).format('H');
            if (!is24hrFormat) {
                hourString = i === 0 || i === 12 || i === settings.bookOptions.startHour ? moment(date).format('h a') : moment(date).format('h');
            }

            timeRow.prepend('<div class="time-box"><div class="time-box-value">' + hourString + '</div></div>');
        }

        if (includeOverflow) {
            timeRow.prepend('<div class="time-box-overflow" /><div class="time-box-placeholder" />');
        }

        return $('<div class="time-row-container">').append(timeRow);
    };

    function buildGrid() {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
        var container = $('<div class="grid">');

        generateGridRows(container);

        if (settings.useCalculatedHeight) {
            container.find('.column-container').css('height', h - getExistingElementHeights() - getScrollSizes()[1]);
            originalElement.append($('<div class="grid-scroll">').css('height', h - getExistingElementHeights()).append(container));
        } else {
            container.find('.column-container').css('height', '100%');
            originalElement.append($('<div class="grid-scroll">').css('height', '100%').css('overflow-y', 'hidden').append(container));
        }

        originalElement.find('.grid-scroll').scrollLeft(settings.bookOptions.startHour * 60);

        setupGridScroll();

        if (settings.useCalculatedHeight) {
            setupWindowResize();
        }

        if (settings.bookOptions.highlightBoxMinutes && settings.bookOptions.highlightBoxMinutes.length > 0 && settings.bookOptions.highlightBoxMinutes[0] != settings.bookOptions.highlightBoxMinutes[1]) {
            //originalElement.find('.grid-container').append(startRow).append(endRow);
            $.each(settings.buildings, function (buildingIndex, building) {
                var buildingOffsetMod = building.OffsetMinutes % 60;
                var offsetToApply = settings.bookOptions.highlightBoxMinutes[2] == undefined ? 0 : settings.bookOptions.highlightBoxMinutes[2];

                if (buildingOffsetMod == offsetToApply) {
                    offsetToApply = 0;
                }

                if (buildingOffsetMod > 0 && settings.bookOptions.highlightBoxMinutes[2] == 0) {
                    offsetToApply = buildingOffsetMod;
                }

                // apply the negative remainder when the current building doesn't have a half hour offset but the rest do.
                if (buildingOffsetMod == 0 && settings.bookOptions.highlightBoxMinutes[2] > 0) {
                    offsetToApply = settings.bookOptions.highlightBoxMinutes[2] * -1;
                }

                var startPosition = settings.bookOptions.highlightBoxMinutes[0] + offsetToApply;
                var endPostion = settings.bookOptions.highlightBoxMinutes[1] + offsetToApply;

                // they picked an end time behind the start, add a day
                if (endPostion < startPosition) {
                    endPostion += 1440;
                }

                var startRow = $('<div class="highlight-row">').css('left', startPosition);
                var endRow = $('<div class="highlight-row">').css('left', endPostion);
                var buildingRooms = $('.room-row[data-building-id=' + building.Id + ']');
                buildingRooms.append(startRow).append(endRow);
            });
        }
    };

    function generateGridRows(container) {
        var columnContainer = $('<div class="column-container">');
        var gridContainer = $('<div class="grid-container">');

        var reservableColumn = $('<div class="header-column column ellipsis-text"><span>' + settings.labels.roomsYouCanReserveLabel + '</span></div>');
        var reservableRow = $('<div class="header-row grid-row">');
        var requestableColumn = $('<div class="header-column column ellipsis-text"><span>' + settings.labels.roomsYouCanRequestLabel + '</span></div>');
        var requestableRow = $('<div class="header-row grid-row">');

        if (settings.mode === 'reserve') {
            columnContainer.append(reservableColumn);
            columnContainer.append(requestableColumn);

            gridContainer.append(reservableRow);
            gridContainer.append(requestableRow);
        }

        var hasReservabledRooms = false;
        var hasRequestableRooms = false;

        $.each(settings.buildings, function (buildingIndex, building) {
            if (building.Rooms.length === 0) {
                return true;
            }

            if (settings.mode === 'reserve') {
                if (building.HasReservableRooms) {
                    requestableColumn.before(generateBuildingColumn(building));
                    requestableRow.before(generateBuildingRow(building));
                }

                if (building.HasRequestableRooms) {
                    columnContainer.append(generateBuildingColumn(building));
                    gridContainer.append(generateBuildingRow(building));
                }
            } else {
                columnContainer.append(generateBuildingColumn(building));
                gridContainer.append(generateBuildingRow(building));
            }

            $.each(building.Rooms, function (roomIndex, room) {
                if (settings.mode === 'reserve') {
                    if (room.RecordType == 1) { // reserve
                        requestableColumn.before(generateRoomColumn(room));

                        var roomRow = generateRoomRow(room);
                        requestableRow.before(roomRow);

                        hasReservabledRooms = true;
                    }
                    if (room.RecordType == 2) { // request
                        columnContainer.append(generateRoomColumn(room));

                        var roomRow = generateRoomRow(room);
                        gridContainer.append(roomRow);

                        hasRequestableRooms = true;
                    }
                } else {
                    columnContainer.append(generateRoomColumn(room));

                    var roomRow = generateRoomRow(room);
                    gridContainer.append(roomRow);
                }
            });
        });

        if (settings.mode === 'reserve') {
            if (!hasReservabledRooms) {
                reservableColumn.hide();
                reservableRow.hide();
            } else {
                reservableColumn.show();
                reservableRow.show();
            }

            if (!hasRequestableRooms) {
                requestableColumn.hide();
                requestableRow.hide();
            } else {
                requestableColumn.show();
                requestableRow.show();
            }
        }

        columnContainer.append($('<div class="gutter">'));

        container.append(columnContainer);
        container.append(gridContainer);

        if (settings.bookOptions.gridRowsRendered && $.isFunction(settings.bookOptions.gridRowsRendered)) {
            settings.bookOptions.gridRowsRendered(container);
        }
    }

    function generateBuildingColumn(building) {
        var buildingColumn = $('<div class="building-column column">').attr('data-building-id', building.Id);
        var buildingNameText = building.DisplayText + " (" + building.TimeZone + ")";
        $('<div class="column-text" ' + 'title="' + vems.decodeHtml(buildingNameText) + '">' + buildingNameText + '</div>').appendTo(buildingColumn);
        $('<div class="column-label">' + vems.browse.capLabel + ' </div>').appendTo(buildingColumn);
        return buildingColumn;
    }

    function generateBuildingRow(building) {
        var buildingRow = $('<div class="building-row grid-row">').attr('data-building-id', building.Id);
        if (settings.mode == 'reserve' || settings.mode == 'exchange') {
            buildingRow.append(generateTimeRow(false, building));
        }

        return buildingRow;
    }

    function getChosenTimeZoneId() {
        var tz = 0;
        if ($('#tz-select').length > 0) {
            tz = $('#tz-select').val();
        }
        if (tz == 0 && $('#timeZoneDrop').length > 0) {
            tz = $('#timeZoneDrop').val();
        }
        if (tz == 0 && $('#ems_TimezoneId').length > 0) {
            tz = $('#ems_TimezoneId').val();
        }

        return tz;
    }

    function getChosenOffsetMinutes() {
        var tzId = 0;
        if ($('#ems_TimezoneId').val()) {
            tzId = $('#ems_TimezoneId').val();
        } else {
            if (settings.mode === 'browse') {
                tzId = vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue('TimeZone');
            } else {
                tzId = $('#timeZoneDrop').val();
            }
        }

        var offset = $.grep(self.availableBuildingTimeZones, function (v, i) {
            return v.TimeZoneId == parseInt(tzId);
        });

        if (offset.length > 0) {
            return offset[0].OffsetMinutes;
        } else {
            return 0;
        }
    }

    function getActualBuildingOffset(buildingId) {
        var offsetMinutes = 0;
        var buildingDefault = $.grep(settings.buildings, function (v, i) {
            return v.Id == buildingId;
        });
        if (buildingDefault && buildingDefault.length > 0) {
            offsetMinutes = buildingDefault[0].OffsetMinutes;
        }
        return offsetMinutes;
    }

    function generateRoomColumn(room) {
        var roomColumn = $('<div class="room-column column">').attr('data-room-id', room.Id).attr('data-building-id', room.BuildingID);

        if (settings.mode === 'browse') {
            $('<div class="column-text"><a href="#" class="location">' + room.DisplayText + '</a></div>').appendTo(roomColumn);
        } else if (settings.mode === 'reserve') {
            if (roomRequestModel && roomRequestModel.cart.bookingEditing() != null && roomRequestModel.cart.bookingEditing().RoomId() == room.Id
                && vems.roomRequest && vems.roomRequest.pageMode && (vems.roomRequest.pageMode === 'EditBooking' || vems.roomRequest.pageMode === 'EditPamLocation')) {
                $('<div class="column-text"><a href="#"><i class="book-action-icon book-add-to-cart"></i></a><a href="#" class="location">' + room.DisplayText + '</a></div>').appendTo(roomColumn);
            } else {
                // add 'available' and 'unavailable' room column placeholders
                var availRoom = $('<div class="column-text available"><a href="#"><i class="book-action-icon book-add-to-cart fa fa-plus-circle"></i></a><a href="#" class="location">' + room.DisplayText + '</a></div>');
                var unavailRoom = $('<div class="column-text unavailable"><span><i class="book-action-icon fa fa-minus-circle"></i></span><a href="#" class="location">' + room.DisplayText + '</a></div>');

                // set availability based on what's in the cart
                var roomInCart = false;
                if (roomRequestModel) {
                    var filterDate = roomRequestModel.filters.date();
                    var filterStart = roomRequestModel.filters.start();
                    var filterEnd = roomRequestModel.filters.end();
                    roomInCart = $.grep(roomRequestModel.cart.bookings(), function (booking) {
                        return roomRequestModel.roomMatchesCart(booking.RoomId(), room.Id, booking.Date(), booking.Start(), booking.End());
                    }).length > 0;
                }
                if (roomInCart) {
                    availRoom.css('display', 'none');
                } else {
                    unavailRoom.css('display', 'none');
                }

                availRoom.appendTo(roomColumn);
                unavailRoom.appendTo(roomColumn);
            }
        } else {
            $('<div class="column-text">'
                + '<a href="#" style="display: none;"><i class="book-action-icon book-cancel fa fa-minus-circle"></i></a>'
                + '<a href="#" style="display: none;"><i class="book-action-icon book-edit fa fa-pencil"></i></a>'
                + '<a href="#" class="location">' + room.DisplayText + '</a></div>').appendTo(roomColumn);
        }

        roomColumn.attr('title', vems.decodeHtml(room.DisplayText));
        $('<div class="column-label">' + (room.Capacity == -1 ? "" : room.Capacity) + ' </div>').appendTo(roomColumn);

        return roomColumn;
    }

    function generateRoomRow(room) {
        return $('<div class="room-row grid-row">')
            .attr('data-room-id', room.Id)
            .attr('data-building-id', room.BuildingID)
            .attr('data-setup-minutes', room.SetupHours * 60)
            .attr('data-teardown-minutes', room.TeardownHours * 60);
    }

    function buildAvailabilityLegend() {
        if (!settings.legendItems || settings.legendItems.length === 0) {
            return false;
        }

        if (originalElement.find('.legend-row').length > 0) {
            var legendRow = originalElement.find('.legend-row').detach();

            originalElement.append(legendRow);
            return false;
        }

        var popoverRow = $('<div class="row legend-row"><a data-toggle="popover">' + vems.browse.AvailabilityLegendLabel + '</a></div>');
        originalElement.append(popoverRow)

        var legendContent = '<div>';

        for (var i = 0; i < settings.legendItems.length; i++) {
            var color = settings.legendItems[i].color;
            var name = settings.legendItems[i].name;

            legendContent += '<div class="legend-color-row"><div class="legend-color" style="background-color: ' + color + ';"></div><span>' + name + '</span></div>';
        }

        legendContent += '</div>';

        popoverRow.find('a').popover({
            trigger: 'click',
            placement: 'auto',
            html: 'true',
            title: vems.browse.AvailabilityLegendLabel,
            content: legendContent,
        });
    }

    function drawEvents() {
        // map or group by room first to make this faster?
        if (!settings.bookings) {
            settings.bookings = [];
        }

        var selectedTZOffset = getChosenOffsetMinutes();
        var disableAddCart = false;
        $.each(settings.bookings, function (bookingIndex, booking) {
            var roomElement = $('.room-row[data-room-id=' + booking.RoomId + ']');
            var start = booking.StartPosition;

            // we need to adjust event positions when displaying on Room Request to support multi TZ display
            if (settings.mode == 'reserve' || settings.mode == 'exchange') {
                if (settings.buildings.length > 0) {
                    var bookingOffset = selectedTZOffset;

                    if (settings.mode == 'exchange') {
                        buildingOffset = getActualBuildingOffset(roomElement.data('buildingId'));
                        if (selectedTZOffset != 0 && buildingOffset != selectedTZOffset) {
                            // add 1440 minutes (1 day) to properly draw events occurring past midnight (i.e., the next day)
                            if (!moment(settings.forDate).isSame(moment(booking.TimeBookingStart), 'day')) {
                                start += 1440;
                            }
                            start = start + selectedTZOffset - buildingOffset;
                        }

                    } else {
                        if (bookingOffset != 0 && bookingOffset != selectedTZOffset) {
                            start = start + selectedTZOffset - bookingOffset;
                        }
                    }
                }
            }

            // draw extra setup/teardown on events to account for time needed on any new event created (prevents confusion in perceived availability)
            var roomSetupMinutes = roomElement.data('setup-minutes');
            var roomTeardownMinutes = roomElement.data('teardown-minutes');
            start -= roomTeardownMinutes;
            if (settings.showSetupTeardown) {
                booking.SetupWidth += roomTeardownMinutes;
                booking.TeardownWidth += roomSetupMinutes;
            } else {
                booking.EventWidth += roomSetupMinutes + roomTeardownMinutes;
            }

            var eventContainer = $('<div class="event-container">')
                .css('left', start)
                .attr('data-room-id', booking.RoomId)
                .attr('data-booking-id', booking.Id)
                .attr('data-private', !booking.DisplayDetails)
                .attr("title", vems.decodeHtml(booking.DisplayText));

            if (!booking.DisplayDetails) {
                eventContainer.css('cursor', 'default');
            }

            if (booking.WebUserIsOwner) {
                eventContainer.addClass('owner');
            }

            if (booking.SetupWidth > 0) {
                eventContainer.append($('<div class="event-setup setup">').css('width', booking.SetupWidth));
            }

            var eventWidth = start + booking.EventWidth < 1440
                ? booking.EventWidth
                : booking.EventWidth - booking.SetupWidth - ((start + booking.EventWidth) - 1440);

            eventContainer.append($('<div class="event">')
                .text(vems.decodeHtml(booking.DisplayText))
                .css('width', eventWidth)
                .css('color', booking.TextColor))
                .attr('title', vems.decodeHtml(booking.DisplayText));

            if (booking.TeardownWidth > 0) {
                eventContainer.append($('<div class="event-teardown setup">').css('width', booking.TeardownWidth));
            }

            roomElement.append(eventContainer);

            if (settings.mode === 'exchange') {
                var roomColumn = $('.room-column[data-room-id=' + booking.RoomId + ']');

                if (booking.CanCancel && !booking.IsHost) {
                    roomColumn.find('.book-cancel').parent().show();
                } else {
                    roomColumn.find('.book-cancel').parent().hide();
                }

                if (booking.CanEdit) {
                    roomColumn.find('.book-edit').parent().show();
                } else {
                    roomColumn.find('.book-edit').parent().hide();
                }
            }
        });

        if (settings.mode === 'reserve') {
            var addRows = $('i.book-add-to-cart').parents('.room-column');

            $.each(addRows, function (i, v) {
                var addRow = $(v);
                disableAddCart = doesOvernightRequestTimeViolateBuildingHours(addRow.data('buildingId'));
                var roomRow = $('.room-row[data-room-id=' + addRow.data('roomId') + ']');

                if (disableAddCart === true) {
                    addRow.find('i.book-add-to-cart').parent().css('visibility', 'hidden');
                } else {
                    var timeLeft = roomRow.parent().find('.highlight-row').length === 0 ? 0 : roomRow.parent().find('.highlight-row').eq(0).position().left;
                    var timeRight = roomRow.parent().find('.highlight-row').length === 0 ? 0 : roomRow.parent().find('.highlight-row').eq(1).position().left;
                    var roomEvents = roomRow.find('.event-container');
                    var buildingHours = roomRow.find('.building-hours');

                    if (buildingHours.length === 2) {

                        var open = 0; // buildingHours.eq(0).position().left + buildingHours.eq(0).width();
                        var close = buildingHours.eq(0).position().left;
                        var open2 = buildingHours.eq(0).position().left + buildingHours.eq(0).width();
                        var close2 = buildingHours.eq(1).position().left;

                        if ((timeLeft >= open && timeRight <= close) || (timeLeft >= open2 && timeRight <= close2)) {
                            var noCollide = true;
                        } else {
                            addRow.find('i.book-add-to-cart').parent().css('visibility', 'hidden');
                        }

                    } else if (buildingHours.length === 1) {   //deal with buildings that have overnight configurations
                        var close = buildingHours.eq(0).position().left
                        var open = buildingHours.eq(0).position().left + buildingHours.eq(0).width();

                        if (timeLeft >= open || timeRight <= close) {
                            var noCollide = true;
                        } else {
                            addRow.find('i.book-add-to-cart').parent().css('visibility', 'hidden');
                        }
                    }
                }

                //if (roomEvents && roomEvents.length > 0) {
                //    $.each(roomEvents, function (eventIndex, event) {
                //        var eventLeft = $(event).position().left;
                //        var eventRight = $(event).position().left + $(event).width();

                //        var leftCollision = timeLeft > eventLeft && timeLeft < eventRight;
                //        var rightCollision = timeRight > eventLeft && timeRight < eventRight;

                //        var fullCollision = (eventLeft == timeLeft && eventRight == timeRight)
                //            || (eventLeft == timeLeft && eventRight <= timeRight)
                //            || (eventLeft >= timeLeft && eventRight == timeRight)
                //            || (eventLeft >= timeLeft && eventRight <= timeRight);

                //        if (leftCollision || rightCollision || fullCollision)
                //            addRow.find('i.book-add-to-cart').parent().css('visibility', 'hidden');
                //    });
                //}
            });
        }

        buildAvailabilityLegend();

        if (settings.bookOptions.onEventsDrawn && $.isFunction(settings.bookOptions.onEventsDrawn)) {
            settings.bookOptions.onEventsDrawn();
        }
    };

    function doesOvernightRequestTimeViolateBuildingHours(buildingId) {
        //is requested time an overnighter?
        if (self.endDate.hour() < self.startDate.hour() || (self.endDate.hour() === self.startDate.hour() && (self.endDate.minute() === self.startDate.minute()))) {
            if (settings.forDate) { //filter building hours for tomorrow only
                if (!moment.isMoment(settings.forDate)) {
                    settings.forDate = moment(settings.forDate);
                }
            }

            //check if next day's building hours are defined
            if (self.buildingHours && self.buildingHours.length > 0) {

                var tomorrow = settings.forDate.clone().add(1, 'day').startOf('day');
                var filteredBldHrs = $.grep(self.buildingHours, function (b) {
                    return (moment(b.Date).isSame(tomorrow, 'day') && b.BuildingId == buildingId); //|| moment(b.Date).isSame(settings.forDate.clone().add('day', 1).startOf('day').subtract(1, 'd'), 'day'));
                });
                if ($.isArray(filteredBldHrs) && filteredBldHrs.length > 0) {
                    //we did find defined bldg hours, are tomorrow's times overnight definitions?
                    if (moment(filteredBldHrs[0].OpenTime).isAfter(moment(filteredBldHrs[0].CloseTime))) {
                        //next day has overnight defintion
                        if (moment(self.endDate).isAfter(moment(self.endDate).startOf('day'))
                            && moment.utc(self.endDate).isBefore(moment.utc(filteredBldHrs[0].GMTOpen))) {
                            //disableAddCart = true;
                            return true;
                        }
                    }
                    else {
                        if (moment(self.endDate).isAfter(moment(self.endDate).startOf('day'))
                            && moment.utc(self.endDate).isBefore(moment.utc(filteredBldHrs[0].GMTOpen))) {
                            //disableAddCart = true;
                            return true;
                        }
                    }
                }
            }
        }//end of overnighter check
        return false;
    }

    function drawCreatedEvent(element, clickPosition) {
        if (moment($('#dateHeader span').eq(0).text()).isBefore(moment([moment().year(), moment().month(), moment().date()]))) {
            return false;
        }

        if ($(element).children('.building-hours').length > 0) {
            var buildingHourCollision = false;

            $.each($(element).children('.building-hours'), function (i, v) {
                var left = $(v).position().left;
                var width = $(v).width();

                if (clickPosition > left && clickPosition < left + width) {
                    buildingHourCollision = true;
                    return false;
                }
            });

            if (buildingHourCollision) {
                return false;
            }
        }

        var roomId = $(element).data('roomId');
        var roomName = $('.room-column[data-room-id=' + roomId + '] .column-text').text();
        var hour = Math.floor(clickPosition / 60);
        var nowMinutes = moment().hour() * 60 + moment().minutes();
        if (moment($('#dateHeader span').eq(0).text()).date() == moment().date() && hour - moment().hour() < 0) {
            return false;
        }            

        var left = hour * 60;
        var width = 60;
        var collidedLeft = { collision: false, elementPosition: 0, elementWidth: 0 };
        var collidedRight = { collision: false, elementPosition: 0 };
        $.map($(element).children('.event-container'), function (n, i) {
            var leftPosition = $(n).position().left;
            var rightPosition = leftPosition + $(n).width();

            leftCollision = leftPosition > hour * 60 && leftPosition < hour * 60 + 60
            rightCollision = rightPosition > hour * 60 && rightPosition < hour * 60 + 60

            if (leftCollision) {
                width = leftPosition % 60;
                left -= width - leftPosition % 60;

                if (!collidedLeft.collision) {
                    collidedLeft.collision = true;
                    collidedLeft.elementPosition = $(n).position().left;
                    collidedLeft.elementWidth = $(n).width();
                }
            }

            if (rightCollision) {
                left += rightPosition % 60;
                width = 60 - rightPosition % 60;

                if (!collidedRight.collision) {
                    collidedRight.collision = true;
                    collidedRight.elementPosition = $(n).position().left;
                    collidedRight.elementWidth = $(n).width();
                }
            }

            if (collidedLeft.collision && collidedRight.collision) {
                left = collidedRight.elementPosition + collidedRight.elementWidth;
                width = collidedLeft.elementPosition - collidedRight.elementPosition - collidedRight.elementWidth;
            }
        });

        if (!collidedLeft.collision && !collidedRight.collision && moment($('#dateHeader span').eq(0).text()).date() == moment().date()) {
            if (moment().hours() * 60 === hour * 60) { // in the same hour as the current time
                var mod = moment().minutes() % 60;

                if (mod > 45) { // >= 45 minutes into hour
                    hour += 1;
                    left = hour * 60;
                } else if (mod > 30) {
                    left = hour * 60 + 45;
                } else if (mod > 15) {
                    left = hour * 60 + 30;
                } else if (mod > 0) {
                    left = hour * 60 + 15;
                }
            }
        }

        var eventContainer = $('<div class="event-container new">')
                .css('left', left)
                .attr('data-room-id', roomId)
                .attr('data-booking-id', -1);

        eventContainer.append($('<div class="event">')
            .css('width', width));

        $(element).append(eventContainer);

        var start = moment([1900, 1, 1, hour, left % 60]);
        var end = moment([1900, 1, 1, hour, left % 60]).add(width, 'minute');

        bindReservationModal(roomId, roomName, start, end);
    }

    function bindReservationModal(roomId, roomName, start, end) {
        var date = moment(vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue('StartDate'));
        if (!date.isValid()) {
            date = moment(vems.browse.dynamicFilters.data('dynamicFilters').getFilterValue('StartDate'), 'YYYY-MM-D');
        }
        $('#reservation-modal .date-message').text(date.format('ddd LL') + " " + vems.browse.inLabel + " " + roomName);
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
                  $('#reservation-modal-template').append(
                      $('<option></option>').val(v.key).html(v.value));
              });

              if (templates.length == 1) {
                  $('#reservation-modal-template').attr('disabled', 'disabled');
                  $('#reservation-modal-template').parent().hide();
              } else {
                  $('#reservation-modal-template').removeAttr('disabled');
                  $('#reservation-modal-template').parent().show();
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
    }

    function bindDeferredEvents() {
        if (settings.canBook) {
            $(originalElement).on('click', '.room-row', function (e) {
                drawCreatedEvent(this, getClickPosition(this, e).x);
                return false;
            });
        }

        $(originalElement).on('click', '.event-container', function (e) {
            var bookingId = $(this).data('bookingId');
            var isPrivate = $(this).data('private');
            if (bookingId == -1 || isPrivate) {
                return false;  // do nothing if they click on an event they're creating or it's a private event
            }

            if ($.isFunction(settings.bookOptions.bookingClicked)) {
                settings.bookOptions.bookingClicked(bookingId);
            }

            return false;
        });

        $(originalElement).on('click', '.room-column .column-text a.location', function (e) {
            var room = $(e.currentTarget).parents('.room-column');
            var buildingId = room.data('buildingId');
            var roomId = room.data('roomId');
            vems.locationDetailsVM.show(buildingId, roomId);
            return false;
        });

        if (settings.mode == "reserve" && $.isFunction(settings.bookOptions.onAddBookingClick)) {
            $(originalElement).on('click', '.book-add-to-cart', function (e) {
                settings.bookOptions.onAddBookingClick(e);
            });
        }

        if (settings.mode == "exchange") {
            if ($.isFunction(settings.bookOptions.onCancelBookingClick)) {
                $(originalElement).on('click', '.book-cancel', function (e) {
                    settings.bookOptions.onCancelBookingClick(e);
                });
            }

            if ($.isFunction(settings.bookOptions.onEditBookingClick)) {
                $(originalElement).on('click', '.book-edit', function (e) {
                    settings.bookOptions.onEditBookingClick(e);
                });
            }
        }
    }

    function getScrollSizes() {
        var el = document.createElement('div');
        el.style.visibility = 'hidden';
        el.style.overflow = 'scroll';
        document.body.appendChild(el);
        var w = el.offsetWidth - el.clientWidth;
        var h = el.offsetHeight - el.clientHeight;
        document.body.removeChild(el);
        return new Array(w, h);
    }

    function setupGridScroll() {
        originalElement.find('.grid-scroll').on('scroll', function (e) {
            originalElement.find('.time-row-container').scrollTo(this.scrollLeft);
            originalElement.find('.column-container').scrollTo(this.scrollTop);
        });
    }

    function getExistingElementHeights() {
        return $('#filterContainer').height() + $('#locationsContainer').height() + $('.navbar').height() + 100;
    }

    function setupWindowResize() {
        $(window).on('resize', function () {
            self.resize();
        });
    }

    function getClickPosition(element, event) {
        var rect = element.getBoundingClientRect();

        var scrollTop = document.documentElement.scrollTop ?
                        document.documentElement.scrollTop : document.body.scrollTop;

        var scrollLeft = document.documentElement.scrollLeft ?
                        document.documentElement.scrollLeft : document.body.scrollLeft;

        var elementLeft = rect.left + scrollLeft;
        var elementTop = rect.top + scrollTop;

        return {
            x: event.pageX - elementLeft,
            y: event.pageY - elementTop
        };
    }
})(jQuery);
