<div class="modal fade" id="booking-details-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h3 class="modal-title" data-bind="text: ScreenText.BookingDetailsText"></h3>
            </div>
            <div class="modal-body">
                <ul id="booking-details-tabs" class="nav nav-tabs" role="tablist">
                    <li role="presentation" class="active">
                        <a href="#detailsContainer" aria-controls="detailsContainer" role="tab" data-toggle="tab" data-bind="text: ScreenText.EventDetailsText"></a>
                    </li>
                    <!-- ko if: !vems.bookingDetailsVM.IsMobile() -->
                    <li role="presentation">
                        <a href="#relatedEventsContainer" aria-controls="relatedEventsContainer" role="tab" data-toggle="tab" data-bind="text: ScreenText.RelatedEventsText"></a>
                    </li>
                    <!-- /ko -->
                    <a id="VEMSBookingDetails" class="fa fa-question-circle help-text-icon" data-helptextkey="VEMSBookingDetails" data-parenttype="None" data-parentid="0" style="display: none;"></a>
                </ul>
                <div class="tab-content">
                    <div id="detailsContainer" role="tabpanel" class="tab-pane fade in active">
                        <%--<pre data-bind="text: ko.toJSON(vems.bookingDetailsVM, null, 2)"></pre>--%>
                        <table class="table table-striped">
                            <tbody data-bind="foreach: $data.details()">
                                <tr>
                                    <td data-bind="text: Field"></td>
                                    <!-- ko ifnot: Field === vems.bookingDetailsVM.ScreenText.DateText || Field === vems.bookingDetailsVM.ScreenText.FirstBookingText || Field === vems.bookingDetailsVM.ScreenText.LastBookingText || Field === vems.bookingDetailsVM.ScreenText.EventNameText -->
                                    <td data-bind="html: (Value.indexOf('href') >= 0 ? Value : Value)"></td>
                                    <!-- /ko -->
                                    <!-- ko if: Field === vems.bookingDetailsVM.ScreenText.DateText || Field === vems.bookingDetailsVM.ScreenText.FirstBookingText || Field === vems.bookingDetailsVM.ScreenText.LastBookingText -->
                                    <td data-bind="html: moment(Value).format('dddd ll')"></td>
                                    <!-- /ko -->
                                    <!-- ko if: Field === vems.bookingDetailsVM.ScreenText.EventNameText -->
                                    <td>
                                        <a id="event-name" class="clickable" data-bind="visible: !vems.bookingDetailsVM.IsMobile() && vems.bookingDetailsVM.UserCanViewDetails(), click: vems.bookingDetailsVM.eventNameClicked">
                                            <span data-bind="text: vems.htmlDecode(Value)"></span>
                                        </a>
                                        <!-- ko if: vems.bookingDetailsVM.EditBookingLink() -->
                                        <a id="event-name-mobile" class="clickable" data-bind="click: vems.bookingDetailsVM.eventEditClicked">
                                            (<i class="fa fa-pencil"></i><span data-bind="text: ' ' + vems.bookingDetailsVM.ScreenText.EditText"></span>)
                                        </a>
                                        <!-- /ko -->
                                        <span data-bind="visible: (vems.bookingDetailsVM.IsMobile()) || !vems.bookingDetailsVM.UserCanViewDetails(), text: vems.htmlDecode(Value)"></span>
                                    </td>
                                    <!-- /ko -->
                                </tr>
                                 <!-- ko if: Field === vems.bookingDetailsVM.ScreenText.EventNameText -->
                                <tr data-bind="visible: vems.bookingDetailsVM.IsMobile() && vems.bookingDetailsVM.UnableToEditMessage().length > 0">
                                    <td colspan="2" class="warning-message">
                                        <span data-bind="text: vems.bookingDetailsVM.UnableToEditMessage"></span>
                                    </td>
                                </tr>
                                <!-- /ko -->
                            </tbody>
                        </table>
                    </div>
                    <!-- ko if: !vems.bookingDetailsVM.IsMobile() -->
                    <div id="relatedEventsContainer" role="tabpanel" class="tab-pane fade">
                        <div id="booking-details-grid-container" class="table-responsive">
                            <table id="booking-details-grid" class="table table-striped table-sort">
                                <thead>
                                    <tr>
                                        <!-- ko if: vems.bookingDetailsVM.ShowICS() -->
                                        <th>
                                            <div></div>
                                        </th>
                                        <!-- /ko -->
                                        <th>
                                            <div data-bind="text: ScreenText.DateText"></div>
                                        </th>
                                        <th>
                                            <div data-bind="text: ScreenText.TimeText"></div>
                                        </th>
                                        <th>
                                            <div data-bind="text: ScreenText.EventNameText"></div>
                                        </th>
                                        <!-- ko if: vems.bookingDetailsVM.ShowLocation() -->
                                        <th>
                                            <div data-bind="text: ScreenText.LocationText"></div>
                                        </th>
                                        <!-- /ko -->
                                        <!-- ko if: vems.bookingDetailsVM.ShowGroupName() -->
                                        <th>
                                            <div data-bind="text: ScreenText.GroupNameText"></div>
                                        </th>
                                        <!-- /ko -->
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- ko foreach: vems.bookingDetailsVM.Bookings -->
                                    <tr data-bind="css: { 'row-cancelled': StatusTypeId() === -12 }">
                                        <!-- ko if: vems.bookingDetailsVM.ShowICS() -->
                                        <td>
                                            <!-- ko ifnot: StatusTypeId() === -12-->
                                            <a class="booking-details-ics-icon" data-bind="click: function () { vems.GetICSDownload(Id(), 0); }">
                                                <i class="fa fa-download"></i>
                                            </a>
                                            <!-- /ko -->
                                        </td>
                                        <!-- /ko -->
                                        <td data-bind="text: moment(TimeBookingStart()).format('L')"></td>
                                        <td data-bind="text: moment(TimeBookingStart()).format('LT').replace(' ', '').toLowerCase() + ' - ' + moment(TimeBookingEnd()).format('LT').replace(' ', '').toLowerCase()"></td>
                                        <td data-bind="text: vems.decodeHtml(EventName())"></td>
                                        <!-- ko if: vems.bookingDetailsVM.ShowLocation() -->
                                        <td>
                                            <!-- ko if: vems.bookingDetailsVM.UserCanViewLocations() -->
                                            <a data-bind="text: vems.decodeHtml(Location()), attr: { href: LocationLink }"></a>
                                            <!-- /ko -->
                                            <!-- ko ifnot: vems.bookingDetailsVM.UserCanViewLocations() -->
                                            <span data-bind="text: vems.decodeHtml(Location())"></span>
                                            <!-- /ko -->
                                        </td>
                                        <!-- /ko -->
                                        <!-- ko if: vems.bookingDetailsVM.ShowGroupName() -->
                                        <td data-bind="text: vems.decodeHtml(GroupName())"></td>
                                        <!-- /ko -->
                                    </tr>
                                    <!-- /ko -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <!-- /ko -->
                </div>
            </div>
            <div class="modal-footer">
                <!-- ko if: IsMobile() && (IsCheckedIn() || ShowCheckinButton() || AllowCancel() || AllowEndNow()) -->
                <div class="row button-row">
                    <div class="col-xs-4 align-left" data-bind="visible: IsCheckedIn() || ShowCheckinButton()">
                        <button class="btn" disabled="disabled" data-bind="visible: IsCheckedIn(), text: ScreenText.CheckedInText"></button>
                        <button class="btn" data-bind="visible: ShowCheckinButton(), text: ScreenText.CheckInText, click: checkInToEvent"></button>
                    </div>
                    <div class="col-xs-4" data-bind="css: cancelAlignment, visible: AllowCancel() && (!IsHost() || OccurrenceCount() === 1)">
                        <button class="btn" data-bind="text: ScreenText.CancelText, click: cancelBooking"></button>
                    </div>
                    <div class="col-xs-4" data-bind="css: endNowAlignment, visible: AllowEndNow()">
                        <button class="btn" data-bind="text: ScreenText.EndNowText, click: endBookingNow"></button>
                    </div>
                </div>
                <!-- /ko -->
                <!-- ko if: ShowICS() && !IsMobile() -->
                <a class="pull-left booking-details-ics-link" href="#" data-bind="click: function (data, event) { if (ReservationId() > 0) { vems.GetICSDownload(0, ReservationId(), event); } else { vems.GetICSDownload(BookingId(), 0, event); } }">
                    <i class="fa fa-download booking-details-ics-icon"></i>&nbsp;
                    <span data-bind="text: ScreenText.DownloadIcsText"></span>
                </a>
                <!-- /ko -->
                <button type="button" class="btn btn-primary" id="close-btn" data-dismiss="modal" data-bind="text: ScreenText.CloseText"></button>
            </div>
        </div>
    </div>

    <!-- endnow modal -->
    <div class="modal fade" id="endnow-modal-bd" tabindex="-1" role="dialog" aria-labelledby="modal-title">
	    <div class="modal-dialog" role="document">
		    <div class="modal-content" id="endnow-modal-content-bd">
			    <div class="modal-header">
				    <button id="close-endnow-button" type="button" class="close" data-bind="click: closeEndNowModal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				    <h3 class="modal-title" data-bind="text: ScreenText.EndNowConfirmText"></h3>
			    </div>
			    <div class="modal-body">
				    <p class="date"></p>
				    <p class="event-name"></p>
				    <p class="location"></p>
			    </div>
			    <div class="modal-footer">
				    <button type="button" class="btn btn-default" id="endBookingBtn-bd" data-bind="text: ScreenText.YesEndBookingText"></button>
				    <button id="no-endnow-button" type="button" class="btn btn-primary" data-bind="text: ScreenText.NoDontEndText, click: closeEndNowModal"></button>
			    </div>
		    </div>
	    </div>
    </div>

    <!-- cancel modal -->
    <div class="modal fade" id="cancel-modal-bd" tabindex="-1" role="dialog" aria-labelledby="modal-title">
	    <div class="modal-dialog" role="document">
		    <div class="modal-content" id="cancel-modal-content-bd">
			    <div class="modal-header">
				    <button type="button" class="close" aria-label="Close" data-bind="click: closeCancelModal"><span aria-hidden="true">&times;</span></button>
				    <h3 class="modal-title" data-bind="text: ScreenText.CancelBookingQuestionText"></h3>
			    </div>
			    <div class="modal-body">
				    <p class="date"></p>
				    <p class="event-name"></p>
				    <p class="location"></p>
				    <div class="reason dropdown form-group">
					    <label class="control-label" for="cancel-reason" data-bind="text: ScreenText.CancelReasonText"></label>
					    <select class="form-control required" name="cancel-reason" data-bind="foreach: CancelReasons">
						    <!-- ko if: $index() === 0 -->
						    <option value=""></option>
						    <!-- /ko -->
						    <option data-bind="text: vems.decodeHtml(Reason), value: Id, attr: { 'data-notes-required': RequireNotes }"></option>
					    </select>
				    </div>
				    <div class="notes form-group">
					    <label class="control-label" for="cancel-notes" data-bind="text: ScreenText.CancelNotesText"></label>
					    <textarea name="cancel-notes" class="form-control" rows="3"></textarea>
				    </div>
			    </div>
			    <div class="modal-footer">
				    <button type="button" class="btn btn-default" id="cancel-btn-yes-bd" data-bind="text: ScreenText.YesCancelText"></button>
				    <button type="button" class="btn btn-primary" id="cancel-btn-no-bd" data-bind="text: ScreenText.NoCancelText, click: closeCancelModal"></button>
			    </div>
		    </div>
	    </div>
    </div>
</div>

