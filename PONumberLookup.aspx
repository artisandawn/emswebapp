<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="PONumberLookup" Title="PO Number Lookup" Codebehind="PONumberLookup.aspx.cs" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" Runat="Server">
<link href="Content/group-lookup.css" type="text/css" media="screen, print" rel="stylesheet"  />

<script type="text/javascript">
function setPONumber(s)
{
    parent.emsBillingInfo.resPONumber = s;
    parent.iFrameDiag.dialog("close");
    return false; 
}

function loadPONumbers()
{
    if(Dea.getValue("searchText") === "") {
        return false;
    }
    else {
        Dea.setEmsData();
        Dea.emsData.suppressImageWireUp = 1;
        Dea.makeCallback("lookupPONumber");
    }
    return false;
}
$(document).ready(function () {
    Dea.setPopup();
    $("#groupsPos").addRowHighlights();
    $(Dea.Get("searchText")).bind("keyup", function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            loadPONumbers();
            e.preventDefault();
        }
    });
});

Dea.pageHandleCallback = function (emsResponse, context) {
    switch (context) {
        case "lookupPONumber":
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

<div class="row" id="groupsPos">
    <Dea:DeaGridView ID="GroupsPoNumbers" runat="server" Width="100%" AutoGenerateColumns="False"
        EnableViewState="False" AllowSorting="False"
        Summary="<%$ Resources:ScreenText, BrPoLookupSummary %>" EmptyDataText="<%$ Resources:ScreenText, NoMatchingEvents %>"
        GridLines="None" Caption="<%$ Resources:ScreenText, GroupsBillingReferences %>" ParameterKeys="GroupTitleSingular,PONumberTitlePlural">
         <Columns>
            <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Select %>">
                <ItemTemplate>
                    <asp:ImageButton ID="addToUser" runat="server" ImageUrl="images/btn-add.png" AlternateText="<%$ Resources:ScreenText, Select %>"
                        ToolTip="<%$ Resources:ScreenText, Select %>" OnClientClick='<%#  "return setPONumber(\"" + escapeQuotes(HttpUtility.HtmlDecode(Eval("PONumber").ToString()).Replace("\\", "\\\\")) + "\")"%>' />
                </ItemTemplate>
            </asp:TemplateField>
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, PONumber %>" DataField="PONumber"
                HeaderTextParameterKeys="PONumberTitle" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Description %>" DataField="Description" HtmlEncode="false"  />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Notes %>" DataField="Notes" HtmlEncode="false"
                 />
        </Columns>            
   </Dea:DeaGridView>
</div>

<div id="searchRow">
<Dea:TextBoxWithLabel ID="searchText" runat="server" Prompt="<%$ Resources:ScreenText, POStartsWith %>" 
     EmsDataId="searchText"  SuppressSubmitOnReturn="true" CssClass="float" MaxLength="50"  />
<asp:ImageButton ID="searchForGroup" runat="server" ImageUrl="images/btn-find.png" ToolTip="<%$ Resources:ScreenText, Search %>" AlternateText="<%$ Resources:ScreenText, Search %>" OnClientClick="return loadPONumbers();" CssClass="alignToBox" />
</div>
<div id="availableHtml" class="row" role="region" aria-live="polite" aria-atomic="true">
    <Dea:DeaGridView ID="AvailablePOs" runat="server" Width="100%" AutoGenerateColumns="False"
        EnableViewState="False" AllowSorting="False" Summary="<%$ Resources:ScreenText, BrPoLookupSummary %>"
        EmptyDataText="<%$ Resources:ScreenText, NoMatchingEvents %>" GridLines="None"
        Caption="<%$ Resources:ScreenText, Results %>">
        <Columns>
            <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Select %>">
                <ItemTemplate>
                    <asp:ImageButton ID="addToUser" runat="server" ImageUrl="images/btn-add.png" AlternateText="<%$ Resources:ScreenText, Select %>"
                        ToolTip="<%$ Resources:ScreenText, Select %>" OnClientClick='<%#  "return setPONumber(\"" + escapeQuotes(HttpUtility.HtmlDecode(Eval("PONumber").ToString()).Replace("\\", "\\\\")) + "\")"%>' />
                </ItemTemplate>
            </asp:TemplateField>
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, PONumber %>" DataField="PONumber"
                HeaderTextParameterKeys="PONumberTitle" HtmlEncode="false" />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Description %>" DataField="Description" HtmlEncode="false"  />
            <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Notes %>" DataField="Notes" HtmlEncode="false"
                 />
        </Columns>
    </Dea:DeaGridView>
</div>


</asp:Content>


