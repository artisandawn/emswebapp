/// <reference path="jquery-1.4.2.min-vsdoc.js" />
function addAttendee(email, isDL, displayName) {
    var st = Dea.Get('StartTime');
    if(st) {
        if(st.value.trim() === '') {
            alert(st.errorMsg);
            return false;
        }
    }
    var et = Dea.Get('EndTime');
    if(et) {
        if(et.value.trim() === '') {
            alert(et.errorMsg);
            return false;
        }
    }

    Dea.setEmsData(true);
    Dea.emsData.attendeeToAdd = email;
    Dea.emsData.isDL = isDL;
    Dea.emsData.displayName = displayName;
    Dea.emsData.hoursToMove = 0;
    Dea.makeCallback('addAttendee', Dea.emsData);
    return false;
}

function lookupAttendee() {
    var bw = Dea.Get('bookWrapper');
    var rh = Dea.Get('resultsHolder');
    if (bw) {
        if (hideBookOnAttendeeSearch === 1) {
            Dea.setDisplay(bw, 'none');
        }
    }
    Dea.setDisplay(rh, '');
    Dea.setHtml(rh, ems_Loading);
    
    var searchText = Dea.getValue('PamSearchText');
    if(searchText.indexOf('@') >=0 ) {
        addAttendee(searchText, 0, searchText);
    }
    else {
        Dea.emsData.searchText = searchText;
        Dea.makeCallback('lookupAttendee', Dea.emsData);
    }
    return false;
}

function explodeGroup(attendeeGuid) {
    Dea.setEmsData(true);
    Dea.emsData.groupToExplode = attendeeGuid;
    Dea.emsData.hoursToMove = 0;
    Dea.makeCallback('explodeGroup', Dea.emsData);
    return false;
}

function removeAttendee(attendeeGuid) {
    var st = Dea.Get('StartTime');
    if (st) {
        if (st.value.trim() === '') {
            alert(st.errorMsg);
            return false;
        }
    }
    var et = Dea.Get('EndTime');
    if (et) {
        if (et.value.trim() === '') {
            alert(et.errorMsg);
            return false;
        }
    }

    Dea.setEmsData(true);
    Dea.emsData.toRemove = attendeeGuid;
    Dea.emsData.hoursToMove = 0;
    Dea.makeCallback('removeAttendee', Dea.emsData);
    return false;
}

function searchKeyPress(e) {
    if(e.keyCode === 13) {
        lookupAttendee();
        return false;
    }
    else {
        return true;
    }
}  

function movePamBook(h) {
    Dea.setEmsData(true);
    if (typeof(emsState) !== 'undefined') {
        emsState.hasSearched = true;
    }
    var oStart = Dea.Get('StartTime');
    if(oStart) {
        if(oStart.value.trim() === '') {
            alert(oStart.errorMsg);
            return false;
        }
        var oEnd = Dea.Get('EndTime');
        if(oEnd.value.trim() === '') {
            alert(oEnd.errorMsg);
            return false;
        }
    }
    
    Dea.ResBook.moveDate(h, false);
    return false;
}

function rebuildPamBook(emsResponse)
{
    if(Dea.Get('pamBookHeaderContainer')) {
        Dea.setHtml(sAttendeeBookDateLabelId, emsResponse.pamDisplayDate);
        Dea.setValue(Dea.ClientIds.BookDate, emsResponse.pamBookDate);
        Dea.setValue('ems_onTime', emsResponse.pamOnTime);
        Dea.setHtml('pamBookHeaderContainer', emsResponse.pamHeaderHtml);
        Dea.setHtml('pamBookContainer', emsResponse.pamBookHtml);
   }
}
