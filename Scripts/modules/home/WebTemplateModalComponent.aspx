<%@ Import Namespace="Resources" %>

<div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <h3 class="modal-title" data-bind="text: vems.decodeHtml(TemplateName())"></h3>
</div>
<div class="modal-body">
    <ul class="nav nav-tabs" id="template-modal-tabs" role="tablist">
        <!-- ko if: HelpText().length > 0 -->
        <li role="presentation" class="active"><a href="#information" aria-controls="information" role="tab" data-toggle="tab"><%= ScreenText.Information %></a></li>
        <!-- /ko -->
        <li role="presentation" data-bind="css: { active: HelpText().length == 0 }"><a href="#bookingrules" aria-controls="bookingrules" role="tab" data-toggle="tab"><%= ScreenText.BookingRules %></a></li>
    </ul>
    <div class="tab-content" id="template-modal-tab-content">
        <!-- ko if: HelpText().length > 0 -->
        <div role="tabpanel" class="tab-pane active col-xs-12" id="information">
            <div data-bind="html: vems.decodeHtml(HelpText())"></div>
        </div>
        <!-- /ko -->
        <div role="tabpanel" class="tab-pane" id="bookingrules" data-bind="css: { active: HelpText().length == 0 }" style="margin-bottom: -15px;">

            <div class="booking-grid" style="overflow: visible;">
                <div class="modal-grid">
                    <!-- ko if: TemplateId() > -1 -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.MaximumNumberOfBookingsAllowedPerReservation %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: MaxBookingsPerReservation"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- ko if: MaxNoMinutesAllowed() > 0 -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.MaximumNumberOfMinutesAllowed %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: MaxNoMinutesAllowed"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- ko if: UseCancellationCutoffTime() == "<%= ScreenText.Yes %>" -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.CancellationCutoffTime %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: moment(CancellationCutoffTime()).format('LT')"></span>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.CancellationCutoffDays %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: CancellationCutoffNumberOfDays"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- ko if: CancellationCutoffHours() > 0  -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.CancellationCutoffHours %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: CancellationCutoffHours"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- ko if: CancelBookingInProgress() &&  TemplateId() > -1  -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.CancelBookingInProgress %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: CancelBookingInProgress"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- ko if: EndBookingInProgress() &&  TemplateId() > -1  -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.EndBookingInProgress %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: EndBookingInProgress"></span>
                        </div>
                    </div>
                    <!-- /ko -->


                    <!-- ko if: UseMaxDays -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.OnlyAllowNewBookingsWithinRangeOfThisManyDays %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: AllowNewBookingsWithinRange"></span>
                        </div>
                    </div>
                    <!-- ko if: MaxBookingsPerDay() > 0 -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.MaximumNumberOfBookingsPerDay %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: MaxBookingsPerDay"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- ko if: MaxBookingsPerDay() > 0 -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.MaximumNumberOfBookingsPerDateRange %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: MaxBookingsPerRange"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- /ko -->
                    <!-- ko if: UseMaxDays() === false -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.OnlyAllowNewBookingsPriorToThisDate %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: moment(AllowNewBookingsPriorToDate()).format('ddd L')"></span>
                        </div>
                    </div>
                    <!-- ko if: MaxBookingsPerDay() > 0 -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.MaximumNumberOfBookingsPerDay %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: MaxBookingsPerDay"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- ko if: MaxBookingsPerDay() > 0 -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.MaximumNumberOfBookingsPriorToSpecifiedDate %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: MaxBookingsPerRange"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- /ko -->


                    <!-- ko if: UseMinDays() == "<%= ScreenText.Yes %>" -->
                    <!-- ko if: UseNewBookingCutoffTime() == "<%= ScreenText.Yes %>" -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.NewBookingCutoffTime %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: moment(NewBookingCutoffTime()).format('LT')"></span>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.NewBookingCutoffNumberOfDays %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: NewBookingCutoffDays"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- ko if: NewBookingCutoffHours() > 0  -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.NewBookingCutoffHours %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: NewBookingCutoffHours"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                    <!-- /ko -->
                    <!-- ko if: UseMinDays() === false -->
                    <div class="row">
                        <div class="col-xs-8 ellipsis-text"><%= ScreenText.OnlyAllowNewBookingsOnOrAfterThisDate %></div>
                        <div class="col-xs-4">
                            <span data-bind="text: moment(AllowNewBookingsOnAfterThisDate()).format('ddd L')"></span>
                        </div>
                    </div>
                    <!-- /ko -->
                </div>
            </div>

        </div>
    </div>
</div>
<div class="modal-footer">
    <button type="button" class="btn btn-default" id="bookNowBtn"><%= ScreenText.BookNowWithThisTemplate %></button>
    <button type="button" class="btn btn-primary" id="closeBtn" data-dismiss="modal"><%= ScreenText.Close %></button>
</div>
<div data-bind="template: { afterRender: typeof(aboutTemplateModalAfterRender) != 'undefined' ? aboutTemplateModalAfterRender : function () { } }"></div>
