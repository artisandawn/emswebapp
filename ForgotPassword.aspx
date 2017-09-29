<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="ForgotPassword" Title="<%$Resources:PageTitles, PasswordAssistance %>" CodeBehind="ForgotPassword.aspx.cs" %>

<%@ Import Namespace="Resources" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ Import Namespace="Dea.Ems.Web.Sites.VirtualEms" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Register Assembly="DevExpress.Web.v15.1, Version=15.1.8.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a"
    Namespace="DevExpress.Web" TagPrefix="dx" %>

<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="server">
</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <h2><%= ScreenText.ForgotYourPassword %></h2>
    <p><%= Messages.ForgotPasswordTitleMessage %></p>
    <div class="form-group">
        <label for="email"><%= ScreenText.EmailAddress %></label>
        <input type="email" class="form-control" id="inputEmail" runat="server" ClientIDMode="Static" required style="width: 300px;" autocomplete="off">
    </div>
    <div class="form-group">
        <dx:ASPxCaptcha ID="CaptchaCtl" runat="server" ClientInstanceName="captchaCtl" TextBox-Position="Bottom" RefreshButton-Position="Right">
            <ValidationSettings EnableValidation="true" SetFocusOnError="true"></ValidationSettings>
            <ChallengeImage FontFamily="Open Sans"></ChallengeImage>
            <TextBoxStyle Width="300" CssClass="form-control" Border-BorderColor="#a94442" Border-BorderWidth="1" />
        </dx:ASPxCaptcha>
    </div>
    <div class="form-group">
         <asp:Button ID="btnContinue" runat="server" Text="<%$ Resources:ScreenText, Continue %>" OnClick="btnContinue_Click"  CssClass="btn btn-primary" />
    </div>
    <script type="text/javascript">
        $('#VirtualEmsForm').validate();

        $("#inputEmail").rules("add", {
            required: true,
            email: true,
            messages: {
                required: '<%= escapeQuotes(Messages.PleaseTypeAValidEmailAddress) %>',
                email: '<%= escapeQuotes(Messages.PleaseTypeAValidEmailAddress) %>'
            }
        });
    </script>
</asp:Content>
