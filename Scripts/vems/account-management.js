var vems = vems || {};
vems.account = vems.account || {};
vems.account.viewModels = vems.account.viewModels || {};

/* Delegate Variables */
vems.account.delegateSortProp = '';  // must be valid property name of delegate object
vems.account.delegateSortDir = -1;  // -1 = descending, 1 = ascending
vems.account.delegateSourceArr = [];  // array of delegate objects
vems.account.delegateSearchSource = null;  // bloodhound object
vems.account.delegateSearchStr = '';

/* Saved Filter Variables */
vems.account.savedFilterSortProp = '';  // must be valid property name of saved filter object
vems.account.savedFilterSortDir = -1;  // -1 = descending, 1 = ascending

/* Template Default Variables */
vems.account.templateSortProp = '';  // must be valid property name of template (menuitem) object
vems.account.templateSortDir = -1;  // -1 = descending, 1 = ascending

/* Favorite Room Variables */
vems.account.favoriteSortProp = '';  // must be valid property name of room object
vems.account.favoriteSortDir = -1;  // -1 = descending, 1 = ascending
vems.account.favoriteSourceArr = [];  // array of room objects
vems.account.favoriteSearchSource = null;  // bloodhound object
vems.account.favoriteSearchStr = '';

/* Delegate Section */
vems.account.sortDelegates = function (propertyName) {
    if (propertyName) {  // adjust sort direction and column if necessary
        vems.account.delegateSortDir = vems.account.delegateSortProp === propertyName ? -(vems.account.delegateSortDir) : -1;
        vems.account.delegateSortProp = propertyName;
    }
    vems.account.viewModels.accountViewModel.delegatesViewModel.delegates.sort(function (delOne, delTwo) {
        if (delOne[vems.account.delegateSortProp].toLowerCase() < delTwo[vems.account.delegateSortProp].toLowerCase()) {
            return 1 * vems.account.delegateSortDir;
        } else if (delOne[vems.account.delegateSortProp].toLowerCase() > delTwo[vems.account.delegateSortProp].toLowerCase()) {
            return -1 * vems.account.delegateSortDir;
        } else {
            return 0;
        }
    });
    $('#delegate-grid-header').find('#delegate-grid-sort-indicator').remove();
    $('#delegate-grid-header-' + vems.account.delegateSortProp.toLowerCase()).append(
        '<i id="delegate-grid-sort-indicator" class="fa fa-angle-'
        + (vems.account.delegateSortDir === -1 ? 'up' : 'down')
        + '"></i>');
};

vems.account.getUserDelegates = function () {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/getUserDelegates',
        success: function (result) {
            var response = JSON.parse(result.d);
            if (response.Success) {
                vems.account.viewModels.accountViewModel.delegatesViewModel.delegates(JSON.parse(response.JsonData));
                vems.account.sortDelegates(vems.account.delegateSortProp ? '' : 'UserName');
            } else {
                vems.showToasterMessage('', response.ErrorMessage, 'danger');
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });

    return false;
};

vems.account.searchDelegates = function (typeAhead) {
    var jsonObj = {
        searchString: typeAhead.qry,
        groupId: self.groupId
    };
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/searchForDelegatesJson',
        data: JSON.stringify(jsonObj),
        success: function (result) {
            var response = JSON.parse(result.d);
            var temp = ko.observableArray([]);
            if (response.Success) {
                temp = JSON.parse(response.JsonData);
                $.each(temp, function (t) {  //decode the data before we send it along
                    t.UserName = vems.decodeHtml(t.UserName);
                });
            }
            else {
                console.log(response.ErrorMessage);
            }
            typeAhead.asyncCall(temp);
            return false;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
};

vems.account.delegateSearchInit = function () {
    // re-initialize typeahead control
    $('#delegate-search').typeahead('destroy');
    vems.bindLoadingGifsToTypeAhead($('#delegate-search').typeahead({
        minLength: 3,
        highlight: true
    }, {
        //source: vems.account.delegateSearchSource.ttAdapter(),
        source: function (query, sync, async) {
            vems.account.searchDelegates({ qry: query, asyncCall: async });
        },
        limit: 25,
        displayKey: 'UserName',
        templates: {
            suggestion: function (delegate) {
                return '<div>' + vems.decodeHtml(delegate.UserName) + ' <span class="delegate-typeahead-email">&lt;' + delegate.EmailAddress + '&gt;</span></div>'
            },
            notFound: '<div class="delegate-typeahead-notfound">' + vems.account.DelegateSearchNoMatchText + '</div>'
        }
    }).unbind('typeahead:select').bind('typeahead:select', function (event, delegate) {
        vems.account.moveDelegate('add', delegate.WebUserId);
    }));
    //$('#delegate-search').unbind('keyup').bind('keyup', function (event) {
    //    if (event.which === 38 || event.which === 40) { return; }  // prevent search while scrolling through options with arrow keys
    //    if (event.which === 13) {
    //        var newSearchStr = $('#delegate-search').val();
    //        if (newSearchStr.length === 2 || (newSearchStr.length > 2 && !(newSearchStr.indexOf(vems.account.delegateSearchStr) === 0))) {
    //            //vems.account.delegateSearchStr = newSearchStr;
    //            $('#delegate-search').typeahead('open');
    //        }
    //    }
    //});
};

vems.account.moveDelegate = function (action, delegateId) {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/moveDelegateJson',
        data: JSON.stringify({ actionToTake: action, delegateId: delegateId }),
        success: function (result) {
            var response = JSON.parse(result.d);
            if (response.Success) {
                vems.account.getUserDelegates();
                if (action === 'add') {
                    $('#delegate-search').typeahead('val', '');
                }
            } else {
                vems.showToasterMessage('', response.ErrorMessage, 'danger');
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
};
/* End Delegates Section */

/* User Info Section */
vems.account.enableControlsAndValidation = function () {
    var userinfoValidationRules = {
        submitHandler: function () {
            if (vems.account.viewModels.accountViewModel.IsCreate() && vems.account.viewModels.accountViewModel.EnableCaptcha()) {
                vems.account.showConfirmation();
            } else {
                if (userInfoTabVisible) {
                    vems.account.saveUserInfo();
                }
            }
        },
        invalidHandler: function (event, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                //var message = errors == 1
                //  ? " You must fix an issue before creating your account."
                //  : " You must fix " + errors + " issues before creating your account.";
                vems.showErrorToasterMessage(vems.account.AccountFormFailedValidationText);
            }
        }
    };
    jQuery.extend(userinfoValidationRules, vems.validationClasses);
    $("#VirtualEmsForm").validate(userinfoValidationRules);

    // create/request account specific validation
    if (vems.account.viewModels.accountViewModel.IsCreate() && $('#OnPageHelp').html().trim().length > 0) {
        $('#tou').rules('add', {
            required: true,
            messages: {
                required: 'Please read and accept the ' + vems.screenText.termsOfUseText + '.'
            }
        });
    }

    // edit AND create/request account validation
    var editIdPrefix = vems.account.viewModels.accountViewModel.IsCreate() ? '' : 'edit-';
    $('#' + editIdPrefix + 'username').rules('add', {
        required: true,
        trim: true,
        messages: {
            required: 'Please type your ' + vems.account.NameText.toLowerCase() + '.'
        }
    });
    $('#' + editIdPrefix + 'timezones').rules('add', {
        range: [-1, 1000000],
        messages: {
            range: 'Please select your ' + vems.account.TimeZoneText.toLowerCase() + '.'
        }
    });
    if (vems.account.viewModels.accountViewModel.EnablePhone()) {
        if (vems.account.viewModels.accountViewModel.userInfoViewModel.PhoneIsRequired()) {
            $('#' + editIdPrefix + 'phone').attr('required', 'required');
            $('#' + editIdPrefix + 'phone').rules('add', {
                required: true,
                trim: true,
                messages: {
                    required: 'Please type your ' + vems.account.PhoneText.toLowerCase() + '.'
                }
            });
        }
    }
    if (vems.account.viewModels.accountViewModel.EnableEmailAddress()) {
        $('#' + editIdPrefix + 'email-address').attr('required', 'required');
        $('#' + editIdPrefix + 'email-address').rules('add', {
            required: true,
            email: true,
            messages: {
                required: 'Please type your ' + vems.account.EmailText.toLowerCase() + '.'
            }
        });
        $('#' + editIdPrefix + 'email-address').blur(function () {
            var emailInput = $(this);
            if (emailInput.valid() && emailInput.val() && emailInput.val() !== vems.account.viewModels.accountViewModel.userInfoViewModel.originalEmail) {
                vems.account.checkEmailUsage(emailInput.val());
            }
        });

        if (vems.account.viewModels.accountViewModel.EnablePassword()) {
            if (vems.account.viewModels.accountViewModel.IsCreate() && vems.account.viewModels.accountViewModel.userInfoViewModel.PasswordIsRequired()) {
                $('#password').attr('required', 'required');
                $('#confirm-password-textbox').attr('required', 'required');
                $('#password').rules('add', {
                    required: true,
                    trim: true,
                    messages: {
                        required: 'Please type your ' + vems.account.PasswordText.toLowerCase() + '.'
                    }
                });
                $('#confirm-password-textbox').rules('add', {
                    equalTo: '#password',
                    required: true,
                    messages: {
                        equalTo: vems.account.PasswordsDoNotMatchText,
                        required: 'Please type your ' + vems.account.ConfirmPasswordText.toLowerCase() + '.'
                    }
                });
            } else {
                $('#edit-password').change(function () {
                    if ($(this).val()) {
                        $('#edit-confirm-password-textbox').attr('required', 'required');
                        $('#edit-current-password-textbox').attr('required', 'required');
                        $('#edit-confirm-password-textbox').rules('add', {
                            required: true,
                            messages: {
                                required: 'Please re-enter your ' + vems.account.NewPasswordText.toLowerCase() + '.'
                            }
                        });
                        $('#edit-current-password-textbox').rules('add', {
                            required: true,
                            messages: {
                                required: 'Please type your ' + vems.account.CurrentPasswordText.toLowerCase() + '.'
                            }
                        });
                    } else {
                        $('#edit-confirm-password-textbox').removeAttr('required');
                        $('#edit-current-password-textbox').removeAttr('required');
                        $('#edit-confirm-password-textbox').rules('remove', 'required');
                        $('#edit-current-password-textbox').rules('remove', 'required');
                    }
                });
                $('#edit-confirm-password-textbox').rules('add', {
                    equalTo: '#edit-password',
                    messages: {
                        equalTo: vems.account.PasswordsDoNotMatchText
                    }
                });
            }
        }
    }
};

vems.account.getDataStringWithCSRF = function (dataName, data) {
    data.deaCSRFToken = $("#deaCSRFToken").val();
    return '{' + dataName + ': ' + JSON.stringify(data) + '}';
};

vems.account.showConfirmation = function () {
    $('#account-confirm-modal').modal('show');
};

vems.account.confirmAccount = function () {
    vems.account.viewModels.accountViewModel.userInfoViewModel.Confirmed('True');
    $('#account-confirm-modal').modal('hide');

    vems.account.saveUserInfo();
};

vems.account.saveUserInfo = function () {
    var saveData = ko.toJS(vems.account.viewModels.accountViewModel.userInfoViewModel);
    saveData.UserDefinedFields = vems.account.viewModels.accountViewModel.userInfoViewModel.UserDefinedFields.getUdfsForSave();

    var jsonstring = vems.account.getDataStringWithCSRF('userInfo', saveData);
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/SaveUserInfo',
        data: jsonstring,
        success: function (jsonMsg) {
            var response = JSON.parse(jsonMsg.d);
            if (response.Success) {
                var userinfo = JSON.parse(response.JsonData);
                if (userinfo !== undefined && userinfo !== null) {
                    vems.account.viewModels.accountViewModel.userInfoViewModel = new vems.account.userInfoVM(userinfo);
                }

                if (userinfo.SecurityState) {  // new account created or requested
                    window.location = userinfo.RedirectUrl;
                } else {
                    //ErrorMessage contains other account creation messages
                    var result = vems.showToasterMessage('', response.ErrorMessage, 'success', 3000, function (e) {
                        if (userinfo.RedirectUrl !== null && userinfo.RedirectUrl.length > 0) {
                            window.location.href = userinfo.RedirectUrl;
                        }
                    });
                    $('#edit-password').val('').change();  // clear password fields and remove validation
                    $('#edit-confirm-password-textbox').val('');
                    $('#edit-current-password-textbox').val('');
                }
            } else {
                var errorCode = response.JsonData ? JSON.parse(response.JsonData).ResultCode : -1;
                if (errorCode === -12348) {  // invalid current password entered
                    $('#edit-current-password-textbox').val('');
                    $('#edit-current-password-textbox').rules('add', {
                        required: true,
                        messages: {
                            required: response.ErrorMessage
                        }
                    });
                    $('#edit-current-password-textbox').valid();  // auto-trigger validation
                } else {
                    var result = vems.showErrorToasterMessage(response.ErrorMessage);
                }
            }
        }
    });
};

vems.account.checkEmailUsage = function (email) {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/IsEmailUsed',
        data: JSON.stringify({ email: email }),
        success: function (result) {
            var response = JSON.parse(result.d);
            var editIdPrefix = vems.account.viewModels.accountViewModel.IsCreate() ? '' : 'edit-';
            if (response.JsonData === 'true') {
                $('#' + editIdPrefix + 'email-address-error').parent().addClass('has-error');
                var emailInUseHtml = vems.account.EmailInUseText;
                if (vems.account.viewModels.accountViewModel.IsCreate()) {
                    emailInUseHtml += '&nbsp;<a href="' + vems.account.ResetPasswordUrl + '">' + vems.account.LikeToResetText + '</a>';
                }
                $('#' + editIdPrefix + 'email-address-error').html(emailInUseHtml);
                $('#' + editIdPrefix + 'email-address-error').show();
            } else {
                $('#' + editIdPrefix + 'email-address-error').parent().removeClass('has-error');
                $('#' + editIdPrefix + 'email-address-error').hide();
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
};
/* End User Info Section */

/* Personalization Section */
vems.account.getSavedFilters = function () {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetSavedFilters',
        data: JSON.stringify({ parentId: -1 }),
        success: function (results) {
            var data = JSON.parse(results.d);
            vems.account.viewModels.accountViewModel.personalizationViewModel.savedFilters(data);
            vems.account.sortSavedFilters(vems.account.savedFilterSortProp ? '' : 'Name');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};

vems.account.sortSavedFilters = function (propertyName) {
    if (propertyName) {  // adjust sort direction and column if necessary
        vems.account.savedFilterSortDir = vems.account.savedFilterSortProp === propertyName ? -(vems.account.savedFilterSortDir) : -1;
        vems.account.savedFilterSortProp = propertyName;
    }
    vems.account.viewModels.accountViewModel.personalizationViewModel.savedFilters.sort(function (filterOne, filterTwo) {
        if (filterOne[vems.account.savedFilterSortProp].toLowerCase() < filterTwo[vems.account.savedFilterSortProp].toLowerCase()) {
            return 1 * vems.account.savedFilterSortDir;
        } else if (filterOne[vems.account.savedFilterSortProp].toLowerCase() > filterTwo[vems.account.savedFilterSortProp].toLowerCase()) {
            return -1 * vems.account.savedFilterSortDir;
        } else {
            return 0;
        }
    });
    $('#filter-grid-header').find('#filter-grid-sort-indicator').remove();
    $('#filter-grid-header-filter' + vems.account.savedFilterSortProp.toLowerCase()).append(
        '<i id="filter-grid-sort-indicator" class="fa fa-angle-'
        + (vems.account.savedFilterSortDir === -1 ? 'up' : 'down')
        + '"></i>');
};

vems.account.sortTemplateDefaults = function (propertyName) {
    if (propertyName) {  // adjust sort direction and column if necessary
        vems.account.templateSortDir = vems.account.templateSortProp === propertyName ? -(vems.account.templateSortDir) : -1;
        vems.account.templateSortProp = propertyName;
    }
    vems.account.viewModels.accountViewModel.personalizationViewModel.templateDefaults.sort(function (tempOne, tempTwo) {
        if ((tempOne[vems.account.templateSortProp])().toLowerCase() < (tempTwo[vems.account.templateSortProp])().toLowerCase()) {
            return 1 * vems.account.templateSortDir;
        } else if ((tempOne[vems.account.templateSortProp])().toLowerCase() > (tempTwo[vems.account.templateSortProp])().toLowerCase()) {
            return -1 * vems.account.templateSortDir;
        } else {
            return 0;
        }
    });
    $('#template-grid-header').find('#template-grid-sort-indicator').remove();
    $('#template-grid-header-template' + vems.account.templateSortProp.toLowerCase()).append(
        '<i id="template-grid-sort-indicator" class="fa fa-angle-'
        + (vems.account.templateSortDir === -1 ? 'up' : 'down')
        + '"></i>');
};

vems.account.editFilter = function (filter) {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetFilterOptions',
        data: JSON.stringify({ parentId: filter.ParentId, templateId: -1 }),
        success: function (results) {
            var data = JSON.parse(results.d);
            var reqFilters = [];
            var optFilters = [];
            for (var i = 0; i < data.length; i++) {
                var currFilter = data[i];

                if (currFilter.filterName === 'StartDate' || currFilter.filterName === 'EndDate' || currFilter.filterName === 'TimeZone')
                    continue;

                if (currFilter.required) {
                    reqFilters.push(currFilter);
                } else {
                    optFilters.push(currFilter);
                }
            }

            if (vems.account.viewModels.accountViewModel.personalizationViewModel.editedFilter()) {
                vems.account.viewModels.accountViewModel.personalizationViewModel.editedFilter().data('dynamicFilters').destroy();
            }
            vems.account.viewModels.accountViewModel.personalizationViewModel.editedFilter($('#edit-filter-content').dynamicFilters({
                filterParent: filter.ParentId,
                displaymode: 'personalization',
                saveLabel: vems.account.SaveText,
                addRemoveLabel: vems.account.AddRemoveText,
                addFilterLabel: vems.account.AddFilterText,
                closeLabel: vems.account.CloseText,
                updateLabel: vems.account.UpdateText,
                cancelLabel: vems.account.CancelText,
                nameLabel: vems.account.NameText,
                findByXLabel: vems.account.FindXText,
                selectedXLabel: vems.account.SelectedXText,
                buildingsLabel: vems.account.buildingsLabel,
                viewsLabel: vems.account.viewsLabel,
                showAllAreasLabel: vems.account.showAllAreasLabel,
                filterByAreaLabel: vems.account.filterByAreaLabel,
                selectAllXLabel: vems.account.selectAllXLabel,
                searchForAnAreaLabel: vems.account.searchForAnAreaLabel,
                ungroupedBuildingsLabel: vems.account.ungroupedBuildingsLabel,
                requiredFilters: reqFilters,
                optionalFilters: optFilters
            }));
            vems.account.viewModels.accountViewModel.personalizationViewModel.editedFilter().data('dynamicFilters').loadFilterSetById(filter.Id);
            vems.account.viewModels.accountViewModel.personalizationViewModel.editedFilterName(filter.Name);
            vems.account.viewModels.accountViewModel.personalizationViewModel.editedFilterId(filter.Id);
            vems.account.viewModels.accountViewModel.personalizationViewModel.editedFilterParent(filter.ParentId);
            $('#edit-filter-section').show();
            vems.account.showPersOptions();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};

vems.account.deleteFilter = function (filter) {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/DeleteFilterSet',
        data: JSON.stringify({ id: filter.Id }),
        success: function (results) {
            var data = JSON.parse(results.d);
            vems.account.getSavedFilters();
            vems.account.hidePersOptions();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};

vems.account.copyFilter = function (filter) {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/SaveDynamicFilter',
        data: JSON.stringify({ filterName: filter.Name + ' (copy)', filterParent: filter.ParentId, filterValues: filter.Filters, saveTime: moment().format('YYYY-MM-D HH:mm:ss') }),
        success: function (results) {
            var data = JSON.parse(results.d);
            vems.account.getSavedFilters();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};

vems.account.saveFilter = function () {
    $(arguments[1].currentTarget).focus();
    var filters = vems.account.viewModels.accountViewModel.personalizationViewModel.editedFilter().data('dynamicFilters').getFilterValueCollection();
    var name = vems.account.viewModels.accountViewModel.personalizationViewModel.editedFilterName();
    var id = vems.account.viewModels.accountViewModel.personalizationViewModel.editedFilterId();
    var parent = vems.account.viewModels.accountViewModel.personalizationViewModel.editedFilterParent();

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/UpdateFilter',
        data: JSON.stringify({ filterName: name, filterId: id, filterParent: parent, filterValues: filters }),
        success: function (results) {
            var data = JSON.parse(results.d);
            if (data.Success) {
                vems.showToasterMessage('', data.Message, 'success');
                vems.account.getSavedFilters();
                vems.account.hidePersOptions();
            } else {
                vems.showToasterMessage('', data.Message, 'warning');
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};

vems.account.editTemplate = function (template) {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetUserTemplateDefaults',
        data: JSON.stringify({
            templateId: template.Id(),
            allowFloorMap: vems.account.viewModels.accountViewModel.personalizationViewModel.AllowFloorMap()
        }),
        success: function (results) {
            var data = JSON.parse(results.d);

            // set current template being edited and display values for multi-select fields
            vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate(data);
            vems.account.viewModels.accountViewModel.personalizationViewModel.locationsDisplay(
                vems.decodeHtml(vems.account.getMultiSelectString(data.TemplateDefaults.Location, data.LocationOptions)));
            vems.account.viewModels.accountViewModel.personalizationViewModel.floorsDisplay(
                vems.decodeHtml(vems.account.getMultiSelectString(data.TemplateDefaults.Floor, data.FloorOptions)));
            vems.account.viewModels.accountViewModel.personalizationViewModel.roomTypesDisplay(
                vems.decodeHtml(vems.account.getMultiSelectString(data.TemplateDefaults.RoomType, data.RoomTypeOptions)));

            // create start/end date moment objects and initialize/set time pickers
            var defStartDate = null;
            var defEndDate = null;
            if (vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.StartTime) {
                defStartDate = moment(vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.StartTime);
                if (!defStartDate.isValid()) {
                    defStartDate = moment(vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.StartTime, 'HH:mm');
                }
            }
            if (vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.EndTime) {
                defEndDate = moment(vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.EndTime);
                if (!defEndDate.isValid()) {
                    defEndDate = moment(vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.EndTime, 'HH:mm');
                }
            }
            if ($('#edit-template-start-time').data('DateTimePicker')) {
                $('#edit-template-start-time').data('DateTimePicker').date(defStartDate);
            } else {
                $('#edit-template-start-time').datetimepicker({
                    format: 'LT',
                    locale: moment.locale(),
                    defaultDate: defStartDate
                }).on('dp.change', function (e) {
                    if (e.date) {
                        var startTime = e.date.format('hh:mm A', 'en');
                        vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.StartTime = startTime;

                        endDatePicker = $('#edit-template-end-time').data('DateTimePicker');
                        if (endDatePicker && e.date > endDatePicker.date()) {
                            endDatePicker.date(moment(e.date).add(1, 'hours'));
                        }
                    }
                });
            }
            if ($('#edit-template-end-time').data('DateTimePicker')) {
                $('#edit-template-end-time').data('DateTimePicker').date(defEndDate);
            } else {
                $('#edit-template-end-time').datetimepicker({
                    format: 'LT',
                    locale: moment.locale(),
                    defaultDate: defEndDate
                }).on('dp.change', function (e) {
                    if (e.date) {
                        var endTime = e.date.format('hh:mm A', 'en');
                        vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.EndTime = endTime;

                        startDatePicker = $('#edit-template-start-time').data('DateTimePicker');
                        if (startDatePicker && e.date < startDatePicker.date()) {
                            startDatePicker.date(e.date);
                        }
                    }
                });
            }

            // display template edit section
            $('#edit-template-default-section').show();
            vems.account.showPersOptions();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};

vems.account.saveTemplate = function (template) {
    var templateData = jQuery.extend(true, {}, vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate());

    var startTime = $('#edit-template-start-time').data('DateTimePicker').date();
    var endTime = $('#edit-template-end-time').data('DateTimePicker').date();
    templateData.TemplateDefaults.StartTime = startTime ? moment(startTime).format('HH:mm') : null;
    templateData.TemplateDefaults.EndTime = endTime ? moment(endTime).format('HH:mm') : null;

    templateData.TemplateDefaults.ResultsAs = $('[name=ResultsAsGroup]:checked').val();

    templateData.TemplateDefaults.OverrideLocationAndTimeZoneOnSearch = $('#edit-template-location-personalization-save').prop('checked') ? 1 : 0;

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/SaveUserTemplateDefaults',
        data: JSON.stringify({ defaultSet: templateData }),
        success: function (results) {
            var data = JSON.parse(results.d);
            if (data.Success) {
                vems.showToasterMessage('', data.SuccessMessage, 'success');
                vems.account.hidePersOptions();
            } else {
                vems.showToasterMessage('', data.ErrorMessage, 'warning');
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};

// creates a comma-delimited string of label values based on a string of ids
vems.account.getMultiSelectString = function (commaDelStr, kvpObjArr) {
    var strArr = [];
    if (commaDelStr) {
        strArr = commaDelStr.split(',');
    }
    var objArr = $.grep(kvpObjArr, function (kvp) {
        return $.inArray(kvp.Key, strArr) !== -1;
    });
    return objArr.length === 0 ? vems.account.DropDownAllText : objArr.map(function (kvp) { return vems.decodeHtml(kvp.Value); }).join(', ');
};

vems.account.openMultiSelect = function (msType, favoritesFilter) {
    var cbArr = [];
    var selItemArr = [];
    var updateFunction = new function () { return false; };
    var updateBtnText = vems.account.UpdateText + ' ';

    // set multi-select text, values, and update events - based on multi-select 'type'
    switch (msType) {
        case 'locations':
            if (favoritesFilter) {
                cbArr = ko.mapping.toJS(vems.account.viewModels.accountViewModel.favoritesViewModel.Locations);
                selItemArr = vems.account.viewModels.accountViewModel.favoritesViewModel.selectedLocationIds();
            } else {
                $.each(vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().LocationOptions, function (i, v) {
                    if ($.inArray(v.Key, selItemArr) == -1) {
                        cbArr.push(v.Value);
                    }
                });

                selItemArr = vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.Location.split(',');

                $('#template-location-filter').data('dynamicFilters').setTemplateId(vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateId);
            }

            $('#template-location-filter').data('dynamicFilters').setFilterValue('Locations', selItemArr, cbArr.join(','), 8, true);

            $('#template-location-filter').data('dynamicFilters').addFilterItem($('#template-location-filter .dynamic-filter-item-add')[0]);
            //$('#template-location-filter .dynamic-filter-item-add').click();
            return false;
            break;
        case 'floors':
            $('#multi-select-modal .modal-title').text(vems.account.FloorsText);
            updateBtnText += vems.account.FloorsText;
            $('#multi-select-modal input').attr('placeholder', vems.account.FindXText.replace('{0}', vems.account.FloorsText.toLowerCase()));
            $('#multi-select-modal .selected-group-label').text(vems.account.SelectedXText.replace('{0}', vems.account.FloorsText));

            cbArr = vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().FloorOptions;
            if (vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.Floor) {
                selItemArr = vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.Floor.split(',');
            }

            updateFunction = function () {
                var selIds = [];
                var selLabels = [];
                $.each($('#multi-select-modal .checkbox input'), function (idx, cb) {
                    if (cb.checked) {
                        selIds.push(cb.value);
                        selLabels.push($(this).next('span').text());
                    }
                });
                vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.Floor = selIds.length > 0 ? selIds.join() : '';
                vems.account.viewModels.accountViewModel.personalizationViewModel.floorsDisplay(selLabels.length > 0 ? selLabels.join(', ') : vems.account.DropDownAllText);
                $('#multi-select-modal').modal('hide');
            };
            break;
        case 'roomtypes':
            $('#multi-select-modal .modal-title').text(vems.account.RoomTypesText);
            updateBtnText += vems.account.RoomTypesText;
            $('#multi-select-modal input').attr('placeholder', vems.account.FindXText.replace('{0}', vems.account.RoomTypesText.toLowerCase()));
            $('#multi-select-modal .selected-group-label').text(vems.account.SelectedXText.replace('{0}', vems.account.RoomTypesText));

            cbArr = vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().RoomTypeOptions;
            if (vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.RoomType) {
                selItemArr = vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.RoomType.split(',');
            }

            updateFunction = function () {
                var selIds = [];
                var selLabels = [];
                $.each($('#multi-select-modal .checkbox input'), function (idx, cb) {
                    if (cb.checked) {
                        selIds.push(cb.value);
                        selLabels.push($(this).next('span').text());
                    }
                });
                vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.RoomType = selIds.length > 0 ? selIds.join() : '';
                vems.account.viewModels.accountViewModel.personalizationViewModel.roomTypesDisplay(selLabels.length > 0 ? selLabels.join(', ') : vems.account.DropDownAllText);
                $('#multi-select-modal').modal('hide');
            };
            break;
        default:
            return false;
    }

    // create and add content/items to multi-select
    var cbHtml = '';
    var selItemHtml = '';
    $.each(cbArr, function (idx, kvp) {
        var selected = $.inArray(kvp.Key, selItemArr) !== -1;
        cbHtml += vems.account.createMultiSelectCbHtml(kvp.Key, kvp.Value, selected);

        if (selected) {
            selItemHtml += vems.account.createMultiSelectItemHtml(kvp.Key, kvp.Value);
        }
    });
    $('#multi-select-modal .checkbox-group').html(cbHtml);
    $('#multi-select-modal .selected-group').html(selItemHtml);
    $('#multi-select-update-btn').text(updateBtnText);

    // bind events for multi-select search, checkboxes, and selected items
    $('#multi-select-search-input').on('keyup', function () {
        var searchStr = $(this).val().toLowerCase();
        $.each($('#multi-select-modal .checkbox'), function (idx, el) {
            var val = $(el).find('span').text().toLowerCase();
            if (val.indexOf(searchStr) === -1) {
                $(el).hide();
            } else {
                $(el).show();
            }
        });
    });
    $('#multi-select-modal .filter-checkbox').change(function () {
        var id = $(this).val();
        var label = $.grep(cbArr, function (el) {  // look up in source array to avoid html encoding issues
            return el.Key === id;
        })[0].Value;
        if (this.checked) {
            var itemHtml = vems.account.createMultiSelectItemHtml(id, label);
            $('#multi-select-modal .selected-group').append(itemHtml);
            var selectedDiv = $('#multi-select-modal .selected-group')[0];
            selectedDiv.scrollTop = selectedDiv.scrollHeight;
        } else {
            $('#multi-select-modal .selected-group div[data-item-val=' + id + ']').remove();
        }
    });
    $('#multi-select-update-btn').unbind('click').bind('click', updateFunction);

    if (favoritesFilter) {  // clear current search text for favorite rooms when applicable
        $('#favorite-search').val('');
    }

    // display the modal
    $('#multi-select-modal').modal('show');
    $('#multi-select-modal').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        $('#multi-select-search-input').val('');  // clear modal filter text when closed
    });
};

// utility functions used for multi-select creation/events
vems.account.removeMultiSelectItem = function (id) {
    $('#multi-select-modal .selected-group div[data-item-val=' + id + ']').remove();
    $('#multi-select-modal .checkbox input[value=' + id + ']').removeAttr('checked');
};
vems.account.createMultiSelectItemHtml = function (id, label) {
    var itemHtml = '<div class="selected-group-item" onclick="vems.account.removeMultiSelectItem(';
    itemHtml += id;
    itemHtml += ');" data-item-val="';
    itemHtml += id;
    itemHtml += '"><span><i class="fa fa-minus-circle"></i><span>';
    itemHtml += vems.decodeHtml(label);
    itemHtml += '</span></span></div>';
    return itemHtml;
};
vems.account.createMultiSelectCbHtml = function (id, label, checked) {
    var cbHtml = '<div class="checkbox"><label><input type="checkbox" class="filter-checkbox" value="';
    cbHtml += id;
    cbHtml += '" ';
    cbHtml += checked ? 'checked' : '';
    cbHtml += '/><span>';
    cbHtml += vems.decodeHtml(label);
    cbHtml += '</span></label></div>';
    return cbHtml;
};

vems.account.hidePersOptions = function () {
    $('#personalization-options').hide();
    $('#edit-filter-section').hide();
    $('#edit-template-default-section').hide();
};
vems.account.showPersOptions = function () {
    $('#personalization-options').show();
    $('body').scrollTo($('#personalization-options'), { duration: 'slow' });
};
/* End Personalization Section */

/* Favorite Rooms Section */
vems.account.sortFavorites = function (propertyName) {
    if (propertyName) {  // adjust sort direction and column if necessary
        vems.account.favoriteSortDir = vems.account.favoriteSortProp === propertyName ? -(vems.account.favoriteSortDir) : -1;
        vems.account.favoriteSortProp = propertyName;
    }
    vems.account.viewModels.accountViewModel.favoritesViewModel.favoriteRooms.sort(function (delOne, delTwo) {
        if (delOne[vems.account.favoriteSortProp].toLowerCase() < delTwo[vems.account.favoriteSortProp].toLowerCase()) {
            return 1 * vems.account.favoriteSortDir;
        } else if (delOne[vems.account.favoriteSortProp].toLowerCase() > delTwo[vems.account.favoriteSortProp].toLowerCase()) {
            return -1 * vems.account.favoriteSortDir;
        } else {
            return 0;
        }
    });
    $('#favorite-grid-header').find('#favorite-grid-sort-indicator').remove();
    $('#favorite-grid-header-' + vems.account.favoriteSortProp.toLowerCase()).append(
        '<i id="favorite-grid-sort-indicator" class="fa fa-angle-'
        + (vems.account.favoriteSortDir === -1 ? 'up' : 'down')
        + '"></i>');
};

vems.account.getUserFavorites = function () {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetUserFavoriteRooms',
        success: function (result) {
            var response = JSON.parse(result.d);
            if (response.Success) {
                vems.account.viewModels.accountViewModel.favoritesViewModel.favoriteRooms(JSON.parse(response.JsonData));
                vems.account.sortFavorites(vems.account.favoriteSortProp ? '' : 'RoomDescription');
            } else {
                vems.showToasterMessage('', response.ErrorMessage, 'danger');
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
};

vems.account.addFavoriteRoom = function (roomId) {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/AddUserFavoriteRoom',
        data: JSON.stringify({ roomId: roomId }),
        success: function (result) {
            var response = JSON.parse(result.d);
            if (response.Success) {
                vems.account.getUserFavorites();
                $('#favorite-search').typeahead('val', '');
            } else {
                vems.showToasterMessage('', response.ErrorMessage, 'danger');
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
};

vems.account.removeFavoriteRoom = function (roomId) {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/RemoveUserFavoriteRoom',
        data: JSON.stringify({ roomId: roomId }),
        success: function (result) {
            var response = JSON.parse(result.d);
            if (response.Success) {
                vems.account.getUserFavorites();
            } else {
                vems.showToasterMessage('', response.ErrorMessage, 'danger');
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });
};

vems.account.SearchForRoomsJson = function (typeAhead) {
    var jsonObj = {
        searchString: typeAhead.qry,
        locationIds: vems.account.viewModels.accountViewModel.favoritesViewModel.selectedLocationIds()
    };
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/SearchForRoomsJson',
        data: JSON.stringify(jsonObj),
        success: function (result) {
            var response = JSON.parse(result.d);
            //vems.account.favoriteSourceArr = response.Success ? JSON.parse(response.JsonData) : [];

            var temp = ko.observableArray([]);
            if (response.Success) {
                temp = JSON.parse(response.JsonData);
                $.each(temp, function (i, v) {
                    v.BuildingDescription = vems.decodeHtml(v.BuildingDescription);
                    v.RoomDescription = vems.decodeHtml(v.RoomDescription);
                });
            }
            else {
                console.log(response.ErrorMessage);
            }
            typeAhead.asyncCall(temp);
            return false;

        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });

};

vems.account.favoriteSearchInit = function () {
    // re-initialize typeahead control
    $('#favorite-search').typeahead('destroy');
    vems.bindLoadingGifsToTypeAhead($('#favorite-search').typeahead({
        minLength: 3,
        highlight: true
    }, {
        //source: vems.account.favoriteSearchSource.ttAdapter(),
        source: function (query, sync, async) {
            vems.account.SearchForRoomsJson({
                qry: query, asyncCall: async
            });
        },
        limit: 'Infinity', //see https://github.com/twitter/typeahead.js/issues/1232
        displayKey: 'RoomDescription',
        templates: {
            suggestion: function (room) {
                return '<div>' + vems.encodeHtml(room.RoomDescription) + ' <span class="delegate-typeahead-email">- ' + vems.encodeHtml(room.BuildingDescription) +
                    ' - ' + vems.encodeHtml(room.TimeZone) + '</span></div>'
            },
            notFound: '<div class="delegate-typeahead-notfound">' + vems.account.FavoriteRoomSearchNoMatchText + '</div>'
        }
    }).unbind('typeahead:select').bind('typeahead:select', function (event, room) {
        vems.account.addFavoriteRoom(room.RoomId);
        $('#favorite-search').blur();
    }));
    $('#favorite-search').unbind('keyup').bind('keyup', function (event) {
        var newSearchStr = $('#favorite-search').val();
        if (event.which === 38 || event.which === 40) { return; }  // prevent search while scrolling through options with arrow keys
    });
};
/* End Favorite Rooms Section */

/* View Model Definitions */
vems.account.accountVM = function (data) {
    var self = this;
    self.userInfoViewModel = null;
    self.delegatesViewModel = null;
    self.personalizationViewModel = null;
    self.favoritesViewModel = null;

    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);
        self.userInfoViewModel = new vems.account.userInfoVM(data.userInfoViewModel);
        self.delegatesViewModel = new vems.account.delegatesVM(data.delegatesViewModel);
        self.personalizationViewModel = new vems.account.personalizationVM(data.personalizationViewModel);
        self.favoritesViewModel = new vems.account.favoritesVM(data.favoriteRoomsViewModel);
    }
};
vems.account.userInfoVM = function (data) {
    var self = this;

    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);
        self.UserDefinedFields = new vems.userDefinedFieldViewModel(self.UserDefinedFields);
        self.originalEmail = self.EmailAddress();
    }
};
vems.account.delegatesVM = function (data) {
    var self = this;
    self.delegates = ko.observableArray([]);

    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);
    }
};
vems.account.personalizationVM = function (data) {
    var self = this;
    self.savedFilters = ko.observableArray([]);
    self.editedFilter = ko.observable();
    self.editedFilterName = ko.observable();
    self.editedFilterId = ko.observable();
    self.editedFilterParent = ko.observable();

    self.templateDefaults = ko.observableArray([]);
    self.editedTemplate = ko.observable();
    self.locationsDisplay = ko.observable();
    self.floorsDisplay = ko.observable();
    self.roomTypesDisplay = ko.observable();

    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);
        self.templateDefaults(data.Templates())
    }
};
vems.account.favoritesVM = function (data) {
    var self = this;
    self.favoriteRooms = ko.observableArray([]);
    self.selectedLocationIds = ko.observableArray([]);

    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);
    }
};
/* End View Model Definitions */