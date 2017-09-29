var vems = vems || {};
var CategoryTypeCodes = {
    CAT: 0,
    ATT: 1,
    NOT: 2,
    RES: 3,
    RSO: 4
};

function summaryServicesViewModel(params, container) {
    var self = this;
    self.services = ko.dataFor(container.element).Services;
};