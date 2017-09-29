<%@ Page Language="C#" AutoEventWireup="true" Inherits="Admin_RestAdmin"
    MasterPageFile="~/MasterVirtualEms.master" Title="<%$Resources:PageTitles, RestAdmin %>" CodeBehind="RestAdmin.aspx.cs" %>

<%@ Import Namespace="Resources" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="server">

    <style type="text/css">
        div[id^=Tab] {
            position: relative;
            padding: 10px;
            border: 1px solid #d3d3d3;
        }

        .dx-field-label {
            width: auto;
        }

        .dx-field-value > div:first-child {
            float: left !important;
        }

        .dx-field-value > div:last-child {
            float: left;
        }

        .dx-field-value:not(.checkbox-template) > div:first-child {
            width: 85%;
        }

        .help-text-icon {
            margin-top: 12px;
        }

        .method {
            margin-bottom: 20px;
        }

        .method-w-input {
            margin-bottom: 50px;
        }
        /* to make scrollbars always visible */
        /*.always-visible > .ps-scrollbar-x-rail,
        .always-visible > .ps-scrollbar-y-rail {
        opacity: 0.6;
        }*/
    </style>
</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <div id="restAdmin">
        <div id="main-tabs-container">
            <ul id="main-tabs" class="nav nav-tabs hidden-xs" role="tablist">
                <li role="presentation" class="active" data-type="mobile-auth"><a href="#mobile-auth" aria-controls="mobile-auth" role="tab" data-toggle="tab"><%= ScreenText.MobileAuthentication %></a></li>
                <li role="presentation" data-type="saml"><a href="#saml" aria-controls="saml" role="tab" data-toggle="tab">SAML</a></li>
                <li role="presentation" data-type="error-logs"><a href="#error-logs" aria-controls="error-logs" role="tab" data-toggle="tab"><%= ScreenText.ErrorLogs %></a></li>
            </ul>
        </div>
        <div class="tab-content">
            <div role="tabpanel" class="tab-pane active" id="mobile-auth">
                <h2><strong><%= ScreenText.EMSNativeAuthentication %></strong></h2>
                <label>
                    <input type="radio" name="mobileauth" value="webuser" data-bind="checked: admin.MobileAuthMethod, click: twoFactor.enable" />
                    <span style="font-weight: normal; margin-right: 15px;">Authenticate via <strong>web user credentials</strong> stored in EMS</span>
                </label>

                <h2><strong><%= ScreenText.IntegratedAuthentication %></strong></h2>
                <div class="method">
                    <h3>
                        <label>
                            <input type="radio" name="mobileauth" value="ldap" data-bind="checked: admin.MobileAuthMethod, click: twoFactor.enable" />
                            <span style="font-weight: normal; margin-right: 15px;"><strong>LDAP</strong></span>
                        </label>
                    </h3>
                    <ul>
                        <li>Authenticate against your company's LDAP provider</li>
                    </ul>
                </div>
                <div class="method-w-input">
                    <h3>
                        <label>
                            <input type="radio" name="mobileauth" value="ntlm" data-bind="checked: admin.MobileAuthMethod, click: twoFactor.enable" />
                            <span style="font-weight: normal; margin-right: 15px;"><strong>Windows Authentication</strong></span>
                        </label>
                    </h3>
                    <ul>
                        <li>Authenticate via Microsoft's challenge-response protocol</li>
                        <li>Ensure Windows Authentication is enabled in IIS (and leave Anonymous Authentication enabled as well)</li>
                        <li>Ensure the web.config is set to protect the `api/v1/authentication` location</li>
                    </ul>
                    <h3 style="margin-left: 16px"><strong><%=ScreenText.DomainName %></strong></h3>
                    <ul>
                        <li>In most cases, the domain name is not required.  You may choose to require it on sign-in below.</li>
                        <li>If you wish to require the domain, you may set a default value in the text box below.</li>
                    </ul>
                    <div class="" style="margin-left: 16px; margin-top: 20px" data-bind="template: { name: 'dx-checkbox', data: { val: admin.NTLMRequireDomain, disabled: admin.MobileAuthMethod() !== 'ntlm', label: '<%= ScreenText.RequireDomain %>    ' } }"></div>
                    <div class="" style="margin-left: 16px"
                        data-bind="template: { name: 'textbox-w-label-auth', data: { val: admin.NTLMDomainValue, method: 'ntlm', placeholder: 'MYCOMPANY',  label: '<%=ScreenText.DomainName %>    ' } }">
                    </div>
                </div>
                <div class="method-w-input">
                    <h3>
                        <label>
                            <input type="radio" name="mobileauth" value="openId" data-bind="checked: admin.MobileAuthMethod, click: twoFactor.disable" />
                            <span style="font-weight: normal; margin-right: 15px;"><strong>Open ID Connect</strong></span>
                        </label>
                    </h3>
                    <div class="" style="margin-left: 16px"
                        data-bind="template: { name: 'textbox-w-label-auth', data: { val: admin.OpenIDUserInfoEndpoint, method: 'openId', placeholder: 'https://example.com/userinfo',  label: '<%=ScreenText.OpenIDUserInfoEndpoint %>' } }">
                    </div>
                    <div class="" style="margin-left: 16px" data-bind="template: {
                         name: 'dx-select', data: { dxSelectOptions: { items: userInfoItems, displayExpr: 'name', valueExpr: 'value', value: admin.OpenIDUserInfoRequestMethod, disabled: admin.MobileAuthMethod() !== 'openId' }, label: '<%= ScreenText.OpenIDUserInfoRequestMethod %>    ' }
                    }"></div>
                    <div style="height: 20px"></div>
                </div>
                <div class="method-w-input">
                    <h3>
                        <label>
                            <input type="radio" name="mobileauth" value="saml" data-bind="checked: admin.MobileAuthMethod, click: twoFactor.disable" />
                            <span style="font-weight: normal; margin-right: 15px;"><strong>SAML</strong></span>
                        </label>
                    </h3>
                    <p style="margin-left: 16px">
                        Configure SAML on the next tab
                    </p>
                </div>
                <div class="method-w-input">
                    <h3>
                        <label>
                            <input type="radio" name="mobileauth" value="header" data-bind="checked: admin.MobileAuthMethod, click: twoFactor.enable" />
                            <span style="font-weight: normal; margin-right: 15px;"><strong>Header Variable</strong></span>
                        </label>
                    </h3>
                    <div class="" style="margin-left: 16px"
                        data-bind="template: { name: 'textbox-w-label-auth', data: { val: admin.MobileAuthHeaderVariable, method: 'header', placeholder: 'X-SOME-HEADER',  label: '' } }">
                    </div>
                </div>

                
                <h2 style="margin-top: 20px"><strong><%= ScreenText.PersistentAuthentication %></strong></h2>
                <h3><strong><%=ScreenText.TokenDuration %></strong></h3>
                <div class="method-w-input">
                    <div style="margin-left: 16px; margin-top: 20px">
                        <div style="display: inline-flex; margin-right: 30px" data-bind="dxTextBox: { value: timeInput.value, placeholder: '' }, dxValidator: {  validationRules: [{ type: 'numeric' }, { type: 'range', min: 0, max: 1440, message: 'Must be a number between 0 and 1440' }] }"></div>
                        <div style="display: inline-flex;" data-bind="dxCheckBox: { value: timeInput.minutes, onValueChanged: timeInput.minuteChange, text: '<%= ScreenText.Minutes %>    ' }"></div>
                        <div style="display: inline-flex;" data-bind="dxCheckBox: { value: timeInput.days, onValueChanged: timeInput.dayChange, text: '<%= ScreenText.DaysCapital %>    ' }"></div>
                    </div>
                    <div class="" style="margin-left: 16px; margin-top: 20px" data-bind="template: { name: 'dx-checkbox', data: { val: admin.MobileAuthIsPersistent, label: '<%= ScreenText.UsePersistentAuthentication %>' } }"></div>
                    <ul>
                        <li>
                            When using persistent authentication, a user's mobile credentials will become invalid after a <strong>period of inactivity</strong> equal to or greater than the duration entered above.
                        </li>
                        <li>
                            If not using persistent authentication, a user will be forced to re-authenticate after the duration entered above has elapsed, regardless of activity.
                        </li>
                    </ul>
                </div>

                <h2 style="margin-top: 20px"><strong><%= PageTitles.TwoFactorAuthentication %></strong></h2>
                <div class="method-w-input">
                    <div class="" style="margin-left: 16px; margin-top: 20px" data-bind="template: { name: 'dx-checkbox', data: { val: admin.MobileRequireTwoFactor, disabled: twoFactor.disabled, label: '<%= ScreenText.RequireTwoFactor %>    ' } }"></div>
                    <ul>
                        <li>
                            This setting is ignored for <strong>Open ID</strong> and <strong>SAML</strong> authentication.
                        </li>
                    </ul>
                </div>
                
            </div>
            
            <div role="tabpanel" class="tab-pane" id="saml">
                <div class="row">
                    <h2 style="margin-left: 16px"><strong>SAML</strong></h2>
                </div>

                <h3><strong>Request and Response Properties</strong></h3>
                <div class="" style="margin-left: 16px"
                    data-bind="template: { name: 'textbox-w-label', data: { val: admin.SAMLHttpFormPostAttribute, placeholder: '(e.g., SAMLResponse)',  label: '<%=ScreenText.SAMLHttpFormPostAttribute %>    ' } }">
                </div>
                <div class="" style="margin-left: 16px" data-bind="template: {
                    name: 'dx-select', data: { dxSelectOptions: { items: samlIdentifyFieldItems, displayExpr: 'name', valueExpr: 'value', value: admin.SAMLIdentityField }, label: '<%= ScreenText.OpenIDUserInfoRequestMethod %>    ' }
                 }"></div>
                <div class="" style="margin-left: 32px"
                    data-bind="template: { name: 'textbox-w-label', data: { val: admin.SAMLIdentityAttributeName, placeholder: '(e.g., emailAddres)', disabled: admin.SAMLIdentityField() !== 1, label: '<%=ScreenText.SAMLIdentityAttributeName %>    ' } }">
                </div>
                <div class="" style="margin-left: 16px"
                    data-bind="template: { name: 'textbox-w-label', data: { val: admin.SAMLIdpIssuer, placeholder: '(e.g., my-company-issuer)',  label: '<%=ScreenText.SAMLIdpIssuer %>    ' } }">
                </div>
                <div class="" style="margin-left: 16px"
                    data-bind="template: { name: 'textbox-w-label', data: { val: admin.SAMLSPIssuer, placeholder: '(e.g., ems-api-issuer)',  label: '<%=ScreenText.SAMLSPIssuer %>    ' } }">
                </div>

                <h3 style="margin-top: 50px"><strong>URLs</strong></h3>
                <div class="" style="margin-left: 16px"
                    data-bind="template: { name: 'textbox-w-label', data: { val: admin.SAMLIdpRedirectURL, placeholder: 'https://saml.example.com/auth/saml',  label: '<%=ScreenText.SAMLIdpRedirectURL %>    ' } }">
                </div>
                <div class="" style="margin-left: 16px"
                    data-bind="template: { name: 'textbox-w-label', data: { val: admin.SAMLSPCallbackURL, placeholder: 'https://saml.example.com/callback',  label: '<%=ScreenText.SAMLSPCallbackURL %>    ' } }">
                </div>

                <h3 style="margin-top: 50px"><strong>Certificate Paths</strong></h3>
                <div class="" style="margin-left: 16px"
                    data-bind="template: { name: 'textbox-w-label', data: { val: admin.SAMLIdpCertPublicPath, placeholder: '(e.g., C:\\secrets\\certs\\idp.cer)',  label: '<%=ScreenText.SAMLIdpCertPublicPath %>    ' } }">
                </div>
                
                <div class="" style="margin-left: 16px"
                    data-bind="template: { name: 'textbox-w-label', data: { val: admin.SAMLSPCertPublicPath, placeholder: '(e.g., C:\\secrets\\certs\\sp-public.cer)',  label: '<%=ScreenText.SAMLSPCertPublicPath %>    ' } }">
                </div>
                <div class="" style="margin-left: 16px"
                    data-bind="template: { name: 'textbox-w-label', data: { val: admin.SAMLSPCertPrivatePath, placeholder: '(e.g., C:\\secrets\\certs\\sp-private.cer)',  label: '<%=ScreenText.SAMLSPCertPrivatePath %>    ' } }">
                </div>
                
            </div>

            <div role="tabpanel" class="tab-pane" id="error-logs">
                <table class="table table-striped" style="margin-top: 30px;">
                    <tbody id="ErrorLogHolder" runat="server"></tbody>
                </table>
            </div>

        </div>
        <div class="" style="padding-top: 40px">
            <div id="SaveButton" class="floatRight" data-bind="dxButton: {type: 'default', onClick: saveConfiguration, text: '<%= ScreenText.Save %>    ',  }"></div>
        </div>
    </div>

    <script type="text/html" id="textbox-w-label-auth">
        <div style="display: inline-flex;" class="dx-field-label" data-bind="text: label"></div>
        <div class="dx-field-value">
            <div data-bind="dxTextBox: { value: val, mode: $data.pass ? 'password' : 'text', placeholder: $data.placeholder, disabled: $data.method !== $root.admin.MobileAuthMethod() }, dxValidator: $data.rules || $root.emptyRules"></div>

        </div>
    </script>

    <script type="text/html" id="textbox-w-label">
        <div style="display: inline-flex;" class="dx-field-label" data-bind="text: label"></div>
        <div class="dx-field-value">
            <div data-bind="dxTextBox: { value: val, mode: $data.pass ? 'password' : 'text', placeholder: $data.placeholder }, dxValidator: $data.rules || $root.emptyRules"></div>

        </div>
    </script>

    <script type="text/html" id="dx-checkbox">
        <div class="dx-field-value checkbox-template">
            <div style="display: inline-flex;" data-bind="dxCheckBox: { value: val, disabled: $data.disabled, text: function() {return label.trim()} }"></div>
        </div>
        <!-- ko if: $data.help -->
        <div class="custom-link-help" style="margin-left: 28px;" data-bind="html: $data.help" />
        <!-- /ko -->
    </script>

    <script type="text/html" id="dx-radio">
        <div class="dx-field-value checkbox-template">
            <div style="display: inline-flex;" data-bind="dxCheckBox: { value: val, text: function() {return label.trim()} }"></div>
        </div>
        <!-- ko if: $data.help -->
        <div class="custom-link-help" style="margin-left: 28px;" data-bind="html: $data.help" />
        <!-- /ko -->
    </script>

    <script type="text/html" id="dx-select">
        <label style="" class="" data-bind="text: label"></label>
        <!-- ko if: $data.help -->
        <label class="custom-link-help" style="float: none;" data-bind="html: $data.help" />
        <!-- /ko -->
        <div class="dx-field-value">
            <div data-bind="dxSelectBox: dxSelectOptions"></div>
        </div>
    </script>

</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">

    <script type="text/javascript">
        $(document).ready(function () {
            
            var mapped = ko.mapping.fromJS(<%=JsonViewModel %>);
            var timeIsInMinutes = mapped.MobileAuthPersistMinutes() < 1440 ||
                (mapped.MobileAuthPersistMinutes() >= 1440 && mapped.MobileAuthPersistMinutes() % 1440 !== 0);

            var model = {
                
                admin: mapped,
                emptyRules: { validationRules: [] },
                userInfoItems: [
                    { name: 'GET', value: 0 },
                    { name: 'POST', value: 1 }
                ],
                timeInput: {
                    minutes: ko.observable(timeIsInMinutes),
                    days: ko.observable(!timeIsInMinutes),
                    value: ko.observable(timeIsInMinutes
                        ? mapped.MobileAuthPersistMinutes()
                        : mapped.MobileAuthPersistMinutes() / 1440),
                    minuteChange: function(e) {
                        //debugger;
                        var input = ko.dataFor(document.getElementById('restAdmin')).timeInput
                        input.minutes(e.value);
                        input.days(!e.value);
                    },
                    dayChange: function(e) {
                        //debugger;
                        var input = ko.dataFor(document.getElementById('restAdmin')).timeInput
                        input.minutes(!e.value);
                        input.days(e.value);
                    }
                },
                userInfoRequestMethods: {
                    items: [
                        { name: 'GET', value: 0 },
                        { name: 'POST', value: 1 }
                    ],
                    displayExpr: 'name',
                    valueExpr: 'value',
                    value: mapped.OpenIDUserInfoRequestMethod || 0,
                    disabled: mapped.MobileAuthMethod() !== 'openId'
                },
                samlIdentifyFieldItems: [
                        { name: 'NameID', value: 0 },
                        { name: 'Attribute', value: 1 }
                ],
                twoFactor: {
                    enable: function() {
                        ko.dataFor(document.getElementById('restAdmin')).twoFactor.disabled(false);
                        return true;
                    },
                    disable: function() {
                        var data = ko.dataFor(document.getElementById('restAdmin'))
                        data.twoFactor.disabled(true);
                        data.admin.MobileRequireTwoFactor(false);
                        return true;
                    },
                    disabled: ko.observable(mapped.MobileAuthMethod() === 'openId' || mapped.MobileAuthMethod() === 'saml')
                },
                saveConfiguration: function() {
                    var model = ko.toJS(ko.dataFor(document.getElementById('restAdmin')));
                    model.admin.MobileAuthPersistMinutes = model.timeInput.minutes
                        ? model.timeInput.value
                        : model.timeInput.value * 1440;

                    if(model.admin['__ko_mapping__']) {
                        delete model.admin['__ko_mapping__'];
                    }

                    var jsonstring = JSON.stringify({ model: model.admin }, null, 4);
                    
                    console.log(jsonstring);

                    vems.ajaxPost({
                        //async: false,
                        url: vems.serverApiUrl() + '/SaveRestAdmin',
                        data: jsonstring,
                        success: function (response) {
                            var x = JSON.parse(response.d);
                            if (x.Success) {
                                vems.showToasterMessage('<%= ScreenText.Saved %>', "success");
                            }
                            else {
                                vems.showErrorToasterMessage(x.ErrorMessage, 6000);
                            }
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(thrownError);
                        }
                    });
                    
                },
                testConfiguration: function() {
                    var model = ko.toJS(ko.dataFor(document.getElementById('restAdmin')));
                    var jsonstring = "{model: " + JSON.stringify(model.ldap) + "}";
                    
                    vems.ajaxPost({
                        //async: false,
                        url: vems.serverApiUrl() + '/TestConfiguration',
                        data: jsonstring,
                        success: function (response) {

                            var x = JSON.parse(response.d);
                            if (x.Success) {
                                if (x.JsonData.length == 0){
                                    vems.showErrorToasterMessage("Couldn't access LDAP", 6000);
                                }
                                vems.showToasterMessage(x.JsonData, "success");
                            }
                            else {
                                vems.showErrorToasterMessage(x.ErrorMessage, 6000);
                            }

                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(thrownError);
                        }
                    });

                },
                authenticationTypeHelpText: "<%= ScreenText.AuthenticationTypeHelp %>"
            };
            
            ko.applyBindings(model, document.getElementById('restAdmin'));

            $('#pc_ErrorLogHolder a').click(function (e) {
                e.preventDefault();  // prevent navigation to error log url, as direct access is restricted
                var fileName = $(this).text();
                vems.ajaxPost({
                    url: vems.serverApiUrl() + '/ReadAPILogFile',
                    data: JSON.stringify({ fileName: fileName }),
                    success: function (result) {
                        var response = JSON.parse(result.d);
                        if (response.Success) {
                            window.open().document.write('<div style="white-space:pre;">' + response.SuccessMessage + '</div>');
                        } else {
                            vems.showToasterMessage('', response.ErrorMessage, 'danger', 2000);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                    }
                });
            });
                        
        });
    </script>

</asp:Content>

