(function ($) {

    var infiniteScroller = function (elem, options) {
        this.elem = elem;

        // GG - This is a good idea in theory, not sure in practice
        // Take advantage of HTML5 data attributes
        // <div class='ggtest' data-plugin-options='{}'></div>
        var inlineOptions = this.elem.data("plugin-options");

        this.options = $.extend({}, $.fn.infiniteScroller.defaults, options, inlineOptions);

        if (this.options.url === null)
            throw 'A URL is required to use this plugin';
    };

    infiniteScroller.prototype = {

        init: function () {
            var self = this;
            var opts = self.options;
            var now = new Date();
            var loader = $('<div id="infinite-scroller-loader-' + now.getTime() + '" class="vems-fade"><i class="' + opts.loaderIcon + '"></i><span style="padding-left:8px">' + opts.loaderText + '</span></div>');
            var lastScrollTop = 0;

            opts.isIncrement = true;
            opts.loading = false;
            opts.disabled = false;

            if (opts.displayLoading) {
                loader.css(opts.loaderCss);
                loader.appendTo(self.elem);
                loader.css('opacity', 0);
                opts.loader = loader;
            }

            self.elem.scroll(function () {
                if (opts.loading || opts.disabled)
                    return
                
                var nowScrollTop = $(this).scrollTop();
                var el = $(this);
                var elPadding = parseInt(el.css('padding-top')) + parseInt(el.css('padding-bottom'));
                var elInfo = {
                    el: el,
                    elHeight: el.height(),
                    scrollPos: el.scrollTop(),
                    scrollHeight: el[0].scrollHeight - elPadding
                }


                if (nowScrollTop > lastScrollTop) {
                    opts.direction = 'down';
                } else {
                    opts.direction = 'up';
                }

                lastScrollTop = nowScrollTop;

                setTimeout(function () {
                    scrollHandler(elInfo, opts);
                }, opts.eventTimeout)

                
            });

            return this;
        },

        getCurrentIncrement: function () {
            var self = this;
            var opts = self.options;

            return opts.currentIcrement;
        },
        
        isLoading: function () {
            var self = this;
            var opts = self.options;

            return opts.loading;
        },

        disableHandler: function (disable) {
            //true disables
            this.options.disabled = disable;
        }
    }

    var scrollHandler = function (info, opts) {

        if (info.scrollPos >= info.scrollHeight - info.elHeight) {
            opts.isIncrement = true;
            runAjax(opts);
        } else if (info.scrollPos == 0) {
            opts.isIncrement = false;
            runAjax(opts);
        }

        //checkForVisibleEl(info.el, opts);

    }

    var setData = function (opts) {
        var template = opts.dataTemplate;
        var map = opts.dataMap;

        Object.keys(template).map(function (value, index) {
            var val = map[index].value;
            var increment = opts.isIncrement ? map[index].incrementSize : map[index].incrementSize * -1;

            if (map[index].isIncremental) {
                template[value] = Object.prototype.toString.call(val) === '[object Date]' ?
                                  moment(new Date(val.setDate(val.getDate() + increment))) :
                                  val + increment;
            } else {
                template[value] = val;
            }
        });

        opts.currentIcrement = template;
    }

    var runAjax = function (opts) {
        opts.loading = true;
        opts.loader.css('opacity', opts.loaderCss.opacity);
        setData(opts);
        $.ajax({
            type: 'POST',
            url: opts.url,
            data: JSON.stringify(opts.dataTemplate),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                opts.successCallback(result, opts.isIncrement);
                setTimeout(function () { opts.loader.css('opacity', 0); }, 750);
                opts.loading = false;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    }

    var checkForVisibleEl = function (container, opts) {
        if ($('.' + opts.visibleElementClass, container).length == 0)
            return;

        var cTop = 0,
            cBottom = container.height(),
            elem = $('.' + opts.visibleElementClass, container),
            top = elem.position().top,
            bottom = top + elem.height(),
            dir = opts.direction;

        console.log(dir)

        if (!(cBottom < top || cTop > bottom))
            opts.visibleElementTrigger(elem, dir);

    };

    var updateOptions = function (option, value, data) {
        if (data.options.hasOwnProperty(option)) {
            data.options[option] = value;
        } else {
            throw 'The Infinite Scroller plugin does not have a "' + option + '" option to update';
        }
    }

    $.fn.infiniteScroller = function (options) {
        var self = this;
        var _data = self.data("vems_infiniteScroller");
        var _current;

        if (typeof options == "string") {
            updateOptions(options, arguments[1], _data);
            return;
        }

        if (_data) {
            return _data;
        }

        this.each(function () {
            var c = new infiniteScroller($(this), options).init();

            var container = self.data("vems_infiniteScroller", c);
            _current = _current ? _current.add(container) : container;
        });

        return _current ? _current : self;
    };

    $.fn.infiniteScroller.defaults = {
        bufferPx: 250,
        url: null,
        dataTemplate: { date: '' },
        dataMap: [{
            value: new Date(),
            isIncremental: true,
            incrementSize: 1
        }],
        eventTimeout: 0,
        successCallback: function (result, isIncrement) {

        },
        visibleElementClass: null,
        visibleElementTrigger: function (index, element) {
            
        },
        displayLoading: true,
        loaderIcon: 'fa fa-spinner fa-pulse',
        loaderText: 'Loading More Bookings...',
        loaderCss: {
            position: 'fixed',
            bottom: '15px',
            width: '200px',
            height: '25px',
            background: '#000',
            left: '40px',
            opacity: 0.75,
            borderRadius: '10px',
            padding: '10px',
            lineHeight: '25px'
        }
    }
})(jQuery);
