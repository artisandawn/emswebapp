/// <reference path="jquery-1.4.2.min-vsdoc.js" />
Dea.Facility = function (buildingId, timezoneId) {
    this.BuildingId = buildingId;
    this.TimezoneId = timezoneId;
};

Dea.facilities = {
    facilities: [],
    containsBuilding: function (bid) {
        for (var i = 0, j = this.facilities.length; i < j; i++) {
            if (this.facilities[i].BuildingId === bid) {
                return true;
            }
        }
        return false;
    },
    load: function (s) {
        if (s) {
            var facilitiesToLoad = s.split('||');
            for (var i = 0, j = facilitiesToLoad.length; i < j; i++) {
                var f = facilitiesToLoad[i].split('|');
                if (this.containsBuilding(f[0]) === false) {
                    this.facilities.push(new Dea.Facility(f[0], f[1]));
                }
            }
        }
    },
    setTimezone: function (oFac) {
        var oTz = Dea.Get('TimeZone');
        if (oTz) {
            if (oTz.disabled) {
                if (Dea.EmsParameters) {
                    if (Dea.EmsParameters.isVC === '1' || Dea.EmsParameters.isPam === '1') {
                        return;
                    }
                }
            }
            var bId = oFac.value;
            var fac = null;
            for (var i = 0, j = this.facilities.length; i < j; i++) {
                if (this.facilities[i].BuildingId === bId) {
                    fac = this.facilities[i];
                    break;
                }
            }

            for (var i = 0, j = oTz.options.length; i < j; i++) {
                if (oTz.options[i].value === fac.TimezoneId) {
                    oTz.value = fac.TimezoneId;
                    return;
                }
            }
        }
    }
};
