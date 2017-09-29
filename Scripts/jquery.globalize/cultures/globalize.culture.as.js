/*
 * Globalize Culture as
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "as", "default", {
	name: "as",
	englishName: "Assamese",
	nativeName: "অসমীয়া",
	language: "as",
	numberFormat: {
		groupSizes: [3,2],
		"NaN": "nan",
		negativeInfinity: "-infinity",
		positiveInfinity: "infinity",
		percent: {
			pattern: ["-n%","n%"],
			groupSizes: [3,2]
		},
		currency: {
			pattern: ["$ -n","n$"],
			groupSizes: [3,2],
			symbol: "ট"
		}
	},
	calendars: {
		standard: {
			"/": "-",
			firstDay: 1,
			days: {
				names: ["সোমবাৰ","মঙ্গলবাৰ","বুধবাৰ","বৃহস্পতিবাৰ","শুক্রবাৰ","শনিবাৰ","ৰবিবাৰ"],
				namesAbbr: ["সোম.","মঙ্গল.","বুধ.","বৃহ.","শুক্র.","শনি.","ৰবি."],
				namesShort: ["সো","ম","বু","বৃ","শু","শ","র"]
			},
			months: {
				names: ["জানুৱাৰী","ফেব্রুৱাৰী","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগষ্ট","চেপ্টেম্বর","অক্টোবর","নবেম্বর","ডিচেম্বর",""],
				namesAbbr: ["জানু","ফেব্রু","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগষ্ট","চেপ্টে","অক্টো","নবে","ডিচে",""]
			},
			AM: ["ৰাতিপু","ৰাতিপু","ৰাতিপু"],
			PM: ["আবেলি","আবেলি","আবেলি"],
			eras: [{"name":"খ্রীষ্টাব্দ","start":null,"offset":0}],
			patterns: {
				d: "dd-MM-yyyy",
				D: "yyyy,MMMM dd, dddd",
				t: "tt h:mm",
				T: "tt h:mm:ss",
				f: "yyyy,MMMM dd, dddd tt h:mm",
				F: "yyyy,MMMM dd, dddd tt h:mm:ss",
				M: "dd MMMM",
				Y: "MMMM,yy"
			}
		}
	}
});

}( this ));
