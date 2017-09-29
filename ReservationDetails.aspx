<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="ReservationDetails" Title="<%$Resources:PageTitles, ReservationDetails %>" Codebehind="ReservationDetails.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Register TagPrefix="Dea" Namespace="Dea.Ems.Web.Sites.VirtualEms.Controls" Assembly="Dea.Ems.Web.Sites.VirtualEms.Controls" %>
<%@ Register Src="Controls/ReservationDetails.ascx" TagName="ReservationDetails"
    TagPrefix="EMS" %>
<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" runat="Server">
    <link href="Content/booking-details.css" type="text/css" media="screen, print" rel="stylesheet" />
    <script type="text/javascript" src="http://s7.addthis.com/js/250/addthis_widget.js"></script>
    <script type="text/javascript">

        $(document).ready(function () {
            $("#bookings").tabs();
            $("#bookings").addRowHighlights();
             $("#emsBody").removeClass("emsBody");
            $("#emsCon").removeClass("emsCon");
            $("div[class*=master]").removeClass();
            $("#page").css("padding-top", "1em");
        });

        function loadTab() {
            $("#bookings").tabs("remove", 0);
        }
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <div style="width: 750px;">
        <div class="row">
            <div class="floatRight">
                <asp:Image ID="addResIcs" runat="server" ImageUrl="images/btn-ICS.png" AlternateText="<%$ Resources:ScreenText, DownloadAllDatesAsICS %>" />
                <asp:LinkButton ID="DownloadIcs" runat="server" Text="<%$ Resources:ScreenText, DownloadAllDatesAsICS %>"
                    OnClick="DownloadIcs_Click" />
            </div>
            <!-- AddThis Button BEGIN -->
            <div id="AddThisHolder" runat="server" class="clear floatRight margin-tb-1">
                <div class="addthis_toolbox addthis_default_style float">
                    <asp:HyperLink ID="AddThisLink" NavigateUrl="http://www.addthis.com/bookmark.php?v=250" CssClass="addthis_button_compact float" runat="server" ToolTip="AddThis" alt="AddThis" Text="<%$ Resources:ScreenText, SocialNetworking %>">
                    </asp:HyperLink>
                </div>
                <div class="menu_btn_spacer"></div>
            </div>
            <!-- AddThis Button END -->
            <div class="float">
                <EMS:ReservationDetails ID="CoreBookingDetails" runat="server" />
            </div>
        </div>
        <br />
        <div class="row">
            <asp:Repeater ID="bookingNotes" runat="server">
                <HeaderTemplate>
                    <table summary="format only" border="0">
                </HeaderTemplate>
                <ItemTemplate>
                    <tr>
                        <td class="bold" style="width: 150px">
                            <%#DataBinder.Eval(Container.DataItem, "Description")%>
                        </td>
                        <td>
                            <%#DataBinder.Eval(Container.DataItem, "Notes")%>
                        </td>
                    </tr>
                </ItemTemplate>
                <FooterTemplate>
                    </table>
                </FooterTemplate>
            </asp:Repeater>
        </div>
        <br />
        <div id="bookings" class="row">
            <ul>
                <li><a href="#tab0">
                    <asp:Literal ID="Literal1" runat="server" Text="<%$ Resources:ScreenText, SelectedDate %>" /></a></li>
                <li><a href="#tab1">
                    <asp:Literal ID="Literal2" runat="server" Text="<%$ Resources:ScreenText, AllDates %>" /></a></li>
            </ul>
            <div id="tab0">
                <Dea:BrowseEventsGrid ID="SelectedDatesGrid" runat="server" Width="100%" AutoGenerateColumns="False"
                    DataKeyNames="Id,Date,LocationDisplay,GroupName" OnRowCommand="SelectedDatesGrid_RowCommand"
                    Caption="<%$ Resources:ScreenText, RelatedBookingsCaption %>" AllowSorting="False"
                    Summary="<%$ Resources:ScreenText, BrowseEventsListViewGridSummary %>" GroupingRowBackColor="#d9e39f"
                    GroupingRowForeColor="black" EmptyDataText="<%$ Resources:ScreenText, NoRelatedBookings %>"
                    IncludeHightScript="false" OverrideHideLocation="true" SuppressOnclick="true"
                    GridLines="None" IcsColumnIndex="0">
                    <Columns>
                        <asp:TemplateField>
                            <ItemTemplate>
                                <asp:ImageButton ID="DownloadIcs" runat="server" ImageUrl="images/btn-ICS.png"
                                    AlternateText="<%$ Resources:ScreenText, ResDetailsDownloadIcs %>" CommandArgument='<%# Eval("Id")%>'
                                    CommandName="addIcs" />
                            </ItemTemplate>
                        </asp:TemplateField>
                        <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Date %>" SortExpression="Date">
                            <ItemTemplate>
                                <Dea:Div runat="server" Text='<%# GetDateWithDay(Eval("Date")) %>' ID="dateLabel" />
                            </ItemTemplate>
                        </asp:TemplateField>
                        <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, StartTime %>" DataFormatString="{0:t}"
                            DataField="TimeEventStart" SortExpression="TimeEventStart" />
                        <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, EndTime %>" DataFormatString="{0:t}"
                            DataField="TimeEventEnd" SortExpression="TimeEventEnd" VisibilityParameterKey="VEMS_Browse_ShowEndTime" />
                        <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Title %>" DataField="EventName"
                            SortExpression="EventName" HtmlEncode="false" />
                        <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Location %>" DataField="LocationDisplay"
                            SortExpression="LocationDisplay" />
                    </Columns>
                </Dea:BrowseEventsGrid>
            </div>
            <div id="tab1">
                <Dea:BrowseEventsGrid ID="AllBookingsGrid" runat="server" Width="100%" AutoGenerateColumns="False"
                    SuppressOnclick="true" DataKeyNames="Id,Date,LocationDisplay,GroupName" Caption="<%$ Resources:ScreenText, RelatedBookingsCaption %>"
                    AllowSorting="False" ClickToSortText="<%$ Resources:ScreenText, ClickToSort %>"
                    SortAscAltText="<%$ Resources:ScreenText, SortAscAltText %>" SortDescAltText="<%$ Resources:ScreenText, SortDescAltText %>"
                    Summary="<%$ Resources:ScreenText, BrowseEventsListViewGridSummary %>" GroupingRowBackColor="#d9e39f"
                    GroupingRowForeColor="black" EmptyDataText="<%$ Resources:ScreenText, NoRelatedBookings %>"
                    IncludeHightScript="false" OverrideHideLocation="true" OnRowCommand="SelectedDatesGrid_RowCommand"
                    GridLines="None" IcsColumnIndex="0">
                    <Columns>
                        <asp:TemplateField>
                            <ItemTemplate>
                                <asp:ImageButton ID="DownloadIcs" runat="server" ImageUrl="images/btn-ICS.png"
                                    AlternateText="<%$ Resources:ScreenText, ResDetailsDownloadIcs %>" CommandArgument='<%# Eval("Id")%>'
                                    CommandName="addIcs" />
                            </ItemTemplate>
                        </asp:TemplateField>
                        <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Date %>" SortExpression="Date">
                            <ItemTemplate>
                                <Dea:Div runat="server" Text='<%# GetDateWithDay(Eval("Date")) %>' ID="dateLabel" />
                            </ItemTemplate>
                        </asp:TemplateField>
                        <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, StartTime %>" DataFormatString="{0:t}"
                            DataField="TimeEventStart" SortExpression="TimeEventStart" />
                        <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, EndTime %>" DataFormatString="{0:t}"
                            DataField="TimeEventEnd" SortExpression="TimeEventEnd" VisibilityParameterKey="VEMS_Browse_ShowEndTime" />
                        <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Title %>" DataField="EventName"
                            SortExpression="EventName" HtmlEncode="false" />
                        <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Location %>" DataField="LocationDisplay"
                            SortExpression="LocationDisplay" />
                    </Columns>
                </Dea:BrowseEventsGrid>
            </div>
        </div>
    </div>
</asp:Content>
