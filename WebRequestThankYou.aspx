<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true"
 Inherits="WebRequestThankYou" Title="<%$Resources:PageTitles, WebRequestThankYou %>" Codebehind="WebRequestThankYou.aspx.cs" %>
 <%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" Runat="Server">
    <style type="text/css">
        .thankyou-page-help-text-content {
            padding-right: 30px;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" Runat="Server">
    <h1><%= Resources.ScreenText.RequestCreated %></h1>
    <div id="thankYou">
        <Dea:WebText ID="ThankYouHelp" runat="server" ParentType="none" PersonalizationKey="VemsShowHelpText" 
            isHelpText="true" EditPage="EditWebText.aspx" LookupKey="VemsWebRequestThankYou" CssClass="thankyou-page-help-text-content"></Dea:WebText>
    </div>
     <div id="edit-reservation-row">
                <a id="edit-this-reservation-action" href="default.aspx"><i class="fa fa-chevron-right" style="padding-right: 10px;"></i><%= Resources.ScreenText.ReturnToTheHomePage %></a>
            </div>
</asp:Content>

