<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Title="<%$Resources:PageTitles, TwoFactorAuthentication %>" Inherits="TwoFactor" CodeBehind="TwoFactor.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="Server">
    <style>
        #two-factor h4 {
            font-weight: bold;
        }
        .step {
            /*padding: 20px;*/
            /*border-bottom: solid 1px gainsboro;*/
        }
        .step-name {
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <div id="two-factor">

        <% if (string.IsNullOrEmpty(QRCodeUrl))
        { %>
        <div class="row no-key">
            <div class="col-md-12">
                <%= Messages.TwoFactorNoKey %>
            </div>
        </div>

        <% 
            }
            else
            { 
        %>

        <div class="row step">
            
            <div class="col-md-3">
                <img src="Images/twofastep1.png" height="150" width="150" alt="<%= string.Format(ScreenText.StepX, 1.ToString()) %>" />
            </div>
            <div class="col-md-9">
                <small><%= string.Format(ScreenText.StepX, 1.ToString()) %></small>
                <p class="step-name"><%= ScreenText.TwoFactorStep1 %></p>

                <p>
                    <%= string.Format(Messages.TwoFactorStep1, "<strong>" + EmsParameters.MobileTwoFactorNamedApp + "</strong>") %>
                </p>
            </div>
        </div>

        <hr />

        <div class="row step">
            
            <div class="col-md-3" style="height: 160px">
                <div id="qrcode"></div>
            </div>
            <div class="col-md-9">
                <small><%= string.Format(ScreenText.StepX, 2.ToString()) %></small>
                <p class="step-name"><%= ScreenText.TwoFactorStep2 %></p>

                <p>
                    <%= string.Format(Messages.TwoFactorStep2a, EmsParameters.MobileTwoFactorNamedApp) %>
                </p>

                <p>
                    <%= string.Format(Messages.TwoFactorStep2b, "<span style=\"color: #CC2255\"><code>" + TwoFactorKey + "</code></span>") %>
                </p>
            </div>
        </div>

        <hr />

        <div class="row step">
            
            <div class="col-md-3">
                <img src="Images/twofastep3.png" height="150" width="150" alt="<%= string.Format(ScreenText.StepX, 3.ToString()) %>" />
            </div>
            <div class="col-md-9">
                <small><%= string.Format(ScreenText.StepX, 3.ToString()) %></small>
                <p class="step-name"><%= ScreenText.TwoFactorStep3 %></p>

                <p>
                    <%= string.Format(Messages.TwoFactorStep3, EmsParameters.MobileTwoFactorNamedApp) %>
                </p>
            </div>
        </div>

        <% } %>

    </div>

</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <script type="text/javascript" src="Scripts/qrcode.min.js"></script>
    <script type="text/javascript" src="Scripts/jquery.qrcode.min.js"></script>
    <script type="text/javascript">
        $(function () {
            $('#qrcode').qrcode({
                height: 150,
                width: 150,
                text: '<%= QRCodeUrl %>'
            });
        });
    </script>
</asp:Content>

