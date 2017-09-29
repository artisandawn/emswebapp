<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="PamManageResAttendees" Title="<%$Resources:PageTitles, PamManageResAttendees %>" CodeBehind="PamManageResAttendees.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Newtonsoft.Json" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" runat="Server">
    <%# Styles.Render("~/Content/plugin/book-grid") %>
    <link href="Content/jHtmlArea.css" rel="stylesheet" />
    <style>
        .typeahead-container {
            margin-top: 15px;
        }

        #attendee-list td a i {
            font-size: 1.3em;
        }

        #attendee-loading-overlay {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            background-color: #fff;
            opacity: 0.75;
            z-index: 1000;
        }

            #attendee-loading-overlay .loading-animation {
                position: fixed;
                top: 50%;
                left: 50%;
            }

        .input-icon-embed {
            top: -8px !important;
            right: 10px !important;
            line-height: normal !important;
        }

        .input-icon-embed {
            top: -8px !important;
            right: 10px !important;
            line-height: normal !important;
        }

         @media screen and (-webkit-min-device-pixel-ratio:0) {
            .input-icon-embed {
                top: 1px !important;
            }
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <div id="room-request-content">
        <div class="header-container">
            <div id="breadcrumb" class="row" style="margin-bottom: 15px;">
                <div style="float: left;">
                    <a data-bind="click: breadcrumbClicked"><i class="fa fa-chevron-left"></i>
                        &nbsp;
                    <span data-bind="text: vems.decodeHtml(breadcrumb().Text)"></span>
                        <span data-bind="text: '(' + reservationId() + ')'"></span>
                    </a>
                </div>
                <Dea:HelpButton runat="server" ID="VEMSManageAttendeesHelp" CssClass="floatRight" LookupKey="VEMSManageAttendeesHelp" ParentType="WebTemplate" />
            </div>
        </div>
        <div class="room-request-container" id="room-request-container">
            <div class="row main-header-row hidden-xs" id="room-request-header-row">
                <div class="col-md-10">
                    <div class="main-header-text">
                        <span><%= ScreenText.ManageAttendees %> </span>
                    </div>
                </div>
                <div class="col-md-2">
                    <button class="btn btn-primary" style="margin-top: 12px" id="notify-attendees-btn" data-bind="click: loadNotifyModal, enable: changed"><%= ScreenText.SaveAttendees %></button>
                </div>
            </div>
            <div class="typeahead-container row">
                <div class="col-sm-4"></div>
                <div class="col-sm-4">
                    <span class="input-wrapper-for-icon">
                        <input class="form-control specific-room-input" id="attendee-typeahead" type="text" />
                        <i class="fa fa-search input-icon-embed"></i>
                    </span>
                </div>
                <div class="col-sm-4"></div>
            </div>
            <div class="table-container" style="position: relative;">
                <div id="attendee-loading-overlay">
                    <img class="loading-animation" src="Images/Loading.gif" />
                </div>
                <table class="table table-striped table-sort" id="attendee-list">
                    <thead>
                        <tr>
                            <th></th>
                            <th><%= ScreenText.Name %></th>
                            <th><%= ScreenText.EmailAddress %></th>
                            <th><%= ScreenText.Title %></th>
                            <th style="display: none;">owner</th>
                        </tr>
                    </thead>
                    <tbody data-bind="foreach: attendees.attendeeList">
                        <tr>
                            <td><a href="#" class="attendee-remove-btn" data-bind="visible: !IsOwner, click: function(data, event){ $parent.attendees.removeAttendee(this.AttendeeGuid); }"><i class="fa fa-minus-circle"></i></a></td>
                            <td><a data-bind="text: DisplayName, attr: { href: 'mailto:' + Email }"></a></td>
                            <td><a data-bind="text: Email, attr: { href: 'mailto:' + Email }"></a></td>
                            <td data-bind="text: JobTitle"></td>
                            <td data-bind="text: IsOwner" style="display: none;"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Notify Attendees modal -->
        <div id="notify-modal" class="modal" role="dialog" aria-labelledby="notify-modal-title">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="notify-modal-close-icon"><span aria-hidden="true">&times;</span></button>
                        <h3 class="modal-title" id="template-x-modal-title"><%= ScreenText.NotifyAttendees %></h3>
                    </div>
                    <div class="modal-body">
                        <div style="padding-bottom: 10px;">
                            <%= Messages.NotifyAttendeesModalMessage %>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal" id="notify-modal-changed-only" data-bind="click: function() { updateAttendees(false); }"><%= ScreenText.NotifyChanged %></button>
                        <button type="button" class="btn btn-default" data-dismiss="modal" id="notify-modal-all" data-bind="click: function() { updateAttendees(true); }"><%= ScreenText.NotifyAll %></button>
                        <button type="button" class="btn btn-default" data-dismiss="modal" id="notify-modal-cancel"><%= ScreenText.Cancel %></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/typeahead") %>
    <%= Scripts.Render("~/bundles/pam-manage-attendees") %>

    <script type="text/javascript">
        $(document).ready(function () {
            $('#attendee-loading-overlay').show();

            vems.NoMatchingResults  = "<%= ScreenText.NoMatchingAttendees %>";

            var pamManageVM = new pamManageBookingsModel(<%= PageOptions %>);

            pamManageVM.attendees = new attendeeViewModel(<%= Attendees %>, pamManageVM);
            //ko.mapping.fromJS(, {}, pamManageVM.attendees.attendeeList);

            ko.applyBindings(pamManageVM, document.getElementById('room-request-content'));

            pamManageVM.attendees.GetAttendeeAvailability();

            pamManageVM.attendees.initTypeAhead(document.getElementById('attendee-typeahead'));

            $('#notify-modal').on('shown.bs.modal', function(){
                $('#message').htmlarea({
                    toolbar: [
                        ["html"],
                        ["bold", "italic", "underline", "strikethrough"],
                        ["link", "unlink", "image"],
                        ["orderedlist", "unorderedlist", "superscript", "subscript", "indent", "outdent"],
                        ["justifyleft", "justifycenter", "justifyright", "increasefontsize", "decreasefontsize", "forecolor", "horizontalrule" ]
                    ]
                });
            });

            $('#attendee-list').tablesorter({
                emptyTo: 'bottom',
                sortForce: [[4, 1]],
                sortList: [[4, 1], [1, 0]]
            });
        });
    </script>
</asp:Content>
