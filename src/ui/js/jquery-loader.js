/* jshint browser:true, jquery:true */
/* globals SizeMe:false */
(function (window, undefined) {
    "use strict";
    var init, maybeLoadJq;

    init = function (callNoConflict) {
        jQuery(document).ready(function () {
            SizeMe.sizemeDeps(jQuery);
            SizeMe.sizemeInit(jQuery);
            if (callNoConflict) {
                jQuery.noConflict(true);
            }
        });
    };

    maybeLoadJq = function () {
        var jQ;
        if (!window.jQuery || !jQuery().jquery.startsWith("1")) {
            jQ = document.createElement('script');
            jQ.type = 'text/javascript';
            jQ.onload = jQ.onreadystatechange = function () { init(true); }
            jQ.src = '//code.jquery.com/jquery-1.12.4.min.js';
            return document.body.appendChild(jQ);
        } else {
            return init(false);
        }
    };

    if (window.addEventListener) {
        window.addEventListener('load', maybeLoadJq, false);
    } else if (window.attachEvent) {
        window.attachEvent('onload', maybeLoadJq);
    }
})(window);