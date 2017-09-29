Dea.TandC = {
    setDiag: function () {
        $('.terms').dialog({
            autoOpen: false,
            modal: true,
            width: 500,
            resizable: true
        });
    },
    wireUp: function () {
        $('.terms').hide();
        //this.setDiag();
        $('.tandc').each(function () {
            var tcId = $(this).attr('data-id');
            if ($('div[data-id=' + tcId + ']').text().trim() === '') {
                $(this).hide();
            }
            else {
                if ($('#wtTandC').text().trim() === '') {
                    $('#TandCDiag').bind('click', function (e) {
                        e.preventDefault();
                        showEmsDiag($('div[data-id=' + tcId + ']'), { title: Dea.Msgs.TermsAndConditions, modal: true, width: 500, resizable: true });
                    });
                }
            }
        });
    },
    isValid: function () {
        var tc = $('input[id*=TermsAndConditions]');
        if (tc.is(':visible')) {
            if (!tc.is(':checked')) {
                alert(Dea.Msgs.AgreeToTerms);
                return false;
            }
        }
        return true;
    },
    showTandC: function () {
        $('div[id*=TandCContainer]').show();
        if (typeof (emsState) !== 'undefined') {
            if ($('#wtTandC').text().trim() === '') {
                $('#TandCDiag').hide();
            }
        }

    },
    hideTandC: function () {
        if ($('#wtTandC').text().trim() === '') {
            $('div[id*=TandCContainer]').hide();
        }
    }
};

$(document).ready(function () {
    $('#TandCDiag').live('click', function (e) {
        e.preventDefault();
        if ($('#wtTandC').text().trim() !== '') {
            showEmsDiag('wtTandC', { title: Dea.Msgs.TermsAndConditions, modal: true,
                width: 500,
                resizable: true
            });
        }
    });

    $('.tandc').live('click', function (e) {
        e.preventDefault();
        var tcId = $(this).attr('data-id');
        showEmsDiag($('div[data-id=' + tcId + ']'), { title: Dea.Msgs.TermsAndConditions, modal: true, width: 500, resizable: true });
        return false;
    });
    Dea.TandC.wireUp();
});
