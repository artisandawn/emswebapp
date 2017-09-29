<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" 
Inherits="EditWebText" Title="<%$Resources:PageTitles, EditWebText %>" Codebehind="EditWebText.aspx.cs" %>
<%@ Register Assembly="DevExpress.Web.ASPxHtmlEditor.v15.1, Version=15.1.8.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a"
    Namespace="DevExpress.Web.ASPxHtmlEditor" TagPrefix="dx" %>

<%@ Register assembly="DevExpress.Web.v15.1, Version=15.1.8.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" namespace="DevExpress.Web" tagprefix="dx" %>
<%@ Register assembly="DevExpress.Web.ASPxSpellChecker.v15.1, Version=15.1.8.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" namespace="DevExpress.Web.ASPxSpellChecker" tagprefix="dx" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" Runat="Server">
    <script type="text/javascript">
    $(document).ready(function () {
        jQuery("#mainDisplay").tabs();
        Dea.setTabs("mainDisplay");
    });
    </script>

    <style type="text/css">
        div.jHtmlArea { border: solid 1px #ccc; }
         #page td {padding-bottom: 0; padding-top:0;}
         table tr td 
         {
            padding:0;
            vertical-align:top;
        }
        .dxeButtonEdit td.dxic {padding:0 0 0 0}
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" Runat="Server">
  <div id="mainDisplay">
        <ul>
            <li><a href="#tab0"><asp:Literal ID="ResDetails" runat="server" Text="<%$ Resources:ScreenText, EditWebText %>" /></a></li>
        </ul>
        <div id="tab0">
<p >
    <asp:Literal ID="HelpTextKey" runat="server" />
</p>
<div class="row">
    <asp:label ID="CultureLabel" runat="server" Text="<%$Resources:ScreenText, Culture %>" CssClass="clear" />
    <asp:DropDownList ID="CultureSettings" runat="server" AutoPostBack="true" 
        onselectedindexchanged="CultureSettings_SelectedIndexChanged"  />
</div>
    <div class="row">
        <dx:ASPxHtmlEditor ID="Editor1" runat="server">
            <SettingsImageUpload UploadImageFolder="~/images" />
        </dx:ASPxHtmlEditor>
    </div>
<div class="row">
<asp:Button ID="SaveButton" runat="server" Text="<%$Resources:ScreenText, Save %>" 
        onclick="SaveButton_Click" />&nbsp;
 <asp:Button ID="BackToPage" runat="server" 
        Text="<%$Resources:ScreenText, BackToPage %>" onclick="BackToPage_Click" 
        />
</div>
</div>
</div>
</asp:Content>

