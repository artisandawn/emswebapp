/// <reference path="jquery-1.4.2.min-vsdoc.js" />
Dea.FP = {};
Dea.FP.FacilityIds = [];
Dea.FP.toHide = [];

$(document).ready(function () {
    $('#pickerContainer').dialog({
        autoOpen: false,
        modal: true,
        resizable: false
    });
});

Dea.FP.handleMultipleOption = function () {
    var oFac = Dea.Get('FacilityId');
    if (oFac !== null) {
        var opt = oFac.options[0];
        if (Dea.FP.FacilityIds.length > 1) {
            if (opt.value !== '0') {
                oFac.options.add(new Option(Dea.Text.MultipleSelected, '0'), 0);
                oFac.value = 0;
            }
        }
        else if (Dea.FP.FacilityIds.length === 1) {
            Dea.FP.removeMultOpt(oFac);
            oFac.value = Dea.FP.FacilityIds[0];
        }
        else {
            Dea.FP.removeMultOpt(oFac);
            oFac.value = -1;
        }
    }
};

Dea.FP.facilityClicked = function (oCh) {
    if (oCh.checked) {
        Dea.FP.FacilityIds.push(oCh.value);
    }
    else {
        Dea.FP.FacilityIds.removeValue(oCh.value);
    }
    Dea.FP.handleMultipleOption();
};

Dea.FP.setFacilityPicker = function (fIds) {
    var ids = fIds.split(',');
    var inputs = document.getElementsByTagName('input');
    for (var i = 0, j = inputs.length; i < j; i++) {
        if (inputs[i].type === 'checkbox') {
            var iId = inputs[i].id;
            if (iId.indexOf('AreasList') > 0 || iId.indexOf('BuildingsList') > 0 || iId.indexOf('ViewsList') > 0) {
                for (var ii = 0, iii = ids.length; ii < iii; ii++) {
                    if (inputs[i].value === ids[ii]) {
                        inputs[i].checked = true;
                        Dea.FP.FacilityIds.push(ids[ii]);
                    }
                }
            }
        }
    }
    Dea.FP.handleMultipleOption();
};

Dea.FP.removeMultOpt = function (oFac) {
    if (oFac !== null) {
        $('#' + oFac.id + ' option[value=\'0\']').remove();
    }
};

Dea.FP.hidePicker = function () {
    $('#pickerContainer').dialog('close');
};

Dea.FP.applyPickers = function () {
    Dea.FP.hidePicker();
    if (Dea.FP.FacilityIds.length === 1) {
        if (typeof (Dea.facilities) !== 'undefined') {
            if (typeof (Dea.facilities.setTimezone) === 'function') {
                Dea.facilities.setTimezone(Dea.Get('FacilityId'));
            }
        }
    }
    Dea.emsData.FacilityIdList = Dea.FP.FacilityIds.toList();
    Dea.FP.makeFacilityChangedCallback();
    return false;
};

Dea.FP.showPicker = function (e, o, pt, toHide) {
    $('#pickerContainer').dialog('open').dialog({ position: [e.pageX - 300, e.pageY + 15] });
    return false;
};

Dea.FP.makeFacilityChangedCallback = function () {
    if (Dea.emsData.FacilityIdList === '') {
        Dea.emsData.FacilityIdList = Dea.emsData.FacilityId;
    }
    Dea.makeCallback('getFiltersForFacility');
};

Dea.FP.getFiltersForFacility = function () {
    Dea.setEmsData(true);
    Dea.emsData.FacilityIdList = '';
    var oFac = Dea.Get('FacilityId');
    Dea.FP.removeMultOpt(oFac);
    Dea.FP.clearFacilityChecks(oFac.value);
    Dea.FP.makeFacilityChangedCallback();
};

Dea.FP.clearFacilityChecks = function (leaveValue) {
    Dea.FP.FacilityIds.length = 0;
    var inputs = document.getElementsByTagName('input');
    for (var i = 0, j = inputs.length; i < j; i++) {
        if (inputs[i].type === 'checkbox') {
            var iId = inputs[i].id;
            if (iId.indexOf('AreasList') > 0 || iId.indexOf('BuildingsList') > 0 || iId.indexOf('ViewsList') > 0) {
                if (inputs[i].value !== leaveValue) {
                    inputs[i].checked = false;
                }
                else {
                    inputs[i].checked = true;
                    Dea.FP.FacilityIds.push(leaveValue);
                }
            }
        }
    }
};

Dea.FP.setFiltersForFacilityChange = function (emsResponse) {
    Dea.setValue('ems_features', '');
    if (emsResponse.floorsHtml !== '') {
        Dea.setHtml('floorsContainer', emsResponse.floorsHtml);
    }
    if (emsResponse.roomTypesHtml !== '') {
        Dea.setHtml('roomTypesContainer', emsResponse.roomTypesHtml);
    }
    if (emsResponse.featuresHtml !== '') {
        Dea.setHtml('featureScroll', emsResponse.featuresHtml);
    }
    else {
        $('#featureScroll').html('&nbsp;');
    }
    if (emsResponse.setupTypesHtml !== '') {
        Dea.setHtml('setupTypeContainer', emsResponse.setupTypesHtml);
        var oSetup = Dea.Get('SetupType');
        if (oSetup !== null && (oSetup.isRequired || oSetup.getAttribute('isRequired'))) {
            Dea.setLabelRequired(oSetup.id);
        }
    }
};

