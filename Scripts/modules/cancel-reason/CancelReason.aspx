<%@ Import Namespace="Resources" %>

<!-- ko if: activeBooking() -->
<div class="modal fade" id="cancel-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title">
    <div class="modal-dialog" role="document">
        <div class="modal-content" id="cancel-modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h3 class="modal-title"><%= ScreenText.CancelBookingQuestion %></h3>
            </div>
            <div class="modal-body">
				<p class="date">
                    <%-- GG - This is going to need to be changed at somepoint, so it's not hardcoded in en-US format--%>
                    <strong data-bind="text:
                                        moment(activeBooking().EventStart).format('dddd, MMMM Do, YYYY, [from] h:mm [to {0}] A')
                                        .replace('{0}', moment(activeBooking().EventEnd).format('h:mm'))">
                    </strong>
                </p>
				<p class="event-name" data-bind="text: vems.decodeHtml(activeBooking().EventName)"></p>
				<p class="location" data-bind="text: vems.decodeHtml(activeBooking().Location)"></p>
                <div class="reason dropdown form-group" data-bind="if: activeBooking().RequiresCancelReason">
                    <label class="control-label" for="cancel-reason"><%= ScreenText.CancelReason %></label>
                    <select class="form-control required" name="cancel-reason" data-bind="foreach: cancelReasons, value: activeBooking().DefaultCancelReason">
                        <!-- ko if: $index()  == 0 -->
                        <option value=""></option>
                        <!-- /ko -->
                        <option data-bind="text: vems.decodeHtml(Reason), value: Id, attr: { 'data-notes-required': RequireNotes }"></option>
                    </select>
                </div>
                <div class="notes form-group" data-bind="if: activeBooking().RequiresCancelReason">
                    <label class="control-label" for="cancel-notes"><%= ScreenText.CancelNotes %></label>
                    <textarea name="cancel-notes" class="form-control" rows="3"></textarea>
                </div>
			</div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" id="cancelBookingBtn"><%= ScreenText.YesCancel %></button>
                <button type="button" class="btn btn-primary" data-dismiss="modal"><%= ScreenText.NoCancel %></button>
            </div>
        </div>
    </div>
</div>
<!-- /ko -->
