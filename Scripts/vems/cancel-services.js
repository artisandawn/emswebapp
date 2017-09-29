var vems = vems || {};
vems.reservationSummary = vems.reservationSummary || {};

vems.reservationSummary.cancelServicesVM = function (data) {
    var self = this;

    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);
    }

    self.valid = ko.computed(function () {
        return self.serviceCategoryId() && self.serviceCategoryId() >= 0 && self.selectedServiceOrderIds().length > 0;
    });

    self.toggleBookingSelection = function (booking) {
        if (self.selectedServiceOrderIds.indexOf(booking.ServiceOrderId()) !== -1) {
            self.selectedServiceOrderIds.remove(booking.ServiceOrderId());
        } else {
            self.selectedServiceOrderIds.push(booking.ServiceOrderId());
        }
        self.updateSelectAllCb();
    };

    self.toggleAllBookings = function () {
        if (self.selectedServiceOrderIds().length === self.bookingList().length) {
            self.selectedServiceOrderIds.removeAll();
        } else {
            var idList = self.bookingList().map(function (booking) {
                return booking.ServiceOrderId();
            });
            self.selectedServiceOrderIds(idList);
        }
        self.updateSelectAllCb();
    };

    // manual toggling required because length of observable arrays didn't seem to update UI (css classes) as observable arrays changed
    self.updateSelectAllCb = function () {
        var selectAllCb = $('#select-all-cb');
        selectAllCb.removeClass('fa-square-o');
        selectAllCb.removeClass('fa-check-square-o');
        if (self.selectedServiceOrderIds().length === self.bookingList().length) {
            selectAllCb.addClass('fa-check-square-o');
        } else {
            selectAllCb.addClass('fa-square-o');
        }
    };

    self.populateBookingList = function () {
        if (!self.serviceCategoryId() || self.serviceCategoryId() <= 0) {
            $('#bookings-grid tbody > tr').remove();  // clear html grid elements to prevent tablesorter duplication
            self.bookingList([]);  // manually update to cause DOM re-creation
            $('#bookings-grid').trigger('update');
            self.selectedServiceOrderIds.removeAll();  // uncheck all items
            return false;
        }
        jsVm = ko.toJS(self);
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/PopulateCancelServicesList',
            data: JSON.stringify({ vm: jsVm }),
            success: function (result) {
                var response = ko.mapping.fromJS(JSON.parse(result.d));
                if (response.bookingList().length > 0) {
                    $('#bookings-grid tbody > tr').remove();  // clear html grid elements to prevent tablesorter duplication
                    self.bookingList([]);  // manually update to cause DOM re-creation
                    self.bookingList(response.bookingList());
                    $('#bookings-grid').trigger('update');
                    self.selectedServiceOrderIds.removeAll();  // uncheck all items
                    self.updateSelectAllCb();
                } else {
                    vems.showToasterMessage('', vems.reservationSummary.bookingListFailureMessage, 'danger');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    self.cancelSelectedServices = function () {
        if (!self.valid()) { return false; }
        jsVm = ko.toJS(self);
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/CancelServicesSave',
            data: JSON.stringify({ vm: jsVm }),
            success: function (result) {
                var response = ko.mapping.fromJS(JSON.parse(result.d));
                self.serviceCategoryId(null);
                self.serviceCategories(response.serviceCategories());
                $('#bookings-grid tbody > tr').remove();  // clear html grid elements to prevent tablesorter duplication
                self.bookingList([]);  // manually update to cause DOM re-creation
                $('#bookings-grid').trigger('update');
                self.selectedServiceOrderIds.removeAll();  // uncheck all items
                window.location = response.breadcrumbLink();  // redirect to reservation summary w/ confirmation toast
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };
};