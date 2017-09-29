<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Title="<%$Resources:PageTitles, About %>" Inherits="About" CodeBehind="About.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>

<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="Server">
    <style>
        #about-table tr td:first-child {
            width: 300px;
        }
    </style>
</asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <h1>
        <asp:Literal ID="VirtualEmsVersion" runat="server" Text="<%$Resources:ScreenText, VirtualEmsVersion %>" />
        <asp:Label ID="OverallVersion" runat="server"></asp:Label>
    </h1>
    <table class="table table-striped" id="about-table">
        <thead>
            <tr>
                <th><%= Resources.ScreenText.Attribute %></th>
                <th><%= Resources.ScreenText.Value %></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><%= Resources.ScreenText.ConnectionSuccessful %></td>
                <td><asp:Label ID="ConnectionSuccess" runat="server"></asp:Label></td>
            </tr>
            <tr>
                <td><%= Resources.ScreenText.WebAppInterfaceVersion %></td>
                <td><asp:Label ID="VirtualSQLInterfaceLabel" runat="server"></asp:Label></td>
            </tr>
            <tr>
                <td><%= Resources.ScreenText.SqlPatchNumber %></td>
                <td><asp:Label ID="SQLPatchNumber" runat="server"></asp:Label></td>
            </tr>
            <tr>
                <td><%= Resources.ScreenText.ServerVersion %></td>
                <td><asp:Label ID="ServerVersion" runat="server"></asp:Label></td>
            </tr>
            <tr>
                <td><%= Resources.ScreenText.ClientVersion %></td>
                <td><asp:Label ID="ClientVersionLabel" runat="server"></asp:Label></td>
            </tr>
            <tr>
                <td><%= Resources.ScreenText.ClientSqlInterfaceVersion %></td>
                <td><asp:Label ID="ClientSQLInterfaceLabel" runat="server"></asp:Label></td>
            </tr>
            <tr>
                <td><%= Resources.ScreenText.RoomWizardSqlInterfaceVersion %></td>
                <td><asp:Label ID="RoomWizardSQLInterfaceLabel" runat="server"></asp:Label></td>
            </tr>
            <tr>
                <td><%= Resources.ScreenText.KioskSqlInterfaceVersion %></td>
                <td><asp:Label ID="KioskSQLInterfaceLabel" runat="server"></asp:Label></td>
            </tr>
            <tr>
                <td><%= Resources.ScreenText.MasterCalendarSqlInterfaceVersion %></td>
                <td><asp:Label ID="MasterCalendarSQLInterfaceLabel" runat="server"></asp:Label></td>
            </tr>
        </tbody>
    </table>
</asp:Content>

