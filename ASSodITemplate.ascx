<%@ Control Language="C#" AutoEventWireup="true"
    Inherits="ASSodITemplate" Codebehind="ASSodITemplate.ascx.cs" %>
<%@ Register Src="Controls/UserDefinedQuestions.ascx" TagName="Udfs" TagPrefix="EMS" %>
<h3 class="catMargin">
    <dea:HelpButton runat="server" id="CategoryHelp" CssClass="floatRight" LookupKey="VEMSCategoryGroupsHelp" ParentType="Category" ParentId='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "CategoryId") %>' />
    <asp:Literal ID="CatLegend" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "CategoryDescription") %>' />
    <a class="tandc" data-id='tc-<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "CategoryId") %>'><asp:Literal ID="tc" runat="server" Text='<%$ Resources:ScreenText, TermsAndConditions %>' /></a>
    </h3>
       <Dea:TextBoxWithLabel ID="ServiceStartTime" runat="server" EmsDataId="ServiceStartTime" CssClass="float padRight" Prompt="<%$Resources:ScreenText, StartTime %>"  />
       <Dea:TextBoxWithLabel ID="ServiceEndTime" runat="server" EmsDataId="ServiceEndTime" CssClass="float padRight" Prompt="<%$Resources:ScreenText, EndTime %>"  />
       <Dea:DropDownWithLabel ID="CategoryServices" runat="server" EmsDataId="ServiceType" CssClass="float padRight pad-b-1" Prompt="<%$Resources:ScreenText, ServiceType %>" />
       <Dea:TextBoxWithLabel ID="EstimatedCount" runat="server" SuppressSubmitOnReturn="true" EmsDataId="EstimatedCount" NumericOnly="true" CssClass="float padLeft" Prompt="<%$Resources:ScreenText, EstimatedCount %>" MaxLength="6" />
    <asp:Panel CssClass="terms" ID="terms" runat="server" data-id='<%# "tc-" + DataBinder.Eval(((RepeaterItem)Container).DataItem, "CategoryId") %>'><asp:Literal ID="l2" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "TermsAndConditions") %>' /></asp:Panel>
    <asp:Repeater ID="cg" runat="server" OnItemDataBound="CategoryGroups_ItemDataBound">
        <ItemTemplate>
            <div class="row margin-t-1">
                <asp:ImageButton runat="server" ID="expandCollapseGroup" />
                <asp:Literal ID="CategoryGroup" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "GroupDescription") %>' />
            </div>
            <ul style="clear: left; padding-top: 0px; margin-top: 0px;" id="catGroupUL" runat="server">
                 <asp:Repeater ID="r" runat="server" OnItemDataBound="Resources_ItemDataBound">
                    <ItemTemplate>
                    <li style="list-style:none;">
                        <asp:CheckBox ID="resource" runat="server" />
                        <Dea:DeaTextBox ID="quantity" runat="server" Width="2em" FloatOnly="true"   MaxLength="6" SuppressSubmitOnReturn="true" />                        
                        
                        <asp:HyperLink ID="viewReseourceDetails" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "ResourceDescription") %>' data-tipId='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "ResourceId") %>' CssClass="noDiag" />
                        <asp:Label ID="serves" runat="server" CssClass="serves" Text='<%# GetResourcesServes(DataBinder.Eval(((RepeaterItem)Container).DataItem, "Serves"), DataBinder.Eval(((RepeaterItem)Container).DataItem, "MinQuantity")) %>' />
                        &nbsp;<asp:Label ID="resourcePrice" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "ResourcePrice") %>' />
                        <div id="RP" runat="server">
                            <asp:Repeater ID="RPR" runat="server" OnItemDataBound="rpr_ItemDataBound" >
                                <HeaderTemplate>
                                    <ul style="list-style: none; padding-bottom: 0px">
                                </HeaderTemplate>
                                <ItemTemplate>
                                    <li>
                                        <asp:Literal ID="rprItemQ" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "Quantity") %>' />&nbsp;
                                        <asp:Literal ID="rprItem" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "ResourceDescription") %>' />
                                            <asp:Repeater ID="rprRG" runat="server" OnItemDataBound="rprRG_ItemDataBound">
                                                <HeaderTemplate>
                                                    <ul style="list-style: none; padding-bottom: 0px">
                                                </HeaderTemplate>
                                                <ItemTemplate>
                                                    <li>
                                                        <asp:Literal ID="rgItem" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "Description") %>' />
                                                        (<asp:Literal ID="Literal1" runat="server" Text='<%# String.Format(System.Globalization.CultureInfo.CurrentCulture, Resources.ScreenText.MinMaxFormat, DataBinder.Eval(((RepeaterItem)Container).DataItem, "MinPick"), DataBinder.Eval(((RepeaterItem)Container).DataItem, "MaxPick")) %>' />)
                                                        <asp:Repeater ID="rprRI" runat="server" OnItemDataBound="rprRI_ItemDataBound">
                                                            <HeaderTemplate>
                                                                <ul style="list-style: none;">
                                                            </HeaderTemplate>
                                                            <ItemTemplate>
                                                                <li>
                                                                    <asp:CheckBox ID="resourceItem" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "Description") %>' />
                                                                    <asp:Literal ID="note" runat="server" Text='<%# String.Format(System.Globalization.CultureInfo.CurrentCulture, "{0} {1}", String.IsNullOrEmpty(DataBinder.Eval(((RepeaterItem)Container).DataItem, "Notes").ToString()) ? "" : "-", DataBinder.Eval(((RepeaterItem)Container).DataItem, "Notes")) %>' /></li>
                                                            </ItemTemplate>
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
                        </div>
                        <div runat="server" id="RGC" style="display: none">
                            <asp:Repeater ID="RG" runat="server" OnItemDataBound="RG_ItemDataBound">
                                <HeaderTemplate>
                                    <ul style="list-style: none; padding-bottom: 0px">
                                </HeaderTemplate>
                                <ItemTemplate>
                                    <li>
                                        <asp:Literal ID="rgItem" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "Description") %>' />
                                        (<asp:Literal ID="Literal1" runat="server" Text='<%# String.Format(System.Globalization.CultureInfo.CurrentCulture, Resources.ScreenText.MinMaxFormat, DataBinder.Eval(((RepeaterItem)Container).DataItem, "MinPick"), DataBinder.Eval(((RepeaterItem)Container).DataItem, "MaxPick")) %>' />)
                                        <asp:Repeater ID="RI" runat="server" OnItemDataBound="RI_ItemDataBound">
                                            <HeaderTemplate>
                                                <ul style="list-style: none;">
                                            </HeaderTemplate>
                                            <ItemTemplate>
                                                <li>
                                                    <asp:CheckBox ID="resourceItem" runat="server" Text='<%# DataBinder.Eval(((RepeaterItem)Container).DataItem, "Description") %>' />
                                                    <asp:Literal ID="note" runat="server" Text='<%# String.Format(System.Globalization.CultureInfo.CurrentCulture, "{0} {1}", String.IsNullOrEmpty(DataBinder.Eval(((RepeaterItem)Container).DataItem, "Notes").ToString()) ? "" : "-", DataBinder.Eval(((RepeaterItem)Container).DataItem, "Notes")) %>' /></li>
                                            </ItemTemplate>
                                            <FooterTemplate>
                                                </ul></FooterTemplate>
                                        </asp:Repeater>
                                    </li>
                                </ItemTemplate>
                                <FooterTemplate>
                                    </ul></FooterTemplate>
                            </asp:Repeater>
                        </div>
                        <div class="row siIndent" runat="server" id="SIContainer" style="display:none">
                        <Dea:TextBoxWithLabel ID="SpecialInstructions" runat="server" Width="25em" BoxWidth="400" TextMode="MultiLine" Prompt="<%$ Resources:ScreenText, SpecialInstructions %>" />                        
                        </div>
                    </li>
                    </ItemTemplate>
                    
                </asp:Repeater>
            </ul>
        </ItemTemplate>
    </asp:Repeater>
    <EMS:Udfs ID="SodUdfs" runat="server" />

