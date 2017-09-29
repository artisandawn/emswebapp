var vems = vems || {};
vems.reservationSummary = vems.reservationSummary || {};

vems.reservationSummary.cancelBookingsVM = function (data) {
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
        if (self.selectedBookingIds().length === self.bookingList().length) {
            self.selectedBookingIds.removeAll();
        } else {
            var idList = self.bookingList().map(function (booking) {
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
        if (self.selectedBookingIds().length === self.bookingList().length && self.bookingList().length > 0) {
            selectAllCb.addClass('fa-check-square-o');
        } else {
            selectAllCb.addClass('fa-square-o');
        }
    };

    self.cancelSelectedBookings = function () {
        var form = $('#VirtualEmsForm');
        var modal = $('#cancel-modal');
        var confirmBtn = $('#cancel-btn-yes', modal);
        var reason = $('.reason select', modal);
        var notes = $('.notes textarea', modal);

        // enable validation for modal
        form.validate(vems.validationClasses);

        // show/hide cancel reason/notes sections as necessary and add validation rules
        if (self.requireCancelReason()) {
            $('.reason', modal).show();
            $('.notes', modal).show();
            reason.rules('add', { required: true });
            notes.rules('add', { sanitize: true });

            reason.on('change', function (e) {
                if ($('option:selected', this).data('notes-required')) {
                    notes.rules('add', { required: true, trim: true });
                } else if (notes.rules() && Object.keys(notes.rules()).length > 0) {
                    notes.rules('remove', 'required');
                    notes.rules('remove', 'trim');
                    form.data('validator').resetForm();
                }
            });
        } else {
            $('.reason', modal).hide();
            $('.notes', modal).hide();
        }

        // initialize the modal and bind show/hide events
        modal.modal();
        modal.on('shown.bs.modal', function (event) {
            form.data('validator').resetForm();
            reason.change();  // trigger change for required notes validation
        });
        modal.on('hidden.bs.modal', function (event) {
            reason.val('');
            notes.val('');
            notes.rules('remove');
            confirmBtn.off('click');
        });

        // bind cancel confirmation event
        confirmBtn.on('click', function (e) {
            if (!form.valid()) {
                return false;
            }

            var dataCollection = {
                reservationId: self.reservationId(),
                bookingIds: self.selectedBookingIds(),
                cancelReason: self.requireCancelReason() ? reason.val() : 0,
                cancelNotes: self.requireCancelReason() ? notes.val() : ''
            };

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/CancelBookings',
                data: JSON.stringify(dataCollection),
                success: function (response) {
                    var retObj = JSON.parse(response.d);
                    if (retObj.Success) {
                        modal.modal('hide');
                        self.updateCancelBookingsList();
                        vems.showToasterMessage('', retObj.SuccessMessage, 'success');
                    } else {
                        vems.showToasterMessage('', retObj.ErrorMessage, 'danger');
                        return false;
                    }
                }
            });
        });
    };

    self.updateCancelBookingsList = function () {
        jsVm = ko.toJS(self);
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/PopulateCancelBookingsList',
            data: JSON.stringify({ vm: jsVm }),
            success: function (result) {
                var response = ko.mapping.fromJS(JSON.parse(result.d));
                $.each(response.bookingList(), function (idx, booking) {  // filter out VC host bookings when necessary
                    if (booking && booking.VideoConferenceHost() && (booking.OccurrenceCount() > 1)) {
                        response.bookingList.remove(booking);
                    }
                });

                $('#bookings-grid tbody > tr').remove();  // clear html grid elements to prevent tablesorter duplication
                self.bookingList(response.bookingList());
                $('#bookings-grid').trigger('update');

                self.selectedBookingIds.removeAll();  // uncheck all items
                self.updateSelectAllCb();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };
};