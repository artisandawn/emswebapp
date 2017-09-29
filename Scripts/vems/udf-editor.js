$(document).ready(function () {
    if (isSoEdit === 0) {
        $('#editableUdfs').tabs();
        Dea.setTabs('editableUdfs');
    }
});


function udf(categoryId, udfId, boxId, isRequired, isEnabled) {
    this.CategoryId = categoryId;
    this.UdfId = udfId;
    this.Box = Dea.Get(boxId);
    if (!isEnabled) {
        this.Box.disabled = true;
    }
    this.IsRequired = isRequired;
}

function backToSummary() {
    if (isSoEdit === 1) {
        window.location.href = ems_resSummaryLink;
    }
    else {
        if (typeof (parent.Dea.RS.refreshUdfs) !== 'undefined') {
            parent.Dea.RS.refreshUdfs();
        }
        parent.iFrameDiag.dialog('close');
        
    }
    return false;
}

Dea.pageHandleCallback = function (emsResponse, context) {
    switch (context) {
        case 'updateUdfs':
            backToSummary();
            return true;
    }
};


Dea.udfEditor = {
    udfs: [],
    load: function (toParse) {
        this.udfs.length = 0;
        if (toParse !== '') {
            var udfsToEdit = toParse.split('||');
            for (var i = 0; i < udfsToEdit.length; i++) {
                var ru = udfsToEdit[i].split('|');
                this.udfs.push(new udf(ru[0], ru[1], ru[2], ru[3], true));
            }
        }
    },
    save: function () {
        if (this.validate()) {
            Dea.makeCallback('updateUdfs');
        }
        return false;
    },
    validate: function () {
        for (var j = 0; j < this.udfs.length; j++) {
            var rUdf = 'Dea.emsData.udfId_' + this.udfs[j].UdfId;

            eval(rUdf + ' = ' + Dea.JSON.stringify(this.udfs[j].Box.value.trim()));
            var em = this.udfs[j].Box.getAttribute('errorMsg');
            if (em === null) {
                em = this.udfs[j].Box.errorMsg;
            }

            em = Dea.htmlDecode(em);

            if (this.udfs[j].IsRequired === 'True') {
                if (this.udfs[j].Box.tagName === 'SELECT') {
                    if (this.udfs[j].Box.value === '0') {
                        this.showError(em, this.udfs[j].Box);
                        return false;
                    }
                }
                else {
                    if (this.udfs[j].Box.value === '') {
                        this.showError(em, this.udfs[j].Box);
                        return false;
                    }
                }
            }
        }
        return true;
    },
    showError: function (msg, o) {
        alert(msg);
        $(o).focus();
    }
};
 




 
 