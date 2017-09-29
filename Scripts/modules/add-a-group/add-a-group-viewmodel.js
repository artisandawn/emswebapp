/// <reference path="knockout-3.3.0.js" />
/// <reference path="jquery.min.js" />
/// <reference path="knockout.mapping-latest.js" />
var vems = vems || {};
vems.AddGroup = vems.AddGroup || {};
vems.AddGroup.searchSourceArr = [];  
vems.AddGroup.searchSource = null;  // bloodhound object
vems.AddGroup.searchStr = '';

function AddAGroupViewModel(data, container) {
    var self = this;
    self.ScreenText = {};

    self.onClose = function () {
        if (data.onCloseCallback) {
            data.onCloseCallback(self.AddedGroups);
        }
    }

    if (data.ScreenText &&
        data.ScreenText.AddGroupsHeaderText &&
        data.ScreenText.GroupSearchPlaceHolder &&
        data.ScreenText.GroupNameText &&
        data.ScreenText.GroupTypeText &&
        data.ScreenText.CityText &&
        data.ScreenText.NoMatchingGroupsText)
    { self.ScreenText = data.ScreenText; }
    else {
        console.error('screen text items required in ScreenText object: AddGroupsHeaderText, GroupSearchPlaceHolder, GroupNameText, GroupTypeText, CityText, NoMatchingGroupsText')
    }

    $('#add-a-group-modal .modal-header .close').after($('#' + data.helpTextElementId));

    self.AddedGroups = ko.observableArray([]);
    
    self.templateId = ko.isObservable(data.templateId) ? data.templateId : ko.observable(data.templateId);

    $('#add-a-group-modal').on('hidden.bs.modal', function (e) {
        self.onClose(self.AddedGroups);
    });

    self.hide = function () {
        $('#add-a-group-modal').modal('hide');
        $('#add-group-search').typeahead('destroy');
        
        return false;
    };

    self.show = function (groups) {
        //ko.mapping.fromJS(groups, {}, self.AddedGroups);
        var originalElement = $('#add-a-group-modal').modal();
        $('#add-a-group-modal').modal('show');
                                   
        self.GetGroupsWebUserCanBookFor();
        self.groupSearchInit();

        return false;
    };

    self.GetGroupsWebUserCanBookFor = function () {
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetGroupsWebUserCanBookFor',
            data: '{ templateId: \'' + self.templateId() + '\'}',
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    //self.AddedGroups(JSON.parse(response.JsonData));
                    ko.mapping.fromJSON(response.JsonData, {}, self.AddedGroups);
                } else {
                    vems.showToasterMessage('', response.ErrorMessage, 'error');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    self.GetGroupsAvailableToAddForWebUser = function (typeAhead) {
        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetGroupsAvailableToAddForWebUser',
            data: '{ searchString : \'' + typeAhead.qry.replace('\'', '\\\'') + '\'}',
            success: function (result) {
                var response = JSON.parse(result.d);
                var temp = ko.observableArray([]);
                if (response.Success) {
                    temp = JSON.parse(response.JsonData);
                }
                else {
                    console.log(response.ErrorMessage);
                }
                typeAhead.asyncCall(temp);
                return false;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    };

    self.groupSearchInit = function () {

        $('#add-group-search').typeahead('destroy');
        vems.bindLoadingGifsToTypeAhead($('#add-group-search').typeahead({
            minLength: 3,
            //highlight: true
        },
        { //source: vems.AddGroup.searchSource.ttAdapter(),
            source: function (query, sync, async) {
                self.GetGroupsAvailableToAddForWebUser({ qry: query, asyncCall: async });
            },
            limit: 25,
            display: function (result) { return vems.htmlDecode(result.GroupName); },
            templates: {
                suggestion: function (result) {
                    return '<div>' + vems.htmlDecode(result.GroupName) + '</div>'
                },
                notFound: '<div class="delegate-typeahead-notfound">' + self.ScreenText.NoMatchingGroupsText + '</div>'
            }
        }).unbind('typeahead:select').bind('typeahead:select', function (event, group) {
            self.addGroup(group);
            $('#add-group-search').blur();
        }).unbind('typeahead:close').bind('typeahead:close', function (event, group) {
            $('#add-group-search').val('');
        }));

        $("#add-group-search .twitter-typeahead").css('display', 'inline');
        //$('#add-group-search').focus();  // re-focus on input after search
    };

    self.addGroup = function (groupObj) {

        if (groupObj && groupObj.GroupId) {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/AddGroupToUser',
                data: '{ groupId : \'' + groupObj.GroupId + '\', processTemplateId: \'' + self.templateId() + '\'}',
                success: function (result) {
                    var response = JSON.parse(result.d);
                    if (response.Success) {
                        ko.mapping.fromJSON(response.JsonData, {}, self.AddedGroups);
                    } else {
                        vems.showToasterMessage('', response.ErrorMessage, 'error');
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        }
    };

    self.removeGroupFromUser = function (groupId) {
        if (groupId && groupId() > 0) {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/RemoveGroupFromUser',
                data: '{ groupId : \'' + groupId() + '\', processTemplateId: \'' + self.templateId() + '\'}',
                success: function (result) {
                    var response = JSON.parse(result.d);
                    if (response.Success) {
                        ko.mapping.fromJSON(response.JsonData, {}, self.AddedGroups);
                    } else {
                        vems.showToasterMessage('', response.ErrorMessage, 'error');
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(thrownError);
                }
            });
        }
    };

    self.getGroups = function (srchString) {        
        if (!srchString)
            srchString = $("#add-group-search").val();

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/getGroupsJson',
            data: '{searchString : \'' + srchString + '\'}',
            success: function (result) {
                ko.mapping.fromJSON(result.d, {}, self.Groups);

            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
        return false;
    };
};

var headerTemplate = function (header, info) {
    $('<div class="text-center">').html(info.column.caption).addClass('column-header').appendTo(header);
};