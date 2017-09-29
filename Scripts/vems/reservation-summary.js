vems.reservationSummary = vems.reservationSummary || {};

function reservationSummaryModel(pageData) {
    var self = this;
    self.initialized = false;

    self.reservation = ko.observable(pageData.ReservationData[0]);

    for (var i = 0; i < pageData.BookingData.length; i++) {
        pageData.BookingData[i].Services = ko.observableArray(0);
    }


    self.bookings = ko.observableArray([]);
    if (pageData.BookingData) {
        var arr = [];
        $.each(pageData.BookingData, function (i, v) {
            arr.push(new BookingDataViewModel(v));
        });
        self.bookings(arr);
    }
    self.attachments = ko.observableArray(pageData.Attachments);
    self.comments = ko.observableArray(pageData.Comments);
    self.udfs = ko.observableArray();
    self.holidays = ko.observableArray(pageData.Holidays);
    self.cancelReasons = ko.observableArray(pageData.CancelReasons);
    self.setupTypes = ko.observableArray(pageData.SetupTypes);
    self.allowReservationEdit = pageData.AllowReservationEdit;
    self.editReservationLink = pageData.EditReservationLink;
    self.cancelBookingsLink = pageData.CancelBookingsLink;
    self.defaultCancelReason = pageData.DefaultCancelReason;
    self.addBookingLink = pageData.AddBookingLink;
    self.multiEditBookingLink = pageData.MultiEditBookingLink;
    self.manageAttendeesLink = pageData.ManageAttendeesLink;
    self.serviceAvailability = ko.observable({ Categories: {} });
    self.showResourcePricing = pageData.ShowResourcePricing;
    self.serviceOnly = ko.observable(pageData.ServiceOnly);
    self.AllowAttachments = ko.observable(pageData.AllowAttachments);
    self.AllowedAttachmentExtensions = ko.observable(pageData.AllowedAttachmentExtensions);
    self.TemplateId = ko.observable(pageData.TemplateId);

    self.userDefinedFields = ko.observableArray(JSON.parse(pageData.UserDefinedFields));

    self.reservationActions = ko.observableArray(pageData.ReservationActions);
    self.reservationViewActions = ko.observableArray(pageData.ReservationViewActions);

    self.includeCancelledBookings = ko.observable(pageData.ReservationData[0].StatusTypeId === -12 ? true : false);
    self.includePastBookings = ko.observable(false);
    self.viewOnly = ko.observable(pageData.ViewOnly);

    $('#bookings-grid').on('sortEnd', function () {
        self.setColumnHighlights();
    });

    $('#booking-tabs li a').on('click', function () {
        $('.services-component-container').hide();

        self.includePastBookings($(this).data('type'));

        if (self.includePastBookings())
            $('#bookings-grid').trigger('sorton', [[[2, 1]]]);
        else
            $('#bookings-grid').trigger('sorton', [[[2, 0]]]);

        self.setColumnHighlights();

    });

    self.ShowBooking = function (data) {
        self.setColumnHighlights();

        if (self.includePastBookings() && !data.InPast)
            return false;

        if (!self.includePastBookings() && data.InPast)
            return false;

        if (!self.includeCancelledBookings() && data.StatusTypeId == -12)
            return false;

        return true;
    };

    self.setColumnHighlights = function () {
        $('#bookings-grid tbody tr:visible:even').css('background-color', '#fafaf8');
        $('#bookings-grid tbody tr:visible:odd').css('background-color', '#fff');
    };

    self.breadcrumbText = ko.pureComputed(function () {
        var dateString = self.bookings().length > 0 ? moment(self.bookings()[0].EventStart).format('ll') : '';

        return self.viewOnly()
            ? vems.reservationSummary.breadcrumbLabel.replace('{0}', self.reservation().EventName).replace('{1}', dateString)
            : '/ ' + vems.reservationSummary.breadcrumbLabel.replace('{0}', self.reservation().EventName).replace('{1}', dateString);
    });

    self.toggleShowCancelled = function () {
        if (self.includeCancelledBookings())
            self.includeCancelledBookings(false);
        else
            self.includeCancelledBookings(true);
    };

    self.isBookingEditable = function (booking) {
        if (!booking.CanEditBooking)
            return false;

        if (this.reservation().VideoConference)
            return booking.IsHost;

        if (booking.ExchangeChild)
            return false;

        return true;
    };

    self.isBookingCancellable = function (booking) {
        if (!booking.CanCancelBooking)
            return false;

        //if (this.reservation().VideoConference)
        //    return false;

        if (booking.ExchangeChild)
            return false;

        return true;
    };

    self.popVCHostWarning = function () {
        $("#vc-cancel-warning-modal").modal('show');
    };

    self.editFromGrid = function (data, event) {
        if (data.EditUrl && data.EditUrl.length > 0)
            window.location = data.EditUrl;
    };

    self.cancelFromGrid = function (booking, event) {
        var form = $('#VirtualEmsForm');
        var modal = $('#cancel-modal');
        var confirmBtn = $('#cancel-btn-yes', modal);
        var cancelBtn = $('#cancel-btn-no', modal);
        var date = $('.date', modal);
        var eventName = $('.event-name', modal);
        var location = $('.location', modal);
        var reason = $('.reason select', modal);
        var notes = $('.notes textarea', modal);
        var title = $('.modal-title', modal);
        var cancelReasonRequired = parseInt(self.reservation().RequireCancelReason) === 1;

        // enable validation for modal
        form.validate(vems.validationClasses);

        if (booking) {
            title.text(vems.reservationSummary.cancelBookingQuestionText);
        } else {  // cancelling the entire reservation
            title.text(vems.reservationSummary.cancelReservationQuestionText);
        }

        if (booking) {
            // populate booking date/name/location details in modal
            date.html('<strong>' + moment(booking.EventStart).format('dddd, LL, [from] LT [to {0}]').replace('{0}', moment(booking.EventEnd).format('LT')) + '</strong>');
            eventName.text(vems.htmlDecode(booking.EventName));
            location.text(vems.htmlDecode(booking.Location));
            confirmBtn.text(vems.reservationSummary.yesCancelBookingText);
            cancelBtn.text(vems.reservationSummary.noCancelBookingText);
            date.show();
            location.show();
        } else {  // cancelling the entire reservation
            date.hide();
            location.hide();
            eventName.text(vems.reservationSummary.cancelReservationConfirmText);
            confirmBtn.text(vems.reservationSummary.yesCancelReservationText);
            cancelBtn.text(vems.reservationSummary.noCancelReservationText);
        }

        // show/hide cancel reason/notes sections as necessary and add validation rules
        if (cancelReasonRequired) {
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

            var dataCollection;
            if (booking) {
                dataCollection = {
                    reservationId: booking.ReservationId,
                    bookingId: booking.Id,
                    cancelReason: cancelReasonRequired ? reason.val() : 0,
                    cancelNotes: cancelReasonRequired ? notes.val() : ''
                };

                vems.ajaxPost({
                    url: vems.serverApiUrl() + '/CancelBooking',
                    data: JSON.stringify(dataCollection),
                    success: function (response) {
                        var retObj = JSON.parse(response.d);
                        if (retObj.Success) {
                            modal.modal('hide');

                            // manually modify booking record and refresh table to avoid db callback
                            var newBookingList = self.bookings().slice();
                            for (var i = 0; i < newBookingList.length; i++) {
                                if (newBookingList[i].Id === booking.Id) {
                                    newBookingList[i].Status = 'Cancelled';
                                    newBookingList[i].StatusTypeId = -12;
                                    newBookingList[i].CanCancelBooking = false;
                                    newBookingList[i].CanCheckIn = false;
                                    newBookingList[i].CanEditBooking = false;
                                } else if (newBookingList[i].EventGmtStart === booking.EventGmtStart) {
                                    newBookingList[i].OccurrenceCount--;  // decrement occurrence count on bookings in same occurrence (to update cancel logic)

                                    if (newBookingList[i].ExchangeChild) {
                                        newBookingList[i].Status = 'Cancelled';
                                        newBookingList[i].StatusTypeId = -12;
                                        newBookingList[i].CanCancelBooking = false;
                                        newBookingList[i].CanCheckIn = false;
                                        newBookingList[i].CanEditBooking = false;
                                    }
                                }
                            }
                            $('#bookings-grid tbody > tr').remove();  // clear html grid elements to prevent tablesorter duplication
                            self.bookings([]);
                            self.bookings(newBookingList);
                            $('#bookings-grid').trigger('update');

                            var msg = retObj.SuccessMessage.replace('{0}', '<b>' + booking.EventName + '</b>');
                            var toastType = 'success';

                            if (retObj.ErrorMessage && retObj.ErrorMessage.length > 0) {
                                msg += "<br />" + retObj.ErrorMessage;
                                toastType = 'warning';
                            }

                            vems.showToasterMessage('', msg, toastType);
                        } else {
                            vems.showErrorToasterMessage(retObj.ErrorMessage);
                            return false;
                        }
                    }
                });
            } else {  // cancelling the entire reservation
                dataCollection = {
                    reservationId: self.reservation().ReservationId,
                    cancelReason: cancelReasonRequired ? reason.val() : 0,
                    cancelNotes: cancelReasonRequired ? notes.val() : ''
                };

                vems.ajaxPost({
                    url: vems.serverApiUrl() + '/CancelReservation',
                    data: JSON.stringify(dataCollection),
                    success: function (response) {
                        var retObj = JSON.parse(response.d);
                        if (retObj.Success) {
                            modal.modal('hide');
                            window.location.reload();
                        } else {
                            vems.showErrorToasterMessage(retObj.ErrorMessage);
                            return false;
                        }
                    }
                });
            }
        });
    };

    self.cancelReservation = function (data, event) {
        self.cancelFromGrid(null, event);
    };

    self.hostChanged = function (data, event) {
        // they've unselected all hosts, select the first booking.
        if (!data.IsHost()) {
            //find first in VCUniqueIds that isn't this row.
            for (var i = 0; i <= self.bookings().length - 1; i++) {
                if (self.bookings()[i].VCUniqueId == data.VCUniqueId && self.bookings()[0].Id != data.Id) {
                    self.bookings()[i].IsHost(true);
                    break;
                }
            }
        }
        //if ($('.cart-host-check:checked').length == 0)
        //    $('.cart-host-check').eq(0).prop('checked', 'checked');

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/ChangeHost',
            data: JSON.stringify({ reservationId: self.reservation().ReservationId, bookingId: data.Id }),
            success: function (response) {
                var retObj = JSON.parse(response.d);

                if (!retObj.Success)
                    vems.showErrorToasterMessage(retObj.ErrorMessage, 2000);
                else {
                    var b = JSON.parse(retObj.JsonData);
                    var arr = [];
                    $.each(b, function (i, v) {
                        arr.push(new BookingDataViewModel(v));
                    });
                    $('#bookings-grid tbody').empty(); //clear out the tablesorter
                    self.bookings(arr);
                    $('#bookings-grid').trigger('update');
                }
            }
        });
    }

    self.setupCountChangedFromGrid = function (element) {
        if (!self.initialized)
            return false;

        var bindingData = ko.dataFor(element);

        var setupCount = $(element).val();
        var min = $(element).prop('min');
        var max = $(element).prop('max');

        var valid = self.setupCountValid(parseInt(setupCount, 10), parseInt(min, 10), parseInt(max, 10));

        if (!valid) {
            $(element).val('');

            //{0} has a minimum capacity of {1}, and a maximum of {2}.
            var roomDescription = ko.dataFor($(element)[0]).RoomDescription && $.isFunction(ko.dataFor($(element)[0]).RoomDescription)
                ? ko.dataFor($(element)[0]).RoomDescription()
                : ko.dataFor($(element)[0]).RoomDescription;

            var violationMessage = vems.reservationSummary.RoomCapacityViolationMessage
                .replace('{0}', roomDescription)
                .replace('{1}', min)
                .replace('{2}', max);

            vems.showToasterMessage('', violationMessage, 'danger');
        } else {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/UpdateSetupTypeFromGrid',
                data: JSON.stringify({ reservationId: bindingData.ReservationId, bookingId: bindingData.Id, setupTypeId: bindingData.SetupTypeId, setupCount: setupCount }),
                success: function (result) {
                    var response = JSON.parse(result.d);

                    if (response.Result != 1)
                        vems.showToasterMessage('', response.Msg, 'danger');
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        }
    };

    self.setupCountValid = function (count, min, max) {
        if (self.setupTypeValidation() != 2)
            return true;

        return count >= min && count <= max;
    };

    self.setupTypeChangedFromGrid = function (data, event) {
        if (!self.initialized)
            return false;

        self.setupTypeDrop = $(event.currentTarget);
        var roomId = data.RoomId;

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/SetupTypeChanged',
            data: JSON.stringify({ roomId: roomId, setupTypeId: self.setupTypeDrop.val() }),
            success: function (result) {
                var response = JSON.parse(result.d);

                if (response.length > 0) {
                    var setupCountInput = self.setupTypeDrop.parent().siblings('.setup-count').children('input');
                    setupCountInput.prop('min', response[0].MinCapacity);
                    setupCountInput.prop('max', response[0].Capacity);
                }

                self.setupCountChangedFromGrid(self.setupTypeDrop.parent().siblings('.setup-count').children('input')[0]);

                self.setupTypeDrop.find("option[value=0]").remove();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    self.setupTypeValidation = ko.observable();

    self.loadServices = function (data, event) {
        var element = event.currentTarget;
        if ($('tr[data-bookingid=' + data.Id + '].services-component-container').is(':visible')) {
            $('tr[data-bookingid=' + data.Id + '].services-component-container').hide();
            $(element).text(vems.reservationSummary.viewServices);
        }
        else {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/GetServiceOrdersForBooking',
                data: JSON.stringify({ bookingId: data.Id }),
                success: function (response) {
                    var retObj = JSON.parse(response.d);
                    if (retObj.Success) {
                        data.Services(JSON.parse(retObj.JsonData));

                        $('tr[data-bookingid=' + data.Id + '].services-component-container').show();
                        $(element).text(vems.reservationSummary.hideServices);
                    } else {
                        vems.showErrorToasterMessage(retObj.ErrorMessage);
                        return false;
                    }
                },
                error: function (response) {
                    console.log(response);
                }
            });
        }
    };

    self.manageServices = function (data, event) {
        window.location = data.EditServicesUrl;
    };

    self.icsEmailKeyup = function (data, event) {
        $('#send-ics-ok-btn').prop('disabled', $(event.currentTarget).val().length == 0);
    };

    self.sendIcs = function () {
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/SendIcsToEmail',
            data: JSON.stringify({ reservationId: reservationSummaryModel.reservation().ReservationId, emailAddress: $('#ics-email').val() }),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    vems.showToasterMessage('', response.SuccessMessage, 'success');
                }
                else {
                    vems.showErrorToasterMessage(response.ErrorMessage);
                    return false;
                }
            }
        });
    };
    //----File Attachment methods
    self.fileUploaded = function (e) {
        var resp = JSON.parse(e.jQueryEvent.currentTarget.responseText);

        if (!resp.Success) {
            $("#attachments-container").find(".attachment-row").each(function (i) {
                if ($(this).find(".filename").html() == e.file.name) {
                    $(this).find(".error").remove();
                    $('<span class="error" style="margin-left: 15px;">Error: ' + resp.ErrorMessage + '</span>').insertAfter($(this).find(".filename"));
                }
            });
            vems.showErrorToasterMessage(resp.ErrorMessage);
            self.removeFileFromUploadWidget("fileUploader", e.file);
            //vems.showErrorToasterMessage(vems.reservationSummary.AttachmentUploadErrorText);
        } else {
            $("#attachments-panel").find(".attachment-row").each(function (i) {
                if ($(this).find(".filename").html() == e.file.name) {
                    $(this).find(".error").remove();
                }
            });
            var newObj = ko.observable({});
            ko.mapping.fromJSON(resp.JsonData, {}, newObj);
            self.attachments(newObj());
            vems.showToasterMessage('', vems.reservationSummary.AttachmentAddedText, 'success');
        }

        $('#res-attach-loading').fadeOut();
    };

    self.fileUploadError = function (e) {
        vems.showErrorToasterMessage(fileUploadErrMsg);
        self.removeFileFromUploadWidget("fileUploader", e.file);
        removeFileFromLocalArray(e.file);
        $('#res-attach-loading').fadeOut();
    };

    function removeFileFromLocalArray(file) {
        var arr = self.attachments();
        var indexnum = $.inArray(file, arr);
        arr.splice(indexnum, 1);
        self.attachments(arr);
    };

    self.removeFile = function (file) {

        var data = {
            reservationId: reservationSummaryModel.reservation().ReservationId,
            templateId: reservationSummaryModel.reservation().WebTemplateID,
            file: ko.toJS(file)
        }
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/DeleteAttachment',
            data: JSON.stringify(data),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    removeFileFromLocalArray(file);

                    //we've got to keep the dxuploader in sync with our list
                    self.removeFileFromUploadWidget("fileUploader", file);

                    vems.showToasterMessage('', response.SuccessMessage, 'success');
                }
                else {
                    vems.showErrorToasterMessage(response.ErrorMessage);
                    return false;
                }
            }
        });

    };

    self.removeFileFromUploadWidget = function (uploaderDivId, file) {
        var c = $("#" + uploaderDivId).dxFileUploader('instance');
        var files = c.option('values');
        var f = $.grep(files, function (c) {
            return (c.name === file.name);
        });
        if ($.isArray(f) && f.length > 0) {
            indexnum = $.inArray(f[0].value, files);
            files.splice(indexnum, 1);
            c.option('values', files);
        }
    };

    self.getAttachments = function () {
        var data = {
            reservationId: reservationSummaryModel.reservation().ReservationId
        }
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetReservationAttachments',
            data: JSON.stringify(data),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    var newObj = ko.observable({});
                    ko.mapping.fromJSON(response.JsonData, {}, newObj);
                    self.attachments(newObj());
                }
                else {
                    vems.showErrorToasterMessage(response.ErrorMessage);
                    return false;
                }
            }
        });
    }

    //----End of file attachment methods
}

function showIcsModal() {
    $('#send-ics-modal').modal('show');
};

function showServiceAvailability() {
    var form = $('#VirtualEmsForm');
    var modal = $('#service-availability-modal');

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetServiceAvailability',
        data: JSON.stringify({ templateId: reservationSummaryModel.reservation().WebTemplateID, reservationId: reservationSummaryModel.reservation().ReservationId }),
        success: function (result) {
            var response = JSON.parse(result.d);
            if (response.Success) {
                //reservationSummaryModel.serviceAvailability( JSON.parse(response.JsonData));
                var categoryVM = ko.observable({});
                ko.mapping.fromJSON(response.JsonData, {}, categoryVM);
                reservationSummaryModel.serviceAvailability(categoryVM());
                modal.modal('show');
            }
            else {
                vems.showErrorToasterMessage(response.ErrorMessage);
                return false;
            }
        }
    });

    $(modal).find('.modal-body').off('hidden.bs.collapse').on('hidden.bs.collapse', toggleChevron);
    $(modal).find('.modal-body').off('shown.bs.collapse').on('shown.bs.collapse', toggleChevron);
    return false;
};

function toggleChevron(e) {
    $(e.target)
        .parent().parent('.collapse-toggle')
        .find("i.indicator")
        .toggleClass('fa-caret-down fa-caret-up');
};

function BookingDataViewModel(data) {
    var self = this;

    if (data)
        $.extend(self, data);

    self.IsHost = ko.observable(false);
    self.IsHost(data.IsHost);

    self.IsHost.subscribe(function (newValue) {
        reservationSummaryModel.hostChanged(self);
    });
};
