<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" 
Inherits="BillingReferenceLookup"  Codebehind="BillingReferenceLookup.aspx.cs" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" Runat="Server">
<link href="Content/group-lookup.css" type="text/css" media="screen, print" rel="stylesheet"  />

<script type="text/javascript">
    $(document).ready(function () {
        Dea.setPopup();
        $("#groupsBrs").addRowHighlights();

        $(Dea.Get("searchText")).bind("keyup", function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 13) {
                loadBillingRefs();
                e.preventDefault();
            }
        });

    });

function setBillingReference(s)
{
   parent.emsBillingInfo.resBillingRef = s;
   parent.iFrameDiag.dialog("close");
   return false; 
}

function loadBillingRefs()
{
    if(Dea.getValue("searchText") === "") {
        return false;
    }
    else
    {
        Dea.setEmsData();
        Dea.emsData.suppressImageWireUp = 1;
        Dea.makeCallback("lookupBillingReference");
    }
    return false;
}

Dea.pageHandleCallback = function(emsResponse, context) {
    switch (context) {
        case "lookupBillingReference":
            Dea.setHtml("availableHtml", emsResponse.availableHtml);
            $("#availableHtml").addRowHighlights();
            return true;
    }
    return false;
}
</script>
<!--[if IE]>
<style type="text/css">
.alignToBox
{
    float:left;
    margin-top:1em;
}
</style><![endif]-->

</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" Runat="Server">

<div class="row" id="groupsBrs">
    <Dea:DeaGridView ID="GroupsBillingReferences" runat="server" Width="100%" AutoGenerateColumns="False"
        EnableViewState="False" AllowSorting="False"
        Summary="<%$ Resources:ScreenText, BrPoLookupSummary %>" EmptyDataText="<%$ Resources:ScreenText, NoMatchingEvents %>"
        GridLines="None" Caption="<%$ Resources:ScreenText, GroupsBillingReferences %>" ParameterKeys="GroupTitleSingular,BillingReferenceTitlePlural">
        <Columns>
            <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Select %>">
                <ItemTemplate>
                    <asp:ImageButton ID="addToUser" runat="server" ImageUrl="images/btn-add.png" ToolTip="<%$ Resources:ScreenText, Select %>"
                        AlternateText="<%$ Resources:ScreenText, Select %>" OnClientClick='<%#  "return setBillingReference(\"" + escapeQuotes(HttpUtility.HtmlDecode(Eval("BillingReference").ToString()).Replace("\\", "\\\\")) + "\")"%>' />                    
                </ItemTemplate>
            </asp:TemplateField>
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, BillingReference %>" DataField="BillingReference"
                HeaderTextParameterKeys="BillingReferenceTitle" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Description %>" DataField="Description" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Notes %>" DataField="Notes"  DataFormatString="{0:html}" HtmlEncode="false" />
        </Columns>                    
   </Dea:DeaGridView>
</div>


<div id="searchRow">
<Dea:TextBoxWithLabel ID="searchText" runat="server" Prompt="<%$ Resources:ScreenText, BillingReferenceStartsWith %>" 
     EmsDataId="searchText"  SuppressSubmitOnReturn="true" CssClass="float" MaxLength="50"  />
<asp:ImageButton ID="searchForGroup" runat="server" ImageUrl="images/btn-find.png" OnClientClick="return loadBillingRefs();" CssClass="alignToBox"  AlternateText="<%$ Resources:ScreenText, Search %>" ToolTip="<%$ Resources:ScreenText, Search %>" />
</div>

<div id="availableHtml" class="row"  role="region" aria-live="polite" aria-atomic="true">
    <Dea:DeaGridView ID="AvailableBillingRefs" runat="server" Width="100%" AutoGenerateColumns="False"
        EnableViewState="False" AllowSorting="False"
        Summary="<%$ Resources:ScreenText, BrPoLookupSummary %>" EmptyDataText="<%$ Resources:ScreenText, NoMatchingEvents %>"
        GridLines="None" Caption="<%$ Resources:ScreenText, Results %>">
        <Columns>
            <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Select %>">
                <ItemTemplate>
                    <asp:ImageButton ID="addToUser" runat="server" ImageUrl="images/btn-add.png" ToolTip="<%$ Resources:ScreenText, Select %>"
                        AlternateText="<%$ Resources:ScreenText, Select %>" OnClientClick='<%#  "return setBillingReference(\"" + escapeQuotes(HttpUtility.HtmlDecode(Eval("BillingReference").ToString()).Replace("\\", "\\\\")) + "\")"%>' />                    
                </ItemTemplate>
            </asp:TemplateField>
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, BillingReference %>" DataField="BillingReference"
                HeaderTextParameterKeys="BillingReferenceTitle" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Description %>" DataField="Description" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Notes %>" DataField="Notes"  DataFormatString="{0:html}" HtmlEncode="false" />
        </Columns>                    
   </Dea:DeaGridView>
</div>


</asp:Content>


