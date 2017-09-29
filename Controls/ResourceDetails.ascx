<%@ Control Language="C#" AutoEventWireup="true"
    Inherits="Controls_ResourceDetails" Codebehind="ResourceDetails.ascx.cs" %>
<asp:DetailsView ID="Details" runat="server" AutoGenerateRows="false" GridLines="None" >
    <HeaderTemplate>
        <span id="dialogTitle" class="hide"><asp:Literal ID="ResourceName" runat="server" Text='<%# Eval("ResourceDescription") %>' /></span>
    </HeaderTemplate>
    <Fields>
        <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, CategoryLabel %>" DataField="Category" HtmlEncode="false"
            HeaderStyle-CssClass="bold" HeaderStyle-Width="150" />
        <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, CategoryGroupLabel %>" HtmlEncode="false" 
            DataField="CategoryGroup" HeaderStyle-CssClass="bold" />
        <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, MaxInventoryOfItem %>" DataField="Quantity"
            HeaderStyle-CssClass="bold" />
        <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Serves %>" DataField="Serves" DataFormatString="{0:.##}"
            HeaderStyle-CssClass="bold" />
        <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, MinimumQty %>" DataField="MinQuantity" DataFormatString="{0:.##}"
            HeaderStyle-CssClass="bold" />
        <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Price %>" DataField="Price"
            HeaderStyle-CssClass="bold" />
        <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Notes %>" DataField="Notes" HtmlEncode="false"
            HeaderStyle-CssClass="bold" ItemStyle-Width="300px" DataFormatString="{0:html}" />
    </Fields>
</asp:DetailsView>
<Dea:ThumbnailViewer ID="RoomImages" runat="server" CellPadding="5" />
