var vems = vems || {};
vems.screenText || {};

vems.locationDetails = vems.locationDetails || {};
vems.locationDetails.viewModels = vems.locationDetails.viewModels || {};


vems.locationDetails.detailsVM = function (data) {
    var self = this;
    ko.mapping.fromJS(data, {}, this);

    self.imageModalIsOpen = ko.observable(false);
    self.FloorMapScreenText = {};

    self.buildingTitle = ko.pureComputed(function () {
        if (vems.locationDetails.buildingDisplay === 0)
            return vems.decodeHtml(self.BuildingCode());
        else
            return vems.decodeHtml(self.BuildingDescription());
    });

    self.roomTitle = ko.pureComputed(function () {
        if (vems.locationDetails.roomDisplay === 0)
            return vems.decodeHtml(self.RoomCode());
        else
            return vems.decodeHtml(self.RoomDescription());
    });

    self.setupTitle = ko.pureComputed(function () {
        var setupLabel = vems.screenText.setupHours + ' ' + locationVM.SetupHours();
        var teardownLabel = vems.screenText.teardownHours + ' ' + locationVM.TeardownHours();

        return setupLabel + ' - ' + teardownLabel;
    });

    self.timeZoneTitle = ko.pureComputed(function () {
        var tz = self.BuildingTimeZoneInfo.TimeZone();
        var tzAbbreviation = self.BuildingTimeZoneInfo.TimeZoneAbbreviation() === null ? "" : ' (' + self.BuildingTimeZoneInfo.TimeZoneAbbreviation() + ')';

        return tz + tzAbbreviation;
    });

    self.templateClick = function (data, event) {
        window.location = data.NavigateUrl();
    };

    self.openImageModal = function (data, event) {
        var src = $(event.target).attr('src');
        var modal = $('#bldg-room-image-modal');
        var modalDialog = $('#bldg-room-image-modal .modal-dialog');
        var modalContainer = $('#bldg-room-image-modal .modal-content');
        var image = event.target;

        self.imageModalIsOpen(true);
        self.sizeImageModal(modal, modalDialog, modalContainer, image, event);

        //set the src of the image in the modal
        $('#bldg-room-image-img').attr('src', src);

        modal.modal('show');
        modal.one('hidden.bs.modal', function () { self.imageModalIsOpen(false); });
    }

    self.sizeImageModal = function (modal, modalDialog, modalContainer, image, event) {
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

        modalContainer.css('margin-left', function (e) {
            //If the image is smaller than the calculated size of the modal, it be offset 15px left
            var margin = adjustment > event.target.naturalWidth || adjustment === screenWidth ? 15 : 0;
            return margin;
        });

        modalDialog.css('width', function () {
            return adjustment > event.target.naturalWidth ? event.target.naturalWidth : adjustment;
        });

    }

    self.roomDetails = buildRoomDetailsArray();

    self.FloorMapRoomInfo = buildFloorMapRoomInfo();

    self.availableStartDate = ko.observable(moment().startOf('day'));

    self.changeAvailableDate = function (data, event) {
        var dateOffset = event.currentTarget.id == "available-next" ? 7 : -7;
        self.getAvailabilityForDate(moment(self.availableStartDate()).add(dateOffset, 'day'));
    };

    self.getAvailabilityForDate = function (date) {
        self.availableStartDate(date);

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetLocationDetailsAvailability',
            data: JSON.stringify({ roomId: self.RoomId(), start: moment(self.availableStartDate()), end: moment(self.availableStartDate()).add(6, 'day') }),
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

    function buildFloorMapRoomInfo() {
        var ri = new FloorMapRoomInfo();
        ri.Floor(self.Floor());
        ri.FloorMapID(self.FloorMapId());
        ri.RoomID(self.RoomId());
        ri.RoomTitle(self.roomTitle());
        ri.RoomDescription(self.RoomDescription());
        ri.RoomType(self.RoomType());
        ri.FloorMapHash(self.FloorMapHash());
        ri.FloorMapWebserviceUrl(self.FloorMapWebserviceUrl());
        return ri;
    };

    function buildRoomDetailsArray() {
        var roomDetails = ko.observableArray();

        if (self.RoomCode().length > 0)
            roomDetails.push({ key: vems.screenText.RoomCode, value: self.RoomCode() });

        roomDetails.push({ key: vems.screenText.RoomDescription, value: self.RoomDescription() });

        if (self.RoomType().length > 0 && self.RoomType() !== "(none)")
            roomDetails.push({ key: vems.screenText.RoomType, value: self.RoomType() });

        if (self.Floor().length > 0 && self.Floor() !== "(none)")
            roomDetails.push({ key: vems.screenText.Floor, value: self.Floor() });

        if (self.Size().length > 0 && self.Size() > 0)
            roomDetails.push({ key: vems.screenText.Size, value: self.Size() });

        if (self.Phone().length > 0)
            roomDetails.push({ key: vems.screenText.Phone, value: self.Phone() });

        if (self.RequiresCheckIn()) {
            roomDetails.push({ key: vems.screenText.RequiresCheckIn, value: self.RequiresCheckIn() ? vems.screenText.Yes : vems.screenText.No });
            roomDetails.push({ key: vems.screenText.AllowCheckInXMinutesBeforeStartOfBooking, value: self.CheckInMinutes() });
        }

        if (self.SetupHours().length > 0)
            roomDetails.push({ key: vems.screenText.SetupHours, value: self.SetupHours() });

        if (self.TeardownHours().length > 0)
            roomDetails.push({ key: vems.screenText.TeardownHours, value: self.TeardownHours() });

        if (self.Notes().length > 0)
            roomDetails.push({ key: vems.screenText.Notes, value: self.Notes() });

        if (self.RoomUrl().length > 0)
            roomDetails.push({ key: vems.screenText.Url, value: self.RoomUrl() });

        return roomDetails;
    };
}