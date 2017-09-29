<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" 
Inherits="ResourceDetails" Title="<%$Resources:PageTitles, ResourceDetails %>" Codebehind="ResourceDetails.aspx.cs" %>
<%@ Register Src="Controls/ResourceDetails.ascx" TagName="ResourceTip" TagPrefix="EMS" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="HeadContent" runat="server" ContentPlaceHolderID="headContentHolder">
    <script type="text/javascript">
        $(document).ready(function () {
            Dea.setPopup();
            $("#page").css("padding-top", "1em");
        });
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" Runat="Server">
<ems:ResourceTip id="ResourceDetail" runat="server" />
</asp:Content>

