function validatePage() {
    var validator = DevExpress.validationEngine.validateGroup('login');
    if (validator.isValid) {
        return true;
    } else {
        validator.brokenRules[0].validator._$element.find('input').focus();
        return false;
    }
}

$(document).ready(function () {
    $(".userId").dxTextBox({
        showClearButton: true,
        value: $(".userId").data('cookieValue'),
        attr: {
            'ID': 'userID_input',
            'name': 'userID_input'
        }
    }).dxValidator({
        validationRules: [{
            type: "required",
            message: $(".userId").parent().prev().text() + " is required"
        }],
        validationGroup: "login"
    });
    $("#password").dxTextBox({
        mode: 'password',
        placeholder: $('#password').parent().prev().text(),
        attr: {
            'ID': 'password_input',
            'name': 'password_input'
        }
    }).dxValidator({
        validationRules: [{
            type: "required",
            message: $("#password").parent().prev().text() + " is required"
        }],
        validationGroup: "login"
    });

    if ($('#userID_input').val().length > 0) {
        $("#password_input").focus();
    } else {
        $('#userID_input').focus();
    }

    if ('<%= Timeout.ToString().ToLower() %>' === 'true') {
        $("#timeoutMsg").show();
    }
});