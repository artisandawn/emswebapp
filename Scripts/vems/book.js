/// <reference path="jquery-1.4.2.min-vsdoc.js" />
Dea.ResBook = {};

Dea.ResBook.moveDate = function (h, setData) {
    var addChecks = false;
    if (setData === true) {
        if (Dea.setEmsData() === true) {
            Dea.ResBook.addCheckboxesToEmsData();
            addChecks = true;
            var oSave = Dea.Get('SaveFilterSettings');
            if (oSave && oSave.checked === true) {
                Dea.emsData.FacilityIdList = Dea.FP.FacilityIds.toList();
                Dea.emsData.saveCookie = 1;
                oSave.checked = false;
            }
            else {
                Dea.emsData.saveCookie = 0;
            }
            Dea.ResBook.md(h, addChecks);
            Dea.emsData.saveCookie = 0;
        }
    }
    else {
        Dea.ResBook.md(h);
    }
    return false;
};

Dea.ResBook.md = function (h, addChecksCalled) {
    Dea.emsData.hoursToMove = h;
    //checkboxs not handled..handle manually
    if (!addChecksCalled) {
        Dea.ResBook.addCheckboxesToEmsData();
    }
    Dea.makeCallback('moveDate');
    $('#filterOptions').dialog('close');
};

Dea.ResBook.addCheckboxesToEmsData = function () {
    Dea.emsData.Features = '';
    var inputs = document.getElementsByTagName('input');
    var oSaveCheck = Dea.Get('SaveFilterSettings');
    var saveId = oSaveCheck ? oSaveCheck.id : '';
    var values = '';
    var comma = '';
    for (var i = 0, j = inputs.length; i < j; i++) {
        if (inputs[i].type === 'checkbox' && inputs[i].id.indexOf('pc_Features') > 0) {
            if (inputs[i].checked === true && inputs[i].id !== saveId) {
                values += comma + inputs[i].value;
                comma = ',';
            }
        }
    }
    Dea.emsData.Features = values;
};

Dea.ResBook.rebuildBook = function (emsResponse) {
    Dea.setHtml(sOnDateLabelId, emsResponse.displayDate);
    if (Dea.ClientIds) {
        $('#' + Dea.ClientIds.BookDate).val(emsResponse.bookDate);
    }
    else {
        Dea.setValue(sDateId, emsResponse.bookDate);
    }
    Dea.setDisplay('bookLoadingContainer', 'none');
    Dea.setValue('ems_onTime', emsResponse.onTime);
    Dea.setHtml('bookHeaderContainer', emsResponse.headerHtml);
    $('#bookContainer').html(emsResponse.bookHtml);
    if (ems_haveFieldsForTip && ems_haveFieldsForTip === '1') {
        $('#bookContainer').emsTip({ callbackRouter: 'bookingTip', tag: 'div[class*=\'e eb\']' });
    }
    //Dea.setHtml("bookContainer", emsResponse.bookHtml);
    Dea.setDisplay('bookWrapper', '');
    Dea.setDisplay('resultsHolder', 'none');

    vems.wireupDialogs('bookContainer', ems_LocTitle);
    return;
};

$(document).ready(function () {
    if (ems_haveFieldsForTip && ems_haveFieldsForTip === '1') {
        $('#bookContainer').emsTip({ callbackRouter: 'bookingTip', tag: 'div[class*=\'e eb\']' });
    }
});

