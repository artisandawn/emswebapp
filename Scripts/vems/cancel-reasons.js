$(document).ready(function () {
    $('#cancelDialog').dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        width: 450,
        height:260,
        open: function () {
            var t = $(this).parent(), w = $(window);
            t.offset({
                top: (w.height() / 2) - (t.height() / 2),
                left: (w.width() / 2) - (t.width() / 2)
            });
        }
    });
});
Dea.CancelReasons = {
    items: [],
    add: function (cr) { this.items.push(cr); },
    requireNotes: function (id) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].Id === id) {
                return this.items[i].RequireNotes === 1;
            }
        }
        return false;
    }
};

Dea.CancelReason = function (id, requireNotes) {
    this.Id = id;
    this.RequireNotes = requireNotes;
};

function closeDiag() {
    $('#cancelDialog').dialog('close');
    return false;
}

var emsCancelBookingsCallback = '';
function cancelBookings(forceShow, onSaveCallback, confirmMsg) {
    emsCancelBookingsCallback = onSaveCallback;
    if (forceShow === true || $('input[type=checkbox]:checked').length > 0) {
        if ($('#' + emsCRBoxId + ' option').size() < 2) {
            $('#reasons').hide();
        }
        else {
            $('#' + emsCRBoxId).change(function () {
                $('label[for=' + emsCRNoteId + ']').children().remove();
                if (Dea.CancelReasons.requireNotes($(this).val())) {
                    $('label[for=' + emsCRNoteId + ']').append('<span class="requiredAsterisk">*</span>');
                }
            });
        }
        $('#cancelConfirm').html(confirmMsg);
        $('#cancelDialog').dialog('open');
    }
    else {
        if (forceShow === false) {
            if ($('input[type=checkbox]:checked').length === 0) {
                alert(ems_NothingSelected);
                return false;
            }
        }
        window.location.href = emsCancelLink;
    }
    return false;
}

function doCancelBookings() {
    var requireNotes = false;
    if ($('#' + emsCRBoxId + ' option').size() > 2) {
        Dea.emsData.CancelReason = Dea.getValue('CancelReason');
        Dea.emsData.CancelNotes = Dea.getValue('CancelNotes');
        requireNotes = Dea.CancelReasons.requireNotes(Dea.emsData.CancelReason);
    }
    else {
        Dea.emsData.CancelReason = 0;
        Dea.emsData.CancelNotes = '';
    }

    if (requireCancelReason) {
        if (Dea.emsData.CancelReason === -1) {
            var cr = $('#' + emsCRBoxId);
            alert(cr.attr('errorMsg'));
            cr.focus();
            return false;
        }
    }
    if (requireNotes) {
        if (Dea.emsData.CancelNotes.trim() === '') {
            var cr = $('#' + emsCRNoteId);
            alert(emsCancelReasonRequired);
            cr.focus();
            return false;
        }
    }

    if (Dea.emsData.CancelNotes.length > 0 && Dea.emsData.CancelReason === '-1') {
        var cr = $('#' + emsCRBoxId);
        alert(emsCancelNotesButNoReason);
        cr.focus();
        return false;
    }

    if (Dea.emsData.CancelNotes.length > 255) {
        var cr = $('#' + emsCRNoteId);
        alert(emsCancelReasonTooLong);
        cr.focus();
        return false;
    }
    emsCancelBookingsCallback();

    return false;
}




