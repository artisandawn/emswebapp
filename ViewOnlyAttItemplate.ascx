<%@ Control Language="C#" AutoEventWireup="true" Inherits="ViewOnlyAttItemplate" Codebehind="ViewOnlyAttItemplate.ascx.cs" %>
<%@ Register TagPrefix="Dea" Namespace="Dea.Ems.Web.Sites.VirtualEms.Controls" Assembly="Dea.Ems.Web.Sites.VirtualEms.Controls" %>
<li class="serviceOrder">
    <h3  style="margin-bottom:0;">
    <asp:literal ID="CategoryLabel" runat="server" Text='<%# Eval("Category") %>' /><br />
    </h3>
    <dea:AttCatGrid id="sodsGrid" runat="server" EmptyDataText="<%$Resources:ScreenText, NoAttendees %>" AutoGenerateColumns="false"
        Width="100%" GridLines="None" >
        <Columns>
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Name %>" DataField="ResourceDescription" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, CompanyName %>" DataField="CompanyName" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Email %>" DataField="EmailAddress" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Phone %>" DataField="Phone" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$Resources:ScreenText, Notes %>" DataField="Notes" HtmlEncode="false" />
                         <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Visitor %>" SortExpression="ExternalAttendee">
                     <itemtemplate>
                      <asp:literal runat="server"  Text='<%# BoolToYesNo(Eval("ExternalAttendee")) %>' ID="hsl" />
                          </itemtemplate>
                                    </asp:TemplateField>
        </Columns>
    
    </dea:AttCatGrid>
  </li>