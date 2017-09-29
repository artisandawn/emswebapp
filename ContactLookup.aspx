<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="ContactLookup"  Codebehind="ContactLookup.aspx.cs" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" Runat="Server">
<link href="Content/contact-lookup.css" type="text/css" media="screen, print" rel="stylesheet"  />
<script type="text/javascript" src="Scripts/vems/contact-lookup.js"></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" Runat="Server">
<div class="row" id="finisher" role="grid" aria-live="polite" aria-atomic="true">
    <Dea:DeaGridView id="CurrentContacts" runat="server" 
        EmptyDataText="<%$ Resources:ScreenText, NoContacts %>" AutoGenerateColumns="false"
    Caption="<%$ Resources:ScreenText, CurrentContacts  %>" 
        ParameterKeys="FirstContactTitle,GroupTitlePlural" Width="98%" 
        onrowdatabound="CurrentContacts_RowDataBound" >
        <Columns>
            <asp:TemplateField HeaderText="<%$ Resources:ScreenText, MakeDefault  %>">
            <ItemTemplate>
                <asp:ImageButton ID="setDefault" runat="server" ImageUrl="images/contact.gif" ToolTip="<%$ Resources:ScreenText, MakeDefault %>" AlternateText="<%$ Resources:ScreenText, MakeDefault %>" OnClientClick='<%#  "return setDefaultContact(" + Eval("ContactId") + ")"%>' />
                </ItemTemplate>
            </asp:TemplateField>
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Name  %>" DataField="ContactName"  HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, PhoneField1  %>" DataField="Phone"  HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, AltPhone  %>" DataField="Fax"  HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Email  %>" DataField="Email"  HtmlEncode="false" />
            <asp:TemplateField HeaderText="<%$ Resources:ScreenText, IsDefault  %>">
            <ItemTemplate>
                <Dea:Div ID="isDefault" runat="server" Text='<%# GetYesNo(Eval("IsDefault")) %>' />
                </ItemTemplate>
            </asp:TemplateField>
            <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Active  %>">
            <ItemTemplate>
                <asp:LinkButton ID="isActive" runat="server" Text='<%# GetYesNo(Eval("Active"), true) %>' OnClientClick='<%#  "return toggleContactActive(" + Eval("ContactId") + "," + GetOneOrZero(Eval("Active")) + ")"%>' />
                </ItemTemplate>
            </asp:TemplateField>
        </Columns>
    </Dea:DeaGridView>
</div>


<div id="searchRow">
<Dea:TextBoxWithLabel ID="searchText" runat="server" Prompt="<%$ Resources:ScreenText, GroupNameContains %>" ParameterKeys="GroupTitleSingular" EmsDataId="searchText"  SuppressSubmitOnReturn="true" CssClass="float"  />
<asp:ImageButton ID="searchForGroup" runat="server" ImageUrl="images/btn-find.png" AlternateText="<%$ Resources:ScreenText, Search %>" ToolTip="<%$ Resources:ScreenText, Search %>" OnClientClick="return loadGroups();" CssClass="alignToBox" />
</div>


<div id="availableGroupsContainer" role="grid" aria-live="polite" aria-atomic="true">
 <Dea:DeaGridView id="AvailableGroups" runat="server"  AutoGenerateColumns="false" EmptyDataText="<%$ Resources:ScreenText, NoMatchingGroups%>"
    Caption="<%$ Resources:ScreenText, Results  %>" Width="98%">
        <Columns>
            <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Add %>">
        <ItemTemplate>
                <asp:ImageButton ID="addContact" runat="server" ImageUrl="images/btn-add.png" ToolTip="<%$ Resources:ScreenText, Select %>" AlternateText="<%$ Resources:ScreenText, Select %>" OnClientClick='<%#  "return addContactToGroup(event, " + Eval("ID") + ")"%>' />
                </ItemTemplate>
            </asp:TemplateField>
  <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Name  %>" DataField="GroupName" HtmlEncode="false"  />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, PhoneField1  %>" DataField="Phone"  HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, AltPhone  %>" DataField="Fax"  HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Email  %>" DataField="Email"  HtmlEncode="false" />
           </Columns>
          </Dea:DeaGridView>
       
</div>

<div class="row">
    <asp:Button ID="closeBtn" runat="server" Text="<%$Resources:ScreenText, Done%>" OnClientClick="return closeMe();" CssClass="closeBtn" />
</div>
</asp:Content>

