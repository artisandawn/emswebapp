/// <reference path="jquery-1.4.2.min-vsdoc.js" />
function updateGroupDrop(a, gid, text) {
    var oGroups = Dea.Get('GroupId');
    if (a === 1) {
        addOpt(oGroups, gid, text);
    }
    else {
        removeOpt(oGroups, gid);
    }
    return false;
}

function addOpt(ddl, id, text) {
    var optn = document.createElement('OPTION');
    optn.text = text;
    optn.value = id;
    ddl.options.add(optn);
}

function removeOpt(ddl, id) {
    for (var i = 0; i < ddl.options.length; i++) {
        if (Number(ddl.options[i].value) === Number(id)) {
            ddl.remove(i);
        }
    }
}


function updateContactDrops(cId, text, isAdd) {
    var oContact = Dea.Get('Contact');
    if (oContact) {
        if (isAdd) {
            addOpt(oContact, cId, text);
        }
        else {
           removeOpt(oContact, cId);
        }
    }

    var oAltContact = Dea.Get('AltContact');
    if (oAltContact) {
        if (isAdd) {
            addOpt(oAltContact, cId, text);
        }
        else {
            removeOpt(oAltContact, cId);
        }
    }
    return false;
}

function loadContactsForGroup() {
    Dea.setEmsData(true);
    Dea.makeCallback('loadContactsForGroup');
    return false;
}


var emsBillingInfo = { 'resBillingRef': '', 'resPONumber': '' };

function setBiilingInfo(br, po) {
    var obr = Dea.Get('ResBillingReference') || Dea.Get('SOBillingReference');
    if (obr) {
        obr.value = br;
    }

    var opo = Dea.Get('ResPONumber') || Dea.Get('SOPONumber');
    if (opo) {
        opo.value = po;
    }
    return;
}


function setContactDetails(emsResponse) {

    var otcn = Dea.Get('tempContactName');
    if (emsResponse.contactId === '0') {
        Dea.setDisplay('tempContactNameRow', '');
        otcn.value = emsResponse.Contact;
        otcn.isRequired = true;
    }
    else {
        Dea.setDisplay('tempContactNameRow', 'none');
        otcn.value = '';
        otcn.isRequired = false;
    }

    var phone = Dea.Get('Phone');
    var fax = Dea.Get('Fax');
    phone.value = emsResponse.Phone;
    fax.value = emsResponse.Fax;
    Dea.setValue('Email', emsResponse.Email);
    setLabelText(emsResponse.PhoneLabel, phone.id);
    setLabelText(emsResponse.FaxLabel, fax.id);
    setLabelText(getLabelText(otcn.id), otcn.id);
    
}

function setAltContactDetails(emsResponse) {
    if (Dea.Get('altConactContainer')) {
        if (emsResponse.contactId === '0') {
            var oatcn = Dea.Get('altTempContactName');
            Dea.setDisplay('altTempContactNameRow', '');
            Dea.Get('altTempContactName').isRequired = true;
            setLabelText(getLabelText(oatcn.id), oatcn.id);
        }
        else {
            Dea.setDisplay('altTempContactNameRow', 'none');
            Dea.setValue('altTempContactName', '');
        }
        var phone = Dea.Get('AltPhone');
        var fax = Dea.Get('AltFax');
        var email = Dea.Get('AltEmail');
        if (emsResponse.contactId === '-1') {
            phone.isRequired = false;
            fax.isRequired = false;
            email.isRequired = false;
        }
        else {
            phone.isRequired = Dea.Get('Phone').isRequired;
            fax.isRequired = Dea.Get('Fax').isRequired;
            email.isRequired = Dea.Get('Email').isRequired;
        }

        phone.value = emsResponse.Phone;
        fax.value = emsResponse.Fax;
        email.value = emsResponse.Email;
        setLabelText(emsResponse.PhoneLabel, phone.id);
        setLabelText(emsResponse.FaxLabel, fax.id);
        setLabelText(getLabelText(email.id), email.id);
        
    }
}


function clearAltContact(emsResponse) {
    if (Dea.Get('altConactContainer')) {
        var phone = Dea.Get('AltPhone');
        var fax = Dea.Get('AltFax');
        var email = Dea.Get('AltEmail');
        phone.value = '';
        fax.value = '';
        email.value = '';
        if (emsResponse.altContactId === '-1') {
            phone.isRequired = false;
            fax.isRequired = false;
            email.isRequired = false;
            phone.disabled = true;
            fax.disabled = true;
            email.disabled = true;
        }
        else {
            phone.isRequired = Dea.Get('Phone').isRequired;
            fax.isRequired = Dea.Get('Fax').isRequired;
            email.isRequired = Dea.Get('Email').isRequired;
        }
        setLabelText(emsResponse.defaultPhoneLabel, phone.id);
        setLabelText(emsResponse.defaultFaxLabel, fax.id);
        setLabelText(getLabelText(email.id), email.id);
    }
}

function getLabelText(id) {
    var lbl = Dea.getLabelFromForAttr(id);
    if (lbl === null) {
        return;
    }
    return lbl.innerHTML.substring(0, (lbl.innerHTML.indexOf(':')));
}

function setLabelText(s, id) {
    Dea.setLabelText(s, id);
}

function reloadGroups() {
    return false;
}

function loadContactDetails() {
    Dea.emsData.Contact = Dea.getValue('Contact');
    Dea.emsData.GroupId = Dea.getValue('GroupId');
    Dea.makeCallback('loadContactDetails');
    return false;
}

function loadAltContact(sender) {
    if (sender.value === '-1') {
        Dea.setDisplay('altTempContactNameRow', 'none');
        Dea.setValue('altTempContactName', '');
        var email = Dea.Get('AltEmail');
        var phone = Dea.Get('AltPhone');
        var fax = Dea.Get('AltFax');
        phone.value = '';
        fax.value = '';
        email.value = '';
        phone.disabled = true;
        fax.disabled = true;
        email.disabled = true;
        phone.isRequired = false;
        fax.isRequired = false;
        email.isRequired = false;
        setLabelText(ems_phoneLabel, phone.id);
        setLabelText(ems_faxLabel, fax.id);
        setLabelText(getLabelText(email.id), email.id);


    }
    else {
        Dea.emsData.AltContact = Dea.getValue('AltContact');
        Dea.emsData.Group = Dea.getValue('GroupId');
        Dea.Get('AltPhone').disabled = false;
        Dea.Get('AltFax').disabled = false;
        Dea.Get('AltEmail').disabled = false;
        Dea.makeCallback('loadAltContactDetails');
    }
    return false;
}