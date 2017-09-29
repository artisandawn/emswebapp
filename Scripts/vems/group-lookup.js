/// <reference path="jquery-1.4.2.min-vsdoc.js" />
$(document).ready(function () {
    $('#finisher').addRowHighlights();
    Dea.setPopup();
    if (typeof (parent.closeiFrameDiag) !== 'function') {
        $('.closeBtn').hide();
    }

     $(Dea.Get('searchText')).bind('keyup', function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code === 13) {
            loadGroups();
            e.preventDefault();
        }
     });
    

});

function loadGroups() {
    if(Dea.getValue('searchText') === '') {
        return false;
    } else {
        Dea.setEmsData();
        Dea.makeCallback('getGroupsContaining');
    }
    return false;
}

Dea.pageHandleCallback = function (emsResponse, context) {
    switch (context) {
        case 'removeGroup':
        case 'addGroup':
            Dea.setHtml('finisher', emsResponse.groupsOnUserHtml);
            $('#finisher').addRowHighlights();
            Dea.emsData.groupId = -1;
            return true;
        case 'getGroupsContaining':
            Dea.setHtml('availableGroupsContainer', emsResponse.availableGroupsHtml);
            $('#availableGroupsContainer').addRowHighlights();
            return true;
    }
    return false;
};

function removeGroupFromUser(gid)
{
   Dea.emsData.groupId = gid;
   Dea.makeCallback('removeGroup');
   parent.updateGroupDrop(-1, gid);
   return false;
}

function addGroupToUser(e, o, gid, gText) {
    
    Dea.emsData.groupId = gid;
    Dea.makeCallback('addGroup');
    var row = $(o).closest('td').closest('tr').remove();
    parent.updateGroupDrop(1, gid, gText);
    return false;
}

function closeMe() {
    parent.closeiFrameDiag();
    return false;
}