(function ($) {

    var curtain = function (elem, options) {
        this.elem = elem;

        // GG - This is a good idea in theory, not sure in practice
        // Take advantage of HTML5 data attributes
        // <div class='ggtest' data-plugin-options='{}'></div>
        var inlineOptions = this.elem.data("plugin-options");

        this.options = $.extend({}, $.fn.curtain.defaults, options, inlineOptions);

    };

    curtain.prototype = {

        init: function () {
            var self = this;
            var el = self.elem;
            var elWidth = self.options.openSize ? self.options.openSize : el.width();
            var isHorizontal = self.options.direction == 'rtl' || self.options.direction == 'ltr';

            self.options.originalCss = $.extend(true, {}, el.position(), { width: elWidth, height: el.height() });

            if (self.options.state == 'closed' && isHorizontal) {
                el.width(self.options.closedSize);
            } else if (self.options.state == 'closed') {
                el.height(self.options.closedSize);
            }

            el.addClass('vems-slide');

            buildAnchor(self);
            bindEvents(self);

            el.trigger('ready');

            return this;
        },
        close: function () {
            var self = this;
            self.options.state = "open";
            animationLibrary[self.options.direction](self);

            return self.elem;
        },
        open: function () {
            var self = this;
            self.options.state = "closed";
            animationLibrary[self.options.direction](self);

            return self.elem;
        },
        toggle: function () {
            var self = this;
            animationLibrary[self.options.direction](self);

            return self.elem;
        },
        hideAnchor: function () {
            var self = this;
            self.anchor.hide();

            return self.elem;
        },
        getState: function () {
            var self = this;

            return self.options.state;
        }
    }

    var animationLibrary = {
        'rtl': function (self) {
            var el = self.elem;
            var anchor = self.anchor;
            var state = self.options.state;
            var openWidth = self.options.openSize ? self.options.openSize : self.options.originalCss.width;

            if (state == 'open') {
                el.trigger('closeBegin');
                anchor.css('transform', 'translateX(-' + (parseInt(anchor.css('left')) - self.options.anchorPos) + 'px)');
                el.width(self.options.closedSize);
                anchor.children('span').css('transform', 'rotateZ(180deg)');
                self.options.state = 'closed';
                animationHandler(el, 'closeEnd');
            } else {
                var leftOffset = anchor.outerWidth() / 2;
                el.trigger('openBegin');
                anchor.css('transform', 'translateX(' + (self.options.originalCss.width - leftOffset - self.options.anchorPos) + 'px)');
                el.width(openWidth);
                if (self.options.clickOpensClosedCurtain)
                    anchor.removeClass(self.options.anchor.hoverClass);
                anchor.children('span').css('transform', 'rotateZ(0deg)');
                self.options.state = 'open';
                animationHandler(el, 'openEnd');
            }

        },
        'ltr': function () {

        },
        'ttb': function () {

        },
        'btt': function (self) {
            var el = self.elem;
            var anchor = self.anchor;
            var state = self.options.state;
            var openHeight = self.options.openSize ? self.options.openSize : self.options.originalCss.height;

            if (state == 'open') {
                el.trigger('closeBegin');
                anchor.css('transform', 'translateY(-' + (self.options.originalCss.height - self.options.closedSize) + 'px)');
                el.height(self.options.closedSize);
                anchor.children('span').css('transform', 'rotateZ(180deg)');
                self.options.state = 'closed';
                animationHandler(el, 'closeEnd');
            } else {
                el.trigger('openBegin');
                anchor.css('transform', 'translateY(0px)');
                el.height(openHeight);
                anchor.children('span').css('transform', 'rotateZ(0deg)');
                self.options.state = 'open';
                anchor.removeClass(self.options.anchor.hoverClass);
                animationHandler(el, 'openEnd');
            }
        }
    }

    var animationHandler = function (element, eventToFire) {
        element.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
                    function (event) {
                        element.trigger(eventToFire);
                    }
                );
    }

    var buildAnchor = function (self) {
        var opts = self.options;
        var aOpts = self.options.anchor;
        var isHorizontal = self.options.direction == 'rtl' || self.options.direction == 'ltr'
        var anchor = $('<button type="button" class="' + aOpts.class + ' vems-slide">'
                            + '<span class="fa fa-' + aOpts.icon + ' vems-transition-all " />'
                     + '</button>');

        anchor.appendTo(self.elem).hide();

        // Calculate the width of the closed div, and then center the anchor inside
        // We have to do this after it is inserted into the DOM so we get it's width / padding

        var anchorPadding = parseInt(anchor.css('padding-left')) + parseInt(anchor.css('padding-right'));
        var leftOffset = anchor.outerWidth() / 2;

        self.options.anchorPos = isHorizontal ?
                                 (opts.closedSize - (anchor.width() + anchorPadding)) / 2 :
                                 (self.options.originalCss.width / 2) - anchorPadding;

        var css = $.extend({}, aOpts.css, {
            opacity: 0,
            left: self.options.anchorPos,
            'transition': 'all ' + aOpts.fadeInSpeed + ' ease-in-out',
            'transform': isHorizontal ? 'translateX(' + (self.options.originalCss.width - leftOffset - self.options.anchorPos) + 'px)' : ''
        });

        anchor.css(css)

        if (self.options.showAnchor)
            requestAnimationFrame(function () { anchor.show(); });

        anchor.on('click', function () {
            animationLibrary[opts.direction](self);
        });

        self.anchor = anchor;
    }

    var bindEvents = function (self) {
        var el = self.elem;

        el.hover(
            function () {
                if (self.options.state == 'open' && self.options.showAnchor) {
                    self.anchor.css('opacity', 1);
                } else if (self.options.state == 'closed' && self.options.clickOpensClosedCurtain) {
                    self.anchor.addClass(self.options.anchor.hoverClass);
                }
            },
            function () {
                if (self.options.state == 'open' || !self.options.showAnchor) {
                    self.anchor.css('opacity', 0);
                }

                self.anchor.removeClass(self.options.anchor.hoverClass);
            }
        );

        if (self.options.clickOpensClosedCurtain) {
            el.on('click', function (event) {
                if (self.options.state == 'closed' && self.elem[0].className == event.target.className)
                    self.toggle();
            });
        }

        el.bind('openBegin', function (event) {
            event.stopPropagation();
            self.options.openBegin();
        });

        el.bind('openEnd', function (event) {
            event.stopPropagation();
            self.options.openEnd();
        });

        el.bind('closeBegin', function (event) {
            event.stopPropagation();
            self.options.closeBegin();
        });

        el.bind('closeEnd', function (event) {
            event.stopPropagation();
            self.options.closeEnd();
        });

        el.bind('ready', function (event) {
            event.stopPropagation();
            self.options.ready();
        });

    }

    var updateOptions = function (option, value, data) {
        if(data.options.hasOwnProperty(option)) {
            data.options[option] = value;
        } else {
            console.log('The curtain plugin does not have a "' + option + '" option to update')
        }
    }

    $.fn.curtain = function (options) {
        var self = this;
        var _data = self.data("vems_curtain");
        var _current;

        if (typeof options == "string") {
            updateOptions(options, arguments[1], _data);
            return;
        }

        if (_data) {
            return _data;
        }

        this.each(function () {
            var c = new curtain($(this), options).init();

            var container = self.data("vems_curtain", c);
            _current = _current ? _current.add(container) : container;
        });

        return _current ? _current : self;
    };

    $.fn.curtain.defaults = {
        direction: 'rtl',
        state: 'open',
        closedSize: 50,
        openSize: null,
        clickOpensClosedCurtain: true,
        showAnchor: true,
        anchor: {
            class: 'curtain-anchor btn btn-circle-down',
            hoverClass: 'btn-circle-down-hover',
            icon: 'chevron-left',
            fadeInSpeed: '.25s',
            css: {
                'position': 'absolute',
                'top': '50%'
            }
        },
        openBegin: function () {

        },
        openEnd: function () {

        },
        closeBegin: function () {

        },
        closeEnd: function () {

        },
        ready: function () {

        }
    }

})(jQuery);
