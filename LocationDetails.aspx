<%@ Page Language="C#" AutoEventWireup="true"
    Inherits="LocationDetails" MasterPageFile="~/MasterVirtualEms.master" Title="<%$Resources:PageTitles, LocationDetails %>" CodeBehind="LocationDetails.aspx.cs" %>

<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ Import Namespace="Resources" %>
<%@ Import Namespace="System.Web.Optimization" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>

<asp:Content ID="HeadContent" runat="server" ContentPlaceHolderID="headContentHolder">
</asp:Content>
<asp:Content ID="Content1" ContentPlaceHolderID="pc" runat="server">
    <div id="location-details" style="height: 100%;">
        <div class="row" id="breadcrumb">
            <div class="col-md-6 col-xs-6">
                <a href="#" onclick="javascript: window.location.href = document.referrer;"><i class="fa fa-chevron-left"></i>&nbsp;
                <%=ScreenText.Back %></a>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-8">
                <h2 data-bind="text: buildingTitle()"></h2>
            </div>
            <div class="col-sm-4">
                <Dea:HelpButton runat="server" ID="VEMSLocationDetailsHelp" CssClass="floatRight" LookupKey="VEMSLocationDetailsHelp" ParentType="None" />
            </div>
        </div>
        <ul class="nav nav-tabs" role="tablist" style="margin-bottom: 9px;">
            <li role="presentation" class="tab pane active"><a href="#building-details" aria-controls="building-details" role="tab" data-toggle="tab"><%= string.Format(ScreenText.BuildingDetails, EmsParameters.BuildingTitleSingular) %></a></li>
            <!-- ko if: BuildingUdfs().length > 0 -->
            <li role="presentation"><a href="#building-additional-information" aria-controls="building-additional-information" role="tab" data-toggle="tab"><%= ScreenText.AdditionalInformation %></a></li>
            <!-- /ko -->
            <!-- ko if: BuildingImages().length > 0 -->
            <li role="presentation"><a href="#building-images" aria-controls="building-images" role="tab" data-toggle="tab"><%= ScreenText.Images %></a></li>
            <!-- /ko -->
        </ul>

        <div id="building-info" class="tab-content">
            <div role="tabpanel" class="tab-pane active" id="building-details">
                <table class="table table-striped">
                    <tbody>
                        <!-- ko if: BuildingCode().length > 0 -->
                        <tr>
                            <td><%= string.Format(ScreenText.BuildingCode, EmsParameters.BuildingTitleSingular) %></td>
                            <td data-bind="text: vems.decodeHtml(BuildingCode()) "></td>
                        </tr>
                        <!-- /ko -->
                        <tr>
                            <td><%=ScreenText.Description %></td>
                            <td data-bind="text: vems.decodeHtml(BuildingDescription())"></td>
                        </tr>
                        <tr>
                            <td><%=ScreenText.TimeZone %></td>
                            <td data-bind="text: timeZoneTitle()"></td>
                        </tr>
                        <!-- ko if: BuildingNotes().trim().length > 0 -->
                        <tr>
                            <td><%=ScreenText.Notes %></td>
                            <td>
                                <span data-bind="html: vems.decodeHtml(BuildingNotes())"></span>
                            </td>
                        </tr>
                        <!-- /ko -->
                        <!-- ko if: BuildingLocationLink().length > 0 -->
                        <tr>
                            <td><%=ScreenText.Location %></td>
                            <td>
                                <a target="_blank" data-bind="attr: { href: BuildingLocationLink() }"><i class="fa fa-map-marker"></i>&nbsp;On Map</a>
                            </td>
                        </tr>
                        <!-- /ko -->
                        <!-- ko if: BuildingUrl().length > 0 -->
                        <tr>
                            <td><%=ScreenText.Url %></td>
                            <td><a data-bind="text: BuildingUrl(), attr: { href: BuildingUrl() }"></a></td>
                        </tr>
                        <!-- /ko -->
                    </tbody>
                </table>
            </div>
            <div role="tabpanel" class="tab-pane" id="building-additional-information">
                <div class="booking-grid">
                    <div>
                        <!-- ko foreach: BuildingUdfs -->
                        <div class="row col-xs-12 location-udf-row">
                            <div class="row col-xs-12 location-udf-sub-row">
                                <div class="col-xs-6 col-sm-4 location-udf-cell" data-bind="text: vems.decodeHtml(Description())"></div>
                                <div class="col-xs-6 col-sm-8 location-udf-cell" data-bind="text: moment(Value()).isValid() ? moment(Value()).format('l ddd') : vems.decodeHtml(Value())"></div>
                            </div>

                            <!-- ko foreach: Children -->
                            <div class="row col-xs-12 location-udf-sub-row">
                                <div class="col-xs-6 col-sm-4 location-udf-child-desc" data-bind="text: vems.decodeHtml(Description())"></div>
                                <div class="col-xs-6 col-sm-8 location-udf-child" data-bind="text: moment(Value()).isValid() ? moment(Value()).format('l ddd') : vems.decodeHtml(Value())"></div>
                            </div>
                            <!-- /ko -->
                        </div>
                        <!-- /ko -->
                    </div>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane" id="building-images">
                <div class="row">
                    <div data-bind="template: { name: 'location-details-images-template', foreach: BuildingImages(), as: 'image' }"></div>
                </div>
            </div>
        </div>

        <!-- ko if: RoomId() -->
        <h2 data-bind="text: $root.roomTitle"></h2>

        <ul class="nav nav-tabs" role="tablist" style="margin-bottom: 9px;">
            <li role="presentation" class="tab pane active"><a href="#room-details" aria-controls="room-details" role="tab" data-toggle="tab"><%= string.Format("{0} {1}", EmsParameters.RoomTitleSingular, ScreenText.Details) %></a></li>
            <!-- ko if: SetupTypes().length > 0 -->
            <li role="presentation"><a href="#room-setup-types" aria-controls="room-setup-types" role="tab" data-toggle="tab"><%= ScreenText.SetupTypes %></a></li>
            <!-- /ko -->
            <!-- ko if: Features().length > 0 -->
            <li role="presentation"><a href="#room-features" aria-controls="room-features" role="tab" data-toggle="tab"><%= ScreenText.Features %></a></li>
            <!-- /ko -->
            <!-- ko if: Templates().length > 0 -->
            <li role="presentation"><a href="#room-linked-template" aria-controls="room-linked-templates" role="tab" data-toggle="tab"><%= ScreenText.LinkedTemplates %></a></li>
            <!-- /ko -->
            <!-- ko if: RoomUdfs().length > 0 -->
            <li role="presentation"><a href="#room-additional-information" aria-controls="room-additional-information" role="tab" data-toggle="tab"><%= ScreenText.AdditionalInformation %></a></li>
            <!-- /ko -->
            <!-- ko if: RoomImages().length > 0 -->
            <li role="presentation"><a href="#room-images" aria-controls="room-images" role="tab" data-toggle="tab"><%= ScreenText.Images %></a></li>
            <!-- /ko -->
            <!-- ko if: HasFloorMap() -->
            <li role="presentation"><a href="#room-floor-plan" aria-controls="room-floor-plan" role="tab" data-toggle="tab"><%= ScreenText.FloorMap %></a></li>
            <!-- /ko -->
            <li role="presentation" data-bind="visible: vems.hasBrowseForSpace === 1"><a href="#room-availability" aria-controls="room-availability" role="tab" data-toggle="tab" id="availability-tab"><%= ScreenText.Availability %></a></li>
        </ul>

        <div class="tab-content">
            <div role="tabpanel" class="tab-pane active" id="room-details">
                <table class="table table-striped">
                    <tbody data-bind="foreach: roomDetails">
                        <!-- ko if: key == 'URL' -->
                        <tr>
                            <td data-bind="text: key"></td>
                            <td><a data-bind="attr: { href: value }, text: value"></a></td>
                        </tr>
                        <!-- /ko -->

                        <!-- ko if: key =="Notes" -->
                        <tr>
                            <td data-bind="text: key"></td>
                            <td data-bind="html: vems.decodeHtml(value)"></td>
                        </tr>
                        <!-- /ko -->
                        <!-- ko ifnot: key == 'URL' || key == 'Notes' -->
                        <tr>
                            <td data-bind="text: key"></td>
                            <td data-bind="text: vems.decodeHtml(value)"></td>
                        </tr>
                        <!-- /ko -->
                    </tbody>
                </table>
            </div>
            <div role="tabpanel" class="tab-pane" id="room-setup-types">
                <table class="table table-striped" id="setup-types">
                    <thead>
                        <th><%= ScreenText.SetupType %></th>
                        <th><%= ScreenText.MinCapacity %></th>
                        <th><%= ScreenText.MaxCapacity %></th>
                    </thead>
                    <tbody data-bind="foreach: SetupTypes">
                        <tr>
                            <td data-bind="text: vems.decodeHtml(Description())"></td>
                            <td data-bind="text: MinCapacity"></td>
                            <td data-bind="text: MaxCapacity"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div role="tabpanel" class="tab-pane" id="room-features">
                <table class="table table-striped">
                    <tbody data-bind="foreach: Features">
                        <tr>
                            <td data-bind="text: vems.decodeHtml(Description())"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div role="tabpanel" class="tab-pane" id="room-linked-template">
                <div class="row sortable-grid-header">
                    <div class="row col-xs-12 template-grid-row">
                        <div class="col-sm-4 col-xs-6 grid-text-center"></div>
                        <div class="col-sm-2 hidden-xs grid-text-center">
                            <%= ScreenText.Request %>
                        </div>
                        <div class="col-sm-2 hidden-xs grid-text-center">
                            <%= ScreenText.Reserve %>
                        </div>
                        <div class="col-sm-4 col-xs-6 grid-text-center"></div>
                    </div>
                </div>
                <div class="row booking-grid">
                    <div class="sortable-grid-content" data-bind="foreach: Templates">
                        <div class="row col-xs-12 template-grid-row">
                            <div class="col-sm-4 col-xs-6 grid-text" data-bind="text: vems.decodeHtml(Description())"></div>
                            <div class="col-sm-2 hidden-xs grid-text-center">
                                <!-- ko if: Request() == true -->
                                <i class="fa fa-check"></i>
                                <!-- /ko -->
                            </div>
                            <div class="col-sm-2 hidden-xs grid-text-center">
                                <!-- ko if: Reserve() == true -->
                                <i class="fa fa-check"></i>
                                <!-- /ko -->
                            </div>
                            <div class="col-sm-4 col-xs-6 table-buttons">
                                <button type="button" class="btn btn-primary btn-xs" data-bind="event: { mousedown: $root.templateClick }"><%= ScreenText.BookNow %></button>
                                <button type="button" class="btn btn-primary btn-xs" data-bind="attr: { 'data-navigateurl': NavigateUrl, 'data-templateid': TemplateId }"
                                    data-toggle="modal" data-target="#template-modal">
                                    <%= ScreenText.About %></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane" id="room-additional-information">
                <div class="booking-grid">
                    <div>
                        <!-- ko foreach: RoomUdfs -->
                        <div class="row col-xs-12 location-udf-row">
                            <div class="row col-xs-12 location-udf-sub-row">
                                <div class="col-xs-6 col-sm-4 location-udf-cell" data-bind="text: vems.decodeHtml(Description())"></div>
                                <div class="col-xs-6 col-sm-8 location-udf-cell" data-bind="text: new Date(Value()) != 'Invalid Date' ? moment(Value()).format('l ddd') : vems.decodeHtml(Value())"></div>
                            </div>

                            <!-- ko foreach: Children -->
                            <div class="row col-xs-12 location-udf-sub-row">
                                <div class="col-xs-6 col-sm-4 location-udf-child-desc" data-bind="text: vems.decodeHtml(Description())"></div>
                                <div class="col-xs-6 col-sm-8 location-udf-child" data-bind="text: new Date(Value()) != 'Invalid Date' ? moment(Value()).format('l ddd') : vems.decodeHtml(Value())"></div>
                            </div>
                            <!-- /ko -->
                        </div>
                        <!-- /ko -->
                    </div>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane" id="room-images">
                <div class="row">
                    <div data-bind="template: { name: 'location-details-images-template', foreach: RoomImages(), as: 'image' }"></div>
                </div>
            </div>
            <!-- ko if: HasFloorMap() -->
            <div role="tabpanel" class="tab-pane" id="room-floor-plan">
                <div data-bind="component: { name: 'floorplans-reserve', params: { RoomInfo: $root.FloorMapRoomInfo, ScreenText: $root.FloorMapScreenText } }"></div>
            </div>
            <!-- /ko -->
            <div role="tabpanel" class="tab-pane" id="room-availability">
                <div class="row">
                    <div class="col-sm-9 col-xs-12">
                        <div class="col-sm-2 col-xs-3">
                            <button class="btn btn-main" type="button" id="available-previous" data-bind="click: changeAvailableDate">
                                <i class="fa fa-chevron-left"></i>
                                <span><%= ScreenText.Prev %></span>
                            </button>
                        </div>
                        <div class="col-sm-8 col-xs-5">
                            <span style="font-size: 1.3em; display: block; text-align: center;" data-bind="text: moment(availableStartDate()).format('LL') + ' - ' + moment(availableStartDate()).add(6, 'day').format('LL')"></span>
                        </div>
                        <div class="col-sm-2 col-xs-2">
                            <button class="btn btn-main" type="button" id="available-next" data-bind="click: changeAvailableDate">
                                <span><%= ScreenText.Next %></span>
                                <i class="fa fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-sm-3 hidden-xs">
                        <span class="float-right" style="margin-right: 15px; font-size: 1.3em;" data-bind="text: timeZoneTitle()"></span>
                    </div>
                </div>
                <div class="">
                    <div id="room-availability-control"></div>
                </div>
            </div>
        </div>
        <!-- /ko -->
    </div>
    <!-- about template modal -->
    <div class="modal fade" id="template-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
        <div class="modal-dialog" role="document">
            <div class="modal-content" id="template-modal-content" data-bind="component: { name: 'web-template-modal-component', params: $root }"></div>
        </div>
    </div>

    <!-- building/room image modal -->
    <div class="modal fade" id="bldg-room-image-modal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-body">
                    <img id="bldg-room-image-img" src="" alt="" title="">
                    <a href="#" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="fa fa-close"></i></a>
                </div>
            </div>
        </div>
    </div>

    <!-- Images KO template -->
    <script type="text/html" id="location-details-images-template">
        <div class="col-xs-6 col-md-2">
            <a href="#" class="thumbnail" data-toggle="modal">
                <!-- ko if: image.FileExtension() == ".svg" -->
                <img data-bind="click: $root.openImageModal.bind($data), attr: { src: 'data:image/svg+xml;base64,' + image.BinaryData(), alt: vems.decodeHtml(image.Description()), title: vems.decodeHtml(image.Description()) + ' (View full-size image)' }" alt="" data-toggle="tooltip" data-placement="bottom">
                <!-- /ko -->
                <!-- ko if: image.FileExtension() != ".svg" -->
                <img data-bind="click: $root.openImageModal.bind($data), attr: { src: 'data:image/' + image.FileExtension().replace('.', '') + ';base64,' + image.BinaryData(), alt: vems.decodeHtml(image.Description()), title: vems.decodeHtml(image.Description()) + ' (View full-size image)' }" alt="" data-toggle="tooltip" data-placement="bottom">
                <!-- /ko -->
            </a>
        </div>
    </script>

</asp:Content>
<asp:Content ID="jsBottomOfPage" runat="server" ContentPlaceHolderID="bottomJSHolder">
    <%= Styles.Render("~/Content/leaflet") %>
    <%= Scripts.Render("~/bundles/leaflet") %>
    <%= Scripts.Render("~/bundles/location-details") %>

    <script type="text/javascript">
        $(document).ready(function () {
            vems.screenText.RoomCode = '<%= escapeQuotes(string.Format(ScreenText.RoomCode, EmsParameters.RoomTitleSingular)) %>';
            vems.screenText.RoomDescription = '<%= escapeQuotes(ScreenText.Description) %>';
            vems.screenText.RoomType = '<%= escapeQuotes(string.Format(ScreenText.RoomType, EmsParameters.RoomTitleSingular)) %>';
            vems.screenText.Floor = '<%= escapeQuotes(ScreenText.Floor) %>';
            vems.screenText.Size = '<%= escapeQuotes(EmsParameters.RoomSizeLabel) %>';
            vems.screenText.Phone = '<%= escapeQuotes(ScreenText.Phone) %>';
            vems.screenText.RequiresCheckIn = '<%= escapeQuotes(ScreenText.RequiresCheckIn) %>';
            vems.screenText.AllowCheckInXMinutesBeforeStartOfBooking = '<%= escapeQuotes(ScreenText.AllowCheckInXMinutesBeforeStartOfBooking) %>';
            vems.screenText.setupHours = '<%= escapeQuotes(ScreenText.SetupHours) %>';
            vems.screenText.teardownHours = '<%= escapeQuotes(ScreenText.TeardownHours) %>';
            vems.screenText.Notes = '<%= escapeQuotes(ScreenText.Notes) %>';
            vems.screenText.Url = '<%= escapeQuotes(ScreenText.Url) %>';
            vems.screenText.Yes = '<%= escapeQuotes(ScreenText.Yes) %>';
            vems.screenText.No = '<%= escapeQuotes(ScreenText.No) %>';
            vems.screenText.AvailabilityText = '<%= escapeQuotes(ScreenText.Availability) %>';
            vems.screenText.AvailableText = '<%= escapeQuotes(ScreenText.Available) %>';
            vems.screenText.UnavailableText = '<%= escapeQuotes(ScreenText.Unavailable) %>';

            var floormapscreentext = {
                RequestText: '<%= escapeQuotes(ScreenText.Request) %>',
                ReserveText: '<%= escapeQuotes(ScreenText.Reserve) %>',
                RoomDetailsText: '<%= escapeQuotes(string.Format(ScreenText.RoomDetails, EmsParameters.RoomTitleSingular)) %>',
                RoomCodeText: '<%= escapeQuotes(string.Format(ScreenText.RoomCode, EmsParameters.RoomTitleSingular)) %>',
                RoomDescriptionText: '<%= escapeQuotes(ScreenText.Description) %>',
                RoomTypeText: '<%= escapeQuotes(string.Format(ScreenText.RoomType, EmsParameters.RoomTitleSingular)) %>',
                AvailabilityText: '<%= escapeQuotes(ScreenText.Availability) %>',
                AvailableText: '<%= escapeQuotes(ScreenText.Available) %>',
                UnavailableText: '<%= escapeQuotes(ScreenText.Unavailable) %>',
                StartTimeText: '<%= escapeQuotes(ScreenText.StartTime) %>',
                EndTimeText: '<%= escapeQuotes(ScreenText.EndTime) %>',
                TitleText: '<%= escapeQuotes(ScreenText.Title) %>',
                GroupNameText: '<%= escapeQuotes(string.Format(ScreenText.GroupName, EmsParameters.GroupTitleSingular)) %>'
            }
            vems.locationDetails.viewModels.details = new vems.locationDetails.detailsVM(<%= Model %>);
            vems.locationDetails.viewModels.details.FloorMapScreenText = floormapscreentext;
            vems.locationDetails.buildingDisplay = <%= (int)EmsParameters.DefaultBuildingDisplay %>;
            vems.locationDetails.RoomDisplay = <%= (int)EmsParameters.DefaultRoomDisplay %>;

            ko.applyBindings(vems.locationDetails.viewModels.details, $('#location-details')[0]);

            $('[data-toggle="tooltip"]').tooltip();

            $(document).on('click', '#availability-tab', function(){
                vems.locationDetails.viewModels.details.getAvailabilityForDate(moment().startOf('day'));

            });
        });

        if (DevExpress.devices.real().phone) {
            $("#location-details").css('margin-left', '-15px').css('margin-right', '-15px');
        }

        $('#template-modal').on('show.bs.modal', function (event) {
            vems.templateModalShowing(event);
        });

        $('a[href="#room-floor-plan"]').one('show.bs.tab', function () {
            vems.floorPlanVM.buildModalMapForRoom();
        });

        window.addEventListener("orientationchange", function() {
            var modal = $('#bldg-room-image-modal');
            var modalDialog = $('#bldg-room-image-modal .modal-dialog');
            var modalContainer = $('#bldg-room-image-modal .modal-content');
            var modalImage = $('#bldg-room-image-img');

            vems.locationDetails.viewModels.details.sizeImageModal(modal, modalDialog, modalContainer, modalImage);
        }, false);

        $('#room-availability-control').verticalBookGrid({
            startHour: <%= EmsParameters.BookStartTime.Hours %>,
            parentElement: $('#location-details'),
            isModal: false
        });
    </script>
</asp:Content>
