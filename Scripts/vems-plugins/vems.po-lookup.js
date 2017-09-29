/// <reference path="knockout-3.3.0.js" />
/// <reference path="jquery.min.js" />
/// <reference path="knockout.mapping-latest.js" />
var vems = vems || {};

(function ($) {
    var self;
    var originalElement;
    var settings;
    var _init = true;
    var selectedPO;
    var groupId;
    vems.POLookup = vems.POLookup || {};
    vems.POLookup.searchSourceArr = [];
    vems.POLookup.searchSource = null;  // bloodhound object
    vems.POLookup.searchStr = '';

    $.fn.poLookup = function (options) {
        self = this;
        originalElement = this;

        var _data = originalElement.data("ems_poLookup");
        var _current;
        //if (typeof options == "string") {
        //    updateOptions(options, arguments[1], _data);
        //    return;
        //}

        if (_data) {
            return _data;
        }

        this.each(function () {
            var c = new poLookup($(this), options);
            c.init();

            var container = originalElement.data("ems_poLookup", c);
            _current = _current ? _current.add(container) : container;
        });

        return _current ? _current : self;
    };

    function poLookup(elem, options) {
        self = this;
        settings = $.extend({}, $.fn.poLookup.defaults, options);
        self.ScreenText = settings.ScreenText;
        self.groupId = 0;

        $.extend(self, {
            init: function () {
                selectedPO = null;

                self.initTypeAhead(originalElement);

                _init = false;
                return this;
            }
        });

        self.POSelected = function (po) {
            selectedPO = po;
            alert(JSON.stringify(po));
        };

        self.searchPOs = function (typeAhead) {
            var jsonObj = {
                searchString: typeAhead.qry,
                groupId: self.groupId
            };
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/SearchPOs',
                data: JSON.stringify(jsonObj),
                success: function (result) {
                    var response = JSON.parse(result.d);
                    var temp = ko.observableArray([]);
                    if (response.Success) {
                        temp = JSON.parse(response.JsonData);
                    }
                    else {
                        console.log(response.ErrorMessage);
                    }
                    typeAhead.asyncCall(temp);
                    return false;
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        };

        self.initTypeAhead = function (originalElement) {
            var timeout;
            if (settings.value && settings.value.length > 0)
                $(originalElement).val(settings.value);

            $(originalElement).typeahead('destroy');
            vems.bindLoadingGifsToTypeAhead( $(originalElement).typeahead({
                minLength: 2,
                //highlight: true
            },
            {
                source: function (query, sync, async) {
                    if (timeout) {
                        clearTimeout(timeout);
                    }

                    timeout = setTimeout(function () {
                        self.searchPOs({ qry: query, asyncCall: async });
                    }, 400);
                },
                limit: 25,
                display: function (result) { return vems.htmlDecode(result.PONumber); },
                templates: {
                    header: function (result) {
                        //return '<div class="typeahead-header">' + self.ScreenText.PONumberText + '</div>'
                        var row = $('<div class="row typeahead-header br-header" style="margin: 0;">');
                        row.append('<span class="col-md-4 col-xs-8 ellipsis-text">' +
                                self.ScreenText.PONumberText + '</span>');
                        if (!DevExpress.devices.real().phone) {
                            row.append('<span class="col-md-4 col-xs-6 ellipsis-text">' +
                                self.ScreenText.DescriptionText + '</span>');
                            row.append('<span class="col-md-4 col-xs-3 ellipsis-text">' +
                                self.ScreenText.NotesText + '</span>');
                        }
                        var r = $('<div>').append(row);
                        return r.html();
                    },
                    suggestion: function (result) {
                        //return '<div>' + vems.htmlDecode(result.PONumber) + '</div>';
                        var row = $('<div class="row" >');
                        row.append('<span class="col-md-4 col-xs-8 ellipsis-text">' +
                                vems.htmlDecode(result.PONumber) + '</span>');
                        if (!DevExpress.devices.real().phone) {
                            row.append('<span class="col-md-4 col-xs-6 ellipsis-text">' +
                                vems.htmlDecode(result.Description) + '</span>');
                            row.append('<span class="col-md-4 col-xs-3 ellipsis-text">' +
                                vems.htmlDecode(result.Notes) + '</span>');
                        }
                        var r = $('<div>').append(row);
                        return r.html();
                    },
                    notFound: '<div class="delegate-typeahead-notfound">' + self.ScreenText.NoMatchingResults + '</div>'
                }
            }).unbind('typeahead:select').bind('typeahead:select', function (event, po) {
                po.PONumber = vems.decodeHtml(po.PONumber);
                settings.callBack(po);
            }).unbind('typeahead:asynccancel').bind('typeahead:asynccancel', function (event, query, async) {
                if (timeout) {
                    clearTimeout(timeout);
                }

                $(originalElement).parent().parent().find('i.fa-search').css('display', 'inline');
                $(originalElement).parent().parent().find('.search-loading').css('display', 'none');
            }));

            if (!DevExpress.devices.real().phone) {
                $(originalElement).siblings(".tt-menu").addClass('tt-scrollable').css('width', '500px');
            }
            $(originalElement).find(".twitter-typeahead").css('display', 'inline');
            //$(originalElement).focus();  // re-focus on input after search
        };
    };

    $.fn.poLookup.defaults = {
        POSelected: function () { }
    };
}(jQuery));