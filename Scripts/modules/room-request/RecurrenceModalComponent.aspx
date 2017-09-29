<%@ Import Namespace="Resources" %>

<div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <h4 class="modal-title"><%= ScreenText.Recurrence %></h4>
</div>
<div class="modal-body">
    <div class="row">
        <div class="row col-xs-12">
            <div class="col-xs-3 recurrence-ddl-label">
                <label class="recurrence-label-text" for="recurrence-pattern-dropdown"><%= ScreenText.Repeats %></label>
            </div>
            <div class="col-xs-4 form-group">
                <select class="form-control" id="recurrence-pattern-dropdown" 
                    data-bind="value: recurrence.recurrenceType, options: recurrence.recurrenceTypes, optionsText: 'label', optionsValue: 'value'"></select>
            </div>
            <div class="col-xs-5">
                <button class="btn btn-default" data-bind="click: function () { recurrence.removeRecurrence(true); }"><%= ScreenText.RemoveRecurrence %></button>
            </div>
        </div>

        <!-- daily -->
        <div class="row col-xs-12" id="recurrence-daily" data-bind="visible: recurrence.recurrenceType() === 'daily'">
            <div class="col-xs-3 recurrence-label">
                <input type="radio" name="daily-pattern" id="every-days" value="everydays" data-bind="checked: recurrence.dailyType" />
                <label class="recurrence-radio-text" for="every-days"><%= ScreenText.DailyByDay %></label>
            </div>
            <div class="col-xs-9 form-group">
                <div class="recurrence-input-numeric">
                    <input class="form-control" type="text" maxlength="2" data-bind="numeric, value: recurrence.dailyCount" />
                </div>
                <div class="recurrence-input-label-end">
                    <%= ScreenText.Days %>
                </div>
            </div>
            <div class="col-xs-12 recurrence-label form-group">
                <input type="radio" name="daily-pattern" id="weekdays-only" value="weekdays" data-bind="checked: recurrence.dailyType" />
                <label class="recurrence-radio-text" for="weekdays-only"><%= ScreenText.WeekdaysOnly %></label>
            </div>
        </div>

        <!-- weekly -->
        <div id="recurrence-weekly" data-bind="visible: recurrence.recurrenceType() === 'weekly'">
            <div class="row col-xs-12">
                <div class="col-xs-3 recurrence-input-label">
                    <label class="recurrence-label-text" for="weekly-count"><%= ScreenText.DailyByDay %></label>
                </div>
                <div class="col-xs-9 form-group">
                    <div class="recurrence-input-numeric">
                        <input class="form-control" type="text" maxlength="2" id="weekly-count" data-bind="numeric, value: recurrence.weeklyCount" />
                    </div>
                    <div class="recurrence-input-label-end">
                        <%= ScreenText.Weeks %>
                    </div>
                </div>
            </div>
            <div class="row col-xs-12 form-group">
                <div class="col-xs-3 recurrence-input-label">
                    <label class="recurrence-label-text"><%= ScreenText.On %></label>
                </div>
                <div class="col-xs-9" id="recurrence-weekly-btns">
                    <button data-daynum="0" class="btn btn-default" data-bind="click: function (d, e) { $(e.target).toggleClass('btn-default btn-primary'); recurrence.updateRecurrenceCount(); },
                                       text: moment().weekday(0).format('ddd')">
                    </button>
                    <button data-daynum="1" class="btn btn-default" data-bind="click: function (d, e) { $(e.target).toggleClass('btn-default btn-primary'); recurrence.updateRecurrenceCount(); },
                                       text: moment().weekday(1).format('ddd')">
                    </button>
                    <button data-daynum="2" class="btn btn-default" data-bind="click: function (d, e) { $(e.target).toggleClass('btn-default btn-primary'); recurrence.updateRecurrenceCount(); },
                                       text: moment().weekday(2).format('ddd')">
                    </button>
                    <button data-daynum="3" class="btn btn-default" data-bind="click: function (d, e) { $(e.target).toggleClass('btn-default btn-primary'); recurrence.updateRecurrenceCount(); },
                                       text: moment().weekday(3).format('ddd')">
                    </button>
                    <button data-daynum="4" class="btn btn-default" data-bind="click: function (d, e) { $(e.target).toggleClass('btn-default btn-primary'); recurrence.updateRecurrenceCount(); },
                                       text: moment().weekday(4).format('ddd')">
                    </button>
                    <button data-daynum="5" class="btn btn-default" data-bind="click: function (d, e) { $(e.target).toggleClass('btn-default btn-primary'); recurrence.updateRecurrenceCount(); },
                                       text: moment().weekday(5).format('ddd')">
                    </button>
                    <button data-daynum="6" class="btn btn-default" data-bind="click: function (d, e) { $(e.target).toggleClass('btn-default btn-primary'); recurrence.updateRecurrenceCount(); },
                                       text: moment().weekday(6).format('ddd')">
                    </button>
                </div>
            </div>
        </div>

        <!-- monthly -->
        <div id="recurrence-monthly" data-bind="visible: recurrence.recurrenceType() === 'monthly'">
            <div class="row col-xs-12">
                <div class="col-xs-3 recurrence-label">
                    <input type="radio" name="monthly-pattern" id="every-months" value="everymonths" data-bind="checked: recurrence.monthlyType" />
                    <label class="recurrence-radio-text" for="every-months"><%= ScreenText.OnDay %></label>
                </div>
                <div class="col-xs-9">
                    <div class="form-group recurrence-input-numeric">
                        <input class="form-control" type="text" maxlength="2" data-bind="numeric, value: recurrence.monthlyDay" />
                    </div>
                    <div class="recurrence-input-label-middle">
                        <%= ScreenText.ofEvery %>
                    </div>
                    <div class="form-group recurrence-input-numeric">
                        <input class="form-control" type="text" maxlength="2" data-bind="numeric, value: recurrence.monthlyCount" />
                    </div>
                    <div class="recurrence-input-label-end">
                        <%= ScreenText.Months %>
                    </div>
                </div>
            </div>
            <div class="row col-xs-12">
                <div class="col-xs-3 recurrence-label">
                    <input type="radio" name="monthly-pattern" id="month-days" value="monthdays" data-bind="checked: recurrence.monthlyType" />
                    <label class="recurrence-radio-text" for="month-days"><%= ScreenText.OnThe %></label>
                </div>
                <div class="col-xs-9 form-group">
                    <div class="recurrence-monthly-week">
                        <select id="recurrence-monthlyweek-ddl" class="form-control" data-bind="value: recurrence.monthlyWeek, click: function () { recurrence.monthlyType('monthdays'); }">
                            <option value="1"><%= ScreenText.First %></option>
                            <option value="2"><%= ScreenText.Second %></option>
                            <option value="3"><%= ScreenText.Third %></option>
                            <option value="4"><%= ScreenText.Fourth %></option>
                            <option value="5"><%= ScreenText.Last %></option>
                        </select>
                    </div>
                    <div class="recurrence-monthly-weekday">
                        <select id="recurrence-monthlyweekday-ddl" class="form-control" data-bind="value: recurrence.monthlyWeekDay, click: function () { recurrence.monthlyType('monthdays'); }">
                            <option value="0" data-bind="text: moment().weekday(0).format('ddd')"></option>
                            <option value="1" data-bind="text: moment().weekday(1).format('ddd')"></option>
                            <option value="2" data-bind="text: moment().weekday(2).format('ddd')"></option>
                            <option value="3" data-bind="text: moment().weekday(3).format('ddd')"></option>
                            <option value="4" data-bind="text: moment().weekday(4).format('ddd')"></option>
                            <option value="5" data-bind="text: moment().weekday(5).format('ddd')"></option>
                            <option value="6" data-bind="text: moment().weekday(6).format('ddd')"></option>
                        </select>
                    </div>
                    <div class="recurrence-input-label-middle">
                        <%= ScreenText.ofEvery %>
                    </div>
                    <div class="recurrence-input-numeric">
                        <input class="form-control" type="text" maxlength="2" data-bind="numeric, value: recurrence.monthlyWeekDayCount" />
                    </div>
                    <div class="recurrence-input-label-end">
                        <%= ScreenText.Months %>
                    </div>
                </div>
            </div>
        </div>

        <!-- random -->
        <div class="row col-xs-12" id="recurrence-random" style="margin-bottom:10px;" data-bind="visible: recurrence.recurrenceType() === 'random'">
            <div class="col-xs-12 recurrence-hr">
                <hr />
            </div>
            <div class="col-xs-12" id="recurrence-random-calendar" data-bind="multiDatePicker: recurrence.date, datepickerOptions: { minDate: templateRules().FirstAllowedBookingDate, maxDate: templateRules().LastAllowedBookingDate }"></div>
        </div>
    </div>

    <div class="row" id="recurrence-date-section" data-bind="visible: recurrence.recurrenceType() !== 'random'">
        <div class="col-xs-12 recurrence-hr">
            <hr />
        </div>
        <div class="row col-xs-12 form-group">
            <div class="col-xs-3 recurrence-input-label">
                <label class="recurrence-label-text" for="recurrence-date"><%= ScreenText.StartDate %></label>
            </div>
            <div class="col-xs-5 input-group recurrence-date date" data-bind="datePicker: recurrence.date, datepickerOptions: { format: 'ddd L', minDate: templateRules().FirstAllowedBookingDate, maxDate: templateRules().LastAllowedBookingDate }">
                <input type="text" class="form-control" id="recurrence-date" />
                <span class="input-group-addon">
                    <i class="fa fa-calendar"></i>
                </span>
            </div>
        </div>
        <div class="row col-xs-12 form-group">
            <div class="col-xs-3 recurrence-label">
                <input type="radio" name="end-date" id="end-date" value="enddate" data-bind="checked: recurrence.dateType" />
                <label class="recurrence-radio-text" for="end-date"><%= ScreenText.EndDate %></label>
            </div>
            <div class="col-xs-5 input-group recurrence-date date" data-bind="datePicker: recurrence.endDate, datepickerOptions: { format: 'ddd L', minDate: templateRules().FirstAllowedBookingDate, maxDate: templateRules().LastAllowedBookingDate }, click: function () { recurrence.dateType('enddate'); }">
                <input type="text" class="form-control" />
                <span class="input-group-addon">
                    <i class="fa fa-calendar"></i>
                </span>
            </div>
            <div class="recurrence-input-label-end grey-text" data-bind="text: recurrence.tempRecurrenceDisplay, visible: recurrence.tempRecurrenceCount() > 0 && recurrence.dateType() === 'enddate'"></div>
        </div>
        <div class="row col-xs-12 form-group">
            <div class="col-xs-3 recurrence-label">
                <input type="radio" name="end-date" id="end-after" value="endafter" data-bind="checked: recurrence.dateType" />
                <label class="recurrence-radio-text" for="end-after"><%= ScreenText.EndAfter %></label>
            </div>
            <div class="col-xs-9">
                <div class="recurrence-input-numeric">
                    <input type="text" class="form-control" maxlength="3" data-bind="numeric, value: recurrence.dateCount" />
                </div>
                <div class="recurrence-input-label-end">
                    <%= ScreenText.Occurrences %>
                </div>
            </div>
        </div>
    </div>

    <div class="row" id="recurrence-time-section">
        <div class="col-xs-12 recurrence-hr">
            <hr />
        </div>
        <div class="row col-xs-12">
            <div class="col-xs-6 col-sm-4">
                <label class="recurrence-label-text" for="recurrence-start-time"><%= ScreenText.StartTime %></label>
            </div>
            <div class="col-xs-6 col-sm-4">
                <label class="recurrence-label-text" for="recurrence-end-time"><%= ScreenText.EndTime %></label>
            </div>
        </div>
        <div class="row col-xs-12 form-group recurrence-label">
            <div class="col-xs-6 col-sm-4 input-group recurrence-time date" data-bind="datePicker: recurrence.start, datepickerOptions: { format: 'LT' }">
                <input type="text" class="form-control" id="recurrence-start-time" />
                <span class="input-group-addon">
                    <i class="fa fa-clock-o"></i>
                </span>
            </div>
            <div class="col-xs-6 col-sm-4 input-group recurrence-time date" data-bind="datePicker: recurrence.end, datepickerOptions: { format: 'LT' }">
                <input type="text" class="form-control" id="recurrence-end-time" />
                <span class="input-group-addon">
                    <i class="fa fa-clock-o"></i>
                </span>
            </div>
        </div>
        <div class="col-xs-12">
            <label class="recurrence-label-text" for="recurrence-tz"><%= ScreenText.CreateBookingInThisTimeZone %></label>
        </div>
        <div class="row col-xs-12 form-group">
            <div class="col-xs-6 recurrence-label">
                <select class="form-control" id="recurrence-tz" data-bind="value: recurrence.timeZoneId, options: templateRules().TimeZones, optionsText: 'TimeZone', optionsValue: 'TimeZoneID'"></select>
            </div>
        </div>
    </div>
</div>
<div class="modal-footer">
    <button type="button" class="btn btn-primary" id="recurrence-apply-btn" data-bind="click: recurrence.applyRecurrence"><%= ScreenText.ApplyRecurrence %></button>
    <button type="button" class="btn btn-default" id="recurrence-close-btn" data-dismiss="modal"><%= ScreenText.Close %></button>
</div>