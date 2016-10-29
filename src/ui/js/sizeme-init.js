// SizeMe UI JS v1.0
// based on SizeMe Item Types 2015-10-01
// (c) SizeMe Inc.
// www.sizeme.com
// License undecided
/* jshint browser:true, jquery:true */
/* globals SizeMe: false, sizeme_options: false, sizeme_product: false */
(function (window, undefined) {
    "use strict";
    SizeMe.sizemeInit = function ($) {

        var sizeme;

        var TokenHelper = function () {

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

            this.getAuthToken = function () {
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

            this.clearAuthToken = function () {
                dataStorage.withStorage(function (storage) {
                    storage.removeItem('authToken');
                });
            };

            this.isLoggedIn = function () {
                return !!sizeme;
            };
        };
        var tokenHelper = new TokenHelper();

        var initSizeme = function () {
            return tokenHelper.getAuthToken().then(function (token) {
                sizeme = new SizeMe(token);
            });
        };

        var initProduct = function () {
            var productPromise = $.Deferred();
            if (sizeme_product.SKU) {
                SizeMe.getProductInfo(sizeme_product.SKU, function (dbItem) {
                    // temporary kludge until item-map is fixed
                    (function () {
                        var itemMap = {};
                        $.each(sizeme_product.item, function (id, sku) {
                            itemMap[sku] = id;
                        });
                        sizeme_product.item = itemMap;
                    })();

                    var productItem = $.extend({}, dbItem, { measurements: {} });
                    $.each(dbItem.measurements, function (sku, values) {
                        if (sizeme_product.item[sku]) {
                            productItem.measurements[sizeme_product.item[sku]] = values;
                        }
                    });

                    var theProduct = $.extend({}, sizeme_product, { item: productItem });
                    productPromise.resolve(theProduct);
                }, function () {
                    productPromise.reject();
                });
            } else {
                productPromise.resolve(sizeme_product);
            }
            return productPromise;
        };

        var setup = function (product) {
            var sizemeUI;

            var checkMaxMeasurement = function () {
                var maxVal = 0;
                $.each(product.item.measurements, function (_, measurements) {
                    $.each(measurements, function (_, value) {
                        maxVal = Math.max(value, maxVal);
                    });
                });
                return maxVal !== 0;
            };

            var doMatch = function (selectedProfile) {
                var item;
                var matchHandler;
                if (sizeme_product.SKU) {
                    item = sizeme_product.SKU;
                    matchHandler = function (responseMap) {
                        var convertedResponseMap = {};
                        $.each(responseMap, function (sku, result) {
                            if (sizeme_product.item[sku]) {
                                convertedResponseMap[sizeme_product.item[sku]] = result;
                            }
                        });
                        sizemeUI.matchResponseHandler(convertedResponseMap);
                    };

                } else {
                    item = $.extend({}, product.item);
                    matchHandler = sizemeUI.matchResponseHandler;
                    var itemType = item.itemType;
                    if (itemType.indexOf('.') < 0) {
                        item.itemType = itemType.split('').join('.');
                    }
                }
                sizeme.match(new SizeMe.FitRequest(selectedProfile, item),
                    matchHandler,
                    sizemeUI.matchErrorHandler
                );
            };

            var loggedInCb = function () {
                sizemeUI.login(loggedOutCb);

                // *** SizeMe Magic
                if (tokenHelper.isLoggedIn()) {
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
                });
            };

            var systemsGo = !!sizeme_options &&
                sizeme_options.service_status !== "off" &&
                product.item.itemType !== 0 &&
                checkMaxMeasurement() &&
                (sizemeUI = SizeMe.UI($, product, tokenHelper));

            if (systemsGo) {
                if (sizemeUI.noThanks()) {
                    SizeMe.trackEvent("productPageNoSM", "Store: Product page load, SizeMe refused");
                    loggedOutCb();
                } else if (tokenHelper.isLoggedIn()) {
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
            var sizemeDef = $.Deferred();
            initSizeme().always(function () {
                sizemeDef.resolve();
            });

            $.when(initProduct(), sizemeDef).then(setup);
        });

    };

})(window);