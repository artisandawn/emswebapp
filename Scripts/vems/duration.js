/// <reference path="jquery-1.4.2.min-vsdoc.js" />
function applyRecurrence() {
    var rt = Dea.Get('recurrenceText');
    var dtc = Dea.Get('dateTimeContainer');
    var rh = Dea.Get('resultsHolder');
    
    if (emsRecurrence.startTime !== '') {
        Dea.Get('StartTime').value = emsRecurrence.startTime;
    }
    if (emsRecurrence.endTime !== '') {
        Dea.Get('EndTime').value = emsRecurrence.endTime;
    }
    
    if (emsRecurrence.hasRecurrence === true) {
        $(rh).html('');
        $(rt).html(emsRecurrence.text);
        Dea.setDisplay(rt, '');
        Dea.setDisplay(dtc, 'none');
        Dea.setValue('ems_dates', emsRecurrence.dates);
        Dea.setDisplay('timeContainer', 'none');
        Dea.setDisplay('bookWrapper', 'none');
        if (ems_haveRd === '1') {
            $('#' + Dea.ClientIds.AsList).attr('checked', 'checked');
            $('#' + Dea.ClientIds.AsGrid).attr('disabled', 'disabled');
            $('#resultsAs').buttonset();
        }
    }
    else {
        if (typeof(Dea.ClientIds) !== 'undefined') {
            $('#' + Dea.ClientIds.searchRemainingDates).hide();
        }
        Dea.setDisplay('timeContainer', '');
        Dea.setHtml(rh, '');
        Dea.setDisplay(rt, 'none');
        Dea.setDisplay(dtc, '');
        Dea.setValue('ems_dates', '');
        
        if (typeof (Dea.ClientIds.AsGrid) === 'string') {
            $('#' + Dea.ClientIds.AsGrid).attr('disabled', '');
            $('#resultsAs').buttonset();
        }
    }
}

var emsRecurrence = { 'text': '', 'dates': '', 'hasRecurrence': false, 'startTime': '', 'endTime': '' };

function closeRecurrence() {
    applyRecurrence();   
    iFrameDiag.dialog('close');
}
