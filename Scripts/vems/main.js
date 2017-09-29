/// <reference path="../Scripts/knockout-3.3.0.js" />
/// <reference path="../Scripts/moment.js" />
/// <reference path="jquery.min.js" />
var Dea = Dea || {};
Dea.eventsForMonth = Dea.eventsForMonth || [];

var vems = vems || {};
vems.serverApiUrl = function () {
    return 'ServerApi.aspx';
};
vems.screenText = {};

var nameColorArray = ['#DBCF28', '#F8A01D', '#E12626', '#940A0A', '#7B5546', '#0C6FAE', '#1CACEE', '#00942A'];
var vm;
var menuVM;
var MAX_MOBILE_WIDTH = 700;


$(document).ready(function () {
    if (DevExpress.devices.real().phone) {
        $('#menu-admin-anchor').hide();  // don't display admin functionality when using a phone
        $('#nav-logo-img').attr('src', 'Images/' + mobileLogo);  // change to 1-letter logo on phone
        $('#menu-user-name').hide();  // hide full user name in phone view
    }

    ko.bindingHandlers.checkinAnchorText = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            if (bindingContext.$data.IsCheckedIn) {
                setToCheckedIn(element);
            }
            else {
                $(element).find('.text').first().text(vems.screenText.checkinText);
            }
        }
    };

    vm = new MyEventsVM();
    menuVM = new MenuViewModel();

    ko.applyBindings(menuVM, $('#menu-wrapper')[0]);

    if ($('#menu-name-container').length > 0) {
        ko.applyBindings(menuVM, $('#menu-name-container')[0]);
    }

    if ($('#wpt-buttons').length > 0 && menuVM.templateMenuItems().length > 0) {
        $('#wpt-buttons').css('visibility', 'visible');

        ko.applyBindings(menuVM, $('#wpt-buttons')[0]);

        if ($('.action-btn-components').length > 0) {
            if ($('.action-btn-component-item').length > 5) {
                $('.action-btn-components').height(350);
            } else {
                $('.action-btn-components').height($('.action-btn-component-item').length * 75);
            }

            Ps.initialize($('.action-btn-components')[0], { suppressScrollX: true }); // setup PerfectScrollbar and avoid X scroll

            $('.action-btn-components > .ps-scrollbar-x-rail').hide();
            $('.action-btn-components > .ps-scrollbar-y-rail').hide();

            var scrollInterval;
            var scrollSpeed = 150;
            var scrollDistance = 75;

            $(document).on('mousedown', '.action-btn-components-up', function () {
                $('.action-btn-components').scrollTo($('.action-btn-components').scrollTop() - scrollDistance);

                scrollInterval = setInterval(function () {
                    $('.action-btn-components').scrollTo($('.action-btn-components').scrollTop() - scrollDistance, scrollSpeed);
                }, scrollSpeed);
            });


            $(document).on('mouseup', '.action-btn-components-up', function () {
                clearInterval(scrollInterval);
            });

            $(document).on('mousedown', '.action-btn-components-down', function () {
                $('.action-btn-components').scrollTo($('.action-btn-components').scrollTop() + scrollDistance);

                scrollInterval = setInterval(function () {
                    $('.action-btn-components').scrollTo($('.action-btn-components').scrollTop() + scrollDistance, scrollSpeed);
                }, scrollSpeed);
            });

            $(document).on('mouseup', '.action-btn-components-down', function () {
                clearInterval(scrollInterval);
            });
        }

        if (menuVM.templateMenuItems().length === 1) { // Single template click event on the big button
            $('.action-btn-circle').on('click', function () {
                if (menuVM.templateMenuItems()[0].NavigateUrl.length > 0) {
                    window.location = menuVM.templateMenuItems()[0].NavigateUrl;
                }
            });
        }
    }

    if ($('#leftMenuCalendar').length > 0) {
        ko.applyBindings(vm, $('#leftMenuCalendar')[0]);
    }

    $('#myRequestCalendar').dxCalendar({
        value: new Date(),
        min: new Date(1990, 0, 1),
        max: new Date(2150, 0, 1),
        height: '260px',
        width: '260px',
        onOptionChanged: function (data) {
            if (data.name === 'currentDate') {
                vm.monthDate(data.value);
                getDatesWithEventsForMonth(data.value);
            }
        },
        onValueChanged: function (data) {
            if ($('.event-item-container').infiniteScroller().isLoading()) {
                return;
            }

            $('.event-item-container').infiniteScroller().disableHandler(true);
            $('.event-item-container').scrollTop(1);
            $('.event-item-container').infiniteScroller().disableHandler(false);

            vm.calendarDate(data.value);
            getCalendarData(data.value);

            $('.event-item-container').infiniteScroller('dataMap', [{ value: vm.calendarDate(), isIncremental: true, incrementSize: 1 }]);
        },
        cellTemplate: function (data, index, element) {
            var calendarDate = moment($(element).data('value'));

            var container = $('<div>').addClass('calendar-cell-container');
            container.append($('<div>').addClass('calendar-text').text(data.text));
            container.append($('<div>').addClass('calendar-circle'));

            if (!isNaN(parseInt(data.text, 10)) && hasEventsOnDate(calendarDate)) {
                container.addClass('calendar-event-indicator');
            }

            if (element.hasClass('dx-calendar-today')) {
                container.append($('<span>').addClass('fa fa-circle calendar-today-indicator').css('font-size', '.5em'));
            }

            var holiday = getHolidayOnDate(calendarDate);

            if (holiday !== undefined && holiday.length > 0) {
                container.addClass('holiday');

                if (holiday.length === 1) {
                    container.attr('title', holiday[0].Description);
                } else {
                    container.attr('title', ems_MultipleHolidaysLabel);
                }
            }

            return container;
        }
    }).dxCalendar('instance');

    $('#menu-initials').css('background-color', getNameColor($('#menu-name').text().trim())).text(findInitials($('#menu-name').text().trim()));

    $('.my-requests-curtain').curtain({
        openBegin: function () {
            $('.my-requests-curtain .collapsed-icon').css('top', '0px');
            $('.my-requests-curtain').children().not('.curtain-anchor, .collapsed-icon').show();
        },
        closeBegin: function () {
            $('.my-requests-curtain').children().not('.curtain-anchor, .collapsed-icon').hide();
        },
        closeEnd: function () {
            if (!$('.my-requests-curtain').data('calendarIcon')) {
                var iconCss = {
                    position: 'absolute',
                    top: '0px',
                    left: '15px',
                    color: '#F0F0F0',
                    fontSize: '20px',
                    opacity: '0.5'
                };
                var icon = $('<div class="collapsed-icon vems-slide"><i class="fa fa-calendar-o"></i></div>').css(iconCss);
                icon.click(function () { $('.my-requests-curtain').curtain().toggle(); });
                $('.my-requests-curtain').prepend(icon);
                $('.my-requests-curtain').data('calendarIcon', true);
            } else {
                $('.my-requests-curtain .collapsed-icon').css('top', '55px');
            }
        }
    });

    $('.my-requests-calendar-container').curtain({
        direction: 'btt',
        closedSize: 75,
        anchor: {
            class: 'curtain-anchor btn btn-circle-down',
            hoverClass: 'btn-circle-down-hover',
            icon: 'chevron-up',
            fadeInSpeed: '.25s',
            css: {
                position: 'absolute',
                top: 394,
                left: '50%',
                zIndex: 1
            }
        },
        openBegin: function () {
            $('#myRequestCalendar').height(260).unbind('click').find('.dx-button-has-icon').children().show();
        },
        openEnd: function () {
            $('.event-item-container').css('height', 'calc(100% - ' + ($('.my-requests-calendar-container').height() + 90) + 'px)');
        },
        closeBegin: function () {
            $('#myRequestCalendar').height(0);
            $('#myRequestCalendar').addClass('vems-slide').find('.dx-button-has-icon').children().hide();
            $('#myRequestCalendar').on('click', function (event) { event.stopPropagation(); });
        },
        closeEnd: function () {
            $('.event-item-container').css('height', 'calc(100% - ' + ($('.my-requests-calendar-container').height() + 90) + 'px)');
        }
    });

    $('.event-item-container').perfectScrollbar();
    $('.default-page-help-text').perfectScrollbar();

    $('.event-item-container').infiniteScroller({
        url: vems.serverApiUrl() + '/SetMyRequestDataVar',
        dataMap: [{
            value: vm.calendarDate(),
            isIncremental: true,
            incrementSize: 1
        }],
        visibleElementClass: 'event-date[data-date="' + moment(vm.calendarDate()).hours(0).minutes(0).seconds(0).format() + '"]',
        visibleElementTrigger: function (element, direction) {
            var loading = $('.event-item-container').infiniteScroller().isLoading();

            if (loading) {
                return;
            }

            var date = moment(element.data().date);
            var currentDate = moment(vm.calendarDate());
            var actionDate = date.clone();

            if (date.diff(currentDate, 'Date') !== 0) {
                $('#myRequestCalendar').data('dx-calendar').option('value', date.toDate());

                var prevDay = moment(actionDate.subtract(1, 'days')).hours(0).minutes(0).seconds(0).format();
                var nextDay = moment(actionDate.add(2, 'days')).hours(0).minutes(0).seconds(0).format();

                var selector = direction === 'up' ? prevDay : nextDay;

                vm.calendarDate(date.toDate());

                $('.event-item-container').infiniteScroller('visibleElementClass', 'event-date[data-date="' + selector + '"]');
                $('.event-item-container').infiniteScroller('dataMap', [{ value: vm.calendarDate(), isIncremental: true, incrementSize: 1 }]);
            }
        },
        successCallback: function (result, isIncrement) {
            var json = JSON.parse(result.d);
            var newDate = moment(json[0].Date);
            var actionDate = newDate.clone();
            var scrollTop = $('.event-item-container').scrollTop();
            vm.calendarDate(newDate.toDate());
            var prevDay = moment(actionDate.subtract(1, 'days')).hours(0).minutes(0).seconds(0).format();
            var nextDay = moment(actionDate.add(2, 'days')).hours(0).minutes(0).seconds(0).format();


            if (vm.myEvents().map(function (item) { return item.Date; }).indexOf(json[0].Date) > -1) {
                var scrollAdjustment = scrollTop === 0 ? scrollTop + 1 : scrollTop - 1;
                $('.event-item-container').scrollTop(scrollAdjustment);
                return;
            }

            if (isIncrement) {
                $('.event-item-container').infiniteScroller('visibleElementClass', 'event-date[data-date="' + nextDay + '"]');
                vm.myEvents.push(json[0]);
                $('.event-item-container').scrollTop(scrollTop + 22);
            } else  {
                $('.event-item-container').infiniteScroller('visibleElementClass', 'event-date[data-date="' + prevDay + '"]');
                vm.myEvents.unshift(json[0]);
                $('.event-item-container').scrollTop(1);

            }

            $('#myRequestCalendar').data('dx-calendar').option('value', moment(vm.calendarDate()));

        }
    });

    buildSideBarMenu();
    buildTopMenu($('#menu-users'), $('#menu-name'));
    buildTopMenu($('#menu-admin'), $('#menu-admin-anchor'));
    buildTopMenu($('#menu-help'), $('#menu-help-anchor'));

    buildHelpTooltips();
    if (outMsg) { vems.showPopup(outMsgTitle, outMsg); }
});

function buildHelpTooltips() {
    $('.help-text').each(function () {
        $(this).before('<i class="help-text-icon fa fa-info-circle"></i>');
        var popover = $(this).dxPopover({
            target: $(this).prev(),
            width: '280'
        }).dxPopover('instance');
        $(this).prev().unbind().hover(function () { popover.show(); $(this).prev().css('color', '#0C6FAE'); },
                            function () { popover.hide(); $(this).prev().css('color', 'inherit'); });
    });
}

function findInitials(name) {
    if (name.length === 0) {
        return '';
    }

    var space = name.split(' ');
    var comma = name.split(',');

    if (space.length > 1) {
        return space[0][0].toUpperCase() + space[1][0].toUpperCase();
    }

    if (comma.length > 1) {
        return comma[0][0].toUpperCase() + comma[1][0].toUpperCase();
    }

    return name[0].toUpperCase();
}

function getNameColor(name) {
    return nameColorArray[name.length % nameColorArray.length];
}

var MyEventsVM = function () {
    var self = this;
    self.calendarDate = ko.observable(new Date());
    self.monthDate = ko.observable(new Date());
    self.myEvents = ko.observableArray(Dea.todaysEventsForUser);

    self.buildMyRequestDateHeader = function (date) {
        var calendarDate = moment(date).calendar().split(' ')[0];
        var longDate = moment(date).format('dddd, MMMM Do YYYY');

        return moment(date).isAfter(moment(), 'week') || moment(date).isBefore(moment(), 'day') ? longDate : calendarDate;
    };

    self.animateEvent = function (elements) {
        var elm = $(elements[1]);
        var data = ko.contextFor(elements[1]);
        var index = data.$index();
        var time = index * 75;
        var now = moment();
        var eventdate = moment(data.$data.EventEnd);
        if (eventdate.diff(now) < 0) {
            elm.addClass('pastevent');
        }
        setTimeout(function () {
            elm.show().addClass('vems-animate vems-zoomIn');
        }, time);
    };

    self.showDrawer = function (data, event) {
        var eventdate = moment(data.EventEnd);
        if (eventdate.diff(moment()) >= 0) {
            if (event.type.indexOf('touch') !== -1) {
                return;
            }

            var drawerItems = $(event.currentTarget).find('.drawer-actions');
            showDrawer(drawerItems);
        }
    };

    self.hideDrawer = function (data, event) {
        var drawerItems = $(event.currentTarget).find('.drawer-actions');
        hideDrawer(drawerItems);
    };

    function showDrawer(element) {
        element.css('display', 'block');
        element.stop().animate({ width: DevExpress.devices.real().phone ? 220 : 230 }, 300);
        element.parent().siblings('.drawer-overlay').stop().animate({ opacity: 0.8 }, 200);

        element.siblings('.drawer-anchor').css('box-shadow', '0 1px 0 #808080');
        element.siblings('.drawer-anchor').children().removeClass('fa-chevron-left').addClass('fa-chevron-right');
    }

    function hideDrawer(element) {
        element.stop().animate({ width: 0 }, 300, function () {
            element.css('display', 'none');
        });

        element.parent().siblings('.drawer-overlay').stop().animate({ opacity: 0 }, 200);

        element.siblings('.drawer-anchor').css('box-shadow', '');
        element.siblings('.drawer-anchor').children().removeClass('fa-chevron-right').addClass('fa-chevron-left');
    }

    self.clickStartX = 0;
    self.clickStartY = 0;
    // prevent click event when scrolling through events on mobile device
    self.eventClickStart = function (data, event) {
        self.clickStartX = event.clientX;
        self.clickStartY = event.clientY;
    };

    self.eventClickEnd = function (data, event) {
        var xDistance = Math.abs(self.clickStartX - event.clientX);
        var yDistance = Math.abs(self.clickStartY - event.clientY);

        if (xDistance < 30 && yDistance < 30) {
            var drawerItems = $(event.currentTarget).find('.drawer-actions');
            showDrawer(drawerItems);
        }
    };

    self.goToSummary = function (data) {
        window.location = data.ReservationSummaryUrl;
    };

    self.getTime = function (date) {
        if (Object.prototype.toString.call(date) === '[object Date]') {
            return date.getTime();
        } else {
            var d = moment(date);
            return d.valueOf();
        }
    };

    self.cancelReason = 0;
    self.cancelNotes = '';
    self.notesRequired = false;
    self.cancel = function (data) {
        var content = $('#cancelPopupTemplate');
        vems.showPopup('Cancel Booking', content.html(), [{ text: 'UNDO' },
            { text: 'CONFIRM', onClick: function () { return self.cancelBooking(data); } }]);

        $('#cancelReason').dxSelectBox({
            dataSource: Dea.cancelReasons,
            displayExpr: 'Reason',
            valueExpr: 'Id',
            showClearButton: false,
            placeholder: '',
            width: '250px',
            onValueChanged: function (data) {
                self.cancelReason = data.value;
                self.notesRequired = $.grep(Dea.cancelReasons, function (reason) {
                    return reason.Id === data.value;
                })[0].RequireNotes;
                // reset validation when switching to a reason that doesn't require notes
                if (!self.notesRequired) { DevExpress.validationEngine.validateGroup('cancel'); }
            }
        }).dxValidator({
            validationRules: [{
                type: 'custom',
                reevaluate: true,  // required to perform correct validation when switching reasons
                message: 'Cancel Reason is required',
                validationCallback: function () {
                    return !data.RequiresCancelReason || self.cancelReason;
                }
            }],
            validationGroup: 'cancel'
        });

        $('#cancelNotes').dxTextArea({
            maxLength: 255,
            height: $('#cancelReason').height() * 3,
            width: $('#cancelReason').width() + 2,  // account for border on select box
            onValueChanged: function (data) {
                self.cancelNotes = data.value;
            }
        }).dxValidator({
            validationRules: [{
                type: 'custom',
                reevaluate: true,  // required to perform correct validation when switching reasons
                message: vems.screenText.cancelNotesRequiredMessage,
                validationCallback: function () {
                    return !self.notesRequired || self.cancelNotes;
                }
            }],
            validationGroup: 'cancel'
        });
    };
    self.cancelBooking = function (booking) {
        var validator = DevExpress.validationEngine.validateGroup('cancel');
        if (!validator.isValid) {
            var invalidControl = validator.brokenRules[0].validator._$element.find('input');
            invalidControl = invalidControl.length > 0 ? invalidControl : validator.brokenRules[0].validator._$element.find('textarea');
            invalidControl.focus();
            return false;
        }

        vems.ajaxPost(
        {
            url: vems.serverApiUrl() + '/CancelBooking',
            data: '{reservationId : ' + booking.ReservationId
                + ', bookingId : ' + booking.Id
                + ', cancelReason : ' + self.cancelReason
                + ', cancelNotes : \'' + self.cancelNotes + '\'}',
            success: function () {
                // refresh events to capture updated statuses
                getCalendarData(self.calendarDate());
                vems.showPopup('', vems.screenText.cancelSuccessMessage);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                return false;
            }
        });
    };

    self.checkIn = function (data, event) {
        vems.toggleCheckIn(data.GroupId,
            data.BuildingId,
            data.Id)
        .done(function (data) {
            var b = JSON.parse(data.d);
            if (b.IsCheckedIn) {
                setToCheckedIn(event.currentTarget);
                vems.showPopup('', vems.screenText.checkedInText);
            }
        })
        .error(function (msg) { vems.showErrorMessage(msg); });
    };

    self.endNow = function (data) {
        vems.showPopup('End Booking Now', vems.screenText.endNowConfirmPrompt, [{ text: 'UNDO' },
            { text: 'CONFIRM', onClick: function () { self.endBookingNow(data); } }]);
    };
    self.endBookingNow = function (booking) {
        vems.ajaxPost(
        {
            url: vems.serverApiUrl() + '/EndBookingNow',
            data: '{reservationId : ' + booking.ReservationId
                + ', bookingId : ' + booking.Id + '}',
            success: function () {
                // refresh events to capture updated statuses and end times
                getCalendarData(self.calendarDate());
                vems.showPopup('', vems.screenText.endNowConfirmationMessage);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                return false;
            }
        });
    };
};

function setToCheckedIn(anchorElement) {
    $(anchorElement).text(vems.screenText.checkedInText);
    $(anchorElement).unbind('click');
    $(anchorElement).css('text-decoration', 'none').css('cursor', 'default');
}

var MenuViewModel = function () {
    var self = this;

    self.isAuthenticatedUser = ko.observable($('#menu-name').data('authedUserMenu'));
    self.menuItems = ko.observableArray(window.menuJSON);
    self.loginLink = ko.observable({});

    self.clickStartX = 0;
    self.clickStartY = 0;

    self.menuItemClickStart = function (data, event) {
        self.clickStartX = event.clientX;
        self.clickStartY = event.clientY;
    };
    self.menuItemClickEnd = function (data, event) {
        var xDistance = Math.abs(self.clickStartX - event.clientX);
        var yDistance = Math.abs(self.clickStartY - event.clientY);

        if (xDistance < 30 && yDistance < 30 && data.NavigateUrl.length > 0) {
            window.location = data.NavigateUrl;
        }
    };

    self.templateMenuItems = ko.pureComputed(function () {
        var menuItems = [];
        for (var i = 0; i < window.menuJSON.length; i++) {
            findTemplateMenuItems(menuItems, window.menuJSON[i]);
        }

        if (menuItems.length >= 5) {  // set the height based on the number of template so they start bottom up instead of floating in the page
            $('.default-page-template-btns').height('300px');
        } else {
            $('.default-page-template-btns').height((menuItems.length * 75) + 'px');
        }

        //GG - Remove Templates from Menu after building
        removeMenuItemByID(2);

        return menuItems;
    });

    self.userMenuItems = ko.pureComputed(function () {
        var userItems;
        window.menuJSON.filter(function (item) {
            if (item.Id === 3) {
                userItems = item.ChildMenus;
            }
        });

        if (!self.isAuthenticatedUser()) {
            var loginPosition = userItems.map(function (item) {
                return item.NavigateUrl.toLowerCase();
            }).indexOf('login.aspx');

            self.loginLink(userItems[loginPosition]);
            userItems.remove(loginPosition);
        }

        //GG - Remove User Menu after building
        removeMenuItemByID(3);

        return userItems;
    });

    self.adminMenuItems = ko.pureComputed(function () {
        var adminItems;
        window.menuJSON.filter(function (item) {
            if (item.Id === 14) {
                adminItems = item.ChildMenus;
            }
        });

        //GG - Remove User admin after building
        removeMenuItemByID(14);

        return adminItems;
    });

    self.helpMenuItems = ko.pureComputed(function () {
        var helpItems;
        window.menuJSON.filter(function (item) {
            if (item.Id === 33) {
                helpItems = item.ChildMenus;
            }
        });

        removeMenuItemByID(33);

        return helpItems;
    });

    var findTemplateMenuItems = function (menuItems, item) {
        if (item === null) {
            return false;
        }

        if (item.NavigateUrl !== null && item.NavigateUrl.toLowerCase().substring(0, 16) === 'roomrequest.aspx') {
            menuItems.push(item);
        }

        if (item.ChildMenus !== null && item.ChildMenus.length > 0) {
            for (var i = 0; i < item.ChildMenus.length; i++) {
                findTemplateMenuItems(menuItems, item.ChildMenus[i]);
            }
        }
    };

    var removeMenuItemByID = function (id) {
        self.menuItems.remove(function (item) {
            return item.Id === id;
        });
    };
};

function getCalendarData(date) {
    var safeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/SetMyRequestDataVar',
        data: '{date : \'' + moment(safeDate).toJSON() + '\'}'
    })
        .success(function (result) {
            if (result.d.length > 0) {
                vm.myEvents(JSON.parse(result.d));
            }

            if (!$('#menu-wrapper').is(':visible')) {
                $('.event-item-container').perfectScrollbar('update');
            }
        })
        .error(function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        });
}

function getDatesWithEventsForMonth(date) {
    var safeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    vems.ajaxPost({
        url: vems.serverApiUrl() + '/GetUserBookedDatesForMonth',
        data: '{date : \'' + moment(safeDate).toJSON() + '\'}'
    })
        .success(function (result) {
            var resultData = JSON.parse(result.d);
            Dea.eventsForMonth = resultData;

            $('#myRequestCalendar').data('dxCalendar').repaint();
        })
        .error(function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        });
}

function getCallingPage() {
    var loc = window.location.toString();
    var page = loc.substring(loc.lastIndexOf('/') + 1, loc.length);
    page = page.substring(0, ((page.indexOf('?') === -1) ? page.length : page.indexOf('?')));

    var safePage = page.replace('#', '');

    return safePage.length === 0 ? 'default.aspx' : safePage;
}

function hasEventsOnDate(date) {
    if (Dea.eventsForMonth.length === 0) {
        return false;
    }

    for (var i = 0; i < Dea.eventsForMonth.EventDays.length; i++) {
        if (moment(Dea.eventsForMonth.EventDays[i]).diff(moment(date)) === 0) {
            return true;
        }
    }

    return false;
}

function getHolidayOnDate(date) {
    return ko.utils.arrayFilter(Dea.eventsForMonth.Holidays, function (holiday) {
        return moment(date).diff(moment(holiday.Date)) === 0;
    });
}

function buildSideBarMenu() {
    var eventWrap = $('<div class="menu-event-wrapper vems-slide" />');
    var eventListHeading = $('<div class="my-res-heading-container"><div class="my-res-heading-subcontainer"><span class="my-res-heading"></span></div></div>');
    var eventList = $('.event-item-container').clone().addClass('event-item-container-mobile primary-color').removeClass('event-item-container');
    var menu = $('#menu-wrapper');
    var overlay = $('.menu-overlay');
    var renderSwipeMenu = document.documentElement.clientWidth < MAX_MOBILE_WIDTH
        && !DevExpress.devices.current().ios;

    // GG - Because of the KO template we can't select the last element (:last-child) with css
    $('.menu-first-level').last().next().css('border-bottom', '1px solid rgba(255,255,255, 0.2)');

    if ($('#leftMenuCalendar').length > 0) {
        eventWrap.appendTo($('#menu-wrapper'));
        //eventListHeading.appendTo(eventWrap);
        eventList.appendTo(eventWrap);

        //GG - the event list inherits the menu's binding so we need to hook it up events instead.
        ko.cleanNode(eventList[0]);
        ko.applyBindings(vm, eventList[0]);

        var calOpts = $.extend(true, {}, $('#myRequestCalendar').data('dx-calendar').option());
        eventWrap.prepend($('<div class="mobile-requests-calendar-container"><div id="menu-cal" /></div>'));
        eventWrap.prepend(eventListHeading);

        $('#menu-cal').dxCalendar(calOpts);
    }

    menu.curtain({
        showAnchor: false,
        closedSize: 0,
        state: 'closed',
        openSize: 300,
        ready: function () {
            $('.menu-item', menu).css('left', -325);
        }
    });

    menu.on('openBegin', function () {
        overlay.show();
        $('.menu-item', menu).css('left', 0);
        $('.menu-next-level').show();
        if ($('.my-requests-curtain').length > 0) {
            $('.my-requests-curtain').curtain('showAnchor', false);
            $('#menu-cal').data('dx-calendar').option('value', $('#myRequestCalendar').data('dx-calendar').option('value'));
        }

        $('#wpt-buttons').hide(); // hide the action button (big plus) to avoid playing with the z index in the menu
    });

    menu.on('closeBegin', function () {
        overlay.hide();
        $('.menu-item', menu).data('expanded', false);
        $('.right-arrow').css({ top: '2px', 'transform': 'rotateZ(0deg)' });
        eventWrap.css('left', 325);
        $('.menu-next-level').height(0).hide();
        $('.menu-first-level').css('left', -325);
        $('#my-request-menu').removeClass('active arrow');
        if ($('.my-requests-curtain').length > 0) {
            $('.my-requests-curtain').curtain('showAnchor', true);
            $('#myRequestCalendar').data('dx-calendar').option('value', $('#menu-cal').data('dx-calendar').option('value'));
        }

        $('#wpt-buttons').show();
    });

    if (renderSwipeMenu) {
        var hammer = new Hammer(document.getElementsByClassName('main-content')[0], { touchAction: 'auto' });
        //hammer.get('pan').set({ threshold: 100 });
        hammer.on('swiperight', function (ev) {
            if ($(ev.target).is('.dx-tab') || $(ev.target).is('.dx-tab-text')) { return; }
            $('#my-request-menu').addClass('active');
            $('#menu-wrapper').curtain().toggle();
        });
        hammer = new Hammer(document.getElementById('menu-wrapper'));
        hammer.on('swipeleft', function () {
            $('#my-request-menu').removeClass('active');
            $('#menu-wrapper').curtain().toggle();
        });
    }

    $('#my-request-menu').on('click', function () {
        if ($(this).hasClass('arrow')) {
            $('.menu-item', menu).data('expanded', false);
            $('.right-arrow').css({ top: '2px', 'transform': 'rotateZ(0deg)' });
            eventWrap.css('left', 325);
            $('#my-request-menu').removeClass('arrow').addClass('active');
            $('.menu-item', menu).css('left', 0);
            $('.menu-next-level').show();
            $('#menu-wrapper .ps-scrollbar-y-rail').first().show();
            $('.event-item-container').perfectScrollbar('destroy');
            $('.event-item-container').perfectScrollbar();
            return;
        } else {
            $('#my-request-menu').addClass('active');
            $('#menu-wrapper').curtain().toggle();
        }
    });

    overlay.add('#menu-name-container').on('click', function () {
        if ($('#menu-wrapper').curtain().getState() === 'open') {
            $('#my-request-menu').removeClass('active');
            $('#menu-wrapper').curtain().close();
        }
    });

    $('.arrow-container, .menu-item-mobile-only', menu).on('click', function (event) {
        event.preventDefault();

        if ($(this).data('mobileViewRequests')) {
            $('#menu-wrapper .ps-scrollbar-y-rail').first().hide();
            $('.menu-first-level').css('left', -325);
            $('#my-request-menu').removeClass('active').addClass('arrow');
            $('.menu-next-level').height(0).hide();
            eventWrap.css('left', 0);
            eventList.perfectScrollbar('destroy');
            eventList.perfectScrollbar();
            return;
        }

        var outerDiv = $(this).parent().parent();
        var isExpanded = $(outerDiv).data('expanded') === true;
        var nextLvl = $(outerDiv).next();
        var nextLvlItems = nextLvl.children('.menu-item').length;
        var arrow = $('.right-arrow', outerDiv);
        var isParentExpanded = $(outerDiv).parent().hasClass('menu-next-level');
        var isParentElement = $(outerDiv).data('isParent');
        var isParentLink = $(event.target).hasClass('parent-link');
        var parentHeight = $(outerDiv).parent().height();
        var itemHeight = isExpanded ? parentHeight - nextLvlItems * 40 : parentHeight + nextLvlItems * 40;
        var arrowCss = isExpanded ? { top: '2px', 'transform': 'rotateZ(0deg)' } : { 'transform': 'rotateZ(180deg)' };

        arrow.css(arrowCss);

        if (isParentExpanded && !isParentLink && isParentElement) {
            event.preventDefault();
            $(outerDiv).parent().height(itemHeight);
        }

        if (isParentElement && isExpanded) {
            nextLvl.children('.menu-next-level').height(0);
            nextLvl.children('.menu-item').data('expanded', false);
            $('.right-arrow', nextLvl).css({ top: '2px', 'transform': 'rotateZ(0deg)' });
        }

        var nextLevelHeight = isExpanded ? 0 : nextLvlItems * 40;

        nextLvl.height(nextLevelHeight);

        $(outerDiv).data('expanded', !isExpanded);
        return false;
    });
}

function buildTopMenu(menuElement, anchor) {
    if (menuElement === undefined || menuElement[0] === undefined ||
        anchor === undefined || anchor[0] === undefined) { // Abort menu building if it's hidden
        return false;
    }

    var menuString = menuElement[0].id;
    var anchorString = anchor[0].id;
    var menuItems = 0;  // default number of items (and menu height) to zero, then set according to menu id
    switch (menuString) {
        case 'menu-admin':
            menuItems = menuVM.adminMenuItems().length;
            break;
        case 'menu-users':
            menuItems = menuVM.userMenuItems().length;
            break;
        case 'menu-help':
            menuItems = menuVM.helpMenuItems() ? menuVM.helpMenuItems().length : 0;
            break;
    }

    if (menuItems === 0) {
        return;
    }

    var menuHeight = menuItems * ($('.menu-user-menu-item').outerHeight() + 1);

    menuElement.curtain({
        showAnchor: false,
        closedSize: 0,
        state: 'closed',
        openSize: menuHeight,
        direction: 'btt',
        openBegin: function () {
            anchor.addClass('secondary-color');
        },
        closeBegin: function () {
            anchor.removeClass('secondary-color');
        }
    });

    anchor.on('click', function (event) {
        if (event.target.id === 'menu-guest-login') { return; }
        menuElement.curtain().toggle();
    });

    $(document).on('click', function (event) {
        var t = event.target;
        if (t.id !== anchorString && $(t).parents('#' + anchorString).length === 0 &&
            t.id !== menuString && $(t).parents('#' + menuString).length === 0) {
            menuElement.curtain().close();
        }
    });
}

/*** begin vems namespace ***/
vems.decodeHtml = function (value) {
    return $('<textarea>').html(value).text();
};

vems.gridCellTemplates = {
    addBtnTemplate: function (container, options, clickEvent) {
        var addSpan = $('<div />').append('<span class="fa fa-plus"></span');

        if (typeof (clickEvent) === 'function') {
            addSpan.on('click', clickEvent);
        }

        addSpan.appendTo(container);
    },
    editBtnTemplate: function (container, options, clickEvent) {
        var addSpan = $('<div />').append('<span class="fa fa-edit"></span');

        if (typeof (clickEvent) === 'function') {
            addSpan.on('click', clickEvent);
        }

        addSpan.appendTo(container);
    },
    cancelBtnTemplate: function (container, options, clickEvent) {
        var addSpan = $('<div />').append('<span class="fa fa-trash"></span');

        if (typeof (clickEvent) === 'function') {
            addSpan.on('click', clickEvent);
        }

        addSpan.appendTo(container);
    },
    textLinktemplate: function (container, options, clickEvent) {
        var textLink = $('<div>').text(options.value).addClass('grid-link');

        if (typeof (clickEvent) === 'function') {
            textLink.on('click', clickEvent);
        }

        textLink.appendTo(container);
    }
};

vems.wireupDialogs = function (grid) {
    $('#' + grid + ' a:not([class=sorter], [class=noDiag], [class=additionalEvents], [class=tandc])')
        .bind('click', function (e) {
            vems.wireupDialogsGenerateDialog(this.href, e);
        });
};

vems.wireupDialogsGenerateDialog = function (link, e, element) {
    if (e !== null) {
        e.preventDefault();
    }

    var dTitle = '';

    if (link.indexOf('LocationDetails') >= 0) {
        dTitle = ems_LocDetails;
    } else if (link.indexOf('ResourceDetails') >= 0) {
        dTitle = ems_ResourceDetails;
    } else if (link.indexOf('BookingDetails') >= 0) {
        dTitle = ems_BookingDetails;
    } else if (link.indexOf('ReservationDetails') >= 0) {
        dTitle = ems_ResDetails;
    } else if (link.indexOf('UdfDetails') >= 0) {
        dTitle = ems_AddInfo;
    }

    if (element === null || element === undefined) {
        var horizontalPadding = 15, verticalPadding = 15;

        iFrameDiag = $('<iframe id="externalSite" frameborder="0" src="' + link + '" />')
            .dialog({
                title: dTitle,
                width: 850,
                height: 500,
                modal: true,
                resizable: true,
                autoResize: true,
                open: function () {
                    var t = $(this).parent(), w = $(window);
                    t.offset({
                        top: (w.height() / 2) - (t.height() / 2),
                        left: (w.width() / 2) - (t.width() / 2)
                    });
                }
            })
            .width(850 - horizontalPadding).height(500 - verticalPadding);
    } else {
        element.dxPopup({
            showTitle: true,
            title: dTitle,
            height: 800,
            width: 850,
            dragEnabled: false,
            focusStateEnabled: false,
            onShowing: function () {
                $('<iframe style="border: 0; width: 100%; height: 100%" src="' + link + '"></iframe>').appendTo(arguments[0].component.content());
            },
            onHidden: function () {
                arguments[0].component.content().children().remove();
            }
        });

        element.dxPopup('instance').show();
    }
    return false;
};

vems.showiDialog = function (link, options) {
    var horizontalPadding = 15, verticalPadding = 15;
    iFrameDiag = $('<iframe id="externalSite"  frameborder="0" src="' + link + '" />');
    $.extend(options, { modal: true, resizable: false, autoResize: true });
    if (!options.width) {
        options.width = 500;
    }
    if (!options.height) {
        options.height = 500;
    }
    iFrameDiag.dialog(options).width(options.width - horizontalPadding).height(options.height - verticalPadding);
};

vems.iDialog = function (e, link, options) {
    e = e || event;
    if (e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        else {
            e.returnValue = false;
        }
    }
    vems.showiDialog(link, options);
    return false;
};

//returns the jquery promise callback hooks of: then, done, fail, always, pipe, progress, state and promise
vems.showAlertMessage = function (message, title) {
    return DevExpress.ui.dialog.alert(message, title);
};

//returns the jquery promise callback hooks of: then, done, fail, always, pipe, progress, state and promise
vems.showConfirmationMessage = function (message, title) {
    return DevExpress.ui.dialog.confirm(message, title);
};

//returns the jquery promise callback hooks of: then, done, fail, always, pipe, progress, state and promise
//types: 'info'|'warning'|'error'|'success'
vems.showToasterMessage = function (msg, messageType, timeToShow) {
    if (timeToShow === undefined || timeToShow === null) { timeToShow = 3000; }
    return DevExpress.ui.notify({
        message: msg,
        position: {
            my: 'top center',
            at: 'top center'
        }
    }, messageType, timeToShow);
};

//Shows common error display and logs to console
vems.showErrorMessage = function (errorMsg, timeToShow) {
    if (timeToShow === undefined || timeToShow === null) { timeToShow = 3000; }
    console.log(errorMsg);
    return DevExpress.ui.notify({
        message: 'An error occured: ' + errorMsg,
        position: {
            my: 'top center',
            at: 'top center'
        }
    }, 'error', timeToShow);
};

// Shows a multi-purpose popup with styling for universal usage throughout the application
// example usage:  vems.showPopup('the title', 'the message (html allowed)', [{text:'cancel',onClick:someFunction},{text:'okay'}]);
vems.showPopup = function (title, content, buttons) {
    buttons = buttons ? buttons : [{ text: 'OK' }];  // just show an 'OK' button if no specific buttons given
    var popup = new DevExpress.ui.dialog.custom({
        title: title,
        message: content,
        buttons: buttons
    });
    popup.show();
};

vems.toggleCheckIn = function (groupId, buildingId, bookingId) {
    return vems.ajaxPost({
        //async: bAsync,
        url: vems.serverApiUrl() + '/toggleCheckinJson',
        data: '{groupId : ' + groupId + ', buildingId: ' + buildingId + ', bookingId: ' + bookingId + '}'
    });
};

vems.ajaxPost = function (options) {
    var defaults = {
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
    };
    $.extend(options, defaults);  //merge passed options to defaults

    return $.ajax(options)
        .error(function (xhr, ajaxOptions, thrownError) {
            console.log('vems.ajaxPost error: ' + thrownError);
        });
};
/*** end vems namespace ***/

/*** dx bug override ***/
/*! Module core, file ui.dialog.js */
(function ($, DX, undefined) {
    var ui = DX.ui,
        utils = DX.utils;
    var DEFAULT_BUTTON = {
        text: "OK",
        onClick: function () {
            return true
        }
    };
    var DX_DIALOG_CLASSNAME = "dx-dialog",
        DX_DIALOG_WRAPPER_CLASSNAME = DX_DIALOG_CLASSNAME + "-wrapper",
        DX_DIALOG_ROOT_CLASSNAME = DX_DIALOG_CLASSNAME + "-root",
        DX_DIALOG_CONTENT_CLASSNAME = DX_DIALOG_CLASSNAME + "-content",
        DX_DIALOG_MESSAGE_CLASSNAME = DX_DIALOG_CLASSNAME + "-message",
        DX_DIALOG_BUTTONS_CLASSNAME = DX_DIALOG_CLASSNAME + "-buttons",
        DX_DIALOG_BUTTON_CLASSNAME = DX_DIALOG_CLASSNAME + "-button";
    var FakeDialogComponent = DX.Component.inherit({
        NAME: "dxDialog",
        ctor: function (element, options) {
            this.callBase(options)
        },
        _defaultOptionsRules: function () {
            return this.callBase().concat([{
                device: { platform: "ios" },
                options: { width: 276 }
            }, {
                device: { platform: "android" },
                options: {
                    lWidth: "60%",
                    pWidth: "80%"
                }
            }, {
                device: {
                    platform: "win8",
                    phone: false
                },
                options: {
                    width: function () {
                        return $(window).width()
                    }
                }
            }, {
                device: {
                    platform: "win8",
                    phone: true
                },
                options: {
                    position: {
                        my: "top center",
                        at: "top center",
                        of: window,
                        offset: "0 0"
                    }
                }
            }])
        }
    });
    var dialog = function (options) {
        if (!ui.dxPopup)
            throw DX.Error("E0018");
        var deferred = $.Deferred();
        var defaultOptions = (new FakeDialogComponent).option();
        options = $.extend(defaultOptions, options);
        var $element = $("<div>").addClass(DX_DIALOG_CLASSNAME).appendTo(DX.viewPort());
        var $message = $("<div>").addClass(DX_DIALOG_MESSAGE_CLASSNAME).html(String(options.message));
        var popupButtons = [];
        $.each(options.buttons || [DEFAULT_BUTTON], function () {
            if (this.clickAction) {
                DX.log("W0001", "Dialog", "clickAction", "14.2", "Use 'onClick' option instead");
                this.onClick = this.clickAction
            }
            var action = new DX.Action(this.onClick || this.clickAction, { context: popupInstance });
            popupButtons.push({
                toolbar: 'bottom',
                location: 'center',
                widget: 'button',
                options: {
                    text: this.text,
                    onClick: function () {
                        var result = action.execute(arguments);
                        hide(result)
                    }
                }
            })
        });
        var popupInstance = $element.dxPopup({
            title: options.title || this.title,
            showTitle: function () {
                var isTitle = options.showTitle === undefined ? true : options.showTitle;
                return isTitle
            }(),
            height: "auto",
            width: function () {
                var isPortrait = $(window).height() > $(window).width(),
                    key = (isPortrait ? "p" : "l") + "Width",
                    widthOption = options.hasOwnProperty(key) ? options[key] : options["width"];
                return $.isFunction(widthOption) ? widthOption() : widthOption
            },
            showCloseButton: false,
            focusStateEnabled: false,
            onContentReady: function (args) {
                args.component.content().addClass(DX_DIALOG_CONTENT_CLASSNAME).append($message)
            },
            onShowing: function (e) {
                e.component.bottomToolbar().addClass(DX_DIALOG_BUTTONS_CLASSNAME).find(".dx-button").addClass(DX_DIALOG_BUTTON_CLASSNAME).first().focus()
            },
            buttons: popupButtons,
            animation: {
                show: {
                    type: "pop",
                    duration: 400
                },
                hide: {
                    type: "pop",
                    duration: 400,
                    to: {
                        opacity: 0,
                        scale: 0
                    },
                    from: {
                        opacity: 1,
                        scale: 1
                    }
                }
            },
            rtlEnabled: DX.rtlEnabled,
            boundaryOffset: {
                h: 10,
                v: 0
            }
        }).dxPopup("instance");
        popupInstance._wrapper().addClass(DX_DIALOG_WRAPPER_CLASSNAME);
        if (options.position)
            popupInstance.option("position", options.position);
        popupInstance._wrapper().addClass(DX_DIALOG_ROOT_CLASSNAME);
        function show() {
            popupInstance.show();
            utils.resetActiveElement();
            return deferred.promise()
        }
        function hide(value) {
            if (value != false)  // added by KS on 09/11/2015 - bug fix allowing buttons to not close popups
                popupInstance.hide().done(function () {
                    popupInstance.element().remove()
                });
            deferred.resolve(value)
        }
        return {
            show: show,
            hide: hide
        }
    };
    var alert = function (message, title, showTitle) {
        var dialogInstance,
            options = $.isPlainObject(message) ? message : {
                title: title,
                message: message,
                showTitle: showTitle
            };
        dialogInstance = ui.dialog.custom(options);
        return dialogInstance.show()
    };
    var confirm = function (message, title, showTitle) {
        var dialogInstance,
            options = $.isPlainObject(message) ? message : {
                title: title,
                message: message,
                showTitle: showTitle,
                buttons: [{
                    text: Globalize.localize("Yes"),
                    onClick: function () {
                        return true
                    }
                }, {
                    text: Globalize.localize("No"),
                    onClick: function () {
                        return false
                    }
                }]
            };
        dialogInstance = ui.dialog.custom(options);
        return dialogInstance.show()
    };
    var $notify = null;
    var notify = function (message, type, displayTime) {
        var options = $.isPlainObject(message) ? message : { message: message };
        if (!ui.dxToast) {
            alert(options.message);
            return
        }
        if (options.hiddenAction) {
            DX.log("W0001", "Dialog", "hiddenAction", "14.2", "Use 'onHidden' option instead");
            options.onHidden = options.hiddenAction
        }
        var userHiddenAction = options.onHidden;
        $.extend(options, {
            type: type,
            displayTime: displayTime,
            onHidden: function (args) {
                args.element.remove();
                new DX.Action(userHiddenAction, { context: args.model }).execute(arguments)
            }
        });
        $notify = $("<div>").appendTo(DX.viewPort()).dxToast(options);
        $notify.dxToast("instance").show()
    };
    $.extend(ui, {
        notify: notify,
        dialog: {
            custom: dialog,
            alert: alert,
            confirm: confirm
        }
    });
    ui.dialog.FakeDialogComponent = FakeDialogComponent
})(jQuery, DevExpress);
/*** end dx bug override ***/
