<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true"
    Inherits="ViewReservationSummary" Title="<%$Resources:PageTitles, ViewReservationSummary %>" EnableViewState="false" CodeBehind="ViewReservationSummary.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>

<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" runat="Server">
    <style>
        td {
            text-align: left !important;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <div id="view-reservation-summary-container">
        <div id="breadcrumb" class="row">
            <a data-bind="attr: { href: ReservationSummaryLink }"><i class="fa fa-chevron-left"></i>
                &nbsp;
                <span data-bind="text: vems.decodeHtml(BreadcrumbText())"></span>
                <span data-bind="text: '(' + ReservationId() + ')'"></span>
            </a>
        </div>
        <div class="row options-container">
            <div class="row options-container">
                <div class="col-md-1">
                    <span><%= Resources.ScreenText.Options %></span>
                </div>
                <div class="col-md-8" id="summary-options">
                    <label class="radio-inline">
                        <input type="radio" name="viewRdo" id="detailViewRdo" value="1" checked data-bind="click: formatChanged">
                        <span><%= Resources.ScreenText.DetailView %></span>
                    </label>
                    <label class="radio-inline">
                        <input type="radio" name="viewRdo" id="summaryViewRdo" value="2" data-bind="click: formatChanged">
                        <span><%= Resources.ScreenText.SummaryView %></span>
                    </label>
                </div>
            </div>
            <div class="row preview-container">
                <div class="col-md-1">
                    <span><%= Resources.ScreenText.Preview %></span>
                </div>
                <div class="col-md-8">
                    <a href="#" data-bind="visible: AllowEmail" data-toggle="modal" data-target="#email-modal">
                        <i class="fa fa-paper-plane"></i>
                        <span><%= Resources.ScreenText.EmailReservationSummary %></span>
                    </a>
                    <!-- email modal -->
                    <div id="email-modal" class="modal" role="dialog" aria-labelledby="email-modal-title">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="email-modal-close-icon"><span aria-hidden="true">&times;</span></button>
                                    <h3 class="modal-title" id="email-modal-title"><%= ScreenText.EmailReservationSummary %></h3>
                                </div>
                                <div class="modal-body">
                                    <div class="form-horizontal">
                                        <div class="form-group">
                                            <label for="toContainer" class="col-sm-2 control-label"><%= ScreenText.ToLabel %></label>
                                            <div class="col-sm-10">
                                                <div id="toContainer" data-bind="foreach: Emails">
                                                    <div class="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked data-bind="attr: { 'data-email': vems.decodeHtml(EmailAddress()) }">
                                                            <span data-bind="text: Name() + ' ' + '(' + vems.decodeHtml(EmailAddress()) + ')'"></span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="cc" class="col-sm-2 control-label"><%= ScreenText.CC %></label>
                                            <div class="col-sm-10">
                                                <textarea class="form-control" id="cc" data-bind="textInput: EmailModel.CC"></textarea>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="subject" class="col-sm-2 control-label"><%= ScreenText.Subject %></label>
                                            <div class="col-sm-10">
                                                <input class="form-control" id="subject" data-bind="textInput: EmailModel.Subject">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="message" class="col-sm-2 control-label"><%= ScreenText.Message %></label>
                                            <div class="col-sm-10">
                                                <textarea class="form-control" id="message" data-bind="textInput: EmailModel.Message"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="email-modal-send" data-bind="click: sendEmail"><%= ScreenText.Send %></button>
                                    <button type="button" class="btn btn-default" data-dismiss="modal" id="email-modal-close"><%= ScreenText.Cancel %></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
            </div>
        </div>
        <div class="row">
            <div id="confirmationHtml" class="row" role="region" aria-live="polite" aria-atomic="true" data-bind="html: ConfirmationHtml"></div>
        </div>
    </div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <script type="text/javascript">

        $(document).ready(function () {
            var model = ko.mapping.fromJS(<%= ViewModelData %>);
            model.EmailModel = ko.mapping.fromJS(<%= Newtonsoft.Json.JsonConvert.SerializeObject(new Dea.Ems.Web.Sites.VirtualEms.Models.EmailModel()) %>);
            //Detail = 1, Summary = 2, MobileFriendly = 3
            model.Format = 1;

            //int reservationId, int templateId, int templateFormat, EmailModel emailData
            model.sendEmail = function (data, event) {
                var emailData = ko.toJS(model.EmailModel);
                emailData.FromName = model.NameOfSender();
                emailData.FromEmail = model.EmailOfSender();

                var toEmails = new Array();
                $('#toContainer input:checked').each(function (i, v) {
                    toEmails.push($(v).data('email'));
                });

                emailData.SendTo = toEmails.join(',');

                vems.ajaxPost(
                {
                    url: vems.serverApiUrl() + '/SendSummaryEmail',
                    data: JSON.stringify({ reservationId: model.ReservationId(), templateId: model.TemplateId(), templateFormat: model.Format, emailData: emailData }),
                    success: function (results) {
                        result = JSON.parse(results.d);

                        if (result.Success) {
                            vems.showToasterMessage('', result.SuccessMessage, 'info', 2000);
                        } else {
                            vems.showToasterMessage('', result.ErrorMessage, 'danger', 2000);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                        return false;
                    }
                });
            };

            model.formatChanged = function (data, event) {
                model.Format = $('#summary-options input:checked').val();

                vems.ajaxPost(
                 {
                     url: vems.serverApiUrl() + '/SummaryFormatChanged',
                     data: JSON.stringify({ reservationId: model.ReservationId(), templateId: model.TemplateId(), templateFormat: model.Format }),
                     success: function (results) {
                         result = JSON.parse(results.d);

                         model.ConfirmationHtml(result.confirmationHtml);
                     },
                     error: function (xhr, ajaxOptions, thrownError) {
                         console.log(thrownError);
                         return false;
                     }
                 });

                return true;
            };

            ko.applyBindings(model, document.getElementById('view-reservation-summary-container'));
        });

    </script>
</asp:Content>
