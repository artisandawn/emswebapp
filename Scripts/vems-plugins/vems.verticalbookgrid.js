(function ($) {
    var self;
    var originalElement;

    var settings;

    $.fn.verticalBookGrid = function (options) {
        var self = this;
        originalElement = this;
        var data = this.data("deaVerticalBook");
        var current;

        if (data)
            return data;

        this.each(function () {
            var b = new verticalBookGrid(options);
            b.init();

            var container = self.data("verticalBookGrid", b);
            current = current ? current.add(container) : container;
        });

        return current ? current : this;
    };
    $.fn.verticalBookGrid.defaults = {
        startDate: moment().startOf('day'),
        events: [],
        displayDayCount: 7,
        displayDateHeaders: true,
        startHour: 8,
        hoursToDisplay: 24,
        parentElement: '',
        scrollElement: '',
        dayFormat: 'ddd, MMM Do',
        timeFormat: 'LT'
    };

    function verticalBookGrid(options) {
        self = this;
        settings = $.extend({}, $.fn.verticalBookGrid.defaults, options);

        $.extend(self, {
            init: function () {
                originalElement.addClass('vertical-book-grid-container');

                if (settings.isModal) {
                    originalElement.css('overflow', 'auto').css('height', '220px');
                }

                self.buildGrid();

                $(window).on('resize', function () {
                    var elementWidth = settings.parentElement.width() - 80;
                    originalElement.find('.v-b-cal-column').css('width', parseInt(elementWidth / settings.displayDayCount, 10) + 'px');
                });
            },
            buildGrid: function (events) {
                settings.events = events === undefined ? [] : events;
                originalElement.children().remove();

                var container = $('<div class="v-b-container"></div>');

                var timeColumn = $('<div class="v-b-time-column"></div>');

                if (settings.displayDateHeaders)
                    timeColumn.append($('<div class=v-b-time-ph></div>'));

                var daysContainer = $('<div class="v-b-days-container"></div>');
                var calColumn = $('<div class="v-b-cal-column"></div>');

                var today = moment(settings.startDate);

                for (var i = 0; i < settings.hoursToDisplay; i++) {
                    //var momentHour = moment(today).add(settings.startHour, 'hour').add(i, 'hour');
                    var momentHour = moment(today).add(i, 'hour');
                    var timeRow = $('<div class="v-b-time"><span>' + momentHour.format(settings.timeFormat) + '</span></div>');

                    if (i === 0) { // set the midnight label lower to avoid it being cut off
                        timeRow.css('top', '-4px');
                    }

                    timeColumn.append(timeRow);
                    var hourContainer = $('<div class="v-b-hour" data-hour="' + i + '"></div>');

                    hourContainer.append($('<div class="v-b-top-half-hour" data-hour="' + i + '"></div>'))
                    hourContainer.append($('<div class="v-b-bottom-half-hour" data-hour="' + i + '"></div>'))

                    calColumn.append(hourContainer);
                }

                container.append(timeColumn);

                var elementWidth = settings.parentElement.width() - 80;

                for (var day = 0; day < settings.displayDayCount; day++) {
                    var columnDate = moment(today).add(day, 'day');
                    var dayColumn = calColumn.clone();

                    dayColumn.css('width', parseInt(elementWidth / settings.displayDayCount, 10) + 'px');

                    if (settings.displayDateHeaders) {
                        dayColumn.prepend($('<div class="v-b-date">' + columnDate.format(settings.dayFormat) + '</div>'))
                    }

                    var eventsOnDate = $.grep(settings.events, function (n, i) {
                        return moment(n.Start).startOf('day').isSame(columnDate);
                    });

                    $.each(eventsOnDate, function (i, v) {
                        var position = settings.displayDateHeaders ? v.Position + 50 : v.Position;
                        if (settings.isModal) {
                            var event = $('<div class="v-b-event" style="top: ' + position + 'px; height: ' + v.Height + 'px"><span>' + v.Title + '</span><span>' + moment(v.Start).format(settings.timeFormat) + " - " + moment(v.End).format(settings.timeFormat) + '</span></div>');
                            dayColumn.prepend(event);
                        } else {
                            var event = $('<div class="v-b-event" style="top: ' + position + 'px; height: ' + v.Height + 'px"><span>' + v.Title + '</span><span>' + moment(v.Start).format(settings.timeFormat) + " - " + moment(v.End).format(settings.timeFormat) + '</span></div>');
                            dayColumn.prepend(event);
                        }
                    });

                    daysContainer.append(dayColumn);
                }

                container.append(daysContainer);
                originalElement.append(container);

                if (settings.scrollElement.length > 0) {
                    settings.scrollElement.scrollTop(settings.startHour * 60 - 10);
                }
            },
            setStartDate: function (startDate, events) {
                settings.startDate = moment(startDate).startOf('day');

                self.buildGrid(events);
            },
            getStartDate: function () {
                return settings.startDate;
            }
        });
    }
})(jQuery);
