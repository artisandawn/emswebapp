<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true"
    Inherits="AdminFunctions" Title="<%$Resources:PageTitles, AdminFunctions %>" CodeBehind="AdminFunctions.aspx.cs" %>

<%@ Import Namespace="Resources" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" runat="Server">
    <style>
        .connection-row {
            padding: 5px 0 15px 0;
        }

        .admin-btn {
            padding-top: 30px;
            padding-bottom: 10px;
        }

        .file-count {
            padding-left: 100px;
        }

        .license-row {
            padding: 30px 0 30px 0;
        }

        #license-table tr td:first-child {
            min-width: 200px;
        }
        .tab-link{
                color: #21467E !important;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <asp:HiddenField ID="HasLDAP" runat="server" />
    <asp:HiddenField ID="HasPAM" runat="server" />
    <h1>
        <asp:Literal ID="VirtualEmsVersion" runat="server" Text="<%$Resources:ScreenText, VirtualEmsVersion %>" />
        <asp:Literal ID="NumericVersionNumber" runat="server" />
    </h1>
    <div class="row connection-row">
        <div class="col-sm-3">
            <span><%=ScreenText.ConnectionSuccessful %></span>:
            <asp:Label ID="ConnectionSuccess" runat="server"></asp:Label>
        </div>
        <div class="col-sm-9">
            <span id="DbConnectionStringLabel" runat="server"><%=ScreenText.ConnectionString %></span>:
            <asp:Label ID="DbConnectionString" runat="server"></asp:Label>
        </div>
    </div>
    <div id="main-tabs-container">
        <ul id="main-tabs" class="nav nav-tabs hidden-xs" role="tablist">
            <li role="presentation" class="active" data-type="admin-functions"><a href="#admin-functions" aria-controls="admin-functions" role="tab" data-toggle="tab"><%= ScreenText.AdminFunctions %></a></li>
            <li role="presentation" data-type="error-logs"><a href="#error-logs" aria-controls="error-logs" role="tab" data-toggle="tab"><%= ScreenText.ErrorLogs %></a></li>
            <li role="presentation" data-type="license-information"><a href="#license-information" aria-controls="license-information" role="tab" data-toggle="tab"><%= ScreenText.LicenseInformation %></a></li>
            <li role="presentation" data-type="rest" id="rest-tab-header"><a class="tab-link" href="RestAdmin.aspx" aria-controls="rest"><%= ScreenText.RestAdmin %></a></li>
            <li role="presentation" data-type="ldap" id="ldap-tab-header" style="display: none;"><a class="tab-link" href="LdapConfiguration.aspx" aria-controls="ldap"><%= ScreenText.LDAPConfiguration %></a></li>
            <li role="presentation" data-type="pam" id="pam-tab-header" style="display: none;"><a class="tab-link" href="<%= PamUrl %>" aria-controls="pam"><%= ScreenText.IntegrationToExchange %></a></li>
        </ul>
    </div>
    <div class="tab-content">
        <div role="tabpanel" class="tab-pane active" id="admin-functions">
            <div class="row">
                <div class="col-sm-12 admin-btn">
                    <button type="button" id="ClearCache" class="btn btn-primary"><%= ScreenText.ClearCache %></button>
                </div>
                <div class="col-sm-12">
                    <asp:Label ID="ClearCacheHelp" runat="server" Text="<%$Resources:ScreenText, ClearCacheHelp %>" />
                </div>
                <div class="col-sm-12 admin-btn">
                    <asp:Button ID="EnableHelpText" runat="server" Text="<%$Resources:ScreenText, EnableHelpText %>" OnClick="EnableHelpText_Click" CssClass="btn btn-primary" />
                </div>
                <div class="col-sm-12">
                    <asp:Label ID="EnableHelpTextEditModeHelp" runat="server" Text="<%$Resources:ScreenText, EnableHelpTextEditModeHelp %>" />
                </div>
                <div class="col-sm-12 admin-btn">
                    <asp:Button ID="EnableDetailedError" runat="server" OnClick="EnableDetailedError_Click" CssClass="btn btn-primary" />
                </div>
                <div class="col-sm-12">
                    <asp:Label ID="EnableDetailedErrorHelp" runat="server" Text="<%$Resources:ScreenText, EnableDetailedErrorHelp %>" />
                </div>
                <div class="col-sm-12 admin-btn">
                    <asp:Button ID="DisableCustomJavascript" runat="server" Text="<%$Resources:ScreenText, DisableCustomJs %>" OnClick="DisableCustomJs_Click" CssClass="btn btn-primary" />
                </div>
                <div class="col-sm-12">
                    <asp:Label ID="DisableCustomJsHelp" runat="server" Text="<%$Resources:ScreenText, DisableCustomJavascriptHelp %>" />
                </div>
            </div>
        </div>
        <div role="tabpanel" class="tab-pane" id="error-logs">
            <table class="table table-striped" style="margin-top: 30px;">
                <tbody id="ErrorLogHolder" runat="server"></tbody>
            </table>
        </div>
        <div role="tabpanel" class="tab-pane" id="license-information">
            <div class="row license-row">
                <div class="col-sm-2">
                    <asp:Button CssClass="btn btn-primary" ID="readLicense" runat="server" Text="<%$Resources:ScreenText, ReadLicense %>" OnClick="readLicense_Click" />
                    <asp:HiddenField ID="IsLicensePostBack" runat="server" />
                </div>
                <div class="col-sm-10" style="color: green; line-height: 2.5em;">
                    <asp:Label ID="LicenseMessage" Visible="false" runat="server">&nbsp;</asp:Label>
                </div>
            </div>
            <table class="table table-striped" id="license-table">
                <tr>
                    <td><%=ScreenText.ApplicationVersion %></td>
                    <td><asp:Label ID="AppVersion" runat="server"></asp:Label></td>
                </tr>
                <tr>
                    <td><%=ScreenText.LicensedFor %></td>
                    <td><asp:Label ID="ProductCodes" runat="server"></asp:Label></td>
                </tr>
                <tr>
                    <td><%=ScreenText.ExpirationDate %></td>
                    <td><asp:Label ID="ExpirationDate" runat="server"></asp:Label></td>
                </tr>
                <tr>
                    <td><%=ScreenText.AllowedWebUsers %></td>
                    <td><asp:Label ID="AllowedNumberOfUsers" runat="server"></asp:Label></td>
                </tr>
                <tr>
                    <td><%=ScreenText.CurrentActiveUsers %></td>
                    <td><asp:Label ID="ActualUsers" runat="server"></asp:Label></td>
                </tr>
            </table>
        </div>
        <div role="tabpanel" class="tab-pane" id="ldap">
        </div>
        <div role="tabpanel" class="tab-pane" id="pam">
        </div>
    </div>

    <script type="text/javascript">
        if (DevExpress.devices.real().phone) {
            window.location.replace('<%= MobileRedirectUrl %>');
        }

        $(document).ready(function () {
            var hasLdap = $('[id*="HasLDAP"]').val();
            var hasPAM = $('[id*="HasPAM"]').val();

            if (hasLdap) {
                $('#ldap-tab-header').show();
            }
            if (hasPAM) {
                $('#pam-tab-header').show();
            }

            if (typeof (postMessage) == 'string' && postMessage.length > 0) {
                vems.showToasterMessage('', postMessage, 'info', 2000);
            }

            $('#pc_ErrorLogHolder a').click(function (e) {
                e.preventDefault();  // prevent navigation to error log url, as direct access is restricted
                var fileName = $(this).text();
                vems.ajaxPost({
                    url: vems.serverApiUrl() + '/ReadLogFile',
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

        $('#ClearCache').on('click', function () {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/ClearCache',
                data: JSON.stringify({ }),
                success: function (result) {
                    var response = JSON.parse(result.d);
                    if (response.Success) {
                        vems.showToasterMessage('', response.SuccessMessage, 'info', 2000);
                    } else {
                        vems.showToasterMessage('', response.ErrorMessage, 'danger', 2000);
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        });
    </script>
</asp:Content>

