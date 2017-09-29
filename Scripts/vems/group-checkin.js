/// <reference path="jquery-1.4.2.min-vsdoc.js" />
Dea.LG = {};

$(document).ready(function () {
    $('#groupCheckin').tabs();
    Dea.setTabs('groupCheckin');
    $('#resultsContainer').addRowHighlights();
    $('#flashContent').dialog({
        autoOpen: false,
        modal: true,
        resizable: true,
        width:1024,
        height:700
    });
});

Dea.pageHandleCallback = function (emsResponse, context) {
    switch (context) {
        case 'getBookings':
        case 'toggleCheckin':
            Dea.setHtml('resultsContainer', emsResponse.bookingsHtml);
            $('div[id*=groupStatus]').html(emsResponse.checkinHtml);
            $('#resultsContainer').addRowHighlights();
            return true;
    }
    return false;
};

Dea.LG.getBookings = function (gid) {
    Dea.emsData.groupId = gid;
    Dea.makeCallback('getBookings');
    return false;
};

var imageId;
var roomId;
var Locator;
Dea.LG.showMap = function (iId, rId) {
    imageId = iId;
    roomId = rId;
    Dea.LG.setSwf();
    return false;
};

Dea.LG.toggleCheckin = function (gid, bid, booId) {
    Dea.emsData.groupId = gid;
    Dea.emsData.buildingId = bid;
    Dea.emsData.bookingId = booId;
    Dea.makeCallback('toggleCheckin');
    return false;
};

Dea.LG.setSwf = function () {
    var so = new SWFObject('swf/Locator.swf', 'Locator', '100%', '650px', '9', '#FFFFFF');
    so.addParam('quality', 'high');
    so.addParam('wmode', 'transparent');
    so.addParam('middle', 'middle');

    so.addVariable('wsUrl', webServiceUrl);
    so.addVariable('imageId', imageId);
    so.addVariable('roomId', roomId);
    so.addVariable('roomLabel', roomLabel);
    so.addVariable('product', product);
    so.addVariable('browserLocale', browserLocale);
    so.addVariable('database', database);
    so.addVariable('server', server);

    so.write('flashContent');
    $('#flashContent').dialog('open');
    Locator = Dea.Get('Locator');
};