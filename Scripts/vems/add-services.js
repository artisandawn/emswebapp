var vems = vems || {};
vems.screentext = vems.screentext || {};
vems.reservationSummary = vems.reservationSummary || {};

var AddServicesPageModes = {
    ServiceSelection: 0,
    BookingSelection: 1,
    AddResults: 2
};

vems.reservationSummary.addServicesVM = function (data) {
    var self = this;
    self.services = ko.observable({});
    self.serviceOrders = ko.observableArray([]);
    self.pageMode = ko.observable(AddServicesPageModes.ServiceSelection);  //todo: remove these from server-side model if not needed
    self.billingReference = ko.observable('');
    self.poNumber = ko.observable('');
    self.filteredBookingList = ko.observableArray([]);
    self.showBillingReferenceLookup = ko.observable(false);
    self.showPONumberLookup = ko.observable(false);
    self.attendeeSubscriptions = [];

    if (data !== null) {
        ko.mapping.fromJS(data, {}, self);
        self.services = ko.observable(data.services);
        self.billingReference(data.billingReference());
        self.poNumber(data.poNumber());
        self.showBillingReferenceLookup(data.showBillingReferenceLookup());
        self.showPONumberLookup(data.showPoNumberLookup());
    }

    self.serviceOrders.subscribe(function (solist) {
        self.toggleCategoryLocks();

        //check for room bookings that have resource exclusions and set message
        if (solist && solist.length > 0 && self.bookingList && self.bookingList().length > 0) {
            $.each(solist, function (i, so) {
                $.each(so.ServiceOrderDetails(), function (j, sod) {
                    var excludedRooms = [];
                    $.each(self.bookingList(), function (idx, booking) { 
                        if (booking.AvailableResources().indexOf(sod.ResourceId()) < 0 ){
                            excludedRooms.push(booking.Location());
                        }
                    });

                    if (excludedRooms.length > 0) {
                        sod.ResourceMessage(vems.browse.ResourceExcludedFromRoom + excludedRooms.join(', '));
                    }
                });
            });            
        }
    });

    self.serviceOrdersValid = ko.computed(function () {
        return self.serviceOrders().length > 0;
    });

    self.bookingsValid = ko.computed(function () {
        return self.selectedBookingIds().length > 0;
    });

    self.nextStep = function () {
        if (vems.bookingServicesVM.validateServices()) {
            var filteredBookings = [];
            $.each(self.bookingList(), function (idx, booking) {
                var resourceAvailable = true;
                $.each(self.serviceOrders(), function (i, so) {
                    $.each(so.ServiceOrderDetails(), function (j, sod) {
                        if ($.inArray(sod.ResourceId(), booking.AvailableResources()) === -1) {
                            resourceAvailable = false;
                            return false;  // break to next SO (a resource isn't available to this booking)
                        }
                    });
                    if (!resourceAvailable) {
                        return false;  // break to next booking (a resource isn't available to this booking)
                    }
                });

                if (resourceAvailable) {
                    filteredBookings.push(booking);
                }
            });

            self.pageMode(AddServicesPageModes.BookingSelection);
            $('#bookings-grid tbody > tr').remove();  // clear html grid elements to prevent tablesorter duplication
            self.filteredBookingList([]);
            self.filteredBookingList(filteredBookings);
            $('#bookings-grid').tablesorter({
                sortList: [[1, 0]],
                headers: {
                    0: { sorter: false },
                    1: { sorter: 'moment-dates' }
                }
            });
        }
    };

    self.prevStep = function () {
        self.selectedBookingIds.removeAll();  // uncheck all items
        self.pageMode(AddServicesPageModes.ServiceSelection);
    };

    self.toggleCategoryLocks = function () {
        if (self.serviceOrders().length > 0) {  // disallow selection of resources from all other categories
            var usedCatId = self.serviceOrders()[0].CategoryId();
            $.each(self.services().AvailableCategories(), function (idx, cat) {
                if (cat.CategoryId() !== usedCatId) {
                    var catHeader = $('#catheader-' + cat.CategoryId() + '-' + cat.InstanceCount());
                    var catBody = $('#category-' + cat.CategoryId() + '-' + cat.InstanceCount());
                    var catOverlay = $('#addlock-' + cat.CategoryId() + '-' + cat.InstanceCount());
                    catOverlay.css('height', (catHeader.outerHeight(true) + catBody.outerHeight(true)) + 'px');
                    catOverlay.css('top', catHeader.position().top);
                    catOverlay.show();
                }
            });
        } else {  // unlock all categories when summary is empty
            $('.add-services-lock').hide();

            // bind attendee change events on page load (i.e., when serviceOrders().length is still 0)
            $.each(self.attendeeSubscriptions, function (idx, sub) {
                sub.dispose();  // remove any existing subscriptions, so the call isn't made more than once (basically like .off() on an event)
            });
            $.each(self.services().AvailableCategories(), function (idx, cat) {
                if (cat.ResourceCategoryTypeCode() === 'ATT') {
                    var attSub = cat.Attendees.subscribe(self.toggleCategoryLocks);  // update category lock overlay height when adding/removing attendees
                    self.attendeeSubscriptions.push(attSub);
                }
            });
        }

        $('.service-panel').off('shown.bs.collapse hidden.bs.collapse').on('shown.bs.collapse hidden.bs.collapse', function () {
            self.toggleCategoryLocks();  // re-calculate heights and positions for overlays when accordions are expanded/contracted
        });
    };

    self.navToResSummary = function () {
        window.location = self.breadcrumbLink();
    };

    self.toggleBookingSelection = function (booking) {
        if (self.selectedBookingIds.indexOf(booking.Id()) !== -1) {
            self.selectedBookingIds.remove(booking.Id());
        } else {
            self.selectedBookingIds.push(booking.Id());
        }
        self.updateSelectAllCb();
    };

    self.toggleAllBookings = function () {
        if (self.selectedBookingIds().length === self.filteredBookingList().length) {
            self.selectedBookingIds.removeAll();
        } else {
            var idList = self.filteredBookingList().map(function (booking) {
                return booking.Id();
            });
            self.selectedBookingIds(idList);
        }
        self.updateSelectAllCb();
    };

    // manual toggling required because length of observable arrays didn't seem to update UI (css classes) as observable arrays changed
    self.updateSelectAllCb = function () {
        var selectAllCb = $('#select-all-cb');
        if (self.pageMode() === AddServicesPageModes.AddResults) {
            selectAllCb.hide();
        } else {
            selectAllCb.removeClass('fa-square-o');
            selectAllCb.removeClass('fa-check-square-o');
            if (self.selectedBookingIds().length === self.filteredBookingList().length) {
                selectAllCb.addClass('fa-check-square-o');
            } else {
                selectAllCb.addClass('fa-square-o');
            }
        }
    };

    self.addServicesToBookings = function () {
        if (!self.bookingsValid()) { return false; }
        var soData = ko.mapping.toJS(self.serviceOrders());
        $.each(soData, function (i, v) {
            v.TimeStart = v.TimeStart.format('YYYY-MM-D HH:mm:ss');
            v.TimeEnd = v.TimeEnd.format('YYYY-MM-D HH:mm:ss');
        });

        var data = {
            reservationId: self.reservationId(),
            bookingIds: self.selectedBookingIds(),
            serviceOrderJson: JSON.stringify(soData),
            billingReference: self.billingReference() ? self.billingReference() : '',
            poNumber: self.poNumber() ? self.poNumber() : ''
        };

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/AddServicesToBookings',
            data: JSON.stringify(data),
            success: function (result) {
                var response = JSON.parse(result.d);
                var jsonData = JSON.parse(response.JsonData);

                if (response.Success) {
                    var updatedBookingList = self.filteredBookingList().slice();
                    var messages = jsonData.Messages;
                    if (jsonData.RedirectUrl) { window.location = jsonData.RedirectUrl; }
                    $.each(updatedBookingList, function (idx, booking) {
                        if ($.inArray(booking.Id(), self.selectedBookingIds()) !== -1) {
                            // if the booking was selected, populate the results message
                            var bookingMsgObj = $.grep(messages, function (msg) {
                                return msg.BookingId === booking.Id();
                            })[0];
                            var bookingMsg = bookingMsgObj ? bookingMsgObj.Messages[0] : '';
                            booking.Results(bookingMsg ? bookingMsg : vems.reservationSummary.servicesAddedText);
                            booking.Changed(!bookingMsg);
                        } else {
                            booking.Results('');
                            booking.Changed(false);
                        }
                    });

                    $('#bookings-grid tbody > tr').remove();  // clear html grid elements to prevent tablesorter duplication
                    self.filteredBookingList([]);  // manually update to cause DOM re-creation
                    self.filteredBookingList(updatedBookingList);
                    $('#bookings-grid').trigger('update');
                    self.pageMode(AddServicesPageModes.AddResults);
                    self.selectedBookingIds.removeAll();  // uncheck all items
                    self.updateSelectAllCb();
                } else {
                    vems.showToasterMessage('', response.ErrorMessage, 'danger');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };
};

ko.bindingHandlers.datePicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        try {
            var options = allBindingsAccessor().datepickerOptions || {
            };

            if (options.minDate) {
                if (moment(options.minDate).year() > 1900)
                    options.minDate = moment(options.minDate).startOf('day');
                else
                    options.minDate = moment().startOf('day');
            }

            if (options.maxDate) {
                if (moment(options.maxDate).year() > 1900)
                    options.maxDate = moment(options.maxDate).endOf('day');
                else
                    delete options['maxDate'];
            }

            options.locale = moment.locale();
            options.ignoreReadonly = true;

            options.showTodayButton = true;
            options.icons = {};
            options.icons.today = "date-picker-today-btn";

            if (DevExpress.devices.real().phone) {
                options.widgetPositioning = {
                    horizontal: 'right'
                };

                options.widgetParent = $('.time-container');

                $(element).datetimepicker(options).on('dp.show', function (ev) {
                    $('.bootstrap-datetimepicker-widget.dropdown-menu').css('right', 'auto');
                });
            } else {
                options.widgetPositioning = {
                    horizontal: 'left'
                };
            }

            $(element).datetimepicker(options).on('dp.change', function (ev) {
                var observable = valueAccessor();
                observable(ev.date);
            });

            return ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);
        } catch (e) {
            return false;
        }
    },
    update: function (element, valueAccessor) {
        try {
            var value = ko.toJS(ko.utils.unwrapObservable(valueAccessor()));

            $(element).data('DateTimePicker').date(value == false ? null : value);

            return ko.bindingHandlers.value.update(element, valueAccessor);
        } catch (e) {
            return false;
        }
    }
};

ko.bindingHandlers.timePicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        try {
            var options = allBindingsAccessor().datepickerOptions || {
            };

            if (options.minDate) {
                if (moment(options.minDate).year() > 1900)
                    options.minDate = moment(options.minDate).startOf('day');
                else
                    options.minDate = moment().startOf('day');
            }

            if (options.maxDate) {
                if (moment(options.maxDate).year() > 1900)
                    options.maxDate = moment(options.maxDate).endOf('day');
                else
                    delete options['maxDate'];
            }

            options.locale = moment.locale();
            options.ignoreReadonly = true;

            if (DevExpress.devices.real().phone) {
                options.widgetPositioning = {
                    horizontal: 'right'
                };

                options.widgetParent = $('.time-container');

                $(element).datetimepicker(options).on('dp.show', function (ev) {
                    $('.bootstrap-datetimepicker-widget.dropdown-menu').css('right', 'auto');
                });
            } else {
                options.widgetPositioning = {
                    horizontal: 'left'
                };
            }

            $(element).datetimepicker(options).on('dp.change', function (ev) {
                var observable = valueAccessor();
                observable(ev.date);
            });

            return ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);
        } catch (e) {
            return false;
        }
    },
    update: function (element, valueAccessor) {
        try {
            var value = ko.toJS(ko.utils.unwrapObservable(valueAccessor()));

            $(element).data('DateTimePicker').date(value == false ? null : value);

            return ko.bindingHandlers.value.update(element, valueAccessor);
        } catch (e) {
            return false;
        }
    }
};