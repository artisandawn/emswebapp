<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="BookingDetails" Title="<%$Resources:PageTitles, BookingDetails %>" Codebehind="BookingDetails.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Register TagPrefix="Dea" Namespace="Dea.Ems.Web.Sites.VirtualEms.Controls" Assembly="Dea.Ems.Web.Sites.VirtualEms.Controls" %>
<%@ Register Src="Controls/BookingDetails.ascx" TagName="BookingDetails" TagPrefix="EMS" %>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
<script type="text/javascript" src="https://s7.addthis.com/js/250/addthis_widget.js"></script>
<script type="text/javascript">
    $(document).ready(function () {
        $("#gridContainer").addRowHighlights();
        Dea.setPopup();
    }
  );
</script>
<div style="width:750px;">
    <div class ="row" >
        <div class="floatRight">
            <div class="block">
           <asp:image ID="bookingIcs" runat="server" ImageUrl="images/btn-ICS.png" AlternateText="<%$ Resources:ScreenText, DownloadIcs %>" />
            <asp:LinkButton id="downloadBookingIcs" runat="server" 
                Text="<%$ Resources:ScreenText, DownloadIcs %>" onclick="downloadBookingIcs_Click" />
                </div>
            <div class="margin-tb-1">
            <asp:image ID="addResIcs" runat="server" ImageUrl="images/btn-ICS.png" AlternateText="<%$ Resources:ScreenText, DownloadIcs %>" />
            <asp:LinkButton id="DownloadIcs" runat="server" 
                Text="<%$ Resources:ScreenText, DownloadAllDatesAsIcs %>" 
                onclick="DownloadIcs_Click" />
            </div>
             <!-- AddThis Button BEGIN -->
            <div id="AddThisHolder" runat="server" class="margin-tb-1">
                <div class="addthis_toolbox addthis_default_style float">
                    <asp:HyperLink ID="AddThisLink" NavigateUrl="https://www.addthis.com/bookmark.php?v=250" CssClass="addthis_button_compact float" runat="server" ToolTip="AddThis" alt="AddThis" Text="<%$ Resources:ScreenText, SocialNetworking %>">
                    </asp:HyperLink>
                </div>
                <div class="menu_btn_spacer"></div>
            </div>
            <!-- AddThis Button END -->
        </div>
    <div class="float">
    <EMS:BookingDetails ID="CoreBookingDetails" runat="server"  />
    </div>
   </div>
   <br />
   <div class="row">
   <asp:Repeater ID="bookingNotes" runat="server" >
    <HeaderTemplate>
        <table summary="format only" cellpadding="0" cellspacing="0"  >
    </HeaderTemplate>
    <ItemTemplate>
        <tr>
            <td class="bold w"><%#DataBinder.Eval(Container.DataItem, "Description")%></td>
            <td><%#DataBinder.Eval(Container.DataItem, "Notes")%></td>
        </tr>
    </ItemTemplate>
    <FooterTemplate>
    </table>
    </FooterTemplate>
   </asp:Repeater>
   </div>
    <br />
    <div id="gridContainer" class="row ui-widget">
        <Dea:BrowseEventsGrid ID="RelatedBookingsGrid" runat="server" Width="100%" AutoGenerateColumns="False"
             DataKeyNames="Id,Date,LocationDisplay,GroupName" Caption="<%$ Resources:ScreenText, RelatedBookingsCaption %>"
            AllowSorting="False" ClickToSortText="<%$ Resources:ScreenText, ClickToSort %>" SortAscAltText="<%$ Resources:ScreenText, SortAscAltText %>"
            SortDescAltText="<%$ Resources:ScreenText, SortDescAltText %>" Summary="<%$ Resources:ScreenText, BrowseEventsListViewGridSummary %>"
            GroupingRowBackColor="#d9e39f" GroupingRowForeColor="black" EmptyDataText="<%$ Resources:ScreenText, NoRelatedBookings %>"
           IncludeHightScript="false"  onrowcommand="SelectedDatesGrid_RowCommand"  IcsColumnIndex="0">
            <Columns>
            <asp:TemplateField >
                    <itemtemplate>
                          <asp:ImageButton ID="DownloadIcs" runat="server" ImageUrl="images/btn-ICS.png" AlternateText="<%$ Resources:ScreenText, DownloadIcs %>" 
                          CommandArgument='<%# Eval("Id")%>' CommandName="addIcs" />
                                    </itemtemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources:ScreenText, Date %>" SortExpression="Date" >
                    <itemtemplate>
                                        <dea:div runat="server"  Text='<%# GetDateWithDay(Eval("Date")) %>' ID="dateLabel" />
                                    </itemtemplate>
                </asp:TemplateField>
                <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, StartTime %>" DataFormatString="{0:t}"
                    DataField="TimeEventStart" SortExpression="TimeEventStart" />
                <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, EndTime %>" DataFormatString="{0:t}"
                    DataField="TimeEventEnd" SortExpression="TimeEventEnd" VisibilityParameterKey="VEMS_Browse_ShowEndTime" />
                <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Title %>" DataField="EventName"
                    SortExpression="EventName" HtmlEncode="false"  />
                <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, Location %>" DataField="LocationDisplay"
                    SortExpression="LocationDisplay"  HtmlEncode="false" />
                <Dea:DeaBoundField HeaderText="<%$ Resources:ScreenText, GroupName %>" DataField="GroupName" HtmlEncode="false"
                    SortExpression="GroupName" HeaderTextParameterKeys="GroupTitleSingular" VisibilityParameterKey="VEMS_Browse_ShowGroupNameInResults" />
            </Columns>
        </Dea:BrowseEventsGrid>
    </div>
    </div>
</asp:Content>
