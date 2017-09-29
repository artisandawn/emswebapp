/*
 * bleach
 * a minimal html sanitizer
 * cam@onswipe.com

 (The MIT License)

Copyright (c) 2011 Cam Pedersen cam@onswipe.com

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the 'Software'), to deal in 
the Software without restriction, including without limitation the rights to use, 
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the 
Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

//var fs = require('fs'),
//    ent = require('ent');

var bleach = {

    matcher: /<\/?([a-zA-Z0-9]+)*(.*?)\/?>?/igm,

    whitelist: [
      //'a',
      //'b',
      //'p',
      //'em',
      //'strong'
    ],

    analyze: function (html) {
        html = String(html) || '';

        var matches = [],
            match;

        // extract all tags
        while ((match = bleach.matcher.exec(html)) != null) {
            var attrr = match[2].split(' '),
                attrs = [];

            // extract attributes from the tag
            attrr.shift();
            attrr.forEach(function (attr) {
                attr = attr.split('=');
                var attr_name = attr[0],
                    attr_val = attr.length > 1 ? attr.slice(1).join('=') : null;
                // remove quotes from attributes
                if (attr_val && attr_val.charAt(0).match(/'|"/)) attr_val = attr_val.slice(1);
                if (attr_val && attr_val.charAt(attr_val.length - 1).match(/'|"/)) attr_val = attr_val.slice(0, -1);
                attr = {
                    name: attr_name,
                    value: attr_val
                };
                if (!attr.value) delete attr.value;
                if (attr.name) attrs.push(attr);
            });

            var tag = {
                full: match[0],
                name: match[1],
                attr: attrs
            };

            matches.push(tag);
        }

        return matches;
    },

    sanitize: function (html, options) {
        html = String(html) || '';
        options = options || {};

        var mode = options.mode || 'white',
            list = options.list || bleach.whitelist;

        var matches = bleach.analyze(html);

        if ((mode == 'white' && list.indexOf('script') == -1)
         || (mode == 'black' && list.indexOf('script') != -1)) {
            html = html.replace(/<script(.*?)>(.*?[\r\n])*?(.*?)(.*?[\r\n])*?<\/script>/gim, '');
        }


        if ((mode == 'white' && list.indexOf('style') == -1)
         || (mode == 'black' && list.indexOf('style') != -1)) {
            html = html.replace(/<style(.*?)>(.*?[\r\n])*?(.*?)(.*?[\r\n])*?<\/style>/gim, '');
        }

        matches.forEach(function (tag) {
            if (mode == 'white') {
                if (list.indexOf(tag.name) == -1) {
                    html = html.replace(tag.full, '');
                }
            } else if (mode == 'black') {
                if (list.indexOf(tag.name) != -1) {
                    html = html.replace(tag.full, '');
                }
            } else {
                throw new Error('Unknown sanitization mode "' + mode + '"');
            }
        });

        //if ( options.encode_entities ) html = ent.encode( html );

        return html;
    },

    //filter: function(html, filters) {
    //  html = String(html) || '';

    //  if (!filters) return;

    //  var available = fs.readdirSync(__dirname + '/../filters');

    //  if (Array.isArray(filters)) {
    //    for (var i in filters) {
    //      if (typeof filters[i] == 'function') {
    //        html = filters[i](html);
    //      } else {
    //        var file = filters[i] + '.js';
    //        for (var j in available) {
    //          if (file == available[j]) {
    //            html = require('../filters/' + file)(html);
    //          }
    //        }
    //      }
    //    }
    //    return html;
    //  } else if (typeof filters == 'string') {
    //    var file = filters + '.js';
    //    for (var i in available) {
    //      if (file == available[i]) {
    //        html = require('../filters/' + file)(html);
    //        return html;
    //      }
    //    }
    //    } else if (typeof filters == 'function') {
    //      html = filters(html);
    //      return html;
    //    } else return html;

    //}

};

//module.exports = bleach;
