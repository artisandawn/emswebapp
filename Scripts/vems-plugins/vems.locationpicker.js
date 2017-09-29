(function ($) {
    var locationpicker = function (elem, options) {
        this.elem = elem;
        // KS - good idea in theory, according to GG (taking advantage of HTML5 data attributes)
        // <div class='kstest' data-plugin-options='{}'></div>
        var inlineOptions = this.elem.data('plugin-options');
        this.options = $.extend({}, $.fn.locationpicker.defaults, options, inlineOptions);
    };

    locationpicker.prototype = {
        init: function () {
            var self = this;
            createFilterButtons(self);
            createDropdown(self);
            bindEvents(self);
            self.elem.trigger('ready');
            return self;
        },
        updateFilter: function (newFilter) {
            var self = this;
            self.options.activeFilter = newFilter;
            self.init();
            self.elem.trigger('filterChanged');
            return self.elem;
        },
        getFilter: function () {
            var self = this;
            return self.options.activeFilter;
        },
        getLocation: function () {
            var self = this;
            return self.options.selectedLocation;
        }
    };

    var filterId = '';
    var createFilterButtons = function (self) {
        if (filterId) {
            $('#' + filterId).remove();  // remove old markup if buttons already exist
        } else {
            filterId = self.elem[0].id + 'LpFilter';
        }

        var filterDiv = document.createElement('div');
        filterDiv.id = filterId;
        var filterObjects = [{
                filter: 'favorites', label: self.options.favoritesLabelText, imgClass: self.options.favoritesImgClass,
                shown: self.options.showFavorites
            },
            {
                filter: 'buildings', label: self.options.buildingsLabelText, imgClass: self.options.buildingsImgClass,
                shown: self.options.showBuildings
            },
            {
                filter: 'areas', label: self.options.areasLabelText, imgClass: self.options.areasImgClass,
                shown: self.options.showAreas
            },
            {
                filter: 'views', label: self.options.viewsLabelText, imgClass: self.options.viewsImgClass,
                shown: self.options.showViews
            }];

        $.each(filterObjects, function (idx, val) {
            var filterBtn = document.createElement('button');
            filterBtn.type = 'button';
            filterBtn.onclick = function () {
                self.updateFilter(val.filter);
                return false;  // prevent unintentional postback on mobile devices
            };
            filterBtn.classList.add('lp-filter');
            filterBtn.title = val.label;
            if (val.filter == self.options.activeFilter) filterBtn.classList.add('lp-filter-active');
            if (!val.shown) filterBtn.style.display = 'none';

            var btnLabel = document.createElement('span');
            btnLabel.textContent = val.label;
            btnLabel.classList.add('lp-label');
            if (self.options.labelTextClass) btnLabel.classList.add(self.options.labelTextClass);

            var btnImg = document.createElement('img');
            btnImg.classList.add('lp-icon');
            btnImg.classList.add(val.imgClass);

            filterBtn.appendChild(btnLabel);
            filterBtn.appendChild(document.createElement('br'));
            filterBtn.appendChild(btnImg);

            filterDiv.appendChild(filterBtn);
        });

        if (self.options.filterContainer) {
            $(self.options.filterContainer).append(filterDiv);
        } else {
            self.elem.append(filterDiv);
        }
    };

    var dropdownId = '';
    var createDropdown = function (self) {
        if (dropdownId) {
            $('#' + dropdownId).remove();  // remove old markup if dropdown already exists
        } else {
            dropdownId = self.elem[0].id + 'LpDropdown';
        }        

        var dropdown = $('<div id="' + dropdownId + '"></div>');
        // build placeholder text based on active filter and user-set label values
        var placeholderText = 'Select';
        switch (self.options.activeFilter) {
            case 'favorites':
                placeholderText += ' ' + self.options.favoritesLabelText;
                break;
            case 'buildings':
                placeholderText += ' ' + self.options.buildingsLabelText;
                break;
            case 'areas':
                placeholderText += ' ' + self.options.areasLabelText;
                break;
            case 'views':
                placeholderText += ' ' + self.options.viewsLabelText;
                break;
        }
        placeholderText += '...';
        dropdown.dxSelectBox({
            dataSource: self.options.dataSource,
            displayExpr: 'locationDesc',
            valueExpr: 'locationId',
            // if 'current' id exists in new datasource, select that option by default
            value: ($.map(self.options.dataSource, function (obj) { return obj.locationId }).indexOf(self.options.selectedLocation) > -1) ?
                self.options.selectedLocation : null,
            showClearButton: false,
            width: self.options.dropdownWidth ? self.options.dropdownWidth : self.elem.width(),
            placeholder: placeholderText,
            onValueChanged: function (data) {
                self.options.selectedLocation = data.value;
                self.elem.trigger('locationChanged');
            }
        }).dxSelectBox('instance');

        if (self.options.dropdownContainer) {
            $(self.options.dropdownContainer).append(dropdown);
        } else {
            self.elem.append(dropdown);
        }
    };

    var bindEvents = function (self) {
        var el = self.elem;
        el.unbind('filterChanged');  // prevent binding of same event multiple times when init() is called
        el.unbind('locationChanged');
        el.unbind('ready');

        el.bind('filterChanged', function (event) {
            event.stopPropagation();
            self.options.filterChanged(self.options.activeFilter);
        });
        el.bind('locationChanged', function (event) {
            event.stopPropagation();
            self.options.locationChanged(self.getLocation());
        });
        el.bind('ready', function (event) {
            event.stopPropagation();
            self.options.ready();
        });
    };

    var updateOption = function (option, value, data) {
        if (data.options.hasOwnProperty(option)) {
            data.options[option] = value;
            data.init();
        } else {
            console.log('The locationpicker plugin does not have a(n) "' + option + '" option to update.')
        }
    };

    $.fn.locationpicker = function (options) {
        var self = this;
        var _data = self.data('vems_locationpicker');
        var _current;

        if (typeof options == 'string') {
            updateOption(options, arguments[1], _data);
            return;
        }

        if (_data) {
            return _data;
        }

        this.each(function () {
            var c = new locationpicker($(this), options).init();
            var container = self.data('vems_locationpicker', c);
            _current = _current ? _current.add(container) : container;
        });

        return self;
    };

    $.fn.locationpicker.defaults = {
        dataSource: [],  // data controlled by user of plugin (using filterChanged/locationChanged events)
        activeFilter: 'favorites',  // should be set to user-configured default when initializing
        selectedLocation: '',  // allow setting of default dropdown value by id (user-configured default)
        dropdownWidth: '',  // allow manual setting of dropdown width
        labelTextClass: '',  // allow extra styling on label text when necessary (usually for color)

        favoritesLabelText: 'Favorites',
        buildingsLabelText: 'Buildings',
        areasLabelText: 'Areas',
        viewsLabelText: 'Views',

        favoritesImgClass: 'lp-icon-favorites',
        buildingsImgClass: 'lp-icon-buildings',
        areasImgClass: 'lp-icon-areas',
        viewsImgClass: 'lp-icon-views',

        showFavorites: true,
        showBuildings: true,
        showAreas: true,
        showViews: true,

        filterContainer: '',  // selector for element to which the filter button HTML should be appended
        dropdownContainer: '',  // selector for element to which the dropdown HTML should be appended

        filterChanged: function () { },
        locationChanged: function () { },
        ready: function () { }
    };
})(jQuery);