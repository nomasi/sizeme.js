/* jshint browser:true, jquery:true */
/* globals sizemeInit: false, sizemeDeps: false */
(function (window, undefined) {
    "use strict";
    var init, maybeLoadJq;

    init = function (noConflict) {
        jQuery(document).ready(function () {
            sizemeDeps(jQuery);
            sizemeInit(jQuery);
            if (!noConflict) {
                jQuery.noConflict(true);
            }
        });
    };

    maybeLoadJq = function () {
        var jQ;
        if (!window.jQuery || !jQuery().jquery.startsWith("1")) {
            jQ = document.createElement('script');
            jQ.type = 'text/javascript';
            jQ.onload = jQ.onreadystatechange = init;
            jQ.src = '//code.jquery.com/jquery-1.12.4.min.js';
            return document.body.appendChild(jQ);
        } else {
            return init(true);
        }
    };

    if (window.addEventListener) {
        window.addEventListener('load', maybeLoadJq, false);
    } else if (window.attachEvent) {
        window.attachEvent('onload', maybeLoadJq);
    }
})(window);