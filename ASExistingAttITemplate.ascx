<%@ Control Language="C#" AutoEventWireup="true" Inherits="ASExistingAttITemplate" Codebehind="ASExistingAttITemplate.ascx.cs" %>
<%@ Register TagPrefix="Dea" Namespace="Dea.Ems.Web.Sites.VirtualEms.Controls" Assembly="Dea.Ems.Web.Sites.VirtualEms.Controls" %>
<li class="serviceOrder">
<h3>
   <asp:ImageButton ID="AddNewItem" runat="server" ToolTip="<%$ Resources:ScreenText, NewItem %>" AlternateText="<%$ Resources:ScreenText, NewItem %>" ImageUrl="images/btn-add.png" /> 
   <asp:ImageButton ID="CancelSoImage" runat="server" ImageUrl="Images/btn-remove.png" AlternateText="<%$Resources:ScreenText, CancelSoAltTag %>" ToolTip="<%$ Resources:ScreenText, CancelSoAltTag %>" />
   <asp:literal ID="CategoryLabel" runat="server" Text='<%# Eval("Category") %>' />
</h3>
   <dea:AttCatGrid id="sodsGrid" runat="server" EmptyDataText="<%$Resources:ScreenText, NoAttendees %>" AutoGenerateColumns="false"
        Width="100%" GridLines="None" >
        <Columns>
         <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Actions %>" HeaderStyle-Width="5%">
                    <ItemTemplate>
                        <asp:ImageButton ID="EditImage" runat="server" ImageUrl="Images/btn-Edit.png"  AlternateText="<%$Resources:ScreenText, EditAltTag %>" ToolTip="<%$ Resources:ScreenText, EditAltTag %>" />
                        <asp:ImageButton ID="CancelImage" runat="server" ImageUrl="Images/btn-remove.png"  AlternateText="<%$Resources:ScreenText, CancleSodAltTag %>" ToolTip="<%$ Resources:ScreenText, CancleSodAltTag %>" />
                    </ItemTemplate>
                </asp:TemplateField>
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Name %>" DataField="ResourceDescription" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, CompanyName %>" DataField="CompanyName" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Email %>" DataField="EmailAddress" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Phone %>" DataField="Phone" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Notes %>" DataField="Notes" HtmlEncode="false" DataFormatString="{0:html}" />
              <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Visitor %>" SortExpression="ExternalAttendee">
                     <itemtemplate>
                      <asp:literal runat="server"  Text='<%# BoolToYesNo(Eval("ExternalAttendee")) %>' ID="hsl" />
                          </itemtemplate>
                                    </asp:TemplateField>
        </Columns>
    
    </dea:AttCatGrid>
 </li>