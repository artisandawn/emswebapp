<%@ Control Language="C#" AutoEventWireup="true" Inherits="ViewOnlyNotITemplate" Codebehind="ViewOnlyNotITemplate.ascx.cs" %>
<li class="serviceOrder">
    <h3  style="margin-bottom:0;">
        <asp:literal ID="CategoryLabel" runat="server" Text='<%# Eval("Category") %>' /><br />
    </h3>
    <asp:Repeater ID="serviceOrderDetails" runat="server">
        <ItemTemplate>
            <ul>
                <li class="serviceOrder">
                <asp:Literal ID="Notes" runat="server" Text='<%# Eval("Notes") %>' />
                </li>
            </ul>
            
        </ItemTemplate>
    </asp:Repeater>
     
</li>