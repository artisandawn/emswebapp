Dea.BrowseCommon = {};

Dea.pageHandleCallback = function (emsResponse, context) {
    switch (context) {
        case 'bookingTip':
            Dea.showTip(emsResponse.tipHtml);
            return true;
        case 'tabPressed':
        case 'movePage':
        case 'groupByChangedListViewGrid':
            Dea.setHtml(sOnDateLabelId, emsResponse.dateForDisplay);
            Dea.setValue(sDateId, emsResponse.dateForFilter);
            Dea.setValue('ems_onPage', emsResponse.onPage);
            Dea.emsData.movePage = 0;
            Dea.emsData.movingMultiplier = '0';
            Dea.BrowseCommon.loadTab(emsResponse);
            return true;
        case 'sortListViewGrid':
            Dea.BrowseCommon.loadTab(emsResponse);
            return true;
        case 'loadRooms':
            Dea.setHtml('roomDropDownContainer', emsResponse.roomsHtml);
            _emsDPBuldingId = emsResponse.buildingId;
            return true;
        case 'loadBuildings':
            Dea.setHtml('buildingsDropDownContainer', emsResponse.buildingsHtml);
            Dea.setHtml('roomDropDownContainer', emsResponse.roomsHtml);
            _emsDPBuldingId = emsResponse.buildingId;
            return true;
    }
    return false;
};
Dea.BrowseCommon.loadTab = function (emsResponse) {
    var $tabs = $('#BrowseEvents').tabs();
    var selected = $tabs.tabs('option', 'selected');
    $('#tab' + selected).html(emsResponse.resultHtml);
    Dea.emsData.BrowseEventsSelectedTab = selected;
    if (selected < 3) {
        vems.wireupDialogs(ems_lvg, ems_LocTitle, ems_DetailsTitle);
        $('#' + ems_lvg).addRowHighlights();
        $('#groupByOptions').show();
    }
    else {
        vems.wireupDialogs('cal', ems_LocTitle, ems_DetailsTitle);
        $('#cal').addEventHighlights();
        $('#groupByOptions').hide();
    }
    if (ems_haveFieldsForTip && ems_haveFieldsForTip === '1') {
        $('#BrowseEvents').emsTip({ callbackRouter: 'bookingTip' });
    }
};

Dea.BrowseCommon.clearTabs = function () {
    Dea.setHtml('main', '');
};

Dea.BrowseCommon.cbPrep = function (multiplier) {
    Dea.BrowseCommon.resetPaging();
    Dea.setEmsData();
    Dea.emsData.movingMultiplier = multiplier;
};

Dea.BrowseCommon.moveDate = function (multiplier) {
    Dea.BrowseCommon.cbPrep(multiplier);
    Dea.makeCallback('tabPressed');
    return false;
};

Dea.BrowseCommon.loadSpecificByDate = function (d, tabNumber) {
    Dea.BrowseCommon.clearTabs();
    scroll(0, 0);
    Dea.setValue(sDateId, d);
    $('#BrowseEvents').tabs('select', tabNumber);
    if ($('#BrowseEvents').tabs('option', 'selected') === tabNumber) {
        Dea.BrowseCommon.moveDate(0);
    }
    return false;
};

Dea.BrowseCommon.resetPaging = function () {
    Dea.setValue('ems_onPage', '0');
    Dea.setValue('ems_numberOfPages', '0');
};

Dea.BrowseCommon.movePage = function (move) {
    Dea.setEmsData();
    Dea.emsData.movePage = move;
    Dea.emsData.movingMultiplier = '0';
    Dea.makeCallback('movePage');
    return false;
};

function tabPressed(event, ui) {
    $('div[id^=tab]').html('');
    Dea.emsData.BrowseEventsSelectedTab = ui.index;
    Dea.BrowseCommon.cbPrep('0');
    Dea.makeCallback('tabPressed');
    return;
}

(function ($) {
    $.fn.addEventHighlights = function () {
        return this.each(function () {
            var obj = $(this);
            obj.addClass('ui-widget');
            obj.find('li').bind('mouseover mouseout', function (event) {
                if (event.type === 'mouseover') {
                    $(this).addClass('ui-state-highlight');
                } else {
                    $(this).removeClass('ui-state-highlight');
                }
            });
        });
        return this;
    };
})(jQuery);
