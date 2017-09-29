<%@ Page Language="C#" MasterPageFile="~/MasterVirtualEms.master" AutoEventWireup="true"
    Inherits="GenerateCustomLink" Title="<%$Resources:PageTitles, GenerateCustomLink %>" CodeBehind="GenerateCustomLink.aspx.cs" %>

<%@ MasterType TypeName="Dea.Web.Core.BaseMasterPage" %>
<asp:Content ID="Content1" ContentPlaceHolderID="headContentHolder" runat="Server">
    <style>
        .row {
            margin-top: 20px;
            margin-left: 0;
            margin-right: 0;
        }

        input[type='checkbox'] {
            margin-right: 5px;
        }

        .child-container {
            margin-left: 20px;
            border-left: 2px dashed #C5C5C5;
        }

        .child-filter {
            margin-left: 10px;
        }

        .link-row{
            display: none;
        }

        .link-container {
            border: 1px solid #C5C5C5;
        }

        .custom-link-help{
            display: block; 
            color: grey;
            font-size: 10px;
        }
    </style>
    <script type="text/javascript">
        setTimeout(function () {
            setClasses();
        }, 0);

        Dea.pageHandleCallback = function (emsResponse, context) {
            setForFilterTypeChange();
            switch (context) {
                case "filterTypeChanged":
                    switch (emsResponse.filterType) {
                        case "2":
                            setForRooms(emsResponse);
                            break;
                        default:
                            setItems(emsResponse);
                            break;
                    }
                    setClasses();
                    return true;
                case "loadRooms":
                    setForLoadRooms(emsResponse);
                    setClasses();
                    return true;
                case "groupSearch":
                    Dea.setDisplay("groupSearchContainer", "");
                    setItems(emsResponse);
                    setClasses();
                    return true;
                case "generateLink":
                    Dea.setHtml("clickableLinkContainer", emsResponse.previewLink);
                    Dea.setHtml("encodedLinkContainer", emsResponse.encodedLink)

                    $('.link-row').show();
                    return true;
            }
            return false;
        }

        function setClasses() {
            $('#mainDisplay select').addClass('form-control');
            $('#mainDisplay input').not('[type=checkbox], [type=submit]').addClass('form-control');
            $('#mainDisplay input[type=submit]').addClass('btn btn-primary');
        }

        function setForLoadRooms(emsResponse) {
            Dea.setDisplay("buildingsContainer", "");
            Dea.setHtml("itemsContainer", emsResponse.itemsHtml);
        }

        function setForRooms(emsResponse) {
            Dea.setDisplay("buildingsContainer", "");
            Dea.setHtml("itemsContainer", emsResponse.itemsHtml);
            Dea.setHtml("buildingsContainer", emsResponse.facilitiesHtml);
        }

        function setItems(emsResponse) {
            Dea.setHtml("itemsContainer", emsResponse.itemsHtml);
        }

        function setForFilterTypeChange() {
            clearLinks();
            if (Dea.emsData.filterType !== "2") {
                Dea.setDisplay("buildingsContainer", "none");
            }
            if (Dea.emsData.filterType !== "3") {
                Dea.setDisplay("groupSearchContainer", "none");
            }
        }

        function clearLinks() {
            Dea.setHtml("clickableLinkContainer", "");
            Dea.setHtml("encodedLinkContainer", "");
        }

        function changeFilter(o) {
            var ft = o.value;
            Dea.emsData.filterType = ft;
            if (ft === "3") {
                setForFilterTypeChange();
                Dea.setDisplay("groupSearchContainer", "");
                Dea.makeCallback("filterTypeChanged");
            }
            else {
                Dea.emsData.ignoreDislayOnWeb = Dea.Get("IgnoreDisplayOnWeb").checked ? "1" : "0";
                Dea.makeCallback("filterTypeChanged");
            }
        }

        function loadRooms(o) {
            Dea.emsData.buildingId = o.value;
            Dea.emsData.ignoreDislayOnWeb = Dea.Get("IgnoreDisplayOnWeb").checked ? "1" : "0";
            Dea.makeCallback("loadRooms");
        }


        function groupSearch() {
            Dea.emsData.searchFor = Dea.getValue("SearchFor");
            Dea.emsData.filterType = "3";
            Dea.emsData.ignoreDislayOnWeb = Dea.Get("IgnoreDisplayOnWeb").checked ? "1" : "0";
            Dea.makeCallback("groupSearch");
            return false;
        }

        function reloadDrops() {
            changeFilter(Dea.Get("FilterType"));
        }

        function generateLink() {
            Dea.emsData.filterType = Dea.getValue("FilterType");
            if (Dea.emsData.filterType === "0") {
                Dea.showError("FilterType");
            }
            else {
                Dea.emsData.itemId = Dea.getValue("ItemId");
                if (Dea.emsData.itemId === "0" || Dea.emsData.itemId === "") {
                    alert(ems_ItemRequired);
                }
                else {
                    Dea.emsData.displayFormat = Dea.getValue("DisplayFormat");
                    Dea.emsData.logo = Dea.getValue("Logo");
                    Dea.emsData.linkTitle = Dea.getValue("LinkTitle");
                    Dea.emsData.ignoreDislayOnWeb = Dea.Get("IgnoreDisplayOnWeb").checked ? "0" : "1";
                    Dea.emsData.rollupToReservation = Dea.Get("RollUpToReservation").checked ? "1" : "0";
                    Dea.makeCallback("generateLink");
                }
            }
            return false;
        }

        function copyToClipboard(selector) {
            var element = document.querySelector(selector);
            element.select();

            try {
                var success = document.execCommand('copy');

                if (!success)
                    console.log('copy to clipboard failed');
            } catch (err) {
                console.log('copy to clipboard failed');
            }
        }
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="pc" runat="Server">
    <div id="mainDisplay">
        <Dea:DropDownWithLabel ID="FilterType" runat="server" IsRequired="true" IncludeColon="false" Prompt="<%$Resources:ScreenText, FilterType %>" CssClass="row" AjaxCall="changeFilter(this);" EmsDataId="FilterType" />
        <div class="child-container">
            <div id="buildingsContainer" style="display: none" class="child-filter">
                <Dea:DropDownWithLabel ID="Facilities" runat="server" IncludeColon="false" Prompt="<%$Resources:ScreenText, Facilities %>" CssClass="row"
                    EmsDataId="BuildingId" AjaxCall="loadRooms(this);" />
            </div>
            <div id="groupSearchContainer" style="display: none;" aria-hidden="true" class="child-filter">
                <Dea:TextBoxWithLabel ID="SearchFor" runat="server" IncludeColon="false" Prompt="<%$Resources:ScreenText, SearchFor %>" CssClass="row" EmsDataId="SearchFor" SuppressSubmitOnReturn="true" />
                <asp:Button ID="SearchButton" runat="server" Text="<%$Resources:ScreenText, Search %>" CssClass="row" OnClientClick="return groupSearch();" />
            </div>
            <div id="itemsContainer" class="child-filter">
                <Dea:DropDownWithLabel ID="ItemIds" runat="server" IncludeColon="false" Prompt="<%$Resources:ScreenText, SelectItem %>" CssClass="row" EmsDataId="ItemId" IsRequired="true" />
            </div>
        </div>
        <Dea:DropDownWithLabel ID="DisplayFormat" runat="server" IncludeColon="false" Prompt="<%$Resources:ScreenText, DisplayFormat %>" CssClass="row" EmsDataId="DisplayFormat">
            <items>
                <asp:ListItem value="0" text="<%$Resources:ScreenText, DailyList %>" />
                <asp:ListItem value="1" text="<%$Resources:ScreenText, WeeklyList %>" />
                <asp:ListItem value="2" text="<%$Resources:ScreenText, MonthlyList %>" />
                <%--<asp:ListItem value="3" text="<%$Resources:ScreenText, WeeklyCalendar %>" />
                <asp:ListItem value="4" text="<%$Resources:ScreenText, MonthlyCalendar %>" />--%>
            </items>
        </Dea:DropDownWithLabel>
        <Dea:TextBoxWithLabel ID="Logo" runat="server" IncludeColon="false" Prompt="<%$Resources:ScreenText, CustomLinkLogo %>" CssClass="row" EmsDataId="Logo" SuppressSubmitOnReturn="true" />
        <Dea:TextBoxWithLabel ID="linkTitle" runat="server" IncludeColon="false" Prompt="<%$Resources:ScreenText, Title %>" CssClass="row" EmsDataId="LinkTitle" SuppressSubmitOnReturn="true" />

        <div style="margin: 10px 0">
            <div>
                <Dea:DeaCheckBox ID="IgnoreDisplayOnWeb" IncludeColon="false" runat="server" Text="<%$Resources:ScreenText, IgnoreEveryDayUserApplicationDisplaySettings %>" EmsDataId="IgnoreDisplayOnWeb" />
            </div>
            <div>
                <Dea:DeaCheckBox ID="RollUpToReservation" IncludeColon="false" runat="server" Text="<%$Resources:ScreenText, CollapseBookingsToReservationLevel %>" EmsDataId="RollUpToReservation" />
            </div>
        </div>
        <asp:Button ID="GenerateLinkButton" runat="server" Text="<%$Resources:ScreenText, CreateCustomLink %>" CssClass="row" OnClientClick="return generateLink();" />

        <div class="row link-row">
            <div class="col-sm-2">
                <button type="button" class="btn btn-main" onclick="copyToClipboard('#clickableLinkContainer')"><%= Resources.ScreenText.CopyURL %></button>
            </div>
            <div class="col-sm-10">
                <textarea id="clickableLinkContainer" class="link-container" aria-live="polite" aria-atomic="true" style="height: 150px; width:100%; word-break: break-word;"></textarea>
            </div>
        </div>
        <div class="row link-row">
            <div class="col-sm-2">
                <button type="button" class="btn btn-main" onclick="copyToClipboard('#encodedLinkContainer')"><%= Resources.ScreenText.CopyEmbed %></button>
            </div>
            <div class="col-sm-10">
                <textarea id="encodedLinkContainer" class="link-container" aria-live="polite" aria-atomic="true" style="height: 150px; width:100%; word-break: break-word;"></textarea>
            </div>
        </div>

    </div>
    <script type="text/javascript">
        $('[for=pc_Logo_box]').after("<label class='custom-link-help'><%= Resources.ScreenText.CustomLinkLogoHelp %></label>")
    </script>
</asp:Content>

