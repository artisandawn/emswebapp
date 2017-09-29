/// <reference path="jquery-1.4.2.min-vsdoc.js" />
$(document).ready(function () {
    $('table[id*=ProcessTemplateGrid]').addRowHighlights();
    $('#personalization').tabs();
    Dea.setTabs('personalization');
     $('#finisher').addRowHighlights();

});

 function getPersonalizationOptions(tid) {

     if (tid) {
         sData = tid;
     }
     else {
         return;
     }
    if (sData !== null) {
        $('input[data-tId=\'' + sData + '\']').attr('checked', 'checked');
        Dea.emsData.templateId = sData;
        Dea.makeCallback('loadPersonalizationOptions');
    }
    return false;
}

 Dea.getFiltersForFacility = function (isSearch) {
     Dea.setEmsData(true);
     if (!isSearch) {
         Dea.emsData.searchBuilding = Dea.Get('FacilityId').value;
     }
     Dea.makeCallback('getFiltersForFacility');
 };

 Dea.setFiltersForFacilityChange = function (emsResponse) {
     Dea.setHtml('roomTypesContainer', emsResponse.searchRoomTypesHtml);
     Dea.setHtml('setupContainer', emsResponse.setupTypesHtml);
     Dea.setHtml('floorsContainer', emsResponse.searchFloorsHtml);

     Dea.setHtml('searchRoomTypesContainer', emsResponse.searchRoomTypesHtml);
     Dea.setHtml('searchFloorsContainer', emsResponse.searchFloorsHtml);
     Dea.setHtml('availableRoomsContainer', emsResponse.availableRoomsHtml);
 };

 Dea.pageHandleCallback = function (emsResponse, context) {

     switch (context) {
         case 'loadPersonalizationOptions':
             Dea.setHtml('facilitiesContainer', emsResponse.facilitiesHtml);
             Dea.setHtml('timeZoneContainer', emsResponse.timezonesHtml);
             Dea.setHtml('floorsContainer', emsResponse.floorsHtml);
             Dea.setHtml('setupContainer', emsResponse.setupTypeHtml);
             Dea.setHtml('roomTypesContainer', emsResponse.roomTypesHtml);
             Dea.setHtml('eventTypesContainer', emsResponse.eventTypesHtml);
             Dea.setValue('EventName', emsResponse.eventName);
             Dea.setHtml('resultsAsContainer', emsResponse.resultsAsHtml);
             if (emsResponse.resultsAsValue !== '') {
                 if (emsResponse.resultsAsValue === 'AsList') {
                     $('#ctl00_pc_AsList').attr('checked', true);
                 }
                 else if (emsResponse.resultsAsValue === 'AsFloorMap') {
                     $('#ctl00_pc_AsFloorMap').attr('checked', true);
                 }
                 else if (emsResponse.resultsAsValue === 'AsGrid') {
                     $('#ctl00_pc_AsGrid').attr('checked', true);
                 }
             }
             Dea.setValue('StartTime', emsResponse.startTime);
             Dea.setValue('EndTime', emsResponse.endTime);

             Dea.setHtml('areasContainer', emsResponse.areasHtml);

             Dea.facilities.load(emsResponse.addToFacilities);
             if (emsResponse.hideAreas === '1') {
                 Dea.setDisplay('areasContainer', 'none');
             }
             else {
                 Dea.setDisplay('areasContainer', '');
             }
             Dea.setHtml('pamShowTimeAsContainer', emsResponse.pamShowTimeAsHtml);
             Dea.setHtml('pamReminderContainer', emsResponse.pamReminderHtml);

             Dea.setValue('PamShowTimeAs', emsResponse.pamShowTimeAs);
             Dea.setValue('PamReminder', emsResponse.pamReminder);

             Dea.setDisplay('optionsContainer', '');
             Dea.setDisplay('messageContainer', 'none');
             $('input[id*=\'Time\']').timePicker();
             return true;
         case 'savePreferences':
             Dea.setDisplay('optionsContainer', 'none');
             Dea.setDisplay('messageContainer', '');
             Dea.setHtml('messageContainer', emsResponse.messageToUser);
             return true;
         case 'getRooms':
             Dea.setHtml('availableRoomsContainer', emsResponse.availableRoomsHtml);
             $('#availableRoomsContainer').addRowHighlights();
             return true;
         case 'saveView':
             $('input[id*=viewId]').val(emsResponse.viewId);
             alert(Dea.Msgs.Saved);
             return true;
         case 'addLocation':
         case 'removeLocation':
             Dea.setHtml('finisher', emsResponse.finisherHtml);
             $('#finisher').addRowHighlights();
             return true;
         case 'getFiltersForFacility':
             Dea.setFiltersForFacilityChange(emsResponse);
             return true;
     }
     return false;
 };

function addLocation(event, o, roomId) {
    transfer(o);
    $(o).css('visibility', 'hidden');
    Dea.emsData.viewId = $('input[id*=viewId]').val();
    Dea.emsData.roomId = roomId;
    Dea.makeCallback('addLocation');
    return false;
}

function removeLocationFromFavorite(roomId) {
    Dea.emsData.viewId = $('input[id*=viewId]').val();
    Dea.emsData.roomId = roomId;
    Dea.makeCallback('removeLocation');
    return false;
}


function transfer(o) {
    $(o).effect('transfer', { to: '#finisher', className: 'ui-effects-transfer' }, 500);
}

function loadRooms() {
    Dea.emsData.viewId = $('input[id*=viewId]').val();
    Dea.emsData.searchBuilding = Dea.getValue('searchBuilding');
    Dea.emsData.searchFloor = Dea.getValue('searchFloor');
    Dea.emsData.searchRoomTypes = Dea.getValue('searchRoomTypes');

    Dea.makeCallback('getRooms');
    return false;
}

function showHideFilters()
{
    var f = Dea.Get('filtersBox');
    var i = Dea.Get(sExpandImageId);
    
    if(f.style.display === 'none')
    {
        i.src = 'images/btn-Collapse.png';
        i.alt = sCollapseAlt;
        Dea.setDisplay(f, '');
    }
    else
    {
        i.src = 'images/btn-Expand.png';
        i.alt = sExpandAlt;
        Dea.setDisplay(f, 'none');
    }
    return false;
}

function savePreferences()
{
    if(sData !== null){
        Dea.emsData.templateId = sData;
        Dea.setEmsData(false);
        if ($('#ctl00_pc_AsList').is(':checked')) {
            Dea.emsData.ResultsAs = 'AsList';
        }
        else if ($('#ctl00_pc_AsGrid').is(':checked')) {
            Dea.emsData.ResultsAs = 'AsGrid';
        }
        else if ($('#ctl00_pc_AsFloorMap').is(':checked')) {
            Dea.emsData.ResultsAs = 'AsFloorMap';
        }
        else {
           Dea.emsData.ResultsAs = '';
        }
        
        Dea.makeCallback('savePreferences');
    }
    return false;
}

function selectText(box) {
	if(box)
	{
		checkDateFired = false;
		try{
			box.select();
		}
		catch(cantSelect) {
		}
		if (typeof (clearResults) !== 'undefined') {
		    clearResults();
		}
	}
}

function doSaveViewAddEdit() {
    Dea.emsData.viewId = $('input[id*=viewId]').val(); 
    Dea.emsData.viewName = $('input[id*=ViewName]').val();
    Dea.makeCallback('saveView');
    return false;
}
