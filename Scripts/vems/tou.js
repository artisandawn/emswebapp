var vems = vems || {};

vems.touModalShowing = function (event) {
    $(event.target).on('click', '#tou-print-btn', function () {
        var tou = $('#tou-modal .modal-body').html();
        var printWindow = window.open('', vems.screenText.termsOfUseText);
        printWindow.document.write(tou);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    });

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetTermsOfUse',
        success: function (results) {
            if (typeof ko.dataFor($('#tou-modal-content')[0]) === 'undefined') {
                vems.touVM = ko.mapping.fromJS(JSON.parse(results.d));
                ko.applyBindings(vems.touVM, $('#tou-modal-content')[0]);
            } else {
                if (typeof vems.touVM === 'undefined') {
                    vems.touVM = ko.mapping.fromJS(JSON.parse(results.d));
                } else {
                    ko.mapping.fromJS(JSON.parse(results.d), vems.touVM);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};
