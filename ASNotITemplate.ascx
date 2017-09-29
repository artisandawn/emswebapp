<%@ Control Language="C#" AutoEventWireup="true" Inherits="ASNotITemplate" Codebehind="ASNotITemplate.ascx.cs" %>
<h3 class="catMargin">
<dea:HelpButton runat="server" id="CategoryHelp" CssClass="floatRight" LookupKey="VEMSCategoryGroupsHelp" ParentType="Category" ParentId='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "CategoryId") %>' />
     <asp:Literal ID="CatLegend" runat="server" text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "CategoryDescription") %>' />
 </h3>
    <Dea:DeaTextBox ID="NoteBox" runat="server" TextMode="MultiLine" CssClass="row" Width="400px"  />
  