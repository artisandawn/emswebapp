(function ($) {
    var self;
    var originalElement;

    var settings;

    var minutesInDay = 1440;
    var pixelsPerHour = 60;

    $.fn.attendeeGrid = function (options) {
        var self = this;
        originalElement = this;
        var data = this.data("attendeeGrid");
        var current;

        if (data)
            return data;

        this.each(function () {
            var b = new attendeeGrid(options);
            b.init();

            var container = self.data("attendeeGrid", b);
            current = current ? current.add(container) : container;
        });

        return current ? current : this;
    };

    vems.AttendeeLookup = vems.AttendeeLookup || {};
    vems.AttendeeLookup.searchSourceArr = [];
    vems.AttendeeLookup.searchSource = null;  // bloodhound object
    vems.AttendeeLookup.searchStr = '';

    $.fn.attendeeGrid.defaults = {
        attendees: ko.observableArray([]),
        timezoneId: 0,
        timeIncrement: 15,
        useCalculatedHeight: true,
        recurrenceExists: false,
        mode: 'browse', // 'reserve', 'exchange'
        ScreenText: {
            NoMatchingResults: "",
            AddAttendeeText: "",
            AttendeeText: "",
            EmailText: "",
            JobTitleText: ""
        },
        onRemoveAttendeeClick: function (attendeeId, ev) {
            alert('handle remove click');
        },
        onExplodeDistributionClick: function (attendeeId, ev) {
            alert('handle explode distribution click');
        },
        onSelectedAttendee: function (attendee) {
            alert('handle on attendee select event');
        },
        onCloseResults: function (attendee) {
        },
        onSearchItems: function (typeAhead) {
            var jsonObj = {
                searchString: typeAhead.qry,
                timezoneId: settings.timezoneId
            };

            var url = "PAMSearchAttendees";

            if (DevExpress.devices.real().phone && typeof roomRequestModel != "undefined") {
                url = "PAMSearchAttendeesAndGetAvailability";

                var start = new Date(
                    roomRequestModel.filters.date().year(),
                    roomRequestModel.filters.date().month(),
                    roomRequestModel.filters.date().date(),
                    roomRequestModel.filters.start().hours(),
                    roomRequestModel.filters.start().minutes());

                var end = new Date(
                     roomRequestModel.filters.date().year(),
                    roomRequestModel.filters.date().month(),
                    roomRequestModel.filters.date().date(),
                    roomRequestModel.filters.end().hours(),
                    roomRequestModel.filters.end().minutes());

                jsonObj.startDateTime = moment(start).format('YYYY-MM-D HH:mm:ss');
                jsonObj.endDateTime = moment(end).format('YYYY-MM-D HH:mm:ss');
                jsonObj.timeZoneId = roomRequestModel.filters.timeZoneId();
                jsonObj.minuteIncrements = 15;
                jsonObj.includeWebUser = false;
            }

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/' + url,
                data: JSON.stringify(jsonObj),
                success: function (result) {
                    var response = JSON.parse(result.d);
                    var temp = ko.observableArray([]);
                    if (response.Success) {
                        temp = JSON.parse(response.JsonData);
                    } else {
                        console.log(response.ErrorMessage);
                    }
                    typeAhead.asyncCall(temp);

                    return false;
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        }
    };

    function attendeeGrid(options) {
        self = this;
        settings = $.extend({}, $.fn.attendeeGrid.defaults, options);
        self.recurrenceExists = options.recurrenceExists;

        $.extend(self, {
            init: function () {
                originalElement.addClass('book-grid-container');
                if (!self.recurrenceExists) {
                    originalElement.append(generateTimeRow());
                }
                originalElement.append($('<div class="events-loading-overlay"><img class="loading-animation" src="Images/Loading.gif"/></div>'))
                buildGrid();
                originalElement.after('<div class="input-wrapper-for-icon" style="width: 250px; margin-left: 20px; position: relative; z-index: 200;" id="attendeeGrid-container">' +
                                        '<input class="form-control" id="attendeeLookup" type="text" placeholder="' + settings.ScreenText.AddAttendeeText + '" />' +
                                        '<i class="fa fa-search input-icon-embed"></i>' +
                                    '</div>');
                var lookupElement = $("#attendeeLookup");
                this.initTypeAhead(lookupElement);
                bindDeferredEvents();
            },
            resize: function () {
                var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

                originalElement.find('.column-container').css('height', h - getExistingElementHeights() - getScrollSizes()[1]);
                originalElement.find($('.grid-scroll').css('height', h - getExistingElementHeights()));
            },
            rebuildGrid: function (attendees) {
                originalElement.find('.grid').remove();
                originalElement.find('.grid-scroll').remove();

                settings.attendees = attendees;
                buildGrid();
                this.setEvents();
            },
            setEvents: function () {
                originalElement.find('.event-container').remove();

                drawEvents();
            },
            setHighlightBoxMinutes: function (boxMinutes) {
                settings.bookOptions.highlightBoxMinutes = boxMinutes;
            },
            initTypeAhead: function (targetElement) {
                var timeout;
                //var targetElement = $("#attendeeLookup");
                // re-initialize typeahead control
                $(targetElement).typeahead('destroy');
                vems.bindLoadingGifsToTypeAhead($(targetElement).typeahead({
                    minLength: 3,
                },
                {
                    source: function (query, sync, async) {
                        if (timeout) {
                            clearTimeout(timeout);
                        }

                        timeout = setTimeout(function () {
                            settings.onSearchItems({ qry: query, asyncCall: async });
                        }, 400);
                    },
                    limit: 25,
                    displayKey: 'DisplayName',
                    templates: {
                        suggestion: function (result) {
                            var txt = '';
                            if (DevExpress.devices.real().phone) {
                                var availableIcon = result.ResponseStatus == "Unavailable" ? "" : "fa-check";

                                txt = '<div class="row" style="margin: 0;">';
                                txt += '<a href="#" onclick="return false;"><i class="fa ' + availableIcon + '" style="margin-right: 5px; color: green;"></i></a>';
                                txt += '<span>' + vems.htmlDecode(result.DisplayName) + '</span>';
                                txt += '<span style="padding-left: 5px; color: grey;">' + vems.htmlDecode(result.Email) + '</span>';
                                txt += '</div>';
                            } else {
                                txt = '<div class="row" style="margin: 0;"><span class="col-md-3 col-xs-5"><a href="#" onclick="return false;"><i class="fa fa-plus-circle" style="margin-right: 5px"></i></a>' +
                                    vems.htmlDecode(result.DisplayName) + '</span><span class="col-md-5 col-xs-6">' +
                                    vems.htmlDecode(result.Email) + '</span><span class="col-md-4 col-xs-3">' +
                                    vems.htmlDecode(result.JobTitle) + '</span></div>';
                            }
                            return txt;
                        },
                        notFound: '<div class="delegate-typeahead-notfound">' + settings.ScreenText.NoMatchingResults + '</div>'
                    }
                }).unbind('typeahead:select').bind('typeahead:select', function (event, attendee) {
                    settings.onSelectedAttendee(event, attendee);
                    $(targetElement).blur();
                    $(targetElement).typeahead('val', '');
                }).unbind('typeahead:close').bind('typeahead:close', function (event) {
                    settings.onCloseResults(event);
                }).unbind('typeahead:asynccancel').bind('typeahead:asynccancel', function (event, query, async) {
                    if (timeout) {
                        clearTimeout(timeout);
                    }

                    $(targetElement).parent().parent().find('i.fa-search').css('display', 'inline');
                    $(targetElement).parent().parent().find('.search-loading').css('display', 'none');
                }));

                if (!DevExpress.devices.real().phone) {
                    $(targetElement).siblings(".tt-menu").css('width', '600px');
                    $(targetElement).find(".twitter-typeahead").css('display', 'inline');
                }
            }
        });
    };

    function generateTimeRow() {
        var timeRow = $('<div class="time-row">');
        var date = new Date(1900, 1, 2, 0, 0, 0);

        //test to see if locale is 24hr format or not
        var is24hrFormat = vems.isLocale24HrFormat();
        for (var i = 23; i >= 0; i--) {
            date = new Date(date.setHours(date.getHours() - 1));
            var hourString = moment(date).format('H');
            if (!is24hrFormat)
                hourString = i === 0 || i === 12 || i === settings.bookOptions.startHour ? moment(date).format('h a') : moment(date).format('h');

            timeRow.prepend('<div class="time-box"><div class="time-box-value">' + hourString + '</div></div>');
        };

        timeRow.prepend('<div class="time-box-overflow" /><div class="time-box-placeholder" />');

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
        }
        else {
            container.find('.column-container').css('height', '100%');
            originalElement.append($('<div class="grid-scroll">').css('height', '100%').css('overflow-y', 'hidden').append(container));
        }

        if (settings.useCalculatedHeight)
            setupWindowResize();

        if (self.recurrenceExists) {
            $(originalElement).find(".time-row").hide();
            //originalElement.find('.grid-scroll').css('overflow-y', null);
            var grid = $(originalElement).find(".grid");
            var gridscroll = $(originalElement).find(".grid-scroll");
            var gridcontainer = originalElement.find('.grid-container');
            gridcontainer.css('margin-left', '0');
            gridcontainer.css('width', '100%');
            grid.css('width', '100%');
            gridscroll.css('width', '100%');
        }
        else {
            originalElement.find('.grid-scroll').scrollLeft(settings.bookOptions.startHour * 60 - 5);
            setupGridScroll();

            $(originalElement).find(".time-row").show();

            if (settings.bookOptions.highlightBoxMinutes && settings.bookOptions.highlightBoxMinutes[0] != settings.bookOptions.highlightBoxMinutes[1]) {
                var startRow = $('<div class="highlight-row">').css('left', settings.bookOptions.highlightBoxMinutes[0] + 199);
                var endRow = $('<div class="highlight-row">').css('left', settings.bookOptions.highlightBoxMinutes[1] + 199);

                originalElement.find('.grid-container').append(startRow).append(endRow);
            }
        }

        buildAvailabilityLegend();
    };

    function generateGridRows(container) {
        var columnContainer = $('<div class="column-container">');
        var gridContainer = $('<div class="grid-container">');

        if (self.recurrenceExists) {
            var header = $('<div class="row room-row" style="font-weight: bold">').addClass('attendee-row');
            header.append($('<div class="col-md-4 col-xs-4">').text(settings.ScreenText.AttendeeText));
            header.append($('<div class="col-md-4 col-xs-4">').text(settings.ScreenText.EmailText));
            header.append($('<div class="col-md-4 col-xs-4">').text(settings.ScreenText.JobTitleText));
            gridContainer.append(header);
            $.each(settings.attendees(), function (index, attendee) {
                columnContainer.css('width', '100%');

                var row = generateAttendeeRow(attendee);
                gridContainer.append(row);
            });
            //container.append(columnContainer);
            gridContainer.append(gridContainer);
        }
        else {
            $.each(settings.attendees(), function (index, attendee) {
                columnContainer.append(generateAttendeeColumn(attendee));

                var row = generateAttendeeRow(attendee);
                gridContainer.append(row);

            });
            columnContainer.append($('<div class="gutter">'));
            container.append(columnContainer);
        }

        container.append(gridContainer);

    };

    function generateAttendeeColumn(attendee) {
        var attendeeColumn = $('<div class="room-column column">').attr('data-attendee-id', attendee.AttendeeGuid()); //.attr('data-building-id', attendee.AttendeeGuid());

        if (attendee.IsOwner())
            $('<div class="column-text" style="padding-left: 33px;width: 100%;">' + attendee.DisplayName() + '</a></div>').appendTo(attendeeColumn);
        else {
            var row = $('<div class="column-text" style="width: 100%;">');
            row.append($('<a href="#"><i class="remove-attendee fa fa-minus-circle"></i></a>'));
            row.append(attendee.DisplayName());
            if (attendee.IsDistributionList()) {
                row.append($('<a href="#"><i class="explode-list fa fa-plus-square-o fa-1"></i></a>'));
            }
            row.appendTo(attendeeColumn);
        }

        return attendeeColumn;
    };

    function generateAttendeeRow(attendee) {
        var cls = 'grid-row';
        var row = $('<div class="room-row">').addClass(cls).attr('data-attendee-id', attendee.AttendeeGuid());

        if (self.recurrenceExists) {
            cls = 'attendee-row';
            var row = $('<div class="row room-row">').addClass(cls).attr('data-attendee-id', attendee.AttendeeGuid());
            if (attendee.IsOwner()) {
                row.append($('<div class="col-md-4 col-xs-4" style="padding-left: 53px;">').text(attendee.DisplayName()));
            }
            else {
                var r = $('<div class="col-md-4 col-xs-4">');
                r.append($('<a href="#"><i class="remove-attendee fa fa-minus-circle"></i></a>'));
                r.append(attendee.DisplayName());
                if (attendee.IsDistributionList()) {
                    r.append($('<a href="#"><i class="explode-list fa fa-plus-square-o fa-1"></i></a>'));
                }
                row.append(r);
                //row.append($('<div class="col-md-4 col-xs-4"><a href="#"><i class="remove-attendee fa fa-minus-circle"></i></a> ' + attendee.DisplayName() + '</div>'));
            }
            row.append($('<div class="col-md-4 col-xs-4">').text(attendee.Email()));
            row.append($('<div class="col-md-4 col-xs-4">').text(attendee.JobTitle()));
        }

        return row;
    };

    function buildAvailabilityLegend() {
        if (!settings.legendItems || settings.legendItems.length === 0)
            return false;

        if (originalElement.find('.legend-row').length > 0) {
            var legendRow = originalElement.find('.legend-row').detach();

            originalElement.append(legendRow);
            return false;
        }

        var popoverRow = $('<div class="row legend-row"><a href="#" data-toggle="popover">' + vems.browse.AvailabilityLegendLabel + '</a></div>');
        originalElement.append(popoverRow)

        var legendContent = '<div>';

        for (var i = 0; i < settings.legendItems.length; i++) {
            var color = settings.legendItems[i].color;
            var name = settings.legendItems[i].name;
            var cls = settings.legendItems[i].itemClass;
            if (cls && cls.length > 0) {
                legendContent += '<div class="legend-color-row"><div class="legend-color ' + cls + '" ></div><span>' + name + '</span></div>';
            }
            else {
                legendContent += '<div class="legend-color-row"><div class="legend-color" style="background-color: ' + color + ';"></div><span>' + name + '</span></div>';
            }
        }

        legendContent += '</div>';

        popoverRow.find('a').popover({
            trigger: 'click',
            placement: 'auto',
            html: 'true',
            title: vems.browse.AvailabilityLegendLabel,
            content: legendContent,
        });
    };

    function drawEvents() {
        if (!self.recurrenceExists) {
            $.each(settings.attendees(), function (index, attendee) {
                var attendeeRow = $('.room-row[data-attendee-id="' + attendee.AttendeeGuid() + '"]');

                $.each(attendee.AttendeeEvents(), function (index, event) {
                    var eventContainer = $('<div class="event-container">')
                        .css('left', event.StartPosition())
                        .attr('data-attendee-id', attendee.AttendeeGuid())
                        .attr("title", attendee.DisplayName());

                    eventContainer.css('cursor', 'default');
                    var cls = '';
                    if (event.AvailableType() == 1)
                        cls = 'attendee-tentative';
                    else if (event.AvailableType() == 2)
                        cls = 'attendee-busy';
                    else if (event.AvailableType() == 3)
                        cls = 'attendee-outofoffice';
                    else if (event.AvailableType() == 4)
                        cls = 'attendee-noinfo';

                    eventContainer.append($('<div class="event">')
                        //.text(attendee.DisplayName())
                        .css('width', event.EventWidth()).addClass(cls));
                    //.css('color', 'gray' /*booking.TextColor*/));            

                    attendeeRow.append(eventContainer);
                });
            });
        }
    };

    function bindDeferredEvents() {
        $(originalElement).on('click', '.remove-attendee', function (e) {
            var target = $(e.currentTarget);
            var rowParent = target.parent().parent().parent();
            var attendeeId = rowParent.data('attendee-id');
            settings.onRemoveAttendeeClick(attendeeId, e);
        });

        $(originalElement).on('click', '.explode-list', function (e) {
            var target = $(e.currentTarget);
            var rowParent = target.parent().parent().parent();
            var attendeeId = rowParent.data('attendee-id');
            settings.onExplodeDistributionClick(attendeeId, e);
        });
    };

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
    };

    function setupWindowResize() {
        $(window).on('resize', function () {
            self.resize();
        });
    };

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
    };
})(jQuery);
