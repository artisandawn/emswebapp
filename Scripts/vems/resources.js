/// <reference path="jquery-1.4.2.min-vsdoc.js" />
function resourceItem(resourceId, resourceItemId, resourceSelectionId, riCbId) {
    this.ResourceId = Number(resourceId);
    this.ResourceItemId = Number(resourceItemId);
    this.ResourceSelectionId = Number(resourceSelectionId);
    this.ItemBox = function () { return Dea.Get(riCbId); };
}
function resourceSelection(resourceId, resourceSelectionId, minPick, maxPick, description) {
    this.ResourceId = Number(resourceId);
    this.ResourceSelectionId = Number(resourceSelectionId);
    this.MinPick = Number(minPick);
    this.MaxPick = Number(maxPick);
    this.Description = description;
}
function noteCategory(categoryId, notesBoxId) {
    this.categoryId = categoryId;
    this.NotesBox = Dea.Get(notesBoxId);
}
function udf(categoryId, udfId, boxId, isRequired, isEnabled) {
    this.CategoryId = categoryId;
    this.UdfId = udfId;
    this.Box = Dea.Get(boxId);
    if (!isEnabled) {
        this.Box.disabled = true;
    }
    this.IsRequired = isRequired;
}

function resource(categoryId, resourceId, checkboxId, quantityBoxId, siContainerId, siBoxId, maintainInventory, maxQuantity, requireBilling,
    requirePONumber, description, resourceTypeCode, serviceTypeBoxId, estimatedCountBoxId, defaultQuantityMode, rgcId, minQuantity, serves,
    defaultQuantity, serviceStartTimeBoxId, serviceEndTimeBoxId, alertMsg, hideSI, pItems) {
    this.CategoryId = categoryId;
    this.ResourceId = resourceId;
    this.MaintainInventory = maintainInventory;
    this.MaxQuantity = maxQuantity;
    this.RequireBilling = requireBilling;
    this.RequirePONumber = requirePONumber;
    this.Description = description.replace('!@##@!', '|');
    this.ResourceTypeCode = resourceTypeCode;
    this.MinQuantity = minQuantity;
    this.Serves = serves;
    this.ToggleBox = function () { return Dea.Get(checkboxId); };
    this.QuantityBox = function () { return Dea.Get(quantityBoxId); };
    this.SpecialInstructionsBox = function () { return Dea.Get(siBoxId); };
    this.SIContainer = function () { return Dea.Get(siContainerId); };
    this.RGC = function () { return Dea.Get(rgcId); };

    this.ServiceTypeBox = function () { return Dea.Get(serviceTypeBoxId); };
    this.ServiceStartTimeBox = function () { return Dea.Get(serviceStartTimeBoxId); };
    this.ServiceEndTimeBox = function () { return Dea.Get(serviceEndTimeBoxId); };
    this.EstimatedCountBox = function () { return Dea.Get(estimatedCountBoxId); };

    this.DefaultQuantityMode = defaultQuantityMode;
    this.DefaultQuantityFromDB = defaultQuantity === '-99' ? '' : defaultQuantity;
    this.DefaultQuantity = getDefaultQuantity;
    this.AlertMsg = alertMsg.replace('!@##@!', '|').trim();
    this.HideSI = hideSI;
    this.PackageItems = pItems.split(',');
}

function validateStringLength(s, isNotes) {
    if (s.length > 10000) {
        if (isNotes === 1) {
            alert(Dea.Msgs.NotesMaxLength);
        }
        else if (isNotes === 0) {
            alert(Dea.Msgs.SpecialInstructionsMaxLength);
        }
        return false;
    }
    return true;
}

function getDefaultQuantity() {
    switch (this.DefaultQuantityMode) {
        case '-1': //add services
            return this.DefaultQuantityFromDB;
        case '0':
            return '';
        case '1':
            return '1';
        default:
            var a = Dea.Get('Attendance');
            if (a) {
                return a.value;
            }
            else {
                return '';
            }
    }
}

function getResource(rid) {
    for (var i = 0, j = _resources.length; i < j; i++) {
        if (Number(_resources[i].ResourceId) === rid) {
            return _resources[i];
        }
    }
    return null;
}

function showAlert(r) {
    if (r.AlertMsg !== '') {
        alert(r.AlertMsg);
    }
}

function toggleResource(o, rid) {

    var r = getResource(rid);

    var items = [];
    if (_resourceItems && _resourceItems.length > 0) {
        for (var i = 0; i < _resourceItems.length; i++) {
            if (_resourceItems[i].ResourceId === rid) {
                items.push(_resourceItems[i]);
            }
        }
    }

    if (o.checked === true) {
        $(o).parent().find(':checkbox').removeAttr('disabled');
        Dea.setDisabled(r.QuantityBox(), false);
        r.QuantityBox().value = r.DefaultQuantity() || '';
        Dea.setDisabled(r.SpecialInstructionsBox, false);
        if (r.HideSI === 0) {
            Dea.setDisplay(r.SIContainer, '');
        }
        Dea.setDisplay(r.RGC, '');

        for (var i = 0; i < items.length; i++) {
            items[i].ItemBox().disabled = false;
        }

        var ec = r.EstimatedCountBox();
        
        if (ec !== null && $(ec).val() === '') {
            if (typeof (Dea.EmsParameters) !== 'undefined') {
                if (typeof (Dea.EmsParameters.SetSetupCountFromAttendance) !== 'undefined') {
                    if (Dea.EmsParameters.SetSetupCountFromAttendance === 1) {
                        Dea.setValue(ec,Dea.getValue('Attendance'));
                    }
                }
            }
        }
        $('input[categoryId=' + r.CategoryId + ']').removeAttr('disabled');
        $('select[categoryId=' + r.CategoryId + ']').removeAttr('disabled');
        $('textarea[categoryId=' + r.CategoryId + ']').removeAttr('disabled');
        showAlert(r);
        var isPackage = false;
        for (var k = 0; k < r.PackageItems.length; k++) {
            if (Number(r.PackageItems[k]) !== 0) {
                isPackage = true;
                var rPi = getResource(Number(r.PackageItems[k]));
                if (rPi !== null) {
                    showAlert(rPi);
                }
            }
        }
        if (isPackage) {
            $(o).parent().find(':checkbox').attr('data-packid', rid);   
        }
    }
    else {
        $(o).parent().find(':checkbox').attr('disabled', 'disabled');
        $(o).removeAttr('disabled');

        var atLeastOne = false;
         for (var i = 0, j = _resources.length; i < j; i++) {
           if (Number(_resources[i].CategoryId) === Number(r.CategoryId)) {
               if (_resources[i].ToggleBox().checked) {
                   atLeastOne = true;
                   break;
               }
            }
       }
       if (!atLeastOne) {
           $('input[categoryId=' + r.CategoryId + ']').attr('disabled', 'disabled');
           $('select[categoryId=' + r.CategoryId + ']').attr('disabled', 'disabled');
           $('textarea[categoryId=' + r.CategoryId + ']').attr('disabled', 'disabled');
       }
        Dea.setValue(r.QuantityBox, '');
        Dea.setDisabled(r.QuantityBox, true);
        Dea.setDisabled(r.SpecialInstructionsBox, true);
        Dea.setValue(r.SpecialInstructionsBox, '');
        Dea.setDisplay(r.SIContainer, 'none');
        Dea.setDisplay(r.RGC, 'none');
        for (var i = 0; i < items.length; i++) {
            items[i].ItemBox().disabled = true;
        }
    }
    toggleBillingDisplay();
}

function getRS(rsId) {
    for (var i = 0; i < _resourceSelections.length; i++) {
        if (_resourceSelections[i].ResourceSelectionId === rsId) {
            return _resourceSelections[i];
        }
    }
}

function cc(o, rId, rsId) {
    var rs = getRS(rsId);
    var numSelected = 0;
    if (o.checked) {
        $(o).parent().parent().find(':checkbox').each(function () { if (this.checked) { numSelected++; } });

        if (numSelected > rs.MaxPick) {
            alert(Dea.Msgs.SubItemMaxViolation.format(rs.MaxPick));
            o.checked = false;
        }
    }
}

function checkRI(rId, rPackId) {
    for (var jj = 0; jj < _resourceSelections.length; jj++) {
        if (rId === -1 || _resourceSelections[jj].ResourceId === Number(rId)) {
            var selectedCount = 0;
            var onPackage = false;
            if (rPackId > 0) {
                $('input[data-packid=\'' + rPackId + '\']').each(function () { if (this.checked) { selectedCount++; } });
                onPackage = true;
            }
            else {
                if (_resourceSelections[jj].MinPick > 0) {
                    for (var jjj = 0; jjj < _resourceItems.length; jjj++) {
                        if (_resourceItems[jjj].ResourceSelectionId === _resourceSelections[jj].ResourceSelectionId) {
                            if (_resourceItems[jjj].ItemBox().checked) {
                                selectedCount++;
                                if (selectedCount >= _resourceSelections[jj].MinPick) {
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            var resId = Number(rId);
            if (onPackage) {
                //the package itself is selected counted by our count above
                selectedCount = selectedCount - 1;
                
            }
            if (rPackId > 0) {
                resId = Number(rPackId);
            }

            if (selectedCount < _resourceSelections[jj].MinPick) {
                var rDesc = '';
                
                for (var i = 0, j = _resources.length; i < j; i++) {
                    if (_resources[i].ResourceId === resId) {
                        rDesc = _resources[i].Description;
                        break;
                    }
                }
                alert(Dea.Msgs.SubItemMinViolation.format(_resourceSelections[jj].Description, rDesc, _resourceSelections[jj].MinPick));
                try {
                    Dea.Get(_resources[i].QuantityBox).focus();
                }
                catch (focusError) { }
                return false;
            }
        }
    }
    return true;
}

var _origIsTandCShowing = false;
$(document).ready(function () {
    _origIsTandCShowing = $('input[id*=TermsAndConditions]').is(':visible');
});


function toggleBillingDisplay() {
    var showBillingRef = false;
    var showPO = false;
    var showTandC = false;
    var inputs = document.getElementsByTagName('input');
    
    for (var i = 0, j = _resources.length; i < j; i++) {
        if (Dea.Get(_resources[i].ToggleBox(), inputs).checked === true) {
            if (!$('div[data-id=tc-' + _resources[i].CategoryId + ']').text().trim() === '') {
                showTandC = true;
            }
            if (_resources[i].RequireBilling === '1') {
                showBillingRef = true;
            }
            if (_resources[i].RequirePONumber === '1') {
                showPO = true;
            }
            if (showBillingRef === true && showPO === true && showTandC) {
                break;
            }
        }
    }

    if (showTandC && !isAddItem()) {
        Dea.TandC.showTandC();
    }
    else {
        if (_origIsTandCShowing === false) {
            Dea.TandC.hideTandC();
        }
    }
    
    if(typeof(ems_BillingRefContainer) !== 'undefined') {
        if (showBillingRef === true) {
            Dea.setDisplay(ems_BillingRefContainer, '');
        }
        else {
            if (originalIsBillingRefShowing === true) {
                Dea.setDisplay(ems_BillingRefContainer, '');
            }
            else {
                Dea.setDisplay(ems_BillingRefContainer, 'none');
            }
        }
        if (showPO === true) {
            Dea.setDisplay(ems_POContainer, '');
        }
        else {
            if (originalIsPOShowing === true) {
                Dea.setDisplay(ems_POContainer, '');
            }
            else {
                Dea.setDisplay(ems_POContainer, 'none');
            }
        }
    }

    if (typeof (ems_BillingContainer) !== 'undefined') {
        var bc = Dea.Get(ems_BillingContainer);
        if (showBillingRef === true || showPO === true) {
            Dea.setDisplay(bc, '');
        }
        else {
            if (originalIsPOShowing === true || originalIsBillingRefShowing === true) {
                Dea.setDisplay(bc, '');
            }
            else {
                Dea.setDisplay(bc, 'none');
            }
        }
    }
}

function isAddItem() {
    if (typeof (_isAddItem) !== 'undefined') {
        return _isAddItem;
    }
    else {
        return false;
    }
}

function expandCollapseCatGroup(img, ulId) {
    var o = Dea.Get(ulId);
    if (o.style.display === 'none') {
        Dea.setDisplay(o, '');
        img.src = img.src.replace('Expand', 'Collapse');
        $(img).hover(function () { $(img).attr('src', PathToRoot + 'images/btn-Collapse-over.png'); }, function () { $(img).attr('src', PathToRoot + 'Images/btn-Collapse.png');  });    
    }
    else {
        Dea.setDisplay(o, 'none');
        img.src = img.src.replace('Collapse', 'Expand');
        $(img).hover(function () { $(img).attr('src', PathToRoot + 'images/btn-Expand-over.png'); }, function () { $(img).attr('src', PathToRoot + 'Images/btn-Expand.png');  });    
    }
    return false;
}

var _resources = [];
function loadResources(s) {
    _resources.length = 0;
    if (s) {
        var allResources = s.split('||');
        for (var i = 0; i < allResources.length; i++) {
            var r = allResources[i].split('|');

            _resources.push(new resource(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8],
                r[9], r[10], r[11], r[12], r[13], r[14], r[15], r[16], r[17], r[18], r[19], r[20], r[21], r[22], r[23]));
        }
    }
}

var _notes = [];
function loadNotes(s) {
    _notes.length = 0;
    if (s) {
        var notes = s.split('||');
        for (var i = 0; i < notes.length; i++) {
            var n = notes[i].split('|');
            _notes.push(new noteCategory(n[0], n[1]));
        }
    }
}

var _resourceItems = [];
function loadResourceItems(emsResponse) {
    _resourceItems.length = 0;
    var allItems = null;
    if (typeof (emsResponse) === 'string') {
        allItems = emsResponse.split('||');
    }
    else {
        if (emsResponse.resourceItems) {
            allItems = emsResponse.resourceItems.split('||');
        }
    }
    if (allItems !== null) {
        for (var i = 0, j = allItems.length; i < j; i++) {
            var ri = allItems[i].split('|');
            _resourceItems.push(new resourceItem(ri[0], ri[1], ri[2], ri[3]));
        }
    }
}

var _resourceSelections = [];
function loadResourceGroups(emsResponse) {
    _resourceSelections.length = 0;
    var allItems = null;
    if (typeof (emsResponse) === 'string') {
        allItems = emsResponse.split('||');
    }
    else {
        if (emsResponse.resourceGroups) {
            allItems = emsResponse.resourceGroups.split('||');
        }
    }
    if(allItems !== null) {
        for (var i = 0, j = allItems.length; i < j; i++) {
            var ri = allItems[i].split('|');
            _resourceSelections.push(new resourceSelection(ri[0], ri[1], ri[2], ri[3], ri[4]));
        }
    }
}

var _udfs = [];
function loadUdfs(emsResponse) {
    _udfs.length = 0;
   if (emsResponse.udfs) {
        _udfs.length = 0;
        var udfs = emsResponse.udfs.split('||');
        for (var i = 0; i < udfs.length; i++) {
            var u = udfs[i].split('|');
            _udfs.push(new udf(u[0], u[1], u[2], u[3]));
        }
    }
}

function emptyOrZero(s) {
    return (s.trim() === '' || s === '0');
}

function validateResources(emsObject, validationMode, resourceErrorCallback, billingValidationCallback, estimatedCount) {
    for (var i = 0, ii = _resources.length; i < ii; i++) {
        if (Dea.Get(_resources[i].ToggleBox()).checked) {
            var oQ = _resources[i].QuantityBox();
            var oST = _resources[i].ServiceTypeBox();
            var oEC = _resources[i].EstimatedCountBox(),
            oSI = _resources[i].SpecialInstructionsBox(), oStart = _resources[i].ServiceStartTimeBox(), oEnd = _resources[i].ServiceEndTimeBox();
            var rQuant = oQ.value.trim();
            var rST = '';
            var rEC = '';
            var rSI = oSI.value.trim();

            //checked a box but no quantity
            if (rQuant === '') {
                resourceErrorCallback(Dea.Msgs.AddServicesCheckButNoQuantity.replace('{0}', _resources[i].Description), oQ);
                return false;
            }

            if (!emptyOrZero(rQuant)) {
                // quantity number check
                if (isNaN(rQuant)) {
                    resourceErrorCallback(Dea.Msgs.QuantityMustBeNumber, oQ);
                    return false;
                }
                // max quantity violation check
                if (Number(_resources[i].MaintainInventory) === 1) {
                    if (Number(rQuant) > Number(_resources[i].MaxQuantity)) {
                        resourceErrorCallback(Dea.Msgs.MaxQuantityViolation.format(_resources[i].Description, parseFloat(Number(_resources[i].MaxQuantity).toFixed(2))), oQ);
                        return false;
                    }
                }
                //min quantity violation
                if (Number(rQuant) < Number(_resources[i].MinQuantity)) {
                    resourceErrorCallback(Dea.Msgs.MinQuantityViolation.format(_resources[i].Description, parseFloat(Number(_resources[i].MinQuantity).toFixed(2))), oQ);
                    return false;
                }

                if (Number(rQuant) > 1 && (Number(rQuant) * _resources[i].Serves) > Number(estimatedCount)) {
                    if (!confirm(Dea.Msgs.QuantityServesWarning.format(_resources[i].Description, (parseFloat((Number(rQuant) * _resources[i].Serves).toFixed(2))), estimatedCount))) {
                        return false;
                    }
                }

                if (validationMode !== 'saveAddItem') {
                    if (_resources[i].ResourceTypeCode === 'CAT' || _resources[i].ResourceTypeCode === 'RSO') {
                        rST = oST.value;
                        // service type check
                        if (emptyOrZero(rST)) {
                            resourceErrorCallback(Dea.Msgs.RequiresService.format(_resources[i].Description), oST);
                            return false;
                        }
                        // estimated count
                        if (oEC !== null) {
                            rEC = oEC.value.trim();
                            if (emptyOrZero(rEC)) {
                                resourceErrorCallback(Dea.Msgs.RequiresEstimatedCount.format(_resources[i].Description), oEC);
                                return false;
                            }
                        }
                        // service start and end times
                        if (oStart !== null) {
                            var sResourceServiceStartTime = oStart.value.trim();
                            var sResourceServiceEndTime = oEnd.value.trim();

                            if (sResourceServiceStartTime === '') {
                                resourceErrorCallback(Dea.Msgs.RequiresStartTime.replace('{0}', _resources[i].Description), oStart);
                                return false;
                            }

                            if (sResourceServiceEndTime === '') {
                                resourceErrorCallback(Dea.Msgs.RequiresEndTime.replace('{0}', _resources[i].Description), oEnd);
                                return false;
                            }
                        }
                    }
                }

                for (var k = 0; k < _resources[i].PackageItems.length; k++) {
                    if (Number(_resources[i].PackageItems[k]) !== 0) {
                        if (checkRI(Number(_resources[i].PackageItems[k]), _resources[i].ResourceId) === false) {
                            return false;
                        }
                    }
                }

                // validates resource items
                if (checkRI(_resources[i].ResourceId, 0) === false) {
                    return false;
                }

                if ((Number(_resources[i].RequireBilling) === 1 || Number(_resources[i].RequirePONumber) === 1) && validationMode !== 'saveAddItem') {
                    if (!billingValidationCallback(_resources[i].Description, Number(_resources[i].RequireBilling), Number(_resources[i].RequirePONumber))) {
                        return false;
                    }
                }

                var rq = 'cid_' + _resources[i].CategoryId + '_rid_' + _resources[i].ResourceId;
                var rsp = 'cid_' + _resources[i].CategoryId + '_rid_' + _resources[i].ResourceId + '_sp';
                var crItems = 'cid_' + _resources[i].CategoryId + '_rid_' + _resources[i].ResourceId + '_items_a';
                var packageItems = 'cid_' + _resources[i].CategoryId + '_rid_' + _resources[i].ResourceId + '_items_a_b';
                

                //resource quantity cid_#_rid_#
                eval(emsObject + '.' + rq + ' = ' + rQuant);

                if (validateStringLength(_resources[i].SpecialInstructionsBox().value.trim(), 0) === false) {
                    resourceErrorCallback(Dea.Msgs.SpecialInstructionsMaxLength, rSI);
                    return false;
                }
                else {
                    //resource special instructions cid_#_rid_#_sp
                    eval(emsObject + '.' + rsp + ' = ' + Dea.JSON.stringify(rSI.trim()));
                }

                if (_resources[i].ResourceTypeCode === 'CAT' || _resources[i].ResourceTypeCode === 'RSO') {
                    var cst = 'cid_' + _resources[i].CategoryId + '_st';
                    eval(emsObject + '.' + cst + ' = ' + Dea.JSON.stringify(rST));
                    if (oStart !== null) {
                        var csst = 'cid_' + _resources[i].CategoryId + '_sst';
                        eval(emsObject + '.' + csst + ' = ' + Dea.JSON.stringify(_resources[i].ServiceStartTimeBox().value));
                        var cset = 'cid_' + _resources[i].CategoryId + '_set';
                        eval(emsObject + '.' + cset + ' = ' + Dea.JSON.stringify(_resources[i].ServiceEndTimeBox().value));
                    }
                }

                if (_resources[i].ResourceTypeCode === 'CAT') {
                    var cec = 'cid_' + _resources[i].CategoryId + '_ec';
                    eval(emsObject + '.' + cec + ' = ' + Dea.JSON.stringify(rEC));
                }

                var items = '';
                for (var iii = 0; iii < _resourceItems.length; iii++) {
                    if (_resourceItems[iii].ResourceId === Number(_resources[i].ResourceId)) {
                        if (_resourceItems[iii].ItemBox().checked) {
                            items += _resourceItems[iii].ResourceItemId + ',';
                        }
                    }
                }
                eval(emsObject + '.' + crItems + ' = ' + Dea.JSON.stringify(items));

                items = '';
                var isPackage = false;
                for (var k = 0; k < _resources[i].PackageItems.length; k++) {
                    if (Number(_resources[i].PackageItems[k]) !== 0) {
                        isPackage = true;
                    }
                }

                if (isPackage) {
                    $('input[data-packid=\'' + _resources[i].ResourceId + '\']').each(function () { if (this.checked && ($(this).attr('data-riid'))) { items += $(this).attr('data-riid') + ','; } });
                    eval(emsObject + '.' + packageItems + ' = ' + Dea.JSON.stringify(items));
                }

                //we have a resource, add the udfs alert if required on not filled out
                for (var j = 0; j < _udfs.length; j++) {
                    if (_udfs[j].CategoryId === _resources[i].CategoryId) {
                        var cUdf = 'cid_' + _udfs[j].CategoryId + '_udfId_' + _udfs[j].UdfId;
                        //add the udf
                        eval(emsObject + '.' + cUdf + ' = ' + Dea.JSON.stringify(_udfs[j].Box.value.trim()));

                        if (_udfs[j].IsRequired === 'True') {
                            if (_udfs[j].Box.tagName === 'SELECT') {
                                if (_udfs[j].Box.value === '0') {
                                    resourceErrorCallback(Dea.htmlDecode(_udfs[j].Box.getAttribute('errorMsg')), _udfs[j].Box);
                                    return false;
                                }
                            }
                            else {
                                if (_udfs[j].Box.value.trim() === '') {
                                    resourceErrorCallback(Dea.htmlDecode(_udfs[j].Box.getAttribute('errorMsg')), _udfs[j].Box);
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    for (var i = 0; i < _notes.length; i++) {
        var n = _notes[i].NotesBox.value.trim();
        if (n !== '') {
            if (validateStringLength(n, 1) === false) {
                return false;
            }
            var nsp = 'cid_' + _notes[i].categoryId + '_note';
            eval(emsObject + '.' + nsp + ' = ' + Dea.JSON.stringify(n));
        }
    }
    return true;
}