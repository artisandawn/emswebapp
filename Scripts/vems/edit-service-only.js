var vems = vems || {};
vems.screentext = vems.screentext || {};

function editServiceOnlyViewModel(data) {
    var self = this;

    self.templateRules = ko.observable(data.TemplateRules);

    self.reservationId = ko.observable(data.ReservationId);
    self.bookingId = ko.observable(data.BookingId);
    self.changeCounter = ko.observable(data.ChangeCounter);

    self.roomId = ko.observable(data.RoomId);

    self.breadcrumbText = ko.observable(data.BreadcrumbText);
    self.reservationSummaryUrl = ko.observable(data.ReservationSummaryUrl);

    self.eventName = ko.observable(data.EventName);
    self.eventType = ko.observable(data.EventTypeId);
    self.setupTypeId = ko.observable(data.SetupTypeId);
    self.setupCount = ko.observable(data.SetupCount);

    self.eventTypes = ko.observableArray(data.EventTypes);

    self.date = ko.observable(moment(data.Date));
    self.start = ko.observable(moment(data.Start));
    self.end = ko.observable(moment(data.End));
    self.location = ko.observable(data.Location);

    self.Services = ko.observable(data.ServiceOrders);

    self.updateBooking = function (data, event) {
        if (validatePage()) {

            var start = moment(new Date(self.date().year(), self.date().month(), self.date().date(), moment(self.start()).hour(), moment(self.start()).minute(), 0));
            var end = moment(new Date(self.date().year(), self.date().month(), self.date().date(), moment(self.end()).hour(), moment(self.end()).minute(), 0));

            var data = {
                reservationId: self.reservationId(),
                bookingId: self.bookingId(),
                eventName: self.eventName(),
                setupCount: self.setupCount(),
                roomId: self.roomId(),
                start: moment(start).format('YYYY-MM-D HH:mm:ss'),
                end: moment(end).format('YYYY-MM-D HH:mm:ss'),
                eventTypeId: self.eventType(),
                setupTypeId: self.setupTypeId(),
                changeCounter: self.changeCounter(),
                location: self.location()
            };

            vems.ajaxPost({
                url: vems.serverApiUrl() + '/UpdateServiceOnlyBooking',
                data: JSON.stringify(data),
                success: function (result) {
                    var response = JSON.parse(result.d);
                    var jsonData = JSON.parse(response.JsonData);

                    if (response.Success && response.SuccessMessage) {
                        vems.showToasterMessage('', response.SuccessMessage, 'info');

                        setTimeout(function () {
                            window.location = jsonData.summaryLink;
                        }, 2000);
                    } else if(response.Success) {
                        window.location = jsonData.summaryLink;
                    } else {
                        vems.showToasterMessage('', response.ErrorMessage, 'danger');
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        }
    };

    function validatePage() {
        var eventDetailsValid = self.eventName().length > 0 && self.eventType() > 0;
        var dateTimeValid = self.date() && self.start() && self.end();
        var hasLocation = self.location().length > 0;

        if (eventDetailsValid && dateTimeValid && hasLocation) {
            return true;
        } else {
            var errors = new Array();

            if (!eventDetailsValid) {
                if (self.eventName().length == 0) {
                    errors.push(vems.screentext.IsRequiredMessage.replace('{0}', $('[for=event-name]').eq(0).text()))
                }

                if (self.eventType() == 0) {
                    errors.push(vems.screentext.IsRequiredMessage.replace('{0}', $('[for=event-type]').eq(0).text()))
                }
            }

            if (!dateTimeValid) {
                errors.push(vems.screentext.DateAndTimeAreRequired);
            }

            if (!hasLocation) {
                errors.push(vems.screentext.IsRequiredMessage.replace('{0}', $('[for=location]').eq(0).text()))
            }

            var reqErrMsg = '';

            $.each(errMsgArr, function (idx, err) {
                reqErrMsg += err;

                if (idx < errMsgArr.length - 1) {
                    reqErrMsg += '<br/><br/>';
                }
            });

            vems.showToasterMessage('', reqErrMsg, 'danger');

            return false;
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

            if (element.id != 'booking-date') {
                var date = $('#booking-date').data('DateTimePicker').date()._d;
                var time = value._d;
                var newDate = moment(new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), 0));

                value = newDate;
            }

            $(element).data('DateTimePicker').date(value == false ? null : value);

            return ko.bindingHandlers.value.update(element, valueAccessor);
        } catch (e) {
            return false;
        }
    }
};
