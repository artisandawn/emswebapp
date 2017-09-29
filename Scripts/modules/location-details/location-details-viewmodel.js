var vems = vems || {};

function locationDetailsViewModel(data, container) {
    var self = this;

    self.roomDescription = ko.observable();
    self.details = ko.observableArray([]);
    self.setupDetails = ko.observableArray([]);
    self.features = ko.observableArray([]);
    self.images = ko.observableArray([]);
    self.imageModalIsOpen = ko.observable(false);

    self.buildingId = ko.observable();
    self.roomId = ko.observable();
    self.locationDetailsUrl = ko.observable();
    self.timeZoneTitle = ko.observable('');

    self.availableStartDate = ko.observable(moment().startOf('day'));

    self.hide = function () {
        $('#location-details-modal').modal('hide');
        return false;
    };

    self.show = function (buildingId, roomId, modalLoading) {
        if ((!buildingId || buildingId <= 0) && (!roomId || roomId <= 0)) {
            return false;
        }

        self.buildingId(!buildingId ? 0 : buildingId);
        self.roomId(!roomId ? 0 : roomId);

        self.details([]);
        self.setupDetails([]);
        self.features([]);
        self.images([]);

        $('#location-details-tabs li a').eq(0).click();

        var dataStr = JSON.stringify({ buildingId: buildingId, roomId: roomId });
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetLocationDetails',
            data: dataStr,
            success: function (results) {
                var result = JSON.parse(results.d);
                if (result.Success) {
                    var jsonData = JSON.parse(result.JsonData);

                    self.roomDescription(jsonData.RoomDescription);

                    self.details(jsonData.RoomDetailsCollection);
                    $('#location-details-modal').modal('show');

                    self.setupDetails(jsonData.SetupTypes);
                    self.features(jsonData.Features);
                    self.images(jsonData.RoomImages);

                    self.locationDetailsUrl(jsonData.LocationDetailsUrl);

                } else {
                    self.hide();
                    vems.showToasterMessage('', result.ErrorMessage, 'warning', 2000);
                }

                var tz = jsonData.BuildingTimeZoneInfo.TimeZone;
                //var tzAbbreviation = jsonData.BuildingTimeZoneInfo.TimeZoneAbbreviation === null ? "" : ' (' + jsonData.BuildingTimeZoneInfo.TimeZoneAbbreviation + ')';
                self.timeZoneTitle(tz);// + tzAbbreviation);

                $(document).off('click', '#availability-tab');
                $(document).on('click', '#availability-tab', function () {
                    self.getAvailabilityForDate(moment().startOf('day'));
                });

                if ($('#room-availability-control').data('verticalBookGrid') === undefined) {
                    $('#room-availability-control').verticalBookGrid({
                        startHour: jsonData.AvailabilityStartHour,
                        parentElement: $('#location-details-modal .modal-body'),
                        scrollElement: $('#room-availability-control'),
                        displayDayCount: 1,
                        displayDateHeaders: false,
                        isModal: true
                    });
                }

                if (modalLoading && $.isFunction(modalLoading)) {
                    modalLoading(false);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if (modalLoading && $.isFunction(modalLoading)) {
                    modalLoading(false);
                }

                console.log(thrownError);
                return false;
            }
        });

        return false;
    };

    self.openImageModal = function (data, event) {
        var src = $(event.target).attr('src');
        var modal = $('#bldg-room-image-modal');
        var modalDialog = $('#bldg-room-image-modal .modal-dialog');
        var modalContainer = $('#bldg-room-image-modal .modal-content');
        var image = event.target;

        self.imageModalIsOpen(true);
        self.sizeImageModal(modal, modalDialog, modalContainer, image);

        //set the src of the image in the modal
        $('#bldg-room-image-img').attr('src', src);

        modal.modal('show');
        modal.one('hidden.bs.modal', function () { self.imageModalIsOpen(false); });
    }

    self.sizeImageModal = function (modal, modalDialog, modalContainer, image) {
        if (!self.imageModalIsOpen())
            return;

        var isiOS = navigator.platform === 'iPhone' || navigator.platform === 'iPod';
        var modalMargin = parseInt(modalDialog.css('margin-top')) + parseInt(modalDialog.css('margin-bottom'));
        var imageRatio = image.naturalWidth / image.naturalHeight;

        //Calculate device screen height / width
        var screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - modalMargin;
        var screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - modalMargin;

        // The address bar of (small) iOS devices break images when it shows, so we have go give them a little more breathing room
        if (isiOS)
            screenHeight = screenHeight - 30;

        var screenLandscape = screenWidth > screenHeight;
        var adjustment = screenLandscape ? (screenHeight * imageRatio) : screenWidth - modalMargin;

        if (adjustment > screenWidth)
            adjustment = screenWidth;

        modalContainer.css('margin-left', function () {
            //If the image is smaller than the calculated size of the modal, it be offset 15px left
            var margin = adjustment > event.target.naturalWidth || adjustment === screenWidth ? 15 : 0;
            return margin;
        });

        modalDialog.css('width', function () {
            return adjustment > event.target.naturalWidth ? event.target.naturalWidth : adjustment;
        });

    }

    self.viewAllDetailsClicked = function (data, event) {
        window.location = self.locationDetailsUrl();
    };

    self.changeAvailableDate = function (data, event) {
        var dateOffset = event.currentTarget.id == "available-next" ? 1 : -1;
        self.getAvailabilityForDate(moment(self.availableStartDate()).add(dateOffset, 'day'));
    };

    self.getAvailabilityForDate = function (date) {
        self.availableStartDate(date);

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetLocationDetailsAvailability',
            data: JSON.stringify({ roomId: self.roomId(), start: moment(self.availableStartDate()), end: moment(self.availableStartDate()).add(1, 'day') }),
            success: function (results) {
                var response = JSON.parse(results.d);
                var data = JSON.parse(response.JsonData);
                var bookings = data.bookings;

                $('#room-availability-control').data('verticalBookGrid').setStartDate(self.availableStartDate(), bookings);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                return false;
            }
        });
    }

    if (DevExpress.devices.real().phone) {
        $('#location-details-modal').off('shown.bs.modal').on('shown.bs.modal', function () {
            vems.convertTabsForMobile();
        });
    }
};