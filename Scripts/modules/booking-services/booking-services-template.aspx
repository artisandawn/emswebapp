<%@ Import Namespace="Resources" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<div id="services-body" style="margin-top: 10px;" data-bind="visible: Services">
    <div class="row" data-bind="visible: Services().UnavailableCategories().length > 0 && Services().AvailableCategories().length == 0" style="margin-top: 10px; font-size: 18px;">
        <div class="col-md-12 text-center">
            <span data-bind="html: GenericUnavailableMessage"></span>
            <ul data-bind="foreach: Services().UnavailableCategories" style="display: inline-block;">
                <li data-bind="html: UnavailableMessage"></li>
            </ul>
        </div>
    </div>
    <div class="row" data-bind="visible: Services().UnavailableCategories().length == 0 && Services().AvailableCategories().length == 0" style="margin-top: 10px; font-size: 18px;">
        <div class="col-md-12 text-center">
            <%--<div><%=Messages.NoCategoriesAvailableForThisLocation %></div>--%>
            <span data-bind="html: GenericUnavailableMessage"></span>
        </div>
    </div>

    <div class="row" data-bind="visible: Services().AvailableCategories().length > 0">
        <div class="col-md-12">
            <div class="row">
                <div class="col-md-6 " id="services-menu-wrapper">
                    <div data-bind="visible: Services().UnavailableCategories().length > 0 && Services().AvailableCategories().length > 0">
                        <div data-bind="foreach: Services().UnavailableCategories()">
                            <div class="date-time-header">
                                <span data-bind="html: vems.decodeHtml(CategoryDescription)"></span>
                            </div>
                            <div class="row">
                                <div class="col-md-12 services-unavailable" data-bind="html: UnavailableMessage"></div>
                            </div>
                        </div>
                    </div>

                    <div data-bind="foreach: { data: Services().AvailableCategories(), afterRender: categoriesRendered }" id="category-list">
                        <!-- ko if: ((ResourceCategoryTypeCode() == 'RSO' || ResourceCategoryTypeCode() == 'RES' || ResourceCategoryTypeCode() == 'CAT') && CategoryGroups && CategoryGroups().length > 0) || ResourceCategoryTypeCode() == 'NOT' || ResourceCategoryTypeCode() == 'ATT' -->
                        <div class="date-time-header" data-bind="attr:{'id': 'catheader-'+CategoryId()+'-'+InstanceCount()}">
                            <span data-bind="html: vems.decodeHtml(CategoryDescription())"></span>
                            <a class="fa fa-question-circle help-text-icon" data-helptextkey="VEMSCategoryGroupsHelp" data-parenttype="Category" data-bind="visible: ShowHelpText(), attr: { 'data-parentid': CategoryId() }"></a>
                            <span style="margin-left: 10px;" data-bind="visible: InstanceCount() > 0, text: '('+(InstanceCount()+1)+')'"></span>
                            <a style="margin-left: 10px;" data-bind="visible: TermsAndConditions.length > 0, 
    click: function(){ vems.bookingServicesVM.popTandCs(TermsAndConditions()); }, attr:{'href': '#tc'+CategoryId(), 'id': 'tc'+CategoryId()}"
                                class="service-TandC">(<%= ScreenText.TermsAndConditions %>)</a>
                            <!-- ko if: false -->
                            <%--NOTE: This logic is hidden until database saving of copied service orders is working (ko if: InstanceCount() == 0)--%>
                            <a style="margin-right: 15px;" class="pull-right" data-bind="visible: ResourceCategoryTypeCode()=='CAT' || ResourceCategoryTypeCode()=='RSO', 
    attr:{'href': '#copy'+CategoryId(), 'id': 'copy'+CategoryId()}, click: function(){ vems.bookingServicesVM.copyCategory($data.CategoryId()); }">
                                <i class="fa fa-plus" style="margin-right: 5px; padding-top: 5px"></i><%= string.Format(ScreenText.AddAnother, ScreenText.ServiceSingular) %></a>
                            <!-- /ko -->
                        </div>
                        <div class="category-body" data-bind="attr:{'id': 'category-'+CategoryId()+'-'+InstanceCount()}">
                            <div class="services-overlay-lock">
                                <span style="white-space: pre-line;"></span>
                            </div>
                            <div class="add-services-lock" data-bind="attr:{'id': 'addlock-'+CategoryId()+'-'+InstanceCount()}"></div>
                            <div class="lockable-area">
                                <%--Service order section--%>
                                <table class="table bottom-aligned" data-bind="visible: AvailableService()" style="margin-bottom: 10px;">
                                    <tr>
                                        <td class="time-container" style="width: 25%">
                                            <div class="">
                                                <label data-bind="attr:{'for': 'start'+CategoryId()+'-'+InstanceCount()}"><%= ScreenText.StartTime %></label>
                                                <div class="date input-group" data-bind="timePicker: ServiceStartTime, 
    datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %>},
    attr:{'id': 'start'+CategoryId()+'-'+InstanceCount()}">
                                                    <input type="text" class="form-control" />
                                                    <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style="width: 25%">
                                            <div class="end-container">
                                                <label data-bind="attr:{'for': 'end'+CategoryId()+'-'+InstanceCount()}">
                                                    <%= ScreenText.EndTime %></label>
                                                <div class="date input-group" data-bind="timePicker: ServiceEndTime, 
    datepickerOptions: { format: 'LT', showClose: true, stepping: <%= EmsParameters.MinuteIncrement %>},
    attr:{'id': 'end'+CategoryId()+'-'+InstanceCount()}">
                                                    <input type="text" class="form-control" />
                                                    <span class="input-group-addon"><span class="fa fa-clock-o"></span></span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style="width: 35%">
                                            <label data-bind="attr:{'for': 'type'+CategoryId()+'-'+InstanceCount()}"><%= ScreenText.ServiceType %></label>
                                            <select class="form-control"
                                                data-bind="value: ServiceChosenServiceType, options: CategoryServices, 
    optionsText: function(item){ return vems.decodeHtml(item.Description()); }, optionsValue: 'Id', 
    attr:{'id': 'type'+CategoryId()+'-'+InstanceCount()}">
                                            </select>
                                        </td>
                                        <td style="width: 25%" data-bind="visible: ResourceCategoryTypeCode() == 'CAT'">

                                            <label data-bind="attr:{'for': 'estcnt'+CategoryId()+'-'+InstanceCount()}"><%= ScreenText.EstimatedCount %></label>
                                            <input type='text' class='form-control' data-bind="textInput: ServiceEstimatedCount, 
    attr:{'id': 'estcnt'+CategoryId()+'-'+InstanceCount()}" />
                                        </td>
                                    </tr>
                                </table>
                                <%--End of Service Order Section--%>
                                <div class="row category-udfs" data-bind="visible: UserDefinedFields && UserDefinedFields().length > 0">
                                    <div class="col-md-6 col-sm-8 col-xs-12">
                                        <%--NOTE: the id property of the below component MUST remain as-is for service udf component to work correctly--%>
                                        <div data-bind="attr: { 'id': 'udf-' + CategoryId() + '-' + InstanceCount() }, 
                                            component: { 
                                                name: 'service-udf-component', 
                                                params: {
                                                    udfs: UserDefinedFields(),
                                                    udfAnswers: UdfAnswers(),
                                                    screenText: {
                                                        addRemoveLabel: '<%= ScreenText.AddRemove %>'
                                                    }
                                                } }">
                                        </div>
                                    </div>
                                </div>
                                <div class="row save-so-buttons" style="display: none;">
                                    <div class="col-md-12 text-right">
                                        <button type="button" class="btn btn-primary" data-bind="text: $parent.ScreenText.SaveChangesText, click: function(){ $parent.saveServiceOrderChanges($data);}"></button>
                                        <button type="button" class="btn btn-default" data-bind="text: $parent.ScreenText.CancelText, click: function(){ $parent.cancelServiceOrderChanges($data);}"></button>
                                    </div>
                                </div>
                            </div>
                            <%--End of lockable area--%>

                            <!-- ko if: ResourceCategoryTypeCode() == 'NOT' -->
                            <textarea class="form-control" rows="3" data-bind="textInput: WrittenNotes, attr: {'id': 'notes'+CategoryId()}"></textarea>
                            <div style="padding-top: 5px; display: none;" class="text-right note-actions" data-bind="attr: {'id': 'notes-action'+CategoryId()}">
                                <span>
                                    <button type="button" class="btn btn-primary notes-save" data-bind="text: $parent.ScreenText.SaveChangesText, click: $parent.notesSave"></button>
                                </span>
                                <span>
                                    <button type="button" class="btn btn-default notes-cancel" data-bind="text: $parent.ScreenText.CancelText, click: $parent.notesCancel"></button>
                                </span>
                            </div>
                            <!-- /ko -->

                            <!-- ko if: ResourceCategoryTypeCode() == 'ATT' -->
                            <div>
                                <div data-bind="visible: Attendees().length > 0">
                                    <div class="row sortable-grid-header" id="catattendee-grid-header">
                                        <div class="row">
                                            <div class="col-md-2 mobile-ellipsis-text grid-text"></div>
                                            <div id="catattendee-grid-header-name" class="col-md-2 mobile-ellipsis-text grid-text"
                                                data-bind="click: function () { vems.bookingServicesVM.sortAttendees('name'); }">
                                                <%= EmsParameters.AttendeeNameLabel %>
                                            </div>
                                            <div id="catattendee-grid-header-companyname" class="col-md-2  mobile-ellipsis-text grid-text">
                                                <%= EmsParameters.AttendeeCompanyLabel %>
                                            </div>
                                            <div id="catattendee-grid-header-emailaddress" class="col-md-2  mobile-ellipsis-text grid-text">
                                                <%= EmsParameters.AttendeeEmailLabel %>
                                            </div>
                                            <div id="catattendee-grid-header-phone" class="col-md-2  mobile-ellipsis-text grid-text">
                                                <%= EmsParameters.AttendeePhoneLabel %>
                                            </div>
                                            <div id="catattendee-grid-header-visitor" class="col-md-2  mobile-ellipsis-text grid-text">
                                                <%= EmsParameters.AttendeeVisitorLabel %>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="booking-grid row">
                                        <div id="catattendee-grid" class="sortable-grid-content" data-bind="foreach: Attendees()">
                                            <%--<pre data-bind="text: ko.toJSON($data, null, 2)"></pre>--%>
                                            <div class="row">
                                                <div class="col-md-2  mobile-ellipsis-text grid-text-center">
                                                    <a data-bind="click: function(){vems.bookingServicesVM.removeAttendee($data, $parent);}">
                                                        <i class="fa fa-times-circle grid-icon"></i>
                                                    </a>
                                                </div>
                                                <div class="col-md-2  mobile-ellipsis-text grid-text">
                                                    <a data-bind="html: $data.AttendeeName, click: function(){vems.bookingServicesVM.addServiceAttendee($parent, $data);}"></a>
                                                </div>
                                                <div class="col-md-2  mobile-ellipsis-text grid-text" data-bind="html: $data.CompanyName"></div>
                                                <div class="col-md-2  mobile-ellipsis-text grid-text" data-bind="html: $data.EmailAddress"></div>
                                                <div class="col-sm-2 hidden-xs mobile-ellipsis-text grid-text" data-bind="html: $data.Phone"></div>
                                                <div class="col-sm-2 hidden-xs mobile-ellipsis-text grid-text">
                                                    <input type="checkbox" data-bind="checked: $data.ExternalAttendee" disabled />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <button class="btn btn-primary" data-bind="click: function(){vems.bookingServicesVM.addServiceAttendee($data);}, 
    text: vems.bookingServicesVM.ScreenText.AddCategoryAttendeeText.replace('{0}', CategoryDescription())"
                                        type="button">
                                    </button>
                                </div>
                            </div>
                            <!-- /ko -->
                            <%--end of ATT type--%>

                            <!-- ko if: TermsAndConditions && TermsAndConditions().length > 0 -->
                            <div class="row" style="margin: 15px 0;">
                                <div class="col-xs-12">
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" class="services-tcs" required="required" data-bind="checked: TermsAndConditionsChecked, TandCChecked: TermsAndConditionsChecked">
                                            <span><%= ScreenText.IHaveReadAndAgreeToThe %> <a href="#" data-bind="click: function(){ vems.bookingServicesVM.popTandCs(TermsAndConditions()); }"><%= ScreenText.TermsAndConditions %></a></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <!-- /ko -->

                            <!-- ko if: ResourceCategoryTypeCode() == 'RSO' || ResourceCategoryTypeCode() == 'RES' || ResourceCategoryTypeCode() == 'CAT' -->
                            <div class="category-group-container" data-bind="foreach: CategoryGroups()">
                                <div class="panel panel-default service-panel" data-bind="attr: { 'id': 'panelhead-' + CategoryId() +'-'+$parent.InstanceCount()}">
                                    <div class="panel-heading" role="tab">
                                        <div class="panel-title">
                                            <a role="button" data-toggle="collapse" data-parent="#category-list" data-bind="css:{collapsed: !$parent.ExpandGroupings()}, 
    attr: { 'href': '#panel-' + CategoryId() + '-' + CategoryGroupId()+'-'+$parent.InstanceCount(), 'aria-expanded': $parent.ExpandGroupings(),
        'aria-controls': '#panel-' + CategoryId() + '-' + CategoryGroupId()}">
                                                <span data-bind="html: GroupDescription()"></span>
                                                <i class="pull-right fa" data-bind="css: { 'fa-angle-up': !$parent.ExpandGroupings(), 'fa-angle-down': $parent.ExpandGroupings() }"></i>
                                            </a>
                                        </div>
                                    </div>
                                    <div class="panel-body panel-collapse collapse" role="tabpanel" aria-labelledby="service-panel" data-bind="attr: { 
    'id': 'panel-' + CategoryId() + '-' + CategoryGroupId()+'-'+$parent.InstanceCount(), 'aria-expanded': $parent.ExpandGroupings() }, css:{'in': $parent.ExpandGroupings()}">
                                        <div class="category-group">
                                            <!-- ko foreach: Resources -->
                                            <div class="col-md-6 resource-cell ellipsis-text" data-bind="css: {'bottom-row': $index() >= $parent.Resources().length - 1}">
                                                <!-- ko if: $parents[2].isResourceAvailable(ResourceId(), $parents[1].CategoryId(), $parents[1].InstanceCount()) && !Excluded() -->
                                                <a class="clickable" data-bind="text: vems.decodeHtml(ResourceDescription()), click: function(){$parents[2].popResourceModal(ResourceId(), null, $parents[1]);}"></a>
                                                <!-- /ko -->
                                                <!-- ko if: !$parents[2].isResourceAvailable(ResourceId(), $parents[1].CategoryId(), $parents[1].InstanceCount()) || Excluded() -->
                                                <span data-bind="text: vems.decodeHtml(ResourceDescription())"></span>
                                                <!-- /ko -->
                                            </div>
                                            <!-- ko if: $parent.Resources().length % 2 !== 0 && $index() === $parent.Resources().length - 1 -->
                                            <div class="col-md-6 resource-cell ellipsis-text" data-bind="css: {'bottom-row': $index() >= $parent.Resources().length - 1}">
                                                <a>&nbsp;</a>
                                            </div>
                                            <!-- /ko -->
                                            <!-- /ko -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- /ko -->
                        </div>
                        <!-- /ko -->
                    </div>
                    <%--End of Category loop--%>

                    <div id="services-billing-panel" data-bind="visible: vems.bookingServicesVM.ShowBillingReferences() || vems.bookingServicesVM.ShowPONumber()">
                        <div class="date-time-header"><%= ScreenText.BillingInfo %></div>
                        <div class="category-body">
                            <div class="row">
                                <div class="col-md-4 col-xs-12" data-bind="visible: vems.bookingServicesVM.ShowBillingReferences()">
                                    <div>
                                        <label for="services-br" data-bind="css: { required: vems.bookingServicesVM.BillingReferenceRequired() }">
                                            <%= string.Format(ScreenText.BillingReference, EmsParameters.BillingReferenceTitleSingular) %>
                                        </label>
                                        <div class="input-wrapper-for-icon">
                                            <input class="form-control billingReference-input" type="text" name="services-br" 
                                                data-bind="textInput: billingReference" />
                                            <i class="fa fa-search input-icon-embed"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 col-xs-12" data-bind="visible: vems.bookingServicesVM.ShowPONumber()">
                                    <div>
                                        <label for="services-po" data-bind="css: { required: vems.bookingServicesVM.PoNumberRequired() }">
                                            <%= string.Format(ScreenText.PONumber, EmsParameters.PONumberTitle) %>
                                        </label>
                                        <div class="input-wrapper-for-icon">
                                            <input class="form-control PONumber-input" type="text" name="services-po"
                                                data-bind="textInput: poNumber" />
                                            <i class="fa fa-search input-icon-embed"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="col-md-6 services-summary-wrapper">
                    <div class="date-time-header" style="margin-bottom: 0"><%= ScreenText.ServicesSummary %></div>
                    <div class="services-summary">                        
                        <div data-bind="foreach: serviceOrders()">
                            <!-- ko if: CategoryObj() -->
                            <div class="row" data-bind="visible: CategoryTypeCode() !== CategoryTypeCodes.ATT && CategoryTypeCode() !== CategoryTypeCodes.NOT">
                                <div class="col-md-12">
                                    <div class="row service-summ-header" data-bind="attr: {'id': 'summhead-'+CategoryObj().CategoryId()+'-'+CategoryObj().InstanceCount()}">
                                        <div class="col-md-12">
                                            <a class="actionlink" style="margin-right: 15px;" data-bind="click: function(){ $parent.removeServiceOrder($data); }, visible: $parent.isCategoryAvailable(CategoryId())">
                                                <i class="fa fa-minus-circle"></i>
                                            </a>
                                            <span class="ellipsis-text" data-bind="text: $parent.getSummaryHeaderText($data)"></span>
                                            <a class="actionlink" style="margin-left: 10px" data-bind="click: function(){ $parent.editServiceOrder($data); }, visible: CategoryTypeCode() === CategoryTypeCodes.RSO || CategoryTypeCode() === CategoryTypeCodes.CAT || HasUdfs() && $parent.isCategoryAvailable(CategoryId()) ">
                                                <i class="fa fa-pencil"></i>
                                            </a>
                                        </div>
                                    </div>
                                    <div class="service-summ-resources" data-bind="foreach: ServiceOrderDetails()">
                                        <div class="row summary-row">
                                            <div class="col-sm-1">
                                                <a class="actionlink" data-bind="click: function(){ $parent.removeServiceOrderResource($data); }, visible: $parents[1].isCategoryAvailable($parent.CategoryId())">
                                                    <i class="fa fa-minus-circle"></i>
                                                </a>
                                            </div>
                                            <div class="col-sm-1" data-bind="html: Quantity()">
                                            </div>
                                            <div class="col-sm-6">
                                                <!-- ko if: $parents[1].isCategoryAvailable($parent.CategoryId()) -->
                                                <a class="actionlink" data-bind="click: function(){ $parents[1].popResourceModal($data.ResourceId(), $data, $parent.CategoryObj(), true); }">
                                                    <span class="ellipsis-text" data-bind="html: vems.decodeHtml(ResourceDescription())"></span><i style="margin-left: 10px" class="fa fa-pencil"></i>
                                                </a>
                                                <!-- /ko -->
                                                <!-- ko ifnot: $parents[1].isCategoryAvailable($parent.CategoryId()) -->
                                                <span class="ellipsis-text" data-bind="html: vems.decodeHtml(ResourceDescription())"></span>
                                                <!-- /ko -->
                                            </div>
                                            <div class="col-sm-4 text-right" data-bind="text: vems.decodeHtml(ResourcePrice())">
                                            </div>
                                        </div>
                                        <div class="row summary-row summary-details" data-bind="visible: SpecialInstructions()">
                                            <div class="col-sm-2"></div>
                                            <div class="col-sm-8 grey-text">
                                                <div data-bind="text: SpecialInstructions, attr:{ title: SpecialInstructions }" style="white-space: pre; overflow: hidden; text-overflow: ellipsis"></div>
                                            </div>
                                            <div class="col-sm-2"></div>
                                        </div>
                                        <div class="row summary-row summary-details" data-bind="visible: $data.ResourceMessage && $data.ResourceMessage()">
                                            <div class="col-sm-2"></div>
                                            <div class="col-sm-8 grey-text">
                                                <span data-bind="text: $data.ResourceMessage"></span>
                                            </div>
                                            <div class="col-sm-2"></div>
                                        </div>
                                        <div class="row summary-row summary-details" data-bind="visible: ResourceGroups().length > 0">
                                            <div class="col-sm-2"></div>
                                            <div class="col-sm-8" data-bind="foreach: ResourceGroups">
                                                <div class="col-sm-4 summary-resource-group">
                                                    <span data-bind="text: Description"></span>
                                                    <br />
                                                    <ul class="grey-text" data-bind="foreach: ResourceItems">
                                                        <!-- ko if: IsSelected() -->
                                                        <li data-bind="text: Description"></li>
                                                        <!-- /ko -->
                                                    </ul>
                                                </div>
                                            </div>
                                            <div class="col-sm-2"></div>
                                        </div>
                                        <div class="row summary-details" data-bind="visible: PackageResources().length > 0">
                                            <div class="col-sm-2"></div>
                                            <div class="col-sm-8 summary-resource-group"> 
                                                <span><%= ScreenText.PackageIncludes %></span>
                                                    <br />                                                                                                   
                                                    <ul class="grey-text" data-bind="foreach: PackageResources">                                                        
                                                        <li><span data-bind="text: Quantity"></span>&nbsp;-&nbsp;<span data-bind="html: ResourceDescription"></span></li>
                                                    </ul>                                                
                                            </div>
                                            <div class="col-sm-2"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- /ko -->
                        </div>
                        <%--End of ServiceOrders loop--%>
                    </div>
                    <div class="row summary-subtotal" style="display: none;">
                        <div class="col-md-6"><%= ScreenText.ServicesSubtotal %>:</div>
                        <div class="col-md-4"></div>
                        <div class="col-md-2 summary-subtotal-price" data-bind="currency: PriceSubtotal()"></div>
                    </div>
                    <button class="btn btn-primary next-step-btn" data-bind="click: $parent.nextStepClicked, text: ScreenText.NextStepText, visible: $parent.showNextStep"></button>
                </div>
                <%--End of Service summary wrapper column--%>
            </div>
        </div>
    </div>
    <!-- resource modal -->
    <div class="modal fade resource-modal" id="resource-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content" id="resource-modal-content" data-bind="visible: activeResource()">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                     <a class="fa fa-question-circle help-text-icon" data-helptextkey="VEMSResourceDetailsHelp" data-parenttype="None" data-parentid="0" data-bind="visible: vems.bookingServicesVM.resourceHelpText().length > 0"></a>
                    <h3 class="modal-title">
                        <span data-bind="text: vems.decodeHtml(activeResource().ResourceDescription)"></span>
                        <!-- ko if: activeResource().Serves > 0 -->
                        <span data-bind="text: ' (' + ScreenText.ServesText + ' ' + activeResource().Serves + ')'"></span>
                        <!-- /ko -->
                        <!-- ko if: activeResource().ResourcePrice -->
                        <span data-bind="text: ' - ' + vems.decodeHtml(activeResource().ResourcePrice)"></span>
                        <!-- /ko -->
                    </h3>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <!-- ko if: activeResource().Images && activeResource().Images.length > 0 -->
                        <div id="resource-image-container" class="col-xs-3">
                            <img id="resource-image" class="resource-image" data-bind="attr: { src: 'data:image/png;base64,' + activeResource().Images[0].BinaryData.toString() }" />
                            <div id="resource-image-overlay" data-bind="click: popResourceImageModal">
                                <i class="fa fa-search-plus"></i>
                            </div>
                        </div>
                        <!-- /ko -->
                        <div data-bind="css: { 'col-xs-9': activeResource().Images && activeResource().Images.length > 0, 'col-xs-12': !activeResource().Images || activeResource().Images.length === 0}">
                            <span data-bind="text: vems.decodeHtml(activeResource().Notes)"></span>
                            <br />
                            <!-- ko if: activeSod().PackageResources && activeSod().PackageResources().length > 0 -->
                            <div class="package-resource-list">
                                <!-- ko foreach: activeSod().PackageResources -->
                                <span data-bind="text: Quantity() + ' ' + vems.decodeHtml(ResourceDescription())"></span>
                                <br />
                                <!-- /ko -->
                            </div>
                            <!-- /ko -->
                            <button class="btn btn-default btn-main" data-bind="click: activeSod().decrementActiveQuantity, enable: activeSod().Quantity() > activeResource().MinQuantity">
                                <i class="fa fa-minus"></i>
                            </button>
                            <input class="form-control quantity-input" id="resource-quantity-input" data-bind="value: activeSod().Quantity" />
                            <button class="btn btn-default btn-main" data-bind="click: activeSod().incrementActiveQuantity, enable: !activeResource().QuantityAvailable || (activeSod().Quantity() < activeResource().QuantityAvailable)">
                                <i class="fa fa-plus"></i>
                            </button>
                            <span class="quantity-label">
                                <!-- ko if: activeResource().MinQuantity > 1 -->
                                <span data-bind="text: ' (' + ScreenText.MinText + ' ' + activeResource().MinQuantity + ')'"></span>
                                <!-- /ko -->
                                <!-- ko if: activeResource().QuantityAvailable > 0 -->
                                <span data-bind="text: ' (' + ScreenText.AvailableInventoryText + ': ' + activeResource().QuantityAvailable + ')'"></span>
                                <!-- /ko -->
                            </span>
                        </div>
                    </div>
                    <!-- ko if: activeSod().ResourceGroups && activeSod().ResourceGroups().length > 0 -->
                    <!-- ko foreach: activeSod().ResourceGroups -->
                    <div class="row resource-group-row">
                        <div class="col-xs-12">
                            <span class="special-instructions-label" data-bind="text: vems.decodeHtml(Description()) + ' (' + $parent.ScreenText.SelectionInstructionsMessage.replace('{0}', MinPick()).replace('{1}', MaxPick()) + ')'"></span>
                            <div class="row col-xs-12 selection-section">
                                <!-- ko foreach: ResourceItems -->
                                <div class="col-xs-4 selection-item">
                                    <i class="fa" data-bind="css: { 'fa-square-o': !IsSelected(), 'fa-check-square-o': IsSelected(), 'disabled-text': $parent.disableSelection() && !IsSelected() }, click: $parent.disableSelection() && !IsSelected() ? null : toggleItemSelection, "></i>
                                    <span data-bind="text: vems.decodeHtml(Description()), css: { 'disabled-text': $parent.disableSelection() && !IsSelected() }"></span>
                                    <!-- ko if: Notes() -->
                                    <br />
                                    <span class="selection-notes" data-bind="text: vems.decodeHtml(Notes())"></span>
                                    <!-- /ko -->
                                </div>
                                <!-- /ko -->
                            </div>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- /ko -->
                    <!-- ko ifnot: activeResource().WebHideSpecialInstructions -->
                    <div class="row special-instructions-row">
                        <label class="control-label special-instructions-label" for="special-instructions" data-bind="text: ScreenText.SpecialInstructionsText"></label>
                        <textarea name="special-instructions" class="form-control" rows="3" data-bind="value: activeSod().SpecialInstructions"></textarea>
                    </div>
                    <!-- /ko -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="resource-btn-ok" data-bind="text: ScreenText.OkText, click: resourceModalOk, enable: activeSod().enableOk"></button>
                    <button type="button" class="btn btn-default" id="resource-btn-cancel" data-dismiss="modal" data-bind="text: ScreenText.CancelText"></button>
                </div>
            </div>
        </div>
    </div>

    <!-- attendee modal -->
    <div class="modal fade resource-modal" id="attendee-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content" id="attendee-modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h3 class="modal-title">
                        <%= ScreenText.AddCategoryAttendee %>
                    </h3>
                </div>
                <div class="modal-body">
                    <input type="hidden" name="resourceid" />
                    <div class="row">
                        <div class="col-xs-6">
                            <label for="attendee-name" class="required"><%= EmsParameters.AttendeeNameLabel %></label>
                            <input type="text" id="attendee-name" name="attendee-name" class="form-control" required="required" />
                        </div>
                        <div class="col-xs-6">
                            <label for="attendee-companyname"><%= EmsParameters.AttendeeCompanyLabel %></label>
                            <input name="attendee-companyname" class="form-control" />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-xs-6">
                            <label for="attendee-email"><%= EmsParameters.AttendeeEmailLabel %></label>
                            <input type="email" name="attendee-email" class="form-control" />
                        </div>
                        <div class="col-xs-6">
                            <label for="attendee-phone"><%= EmsParameters.AttendeePhoneLabel %></label>
                            <input name="attendee-phone" class="form-control" />
                        </div>
                    </div>
                    <div class="row col-xs-12 special-instructions-row">
                        <label class="control-label special-instructions-label" for="attendee-notes"><%= EmsParameters.AttendeeNotesLabel %></label>
                        <textarea name="attendee-notes" class="form-control" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="checkbox pull-left">
                        <label>
                            <input type="checkbox" name="attendee-visitor" data-bind="checked: false ">
                            <%= EmsParameters.AttendeeVisitorLabel %>
                        </label>
                    </div>
                    <button type="button" class="btn btn-primary" id="attendee-btn-ok" data-bind="text: ScreenText.OkText, click: function(){vems.bookingServicesVM.saveCategoryAttendee();}"></button>
                    <button type="button" class="btn btn-default" id="attendee-btn-cancel" data-dismiss="modal" data-bind="text: ScreenText.CancelText"></button>
                </div>
            </div>
        </div>
    </div>

    <!-- resource confirmation modal -->
    <div class="modal fade" id="resource-confirm-modal" tabindex="-1" role="dialog" data-backdrop="static" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content" id="resource-confirm-modal-content">
                <div class="modal-header">
                    <%--<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>--%>
                    <h3 class="modal-title">
                        <span data-bind="text: vems.decodeHtml(activeResource().ResourceDescription)"></span>
                        <!-- ko if: activeResource().Serves > 0 -->
                        <span data-bind="text: ' (' + ScreenText.ServesText + ' ' + vems.decodeHtml(activeResource().Serves) + ')'"></span>
                        <!-- /ko -->
                        <!-- ko if: activeResource().ResourcePrice -->
                        <span data-bind="text: ' - ' + vems.decodeHtml(activeResource().ResourcePrice)"></span>
                        <!-- /ko -->
                    </h3>
                </div>
                <div class="modal-body">
                    <div class="row col-xs-12">
                        <span data-bind="html: ScreenText.QuantityWarningMessage.replace('{0}', vems.decodeHtml(activeResource().ResourceDescription)).replace('{1}', '<strong>' + (activeResource().Serves * activeSod().Quantity())  + '</strong>')"></span>
                        <br />
                        <span data-bind="text: ScreenText.ConfirmProceedMessage"></span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" id="resource-confirm-btn-yes" data-bind="text: ScreenText.YesKeepQuantityText"></button>
                    <button type="button" class="btn btn-primary" id="resource-confirm-btn-no" data-dismiss="modal" data-bind="text: ScreenText.NoChangeQuantityText"></button>
                </div>
            </div>
        </div>
    </div>

    <!-- resource alert modal -->
    <div class="modal fade" id="resource-alert-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content" id="resource-alert-modal-content">
                <div class="modal-header"></div>
                <div class="modal-body" style="display: none;"></div>
                <div class="modal-footer">
                    <span class="pull-left" data-bind="html: activeResource().Alert"></span>
                    <button type="button" class="btn btn-primary" id="resource-alert-btn-ok" data-dismiss="modal" data-bind="text: ScreenText.OkText"></button>
                </div>
            </div>
        </div>
    </div>

    <!-- resource images modal -->
    <div class="modal fade" id="resource-images-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content" id="resource-images-modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h3 class="modal-title" data-bind="text: vems.decodeHtml(activeResource().ResourceDescription)"></h3>
                </div>
                <div class="modal-body">
                    <div class="col-xs-12">
                        <!-- ko if: activeResource().Images && activeResource().Images.length > 0 -->
                        <div id="resource-image-carousel" class="carousel slide" data-ride="carousel">
                            <ol class="carousel-indicators">
                                <!-- ko foreach: activeResource().Images -->
                                <li data-target="#resource-image-carousel" data-bind="css: { 'active': $index() === 0 }, attr: { 'data-slide-to': $index }"></li>
                                <!-- /ko -->
                            </ol>
                            <div class="carousel-inner">
                                <!-- ko foreach: activeResource().Images -->
                                <div class="item active" data-bind="css: { 'active': $index() === 0 }">
                                    <img class="img-responsive center-block" data-bind="attr: { src: 'data:image/png;base64,' + BinaryData.toString() }" />
                                    <!-- ko if: Description -->
                                    <div class="carousel-caption">
                                        <h3 data-bind="text: Description"></h3>
                                    </div>
                                    <!-- /ko -->
                                </div>
                                <!-- /ko -->
                            </div>
                            <a class="left carousel-control" href="#resource-image-carousel" role="button" data-slide="prev">
                                <i class="fa fa-chevron-left" aria-hidden="true"></i>
                            </a>
                            <a class="right carousel-control" href="#resource-image-carousel" role="button" data-slide="next">
                                <i class="fa fa-chevron-right" aria-hidden="true"></i>
                            </a>
                        </div>
                        <!-- /ko -->
                    </div>
                </div>
                <div class="modal-footer"></div>
            </div>
        </div>
    </div>

    <!-- terms and conditions modal -->
    <div class="modal fade" id="service-tc-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" data-dismiss="modal" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h3 class="modal-title"><%= ScreenText.TermsAndConditions%></h3>
                </div>
                <div class="modal-body">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal"><%= ScreenText.Close %></button>
                </div>
            </div>
        </div>
    </div>
     <span data-bind="template: { afterRender: vems.bookingServicesAfterRender }"></span>
</div>
