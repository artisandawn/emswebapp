var vems = vems || {};

vems.templateModalShowing = function (event) {
    var button = $(event.relatedTarget);
    var navUrl = button.data('navigateurl');
    var templateId = button.data('templateid');

    $(event.target).on('click', '#bookNowBtn', function () {
        window.location = navUrl;
    });

    vems.ajaxPost(
    {
        url: vems.serverApiUrl() + '/ReservationTemplate',
        data: '{ id: ' + templateId + ' }',
        success: function (results) {
            if (typeof ko.dataFor($('#template-modal-content')[0]) === 'undefined') {
                vems.templateVM = ko.mapping.fromJS(JSON.parse(results.d));
                ko.applyBindings(vems.templateVM, $('#template-modal-content')[0]);
            } else {
                if (typeof vems.templateVM === 'undefined') {
                    vems.templateVM = ko.mapping.fromJS(JSON.parse(results.d));
                } else {
                    ko.mapping.fromJS(JSON.parse(results.d), vems.templateVM);
                }

                // below code used to select first tab by default (for use when switching b/w templates with tab already active)
                $('#template-modal-tabs li:first-child').tab('show');
                $('#template-modal-tab-content div').removeClass('active');
                $('#template-modal-tab-content div:first-child').addClass('active');
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};