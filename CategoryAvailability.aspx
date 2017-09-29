<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" 
Inherits="CategoryAvailability" Title="<%$Resources:PageTitles, CategoryAvailability %>" EnableViewState="false" Codebehind="CategoryAvailability.aspx.cs" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" Runat="Server">
<script type="text/javascript">
    $(document).ready(function () {
      Dea.setPopup();
    });
    function showBuildings(id) {
        var o = Dea.Get("buildingsFor" + id);
        if (o.style.display === "none") {
            Dea.setDisplay(o, "");
        }
        else {
            Dea.setDisplay(o, "none");
        }
        return false;
    }
</script>

</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" Runat="Server">
    <asp:Label ID="NoResultsLabel" runat="server" />
    <asp:Repeater ID="CategoriesRepeater" runat="server" OnItemDataBound="CategoriesRepeater_ItemDataBound">
        <HeaderTemplate>
            <ul>
        </HeaderTemplate>
            <ItemTemplate>
                <li>
                    <asp:Literal ID="CategoryDesc" runat="server" Text='<%# Eval("Category") %>' />
                        <ul>
                            <li><asp:Literal ID="TimeRestriction" runat="server" /></li>
                            <li ID="BuildingListItem" runat="Server">
                                <asp:LinkButton ID="AvailableToBuildings" runat="server" Text="<%# GetAvailableToBuildingsText() %>"  />
                                    <ul id='<%# "buildingsFor" + Eval("ID") %>' style="display:none;" aria-hidden="true">
                                        <asp:Repeater id="BuildingsRepeater" runat="server" >
                                            <ItemTemplate>
                                                <li><asp:Literal ID="BuilidngLabel" runat="server" Text='<%# Eval("Description") %>' /></li>
                                            </ItemTemplate>
                                        </asp:Repeater>
                                    </ul>
                            </li>
                        </ul>
                </li>
            </ItemTemplate>
        <FooterTemplate>
            </ul>
        </FooterTemplate>
    </asp:Repeater>


</asp:Content>

