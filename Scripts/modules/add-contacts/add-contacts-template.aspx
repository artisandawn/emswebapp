<div class="modal fade" id="add-contacts-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h3 class="modal-title" data-bind="text: $data.ScreenText.AddContactsHeaderText"></h3>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-xs-11 col-md-11 form-group">
                        <div class="input-wrapper-for-icon" style="width: 350px; position: relative;">
                            <input class="form-control" id="add-contacts-search" type="search" data-bind="attr: { 'placeholder': $data.ScreenText.GroupSearchPlaceHolder }" />
                            <i class="fa fa-search input-icon-embed"></i>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-12 col-md-12">
                        <div class="dx-scrollable">
                            <table class="table table-striped" style="width: 100%">
                                <thead>
                                    <tr>
                                        <th style="width: 10%"></th>
                                        <th data-bind="text: $data.ScreenText.NameText"></th>
                                        <th data-bind="text: $data.ScreenText.EmailText"></th>
                                        <th data-bind="visible: $data.CanSetDefaultContact, text: $data.ScreenText.MakeDefaultText" style="width: 10%"></th>
                                    </tr>
                                </thead>
                                <tbody data-bind="foreach: vems.addAContactVM.Contacts">
                                    <tr style="height: 25px;">
                                        <td>
                                            <input type="checkbox" data-bind="checked: $data.IsActive, click: function (data, event) { vems.addAContactVM.ToggleContactInactive(data); }, attr: { 'title': vems.addAContactVM.ScreenText.RemoveText }" /></td>
                                        <td>
                                            <div style="width: 220px" class="mobile-ellipsis-text" data-bind="text: $data.Name"></div>
                                        </td>
                                        <td>
                                            <div style="width: 220px" class="mobile-ellipsis-text" data-bind="text: $data.Email"></div>
                                        </td>
                                        <td data-bind="visible: vems.addAContactVM.CanSetDefaultContact">
                                            <input type="radio" name="isDefaultRadio"
                                                data-bind="checked: $data.IsDefault, checkedValue: true, click: function (data, event) { vems.addAContactVM.SetDefaultContact(data); }" /></td>
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
