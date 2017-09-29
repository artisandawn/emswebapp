/// <reference path="knockout-3.3.0.js" />
/// <reference path="jquery.min.js" />
/// <reference path="knockout.mapping-latest.js" />
var vems = vems || {};
vems.AddContacts = vems.AddContacts || {};
vems.AddContacts.searchSourceArr = [];  
vems.AddContacts.searchSource = null;  // bloodhound object
vems.AddContacts.searchStr = '';

function AddContactsViewModel(data, container) {
    var self = this;
    self.ScreenText = {};
    if (data.ScreenText &&
        data.ScreenText.AddContactsHeaderText &&
        data.ScreenText.GroupSearchPlaceHolder &&
        data.ScreenText.NameText &&
        data.ScreenText.PhoneField1Text &&
        data.ScreenText.MakeDefaultText &&
        data.ScreenText.AltPhoneText &&
        data.ScreenText.EmailText &&
        data.ScreenText.IsDefaultText &&
        data.ScreenText.ActiveText &&
        data.ScreenText.NoMatchingGroupsText)
    { self.ScreenText = data.ScreenText; }
    else {
        console.error('screen text items required in ScreenText object: RoomCodeText, RoomDescriptionText, RoomTypeText, AvailabilityText, AvailableText, UnavailableText')
    }
    self.CanSetDefaultContact = data.CanSetDefaultContact;
    self.Contacts = data.Contacts;
    self.GroupId = ko.observable();
    self.templateId = data.templateId;

    $('#add-contacts-modal .modal-header .close').after($('#' + data.helpTextElementId));

    $('#add-contacts-modal').on('hidden.bs.modal', function (e) {
        if (data.onCloseCallback) {
            data.onCloseCallback();
        }
    });

    //self.hide = function () {
    //    $('#add-contacts-modal').modal('hide');
    //    $('#add-contacts-search').typeahead('destroy');
        
    //    return false;
    //};

    self.show = function (groupId) {
        
        var originalElement = $('#add-contacts-modal').modal();
        $('#add-contacts-modal').modal('show');
        self.GroupId(groupId);
        self.GetContactsForGroup();
        self.groupSearchInit();

        return false;
    };

    self.GetContactsForGroup = function () {

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/GetContactsForGroup',
            data: '{ groupId: ' + self.GroupId() + '}',
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    ko.mapping.fromJSON(response.JsonData, {}, self.Contacts);
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
            url: vems.serverApiUrl() + '/SearchContactsForAdding',
            data: '{ searchString : \'' + typeAhead.qry.replace('\'', '\\\'') + '\', groupId: ' + self.GroupId() + '}',
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

        // re-initialize typeahead control
        $('#add-contacts-search').typeahead('destroy');
        vems.bindLoadingGifsToTypeAhead( $('#add-contacts-search').typeahead({
            minLength: 2,
            //highlight: true
        },
        {
            source: function (query, sync, async) {
                self.GetGroupsAvailableToAddForWebUser({ qry: query, asyncCall: async });
            },
            limit: 25,
            displayKey: function (result) { return vems.htmlDecode(result.Name); },
            templates: {
                suggestion: function (result) {
                    var d = $('<div>').append(vems.htmlDecode(result.Name));
                    if (result.Email && result.Email.length > 0)
                        d.append(' (' + vems.htmlDecode(result.Email) + ')');
                    return $('<div>').append(d).html();
                },
                notFound: '<div class="delegate-typeahead-notfound">' + self.ScreenText.NoMatchingGroupsText + '</div>'
            }
        }).unbind('typeahead:select').bind('typeahead:select', function (event, contact) {
            self.AddContactsToGroup(contact);
            $('#add-contacts-search').blur();
        }).unbind('typeahead:close').bind('typeahead:close', function (event, contact) {
            $('#add-contacts-search').val('');
        }) );

        $("#add-contacts-search .tt-menu").css('width', '100%');
        //$('#add-contacts-search').focus();  
    };

    self.AddContactsToGroup = function (contactObj) {

        if (contactObj && contactObj.Id) {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/AddContactToGroup',
                data: '{ groupIdAsContact : \'' + contactObj.Id + '\', groupId: \'' + self.GroupId() + '\'}',
                success: function (result) {
                    var response = JSON.parse(result.d);
                    if (response.Success) {
                        ko.mapping.fromJSON(response.JsonData, {}, self.Contacts);
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

    self.SetDefaultContact = function (contactObj) {

        if (contactObj && contactObj.Id()) {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/SetDefaultContact',
                data: '{ contactId : \'' + contactObj.Id() + '\', groupId: \'' + self.GroupId() + '\'}',
                success: function (result) {
                    var response = JSON.parse(result.d);
                    if (response.Success) {
                        ko.mapping.fromJSON(response.JsonData, {}, self.Contacts);
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

    self.ToggleContactInactive = function (contactObj) {
        if (contactObj && contactObj.Id() > 0) {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/ToggleContactInactive',
                data: '{ contactId : \'' + contactObj.Id() + '\', isActive: \'' + !contactObj.IsActive() + '\', groupId : \'' + self.GroupId() + '\'}',
                success: function (result) {
                    var response = JSON.parse(result.d);
                    if (response.Success) {
                        ko.mapping.fromJSON(response.JsonData, {}, self.Contacts);
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

    self.getContacts = function (srchString) {        
        if (!srchString)
            srchString = $("#add-contacts-search").val();

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/SearchContactsForAdding',
            data: '{searchString : \'' + srchString.replace('\'', '\\\'') + '\', groupId: ' + self.GroupId() + '}',
            success: function (result) {
                ko.mapping.fromJSON(result.d, {}, self.Contacts);
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