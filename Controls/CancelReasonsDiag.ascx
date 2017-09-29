<%@ Control Language="C#" AutoEventWireup="true" Inherits="Controls_CancelReasonsDiag" Codebehind="CancelReasonsDiag.ascx.cs" %>
<script type="text/javascript" src="Scripts/vems/cancel-reasons.js"></script>
<div class="row" id="cancelDialog">
    <span id="cancelConfirm"></span>
    <div id="reasons" class="margin-tb-1">
        <Dea:DropDownWithLabel ID="CancelReason" runat="server" EmsDataId="CancelReason"
            Prompt="<%$ Resources:ScreenText, CancelReason %>" CssClass="row" IsRequired="true" />
        <div style="padding-top: 30px;">
            <Dea:TextBoxWithLabel ID="CancelNotes" runat="server" EmsDataId="CancelNotes" Prompt="<%$ Resources:ScreenText, CancelNotes %>"
                TextMode="MultiLine" CssClass="row" MaxLength="255" />
        </div>
    </div>
    <div id="buttons" class="margin-tb-1">
        <button type="button" class="btn btn-primary" onclick="return doCancelBookings();"><%=Resources.ScreenText.btnCancelBookings %></button>
        <button type="button" class="btn btn-cancel" onclick="return closeDiag();"><%=Resources.ScreenText.Cancel %></button>
    </div>
</div>
