<%@ Control Language="C#" AutoEventWireup="true" Inherits="Controls_Book" Codebehind="Book.ascx.cs" %>
<%@ Register Src="~/Controls/BookingDetails.ascx" TagName="BookingDetails" TagPrefix="EMS" %>
<!--[if IE 7]>
    <style type="text/css">
        .ip { height: 20px; }

        a.buildingLabel { height: 19px; }

        .capacityLabel, .cl {
            border-bottom: solid 1px #DCDCDC;
            border-top: solid 1px #DCDCDC;
            width: 3%;
        }

        .r {
            border-bottom: solid 1px #DCDCDC;
            border-top: solid 1px #DCDCDC
        }

        #bookContainer { position: relative; }

        .s { margin-top: -15px; }
    </style>
<![endif]-->
<div style="position: relative;">
    <div id="bookLoadingContainer" style="display: none" aria-hidden="true">
        <asp:Literal ID="loadmsg" runat="server" Text="<%$ Resources:ScreenText, Loading %>" />
    </div>
    <div id="bookWrapper" style="display: none;" aria-hidden="true">
        <div id="resBookDateNav" runat="server">
            <div id="DateHolders" runat="server" class="pr1 ui-widget-header">
                <div id="arrowwrappers" runat="server">
                    <div class="float arrowImages ">
                        <asp:LinkButton ID="movePreviousDay" runat="server" CssClass="fa fa-chevron-left" AlternateText="<%$ Resources:ScreenText, PreviousDay %>" ToolTip="<%$ Resources:ScreenText, PreviousDay %>" />
                        <asp:LinkButton ID="moveNextDay" runat="server" CssClass="fa fa-chevron-right" AlternateText="<%$ Resources:ScreenText, NextDay %>" ToolTip="<%$ Resources:ScreenText, NextDay %>" />
                    </div>
                    <div class="floatRight">
                        <div id="hoursHolder" runat="server" class="float">
                            <div class="float nextHours">
                                <asp:LinkButton ID="movePrevious" runat="server" CssClass="fa fa-chevron-left" AlternateText="<%$ Resources:ScreenText, Previous %>" ToolTip="<%$ Resources:ScreenText, Previous %>" />
                                <asp:LinkButton ID="moveNext" runat="server" CssClass="fa fa-chevron-right" AlternateText="<%$ Resources:ScreenText, Next %>" ToolTip="<%$ Resources:ScreenText, Next %>" />
                            </div>
                            <div class="float hoursHolder">
                                <asp:Label ID="HoursLabel" runat="server" />
                                <asp:Label ID="HoursPipe" runat="server" Text="&nbsp;|&nbsp;" />
                            </div>
                        </div>
                        <asp:LinkButton ID="FilterImage" runat="server" AlternateText="<%$ Resources:ScreenText, Filter %>" ToolTip="<%$ Resources:ScreenText, Filter %>" CssClass="filterLink fa fa-bars" Visible="false" />
                        <asp:LinkButton ID="filterButton" runat="server" Text="<%$ Resources:ScreenText, Filter %>" CssClass="filterLink" />&nbsp;
                    </div>
                </div>
                <Dea:LocalizableLabel ID="OnDateLabel" runat="server" CssClass="OnDateLabel" />
            </div>
        </div>
        <div id="bookHeaderContainer" class="ui-widget" aria-live="polite" aria-atomic="true">
            <asp:PlaceHolder ID="BookHeaderContainer" runat="server" EnableViewState="false" />
        </div>
        <div class="bookScroll ui-widget" id="bookContainer" aria-hidden="true" aria-live="polite" aria-atomic="true">
            <asp:PlaceHolder ID="BookContent" runat="server" EnableViewState="false" />
        </div>
    </div>
</div>
<EMS:BookingDetails ID="BookingTip" runat="server" />
