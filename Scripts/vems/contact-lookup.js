/// <reference path="jquery-1.4.2.min-vsdoc.js" />
$(document).ready(function () {
    Dea.setPopup();
    $('#finisher').addRowHighlights();
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
    if (Dea.getValue('searchText') === '') {
        return false;
    }
    else {
        Dea.setEmsData();
        Dea.makeCallback('getGroupsContaining');
    }
    return false;
}

Dea.pageHandleCallback = function (emsResponse, context) {
    switch (context) {
        case 'addContact':
        case 'setDefaultContact':
        case 'toggleActive':
            Dea.setHtml('finisher', emsResponse.contactsOnGroupsHtml);
            $('#finisher').addRowHighlights();
            Dea.emsData.groupId = -1;
            Dea.emsData.contactId = -1;
            if (context === 'addContact' || context === 'toggleActive') {
                parent.updateContactDrops(emsResponse.contactId, emsResponse.contactName, emsResponse.contactActive === 1);
            }
            return true;
        case 'getGroupsContaining':
            Dea.setHtml('availableGroupsContainer', emsResponse.availableGroupsHtml);
            $('#availableGroupsContainer').addRowHighlights();
            return true;
    }
    return false;
};

function addContactToGroup(e, gid) {
    Dea.emsData.groupId = gid;
    Dea.makeCallback('addContact');
    var cell = $(e.target).parent();
    $(cell).parent().remove();

    return false;
}

function setDefaultContact(cId) {
    Dea.emsData.contactId = cId;
    Dea.makeCallback('setDefaultContact');
    return false;
}

function toggleContactActive(cId, isActive) {
    Dea.emsData.contactId = cId;
    Dea.emsData.isActive = isActive;
    Dea.makeCallback('toggleActive');
    return false;
}

function closeMe() {
    parent.closeiFrameDiag();
    return false;
}
