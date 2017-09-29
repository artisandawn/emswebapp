<%@ Control Language="C#" AutoEventWireup="true" Inherits="ViewOnlySodITemplate" Codebehind="ViewOnlySodITemplate.ascx.cs" %>
<%@ Register TagPrefix="Dea" Namespace="Dea.Ems.Web.Sites.VirtualEms.Controls" Assembly="Dea.Ems.Web.Sites.VirtualEms.Controls" %>
<li class="serviceOrder">
    <h3 style="margin-bottom:0;">
        <span class="floatRight additionalInfo">
            <asp:HyperLink ID="AdditionalInfo" runat="server" text="<%$ Resources:ScreenText, AdditionalInfo %>" CssClass="smallLink"/> 
        </span>
        <asp:literal ID="CategoryLabel" runat="server" Text='<%# Eval("Category") %>' />
        
        <asp:literal ID="TimeStart" runat="server" Text='<%# Dea.Core.Utilities.GetDate(Eval("TimeStart")).ToShortTimeString() %>'  />
        <asp:literal ID="Dash" runat="server" Text="&nbsp;-&nbsp;" />
        <asp:literal ID="TimeEnd" runat="server" Text='<%# Dea.Core.Utilities.GetDate(Eval("TimeEnd")).ToShortTimeString() %>'  />
        <asp:literal ID="ServiceType" runat="server" Text='<%# Eval("ServiceType") %>'  />    
        <asp:literal ID="ForLabel" runat="server" Text="<%$ Resources:ScreenText, EstimatedCountFor %>"  />
        <asp:literal ID="EstimatedCount" runat="server" Text='<%# Eval("EstimatedCount") %>'  />    

   </h3>
        <Dea:ExistingServicesGrid ID="sodsGrid" runat="server" Width="100%" ResourceDetailsQueryStringConstant="ResourceId"
            AllowSorting="false" AutoGenerateColumns="false" GridLines="None" >
            <Columns>
                <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Quantity %>" DataField="Quantity" />
                <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Item %>"  >
                    <ItemTemplate>
                        <div  class="itemMinWidth">
                        <asp:HyperLink Text='<%# Eval("ResourceDescription") %>' ID="ResourceLink" runat="server" data-tipId='<%# Eval("ResourceId") %>' />
                        <asp:Repeater ID="rg" runat="server" OnItemDataBound="rg_ItemDataBound">
                            <HeaderTemplate><ul style="list-style: none; padding-top: 0; padding-bottom: 0; padding-left: 1em;"></HeaderTemplate>
                            <ItemTemplate><li><span class="itemGrouping"><asp:Literal ID="rgDesc" runat="server" Text='<%# Eval("Description") %>' /></span>
                                <asp:Repeater ID="ri" runat="server">
                                    <HeaderTemplate>
                                        <ul style="list-style: none; padding-top: 0; padding-bottom: 0; padding-left: 1em;">
                                    </HeaderTemplate>        
                                    <ItemTemplate>
                                        <li>
                                            <asp:Literal ID="riDesc" runat="server" Text='<%# Eval("Description") %>' /></li></ItemTemplate>
                                    <FooterTemplate>
                                        </ul></FooterTemplate>
                                </asp:Repeater>
                            </li></ItemTemplate>
                            <FooterTemplate></ul></FooterTemplate>
                        </asp:Repeater>
                        </div>
                    </ItemTemplate>
                </asp:TemplateField>
                <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Price %>" DataField="ResourcePrice" HtmlEncode="false"  />
                <asp:TemplateField ItemStyle-Width="30%" HeaderText="<%$ Resources:ScreenText, Notes %>">
                    <ItemTemplate>
                        <asp:Literal ID="Notes" runat="server" Text='<%# GetNSI(Eval("Quantity"), Eval("Notes")) %>' />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField ItemStyle-Width="30%" HeaderText="<%$ Resources:ScreenText, SpecialInstructions %>">
                    <ItemTemplate>
                        <asp:Literal ID="SpecialInstructions" runat="server" Text='<%# GetNSI(Eval("Quantity"), Eval("SpecialInstructions")) %>' />
                    </ItemTemplate>
                </asp:TemplateField>
            </Columns>
        </Dea:ExistingServicesGrid>
        </li>