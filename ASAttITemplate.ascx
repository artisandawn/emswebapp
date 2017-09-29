<%@ Control Language="C#" AutoEventWireup="true" Inherits="ASAttITemplate" Codebehind="ASAttITemplate.ascx.cs" %>
<%@ Register TagPrefix="Dea" Namespace="Dea.Ems.Web.Sites.VirtualEms.Controls" Assembly="Dea.Ems.Web.Sites.VirtualEms.Controls" %>
<h3 class="catMargin">
    <asp:literal ID="CatLegend" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "CategoryDescription") %>' />
 </h3>
    <asp:Button ID="ApplyToOtherBookings" runat="server" Text="<%$Resources:ScreenText, AddToAdditionalBookings %>" OnClientClick="return addAttendeesToAdditionalBookings()"  />
    <div id="existingsAttendeesContainer">
    <dea:AttCatGrid id="ExistingAttendees" runat="server" EmptyDataText="<%$Resources:ScreenText, NoAttendees %>" AutoGenerateColumns="false"
        Caption="<%$Resources:ScreenText, ExistingAttendees %>" Width="98%" >
        <Columns>
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Name %>" DataField="ResourceDescription" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, CompanyName %>" DataField="CompanyName" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Email %>" DataField="EmailAddress" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Phone %>" DataField="Phone" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Notes %>" DataField="Notes" DataFormatString="{0:html}" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Visitor %>" DataField="ExternalAttendee" />
        </Columns>
    
    </dea:AttCatGrid>
    </div>
    
    
    <Dea:TextBoxWithLabel ID="AttendeeName" runat="server" EmsDataId="attendeeName" 
     CssClass="row" Prompt="<%$Resources:ScreenText, Name %>" MaxLength="50" SuppressSubmitOnReturn="true" />
     <Dea:TextBoxWithLabel ID="CompanyName" runat="server" EmsDataId="companyName" 
     CssClass="row" Prompt="<%$Resources:ScreenText, CompanyName %>" MaxLength="50" SuppressSubmitOnReturn="true" />
     <Dea:TextBoxWithLabel ID="Email" runat="server" EmsDataId="email" 
     CssClass="row" Prompt="<%$Resources:ScreenText, Email %>" MaxLength="255" SuppressSubmitOnReturn="true" />
     <Dea:TextBoxWithLabel ID="Phone" runat="server" EmsDataId="phone" 
     CssClass="row" Prompt="<%$Resources:ScreenText, Phone %>" MaxLength="50" SuppressSubmitOnReturn="true" />
     <Dea:TextBoxWithLabel ID="Notes" runat="server" EmsDataId="attendeeNotes" 
     CssClass="row" Prompt="<%$Resources:ScreenText, Notes %>" TextMode="MultiLine" BoxHeight="150" BoxWidth="350"  />
     <Dea:DeaCheckBox ID="IsVisitor" runat="server" Text="<%$Resources:ScreenText, Visitor %>" EmsDataId="isVisitor" />
 