var vems = vems || {};
vems.screentext = vems.screentext || {};

function editServicesViewModel(data) {
    var self = this;
    self.data = data;

    self.templateRules = ko.observable(data.TemplateRules);
    self.udfAnswers = ko.observable(data.UdfAnswers);

    self.reservationId = ko.observable(data.ReservationId);
    self.bookingId = ko.observable(data.BookingId);

    self.breadcrumbText = ko.observable(data.BreadcrumbText);
    self.reservationSummaryUrl = ko.observable(data.ReservationSummaryUrl);

    self.additionalBookings = ko.observableArray();
    self.selectedBookingIds = ko.observableArray();
    self.bookingResources = ko.observable(data.BookingResources);
    self.additionalBookingExclusions = ko.observableArray([]);

    self.additionalServiceOrders = ko.observableArray();
    self.selectedServiceOrderIds = ko.observableArray();

    self.toggleBookingSelection = function (booking) {
        if (self.selectedBookingIds.indexOf(booking.Id) !== -1) {
            self.selectedBookingIds.remove(booking.Id);
        } else {
            self.selectedBookingIds.push(booking.Id);
        }
        self.updateSelectAllCb();
    };
    self.toggleAllBookings = function () {
        if (self.selectedBookingIds().length === self.additionalBookings().length) {
            self.selectedBookingIds.removeAll();
        } else {
            var idList = self.additionalBookings().map(function (booking) {
                return booking.Id;
            });
            self.selectedBookingIds(idList);
        }
        self.updateSelectAllCb();
    };
    self.updateSelectAllCb = function () {
        var selectAllCb = $('#select-all-cb');

        selectAllCb.removeClass('fa-square-o');
        selectAllCb.removeClass('fa-check-square-o');

        if (self.selectedBookingIds().length === self.additionalBookings().length) {
            selectAllCb.addClass('fa-check-square-o');
        } else {
            selectAllCb.addClass('fa-square-o');
        }
    };

    self.toggleServiceOrderSelection = function (booking) {
        if (self.selectedServiceOrderIds.indexOf(booking.Id) !== -1) {
            self.selectedServiceOrderIds.remove(booking.Id);
        } else {
            self.selectedServiceOrderIds.push(booking.Id);
        }
        self.updateSelectAllCb();
    };
    self.toggleAllServiceOrders = function () {
        if (self.selectedServiceOrderIds().length === self.additionalServiceOrders().length) {
            self.selectedServiceOrderIds.removeAll();
        } else {
            var idList = self.additionalServiceOrders().map(function (booking) {
                return booking.Id;
            });
            self.selectedServiceOrderIds(idList);
        }
        self.updateSelectAllServiceOrderCb();
    };
    self.updateSelectAllServiceOrderCb = function () {
        var selectAllCb = $('#select-all-cb');

        selectAllCb.removeClass('fa-square-o');
        selectAllCb.removeClass('fa-check-square-o');

        if (self.selectedServiceOrderIds().length === self.additionalServiceOrders().length) {
            selectAllCb.addClass('fa-check-square-o');
        } else {
            selectAllCb.addClass('fa-square-o');
        }
    };

    self.showAdditionalContent = function () {
        $('#services-container').hide();

        if (self.additionalBookings().length > 0)
            $('#additional-bookings-container').show();
        else
            $('#additional-bookings-container').hide();

        if (self.additionalServiceOrders().length > 0)
            $('#additional-so-container').show();
        else
            $('#additional-so-container').hide();

        $('#confirm-modal').modal('hide');
    };

    self.getServiceOrderData = function () {
        var soData = ko.mapping.toJS(self.serviceOrders());

        $.each(soData, function (i, v) {
            v.TimeStart = v.TimeStart ? moment(v.TimeStart).format('YYYY-MM-D HH:mm:ss') : moment("1900-01-01 00:00:00").format('YYYY-MM-D HH:mm:ss');
            v.TimeEnd = v.TimeEnd ? moment(v.TimeEnd).format('YYYY-MM-D HH:mm:ss') : moment("1900-01-01 00:00:00").format('YYYY-MM-D HH:mm:ss');

            if (v.CategoryObj) {
                v.CategoryObj.ServiceStartTime = moment(v.CategoryObj.ServiceStartTime).format('YYYY-MM-D HH:mm:ss');
                v.CategoryObj.ServiceEndTime = moment(v.CategoryObj.ServiceEndTime).format('YYYY-MM-D HH:mm:ss');
            }
        });

        return soData;
    };

    self.addToAdditionalBookings = function (data, event) {
        vems.pageLoading(true);
        var soData = self.getServiceOrderData();

        var selectedBookings = $.map(self.additionalBookings(), function (val) {
            return val.Id;
        });

        var jsonData = {
            reservationId: self.reservationId(),
            bookingId: self.bookingId(),
            serviceOrderJSON: JSON.stringify(soData),
            additionalBookings: selectedBookings,
            billingReference: vems.bookingServicesVM.billingReference(),
            poNumber: vems.bookingServicesVM.poNumber()
        };

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/AddServicesToAdditionalBookings',
            data: JSON.stringify(jsonData),
            success: function (result) {
                var response = JSON.parse(result.d);
                var jsonData = JSON.parse(response.JsonData);

                if (response.Success) {
                    vems.showToasterMessage('', vems.screentext.successMessage, 'success');

                    setTimeout(function () {
                        window.location = window.location;
                    }, 2000);
                } else {
                    vems.showToasterMessage('', response.ErrorMessage, 'danger');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    self.addToAdditionalServiceOrders = function (data, event) {
        vems.pageLoading(true);
        var soData = self.getServiceOrderData();

        var selectedServiceOrders = $.map(self.additionalServiceOrders(), function (val) {
            return val.Id;
        });

        var jsonData = {
            reservationId: self.reservationId(),
            bookingId: self.bookingId(),
            serviceOrderJSON: JSON.stringify(soData),
            additionalServiceOrderIds: selectedServiceOrders
        };

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/AddServiceOrderDetailsToAdditionalServiceOrders',
            data: JSON.stringify(jsonData),
            success: function (result) {
                var response = JSON.parse(result.d);
                var jsonData = JSON.parse(response.JsonData);

                if (response.Success) {
                    vems.showToasterMessage('', vems.screentext.successMessage, 'success');

                    setTimeout(function () {
                        window.location = window.location;
                    }, 2000);
                } else {
                    vems.showToasterMessage('', response.ErrorMessage, 'danger');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    for (var i = 0; i < data.ServicesVM.AvailableCategories.length; i++) {
        var ac = data.ServicesVM.AvailableCategories[i];

        if (ac.ResourceCategoryTypeCode == "ATT") {
            //ac.Attendees = data.Services[1].ServiceOrderDetails
            var attendeeCat = $.grep(data.Services, function (val) {
                return val.CategoryId == ac.CategoryId && val.InstanceCount == ac.InstanceCount;
            });

            if (attendeeCat.length > 0)
                ac.Attendees = attendeeCat[0].ServiceOrderDetails;

            $.each(ac.Attendees, function (i, v) {
                v.AttendeeName = v.ResourceDescription;
            });
        }

        if (ac.ResourceCategoryTypeCode == "NOT") {
            var notesCat = $.grep(data.Services, function (val) {
                return val.CategoryId == ac.CategoryId && val.InstanceCount == ac.InstanceCount;
            });

            if (notesCat.length > 0) {
                ac.WrittenNotes = vems.decodeHtml(notesCat[0].ServiceOrderDetails[0].Notes);
                ac.OriginalWrittenNotes = ac.WrittenNotes;
            }
        }
    }

    self.services = ko.observable(data.ServicesVM);

    for (var i = 0; i < data.Services.length; i++) {
        var so = new ServiceOrder(data.Services[i]);
        so.EstimatedCount(data.Services[i].EstimatedCount);

        so.ServiceOrderDetails = ko.observableArray([]);

        so.TimeStart(moment(data.Services[i].TimeStart));
        so.TimeEnd(moment(data.Services[i].TimeEnd));

        for (var j = 0; j < data.Services[i].ServiceOrderDetails.length; j++) {
            var item = data.Services[i].ServiceOrderDetails[j];

            var sod = new ServiceOrderDetail(item);

            sod.Id(item.Id);
            sod.Quantity(item.Quantity);

            if (so.CategoryTypeCode() == 2) { // notes
                sod.SpecialInstructions(sod.Notes());
            }

            so.ServiceOrderDetails.push(sod);
        }

        data.Services[i] = so;//ko.mapping.fromJS(data.Services[i]);

        var categoryObj = $.grep(data.ServicesVM.AvailableCategories, function (val) {
            return val.CategoryId == data.Services[i].CategoryId() && val.InstanceCount == data.Services[i].InstanceCount();
        });

        if (categoryObj.length > 0) {
            data.Services[i].CategoryObj = ko.observable(ko.mapping.fromJS(categoryObj[0]));
            data.Services[i].CategoryObj().ServiceChosenServiceType(data.Services[i].ServiceTypeId());
            data.Services[i].CategoryObj().ServiceEstimatedCount(data.Services[i].EstimatedCount());
        } else {
            var typeCode = data.Services[i].CategoryTypeCode() == CategoryTypeCodes.RES
                ? "RES"
                : data.Services[i].CategoryTypeCode() == CategoryTypeCodes.ATT
                ? "ATT"
                : "NOT";

            data.Services[i].CategoryObj = ko.observable(
                ko.mapping.fromJS({
                    CategoryId: data.Services[i].CategoryId(),
                    InstanceCount: data.Services[i].InstanceCount(),
                    ResourceCategoryTypeCode: typeCode,
                    UserDefinedFields: []
                }));
        }
    }

    self.serviceOrders = ko.observableArray(data.Services);

    self.updateServices = function (data, event) {
        if (vems.bookingServicesVM.validateServices()) {
            vems.pageLoading(true);
            var soData = self.getServiceOrderData();
                       
            var data = {
                reservationId: self.reservationId(),
                bookingId: self.bookingId(),
                serviceOrderJSON: JSON.stringify(soData),
                billingReference: vems.bookingServicesVM.billingReference(),
                poNumber: vems.bookingServicesVM.poNumber(),
                additionalBookings: []
            };

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/UpdateServicesForBooking',
                data: JSON.stringify(data),
                success: function (result) {
                    var response = JSON.parse(result.d);
                    var jsonData = JSON.parse(response.JsonData);

                    if (response.Success) {
                        // the logic is ready to support multiple changes and messages
                        var catMessages = jsonData.Messages[0];

                        if (catMessages && catMessages.HasMessages) {
                            vems.pageLoading(false);
                            vems.showToasterMessage('', catMessages.Messages[0], 'info');

                            if (catMessages.RevertObject) {
                                var serviceOrder = $.grep(self.serviceOrders(), function (val) {
                                    return val.Id() == catMessages.RevertObject.ServiceOrderId && val.CategoryId() == catMessages.RevertObject.CategoryId;
                                });

                                if (serviceOrder != null) {
                                    serviceOrder[0].TimeStart(moment(catMessages.RevertObject.Start));
                                    serviceOrder[0].TimeEnd(moment(catMessages.RevertObject.End));
                                    serviceOrder[0].CategoryObj().ServiceStartTime(moment(catMessages.RevertObject.Start));
                                    serviceOrder[0].CategoryObj().ServiceEndTime(moment(catMessages.RevertObject.End));
                                }
                            }
                        } else {
                            if ((jsonData.ServiceOrderAddBookings == null || jsonData.ServiceOrderAddBookings.length == 0) && (jsonData.ServiceOrderDetailAddBookings == null || jsonData.ServiceOrderDetailAddBookings.length == 0)) {
                                vems.showToasterMessage('', vems.screentext.successMessage, 'success');

                                setTimeout(function () {
                                    window.location = window.location;
                                }, 2000);
                            } else {
                                vems.pageLoading(false);
                                $('#confirm-modal').modal('show');

                                self.additionalBookingExclusions([]);
                                if (jsonData.ServiceOrderAddBookings != null) {
                                    self.additionalBookings(jsonData.ServiceOrderAddBookings);                                    
                                    //check for room bookings that have resource exclusions and set message
                                    if (jsonData.AddedOrModifiedResourceIds && jsonData.AddedOrModifiedResourceIds.length > 0 && self.bookingResources && self.bookingResources().length > 0) {
                                        var excludedRooms = [];
                                        $.each(self.additionalBookings(), function (i, booking) {
                                            //if additionalBooking id is not in the booking resource list, then show message in confirm dialog.
                                            var resources = [];
                                            $.each(jsonData.AddedOrModifiedResourceIds, function (ind, res) {
                                                //check the booking to resources table to see if it's allowed.
                                                var bBookingCanHaveResource = $.grep(self.bookingResources(), function (br, idx) {
                                                    return br.ResourceId == res.Id && booking.Id == br.BookingId;
                                                });
                                                if (!bBookingCanHaveResource || bBookingCanHaveResource.length == 0)  //resource is not allowed for that booking
                                                    resources.push(res);
                                            });

                                            if (resources.length > 0) {
                                                excludedRooms.push({
                                                    Location: booking.LocationDisplay,
                                                    Resources: resources
                                                });
                                            }
                                        });
                                        self.additionalBookingExclusions(excludedRooms);
                                    }
                                }
                                if (jsonData.ServiceOrderDetailAddBookings != null) {
                                    self.additionalServiceOrders(jsonData.ServiceOrderDetailAddBookings);

                                    //check for room bookings that have resource exclusions and set message
                                    if (jsonData.AddedOrModifiedResourceIds && jsonData.AddedOrModifiedResourceIds.length > 0 && self.bookingResources && self.bookingResources().length > 0) {
                                        var excludedRooms = [];
                                        $.each(self.additionalServiceOrders(), function (i, booking) {
                                            //if additionalBooking id is not in the booking resource list, then show message in confirm dialog.
                                            var resources = [];
                                            $.each(jsonData.AddedOrModifiedResourceIds, function (ind, res) {
                                                //check the booking to resources table to see if it's allowed.
                                                var bBookingCanHaveResource = $.grep(self.bookingResources(), function (br, idx) {
                                                    return br.ResourceId == res.Id && booking.BookingId == br.BookingId;
                                                });
                                                if (!bBookingCanHaveResource || bBookingCanHaveResource.length == 0)  //resource is not allowed for that booking
                                                    resources.push(res);
                                            });

                                            if (resources.length > 0) {
                                                excludedRooms.push({
                                                    Location: booking.Location,
                                                    Resources: resources
                                                });
                                            }
                                        });
                                        self.additionalBookingExclusions(excludedRooms);
                                    }
                                }
                            }
                        }
                    } else {
                        vems.showToasterMessage('', response.ErrorMessage, 'danger');
                        vems.pageLoading(false);
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        }
    };


    return self;
}

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
