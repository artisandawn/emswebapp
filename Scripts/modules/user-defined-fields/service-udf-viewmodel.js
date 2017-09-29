/*
 * UDF component used exclusively by the Booking Services component
 * 
 * Container Id:  udf-<CategoryId>-<InstanceCount>
 * UDF Element Ids:  <UDFTypeId>-<ContainerId(above)>
 */
var vems = vems || {};
function serviceUdfViewModel(data, container) {
    var self = this;
    self.containerId = ko.observable($(container.element).attr('id'));
    self.udfs = ko.observableArray([]);
    self.udfAnswers = ko.observableArray([]);
    self.screenText = {};
    self.initialized = ko.observable(false);

    self.applyAnswers = function () {
        $.each(self.udfs(), function (idx, udf) {
            var existingAnswer = $.grep(self.udfAnswers(), function (answer) {
                return answer.UdfTypeId() === udf.Id();
            })[0];

            if (existingAnswer) {
                udf.Answer(vems.decodeHtml(existingAnswer.FieldValue()));
            } else if (udf.DefaultAnswer() && !udf.Required()) {
                udf.Answer(vems.decodeHtml(udf.DefaultAnswer()));
            }

            $.each(udf.Items(), function (ii, vv) {
                vv.ItemDescription(vems.decodeHtml(vv.ItemDescription()));
            });
        });

        if (self.initialized()) {  // control already initialized - just need to manually set multi-select and date values
            // apply multi-select answers
            $('#' + self.containerId() + ' .udf > .multiselect-container').each(function (i, v) {
                var data = ko.dataFor(v);
                var existingAnswer = $.grep(self.udfAnswers(), function (ans) {
                    return ans.UdfTypeId() == data.Id();
                })[0];
                if (existingAnswer && existingAnswer.FieldValue() && data.FieldType() == 4 && data.AllowMultiSelect()) {
                    var element = $('#' + data.Id() + '-' + self.containerId());
                    element.find('input').each(function (checkboxIndex, checkbox) {
                        var msAnswers = existingAnswer.FieldValue().split(',');
                        if (msAnswers.indexOf(checkbox.value) !== -1) {
                            $(checkbox).prop('checked', true);
                            $(checkbox).change();
                        } else {
                            $(checkbox).prop('checked', false);
                            $(checkbox).change();
                        }
                    });
                }
            });

            // apply date answers
            $('#' + self.containerId() + ' .udf .date').each(function (i, v) {
                var udfElement = $(this);
                var udfTypeId = udfElement.attr('id').substring(0, udfElement.attr('id').indexOf('-'));
                var existingAnswer = $.grep(self.udfAnswers(), function (ans) {
                    return ans.UdfTypeId() == udfTypeId;
                })[0];
                udfElement.data('DateTimePicker').date(new Date(existingAnswer.FieldValue()));
            });
        } else {
            $.each(self.udfs(), function (idx, udf) {
                udf.Answer.subscribe(function (newVal) {
                    self.serviceUdfValueChanged();
                });
            });
        }
    };

    if (data) {
        if (data.screenText && data.screenText.addRemoveLabel) {
            self.screenText = data.screenText;
        } else {
            console.error('expected screen text: addRemoveLabel');
            return false;
        }

        if (data.udfs) {
            ko.mapping.fromJS(data.udfs, {}, self.udfs);
        } else {
            console.error('missing parameter: udfs');
            return false;
        }

        if (data.udfAnswers) {
            ko.mapping.fromJS(data.udfAnswers, {}, self.udfAnswers);
        }

        self.applyAnswers();
    } else {
        console.error('expected parameters: udfs, screenText, udfsAnswers (optional)');
        return false;
    }

    self.getUdfsForSave = function (categoryObj, updateAnswers) {
        var udfs = ko.toJS(categoryObj.UserDefinedFields);
        $(udfs).each(function (i, v) {
            var udfElement = $('#' + v.Id + '-' + self.containerId());
            if (v.FieldType == 1 && v.MultiLine) {
                v.Answer = udfElement.val();
            }

            if (v.FieldType == 2) {
                if (udfElement.data('DateTimePicker') != undefined && udfElement.data('DateTimePicker').date() != null) {
                    v.FieldValue = moment(udfElement.data('DateTimePicker').date()._d).format('YYYY-MM-D');
                    v.Answer = v.FieldValue;
                } else {
                    v.FieldValue = '';
                    v.Answer = '';
                }
            }

            if (v.FieldType == 4 && v.AllowMultiSelect) {
                v.FieldValue = Array.prototype.slice.call($('#' + self.containerId() + ' .popover-markup input[parent-id='
                    + udfElement.attr('id').substring(0, udfElement.attr('id').indexOf('-')) + ']:checked').map(function () { return this.value })).join(',');
                v.Answer = v.FieldValue;
            }
        });

        $('#' + self.containerId() + ' .udf-child').each(function (i, v) {
            var childUdf = {
                Id: '',
                FieldValue: '',
                Answer: '',
                ParentId: $(v).data('udfParent'),
                ParentType: udfs.length > 0 ? udfs[0].ParentType : 0,
                FieldType: $(v).data('fieldType')
            };

            switch ($(v).data('fieldType')) {
                case 1:  // text
                    var textBox = $(v).children('textarea').length > 0 ? $(v).find('textarea') : $(v).find('input');

                    childUdf.Id = textBox.attr('id').substring(0, textBox.attr('id').indexOf('-'));
                    childUdf.FieldValue = textBox.val();
                    break;
                case 2:  // date
                    childUdf.Id = $(v).children('div').attr('id').substring(0, $(v).children('div').attr('id').indexOf('-'));

                    if ($(v).children('.date').data('DateTimePicker') != undefined && $(v).children('.date').data('DateTimePicker').date()) {
                        childUdf.FieldValue = moment($(v).children('.date').data('DateTimePicker').date()._d).format('YYYY-MM-D');
                    } else {
                        v.FieldValue = '';
                    }
                    break;
                case 3:  // numeric
                    var numberInput = $(v).children('input');

                    childUdf.Id = numberInput.attr('id').substring(0, numberInput.attr('id').indexOf('-'));
                    childUdf.FieldValue = numberInput.val();
                    break;
                case 4:  // list
                    var select = $(v).children('select');

                    if (select.length > 0) {
                        childUdf.Id = select.attr('id').substring(0, select.attr('id').indexOf('-'));
                        childUdf.FieldValue = select.val();
                    } else {
                        childUdf.Id = $(v).find('.multiselect-container').attr('id').substring(0, $(v).find('.multiselect-container').attr('id').indexOf('-'));
                        childUdf.FieldValue = Array.prototype.slice.call($(v).find('.popover-markup input[parent-id=' + childUdf.Id + ']:checked').map(function () { return this.value })).join(',');
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
        var kover = ko.observableArray([]);
        ko.mapping.fromJS(udfs, {}, kover);

        if (updateAnswers) {
            self.udfAnswers.remove();
            $.each(kover(), function (idx, newUdf) {
                self.udfAnswers.push({
                    FieldValue: newUdf.Answer,
                    ServiceOrderId: -1,
                    UdfTypeId: newUdf.Id
                });
            });
        }

        return kover();
    };

    self.udfValueChanged = function (data, event) {
        var parentItem = $(event.target);
        var parentId = parentItem.attr('parent-id') ? parentItem.attr('parent-id') : parentItem.attr('id');
        parentId = parentId.indexOf('-') > 0 ? parentId.substring(0, parentId.indexOf('-')) : parentId;  // remove container id from parent id when necessary
        var selected = [];
        var items = [];

        if (data.AllowMultiSelect && data.AllowMultiSelect()) {
            selected = $(event.currentTarget).parents('.multiselect-value-container').find('.popover-markup input:checked').map(function () { return parseInt(this.id, 10) });
            self.serviceUdfValueChanged();
        } else {
            var selectedVal = parseInt(parentItem.val(), 10);
            selected.push(isNaN(selectedVal) ? -1 : selectedVal);  // when no option selected - push -1 to 'selected' array to hide child udfs
        }

        $('#' + self.containerId() + ' .udf-child[data-udf-parent=' + parentId + ']').each(function (i, v) {
            if ($.inArray($(v).data('udfParentItem'), selected) === -1) {
                $(v).remove();  // child must be REMOVED from the DOM to prevent required field validation issues
            }
        });

        // remove any existing children and prep for child data-retrieval
        if (typeof (selected) === "string" && selected.length > 0) {
            var existingItems = $('#' + self.containerId() + ' .udf-child[data-udf-parent-item=' + selected + ']');
            if (existingItems.length !== 0) {
                existingItems.remove();
            }

            items.push(selected);
        } else {
            for (var i = 0; i < selected.length; i++) {
                var existingItems = $('#' + self.containerId() + ' .udf-child[data-udf-parent-item=' + selected[i] + ']');
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
                for (var i = udfData.dependentUDFs.length - 1; i >= 0; i--) {
                    var udf = udfData.dependentUDFs[i];
                    var prompt = udf.Prompt;

                    // populate existing value when editing
                    var activeSoId = vems.bookingServicesVM.activeServiceOrderId();
                    $.each(self.udfAnswers(), function (i, v) {
                        if (v.UdfTypeId() == udf.Id) {
                            udf.Answer = v.FieldValue();
                        }
                    });

                    var formGroup = $('<div class="form-group udf-child" data-udf-parent="' + udf.ParentUDFTypeID + '" data-udf-parent-item="' + udf.ParentUDFItemID + '" data-field-type="' + udf.FieldType + '" data-sequence=' + udf.Sequence + '></div>');

                    var udfLabel = $('<label>' + prompt + '</label>');
                    var udfId = udf.Id + '-' + self.containerId();
                    if (udf.Required) {
                        udfLabel.addClass('required');
                    }

                    udfLabel.attr('for', udfId).appendTo(formGroup);

                    var addAttributes = function (inputItem) {
                        if (udf.Required) {
                            inputItem.attr('required', 'required');

                            if (self.udfAnswers().length === 0) {
                                udf.Answer = '';
                            }
                        }

                        inputItem.attr('id', udfId);

                        var hasAnswer = $.grep(self.udfAnswers(), function (answer) {
                            return answer.UdfTypeId() === udf.Id;
                        }).length > 0;
                        if (!udf.Required || hasAnswer) {
                            inputItem.val(vems.decodeHtml(udf.Answer));
                        }
                    };

                    var childContainer = parentItem.hasClass('filter-checkbox')
                        ? parentItem.parents('.multiselect-container').siblings('.udf-child-container')
                        : parentItem.siblings('.udf-child-container');

                    switch (udf.FieldType) {
                        case 1: // text
                            var textInput = udf.MultiLine
                                ? $("<textarea type='text' class='form-control'>")
                                : $("<input type='text' class='form-control'>");

                            textInput.off('change').on('change', function () {
                                self.serviceUdfValueChanged();
                            });
                            addAttributes(textInput);
                            textInput.appendTo(formGroup);
                            formGroup.appendTo(childContainer);
                            break;
                        case 2:  // date
                            var datePicker = $("<div class='date input-group' style='float: none;' id='" + udfId + "' data-date='" + udf.Answer + "'>"
                                    + "<input type='text' class='form-control' />"
                                    + '<span class="input-group-addon"><span class="fa fa-calendar"></span></span>'
                                + "</div>");

                            if (udf.Required) {
                                datePicker.find('input').attr('required', 'required');
                            }

                            datePicker.appendTo(formGroup);
                            formGroup.appendTo(childContainer);

                            $('#' + udfId).datetimepicker({
                                locale: moment.locale(),
                                defaultDate: (self.udfAnswers().length > 0) || !udf.Required ? udf.Answer : null,
                                format: 'ddd L',
                                ignoreReadonly: true,
                                showTodayButton: true,
                                icons: {
                                    today: 'date-picker-today-btn'
                                },
                                widgetPositioning: {
                                    horizontal: 'left'
                                }
                            }).on('dp.change', function (ev) {
                                self.serviceUdfValueChanged();
                            });
                            break;
                        case 3:  // numeric
                            var numberInput = $("<input type='number' class='form-control numeric'>");

                            numberInput.off('change').on('change', function () {
                                self.serviceUdfValueChanged();
                            });
                            addAttributes(numberInput);
                            numberInput.appendTo(formGroup);
                            formGroup.appendTo(childContainer);
                            break;
                        case 4:  // list
                            if (udf.AllowMultiSelect) {
                                var checkboxes = '';
                                var udfAnswerDescription = '';

                                var existingAnswer = $.grep(self.udfAnswers(), function (answer) {
                                    return answer.UdfTypeId() === udf.Id;
                                })[0];
                                var answers = existingAnswer ? existingAnswer.FieldValue().split(',') : '';
                                answers = answers.length === 0 && !udf.Required ? udf.DefaultAnswer.split(',') : answers;
                                var answerTexts = new Array();

                                $.each(udf.Items, function (itemIndex, itemValue) {
                                    var checked = '';

                                    if (((self.udfAnswers().length > 0) || !udf.Required) && $.inArray(itemValue.ID.toString(), answers) >= 0) {
                                        answerTexts.push(vems.decodeHtml(itemValue.ItemDescription));
                                        checked = 'checked';
                                    }

                                    var checkbox = '<div class="checkbox">' +
                                                      '<label>' +
                                                          '<input type="checkbox" class="filter-checkbox" id="' + itemValue.ID + '-' + self.containerId() +
                                                          '" value="' + itemValue.ID + '" parent-id="' + udf.Id + '"' + checked + '>' + //udfId
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
                                    var popover = $(this);

                                    $.each(popover.siblings('.popover').find('input'), function (i, v) {
                                        var originalChecked = popover.siblings('.popover-markup').find('input[id=' + v.id + ']')[0].checked;
                                        $(v).prop('checked', originalChecked);
                                    });
                                }).on('show.bs.popover', function () {  // add an overlay here so the user can close the window by clicking outside
                                    $('body').append('<div class="udf-overlay">');
                                }).on('hide.bs.popover', function () {
                                    $('.udf-overlay').remove();
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

                                listInput.off('change').on('change', function () {
                                    self.serviceUdfValueChanged();
                                });
                            }
                            break;
                    }
                }

                if (vems.afterChildUdfRendered && $.isFunction(vems.afterChildUdfRendered)) {
                    vems.afterChildUdfRendered();
                }
            }
        });
    };

    self.serviceUdfValueChanged = function () {  // not made to be a parameter, because component only to be used in one specific place
        if (vems.serviceUdfValueChanged && $.isFunction(vems.serviceUdfValueChanged) && self.initialized()) {
            var catAndInstance = self.containerId().substring(self.containerId().indexOf('-') + 1);
            var catId = parseInt(catAndInstance.substring(0, catAndInstance.indexOf('-')));
            var instanceCount = parseInt(catAndInstance.substring(catAndInstance.indexOf('-') + 1));
            vems.serviceUdfValueChanged(catId, instanceCount);
        }
    };

    // initialize datepickers and multi-select controls
    self.serviceUdfInit = function () {
        $('#' + self.containerId() + ' .udf .date').each(function (i, v) {
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
            }).on('dp.change', function (ev) {
                var data = ko.dataFor(this);
                data.Answer(ev.date);
            });
        });

        $('#' + self.containerId() + ' .multiselect-value-label').each(function (i, v) {
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
                } else {
                    var item = $.grep(data.Items(), function (val) {
                        return val.ID() == data.Answer();
                    })[0];

                    description = vems.decodeHtml(item.ItemDescription());
                }

                $(this).text(description);
            }
        });

        $('#' + self.containerId() + ' .multiselect-add-btn').popover({
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
            $('body').append('<div class="udf-overlay">');
        }).on('hide.bs.popover', function () {
            $('.udf-overlay').remove();
        });

        // make sure values for multi-select UDFs are checked
        $('#' + self.containerId() + ' .multiselect-container').each(function (i, v) {
            var data = ko.dataFor(v);
            if (data.Answer() && data.Answer().length > 0 && data.FieldType() == 4 && data.AllowMultiSelect()) {  // multi-select list only
                var element = $('#' + data.Id() + '-' + self.containerId());
                element.find('input').each(function (checkboxIndex, checkbox) {
                    var msAnswers = data.Answer().split(',');
                    if (msAnswers.indexOf(checkbox.value) !== -1) {
                        $(checkbox).prop('checked', true);
                        $(checkbox).change();
                    }
                });
            }
        });

        self.initialized(true);
    };
};

// used by the multi-select popup to determine the correct position
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

// bind document events (should only be bound ONCE)
$(document).off('click', '.udf-container:not([id="reservation-udf-container"]) .popover-close').on('click', '.udf-container:not([id="reservation-udf-container"]) .popover-close', function () {
    $(this).parents('.multiselect-value-container').find('a.multiselect-add-btn').click();
});
$(document).off('click', '.udf-overlay').on('click', '.udf-overlay', function () {
    $('.multiselect-value-container .popover .popover-close').click();
});
$(document).off('change', '.udf-container:not([id="reservation-udf-container"]) .multiselect-value-container input').on('change', '.udf-container:not([id="reservation-udf-container"]) .multiselect-value-container input', function (e) {
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

    var vm = ko.dataFor($(this).closest('.udf-container')[0]);
    vm.udfValueChanged(ko.dataFor(this), e);
});
$(document).off('keydown', '.udf-container:not([id="reservation-udf-container"]) .udf .numeric').on('keydown', '.udf-container:not([id="reservation-udf-container"]) .udf .numeric', function (event) {
    if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                (event.keyCode == 65 && event.ctrlKey === true) || (event.keyCode == 173 || event.keyCode == 188 || event.keyCode == 189 || event.keyCode == 190 || event.keyCode == 110) ||
                (event.keyCode >= 35 && event.keyCode <= 39)) {
        return;
    } else {
        if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();  // stop the key press when necessary
        }
    }
}).off('keyup', '.udf-container:not([id="reservation-udf-container"]) .udf .numeric').on('keyup', '.udf-container:not([id="reservation-udf-container"]) .udf .numeric', function (event) {
    if ($(this).val() < -999999999) {
        $(this).val(-999999999);
        ko.dataFor(this).Answer($(this).val())
    }

    if ($(this).val() > 999999999) {
        $(this).val(999999999);
        ko.dataFor(this).Answer($(this).val())
    }
});
