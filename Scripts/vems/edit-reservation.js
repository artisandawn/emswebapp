/// <reference path="jquery-1.4.2.min-vsdoc.js" />
var vems = vems || {};
vems.screentext = vems.screentext || {};
vems.browse = vems.browse || {};
vems.editReservation = vems.editReservation || {};


function editReservationViewModel(templateRules, reservationData, groups) {
    var self = this;
    self = ko.mapping.fromJS(reservationData);

    self.ReservationId = ko.observable(reservationData.ReservationId);
    self.EventName = ko.observable(reservationData.EventName);
    self.ReservationSummaryUrl = ko.observable(reservationData.ReservationSummaryUrl);
    self.ShowBillingReferences = ko.observable(reservationData.ShowBillingReferences);
    self.ShowPONumber = ko.observable(reservationData.ShowPONumber);

    self.templateRules = ko.observable(templateRules);
    self.templateId = ko.observable(templateRules.ProcessTemplateId);
    self.Groups = ko.mapping.fromJS(groups);
    self.AddedGroups = ko.observableArray([]);
    self.Contacts = ko.observableArray([]);
    self.AltContacts = ko.observableArray([]);
    //self.bookings = ko.mapping.fromJS(reservationData.Bookings);
    self.setupTypeValidation = ko.observable();

    self.reservationDetails = new reservationDetailsViewModel(vems.screentext.FirstContactTitle, vems.screentext.AlternateContactTitle, vems.editReservation.eventNameMaxLength);
    if (reservationData.Details) {
        ko.mapping.fromJS(reservationData.Details, {}, self.reservationDetails);
        self.reservationDetails.eventName(vems.decodeHtml(reservationData.Details.EventName));
        self.reservationDetails.eventType(reservationData.Details.EventTypeId);
        self.reservationDetails.ChosenGroupId(reservationData.Details.GroupId);

        self.reservationDetails.FirstContactName(vems.decodeHtml(reservationData.Details.FirstContactName));
        self.reservationDetails.FirstPhoneOne(vems.decodeHtml(reservationData.Details.FirstPhoneOne));
        self.reservationDetails.FirstPhoneTwo(vems.decodeHtml(reservationData.Details.FirstPhoneTwo));
        self.reservationDetails.FirstEmail(vems.decodeHtml(reservationData.Details.FirstEmail));

        self.reservationDetails.SecondContactName(vems.decodeHtml(reservationData.Details.SecondContactName));
        self.reservationDetails.SecondPhoneOne(vems.decodeHtml(reservationData.Details.SecondContactPhoneOne));
        self.reservationDetails.SecondPhoneTwo(vems.decodeHtml(reservationData.Details.SecondContactPhoneTwo));
        self.reservationDetails.SecondEmail(vems.decodeHtml(reservationData.Details.SecondContactEmail));

        self.reservationDetails.billingReference(vems.decodeHtml(reservationData.Details.BillingReference));
        self.reservationDetails.poNumber(vems.decodeHtml(reservationData.Details.PoNumber));
        self.reservationDetails.TimezoneId(reservationData.Details.TimezoneId);

        self.reservationDetails.comment(vems.decodeHtml(reservationData.Details.Comment));
    }

    self.breadcrumbText = ko.observable(reservationData.Details.EventName);

    self.ContactTitleComputed = ko.computed(function () {
        if (self.reservationDetails.CourseId() > 0)
            return vems.screentext.InstructorTitle;
        else
            return vems.screentext.FirstContactTitle;        
    });

    self.onCloseContactsModal = function () {
        self.getContactsForGroup(self.reservationDetails.ChosenGroupId(), self.templateId());
    };
    self.onCloseAddGroup = function (groups) {
        ko.mapping.fromJS(groups, {}, self.Groups);
        //self.Groups(groups);
    };
    self.reservationDetails.ChosenGroupId.subscribe(function (newValue) {
        self.setGroupContacts(newValue);
    });

    self.setGroupContacts = function (newValue) {
        if (newValue && newValue > 0) {
            self.getContactsForGroup(newValue, self.templateRules().ProcessTemplateId);

            if ($("#PONumber").data('ems_poLookup') != undefined)
                $("#PONumber").data('ems_poLookup').groupId = newValue; //make sure plugin gets updated Groupid

            if ($("#billingReference").data('ems_BillingRefLookup') != undefined)
                $("#billingReference").data('ems_BillingRefLookup').groupId = newValue; //make sure plugin gets updated Groupid
        }
    };

    self.getContactsForGroup = function (groupId, templateId, origChoice) {
        var origChoice = self.reservationDetails.FirstContactId();
        var grp;
        $.grep(self.Groups(), function (c) {
            if (c.GroupId() === groupId) {
                grp = c;
                return true;
            }
            return false;
        });
        if (groupId && groupId > 0) {
            vems.ajaxPost({
                url: vems.serverApiUrl() + '/GetContactsForGroupTemplate',
                data: JSON.stringify({ groupId: groupId, templateId: templateId, contactsRequired: grp.ContactsRequired() }),
                success: function (result) {
                    var response = JSON.parse(result.d);
                    self.Contacts(response.Contacts);
                    self.AltContacts(response.AlternateContacts);

                    // force update of contact info
                    var origContactId = self.reservationDetails.FirstContactId();
                    self.reservationDetails.FirstContactId(grp.ContactId() === 0 && self.Contacts().length > 0 ? self.Contacts()[0].Id : grp.ContactId());
                    if (origContactId === self.reservationDetails.FirstContactId()) {
                        self.reservationDetails.FirstContactId.valueHasMutated();
                    }
                }
            });
        }
    };

    self.setFirstContactInfo = function (newValue) {
        if (self.Contacts() && self.Contacts().length > 0) {
            var contact = $.grep(self.Contacts(), function (c) {
                return (c.Id == newValue);
            });

            if ($.isArray(contact) && contact.length > 0) {
                self.reservationDetails.FirstContactName(vems.decodeHtml(contact[0].Name));
                self.reservationDetails.FirstPhoneOne(vems.decodeHtml(contact[0].PhoneOne));
                self.reservationDetails.FirstPhoneTwo(vems.decodeHtml(contact[0].PhoneTwo));
                self.reservationDetails.FirstPhoneOneLabel(vems.decodeHtml(contact[0].PhoneOneLabel));
                self.reservationDetails.FirstPhoneTwoLabel(vems.decodeHtml(contact[0].PhoneTwoLabel));
                self.reservationDetails.FirstEmail(vems.decodeHtml(contact[0].Email));
            }
        } else {
            var chosenGroup = $.grep(self.Groups(), function (grp) {
                return grp.GroupId() === self.reservationDetails.ChosenGroupId();
            })[0];

            self.reservationDetails.FirstContactName(vems.decodeHtml(chosenGroup.GroupName()));
            self.reservationDetails.FirstPhoneOne(vems.decodeHtml(chosenGroup.GroupPhone()));
            self.reservationDetails.FirstPhoneTwo(vems.decodeHtml(chosenGroup.GroupFax()));
            self.reservationDetails.FirstPhoneOneLabel(vems.decodeHtml(chosenGroup.GroupPhoneLabel()));
            self.reservationDetails.FirstPhoneTwoLabel(vems.decodeHtml(chosenGroup.GroupFaxLabel()));
            self.reservationDetails.FirstEmail(vems.decodeHtml(chosenGroup.GroupEmail()));
        }
    };

   
    self.setSecondContactInfo = function (newValue) {
        if (self.AltContacts() && self.AltContacts().length > 0) {
            var contact = $.grep(self.AltContacts(), function (c) {
                return (c.Id == newValue);
            });
            if ($.isArray(contact) && contact.length > 0) {
                self.reservationDetails.SecondContactName(vems.decodeHtml(contact[0].Name));
                self.reservationDetails.SecondPhoneOne(vems.decodeHtml(contact[0].PhoneOne));
                self.reservationDetails.SecondPhoneTwo(vems.decodeHtml(contact[0].PhoneTwo));
                self.reservationDetails.SecondPhoneOneLabel(vems.decodeHtml(contact[0].PhoneOneLabel));
                self.reservationDetails.SecondPhoneTwoLabel(vems.decodeHtml(contact[0].PhoneTwoLabel));
                self.reservationDetails.SecondEmail(vems.decodeHtml(contact[0].Email));
            }
        }
    };
    self.reservationDetails.SecondContactId.subscribe(function (newValue) {
        if (newValue != 0)
            self.setSecondContactInfo(newValue);
    });

    self.saveReservationDetails = function () {

        var reservationDetailsValid = self.validateReservationDetails();
        //var reservationValid = self.validateReservation();

        if (!reservationDetailsValid)
            return false;

        //vems.pageLoading(true);
        $('#editReservationContainer').find('.events-loading-overlay').show();

        var data = {
            reservationId: 0,
            templateId: self.templateId(),
            reservationDetails: buildReservationDetailsForSave(),
            udfs: self.userDefinedFields.getUdfsForSave()
        }

        vems.ajaxPost({
            url: vems.serverApiUrl() + '/SaveReservationDetails',
            data: JSON.stringify(data),
            success: function (result) {
                var response = JSON.parse(result.d);
                if (response.Success) {
                    //vems.showToasterMessage('', response.SuccessMessage, 'success');                  
                    window.location.href = DevExpress.devices.real().phone ? "Default.aspx" : self.ReservationSummaryUrl();
                }
                else {
                    var msgArr = response.ErrorMessage.split('\n');
                    for (i = 0; i <= msgArr.length - 1; i++) {
                        vems.showErrorToasterMessage(msgArr[i]);
                    }
                    $('#editReservationContainer').find('.events-loading-overlay').hide();
                }
            },
            error: function () {
                $('#editReservationContainer').find('.events-loading-overlay').hide();
            },
            complete: function () {
                
            }
        });
    }

    self.validateReservationDetails = function (validateCoreOnly) {
        var errMsgArr = [];
        if (self.reservationDetails.eventName() == undefined || self.reservationDetails.eventName().length === 0) {
            errMsgArr.push(vems.screentext.IsRequiredMessage.replace('{0}', $('[for=event-name]').eq(0).text()));
        }

        if ($('#event-type').val() == null || $('#event-type').val().length === 0 || $('#event-type').val() == 0)
            errMsgArr.push(vems.screentext.IsRequiredMessage.replace('{0}', $('[for=event-type]').eq(0).text()));

        if (!validateCoreOnly) {
            if ($('#availablegroups').val() == null || ($('#availablegroups').val() != null && $('#availablegroups').val().length === 0))
                errMsgArr.push(vems.screentext.IsRequiredMessage.replace('{0}', $('[for=availablegroups]').text()));

            // handle required contact phone/email (when necessary)
            if ($("#1stContactPhone1").attr('required') == 'required' && !$.trim($('#1stContactPhone1').val())) {
                errMsgArr.push(vems.screentext.IsRequiredMessage.replace('{0}', $('[for=1stContactPhone1]').text()));
            }
            if ($("#1stContactEmail").attr('required') == 'required' && !$.trim($('#1stContactEmail').val())) {
                errMsgArr.push(vems.screentext.IsRequiredMessage.replace('{0}', $('[for=1stContactEmail]').text()));
            }

            //handle temporary contacts, 
            if ($('#1stcontact').val() == 0 && $("#1stContactName").attr('required') == 'required' &&
                ($.trim($('#1stcontact option:selected').text()) === $.trim($("#1stContactName").val()) || $.trim($('#1stContactName').val()) == ""))
                errMsgArr.push(vems.screentext.IsRequiredMessage.replace('{0}', $('[for=1stContactName]').text()));

            if ($('#2ndcontact').val() == 0 &&
                ($.trim($('#2ndcontact option:selected').text()) === $.trim($("#2ndContactName").val()) || $.trim($('#2ndContactName').val()) == ""))
                errMsgArr.push(vems.screentext.IsRequiredMessage.replace('{0}', $('[for=2ndContactName]').text()));

            //if ($('#terms-and-conditions').length === 1 && $('#terms-and-conditions').prop('checked') != true)
            //    errMsgArr.push(vems.screentext.IsRequiredMessage.replace('{0}', $('#terms-and-conditions').parent().find('a').text()))

            $.each($('#udf-container [required=required]:visible'), function (i, v) {
                if ($(v).hasClass('multiselect-container')) {
                    if ($(v).find('.multiselect-value-label').text().length == 0) {
                        var udfReqMsg = vems.screentext.IsRequiredMessage.replace('{0}', $(v).parent().find('label').eq(0).text());
                        if (errMsgArr.indexOf(udfReqMsg) === -1) {
                            errMsgArr.push(udfReqMsg);
                        }
                    }
                } else if (!$(v).val() || $(v).val().length == 0) {
                    var labelText = $(v).parent().hasClass('date') ? $(v).parent().parent().find('label').text() : $(v).parent().find('label').text();
                    var udfReqMsg = vems.screentext.IsRequiredMessage.replace('{0}', labelText);
                    if (errMsgArr.indexOf(udfReqMsg) === -1) {
                        errMsgArr.push(udfReqMsg);
                    }
                }
            });
        }

        if (errMsgArr.length === 0)
            return true;
        else {
            var reqErrMsg = '';
            $.each(errMsgArr, function (idx, err) {
                reqErrMsg += err;
                if (idx < errMsgArr.length - 1) {
                    reqErrMsg += '<br/><br/>';
                }
            });
            if (reqErrMsg) {
                vems.showToasterMessage('', reqErrMsg, 'danger');
                return false;
            }
            return false;
        }
    };

    function buildReservationDetailsForSave() {
        return {
            EventName: self.reservationDetails.eventName(),
            EventTypeId: self.reservationDetails.eventType(),
            Comment: self.reservationDetails.comment(),
            GroupId: self.reservationDetails.ChosenGroupId(),
            FirstContactId: self.reservationDetails.FirstContactId(),
            FirstContactName: self.reservationDetails.FirstContactName(),
            FirstPhoneOne: self.reservationDetails.FirstPhoneOne(),
            FirstPhoneTwo: self.reservationDetails.FirstPhoneTwo(),
            FirstEmail: self.reservationDetails.FirstEmail(),
            SecondContactId: self.reservationDetails.SecondContactId(),
            SecondContactName: self.reservationDetails.SecondContactName(),
            SecondContactPhoneOne: self.reservationDetails.SecondPhoneOne(),
            SecondContactPhoneTwo: self.reservationDetails.SecondPhoneTwo(),
            SecondContactEmail: self.reservationDetails.SecondEmail(),
            BillingReference: self.reservationDetails.billingReference() == 0 ? '' : self.reservationDetails.billingReference(), //ensure 0's are converted to empty string
            PoNumber: self.reservationDetails.poNumber() == 0 ? '' : self.reservationDetails.poNumber(),
            //AddReservationToCalendar: self.reservationDetails.addReservationToCalendar(),
            //TermsAndConditionsAccepted: self.reservationDetails.termsAndConditionsAccepted(),
            //SendInvitation: self.reservationDetails.SendInvitation(),
            TimezoneId: self.reservationDetails.TimezoneId(),
            //PamMessage: self.reservationDetails.pamMessage(),
            //PamPrivate: self.reservationDetails.pamPrivate(),
            //PamReminder: self.reservationDetails.pamReminder(),
            //PamShowTimeAs: self.reservationDetails.pamShowTimeAs(),
            //PamSubject: self.reservationDetails.pamSubject(),
            //Attendees: ko.toJS(self.attendees.attendeeList())
        };
    }

    return self;
}


