<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" CodeBehind="Confirmation.aspx.cs" Inherits="Dea.Ems.Web.Sites.VirtualEms.Confirmation" %>

<%@ Import Namespace="Resources" %>

<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="server">
    <div id="confirmation-message">
        <%= ConfirmationHtml %>
    </div>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="bottomJSHolder" runat="server">
</asp:Content>
