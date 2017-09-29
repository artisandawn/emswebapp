var vems = vems || {};
var ModalType = {
    BookingOnly: "BookingOnly",
    Reservation: "Reservation"
};

$.tablesorter.addParser({
    id: 'moment-dates',
    is: function (s) {
        return false;
    },
    format: function (s) {
        return moment(s)._d.getTime();
    },
    type: 'numeric'
});

function bookingDetailsViewModel(data, container) {
    var self = this;

    self.details = ko.observable({});
    self.Bookings = ko.observableArray([]);
    self.ShowICS = ko.observable(data.ShowICS);
    self.BookingId = ko.observable({});
    self.ReservationId = ko.observable({});
    self.GroupId = ko.observable(-1);
    self.BuildingId = ko.observable(-1);
    self.EventStart = ko.observable(moment());
    self.EventEnd = ko.observable(moment());
    self.EventName = ko.observable('');
    self.Location = ko.observable('');
    self.UserCanViewLocations = ko.observable(false);
    self.UserCanViewDetails = ko.observable(false);
    self.ShowLocation = ko.observable(false);
    self.ShowGroupName = ko.observable(false);
    self.ReservationSummaryLink = ko.observable('');
    self.EditBookingLink = ko.observable('');
    self.UnableToEditMessage = ko.observable('');
    self.IsMobile = ko.observable(DevExpress.devices.real().phone);
    self.IsExchange = ko.observable(false);
    self.IsVideoConference = ko.observable(false);
    self.IsHost = ko.observable(false);
    self.IsCheckedIn = ko.observable(false);
    self.ShowCheckinButton = ko.observable(false);
    self.AllowCancel = ko.observable(false);
    self.RequiresCancelReason = ko.observable(false);
    self.DefaultCancelReason = ko.observable(-1);
    self.AllowEndNow = ko.observable(false);
    self.HasServices = ko.observable(false);
    self.MultiLocationPAM = ko.observable(false);
    self.OccurrenceCount = ko.observable(0);

    self.CancelReasons = ko.observableArray([]);
    self.FieldNames = ko.observableArray([]);

    self.ScreenText = {};
    self.modalType = ModalType.BookingOnly;

    self.cancelAlignment = ko.pureComputed(function () {
        return self.IsCheckedIn() || self.ShowCheckinButton() ? 'align-center' : 'align-left';
    });

    self.endNowAlignment = ko.pureComputed(function () {
        var checkinShown = self.IsCheckedIn() || self.ShowCheckinButton();
        var cancelShown = self.AllowCancel();
        return checkinShown && cancelShown ? 'align-right' : (!checkinShown && !cancelShown ? 'align-left' : 'align-center');
    });

    if (data.ScreenText && data.ScreenText.TimeText && data.ScreenText.DateText && data.ScreenText.EventNameText && data.ScreenText.LocationText
        && data.ScreenText.GroupNameText && data.ScreenText.NoBookingsMessage && data.ScreenText.BookingDetailsText && data.ScreenText.EventDetailsText
        && data.ScreenText.RelatedEventsText && data.ScreenText.DownloadIcsText && data.ScreenText.ShareText && data.ScreenText.CloseText
        && data.ScreenText.FirstBookingText && data.ScreenText.LastBookingText && data.ScreenText.EditText && data.ScreenText.CheckedInText
        && data.ScreenText.CheckInText && data.ScreenText.CancelText && data.ScreenText.EndNowText && data.ScreenText.EndNowConfirmText
        && data.ScreenText.YesEndBookingText && data.ScreenText.NoDontEndText && data.ScreenText.CancelBookingQuestionText && data.ScreenText.CancelReasonText
        && data.ScreenText.CancelNotesText && data.ScreenText.YesCancelText && data.ScreenText.NoCancelText) {
        //trim all fields
        var newobj = $.extend({}, data.ScreenText);
        $.each(data.ScreenText, function (key, v) {
            //v = v.trim();
            newobj[key] = $.trim(v);
        });
        self.ScreenText = newobj;
    } else {
        console.error('screen text items required in ScreenText object: TimeText, DateText, EventNameText, LocationText, GroupNameText, NoBookingsMessage, '
            + 'BookingDetailsText, EventDetailsText, RelatedEventsText, DownloadIcsText, ShareText, CloseText, FirstBookingText, LastBookingText, EditText, '
            + 'CheckedInText, CheckInText, CancelText, EndNowText');
    }

    self.hide = function () {
        $('#booking-details-modal').modal('hide');
        return false;
    };

    self.show = function (bookingId, reservationId) {
        if ((!bookingId || bookingId <= 0) && (!reservationId || reservationId <= 0)) {
            return false;
        }

        self.ReservationId(!reservationId ? 0 : reservationId);
        self.BookingId(!bookingId ? 0 : bookingId);
        self.modalType = reservationId > 0 ? ModalType.Reservation : ModalType.BookingOnly;

        self.details([]);  // re-initialize
        self.Bookings([]);
        self.IsCheckedIn(false);
        self.ShowCheckinButton(false);
        self.AllowCancel(false);
        self.AllowEndNow(false);

        var dataStr = JSON.stringify({ bookingId: bookingId, reservationId: reservationId });
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetBookingAndReservationDetails',
            data: dataStr,
            success: function (results) {
                var result = JSON.parse(results.d);
                if (result && result.BookingFieldData.length >= 0) {
                    $('#booking-details-grid tbody > tr').remove();  // clear html grid elements to prevent tablesorter duplication
                    self.Bookings([]);
                    $('#booking-details-grid').trigger('destroy');

                    self.ReservationId(result.ReservationId);
                    self.GroupId(result.GroupId);
                    self.BuildingId(result.BuildingId);
                    self.EventStart(result.EventStart);
                    self.EventEnd(result.EventEnd);
                    self.EventName(result.EventName);
                    self.Location(result.Location);
                    self.details(result.BookingFieldData);
                    self.ShowICS(result.ShowICS);
                    self.ShowLocation(result.ShowLocation);
                    self.ShowGroupName(result.ShowGroupName);
                    self.UserCanViewLocations(result.UserCanViewLocations);
                    self.UserCanViewDetails(result.UserCanViewDetails);
                    self.ReservationSummaryLink(result.ReservationSummaryLink);
                    self.EditBookingLink(result.EditBookingLink);
                    self.UnableToEditMessage(result.UnableToEditMessage == null ? "" : result.UnableToEditMessage);
                    self.IsExchange(result.IsExchange);
                    self.IsVideoConference(result.IsVideoConference);
                    self.IsHost(result.IsHost);
                    self.IsCheckedIn(result.IsCheckedIn);
                    self.ShowCheckinButton(result.ShowCheckinButton);
                    self.AllowCancel(result.AllowCancel);
                    self.RequiresCancelReason(result.RequiresCancelReason);
                    self.DefaultCancelReason(result.DefaultCancelReason);
                    self.AllowEndNow(result.AllowEndNow);
                    self.HasServices(result.HasServices);
                    self.MultiLocationPAM(result.MultiLocationPAM);
                    self.CancelReasons(result.CancelReasons);
                    self.FieldNames(result.FieldNames);
                    self.OccurrenceCount(result.OccurrenceCount);

                    // set the edit booking link to empty so the icon does not show on mobile when the booking has services
                    if (self.IsMobile() && (self.HasServices() || self.MultiLocationPAM())) {
                        self.EditBookingLink('');
                    }

                    ko.mapping.fromJS(result.Bookings, {}, self.Bookings);

                    if (result.ShowHelpTextRecord)
                        $('#VEMSBookingDetails').show();
                    else
                        $('#VEMSBookingDetails').hide();

                    if (vems.enableSocialMedia && vems.enableSocialMedia == 1) {
                        if (typeof addthis !== 'undefined') {  // ensure addthis js loaded correctly
                            // remove any old addthis buttons and add a new one
                            $('.addthis_toolbox').remove();
                            var addThisTb = $('<div class="addthis_toolbox addthis_default_style"></div>');
                            addThisTb.attr('addthis:url', result.ShareLink);
                            addThisTb.attr('addthis:title', vems.decodeHtml(result.ShareTitle));
                            addThisTb.append($('<a class="addthis_button_compact"></a>'));
                            addThisTb.insertBefore('#close-btn');

                            addthis.toolbox('.addthis_toolbox');  // initialize new addthis button
                        }
                    }

                    // remove any old label spans and re-add the label
                    $('.at-icon-wrapper span').remove();
                    $('.at-icon-wrapper').append('<span class="at-label">' + self.ScreenText.ShareText + '</span>');

                    if (!self.IsMobile()) {  // no related bookings grid on mobile
                        if (result.Bookings.length > 0) {
                            if (result.ShowICS) {
                                $('#booking-details-grid').tablesorter({
                                    sortList: [[1, 0]],
                                    headers: {
                                        0: { sorter: false },
                                        1: { sorter: 'moment-dates' }
                                    }
                                });
                            } else {
                                $('#booking-details-grid').tablesorter({
                                    sortList: [[0, 0]],
                                    headers: {
                                        0: { sorter: 'moment-dates' }
                                    }
                                });
                            }
                        } else {
                            $('#booking-details-grid tbody').append('<tr><td colspan="6" style="text-align:center;">' + self.ScreenText.NoBookingsMessage + '</td></tr>');
                        }
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                return false;
            }
        });

        $('#booking-details-modal .modal-body .tab-pane').height('360px');
        $('#booking-details-modal').modal('show');
        return false;
    };

    self.eventNameClicked = function (data, event) {
        vems.pageLoading(true);
        window.location.href = self.ReservationSummaryLink();
    };

    self.eventEditClicked = function (data, event) {
        vems.pageLoading(true);
        if (vems.bookingDetailsVM.EditBookingLink().length > 0) {
            if (self.IsMobile()) {  // get mobile-specific edit URL
                var dataStr = JSON.stringify({ bookingId: self.BookingId(), reservationId: self.ReservationId() });
                vems.ajaxPost({
                    url: vems.serverApiUrl() + '/GetMobileEditLink',
                    data: dataStr,
                    success: function (results) {
                        var response = JSON.parse(results.d);
                        if (response.Success) {
                            window.location.href = response.SuccessMessage;
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log(thrownError);
                        return false;
                    }
                });
            } else {  // on desktop, go directly to edit when only one non-canceled booking in the reservation (no related bookings)
                var bookingCount = $.grep(self.Bookings(), function (b) {
                    return b.Id() != self.BookingId() && b.StatusTypeId() !== -12;
                }).length;
                window.location.href = bookingCount === 0 ? self.EditBookingLink() : self.ReservationSummaryLink();
            }
        } else {
            window.location.href = self.ReservationSummaryLink();
        }
    };

    self.checkInToEvent = function (booking, event) {
        self.ShowCheckinButton(false);
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/CheckInToBooking',
            data: JSON.stringify({ bookingId: booking.BookingId() }),
            success: function (response) {
                var retObj = JSON.parse(response.d);
                if (retObj.Success) {
                    var b = JSON.parse(retObj.JsonData);

                    if (b.IsCheckedIn) {
                        vems.showToasterMessage('', retObj.SuccessMessage, 'success');
                        self.IsCheckedIn(true);
                    } else {
                        vems.showErrorToasterMessage(retObj.ErrorMessage);
                        self.ShowCheckinButton(true);
                    }
                } else {
                    vems.showErrorToasterMessage(retObj.ErrorMessage);
                    self.ShowCheckinButton(true);
                }
            }
        });
    };

    self.endBookingNow = function (booking, event) {
        var modal = $('#endnow-modal-bd');
        var confirmBtn = $('#endBookingBtn-bd', modal);
        var date = $('.date', modal);
        var eventName = $('.event-name', modal);
        var location = $('.location', modal);
        var clickedRow = $(event.target).closest('tr');

        date.html('<strong>' + moment(booking.EventStart()).format('dddd, MMMM Do, YYYY, [from] h:mm [to {0}] A').replace('{0}', moment(booking.EventEnd()).format('h:mm')) + '</strong>');
        eventName.text(vems.htmlDecode(booking.EventName()));
        location.text(vems.htmlDecode(booking.Location()));

        modal.modal();

        var dataCollection = {
            reservationId: booking.ReservationId(),
            bookingId: booking.BookingId()
        };

        confirmBtn.one('click', function () {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/EndBookingNow',
                data: JSON.stringify(dataCollection),
                success: function (response) {
                    var retObj = JSON.parse(response.d);
                    if (retObj.Success) {
                        modal.modal('hide');
                        self.show(self.BookingId(), self.ReservationId());
                        var msg = retObj.SuccessMessage.replace('{0}', '<b>' + booking.EventName() + '</b>');
                        vems.showToasterMessage('', msg, 'success');
                        self.AllowEndNow(false);
                    } else {
                        vems.showErrorToasterMessage(retObj.ErrorMessage);
                    }
                }
            });
        });
    };

    self.cancelBooking = function (booking, event) {
        var form = $('#VirtualEmsForm');
        var modal = $('#cancel-modal-bd');
        var confirmBtn = $('#cancel-btn-yes-bd', modal);
        var date = $('.date', modal);
        var eventName = $('.event-name', modal);
        var location = $('.location', modal);
        var reason = $('.reason select', modal);
        var notes = $('.notes textarea', modal);
        var cancelBtn = $(event.target).closest('.btn-xs');

        // enable validation for modal
        form.validate(vems.validationClasses);

        // populate booking date/name/location details in modal
        date.html('<strong>' + moment(booking.EventStart()).format('dddd, LL, [from] LT [to {0}]').replace('{0}', moment(booking.EventEnd()).format('LT')) + '</strong>');
        eventName.text(vems.htmlDecode(booking.EventName()));
        location.text(vems.htmlDecode(booking.Location()));

        // show/hide cancel reason/notes sections as necessary and add validation rules
        if (booking.RequiresCancelReason()) {
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
            reason.val(booking.defaultCancelReason()).change();  // set default cancel reason and trigger change for required notes validation
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
                reservationId: booking.ReservationId(),
                bookingId: booking.BookingId(),
                cancelReason: booking.RequiresCancelReason() ? reason.val() : 0,
                cancelNotes: booking.RequiresCancelReason() ? notes.val() : ''
            };

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/CancelBooking',
                data: JSON.stringify(dataCollection),
                success: function (response) {
                    var retObj = JSON.parse(response.d);
                    if (retObj.Success) {
                        modal.modal('hide');
                        self.show(self.BookingId(), self.ReservationId());
                        var msg = retObj.SuccessMessage.replace('{0}', '<b>' + booking.EventName() + '</b>');
                        vems.showToasterMessage('', msg, 'success');
                    } else {
                        vems.showErrorToasterMessage(retObj.ErrorMessage);
                        return false;
                    }
                }
            });
        });
    };

    self.closeCancelModal = function () {
        $('#cancel-modal-bd').modal('hide');
    };

    self.closeEndNowModal = function () {
        $('#endnow-modal-bd').modal('hide');
    };

    if (DevExpress.devices.real().phone) {
        $('#booking-details-modal').off('shown.bs.modal').on('shown.bs.modal', function () {
            vems.convertTabsForMobile();
        });
    }
};