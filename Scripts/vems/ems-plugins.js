/// <reference path="jquery-1.4.2.min-vsdoc.js" />
(function ($) {
    $.fn.addRowHighlights = function (options) {
        var defaults = {
			highlightCss: 'ui-state-highlight', 
            thCss: 'white-widget-header'
        };
        options = $.extend(defaults, options);
		return this.each(function () {
			var obj = $(this);
			obj.addClass('ui-widget');
			obj.find('tr').on('mouseover mouseout', function (event) {
				if (event.type === 'mouseover') {
					$(this).children('td:not(.ui-widget-header)').addClass(options.highlightCss);
				} else {
					$(this).children('td').removeClass(options.highlightCss);
				}
			});
			obj.find('th').addClass(options.thCss);
			obj.find('td:not(.ui-widget-header)').addClass('ui-widget-content');
		});
		return this;
	};
})(jQuery);

var $activeTipId = 0;
(function ($) {
	$.fn.emsTip = function (options) {
		var defaults = {
			tipDelay: 1000,
			hideDelay: 500,
			callbackRouter: 'getTip', 
			tag: 'tr'
		};
		options = $.extend(defaults, options);
		var openTimer = null;
		var hideTimer = null;
		
		$('#tipDiv').mouseover(function () {
			if (hideTimer) {
				clearTimeout(hideTimer);
			}
			if (openTimer) {
				clearTimeout(openTimer);
			}
		});

		// Hide after mouseout  
		$('#tipDiv').mouseout(function () {
			if (hideTimer) {
				clearTimeout(hideTimer);
			}
			if (openTimer) {
				clearTimeout(openTimer);
			}
			hideTimer = setTimeout(function () {
                $activeTipId = 0;
				$('#tipDiv').dialog('close');
			}, options.hideDelay);
		});

		$('.ui-dialog').mouseover(function () {
			if (hideTimer) {
				clearTimeout(hideTimer);
			}
			if (openTimer) {
				clearTimeout(openTimer);
			}
		});

		$('.ui-dialog').mouseout(function () {
			if (hideTimer) {
				clearTimeout(hideTimer);
			}
			if (openTimer) {
				clearTimeout(openTimer);
			}
			hideTimer = setTimeout(function () {
                $activeTipId = 0;
				$('#tipDiv').dialog('close');
			}, options.hideDelay);
		});

		return this.each(function () {
			var obj = $(this);
			  obj.find('[data-tipId]').mouseover(function (event) {
					if (openTimer) {clearTimeout(openTimer);}
					if (hideTimer) {clearTimeout(hideTimer);}
					var tipId = $(this).attr('data-tipId');
						
					if (tipId !== '') {
						if ($activeTipId !== tipId) {
							$('#tipDiv').dialog('close');
							openTimer = setTimeout(function () {
								Dea.mouseX = event.pageX;
								Dea.mouseY = event.pageY;
								Dea.setEmsData(true);
								Dea.emsData.tipItemId = tipId;
								Dea.makeCallback(options.callbackRouter);
									
							}, options.tipDelay);
						}
					}
			 }).mouseout(function(event) {
					if (hideTimer) {clearTimeout(hideTimer);}
					if (openTimer) {clearTimeout(openTimer);}
					hideTimer = setTimeout(function () {
                        $activeTipId = 0;
						$('#tipDiv').dialog('close');
					}, options.hideDelay);
				}
             );
		});
		return this; 
	};
})(jQuery);

/*Adapted from: 
 * A time picker for jQuery
 * Based on original timePicker by Sam Collet (http://www.texotela.co.uk) -
 * copyright (c) 2006 Sam Collett (http://www.texotela.co.uk)
 *
 * Dual licensed under the MIT and GPL licenses.
 * Copyright (c) 2009 Anders Fajerson
 */
(function ($) {
	$.fn.timePicker = function(options) {
		var defaults = {
			increment: 15,
			startTime: new Date(0,0,0,0,0,0),
			endTime: new Date(0,0,0,23,45,0),
			separator: ems_timeSep,
			am: ems_AM,
			pm: ems_PM,
			timeFormat: ems_timeFormat, 
			use24Format: (ems_timeFormat.indexOf('t') === -1)
		};
		var settings = $.extend(defaults, options);
		return this.each(function () {
			$.timePicker(this,settings);
		});
	};

	$.timePicker = function (obj, settings) {
		var e = $(obj)[0];
		return e.timePicker || (e.timePicker = new jQuery._timePicker(e, settings));
	};

	$._timePicker = function (obj, settings) {
		var overPicker = false, isKeyDown = false, startTime = timeToDate(settings.startTime, settings), endTime = timeToDate(settings.endTime, settings);
		$(obj).attr('autocomplete', 'OFF');
		$(obj).css('width', '7em');
		//build values for drop down
		var times = [];
		var onTime = new Date(startTime);
		while(onTime <= endTime) {
			times[times.length] = formatTime(onTime, settings);
			onTime = new Date(onTime.setMinutes(onTime.getMinutes() + settings.increment));
		}
		
		var $timePickerDiv = $('<div class="ui-timePicker' + (settings.use24Format ? '' : ' ui-timePicker-12hours') + '"></div>');
		var $timePickerList = $('<ul></ul>');

		for(var i = 0, j = times.length; i < j; i++) {
			$timePickerList.append('<li>' + times[i] + '</li>');
		}
		$timePickerDiv.append($timePickerList);
		//position our div and hide it
		$timePickerDiv.appendTo('body').hide();

		$timePickerDiv.mouseover( function() {
			overPicker = true;
		}).mouseout(function () {
			overPicker = false;
		});

		$('li', $timePickerList).mouseover(function() {
			if(!isKeyDown) {
				$('li.tpSelected', $timePickerDiv).removeClass('tpSelected');
				$(this).addClass('tpSelected');
			}
		}).mousedown(function() {
			overPicker = true;
		}).click(function() {
			setTimeValue(obj, this, $timePickerDiv, settings);
			overPicker = false;
		});

		var showPicker = function() {
			if($timePickerDiv.is(':visible')) {
				return false;
			}

			$('li', $timePickerDiv).removeClass('tpSelected');
			var offset = $(obj).offset();
			$timePickerDiv.css({'position': 'absolute', 'top':offset.top + 21 + 'px', 'left': offset.left + 'px', 'z-index': 99999});
			$timePickerDiv.show();
			$(obj).focus();
			
			//load selected time
			var time =  $(obj).val() ? timeStringToDate($(obj).val(), settings) : startTime;
			var minStart = startTime.getHours() * 60 + startTime.getMinutes();
			var min = (time.getHours() * 60 + time.getMinutes()) - minStart;
			var steps = Math.round(min / settings.increment);
			var roundTime = normalizeTime(new Date( 0, 0, 0, 0, (steps * settings.increment + minStart), 0));
			roundTime = (startTime < roundTime && roundTime <= endTime) ? roundTime : startTime;
			var $matched = $('li:contains(' + formatTime(roundTime, settings) + ')', $timePickerDiv);

			//did we find it?
			if($matched.length) {
				$matched.addClass('tpSelected');
				$timePickerDiv[0].scrollTop = $matched[0].offsetTop;
			}

			return true;
		};

		$(obj)['after']('<img id="tp' + $(obj).attr('id') + '" src="Images/btn-TimePicker.png" class="ui-timePicker-trigger" alt="' + ems_timePicker + '" title="' + ems_timePicker + '" style="vertical-align:bottom" />');
		$('img[src*=\'btn-TimePicker.png\'], #tp' + $(obj).attr('id')).hover(function () { $(this).attr('src', 'images/btn-TimePicker-over.png'); }, function () { $(this).attr('src', 'images/btn-TimePicker.png'); });
		
		$('#tp' + $(obj).attr('id')).click(showPicker);

		$(obj).blur(function() {
			if(!overPicker) {
				$timePickerDiv.hide();
				validateTime(obj, settings);
			}
		});

		var event = $.browser.mozilla ? 'keypress' : 'keydown';
		$(obj)[event](function(e) {
			var $selected;
			isKeyDown = true;
			var top = $timePickerDiv[0].scrollTop;
			switch(e.keyCode) {
			   case 38: //up
					if(showPicker()) {
						return false;
					}
					$selected = $('li.tpSelected', $timePickerList);
					var prev = $selected.prev().addClass('tpSelected')[0];
					if(prev) {
						$selected.removeClass('tpSelected');
						if(prev.offsetTop < top) {
							$timePickerDiv[0].scrollTop = top - prev.offsetHeight;
						}
					}
					else {
						$selected.removeClass('tpSelected');
						prev = $('li:last', $timePickerList).addClass('tpSelected')[0];
						$timePickerDiv[0].scrollTop = prev.offsetTop - prev.offsetHeight;
					}
					return false;
				case 40: //down
					if (showPicker()) {
					  return false;
					}
					$selected = $('li.tpSelected', $timePickerList);
					var next = $selected.next().addClass('tpSelected')[0];
					if (next) {
						$selected.removeClass('tpSelected');
						if (next.offsetTop + next.offsetHeight > top + $timePickerDiv[0].offsetHeight) {
							$timePickerDiv[0].scrollTop = top + next.offsetHeight;
						}
					}
					else {
						$selected.removeClass('tpSelected');
						next = $('li:first', $timePickerList).addClass('tpSelected')[0];
						$timePickerDiv[0].scrollTop = 0;
					}
					return false;
				case 13: // Enter
					if ($timePickerDiv.is(':visible')) {
						setTimeValue(obj, $('li.tpSelected', $timePickerList)[0], $timePickerDiv, settings);
					}
					return false;
				case 27: // Esc
					$timePickerDiv.hide();
					return false;
			}
			return true;
		});
		$(obj).keyup(function() { isKeyDown = false; });

		this.getTime = function () {
		  return timeToDate(obj.value, settings);
		};

		this.setTime = function (time) {
			obj.value = formatTime(normalizeTime(time), settings);
			$(obj).change();
		};
	}; //end fn

	//privates
	function setTimeValue(obj, sel, $timePickerDiv, settings) {
	   setTimeFromValue(obj, $(sel).text());
	   $timePickerDiv.hide();
	}

	function setTimeFromValue(obj, t) {
	   $(obj).val(t);
	   $(obj).change();
	}

	function invalidTime(obj)
	{
		obj.value = ''; 
		alert(ems_InvalidTime);
	}

	function validateTime(obj, settings) {
		var t = '';
		t = $(obj).val().toLowerCase();
		t = t.replace(' ', '');

        var timeAndDesig = removeAmPmDesignator(t, settings);
        var timeWithoutDesignator = timeAndDesig[0];
        var desig = timeAndDesig[1];

		if(timeWithoutDesignator === '') {
            $(obj).val('');
			return;
		}
		var timeParts = timeWithoutDesignator.split(settings.separator);
		
		if(timeParts.length === 1)
		{
			try
			{
				if(timeParts[0].length > 2)
				{
				   invalidTime(obj);
				   return; 
				}       
				var hours = Number(timeParts[0]);
				if(hours >= 0 &&  hours < 24)
				{
					if(desig === 'pm') {
						if(hours < 12) {
							hours += 12;
						}
					}
                    else {
                        if(desig === 'am') {
                            if(hours === 12) {
                                hours = 0;
                            }
                        }
                    }
					setTimeFromValue(obj,formatTime(new Date(0,0,0, hours, 0,0), settings));
					return; 
				} 
				else
				{
					invalidTime(obj);
					return; 
				}
			}
			catch(badTime)
			{
				invalidTime(obj);
				return; 
			}
		}//end if no sep
		else if(timeParts.length === 2 || timeParts.length === 3)	{ 
			try
			{
				var hours = Number(timeParts[0]);
				var minutes =  Math.floor(Number(timeParts[1])); 
				if(minutes >= 0 && minutes < 60)
				{
					if((hours >= 0 &&  hours < 24))
					{
						if(desig === 'pm') {
						    if(hours < 12) {
							    hours += 12;
					    	    }
					    }
                        else {
                           if(desig === 'am') {
                               if(hours === 12) {
                                   hours = 0;
                               }
                           }
                        }
						setTimeFromValue(obj,formatTime(new Date(0,0,0, hours, minutes, 0), settings));
						return; 
					}  
					else
					{
						invalidTime(obj);
						return; 
					}
				}
				else
				{
					invalidTime(obj); 
					return; 
				}
			}
			catch(badTime)
			{
				invalidTime(obj);
				return; 
			} 
		}
		else
		{
			invalidTime(obj);
			return; 
		}
	}

	function formatTime(time, settings) {
		
		var h = time.getHours();
		var hours = settings.use24Format ? h : (((h + 11) % 12) + 1);
		var formattedTime = settings.timeFormat.toLowerCase();
		var minutes = time.getMinutes();

		if(settings.use24Format) {
			formattedTime = formattedTime.replace('hh', formatNumber(hours));
			formattedTime = formattedTime.replace('h', formatNumber(hours));
		}
		else {
		   formattedTime = formattedTime.replace('hh', hours);
		   formattedTime = formattedTime.replace('h', hours);
		}
			
		formattedTime = formattedTime.replace('mm', formatNumber(minutes));
		formattedTime = formattedTime.replace('m', formatNumber(minutes));

        formattedTime = formattedTime.replace('ss', formatNumber(0));
		formattedTime = formattedTime.replace('s', formatNumber(0));
			
		formattedTime = formattedTime.replace('tt', ( (h < 12) ? settings.am : settings.pm));
		formattedTime = formattedTime.replace('t', ( (h < 12) ? settings.am : settings.pm));
		
		return formattedTime;
	}

    function removeAmPmDesignator(t, settings) {
        var timeStringLength = t.length;
        var desig = '';
        var timeWithoutDesignator;
		if(timeStringLength > 1)
		{
			timeWithoutDesignator = t;
			if(settings.am.length > 0) {
                if (t.endsWith(settings.am)) {
					timeWithoutDesignator = t.substring(0, timeStringLength - settings.am.length);
					desig = 'am';
				}
                else if (t.endsWith(settings.pm)) {
					timeWithoutDesignator = t.substring(0, timeStringLength - settings.pm.length);
					desig = 'pm';
				}
				else if (t.endsWith(settings.am.substring(0, 1))) {
					timeWithoutDesignator = t.substring(0, timeStringLength - 1);
					desig = 'am';
				}
				else if (t.endsWith(settings.pm.substring(0,1))) {
					timeWithoutDesignator = t.substring(0, timeStringLength - 1);
					desig = 'pm';
				}
				else if (t.startsWith(settings.am)) {
					timeWithoutDesignator = t.substr(settings.am.length);
					desig = 'am';
				}
				else if (t.startsWith(settings.pm)) {
					timeWithoutDesignator = t.substr(settings.pm.length);
					desig = 'pm';
				}
			}
		}
		else {
			timeWithoutDesignator = t;
		}
        return [timeWithoutDesignator, desig];
    }


	function formatNumber(n) {
		return (n < 10 ? '0' : '') + n;
	}
	function timeToDate(o, settings) {
		return (typeof o === 'object') ? normalizeTime(o) : timeStringToDate(o, settings);
	}
	function timeStringToDate(o, settings) {
		if(o) {
			var parts = o.split(settings.separator);
            
			var hours = parseFloat(removeAmPmDesignator(parts[0], settings)[0]);
			var minutes = parseFloat(removeAmPmDesignator(parts[1], settings)[0]);
			if(!settings.use24Format) {
				if(hours === 12 && o.indexOf(settings.am) !== -1) {
					hours = 0;
				}
				else if (hours !== 12 && o.indexOf(settings.pm) !== -1) {
					hours += 12;
				}
			}
			var time = new Date(0, 0, 0, hours, minutes, 0);
			return normalizeTime(time);
		}
		return null;
	}

	function normalizeTime(time) {
	 time.setFullYear(2001);
	 time.setMonth(0);
	 time.setDate(0);
	 return time;
	}


})(jQuery);

(function ($) {
    $.maxZIndex = $.fn.maxZIndex = function (opt) {
        var def = { inc: 10, group: '*' };
        $.extend(def, opt);
        var zmax = 0;
        $(def.group).each(function () {
            var cur = parseInt($(this).css('z-index'));
            zmax = cur > zmax ? cur : zmax;
        });
        if (!this.jquery) {
            return zmax;
        }
        return this.each(function () {
            zmax += def.inc;
            $(this).css('z-index', zmax);
        });
    };
})(jQuery);