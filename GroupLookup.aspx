<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="GroupLookup" 
Title="Lookup Groups" Codebehind="GroupLookup.aspx.cs" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" Runat="Server">
<link href="Content/group-lookup.css" type="text/css" media="screen, print" rel="stylesheet"  />
<script type="text/javascript" src="Scripts/vems/group-lookup.js"></script>

</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" Runat="Server">
<div class="clear">
   <Dea:WebText ID="GroupLookupTopHelp" runat="server" ParentType="none" PersonalizationKey="VemsShowHelpText" isHelpText="true" 
            EditPage="EditWebText.aspx" LookupKey="VemsGroupLookupOnPage" ></Dea:WebText>   
</div>
<div class="row" id="finisher"  role="region" aria-live="polite" aria-atomic="true" >
    <Dea:DeaGridView id="GroupsAlreadyHaveAccessTo" runat="server" EmptyDataText="<%$ Resources:ScreenText, YouCannontCurrentlyBookForAnyGroup %>"
    Caption="<%$ Resources:ScreenText, GroupsYouCanBookFor  %>" ParameterKeys="GroupTitlePlural" Width="98%" AutoGenerateColumns="false">
        <Columns>
            <asp:TemplateField HeaderText="<%$ Resources:ScreenText, ClickToRemove  %>">
            <ItemTemplate>
                <asp:ImageButton ID="removeGroup" runat="server" ImageUrl="images/btn-remove.png" ToolTip="<%$ Resources:ScreenText, ClickToRemove %>" AlternateText="<%$ Resources:ScreenText, ClickToRemove %>" OnClientClick='<%#  "return removeGroupFromUser(" + Eval("GroupID") + ")"%>' />
                </ItemTemplate>
            </asp:TemplateField>
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, GroupName  %>" HeaderTextParameterKeys="GroupTitleSingular" DataField="GroupName" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, GroupType %>" DataField="GroupType" HeaderTextParameterKeys="GroupTitleSingular" HtmlEncode="false" />
            <asp:BoundField HeaderText="<%$ Resources:ScreenText, City %>" DataField="GroupCity" HtmlEncode="false" />
        </Columns>
    </Dea:DeaGridView>
</div>


<div id="searchRow">
<Dea:TextBoxWithLabel ID="searchText" runat="server" Prompt="<%$ Resources:ScreenText, GroupNameContains %>" ParameterKeys="GroupTitleSingular" EmsDataId="searchText"  SuppressSubmitOnReturn="true" CssClass="float"  />
<asp:ImageButton ID="searchForGroup" runat="server" ImageUrl="images/btn-find.png" AlternateText="<%$ Resources:ScreenText, Search %>"  ToolTip="<%$ Resources:ScreenText, Search %>" OnClientClick="return loadGroups();" CssClass="alignToBox" />
</div>

<div id="availableGroupsContainer" role="region" aria-live="polite" aria-atomic="true">
 <Dea:DeaGridView id="AvailableGroups" runat="server"  AutoGenerateColumns="false" EmptyDataText="<%$ Resources:ScreenText, NoMatchingGroups%>"
   Width="98%" ParameterKeys="GroupTitlePlural">
        <Columns>
            <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Add %>">
        <ItemTemplate>
                <asp:ImageButton ID="addContact" runat="server" ImageUrl="images/btn-add.png" ToolTip="<%$ Resources:ScreenText, Select %>" AlternateText="<%$ Resources:ScreenText, Select %>" OnClientClick='<%#  "return addGroupToUser(event, this, " + Eval("ID") + ", \"" + HttpUtility.HtmlDecode(Eval("GroupName").ToString()).Replace("\"", "\\\"") + "\" )"%>' />
                </ItemTemplate>
            </asp:TemplateField>
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, GroupName  %>" DataField="GroupName" HtmlEncode="false" HeaderTextParameterKeys="GroupTitleSingular"  />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, GroupType  %>" DataField="GroupType"  HtmlEncode="false" HeaderTextParameterKeys="GroupTitleSingular" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, City  %>" DataField="City"  HtmlEncode="false" />
           </Columns>
          </Dea:DeaGridView>
</div>

<div class="row">
    <asp:Button ID="closeBtn" runat="server" Text="<%$Resources:ScreenText, Done%>" OnClientClick="return closeMe();" CssClass="closeBtn" />
</div>

</asp:Content>

