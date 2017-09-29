<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true" Inherits="EditReservation" Title="<%$Resources:PageTitles, EditReservation %>"
    EnableViewState="false" CodeBehind="EditReservation.aspx.cs" %>

<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ Import Namespace="Dea.Ems.Web.Sites.VirtualEms" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" runat="Server">
    <style>
        .udf.child {
            margin-left: 25px;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <div id="editReservationContainer">
        <div class="events-loading-overlay">
            <img class="loading-animation" src="Images/Loading.gif" />
        </div>
        <%--<pre data-bind="text: ko.toJSON(templateRules().EventTypes, {}, 2)"></pre>--%>
        <div class="row" id="breadcrumb">
            <div class="col-md-6 col-xs-6">
                <a data-bind="attr: {'href': ReservationSummaryUrl() }"><i class="fa fa-chevron-left"></i>&nbsp;
                <span data-bind="html: breadcrumbText()"></span></a>
                <span class="grey-text" data-bind="text: '(' + ReservationId() + ')'"></span>
            </div>
            <div class="col-md-6 col-xs-6 text-right">
                <span class="float-right" style="padding-left: 15px">
                    <Dea:HelpButton runat="server" ID="VEMSEditReservation" CssClass="floatRight" LookupKey="VEMSEditReservation" ParentType="WebTemplate" />
                </span>
                <span class="float-right">
                    <button type="button" class="btn btn-primary" data-bind="click: function(){ return saveReservationDetails(); }"><%= ScreenText.SaveReservationDetails %></button>
                </span>
            </div>
        </div>

        <div class="form row" style="margin-top: 10px;" id="details">
            <div class="panel panel-default" id="event-details-panel">
                <div class="panel-heading"><%= string.Format(ScreenText.EventDetails, EmsParameters.EventsTitleSingular) %></div>
                <div class="panel-body">
                    <div class="row">
                        <div class="form-group col-md-3 col-sm-4 col-xs-12">
                            <label for="event-name" class="required"><%= string.Format(ScreenText.EventName, EmsParameters.EventsTitleSingular) %></label>
                            <input type="text" class="form-control" id="event-name" required="required" data-bind="textInput: reservationDetails.eventName">
                        </div>
                        <div class="form-group col-md-3 col-sm-4 col-xs-12">
                            <label for="event-type" class="required"><%= string.Format(ScreenText.EventType, EmsParameters.EventsTitleSingular) %></label>
                            <select class="form-control" id="event-type" required="required"
                                data-bind="options: templateRules().EventTypes, optionsText: function(item){ return vems.decodeHtml(item.Description); }, optionsValue: 'Id', value: reservationDetails.eventType"></select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel panel-default" id="group-panel">
                <div class="panel-heading"><%= string.Format(ScreenText.GroupDetails, Dea.Ems.Configuration.EmsParameters.GroupTitleSingular) %></div>
                <div class="panel-body">
                    <div class="row">
                        <div class="col-xs-12 col-md-3 form-group search-text-box">
                            <label for="availablegroups" class="required"><%= string.Format(EmsParameters.GroupTitleSingular) %></label>
                            <select class="form-control" style="display: inline;" id="availablegroups" name="availablegroups" required="required"
                                data-bind="options: Groups, optionsText: function(item) { return vems.decodeHtml(item.GroupName()); }, optionsValue: 'GroupId', value: reservationDetails.ChosenGroupId">
                            </select>
                        </div>
                        <div class="col-md-2 hidden-xs form-group" style="vertical-align: bottom; line-height: 25px;" data-bind="visible: templateRules().AllowAddGroups">
                            <div>&nbsp;</div>
                            <button class="btn btn-default" type="button" data-bind="click: function () { vems.addAGroupVM.show(); }">
                                <i class="fa fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col-xs-12 col-md-3 text-nowrap">
                            <label for="1stcontact" data-bind="text: ContactTitleComputed"></label>
                            <select class="form-control" id="1stcontact" name="1stcontact"
                                data-bind="options: Contacts, optionsText: function(item) { return vems.decodeHtml(item.Name); }, optionsValue: 'Id', value: reservationDetails.FirstContactId, enable: Contacts() && Contacts().length > 0">
                            </select>
                        </div>
                        <div class="col-xs-2 col-md-2 form-group" style="vertical-align: bottom; line-height: 25px;"
                            data-bind="visible: (templateRules().AllowAddContacts && (Groups().length > 0 && reservationDetails.ChosenGroupId() != 0))">
                            <div>&nbsp;</div>
                            <button class="btn btn-default hidden-xs" type="button" data-bind="click: function () { vems.addAContactVM.show(reservationDetails.ChosenGroupId()); }">
                                <i class="fa fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <div data-bind="visible: (reservationDetails.FirstContactId && $.isNumeric(reservationDetails.FirstContactId()))">
                        <%--Temp contanct is 0 for the id --%>
                        <div class="row" data-bind="visible: reservationDetails.FirstContactId()==0">
                            <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                <label for="1stContactName" data-bind="css: { required: reservationDetails.FirstContactId() == 0 }"><%= string.Format(ScreenText.ContactName, EmsParameters.FirstContactTitle ) %></label>
                                <input class="form-control" id="1stContactName" name="1stContactName" maxlength="50" type="text" data-bind="value: reservationDetails.FirstContactName, 
    click: function(){ if (reservationDetails.FirstContactId() == 0){ reservationDetails.FirstContactName('');} },
    attr: {'required': (reservationDetails.FirstContactId() == 0) ? 'required' : null }" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                <label for="1stContactPhone1" class="required" data-bind="text: reservationDetails.FirstPhoneOneLabelComputed, css: { required: templateRules().Parameters.ReservationsRequireContactPhone }"></label>
                                <input id="1stContactPhone1" class="form-control" type="text" data-bind="value: reservationDetails.FirstPhoneOne, attr: {'required': (templateRules().Parameters.ReservationsRequireContactPhone == true) ? 'required' : null }" />
                            </div>
                            <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                <label data-bind="text: reservationDetails.FirstPhoneTwoLabelComputed"></label>
                                <input class="form-control" type="text" data-bind="value: reservationDetails.FirstPhoneTwo" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                <label for="1stContactEmail" data-bind="css: { required: templateRules().Parameters.ReservationsRequireContactEmail }"><%= string.Format("{0} {1}", EmsParameters.FirstContactTitle, ScreenText.EmailAddress) %></label>
                                <input id="1stContactEmail" class="form-control" type="text" data-bind="value: reservationDetails.FirstEmail, attr: {'required': (templateRules().Parameters.ReservationsRequireContactEmail == true) ? 'required' : null}" />
                            </div>
                        </div>
                    </div>

                    <div class="row" data-bind="visible: templateRules().Parameters.ReservationsShowAltContact && AltContacts().length > 0">
                        <div class="form-group col-xs-12 col-md-3 text-nowrap">
                            <label for="2ndcontact"><%= EmsParameters.AlternateContactTitle %></label>
                            <select class="form-control" id="2ndcontact" name="2ndcontact"
                                data-bind="options: AltContacts, optionsText: function(item) { return vems.decodeHtml(item.Name); }, optionsValue: 'Id', value: reservationDetails.SecondContactId">
                            </select>
                        </div>
                    </div>
                    <div data-bind="visible: (templateRules().Parameters.ReservationsShowAltContact && reservationDetails.SecondContactId && $.isNumeric(reservationDetails.SecondContactId()))">
                        <%--Temp contanct is 0 for the id --%>
                        <div class="row" data-bind="visible: reservationDetails.SecondContactId()==0">
                            <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                <label for="2ndContactName"><%= string.Format(ScreenText.ContactName, EmsParameters.AlternateContactTitle ) %></label>
                                <input class="form-control" type="text" maxlength="50" id="2ndContactName"
                                    data-bind="value: reservationDetails.SecondContactName, attr: {'disabled': reservationDetails.SecondContactId() == -1},
    click: function(){ if (reservationDetails.SecondContactId() == 0){ reservationDetails.SecondContactName('');} }" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                <label data-bind="text: reservationDetails.SecondPhoneOneLabelComputed"></label>
                                <input class="form-control" type="text" data-bind="value: reservationDetails.SecondPhoneOne, attr: {'disabled': reservationDetails.SecondContactId() == -1}" />
                            </div>
                            <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                <label data-bind="text: reservationDetails.SecondPhoneTwoLabelComputed"></label>
                                <input class="form-control" type="text" data-bind="value: reservationDetails.SecondPhoneTwo, attr: {'disabled': reservationDetails.SecondContactId() == -1}" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group col-xs-12 col-md-3 text-nowrap">
                                <label><%= string.Format("{0} {1}", EmsParameters.AlternateContactTitle, ScreenText.EmailAddress) %></label>
                                <input class="form-control" type="text" data-bind="value: reservationDetails.SecondEmail, attr: {'disabled': reservationDetails.SecondContactId() == -1}" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div class="panel panel-default" id="udf-panel" data-bind="visible: (editReservationModel.userDefinedFields.Udfs && editReservationModel.userDefinedFields.Udfs().length > 0) || <%= ShowComment.ToString().ToLowerInvariant() %>">
                <div class="panel-heading"><%= ScreenText.AdditionalInformation %> </div>
                <div class="panel-body">
                    <div class="row" data-bind="visible: <%= ShowComment.ToString().ToLowerInvariant() %>">
                        <div class="form-group col-md-4 col-sm-8 col-xs-12">
                            <label for="comment"><%= CommentLabel %></label>
                            <textarea class="form-control" rows="3" id="comment" data-bind="value: reservationDetails.comment"></textarea>
                        </div>
                    </div>
                    <div class="row" data-bind="visible: editReservationModel.userDefinedFields.Udfs && editReservationModel.userDefinedFields.Udfs().length > 0">
                        <div class="col-md-4 col-sm-8 col-sx-12">
                            <div id="udf-container" data-bind='component: {name: "udf-display-component", params: editReservationModel.userDefinedFields.Udfs }'></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel panel-default" id="billing-panel" data-bind="visible: (ShowBillingReferences() || ShowPONumber()) ">
                <div class="panel-heading"><%= ScreenText.BillingInfo %></div>
                <div class="panel-body">
                    <div class="row">
                        <div class="col-md-2 col-xs-12" data-bind="visible: ShowBillingReferences()">
                            <div>
                                <label data-bind="css: { required: templateRules().Parameters.ReservationsBillingReferenceValidation >= 1 }"><%= string.Format(ScreenText.BillingReference, EmsParameters.BillingReferenceTitleSingular) %></label>
                                <div class="input-wrapper-for-icon">
                                    <input class="form-control" id="billingReference" type="text"
                                        data-bind="textInput: reservationDetails.billingReference, attr: {'required': (templateRules().Parameters.ReservationsBillingReferenceValidation >= 1) ? 'required' : null }" />
                                    <i class="fa fa-search input-icon-embed"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2 col-xs-12" data-bind="visible: ShowPONumber()">
                            <div>
                                <label data-bind="css: { required: templateRules().Parameters.ReservationsPOValidation >= 1 }"><%= string.Format(ScreenText.PONumber, EmsParameters.PONumberTitle) %></label>
                                <div class="input-wrapper-for-icon">
                                    <input class="form-control" id="PONumber" type="text"
                                        data-bind="textInput: reservationDetails.poNumber, attr: {'required': (templateRules().Parameters.ReservationsPOValidation >= 1) ? 'required' : null }" />
                                    <i class="fa fa-search input-icon-embed"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12 col-xs-12 text-right">
                    <span class="float-right">
                        <button type="button" class="btn btn-primary" data-bind="click: function(){ return saveReservationDetails(); }"><%= ScreenText.SaveReservationDetails %></button>
                    </span>
                </div>
            </div>


        </div>
        <div data-bind='component: { name: "add-a-group-modal", params: { 
    Groups: $root.Groups,
    templateId: templateRules().ProcessTemplateId,
    onCloseCallback: $root.onCloseAddGroup,
    ScreenText: { AddGroupsHeaderText: "<%= escapeQuotes(string.Format(ScreenText.GroupsYouCanBookFor, EmsParameters.GroupTitlePlural)) %>",
        GroupSearchPlaceHolder: "<%= escapeQuotes(string.Format(ScreenText.GroupNameContains, EmsParameters.GroupTitleSingular)) %>",
        GroupNameText: "<%= escapeQuotes(string.Format(EmsParameters.GroupTitleSingular)) %>",
        GroupTypeText: "<%= escapeQuotes(string.Format(ScreenText.GroupType, EmsParameters.GroupTitleSingular)) %>",
        RemoveText: "<%= escapeQuotes(ScreenText.ClickToRemove) %>",
        CityText: "<%= escapeQuotes(ScreenText.City) %>",
        NoMatchingGroupsText: "<%= escapeQuotes(string.Format(ScreenText.NoMatchingGroups, EmsParameters.GroupTitlePlural)) %>"
}
}}'>
        </div>

        <div data-bind='component: { name: "add-contacts-modal", params: { 
    Contacts: $root.reservationDetails.AddedContacts,
    templateId: templateRules().ProcessTemplateId,
    CanSetDefaultContact: templateRules().CanSetDefaultContact,
    onCloseCallback: onCloseContactsModal,
    ScreenText: { AddContactsHeaderText: "<%= escapeQuotes(string.Format(ScreenText.CurrentContacts, EmsParameters.FirstContactTitle)) %>",
        GroupSearchPlaceHolder: "<%= escapeQuotes(string.Format(ScreenText.GroupNameContains, EmsParameters.FirstContactTitle)) %>",
        NameText: "<%= escapeQuotes(string.Format(ScreenText.Name, EmsParameters.FirstContactTitle)) %>",
        PhoneField1Text: "<%= escapeQuotes(ScreenText.PhoneField1) %>",
        MakeDefaultText: "<%= escapeQuotes(ScreenText.MakeDefault) %>",
        ActiveText: "<%= escapeQuotes(ScreenText.Active) %>",
        AltPhoneText: "<%= escapeQuotes(ScreenText.AltPhone) %>",
        EmailText: "<%= escapeQuotes(ScreenText.Email) %>",
        IsDefaultText: "<%= escapeQuotes(ScreenText.IsDefault) %>",
        NoMatchingGroupsText: "<%= escapeQuotes(string.Format(ScreenText.NoMatchingGroups, EmsParameters.FirstContactTitle)) %>"  } } }'>
        </div>
    </div>
</asp:Content>
<asp:Content ID="jsBottomOfPage" ContentPlaceHolderID="bottomJSHolder" runat="server">
    <%= Scripts.Render("~/bundles/typeahead") %>
    <%= Scripts.Render("~/bundles/edit-reservation") %>
    <%= Scripts.Render("~/bundles/user-defined-fields") %>
    <script type="text/javascript">
        vems.browse.addRemoveLabel = "<%= escapeQuotes(ScreenText.AddRemove) %>";

        vems.screentext.FirstContactTitle = '<%= escapeQuotes(EmsParameters.FirstContactTitle) %>';
        vems.screentext.InstructorTitle = '<%= escapeQuotes(ScreenText.Instructor) %>';
        
        vems.screentext.AlternateContactTitle = '<%= escapeQuotes(EmsParameters.AlternateContactTitle) %>';
        vems.screentext.NoInfoLabel = '<%= escapeQuotes(ScreenText.NoStatusInformation) %>';
        vems.screentext.BackToSummaryText = '<%= escapeQuotes(ScreenText.BackToSummary) %>';
        vems.screentext.addRemoveLabel = "<%= escapeQuotes(ScreenText.AddRemove) %>";
        vems.screentext.breadcrumbLabel = '<%= escapeQuotes(ScreenText.XBeginningY) %>';

        vems.screentext.AddGroupsHeaderText = "<%= escapeQuotes(ScreenText.GroupsYouCanBookFor) %>";
        vems.screentext.GroupSearchPlaceHolder= "<%= escapeQuotes(ScreenText.GroupNameContains) %>";
        vems.screentext.GroupNameText= "<%= escapeQuotes(ScreenText.GroupName) %>";
        vems.screentext.GroupTypeText= "<%= escapeQuotes(ScreenText.GroupType) %>";
        vems.screentext.RemoveText= "<%= escapeQuotes(ScreenText.ClickToRemove) %>";
        vems.screentext.CityText= "<%= escapeQuotes(ScreenText.City) %>";
        vems.screentext.NoMatchingGroupsText = "<%= escapeQuotes(ScreenText.NoMatchingGroups) %>";
        vems.screentext.IsRequiredMessage = '<%= escapeQuotes(Messages.IsRequiredFormat) %>';
        vems.editReservation.eventNameMaxLength = <%= EmsParameters.EventNameMaxLength %>;

        var editReservationModel;

        var res  = <%= ReservationVM %>;
        var groups = <%= AvailableGroups %>;
        var contacts = <%= AvailableContacts %>;
        var altContacts = <%= AltContacts %>;
        var templateRules = <%= TemplateRules %>;

        $(document).ready(function () {
            if(DevExpress.devices.real().phone){
                $('#breadcrumb').hide();
            }

            editReservationModel = new editReservationViewModel(templateRules, res, groups);

            ko.mapping.fromJS(groups, {}, editReservationModel.Groups);
            editReservationModel.Contacts(contacts);                     
            editReservationModel.AltContacts(altContacts);
            if(templateRules != null){
                editReservationModel.userDefinedFields = new vems.userDefinedFieldViewModel( <%= UserDefinedFields %>);
                editReservationModel.udfAnswers = <%= UdfAnswers %>;

                editReservationModel.setupTypeValidation(templateRules.Parameters.SetupTypeValidation);
            }
            
            ko.applyBindings(editReservationModel, $('#editReservationContainer')[0]);
            initializePlugins();            

            if(window.location.href.indexOf('ai=1') > -1 && $('#udf-panel').is(':visible')){
                setTimeout(function(){
                    $(document).scrollTop($('#udf-panel').position().top);
                }, 250);
            }
        });

        function initializePlugins() {

            if (editReservationModel.ShowPONumber() && editReservationModel.templateRules().Parameters.ShowPONumberLookup){
                $("#PONumber").poLookup({
                    ScreenText: {
                        NoMatchingResults: "<%= escapeQuotes(ScreenText.NoMatchingItems) %>",
                        PONumberText : "<%= escapeQuotes(EmsParameters.PONumberTitle) %>",
                        DescriptionText : "<%= escapeQuotes(ScreenText.Description) %>",
                        NotesText : "<%= escapeQuotes(ScreenText.Notes) %>"
                    },
                    callBack: function(po) {
                        editReservationModel.reservationDetails.poNumber(po.PONumber);
                    }
                }); 
            }
            if (editReservationModel.templateRules() && !editReservationModel.templateRules().Parameters.ShowPONumberLookup){
                $("#PONumber").parent().find(".input-icon-embed").hide();
            }
            if (editReservationModel.templateRules() && editReservationModel.templateRules().Parameters.ShowBillingReferenceLookup){
                $("#billingReference").BillingRefLookup({
                    ScreenText: {
                        NoMatchingResults: "<%= escapeQuotes(ScreenText.NoMatchingItems) %>",
                        BillingReferenceText : "<%= escapeQuotes(EmsParameters.BillingReferenceTitleSingular) %>",
                        DescriptionText : "<%= escapeQuotes(ScreenText.Description) %>",
                        NotesText : "<%= escapeQuotes(ScreenText.Notes) %>"
                    },
                    callBack: function(data) {
                        editReservationModel.reservationDetails.billingReference(data.BillingReference);
                    }
                });
            }
            if (editReservationModel.templateRules() && !editReservationModel.templateRules().Parameters.ShowBillingReferenceLookup){
                $("#billingReference").parent().find(".input-icon-embed").hide();
            }

            //if (editReservationModel.reservationDetails.ChosenGroupId() > 0)
            //    editReservationModel.setGroupContacts(editReservationModel.reservationDetails.ChosenGroupId(), editReservationModel.templateRules().ProcessTemplateId, editReservationModel.reservationDetails.FirstContactId());
            
            $("#event-name").focus();
            //this needs to be here so that the initial load doesn't get overwritten
            editReservationModel.reservationDetails.FirstContactId.subscribe(function (newValue) {
                editReservationModel.setFirstContactInfo(newValue);
            });
        }

        vems.onUdfInit = function(){
            $('.udf .multiselect-container').each(function(i, v){
                var udfId = $(v).find('.multiselect-value-container').attr('id');

                var udf = $.grep(editReservationModel.userDefinedFields.Udfs(), function(val){
                    return val.Id() == udfId;
                });

                if(udf.length > 0){
                    var items = udf[0].Answer().split(',');

                    $.each(items, function(index, value){
                        $('#' + value).click();
                    });
                }
            });
        };
    </script>
</asp:Content>
