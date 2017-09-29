<%@ Import Namespace="Resources" %>
<%@ Import Namespace="Dea.Ems.Configuration" %>

<div class="summary-service-container" data-bind="foreach: services">
    <div class="service-order-container">
        <div class="category-head">
            <span data-bind="html: vems.decodeHtml(ReservationSummaryCategoryDisplay)"></span>

        </div>
        <table class="table table-striped summary-service-table">
            <!-- ko if: CategoryTypeCode == CategoryTypeCodes.NOT -->
            <tbody data-bind="foreach: TopLevelSods">
                <tr>
                    <td data-bind="text: vems.decodeHtml(Notes)"></td>
                </tr>
            </tbody>
            <!-- /ko -->
            <!-- ko if: CategoryTypeCode == CategoryTypeCodes.ATT -->
            <thead>
                <tr>
                    <th><%= EmsParameters.AttendeeNameLabel %></th>
                    <th><%= EmsParameters.AttendeeCompanyLabel %></th>
                    <th><%= EmsParameters.AttendeeEmailLabel %></th>
                    <th><%= EmsParameters.AttendeePhoneLabel %></th>
                    <th><%= EmsParameters.AttendeeNotesLabel %></th>
                    <th><%= EmsParameters.AttendeeVisitorLabel %></th>
                </tr>
            </thead>
            <tbody data-bind="foreach: TopLevelSods">
                <tr>
                    <td data-bind="text: vems.decodeHtml(ResourceDescription)"></td>
                    <td data-bind="text: vems.decodeHtml(CompanyName)"></td>
                    <td data-bind="text: vems.decodeHtml(EmailAddress)"></td>
                    <td data-bind="text: vems.decodeHtml(Phone)"></td>
                    <td data-bind="text: vems.decodeHtml(Notes)"></td>
                    <td data-bind="text: ExternalAttendee ? '<%= ScreenText.Yes %>    ' : '<%= ScreenText.No %>    '"></td>
                </tr>
            </tbody>
            <!-- /ko -->
            <!-- ko if: CategoryTypeCode != CategoryTypeCodes.NOT && CategoryTypeCode != CategoryTypeCodes.ATT -->
            <thead>
                <tr>
                    <th><%= ScreenText.QuantityAbbr %></th>
                    <th><%= ScreenText.Item %></th>
                    <!-- ko if: $root.showResourcePricing -->
                    <th><%= ScreenText.Price %></th>
                    <!-- /ko -->
                    <th><%= ScreenText.SpecialInstructions %></th>
                </tr>
            </thead>
            <tbody data-bind="foreach: TopLevelSods">
                <tr data-bind="css: { 'zero-quantity danger': Quantity == 0 }">
                    <td data-bind="text: Quantity"></td>
                    <td data-bind="text: vems.decodeHtml(ResourceDescription)"></td>
                    <!-- ko if: $root.showResourcePricing -->
                    <td data-bind="text: vems.decodeHtml(ResourcePrice)"></td>
                    <!-- /ko -->
                    <td data-bind="text: vems.decodeHtml(SpecialInstructions)"></td>
                </tr>
                <!-- ko if: ResourceGroups.length > 0  -->
                <tr>
                    <td></td>
                    <td colspan="99">
                        <div class="row" data-bind="foreach: ResourceGroups">
                            <div class="col-sm-4">
                                <div class="selection-head" data-bind="text: Description"></div>
                                <ul class="selection-container" data-bind="foreach: ResourceItems">
                                    <li class="selection-item" data-bind="text: Description"></li>
                                </ul>
                            </div>
                        </div>
                    </td>
                </tr>
                <!-- /ko -->
            </tbody>
            <!-- /ko -->
        </table>
    </div>
</div>
