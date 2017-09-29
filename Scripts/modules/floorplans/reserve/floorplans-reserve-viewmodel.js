
function floorPlansReserveVM(floorInfo, container) {
    var self = this;

    self.roomFloorInfo = floorInfo.RoomInfo;
    self.imgSrc = '';
    self.imgObj = '';
    self.availableIndicatorSrc = '';
    self.unavailableIndicatorSrc = '';
    self.availableIndicatorObj = {};
    self.unavailableIndicatorObj = {};
    self.Indicators = ko.observableArray([]);
    self.filterData = ko.observableArray([]);
    self.filterValues = ko.observableArray([]);
    self.startTime = moment(new Date());
    self.endTime = moment(new Date());
    self.imageHeight = 0;
    self.imageWidth = 0;
    self.indicatorCoords;
    self.fileFormat = '';
    self.rooms = ko.observableArray([]);
    self.buildings = ko.observableArray([]);
    self.isPhone = ko.observable(DevExpress.devices.real().phone);
    self.precheckIconAvailability = ko.observable(false);

    //in case they've removed an indicator from the floormap accidentally.
    var defaultIndicatorImage = "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";

    self.bookings = ko.observableArray([]); //used to filter out rooms added to the cart
    if (floorInfo.bookings)
        self.bookings = floorInfo.bookings;

    self.renderType = 'inline'; //or 'modal'
    if (floorInfo.renderType)
        self.renderType = floorInfo.renderType;

    if (floorInfo.ScreenText &&
        floorInfo.ScreenText.RoomCodeText &&
        floorInfo.ScreenText.ReserveText &&
        floorInfo.ScreenText.RequestText &&
        floorInfo.ScreenText.RoomDetailsText &&
        floorInfo.ScreenText.RoomDescriptionText &&
        floorInfo.ScreenText.RoomTypeText &&
        floorInfo.ScreenText.AvailabilityText &&
        floorInfo.ScreenText.AvailableText &&
        floorInfo.ScreenText.UnavailableText) {
        self.ScreenText = floorInfo.ScreenText;
    } else {
        console.error('screen text items required in ScreenText object: RoomCodeText, RoomDescriptionText, RoomTypeText, '
            + 'AvailabilityText, AvailableText, UnavailableText, ReserveText, RequestText, RoomDetailsText');
    }

    self.closeModal = function () {
        var modal = $('#floormap-modal');
        $(modal).modal('hide');
    };
    self.roomAddedClicked = function (roomid) {
        if (floorInfo.addRoomClicked) {
            self.closeModal();

            var r = $.grep(self.rooms(), function (v, i) {
                return v.RoomID() == roomid;
            });
            if ($.isArray(r) && r.length > 0) {
                floorInfo.addRoomClicked(r[0]);
            }
            else {
                floorInfo.addRoomClicked(self.roomFloorInfo);
            }
        }
    };

    self.FloorMapWebserviceUrlComputed = function () {
        var tmp = '';
        if (self.roomFloorInfo.FloorMapWebserviceUrl) {
            tmp = self.roomFloorInfo.FloorMapWebserviceUrl().toLowerCase();
            tmp = tmp.replace('?wsdl', '');
            if (!tmp.endsWith('/'))
                tmp = tmp + "/";
        }
        return tmp;
    };

    self.refreshMap = function (bookings) {
        self.bookings = bookings;
        if (self.renderType = 'inline')
            self.buildAvailabilityMap(self.roomFloorInfo, self.filterData(), self.filterValues());
        else
            self.buildModalMapForRoom(self.roomFloorInfo);
    };

    self.buildModalMapForRoomNoFilters = function (roomdata, startTime, endTime) {

        if (roomdata)
            self.roomFloorInfo = roomdata;

        if (startTime)
            self.startTime = moment(startTime);
        if (endTime)
            self.endTime = moment(endTime);

        self.GetDiagram().done(function () {
            self.getRoomIndicators().done(function () {
                self.getRoomIndicatorsCoord().done(function () {
                    buildFloorPlans();
                });
            });
        });

    };

    self.buildModalMapForRoom = function (roomdata, availabilityFilterData, filterValues) {
        if (roomdata) {
            self.roomFloorInfo = roomdata;
        }

        if (filterValues) {
            self.filterValues(filterValues);
        }

        if (availabilityFilterData) {
            self.filterData(availabilityFilterData);
        }

        self.GetDiagram().done(function () {
            self.getRoomIndicators().done(function () {
                self.getRoomIndicatorsCoord().done(function () {
                    buildFloorPlans();
                });
            });
        });
    };

    self.getRoomsForMap = function (roomData, roomResultsList) {
        //set the rooms list
        if (roomData) {
            self.roomFloorInfo = roomData;
        }

        //get rooms for this image and send to buildFloorPlans
        var roomArr = $.grep(roomResultsList, function (v, i) {
            return v.FloorMapID() == self.roomFloorInfo.FloorMapID();
        });

        self.GetDiagram().done(function () {
            self.getRoomIndicators().done(function () {
                buildFloorPlans(roomArr);
            });
        });
    };

    self.buildAvailabilityMap = function (roomData, availabilityFilterData, filterValues, buildingId, roomId) {
        if (availabilityFilterData && availabilityFilterData.Start) {
            self.filterValues(filterValues);
            self.filterData(availabilityFilterData);
        } else {
            return false;
        }

        if (roomData) {
            self.roomFloorInfo = roomData;
        }
        if (!buildingId) {
            buildingId = -1;
        }
        if (!roomId) {
            roomId = -1;
        }

        //don't send in floorid, get room possible for imageid
        getFloormapRoomAvailability(roomData.FloorMapID(), buildingId, roomId, availabilityFilterData, filterValues).done(function () {
            self.GetDiagram().done(function () {
                self.getRoomIndicators().done(function () {

                    buildFloorPlans(self.rooms);

                });
            });
        });
    };

    self.GetDiagram = function (roomData) {
        var url = self.FloorMapWebserviceUrlComputed() + 'GetDiagramDetails'
        var data = {
            imageId: self.roomFloorInfo.FloorMapID(),
            server: null,
            database: null,
            token: self.roomFloorInfo.FloorMapHash()
        };

        return $.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'xml',
            contentType: 'application/x-www-form-urlencoded',
            success: function (response) {
                if (response.childNodes.length > 0 && response.childNodes[0].firstChild && response.childNodes[0].firstChild.data) {
                    var data = JSON.parse(response.childNodes[0].firstChild.data);
                    if (data) {
                        var newImgObj = {
                            extension: data.results.parent[0].extension,
                            Width: data.results.parent[0].width,
                            Height: data.results.parent[0].height,
                            image: data.results.parent[0].image
                        }

                        buildImageElements(newImgObj);
                        //buildImageElements(imgData);
                    }
                }
                else {
                    console.log('No diagram exists for the query.')
                }
            }
        });
    };

    //json indicator obj from service
    function buildIndicatorObj(v) {

        var tmpImg = 'data:image/png;base64,' + v.image;
        var tmpImgObj = $('<img src="data:image/png;base64,' + v.image + '" />')[0];
        var secTmpImg = 'data:image/png;base64,' + v.SecondaryImage;
        var secTmpImgObj = $('<img src="data:image/png;base64,' + v.SecondaryImage + '" />')[0];
        var height = tmpImgObj.naturalHeight;
        var width = tmpImgObj.naturalWidth;
        var secHeight = secTmpImgObj.naturalHeight;
        var secWidth = secTmpImgObj.naturalWidth;

        if (v.imageType == 'svg') {
            tmpImg = 'data:image/svg+xml;base64,' + v.image;
            tmpImgObj = $('<img src="' + tmpImg + '" />')[0];
            height = tmpImgObj.naturalHeight;
            width = tmpImgObj.naturalWidth;
            if (!height || height > 100) {
                height = 100;
            }
            if (!width || width > 100) {
                width = 100;
            }
            tmpImgObj = $('<img src="' + tmpImg + '" height="' + height + '" width="' + width + '" />')[0];
        }
        if (v.secondaryImageType == 'svg') {
            secTmpImg = 'data:image/svg+xml;base64,' + v.SecondaryImage;
            secTmpImgObj = $('<img src="' + secTmpImg + '" />')[0];
            secHeight = secTmpImgObj.naturalHeight;
            secWidth = secTmpImgObj.naturalWidth;
            if (!secHeight || secHeight > 100) {
                secHeight = 100;
            }
            if (!secWidth || secWidth > 100) {
                secWidth = 100;
            }
            secTmpImgObj = $('<img src="' + secTmpImg + '" height="' + secHeight + '" width="' + secWidth + '" />')[0];
        }

        var newobj = {
            id: v.id,
            FloorPlanIndicatorID: v.id,
            image: tmpImg,
            imageObj: tmpImgObj,
            height: height,
            width: width,
            SecondaryImage: secTmpImg,
            secondaryImageObj: secTmpImgObj,
            secondaryHeight: secHeight,
            secondaryWidth: secWidth
        };
        $.extend(v, newobj);
        return v;
    };

    function buildImageElements(imgData) {
        self.fileFormat = imgData.extension.replace('.', '');
        self.imageWidth = imgData.Width;
        self.imageHeight = imgData.Height;
        var hwStr = "";
        if (self.imageHeight > 0)
            hwStr = ' width="' + self.imageWidth + 'px" height="' + self.imageHeight + 'px"';

        if (self.fileFormat === 'svg') {
            var t = atob(imgData.image);
            //t = decodeURIComponent(t).replace(/(\r\n|\n|\r)/gm, "");
            t = t.replace(/(\r\n|\n|\r)/gm, "");
            var svg = "";
            $(t).each(function (i, v) {
                if (v.tagName && v.tagName.toLowerCase() == 'svg')
                    svg = v;
            });
            if (svg && svg.height && svg.height.baseVal) {

                self.imageWidth = svg.width.baseVal.value;
                self.imageHeight = svg.height.baseVal.value;
                hwStr = ' width="' + self.imageWidth + 'px" height="' + self.imageHeight + 'px"';
            }
            
            self.imgSrc = 'data:image/svg+xml;base64,' + imgData.image;
            self.imgObj = '<img src="' + self.imgSrc + '" ' + hwStr + ' />';
        }
        else {
            self.imgSrc = 'data:image/' + self.fileFormat + ';base64,' + imgData.image;
            self.imgObj = '<img src="' + self.imgSrc + '" ' + hwStr + ' />';
        }
    };

    self.loadRoomAvailability = function (roomData, bAsync) {
        var url = self.FloorMapWebserviceUrlComputed() + 'LoadRoomAvailability'

        var filterDate = moment(new Date());
        var filterStart = filterDate.startOf('day');
        var filterEnd = filterDate.endOf('day');
        if (roomData.LocalStart) {
            //use this as the start fetch time
            filterStart = roomData.LocalStart;
            filterEnd = roomData.LocalEnd;
        }
        else {

            if (self.filterData() && self.filterData().Start) {
                filterDate = self.filterData().Start;
                if (self.filterData().Dates && self.filterData().Dates.length > 0) {
                    filterDate = moment(self.filterData().Dates[0]);
                }
                filterStart = moment(new Date(filterDate.year(), filterDate.month(), filterDate.date(), moment(self.filterData().Start).hour(), moment(self.filterData().Start).minute(), 0));
                filterEnd = moment(new Date(filterDate.year(), filterDate.month(), filterDate.date(), moment(self.filterData().End).hour(), moment(self.filterData().End).minute(), 0));
            }
            else if (self.startTime && self.endTime) {
                filterDate = moment(self.startTime).startOf('day');
                filterStart = moment(new Date(filterDate.year(), filterDate.month(), filterDate.date(), self.startTime.hour(), self.startTime.minute(), 0));
                filterEnd = moment(new Date(filterDate.year(), filterDate.month(), filterDate.date(), self.endTime.hour(), self.endTime.minute(), 0));
            }
            filterStart = filterStart.format('YYYY-MM-D HH:mm:ss');
            filterEnd = filterEnd.format('YYYY-MM-D HH:mm:ss');
        }

        //if (roomData.OffsetMinutes && roomData.OffsetMinutes() != 0) { // != moment().utcOffset()) {
        //    filterStart = moment(self.filterData().Start).add(roomData.OffsetMinutes(), 'm');
        //    filterEnd = moment(self.filterData().End).add(roomData.OffsetMinutes(), 'm');
        //}

        var data = {
            startDate: filterStart,
            endDate: filterEnd,
            roomId: roomData.RoomID(),
            server: null,
            database: null,
            token: self.roomFloorInfo.FloorMapHash()
        };

        return $.ajax({
            type: 'POST',
            url: url,
            async: (bAsync != 'undefined' ? bAsync : true),
            data: data,
            dataType: 'xml',
            contentType: 'application/x-www-form-urlencoded',
            //success: function (response) {

            //    if (response.childNodes.length > 0 && response.childNodes[0].firstChild && response.childNodes[0].firstChild.data) {
            //        return response.childNodes[0].firstChild.data;
            //    }
            //    return [];
            //}
        });
    };

    function getFloormapRoomAvailability(imageId, buildingId, roomId, availabilityFilterData, filterValues) {
        return vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetFloormapAvailabilityList',
            data: JSON.stringify({
                ImageId: imageId,
                BuildingId: buildingId,
                searchData: availabilityFilterData,
                filterData: { filters: filterValues }
            }),
            success: function (result) {
                self.rooms = ko.observableArray([]);  //reset the array
                var roomlist = JSON.parse(result.d);
                if (roomlist) {
                    //do something with indicators
                    if (roomlist.Indicators) {
                        var arr = [];
                        $.each(roomlist.Indicators, function (i, v) {
                            var o = buildIndicatorObj(v);
                            arr.push(o);
                            //v.image = 'data:image/png;base64,' + v.image;
                            //v.SecondaryImage = 'data:image/png;base64,' + v.SecondaryImage;
                        });
                        self.Indicators(arr); //roomlist.Indicators);
                    }

                    if (roomlist.Rooms) {
                        var rlist = [];
                        var blist = [];
                        if (roomId > 0) {
                            var arr = $.grep(roomlist.Rooms, function (v, i) {
                                return v.RoomId == roomId;
                            });
                            if ($.isArray(arr) && arr.length > 0) {
                                var ri = getFloorMapInfoObj(arr[0]);
                                rlist.push(ri);
                            }
                        }
                        else {
                            $.each(roomlist.Rooms, function (i, v) {

                                var ri = getFloorMapInfoObj(v);
                                rlist.push(ri);
                            });
                        }
                        if (!imageId || imageId <= 0) {
                            if (buildingId && buildingId && rlist.length > 0) {
                                self.roomFloorInfo.FloorMapID(rlist[0].FloorMapID());  //they should all be the same?
                            }
                        }
                        self.rooms(rlist);
                    }
                }
            }
        });
    }

    function getFloorMapInfoObj(v) {
        var ri = new FloorMapRoomInfo();
        //ri.Floor(roomData.Floor());
        //ri.FloorMapID(roomData.ImageId());
        ri.RoomID(v.RoomId);
        ri.RoomId(v.RoomId); //to handle different roomObj types downstream
        ri.RoomCode(v.RoomCode);
        if (v.RoomDescription)
            ri.RoomDescription(v.RoomDescription);
        ri.Available(v.available);
        ri.XCoord(v.XCoord);
        ri.YCoord(v.YCoord);
        ri.RoomType(-1); //default to 1
        if (v.RoomTypeDescription) {
            if (v.RoomTypeDescription.length > 0)
                ri.RoomTypeDescription(v.RoomTypeDescription);
        }
        ri.RecordType(v.RecordType);
        ri.Available(v.UnavailableReason > 0 ? false : true);
        ri.AllowReservation(v.UnavailableReason > 0 ? false : true);
        ri.UnavailableReason(v.UnavailableReason);
        ri.FloorPlanIndicatorID(v.FloorPlanIndicatorID);
        ri.FloorMapID(v.ImageID);
        if (v.OffsetMinutes)
            ri.OffsetMinutes = ko.observable(v.OffsetMinutes);
        $.extend(v, ri);
        return v;
    };

    self.getRoomIndicators = function () {
        var url = self.FloorMapWebserviceUrlComputed() + 'GetRoomIndicators'
        var data = {
            imageId: self.roomFloorInfo.FloorMapID(),
            server: null,
            database: null,
            token: self.roomFloorInfo.FloorMapHash()
        };

        return $.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'xml',
            contentType: 'application/x-www-form-urlencoded',
            success: function (response) {
                var indicatorData = JSON.parse(response.childNodes[0].firstChild.data);
                if (indicatorData && indicatorData.length > 0) {
                    var arr = [];
                    $.each(indicatorData, function (i, v) {
                        var tmpObj = {
                            id: v.id,
                            image: v.image,
                            imageType: v.imageType,
                            SecondaryImage: v.secondaryimage,
                            secondaryImageType: v.secondaryImageType
                        }
                        var o = buildIndicatorObj(tmpObj);
                        arr.push(o);
                    });
                    self.Indicators(arr);
                }

                //if (indicatorData && indicatorData.image) {
                //    self.availableIndicatorSrc = 'data:image/png;base64,' + indicatorData.image;
                    

                //    if (indicatorData.unavailableIndicatorSrc) {
                //        self.unavailableIndicatorSrc = 'data:image/png;base64,' + indicatorData.secondaryimage;
                //    }
                //    else {
                //        self.unavailableIndicatorSrc = 'data:image/png;base64,' + indicatorData.image;
                //    }
                //}
            }
        });
    }

    self.getRoomIndicatorsCoord = function () {
        var url = self.FloorMapWebserviceUrlComputed() + 'GetRoom'
        var data = {
            imageId: self.roomFloorInfo.FloorMapID(),
            roomId: self.roomFloorInfo.RoomID(),
            server: null,
            database: null,
            token: self.roomFloorInfo.FloorMapHash()
        };

        return $.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'xml',
            contentType: 'application/x-www-form-urlencoded',
            success: function (response) {
                var raw = response.childNodes[0].firstChild.data;
                raw = raw.replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r').replace(/[\t]/g, '\\t');
                var markerCoords = JSON.parse(raw)[0];
                self.indicatorCoords = getCoordObject(markerCoords.xcoord, markerCoords.ycoord);
                if (markerCoords.FloorPlanIndicatorID)
                    self.roomFloorInfo.FloorPlanIndicatorID(markerCoords.FloorPlanIndicatorID);
                if (markerCoords.image)
                    self.availableIndicatorSrc = markerCoords.image
                if (markerCoords.SecondaryImage)
                    self.unavailableIndicatorSrc = markerCoords.SecondaryImage
            }
        });
    };

    var defaultWidth = 800, defaultHeight = 600;
    self.sizeModal = function (modal, modalDialog, modalContainer, image, event) {

        var isiOS = navigator.platform === 'iPhone' || navigator.platform === 'iPod';
        var modalMargin = Math.floor( (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - defaultWidth) / 2);
        if (self.isPhone()) {
            modalMargin = 10;
        }
        //Calculate device screen height / width
        var screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - modalMargin;
        var screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - modalMargin;

        // The address bar of (small) iOS devices break images when it shows, so we have go give them a little more breathing room
        if (isiOS)
            screenHeight = screenHeight - 30;

        var screenLandscape = screenWidth > screenHeight;
        //if (screenLandscape) {
            defaultWidth = screenWidth - modalMargin - 15;
            defaultHeight = screenHeight - modalMargin - 15;
        //}
        modalContainer.css('width', function (e) {
            return screenWidth - modalMargin;
        });
        modalDialog.css('width', function () {
            return screenWidth - modalMargin;
        });
    }

    function setValidInlineMapSize() {
        
        //var screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        //var screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        if (self.isPhone()) {
            L_DISABLE_3D = true;  //some phones can have trouble with transform-3d
            defaultWidth = $("#map").parent().width() - 10;
            //screenHeight = screenHeight - 10;
        }
        
        //if (screenWidth > defaultWidth) { defaultWidth = screenWidth; }
        //if (screenHeight > defaultHeight) { defaultHeight = screenHeight; }
        
    };

    function getCoordObject(xcoord, ycoord) {
        return {
            type: 'Feature',
            geometry: {
                coordinates: [parseInt(xcoord), parseInt(ycoord)],
                type: "Point"
            },
            properties: {}
        };
    };

    var map;

    function buildFloorPlans(roomResults) {

        var mapEl = 'map';
        if (self.isPhone()) {
            L_DISABLE_3D = true;  //some phones can have trouble with transform-3d
            defaultWidth = 380;
            defaultHeight = 375;
        }
        if (self.renderType == 'modal') {
            if (self.isPhone()) {
                mapEl = 'mobile-modal-map';
            }
            else {
                mapEl = 'modal-map';
            }
            var modal = $('#floormap-modal');
            $(modal).find(".modal-title").html(self.roomFloorInfo.RoomDescription());
            var modalDialog = $('#floormap-modal .modal-dialog');
            var modalContainer = $('#floormap-modal .modal-content');
            self.sizeModal(modal, modalDialog, modalContainer);
            //modal show is async, we need to make sure it is showing before map is loaded up
            modal.modal('show').off('shown.bs.modal').on('shown.bs.modal', function () {
                buildMap(mapEl, roomResults);
            }).off('hidden.bs.modal').on('hidden.bs.modal', function () {
                destroyMap();
            })
        }
        else {
            if (self.isPhone()) {
                setValidInlineMapSize();
            }
            buildMap(mapEl, roomResults);
        }
    }

    function destroyMap() {
        //http://stackoverflow.com/questions/10485582/what-is-the-proper-way-to-destroy-a-map-instance        
        var mapdiv = $(map.getContainer());
        mapdiv.empty();
        //map.remove();
    };

    var overlay, mapEl, openPopup, popupMarker, truebounds;
    function buildMap(mapElContainer, roomResults) {

        if (self.imgSrc.length == 0)
            return;

        var tmpImg = $(self.imgObj)[0]; 

        var mapDimensions = {
            height: tmpImg.naturalHeight,
            width: tmpImg.naturalWidth
        }
        if (mapDimensions.height == 0 || mapDimensions.width == 0) {
            mapDimensions = {
                height: tmpImg.height,
                width: tmpImg.width
            }
        }
        //there is some kind of bug with the initial zoom setting when maxZoom is set too high or too low.
        if (map) {
            try {
                // this can fail if the container is disposed (say from a modal on browse for people)
                map.remove();
            } catch (e) {
            }
        }
        mapEl = $("#" + mapElContainer);             
        openPopup = false;
        popupMarker = null;

        map = L.map(mapElContainer, {
            attributionControl: false,
            maxZoom: 4,
            minZoom: 0,
            zoom: 0,
            //zoomSnap: 0,   //this messes up pin locations
            //zoomDelta: .4,
            //wheelPxPerZoomLevel: 100,  //this doesn't work as expected either
            crs: L.CRS.Simple
        });              
                
        trueBounds = getTrueBounds(mapDimensions, map.getZoom());
        overlay = L.imageOverlay(self.imgSrc, trueBounds);
        overlay.addTo(map);       

        map.fitBounds(trueBounds);        
        if (roomResults && roomResults().length > 0) {
            var markerArr = [];
            openPopup = (roomResults().length == 1);            

            $.each(roomResults(), function (i, v) {
                var indicatorCoords = getCoordObject(v.XCoord(), v.YCoord());
                var marker = createMarker(indicatorCoords, map, v, self.precheckIconAvailability());
                marker.addTo(map);
                if (openPopup === true) {
                    popupMarker = marker;
                }
            });
        }
        else {
            var marker = createMarker(self.indicatorCoords, map, self.roomFloorInfo, self.precheckIconAvailability());
             marker.addTo(map);
             openPopup = true;
             popupMarker = marker;
        }               
                
        $(map.zoomControl._zoomInButton).on('click', function (e) {
            var z = map.getZoom();
            var max = map.getMaxZoom();
            if (z < max) {
                map.setZoom(z + 1);
            }
        });
        $(map.zoomControl._zoomOutButton).on('click', function (e) {
            var z = map.getZoom();
            var m = map.getMinZoom();
            if (z > m) {
                map.setZoom(z - 1);
            }
        });

        if (tmpImg.width > defaultWidth) {

            if (!self.isPhone() || self.renderType == 'modal') {
                map.on('zoomend', zoomendHandler);
            }
            //calc zoom levels
            var percDiff = tmpImg.width / defaultWidth;                        
            var minzoom = (-1 * Math.ceil(percDiff));
            map.setMinZoom(minzoom);
            var zm = Math.floor(minzoom / 2);
            map.setZoom(zm);

            mapEl.height(defaultHeight);
            mapEl.width(defaultWidth);
            map.invalidateSize(); // to kick off the first zoomend event
        }
        else {
            map.setMinZoom(-1);
            //map.setMaxZoom(4);
            mapEl.height(mapDimensions.height);
            mapEl.width(mapDimensions.width);
            map.invalidateSize();
            autoOpenMarkerPopup();
        }
        $(".leaflet-marker-icon").css('cursor', 'pointer');
        addResetControl();
    };

    function zoomendHandler(e) {
        //now bring map size to the same size as the zoom reduced size
        map.off('zoomend', zoomendHandler); //stop resizing till new image comes through
        mapEl.height(overlay._image.height);
        mapEl.width(overlay._image.width);
        map.invalidateSize(true);
        autoOpenMarkerPopup();
    };
    function autoOpenMarkerPopup(autoOpenMarkerPopup) {
        if (openPopup === true && popupMarker && !self.isPhone()) {
            //map.panTo(popupMarker.getLayers()[0].getLatLng());
            $('body').scrollTo($('.leaflet-container'), { duration: 'slow' });
            popupMarker.getLayers()[0].openPopup();
            //popupMarker.openPopup();
        }
        else {
            map.setMaxBounds(trueBounds);
        }
    };

    function addResetControl() {
        var control = new L.Control({ position: 'bottomright' });
        control.onAdd = function (map) {
            var azoom = L.DomUtil.create('a', 'resetzoom');
            azoom.innerHTML = "[Reset Zoom]";
            $(azoom).css('cursor', 'pointer');
            L.DomEvent
                .disableClickPropagation(azoom)
                .addListener(azoom, 'click', function () {
                    self.closeActivePopupAndReset();
                }, azoom);
            return azoom;
        };
        control.addTo(map);
    };

    function addPopupCloseControl() {
        var control = new L.Control({ position: 'bottomleft' });
        control.onAdd = function (map) {
            var azoom = L.DomUtil.create('a', 'resetzoom');
            azoom.innerHTML = "[Close Details]";
            $(azoom).css('cursor', 'pointer');
            L.DomEvent
                .disableClickPropagation(azoom)
                .addListener(azoom, 'click', function () {
                    self.closeActivePopupAndReset();
                }, azoom);
            return azoom;
        };
        control.addTo(map);
    };

    self.closeActivePopupAndReset = function () {        
        var popupclosed = false;
        $.each(map._layers, function (ml) {
            if (map._layers[ml].feature) {
                var popup = this.getPopup();
                if (popup.isOpen()) {
                    map._layers[ml].closePopup();
                    popupclosed = true;
                }
            }
        });
        if (!popupclosed)
            resetZoom();

    };
    function resetZoom() {
        var mapDimensions = {
            height: overlay._image.height,
            width: overlay._image.width
        }
        var trueBounds = getTrueBounds(mapDimensions, map.getZoom());
        //setTimeout(function () {  //prevent timing collisions
        map.fitBounds(trueBounds);
        map.setMaxBounds(trueBounds); //prevents pulling outside of bounds
        //}, 50);
    };

    self.closePopupHandler = function (e) {        
        resetZoom();
    };

    function getTrueBounds(mapDimensions, zoom) {
        var southWest = map.unproject([0, mapDimensions.height], zoom);
        var northEast = map.unproject([mapDimensions.width, 0], zoom);
        return new L.LatLngBounds(southWest, northEast);
    };

    function createMarker(coordObj, map, floorMapInfoObj, precheckIconAvailability) {
        var tmpIndicator, height, width;
        var indObj;
        var ind = $.grep(self.Indicators(), function (v, i) {
            return parseInt(v.FloorPlanIndicatorID) == parseInt(floorMapInfoObj.FloorPlanIndicatorID());
        });
        if ($.isArray(ind) && ind.length > 0) {
            indObj = ind[0]
        }
        else {
            console.log("Indicator is no longer associated with this floormap. The Floormap Indicator may have been removed from the Floormap in the EMS Client.");
            var tmpObj = {
                id: parseInt(floorMapInfoObj.FloorPlanIndicatorID()),
                image: defaultIndicatorImage,
                imageType: "png",
                SecondaryImage: defaultIndicatorImage,
                secondaryImageType: "png"
            }
            indObj = buildIndicatorObj(tmpObj);
        }
        //if room was added to cart, make sure don't show the button.
        if (self.bookings && self.bookings().length > 0) {
            var r = $.grep(self.bookings(), function (v, i) {
                return v.RoomId() == floorMapInfoObj.RoomID();
            });
            if ($.isArray(r) && r.length > 0) {
                floorMapInfoObj.Available(false);
            }
        }
        tmpIndicator = indObj.imageObj;
        height = indObj.height; // tmpIndicator.naturalHeight;
        width = indObj.width;  //tmpIndicator.naturalWidth;

        if (precheckIconAvailability) {
            self.loadRoomAvailability(floorMapInfoObj, false).success(function (response) {
                var bookings = [], now = moment(new Date());
                if (response.childNodes.length > 0 && response.childNodes[0].firstChild && response.childNodes[0].firstChild.data) {
                    bookings = JSON.parse(response.childNodes[0].firstChild.data);
                }
                var myoffset = now.utcOffset();
                $.each(bookings, function (i, v) {
                    //is the event currently occuring?
                    if (now > moment(v.gmtstarttime).add(myoffset, 'minutes') && now < moment(v.gmtendtime).add(myoffset, 'minutes')) {
                        floorMapInfoObj.Available(false);
                    }
                });                               
                //return createIconMarker(icon, floorMapInfoObj, latlng);
            });
        }

        if (!floorMapInfoObj.Available()) {
            tmpIndicator = indObj.secondaryImageObj;
            height = indObj.secondaryHeight;
            width = indObj.secondaryWidth;
        }

        var icon = new L.icon({
            iconUrl: $(tmpIndicator).attr('src'), //.availableIndicatorSrc,
            iconSize: [width, height],
            //iconAnchor: [Math.round(width / 2), Math.round(height / 2)],
            iconAnchor: [25, 0],
            popupAnchor: [-(width / 4), -(height / 4)]
        });

        var layer = new L.GeoJSON(coordObj, {
            pointToLayer: function (feature, latlng) {               
                return createIconMarker(icon, floorMapInfoObj, latlng);
            },
            //onEachFeature: function (feature, layer) {
            //    var html = self.buildPopupContent(floorMapInfoObj);
            //    layer.bindPopup(html);
            //}
        });        

        return layer;

    };

    function createIconMarker(icon, floorMapInfoObj, latlng) {
        var marker = L.marker(map.unproject([latlng.lng, latlng.lat], 0), { icon: icon });
        marker.bindPopup("Loading...", { keepInView: true });
        marker.on('popupclose', self.closePopupHandler);
        marker.on('popupopen', function (e) {
            var popup = e.target.getPopup();
            map.setMaxBounds(false);
            self.loadRoomAvailability(floorMapInfoObj).success(function (response) {
                var data = [];
                if (response.childNodes.length > 0 && response.childNodes[0].firstChild && response.childNodes[0].firstChild.data) {
                    data = JSON.parse(response.childNodes[0].firstChild.data);
                }
                var html = buildPopupContent(floorMapInfoObj, data);
                popup.setContent(html);
                popup.update();
            });
        });

        return marker;
    };

    function buildPopupContent(floorMapInfoObj, bookings) {
        var currentlyAvailable = floorMapInfoObj.Available();
        var events = '', now = moment(new Date());
        if (bookings && bookings.length > 0) {
            events = $("<table class='table-striped table-condensed'>");
            var header = $("<thead>");
            header.append($("<th>").append(self.ScreenText.StartTimeText));
            header.append($("<th>").append(self.ScreenText.EndTimeText));
            header.append($("<th>").append(self.ScreenText.TitleText));
            header.append($("<th>").append(self.ScreenText.GroupNameText));
            header.appendTo(events);
            var body = $("<tbody>");
            $.each(bookings, function (i, v) {
                var row = $("<tr>");
                row.append($("<td>").append(moment(v.starttime).format('MMMM Do YYYY LT')));
                row.append($("<td>").append(moment(v.endtime).format('MMMM Do YYYY LT')));
                row.append($("<td>").append(v.eventname));
                row.append($("<td>").append(v.groupname));
                body.append(row); //.appendTo(events);

                //is the event currently occuring?
                if (now > moment(v.starttime) && now < moment(v.endtime)) {
                    currentlyAvailable = false;
                }
            });
            events.append(body);
            events = $('<div>').append(events).html();
        }

        var poptxt = $('<div>').html('<h4>' + self.ScreenText.RoomDetailsText + '</h4>'
                + '<div><span style="font-weight:bold">' + self.ScreenText.RoomCodeText + ':</span> ' + floorMapInfoObj.RoomCode() + '</div>');

        poptxt.append($('<div><span style="font-weight:bold">' + self.ScreenText.RoomDescriptionText + ':</span> ' + floorMapInfoObj.RoomDescription() + '</div>'));

        if (floorMapInfoObj.RoomTypeDescription && floorMapInfoObj.RoomTypeDescription().length > 0) {
            poptxt.append($('<div><span style="font-weight:bold">' + self.ScreenText.RoomTypeText + ':</span> ' + floorMapInfoObj.RoomTypeDescription() + '</div>'));
        }
        if (currentlyAvailable) {
            poptxt.append($('<div><span style="font-weight:bold">' + self.ScreenText.AvailabilityText + ':</span> '
                + '<span class="floormap-available">' + self.ScreenText.AvailableText + '</span></div>'));
        }
        else {
            poptxt.append($('<div><span style="font-weight:bold">' + self.ScreenText.AvailabilityText + ':</span> '
                + '<span class="floormap-unavailable">' + self.ScreenText.UnavailableText + '</span></div>'));
        }
        if (floorMapInfoObj.AllowReservation() && floorMapInfoObj.Available()) {
            var requestText = (floorMapInfoObj.RecordType() == 1 ? self.ScreenText.ReserveText : self.ScreenText.RequestText)
            var vmName = self.renderType == 'modal' ? 'vems.floorPlanModalVM' : 'vems.floorPlanVM';
            if (floorMapInfoObj.ReservationSummaryUrl && floorMapInfoObj.ReservationSummaryUrl().length > 0)
                poptxt.append($('<button class="btn btn-success" style="margin: 8px 8px 0 0;" type="button" onclick="window.location.href=\'' + floorMapInfoObj.ReservationSummaryUrl() + '\';">' + requestText + '</button>'));
            else
                poptxt.append($('<button class="btn btn-success" style="margin: 8px 8px 0 0;" type="button" onclick="' + vmName + '.roomAddedClicked(' + floorMapInfoObj.RoomID() + ');">' + requestText + '</button>'));
        }
        poptxt.append(events);
        return $('<div>').append(poptxt).html();

    };

    self.mapClickHandler = function (e) {
        var map = e.target;
        var tmpIndicator = $('<img src="' + self.availableIndicatorSrc + '" />')[0];
        var height = tmpIndicator.naturalHeight;
        var width = tmpIndicator.naturalWidth;

        var icon = new L.icon({
            iconUrl: self.availableIndicatorSrc,
            iconSize: [width, height],
            //iconAnchor: [(width / 2), (height / 2)],
            iconAnchor: [25, 0],
            popupAnchor: [-(width / 4), -(height / 4)]
        });

        var marker = new L.Marker(e.latlng, {
            draggable: true,
            icon: icon
        });

        map.addLayer(marker);

    }
};

function FloorMapRoomInfo() {
    var self = this;
    self.FloorMapID = ko.observable(0);
    self.ImageHeight = ko.observable(0);
    self.ImageWidth = ko.observable(0);
    self.FloorMapHash = ko.observable('');
    self.Floor = ko.observable('');
    self.BuildingId = ko.observable(0);
    self.FloorId = ko.observable(0);
    self.FloorPlanIndicatorID = ko.observable(0);
    self.FloorMapWebserviceUrl = ko.observable('');
    self.RoomId = ko.observable(0); //put here in case it gets called from other places.
    self.RoomID = ko.observable(0);
    self.RoomTitle = ko.observable('');
    self.RoomCode = ko.observable('');
    self.RoomDescription = ko.observable('');
    self.BuildingDescription = ko.observable('');
    self.RoomTypeDescription = ko.observable('');
    self.RoomType = ko.observable(-1);
    self.RecordType = ko.observable(1);  //request 2 vs reserve 1
    self.AllowReservation = ko.observable(false);
    self.Available = ko.observable(true);
    self.UnavailableReason = ko.observable('');
    self.XCoord = ko.observable(0);
    self.YCoord = ko.observable(0);
    self.ReservationSummaryUrl = ko.observable('');
    self.OffsetMinutes = null;

};