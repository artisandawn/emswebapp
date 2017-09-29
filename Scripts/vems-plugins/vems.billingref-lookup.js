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
    vems.BillingRefLookup = vems.BillingRefLookup || {};
    vems.BillingRefLookup.searchSourceArr = [];
    vems.BillingRefLookup.searchSource = null;  // bloodhound object
    vems.BillingRefLookup.searchStr = '';

    $.fn.BillingRefLookup = function (options) {
        self = this;
        originalElement = this;
        
        var _data = originalElement.data("ems_BillingRefLookup");
        var _current;
        //if (typeof options == "string") {
        //    updateOptions(options, arguments[1], _data);
        //    return;
        //}

        if (_data) {
            return _data;
        }

        this.each(function () {
            var c = new BillingRefLookup($(this), options);
            c.init();

            var container = originalElement.data("ems_BillingRefLookup", c);
            _current = _current ? _current.add(container) : container;
        });

        return _current ? _current : self;
    };

    function BillingRefLookup(elem, options) {
        self = this;
        settings = $.extend({}, $.fn.BillingRefLookup.defaults, options);
        self.ScreenText = settings.ScreenText;
        self.groupId = 0;

        $.extend(self, {
            init: function () {
                               
                self.initTypeAhead(originalElement);
                
                _init = false;
                return this;
            }            
        });
        
        self.SearchBillingReferences = function (typeAhead) {
            var jsonObj = {
                searchString: typeAhead.qry,
                groupId: self.groupId
            };
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/SearchBillingReferences',
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
                        self.SearchBillingReferences({ qry: query, asyncCall: async });
                    }, 400);
                },
                limit: 25,
                display: function (result) { return vems.htmlDecode(result.BillingReference); },
                classNames: {
                    suggestion: 'br-suggestion'
                },
                templates: {
                    header: function (result) {       
                        var row = $('<div class="row typeahead-header br-header" style="margin: 0;">');
                        row.append('<span class="col-md-4 col-xs-8 ellipsis-text">' +
                                self.ScreenText.BillingReferenceText + '</span>');
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
                        var row = $('<div class="row" >');
                        row.append('<span class="col-md-4 col-xs-8 ellipsis-text">' +
                                vems.htmlDecode(result.BillingReference) + '</span>');
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
            }).unbind('typeahead:select').bind('typeahead:select', function (event, ref) {
                ref.BillingReference = vems.decodeHtml(ref.BillingReference);
                settings.callBack(ref);
            }).unbind('typeahead:asynccancel').bind('typeahead:asynccancel', function (event, query, async) {
                if (timeout) {
                    clearTimeout(timeout);
                }

                $(originalElement).parent().parent().find('i.fa-search').css('display', 'inline');
                $(originalElement).parent().parent().find('.search-loading').css('display', 'none');
            }) );

            if (!DevExpress.devices.real().phone) {
                $(originalElement).siblings(".tt-menu").addClass('tt-scrollable').css('width', '600px');
            }            
            $(originalElement).find(".twitter-typeahead").css('display', 'inline');
            //$(originalElement).focus();  // re-focus on input after search
        };
                
    };
        
    $.fn.BillingRefLookup.defaults = {
        POSelected: function () { }
    };
}(jQuery));