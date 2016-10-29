/* globals SizeMe: false */
(function(window) {
    "use strict";

    var SizeMeI18N = function (defaultLang) {
		// langs defined by ISO 639-1 Language Code (fallback to english)
        var defLang = defaultLang || "en";

        var languages = {};
        languages[defLang] = {};

        this.add = function (lang, langObj) {
            languages[lang] = langObj;
        };

        this.get = function (lang) {
            return languages[lang] || languages[defLang];
        };
    };

    SizeMe.I18N = new SizeMeI18N("en");

})(window);