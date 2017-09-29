<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ Import Namespace="Resources" %>

<div class="udf-container" data-bind="foreach: udfs">
    <!-- ko if: FieldType() == 1  -->
    <!-- ko if: !MultiLine() -->
    <div class="form-group udf" data-bind="css: { child: ParentUDFTypeID() > 0 }">
        <label data-bind="html: Prompt, attr: { for: Id() + '-' + $parent.containerId() }, css: { required: Required() }"></label>
        <input type="text" class="form-control" data-bind="attr: { id: Id() + '-' + $parent.containerId(), required: Required() ? 'required' : null }, textInput: Answer, uniqueName: true">
        <div class="udf-child-container"></div>
    </div>
    <!-- /ko -->
    <!-- ko if: MultiLine() -->
    <div class="form-group udf" data-bind="css: { child: ParentUDFTypeID() > 0 }">
        <label data-bind="html: Prompt, attr: { for: Id() + '-' + $parent.containerId() }, css: { required: Required() }"></label>
        <textarea class="form-control" data-bind="attr: { id: Id() + '-' + $parent.containerId(), required: Required() ? 'required' : null }, textInput: Answer, uniqueName: true" />
        <div class="udf-child-container"></div>
    </div>
    <!-- /ko -->
    <!-- /ko -->
    <!-- ko if: FieldType() == 2  -->
    <div class="form-group udf" data-bind="css: { child: ParentUDFTypeID() > 0 }">
        <label data-bind="html: Prompt, attr: { for: Id() + '-' + $parent.containerId() }, css: { required: Required() }"></label>
        <div class='date input-group' style='float: none;' data-bind="attr: { id: Id() + '-' + $parent.containerId(), 'data-date': Answer }">
            <input type='text' class='form-control' data-bind="attr: { required: Required() ? 'required': null }" />
            <span class="input-group-addon"><span class="fa fa-calendar"></span></span>
        </div>
        <div class="udf-child-container"></div>
    </div>
    <!-- /ko -->
    <!-- ko if: FieldType() == 3  -->
    <div class="form-group udf" data-bind="css: { child: ParentUDFTypeID() > 0 }">
        <label data-bind="html: Prompt, attr: { for: Id() + '-' + $parent.containerId() }, css: { required: Required() }"></label>
        <input type="number" class="form-control numeric" data-bind="attr: { id: Id() + '-' + $parent.containerId(), required: Required() ? 'required' : null }, textInput: Answer, uniqueName: true">
        <div class="udf-child-container"></div>
    </div>
    <!-- /ko -->
    <!-- ko if: FieldType() == 4  -->
    <!-- ko if: AllowMultiSelect() -->
    <div class="form-group udf" data-bind="css: { child: ParentUDFTypeID() > 0 }">
        <label data-bind="html: Prompt(), attr: { for: Id() + '-' + $parent.containerId() }, css: { required: Required() }"></label>
        <div class="multiselect-container" data-bind="attr: { required: Required() ? 'required' : null }">
            <div class="multiselect-value-label"></div>
            <div class="multiselect-value-container" data-bind="attr: { id: Id() + '-' + $parent.containerId() }">
                <a class="multiselect-add-btn" data-bind="text: $parent.screenText.addRemoveLabel"></a>
                <div class="popover-markup dynamic-filter-popover">
                    <div class="title hide"><a class="popover-close fa fa-close"></a></div>
                    <div class="content hide form-group" data-bind="foreach: Items">
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" class="filter-checkbox" data-bind="value: ID, attr: { Id: ID() + '-' + $parents[1].containerId(), 'parent-id': $parent.Id }">
                                <span data-bind="text: vems.decodeHtml(ItemDescription())"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="udf-child-container"></div>
    </div>
    <!-- /ko -->
    <!-- ko if: !AllowMultiSelect() -->
    <div class="form-group udf" data-bind="css: { child: ParentUDFTypeID() > 0 }">
        <label data-bind="html: Prompt, attr: { for: Id() + '-' + $parent.containerId() }, css: { required: Required() }"></label>
        <select class="form-control" data-bind="event: { change: $parent.udfValueChanged }, attr: { id: Id() + '-' + $parent.containerId(), required: Required() ? 'required' : null }, options: Items,
                            optionsText: 'ItemDescription',
                            optionsValue: 'ID',
                            value: Answer,
                            optionsCaption: 'Choose one',
                            uniqueName: true" />
        <div class="udf-child-container"></div>
    </div>
    <!-- /ko -->
    <!-- /ko -->
</div>
<div data-bind="template: { afterRender: serviceUdfInit }"></div>