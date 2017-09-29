<div class="modal fade" id="add-a-group-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h3 class="modal-title" data-bind="text: $data.ScreenText.AddGroupsHeaderText"></h3>
            </div>
            <div class="modal-body">

                <div class="row">
                    <div class="col-xs-11 col-md-11 form-group">
                        <div class="input-wrapper-for-icon" style="width: 350px; position: relative;">
                            <input class="form-control" id="add-group-search" type="search" 
                                data-bind="attr: { 'placeholder': $data.ScreenText.GroupSearchPlaceHolder }" />
                            <i class="fa fa-search input-icon-embed"></i>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-xs-12 col-md-12">
                        <div class="tab-content dx-scrollable table-responsive">
                            <%--<pre data-bind="text: ko.toJSON($data,null,2)"></pre>--%>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th data-bind="text: $data.ScreenText.GroupNameText"></th>
                                        <th data-bind="text: $data.ScreenText.GroupTypeText"></th>
                                        <th data-bind="text: $data.ScreenText.CityText"></th>
                                    </tr>
                                </thead>
                                <tbody data-bind="foreach: vems.addAGroupVM.AddedGroups">
                                    <tr style="height: 25px;">
                                        <td><a href="#" data-bind="click: function (data, event) { vems.addAGroupVM.removeGroupFromUser(data.GroupId); }, attr: { 'title': vems.addAGroupVM.ScreenText.RemoveText }"><i class="fa fa-minus-square fa-3"></i></a></td>
                                        <td data-bind="text: vems.decodeHtml($data.GroupName())"></td>
                                        <td data-bind="text: vems.decodeHtml($data.GroupType())"></td>
                                        <td data-bind="    text: vems.decodeHtml($data.GroupCity())"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="close-btn" data-dismiss="modal"><%= Resources.ScreenText.Close %></button>
                </div>
            </div>
        </div>
    </div>
</div>
