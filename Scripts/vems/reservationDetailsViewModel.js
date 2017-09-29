function reservationDetailsViewModel(firstContactTitle, alternateContactTitle, eventNameMaxLength) {
    var self = this;
    self.FirstContactTitle = firstContactTitle;
    self.AlternateContactTitle = alternateContactTitle;

    if (!eventNameMaxLength)
        eventNameMaxLength = 255;

    $.extend(this, {
        eventName: ko.observable(),
        eventType: ko.observable(),
        TimezoneId: ko.observable(0),
        comment: ko.observable(),
        AddedContacts: ko.observableArray([]),
        ChosenGroupId: ko.observable(0),
        GroupName: ko.observable(''),
        FirstContactId: ko.observable(0),
        FirstContactName: ko.observable(),
        FirstPhoneOne: ko.observable(),
        FirstPhoneOneLabel: ko.observable(),
        FirstPhoneTwo: ko.observable(),
        FirstPhoneTwoLabel: ko.observable(),
        FirstEmail: ko.observable(),
        SecondContactId: ko.observable(0),
        SecondContactName: ko.observable(),
        SecondPhoneOne: ko.observable(),
        SecondPhoneOneLabel: ko.observable(),
        SecondPhoneTwoLabel: ko.observable(),
        SecondPhoneTwo: ko.observable(),
        SecondEmail: ko.observable(),
        attachments: ko.observableArray(),
        attendeeAttachments: ko.observableArray(),
        userDefinedFields: ko.observableArray([]),
        billingReference: ko.observable(''),
        poNumber: ko.observable(''),
        addReservationToCalendar: ko.observable(),
        termsAndConditionsAccepted: ko.observable(),
        pamSubject: ko.observable(),
        pamShowTimeAs: ko.observable(),
        pamReminder: ko.observable(),
        pamMessage: ko.observable(),
        pamPrivate: ko.observable(false),
        exchangeStates: ko.observableArray([]),
        reminderTimes: ko.observableArray([]),
        subject: ko.observable(),
        SendInvitation: ko.observable(false)
    });

    self.eventName.subscribe(function (newValue) {
        if (newValue.length > eventNameMaxLength) {
            newValue = newValue.substring(0, eventNameMaxLength - 1);
            self.eventName(newValue);
        }

        self.pamSubject(newValue);
        self.subject(newValue);
    });

    self.FirstPhoneOneLabelComputed = ko.computed(function () {
        return self.FirstContactTitle + ' ' + self.FirstPhoneOneLabel();
    });
    self.FirstPhoneTwoLabelComputed = ko.computed(function () {
        return self.FirstContactTitle + ' ' + self.FirstPhoneTwoLabel();
    });
    self.SecondPhoneOneLabelComputed = ko.computed(function () {
        return self.AlternateContactTitle + ' ' + self.SecondPhoneOneLabel();
    });
    self.SecondPhoneTwoLabelComputed = ko.computed(function () {
        return self.AlternateContactTitle + ' ' + self.SecondPhoneTwoLabel();
    });
};