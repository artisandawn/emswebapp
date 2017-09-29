/// <reference path="knockout-3.3.0.js" />
/// <reference path="jquery.min.js" />
/// <reference path="knockout.mapping-latest.js" />
var vems = vems || {};

vems.userDefinedFieldViewModel = function (udfdata) {
    var self = this;
    self.Udfs = ko.observableArray();
    if (ko.isObservable(udfdata)) {
        self.Udfs = udfdata;
    }
    else {
        ko.mapping.fromJS(udfdata, {}, self.Udfs);
    }

    $.each(self.Udfs(), function (i, v) {
        v.Answer(vems.decodeHtml(v.Answer()));

        if (v.Items().length > 0) {
            $.each(v.Items(), function (ii, vv) {
                vv.ItemDescription(vems.decodeHtml(vv.ItemDescription()));
            });
        }
    });

    self.getUdfsForSave = function () {
        var udfs = ko.toJS(self.Udfs);

        $(udfs).each(function (i, v) {
            if (v.FieldType == 1 && v.MultiLine) {
                v.Answer = $('#' + v.Id).val();
            }

            if (v.FieldType == 2) {
                var dtpData = $('#' + v.Id).data('DateTimePicker');  // ensure that a datetimepicker has been initialized and a date is entered
                if (dtpData && (dtpData.date() != null)) {
                    v.FieldValue = moment(dtpData.date()._d).format('YYYY-MM-D');
                    v.Answer = v.FieldValue;
                } else if (dtpData) {
                    v.FieldValue = '';
                    v.Answer = '';
                }
            }

            if (v.FieldType == 4 && v.AllowMultiSelect) {
                v.FieldValue = Array.prototype.slice.call($('.popover-markup input[parent-id=' + v.Id + ']:checked').map(function () { return this.id })).join(',');
                v.Answer = v.FieldValue;
            }
        });

        $('#reservation-udf-container .udf-child').each(function (i, v) {  // id required to prevent grabbing child udfs from services
            var childUdf = {
                Id: '',
                FieldValue: '',
                Answer: '',
                ParentId: $(v).data('udfParent'),
                ParentType: udfs.length > 0 ? udfs[0].ParentType : 0,
                FieldType: $(v).data('fieldType')
            };

            switch ($(v).data('fieldType')) {
                case 1: // text
                    var textBox = $(v).children('textarea').length > 0 ? $(v).find('textarea') : $(v).find('input');

                    childUdf.Id = textBox.attr('id');
                    childUdf.FieldValue = textBox.val();
                    break;
                case 2: // date
                    childUdf.Id = $(v).children('div').attr('id');

                    if ($(v).children('.date').data('DateTimePicker') != undefined && $(v).children('.date').data('DateTimePicker').date()) {
                        childUdf.FieldValue = moment($(v).children('.date').data('DateTimePicker').date()._d).format('YYYY-MM-D');
                    } else {
                        v.FieldValue = '';
                    }
                    break;
                case 3: // numeric
                    var numberInput = $(v).children('input');

                    childUdf.Id = numberInput.attr('id');
                    childUdf.FieldValue = numberInput.val();
                    break;
                case 4: // list
                    var select = $(v).children('select');

                    if (select.length > 0) {
                        childUdf.Id = select.attr('id');
                        childUdf.FieldValue = select.val();
                    } else {
                        childUdf.Id = $(v).find('.multiselect-container').attr('id');
                        childUdf.FieldValue = Array.prototype.slice.call($(v).find('.popover-markup input[parent-id=' + childUdf.Id + ']:checked').map(function () { return this.id })).join(',');
                    }

                    break;
            }

            // remove the value if the UDF is hidden
            if ($(v).is(':hidden')) {
                childUdf.FieldValue = '';
                childUdf.Answer = '';
            } else {
                childUdf.Answer = childUdf.FieldValue;
            }

            udfs.push(childUdf);
        });

        return udfs;
    };
};

vems.udfInit = function () {
    $('.udf .date').each(function (i, v) {
        $('#' + $(v).attr('id')).datetimepicker({
            locale: moment.locale(),
            defaultDate: $(v).data('date'),
            format: 'ddd L',
            ignoreReadonly: true,
            showTodayButton: true,
            icons: {
                today: "date-picker-today-btn"
            },
            widgetPositioning: {
                horizontal: 'left'
            }
        });
    });

    $('.multiselect-value-label').each(function (i, v) {
        var data = ko.dataFor(v);
        var description = '';

        if (data.Answer().length > 0) {
            var answers = data.Answer().split(',');

            if (answers.length > 0) {
                var descriptions = new Array();

                $.each(data.Items(), function (index, val) {
                    if ($.inArray(val.ID().toString(), answers) != -1) {
                        descriptions.push(vems.decodeHtml(val.ItemDescription()));
                    }
                });

                description = descriptions.join(', ');
            }
            else {
                var item = $.grep(data.Items(), function (val) {
                    return val.ID() == data.Answer();
                })[0];

                description = vems.decodeHtml(item.ItemDescription());
            }

            $(this).text(description);
        }
    });

    $('.multiselect-add-btn').popover({
        html: true,
        placement: vems.calculatePlacement,
        title: function () {
            return $(this).parent().find('.title').html();
        },
        content: function () {
            return $(this).parent().find('.content').html();
        }
    }).on('inserted.bs.popover', function () {
        var self = $(this);

        $.each(self.siblings('.popover').find('input'), function (i, v) {
            var originalChecked = self.siblings('.popover-markup').find('input[id=' + v.id + ']')[0].checked;
            $(v).prop('checked', originalChecked);
        });
    }).on('show.bs.popover', function () {  // add an overlay here so the user can close the window by clicking outside
        var overlay = $('<div class="udf-overlay">').click(function () {
            $('.multiselect-add-btn').popover('hide');
        });
        $('body').append(overlay);
    }).on('hide.bs.popover', function () {  // upon hiding, remove overlay and revert 'add-btn' click event to 'show'
        $('.udf-overlay').remove();
        $(this).off('click').on('click', function () { $(this).popover('show'); });
    });

    $('.multiselect-container').each(function (i, v) {
        var data = ko.dataFor(v);
        if (data.Answer() && data.Answer().length > 0 && !data.Required() && data.FieldType() == 4 && data.AllowMultiSelect()) { // list
            var element = $('#' + data.Id());

            element.find('input').each(function (checkboxIndex, checkbox) {
                if (checkbox.id == data.Answer())
                    $(checkbox).attr('checked');
            });
        }
    });

    if ($.isFunction(vems.onUdfInit))
        vems.onUdfInit();
};


vems.udfValueChanged = function (data, event) {

    var parentItem = $(event.target);
    var parentId = parentItem.attr('parent-id') ? parentItem.attr('parent-id') : parentItem.attr('id');
    var selected = [];
    var items = [];

    if (data.AllowMultiSelect && data.AllowMultiSelect()) {
        selected = $(event.currentTarget).parents('.multiselect-value-container').find('.popover-markup input:checked').map(function () { return parseInt(this.id, 10) });
    } else {
        var selectedVal = parseInt(parentItem.val(), 10);
        selected.push(isNaN(selectedVal) ? -1 : selectedVal);  // when no option selected - push -1 to 'selected' array to hide child udfs
    }

    $('.udf-child[data-udf-parent=' + parentId + ']').each(function (i, v) {
        if ($.inArray($(v).data('udfParentItem'), selected) === -1) {
            $(v).remove();  // child must be REMOVED from the DOM to prevent required field validation issues
        }
    });

    // remove any existing children and prep for child data-retrieval
    if (typeof (selected) === "string" && selected.length > 0) {
        var existingItems = $('.udf-child[data-udf-parent-item=' + selected + ']');
        if (existingItems.length !== 0) {
            existingItems.remove();
        }

        items.push(selected);
    } else {
        for (var i = 0; i < selected.length; i++) {
            var existingItems = $('.udf-child[data-udf-parent-item=' + selected[i] + ']');
            if (existingItems.length !== 0) {
                existingItems.remove();
            }

            items.push(selected[i]);
        }
    }

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetDependentUserDefinedField',
        data: JSON.stringify({ parentId: parentId, selectedItems: items }),
        success: function (jsonMsg) {
            var udfData = JSON.parse(jsonMsg.d);
            var editMode = typeof (editReservationModel) != 'undefined' && editReservationModel && editReservationModel.udfAnswers && editReservationModel.udfAnswers.length > 0;
            var serviceEditMode = vems.bookingServicesVM && vems.editServicesVM && vems.editServicesVM.udfAnswers && vems.editServicesVM.udfAnswers().length > 0;

            for (var i = udfData.dependentUDFs.length - 1; i >= 0; i--) {
                var udf = udfData.dependentUDFs[i];

                var prompt = udf.Prompt;

                // we're actually editing UDFS so we need to set the answer based on the one from the DB
                if (editMode) {
                    $.each(editReservationModel.udfAnswers, function (i, v) {
                        if (v.UDFTypeID == udf.Id) {
                            udf.Answer = v.FieldValue;
                        }
                    });
                }

                // we're editing UDFs for a service order
                if (serviceEditMode) {
                    var activeSoId = vems.bookingServicesVM.activeServiceOrderId();
                    $.each(vems.editServicesVM.udfAnswers(), function (i, v) {
                        if (v.ServiceOrderID == activeSoId && v.UDFTypeID == udf.Id) {
                            udf.Answer = v.FieldValue;
                        }
                    });
                }

                var formGroup = $('<div class="form-group udf-child" data-udf-parent="' + udf.ParentUDFTypeID + '" data-udf-parent-item="' + udf.ParentUDFItemID + '" data-field-type="' + udf.FieldType + '" data-sequence=' + udf.Sequence + '></div>');

                var udfLabel = $('<label>' + prompt + '</label>');
                if (udf.Required)
                    udfLabel.addClass('required');

                udfLabel.attr('for', udf.Id).appendTo(formGroup);
                var input;

                var addAttributes = function (inputItem) {
                    if (udf.Required) {
                        inputItem.attr('required', 'required');

                        if (!editMode && !serviceEditMode)
                            udf.Answer = '';
                    }

                    inputItem.attr('id', udf.Id);

                    if (editMode || serviceEditMode || !udf.Required)
                        inputItem.val(udf.Answer);
                };

                var childContainer = parentItem.hasClass('filter-checkbox')
                    ? parentItem.parents('.multiselect-container').siblings('.udf-child-container')
                    : parentItem.siblings('.udf-child-container');

                switch (udf.FieldType) {
                    case 1: // Text
                        var textInput = udf.MultiLine
                            ? $("<textarea type='text' class='form-control'>")
                            : $("<input type='text' class='form-control'>");

                        addAttributes(textInput);
                        textInput.appendTo(formGroup);
                        formGroup.appendTo(childContainer);
                        break;
                    case 2: // Date
                        var datePicker = $("<div class='date input-group' style='float: none;' id='" + udf.Id + "' data-date='" + udf.Answer + "'>"
                                + "<input type='text' class='form-control' />"
                                + '<span class="input-group-addon"><span class="fa fa-calendar"></span></span>'
                            + "</div>");

                        if (udf.Required) {
                            datePicker.find('input').attr('required', 'required');
                        }

                        datePicker.appendTo(formGroup);
                        formGroup.appendTo(childContainer);

                        $('#' + udf.Id).datetimepicker({
                            locale: moment.locale(),
                            defaultDate: editMode || serviceEditMode || !udf.Required ? udf.Answer : null,
                            format: 'ddd L',
                            ignoreReadonly: true,
                            showTodayButton: true,
                            icons: {
                                today: "date-picker-today-btn"
                            },
                            widgetPositioning: {
                                horizontal: 'left'
                            }
                        });
                        break;
                    case 3: // Numberic
                        var numberInput = $("<input type='number' class='form-control numeric'>");
                        addAttributes(numberInput);
                        numberInput.appendTo(formGroup);
                        formGroup.appendTo(childContainer);
                        break;
                    case 4: // List
                        if (udf.AllowMultiSelect) {
                            var checkboxes = '';

                            var udfAnswerDescription = '';

                            var answers = udf.Answer.split(',');
                            var answerTexts = new Array();

                            $.each(udf.Items, function (itemIndex, itemValue) {
                                var checked = '';

                                if ((editMode || serviceEditMode || !udf.Required) && $.inArray(itemValue.ID.toString(), answers) >= 0) {
                                    answerTexts.push(vems.decodeHtml(itemValue.ItemDescription));
                                    checked = 'checked';
                                }

                                var checkbox = '<div class="checkbox">' +
                                                  '<label>' +
                                                      '<input type="checkbox" class="filter-checkbox" id="' + itemValue.ID + '" value="' + itemValue.ID + '" parent-id="' + udf.Id + '"' + checked + '>' +
                                                      '<span>' + vems.decodeHtml(itemValue.ItemDescription) + '</span>' +
                                                  '</label>' +
                                             ' </div>';

                                checkboxes += checkbox;
                            });

                            udfAnswerDescription = answerTexts.join(', ');

                            var multiInput = $('<div class="multiselect-container">' +
                                            '<div class="multiselect-value-label">' + udfAnswerDescription + '</div>' +
                                            '<div class="multiselect-value-container">' +
                                                '<a class="multiselect-add-btn">' + vems.decodeHtml(vems.browse.addRemoveLabel) + '</a>' +
                                                '<div class="popover-markup dynamic-filter-popover">' +
                                                    '<div class="title hide"><a class="popover-close fa fa-close"></a></div>' +
                                                        '<div class="content hide form-group">' +
                                                      checkboxes +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>');

                            addAttributes(multiInput);
                            multiInput.appendTo(formGroup);
                            formGroup.appendTo(childContainer);

                            multiInput.find('.multiselect-add-btn').popover({
                                html: true,
                                placement: vems.calculatePlacement,
                                title: function () {
                                    return $(this).parent().find('.title').html();
                                },
                                content: function () {
                                    return $(this).parent().find('.content').html();
                                }
                            }).on('inserted.bs.popover', function () {
                                var self = $(this);

                                $.each(self.siblings('.popover').find('input'), function (i, v) {
                                    var originalChecked = self.siblings('.popover-markup').find('input[id=' + v.id + ']')[0].checked;
                                    $(v).prop('checked', originalChecked);
                                });
                            }).on('show.bs.popover', function () {  // add an overlay here so the user can close the window by clicking outside
                                var overlay = $('<div class="udf-overlay">').click(function () {
                                    $('.multiselect-add-btn').popover('hide');
                                });
                                $('body').append(overlay);
                            }).on('hide.bs.popover', function () {  // upon hiding, remove overlay and revert 'add-btn' click event to 'show'
                                $('.udf-overlay').remove();
                                $(this).off('click').on('click', function () { $(this).popover('show'); });
                            });
                        } else {
                            var listInput = $("<select type='text' class='form-control'>");
                            listInput.append('<option value=""></option>');  // add blank option to top of single-select list udf
                            var defVal = false;
                            $.each(udf.Items, function (i, v) {
                                var option = $('<option value="' + v.ID + '">' + vems.decodeHtml(v.ItemDescription) + '</option>');

                                if (!udf.Required && v.ID == udf.Answer) {
                                    option.prop('selected', 'selected');
                                    defVal = true;
                                }

                                option.appendTo(listInput);
                            });
                            if (!defVal) { listInput.val(''); }  // de-select first option when it's unintentionally selected by default

                            addAttributes(listInput);
                            listInput.appendTo(formGroup);
                            formGroup.appendTo(childContainer);
                        }
                        break;

                }
            }

            if (vems.afterChildUdfRendered && $.isFunction(vems.afterChildUdfRendered))
                vems.afterChildUdfRendered();
        }
    });
};

$(document).on('click', '#reservation-udf-container .popover-close', function () {
    $(this).parents('.multiselect-value-container').find('.multiselect-add-btn').popover('hide');
});

$(document).on('change', '#reservation-udf-container .multiselect-value-container input', function (e) {
    var selectedItems = $(this).parents('.checkbox').siblings().find('input:checked');
    $('input[id = ' + this.id + ']').prop('checked', this.checked);

    var values = [];
    var descriptions = [];

    if (this.checked) {
        values.push($(this).val());
        descriptions.push($(this).siblings().text());
    }

    $.each(selectedItems, function (i, v) {
        values.push($(v).val());
        descriptions.push($(v).siblings().text());
    });

    $(this).parents('.multiselect-value-container').siblings('.multiselect-value-label').text(descriptions.join(', '));

    vems.udfValueChanged(ko.dataFor(this), e);
});

$(document).on('keydown', '#reservation-udf-container .udf .numeric', function (event) {
    if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                (event.keyCode == 65 && event.ctrlKey === true) || (event.keyCode == 173 || event.keyCode == 188 || event.keyCode == 189 || event.keyCode == 190 || event.keyCode == 110) ||
                (event.keyCode >= 35 && event.keyCode <= 39)) {
        return;
    } else {
        // stop the key press when necessary
        if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
        }
    }
}).on('keyup', '#reservation-udf-container .udf .numeric', function (event) {
    if ($(this).val() < -999999999) {
        $(this).val(-999999999);
        ko.dataFor(this).Answer($(this).val())
    }

    if ($(this).val() > 999999999) {
        $(this).val(999999999);
        ko.dataFor(this).Answer($(this).val())
    }
});

vems.calculatePlacement = function (context, source) {
    var elBounding = source.getBoundingClientRect();
    var pageWidth = document.body.clientWidth;
    var pageHeith = document.body.clientHeith;

    if (elBounding.left > (pageWidth * 0.34) && elBounding.width < (pageWidth * 0.67)) {
        return "left";
    }

    if (elBounding.left < (pageWidth * 0.34) && elBounding.width < (pageWidth * 0.67)) {
        return "right";
    }

    if (elBounding.top < 110) {
        return "bottom";
    }

    return "top";
};
