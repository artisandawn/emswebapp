(function ($) {
    var self;
    var originalElement;
    var settings;
    var _init = true;
    var selectedDate;
    var calendarDate;
    var scrollerLocked = false;

    $.fn.calendarScroller = function (options) {
        self = this;
        originalElement = this;
        var calendarDate;

        var _data = originalElement.data("ems_calendarScroller");
        var _current;

        if (typeof options == "string") {
            updateOptions(options, arguments[1], _data);
            return;
        }

        if (_data) {
            return _data;
        }

        this.each(function () {
            var c = new calendarScroller($(this), options);
            c.init();

            var container = originalElement.data("ems_calendarScroller", c);
            _current = _current ? _current.add(container) : container;
        });

        self.removeInstance = function (c) {
            if (_current.length > 1) {
                var value = 1
                var index = $.inArray(c, _current)
                if (index > -1)
                    _current.splice(index, 1)
            }
            else {
                _current = null;
                originalElement.empty();
                originalElement.unbind().removeData();                
            }
        };

        return _current ? _current : self;
    };
    function calendarScroller(elem, options) {
        self = this;
        settings = $.extend({}, $.fn.calendarScroller.defaults, options);

        $.extend(self, {
            init: function () {
                $(originalElement).find('.calendar-scroller-container').remove(); // remove any existing calendarScroller markup
                selectedDate = settings.startDate ? moment(settings.startDate) : moment(new Date());
                selectedDate.hour(0).minute(0).second(0).millisecond(0);

                calendarDate = moment(selectedDate).add(-selectedDate.weekday(), 'day'); // set to locale aware first day of week

                originalElement.append(renderFunctions.drawContainer());

                $(originalElement).on('click', '.week-date-right', function () {
                    if (!scrollerLocked) {
                        scrollerLocked = true;
                        var element = $('.scroller-day-container.center');
                        animationFunctions.animateDays(element, -element.width());
                    }
                });
                $(originalElement).on('click', '.week-date-left', function () {
                    if (!scrollerLocked) {
                        scrollerLocked = true;
                        var element = $('.scroller-day-container.center');
                        animationFunctions.animateDays(element, element.width());
                    }
                });

                var hammertime = new Hammer(document.getElementsByClassName('calendar-scroller-cal')[0]);
                hammertime.on('tap', function (ev) {
                    if (!scrollerLocked) {
                        scrollerLocked = true;
                        var element = $(ev.srcEvent.srcElement).hasClass('calendar-scroller-day') ? $(ev.srcEvent.srcElement) : $(ev.srcEvent.srcElement).parent();

                        selectedDate = moment(element.data('date'));
                        renderFunctions.setSelectedDateStyle();
                    }
                });

                hammertime.on('swipe', function (ev) {
                    if (!scrollerLocked) {
                        scrollerLocked = true;
                        var element = $('.scroller-day-container.center');

                        if (ev.deltaX > 0) { // left to right
                            animationFunctions.animateDays(element, element.width());
                        } else { // right to left
                            animationFunctions.animateDays(element, -element.width());
                        }
                    }
                });

                renderFunctions.setSelectedDateStyle();
                self.bookingsChanged();

                _init = false;
                return this;
            },
            bookingsChanged: function (eventDates) {
                if (eventDates != undefined) {
                    settings.eventDates = eventDates;
                }

                $.each(settings.eventDates, function (i, v) {
                    $('.calendar-scroller-day[data-date="' + moment(v) + '"]').addClass('has-events');
                });
            },
            setDate: function (date) {
                // re-initialize plugin when date is set externally (to accurately re-draw week)
                settings.startDate = moment(date).hour(0).minute(0).second(0).millisecond(0);
                self.init();
            },
            setLock: function (lock) {  // this should be used by any page consuming this plugin to unlock after ajax calls complete
                scrollerLocked = !!lock;
            }
        });
    };

    var renderFunctions = {
        drawContainer: function () {
            var container = $('<div class="calendar-scroller-container">');
            var dateControl = $('<div class="calendar-scroller-date">').appendTo(container);
            var calendarContainer = $('<div class="calendar-scroller-cal">').appendTo(container);

            this.setDateControl(dateControl);
            this.setCalendar(calendarContainer);

            return container;
        },
        setDateControl: function (dateControlContainer) {
            dateControlContainer.append('<div class="week-date-left">'
                + '<button type="button" class="btn">'
                    + '<i class="fa fa-chevron-left"></i>'
                + '</button>'
            + '</div>');

            dateControlContainer.append('<div class="week-date">' + this.getWeekLongDescription() + '</div>');

            dateControlContainer.append('<div class="week-date-right">'
                + '<button type="button" class="btn">'
                    + '<i class="fa fa-chevron-right"></i>'
                + '</button>'
            + '</div>');
        },
        setCalendar: function (calendarContainer) {
            var drawDate = moment(calendarDate);

            var leftDrawDate = moment(new Date(drawDate)).add(-7, 'days');
            var rightDrawDate = moment(new Date(drawDate)).add(7, 'days');

            var container = $('<div class="calendar-scroller-cal-scroll">');

            container.append(this.buildDaysRow(leftDrawDate, 'left'));
            container.append(this.buildDaysRow(drawDate, 'center'));
            container.append(this.buildDaysRow(rightDrawDate, 'right'));

            container.appendTo(calendarContainer);
        },
        getWeekLongDescription: function () {
            var first = moment(calendarDate);
            var last = moment(calendarDate).add(6, 'day');

            return first.format('ll') + " - " + last.format('ll');
        },
        setSelectedDateStyle: function () {
            if (!moment.isMoment(selectedDate))
                selectedDate = moment(selectedDate);

            selectedDate = moment(new Date(selectedDate.year(), selectedDate.month(), selectedDate.date(), 0, 0, 0));

            $('.calendar-scroller-day').removeClass('selected');
            $('.calendar-scroller-day[data-date="' + selectedDate + '"]').addClass('selected');

            if ($.isFunction(settings.dateSelected) && !_init) {
                settings.dateSelected(selectedDate);
            }
        },
        buildDaysRow: function (drawDate, classToAdd) {
            var dateContainer = $('<div class="scroller-day-container ' + classToAdd + '">');

            for (var i = 0; i < 7; i++) {
                var date = moment(drawDate).add(i, 'day');

                var scrollerDayElement = $('<div class="calendar-scroller-day" data-date="' + date + '">'
                                            + '<div class="day">' + date.format('ddd') + '</div>'
                                            + '<div class="date">' + date.format('D') + '</div>'
                                            + '<div class="event-indicator"><i class="fa fa-circle"></i></div>'
                                        + '</div>');

                dateContainer.append(scrollerDayElement);
            }

            return dateContainer;
        }
    };

    var animationFunctions = {
        animateDays: function (element, offset) {
            $(element).animate({
                left: offset
            }, {
                duration: 500,
                step: function (now, fx) {
                    if (offset >= 0) { // going right
                        $('.scroller-day-container.right').hide();
                        $('.scroller-day-container.left').show();
                        $('.scroller-day-container.left').css('left', now - $(this).width());
                    } else { // going left
                        $('.scroller-day-container.left').hide();
                        $('.scroller-day-container.right').show();
                        $('.scroller-day-container.right').css('left', now + $(this).width());
                    }
                },
                complete: function () {
                    resetCalendarDays(offset);
                }
            });
        }
    };

    function resetCalendarDays(offset) {
        if (offset >= 0) { // going right
            $('.scroller-day-container.right').remove();
            $('.scroller-day-container.center').addClass('right').removeClass('center');
            $('.scroller-day-container.left').addClass('center').removeClass('left');

            calendarDate.add(-7, 'days');
            selectedDate.add(-7, 'days');

            $('.week-date').text(renderFunctions.getWeekLongDescription());

            $('.calendar-scroller-cal-scroll').append(renderFunctions.buildDaysRow(moment(calendarDate).add(-7, 'days'), 'left'));
        } else { // going left
            $('.scroller-day-container.left').remove();
            $('.scroller-day-container.center').addClass('left').removeClass('center');
            $('.scroller-day-container.right').addClass('center').removeClass('right');

            calendarDate.add(7, 'days');
            selectedDate.add(7, 'days');

            $('.week-date').text(renderFunctions.getWeekLongDescription());

            $('.calendar-scroller-cal-scroll').prepend(renderFunctions.buildDaysRow(moment(calendarDate).add(7, 'days'), 'right'));
        }

        renderFunctions.setSelectedDateStyle();
    };

    $.fn.calendarScroller.defaults = {
        startDate: null,
        dateSelected: function () { }
    };
}(jQuery));