// SizeMe UI JS v1.0
// based on SizeMe Item Types 2015-10-01
// (c) SizeMe Inc.
// www.sizeme.com
// License undecided
/* jshint browser:true, jquery:true */
/* globals SizeMe: false, sizeme_options: false, sizeme_product: false */
(function (window, undefined) {
    SizeMe.sizemeInit = function ($) {

        var sizeme;

        var dataStorage = (function () {
            var type = "sessionStorage";

            function DataStorage() {
                try {
                    var _tstorage = window[type];
                    var x = '__storage_test__';
                    _tstorage.setItem(x, x);
                    _tstorage.removeItem(x);
                    this.storage = window[type];
                } catch (e) {
                    this.storage = null;
                }
            }

            DataStorage.prototype.storage = null;
            DataStorage.prototype.withStorage = function (callback) {
                if (this.storage === null) {
                    return;
                }

                return callback(this.storage);
            };

            return new DataStorage();
        })();

        var getAuthToken = function () {
            var deferred = $.Deferred();

            dataStorage.withStorage(function (storage) {
                var storedTokenObj = storage.getItem('authToken'),
                    storedToken;
                if (storedTokenObj !== null) {
                    storedToken = JSON.parse(storedTokenObj);
                    if (storedToken.expires !== undefined) {
                        storedToken.expires = Date.parse(storedToken.expires);
                        // Has token expired?
                        if (storedToken.expires > new Date().getTime()) {
                            if (storedToken.token !== undefined) {
                                deferred.resolve(storedToken.token);
                            } else {
                                deferred.reject(null);
                            }
                        }
                    }
                }
            });

            if (deferred.state() === "pending") {
                SizeMe.getAuthToken(function (authTokenObj) {
                    if (authTokenObj === null || authTokenObj.token === null) {
                        deferred.reject(null);
                    } else {
                        dataStorage.withStorage(function (storage) {
                            storage.setItem('authToken', JSON.stringify(authTokenObj));
                        });
                        deferred.resolve(authTokenObj.token);
                    }
                });
            }

            return deferred.promise();
        };

        var clearAuthToken = function () {
            dataStorage.withStorage(function (storage) {
                storage.removeItem('authToken');
            });
        };

        var initSizeme = function () {
            return getAuthToken().then(function (token) {
                sizeme = new SizeMe(token);
            });
        };

        var initProduct = function () {
            var productPromise = $.Deferred();
            if (typeof sizeme_product === "string") {
                SizeMe.getProductInfo(sizeme_product, function (product) {
                    var smProduct = new SizeMe.Item(
                        product.itemType, product.itemLayer, product.itemThickness, product.itemStretch
                    );
                    $.each(product.measurements, function (label, value) {
                        smProduct.addOption(label, SizeMe.Map.fromObject(value));
                    });
                    productPromise.resolve({
                        item: smProduct,
                        name: "T-SHIRT"
                    });
                }, function () {
                    productPromise.reject();
                });
            } else {
                productPromise.resolve(sizeme_product);
            }
            return productPromise;
        };

        var isLoggedIn = function () {
            return !!sizeme;
        };

        var setup = function (product) {
            var sizemeUI = SizeMe.UI($);

            var systemsGo = !!sizeme_options &&
                sizeme_options.service_status !== "off" &&
                product.item.itemType !== 0 &&
                sizemeUI.checkSystems(product);

            var doMatch = function (selectedProfile) {
                var item;
                if (typeof sizeme_product === "string") {
                    item = sizeme_product;
                } else {
                    item = $.extend({}, product.item);
                    var itemType = item.itemType;
                    if (itemType.indexOf('.') < 0) {
                        item.itemType = itemType.split('').join('.');
                    }
                }
                sizeme.match(new SizeMe.FitRequest(selectedProfile, item),
                    sizemeUI.matchResponseHandler,
                    sizemeUI.matchErrorHandler
                );
            };

            var loggedInCb = function () {
                sizemeUI.login();

                // *** SizeMe Magic
                if (isLoggedIn()) {
                    sizeme.fetchProfilesForAccount(function (profileList) {
                        sizemeUI.profileListHandler(profileList, doMatch);
                    });
                }
                // end of function 	loggedInCb
            };

            var loggedOutCb = function () {
                sizeme = null;
                sizemeUI.logout(function () {
                    initSizeme().then(loggedInCb);
                }, clearAuthToken);
            };

            if (systemsGo) {
                sizemeUI.init(product, loggedOutCb, isLoggedIn);
                if (sizemeUI.noThanks()) {
                    SizeMe.trackEvent("productPageNoSM", "Store: Product page load, SizeMe refused");
                    loggedOutCb();
                } else if (isLoggedIn()) {
                    SizeMe.trackEvent("productPageLoggedIn", "Store: Product page load, logged in");
                    loggedInCb();
                } else {
                    SizeMe.trackEvent("productPageLoggedOut", "Store: Product page load, logged out");
                    loggedOutCb();
                }

            }
            // *** End
        };

        $(function () {
            /**** TEST SETTINGS ****/
            SizeMe.contextAddress = "https://sizeme.greitco.com";
            console.log(sizeme_product);
            //window.sizeme_product = "M6969A | SIZEME T-SHIRT | BLACK | 161";
            /**** ****/
            var sizemeDef = $.Deferred();
            initSizeme().always(function () {
                sizemeDef.resolve();
            });

            $.when(initProduct(), sizemeDef).then(function (product) {
                console.log(product);
                setup(product);
            });
        });

    };

})(window);