<%@ Control Language="C#" AutoEventWireup="true" Inherits="Controls_PamBook" Codebehind="PamBook.ascx.cs" %>

<div id="pamBookHolder" runat="server">
<div id="pamBookWrapper" style="position:relative;">
    <div id="PamDateHolders" runat="server" class="pr1 ui-widget-header" >
            <div class="float arrowImages ">
                <asp:ImageButton ID="movePreviousDay" runat="server" OnClientClick="return movePamBook(-24);"
                    ImageUrl="~/images/btn-ArrowBack.png" AlternateText="<%$ Resources:ScreenText, PreviousDay %>"
                    ToolTip="<%$ Resources:ScreenText, PreviousDay %>" />
                <asp:ImageButton ID="moveNextDay" runat="server" OnClientClick="return movePamBook(24);"
                    ImageUrl="~/images/btn-ArrowForward.png" AlternateText="<%$ Resources:ScreenText, NextDay %>"
                    ToolTip="<%$ Resources:ScreenText, NextDay %>" />
            </div>
            <div class="floatRight">
                <div id="hoursHolder" runat="server" class="float">
                    <div class="float nextHours">&nbsp;
                    <asp:ImageButton ID="movePrevious" runat="server" ImageUrl="~/images/btn-ArrowBack.png"
                        AlternateText="<%$ Resources:ScreenText, Previous %>" ToolTip="<%$ Resources:ScreenText, Previous %>" />
                    <asp:ImageButton ID="moveNext" runat="server" ImageUrl="~/images/btn-ArrowForward.png" AlternateText="<%$ Resources:ScreenText, Next %>"
                        ToolTip="<%$ Resources:ScreenText, Next %>" />
                   </div>
                   <div class="float pamHoursHolder">
                    <asp:literal ID="HoursLabel" runat="server" />
                  </div>
                </div>
            </div>
            <Dea:LocalizableLabel ID="OnDateLabel" runat="server" CssClass="OnDateLabel" />
        </div>
    
    <div id="pamBookHeaderContainer" aria-live="polite" aria-atomic="true">
        <asp:PlaceHolder ID="BookHeaderContainer" runat="server" EnableViewState="false" />
    </div>
    <div id="pamBookContainer" aria-live="polite" aria-atomic="true" class="pamBookScroll ui-widget" >
    <asp:PlaceHolder ID="BookContent" runat="server" EnableViewState="false" />
    </div>
</div>
</div>

<div id="pamErrorHolder" runat="server" visible="false">
<asp:Label ID="pamErrorMessage" runat="server" CssClass="errorLoading" />
</div>
