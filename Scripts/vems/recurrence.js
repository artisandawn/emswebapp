/// <reference path="jquery-1.4.2.min-vsdoc.js" />
Dea.Recurrence = {};
$(document).ready(function () {
    $('#' + Dea.ClientIds.StartTime + ', #' + Dea.ClientIds.EndTime).timePicker();
    $('#recurTypes, #dow').buttonset();
    $('button, input:submit, input:reset').button();
    if (ems_anchorStartToEnd === 1) {
        Dea.anchorTimes(Dea.ClientIds.StartTime, Dea.ClientIds.EndTime);
    }
    Dea.setPopup();
    $('input[id*=EndAfterX]').focus(function () { $('input[id*=EndAfterXOption]').attr('checked', 'checked'); });
    $('input[id*=EndBy]').focus(function () { $('input[id*=EndAfterDateOption]').attr('checked', 'checked'); });
});

Dea.Recurrence.apply = function (rt, d, apply, startTime, endTime) {
    parent.emsRecurrence.text = rt;
    parent.emsRecurrence.hasRecurrence = apply;
    parent.emsRecurrence.dates = d;
    parent.emsRecurrence.startTime = startTime;
    parent.emsRecurrence.endTime = endTime;
    parent.closeRecurrence();
    return false;
};

Dea.Recurrence.toggleRadio = function (ri) {
    var oPat = [];
    oPat[0] = Dea.Get('dailyOptions');
    oPat[1] = Dea.Get('weeklyOptions');
    oPat[2] = Dea.Get('monthlyOptions');
    oPat[3] = Dea.Get('randomOptions');

    for (var i = 0; i < 4; i++) {
        if (i === ri) {
            Dea.setDisplay(oPat[i], '');
        }
        else {
            Dea.setDisplay(oPat[i], 'none');
        }
    }

    if (ri === 3) {
        Dea.setDisplay('recurrenceRange', 'none');
    }
    else {
        Dea.setDisplay('recurrenceRange', '');
    }
};

Dea.pageHandleCallback = function (emsResponse, context) {
    switch (context) {
        case 'moveCal':
            Dea.setHtml('randomOptions', emsResponse.calHtml);
            Dea.setValue('ems_calDate', emsResponse.calDate);
            return true;
    }
    return false;
};

Dea.Recurrence.moveCal = function (moving) {
    Dea.setEmsData(true);
    Dea.emsData.calDates = emsCalDates;
    Dea.emsData.calMoving = moving;
    Dea.makeCallback('moveCal');
    return false;
};

Dea.Recurrence.dateChecks = function () {
    //return isDateValid(Dea.getValue(sStartDateId)) === true && isDateValid(Dea.getValue(sEndDateId)) === true;
    return true;
};