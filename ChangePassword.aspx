<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="ChangePassword" Title="<%$Resources:PageTitles, PasswordAssistance %>" CodeBehind="ChangePassword.aspx.cs" %>

<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ Import Namespace="Dea.Ems.Web.Sites.VirtualEms" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>


<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="server">
</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <h2><%= PageHeader %></h2>
    <div class="form-group" style="width: 300px;">
        <label for="password_input" class="required"><%=ScreenText.NewPassword %></label>
        <input type="password" class="form-control" id="passwordInput" runat="server" ClientIDMode="Static" required name="password_input" autocomplete="off" style="width: 300px;">
    </div>
    <div class="form-group">
        <label for="password_verify" class="required"><%=ScreenText.VerifyNewPassword %></label>
        <input type="password" class="form-control" id="passwordVerify" runat="server" ClientIDMode="Static" required name="password_verify" autocomplete="off" style="width: 300px;">
    </div>
    <div class="form-group">
          <asp:Button ID="resetPasswordBtn" runat="server" Text="<%$ Resources:ScreenText, ResetPassword %>" OnClick="resetPasswordBtn_Click"  CssClass="btn btn-primary" />
    </div>

    <%= Scripts.Render("~/bundles/password-strength") %>
    <script type="text/javascript">
        $.validator.addMethod("matchingPasswords", function (value, element) {
            if (value != $('#passwordInput').val()) {
                return false;
            }

            return true;
        }, '<%= escapeQuotes(Messages.ThePasswordsDoNotMatch) %>');

        $('#VirtualEmsForm').validate();

        $("#passwordInput").rules("add", {
            required: true,
            messages: {
                required: '<%= escapeQuotes(Messages.PleaseTypeAStrongPassword) %>'
            }
        });

        $("#passwordVerify").rules("add", {
            required: true,
            matchingPasswords: true,
            messages: {
                required: '<%= escapeQuotes(Messages.PleaseVerifyYourPasswordByTypeingItAgain) %>'
            }
        });

        $('#passwordVerify').on('focusin', function () {
             $('#VirtualEmsForm').valid();
         });

         $(document).ready(function () {
             $('#passwordInput').passwordStrength({
                gaugeWidth: 200,
                passwordStrengthLabel: "<%=ScreenText.PasswordStrength %>",
                weakLabel: "<%=ScreenText.Weak %>",
                averageLabel: "<%=ScreenText.Average %>",
                strongLabel: "<%=ScreenText.Strong %>"
            });
        });
    </script>
</asp:Content>
