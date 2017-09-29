<%@ Page Language="C#" AutoEventWireup="true" Inherits="Admin_LdapConfiguration"
    MasterPageFile="~/MasterVirtualEms.master" Title="<%$Resources:PageTitles, LdapConfiguration %>" CodeBehind="LdapConfiguration.aspx.cs" %>

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
        .help-text-icon {    margin-top: 12px;}
        /* to make scrollbars always visible */
      /*.always-visible > .ps-scrollbar-x-rail,
      .always-visible > .ps-scrollbar-y-rail {
        opacity: 0.6;
      }*/
    </style>
</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <div id="ldapConfig" >
        <div id="tabs"  data-bind="dxTabs: tabConfig"></div>
        <div id="Tab0" class="always-visible" data-bind="visible: tabConfig.selectedIndex() == 0">
            <div>
                        <p>
                            This is the main LDAP setup form that configures the site to authenticate users through their LDAP User accounts.
                        </p>
                        <p>
                            Prerequisites:
                            <br />
                            <ul>
                                <li>IIS must be configured to allow Windows Authentication. </li>
                                <li>EMS must have a license to use LDAP.</li>
                                <li>The EMS Parameter under the Virtual tab in EMS Desktop (“Field Used to Authenticate Web User”), should be set to All, Network ID, or External Reference.</li>
                            </ul>
                        </p>
                        <p>
                            See "VEMS Integrated Authentication Install.PDF" for instructions on how to configure these settings. If you’re not familiar with LDAP settings, it is highly recommended to get the assistance of a System Admin in your organization who is familiar with the LDAP settings.
                        </p>
                        <p>
                            The LDAP configuration can be tested on the Test Configuration tab.
                        </p>
                    </div>

            <div class="">
                <div class="" data-bind="template: { name: 'dx-checkbox', data: { val: ldap.AuthenticateWithLdap, label: '<%=ScreenText.UseLadp%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'dx-checkbox', data: { val: ldap.UseLdapForAssignTemplates, label: '<%=ScreenText.UseLDAPForTemplateAssignment%>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.UseLDAPForTemplateAssignmentHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'dx-checkbox', data: { val: ldap.UseCommunicationOptions, label: '<%=ScreenText.UseCommunicationOptions%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.LdapPath, label: '<%=ScreenText.PathForLdapQuery%>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.PathForLdapHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.LdapDomainList, label: '<%=ScreenText.LdapDomainList %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapDomainListHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.LdapUser, label: '<%=ScreenText.LdapUser %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapUserHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.LdapUserPassword, pass: true, label: '<%=ScreenText.LdapUserPassword %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapPasswordHelp))%>    '  } }"></div>
                <div class="" data-bind="template: { name: 'dx-select', data: { dxSelectOptions: securityAuthTypeSelectBox, label: '<%= ScreenText.AuthenticationType %>    ', help: authenticationTypeHelpText } }"></div>
                <div id="authTypes"></div>
            </div>

        </div>
        <div id="Tab1" class=" always-visible" data-bind="visible: tabConfig.selectedIndex() == 1">
            <div  class="" style="padding: 20px">
                        <p>
                            These fields define how to fetch a Group or a User when sending communications from the EMS Desktop Client. 
                            You can also set the SSL configurations, including the Security Certificate Path.
                        </p>
                        <p>                           
                            If you’re not familiar with the LDAP settings, it is highly recommended to get the assistance of a System Admin in your organization who is familiar with the LDAP settings.
                        </p>
                    </div>
            <div class="">
                <div class="" data-bind="template: { name: 'dx-checkbox', data: { val: ldap.UseSSL, label: '<%=ScreenText.UseSSL%>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.UseSSLHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.CertificatePath, label: '<%=ScreenText.CertificatePath %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.CertificatePathHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'dx-select', data: { dxSelectOptions: protocolAuthTypeSelectBox, label: '<%= ScreenText.AuthenticationType %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.ProtocolAuthTypeHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.SearchRoot, label: '<%=ScreenText.SearchRoot %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.SearchRootHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.UserSearchFilter, label: '<%=ScreenText.UserSearchFilter %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.UserSearchFilterHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.TokenGroupSearchFilter, label: '<%=ScreenText.TokenGroupSearchFilter %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.TokenGroupSearchFilterHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.LdapProtocolVersion, label: '<%=ScreenText.ProtocolVersion %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.ProtocolVersionHelp))%>    ' } }"></div>
            </div>

        </div>
        <div id="Tab2" class=" always-visible" data-bind="visible: tabConfig.selectedIndex() == 2">
            <div  class="" style="padding: 20px">
                        <p>
                            Indicate whether your LDAP implementation is Active Directory. These properties are set to the common defaults, but can be changed here if the LDAP properties differ from the defaults displayed.
                        </p>
                        <p>                           
                            If you’re not familiar with the LDAP settings, it is highly recommended to get the assistance of a System Admin in your organization who is familiar with the LDAP settings.
                        </p>
                    </div>
            <div class="">
                <div class="" data-bind="template: { name: 'dx-checkbox', data: { val: ldap.UsingActiveDirectory, label: '<%=ScreenText.UsingAD%>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.UsingADHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.txtLdapNameProperty, label: '<%=ScreenText.NameProperty %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapNameHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.txtLdapPhoneProperty, label: '<%=ScreenText.PhoneProperty %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapPhoneHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.txtLdapDomainToAppend, label: '<%=ScreenText.DomainToAppend %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.DomainToAppendHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'dx-select', data: { dxSelectOptions: fieldToUseSelectBox, label: '<%= ScreenText.LdapWebUserFieldToUseForAuthentication %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapWebUserFieldToUseForAuthenticationHelp))%>    ' } }"></div>

            </div>

        </div>

        <div id="Tab3" class=" always-visible" data-bind="visible: tabConfig.selectedIndex() == 3">
            <div  class="" style="padding: 20px">
                        <p>
                            If your LDAP implementation is not Active Directory, use these fields to redefine the LDAP property names used when fetching directory information.
                        </p>
                        <p>                           
                            If you’re not familiar with the LDAP settings, it is highly recommended to get the assistance of a System Admin in your organization who is familiar with the LDAP settings.
                        </p>
                    </div>
            <div class="">
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.LdapAccount, label: '<%=ScreenText.LdapAccountUserId %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapAccountUserIdHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.txtLdapFullUserId, label: '<%=ScreenText.FullLdapUserId %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.FullLdapUserIdHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.LdapGroupCatetory, label: '<%=ScreenText.LdapGroupCategory %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapGroupCategoryHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.txtLdapGroupName, label: '<%=ScreenText.LdapGroupName %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapGroupNameHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.txtLdapGroupMemberName, label: '<%=ScreenText.LdapGroupMemberName %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapGroupMemberNameHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.txtLdapGroupMemberUserName, label: '<%=ScreenText.LdapGroupMemberUserName %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapGroupMemberUserNameHelp))%>    '} }"></div>
            </div>

        </div>
        <div id="Tab4" class=" always-visible" data-bind="visible: tabConfig.selectedIndex() == 4">
            <div  class="" style="padding: 20px">
                        <p>These are LDAP Query overrides to fetch Groups and Users from the domain.  These settings rarely need to overridden.  
                            If you’re not familiar with the LDAP settings, it is highly recommended to get the assistance of a System Admin in your organization who is familiar with the LDAP settings.</p>
                    </div>
            <div class="">
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.LdapQueryForSecurityGroups, label: '<%=ScreenText.LdapQueryForSecurityGroups %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapQueryForSecurityGroupsHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.LdapQueryToFindUsers, label: '<%=ScreenText.LdapQueryToFindUsers %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapQueryToFindUsersHelp))%>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.LdapQueryToFindUsersWithSpace, label: '<%=ScreenText.LdapQueryToFindUsersWithSpace %>    ', help: '<%= Server.HtmlEncode(escapeQuotes(ScreenText.LdapQueryToFindUsersWithSpaceHelp))%>    ' } }"></div>
            </div>

        </div>
        <div id="Tab5" class=" always-visible" data-bind="visible: tabConfig.selectedIndex() == 5">
            <div class="" style="padding: 20px"><p>This will save and check your configuration. If the configuration isn't correct, it will provide error information.</p>
                <p>To further confirm the settings, go to the Web Process Template in EMS Desktop Client, go to the LDAP Groups tab, click the Display button. A list of the domain’s groups should be displayed.</p>
                </div>
            <div class="">
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.TestUserId, label: '<%= ScreenText.LdapUserId %>    ' } }"></div>
                <div class="" data-bind="template: { name: 'textbox-w-label', data: { val: ldap.TestPassword, pass: true, label: '<%=ScreenText.Password %>    ' } }" style="margin-bottom: 20px"></div>
                <div id="TestButton" class="floatRight" data-bind="dxButton: {type: 'default', onClick: testConfiguration, text: '<%= ScreenText.Test %>    ',  }"></div>
            </div>

        </div>

        <div class="" style="padding-top: 10px">
            <div id="SaveButton" class="floatRight" data-bind="dxButton: {type: 'default', onClick: saveConfiguration, text: '<%= ScreenText.Save %>    ',  }"></div>
        </div>
    </div>

    <script type="text/html" id="textbox-w-label">
        <div style="display: inline-flex;" class="dx-field-label" data-bind="text: label"></div>
        <!-- ko if: $data.help -->
        <div class="help-text" data-bind="html: $data.help" />
        <!-- /ko -->
        <div class="dx-field-value">
            <div data-bind="dxTextBox: { value: val, mode: $data.pass ? 'password' : 'text' }, dxValidator: $data.rules || $root.emptyRules"></div>

        </div>
    </script>

    <script type="text/html" id="dx-checkbox">
        <div class="dx-field-value checkbox-template">
            <div style="display: inline-flex; " data-bind="dxCheckBox: { value: val, text: function() {return label.trim()} }" ></div>            
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
            
            var tabs = $.map([0, 1, 2, 3, 4, 5], function (i) { return $('#Tab' + i); });
            var tabData = [
                    { text: "<%= ScreenText.Security %>" },
                    { text: "<%= ScreenText.CommunicationOptions %>" },
                    { text: "<%= ScreenText.CoreProperties %>" },
                    { text: "<%= ScreenText.NonADConfig %>" },
                    { text: "<%= ScreenText.LDAPQueries %>" },
                    { text: "<%= ScreenText.TestConfiguration %>" }
            ];                    

            var mapped = ko.mapping.fromJS(<%=JsonViewModel %>);
            var model = {
                tabConfig: {
                    dataSource: tabData,
                    selectedIndex: ko.observable(-1),
                    onSelectionChanged: function (e) {
                        tabs[model.tabConfig.selectedIndex()]
                            //.css('height', getTabContentHeight(tabs[model.tabConfig.selectedIndex()]))
                            .perfectScrollbar('update');

                        if (model.tabConfig.selectedIndex() == 5){
                            $("#SaveButton").hide();
                        }
                        else { $("#SaveButton").show(); }
                    }
                },
                ldap: mapped,
                emptyRules: { validationRules: [] },
                securityAuthTypeSelectBox: {
                    items: ko.unwrap(mapped.AuthTypes()),
                    displayExpr: 'Name',
                    valueExpr: 'Key',
                    value: mapped.AuthenticationMethod
                },
                protocolAuthTypeSelectBox: {
                    dataSource: $.map(mapped.ProtocolAuthTypesDS(), function(val, index) { return { key: index, value: val } }),
                    displayExpr: 'value',
                    valueExpr: 'key',
                    value: mapped.ProtocolAuthType
                },
                fieldToUseSelectBox: {
                    dataSource: $.map(mapped.FieldToUse(), function(val, index) { return { key: index, value: val } }),
                    displayExpr: 'value',
                    valueExpr: 'key',
                    value: mapped.ddlWebUserFieldToUse
                },
                saveConfiguration: function() {
                    var model = ko.toJS(ko.dataFor(document.getElementById('ldapConfig')));
                    var jsonstring = "{model: " + JSON.stringify(model.ldap) + "}";

                    vems.ajaxPost({
                        //async: false,
                        url: vems.serverApiUrl() + '/SaveConfiguration',
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
                    var model = ko.toJS(ko.dataFor(document.getElementById('ldapConfig')));
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
            
            ko.applyBindings(model, document.getElementById('ldapConfig'));

            $('div[id^="Tab"]').perfectScrollbar();
            model.tabConfig.selectedIndex(0);
            resetVisibleTabScroll();

            $(window).on('resize', function () {
                resetVisibleTabScroll();                
            });

            function resetVisibleTabScroll(){
                var visible = $.grep(tabs, function (tab) { return tab.is(':visible'); })[0];
                visible.css('height', getTabContentHeight(visible));
                visible.perfectScrollbar('update');
            };

            function getTabContentHeight() {
                return $('.main-content').height() - 125;
            };

            function getTabContentWidth() {
                
                return Math.round($('.main-content').width()/2);
            };
        });
    </script>

</asp:Content>

