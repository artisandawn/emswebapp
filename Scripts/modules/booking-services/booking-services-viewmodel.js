var vems = vems || {};
var CategoryTypeCodes = {
    CAT: 0,
    ATT: 1,
    NOT: 2,
    RES: 3,
    RSO: 4
};

function bookingServicesViewModel(data, container) {
    var self = this;
    self.GenericUnavailableMessage = '';

    self.Services = ko.observable(new ServicesViewModel());
    if (data.Services) {
        if (data.LoadServices) { // some pages require loading services on page load.  handle that here
            var servicesVM = new ServicesViewModel();
            servicesVM.load(data.Services(), data.startDateTime, data.endDateTime);

            data.Services(servicesVM);
            self.Services(data.Services()); //link the external and internal observables
        } else {
            var existingCats = $.isFunction(data.Services().AvailableCategories) ? data.Services().AvailableCategories() : [];
            if (existingCats.length === 0) {  // don't wipe out services when component is unintentionally re-rendered by start/end time subscriptions
                data.Services(new ServicesViewModel());
            }
            self.Services(data.Services()); //link the external and internal observables
        }
    }
    self.serviceOrders = ko.observableArray([]);
    if (data.ServiceOrders) {
        self.serviceOrders = data.ServiceOrders;

        // get the service order's category data from the list of available categories
        $.each(self.serviceOrders(), function (idx, so) {
            var id = so.CategoryObj().CategoryId();
            var count = so.CategoryObj().InstanceCount();
            var cat = $.grep(self.Services().AvailableCategories(), function (cat) {
                return cat.CategoryId() === id && cat.InstanceCount() === count;
            })[0];
            so.CategoryObj(cat);
        });
    }
    self.startDateTime = ko.observable(data.startDateTime);
    self.endDateTime = ko.observable(data.endDateTime);
    self.attendance = ko.observable(0);
    if (data.attendance)
        self.attendance = data.attendance;  //link to the observable
    self.ReservationId = ko.observable(-1);
    self.activeResource = ko.observable({});  // used for resource description, notes, images, and min/max quantity
    self.activeSod = ko.observable(new ServiceOrderDetail());  // used for resource groups/item data and user inputs
    self.activeCategory = ko.observable({});  // used to access service order times, service type, estimated count, and udfs
    self.activeServiceOrderId = ko.observable(-1);  // used when editing service orders (for populating dependent udf values)
    self.editingServiceOrder = ko.observable();
    self.resourceHelpText = ko.observable("");

    self.showNextStep = ko.observable(data.showNextStep ? data.showNextStep : true);

    self.notesSave = function (cat) {
        var soId = -1;
        var sodId = -1;

        var existingNotes = $.grep(vems.bookingServicesVM.serviceOrders(), function (so) {
            return so.CategoryId() === cat.CategoryId() && so.CategoryObj().InstanceCount() === cat.InstanceCount();
        })[0];
        if (existingNotes) {
            soId = existingNotes.Id();
            sodId = existingNotes.ServiceOrderDetails()[0].Id();
            self.serviceOrders.remove(existingNotes);
        }

        if (cat.WrittenNotes()) {
            var so = new ServiceOrder();
            so.CategoryId(cat.CategoryId());
            so.Category(cat.CategoryDescription());
            so.CategoryTypeCode(CategoryTypeCodes[cat.ResourceCategoryTypeCode()]);
            so.CategoryObj(cat);
            so.Udfs(self.getUdfsForSave(cat));
            so.HasUdfs(so.Udfs().length > 0);
            var sod = new ServiceOrderDetail();
            sod.ResourceId(0);
            sod.SpecialInstructions(cat.WrittenNotes());
            so.ServiceOrderDetails.push(sod);

            if (soId > 0) {
                so.Id(soId);

                if (sodId > 0) {
                    sod.Id(sodId);
                }
            }

            self.serviceOrders.push(so);
        }

        cat.OriginalWrittenNotes(cat.WrittenNotes());
        cat.WrittenNotes.valueHasMutated();

        vems.bookingServicesVM.onSummaryAdd();
    };
    self.notesCancel = function (cat) {
        cat.WrittenNotes(cat.OriginalWrittenNotes());
    };

    self.onSummaryAdd = data.onSummaryAdd && $.isFunction(data.onSummaryAdd) ? data.onSummaryAdd : function () { };
    self.onServiceOrderEdit = data.onServiceOrderEdit && $.isFunction(data.onServiceOrderEdit) ? data.onServiceOrderEdit : function () { };

    //BR-PO section
    self.billingReference = ko.observable('');
    if (data.BillingReferenceField)
        self.billingReference = data.BillingReferenceField;

    self.poNumber = ko.observable('');
    if (data.PONumberField)
        self.poNumber = data.PONumberField;

    self.ShowBillingReferences = ko.computed(function () {
        var bVal = false;
        //check for services that require BR/PO
        if (self.Services && self.Services().AvailableCategories) {
            $.each(self.Services().AvailableCategories(), function (i, r) {
                if (r.BillingReferenceRequired && r.BillingReferenceRequired()) {
                    bVal = true;
                }
            });
        }
        return bVal;
    });
    self.BillingReferenceRequired = ko.computed(function () {
        var required = false;
        if (self.Services) {
            required = ($.isFunction(self.Services().CategoryParameters().BillingReferenceValidation) ?
                self.Services().CategoryParameters().BillingReferenceValidation() : self.Services().CategoryParameters().BillingReferenceValidation) > 0;

            if (required) {
                $('#services-billing-panel .billingReference-input').attr('required', 'required');
            }
        }
        return required;
    });

    self.ShowPONumber = ko.computed(function () {
        var bVal = false;
        //check for services that require BR/PO
        if (self.Services && self.Services().AvailableCategories) {
            $.each(self.Services().AvailableCategories(), function (i, r) {
                if (r.PONumberRequired && r.PONumberRequired()) {
                    bVal = true;
                }
            });
        }
        return bVal;
    });
    self.PoNumberRequired = ko.computed(function () {
        var required = false;
        if (self.Services) {
            required = ($.isFunction(self.Services().CategoryParameters().PoNumberValidation) ?
                self.Services().CategoryParameters().PoNumberValidation() : self.Services().CategoryParameters().PoNumberValidation) > 0;

            if (required) {
                $('#services-billing-panel .PONumber-input').attr('required', 'required');
            }
        }
        return required;
    });
    //end of BRPO section

    self.navToPreviousStep = function () {
        if (data.onNavToPreviousStep) {
            data.onNavToPreviousStep();
        }
    };
    self.navToNextStep = function () {
        if (data.onNavToNextStep) {
            data.onNavToNextStep();
        }
    };
    self.servicesLoadedCallback = function () {
        if (data.onServicesLoaded)
            data.onServicesLoaded();
    };

    self.isResourceAvailable = function (resourceId, catId, catInstance) {
        var available = true;
        $.each(self.serviceOrders(), function (idx, so) {
            if (so.CategoryObj() && so.CategoryObj().CategoryId() === catId && so.CategoryObj().InstanceCount() === catInstance) {
                $.each(so.ServiceOrderDetails(), function (idx, sod) {
                    if (sod.ResourceId() === resourceId) {
                        available = false;
                    }
                });
            }
        });
        return available;
    };

    self.isCategoryAvailable = function (catId) {
        return $.grep(self.Services().AvailableCategories(), function (cat) {
            return cat.CategoryId() === catId;
        }).length > 0;
    };

    self.bindTimeSubscriptions = function () {  // add auto-adjustment of end times when changing start times
        $.each(self.Services().AvailableCategories(), function (idx, cat) {
            cat.ServiceStartTime.subscribe(function (newValue) {
                var newEndTime = moment(newValue).add(1, 'hours');
                cat.ServiceEndTime(newEndTime);
                if (self.soValuesAreDifferent(cat)) {
                    self.showCategoryEditButtons(cat);
                }
            });

            cat.ServiceEndTime.subscribe(function (newValue) {
                if (self.soValuesAreDifferent(cat)) {
                    self.showCategoryEditButtons(cat);
                }
            });

            cat.ServiceChosenServiceType.subscribe(function (newValue) {
                if (self.soValuesAreDifferent(cat)) {
                    self.showCategoryEditButtons(cat);
                }
            });

            cat.ServiceEstimatedCount.subscribe(function (newValue) {
                if (self.soValuesAreDifferent(cat)) {
                    self.showCategoryEditButtons(cat);
                }
            });
        });
    };

    self.rebindEvents = function () {
        $('.service-panel').off('show.bs.collapse hide.bs.collapse').on('show.bs.collapse hide.bs.collapse', function () {
            $(this).find('a i.fa').toggleClass('fa-angle-down fa-angle-up');
        });
    };

    if (data.ScreenText && data.ScreenText.ServicesUnavailableMessage && data.ScreenText.ServicesText && data.ScreenText.ServicesAdjustYourSelectionText &&
            data.ScreenText.ServicesNextStepText && data.ScreenText.OkText && data.ScreenText.CancelText && data.ScreenText.SpecialInstructionsText &&
            data.ScreenText.MinText && data.ScreenText.AvailableInventoryText && data.ScreenText.ServesText && data.ScreenText.QuantityWarningMessage &&
            data.ScreenText.ConfirmProceedMessage && data.ScreenText.YesKeepQuantityText && data.ScreenText.NoChangeQuantityText && data.ScreenText.SelectionInstructionsMessage &&
            data.ScreenText.AddCategoryAttendeeText && data.ScreenText.IsRequiredMessage && data.ScreenText.TermsAndConditionsText && data.ScreenText.ServiceOrderLockoutMessage &&
            data.ScreenText.ServicesSummaryText && data.ScreenText.SaveChangesText && data.ScreenText.MustBeGreaterThanMessage && data.ScreenText.EstimatedCountText &&
            data.ScreenText.AvailableQuantityExceededMessage && data.ScreenText.MinimumQuantityExceededMessage && data.ScreenText.NextStepText) {
        self.ScreenText = data.ScreenText;
        var next = '<a href="#services-body" onclick="vems.bookingServicesVM.navToNextStep()">' + data.ScreenText.ServicesNextStepText + '</a>';
        var prev = '<a href="#services-body" onclick="vems.bookingServicesVM.navToPreviousStep()">' + data.ScreenText.ServicesAdjustYourSelectionText + '</a>';
        self.GenericUnavailableMessage = self.ScreenText.ServicesUnavailableMessage.replace('{0}', data.ScreenText.ServicesText).replace('{1}', prev).replace('{2}', next);
    } else {
        console.error('screen text items required in ScreenText object: ServicesUnavailableMessage, ServicesText, ServicesAdjustYourSelectionText, '
            + 'ServicesNextStepText, OkText, CancelText, SpecialInstructionsText, MinText, AvailableInventoryText, ServesText, QuantityWarningMessage, '
            + 'ConfirmProceedMessage, YesKeepQuantityText, NoChangeQuantityText, SelectionInstructionsMessage, AddCategoryAttendeeText, IsRequiredMessage, TermsAndConditionsText, '
            + ' ServiceOrderLockoutMessage, ServicesSummaryText, SaveChangesText, MustBeGreaterThanMessage, EstimatedCountText');
    }

    self.PriceSubtotal = ko.computed(function () {
        var subtotal = 0.00;
        $.each(self.serviceOrders(), function (key, value) {
            if (value && value.ServiceOrderDetails) {
                $.each(value.ServiceOrderDetails(), function (keyd, valued) {
                    if (valued.NetPrice) {
                        subtotal += valued.NetPrice();
                    }
                });
            }
        });

        return subtotal;
    });

    self.validateServices = function () {
        var errMsgArr = [];
        //BR/PO required?
        if (self.serviceOrders().length > 0) {
            $.each(self.serviceOrders(), function (i, r) {
                if (r.PONumberRequired && r.PONumberRequired() && self.PoNumberRequired() && (!self.poNumber() || self.poNumber().length == 0)) {
                    var poReqMsg = self.ScreenText.IsRequiredMessage.replace('{0}', $('#services-billing-panel [for=services-po]').text()).replace('{1}', r.Category());
                    if (errMsgArr.indexOf(poReqMsg) === -1) {
                        errMsgArr.push(poReqMsg);
                    }
                }
                if (r.BillingReferenceRequired && r.BillingReferenceRequired() && self.BillingReferenceRequired() && (!self.billingReference() || self.billingReference().length == 0)) {
                    var brReqMsg = self.ScreenText.IsRequiredMessage.replace('{0}', $('#services-billing-panel [for=services-br]').text()).replace('{1}', r.Category());
                    if (errMsgArr.indexOf(brReqMsg) === -1) {
                        errMsgArr.push(brReqMsg);
                    }
                }

                //udf validation
                var udfSelector = '#udf-' + r.CategoryId() + '-' + r.InstanceCount() + ' [required=required]';
                $.each($(udfSelector), function (i, v) {
                    if ($(v).hasClass('multiselect-container')) {
                        if ($(v).find('.multiselect-value-label').text().length == 0) {
                            var udfReqMsg = self.ScreenText.IsRequiredMessage.replace('{0}', $(v).parent().find('label').eq(0).text()).replace('{1}', r.Category());
                            if (errMsgArr.indexOf(udfReqMsg) === -1) {
                                errMsgArr.push(udfReqMsg);
                            }
                        }
                    } else if (!$(v).val() || $(v).val().length == 0) {
                        var labelText = $(v).parent().hasClass('date') ? $(v).parent().parent().find('label').text() : $(v).parent().find('label').text();
                        var udfReqMsg = self.ScreenText.IsRequiredMessage.replace('{0}', labelText).replace('{1}', r.Category());
                        if (errMsgArr.indexOf(udfReqMsg) === -1) {
                            errMsgArr.push(udfReqMsg);
                        }
                    }
                });

                //T's and C's required?
                $.each(self.Services().AvailableCategories(), function (i, c) {
                    if (r.CategoryId() == c.CategoryId() && (c.TermsAndConditions && c.TermsAndConditions().length > 0)) {
                        if (!c.TermsAndConditionsChecked()) {
                            var tcReqMsg = self.ScreenText.IsRequiredMessage.replace('{0}', self.ScreenText.TermsAndConditionsText).replace('{1}', c.CategoryDescription());
                            if (errMsgArr.indexOf(tcReqMsg) === -1) {
                                errMsgArr.push(tcReqMsg);
                            }
                        }
                    }
                });
            });
        }

        if (errMsgArr.length === 0) {
            return true;
        } else {
            var reqErrMsg = '';
            $.each(errMsgArr, function (idx, err) {
                reqErrMsg += err;
                if (idx < errMsgArr.length - 1) { reqErrMsg += '<br/><br/>'; }
            });
            if (reqErrMsg) {
                vems.showToasterMessage('', reqErrMsg, 'danger', 10000);
                return false;
            }
            return false;
        }
    };

    self.getUdfsForSave = function (categoryObj) {
        var serviceUdfVm = ko.dataFor($('#udf-' + categoryObj.CategoryId() + '-' + categoryObj.InstanceCount() + ' > .udf-container')[0]);
        return serviceUdfVm.getUdfsForSave(categoryObj, true);
    };

    self.copyCategory = function (catId) {
        var lastCatIndex = 0;
        var lastInstance = 0;
        var selectedCat = null;
        $.each(self.Services().AvailableCategories(), function (idx, cat) {
            if (cat.CategoryId() === catId) {
                if (cat.InstanceCount() === 0) {
                    selectedCat = cat;
                    lastCatIndex = idx;
                } else if (cat.InstanceCount() > lastInstance) {
                    lastInstance = cat.InstanceCount();
                    lastCatIndex = idx;
                }
            }
        });

        if (selectedCat) {
            // create a copy of the category object with a new instance number
            var newobj = $.extend(true, {}, ko.mapping.toJS(selectedCat));
            newobj = ko.mapping.fromJS(newobj);
            newobj.ServiceStartTime = ko.observable(newobj.ServiceStartTime);
            newobj.ServiceEndTime = ko.observable(newobj.ServiceEndTime);
            newobj.InstanceCount(lastInstance + 1);

            // add the new category copy to the availablecategories array
            var tempArr = self.Services().AvailableCategories();
            tempArr.splice(lastCatIndex + 1, 0, newobj);
            self.Services().AvailableCategories(tempArr); //trigger rebind

            // scroll to the new category
            $('body').scrollTo($('#catheader-' + newobj.CategoryId() + '-' + newobj.InstanceCount()).offset().top - 80, { duration: 'slow' });
        }
    };

    self.saveServiceOrderChanges = function (category) {
        // ensure that all required SO fields are filled
        if (category.ResourceCategoryTypeCode() === 'CAT' && category.CategoryServices && category.CategoryServices().length > 0) {
            if (!category.ServiceEstimatedCount() || category.ServiceEstimatedCount() == 0 || category.ServiceEstimatedCount().length === 0) {
                vems.showErrorToasterMessage(self.ScreenText.MustBeGreaterThanMessage.replace('{0}', data.ScreenText.EstimatedCountText).replace('{1}', '0'));
                return false;
            }
        }
        if ((category.ResourceCategoryTypeCode() === 'CAT' || category.ResourceCategoryTypeCode() === 'RSO') && category.CategoryServices && category.CategoryServices().length > 0) {
            if (!category.ServiceStartTime() || category.ServiceStartTime().length === 0) {
                var selector = 'start' + category.CategoryId() + '-' + category.InstanceCount();
                var msg = self.ScreenText.IsRequiredMessage.replace('{0}', $('label[for="' + selector + '"]').text()).replace('{1}', category.CategoryDescription());
                vems.showErrorToasterMessage(msg);
                return false;
            }
            if (!category.ServiceEndTime() || category.ServiceEndTime().length === 0) {
                var selector = 'end' + category.CategoryId() + '-' + category.InstanceCount();
                var msg = self.ScreenText.IsRequiredMessage.replace('{0}', $('label[for="' + selector + '"]').text()).replace('{1}', category.CategoryDescription());
                vems.showErrorToasterMessage(msg);
                return false;
            }
        }

        $.each(self.serviceOrders(), function (i, r) {
            if (r.CategoryObj().CategoryId() == category.CategoryId() && r.CategoryObj().InstanceCount() == category.InstanceCount()) {
                r.saveChanges();
            }
        });
    };

    self.cancelServiceOrderChanges = function (category) {
        // reset values from service order object in cart
        var cartSO = $.grep(self.serviceOrders(), function (so) {
            return so.CategoryObj().CategoryId() === category.CategoryId() && so.CategoryObj().InstanceCount() === category.InstanceCount();
        })[0];
        category.ServiceStartTime(cartSO.TimeStart());
        category.ServiceEndTime(cartSO.TimeEnd());
        category.ServiceChosenServiceType(cartSO.ServiceTypeId());
        category.ServiceEstimatedCount(cartSO.EstimatedCount());

        var udfVm = ko.dataFor($('#udf-' + category.CategoryId() + '-' + category.InstanceCount() + ' .udf-container')[0]);
        if (udfVm.udfAnswers().length > 0) {
            udfVm.applyAnswers();  // re-apply previous udf values
        }
    };

    self.soValuesAreDifferent = function (category) {
        var cartSO = $.grep(self.serviceOrders(), function (so) {
            return so.CategoryObj() && so.CategoryObj().CategoryId() === category.CategoryId() && so.CategoryObj().InstanceCount() === category.InstanceCount();
        })[0];
        var changed = false;

        if (cartSO) {
            if (moment(category.ServiceStartTime()).format('HH:mm') !== moment(cartSO.TimeStart()).format('HH:mm')) {
                changed = true;
            }

            if (moment(category.ServiceEndTime()).format('HH:mm') !== moment(cartSO.TimeEnd()).format('HH:mm')) {
                changed = true;
            }

            if (category.ServiceChosenServiceType() != cartSO.ServiceTypeId() && !(!category.ServiceChosenServiceType() && !cartSO.ServiceTypeId())) {
                changed = true;
            }

            if (category.ServiceEstimatedCount() != cartSO.EstimatedCount() && !(!category.ServiceEstimatedCount() && !cartSO.EstimatedCount())) {
                changed = true;
            }
        }
        
        return changed;
    };

    self.showCategoryEditButtons = function (category) {
        $('#category-' + category.CategoryId() + '-' + category.InstanceCount() + ' .save-so-buttons').show();
    };

    self.hideCategoryEditButtons = function (category) {
        $('#category-' + category.CategoryId() + '-' + category.InstanceCount() + ' .save-so-buttons').hide();
    };

    self.getSummaryHeaderText = function (so) {
        var headerTxt = vems.decodeHtml(so.Category());
        if (so.CategoryObj().InstanceCount() > 0) {
            headerTxt += ' (' + (so.CategoryObj().InstanceCount() + 1) + ')';
        }
        if ((so.CategoryTypeCode() == CategoryTypeCodes.CAT || so.CategoryTypeCode() == CategoryTypeCodes.RSO) && so.ServiceType().length > 0) {
            headerTxt += ', ' + moment(so.TimeStart()).format('h:mm A') + ' - ' + moment(so.TimeEnd()).format('h:mm A');
            headerTxt += ', ' + vems.decodeHtml(so.ServiceType());

            if (so.CategoryTypeCode() === CategoryTypeCodes.CAT) {
                headerTxt += ', ' + self.ScreenText.EstimatedCountText + ': ' + so.EstimatedCount();
            }
        }
        return headerTxt;
    };

    self.popResourceModal = function (resourceId, sod, category, edit) {
        if (category) {
            //check for estimated count
            if (category.ResourceCategoryTypeCode() === 'CAT' && category.CategoryServices && category.CategoryServices().length > 0) {
                if (category.ServiceEstimatedCount() == 0 || category.ServiceEstimatedCount().length === 0) {
                    vems.showErrorToasterMessage(self.ScreenText.MustBeGreaterThanMessage.replace('{0}', data.ScreenText.EstimatedCountText).replace('{1}', '0'));
                    return false;
                }
            }
            if ((category.ResourceCategoryTypeCode() === 'CAT' || category.ResourceCategoryTypeCode() === 'RSO') && category.CategoryServices && category.CategoryServices().length > 0) {
                if (category.ServiceStartTime().length === 0) {
                    var selector = 'start' + category.CategoryId() + '-' + category.InstanceCount();
                    var msg = self.ScreenText.IsRequiredMessage.replace('{0}', $('label[for="' + selector + '"]').text()).replace('{1}', category.CategoryDescription());
                    vems.showErrorToasterMessage(msg);
                    return false;
                }
                if (category.ServiceEndTime().length === 0) {
                    var selector = 'end' + category.CategoryId() + '-' + category.InstanceCount();
                    var msg = self.ScreenText.IsRequiredMessage.replace('{0}', $('label[for="' + selector + '"]').text()).replace('{1}', category.CategoryDescription());
                    vems.showErrorToasterMessage(msg);
                    return false;
                }
            }
            self.activeCategory(category);
        }
        if (sod) { self.activeSod(sod); }
        if (self.activeResource().ResourceId !== resourceId || edit) {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/GetResourceDetails',
                data: JSON.stringify({ resourceId: resourceId }),
                success: function (response) {
                    var resource = JSON.parse(response.d);
                    if (resource) {
                        self.activeResource(resource);
                        self.activeSod(new ServiceOrderDetail(resource));
                        if (sod) { self.activeSod().load(ko.mapping.toJS(sod)); }
                        if (resource.Images && resource.Images.length > 0) {  // if images exist, bind hover effect
                            $('#resource-modal').off('shown.bs.modal').on('shown.bs.modal', function () {
                                var imgContainer = $('#resource-image-container');
                                var imgOverlay = $('#resource-image-overlay');
                                var img = $('#resource-image');
                                imgOverlay.height(img.height()).width(img.width());
                                imgContainer.off('mouseenter').on('mouseenter', function () {
                                    imgOverlay.show();
                                });
                                imgContainer.off('mouseleave').on('mouseleave', function () {
                                    imgOverlay.hide();
                                });
                            });
                        }
                        if (resource.AlertDisplayOnWeb && resource.Alert.length > 0) {
                            $('#resource-alert-modal').off('hidden.bs.modal').on('hidden.bs.modal', function () {
                                $('#resource-modal').modal('show');
                            });

                            $('#resource-alert-modal').modal('show');
                        } else {
                            $('#resource-modal').modal('show');
                        }
                    } else {
                        vems.showToasterMessage('', 'error loading resource data', 'danger');
                    }
                }
            });
        } else {
            $('#resource-modal').modal('show');
        }
    };

    self.resourceModalOk = function () {
        // Added a secondary check to min/max quantity just in case they try to bypass it by typing into the box 
        if (self.activeResource().MinQuantity > 0 || self.activeResource().QuantityAvailable > 0) {
            if (self.activeSod().Quantity() === 0 || self.activeSod().Quantity() < self.activeResource().MinQuantity || (self.activeResource().QuantityAvailable != 0 && self.activeSod().Quantity() > self.activeResource().QuantityAvailable)) {
                return false;
            }
        }

        if (self.activeResource().Serves > 1) {
            self.popResourceConfirmationModal();
        } else {
            self.resourceModalAdd();
        }
    };

    self.resourceModalAdd = function () {
        $('#services-body .modal').modal('hide');  // hide any other resource modals

        var currServiceOrder = $.grep(self.serviceOrders(), function (so) {
            return so.CategoryId() === self.activeCategory().CategoryId() && so.CategoryObj().InstanceCount() === self.activeCategory().InstanceCount();
        })[0];
        if (!currServiceOrder) {  // if one doesn't already exist, create a new service order
            var so = new ServiceOrder();
            so.CategoryId(self.activeCategory().CategoryId());
            so.Category(self.activeCategory().CategoryDescription());
            so.CategoryTypeCode(CategoryTypeCodes[self.activeCategory().ResourceCategoryTypeCode()]);
            so.CategoryObj(self.activeCategory());
            so.TimeStart(self.activeCategory().ServiceStartTime());
            so.MinAmount(self.activeCategory().MinAmount());
            so.TimeEnd(self.activeCategory().ServiceEndTime());
            if (self.activeCategory().ServiceChosenServiceType() > -1) {
                so.ServiceTypeId(self.activeCategory().ServiceChosenServiceType());
                var serviceTypeDesc = $.grep(self.activeCategory().CategoryServices(), function (serviceType) {
                    return serviceType.Id() === self.activeCategory().ServiceChosenServiceType();
                })[0].Description();
                so.ServiceType(serviceTypeDesc);
            }
            so.EstimatedCount(parseInt(self.activeCategory().ServiceEstimatedCount()));
            so.Udfs(self.getUdfsForSave(self.activeCategory()));
            so.HasUdfs(so.Udfs().length > 0);
            so.BillingReferenceRequired(self.activeCategory().BillingReferenceRequired());
            so.PONumberRequired(self.activeCategory().PONumberRequired());

            // refresh selected item list before adding the SOD
            self.activeSod().ResourceItems([]);
            $.each(self.activeSod().ResourceGroups(), function (idx, grp) {
                $.each(grp.ResourceItems(), function (idx, item) {
                    if (item.IsSelected()) {
                        self.activeSod().ResourceItems.push(item.Id());
                    }
                });
            });
            so.ServiceOrderDetails.push(self.activeSod());
            self.serviceOrders.push(so);
        } else {  // otherwise, add to the current service order
            var currServiceOrderDetail = $.grep(currServiceOrder.ServiceOrderDetails(), function (sod) {
                return sod.Id() === self.activeSod().Id() && sod.ResourceId() === self.activeResource().ResourceId;
            })[0];  // find the current maching SOD and remove it
            currServiceOrder.ServiceOrderDetails.remove(currServiceOrderDetail);

            // refresh selected item list before adding the SOD
            self.activeSod().ResourceItems([]);
            $.each(self.activeSod().ResourceGroups(), function (idx, grp) {
                $.each(grp.ResourceItems(), function (idx, item) {
                    if (item.IsSelected()) {
                        self.activeSod().ResourceItems.push(item.Id());
                    }
                });
            });
            currServiceOrder.ServiceOrderDetails.push(self.activeSod());
        }

        var sel = '#summhead-' + self.activeCategory().CategoryId() + '-' + self.activeCategory().InstanceCount();
        $('body').scrollTo($(sel).offset().top - 80, { duration: 'slow' });

        self.onSummaryAdd(ko.toJS(self.activeCategory), ko.toJS(self.activeResource));

        // reset the active SOD, resource, and category
        self.activeSod(new ServiceOrderDetail());
        self.activeResource({});
        self.activeCategory({});
    };

    self.popResourceImageModal = function () {
        $('#services-body .modal').modal('hide');  // hide any other resource modals
        $('#resource-images-modal').off('hidden.bs.modal').on('hidden.bs.modal', function () {
            self.popResourceModal(self.activeResource().ResourceId, self.activeSod());
        });
        $('#resource-images-modal').modal('show');
        $('#resource-images-modal').carousel();
    };

    self.popResourceConfirmationModal = function () {
        $('#services-body .modal').modal('hide');  // hide any other resource modals
        $('#resource-confirm-btn-yes').off('click').on('click', function (e) {
            self.resourceModalAdd();
            $('#resource-confirm-modal').modal('hide');
        });
        $('#resource-confirm-btn-no').off('click').on('click', function (e) {
            self.popResourceModal(self.activeResource().ResourceId, self.activeSod());
            $('#resource-confirm-modal').modal('hide');
        });
        //$('#resource-confirm-modal').off('hidden.bs.modal').on('hidden.bs.modal', function () {
        //    self.popResourceModal(self.activeResource().ResourceId, self.activeSod());  // treat this like the 'no, change quantity' scenario
        //});
        $('#resource-confirm-modal').modal('show');
    };

    self.removeServiceOrder = function (serviceOrder) {
        var selected = $.grep(self.serviceOrders(), function (v, i) {
            return (v.CategoryObj().CategoryId() == serviceOrder.CategoryObj().CategoryId() && v.CategoryObj().InstanceCount() == serviceOrder.CategoryObj().InstanceCount());
        });
        if ($.isArray(selected) && selected.length > 0) {
            var arr = self.serviceOrders();
            var indexnum = $.inArray(selected[0], arr);
            arr.splice(indexnum, 1);
            self.serviceOrders(arr);
        }

        var udfVm = ko.dataFor($('#udf-' + serviceOrder.CategoryObj().CategoryId() + '-' + serviceOrder.CategoryObj().InstanceCount() + ' .udf-container')[0]);
        udfVm.udfAnswers([]);
        vems.bookingServicesVM.onSummaryAdd();
    };

    self.editServiceOrder = function (serviceOrder) {
        self.activeServiceOrderId(serviceOrder.Id());  // update active service order for editing  (KS - may no longer be needed, as of 07/22/2016)
        var sel = '#catheader-' + serviceOrder.CategoryObj().CategoryId() + '-' + serviceOrder.CategoryObj().InstanceCount();
        $('body').scrollTo($(sel).offset().top - 80, { duration: 'slow' });
        vems.bookingServicesVM.onServiceOrderEdit(serviceOrder);
    };

    self.popTandCs = function (text) {
        $('#service-tc-modal .modal-body').html(vems.decodeHtml(text));
        $('#service-tc-modal').modal('show');
    };

    self.categoriesRendered = function (elements, data) {
        // check that all categories have been rendered (divide children by 2 for header and body)
        if (($('#category-list').children().length / 2) === self.Services().AvailableCategories().length) {
            self.servicesLoadedCallback();
            self.rebindEvents();
            self.bindTimeSubscriptions();

            // ksnote: this may not work with category copying in the future
            // set default service types, because ko options binding with objects erases original observable value
            $.each(self.Services().AvailableCategories(), function (idx, ac) {
                ac.ServiceChosenServiceType(ac.DefaultServeTypeId());
            });
        }
    };

    self.GetServices = function (reservationId, templateId, cartBookings, eventTypeId) {
        self.Services().AvailableCategories.removeAll();  // remove all current categories during refresh to prevent premature interaction
        var data = {
            reservationId: reservationId,
            templateId: templateId,
            cartBookings: cartBookings,
            eventTypeId: eventTypeId
        };
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetServicesForBooking',
            data: JSON.stringify(data),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    var vm = JSON.parse(response.JsonData);

                    $.each(vm.AvailableCategories, function (i, v) {
                        // the desktop client will save a blank entry with a p tag.  remove it here.
                        if (v.TermsAndConditions === "<p>&nbsp;</p>") {
                            v.TermsAndConditions = '';
                        }
                    });

                    self.resourceHelpText(vm.ResourceHelpText);

                    var cartAttendance = 0;

                    var bookingCounts = new Array();
                    $.each(cartBookings, function (i, v) {
                        if ($.inArray(v.SetupCount, bookingCounts) === -1) {
                            bookingCounts.push(v.SetupCount);
                        }
                    });

                    if (bookingCounts[0] > 0) {  // use attendance of FIRST booking when setting defaults
                        cartAttendance = bookingCounts[0];
                    }

                    self.Services().load(vm, self.startDateTime(), self.endDateTime(), self.attendance(), cartAttendance);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });//end of services fetch
    };

    self.addServiceAttendee = function (category, attendee) {
        //clear body form, or load with existing
        $("#attendee-modal-content input").each(function (i, el) {
            if ($(el).attr("type") == "checkbox") {
                $(el).attr("checked", false);
            }
            else
                $(el).val('');
        });
        $("#attendee-modal-content textarea").val('');
        if (attendee) {
            //edit mode
            attendee.ResourceId(attendee.Id());

            $("#attendee-modal-content input[name='resourceid']").val(attendee.ResourceId());
            $("#attendee-modal-content input[name='attendee-name']").val(attendee.AttendeeName());
            $("#attendee-modal-content input[name='attendee-companyname']").val(attendee.CompanyName());
            $("#attendee-modal-content input[name='attendee-email']").val(attendee.EmailAddress());
            $("#attendee-modal-content input[name='attendee-phone']").val(attendee.Phone());
            $("#attendee-modal-content textarea[name='attendee-notes']").val(attendee.Notes());
            if (attendee.ExternalAttendee())
                $("#attendee-modal-content input[name='attendee-visitor']").prop('checked', true);
        }
        var title = self.ScreenText.AddCategoryAttendeeText.replace('{0}', category.CategoryDescription());
        $("#attendee-modal-content .modal-title").html(title);
        $("#attendee-modal-content .modal-title").data('cat', category);

        if (category.CompanyNameRequired()) {
            $("#attendee-modal-content label[for='attendee-companyname']").addClass("required");
            $("#attendee-modal-content input[name='attendee-companyname']").attr('required', 'required');
        }

        if (category.EmailRequired()) {
            $("#attendee-modal-content label[for='attendee-email']").addClass("required");
            $("#attendee-modal-content input[name='attendee-email']").attr('required', 'required');
        }

        if (category.PhoneRequired()) {
            $("#attendee-modal-content  label[for='attendee-phone']").addClass("required");
            $("#attendee-modal-content input[name='attendee-phone']").attr('required', 'required');
        }

        $("#attendee-modal").modal('show');
    };

    self.sortAttendees = function (colname) { };

    self.removeAttendee = function (data, parent) {
        var selected = $.grep(parent.Attendees(), function (v, i) {
            return (v.ResourceId() == data.ResourceId());
        });

        if ($.isArray(selected) && selected.length > 0) {
            var arr = parent.Attendees();
            indexnum = $.inArray(data, arr);
            arr.splice(indexnum, 1);
            parent.Attendees(arr);
        }
        self.updateAttendeeServiceOrder(parent);
    };

    self.saveCategoryAttendee = function () {
        //validate
        var category = $("#attendee-modal-content .modal-title").data('cat');
        var email = $("#attendee-modal-content input[name='attendee-email']").val();
        var phone = $("#attendee-modal-content input[name='attendee-phone']").val();
        var companyName = $("#attendee-modal-content input[name='attendee-companyname']").val();

        if ($.trim($("#attendee-modal-content input[name='attendee-name']").val()).length == 0) {
            vems.showErrorToasterMessage(self.ScreenText.IsRequiredMessage.replace('{0}', $('#attendee-modal-content [for=attendee-name]').text()).replace('{1}', category.CategoryDescription()));
            return false;
        }
        if (category.CompanyNameRequired() && $.trim(companyName).length == 0) {
            vems.showErrorToasterMessage(self.ScreenText.IsRequiredMessage.replace('{0}', $('#attendee-modal-content [for=attendee-companyname]').text()).replace('{1}', category.CategoryDescription()));
            return false;
        }
        if (category.EmailRequired() && $.trim(email).length == 0) {
            vems.showErrorToasterMessage(self.ScreenText.IsRequiredMessage.replace('{0}', $('#attendee-modal-content [for=attendee-email]').text()).replace('{1}', category.CategoryDescription()));
            return false;
        }
        if (category.PhoneRequired() && $.trim(phone).length == 0) {
            vems.showErrorToasterMessage(self.ScreenText.IsRequiredMessage.replace('{0}', $('#attendee-modal-content [for=attendee-phone]').text()).replace('{1}', category.CategoryDescription()));
            return false;
        }

        var cat = $.grep(self.Services().AvailableCategories(), function (v, i) {
            return (v.CategoryId() == category.CategoryId());
        });
        //add attendee to SO details list
        var resourceId = $("#attendee-modal-content input[name='resourceid']").val();
        if (resourceId && resourceId.length > 0) {
            //update
            if ($.isArray(cat) && cat.length > 0) {
                var att = $.grep(cat[0].Attendees(), function (v, i) {
                    return (v.Id() == resourceId);
                });
                if ($.isArray(att) && att.length > 0) {
                    att[0].AttendeeName($("#attendee-modal-content input[name='attendee-name']").val());
                    att[0].CompanyName($("#attendee-modal-content input[name='attendee-companyname']").val());
                    att[0].EmailAddress($("#attendee-modal-content input[name='attendee-email']").val());
                    att[0].Phone($("#attendee-modal-content input[name='attendee-phone']").val());
                    att[0].Notes($("#attendee-modal-content textarea[name='attendee-notes']").val());
                    att[0].ExternalAttendee($("#attendee-modal-content input[name='attendee-visitor']").is(":checked"));
                }
            }
        } else {  //add new
            var newSODetail = new ServiceOrderDetail();
            newSODetail.Id(Math.floor((Math.random() * 999999999) + 1));
            newSODetail.ResourceId(-1);
            newSODetail.AttendeeName($("#attendee-modal-content input[name='attendee-name']").val());
            newSODetail.CompanyName($("#attendee-modal-content input[name='attendee-companyname']").val());
            newSODetail.EmailAddress($("#attendee-modal-content input[name='attendee-email']").val());
            newSODetail.Phone($("#attendee-modal-content input[name='attendee-phone']").val());
            newSODetail.Notes($("#attendee-modal-content textarea[name='attendee-notes']").val());
            newSODetail.ExternalAttendee($("#attendee-modal-content input[name='attendee-visitor']").is(":checked"));

            //add attendees to category list
            if ($.isArray(cat) && cat.length > 0) {
                var clist = cat[0].Attendees();
                clist.push(newSODetail); //putting so detail in here so we can use it later.
                cat[0].Attendees(clist);
            }
        }

        self.updateAttendeeServiceOrder(cat[0]);

        $("#attendee-modal").modal('hide');
    };

    self.updateAttendeeServiceOrder = function (category) {
        //find this cat in serviceOrders if exists, otherwise add it.
        var serviceOrder = $.grep(self.serviceOrders(), function (so) {
            return so.CategoryId() === category.CategoryId() && so.CategoryObj().InstanceCount() === category.InstanceCount();
        });

        if (category.Attendees().length == 0) {
            //remove from SO list
            if ($.isArray(serviceOrder) && serviceOrder.length > 0) {
                var arr = self.serviceOrders();
                var indexnum = $.inArray(serviceOrder[0], arr);
                arr.splice(indexnum, 1);
                self.serviceOrders(arr);
            }
        } else {
            var so = new ServiceOrder();
            if ($.isArray(serviceOrder) && serviceOrder.length > 0) {
                so = serviceOrder[0];
            } else {
                so.CategoryId(category.CategoryId());
                so.Category(category.CategoryDescription());
                so.CategoryTypeCode(CategoryTypeCodes[category.ResourceCategoryTypeCode()]);
                so.CategoryObj(category);
                self.serviceOrders.push(so);
            }
        }

        if (so) {
            so.ServiceOrderDetails(category.Attendees());
        }

        vems.bookingServicesVM.onSummaryAdd();
    };
} //end bookingServicesViewModel

function ServicesViewModel() {
    var self = this;

    self.AvailableCategories = ko.observableArray([]);
    self.UnavailableCategories = ko.observableArray([]);
    self.ResourcePackages = ko.observableArray([]);
    self.CategoryParameters = ko.observable({});

    self.load = function (data, start, end, attendance, overrideAttendance) {
        if (data) {
            self.CategoryParameters(data.CategoryParameters);

            var cats = ko.mapping.fromJS(data.AvailableCategories);
            $.each(cats(), function (idx, cat) {
                if (start && end) {
                    cat.ServiceStartTime(moment(start));
                    cat.ServiceEndTime(moment(end));
                } else {
                    if ($.isFunction(data.AvailableCategories)) {  // allow loading independent of whether properties are observable
                        var catData = $.grep(data.AvailableCategories(), function (val) {
                            return val.CategoryId() === cat.CategoryId() && val.InstanceCount() === cat.InstanceCount();
                        });

                        cat.ServiceStartTime(moment(catData[0].ServiceStartTime()));
                        cat.ServiceEndTime(moment(catData[0].ServiceEndTime()));
                    } else {
                        var catData = $.grep(data.AvailableCategories, function (val) {
                            return val.CategoryId == cat.CategoryId() && val.InstanceCount == cat.InstanceCount();
                        });

                        // make sure we strip off the empty TZ record that will cause these to get out of sync across TZs.
                        cat.ServiceStartTime(moment(catData[0].ServiceStartTime.split('+')[0]));
                        cat.ServiceEndTime(moment(catData[0].ServiceEndTime.split('+')[0]));
                    }
                }

                if (self.CategoryParameters()) {
                    if (overrideAttendance && self.CategoryParameters().SetEstimatedCountFromAttendance) {
                        cat.ServiceEstimatedCount(overrideAttendance);
                    }
                    // KS - awaiting confirmation on expected behavior - for now, don't set estimated count unless override is set
                    //else if (attendance) {  // use the original attendance if not using the default
                    //    cat.ServiceEstimatedCount(attendance);
                    //}

                    if (!self.CategoryParameters().SetServiceTimesFromBooking) {
                        cat.ServiceStartTime('');
                        cat.ServiceEndTime('');
                    }
                }

                if (CategoryTypeCodes[cat.ResourceCategoryTypeCode()] === CategoryTypeCodes.NOT) {  // bind subscription for notes categories
                    cat.WrittenNotes.subscribe(function (newValue) {
                        if ((!newValue && !cat.OriginalWrittenNotes()) || newValue === cat.OriginalWrittenNotes()) {
                            $('#category-' + cat.CategoryId() + '-' + cat.InstanceCount() + ' .note-actions').hide();
                        } else {
                            $('#category-' + cat.CategoryId() + '-' + cat.InstanceCount() + ' .note-actions').show();
                        }
                    });
                }
            });

            // if there are any SOs already in the cart, update their CategoryObj references
            if ($.isFunction(vems.bookingServicesVM.serviceOrders)) {
                $.each(vems.bookingServicesVM.serviceOrders(), function (idx, so) {
                    var newCatObj = $.grep(cats(), function (cat) {
                        return so.CategoryObj() && cat.CategoryId() === so.CategoryObj().CategoryId() && cat.InstanceCount() === so.CategoryObj().InstanceCount();
                    })[0];

                    if (newCatObj) {
                        so.CategoryObj(newCatObj);
                    } else {
                        vems.bookingServicesVM.serviceOrders.remove(so);  // remove the SO if that category is no longer available
                    }
                });
            }
            self.AvailableCategories(cats());
            self.UnavailableCategories($.isFunction(data.UnavailableCategories) ? data.UnavailableCategories() : data.UnavailableCategories);
        }
    };
}

function ServiceOrder(data) {
    var self = this;

    self.Id = ko.observable(-1);
    self.Category = ko.observable('');
    self.CategoryId = ko.observable(-1);
    self.CategoryTypeCode = ko.observable(CategoryTypeCodes.CAT);  // CAT = 0, ATT = 1, NOT = 2, RES = 3, RSO = 4
    self.ServiceType = ko.observable('');
    self.ServiceTypeId = ko.observable(0);
    self.TimeStart = ko.observable(moment());
    self.TimeEnd = ko.observable(moment());
    self.EstimatedCount = ko.observable(0);
    self.RoomResourceId = ko.observable(-1);

    self.InstanceCount = ko.observable(0);

    self.MinAmount = ko.observable(0);  // currency
    self.RunningTotal = ko.observable(0);  // currency

    self.RequireServiceTimes = ko.observable(false);
    self.ShowPricing = ko.observable(false);
    self.EditAllowed = ko.observable(true);
    self.HasUdfs = ko.observable(false);
    self.IsVideoConference = ko.observable(false);
    self.BillingReferenceRequired = ko.observable(false);
    self.PONumberRequired = ko.observable(false);

    self.ServiceOrderDetails = ko.observableArray([]);  // list of ServiceOrderDetail objects
    self.TopLevelSods = ko.observableArray([]);  // list of ServiceOrderDetail objects

    self.Udfs = ko.observableArray([]);  // list of UserDefinedField objects

    self.CategoryObj = ko.observable({});  // used by UI to allow multiple service orders of same category (and for editing)

    if (data) {
        self.Id(data.Id);
        self.Category(data.Category);
        self.CategoryId(data.CategoryId);
        self.InstanceCount(data.InstanceCount);
        self.CategoryTypeCode(data.CategoryTypeCode);
        self.ServiceType(data.ServiceType);
        self.ServiceTypeId(data.ServiceTypeId);
        self.TimeStart(moment(data.TimeStart));
        self.TimeEnd(moment(data.TimeEnd));
        self.EstimatedCount(data.EstimatedCount);
        self.RoomResourceId(data.RoomResourceId);
        self.MinAmount(data.MinAmount);
        self.RunningTotal(data.RunningTotal);
        self.RequireServiceTimes(data.RequireServiceTimes);
        self.ShowPricing(data.ShowPricing);
        self.EditAllowed(data.EditAllowed);
        self.HasUdfs(data.HasUdfs);
        self.IsVideoConference(data.IsVideoConference);
        self.ServiceOrderDetails(data.ServiceOrderDetails);
        self.TopLevelSods(data.TopLevelSods);
        self.Udfs(data.Udfs);
        if (data.BillingReferenceRequired) {
            self.BillingReferenceRequired(data.BillingReferenceRequired);
        }
        if (data.PONumberRequired) {
            self.PONumberRequired(data.PONumberRequired);
        }
    }

    self.removeServiceOrderResource = function (detail) {
        var selected = $.grep(self.ServiceOrderDetails(), function (v, i) {
            return (v.ResourceId() == detail.ResourceId());
        });
        if ($.isArray(selected) && selected.length > 0) {
            var arr = self.ServiceOrderDetails();
            var indexnum = $.inArray(selected[0], arr);
            arr.splice(indexnum, 1);

            if (arr.length === 0) {  // if no more details on this service order, remove it altogether
                vems.bookingServicesVM.removeServiceOrder(self);
            } else {
                self.ServiceOrderDetails(arr);
                vems.bookingServicesVM.onSummaryAdd();
            }
        }
    };

    self.saveChanges = function () {
        self.TimeStart(self.CategoryObj().ServiceStartTime());
        self.TimeEnd(self.CategoryObj().ServiceEndTime());

        if (self.CategoryObj().ServiceChosenServiceType() > -1) {
            self.ServiceTypeId(self.CategoryObj().ServiceChosenServiceType());
            var serviceTypeDesc = $.grep(self.CategoryObj().CategoryServices(), function (serviceType) {
                return serviceType.Id() === self.CategoryObj().ServiceChosenServiceType();
            })[0].Description();
            self.ServiceType(serviceTypeDesc);
        }

        self.EstimatedCount(parseInt(self.CategoryObj().ServiceEstimatedCount()));
        var udfVm = ko.dataFor($('#udf-' + self.CategoryObj().CategoryId() + '-' + self.CategoryObj().InstanceCount() + ' .udf-container')[0]);
        self.Udfs(udfVm.getUdfsForSave(self.CategoryObj(), true));
        self.HasUdfs(self.Udfs().length > 0);

        vems.bookingServicesVM.hideCategoryEditButtons(self.CategoryObj());
        vems.bookingServicesVM.onSummaryAdd(self.CategoryObj());
    };
}

function ServiceOrderDetail(resource, pkgQty) {
    var self = this;

    self.Id = ko.observable(-1);
    self.ResourceId = ko.observable(-1);
    self.ResourceDescription = ko.observable('');
    self.ResourcePrice = ko.observable('');  // string representation of price for display
    self.ResourceItems = ko.observableArray([]);  // list of integers (ResourceItem ids)
    self.ResourceGroups = ko.observableArray([]);  // list of ResourceGroup objects

    self.PackageResources = ko.observableArray([]);  // list of other ServiceOrderDetail objects
    self.PackageResourceId = ko.observable(-1);
    self.PackageSodId = ko.observable(-1);

    self.RatePlanId = ko.observable(-1);
    self.NetPrice = ko.observable(0);  // currency
    self.UnitPrice = ko.observable(0);  // currency

    self.AttendeeName = ko.observable('');
    self.CompanyName = ko.observable('');
    self.EmailAddress = ko.observable('');
    self.Phone = ko.observable('');
    self.Notes = ko.observable('');
    self.SpecialInstructions = ko.observable('');
    self.ResourceMessage = ko.observable('');

    self.MaintainInventory = ko.observable(false);
    self.Quantity = ko.observable(0).extend({ numeric: { precision: 1, minValue: 0, maxValue: 0 } });
    self.SeqNo = ko.observable(0);

    self.IsRoomFeatureResource = ko.observable(false);
    self.IsVideoConference = ko.observable(false);
    self.ExternalAttendee = ko.observable(false);
    self.EditAllowed = ko.observable(true);

    if (resource) {
        self.ResourceId(resource.ResourceId);
        self.ResourceDescription(resource.ResourceDescription);
        self.ResourcePrice(resource.ResourcePrice || '');
        self.ResourceItems(resource.ResourceItems || []);

        self.ResourceGroups([]);
        if (resource.ResourceGroups && resource.ResourceGroups.length > 0) {
            $.each(resource.ResourceGroups, function (idx, grp) {
                self.ResourceGroups.push(new ResourceGroup(grp));
            });
        }

        self.PackageResources([]);
        if (resource.PackageResources && resource.PackageResources.length > 0) {
            $.each(resource.PackageResources, function (idx, pr) {
                var pkgQtyOverride = 0;  // if loading existing sods for editing - calculate single-package quantities for display purposes
                if (resource.Quantity && pr.hasOwnProperty('Quantity')) {
                    pkgQtyOverride = pr.Quantity / resource.Quantity;
                }
                self.PackageResources.push(new ServiceOrderDetail(pr, pkgQtyOverride));
            });
        }

        self.Notes(resource.Notes);
        self.SpecialInstructions(resource.SpecialInstructions);
        self.PackageResourceId(resource.PackageResourceId || -1);
        self.PackageSodId(resource.PackageSodId || -1);
        self.RatePlanId(resource.RatePlanId || -1);
        self.NetPrice(resource.NetPrice || 0);
        self.UnitPrice(resource.UnitPrice || 0);
        self.SeqNo(resource.WebSequence || 0);
        self.IsRoomFeatureResource(!!resource.IsRoomFeatureResource);
        self.IsVideoConference(!!resource.IsVideoConference);
        self.ExternalAttendee(!!resource.ExternalAttendee);
        self.EditAllowed(!!resource.EditAllowed);

        if (pkgQty) {  // set quantity override when simply displaying package details during service order editing
            self.Quantity = ko.observable(pkgQty)
        } else {  // enforce min/max quantity when loading resource to be added
            self.Quantity = ko.observable(resource.MinQuantity).extend({ numeric: { precision: 1, minValue: resource.MinQuantity, maxValue: resource.QuantityAvailable } });
        }
    };

    self.load = function (sodJs) {  // used to load user inputs into new SOD for editing
        self.Id(sodJs.Id);  // ids must match to decide which SOD to remove when saving edits (for when two instances of the same resource are present)
        self.AttendeeName(sodJs.AttendeeName);
        self.CompanyName(sodJs.CompanyName);
        self.EmailAddress(sodJs.EmailAddress);
        self.Phone(sodJs.Phone);
        self.Notes(sodJs.Notes);
        self.SpecialInstructions(sodJs.SpecialInstructions);
        self.MaintainInventory(sodJs.MaintainInventory);
        self.Quantity(sodJs.Quantity);
        self.ResourceGroups([]);
        $.each(sodJs.ResourceGroups, function (idx, rg) {
            var grp = new ResourceGroup();
            grp.load(rg);
            self.ResourceGroups.push(grp);
        });
    };

    self.enableOk = ko.computed(function () {
        var validInput = true;
        if (self.Quantity() <= 0) {
            validInput = false;
        };

        // for each resource group, count the selections and make sure at least the minimum number is picked
        $.each(self.ResourceGroups(), function (idx, grp) {
            var selectedCount = $.grep(grp.ResourceItems(), function (item) { return item.IsSelected(); }).length;
            if (selectedCount < grp.MinPick()) { validInput = false; }
        });

        return validInput;
    });

    self.incrementActiveQuantity = function () {
        self.Quantity(self.Quantity() + 1);
    };

    self.decrementActiveQuantity = function () {
        self.Quantity(self.Quantity() - 1);
    };
}

function ResourceGroup(resGroup) {
    var self = this;

    self.Id = ko.observable(-1);
    self.MinPick = ko.observable(0);
    self.MaxPick = ko.observable(0);
    self.Description = ko.observable('');
    self.SeqNo = ko.observable(0);
    self.ResourceItems = ko.observableArray([]);  // list of ResourceItem objects

    if (resGroup) {
        self.Id(resGroup.ResourceGroupId);
        self.MinPick(resGroup.MinPick);
        self.MaxPick(resGroup.MaxPick);
        self.Description(resGroup.Description);
        self.SeqNo(resGroup.SeqNo || 0);
        self.ResourceItems([]);

        if (resGroup.ResourceGroupItems) {
            if (resGroup.ResourceGroupItems && resGroup.ResourceGroupItems.length > 0) {
                $.each(resGroup.ResourceGroupItems, function (idx, item) {
                    self.ResourceItems.push(new ResourceItem(item));
                });
            }
        } else if (resGroup.ResourceItems) {
            if (resGroup.ResourceItems && resGroup.ResourceItems.length > 0) {
                $.each(resGroup.ResourceItems, function (idx, item) {
                    self.ResourceItems.push(new ResourceItem(item));
                });
            }
        }
    };

    self.load = function (rgJs) {
        self.Id(rgJs.Id);
        self.MinPick(rgJs.MinPick);
        self.MaxPick(rgJs.MaxPick);
        self.Description(rgJs.Description);
        self.SeqNo(rgJs.SeqNo);
        $.each(rgJs.ResourceItems, function (idx, ri) {
            var item = new ResourceItem();
            item.load(ri);
            self.ResourceItems.push(item);
        });
    };

    self.disableSelection = ko.computed(function () {
        var selectedCount = $.grep(self.ResourceItems(), function (item) { return item.IsSelected(); }).length;
        return selectedCount >= self.MaxPick();
    });
}

function ResourceItem(resItem) {
    var self = this;

    self.Id = ko.observable(-1);
    self.Description = ko.observable('');
    self.SeqNo = ko.observable(0);
    self.ResourceGroupId = ko.observable(-1);
    self.Notes = ko.observable('');
    self.IsSelected = ko.observable(false);

    if (resItem) {
        self.Id(resItem.Id ? resItem.Id : resItem.ResourceItemId);
        self.Description(resItem.Description);
        self.SeqNo(resItem.SeqNo || 0);
        self.ResourceGroupId(resItem.ResourceGroupId);
        self.Notes(resItem.Notes);
        self.IsSelected(resItem.IsSelected);
    }

    self.load = function (riJs) {
        self.Id(riJs.Id);
        self.Description(riJs.Description);
        self.SeqNo(riJs.SeqNo);
        self.ResourceGroupId(riJs.ResourceGroupId);
        self.Notes(riJs.Notes);
        self.IsSelected(riJs.IsSelected);
    };

    self.toggleItemSelection = function (item) {
        item.IsSelected(!item.IsSelected());
    };
}

//this is used to keep all category T&C checkboxes in sync
ko.bindingHandlers.TandCChecked = {
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = valueAccessor();
        var valueUnwrapped = ko.unwrap(value);
        $.each(bindingContext.$parent.Services().AvailableCategories(), function (i, r) {
            if (r.CategoryId() == bindingContext.$data.CategoryId())
                r.TermsAndConditionsChecked(valueUnwrapped);
        });

    }
};

ko.extenders.numeric = function (target, options) {  // options = object with properties: precision, minValue, maxValue
    // create a writable computed observable to intercept writes to our observable
    var result = ko.pureComputed({
        read: target,  // always return the original observables value
        write: function (newValue) {
            var current = target(),
                roundingMultiplier = Math.pow(10, options.precision),
                newValueAsNum = isNaN(newValue) ? 0 : parseFloat(+newValue),
                valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;

            // only write if it changed
            if (valueToWrite !== current) {
                // if value is outside min/max value, round to min/max
                if (options.maxValue > 0 && valueToWrite > options.maxValue) {
                    target(valueToWrite);
                    vems.showToasterMessage('', vems.bookingServicesVM.ScreenText.AvailableQuantityExceededMessage, 'warning');
                } else if (valueToWrite < options.minValue) {
                    target(valueToWrite);
                    vems.showToasterMessage('', vems.bookingServicesVM.ScreenText.MinimumQuantityExceededMessage.replace('{0}', options.minValue), 'warning');
                } else {
                    target(valueToWrite);
                }
                target.notifySubscribers(valueToWrite);
            } else {
                // if the rounded value is the same, but a different value was written, force a notification for the current field
                if (newValue !== current) {
                    target.notifySubscribers(valueToWrite);
                }
            }
        }
    }).extend({ notify: 'always' });

    // initialize with current value to make sure it is rounded appropriately
    result(target());

    // return the new computed observable
    return result;
};

var serviceOrderMappingOptions = {
    TimeStart: {
        create: function (options) {
            return ko.observable(moment(options.data));
        }
    },
    TimeEnd: {
        create: function (options) {
            return ko.observable(moment(options.data));
        }
    }
};

vems.serviceUdfValueChanged = function (catId, instanceCount) {
    var udfVm = ko.dataFor($('#udf-' + catId + '-' + instanceCount + ' .udf-container')[0]);
    var categoryObj = ko.dataFor($('#category-' + catId + '-' + instanceCount)[0]);

    if ($.isFunction(udfVm.getUdfsForSave) && $.isFunction(udfVm.udfAnswers)) {
        var currUdfs = udfVm.getUdfsForSave(categoryObj, false);
        var currAnswers = udfVm.udfAnswers();
        var changed = false;
        if (currAnswers.length > 0) {
            if (currUdfs.length > currAnswers.length) {  // new UDF value selected that wasn't selected before
                changed = true
            } else {
                $.each(currUdfs, function (idx, udf) {
                    var existingAnswer = $.grep(currAnswers, function (ans) {
                        return ans.UdfTypeId() == udf.Id();
                    })[0];
                    if (existingAnswer && (vems.decodeHtml(existingAnswer.FieldValue()) != udf.Answer())) {
                        if (udf.FieldType() == 2 && (moment(existingAnswer.FieldValue()).format('YYYY-MM-DD') == moment(udf.Answer()).format('YYYY-MM-DD'))) {
                            return true;
                        }
                        if (!existingAnswer.FieldValue() && !udf.Answer()) {
                            return true;
                        }
                        changed = true;
                        return false;
                    }
                });
            }
        }
        if (changed) {
            vems.bookingServicesVM.showCategoryEditButtons(categoryObj);
        } else if (!vems.bookingServicesVM.soValuesAreDifferent(categoryObj)) {
            vems.bookingServicesVM.hideCategoryEditButtons(categoryObj);
        }
    }
};

$(document).on('keypress', '#attendee-modal', function (e) {
    // IE will attempt to switch tabs on enter.  prevent that here.
    if (e.keyCode == 13) {
        $('#attendee-btn-ok').click();
        event.preventDefault();
        return false;
    }
});