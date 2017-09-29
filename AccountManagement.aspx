<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="AccountManagement" Title="<%$Resources:PageTitles, AccountManagement %>" CodeBehind="AccountManagement.aspx.cs" %>

<%@ Import Namespace="Resources" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ Import Namespace="Dea.Ems.Web.Sites.VirtualEms" %>
<%@ Import Namespace="System.Web.Optimization" %>

<%@ Register Assembly="DevExpress.Web.v15.1, Version=15.1.8.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a"
    Namespace="DevExpress.Web" TagPrefix="dx" %>
<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>

<asp:Content ID="headContent" ContentPlaceHolderID="headContentHolder" runat="server">
    <%# Styles.Render("~/Content/dynamic-filters") %>
</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="Server">
    <div>
        <div id="acctMgmtDiv">
            <asp:HiddenField ID="ChangeCounter" runat="server" Value="0" />

            <ul id="account-tabs" class="nav nav-tabs" role="tablist">
                <!-- ko if: ShowAccountDetailsTab() -->
                <li role="presentation" class="active"><a href="#userInfoContainer" aria-controls="userInfoContainer" role="tab"
                    data-toggle="tab" data-bind="html: vems.account.AccountDetailsText"></a></li>
                <!-- /ko -->
                <!-- ko if: ShowDelegatesTab() -->
                <li role="presentation"><a href="#delegateContainer" aria-controls="delegateContainer" role="tab" data-toggle="tab"
                    data-bind="html: vems.account.DelegatesText"></a></li>
                <!-- /ko -->
                <li role="presentation"><a href="#personalizationContainer" aria-controls="personalizationContainer" role="tab" data-toggle="tab"
                    data-bind="html: vems.account.PersonalizationText"></a></li>
                <li role="presentation"><a href="#favoriteRoomsContainer" aria-controls="favoriteRoomsContainer" role="tab" data-toggle="tab"
                    data-bind="html: vems.account.MyFavoriteRoomsText"></a></li>
                <Dea:HelpButton runat="server" ID="OnPageHelpAuth" CssClass="floatRight" LookupKey="VEMSCreateAccountOnPage" ParentType="None" />
            </ul>
            <div class="tab-content">
                <Dea:HelpButton runat="server" ID="OnPageHelpGuest" CssClass="floatRight" LookupKey="VEMSCreateAccountOnPage" ParentType="None" />
                <div id="userInfoContainer" role="tabpanel" class="tab-pane fade in active" data-bind="visible: ShowAccountDetailsTab">
                    <!-- ko if: IsCreate() -->
                    <h3 data-bind="html: CreateVsRequestText"></h3>
                    <p data-bind="html: AccountInstructionsText"></p>

                    <div id="emailDiv">
                        <!-- ko if: EnableEmailAddress() -->
                        <div class="section-header" data-bind="html: vems.decodeHtml(vems.account.EmailText) + ' & ' + vems.decodeHtml(vems.account.PasswordText)">User Name & Password</div>
                        <div class="row">
                            <div class="col-xs-10 col-md-3">
                                <div class="form-group">
                                    <label for="emailAddress" class="required" data-bind="text: vems.decodeHtml(vems.account.EmailAddressText)"></label>
                                    <input type="email" class="form-control" data-bind="textInput: userInfoViewModel.EmailAddress" id="email-address" name="emailAddress">
                                    <label id="email-address-error" class="help-block" for="email-address" style="display: none; white-space: nowrap;"></label>
                                </div>

                                <!--ko if: EnablePassword() -->
                                <div id="passwordDiv">
                                    <div class="form-group">
                                        <label for="password" class="required" data-bind="text: vems.decodeHtml(vems.account.PasswordText)"></label>
                                        <input type="password" class="form-control" data-bind="textInput: userInfoViewModel.Password" id="password" name="password">
                                    </div>
                                    <div class="form-group">
                                        <label for="confirm-password-textbox" class="required" data-bind="text: vems.decodeHtml(vems.account.ConfirmPasswordText)"></label>
                                        <input type="password" class="form-control" data-bind="textInput: userInfoViewModel.ConfirmPassword" id="confirm-password-textbox" name="confirm-password-textbox">
                                        <div data-bind="html: vems.account.VerifyPasswordText"></div>
                                    </div>
                                </div>
                                <!-- /ko -->
                            </div>
                        </div>
                        <!-- /ko -->

                        <div class="section-header"><%= ScreenText.AboutYou %></div>
                        <div class="row">
                            <div class="col-xs-10 col-md-3">
                                <div class="form-group" id="userNameDiv">
                                    <label for="username" class="required" data-bind="text: vems.decodeHtml(vems.account.NameText)"></label>
                                    <input type="text" class="form-control" data-bind="textInput: userInfoViewModel.UserName" required="required" id="username" name="username">
                                </div>
                                <!-- ko if: EnablePhone() -->
                                <div class="form-group" id="phoneDiv">
                                    <label for="phone" data-bind="text: vems.decodeHtml(vems.account.PhoneText)"></label>
                                    <input type="text" class="form-control" data-bind="textInput: userInfoViewModel.Phone" id="phone" name="phone">
                                </div>
                                <!-- /ko -->
                                <!-- ko if: EnableFax() -->
                                <div class="form-group" id="faxDiv">
                                    <label for="fax" data-bind="text: vems.decodeHtml(vems.account.FaxText)"></label>
                                    <input type="text" class="form-control" data-bind="textInput: userInfoViewModel.Fax" id="fax" name="fax">
                                </div>
                                <!-- /ko -->
                                <div class="form-group" id="timezoneDiv">
                                    <label for="timezones" class="required" data-bind="text: vems.decodeHtml(vems.account.TimeZoneText)"></label>
                                    <select class="form-control" id="timezones" name="timezones" required="required"
                                        data-bind="options: TimeZones, value: userInfoViewModel.TimeZoneId, optionsText: 'TimeZone', optionsValue: 'TimeZoneID', optionsCaption: 'Select a ' + vems.decodeHtml(vems.account.TimeZoneText)">
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- ko if: userInfoViewModel.UserDefinedFields.Udfs().length > 0 -->
                        <div class="section-header"><%= ScreenText.EditUdfs %></div>
                        <div class="row">
                            <div class="col-xs-10 col-md-5">
                                <div data-bind='component: { name: "udf-display-component", params: userInfoViewModel.UserDefinedFields.Udfs }'></div>
                            </div>
                        </div>
                        <!-- /ko -->

                        <div class="section-header" data-bind="html: $('#OnPageHelp').html().trim().length > 0 ? (vems.account.AcceptTermsText + ' & ' + CreateVsRequestText()) : CreateVsRequestText(), visible: $('#OnPageHelp').html().trim().length > 0"></div>
                        <div class="row">
                            <div class="col-xs-10 col-md-5">
                                <!-- ko if: EnableOptOutOfEmail() -->
                                <div class="form-group" id="optoutDiv">
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" data-bind="checked: userInfoViewModel.EmailOptOut" />
                                            <span data-bind="text: vems.account.OptOutOfEmailText"></span>
                                        </label>
                                    </div>
                                </div>
                                <!-- /ko -->
                                <div class="form-group" id="tou-div" data-bind="visible: $('#OnPageHelp').html().trim().length > 0">
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" id="tou" name="tou" required="required" aria-required="true" />
                                            <span data-bind="text: vems.decodeHtml(vems.account.AcceptTouText)"></span>
                                            <a id="tou-link" role="button" data-bind="text: vems.decodeHtml(vems.screenText.termsOfUseText)" data-toggle="modal" data-target="#tou-modal"></a>.
                                            <label id="tou-error" class="help-block" for="tou" style="display: none; padding-left: 0; font-weight: bold;"></label>
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary" data-bind="html: CreateVsRequestText"></button>
                            </div>
                        </div>
                    </div>
                    <!-- /ko -->

                    <!-- ko ifnot: IsCreate() -->
                    <div class="row" style="margin-top: 15px;">
                        <div class="col-xs-10 col-md-3">
                            <div class="form-group edit-form-group" id="edit-timezoneDiv">
                                <label for="timezones" class="required" data-bind="text: vems.decodeHtml(vems.account.TimeZoneText)"></label>
                                <select class="form-control" id="edit-timezones" name="timezones" required="required"
                                    data-bind="options: TimeZones, value: userInfoViewModel.TimeZoneId, optionsText: 'TimeZone', optionsValue: 'TimeZoneID', optionsCaption: 'Select a ' + vems.decodeHtml(vems.account.TimeZoneText)">
                                </select>
                            </div>
                            <!-- ko if: EnableEmailAddress() -->
                            <div class="form-group edit-form-group">
                                <label for="emailAddress" data-bind="text: vems.decodeHtml(vems.account.EmailAddressText)"></label>
                                <input type="email" class="form-control" data-bind="textInput: userInfoViewModel.EmailAddress" id="edit-email-address" name="emailAddress">
                                <label id="edit-email-address-error" class="help-block" for="email-address" style="display: none; white-space: nowrap;"></label>
                            </div>
                            <!-- /ko -->

                            <div class="form-group edit-form-group" id="edit-userNameDiv">
                                <label for="username" class="required" data-bind="text: vems.decodeHtml(vems.account.NameText)"></label>
                                <input type="text" class="form-control" data-bind="textInput: userInfoViewModel.UserName" required="required" id="edit-username" name="username">
                            </div>

                            <!-- ko if: EnablePhone() -->
                            <div class="form-group edit-form-group" id="edit-phoneDiv">
                                <label for="phone" data-bind="text: vems.decodeHtml(vems.account.PhoneText)"></label>
                                <input type="text" class="form-control" data-bind="textInput: userInfoViewModel.Phone" id="edit-phone" name="phone">
                            </div>
                            <!-- /ko -->

                            <!-- ko if: EnableFax() -->
                            <div class="form-group edit-form-group" id="edit-faxDiv">
                                <label for="fax" data-bind="text: vems.decodeHtml(vems.account.FaxText)"></label>
                                <input type="text" class="form-control" data-bind="textInput: userInfoViewModel.Fax" id="edit-fax" name="fax">
                            </div>
                            <!-- /ko -->

                            <!-- ko if: EnablePassword() -->
                            <div class="form-group edit-form-group">
                                <label for="current-password-textbox" data-bind="text: vems.decodeHtml(vems.account.CurrentPasswordText)"></label>
                                <input type="password" class="form-control" data-bind="textInput: userInfoViewModel.CurrentPassword" id="edit-current-password-textbox" name="current-password-textbox">
                            </div>
                            <div class="form-group edit-form-group">
                                <label for="password" data-bind="text: vems.decodeHtml(vems.account.NewPasswordText)"></label>
                                <input type="password" class="form-control" data-bind="textInput: userInfoViewModel.Password" id="edit-password" name="password">
                            </div>
                            <div class="form-group edit-form-group">
                                <label for="confirm-password-textbox" data-bind="text: vems.decodeHtml(vems.account.VerifyNewPasswordText)"></label>
                                <input type="password" class="form-control" data-bind="textInput: userInfoViewModel.ConfirmPassword" id="edit-confirm-password-textbox" name="confirm-password-textbox">
                            </div>
                            <!-- /ko -->
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-xs-10 col-md-5">
                            <!-- ko if: EnableOptOutOfEmail() -->
                            <div class="form-group edit-form-group" id="edit-optoutDiv">
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" data-bind="checked: userInfoViewModel.EmailOptOut" />
                                        <span data-bind="text: vems.decodeHtml(vems.account.OptOutOfEmailText)"></span>
                                    </label>
                                </div>
                            </div>
                            <!-- /ko -->
                            <button type="submit" class="btn btn-primary" data-bind="html: vems.account.SaveChangesText"></button>
                        </div>
                    </div>
                    <!-- /ko -->
                    <%--<pre data-bind="text: ko.toJSON($root, null, 2)"></pre>--%>
                </div>

                <div id="delegateContainer" role="tabpanel" class="tab-pane fade col-xs-12">
                    <div class="row form-group account-section-label">
                        <div class="col-xs-12 col-sm-5 col-md-3 delegate-add-label">
                            <h2><%= string.Format(ScreenText.AddNew, ScreenText.Delegate) %></h2>
                        </div>
                        <div class="col-xs-12 col-sm-6 col-md-4 delegate-add-search">
                            <div class="input-wrapper-for-icon" style="width: 350px; position: relative;">
                                <input class="form-control delegate-add-search-input" id="delegate-search" type="text" data-bind="attr: { placeholder: vems.decodeHtml(vems.account.DelegateSearchPlaceholderText) }" />
                                <i class="fa fa-search input-icon-embed"></i>
                            </div>
                        </div>
                    </div>
                    <div class="row account-section-label">
                        <h2><%= string.Format(ScreenText.YourSaved, ScreenText.Delegates) %></h2>
                    </div>
                    <div class="row sortable-grid-header" id="delegate-grid-header">
                        <div class="row">
                            <div class="col-sm-1 col-xs-2 mobile-ellipsis-text grid-text"></div>
                            <div id="delegate-grid-header-username" class="col-sm-4 col-xs-5 mobile-ellipsis-text grid-text" data-bind="click: function () { vems.account.sortDelegates('UserName'); }">
                                <%= ScreenText.Name %>
                            </div>
                            <div id="delegate-grid-header-emailaddress" class="col-sm-4 col-xs-5 mobile-ellipsis-text grid-text" data-bind="click: function () { vems.account.sortDelegates('EmailAddress'); }">
                                <%= ScreenText.Email %>
                            </div>
                            <div id="delegate-grid-header-phone" class="col-sm-3 hidden-xs mobile-ellipsis-text grid-text" data-bind="click: function () { vems.account.sortDelegates('Phone'); }">
                                <%= ScreenText.Phone %>
                            </div>
                        </div>
                    </div>
                    <div class="booking-grid row">
                        <div id="delegate-grid" class="sortable-grid-content">
                            <!-- ko if: vems.account.viewModels.accountViewModel.delegatesViewModel.delegates().length > 0 -->
                            <!-- ko foreach: vems.account.viewModels.accountViewModel.delegatesViewModel.delegates -->
                            <div class="row">
                                <div class="col-sm-1 col-xs-2 mobile-ellipsis-text grid-text-center">
                                    <a data-bind="attr: { href: 'javascript:vems.account.moveDelegate(\'remove\',' + WebUserId + ');' }">
                                        <i class="fa fa-times-circle grid-icon"></i>
                                    </a>
                                </div>
                                <div class="col-sm-4 col-xs-5 mobile-ellipsis-text grid-text" data-bind="text: UserName"></div>
                                <div class="col-sm-4 col-xs-5 mobile-ellipsis-text grid-text">
                                    <a data-bind="text: EmailAddress, attr: { href: 'mailto:' + EmailAddress }"></a>
                                </div>
                                <div class="col-sm-3 hidden-xs mobile-ellipsis-text grid-text" data-bind="text: Phone"></div>
                            </div>
                            <!-- /ko -->
                            <!-- /ko -->
                            <!-- ko ifnot: vems.account.viewModels.accountViewModel.delegatesViewModel.delegates().length > 0 -->
                            <div class="row">
                                <div class="col-xs-12 grid-text-center mobile-wrap-text">
                                    <%= string.Format(Messages.DelegateListEmpty, ScreenText.Delegates) %>
                                </div>
                            </div>
                            <!-- /ko -->
                        </div>
                    </div>
                </div>

                <div id="personalizationContainer" class="tab-pane fade col-xs-12">
                    <div class="row account-section-label">
                        <h2><%= ScreenText.PersonalizeFilterHeader %></h2>
                    </div>
                    <div class="row account-section-label-center">
                        <ul class="nav nav-pills center-pills">
                            <li class="active">
                                <a href="#filter-grid-container" data-toggle="pill" role="tab" data-bind="click: vems.account.hidePersOptions"><%= ScreenText.Filters %></a>
                            </li>
                            <li>
                                <a href="#template-grid-container" data-toggle="pill" role="tab" data-bind="click: vems.account.hidePersOptions"><%= ScreenText.Templates %></a>
                            </li>
                        </ul>
                    </div>
                    <div class="row">
                        <div class="tab-content">
                            <div id="filter-grid-container" class="tab-pane fade in active">
                                <div class="row sortable-grid-header" id="filter-grid-header">
                                    <div class="row">
                                        <div class="col-sm-1 col-xs-2 mobile-ellipsis-text grid-text"></div>
                                        <div id="filter-grid-header-filtername" class="col-sm-4 col-xs-6 mobile-ellipsis-text grid-text" data-bind="click: function () { vems.account.sortSavedFilters('Name'); }">
                                            <%= ScreenText.FilterName %>
                                        </div>
                                        <div id="filter-grid-header-filterparent" class="col-sm-5 col-xs-4 mobile-ellipsis-text grid-text" data-bind="click: function () { vems.account.sortSavedFilters('Parent'); }">
                                            <%= ScreenText.FilterType %>
                                        </div>
                                        <div class="col-sm-1 hidden-xs mobile-ellipsis-text grid-text"></div>
                                        <div class="col-sm-1 hidden-xs mobile-ellipsis-text grid-text"></div>
                                    </div>
                                </div>
                                <div class="booking-grid row">
                                    <div id="filter-grid" class="sortable-grid-content">
                                        <!-- ko if: personalizationViewModel.savedFilters().length > 0 -->
                                        <!-- ko foreach: personalizationViewModel.savedFilters -->
                                        <div class="row">
                                            <div class="col-sm-1 col-xs-2 mobile-ellipsis-text grid-text-center"><a data-bind="click: vems.account.editFilter"><i class="fa fa-pencil-square-o grid-icon"></i></a></div>
                                            <div class="col-sm-4 col-xs-6 mobile-ellipsis-text grid-text"><a data-bind="text: vems.decodeHtml(Name), click: vems.account.editFilter"></a></div>
                                            <div class="col-sm-5 col-xs-4 mobile-ellipsis-text grid-text" data-bind="text: vems.decodeHtml(Parent)"></div>
                                            <div class="col-sm-1 hidden-xs mobile-ellipsis-text grid-text"><a data-bind="click: vems.account.copyFilter"><i class="fa fa-files-o grid-icon"></i></a></div>
                                            <div class="col-sm-1 hidden-xs mobile-ellipsis-text grid-text"><a data-bind="click: vems.account.deleteFilter"><i class="fa fa-trash-o grid-icon"></i></a></div>
                                        </div>
                                        <!-- /ko -->
                                        <!-- /ko -->
                                        <!-- ko ifnot: personalizationViewModel.savedFilters().length > 0 -->
                                        <div class="row">
                                            <div class="col-xs-12 grid-text-center"><%= Messages.FilterListEmpty %></div>
                                        </div>
                                        <!-- /ko -->
                                    </div>
                                </div>
                            </div>
                            <div id="template-grid-container" class="tab-pane fade">
                                <p>
                                    <p><%= Messages.FavoriteRoomsMessage %></p>
                                </p>
                                <div class="row sortable-grid-header" id="template-grid-header">
                                    <div class="row">
                                        <div class="col-sm-1 col-xs-2 mobile-ellipsis-text grid-text"></div>
                                        <div id="template-grid-header-templatetext" class="col-sm-11 col-xs-9 mobile-ellipsis-text grid-text" data-bind="click: function () { vems.account.sortTemplateDefaults('Text'); }">
                                            <%= ScreenText.TemplateName %>
                                        </div>
                                    </div>
                                </div>
                                <div class="booking-grid row">
                                    <div id="template-grid" class="sortable-grid-content">
                                        <!-- ko if: personalizationViewModel.templateDefaults().length > 0 -->
                                        <!-- ko foreach: personalizationViewModel.templateDefaults -->
                                        <div class="row">
                                            <div class="col-sm-1 col-xs-2 mobile-ellipsis-text grid-text-center"><a data-bind="click: vems.account.editTemplate"><i class="fa fa-pencil-square-o grid-icon"></i></a></div>
                                            <div class="col-sm-11 col-xs-9 mobile-ellipsis-text grid-text"><a data-bind="text: vems.decodeHtml(Text()), click: vems.account.editTemplate"></a></div>
                                        </div>
                                        <!-- /ko -->
                                        <!-- /ko -->
                                        <!-- ko ifnot: personalizationViewModel.templateDefaults().length > 0 -->
                                        <div class="row">
                                            <div class="col-xs-12 grid-text-center"><%= Messages.YouHaveNoTemplatesConfigured %></div>
                                        </div>
                                        <!-- /ko -->
                                    </div>
                                </div>
                            </div>

                            <div id="personalization-options" style="display: none;">
                                <div class="date-time-header row">
                                    <div class="col-xs-12"><%= ScreenText.PersonalizationOptions %></div>
                                </div>
                                <div id="edit-filter-section" class="row" style="float: none;">
                                    <div class="form-group row col-xs-12 col-md-4">
                                        <input id="edit-filter-name" class="form-control" type="text" data-bind="textInput: personalizationViewModel.editedFilterName" />
                                    </div>
                                    <div class="row">
                                        <div id="edit-filter-content" class="col-xs-12"></div>
                                    </div>
                                    <div class="row col-xs-12">
                                        <button id="edit-filter-btn" class="btn btn-primary" data-bind="click: vems.account.saveFilter"><%= ScreenText.SaveChanges %></button>
                                    </div>
                                </div>

                                <div id="edit-template-default-section" class="row col-xs-12" style="float: none;">
                                    <!-- ko if: personalizationViewModel.editedTemplate() -->
                                    <h3 data-bind="text: vems.decodeHtml(personalizationViewModel.editedTemplate().TemplateName)"></h3>
                                    <div class="row" style="padding-bottom: 0;">
                                        <div id="template-starttime-label" class="col-xs-6 col-sm-3 col-md-2 label-dropdown"><%= ScreenText.StartTime %></div>
                                        <div class="col-xs-6 col-sm-3 col-md-2 form-group">
                                            <div id="edit-template-start-time" class="input-group date">
                                                <input type="text" class="form-control" />
                                                <span class="input-group-addon"><i class="fa fa-clock-o"></i></span>
                                            </div>
                                        </div>
                                        <div id="template-endtime-label" class="col-xs-6 col-sm-3 col-md-2 label-dropdown label-dropdown-right"><%= ScreenText.EndTime %></div>
                                        <div class="col-xs-6 col-sm-3 col-md-2 form-group">
                                            <div id="edit-template-end-time" class="input-group date">
                                                <input type="text" class="form-control" />
                                                <span class="input-group-addon"><i class="fa fa-clock-o"></i></span>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- ko if: vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().DisplayRoomAsOptions.length > 0 -->
                                    <div class="row">
                                        <div class="col-xs-6 col-md-2 label-radio"><%= ScreenText.DisplayResultsAs %></div>
                                        <div class="col-xs-6 col-md-3" data-bind="foreach: vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().DisplayRoomAsOptions">
                                            <label>
                                                <input type="radio" name="ResultsAsGroup" data-bind="value: Key, checked: vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.ResultsAs" />
                                                <span data-bind="text: Value" style="font-weight: normal; margin-right: 15px;"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                    <!-- ko if: personalizationViewModel.editedTemplate().LocationOptions.length > 0 -->
                                    <div class="row">
                                        <div class="col-xs-6 col-md-2 label-ms"><%= ScreenText.Locations %></div>
                                        <div class="col-xs-6 col-md-10">
                                            <div>
                                                <p id="edit-template-locations" data-bind="text: personalizationViewModel.locationsDisplay()"></p>
                                                <a style="font-weight: bold;" data-bind="click: function () { vems.account.openMultiSelect('locations'); }"><%= string.Format("{0} {1}", ScreenText.AddRemove, ScreenText.Locations) %></a>
                                            </div>
                                            <div class="checkbox">
                                                <label>
                                                    <input type="checkbox" id="edit-template-location-personalization-save" data-bind="checked: vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.OverrideLocationAndTimeZoneOnSearch == 1">
                                                    <%= ScreenText.OverrideLocationAndTimeZoneOnSearch  %>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                    <!-- ko if: personalizationViewModel.editedTemplate().FloorOptions.length > 0 -->
                                    <div class="row">
                                        <div class="col-xs-6 col-md-2 label-ms"><%= ScreenText.Floors %></div>
                                        <div class="col-xs-6 col-md-3">
                                            <p id="edit-template-floors" data-bind="text: personalizationViewModel.floorsDisplay()"></p>
                                            <a href="#" style="font-weight: bold;" data-bind="click: function () { vems.account.openMultiSelect('floors'); }"><%= string.Format("{0} {1}", ScreenText.AddRemove, ScreenText.Floors) %></a>
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                    <!-- ko if: personalizationViewModel.editedTemplate().RoomTypeOptions.length > 0 -->
                                    <div class="row">
                                        <div class="col-xs-6 col-md-2 label-ms"><%= string.Format(ScreenText.RoomTypes, EmsParameters.RoomTitleSingular) %></div>
                                        <div class="col-xs-6 col-md-3">
                                            <p id="edit-template-roomtypes" data-bind="text: personalizationViewModel.roomTypesDisplay()"></p>
                                            <a href="#" style="font-weight: bold;" data-bind="click: function () { vems.account.openMultiSelect('roomtypes'); }"><%= string.Format("{0} {1}", ScreenText.AddRemove, string.Format(ScreenText.RoomTypes, EmsParameters.RoomTitleSingular)) %></a>
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                    <!-- ko if: personalizationViewModel.editedTemplate().TimeZoneOptions.length > 0 -->
                                    <div class="row">
                                        <div class="col-xs-6 col-md-2 label-dropdown"><%= ScreenText.TimeZone %></div>
                                        <div class="col-xs-6 col-md-3">
                                            <select id="template-time-zone" class="form-control" data-bind="options: personalizationViewModel.editedTemplate().TimeZoneOptions,
    optionsText: 'Value',
    optionsValue: 'Key',
    value: personalizationViewModel.editedTemplate().TemplateDefaults.Timezone">
                                            </select>
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                    <!-- ko if: personalizationViewModel.editedTemplate().SetupTypeOptions.length > 0 -->
                                    <div class="row">
                                        <div class="col-xs-6 col-md-2 label-dropdown"><%= ScreenText.SetupType %></div>
                                        <div class="col-xs-6 col-md-3">
                                            <select class="form-control" data-bind="options: personalizationViewModel.editedTemplate().SetupTypeOptions,
    optionsText: 'Value',
    optionsValue: 'Key',
    value: personalizationViewModel.editedTemplate().TemplateDefaults.SetupType">
                                            </select>
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                    <div class="row">
                                        <div class="col-xs-6 col-md-2 label-dropdown"><%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular) %></div>
                                        <div class="col-xs-6 col-md-3">
                                            <input class="form-control" data-bind="textInput: personalizationViewModel.editedTemplate().TemplateDefaults.EventName" />
                                        </div>
                                    </div>
                                    <!-- ko if: personalizationViewModel.editedTemplate().EventTypeOptions.length > 0 -->
                                    <div class="row">
                                        <div class="col-xs-6 col-md-2 label-dropdown"><%= string.Format(ScreenText.EventType, EmsParameters.EventsTitleSingular) %></div>
                                        <div class="col-xs-6 col-md-3">
                                            <select class="form-control" data-bind="options: personalizationViewModel.editedTemplate().EventTypeOptions,
    optionsText: 'Value',
    optionsValue: 'Key',
    value: personalizationViewModel.editedTemplate().TemplateDefaults.EventType">
                                            </select>
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                    <!-- ko if: personalizationViewModel.editedTemplate().ShowTimeAsOptions.length > 0 -->
                                    <div class="row">
                                        <div class="col-xs-6 col-md-2 label-dropdown"><%= ScreenText.ShowTimeAs %></div>
                                        <div class="col-xs-6 col-md-3">
                                            <select class="form-control" data-bind="options: personalizationViewModel.editedTemplate().ShowTimeAsOptions,
    optionsText: 'Value',
    optionsValue: 'Key',
    value: personalizationViewModel.editedTemplate().TemplateDefaults.PamShowTimeAs">
                                            </select>
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                    <!-- ko if: personalizationViewModel.editedTemplate().ReminderOptions.length > 0 -->
                                    <div class="row">
                                        <div class="col-xs-6 col-md-2 label-dropdown"><%= ScreenText.Reminder %></div>
                                        <div class="col-xs-6 col-md-3">
                                            <select class="form-control" data-bind="options: personalizationViewModel.editedTemplate().ReminderOptions,
    optionsText: 'Value',
    optionsValue: 'Key',
    value: personalizationViewModel.editedTemplate().TemplateDefaults.PamReminder">
                                            </select>
                                        </div>
                                    </div>
                                    <!-- /ko -->
                                    <div class="label-ms">
                                        <button id="edit-template-btn" class="btn btn-primary" data-bind="click: vems.account.saveTemplate"><%= ScreenText.SaveChanges %></button>
                                    </div>
                                    <!-- /ko -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="favoriteRoomsContainer" role="tabpanel" class="tab-pane fade col-xs-12">
                    <div class="row form-group account-section-label">
                        <div class="col-xs-12 col-sm-3 col-md-12 delegate-add-label">
                            <h2><%= string.Format(ScreenText.AddNew, string.Format(ScreenText.FavoriteRoom, EmsParameters.RoomTitleSingular)) %></h2>
                            <p><%= Messages.FavoriteRoomsMessage %></p>
                        </div>
                    </div>
                    <div class="row form-group account-section-label">
                        <div class="col-xs-12 col-sm-12 col-md-6" style="margin-left: -15px;">
                            <button class="btn btn-primary" role="button" style="vertical-align: top" data-bind="click: function () { vems.account.openMultiSelect('locations', true); }">
                                <%= string.Format(ScreenText.FilterByX, ScreenText.Location) %>
                            </button>
                            <div class="input-wrapper-for-icon" style="display: inline-block; width: 350px; position: relative;">
                                <input class="form-control delegate-add-search-input" id="favorite-search" type="text" data-bind="attr: { placeholder: vems.decodeHtml(vems.account.FavoriteRoomSearchPlaceholderText) }" />
                                <i class="fa fa-search input-icon-embed"></i>
                            </div>
                        </div>
                    </div>
                    <div class="row account-section-label">
                        <h2><%= string.Format(ScreenText.YourSaved, string.Format(ScreenText.FavoriteRoom, EmsParameters.RoomTitlePlural)) %></h2>
                    </div>
                    <div class="row sortable-grid-header" id="favorite-grid-header">
                        <div class="row">
                            <div class="col-sm-1 col-xs-2 mobile-ellipsis-text grid-text"></div>
                            <div id="favorite-grid-header-roomdescription" class="col-sm-3 col-xs-5 mobile-ellipsis-text grid-text"
                                data-bind="click: function () { vems.account.sortFavorites('RoomDescription'); }">
                                <%= string.Format(ScreenText.RoomName, EmsParameters.RoomTitleSingular) %>
                            </div>
                            <div id="favorite-grid-header-buildingdescription" class="col-sm-3 col-xs-5 mobile-ellipsis-text grid-text" data-bind="click: function () { vems.account.sortFavorites('BuildingDescription'); }">
                                <%= EmsParameters.BuildingTitleSingular %>
                            </div>
                            <%-- <div id="favorite-grid-header-floor" class="col-sm-2 hidden-xs mobile-ellipsis-text grid-text" data-bind="click: function () { vems.account.sortFavorites('Floor'); }">
                                <%= ScreenText.Floor %>
                            </div>--%>
                            <div id="favorite-grid-header-roomtype" class="col-sm-3 hidden-xs mobile-ellipsis-text grid-text" data-bind="click: function () { vems.account.sortFavorites('RoomType'); }">
                                <%= string.Format(ScreenText.RoomType, EmsParameters.RoomTitleSingular) %>
                            </div>
                        </div>
                    </div>
                    <div class="booking-grid row">
                        <div id="favorite-grid" class="sortable-grid-content">
                            <!-- ko if: vems.account.viewModels.accountViewModel.favoritesViewModel.favoriteRooms().length > 0 -->
                            <!-- ko foreach: vems.account.viewModels.accountViewModel.favoritesViewModel.favoriteRooms -->
                            <div class="row">
                                <div class="col-sm-1 col-xs-2 mobile-wrap-text grid-text-center">
                                    <a data-bind="attr: { href: 'javascript:vems.account.removeFavoriteRoom(' + RoomId + ');' }">
                                        <i class="fa fa-times-circle grid-icon"></i>
                                    </a>
                                </div>
                                <div class="col-sm-3 col-xs-5 mobile-wrap-text grid-text">
                                    <a data-bind="attr: { title: vems.decodeHtml(RoomDescription), href: LocationLink }, text: vems.decodeHtml(RoomDescription)"></a>
                                </div>
                                <div class="col-sm-3 col-xs-5 mobile-wrap-text grid-text">
                                    <a data-bind="attr: { title: vems.decodeHtml(BuildingDescription), href: LocationLink }, text: vems.decodeHtml(BuildingDescription)"></a>
                                </div>
                                <%-- <div class="col-sm-2 hidden-xs mobile-ellipsis-text grid-text">
                                    <span data-bind="text: Floor"></span>
                                </div>--%>
                                <div class="col-sm-2 col-sm-3 hidden-xs mobile-wrap-text grid-text">
                                    <span data-bind="text: RoomType"></span>
                                </div>
                            </div>
                            <!-- /ko -->
                            <!-- /ko -->
                            <!-- ko ifnot: vems.account.viewModels.accountViewModel.favoritesViewModel.favoriteRooms().length > 0 -->
                            <div class="row">
                                <div class="col-xs-12 grid-text-center mobile-wrap-text">
                                    <%= string.Format(Messages.FavoriteRoomListEmpty, string.Format(ScreenText.FavoriteRoom, EmsParameters.RoomTitlePlural)
                                        .ToLower(), EmsParameters.RoomTitleSingular.ToLower()) %>
                                </div>
                            </div>
                            <!-- /ko -->
                        </div>
                    </div>

                </div>
            </div>
            <div id="template-location-filter"></div>
            <%--multi-select modal--%>
            <div class="modal fade" id="multi-select-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
                <div class="modal-dialog" role="document">
                    <div class="modal-content" id="multi-select-modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title"></h4>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="input-group">
                                    <input type="text" class="form-control filter-modal-typeahead" id="multi-select-search-input" />
                                    <i class="fa fa-search"></i>
                                </div>
                            </div>
                            <div class="row">
                                <div class="checkbox-group"></div>
                            </div>
                            <div class="row ">
                                <div class="col-xs-12 selected-group-label"></div>
                                <div class="selected-group"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" id="multi-select-update-btn"></button>
                            <button type="button" class="btn btn-default" id="multi-select-close-btn" data-dismiss="modal"><%= ScreenText.Close %></button>
                        </div>
                    </div>
                </div>
            </div>

            <%--create account confirmation modal--%>
            <div class="modal fade" id="account-confirm-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
                <div class="modal-dialog" role="document">
                    <div class="modal-content" id="account-confirm-modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title"><%= ScreenText.ReadyToContinue %></h4>
                        </div>
                        <div class="modal-body">
                            <div class="row col-xs-12">
                                <%= EmsParameters.DefaultWebUserSecurityState == Dea.Core.SecurityState.Active ? 
                                        ScreenText.AccountConfirmationCreate : ScreenText.AccountConfirmationRequest %>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" id="account-confirm-yes-btn" data-bind="click: vems.account.confirmAccount">
                                <%= EmsParameters.DefaultWebUserSecurityState == Dea.Core.SecurityState.Active ? 
                                        ScreenText.YesCreateMyAccount : ScreenText.YesRequestMyAccount %>
                            </button>
                            <button type="button" class="btn btn-primary" id="account-confirm-no-btn" data-dismiss="modal"><%= ScreenText.NoNotYet %></button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <script type="text/javascript" src="Scripts/jquery.form.min.js"></script>
    <%= Scripts.Render("~/bundles/password-strength") %>
    <%= Scripts.Render("~/bundles/user-defined-fields") %>
    <%= Scripts.Render("~/bundles/typeahead") %>
    <%= Scripts.Render("~/bundles/account-management") %>
    <script type="text/javascript">
        vems.browse.addRemoveLabel = '<%= escapeQuotes(ScreenText.AddRemove) %>';  // required for multi-select labels when editing filters

        // user info text
        vems.account.OptOutOfEmailText = '<%= escapeQuotes(ScreenText.OptOutOfEmail) %>';
        vems.account.AccountManagementNotesText = '<%= WebUtilities.GetStringFromParameterObject(ScreenText.AccountManagementNotes, "VEMS_User_WebUserNoteLabel", this.ParameterObject) %>';
        vems.account.ConfirmPasswordText = '<%= escapeQuotes(ScreenText.ConfirmPassword) %>';
        vems.account.PasswordText = '<%= escapeQuotes(ScreenText.Password) %>';
        vems.account.CurrentPasswordText = '<%= escapeQuotes(ScreenText.CurrentPassword) %>';
        vems.account.TimeZoneText = '<%= escapeQuotes(ScreenText.TimeZone) %>';
        vems.account.FaxText = '<%= escapeQuotes(ScreenText.Phone2) %>';
        vems.account.PhoneText = '<%= escapeQuotes(ScreenText.Phone1) %>';
        vems.account.EmailText = '<%= escapeQuotes(ScreenText.Email) %>';
        vems.account.EmailAddressText = '<%= escapeQuotes(ScreenText.EmailAddress) %>';
        vems.account.NameText = '<%= escapeQuotes(ScreenText.Name) %>';
        vems.account.SaveText = '<%= escapeQuotes(ScreenText.Save) %>';
        vems.account.PasswordsDoNotMatchText = '<%= escapeQuotes(Messages.PasswordsDoNotMatch) %>';
        vems.account.VerifyPasswordText = '<%= escapeQuotes(Messages.VerifyPassword) %>';
        vems.account.InvalidEmailFormatText = '<%= escapeQuotes(Messages.InvalidEmailFormat) %>';
        vems.account.SavedText = '<%= escapeQuotes(Messages.Saved) %>';
        vems.account.AccountDetailsText = '<%= escapeQuotes(ScreenText.AccountDetails) %>';
        vems.account.AccountHeaderText = '<%= escapeQuotes(ScreenText.AccountHeader) %>';
        vems.account.CreateAccountText = '<%= escapeQuotes(ScreenText.CreateAccount) %>';
        vems.account.AcceptTermsText = '<%= escapeQuotes(ScreenText.AcceptTerms) %>';
        vems.account.AcceptTouText = '<%= escapeQuotes(ScreenText.AgreeToTandC) %>';
        vems.account.EmailInUseText = '<%= escapeQuotes(ScreenText.EmailInUse) %>';
        vems.account.LikeToResetText = '<%= escapeQuotes(ScreenText.LikeToReset) %>';
        vems.account.ResetPasswordUrl = '<%= escapeQuotes(Dea.Web.Core.Constants.Pages.ForgotPassword) %>';
        vems.account.AccountFormFailedValidationText = "<%= escapeQuotes(Messages.AccountFormFailedValidation) %>";
        vems.account.SaveChangesText = '<%= escapeQuotes(ScreenText.SaveChanges) %>';
        vems.account.NewPasswordText = '<%= escapeQuotes(ScreenText.NewPassword) %>';
        vems.account.VerifyNewPasswordText = '<%= escapeQuotes(ScreenText.VerifyNewPassword) %>';

        // delegates text
        vems.account.DelegatesText = '<%= escapeQuotes(ScreenText.Delegates) %>';
        vems.account.DelegateSearchNoMatchText = '<%= escapeQuotes(Messages.DelegateSearchNoMatch) %>';
        vems.account.DelegateSearchPlaceholderText = '<%= escapeQuotes(string.Format(ScreenText.FindByX, ScreenText.Name.ToLower())) %>';

        // personalization text
        vems.account.PersonalizationText = '<%= escapeQuotes(ScreenText.Personalization) %>';
        vems.account.AddRemoveText = '<%= escapeQuotes(ScreenText.AddRemove) %>';
        vems.account.CloseText = '<%= escapeQuotes(ScreenText.Close) %>';
        vems.account.UpdateText = '<%= escapeQuotes(ScreenText.Update) %>';
        vems.account.CancelText = '<%= escapeQuotes(ScreenText.Cancel) %>';
        vems.account.LocationsText = '<%= escapeQuotes(ScreenText.Locations) %>';
        vems.account.AddFilterText = "<%= escapeQuotes(ScreenText.AddFilter) %>";
        vems.account.FloorsText = '<%= escapeQuotes(ScreenText.Floors) %>';
        vems.account.RoomTypesText = '<%= escapeQuotes(string.Format(ScreenText.RoomTypes, EmsParameters.RoomTitleSingular)) %>';
        vems.account.FindByXText = '<%= escapeQuotes(ScreenText.FindByX) %>';
        vems.account.FindXText = '<%= escapeQuotes(ScreenText.FindX) %>';
        vems.account.SelectedXText = '<%= escapeQuotes(ScreenText.SelectedRooms) %>';
        vems.account.buildingsLabel = "<%= EmsParameters.BuildingTitlePlural %>";
        vems.account.viewsLabel = "<%= ScreenText.Views %>";
        vems.account.showAllAreasLabel = "<%= string.Format(ScreenText.ShowAllX, EmsParameters.AreaTitlePlural) %>";
        vems.account.filterByAreaLabel = "<%= string.Format(ScreenText.FilterByX, EmsParameters.AreaTitleSingular) %>";
        vems.account.selectAllXLabel = "<%= ScreenText.SelectAllX %>";
        vems.account.searchForAnAreaLabel = "<%= string.Format(ScreenText.SearchForAnX, EmsParameters.AreaTitleSingular) %>";
        vems.account.ungroupedBuildingsLabel = "<%= string.Format(ScreenText.UngroupedX, EmsParameters.BuildingTitlePlural) %>";
        vems.account.DropDownAllText = '<%= escapeQuotes(ScreenText.DropDownAll) %>';

        // favorite rooms text
        vems.account.MyFavoriteRoomsText = '<%= escapeQuotes(string.Format(ScreenText.MyFavoriteRooms, EmsParameters.RoomTitlePlural)) %>';
        vems.account.FavoriteRoomSearchNoMatchText = '<%= escapeQuotes(string.Format(Messages.FavoriteRoomSearchNoMatch, EmsParameters.RoomTitlePlural.ToLower())) %>';
        vems.account.FavoriteRoomSearchPlaceholderText = '<%= escapeQuotes(string.Format(ScreenText.FindByX, string.Format(ScreenText.RoomName, EmsParameters.RoomTitleSingular).ToLower())) %>';
        var userInfoTabVisible = true;

        $(document).ready(function () {
            var data = ko.mapping.fromJS(<%= jsonViewModel %>);
            vems.account.viewModels.accountViewModel = new vems.account.accountVM(data);
            ko.applyBindings(vems.account.viewModels.accountViewModel, $("#acctMgmtDiv")[0]);

            if (!vems.account.viewModels.accountViewModel.ShowAccountDetailsTab()) {
                $('#account-tabs li').eq(0).find('a').click();
            }

            var pwInputId = vems.account.viewModels.accountViewModel.IsCreate() ? '#password' : '#edit-password';
            $(pwInputId).passwordStrength({
                gaugeWidth: 200,
                passwordStrengthLabel: '<%= escapeQuotes(ScreenText.PasswordStrength) %>',
                weakLabel: '<%= escapeQuotes(ScreenText.Weak) %>',
                averageLabel: '<%= escapeQuotes(ScreenText.Average) %>',
                strongLabel: '<%= escapeQuotes(ScreenText.Strong) %>'
            });

            vems.account.enableControlsAndValidation();
            if (vems.account.viewModels.accountViewModel.IsCreate()) {
                $("#account-tabs").hide();
            } else {
                if (vems.account.viewModels.accountViewModel.ShowDelegatesTab()) {
                    vems.account.getUserDelegates();
                    vems.account.delegateSearchInit();
                }

                $("a[href='#userInfoContainer']").on('shown.bs.tab', function (e) {
                    userInfoTabVisible = true;
                }).on('hidden.bs.tab', function (e) {
                    userInfoTabVisible = false;
                });

                vems.account.getSavedFilters();
                vems.account.sortTemplateDefaults(vems.account.templateSortProp ? '' : 'Text');
                vems.account.getUserFavorites();
                vems.account.favoriteSearchInit();
                if (DevExpress.devices.real().phone) {
                    $('#template-endtime-label').removeClass('label-dropdown-right');
                }
            }

            if (DevExpress.devices.real().phone) {
                $('.nav-pills li').click(function () {  // manually switch tabs for pills in mobile
                    var pillSectionId = $(this).find('a').attr('href');
                    $('.nav-pills a[href="' + pillSectionId + '"]').tab('show');
                });
            }
        });

        vems.browse.dynamicFilters = $('#template-location-filter').dynamicFilters({
            filterParent: vems.browse.filterParents.browseLocations,
            displaymode: 'none',
            templateId: -1,
            compactViewMode: vems.browse.compactMode.verycompact,
            hideFavorites: false,
            filterLabel: "<%= ScreenText.Filter %>",
            filtersLabel: "<%= ScreenText.Filters %>",
            compactViewLabel: "<%= ScreenText.CompactView %>",
            editViewLabel: "<%= ScreenText.EditView %>",
            findARoomLabel: "<%= string.Format(ScreenText.FindARoom, EmsParameters.RoomTitleSingular) %>",
            savedFiltersLabel: "<%= ScreenText.SavedFilters %>",
            saveLabel: "<%= ScreenText.Save %>",
            addRemoveLabel: "<%= ScreenText.AddRemove %>",
            saveFilterLabel: "<%= ScreenText.SaveFilter %>",
            saveFiltersLabel: "<%= ScreenText.SaveFilters %>",
            closeLabel: "<%= ScreenText.Close %>",
            updateLabel: "<%= ScreenText.Update %>",
            cancelLabel: "<%= ScreenText.Cancel %>",
            nameLabel: "<%= ScreenText.Name %>",
            dateSavedLabel: "<%= ScreenText.DateSaved %>",
            loadFilterLabel: "<%= ScreenText.LoadFilter %>",
            deleteFilterLabel: "<%= ScreenText.DeleteFilter %>",
            whatWouldYouLikeToNameThisSetOfFiltersLabel: "<%= Messages.WhatWouldYouLikeToNameThisSetOfFilters %>",
            findByXLabel: "<%= ScreenText.FindX %>",
            selectedXLabel: "<%= ScreenText.SelectedRooms %>",
            buildingsLabel: "<%= EmsParameters.BuildingTitlePlural %>",
            viewsLabel: "<%= ScreenText.Views %>",
            showAllAreasLabel: "<%= string.Format(ScreenText.ShowAllX, EmsParameters.AreaTitlePlural) %>",
            filterByAreaLabel: "<%= string.Format(ScreenText.FilterByX, EmsParameters.AreaTitleSingular) %>",
            searchForAnAreaLabel: "<%= string.Format(ScreenText.SearchForAnX, EmsParameters.AreaTitleSingular) %>",
            selectAllXLabel: "<%= ScreenText.SelectAllX %>",
            ungroupedBuildingsLabel: "<%= string.Format(ScreenText.UngroupedX, EmsParameters.BuildingTitlePlural) %>",
            requiredFilters: [
                    { filterName: "Locations", filterLabel: "<%= ScreenText.Locations %>", filterType: vems.browse.filterTypes.locationMultiSelect, value: [] },
            ],
            optionalFilters: [],
            onFilterModalSave: function (filterName, ids, descriptions) {
                if ($('#account-tabs .active a').data('bind').indexOf('Favorite') > -1) {
                    vems.account.viewModels.accountViewModel.favoritesViewModel.selectedLocationIds(ids);
                } else {
                    vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.Location = ids.join(',');
                    vems.account.viewModels.accountViewModel.personalizationViewModel.locationsDisplay(descriptions);
                }
            },
            filterChanged: function (filterValues, changedFilterName) {
                if (changedFilterName === "Locations") {
                    var locationFilterValues = $.grep(filterValues, function (v) { return v.filterName == "Locations"; })[0].value.split(',');
                    if (locationFilterValues.length === 1 && vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate() != undefined) {
                        var facilityRecord = $.grep(vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().LocationTimezones, function (v) { return v.Key == locationFilterValues[0]; });

                        if (facilityRecord.length === 1 && facilityRecord[0].Value > 0) {
                            vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.Timezone = facilityRecord[0].Value;
                            $('#template-time-zone').val(vems.account.viewModels.accountViewModel.personalizationViewModel.editedTemplate().TemplateDefaults.Timezone);
                        }
                    }
                }
            }
        });
    </script>
</asp:Content>
