var vems = vems || {};
vems.screenText = {};
vems.helpText = {
    parentId: 0
};

vems.serverApiUrl = function () {
    return 'ServerApi.aspx';
};

vems.decodeHtml = function (value) {
    return $('<textarea>').html(value).text();
};

vems.encodeHtml = function (value) {
    return $('<div/>').text(value).html();
};

vems.isLocale24HrFormat = function () {
    if (vems.is24HrFormat)
        return vems.is24HrFormat;
    return false;
};

vems.sessionTimer = function (options) {
    var timer;
    var self = this;

    /*option defaults*/
    var minutes = (options.minutes || 20) - 1; // remove one minute from the total timeout to give us a chance to warn the user
    var minuteCounter = minutes;

    /*event handlers*/
    var onUpdate = options.onUpdate || function () { };
    var onTimerEnd = options.onTimerEnd || function () { };
    var onTimerStart = options.onTimerStart || function () { };

    /*events*/
    function startTimer() {
        onTimerStart();
        clearInterval(timer);

        timer = 0;

        decrementTimer();
        timer = setInterval(decrementTimer, 60000);
    }

    function decrementTimer() {
        onUpdate();

        if (minuteCounter === 0) {
            stopTimer();
            onTimerEnd();

            return;
        }

        minuteCounter--;
    }

    function stopTimer() {
        clearInterval(timer);
    }

    return {
        start: function () {
            startTimer();
        },
        stop: function () {
            stopTimer();
        },
        reset: function () {
            minuteCounter = minutes;
            startTimer();
        }
    };
};


//returns the bootstrap modal object
vems.showAlertMessage = function (message, title) {
    var modal = $("#confirmation-modal").modal();
    $("#confirmation-modal .modal-body").html(message);
    $("#confirmation-modal .modal-title").html(title);
    modal.show();
    return modal;
};

//returns the bootstrap modal object
vems.showModalMessageWithButtons = function (message, title, btnActionText, btnCloseText, onYesBtnCallback, onCancelBtnCallback, onCloseCallback) {
    var modal = $("#confirmation-modal").modal();
    var modalBody = $("#confirmation-modal .modal-body");
    modalBody.html(''); //clear out any existing messages
    modalBody.html(message);
    $("#confirmation-modal .modal-title").html(title);
    var btns = $('<div class="text-right" style="padding: 10px"><button type="button" class="btn btn-primary" id="action-button-1"></button> ' +
                '<button type="button" class="btn btn-default" id="close-button-1" data-dismiss="modal">Close</button></div>');
    btns.appendTo(modalBody);
    if (btnActionText == 'undefined' || btnActionText.length == 0) { btnActionText = "Yes"; }
    if (btnCloseText == 'undefined' || btnCloseText.length == 0) { btnCloseText = "Close"; }
    var actionBtn = $(modal).find("#action-button-1");
    actionBtn.html(btnActionText);
    var closeBtn = $(modal).find("#close-button-1");
    closeBtn.html(btnCloseText);
    $(closeBtn).on("click", function (e) {
        onCancelBtnCallback(e);
        $(modal).off("hidden.bs.modal");
        modal.modal('hide');
    });
    $(modal).off("hidden.bs.modal");  //clear out previous handlers attached to event
    $(actionBtn).off("click");
    $(modal).on("hidden.bs.modal", function (e) {
        onCloseCallback(e);
    });
    $(actionBtn).off("click");
    $(actionBtn).on("click", function (e) {
        onYesBtnCallback(e);
        $(modal).off("hidden.bs.modal");
        modal.modal('hide');
    });
    modal.show();
    return modal;
};

//returns the jquery promise callback hooks of: then, done, fail, always, pipe, progress, state and promise
vems.showConfirmationMessage = function (message, title) {
    return DevExpress.ui.dialog.confirm(message, title);
};

vems.toggleSideBar = function () {
    var navBar = $('#sidebar-wrapper');
    // this can come back with .03 or so when zoom is active on the browser.
    if (navBar.width() < 1) {
        navBar.width('250px');
        $('body').addClass('no-scroll');  // prevent scrolling of background when responsive main menu is open
        var sidebar = document.getElementById('sidebar-wrapper');
        var pageContent = document.getElementById('page-content-wrapper');
        document.body.addEventListener('touchmove', function (e) {
            if (e.path.indexOf(sidebar) !== -1 && e.path.indexOf(pageContent) !== -1) {
                e.preventDefault();
            }
        });
    } else {
        navBar.width('0');
        //$('.navbar-toggle').removeClass('collapse').addClass("navbar-toggle-override").show();
        if (!DevExpress.devices.real().phone) {  // prevents re-positioning of hamburger on mobile
            $('.navbar-toggle').addClass("navbar-toggle-override");
        }
        $('.navbar-toggle').show();
        $('body').removeClass('no-scroll');
    }
};

/*
title is optional,
msg needed,
messageTypes: 'success'|'danger'|'info'|'warning',
timeToShow optional,
onCloseCallback is optional,
target is optional */
vems.showToasterMessage = function (title, msg, messageType, timeToShow, onCloseCallback, target, clearOtherMessages) {
    if (clearOtherMessages == undefined)  //make it backwards compatible
        clearOtherMessages = true;
    if (clearOtherMessages)
        $('.toaster').empty();  // remove any previously-uncleared toast messages

    if (!title) { title = ''; }
    if (!timeToShow) { timeToShow = 5000; }
    if (!target) { target = 'body'; }
    $.toaster({ priority: messageType, title: title, message: msg, settings: { 'timeout': timeToShow, 'toaster': { 'container': target } } });
    var t = $('#toaster');

    if ($.isFunction(onCloseCallback)) {
        t.on('close.bs.alert', function (e) {
            onCloseCallback(e);
        });
    }

    return t;
};

vems.showErrorToasterMessage = function (msg, timeToShow, title) {
    if (typeof timeToShow === 'undefined' || timeToShow === null) { timeToShow = 5000; }
    if (typeof title === 'undefined' || title === null) { title = ''; }
    $.toaster({ priority: 'danger', title: title, message: msg, settings: { 'timeout': timeToShow } });
    return $('#toaster');
};

vems.getAjaxPostDefaults = function () {
    var csrf = $('#deaCSRFToken').val();
    var defaults = {
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        headers: { 'dea-CSRFToken': csrf }
    };
    return defaults;
};

vems.ajaxPost = function (options, bSuppressErrorToast) {
    $.extend(options, vems.getAjaxPostDefaults());  //merge passed options to defaults
    return $.ajax(options)
        .error(function (xhr, ajaxOptions, thrownError) {
            var errTxt = thrownError;
            if (!bSuppressErrorToast && xhr.responseText) {
                if (xhr.responseText.substr(0, 1) != '<') { //check for html instead of json
                    var retObj = JSON.parse(xhr.responseText);
                    if (retObj.d) { retObj = JSON.parse(retObj.d); }
                    if (!retObj.Success && retObj.ErrorMessage) {
                        errTxt = retObj.ErrorMessage;
                    }
                }
                vems.showToasterMessage('', errTxt, 'danger');
            }
            if (options.url) { errTxt = 'Error calling ' + options.url + ': ' + errTxt }
            console.log('vems.ajaxPost error: ' + errTxt);
        });
};

vems.menuVM = function () {
    var self = this;
    var menuItems = window.menuJSON;

    self.mainMenuItems = ko.observableArray(filterToMainMenuItems());

    var userItems = filterToUserMenuItems();
    self.userMenuItems = ko.observableArray(userItems.user);
    self.adminMenuItems = ko.observableArray(userItems.admin);
    self.signOutMenuItems = ko.observableArray(userItems.signOut);

    var helpItems = filterToHelpMenuItems();
    self.helpMenuItems = ko.observableArray(helpItems.main);
    self.customHelpMenuItems = ko.observableArray(helpItems.custom);

    self.OnMenuItemPage = function (itemUrl) {
        if (itemUrl.length === 0) {
            return false;
        }

        var url = window.location.toString().toLowerCase();
        if (url.indexOf('.aspx') === -1 && itemUrl.toLowerCase().indexOf('default') > -1) {
            return true;
        }

        return url.indexOf(itemUrl.split('.aspx')[0].toLowerCase()) !== -1;
    };

    self.menuItemClicked = function (data, event) {
        if (data.NavigateUrl.length === 0)
            return false;

        if (data.Target != null) {
            window.open(data.NavigateUrl, data.Target);

        } else {
            window.location = data.NavigateUrl;
        }
    };

    function filterToMainMenuItems() {
        return $.grep(menuItems, function (n, i) {
            return n.IsMainMenuItem;
        });
    }

    function filterToUserMenuItems() {
        var userItems = [];
        var adminItems = [];
        var signOutItems = [];

        $.each(menuItems, function () {
            switch (this.Id) {
                case 3:
                    $.each(this.ChildMenus, function () {
                        userItems.push(this);
                    });
                    break;
                case 14:
                    $.each(this.ChildMenus, function () {
                        adminItems.push(this);
                    });
                    break;
            }
        });

        // Set the signout option into its own collection and remove it from user items
        $.each(userItems, function (i, v) {
            if (v.Id === -11) {
                signOutItems.push(v);
                userItems = $.grep(userItems, function (v) {
                    return v.Id !== -11;
                });

                return false;
            }
        });

        return {
            user: userItems,
            admin: adminItems,
            signOut: signOutItems
        };
    }

    function filterToHelpMenuItems() {
        var mainHelpItems = [];
        var customHelpItems = [];

        $.each(menuItems, function () {
            if (this.Id === 33) {
                $.each(this.ChildMenus, function () {
                    if (this.Id > 0) {
                        customHelpItems.push(this);
                    } else {
                        mainHelpItems.push(this);
                    }
                });

                return false;
            }
        });

        return {
            main: mainHelpItems,
            custom: customHelpItems
        };
    }
};

vems.toggleCheckIn = function (groupId, buildingId, bookingId) {
    return vems.ajaxPost({
        url: vems.serverApiUrl() + '/toggleCheckinJson',
        data: '{groupId : ' + groupId + ', buildingId: ' + buildingId + ', bookingId: ' + bookingId + '}'
    });
};

//only one is needed to get the ICS, must be logged in
vems.GetICSDownload = function (bookingId, reservationId, event) {
    if (!bookingId) { bookingId = 0; }
    if (!reservationId) { reservationId = 0; }
    if (event)
        event.preventDefault();

    window.location.href = 'ICSDownload.aspx?BookingId=' + bookingId + "&ReservationId=" + reservationId;
    return false;
};

vems.sendEmail = function (emailHash) {
    vems.ajaxPost({
        url: vems.serverApiUrl() + '/SendEmail',
        data: ko.toJSON({ emailHash: emailHash }),
        success: function (results) {
            vems.showToasterMessage('', 'Email Sent', 'success');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });
};

vems.validationClasses = {
    highlight: function (element, errorClass) {
        $(element).parent().addClass('has-error');
    },
    unhighlight: function (element, errorClass, validClass) {
        $(element).parent().removeClass('has-error');
    },
    errorClass: "help-block"
};

$(document).ready(function () {
    if (DevExpress.devices.real().phone) {
        $('.help-text-icon').hide();
    }

    var menuVM = new vems.menuVM();

    ko.applyBindings(menuVM, $('#sidebar-wrapper ul')[0]);
    ko.applyBindings(menuVM, $('#help-icon ul')[0]);
    ko.applyBindings(menuVM, $('#user-menu-dropdown')[0]);

    // if there are no items below the divider in the user menu, hide it.
    if ($('#user-menu-dropdown').children().last().hasClass('divider')) {
        $('#user-menu-dropdown').children().last().hide();
    }

});

$(document).on('ajaxStart ajaxStop', function (event) {
    switch (event.type) {
        case 'ajaxStart':
            break;
        case 'ajaxStop':
            if (vems.activeSessionTimer) {
                vems.activeSessionTimer.reset();
            }
            break;
    }
});

// extends the validator's remote method to check for html sanitization
// requires bleach.js
$.validator.addMethod('sanitize', function (value, element, param) {
    var validator = this;
    //param = param ? param.split(',') : [];
    var cleaned = bleach.sanitize(value, { mode: 'white', list: [] });

    return cleaned === value;
}, 'Invalid Format');

// extends the validator's remove method to trim
$.validator.addMethod('trim', function (value, element, param) {
    return value.trim().length > 0;
}, 'Invalid Characters');

vems.htmlEncode = function (value) {
    return $('<div/>').text(value).html();
};

vems.htmlDecode = function (value) {
    return $('<div/>').html(value).text();
};

vems.pageLoading = function (show) {
    $('#page-loading-overlay').height($(document).height());
    $('#page-loading-overlay').width($(document).width());

    if (show)
        $('#page-loading-overlay').show();
    else
        $('#page-loading-overlay').hide();
}

$(document).on('show.bs.modal', function () {
    $('#toaster').remove();
});


$(document).on('click', '.help-text-icon, .HelpTextEditLink', function (e) {
    var key = $(e.currentTarget).data('helptextkey');
    var parentType = $(e.currentTarget).data('parenttype');
    var parameterKeys = $(e.currentTarget).data('parameterkeys') ? $(e.currentTarget).data('parameterkeys') : '';
    var parentId = $(e.currentTarget).data('parentid') ? $(e.currentTarget).data('parentid') : vems.helpText.parentId;

    $('#help-text-modal').data('caller', e.currentTarget);

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetHelpTextRecord',
        data: ko.toJSON({
            key: key,
            parentType: parentType,
            parentId: parentId,
            parameterKeys: parameterKeys
        }),
        success: function (results) {
            var retObj = JSON.parse(results.d);
            if (retObj.Success) {
                $('#help-text-body-content').html(retObj.SuccessMessage);
                $('#help-text-modal').modal('show');
            } else {
                vems.showErrorToasterMessage(retObj.ErrorMessage);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });

}).on('click', '.help-text-edit', function (e) {
    var element = $('#help-text-modal').data('caller');

    var key = $(element).data('helptextkey');
    var parentType = $(element).data('parenttype');
    var parameterKeys = $(element).data('parameterkeys') ? $(element).data('parameterkeys') : '';
    var parentId = $(element).data('parentid') ? $(element).data('parentid') : vems.helpText.parentId;

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetWebTextCultures',
        data: ko.toJSON({
            key: key,
            parentType: parentType,
            parentId: parentId,
            parameterKeys: parameterKeys,
            translationId: 0,
            isPostBack: false
        }),
        success: function (results) {
            var retObj = JSON.parse(results.d);
            if (retObj.Success) {
                var retData = JSON.parse(retObj.JsonData);
                $('#webtext-culture-drop option').remove();

                $.each(retData.Cultures, function (i, v) {
                    $('#webtext-culture-drop').append(
                        $('<option></option>').val(v.Id).html(vems.decodeHtml(v.Description))
                    );
                });

                $("#help-text-close-btn").hide();
                $("#help-text-save-btn").show();
                $("#help-text-cancel-btn").show();

                if (retData.WebText.length > 0)
                    $('#help-text-modal #help-text-body-edit-content #webtext-editor').html(retData.WebText[0].Text);

                $('#help-text-modal #help-text-body-content').hide();
                $('#help-text-modal #help-text-body-edit-content').show();

                setTimeout(function () {
                    $('#webtext-editor').htmlarea({
                        toolbar: [
                            ["html"],
                            ["bold", "italic", "underline", "strikethrough"],
                            ["link", "unlink", "image"],
                            ["orderedlist", "unorderedlist", "superscript", "subscript", "indent", "outdent"],
                            ["justifyleft", "justifycenter", "justifyright", "increasefontsize", "decreasefontsize", "forecolor", "horizontalrule"]
                        ]
                    });
                }, 0);

            } else {
                vems.showErrorToasterMessage(retObj.ErrorMessage);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });

    return false;
}).on('hidden.bs.modal', '#help-text-modal', function () {
    $('#help-text-modal #help-text-body-content').show();
    $('#help-text-modal #help-text-body-edit-content').hide();

    $("#help-text-close-btn").show();
    $("#help-text-save-btn").hide();
    $("#help-text-cancel-btn").hide();
}).on('change', '#webtext-culture-drop', function () {
    var element = $('#help-text-modal').data('caller');

    var key = $(element).data('helptextkey');
    var parentType = $(element).data('parenttype');
    var parameterKeys = $(element).data('parameterkeys') ? $(element).data('parameterkeys') : '';
    var parentId = $(element).data('parentid') ? $(element).data('parentid') : vems.helpText.parentId;
    var translationId = $('#webtext-culture-drop').val();
    var isPostBack = true;

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetWebTextCultures',
        data: ko.toJSON({
            key: key,
            parentType: parentType,
            parentId: parentId,
            parameterKeys: parameterKeys,
            translationId: translationId,
            isPostBack: true
        }),
        success: function (results) {
            var retObj = JSON.parse(results.d);
            if (retObj.Success) {
                var retData = JSON.parse(retObj.JsonData);

                if (retData.WebText.length > 0) {
                    $('#webtext-editor').htmlarea("html", retData.WebText[0].Text);
                } else {
                    $('#webtext-editor').htmlarea("html", "");
                }

            } else {
                vems.showErrorToasterMessage(retObj.ErrorMessage);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });

}).on('click', '#help-text-save-btn', function () {
    var element = $('#help-text-modal').data('caller');

    var key = $(element).data('helptextkey');
    var parentType = $(element).data('parenttype');
    var parameterKeys = $(element).data('parameterkeys') ? $(element).data('parameterkeys') : '';
    var parentId = $(element).data('parentid') ? $(element).data('parentid') : vems.helpText.parentId;
    var translationId = $('#webtext-culture-drop').val();

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/UpdateWebTextRecord',
        data: ko.toJSON({
            key: key,
            parentType: parentType,
            parentId: parentId,
            translationId: translationId,
            text: $('#webtext-editor').htmlarea("html")
        }),
        success: function (results) {
            var retObj = JSON.parse(results.d);

            if (retObj.Success) {
                $('#help-text-modal').modal('hide');
                vems.showToasterMessage('', retObj.SuccessMessage, 'success', 2000);

            } else {
                vems.showErrorToasterMessage(retObj.ErrorMessage);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            return false;
        }
    });

});

//ko bindingHandlers
ko.subscribable.fn.subscribeChanged = function (callback) {
    var savedValue = this.peek();
    return this.subscribe(function (latestValue) {
        var oldValue = savedValue;
        savedValue = latestValue;
        callback(latestValue, oldValue);
    });
};

ko.bindingHandlers.currency = {
    //symbol: ko.observable('$'),
    update: function (element, valueAccessor, allBindingsAccessor) {
        return ko.bindingHandlers.text.update(element, function () {
            var value = +(ko.utils.unwrapObservable(valueAccessor()) || 0),
                symbol = '$';
            return symbol + value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
        });
    }
};

var koValueBindingInit = ko.bindingHandlers.value.init;
var koValueBindingUpdate = ko.bindingHandlers.value.update;
ko.bindingHandlers.value = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
        koValueBindingInit(element, valueAccessor, allBindingsAccessor, viewModel, context);
        ko.bindingHandlers.value.postValueUpdated.call(viewModel, element);
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        koValueBindingUpdate(element, valueAccessor, allBindings, viewModel, bindingContext);

        ko.bindingHandlers.value.postValueUpdated.call(viewModel, element, allBindings);
    },
    postValueUpdated: function (element, allBindings) {
        vems.postValueUpdate(element, allBindings);
    }
};

var koTextInputBindingInit = ko.bindingHandlers.textInput.init;
ko.bindingHandlers.textInput = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
        koTextInputBindingInit(element, valueAccessor, allBindingsAccessor, viewModel, context);
        ko.bindingHandlers.textInput.postValueUpdated.call(viewModel, element);
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        ko.bindingHandlers.textInput.postValueUpdated.call(viewModel, element, allBindings);
    },
    postValueUpdated: function (element, allBindings) {
        vems.postValueUpdate(element, allBindings);
    }
};
//end ko bindingHandlers

vems.postValueUpdate = function (element, allBindings) {
    var jElement = $(element);

    var required = jElement.attr('required') != undefined || jElement.hasClass('required');

    if (!required && allBindings != undefined && allBindings().attr != undefined && allBindings().attr.required != undefined) {
        required = true;
    }

    if (required) {
        if (jElement.is("select")) {
            if (jElement.val() != null && jElement.val() > 0) {
                jElement.css('border-color', '#ccc');
            } else {
                jElement.css('border-color', '#a94442');
            }
        }

        if (jElement.is("input")) {
            if (jElement.val() != null && jElement.val().length > 0) {
                jElement.css('border-color', '#ccc');
            } else {
                jElement.css('border-color', '#a94442');
            }
        }
    }

    // special case that doesn't honor the regular required attr 
    if (jElement.is('div.date:not([id="booking-start"],[id="booking-end"])')) {
        var datePickerRequiredInput = jElement.children('input[required], input.required');
        if (datePickerRequiredInput.length > 0) {
            if (jElement.data('date').length > 0) {
                datePickerRequiredInput.css('border-color', '#ccc');                
            } else {
                datePickerRequiredInput.css('border-color', '#a94442');
            }
        }
        //if the require border was removed, then remove msg
        if (!datePickerRequiredInput || datePickerRequiredInput.length == 0) {
            //remove any validation messages under the textbox if they exist            
            jElement.siblings('.validation-error-message').remove();
        }
    }
};

$(document).on('keyup', 'input.required, input[required]', function (e) {
    vems.postValueUpdate(e.currentTarget);
}).on('change', 'select.required, select[required]', function (e) {
    vems.postValueUpdate(e.currentTarget);
}).on('dp.change', 'div.date', function (e) {
    vems.postValueUpdate(e.currentTarget)
});

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
};

//converts base64 to clean urlencoded svg xml
function convertSvgBinaryToXML(base64String) {

    var t = atob(base64String);
    t = t.replace(/(\r\n|\n|\r)/gm, "");
    var svg = "";
    $(t).each(function (i, v) {
        if (v.tagName && v.tagName.toLowerCase() == 'svg')
            svg = v;
    });
    $(svg).removeAttr('height').removeAttr('width');
    return b64EncodeUnicode($('<div>').append(svg).html());
    //return $('<div>').append(svg).html();
};

vems.bindLoadingGifsToTypeAhead = function (jQueryInputElement, cssOverride) {
    if (jQueryInputElement) {
        //add loading gif
        var cssClass = 'search-loading';
        if (cssOverride && cssOverride.length > 0)
            cssClass = cssOverride;
        $(jQueryInputElement).parent().parent().append('<img class="input-icon-embed ' + cssClass + '" src="Images/Loading.gif" />');

        jQueryInputElement.unbind('typeahead:asyncrequest').bind('typeahead:asyncrequest', function (event) {  // show loading animation
            $(event.currentTarget).parent().parent().find('i.fa-search').css('display', 'none');
            $(event.currentTarget).parent().parent().find('.search-loading').css('display', 'inline');
        }).unbind('typeahead:render').bind('typeahead:render', function (event) {  // hide loading animation
            $(event.currentTarget).parent().parent().find('.search-loading').css('display', 'none');
            $(event.currentTarget).parent().parent().find('i.fa-search').css('display', 'inline');
        }).unbind('typeahead:asynccancel').bind('typeahead:asynccancel', function (event) {  // hide loading animation
            $(event.currentTarget).parent().parent().find('.search-loading').css('display', 'none');
            $(event.currentTarget).parent().parent().find('i.fa-search').css('display', 'inline');
        });
    }
};

vems.convertTabsForMobile = function () {
    $('.nav-tabs').addClass('mobile-nav-tabs');
    $('.nav-tabs li').addClass('row').addClass('col-xs-12');
    $('.nav-tabs a').addClass('mobile-tab');
};