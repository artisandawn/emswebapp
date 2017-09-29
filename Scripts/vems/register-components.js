var vems = vems || {};

/// <reference path="../modules/floorplans/reserve/FloorPlansReserve.aspx" />
//custom component fetcher for knockout component templates
var templateFromUrlLoader = {
    loadTemplate: function (name, templateConfig, callback) {
        if (templateConfig.fromUrl) {
            var fullUrl = templateConfig.fromUrl + '?cacheAge=' + templateConfig.maxCacheAge;
            $.get(fullUrl, function (markupString) {
                ko.components.defaultLoader.loadTemplate(name, markupString, callback);
            });
        } else { callback(null); }
    }
};
// Register it
ko.components.loaders.unshift(templateFromUrlLoader);

/* Begin component registry functions */
//registers and binds the filled viewmodel to the template
ko.components.register('udf-display-component', {
    template: { fromUrl: 'Scripts/modules/user-defined-fields/UDFTemplate.html', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            return params;
        }
    }
});

ko.components.register('service-udf-component', {
    template: { fromUrl: 'Scripts/modules/user-defined-fields/service-udf-template.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            return new serviceUdfViewModel(params, componentInfo);
        }
    }
});

vems.bookingDetailsVM = vems.bookingDetailsVM || {};
ko.components.register('booking-details-component', {
    template: { fromUrl: 'Scripts/modules/booking-details/booking-details-template.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            var temp = {
                ShowICS: ko.isObservable(params.ShowICS) ? params.ShowICS() : false,
                ScreenText: params.ScreenText
            }
            vems.bookingDetailsVM = new bookingDetailsViewModel(temp, componentInfo);
            return vems.bookingDetailsVM;
        }
    }
});

vems.bookingServicesVM = vems.bookingServicesVM || {};
ko.components.register('booking-services-component', {
    template: { fromUrl: 'Scripts/modules/booking-services/booking-services-template.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            vems.bookingServicesVM = new bookingServicesViewModel(params, componentInfo);

            return vems.bookingServicesVM;
        }
    }
});

vems.locationDetailsVM = vems.locationDetailsVM || {};
ko.components.register('location-details-component', {
    template: { fromUrl: 'Scripts/modules/location-details/location-details-template.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            var temp = {
                ScreenText: params.ScreenText
            }
            vems.locationDetailsVM = new locationDetailsViewModel(temp, componentInfo);
            return vems.locationDetailsVM;
        }
    }
});

vems.addAGroupVM = vems.addAGroupVM || {};
ko.components.register('add-a-group-modal', {
    template: { fromUrl: 'Scripts/modules/add-a-group/add-a-group-template.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            var temp = {
                templateId: params.templateId,
                //AddedGroups: params.Groups,
                ScreenText: params.ScreenText,
                onCloseCallback: params.onCloseCallback,
                helpTextElementId: params.helpTextElementId
            }
            vems.addAGroupVM = new AddAGroupViewModel(temp, componentInfo);
            return vems.addAGroupVM;
        }
    }
});

vems.addAContactVM = vems.addAContactVM || {};
ko.components.register('add-contacts-modal', {
    template: { fromUrl: 'Scripts/modules/add-contacts/add-contacts-template.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            //var temp = {
            //    templateId: params.templateId,
            //    GroupId: params.GroupId,
            //    Contacts: params.Contacts,
            //    ScreenText: params.ScreenText
            //}
            vems.addAContactVM = new AddContactsViewModel(params, componentInfo);
            return vems.addAContactVM;
        }
    }
});

ko.components.register('weekly-view-component', {
    template: { fromUrl: 'Scripts/modules/weekly-view/weekly-view-template.html', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            return params;
        }
    }

});

ko.components.register('web-template-modal-component', {
    template: { fromUrl: 'Scripts/modules/home/WebTemplateModalComponent.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            return params;
        }
    }
});

ko.components.register('booking-search-component', {
    template: { fromUrl: 'Scripts/modules/home/BookingSearchComponent.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            return params;
        }
    }
});

ko.components.register('summary-services-component', {
    template: { fromUrl: 'Scripts/modules/summary-services/summary-services.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            vems.summaryServicesVM = new summaryServicesViewModel({}, componentInfo);

            return vems.summaryServicesVM;
        }
    }
});


ko.components.register('cancel-reason-dialog', {
    template: { fromUrl: 'Scripts/modules/cancel-reason/CancelReason.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            return params;
        }
    }
});

vems.floorPlanVM = vems.floorPlanVM || {};
instatiateFloormapComponent();
function instatiateFloormapComponent() {
    ko.components.register('floorplans-reserve', {
        template: { fromUrl: 'Scripts/modules/floorplans/reserve/FloorPlansReserve.aspx', maxCacheAge: 1234 },
        viewModel: {
            createViewModel: function (params, componentInfo) {
                vems.floorPlanVM = new floorPlansReserveVM(params, componentInfo);
                return vems.floorPlanVM;
            }
        }
    });
};

vems.floorPlanModalVM = vems.floorPlanModalVM || {};
ko.components.register('floorplans-reserve-modal', {
    template: { fromUrl: 'Scripts/modules/floorplans/reserve/FloorPlansReserveModal.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            vems.floorPlanModalVM = new floorPlansReserveVM(params, componentInfo);
            return vems.floorPlanModalVM;
        }
    }
});

ko.components.register('recurrence-modal-component', {
    template: { fromUrl: 'Scripts/modules/room-request/RecurrenceModalComponent.aspx', maxCacheAge: 1234 },
    viewModel: {
        createViewModel: function (params, componentInfo) {
            return params;
        }
    }
});
/* End component registry functions */