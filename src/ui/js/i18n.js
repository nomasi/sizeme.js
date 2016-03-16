(function(window) {
    "use strict";

    var SizeMeI18N = function (defaultLang) {
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

    window.SizeMeI18N = new SizeMeI18N("en");

})(window);