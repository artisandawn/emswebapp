<%@ Control Language="C#" AutoEventWireup="true" Inherits="Controls_MiniCalendar" EnableViewState="false" Codebehind="MiniCalendar.ascx.cs" %>

<asp:HiddenField ID="randomDates" runat="server" Value="" />
<div id="sidebar">
    <div id="sidebar_calview">
        <!--  BEGIN SM_CAL_HEAD  *  BEGIN SM_CAL_HEAD  *  BEGIN SM_CAL_HEAD  *  BEGIN SM_CAL_HEAD  *  BEGIN SM_CAL_HEAD  -->
        <div id="sm_cal_head">
            <div class="sm_cal_top_left">
            </div>
            <div class="sm_cal_top_right">
            </div>
            <div class="sm_cal_top_mid">
                <div class="sm_cal_arrows">
                    <a href="#" onclick="return Dea.Recurrence.moveCal(-1);" onmouseout="MM_swapImgRestore()" onmouseover="MM_swapImage('sm_cal_left','','images/Calendar/buttons/b_arrow_left_on.gif',1)">
                        <img src="images/Calendar/buttons/b_arrow_left_off.gif" name="sm_cal_left" width="17"
                            height="17" border="0" class="menu_btn_month_sm" id="sm_cal_left" /></a><a href="#" onclick="return Dea.Recurrence.moveCal(1);"
                                onmouseout="MM_swapImgRestore()" onmouseover="MM_swapImage('sm_cal_right','','images/Calendar/buttons/b_arrow_right_on.gif',1)"><img
                                    src="images/Calendar/buttons/b_arrow_right_off.gif" name="sm_cal_right" width="17"
                                    height="17" border="0" class="menu_btn_month_sm" id="sm_cal_right" /></a></div>
                <div class="sm_cal_name">
                    <asp:Label ID="monthName" runat="server" CssClass="month_name" />
                </div>
            </div>
        </div>
        <div id="sm_cal_body" >
            
            <div id="sm_cal_mid">
                <!--  BEGIN ROW - WEEKDAYS -->
                <div id="sm_cal_row_00">
                    <div id="cal_weekday">
                        <ul>
                            <asp:Repeater ID="DayNamesRepeater" runat="server" EnableViewState="false">
                                <ItemTemplate>
                                    <Dea:Li ID="dayOfWeek" runat="server" Text="<%# Container.DataItem.ToString() %>" />
                                </ItemTemplate>
                            </asp:Repeater>
                        </ul>
                    </div>
                    <!-- close cal_weekday div -->
                </div>
                <!-- close sm_cal_row div -->
                <asp:Repeater ID="CalendarRows" runat="server" OnItemDataBound="BindCalendarRows" EnableViewState="false">
                    <ItemTemplate>
                        <div class="cal_row">
                            <div class="cal_day">
                                <ul>
                                    <asp:Repeater ID="RowDays" runat="server" OnItemDataBound="BindCalendarDates" EnableViewState="false">
                                        <ItemTemplate>
                                            <li id="calDateLi" runat="server">
                                                <asp:LinkButton ID="calDate" runat="server" />
                                                <asp:Literal ID="calDateLiteral" runat="server" />
                                            </li>
                                        </ItemTemplate>
                                    </asp:Repeater>
                                </ul>
                            </div>
                        </div>
                    </ItemTemplate>
                </asp:Repeater>
            </div>
        </div>
        <div id="sm_cal_btm">
	    </div>
        <!-- close sm_cal_body div -->
    </div>
</div>
