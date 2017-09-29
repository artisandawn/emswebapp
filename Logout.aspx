<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="Logout" Title="<%$Resources:PageTitles, Logout %>" Codebehind="Logout.aspx.cs" %>

<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="Server">
</asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <div id="logout" style="height: 100%;">
        <Dea:WebText ID="HomeHelp" runat="server" ParentType="none" PersonalizationKey="VemsShowHelpText" IsHelpText="true"
            EditPage="EditWebText.aspx" LookupKey="VemsLogoutPageMainContent"></Dea:WebText>
    </div>
</asp:Content>

