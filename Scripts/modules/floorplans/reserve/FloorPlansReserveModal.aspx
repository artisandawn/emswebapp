<%@ Import Namespace="Resources" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<div class="modal fade floormap-modal" id="floormap-modal" tabindex="-1" role="dialog" aria-labelledby="modal-title" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content" style="width: 810px;">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h3 class="modal-title">
                    <%= ScreenText.FloorMap %>
                </h3>
            </div>
            <div class="modal-body">
                <div id="mobile-modal-map" data-bind="visible: isPhone()" style="height: 375px; max-width: 380px"></div><%--Needs to be here so some browsers can calculate width when it is loaded into DOM--%>
                <div id="modal-map" data-bind="visible: !isPhone()" style="height: 600px; width: 800px;"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal" data-target="#floormap-modal"><%= ScreenText.Close %></button>
            </div>
        </div>
    </div>
</div>
