var vems = vems || {};
vems.browse = vems.browse || {};

vems.browse.filterParents = {
    browseLocations: 0,
    browseEvents: 1,
    roomRequest: 2
};

vems.browse.filterTypes = {
    text: 1,
    number: 2,
    date: 3,
    time: 4,
    singleSelect: 5,
    multiSelect: 6,
    advancedMultiSelect: 7,
    locationMultiSelect: 8
};

vems.browse.compactMode = {
    compact: 0,
    verycompact: 1
};

(function ($) {
    var self;
    var settings;

    var addFilterBtn;
    var filterTitleName = '';

    var filterValues = [];
    var summaryMode = false;
    var editingSavedFilterName = false;

    var modalLoading = false;

    $.fn.dynamicFilters = function (options) {
        var self = this;

        var data = this.data("dynamicFilters");
        var current;

        if (data)
            return data;

        this.each(function () {
            var b = new dynamicFilters(options, this);
            b.init();

            var container = self.data("dynamicFilters", b);
            current = current ? current.add(container) : container;
        });

        return current ? current : this;
    };

    $.fn.dynamicFilters.defaults = {
        filterParent: vems.browse.filterParents.browseLocations,
        displaymode: 'default',
        compactViewMode: 'compact',
        applyFilterLabel: 'Apply Filter',
        requiredFilters: [],
        optionalFilters: [],
        showTimeZoneOnFirstRow: false,
        hideFavorites: false,
        filterChanged: function (filterValues) { },
        helpClicked: function () { },
        summaryViewToggled: function () { },
        findARoomClicked: function () { }
    };

    function dynamicFilters(options, element) {
        self = this;
        var originalElement = $(element);
        var uniqueId = '';

        settings = $.extend({}, $.fn.dynamicFilters.defaults, options);

        $.extend(self, {
            init: function () {
                uniqueId = Math.random().toString(36).substring(2, 7);
                addFilterBtn = $('<div class="add-filter-btn summary">')
                    .append($('<div id="add-filter-drop" class="dropdown dynamic-filter-button" style="float: left; margin-right: 10px;">'
                        + '<button class="btn btn-default dropdown-toggle" type="button" id="add-filter" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
                            + (vems.decodeHtml(settings.addFilterLabel) ? vems.decodeHtml(settings.addFilterLabel) : '<i class="fa fa-plus-circle"></i>')
                        + '</button>'
                        + '<ul class="dropdown-menu" id="add-filter-list" aria-labelledby="add-filter">'
                        + '</ul>'
                    + '</div>'));
                               

                originalElement.addClass('dynamic-filter-content form-horizontal');

                if (settings.displaymode != 'roomrequest' && settings.displaymode != 'personalization')
                    buildFilterHeader();

                var filterContainer = $('<div class="dynamic-filter-container">');            
                originalElement.append(filterContainer);                               

                if (settings.displaymode == 'roomrequest') {
                    originalElement.append($('<div class="row dynamic-filter-searchrow"><button type="button" class="btn btn-primary find-a-room btn-filter-search dynamic-filter-button" style="float: left; margin-top: 6px;">' + settings.searchText + '</button></div>'));

                    $(originalElement).on('click', '.find-a-room', function () {
                        if ($.isFunction(settings.findARoomClicked))
                            settings.findARoomClicked();
                    });
                } else if (settings.displaymode != 'personalization') {
                    originalElement.append($('<button type="button" class="btn save-filter-set dynamic-filter-button" style="float: left;"></button>').text(vems.decodeHtml(settings.saveFiltersLabel)));
                }

                if (settings.requiredFilters.length > 0) {
                    $.each(settings.requiredFilters, function (i, v) {
                        if (v.hide) {
                            self.setFilterValue(v.filterName, v.value, v.displayValue, v.filterType, true);
                        } else {
                            addFilterRow(v, true);
                        }

                        if (settings.requiredFilters.length - 1 == i) { // defer calling the change event until everything is loaded
                            self.suppressUpdate = false;
                        }
                    });
                } else {
                    self.suppressUpdate = false;  // prevent breaking of room request functionality when no filters are enabled
                }

                if (settings.showTimeZoneOnFirstRow && vems.browse.timeZones && vems.browse.timeZones.length > 0) { // slap the TZ field onto the first row
                    var tzDrop = $('<select class="form-control" style="margin-top: 10px;" id="tz-select">');

                    tzDrop.on('change', function () {
                        //filterName, value, displayValue, filterType, fromFilter
                        self.setFilterValue('TimeZone', this.value, $(this).find(":selected").text(), vems.browse.filterTypes.number, false);
                    });

                    $.each(vems.browse.timeZones, function (i, v) {
                        var tzOption = $('<option value=' + v.TimeZoneID + '>' + v.TimeZone + '</option>');

                        if (v.TimeZoneID == self.getFilterValue('TimeZone')) {
                            tzOption.prop('selected', true);
                        }

                        tzDrop.append(tzOption)
                    });

                    var floatClass = settings.displaymode == 'roomrequest' || settings.displaymode == 'personalization' ? '' : 'float-right';

                    $(originalElement).find('.dynamic-filter-row').eq(0).children('div.col-sm-3').eq(1)
                        .append($('<label class="control-label ' + floatClass + '">' + vems.decodeHtml(settings.timeZoneLabel) + '</label>'))
                        .removeClass("col-sm-3").removeClass('col-md-3')
                        .addClass('col-sm-2').addClass('col-md-2').addClass('col-xs-10');

                    $(originalElement).find('.dynamic-filter-row').eq(0).append($('<div class="col-xs-10 col-sm-4 col-md-4">').append(tzDrop));
                }                               

                if (settings.displaymode == 'none') {
                    originalElement.children().hide();
                }

                setAddFilterBtnItems();
                buildAdvanceModal();
                buildSavingModal();
                buildSavedFiltersModal();
                deferEvents();

                if (settings.unauthenticated) {
                    originalElement.find('.save-filter-set').hide();
                    originalElement.find('#savedFiltersBtn').hide();
                }
            },
            addFilterItem: function (element) {
                var filterRow = $(element).parents('.dynamic-filter-row').eq(0);

                var filterName = filterRow.data('filterName');
                var filterLabel = filterRow.data('filterLabel');
                var filterType = filterRow.data('filterType');

                if (filterType == vems.browse.filterTypes.multiSelect) {
                    loadMultiSelect(filterName, element);
                }

                if (filterType == vems.browse.filterTypes.advancedMultiSelect) {
                    loadAdvancedMultiSelect(filterName, filterLabel, element);
                }

                if (filterType == vems.browse.filterTypes.locationMultiSelect) {
                    loadLocationMultiSelect(filterName, filterLabel, element);
                }

                return false;
            },
            setFilterValue: function (filterName, value, displayValue, filterType, fromFilter) {
                var filterExists = false;
                var filterRow = $('.dynamic-filter-row[data-filter-name="' + filterName + '"]');

                if (!displayValue)
                    displayValue = "";

                $.each(filterValues, function (i, v) {
                    if (v.filterName == filterName) {
                        v.value = value;
                        v.displayValue = displayValue;
                        filterExists = true;


                        if (filterRow.length === 1 && displayValue.length === 0)  // they unselected everything, reset the filter
                            v.displayValue = filterRow.data('filterDefaultDisplayValue');
                        else {
                            v.displayValue = displayValue;
                        }

                        filterRow.find('p').text(v.displayValue);

                        return false;
                    }
                });

                if (!filterExists) {
                    filterValues.push({ filterName: filterName, value: value, displayValue: displayValue, filterType: filterType });
                }

                if (filterRow) {
                    if (!fromFilter) { // something external made a change.  sync the filter
                        var filterType = filterRow.data('filterType');

                        if (filterType == vems.browse.filterTypes.date || filterType == vems.browse.filterTypes.time) {
                            filterRow.find('.date').data('DateTimePicker').date(value);
                        }

                        if (filterType == vems.browse.filterTypes.text || filterType == vems.browse.filterTypes.number) {
                            filterRow.find('input').val(value);
                        }
                    }

                    if (filterRow.data('linkedFilterName')) {
                        var linkedFilterName = filterRow.data('linkedFilterName');
                        var linkedFilterType = filterRow.data('linkedFilterType');
                        var linkedFilterInterval = filterRow.data('linkedFilterInterval');

                        if (linkedFilterType == vems.browse.filterTypes.date) {
                            var linkedFilterValue = $.grep(filterValues, function (v, i) {
                                return v.filterName == linkedFilterName;
                            });

                            if (linkedFilterValue.length > 0) {
                                linkedFilterValue[0].value = moment(value).add(linkedFilterInterval, 'day');
                            } else {
                                filterValues.push({ filterName: linkedFilterName, value: moment(value).add(linkedFilterInterval, 'day'), displayValue: '', filterType: filterType });
                            }
                        }
                    }

                    filterRow.find('button#add-filter').prop('disabled', false);
                }

                prepValuesForAjax();

                if (!settings.suppressFilterChanged && $.isFunction(settings.filterChanged) && !self.suppressUpdate)
                    settings.filterChanged(filterValues, filterName);

                originalElement.find('.save-filter-set').prop('disabled', false);
            },
            getFilterValue: function (filterName) {
                var value;

                $.each(filterValues, function (i, v) {
                    if (v.filterName == filterName) {
                        value = v.value;
                        return false;
                    }
                });

                return value;
            },
            getFilterDisplayValue: function (filterName) {
                var value;

                $.each(filterValues, function (i, v) {
                    if (v.filterName == filterName) {
                        value = v.displayValue;
                        return false;
                    }
                });

                return value;
            },
            getFilterValueCollection: function () {
                return filterValues;
            },
            getFilterValueCollectionForAjax: function () {
                prepValuesForAjax();
                return filterValues.slice();
            },
            summaryToggle: function () {
                if (summaryMode) {
                    if (settings.compactViewMode === vems.browse.compactMode.compact) {
                        originalElement.find('.summary').show();
                        $(this).text(settings.compactViewLabel);
                    }
                    else {
                        originalElement.find('.dynamic-filter-container').children('.filter-title').remove();
                        originalElement.find('.dynamic-filter-container').children().show();
                    }
                }
                else {
                    if (settings.compactViewMode === vems.browse.compactMode.compact) {
                        originalElement.find('.summary').hide();
                        $(this).text(settings.editViewLabel);
                    } else {
                        originalElement.find('.dynamic-filter-container').children().hide();

                        var filterLabel = '(' + originalElement.find('.dynamic-filter-container').children().length + ' ' + vems.decodeHtml(settings.filtersLabel) + ')';
                        var labelContainer = $('<div class="dynamic-filter-row form-group filter-title">' + (filterTitleName.length > 0 ? filterTitleName : getDynamicFilterName()) + ' <span>' + filterLabel + '</span></div>');

                        originalElement.find('.dynamic-filter-container').append(labelContainer);
                    }
                }

                summaryMode = !summaryMode;
            },
            saveFilterSet: function (name) {
                vems.ajaxPost(
                   {
                       url: vems.serverApiUrl() + '/SaveDynamicFilter',
                       data: JSON.stringify({ filterName: name, filterParent: settings.filterParent, filterValues: filterValues, saveTime: moment().format('YYYY-MM-D HH:mm:ss') }),
                       success: function (results) {
                           var data = JSON.parse(results.d);

                           if (data.Success) {
                               vems.showToasterMessage('', data.Message, 'success');
                               originalElement.find('.save-filter-set').prop('disabled', true)
                           } else {
                               vems.showToasterMessage('', data.Message, 'warning');
                           }
                       },
                       error: function (xhr, ajaxOptions, thrownError) {
                           console.log(thrownError);
                           return false;
                       }
                   });
            },
            loadFilterSet: function (filterSet) {
                self.suppressUpdate = true;  // suppress updates until after loaded filter values have been set (to prevent multiple updates)
                setFilters(filterSet);
                if ($.isFunction(settings.filterChanged)) {
                    settings.filterChanged(filterValues);
                }
                self.suppressUpdate = false;
            },
            loadFilterSetById: function (filterSetId) {
                vems.ajaxPost(
                 {
                     url: vems.serverApiUrl() + '/GetFilterSet',
                     data: JSON.stringify({ id: filterSetId }),
                     success: function (results) {
                         var data = JSON.parse(results.d);

                         filterTitleName = data[0].FilterName;
                         $('.filter-title div').text(vems.decodeHtml(settings.filterLabel) + " (" + filterTitleName + ")").data('filterSetId', filterSetId);

                         var filterValues = JSON.parse(data[0].FilterValues);
                         self.loadFilterSet(filterValues);
                     },
                     error: function (xhr, ajaxOptions, thrownError) {
                         console.log(thrownError);
                         return false;
                     }
                 });
            },
            deleteFilterSet: function (filterSetId) {
                if (filterSetId == $('.filter-title div').data('filterSetId'))
                    $('.filter-title div').text(vems.decodeHtml(settings.filtersLabel));

                vems.ajaxPost(
                 {
                     url: vems.serverApiUrl() + '/DeleteFilterSet',
                     data: JSON.stringify({ id: filterSetId }),
                     success: function (results) {
                         var data = JSON.parse(results.d);

                         if (data.Success) {
                             originalElement.find('#savedFilterModal tr.selected').remove();
                         } else {
                             vems.showToasterMessage('', data.Message, 'warning');
                         }
                     },
                     error: function (xhr, ajaxOptions, thrownError) {
                         console.log(thrownError);
                         return false;
                     }
                 });
            },
            setTemplateId: function (templateId) { settings.templateId = templateId; },
            suppressFilterChanged: function (val) {
                settings.suppressFilterChanged = val;
            },
            destroy: function () {
                originalElement.removeClass('dynamic-filter-content form-horizontal');
                originalElement.removeData('dynamicFilters');
                originalElement.off();
                originalElement.empty();
                filterValues = [];
                settings = null;
            },
            suppressUpdate: true
        });

        function buildFilterHeader() { // builds the header of the filter container
            var headerRow = $('<div class="row dynamic-filter-header">')
                .append($('<div class="col-md-8 hidden-xs filter-title">').append($('<div>').text(vems.decodeHtml(settings.filtersLabel))));

            var actionContainer = $('<div class="col-md-4 col-xs-12 action-container">');

            if (!$.isFunction(settings.helpClicked)) {
                actionContainer.append($('<div class="filter-header-button">').append($('<button type="button" class="btn btn-default" id="helpBtn"><i class="fa fa-question"></i></button>')))
            }

            actionContainer.append($('<div class="filter-header-label">').append($('<a href="#" id="savedFiltersBtn">').text(vems.decodeHtml(settings.savedFiltersLabel))))
            .append($('<div class="filter-header-label">').append($('<a href="#" id="summaryBtn">').text(vems.decodeHtml(settings.compactViewLabel))));

            headerRow.append(actionContainer);

            originalElement.append(headerRow);
        };

        function setAddFilterBtnItems() {
            addFilterBtn.find('li').remove();

            var usedFilters = $.map(originalElement.find('.dynamic-filter-row'), function (v, i) {
                return $(v).attr('data-filter-name');
            });

            $.each(settings.optionalFilters, function (i, v) {
                if ($.inArray(v.filterName, usedFilters) == -1) {
                    addFilterBtn.find('ul').append('<li><a href="#">' + v.filterLabel + '</a></li>');
                }
            });

            if (addFilterBtn.find('li').length === 0)
                addFilterBtn.find('#add-filter').hide();
            else
                addFilterBtn.find('#add-filter').show();
        };

        function addFilterRow(filter, locked, showFilterOnAdd) {
            addFilterBtn.find('.dropdown').removeClass('open')
            addFilterBtn.detach();

            var filterRow = $('<div class="dynamic-filter-row form-group ' + settings.displaymode + '" data-filter-type="' + filter.filterType + '" data-filter-name="' + filter.filterName + '" data-filter-label="' + filter.filterLabel + '" data-filter-default-display-value="' + vems.decodeHtml(filter.defaultDisplayValue) + '">');

            if (locked)
                filterRow.addClass('filter-locked');

            if (filter.linkedFilterName) {
                filterRow
                    .attr('data-linked-filter-name', filter.linkedFilterName)
                    .attr('data-linked-filter-type', filter.linkedFilterType)
                    .attr('data-linked-filter-interval', filter.linkedFilterInterval);
            }

            var floatClass = settings.displaymode == 'roomrequest' || settings.displaymode == 'personalization' ? '' : 'float-right';

            var labelContainer = $('<div class="filter-label-column ' + (settings.displaymode == 'roomrequest' ? 'col-sm-8 col-md-8' : ' col-sm-2 col-md-2') + '"><label class="control-label ' + floatClass + '">' + filter.filterLabel + '</label></div>');
            filterRow.append(labelContainer);

            switch (filter.filterType) {
                case vems.browse.filterTypes.date:
                case vems.browse.filterTypes.time:
                    var pickerIcon = filter.filterType == vems.browse.filterTypes.time ? 'fa-clock-o' : 'fa-calendar';

                    var datePicker = $("<div class='col-sm-3 col-md-3 col-xs-10'>"
                                          + "<div class='date input-group' d='" + filter.filterName + "'>"
                                              + "<input type='text' class='form-control' />"
                                              + '<span class="input-group-addon"><span class="fa ' + pickerIcon + '"></span></span>'
                                          + "</div>"
                                  + "</div>");

                    filterRow.append(datePicker);
                    filterRow.append($('<div class="col-sm-3 col-md-3"></div>'));

                    datePicker.find('.date').datetimepicker({
                        locale: moment.locale(),
                        minDate: new Date(1, 1, 1900),
                        defaultDate: filter.value,
                        format: filter.filterType == vems.browse.filterTypes.time ? 'LT' : 'ddd L',
                        ignoreReadonly: true,
                        showTodayButton: true,
   
                        icons: {
                            today: "date-picker-today-btn"
                        },
                        widgetPositioning: {
                            horizontal: 'left'
                        }
                    });
                    break;
                case vems.browse.filterTypes.text:
                case vems.browse.filterTypes.number:
                    var textContainer = $('<div class="' + (settings.displaymode == 'roomrequest' ? 'col-sm-8 col-md-8' : 'col-sm-6 col-md-6 col-xs-8') + '"></div>');
                    if (filter.filterType == vems.browse.filterTypes.number) {
                        textContainer.append($('<input class="form-control numeric" value="' + filter.value + '">').attr('type', 'number').attr('min', 0));
                        textContainer.on('keydown', '.numeric', function (event) {
                            if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                                        (event.keyCode == 65 && event.ctrlKey === true) || (event.keyCode == 173 || event.keyCode == 189 || event.keyCode == 190 || event.keyCode == 110) ||
                                        (event.keyCode >= 35 && event.keyCode <= 39)) {  //|| event.keyCode == 188  // don't allow commas on IE
                                return;
                            } else {
                                // stop the key press when necessary
                                if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                                    event.preventDefault();
                                }
                            }
                        });
                    } else {
                        textContainer.append($('<input class="form-control" value="' + filter.value + '">').attr('type', 'text'));
                    }

                    filterRow.append(textContainer);

                    if (settings.displaymode != 'roomrequest' && settings.displaymode != 'personalization' && settings.displaymode != 'default')
                        filterRow.append("<div class='col-xs-1col-sm-2 col-md-2'><a href='#' class='apply-filter-action-item'><i class='fa fa-filter'></i>" + vems.decodeHtml(settings.applyFilterLabel) + "</a></div>")
                    filterRow.append($('<div class="col-sm-1 col-md-1"></div>'));

                    filterRow.find('input').on('keyup', function (e) {
                        if (e.which === 13) {
                            $(filterRow).find('input').blur();
                            return false;
                        }
                    });
                    break;
                case vems.browse.filterTypes.singleSelect:
                    var dropdownContainer = $('<div class="' + (settings.displaymode == 'roomrequest' ? 'col-sm-12 col-md-12' : 'col-sm-6 col-md-6 col-xs-8') + '"></div>');

                    var select = $('<select class="form-control" style="margin-top: 6px;">');

                    $.each(filter.items, function (i, v) {
                        if (v.Id == filter.value)
                            select.append("<option value=" + v.Id + " selected>" + v.Description + "</option>");
                        else
                            select.append("<option value=" + v.Id + ">" + v.Description + "</option>");
                    });

                    dropdownContainer.append(select);

                    filterRow.append(dropdownContainer);

                    if (settings.displaymode != 'roomrequest')
                        filterRow.append($('<div class="col-sm-3 col-md-3"></div>'));
                    break;
                case vems.browse.filterTypes.multiSelect:
                case vems.browse.filterTypes.advancedMultiSelect:
                case vems.browse.filterTypes.locationMultiSelect:
                    var advContainer = $('<div class="' + (settings.displaymode == 'roomrequest' ? 'col-sm-12 col-md-12' : 'col-sm-6 col-md-6 col-xs-8') + '"></div>').addClass(filter.filterType);

                    if (settings.displaymode == "roomrequest") {

                        advContainer.append(
                           $('<div class="form-control-static" style="padding-top: 0; margin-top: 7px;">')
                           .append($('<p>').text(vems.decodeHtml(filter.displayValue)))
                           );


                        if (DevExpress.devices.real().phone) {
                            labelContainer.append($('<a class="dynamic-filter-item-add summary" href="#"></a>').text(settings.displaymode == 'roomrequest' ? vems.decodeHtml(settings.addRemoveLabel) : vems.decodeHtml(settings.addRemoveLabel) + " " + filter.filterLabel))
                        } else {
                            labelContainer.parent().append($('<a class="dynamic-filter-item-add summary" href="#"></a>').text(settings.displaymode == 'roomrequest' ? vems.decodeHtml(settings.addRemoveLabel) : vems.decodeHtml(settings.addRemoveLabel) + " " + filter.filterLabel))
                        }
                    } else {
                        advContainer.append(
                            $('<div class="form-control-static">')
                            .append($('<p>').text(vems.decodeHtml(filter.displayValue)))
                            .append($('<a class="dynamic-filter-item-add summary" href="#"></a>').text(settings.displaymode == 'roomrequest' ? vems.decodeHtml(settings.addRemoveLabel) : vems.decodeHtml(settings.addRemoveLabel) + " " + filter.filterLabel))
                            );
                    }

                    filterRow.append(advContainer);
                    break;
            }

            if (!locked) { // add the minus button for filter removal if it's allowed
                $('.filter-remove').removeClass('col-md-1').addClass('col-md-3');

                filterRow.append($('<div class="col-sm-1 col-md-1 col-xs-1 filter-remove summary" style="padding-right: 10px; margin-left: 10px;">'
                    + '<button type="button" class="btn dynamic-filter-remove dynamic-filter-button" style="float: right;"><i class="fa fa-minus-circle"></i></button>'
                    + '</div>'));
            }

            originalElement.find('.dynamic-filter-container').append(filterRow);

            setAddFilterBtnItems();

            if (!filter.value || filter.value.length === 0) {
                addFilterBtn.find('button#add-filter').prop('disabled', true);
            }

            filterRow.append(addFilterBtn);

            filterValues.push({ filterName: filter.filterName, value: filter.value, displayValue: filter.displayValue, filterType: filter.filterType });

            if (filter.linkedFilterName) {
                filterValues.push({ filterName: filter.linkedFilterName, value: moment(filter.value).add(filter.linkedFilterInterval, 'day'), filterType: filter.linkedFilterType });
            }

            $(filterRow.find('input')).on('keypress', function (e) {
                if (e.keyCode === 13 || e.keyCode === 46) { //enter, dot
                    return false;
                }

                if ($(e.currentTarget).attr('type') == 'number') {
                    if (e.keyCode === 101) { // e
                        return false;
                    }
                }
            });

            $(filterRow.find('input')).on('keyup', function (e) {
                if ($(e.currentTarget).attr('type') == 'number') {
                    var val = $(e.currentTarget).val();

                    if (val > 999999) {
                        $(e.currentTarget).val(999999);
                    }
                }
            });

            if (showFilterOnAdd)
                filterRow.find('.dynamic-filter-item-add').click();
        }

        function removeFilterRow(filterRow) {
            var filterName = filterRow.attr('data-filter-name');

            filterValues = $.grep(filterValues, function (v) {
                return v.filterName != filterName;
            });

            var moveAddFilterButton = filterRow.find(addFilterBtn).length != 0;

            if (moveAddFilterButton) {
                addFilterBtn.find('button#add-filter').prop('disabled', false);
                addFilterBtn.detach();
            }

            filterRow.remove();

            if (moveAddFilterButton) {
                $('.dynamic-filter-row').last().find('.filter-remove').removeClass('col-md-4').addClass('col-md-1');
                $('.dynamic-filter-row').last().append(addFilterBtn);
            }

            setAddFilterBtnItems();

            prepValuesForAjax();
            if ($.isFunction(settings.filterChanged) && !self.suppressUpdate)
                settings.filterChanged(filterValues, filterName);
        };

        function setFilters(filterSet) {
            originalElement.find(".dynamic-filter-row:not(.filter-locked)").remove();

            if (filterValues.length > 0) {
                if (settings.displaymode == 'personalization')
                    filterValues.length = 1; // trim the filters down to the single valid value for editing from account
                else
                    filterValues.length = 4;  // trims filters down to just required filters when loading (startdate, enddate, timezone, locations)
            }

            $.each(filterSet, function (i, v) {
                var filter = $.map(settings.optionalFilters, function (val, index) {
                    if (val.filterName === v.filterName) {
                        val.value = v.value;
                        val.displayValue = v.displayValue;
                        return val;
                    }
                })[0];

                if (filter) {
                    addFilterRow(filter, false);
                } else {  // if it's not an optional filter, check if it's a required filter, and just set the value
                    $.each(settings.requiredFilters, function (idx, filter) {
                        if (filter.filterName === v.filterName) {
                            if (v.filterType === 7 || v.filterType === 8) {  // manually set display for multi-select items
                                $('.dynamic-filter-row[data-filter-name="' + v.filterName + '"]').find('p').text(v.displayValue);
                            } else if (v.filterName === 'TimeZone') {  // specific exception for TimeZone filter
                                $('#tz-select').val(v.value);
                            }
                            self.setFilterValue(v.filterName, v.value, v.displayValue, v.filterType, true);
                        }
                    });
                }
            });

            prepValuesForAjax();
            if ($.isFunction(settings.filterChanged) && !self.suppressUpdate) {
                settings.filterChanged(filterValues);
            }
        };

        function loadMultiSelect(filterName, element) {
            var filterRow = $(element).parents('.dynamic-filter-row');

            var selectedValues = self.getFilterValue(filterRow.data('filterName'));

            if (!$.isArray(selectedValues))
                selectedValues = selectedValues.split(',');

            if (!$(element).data('bs.popover')) {
                !$(element).find('.popover-markup').remove();

                var popover = $('<div class="popover-markup dynamic-filter-popover">'
                            + '<div class="title hide"><a href="#" class="popover-close fa fa-close"></a><a href="#" class="popover-close-apply"><i class="fa fa-filter"></i>' + vems.decodeHtml(settings.applyFilterLabel) + '</a></div>'
                           + '<div class="content hide form-group">'
                           + '</div>'
                       + '</div>');

                var locations = $.isArray(self.getFilterValue('Locations')) ? self.getFilterValue('Locations')
                    : (self.getFilterValue('Locations') ? self.getFilterValue('Locations').split(',') : null);

                var filterData = { filterName: filterName, facilityIds: locations, processTemplateId: -1 };

                if (settings.templateId && settings.templateId > 0) {
                    filterData.processTemplateId = settings.templateId;
                }

                vems.ajaxPost(
                {
                    url: vems.serverApiUrl() + '/GetFilterItems',
                    data: JSON.stringify(filterData),
                    success: function (results) {
                        var items = JSON.parse(results.d);

                        $.each(items, function (i, v) {
                            var checkbox = $(
                                '<div class="checkbox">'
                                    + '<label>'
                                        + '<input type="checkbox" class="filter-checkbox" value="' + v.Id + '">'
                                        + v.Description
                                    + '</label>'
                                + '</div>');

                            popover.find('.content').append(checkbox);

                            if ($.inArray(v.Id.toString(), selectedValues) >= 0) {
                                checkbox.find('.filter-checkbox').attr('checked', true);
                            }
                        });

                        $(element).parent().append(popover);

                        if (!$(element).data('bs.popover')) {
                            var popOverItem = $(element).popover({
                                html: true,
                                placement: 'bottom',
                                title: function () {
                                    return $(this).parent().find('.title').html();
                                },
                                content: function () {
                                    return $(this).parent().find('.content').html();
                                }
                            });
                        }

                        $(element).data('bs.popover').show();
                        $('.popover').parent().append("<div class='popover-overlay'>");
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                        return false;
                    }
                });
            } else {
                destroyFilterPopover(filterRow, true);
            }
        };

        function loadAdvancedMultiSelect(filterName, filterLabel, element) {
            modalLoading = true;
            setAdvancedModalUI();

            var filterRow = $(element).parents('.dynamic-filter-row');
            var modal = originalElement.find('#filterModal');
            modal.find('.selected-group div').remove();

            modal.find('h4').text(filterLabel);
            modal.find('.btn-primary').text(vems.decodeHtml(settings.updateLabel) + ' ' + filterRow.find('label').text());
            modal.find('input').attr('placeholder', vems.decodeHtml(settings.findByXLabel.replace('{0}', filterLabel.toLowerCase())));
            modal.find('.checkbox-group-all label span').text(vems.decodeHtml(settings.selectAllXLabel.replace('{0}', filterLabel.toLowerCase())));
            modal.find('input.filter-checkbox.all-box').prop('checked', false);  // uncheck 'select all' checkbox by default
            modal.find('.selected-group-label').text(vems.decodeHtml(settings.selectedXLabel.replace('{0}', filterLabel)));

            var selectedValues = self.getFilterValue(filterRow.data('filterName'));

            if (!$.isArray(selectedValues))
                selectedValues = selectedValues.split(',');

            var filterData = { filterName: filterName, facilityIds: null, processTemplateId: -1 };

            if (settings.templateId && settings.templateId > 0) {
                filterData.processTemplateId = settings.templateId;
            }

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/GetFilterItems',
                data: JSON.stringify(filterData),
                success: function (results) {
                    var items = JSON.parse(results.d);
                    var checkboxGroup = modal.find('.checkbox-group.main');
                    checkboxGroup.find('.checkbox').remove();
                    modal.find('.checkbox-group.secondary').find('.checkbox').remove();  // remove checkboxes from secondary group in case locations modal was also opened (areas)

                    var selectedCount = 0;
                    $.each(items, function (i, v) {
                        var checkbox = $(
                            '<div class="checkbox" data-type="' + v.Type + '">'
                                + '<label>'
                                    + '<input type="checkbox" class="filter-checkbox" value="' + v.Id + '">'
                                    + v.Description
                                + '</label>'
                            + '</div>');

                        checkboxGroup.append(checkbox);

                        if ($.inArray(v.Id, selectedValues) >= 0 || $.inArray(v.Id.toString(), selectedValues) >= 0) {
                            checkbox.find('.filter-checkbox').prop('checked', true);
                            selectedCount++;
                        }
                    });

                    // check 'select all' box when all items are selected
                    if (selectedCount > 0 && selectedCount === items.length) {
                        modal.find('input.filter-checkbox.all-box').prop('checked', true);
                    }

                    setAdvancedModalSelected();
                    modal.data('filterName', filterRow.data('filterName'));
                    modal.modal('show');
                    modal.off('hidden.bs.modal').on('hidden.bs.modal', function () {
                        $('.filter-modal-typeahead').val('');  // clear search text when multi-select modal is closed
                    });
                    checkboxGroup.animate({ scrollTop: 0 });

                    modalLoading = false;
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                    modalLoading = false;

                    return false;
                }
            });
        };

        function loadLocationMultiSelect(filterName, filterLabel, element) {
            modalLoading = true;
            setAdvancedModalUI('location');

            var filterRow = $(element).parents('.dynamic-filter-row');
            var modal = originalElement.find('#filterModal');
            modal.find('.selected-group div').remove();
            modal.find('.responsive-tab-drop').val(0);

            modal.find('h4').text(filterLabel);
            modal.find('.btn-primary').text(vems.decodeHtml(settings.updateLabel) + ' ' + filterRow.find('label').text());
            modal.find('input').attr('placeholder', vems.decodeHtml(settings.findByXLabel.replace('{0}', filterLabel.toLowerCase())));
            modal.find('.selected-group-label').text(vems.decodeHtml(settings.selectedXLabel.replace('{0}', filterLabel)));

            var tabs = modal.find('.tab-pane');
            tabs.eq(0).find('.checkbox-group-all label span').text(vems.decodeHtml(settings.selectAllXLabel.replace('{0}', modal.find('.nav-tabs li').eq(0).text())));
            tabs.eq(1).find('.checkbox-group-all label span').text(vems.decodeHtml(settings.selectAllXLabel.replace('{0}', modal.find('.nav-tabs li').eq(1).text())));
            modal.find('.checkbox-group-all.main input.filter-checkbox.all-box').prop('checked', false);  // uncheck 'select all' checkboxes by default
            modal.find('.checkbox-group-all.secondary input.filter-checkbox.all-box').prop('checked', false);

            var selectedValues = self.getFilterValue(filterRow.data('filterName'));

            if (!$.isArray(selectedValues))
                selectedValues = selectedValues.split(',');

            var filterData = { filterName: filterName, facilityIds: null, processTemplateId: -1 };

            if (settings.templateId && settings.templateId > 0) {
                filterData.processTemplateId = settings.templateId;
            }

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/GetFilterItems',
                data: JSON.stringify(filterData),
                success: function (results) {
                    var items = JSON.parse(results.d);
                    var buildings = new Array();
                    var ungroupedBuildings = new Array();
                    var areas = new Array();
                    var views = new Array();

                    var favoriteBox = modal.find('.favorite-box');
                    favoriteBox.hide();

                    var hasFavorite = false;

                    $.each(items, function (i, v) {
                        if (v.Type == -1) {
                            buildings.push(v);
                        }

                        if (v.Type == 0) {
                            views.push(v);
                        }

                        if (v.Type == 1) {
                            areas.push(v);
                        }

                        if (v.Type == 3 && !settings.hideFavorites) {
                            hasFavorite = true;

                            favoriteBox.find('span').text(v.Description);
                            favoriteBox.addClass('show-favorites');
                            favoriteBox.show();
                            favoriteBox.find('input').data('itemVal', v.Id);
                            var fav = $.grep(selectedValues, function (o, i) { return o == v.Id; });
                            if (fav && fav.length > 0) {
                                favoriteBox.find('input').prop('checked', true);
                                addAdvancedModalSelectedItem(v.Id, v.Description, 3, modal.find('.selected-group'));
                            }
                        }
                    });

                    if (DevExpress.devices.real().phone) {
                        if (hasFavorite) {
                            favoriteBox.addClass('responsive');
                            favoriteBox.appendTo($('.responsive-favorite-container'));
                        } else {
                            modal.find('.responsive-favorite-container').hide().siblings().removeClass('col-xs-8').addClass('col-xs-12');
                        }
                    }

                    if (views.length === 0) {
                        modal.find('.nav-tabs li').eq(1).hide();
                    } else {
                        modal.find('.nav-tabs li').eq(1).show();
                    }

                    modal.find('#area-filter-btn' + uniqueId + '+ul li').remove();

                    if (areas.length > 0) {
                        var areaDrop = modal.find('#area-filter-btn' + uniqueId + '+ul');
                        var areaBuildings = new Array();

                        $.each(areas, function (i, v) {
                            var areaItem = $('<li><a href="#" data-id="' + v.Id + '">' + v.Description + '</a></li>');
                            $.merge(areaBuildings, v.AdditionalData)

                            areaItem.data('ad', v.AdditionalData);
                            areaDrop.append(areaItem);
                        });

                        $.each(buildings, function (i, v) {
                            if ($.inArray(v.Id, areaBuildings) === -1) {
                                ungroupedBuildings.push(v);
                            }

                        });

                        areaDrop.prepend($('<li><a href="#" data-id="-1">' + vems.decodeHtml(settings.showAllAreasLabel) + '</a></li>'));
                        areaDrop.prepend($('<li class="area-filter-type-ahead"><input type="text" class="area-type-ahead" placeholder="' + vems.decodeHtml(settings.searchForAnAreaLabel) + '"></input><i class="fa fa-search"></i><hr /></li>'));

                        if (ungroupedBuildings.length > 0) {
                            areaDrop.append($('<li><a href="#" data-id="-2">' + vems.decodeHtml(settings.ungroupedBuildingsLabel) + '</a></li>').data('ad', ungroupedBuildings.map(function (v) { return v.Id })));
                        }
                    } else {
                        var areaFilterContainer = modal.find('.area-filter-container');
                        var buildingFilterContainer = modal.find('.building-filter-container');

                        areaFilterContainer.removeClass('col-sm-4');
                        buildingFilterContainer.removeClass('col-sm-8');

                        buildingFilterContainer.addClass('col-sm-12');

                        areaFilterContainer.hide();
                    }

                    var checkboxGroupMain = modal.find('.checkbox-group.main');
                    checkboxGroupMain.find('.checkbox').remove();

                    var selectedBuildingCount = 0;
                    $.each(buildings, function (i, v) {
                        var checkbox = $(
                            '<div class="checkbox" data-type="' + v.Type + '">'
                                + '<label>'
                                    + '<input type="checkbox" class="filter-checkbox" value="' + v.Id + '">'
                                    + v.Description
                                + '</label>'
                            + '</div>');

                        checkboxGroupMain.append(checkbox);

                        if ($.inArray(v.Id, selectedValues) >= 0 || $.inArray(v.Id.toString(), selectedValues) >= 0) {
                            checkbox.find('.filter-checkbox').prop('checked', true);
                            selectedBuildingCount++;
                        }
                    });

                    // check 'select all' box when all buildings are selected
                    if (selectedBuildingCount > 0 && selectedBuildingCount === buildings.length) {
                        modal.find('.checkbox-group-all.main input.filter-checkbox.all-box').prop('checked', true);
                    }

                    $.each(modal.find('.dropdown-menu li a'), function (i, v) {
                        if ($.inArray($(v).data('id').toString(), selectedValues) > -1 && $(v).data('id') > 0) {
                            addAdvancedModalSelectedItem($(v).data('id'), $(v).text(), 1, modal.find('.selected-group'));
                        }
                    });

                    var checkboxGroupSecondary = modal.find('.checkbox-group.secondary');
                    checkboxGroupSecondary.find('.checkbox').remove();

                    if (views.length > 0) {
                        var selectedViewCount = 0;
                        $.each(views, function (i, v) {
                            var checkbox = $(
                                '<div class="checkbox" data-type="' + v.Type + '">'
                                    + '<label>'
                                        + '<input type="checkbox" class="filter-checkbox" value="' + v.Id + '">'
                                        + v.Description
                                    + '</label>'
                                + '</div>');

                            checkboxGroupSecondary.append(checkbox);

                            if ($.inArray(v.Id, selectedValues) >= 0 || $.inArray(v.Id.toString(), selectedValues) >= 0) {
                                checkbox.find('.filter-checkbox').prop('checked', true);
                                selectedViewCount++;
                            }
                        });

                        // check 'select all' box when all views are selected
                        if (selectedViewCount > 0 && selectedViewCount === views.length) {
                            modal.find('.checkbox-group-all.secondary input.filter-checkbox.all-box').prop('checked', true);
                        }
                    }

                    setAdvancedModalSelected();

                    modal.data('filterName', filterRow.data('filterName'));
                    modal.modal('show');
                    modal.off('hidden.bs.modal').on('hidden.bs.modal', function () {
                        $('.filter-modal-typeahead').val('');  // clear search text when multi-select modal is closed
                    });

                    checkboxGroupMain.animate({ scrollTop: 0 });
                    checkboxGroupSecondary.animate({ scrollTop: 0 });

                    modalLoading = false;
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);

                    modalLoading = false;
                    return false;
                }
            });
        };

        function setAdvancedModalUI(type) {
            var modal = originalElement.find('#filterModal');
            modal.find('.nav-tabs li a').eq(0).click();

            var areaFilterContainer = modal.find('.area-filter-container');
            var buildingFilterContainer = modal.find('.building-filter-container');

            var favoriteBox = modal.find('.favorite-box');

            areaFilterContainer.find('.dropdown-menu li a').eq(0).click();

            switch (type) {
                case "location":
                    if (favoriteBox.hasClass('show-favorites'))
                        modal.find('.favorite-box').show();

                    buildingFilterContainer.removeClass('col-sm-12');

                    areaFilterContainer.addClass('col-sm-4');
                    buildingFilterContainer.addClass('col-sm-8');

                    modal.find('.nav-tabs').show();
                    areaFilterContainer.show();

                    if (DevExpress.devices.real().phone) {
                        modal.find('.responsive-tab-drop').parent().parent().addClass('visible-xs').removeClass('hidden-xs');
                    }
                    break;
                default:
                    modal.find('.favorite-box').hide();

                    areaFilterContainer.removeClass('col-sm-4');
                    buildingFilterContainer.removeClass('col-sm-8');

                    buildingFilterContainer.addClass('col-sm-12');

                    modal.find('.nav-tabs').hide();
                    areaFilterContainer.hide();

                    if (DevExpress.devices.real().phone) {
                        modal.find('.responsive-tab-drop').parent().parent().removeClass('visible-xs').addClass('hidden-xs');
                    }
                    break;
            }
        }

        function destroyFilterPopover(filterRow, setValue) {
            $('.popover-overlay').remove();

            if (setValue) {
                var descriptions = [];
                var ids = [];

                filterRow.find(".popover-content input:checked").each(function (i, v) {
                    descriptions.push($(v).parent().text());
                    ids.push($(v).val());
                });

                if (ids.length === 0 && descriptions.length === 0)
                    descriptions.push(filterRow.data('filterDefaultDisplayValue'));

                filterRow.find('p').text(descriptions.join(','));
                self.setFilterValue(filterRow.data('filterName'), ids, descriptions.join(','), filterRow.data('filterType'), true);

                if (!filterRow.hasClass('filter-locked') && ids.length === 0) {
                    removeFilterRow(filterRow)
                }
            }

            if (filterRow.find('.dynamic-filter-item-add').data('bs.popover') != undefined)
                filterRow.find('.dynamic-filter-item-add').data('bs.popover').destroy();

            $('.dynamic-filter-popover').remove();
        };

        function buildAdvanceModal() {
            var container = $('<div class="modal fade" tabindex="-1" role="dialog" id="filterModal" aria-labelledby="filterModalLabel">');
            var dialog = $('<div class="modal-dialog" role="document">').appendTo(container);
            var content = $('<div class="modal-content">').appendTo(dialog);

            var header = $('<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="filterModalLabel"></h4></div>').appendTo(content);
            var body = $('<div class="modal-body">'
                            + '<ul class="nav nav-tabs hidden-xs" role="tablist">'
                                + '<li role="presentation" class="active"><a href="#filter-main' + uniqueId + '" aria-controls="filter-main" role="tab" data-toggle="tab">' + vems.decodeHtml(settings.buildingsLabel) + '</a></li>'
                                + '<li role="presentation"><a href="#filter-secondary' + uniqueId + '" aria-controls="filter-secondary" role="tab" data-toggle="tab">' + vems.decodeHtml(settings.viewsLabel) + '</a></li>'
                                + '<div class="checkbox favorite-box" style="display: none;">'
                                    + '<label>'
                                      + '<input type="checkbox">'
                                      + '<span></span>'
                                    + '</label>'
                                + '</div>'
                            + '</ul>'
                            + '<div class="row visible-xs hidden-sm">'
                                + '<div class="col-xs-8">'
                                    + '<select class="form-control responsive-tab-drop">'
                                        + '<option value="0">' + vems.decodeHtml(settings.buildingsLabel) + '</option>'
                                        + '<option value="1">' + vems.decodeHtml(settings.viewsLabel) + '</option>'
                                    + '</select>'
                                + '</div>'
                                 + '<div class="col-xs-4 responsive-favorite-container">'
                                 + '</div>'
                            + '</div>'
                            + '<div class="tab-content">'
                                + '<div role="tabpanel" class="tab-pane active fade in" id="filter-main' + uniqueId + '" style="height: 100%;">'
                                    + '<div class="row">'
                                        + '<div class="area-filter-container col-sm-4 col-xs-12">'
                                            + '<div class="btn-group" style="width: 100%">'
                                                + '<button id="area-filter-btn' + uniqueId + '" type="button" class="btn btn-default dropdown-toggle" data-togle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 100%; padding-bottom: 3px;">'
                                                    + '<span class="filter-area-dropdown">' + vems.decodeHtml(settings.filterByAreaLabel) + '</span> <span class="caret" style="vertical-align: super;"></span>'
                                                + '</button>'
                                                + '<ul class="dropdown-menu" aria-labelledby="area-filter-btn' + uniqueId + '" style="left: 20px;">'
                                                + '</ul>'
                                            + '</div>'
                                        + '</div>'
                                        + '<div class="building-filter-container col-sm-8 col-xs-12" style="margin-top: ' + (DevExpress.devices.real().phone ? 10 : 0) + 'px;">'
                                            + '<div class="input-group">'
                                                + '<input type="text" class="form-control filter-modal-typeahead">'
                                                + '<i class="fa fa-search"></i>'
                                            + '</div>'
                                        + '</div>'
                                    + '</div>'
                                    + '<div class="row">'
                                        + '<div class="checkbox-group-all main">'
                                            + '<div class="checkbox">'
                                                + '<label>'
                                                    + '<input type="checkbox" class="filter-checkbox all-box" value="-1">'
                                                    + '<span>' + vems.decodeHtml(settings.selectAllXLabel) + "</span>"
                                                + '</label>'
                                            + '</div>'
                                        + '</div>'
                                        + '<div class="checkbox-group main"></div>'
                                    + '</div>'
                                + '</div>'
                                + '<div role="tabpanel" div class="tab-pane fade" id="filter-secondary' + uniqueId + '" style="height: 100%;">'
                                    + '<div class="row">'
                                        + '<div class="input-group">'
                                            + '<input type="text" class="form-control filter-modal-typeahead-secondary">'
                                            + '<i class="fa fa-search"></i>'
                                        + '</div>'
                                    + '</div>'
                                    + '<div class="row">'
                                        + '<div class="checkbox-group-all secondary">'
                                            + '<div class="checkbox">'
                                                + '<label>'
                                                    + '<input type="checkbox" class="filter-checkbox all-box" value="-1">'
                                                    + '<span>' + vems.decodeHtml(settings.selectAllXLabel) + "</span>"
                                                + '</label>'
                                            + '</div>'
                                        + '</div>'
                                        + '<div class="checkbox-group secondary"></div>'
                                    + '</div>'
                                + '</div>'
                            + '</div>'
                            + '<div class="row">'
                                + '<div class="col-xs-12 selected-group-label"></div>'
                                + '<div class="selected-group"></div>'
                            + '</div>'
                        + '</div>').appendTo(content);

            var footer = $('<div class="modal-footer">'
                            + '<button type="button" class="btn btn-primary btn-stock"></button>'
                            + '<button type="button" class="btn btn-default btn-stock" data-dismiss="modal">' + vems.decodeHtml(settings.closeLabel) + '</button>'
                        + '</div>').appendTo(content);

            originalElement.append(container);

            if (DevExpress.devices.real().phone) {
                body.find('.area-filter-container ul').css('width', $(window).width() - 60);
            }

            var areaFilterOpen = false;
            container.find('#area-filter-btn' + uniqueId).dropdown().on('click', function (e) {
                if (areaFilterOpen) {
                    $(this).parent().removeClass('open');
                    $(this).attr('aria-expanded', false);

                    body.find('.area-type-ahead').val('');
                    body.find('.area-type-ahead').parent().siblings().show();

                    areaFilterOpen = false;
                }

                if ($(this).parent().hasClass('open')) {
                    areaFilterOpen = true;
                }
            });

            container.on('click', '#area-filter-btn' + uniqueId + '+ul li', function (e) {
                // do nothing if they're using the search box
                if ($(this).hasClass('area-filter-type-ahead')) {
                    return false;
                }

                var dropdownBtn = body.find('#area-filter-btn' + uniqueId);

                dropdownBtn.parent().removeClass('open');
                dropdownBtn.attr('aria-expanded', false);

                body.find('.area-type-ahead').val('');
                body.find('.area-type-ahead').parent().siblings().show();

                areaFilterOpen = false;

                var areaId = $(e.currentTarget).children().data('id');
                var areaName = $(e.currentTarget).children().text();
                var areaData = $(e.currentTarget).data('ad');

                var checkboxes = body.find('.checkbox-group.main .checkbox');
                var selectedBuildings = container.find('div[data-item-type=-1]');

                // hide the buildings that are not in the area
                if (areaData && areaData.length > 0) {
                    var selectedAreas = container.find('div[data-item-type=1]');

                    var areaIsSelected = false;

                    $.each(selectedAreas, function (i, v) {
                        if ($(v).data('itemVal') == areaId) {
                            areaIsSelected = true;
                            return false;
                        }
                    });

                    $.each(checkboxes, function (i, v) {
                        var checkbox = $(v);
                        var checkId = checkbox.find('input').val();
                        var isInAreaArray = $.inArray(parseInt(checkId, 10), areaData) >= 0;

                        if (!isInAreaArray) {
                            checkbox.hide();
                            checkbox.addClass('area-filtered');
                        } else {
                            checkbox.show();
                            checkbox.removeClass('area-filtered');
                        }

                        if (isInAreaArray && areaIsSelected) {
                            checkbox.find('input').prop('checked', true);
                        } else {

                            var buildingIsSelected = false;
                            $.each(selectedBuildings, function (bi, bv) {
                                if ($(bv).data('itemVal') == checkId) {
                                    buildingIsSelected = true;
                                    return false;
                                }
                            });

                            checkbox.find('input').prop('checked', buildingIsSelected);
                        }
                    });
                } else {
                    $.each(checkboxes, function (i, v) {
                        var checkbox = $(v);
                        var checkId = checkbox.find('input').val();
                        checkbox.removeClass('area-filtered');

                        checkbox.find('input').prop('checked', false)

                        $.each(selectedBuildings, function (bi, bv) {
                            if ($(bv).data('itemVal') == checkId) {
                                checkbox.find('input').prop('checked', true)
                            }
                        });
                    });

                    body.find('.checkbox-group.main .checkbox').show();
                }

                if (areaId > 0) {
                    dropdownBtn.children('span').eq(0).text(areaName);
                } else {
                    dropdownBtn.children('span').eq(0).text(settings.filterByAreaLabel);
                }

                dropdownBtn.data('areaId', areaId);

                // uncheck the select all filter on an area change and reset filter
                body.find(".filter-checkbox.all-box").eq(0).prop('checked', '');
                body.find('.filter-modal-typeahead').val('');
            });

            container.on('change', '.filter-checkbox', function () {
                var cb = this;

                if ($(this).hasClass('all-box')) {
                    // if they click "select all" we reset the filter so they can see the full list of what gets checked/unchecked
                    body.find('.filter-modal-typeahead').val('');

                    $(this).parents('.checkbox-group-all').siblings('.checkbox-group').find('.checkbox:visible input').each(function (i, v) {
                        if (cb.checked) {
                            if (!v.checked) {
                                $(v).click();
                            }
                        } else {
                            if (v.checked) {
                                $(v).click();
                            }

                            checkAndSetAreasInSelection(body.find('.selected-group'));
                        }
                    });
                } else {
                    if (this.checked) {
                        addAdvancedModalSelectedItem($(this).val(), $(this).parent().text(), $(this).parent().parent().data('type'), body.find('.selected-group'));
                        var selectedDiv = container.find('.selected-group')[0];
                        selectedDiv.scrollTop = selectedDiv.scrollHeight;
                    } else {
                        body.find('.filter-checkbox.all-box:visible').prop('checked', false);
                        body.find('.selected-group-item[data-item-val="' + $(this).val() + '"]').remove();
                        checkAndSetAreasInSelection(body.find('.selected-group'));
                    }
                }
            });

            container.on('click', '.selected-group-item', function () {
                var val = $(this).data('itemVal');
                body.find('.checkbox-group :checkbox[value="' + val + '"]').attr('checked', false);

                $(this).remove();

                // visible area unselected, uncheck everything
                if ($(this).data('itemType') == 1 && container.find('#area-filter-btn' + uniqueId).data('areaId') == val) {
                    body.find('.checkbox-group.main :checkbox, .checkbox-group-all.main :checkbox').attr('checked', false);
                }

                // favorites unchecked
                if ($(this).data('itemType') == 3) {
                    body.find('.favorite-box input').prop('checked', false);
                }
            });

            container.on('change', '.favorite-box input', function () {
                if (this.checked) {
                    addAdvancedModalSelectedItem($(this).data('itemVal'), $(this).parent().text(), 3, body.find('.selected-group'));
                } else {
                    var val = $(this).data('itemVal');
                    body.find('.checkbox-group :checkbox[value="' + val + '"]').attr('checked', false);

                    body.find('.selected-group-item[data-item-val=' + val + '][data-item-type=3]').remove();
                }
            });

            footer.find('.btn-primary').on('click', function () {
                var filterRow = $('.dynamic-filter-row[data-filter-name="' + container.data('filterName') + '"]');

                var descriptions = [];
                var ids = [];

                body.find('.selected-group .selected-group-item').each(function (i, v) {
                    descriptions.push($(v).text());
                    ids.push($(v).data('itemVal'));
                });

                if (ids.length === 0 && descriptions.length === 0)
                    descriptions.push(filterRow.data('filterDefaultDisplayValue'));

                filterRow.find('p').text(descriptions.join(', '));
                self.setFilterValue(filterRow.data('filterName'), ids, descriptions.join(','), filterRow.data('filterType'), true);

                container.modal('hide');

                $('.filter-modal-typeahead').val('');

                if (!filterRow.hasClass('filter-locked') && ids.length === 0) {
                    removeFilterRow(filterRow);
                }

                if (settings.onFilterModalSave && $.isFunction(settings.onFilterModalSave)) {
                    settings.onFilterModalSave(container.data('filterName'), ids, descriptions.join(','));
                }
            });

            body.find('input').on('keyup', function (e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code == 13)
                    return false;

                var val = $(this).val().toLowerCase();

                filterItemsByText(body, val);
            });

            body.find('.responsive-tab-drop').on('change', function () {
                if ($(this).val() == 0) {
                    body.find('.nav-tabs li a').eq(0).click();
                } else {
                    body.find('.nav-tabs li a').eq(1).click();
                }
            });
        };

        function filterItemsByText(container, val) {
            if (val.length == 0) {
                container.find('.filter-checkbox').parent().parent().not('.area-filtered').show();
                return;
            }

            $.each(container.find('.filter-checkbox').not('.all-box'), function (i, v) {
                var labelVal = $(v).parent().text().toLowerCase();

                if ($(v).parent().parent().hasClass('area-filtered')) {
                    return;
                }

                if (labelVal.indexOf(val) < 0) {
                    $(v).parent().parent().hide();
                } else {
                    $(v).parent().parent().show();
                }
            });
        };

        function setAdvancedModalSelected() {
            var modal = originalElement.find('.modal');

            $.each(modal.find('.checkbox-group input:checked'), function (i, v) {
                addAdvancedModalSelectedItem($(v).val(), $(v).parent().text(), $(v).parent().parent().data('type'), modal.find('.selected-group'));
            });
        };

        function addAdvancedModalSelectedItem(itemVal, itemText, itemType, container) {
            var existingItem = container.find('div[data-item-val=' + itemVal + '][data-item-type=' + itemType + ']');

            if (existingItem.length === 0) {
                createSelectedAdvancedModalItem(itemVal, itemText, itemType).appendTo(container);
            }

            if (!modalLoading) {
                checkAndSetAreasInSelection(container);
            }
        }

        function checkAndSetAreasInSelection(container) {
            var areaDrop = originalElement.find('#area-filter-btn' + uniqueId);
            var areaId = areaDrop.data('areaId');
            var areaDescription = areaDrop.find('span').eq(0).text();

            if (areaId && areaId > 0) {
                var areaItems = areaDrop.siblings().find('li');

                var selectedAreaBuildings = areaItems.find('[data-id=' + areaId + ']').parent().data('ad');
                var selectedBuildings = container.find('div[data-item-type=-1]');

                var selectedItems = new Array();

                $.each(selectedBuildings, function (i, v) {
                    if ($.inArray(parseInt($(v).data('itemVal'), 10), selectedAreaBuildings) > -1) {
                        selectedItems.push(v);
                    }
                });

                // the user has selected all the buildings in the chosen area, remove the building records and add the area
                if (selectedAreaBuildings.length === selectedItems.length) {
                    for (var i = selectedItems.length - 1; i >= 0; i--) {
                        $(selectedItems[i]).remove();
                    }

                    createSelectedAdvancedModalItem(areaId, areaDescription, 1).appendTo(container);
                } else { // they only have some of the buildigns in the area.  make sure we remove the area item if it exists
                    var areaItem = container.find('div[data-item-val=' + areaId + '][data-item-type=1]');

                    if (areaItem && areaItem.length > 0) {
                        areaItem.remove();

                        // re-add any selected buildings not in the list
                        var checkedBuildings = originalElement.find('#filter-main' + uniqueId + ' .checkbox-group.main .checkbox input:checked');

                        $.each(checkedBuildings, function (i, v) {
                            var existing = false;

                            $.each(container.find('div[data-item-type=-1]'), function (ii, vv) {
                                if ($(vv).data('itemVal') == $(v).val()) {
                                    existing = true;
                                    return false;
                                }
                            });

                            if (!existing) {
                                createSelectedAdvancedModalItem($(v).val(), $(v).parent().text(), -1).appendTo(container);
                            }
                        });
                    }
                }
            }
        };

        function createSelectedAdvancedModalItem(itemVal, itemText, itemType) {
            return $('<div class="selected-group-item" data-item-val="' + itemVal + '" data-item-type="' + itemType + '">'
                   + '<span><i class="fa fa-minus-circle"></i><span>' + vems.htmlEncode(itemText) + '</span></span>'
                + '</div>');
        };

        function buildSavingModal() {
            var container = $('<div class="modal fade" tabindex="-1" role="dialog" id="savingFilterModal" aria-labelledby="savingFilterModal">');
            var dialog = $('<div class="modal-dialog" role="document">').appendTo(container);
            var content = $('<div class="modal-content">').appendTo(dialog);

            var header = $('<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="savingFilterModal">' + vems.decodeHtml(settings.saveFiltersLabel) + '</h4></div>').appendTo(content);
            var body = $('<div class="modal-body" style="margin: 0 15px; padding-bottom: 0px;">'
                            + '<div class="row">'
                                + '<label id="savingFilterLabel" style="padding-top: 10px;">' + vems.decodeHtml(settings.whatWouldYouLikeToNameThisSetOfFiltersLabel) + '</label>'
                            + '</div>'
                             + '<div class="form-group">'
                                    + '<input type="text" class="form-control" aria-describedby="savingFilterLabel" required="required">'
                             + '</div>'
                        + '</div>').appendTo(content);

            var footer = $('<div class="modal-footer">'
                            + '<button type="button" class="btn btn-primary btn-stock">' + vems.decodeHtml(settings.saveFiltersLabel) + '</button>'
                            + '<button type="button" class="btn btn-default btn-stock" data-dismiss="modal">' + vems.decodeHtml(settings.cancelLabel) + '</button>'
                        + '</div>').appendTo(content);

            originalElement.append(container);

            body.find('input').on('keyup', function (e) {
                if ($(this).val().length > 90) {
                    $(this).val($(this).val().substring(0, 90));
                }

                return false;
            });

            footer.find('.btn-primary').on('click', function () {
                var name = originalElement.find("#savingFilterModal input").val();

                if (name.length === 0) {
                    return false;
                }

                self.saveFilterSet(vems.htmlDecode(name));

                container.modal('hide');
            });
        };

        function buildSavedFiltersModal() {
            var container = $('<div class="modal fade" tabindex="-1" role="dialog" id="savedFilterModal" aria-labelledby="savedFilterModalLabel">');
            var dialog = $('<div class="modal-dialog" role="document">').appendTo(container);
            var content = $('<div class="modal-content">').appendTo(dialog);

            var header = $('<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="savedFilterModalLabel">' + vems.decodeHtml(settings.savedFiltersLabel) + '</h4></div>').appendTo(content);
            var body = $('<div class="modal-body" style="margin: 0 15px; padding-bottom: 0px;">'
                            + '<div class="table-responsive" style="max-height: 300px; margin-bottom: 15px;"><table class="table">'
                                + '<thead><tr>'
                                    + '<th>' + vems.decodeHtml(settings.nameLabel) + '</th>'
                                    + '<th>' + vems.decodeHtml(settings.dateSavedLabel) + '</th>'
                                + '</tr></thead>'
                                + '<tbody></tbody>'
                            + '</table></div>'
                        + '</div>').appendTo(content);

            var footer = $('<div class="modal-footer">'
                            + '<button type="button" class="btn btn-primary btn-stock">' + vems.decodeHtml(settings.loadFilterLabel) + '</button>'
                            + '<button type="button" class="btn btn-default btn-stock">' + vems.decodeHtml(settings.deleteFilterLabel) + '</button>'
                        + '</div>').appendTo(content);

            originalElement.append(container);

            body.on('click', 'tbody > tr', function () {
                if ($(this).hasClass('editing'))
                    return false;

                if ($(this).hasClass('selected')) {
                    $(this).removeClass('selected');
                } else {
                    $(this).siblings().removeClass('selected');
                    $(this).addClass('selected');
                }
            });

            body.on('dblclick', 'tbody > tr', function () {
                if (editingSavedFilterName)
                    return false;

                editingSavedFilterName = true;
                var row = $(this);
                var renamedRowItems = $(this).find('.saved-filter-item').detach();
                row.addClass('selected').addClass('editing');
                row.append('<td><input type="text" class="form-control" value="' + renamedRowItems.eq(0).text() + '"></td><td><button id="rename-filter-save" type="button" class="btn btn-primary btn-stock" style="margin-right: 5px;">' + vems.decodeHtml(settings.saveLabel) + '</button><button id="rename-filter-cancel" type="button" class="btn btn-default btn-stock">' + vems.decodeHtml(settings.cancelLabel) + '</button></td>');

                body.on('click', '#rename-filter-save', function () {
                    var filterName = row.find('input').val();

                    vems.ajaxPost(
                     {
                         url: vems.serverApiUrl() + '/UpdateFilterName',
                         data: JSON.stringify({ filterName: filterName, filterId: row.data('filterId'), filterParent: row.data('filterParent') }),
                         success: function (results) {
                             var data = JSON.parse(results.d);
                             if (data.Success) {
                                 renamedRowItems.eq(0).text(filterName);

                                 row.children().remove();
                                 row.append(renamedRowItems);
                                 row.removeClass('editing');
                             } else {
                                 vems.showToasterMessage('', data.Message, 'warning');
                             }

                             editingSavedFilterName = false;
                         },
                         error: function (xhr, ajaxOptions, thrownError) {
                             console.log(thrownError);
                             return false;

                             editingSavedFilterName = false;
                         }
                     });
                });

                body.on('click', '#rename-filter-cancel', function () {
                    row.children().remove();
                    row.append(renamedRowItems);
                    row.removeClass('editing');

                    editingSavedFilterName = false;
                });
            });

            footer.find('.btn-primary').on('click', function () {
                // load
                var filterId = container.find('tr.selected').data('filterId');

                if (filterId > 0) {
                    self.loadFilterSetById(filterId);

                    container.modal('hide');
                }
            });

            footer.find('.btn-default').on('click', function () {
                // Delete
                var filterId = container.find('tr.selected').data('filterId');

                if (filterId > 0) {
                    self.deleteFilterSet(filterId);
                }
            });
        };

        function getDynamicFilterName() {
            var values = [];

            $.each(originalElement.find('.form-control-static p'), function (i, v) {
                values.push($(v).text().split(','));
            });

            return values.join(',').split(',').join(', ').substring(0, 90);  // required to add spaces between items in individual filter values
        };

        function prepValuesForAjax() {
            $.each(filterValues, function (i, v) {
                if (moment.isMoment(v.value)) {
                    v.value = v.value.toJSON();
                }

                if ($.isArray(v.value)) {
                    v.value = v.value.join(',');
                }
            });
        };

        function deferEvents() {
            $(originalElement)
                .on('click', '.dynamic-filter-remove', function () {
                    removeFilterRow($(this).parent().parent());
                }).on('click', '.dynamic-filter-item-add', function () {
                    originalElement.data('dynamicFilters').addFilterItem(this);
                }).on('click', '.save-filter-set', function () {
                    var savingModal = originalElement.find("#savingFilterModal");


                    savingModal.find('input').val(getDynamicFilterName());
                    savingModal.modal('show');
                    return false;
                }).on('click', '#add-filter', function (e) {
                    originalElement.find('#add-filter-drop').removeClass('dropup');

                    var mouseX = e.clientX + 20;
                    var mouseY = e.clientY + 20;
                    var height = originalElement.find('#add-filter-list').height();
                    var width = originalElement.find('#add-filter-list').width();

                    var visibleX = $(window).width() - (mouseX + width);
                    var visibleY = $(window).height() - (mouseY + height);

                    //if (visibleX < 20) {
                    //    console.log('x');
                    //}

                    if (visibleY < 20) {
                        originalElement.find('#add-filter-drop').addClass('dropup');
                    }
                }).on('click', '#add-filter-list li', function () {
                    var filterLabel = $(this).text();

                    var filter = $.grep(settings.optionalFilters, function (v, i) {
                        if (v.filterLabel == filterLabel) {
                            return v;
                        }
                    });

                    addFilterRow(filter[0], false, true);
                    return false;
                }).on('click', '.popover-close-apply', function () {
                    var filterRow = $(this).parents('.dynamic-filter-row');

                    destroyFilterPopover(filterRow, true);

                    return false;
                }).on('click', '.popover-close', function () {
                    var filterRow = $(this).parents('.dynamic-filter-row');

                    destroyFilterPopover(filterRow, false);

                    return false;
                }).on('click', '.popover-overlay', function () {
                    var filterRow = $(this).parents('.dynamic-filter-row');

                    destroyFilterPopover(filterRow, false);
                }).on('click', '#summaryBtn', function () {
                    self.summaryToggle();

                    if ($.isFunction(settings.summaryViewToggled)) {
                        settings.summaryViewToggled();
                    }

                    return false;
                }).on('click', '#savedFiltersBtn', function () {
                    vems.ajaxPost(
                      {
                          url: vems.serverApiUrl() + '/GetSavedFilters',
                          data: JSON.stringify({ parentId: settings.filterParent }),
                          success: function (results) {
                              var data = JSON.parse(results.d);

                              var itemTable = originalElement.find('#savedFilterModal tbody');
                              itemTable.children().remove();

                              $.each(data, function (i, v) {
                                  itemTable.append($('<tr style="cursor: pointer;"><td class="saved-filter-item">' + v.Name + '</td><td class="saved-filter-item">' + moment(v.DateAdded).format("lll") + '</td></tr>').data('filterId', v.Id).data('filterParent', settings.filterParent));
                              });

                              originalElement.find('#savedFilterModal').modal('show');
                          },
                          error: function (xhr, ajaxOptions, thrownError) {
                              console.log(thrownError);
                              return false;
                          }
                      });
                }).on('change', '.dynamic-filter-row input:not(.filter-checkbox)', function () {
                    self.setFilterValue($(this).parent().parent().data('filterName'), $(this).val(), $(this).parent().parent().data('filterType'), true);

                    return false;
                }).on('dp.change', '.dynamic-filter-row .date', function (e) {
                    //self.setFilterValue($(this).parent().parent().data('filterName'), e.date._d, $(this).parent().parent().data('filterType'), true);
                    var d = e.date;
                    if (moment.isMoment(d) && !d.isValid()) {
                        d = moment(e.date.format(), "YYYY-MM-D");
                    }
                    self.setFilterValue($(this).parent().parent().data('filterName'), d, $(this).parent().parent().data('filterType'), true);
                    return false;
                }).on('click', '#helpBtn', function () {
                    if ($.isFunction(settings.helpClicked)) {
                        prepValuesForAjax();
                        settings.filterChanged();
                    }
                }).on('keyup', '.area-type-ahead', function (e) {
                    // filter areas by type ahead inside dropdown
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 13)
                        return false;

                    var areas = $(this).parent().siblings();
                    var val = $(this).val().toLowerCase();

                    if (val.length === 0) {
                        $.each(areas, function (i, v) {
                            $(v).show();
                        });
                    } else {
                        $.each(areas, function (i, v) {
                            if ($(v).children().data('id') >= 0) {
                                if ($(v).children().text().toLowerCase().indexOf(val) > -1) {
                                    $(v).show();
                                } else {
                                    $(v).hide();
                                }
                            }
                        });
                    }
                }).on('show.bs.modal', '#filterModal', function (e) {
                    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {

                        $(this)
                            .css({
                                position: 'absolute',
                                marginTop: $(window).scrollTop() + 'px',
                                bottom: 'auto'
                            });

                        setTimeout(function () {
                            $('.modal-backdrop').css({
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: Math.max(
                                    document.body.scrollHeight, document.documentElement.scrollHeight,
                                    document.body.offsetHeight, document.documentElement.offsetHeight,
                                    document.body.clientHeight, document.documentElement.clientHeight
                                ) + 'px'
                            });
                        }, 0);
                    }
                });

            $(originalElement).on('keydown', '.dynamic-filter-row[data-filter-type=2]', function (event) {
                if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                            (event.keyCode == 65 && event.ctrlKey === true) || (event.keyCode == 188 || event.keyCode == 190 || event.keyCode == 110) ||
                            (event.keyCode >= 35 && event.keyCode <= 39)) {
                    return;
                } else {
                    // stop the key press when necessary
                    if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                        event.preventDefault();
                    }
                }
            });
        }
    }
})(jQuery);