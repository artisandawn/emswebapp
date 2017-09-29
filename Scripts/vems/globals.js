/// <reference path="jquery-1.4.2.min-vsdoc.js" />
//Add a trim function to ALL string elements
String.prototype.trim = function () { return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };
String.prototype.startsWith = function (str, matchCase) { if (matchCase) { return (this.match("^" + str) == str) } else { str = str.toLowerCase(); return (this.toLowerCase().match("^" + str) == str) } };
String.prototype.endsWith = function (str, matchCase) { if (matchCase) { return (this.match(str + "$") == str) } else { str = str.toLowerCase(); return (this.toLowerCase().match(str + "$") == str) } };
String.prototype.endsWithSuffix = function (suffix) { return this.indexOf(suffix, this.length - suffix.length) !== -1; };
String.prototype.format = function () { var pattern = /\{\d+\}/g; var args = arguments; return this.replace(pattern, function (capture) { return args[capture.match(/\d+/)] }) };
Array.prototype.remove = function (from, to) { var rest = this.slice((to || from) + 1 || this.length); this.length = from < 0 ? this.length + from : from; return this.push.apply(this, rest) };
Array.prototype.removeValue = function (v) { for (var i = 0, j = this.length; i < j; i++) { if (this[i] === v) { return this.remove(i) } } return this };
Array.prototype.toList = function (delim) { var s = ""; if (!delim) { delim = "," } for (var i = 0, j = this.length; i < j; i++) { if (i === 0) { s = this[i] } else { s += delim + this[i] } } return s };

var NS_XHTML = "http://www.w3.org/1999/xhtml", NS_STATE = "http://www.w3.org/2005/07/aaa";

if (typeof (Dea) === "undefined" || null === Dea) {
    var Dea = {};
}

Dea.emsData = {};
Dea.Mouse = {};
var _emsLabelsOnPage = null, iFrameDiag = null;
Dea.Keys = { PAGEUP: 33, PAGEDOWN: 34, END: 35, HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, SPACE: 32, TAB: 9, BACKSPACE: 8, DELETE: 46, ENTER: 13, INSERT: 45, ESCAPE: 27 };
Dea.isNumberKey = function (key) { if (key > 47 && key < 58) { return true; } else { return false; } }
Dea.isNavKey = function (key) { if (key === Dea.Keys.LEFT || key === Dea.Keys.RIGHT || key === Dea.Keys.UP || key === Dea.Keys.DOWN || key === Dea.Keys.BACKSPACE || key === Dea.Keys.HOME || key === Dea.Keys.END || key === Dea.Keys.TAB) { return true; } else { return false; } }
Dea.numberMask = function (e) {
    var key = e.which || e.keyCode;
    if (key == 46) {
        return true;
    }
    if (e.shiftKey && key == 35 || e.shiftKey && key == 36 || e.shiftKey && key == 37) {
        return false;
    }
    if (e.ctrlKey && key == 118) {
        return true; //allow paste, keyup event will restrict to number
    }
    return Dea.isNumberKey(key) || Dea.isNavKey(key);
}
Dea.keyUpTypeVal = function (e, s) {
    var box = e.target || e.srcElement;
    var reg = new RegExp(s);
    if (!reg.test($(box).val())) {
        $(box).val("");
    }
}
Dea.floatMask = function (e) { var key = e.which || e.keyCode; return Dea.isNumberKey(key) || Dea.isNavKey(key) || key === 46 || key == 44; }
Dea.suppressSubmitOnReturn = function (e) { var key = e.which || e.keyCode; if (key === Dea.Keys.ENTER) { return false; } }
Dea.matchEmsDataId = function (inputs, emsDataId) { for (var i = 0, j = inputs.length; i < j; i++) { var emsId = inputs[i].emsDataId || inputs[i].getAttribute("emsDataId"); if (emsId === emsDataId) { return inputs[i]; } else if (inputs[i].name === emsDataId) { return inputs[i]; } } return null; }
Dea.Get = function (emsDataId, inputs) { var o = emsDataId; if (typeof (emsDataId) === "string") { if (emsDataId.trim() === "" || emsDataId === "undefined") { return null } o = document.getElementById(emsDataId) } else if (typeof (emsDataId) === "function") { o = emsDataId() } if (o) { return o } o = null; if (!inputs || inputs === null) { inputs = document.getElementsByTagName("input") } o = Dea.matchEmsDataId(inputs, emsDataId); if (o !== null) { return o } inputs = document.getElementsByTagName("select"); o = Dea.matchEmsDataId(inputs, emsDataId); if (o !== null) { return o } inputs = document.getElementsByTagName("textarea"); o = Dea.matchEmsDataId(inputs, emsDataId); if (o !== null) { return o } return null };
Dea.setDisplay = function (o, sDisplay, left, top, position, right) { o = Dea.Get(o); if (o) { if (sDisplay === "none" || sDisplay === "hidden") { o.setAttribute("aria-hidden", "true") } else { o.setAttribute("aria-hidden", "false") } o.style.display = sDisplay; if (position && position !== null) { o.style.position = position } if (left && left !== null) { o.style.left = left } if (top && top !== null) { o.style.top = top } if (right && right !== null) { o.style.right = right } } };
Dea.findPos = function (o) { o = Dea.Get(o); if (o) { var curleft = curtop = 0; if (o.offsetParent) { curleft = o.offsetLeft; curtop = o.offsetTop; while (o = o.offsetParent) { curleft += o.offsetLeft; curtop += o.offsetTop; } } } return [curleft, curtop] };
Dea.Css = { classExists: function (o, c) { o = Dea.Get(o); return new RegExp('\\b' + c + '\\b').test(o.className) }, swapClass: function (o, c1, c2) { o = Dea.Get(o); o.className = !Dea.Css.classExists(o, c1) ? o.className.replace(c2, c1) : o.className.replace(c1, c2) }, addClass: function (o, c) { o = Dea.Get(o); if (!Dea.Css.classExists(o, c)) { o.className += o.className ? ' ' + c : c } }, removeClass: function (o, c) { o = Dea.Get(o); if (o.className) { var rep = o.className.match(' ' + c) ? ' ' + c : c; o.className = o.className.replace(rep, '') } } };
Dea.emptyToMinusOne = function (s) { if (s) { return s === "" ? "-1" : s; } return "-1"; }
Dea.setEmsData = function (ignoreValidation) { var inputs = document.getElementsByTagName("input"); for (var i = 0, j = inputs.length; i < j; i++) { var emsDataId = inputs[i].emsDataId || inputs[i].getAttribute("emsDataId"); var isRequired = inputs[i].isRequired || inputs[i].getAttribute("isRequired"); if (emsDataId) { if (isRequired) { if (inputs[i].value === "" && ignoreValidation !== true) { alert(inputs[i].errorMsg); return false } } if (inputs[i].type === "checkbox" || inputs[i].type === "radio") { if (inputs[i].checked) { Dea.emsData[emsDataId] = "1" } else { Dea.emsData[emsDataId] = "0" } } else { Dea.emsData[emsDataId] = inputs[i].value } } else if (inputs[i].name.substring(0, 4) === "ems_") { if (inputs[i].type === "checkbox") { if (inputs[i].checked) { Dea.emsData[inputs[i].name] = "1" } else { Dea.emsData[inputs[i].name] = "0" } } else { Dea.emsData[inputs[i].name] = inputs[i].value } } } var selects = document.getElementsByTagName("select"); for (var i = 0, j = selects.length; i < j; i++) { var emsDataId = selects[i].emsDataId || selects[i].getAttribute("emsDataId"); var isRequired = selects[i].isRequired || selects[i].getAttribute("isRequired"); if (emsDataId) { if (isRequired) { if ((selects[i].value === "" || selects[i].options[selects[i].selectedIndex].text === "") && ignoreValidation !== true) { alert(selects[i].errorMsg); return false } } Dea.emsData[emsDataId] = Dea.emptyToMinusOne(selects[i].value) } } var textAreas = document.getElementsByTagName("textarea"); for (var i = 0, j = textAreas.length; i < j; i++) { var emsDataId = textAreas[i].emsDataId || textAreas[i].getAttribute("emsDataId"); var isRequired = textAreas[i].isRequired || textAreas[i].getAttribute("isRequired"); if (emsDataId) { if (isRequired) { if (textAreas[i].value === "" && ignoreValidation !== true) { alert(textAreas[i].errorMsg); return false } } Dea.emsData[emsDataId] = textAreas[i].value } } return true }
Dea.getValue = function (o, inputs, dv) { o = Dea.Get(o, inputs); if (o) { return o.value.trim() } else { if (dv) { return dv } else { return "" } } }
Dea.setValue = function (o, v, inputs) { o = Dea.Get(o, inputs); if (o) { o.value = v; } }
Dea.setHtml = function (o, sHtml) { o = Dea.Get(o); if (o) { o.innerHTML = sHtml; } };
Dea.checkLength = function (e, emsDataId, maxLength) { if (Dea.Get(emsDataId).value.length < maxLength) { return true } else { var key = e.which || e.keyCode; if ((key === Dea.Keys.UP || key === Dea.Keys.RIGHT || key === Dea.Keys.LEFT || key === Dea.Keys.DOWN) || (key === Dea.Keys.BACKSPACE) || (key === Dea.Keys.DELETE)) { return true } else { return false } } }
Dea.showError = function (o, inputs, tab) { o = Dea.Get(o, inputs); if (o) { if (tab) { if (typeof (tab) === "string") { tab = Dea.Get(tab, inputs) } $(tab).click() } var msg = o.errorMsg || o.getAttribute("errorMsg"); alert(msg); o.focus() } };
Dea.setDisabled = function (o, setTo, inputs) {
    o = Dea.Get(o, inputs);
    if (o) {
        if (setTo) {
            $(o).attr("disabled", "disabled");
        }
        else {
            $(o).removeAttr("disabled");
        }
    }
}
Dea.hideSelectBoxes = function () { if (document.all) { var selects = document.getElementsByTagName("select"); for (var i = 0, j = selects.length; i < j; i++) { selects[i].style.visibility = "hidden" } } }
Dea.displaySelectBoxes = function () { if (document.all) { var selects = document.getElementsByTagName("select"); for (var i = 0, j = selects.length; i < j; i++) { selects[i].style.visibility = "visible" } } }
Dea.htmlDecode = function (s) { if (s) { if (s !== "undefined") { return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"') } } }
Dea.hideTimePicker = function () { var timePicker = Dea.Get("timeDrop"); if (timePicker) { if (!bLeaveTime) { if (timeBuilt === true) { Dea.setDisplay(timePicker, "none"); Dea.displaySelectBoxes(); timeBuilt = false } } else { if (timeBuilt === true) { Dea.hideSelectBoxes() } } } }
Dea.hidePickers = function () { if (Dea.Get("calendar")) { if (!bShow) { hideCalendar() } bShow = false } if (parent.gPopupIsShown) { parent.Dea.hideSelectBoxes() } Dea.hideTimePicker() }
Dea.clearLoading = function () { Dea.setDisplay("CallbackStatus", "none"); }
Dea.isMaxLengthValid = function (t, l) { return t.length <= l; }
Dea.errorCallback = function (result, context) { try { var emsResponse = Dea.JSON.parse(result) } catch (otherCallback) { emsResponse = result } if (typeof emsResponse.sendToPage !== 'undefined') { window.location.href = emsResponse.sendToPage; return true } alert(result); Dea.clearLoading() }
Dea.showLoading = function () { Dea.setDisplay("CallbackStatus", "", null, "5px", null, "5px") }
Dea.makeCallback = function (router, emsObject, suppressLoading) {
    if (!emsObject || emsObject === 'undefined') {
        emsObject = Dea.emsData;
    }
    emsObject.router = router;
    emsObject.deaCSRFToken = $("#" + deaCSRFTokenField).val();
    if (!suppressLoading) {
        Dea.showLoading();
    }
    Dea.pageCallback(emsObject);
}
Dea.handleCallback = function (result, context) {
    try {
        var emsResponse = Dea.JSON.parse(result)
    }
    catch (otherCallback) {
        if (otherCallback.message === "script stack space quota is exhausted") {
            var emsResponse = {};
            var aResult = result.split("\",\"");
            var sFirstPair = aResult[0];
            sFirstPair = sFirstPair.substr(2, sFirstPair.length - 2);
            var akv = sFirstPair.split("\":\"");
            eval("emsResponse." + akv[0] + " = \"" + akv[1] + "\"");
            for (var i = 1; i < aResult.length - 1; i++) {
                akv = aResult[i].split("\":\"");
                eval("emsResponse." + akv[0] + " = \"" + akv[1] + "\"")
            }
            var sLastPair = aResult[aResult.length - 1];
            sLastPair = sLastPair.substr(0, sLastPair.length - 2);
            akv = sLastPair.split("\":\"");
            eval("emsResponse." + akv[0] + " = \"" + akv[1] + "\"")
        }
        else {
            emsResponse = result;
        }
    }
    if (typeof emsResponse.success !== 'undefined') {
        if (Number(emsResponse.success) === 0) {
            if (typeof emsResponse.msg !== 'undefined') {
                alert(emsResponse.msg);
                if (typeof emsResponse.sendToPage !== 'undefined') {
                    window.location.href = emsResponse.sendToPage;
                    return true;
                }
                if (typeof (Dea.pageHandleErrorCallback) === "function") {
                    Dea.pageHandleErrorCallback(emsResponse, context)
                }
                Dea.clearLoading();
                return true;
            }
        }
    }
    if (typeof emsResponse.sendToPage !== 'undefined') {
        window.location.href = emsResponse.sendToPage;
        return true;
    }
    if (typeof emsResponse.isError !== 'undefined') {
        if (Number(emsResponse.isError) === 1) {
            alert(emsResponse.errorMsg);
            Dea.clearLoading();
            if (typeof (Dea.pageHandleErrorCallback) === "function") {
                Dea.pageHandleErrorCallback(emsResponse, context)
            }
            return true;
        }
    }
    if (!Dea.pageHandleCallback(emsResponse, context)) {
        alert("Unhandled callback " + context)
    }
    if (typeof Dea.emsData.suppressImageWireUp == 'undefined') {
        Dea.addImageRollovers();
    }
    else {
        if (Dea.emsData.suppressImageWireUp == 0) {
            Dea.addImageRollovers();
        }
    }
    Dea.clearLoading();
}

$.ctrl = function (key, callback, args) { $(document).keydown(function (e) { if (!args) { args = [] } if (e.keyCode == key.charCodeAt(0) && e.ctrlKey) { callback.apply(this, args); return false } }) };
Dea.loadLabels = function () {
    if (_emsLabelsOnPage === null) {
        _emsLabelsOnPage = document.getElementsByTagName("label");
    }
}
Dea.getLabelFromForAttr = function (id) {
    Dea.loadLabels();
    for (var i = 0; i < _emsLabelsOnPage.length; i++) {
        if (_emsLabelsOnPage[i].attributes["for"] !== null && _emsLabelsOnPage[i].attributes["for"] !== undefined) {
            if (_emsLabelsOnPage[i].attributes["for"].value === id) {
                return _emsLabelsOnPage[i];
            }
        }
    }
    return null;
}
Dea.addRequiredAsterisk = function (s) {
    if (s.indexOf(">*<") < 0) {
        s += "<span class=\"requiredAsterisk\">*</span>";
    }
    return s;
}
Dea.setLabelText = function (s, id) {
    var lbl = Dea.getLabelFromForAttr(id);
    if (lbl === null) {
        return;
    }
    s += ":";
    var box = Dea.Get(id);

    if (box.isRequired) {
        s = Dea.addRequiredAsterisk(s);
    }
    else {
        s = s.replace("<span class=\"requiredAsterisk\">*</span>", "");
    }
    lbl.innerHTML = s;
}
Dea.setLabelRequired = function (id) {
    var lbl = Dea.getLabelFromForAttr(id);
    if (lbl === null) {
        return;
    }
    lbl.innerHTML = Dea.addRequiredAsterisk(lbl.innerHTML);
}

$$ = function (s) { return $("#" + s); };
$emsid = function (emsDataId) { return $(Dea.Get(emsDataId)); }
Dea.addImageRollovers = function () { $("input[src*='btn-']").each(function () { Dea.addRollover($(this).attr("src"), $(this)) }); $("img[src*='btn-']").each(function () { Dea.addRollover($(this).attr("src"), $(this)) }) }
Dea.calRollover = function (img) { $("img[src='" + img + "']").each(function () { Dea.addRollover($(this).attr("src"), $(this)) }) }
Dea.addRollover = function (src, obj) { function alreadyApplied(src) { var imgName = src.substring(src.lastIndexOf("/") + 1); var srcParts = imgName.split("-"); if (srcParts.length > 2) { return true } return false } function getOverSource(src) { var imgName = src.substring(src.lastIndexOf("/") + 1); var parts = imgName.split("-"); var nameAndExt = parts[1].split("."); return PathToRoot + "images/" + parts[0] + "-" + nameAndExt[0] + "-over." + nameAndExt[1] } if (!alreadyApplied(src)) { var overSrc = getOverSource(src); $(obj).css("cursor", "pointer").hover(function () { $(obj).attr("src", overSrc) }, function () { $(obj).attr("src", src) }) } };
$(document).mousemove(function (e) { Dea.Mouse.X = e.pageX; Dea.Mouse.Y = e.pageY; });
Dea.setPopup = function () { $("#emsBody").removeClass("emsBody"); $("#FooterContainer").hide(); $("#emsCon").removeClass("emsCon"); $("div[class*=master]").removeClass(); }

Dea.IsValidEmail = function (s) {
    var emailFormat = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    if (s.trim().length > 0) {
        return emailFormat.test(s);
    }
    return true;
}
Dea.showTip = function (tipHtml, tipTitle) { $activeTipId = Dea.emsData.tipItemId; $("#tipDiv").html(tipHtml); $("#tipDiv").dialog({ width: 400, title: tipTitle, position: [Dea.mouseX, Dea.mouseY - $(window).scrollTop()] }).dialog('open') }
Dea.anchorTimes = function (sId, eId) { var oldTime = $.timePicker("#" + sId).getTime(); $$(sId).change(function () { if ($$(sId).val().length < ems_timeFormat.length) { return } if ($$(eId).val()) { var dur = ($.timePicker("#" + eId).getTime() - oldTime); var time = $.timePicker("#" + sId).getTime(); $.timePicker("#" + eId).setTime(new Date(new Date(time.getTime() + dur))); oldTime = time; $("#" + eId).focus() } else { var time = $.timePicker("#" + sId).getTime(); var t = new Date(new Date(time.getTime())); t.setMinutes(t.getMinutes() + 60); $.timePicker("#" + eId).setTime(t); oldTime = time; $("#" + eId).focus() } }) };
Dea.setTabs = function (tId) { $("ul.ui-tabs-nav").after('<div class="ui-widget-header ui-state-active tabLine" style="height:.5em;"></div>'); $("ul.ui-widget-header").removeClass("ui-widget-header"); if (tId) { $("#" + tId).removeClass("ui-widget-content") } };
Dea.checkVersion = function (ie6Error) {
    var ver = Dea.getInternetExplorerVersion();

}
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
Dea.getInternetExplorerVersion = function () {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}
if (typeof (Dea.dp) == "undefined") {
    Dea.dp = {};
}

Dea.dp.checkHoliday = function (date) {
    if (typeof (DeaHolidays) == "object") {
        var d = date.getDate(),
        m = date.getMonth() + 1,
        y = date.getFullYear();

        if (DeaHolidays[y] && DeaHolidays[y][m] && DeaHolidays[y][m][d]) {
            var s = DeaHolidays[y][m][d];
            return [true, "hol", s.tooltip];
        }
    }
    return [true, ''];
}


$(document).ready(function () {
    if (ems_useHelpIcon === 1) {
        $("#helpDialog").dialog({ title: ems_Help, autoOpen: false, width: 400, height: 300, modal: false, resizable: true });
        $("#helpIco").attr({ alt: ems_Help, title: ems_Help }).on('click', function (e) { $("#helpDialog").dialog('open'); });
        if ($("#ctl00_DefaultHelp").is(":empty")
            || $("#ctl00_DefaultHelp").html() == null
            || $("#ctl00_DefaultHelp").html().trim() == "<br>"
            || $("#ctl00_DefaultHelp").html().trim() == "") {
            $("#helpIco").hide();
        }
    } else {
        $("#helpIco").hide();
    }
    // $(document).bind("click", "", function (event) { if ($("#timeDrop").length > 0) { if (timeBuilt) { if (!bLeaveTime) { $("#timeDrop").hide(); } } } });

    $('body').append("<div id='tipDiv'></div>");
    $("#tipDiv").dialog({ autoOpen: false, resizable: false });
    //$(":button, input:submit, input:reset").button();
    Dea.addImageRollovers();
    $.idleTimer(ems_sessionMilli);
    $(document).bind("idle.idleTimer", function () {
        window.location.href = ems_timeOutUrl;
    });

    $(".staticMenu").focus(function () {
        var $pTable = $(this).closest('table');
        var m = $($pTable).parent();
        $(m).trigger("mouseover");
    });
    $(".staticMenu").blur(function () {
        var $pTable = $(this).closest('table');
        $($pTable).removeClass("staticMenuOver").addClass("staticMenu");
        $(this).removeClass("staticMenuOver").addClass("staticMenu");
    });
});

function showEmsDiag(id, options) {
    var diag = id;
    if (typeof (id) == "string") {
        diag = $('#' + id);
    }

    diag.dialog('destroy');
    diag.dialog(options);
    diag.dialog('open');
}
