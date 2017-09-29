<%@ Control Language="C#" AutoEventWireup="true" Inherits="ASExistingNotITemplate" Codebehind="ASExistingNotITemplate.ascx.cs" %>
<li class="serviceOrder">
    <h3 class="catMargin">
    <asp:ImageButton ID="AddNewItem" runat="server" ToolTip="<%$ Resources:ScreenText, NewItem %>" AlternateText="<%$ Resources:ScreenText, NewItem %>" ImageUrl="images/btn-add.png" /> 
    <asp:ImageButton ID="CancelSoImage" runat="server" ImageUrl="Images/btn-remove.png" AlternateText="<%$Resources:ScreenText, CancelSoAltTag %>" ToolTip="<%$Resources:ScreenText, CancelSoAltTag %>"  />
    <asp:literal ID="CategoryLabel" runat="server" Text='<%# Eval("Category") %>' />:
    </h3>
    <asp:Repeater ID="serviceOrderDetails" runat="server" OnItemDataBound="serviceOrderDetails_ItemDataBound">
        <ItemTemplate>
            <ul>
                <li class="serviceOrder">
                <div class="float" style="padding-right:1em;">
                <asp:ImageButton ID="EditImage" runat="server" ImageUrl="Images/btn-Edit.png"  AlternateText="<%$Resources:ScreenText, EditAltTag %>" ToolTip="<%$Resources:ScreenText, EditAltTag %>" />
                        <asp:ImageButton ID="CancelImage" runat="server" ImageUrl="Images/btn-remove.png"  AlternateText="<%$Resources:ScreenText, CancleSodAltTag %>" ToolTip="<%$Resources:ScreenText, CancleSodAltTag %>" />
                </div>
                <asp:Literal ID="Notes" runat="server" Text='<%# Eval("Notes") %>' />
                </li>
            </ul>
            
        </ItemTemplate>
    </asp:Repeater>
     
</li>