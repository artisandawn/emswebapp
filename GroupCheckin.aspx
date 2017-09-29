<%@ Page Title="" Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="GroupCheckin" Codebehind="GroupCheckin.aspx.cs" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Register TagPrefix="Dea" Namespace="Dea.Ems.Web.Sites.VirtualEms.Controls" Assembly="Dea.Ems.Web.Sites.VirtualEms.Controls" %>  

<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" Runat="Server">
    <link href="Content/LocateGroup.css" type="text/css" rel="Stylesheet" />
    <script type="text/javascript" src="Scripts/swfobject.js"></script>
    <script type="text/javascript" src="Scripts/vems/group-checkin.js"></script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="pc" Runat="Server">
<div id="groupCheckin">
    <ul>
        <li><a href="#tab0"><asp:Literal ID="dailylist" runat="server" Text="<%$ Resources:ScreenText, Locate %>" /></a></li>
    </ul>
    <div id="tab0">
       <div class="float groupStatus" id="groupStatus" runat="server" role="region" aria-live="polite" aria-atomic="true"></div>

    <div id="resultsContainer" class="row" role="region" aria-live="polite" aria-atomic="true">
       <Dea:LocateGroupBookinsGrid ID="BookingsGrid" runat="server" Width="100%" AutoGenerateColumns="False"
            EnableViewState="true" AllowSorting="False" Summary="<%$ Resources:ScreenText, BookingsSummary %>"
            SuppressOnclick="true" GridLines="None" CheckinText="<%$ Resources:ScreenText, CheckIn %>"
            CheckoutText="<%$ Resources:ScreenText, Checkout %>" EmptyDataText="<%$ Resources:ScreenText, WebUserNotTiedToGroup %>" ParameterKeys="GroupTitleSingular" >
            <Columns>
                <asp:BoundField HeaderText="<%$ Resources:ScreenText, Time %>" DataField="EventTime" />
                <asp:BoundField HeaderText="<%$ Resources:ScreenText, Title %>" DataField="EventName"
                    HtmlEncode="false" />
                <asp:BoundField HeaderText="<%$ Resources:ScreenText, Location %>" DataField="LocationDisplay" HtmlEncode="false" />
                <asp:TemplateField HeaderText="<%$ Resources:ScreenText, ViewOnMap %>">
                    <ItemTemplate>
                        <asp:ImageButton ID="ViewMap" runat="server" ImageUrl="images/btn-ShowFloorMap.png" AlternateText="<%$ Resources:ScreenText, ViewOnMap %>"
                            ToolTip="<%$ Resources:ScreenText, ViewOnMap %>" />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources:ScreenText, CheckinCheckout %>">
                    <ItemTemplate>
                        <asp:ImageButton ID="checkinButton" runat="server" ImageUrl="images/btn-CheckIn.png" />
                    </ItemTemplate>
                </asp:TemplateField>
            </Columns>
        </Dea:LocateGroupBookinsGrid>
    </div>
    <div style="position:relative">
        <div id="flashContent" role="region" aria-live="polite" aria-atomic="true">
        </div>
    </div>
    </div>
</div>
</asp:Content>

