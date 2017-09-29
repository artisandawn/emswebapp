<%@ Import Namespace="Dea.Ems.Configuration" %>
<%@ Import Namespace="Resources" %>

<div class="modal fade" id="location-details-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h3 class="modal-title"><span><%= ScreenText.About %></span> <span data-bind="text: vems.decodeHtml(roomDescription())"></span></h3>
            </div>
            <div class="modal-body">
                <ul id="location-details-tabs" class="nav nav-tabs" role="tablist">
                    <li role="presentation" class="active location-details-tab" style="max-width: 25%;">
                        <a href="#mainContainer" aria-controls="mainContainer" role="tab" data-toggle="tab"><%= String.Format(ScreenText.RoomDetails, EmsParameters.RoomTitleSingular) %></a>
                    </li>
                    <li role="presentation" class="location-details-tab" style="max-width: 20%;">
                        <a href="#setupContainer" aria-controls="setupContainer" role="tab" data-toggle="tab" data-bind="visible: setupDetails().length > 0"><%= ScreenText.SetupTypes %></a>
                    </li>
                    <li role="presentation" class="location-details-tab" style="max-width: 20%;">
                        <a href="#featuresContainer" aria-controls="featuresContainer" role="tab" data-toggle="tab" data-bind="visible: features().length > 0"><%= ScreenText.Features %></a>
                    </li>
                    <li role="presentation" class="location-details-tab" style="max-width: 15%;">
                        <a href="#imagesContainer" aria-controls="imagesContainer" role="tab" data-toggle="tab" data-bind="visible: images().length > 0"><%= ScreenText.Images %></a>
                    </li>
                    <li role="presentation" data-bind="visible: vems.hasBrowseForSpace === 1" class="location-details-tab" style="max-width: 20%;">
                        <a href="#availabilityContainer" aria-controls="availabilityContainer" role="tab" data-toggle="tab" id="availability-tab"><%= ScreenText.Availability %></a>
                    </li>
                </ul>
                <div class="tab-content">
                    <div id="mainContainer" role="tabpanel" class="tab-pane active">
                        <table class="table table-striped">
                            <thead class="sr-only">
                                <tr>
                                    <th><%= ScreenText.Description %></th>
                                    <th><%= ScreenText.Value %></th>
                                </tr>
                            </thead>
                            <tbody data-bind="foreach: details">
                                <tr>
                                    <td data-bind="text: vems.decodeHtml(Key)"></td>
                                    <!-- ko if: Key == '<%= Resources.ScreenText.Notes %>' -->
                                    <td data-bind="html: Value"></td>
                                    <!-- /ko -->
                                    <!-- ko if: Key != '<%= Resources.ScreenText.Notes %>' -->
                                    <td data-bind="text: vems.decodeHtml(Value)"></td>
                                    <!-- /ko -->
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="setupContainer" role="tabpanel" class="tab-pane">
                        <table class="table table-striped">
                            <thead class="sr-only">
                                <tr>
                                    <th><%= ScreenText.SetupType %></th>
                                    <th><%= ScreenText.MinCapacity %></th>
                                    <th><%= ScreenText.MaxCapacity %></th>
                                </tr>
                            </thead>
                            <tbody data-bind="foreach: setupDetails">
                                <tr>
                                    <td data-bind="text: vems.decodeHtml(Description)"></td>
                                    <td data-bind="text: MinCapacity"></td>
                                    <td data-bind="text: MaxCapacity"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="featuresContainer" role="tabpanel" class="tab-pane">
                        <table class="table table-striped">
                            <thead class="sr-only">
                                <tr>
                                    <th><%= ScreenText.Description %></th>
                                </tr>
                            </thead>
                            <tbody data-bind="foreach: features">
                                <tr>
                                    <td data-bind="text: vems.decodeHtml(Description)"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="imagesContainer" role="tabpanel" class="tab-pane">
                        <div class="row" data-bind="foreach: images">
                            <div class="col-xs-6 col-md-2">
                                <a href="#" class="thumbnail" data-toggle="modal">
                                    <img data-bind="click: $parent.openImageModal.bind($data), attr: { src: 'data:image/' + FileExtension.replace('.', '') + ';base64,' + BinaryData, alt: vems.decodeHtml(Description), title: vems.decodeHtml(Description) }" alt="" data-toggle="tooltip" data-placement="bottom">
                                </a>
                            </div>
                        </div>
                    </div>
                    <div id="availabilityContainer" role="tabpanel" class="tab-pane" style="overflow-y: hidden;">
                        <div class="row" style="margin-bottom: 30px;">
                            <div class="col-sm-8 col-xs-12">
                                <div class="col-sm-3 col-xs-3">
                                    <button class="btn btn-main" type="button" id="available-previous" data-bind="click: changeAvailableDate">
                                        <i class="fa fa-chevron-left"></i>
                                        <span data-bind="text: moment(availableStartDate()).add(-1, 'day').format('ddd')"></span>
                                    </button>
                                </div>
                                <div class="col-sm-7 col-xs-6">
                                    <span style="font-size: 1.3em; display: block; text-align: center;" data-bind="text: moment(availableStartDate()).format('ddd, LL')"></span>
                                </div>
                                <div class="col-sm-2 col-xs-2">
                                    <button class="btn btn-main" type="button" id="available-next" data-bind="click: changeAvailableDate">
                                        <span data-bind="text: moment(availableStartDate()).add(1, 'day').format('ddd')"></span>
                                        <i class="fa fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-sm-4 hidden-xs">
                                <span class="float-right" style="margin-right: 15px; font-size: 1.3em;" data-bind="text: timeZoneTitle()"></span>
                            </div>
                        </div>
                        <div>
                            <div id="room-availability-control"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" id="location-details-view-all-btn" data-bind="click: viewAllDetailsClicked"><%= String.Format(ScreenText.LocationDetailsViewAllDetailsText, EmsParameters.BuildingTitleSingular, EmsParameters.RoomTitleSingular) %></button>
                <button type="button" class="btn btn-primary" id="location-details-close-btn" data-dismiss="modal"><%= ScreenText.Close %></button>
            </div>
        </div>
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

