var vems = vems || {};
vems.reservationSummary = vems.reservationSummary || {};

vems.reservationSummary.reconfirmBookingsVM = function (data) {
    var self = this;
    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);
    }

    self.toggleBookingSelection = function (booking) {
        if (self.selectedBookingIds.indexOf(booking.Id()) !== -1) {
            self.selectedBookingIds.remove(booking.Id());
        } else {
            self.selectedBookingIds.push(booking.Id());
        }
        self.updateSelectAllCb();
    };

    self.toggleAllBookings = function () {
        if (self.selectedBookingIds().length === self.bookings().length) {
            self.selectedBookingIds.removeAll();
        } else {
            var idList = self.bookings().map(function (booking) {
                return booking.Id();
            });
            self.selectedBookingIds(idList);
        }
        self.updateSelectAllCb();
    };

    // manual toggling required because length of observable arrays didn't seem to update UI (css classes) as observable arrays changed
    self.updateSelectAllCb = function () {
        var selectAllCb = $('#select-all-cb');
        selectAllCb.removeClass('fa-square-o');
        selectAllCb.removeClass('fa-check-square-o');
        if (self.selectedBookingIds().length === self.bookings().length && self.bookings().length > 0) {
            selectAllCb.addClass('fa-check-square-o');
        } else {
            selectAllCb.addClass('fa-square-o');
        }
    };

    self.reconfirmSelectedBookings = function () {
        if (self.selectedBookingIds() == 0)
            return false;

        var dataCollection = {
            statusId: self.statusId(),
            bookingIds: self.selectedBookingIds(),
        };

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/ReconfirmBookings',
            data: JSON.stringify(dataCollection),
            success: function (response) {
                var retObj = JSON.parse(response.d);
                if (retObj.Success) {
                    self.updateBookingsList();
                    vems.showToasterMessage('', retObj.SuccessMessage, 'success');
                } else {
                    vems.showToasterMessage('', retObj.ErrorMessage, 'danger');
                    return false;
                }
            }
        });
    };

    self.updateBookingsList = function () {
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/PopulateReconfirmBookingsList',
            data: JSON.stringify({ statusId: self.statusId(), bookingId: self.bookingId() }),
            success: function (result) {
                var response = ko.mapping.fromJS(JSON.parse(result.d));

                $('#bookings-grid tbody > tr').remove();  // clear html grid elements to prevent tablesorter duplication
                self.bookings(response.bookings());
                $('#bookings-grid').trigger('update');
                self.updateSelectAllCb();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };
};