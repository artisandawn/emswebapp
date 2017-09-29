var vems = vems || {};

vems.actAsModalShowing = function (event) {
    $(event.target).on('click', '#actas-ok-btn', function () {
        var selectedDiv = $('#actas-modal-content .row-selected');
        if (selectedDiv.length === 0) {
            vems.showAlertMessage('Please select a user to impersonate.');
        } else {
            var selectedUser = selectedDiv.attr('data-email').replace('\\', '\\\\').replace('\'', '\\\'');
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/EnableDelegation',
                data: '{ delegateUserName: \'' + selectedUser + '\' }',
                success: function (results) {
                    window.location.reload(true);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                    return false;
                }
            });
        }
    });

    $(event.target).on('click', '#actas-stop-acting', function () {
        var originalUser = $('.actas-modal-message').attr('data-email').replace('\\', '\\\\').replace('\'', '\\\'');
        vems.ajaxPost({  // 'impersonate' yourself (aka, return to normal signed-in status)
            url: vems.serverApiUrl() + '/EnableDelegation',
            data: '{ delegateUserName: \'' + originalUser + '\' }',
            success: function (results) {
                window.location.reload(true);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                return false;
            }
        });
    });

    $(event.target).on('keyup', '#actas-search-input', function () {
        var vm = ko.dataFor(this);
        var searchStr = this.value.toLowerCase();
        vm.DelegatesSearchResults($.grep(vm.Delegates(), function (el, ndx) {
            return el.UserName().toLowerCase().indexOf(searchStr) > -1;
        }));

        // disable ok button if search eliminates selection
        if ($('#actas-modal-content .row-selected').length === 0) {
            $('#actas-ok-btn').attr('disabled', 'disabled');
        }
    });

    $(event.target).on('click', '.row-selectable', function () {
        $('#actas-modal-content .row-selectable').removeClass('row-selected');
        $(this).addClass('row-selected');
        $('#actas-ok-btn').removeAttr('disabled');
    });

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetUserImpersonationList',
        success: function (results) {
            if (typeof ko.dataFor($('#actas-modal-content')[0]) === 'undefined') {
                vems.actAsVM = ko.mapping.fromJS(JSON.parse(results.d));
                ko.applyBindings(vems.actAsVM, $('#actas-modal-content')[0]);
            } else {
                if (typeof vems.actAsVM === 'undefined') {
                    vems.actAsVM = ko.mapping.fromJS(JSON.parse(results.d));
                } else {
                    ko.mapping.fromJS(JSON.parse(results.d), vems.actAsVM);
                }
            }

            $('#actas-search-input').val('');  // clear search value when impersonation list loaded
            $('#actas-ok-btn').attr('disabled', 'disabled');  // disable ok button by default
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};
