<%@ Control Language="C#" AutoEventWireup="true" Inherits="ASExistingSodITemplate" Codebehind="ASExistingSodITemplate.ascx.cs" %>
<%@ Register TagPrefix="Dea" Namespace="Dea.Ems.Web.Sites.VirtualEms.Controls" Assembly="Dea.Ems.Web.Sites.VirtualEms.Controls" %>
<li class="serviceOrder">
<h3 class="catMargin">
        <span class="floatRight additionalInfo">
            <asp:HyperLink ID="AdditionalInfo" runat="server" text="<%$ Resources:ScreenText, AdditionalInfo %>" CssClass="smallLink"/> 
        </span>
        <asp:ImageButton ID="AddNewItem" runat="server" ToolTip="<%$ Resources:ScreenText, NewItem %>" AlternateText="<%$ Resources:ScreenText, NewItem %>" ImageUrl="images/btn-add.png" /> 
        <asp:ImageButton ID="EditSoImage" runat="server" ImageUrl="Images/btn-Edit.png" AlternateText="<%$Resources:ScreenText, EditAltTag %>" ToolTip="<%$Resources:ScreenText, EditAltTag %>"  />
        <asp:ImageButton ID="CancelSoImage" runat="server" ImageUrl="Images/btn-remove.png" AlternateText="<%$Resources:ScreenText, CancelSoAltTag %>" ToolTip="<%$Resources:ScreenText, CancelSoAltTag %>" />
        <asp:literal ID="CategoryLabel" runat="server" Text='<%# Eval("Category") %>' />
        <asp:literal ID="TimeStart" runat="server" Text='<%# Dea.Core.Utilities.GetDate(Eval("TimeStart")).ToShortTimeString() %>'  />
        <asp:literal ID="Dash" runat="server" Text="&nbsp;-&nbsp;" />
        <asp:literal ID="TimeEnd" runat="server" Text='<%# Dea.Core.Utilities.GetDate(Eval("TimeEnd")).ToShortTimeString() %>'  />
        <asp:literal ID="ServiceType" runat="server" Text='<%# Eval("ServiceType") %>'  />    
        <asp:literal ID="ForLabel" runat="server" Text="<%$ Resources:ScreenText, EstimatedCountFor %>"  />
        <asp:literal ID="EstimatedCount" runat="server" Text='<%# Eval("EstimatedCount") %>'  /> 
         </h3>
        <Dea:ExistingServicesGrid ID="sodsGrid" runat="server" Width="100%" ResourceDetailsQueryStringConstant="ResourceId"
            AllowSorting="false" AutoGenerateColumns="false" GridLines="None"  >
            <Columns>
                <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Actions %>" >
                    <ItemTemplate>
                        <asp:ImageButton ID="EditImage" runat="server" ImageUrl="Images/btn-Edit.png"  AlternateText="<%$Resources:ScreenText, EditAltTag %>" ToolTip="<%$Resources:ScreenText, EditAltTag %>" />
                        <asp:ImageButton ID="CancelImage" runat="server" ImageUrl="Images/btn-remove.png"  AlternateText="<%$Resources:ScreenText, CancleSodAltTag %>" ToolTip="<%$Resources:ScreenText, CancleSodAltTag %>" />
                    </ItemTemplate>
                </asp:TemplateField>
                <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, QuantityAbbr %>" DataField="Quantity" />
                <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Item %>" >
                    <ItemTemplate>
                        <div class="itemMinWidth">
                        <asp:HyperLink Text='<%# Eval("ResourceDescription") %>' ID="ResourceLink" runat="server" data-tipId='<%# Eval("ResourceId") %>' />
                        <asp:Repeater ID="rp" runat="server" OnItemDataBound="rp_ItemDataBound">
                            <HeaderTemplate>
                                    <ul style="list-style: none; padding-bottom: 0px;margin-left:1em;" >
                                </HeaderTemplate>
                                <ItemTemplate>
                                    <li>
                                        <asp:Literal ID="rprItemQ" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "Quantity") %>' />&nbsp;
                                        <asp:LinkButton ID="rprItemLink" runat="server" CssClass="noDiag" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "ResourceDescription") %>' />
                                        <asp:Literal ID="rprItemLabel" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "ResourceDescription") %>' />
                                        <asp:Repeater ID="rprItems" runat="server" OnItemDataBound="rg_ItemDataBound">
                                            <HeaderTemplate>
                                                <ul style="list-style: none; padding-top: 0; padding-bottom: 0; padding-left: 1em">
                                            </HeaderTemplate>
                                            <ItemTemplate>
                                                <li>
                                                    <span class="itemGrouping"><asp:Literal ID="rgDesc" runat="server" Text='<%# Eval("Description") %>' /></span>
                                                    <asp:Repeater ID="ri" runat="server">
                                                        <HeaderTemplate>
                                                            <ul style="list-style: none; padding-top: 0; padding-bottom: 0;padding-left:1em;">
                                                        </HeaderTemplate>
                                                        <ItemTemplate>
                                                            <li>
                                                                <asp:Literal ID="riDesc" runat="server" Text='<%# Eval("Description") %>' /></li></ItemTemplate>
                                                        <FooterTemplate>
                                                            </ul></FooterTemplate>
                                                    </asp:Repeater>
                                                </li>
                                            </ItemTemplate>
                                            <FooterTemplate>
                                                </ul></FooterTemplate>
                                        </asp:Repeater>
                                    </li>
                                </ItemTemplate>
                                <FooterTemplate>
                                </ul>
                                </FooterTemplate>
                          </asp:Repeater>
                        <asp:Repeater ID="rg" runat="server" OnItemDataBound="rg_ItemDataBound">
                            <HeaderTemplate>
                                <ul style="list-style: none; padding-top: 0; padding-bottom: 0; padding-left: 1em">
                            </HeaderTemplate>
                            <ItemTemplate>
                                <li>
                                    <span class="itemGrouping"><asp:Literal ID="rgDesc" runat="server" Text='<%# Eval("Description") %>' /></span>
                                    <asp:Repeater ID="ri" runat="server">
                                        <HeaderTemplate>
                                            <ul style="list-style: none; padding-top: 0; padding-bottom: 0;padding-left:1em;">
                                        </HeaderTemplate>
                                        <ItemTemplate>
                                            <li>
                                                <asp:Literal ID="riDesc" runat="server" Text='<%# Eval("Description") %>' /></li></ItemTemplate>
                                        <FooterTemplate>
                                            </ul></FooterTemplate>
                                    </asp:Repeater>
                                </li>
                            </ItemTemplate>
                            <FooterTemplate>
                                </ul></FooterTemplate>
                        </asp:Repeater>
                        </div>
                    </ItemTemplate>
                </asp:TemplateField>
                <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Price %>" DataField="ResourcePrice" HtmlEncode="false"/>
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