(function ($) {
    var self;
    var originalElement;
    var settings;

    $.fn.reservationDetailsModal = function (options) {
        self = this;
        originalElement = this;

        var _data = originalElement.data("vems_reservationDetailsModal");

        var _current;

        if (typeof options == "string") {
            updateOptions(options, arguments[1], _data);
            return;
        }

        if (_data) {
            return _data;
        }

        this.each(function () {
            var c = new reservationDetailsModal($(this), options);
            c.init();

            var container = originalElement.data("vems_reservationDetailsModal", c);
            _current = _current ? _current.add(container) : container;
        });

        return _current ? _current : self;
    };

    function reservationDetailsModal(elem, options) {
        self = this;
        settings = $.extend({}, $.fn.reservationDetailsModal.defaults, options);

        $.extend(self, {
            init: function () {
                originalElement.append(drawModal);

                return this;
            },
            show: function (reservationId) {
                if (reservationId == undefined || reservationId <= 0)
                    return false;

                var windowHeight = $(window).height();

                if (DevExpress.devices.real().phone)
                    windowHeight = windowHeight - 140;
                else
                    windowHeight = windowHeight - 200;

                var dataStr = JSON.stringify({ reservationId: reservationId });

                vems.ajaxPost({
                    url: vems.serverApiUrl() + '/GetReservationDetails',
                    data: dataStr,
                    success: function (results) {
                        var result = JSON.parse(results.d);

                        if (result.length == 0) {
                            return false;
                        }

                        var modalBody = originalElement.find('.modal-body').css('height', windowHeight);
                        modalBody.children().remove();
                        modalBody.find(".modal-title").html(vems.decodeHtml(settings.reservationDetailsLabel));
                        
                        var table = $('<table class="table table-striped"><tbody></tbody></table');

                        $.each(result, function (i, v) {
                            table.find('tbody').append('<tr style="height: 25px;">'
                                    + '<td>' + vems.htmlDecode(i) + '</td>'
                                    + '<td>' + (v.indexOf("href") >= 0 ? v : vems.htmlDecode(v)) + '</td>'
                                + '</tr>');
                        });

                        modalBody.append(table);

                        originalElement.find('#reservation-details-modal').modal('show');

                        if ($.isFunction(settings.shown)) {
                            settings.shown();
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                        return false;
                    }
                });

                return false;
            },
            hide: function () {
                originalElement.find('#reservation-details-modal').modal('hide');

                if ($.isFunction(settings.hidden)) {
                    settings.hidden();
                }

                return false;
            }
        });
    }
    $.fn.reservationDetailsModal.defaults = {
        reservationDetailsLabel: "",
        closeLabel: "",
        shown: function () { },
        hidden: function () { }
    }

    function drawModal() {
        return $('<div id="reservation-details-modal" class="modal" role="dialog" aria-labelledby="booking-details-modal-title">'
                    + '<div class="modal-dialog" role="document">'
                        + '<div class="modal-content">'
                            + '<div class="modal-header">'
                                + '<button type="button" class="close" data-dismiss="modal" aria-label="Close" id="booking-details-modal-close-icon"><span aria-hidden="true">&times;</span></button>'
                                + '<h3 class="modal-title" id="booking-details-modal-title">' + settings.reservationDetailsLabel + '</h3>'
                            + '</div>'
                            + '<div class="modal-body" style="overflow: auto;">'
                            + '</div>'
                            + '<div class="modal-footer">'
                                + '<button type="button" data-dismiss="modal" aria-label="Close" class="btn btn-primary" id="booking-details-modal-close">' + settings.closeLabel + '</button>'
                            + '</div>'
                        + '</div>'
                    + '</div>'
                + '</div>');
    };

})(jQuery);
