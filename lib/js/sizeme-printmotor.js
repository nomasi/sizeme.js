var sizeme_UI_options = {
	appendContentTo: ".sizeme-size-guide",
	appendSplashTo: ".descriptionholder .variationdataholder-size",
	sizeSelectionContainer: ".variationdata-size",
	addToCartElement: ".addtocartlink",
	addToCartEvent: "click",
	lang: "en"
};
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');


/*
 Helper object to handle the communication to the SizeMe server.
  Exposes two functions to fetch the profiles for the accountInfo and
  get the match results for the items.

  @version 2.0
 */

(function() {
  var SizeMe,
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  SizeMe = (function() {

    /*
      Address for the SizeMe API service
     */
    var _authToken, _facepalm, addMessageListener, createCORSRequest, createFitResponse, defaultErrorCallback, gaEnabled, removeMessageListener;

    SizeMe.contextAddress = "https://www.sizeme.com";

    SizeMe.gaTrackingID = "UA-40735596-1";

    gaEnabled = false;

    ga(function() {
      return gaEnabled = SizeMe.gaTrackingID != null;
    });


    /*
      Version of the API
     */

    SizeMe.version = "2.1";

    _authToken = void 0;

    _facepalm = !("withCredentials" in new XMLHttpRequest());


    /*
      Creates a new instance of SizeMe
    
      @param [Object] authToken the authentication token for the SizeMe service,
        obtained with the {SizeMe.getAuthToken} method.
     */

    function SizeMe(authToken) {
      _authToken = authToken;
    }

    addMessageListener = function(callback) {
      if (window.attachEvent != null) {
        return window.attachEvent("onmessage", callback);
      } else {
        return window.addEventListener("message", callback);
      }
    };

    removeMessageListener = function(callback) {
      if (window.detachEvent != null) {
        return window.detachEvent("onmessage", callback);
      } else {
        return window.removeEventListener("message", callback);
      }
    };

    createCORSRequest = function(method, service, callback, errorCallback) {
      var url, xhr;
      xhr = void 0;
      url = "" + SizeMe.contextAddress + service;
      if (!_facepalm) {
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              return callback(xhr);
            } else {
              return errorCallback(xhr);
            }
          }
        };
        xhr.open(method, url, true);
        if (_authToken != null) {
          xhr.setRequestHeader("Authorization", "Bearer " + _authToken);
        }
        if (gaEnabled) {
          xhr.setRequestHeader("X-Analytics-Enabled", "true");
        }
      } else if (typeof XDomainRequest !== "undefined" && XDomainRequest !== null) {
        xhr = new XDomainRequest();
        url = url + "?_tm=" + (new Date().getTime());
        if (_authToken != null) {
          url = url + "&authToken=" + _authToken;
        }
        if (gaEnabled) {
          url = url + "&analyticsEnabled=true";
        }
        xhr.onload = function() {
          return callback(xhr);
        };
        xhr.onerror = function() {
          return errorCallback(xhr);
        };
        xhr.open(method, url, true);
      } else {
        console.error("Unsupported browser");
      }
      return xhr;
    };

    defaultErrorCallback = function(xhr, status, statusText) {
      if (window.console && console.log) {
        return console.log("Error: " + statusText + " (" + status + ")");
      }
    };

    SizeMe.trackEvent = function(action, label) {
      if (SizeMe.gaTrackingID != null) {
        ga("create", SizeMe.gaTrackingID, "auto", {
          name: "sizemeTracker"
        });
        this.trackEvent = function(a, l) {
          return ga("sizemeTracker.send", {
            hitType: "event",
            eventCategory: window.location.hostname,
            eventAction: a,
            eventLabel: l
          });
        };
        return this.trackEvent(action, label);
      }
    };


    /*
      Tries to fetch a new auth token from the SizeMe service. User needs to be
      logged in to the service to receive a valid token.
    
      The returned token is passed as an argument to the callback function. If
      user is not logged in, the returned token is null.
    
      This function is executed asynchronously, so it will return immediately.
    
      @param [Function] callback
        function to execute after the request is completed
      @param [Function] errorCallback function to execute if there was an error
     */

    SizeMe.getAuthToken = function(callback, errorCallback) {
      var cb, iframe, xhr;
      if (errorCallback == null) {
        errorCallback = defaultErrorCallback;
      }
      if (_facepalm) {
        iframe = document.createElement("iframe");
        cb = function(event) {
          var tokenObj;
          if (event.origin === SizeMe.contextAddress) {
            tokenObj = event.data;
            removeMessageListener(cb);
            document.body.removeChild(iframe);
            if (callback != null) {
              if (typeof callback === "function") {
                callback(tokenObj);
              }
            }
          }
        };
        addMessageListener(cb);
        iframe.setAttribute("src", SizeMe.contextAddress + "/api/authToken.html");
        iframe.setAttribute("style", "display:none");
        document.body.appendChild(iframe);
      } else {
        xhr = createCORSRequest("GET", "/api/authToken", function(xhr) {
          return callback(JSON.parse(xhr.responseText));
        }, function(xhr) {
          return errorCallback(xhr, xhr.status, xhr.statusText);
        });
        xhr.withCredentials = true;
        xhr.send();
      }
    };


    /*
      Fetches the sizing information for a group of products based on the given
      SKU. If SKU refers to a parent product, all it's children are returned. If
      it refers to a child product, only that child is returned.
    
      @param [String] sku The SKU of the product/product group
      @param [Function] callback
        function to execute after the request is completed
      @param [Function] errorCallback function to execute if there was an error
     */

    SizeMe.getProductInfo = function(sku, callback, errorCallback) {
      var xhr;
      if (errorCallback == null) {
        errorCallback = defaultErrorCallback;
      }
      xhr = createCORSRequest("GET", "/api/products/" + sku, function(xhr) {
        return callback(JSON.parse(xhr.responseText));
      }, function(xhr) {
        return errorCallback(xhr, xhr.status, xhr.statusText);
      });
      xhr.send();
    };

    createFitResponse = function(xhr) {
      var fitResponse, response, responseMap, size;
      response = JSON.parse(xhr.responseText);
      responseMap = new SizeMe.Map();
      for (size in response) {
        if (!hasProp.call(response, size)) continue;
        fitResponse = response[size];
        fitResponse.matchMap = SizeMe.Map.fromObject(fitResponse.matchMap);
        responseMap.addItem(size, fitResponse);
      }
      return responseMap;
    };


    /*
      Fetches an array of profiles for the accountInfo.
      The format of the profile objects is
    
          {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "id of the profile."
              },
              "profileName": {
                "type": "string",
                "description": "name of the profile."
              }
            }
          }
    
      The array is passed as an argument to the callback function.
      This function is executed asynchronously, so it will return immediately.
    
      @param [Object] callback
        function to execute after the request is completed
      @param [Function] errorCallback function to execute if there was an error
    
      @return [Object] profile
     */

    SizeMe.prototype.fetchProfilesForAccount = function(callback, errorCallback) {
      if (errorCallback == null) {
        errorCallback = defaultErrorCallback;
      }
      createCORSRequest("GET", "/api/profiles", function(xhr) {
        SizeMe.trackEvent("fetchProfiles", "API: fetchProfiles");
        return callback(JSON.parse(xhr.responseText));
      }, function(xhr) {
        return errorCallback(xhr, xhr.status, xhr.statusText);
      }).send();
      return void 0;
    };


    /*
      Calls the matching service with the measurements of the item to be matched
      against the selected profile.
    
      The result is an associative array mapping size labels to response objects.
      The format of a response object is
    
          {
            "type": "object",
            "properties": {
              "fitRangeLabel": {
                "type": "string",
                "enum": [
                  "too_small",
                  "slim",
                  "regular",
                  "loose",
                  "huge",
                  "too_big"
                ],
                "description": "A label defining the range of the total fit."
              },
              "totalFit": {
                "type": "integer",
                "description": "A total fit of the item. 100 is a perfect match."
              },
              "matchMap": {
                "type": "object",
                "description": "An associative array containing the detailed fit
                                for each measuring property"
              },
              "accuracy": {
                "type": "number",
                "description": "An accuracy percentage, ie. the percentage of
                                measurement points of the item compared
                                to the points specified in the profile"
              },
              "missingMeasurements": {
                "type": "array",
                "description": "An array of the measurement points that were
                                missing in the profile. The items in the array
                                are themselves also arrays of the size two;
                                first item is the measurement's item property,
                                the second is the property's human name"
              }
            }
          }
    
      The response object contains an associative array (property matchMap)
      that maps each measuring property to a match object The format of a
      match object is
    
          {
            "type": "object",
            "properties": {
              "overlap": {
                "type": "integer",
                "description": "difference of the item's measure
                                (with corrective factors) and the
                                person's measure".
              },
              "percentage": {
                "type": "number",
                "description": "the percentage of the overlap."
              },
              "componentFit": {
                "type": "integer",
                "description": "component's fit value."
              },
            }
          }
    
      The response object is passed as an argument to the
      successCallback-function.
      This function is executed asynchronously, so it will return immediately.
    
      @param [SizeMe.FitRequest] fitrequest
        instance containing profile and item information
      @param [Function] successCallback function to call if match succeeds
      @param [Function] errorCallback function to call if there's an error
     */

    SizeMe.prototype.match = function(fitRequest, successCallback, errorCallback) {
      var data, xhr;
      if (errorCallback == null) {
        errorCallback = defaultErrorCallback;
      }
      data = JSON.stringify(fitRequest);
      xhr = createCORSRequest("POST", "/api/compareSizes", function(xhr) {
        SizeMe.trackEvent("match", "API: match");
        return successCallback(createFitResponse(xhr));
      }, function(xhr) {
        return errorCallback(xhr, xhr.status, xhr.statusText);
      });
      if (xhr.setRequestHeader != null) {
        xhr.setRequestHeader("Content-Type", "application/json");
      }
      xhr.send(data);
      return void 0;
    };


    /*
      Open the login frame and set the callback function for logging in
    
      @param loggedInCallback [Function]
        the function to execute when user logs themselves in
     */

    SizeMe.loginFrame = function(callback) {
      var cb, options, url;
      url = SizeMe.contextAddress + "/remote-login.html";
      options = "height=375,width=349,left=200,top=200,location=no,menubar=no, resizable=no,scrollbars=no,toolbar=no";
      cb = function(e) {
        if (e.origin === SizeMe.contextAddress) {
          removeMessageListener(cb);
          if (e.data) {
            SizeMe.trackEvent("apiLogin", "API: login");
            return callback();
          }
        }
      };
      addMessageListener(cb);
      window.open(url, "loginframe", options);
      SizeMe.trackEvent("loginFrame", "API: loginFrame");
    };


    /*
      Logout from SizeMe
    
      @param callback [Function]
        callback to execute after logout
     */

    SizeMe.logout = function(callback) {
      var cb, iframe;
      iframe = document.createElement("iframe");
      cb = function(event) {
        if (event.origin === SizeMe.contextAddress && event.data === "logout") {
          removeMessageListener(cb);
          document.body.removeChild(iframe);
          SizeMe.trackEvent("apiLogout", "API: logout");
          if (callback != null) {
            callback();
          }
        }
      };
      addMessageListener(cb);
      iframe.setAttribute("src", SizeMe.contextAddress + "/remote-logout");
      iframe.setAttribute("style", "display:none");
      return document.body.appendChild(iframe);
    };

    return SizeMe;

  })();


  /*
    A simple map implementation to help pass the item properties to server
   */

  SizeMe.Map = (function() {
    function Map() {}


    /*
      Returns the keys of this map as an array
      @return [Array]
     */

    Map.prototype.keys = function() {
      var k, results;
      results = [];
      for (k in this) {
        if (!hasProp.call(this, k)) continue;
        results.push(k);
      }
      return results;
    };


    /*
      Executes the callback function for each key in this map. The key and the
      value corresponding to the key are passed as parameters to the callback
      function. The value is also binded as <b>this</b> in the scope of the
      callback
    
      @param [Function] f the callback function
     */

    Map.prototype.each = function(f) {
      var k, v;
      for (k in this) {
        if (!hasProp.call(this, k)) continue;
        v = this[k];
        f(k, v);
      }
      return void 0;
    };


    /*
      Adds an item to this map. Returns itself so that this method can be used
      in a chain.
    
      @param [*] key the key for the value
      @param [*] value value to be added
      @return [SizeMe.Map]
     */

    Map.prototype.addItem = function(key, value) {
      this[key] = value;
      return this;
    };


    /*
      Adds multiple items at a time to this map. Returns itself so that this
      method can be used in a chain.
    
      @param [*] arguments
        items to add as key/value-pairs, ie. key1, value1, key2, value2, ...
      @return [SizeMe.Map]
     */

    Map.prototype.addItems = function() {
      var i, items, j, ref;
      items = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (items.length % 2 !== 0) {
        throw new Error('Arguments must be "tuples" (example: (key1, value1, key2, value2, ...)');
      }
      for (i = j = 0, ref = items.length; j < ref; i = j += 2) {
        this.addItem(items[i], items[i + 1]);
      }
      return this;
    };


    /*
      Creates a new SizeMe.Map from an arbitrary object
    
      @param [Object] obj the object to transform
     */

    Map.fromObject = function(obj) {
      var k, map, v;
      map = new SizeMe.Map();
      for (k in obj) {
        if (!hasProp.call(obj, k)) continue;
        v = obj[k];
        map.addItem(k, v);
      }
      return map;
    };

    return Map;

  })();


  /*
      Request object used to make the match requests to the server
   */

  SizeMe.FitRequest = (function() {

    /*
      @param [String] profileId the id of the profile
      @param [SizeMe.Item, String] item
        object containing size information or SKU of the product
     */
    function FitRequest(profileId, item) {
      this.profileId = profileId;
      if (typeof item === "string") {
        this.sku = item;
      } else {
        this.item = item;
      }
    }

    return FitRequest;

  })();


  /*
  A class for holding the information for specific item.
   */

  SizeMe.Item = (function() {

    /*
      @param [String] itemType the type of the Item
      @param [Number] itemLayer optional layer information
      @param [Number] itemThickness optional thickness value of the Item
      @param [Number] itemStretch optional stretch value of the Item
     */
    function Item(itemType, itemLayer, itemThickness, itemStretch) {
      this.itemType = itemType;
      this.itemLayer = itemLayer != null ? itemLayer : 0;
      this.itemThickness = itemThickness != null ? itemThickness : 0;
      this.itemStretch = itemStretch != null ? itemStretch : 0;
      this.measurements = new SizeMe.Map();
    }


    /*
      Adds a new size information to this item.
    
      @param {*} size the label for the size
      @param {SizeMe.Map} measurements a map of "property->measurement" pairs.
      @return {SizeMe.Item}
      @deprecated Use addOption instead
     */

    Item.prototype.addSize = function(size, measurements) {
      this.measurements.addItem(size, measurements);
      return this;
    };


    /*
      Adds a new selection option to this item.
    
      @param {*} label the label for the option
      @param {SizeMe.Map} measurements a map of "property->measurement" pairs.
      @return {SizeMe.Item}
     */

    Item.prototype.addOption = function(label, measurements) {
      this.measurements.addItem(label, measurements);
      return this;
    };

    return Item;

  })();

  SizeMe.FitRange = (function() {
    var ranges;

    function FitRange() {}

    ranges = {
      too_small: {
        start: 0,
        end: 1000
      },
      slim: {
        start: 1000,
        end: 1050
      },
      regular: {
        start: 1050,
        end: 1110
      },
      loose: {
        start: 1110,
        end: 1170
      },
      too_big: {
        start: 1170,
        end: 99990
      }
    };

    FitRange.getFitRangeLabels = function() {
      return ranges;
    };

    FitRange.getFitRangeLabel = function(fitValue) {
      var label, range, result;
      result = (function() {
        var results;
        results = [];
        for (label in ranges) {
          if (!hasProp.call(ranges, label)) continue;
          range = ranges[label];
          if (range.start <= fitValue && range.end > fitValue) {
            results.push(label);
          }
        }
        return results;
      })();
      return result;
    };

    return FitRange;

  })();

  window.SizeMe = SizeMe;

}).call(this);

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
(function (window) {
    "use strict";

    window.SizeMeI18N.add("en",
        {
            FIT_VERDICT: {
                not_fitted: "Too small",
                too_small: "Too small",
                slim: "Slim",
                regular: "Regular",
                loose: "Loose",
                very_loose: "Very loose",
                huge: "Huge",
                too_big: "Too big"
			},
            FIT_VERDICT_LONG: {
                not_fitted: "Too short",
                too_small: "Too short",
                slim: "Short",
                regular: "Regular",
                loose: "Long",
                very_loose: "Very long",
                huge: "Huge",
                too_big: "Too long"
            },
			MEASUREMENT: {
                chest: "Chest",
                waist: "Waist",
                sleeve: "Sleeve",
                sleeve_top_width: "Sleeve top",
                sleeve_top_opening: "Sleeve top opening",
                wrist_width: "Wrist",
                underbust: "Underbust",
                neck_opening_width: "Collar",
                shoulder_width: "Shoulder",
                front_height: "Front height",
                pant_waist: "Pant waist",
                hips: "Hips",
                inseam: "Inseam",
                outseam: "Outseam",
                thigh_width: "Thigh",
                knee_width: "Knee",
                calf_width: "Calf",
                pant_sleeve_width: "Leg opening",
                shoe_inside_length: "Shoe length",
                shoe_inside_width: "Shoe width",
                hat_width: "Hat circumference",
                hood_height: "Hood height",
				hem: "Hem",
				sleeve_opening: "Sleeve opening"
            },
			COMMON: {
				shopping_for: "Shopping for",
				selected_size: "Selected size",
				is: "is",	// verb
				add_to_profile: "Add to profile",
				size: "Size",
				fetching_profiles: "Fetching profiles...",
				close_text: "Close",
				go_to: "Go to",
				my_profiles: "My Profiles",
				and_create_one: "and create one."	// as in: go to my profiles and create one
			},
			MESSAGE: {
				add_profiles: "Add profiles to your account for a size recommendation.",
				missing_measurements: "Add more measurements to your profile for increased accuracy",
				no_measurements: "Add measurements to your profile for a size recommendation.",
				add_this_measurement: "Add this measurement to your profile to include it in the fit calculation.",
				no_profiles: "You have no profiles on your account.",
				no_top_button: "The shirt's top button for this size won't close."
			},
			DETAILED: {
				window_title: "Detailed View for",
				button_text: "Detailed view of fit",
				table_title: "Detailed fit - overlaps"
			},
			SIZE_GUIDE: {
				window_title: "Size Guide for",
				button_text: "Size guide",
				table_title: "Actual item measurements",
				measurement_disclaimer: "These measurements are measured <u>flat across the outside of the item</u>.",
				measurement_disclaimer_collar: "Except for the collar measurement, which is measured around the inside of the collar.",
				measurement_disclaimer_inside: "These measurements are measured <u>inside the item</u>.",
				advertisement: "This size guide is brought to you by"
			},
			FIT_INFO: {
				when_pinched: " when pinched",
				stretched_little: "The item is stretched a little.",
				stretched_somewhat: "The item is stretched.",
				stretched_much: "The item is stretched a lot.",
				stretched_max: "The item is stretched to the max.",
				the_item: "The item's",
				the_measurement: "measurement",
				no_overlap: "is directly on you with no overlap.",
				is_smaller: "is <u>smaller</u> than your matching measurement by",
				overlaps_you: "overlaps you by",
				arm_sleeve_straight: "when your arm and the item's sleeve are <u>completely straight</u>",
				sm_considers_fit: "SizeMe considers this particular fit",
				overall_fit: "Overall fit",
				overall_fit_for_size: "The overall fit for <b>size"
			},
			SPLASH: {
				detailed_text: "Take a few <b>measurements of yourself</b> and get personalized info on how this item would <b>fit you</b>.<br />Create a free <b>SizeMe</b> profile and stop guessing!",
				btn_sign_up_title: "Sign up",
				btn_sign_up_label: "Yes, I'd like to create a free account",
				btn_log_in_title: "Log in",
				btn_log_in_label: "I already have an account",
				btn_no_thanks_title: "No thanks",
				btn_no_thanks_label: "Maybe later",
				product_page_splashes: ["Unsure about the right size? Try"],
				product_page_splash_title: "SizeMe is a free service to help you know how this item will fit _you_"
			}
        }
    );

})(window);
(function (window) {
    "use strict";

    window.SizeMeI18N.add("fi",
        {
            FIT_VERDICT: {
                not_fitted: "Pieni",
                too_small: "Pieni",
                slim: "Kapea",
                regular: "Normaali",
                loose: "Väljä",
                very_loose: "Erittäin väljä",
                huge: "Valtava",
                too_big: "Liian iso"
			},
            FIT_VERDICT_LONG: {
                not_fitted: "Liian lyhyt",
                too_small: "Liian lyhyt",
                slim: "Lyhyehkö",
                regular: "Normaali",
                loose: "Pitkähkö",
                very_loose: "Pitkä",
                huge: "Valtava",
                too_big: "Liian pitkä"
            },
			MEASUREMENT: {			
                chest: "Rinta",
                waist: "Vyötärö",
                sleeve: "Hiha",
                sleeve_top_width: "Hihan yläosa",
                sleeve_top_opening: "Hihan leveys",
                wrist_width: "Ranne",
                underbust: "Rinnan alta",
                neck_opening_width: "Kaulus",
                shoulder_width: "Hartia",
                front_height: "Etupituus",
                pant_waist: "Housun vyötärö",
                hips: "Lantio",
                inseam: "Sisäsauma",
                outseam: "Ulkosauma",
                thigh_width: "Reisi",
                knee_width: "Polvi",
                calf_width: "Pohje",
                pant_sleeve_width: "Lahje",
                shoe_inside_length: "Sisäpituus",
                shoe_inside_width: "Sisäleveys",
                hat_width: "Ympärysmitta",
                hood_height: "Hupun korkeus",
				hem: "Helma",
				sleeve_opening: "Hihan suu"				
            },
			COMMON: {
				shopping_for: "Aktiivinen profiili",
				selected_size: "Valittu koko",
				is: "on",	// verb
				add_to_profile: "Lisää profiiliin",
				size: "Koko",
				fetching_profiles: "Haetaan profiileja...",
				close_text: "Sulje",
				go_to: "Mene",
				my_profiles: "Profiili-sivulleni",
				and_create_one: "ja luo profiili."	// as in: go to my profiles and create one
			},
			MESSAGE: {
				add_profiles: "Lisää mittaprofiili kokosuositusta varten.",
				missing_measurements: "Lisää mittoja profiiliisi tarkempaa tulosta varten",
				no_measurements: "Lisää mittoja profiiliisi kokosuositusta varten.",
				add_this_measurement: "Lisää tämä mitta profiilisi tarkempaa tulosta varten.",
				no_profiles: "Tililläsi ei ole yhtään mittaprofiilia.",
				no_top_button: "Paidan ylin nappi ei tässä koossa mene kiinni."
			},
			DETAILED: {
				window_title: "Sopivuustiedot tuotteelle",
				button_text: "Sopivuustiedot",
				table_title: "Sopivuustiedot"
			},
			SIZE_GUIDE: {
				window_title: "Kokotaulukko tuotteelle",
				button_text: "Kokotaulukko",
				table_title: "Tuotteen mitat",
				measurement_disclaimer: "Nämä mitat on otettu <u>tuotteen päältä tasaisella alustalla</u>.",
				measurement_disclaimer_collar: "Paitsi kaulus, joka on ympärysmitta kauluksen sisäpuolelta.",
				measurement_disclaimer_inside: "Nämä mitat on otettu <u>tuotteen sisältä</u>.",
				advertisement: "Tämän kokotaulukon toimittaa"
			},
			FIT_INFO: {
				when_pinched: " nipistettynä sormien väliin",
				stretched_little: "Tuote venyy vähän.",
				stretched_somewhat: "Tuote venyy.",
				stretched_much: "Tuote venyy kunnolla.",
				stretched_max: "Tuote venyy huolella.",
				the_item: "Tuotteen",
				the_measurement: "-mitta",
				no_overlap: "on suoraan sinua vasten.",
				is_smaller: "on sinun omaa mittaasi <u>pienempi</u>",
				overlaps_you: "ylittää mittasi",
				arm_sleeve_straight: "kun kätesi ja tuotteen hiha on <u>suoraan alaspäin</u>",
				sm_considers_fit: "SizeMe:n mielestä tämä sopivuus on",
				overall_fit: "Sopivuus",				
				overall_fit_for_size: "Sopivuus <b>koolle"
			},
			SPLASH: {
				detailed_text: "Ota <b>muutama mitta</b> itsestäsi ja näe miten tämä tuote <b>sopisi sinulle</b>.<br />Luo oma <b>SizeMe</b>-tunnus ja lopeta arvailu!",
				btn_sign_up_title: "Liityn mukaan",
				btn_sign_up_label: "Jep, haluan luoda oman tunnuksen",
				btn_log_in_title: "Kirjaudu",
				btn_log_in_label: "Minulla on jo oma tunnus",
				btn_no_thanks_title: "Ei kiitos",
				btn_no_thanks_label: "Ehkä myöhemmin",
				product_page_splashes: ["Haluatko apua oikean koon valitsemisessa? Kokeile"],
				product_page_splash_title: "SizeMe-palvelu kertoo miten tämä tuote sopii juuri _sinulle_"
			}
        }
    );

})(window);
// SizeMe UI JS v1.0
// based on SizeMe Item Types 2015-10-01
// (c) SizeMe Inc.
// www.sizeme.com
// License undecided
/* jshint browser:true, jquery:true */
/* globals sizeme_product: false, sizeme_options: false, sizeme_UI_options: false, Opentip: false, SizeMe: false */

(function (window, undefined) {
    "use strict";
    window.sizemeInit = function ($) {
        var i18n = {};

        var FIT_RANGES = {
            1: {label: "too_small", arrowColor: "#999999"},
            940: {label: "too_small", arrowColor: "#BB5555"},
            1000: {label: "slim", arrowColor: "#457A4C"},
            1055: {label: "regular", arrowColor: "#42AE49"},
            1110: {label: "loose", arrowColor: "#87B98E"},
            1165: {label: "too_big", arrowColor: "#BB5555"},
            1225: {label: "too_big", arrowColor: "#BB5555"}
        };

        var FIT_RANGES_LESS_IMPORTANCE = {
            1: {label: "too_small", arrowColor: "#999999"},
            940: {label: "too_small", arrowColor: "#BB5555"},
            1000: {label: "slim", arrowColor: "#457A4C"},
            1055: {label: "regular", arrowColor: "#42AE49"},
            1110: {label: "loose", arrowColor: "#87B98E"}
        };

        var sliderPosXMin = 940;
        var sliderPosXMax = 1225;
        var sliderScale = 100 / (sliderPosXMax - sliderPosXMin);

        var FIT_ORDER = [
            "chest",
            "waist",
            "underbust",
            "pant_waist",
            "hips",
            "inseam",
            "outseam",
            "thigh_width",
            "knee_width",
            "calf_width",
            "pant_sleeve_width",
            "neck_opening_width",
            "shoulder_width",
            "sleeve_top_width",
            "sleeve_top_opening",
            "sleeve",
            "wrist_width",
            "front_height",
            "shoe_inside_length",
            "shoe_inside_width",
            "hat_width",
            "hood_height"
        ];

        var PINCHED_FITS = [
            "chest",
            "waist",
            "underbust",
            "pant_waist",
            "hips",
            "thigh_width",
            "knee_width",
            "calf_width",
            "pant_sleeve_width",
            "neck_opening_width",
            "sleeve_top_width",
            "sleeve_top_opening",
            "wrist_width",
            "hat_width"
        ];

        var LONG_FITS = [
            "inseam",
            "outseam",
            "sleeve",
            "front_height",
            "shoe_inside_length"
        ];

        var OPTIMAL_FIT = 1070;

        var realCanvasWidth = 350;
        var realCanvasHeight = 480;
        var padding = 0.07;

        var drawColor = '#777777';
        var fillColor = '#BBBBBB';
        var arrowColor;
        var arrowColorGreen = '#42AE49';
        var arrowColorBlack = '#000000';
        var arrowColorInfo = '#666666';

        var itemLineWidth = 1;
        var arrowLineWidth = 2;
        var arrowEndRadius = 4;
        var arrowNumberRadius = 10;
        var arrowNumberFont = "10px sans-serif";
        var arrowNumberHighlightFont = "bold 14px sans-serif";
        var arrowLift = 30;
        var arcRadius = 10;

        var fadeLength = 400;

        var item_drawing = {};
        var measurement_arrows = {};

        var sizeKeys = [];

        var recommendedId;
        var recommendedLabel = "none";

        var selectedProfile;
        var linkToSelectedProfile;

        var accuracyThreshold = 0.01;

        var cookieLifetime = 90;

        var itemName = "";

        var sizeme_local_options = {
            fitAreaSlider: true,
            writeMessages: true,
            writeOverlaps: true,
            firstRecommendation: true
        };

        function sizeText(txt) {
            var retStr = txt;
            retStr = retStr.split(" -")[0];
            retStr = retStr.split(" +")[0];
            return retStr;
        }

        function getFit(fitValue, importance) {
            var returnFit, singleFit;
            var ranges;
            ranges = FIT_RANGES_LESS_IMPORTANCE;
            if (importance == 1) ranges = FIT_RANGES;
            for (singleFit in ranges) {
                if (ranges.hasOwnProperty(singleFit)) {
                    if (fitValue < singleFit) {
                        if (returnFit) {
                            return returnFit;
                        }
                        return ranges[singleFit];
                    }
                    returnFit = ranges[singleFit];
                }
            }
            return returnFit;
        }

        function addIds(parentElement) {
            // add ids to select for easy handling
            $(parentElement + " option").each(function () {
                var myVal = $(this).val();
                var myText = $(this).text();
                $(this).addClass("sm-selectable element_for_" + myVal);
                this.id = (myVal ? "input_" + myVal : "choose");
                if (myVal) {
                    if (typeof sizeme_product !== "undefined") {
                        if (sizeme_product.item.measurements[myVal]) {
                            sizeKeys.push({key: myVal, sizeLabel: myText});
                        }
                    }
                }
            });
        }

        function getItemTypeArr() {
            var itemTypeStr = sizeme_product.item.itemType.toString();
            var itemTypeArr = [0, 0, 0, 0, 0, 0, 0];
            var separator = '';
            if (itemTypeStr.indexOf('.') > -1) separator = '.';
            var itemTypeSplitted = itemTypeStr.split(separator, 7);
            for (var i = 0; i < itemTypeSplitted.length; i++) itemTypeArr[i] = +itemTypeSplitted[i];
            return itemTypeArr;
        }

        function isInside() {
            var itemTypeArr = getItemTypeArr();
            return ( (itemTypeArr[0] === 3) || (itemTypeArr[0] === 4) );
        }

        function loadArrows(isSizeGuide) {
            var $i, $x;
            var itemTypeArr = getItemTypeArr();

            // arrows first
            arrowColor = arrowColorGreen;
            var arcStyle = "arc";

            if (isSizeGuide) {
                arrowColor = arrowColorBlack;
                arcStyle = "line"; // size guide shows flat measurements (except neck opening)
            }

            measurement_arrows.chest = {
                mirror: false,
                coords: [{X: -250, Y: 399}, {X: 250, Y: 399}],
                style: arcStyle,
                lift: false,
                color: arrowColor
            };
            measurement_arrows.waist = {
                mirror: false,
                coords: [{X: -250, Y: 635}, {X: 250, Y: 635}],
                style: arcStyle,
                lift: false,
                color: arrowColor
            };
            measurement_arrows.front_height = {
                mirror: false,
                coords: [{X: -174, Y: 0}, {X: -174, Y: 978}],
                style: "line",
                lift: false,
                color: arrowColor
            };
            measurement_arrows.neck_opening_width = {
                mirror: false,
                coords: [{X: 0, Y: 47}, {X: 174, Y: 0, cp1X: 65, cp1Y: 45, cp2X: 140, cp2Y: 23}, {
                    X: 0,
                    Y: 100,
                    cp1X: 150,
                    cp1Y: 46,
                    cp2X: 50,
                    cp2Y: 92
                },
                    {X: -174, Y: 0, cp1X: -50, cp1Y: 92, cp2X: -150, cp2Y: 46}, {
                        X: 0,
                        Y: 47,
                        cp1X: -140,
                        cp1Y: 23,
                        cp2X: -65,
                        cp2Y: 45
                    }],
                style: "line",
                lift: true,
                color: arrowColor
            };

            measurement_arrows.hood_height = {
                mirror: false,
                coords: [{X: 195, Y: -5}, {X: 195, Y: -390}],
                style: "line",
                lift: false,
                color: arrowColor
            };
            measurement_arrows.shoulder_width = {
                mirror: false,
                coords: [{X: -329, Y: 42}, {X: -164, Y: -7}],
                style: "line",
                lift: true,
                color: arrowColor
            };

            measurement_arrows.pant_waist = {
                mirror: false,
                coords: [{X: -232, Y: 0}, {X: 222, Y: 0}],
                style: arcStyle,
                lift: true,
                color: arrowColor
            };
            measurement_arrows.hips = {
                mirror: false,
                coords: [{X: -261, Y: 171}, {X: 263, Y: 171}],
                style: arcStyle,
                lift: false,
                color: arrowColor
            };
            measurement_arrows.outseam = {
                mirror: false,
                coords: [{X: 222, Y: 0}, {X: 263, Y: 171}, {X: 302, Y: 1071}],
                style: "line",
                lift: true,
                color: arrowColor
            };
            measurement_arrows.inseam = {
                mirror: false,
                coords: [{X: 5, Y: 297}, {X: 151, Y: 1084}],
                style: "line",
                lift: false,
                color: arrowColor
            };
            measurement_arrows.thigh_width = {
                mirror: false,
                coords: [{X: -266, Y: 274}, {X: -17, Y: 297}],
                style: arcStyle,
                lift: false,
                color: arrowColor
            };
            measurement_arrows.knee_width = {
                mirror: false,
                coords: [{X: -286, Y: 727}, {X: -93, Y: 744}],
                style: arcStyle,
                lift: false,
                color: arrowColor
            };
            measurement_arrows.pant_sleeve_width = {
                mirror: false,
                coords: [{X: -301, Y: 1071}, {X: -152, Y: 1084}],
                style: arcStyle,
                lift: false,
                color: arrowColor
            };

            measurement_arrows.shoe_inside_length = {
                mirror: false,
                coords: [{X: 169, Y: 984}, {X: 132, Y: 18}],
                style: "line",
                lift: false,
                color: arrowColor
            };

            measurement_arrows.hat_width = {
                mirror: false,
                coords: [{X: 534, Y: 238},
                    {X: 539, Y: 265, cp1X: 559, cp1Y: 236, cp2X: 567, cp2Y: 252},
                    {X: 70, Y: 262, cp1X: 352, cp1Y: 353, cp2X: 223, cp2Y: 351},
                    {X: 77, Y: 242, cp1X: 38, cp1Y: 241, cp2X: 60, cp2Y: 234}],
                midCircle: {X: 300, Y: 325},
                style: "line",
                lift: false,
                color: arrowColor
            };

            item_drawing.mirror = true;
            item_drawing.coords = [];
            item_drawing.accents = [];
            // load item drawing
            switch (itemTypeArr[0]) {

                case 1:	// shirts/coats
                    i18n.MEASUREMENT.hips = i18n.MEASUREMENT.hem;
                    i18n.MEASUREMENT.pant_waist = i18n.MEASUREMENT.hem;

                    switch (itemTypeArr[1]) { // collar
                        case 2:	// tight (turnover)
                            item_drawing.coords.push({X: 0, Y: -60}, {
                                X: 119,
                                Y: -48,
                                cp1X: 68,
                                cp1Y: -60,
                                cp2X: 106,
                                cp2Y: -57
                            }, {X: 128, Y: 0});
                            item_drawing.accents.push({
                                type: "area", coords: [{X: 0, Y: -47},
                                    {X: 100, Y: -35, cp1X: 64, cp1Y: -48, cp2X: 105, cp2Y: -47},
                                    {X: -5, Y: 59, cp1X: 66, cp1Y: 8, cp2X: 6, cp2Y: 40},
                                    {X: -104, Y: -34, cp1X: -25, cp1Y: 32, cp2X: -93, cp2Y: -12},
                                    {X: 0, Y: -46, cp1X: -117, cp1Y: -48, cp2X: -52, cp2Y: -48}
                                ], noMirror: true
                            });
                            item_drawing.accents.push({
                                type: "line", coords: [{X: 129, Y: 0},
                                    {X: 136, Y: 26, cp1X: 132, cp1Y: 14, cp2X: 133, cp2Y: 18},
                                    {X: 78, Y: 125, cp1X: 123, cp1Y: 63, cp2X: 100, cp2Y: 95},
                                    {X: 37, Y: 78, cp1X: 60, cp1Y: 106, cp2X: 51, cp2Y: 101},
                                    {X: -12, Y: 111, cp1X: 24, cp1Y: 8, cp2X: -32, cp2Y: 66}
                                ], noMirror: true
                            });	// non mirrored turnover collar right
                            item_drawing.accents.push({
                                type: "line", coords: [{X: -129, Y: 0},
                                    {X: -136, Y: 26, cp1X: -132, cp1Y: 14, cp2X: -133, cp2Y: 18},
                                    {X: -90, Y: 127, cp1X: -127, cp1Y: 68, cp2X: -106, cp2Y: 110},
                                    {X: -9, Y: 59, cp1X: -33, cp1Y: 88, cp2X: -61, cp2Y: 25}
                                ], noMirror: true
                            });	// non mirrored turnover collar left
                            item_drawing.accents.push({type: "circle", coords: [{X: 0, Y: 100, R: 5}]});
                            measurement_arrows.neck_opening_width = {
                                mirror: false,
                                coords: [{X: 0, Y: -47}, {X: 100, Y: -35, cp1X: 64, cp1Y: -48, cp2X: 105, cp2Y: -47},
                                    {X: -5, Y: 59, cp1X: 66, cp1Y: 8, cp2X: 6, cp2Y: 40}, {
                                        X: -104,
                                        Y: -34,
                                        cp1X: -25,
                                        cp1Y: 32,
                                        cp2X: -93,
                                        cp2Y: -12
                                    },
                                    {X: 0, Y: -46, cp1X: -117, cp1Y: -48, cp2X: -52, cp2Y: -48}],
                                style: "line",
                                lift: false,
                                midCircle: {X: 0, Y: -47},
                                color: arrowColor
                            };
                            measurement_arrows.shoulder_width = {
                                mirror: false,
                                coords: [{X: -329, Y: 49}, {X: -129, Y: -5}],
                                style: "line",
                                lift: true,
                                color: arrowColor
                            };
                            measurement_arrows.front_height = {
                                mirror: false,
                                coords: [{X: -167, Y: -4}, {X: -167, Y: 978}],
                                style: "line",
                                lift: false,
                                color: arrowColor
                            };

                            break;
                        case 3:	// hood
                            item_drawing.coords.push({X: 0, Y: -390}, {
                                X: 185,
                                Y: 6,
                                cp1X: 180,
                                cp1Y: -400,
                                cp2X: 160,
                                cp2Y: -20
                            });
                            item_drawing.accents.push({
                                type: "line",
                                coords: [{X: 185, Y: 6}, {X: 0, Y: 123, cp1X: 140, cp1Y: 70, cp2X: 70, cp2Y: 100}]
                            });	// basic round collar line
                            item_drawing.accents.push({
                                type: "area",
                                coords: [{X: 0, Y: -320}, {
                                    X: 144,
                                    Y: 0,
                                    cp1X: 150,
                                    cp1Y: -320,
                                    cp2X: 140,
                                    cp2Y: -20
                                }, {X: 0, Y: 100, cp1X: 140, cp1Y: 46, cp2X: 40, cp2Y: 92}]
                            }); // hood area
                            measurement_arrows.shoulder_width = {
                                mirror: false,
                                coords: [{X: -329, Y: 42}, {X: -174, Y: -7}],
                                style: "line",
                                lift: true,
                                color: arrowColor
                            };
                            break;
                        case 5:	// open high round
                            item_drawing.coords.push({X: 0, Y: 90}, {X: 189, Y: 0});
                            item_drawing.accents.push({
                                type: "line",
                                coords: [{X: 210, Y: 6}, {X: 0, Y: 123, cp1X: 165, cp1Y: 70, cp2X: 100, cp2Y: 123}]
                            });	// open round collar line
                            item_drawing.accents.push({
                                type: "area",
                                coords: [{X: 0, Y: 49}, {X: 189, Y: 0, cp1X: 100, cp1Y: 47, cp2X: 155, cp2Y: 23}, {
                                    X: 0,
                                    Y: 102,
                                    cp1X: 165,
                                    cp1Y: 46,
                                    cp2X: 95,
                                    cp2Y: 102
                                }]
                            }); // open collar area
                            break;
                        case 6:	// open low round
                            item_drawing.coords.push({X: 0, Y: 180}, {X: 164, Y: 0});
                            item_drawing.accents.push({
                                type: "line",
                                coords: [{X: 181, Y: 5}, {X: 0, Y: 196, cp1X: 146, cp1Y: 196, cp2X: 50, cp2Y: 196}]
                            });	// collar line
                            item_drawing.accents.push({
                                type: "area",
                                coords: [{X: 0, Y: 47}, {X: 164, Y: 0, cp1X: 55, cp1Y: 45, cp2X: 130, cp2Y: 23}, {
                                    X: 0,
                                    Y: 180,
                                    cp1X: 130,
                                    cp1Y: 180,
                                    cp2X: 45,
                                    cp2Y: 180
                                }]
                            }); // basic area
                            break;
                        case 7:	// v-style high
                            item_drawing.coords.push({X: 0, Y: 90}, {X: 189, Y: 0});
                            item_drawing.accents.push({
                                type: "line",
                                coords: [{X: 210, Y: 6}, {X: 0, Y: 123, cp1X: 165, cp1Y: 70, cp2X: 80, cp2Y: 100}]
                            });	// open round collar line
                            item_drawing.accents.push({
                                type: "area",
                                coords: [{X: 0, Y: 47}, {X: 189, Y: 0, cp1X: 80, cp1Y: 45, cp2X: 155, cp2Y: 23}, {
                                    X: 0,
                                    Y: 100,
                                    cp1X: 165,
                                    cp1Y: 46,
                                    cp2X: 65,
                                    cp2Y: 92
                                }]
                            }); // open collar area
                            break;
                        case 8:	// v-style low
                            item_drawing.coords.push({X: 0, Y: 90}, {X: 189, Y: 0});
                            item_drawing.accents.push({
                                type: "line",
                                coords: [{X: 210, Y: 6}, {X: 0, Y: 123, cp1X: 165, cp1Y: 70, cp2X: 80, cp2Y: 100}]
                            });	// open round collar line
                            item_drawing.accents.push({
                                type: "area",
                                coords: [{X: 0, Y: 47}, {X: 189, Y: 0, cp1X: 80, cp1Y: 45, cp2X: 155, cp2Y: 23}, {
                                    X: 0,
                                    Y: 100,
                                    cp1X: 165,
                                    cp1Y: 46,
                                    cp2X: 65,
                                    cp2Y: 92
                                }]
                            }); // open collar area
                            break;
                        default:	// elastic round
                            item_drawing.coords.push({X: 0, Y: 90}, {X: 164, Y: 0});
                            item_drawing.accents.push({
                                type: "line",
                                coords: [{X: 185, Y: 6}, {X: 0, Y: 110, cp1X: 140, cp1Y: 70, cp2X: 70, cp2Y: 108}]
                            });	// basic round collar line
                            item_drawing.accents.push({
                                type: "area",
                                coords: [{X: 0, Y: 47}, {X: 164, Y: 0, cp1X: 55, cp1Y: 45, cp2X: 130, cp2Y: 23}, {
                                    X: 0,
                                    Y: 90,
                                    cp1X: 140,
                                    cp1Y: 46,
                                    cp2X: 55,
                                    cp2Y: 90
                                }]
                            }); // basic area
                            break;
                    }

                    switch (itemTypeArr[3]) { // sleeve length
                        case 0:	// tank top, string top or poncho
                        case 1:	// very short (vest)
                            item_drawing.coords.push({X: 289, Y: 34});
                            item_drawing.coords.push({X: 250, Y: 399, cp1X: 285, cp1Y: 44, cp2X: 220, cp2Y: 389});
                            measurement_arrows.shoulder_width = {
                                mirror: false,
                                coords: [{X: -299, Y: 32}, {X: -164, Y: -7}],
                                style: "line",
                                lift: true,
                                color: arrowColor
                            };
                            measurement_arrows.sleeve_top_width = {
                                mirror: false,
                                coords: [{X: 250, Y: 399}, {X: 289, Y: 34}],
                                style: arcStyle,
                                lift: false,
                                color: arrowColor
                            };

                            if (itemTypeArr[4] !== 0) {
                                // is it you, poncho?
                                item_drawing.coords.push({X: 250, Y: 399, cp1X: 328, cp1Y: 44, cp2X: 250, cp2Y: 260});
                                FIT_ORDER.splice(13, 1);  // remove sleeve top
                                measurement_arrows.sleeve_top_width = false;
                            }
                            break;
                        case 2:  // short
                        case 3:  // short-medium (normal t-shirt)
                            item_drawing.coords.push({X: 329, Y: 44});
                            item_drawing.coords.push({X: 482, Y: 460}, {X: 324, Y: 529});
                            item_drawing.coords.push({X: 250, Y: 399});

                            measurement_arrows.sleeve_top_width = {
                                mirror: false,
                                coords: [{X: 250, Y: 399}, {X: 430, Y: 322}],
                                style: arcStyle,
                                lift: false,
                                color: arrowColor
                            };
                            measurement_arrows.wrist_width = {
                                mirror: false,
                                coords: [{X: 324, Y: 529}, {X: 482, Y: 460}],
                                style: arcStyle,
                                lift: false,
                                color: arrowColor
                            };

                            i18n.MEASUREMENT.wrist_width = i18n.MEASUREMENT.sleeve_opening;

                            switch (itemTypeArr[2]) { // shoulder types
                                case 3:	// dropped
                                    item_drawing.accents.push({
                                        type: "line",
                                        coords: [{X: 250, Y: 399}, {X: 381, Y: 184}]
                                    });
                                    measurement_arrows.sleeve = {
                                        mirror: false,
                                        coords: [{X: 174, Y: -16}, {X: 329, Y: 27}, {X: 482, Y: 460}],
                                        style: "line",
                                        lift: true,
                                        midCircle: {X: 406, Y: 243},
                                        color: arrowColor
                                    };
                                    break;
                                case 2:	// raglan line
                                    item_drawing.accents.push({
                                        type: "line",
                                        coords: [{X: 250, Y: 399}, {
                                            X: 185,
                                            Y: 6,
                                            cp1X: 220,
                                            cp1Y: 320,
                                            cp2X: 185,
                                            cp2Y: 6
                                        }]
                                    });
                                    measurement_arrows.sleeve = {
                                        mirror: false,
                                        coords: [{X: 174, Y: -16}, {X: 329, Y: 27}, {X: 482, Y: 460}],
                                        style: "line",
                                        lift: true,
                                        midCircle: {X: 406, Y: 243},
                                        color: arrowColor
                                    };
                                    break;
                                case 1:	// normal shoulder line
                                    measurement_arrows.sleeve = {
                                        mirror: false,
                                        coords: [{X: 329, Y: 44}, {X: 482, Y: 460}],
                                        style: "line",
                                        lift: true,
                                        color: arrowColor
                                    };
                                    item_drawing.accents.push({
                                        type: "line",
                                        coords: [{X: 250, Y: 399}, {
                                            X: 329,
                                            Y: 44,
                                            cp1X: 250,
                                            cp1Y: 250,
                                            cp2X: 300,
                                            cp2Y: 70
                                        }]
                                    });
                                    break;
                            }
                            break;
                        case 4:  // medium
                        case 5:  // semi-long
                            item_drawing.coords.push({X: 329, Y: 44});
                            item_drawing.coords.push({X: 527, Y: 719}, {X: 389, Y: 769});
                            item_drawing.coords.push({X: 250, Y: 399});

                            measurement_arrows.sleeve_top_width = {
                                mirror: false,
                                coords: [{X: 250, Y: 399}, {X: 419, Y: 340}],
                                style: arcStyle,
                                lift: false,
                                color: arrowColor
                            };
                            measurement_arrows.wrist_width = {
                                mirror: false,
                                coords: [{X: 389, Y: 769}, {X: 527, Y: 719}],
                                style: arcStyle,
                                lift: false,
                                color: arrowColor
                            };

                            i18n.MEASUREMENT.wrist_width = i18n.MEASUREMENT.sleeve_opening;

                            switch (itemTypeArr[2]) { // shoulder types
                                case 3:	// dropped
                                    item_drawing.accents.push({
                                        type: "line",
                                        coords: [{X: 250, Y: 399}, {X: 369, Y: 196}]
                                    });
                                    measurement_arrows.sleeve = {
                                        mirror: false,
                                        coords: [{X: 174, Y: -16}, {X: 329, Y: 27}, {X: 527, Y: 719}],
                                        style: "line",
                                        lift: true,
                                        midCircle: {X: 450, Y: 444},
                                        color: arrowColor
                                    };
                                    break;
                                case 2:	// raglan line
                                    item_drawing.accents.push({
                                        type: "line",
                                        coords: [{X: 250, Y: 399}, {
                                            X: 185,
                                            Y: 6,
                                            cp1X: 220,
                                            cp1Y: 320,
                                            cp2X: 185,
                                            cp2Y: 6
                                        }]
                                    });
                                    measurement_arrows.sleeve = {
                                        mirror: false,
                                        coords: [{X: 174, Y: -16}, {X: 329, Y: 27}, {X: 527, Y: 719}],
                                        style: "line",
                                        lift: true,
                                        midCircle: {X: 450, Y: 444},
                                        color: arrowColor
                                    };
                                    break;
                                case 1:	// normal shoulder line
                                    measurement_arrows.sleeve = {
                                        mirror: false,
                                        coords: [{X: 329, Y: 44}, {X: 527, Y: 719}],
                                        style: "line",
                                        lift: true,
                                        color: arrowColor
                                    };
                                    item_drawing.accents.push({
                                        type: "line",
                                        coords: [{X: 250, Y: 399}, {
                                            X: 329,
                                            Y: 44,
                                            cp1X: 250,
                                            cp1Y: 250,
                                            cp2X: 300,
                                            cp2Y: 70
                                        }]
                                    });
                                    break;
                            }
                            break;
                        case 6:  // long
                        case 7:  // very long
                        case 8:  // extra long
                            item_drawing.coords.push({X: 329, Y: 44});
                            measurement_arrows.sleeve_top_width = {
                                mirror: false,
                                coords: [{X: 250, Y: 399}, {X: 410, Y: 348}],
                                style: arcStyle,
                                lift: false,
                                color: arrowColor
                            };

                            if (itemTypeArr[4] === 1) {	// elastic
                                item_drawing.coords.push({X: 556, Y: 902}, {X: 547, Y: 930}, {X: 557, Y: 978}, {
                                    X: 463,
                                    Y: 998
                                }, {X: 449, Y: 951}, {X: 430, Y: 934});
                                item_drawing.accents.push({type: "line", coords: [{X: 465, Y: 944}, {X: 476, Y: 996}]},
                                    {type: "line", coords: [{X: 476, Y: 941}, {X: 487, Y: 993}]},
                                    {type: "line", coords: [{X: 487, Y: 938}, {X: 498, Y: 990}]},
                                    {type: "line", coords: [{X: 498, Y: 935}, {X: 509, Y: 987}]},
                                    {type: "line", coords: [{X: 509, Y: 932}, {X: 520, Y: 984}]},
                                    {type: "line", coords: [{X: 520, Y: 929}, {X: 531, Y: 981}]},
                                    {type: "line", coords: [{X: 531, Y: 926}, {X: 542, Y: 978}]});
                                item_drawing.coords.push({X: 250, Y: 399});
                                measurement_arrows.wrist_width = {
                                    mirror: false,
                                    coords: [{X: 430, Y: 934}, {X: 556, Y: 902}],
                                    style: arcStyle,
                                    lift: false,
                                    color: arrowColor
                                };
                            } else {
                                item_drawing.coords.push({X: 571, Y: 978}, {X: 454, Y: 1009});
                                item_drawing.coords.push({X: 250, Y: 399});
                                measurement_arrows.wrist_width = {
                                    mirror: false,
                                    coords: [{X: 571, Y: 978}, {X: 454, Y: 1009}],
                                    style: arcStyle,
                                    lift: false,
                                    color: arrowColor
                                };
                            }

                            switch (itemTypeArr[2]) { // shoulder types
                                case 3:	// dropped
                                    item_drawing.accents.push({
                                        type: "line",
                                        coords: [{X: 250, Y: 399}, {X: 369, Y: 196}]
                                    });
                                    measurement_arrows.sleeve = {
                                        mirror: false,
                                        coords: [{X: 174, Y: -16}, {X: 329, Y: 27}, {X: 571, Y: 978}],
                                        style: "line",
                                        lift: true,
                                        midCircle: {X: 437, Y: 444},
                                        color: arrowColor
                                    };
                                    break;
                                case 2:	// raglan line
                                    item_drawing.accents.push({
                                        type: "line",
                                        coords: [{X: 250, Y: 399}, {
                                            X: 185,
                                            Y: 6,
                                            cp1X: 220,
                                            cp1Y: 320,
                                            cp2X: 185,
                                            cp2Y: 6
                                        }]
                                    });
                                    measurement_arrows.sleeve = {
                                        mirror: false,
                                        coords: [{X: 174, Y: -16}, {X: 329, Y: 27}, {X: 571, Y: 978}],
                                        style: "line",
                                        lift: true,
                                        midCircle: {X: 437, Y: 444},
                                        color: arrowColor
                                    };
                                    break;
                                case 1:	// normal shoulder line
                                    measurement_arrows.sleeve = {
                                        mirror: false,
                                        coords: [{X: 329, Y: 44}, {X: 569, Y: 975}],
                                        style: "line",
                                        lift: true,
                                        color: arrowColor
                                    };
                                    item_drawing.accents.push({
                                        type: "line",
                                        coords: [{X: 250, Y: 399}, {
                                            X: 329,
                                            Y: 44,
                                            cp1X: 250,
                                            cp1Y: 250,
                                            cp2X: 300,
                                            cp2Y: 70
                                        }]
                                    });
                                    break;
                            }
                            break;
                    }

                    switch (itemTypeArr[5]) { // waistband
                        case 0:	// poncho dude
                            item_drawing.coords.push({X: 550, Y: 750, cp1X: 450, cp1Y: 70, cp2X: 450, cp2Y: 550});
                            item_drawing.coords.push({X: 0, Y: 1038, cp1X: 450, cp1Y: 800, cp2X: 400, cp2Y: 1038});
                            measurement_arrows.front_height = {
                                mirror: false,
                                coords: [{X: -174, Y: 5}, {X: -174, Y: 1018}],
                                style: "line",
                                lift: false,
                                color: arrowColor
                            };
                            measurement_arrows.sleeve = {
                                mirror: false,
                                coords: [{X: 174, Y: 0}, {X: 394, Y: 59}, {X: 550, Y: 750}],
                                style: "line",
                                lift: true,
                                midCircle: {X: 480, Y: 444},
                                color: arrowColor
                            };
                            break;
                        case 3:	// pant waist
                            if (itemTypeArr[6] === 1) {	// elastic
                                item_drawing.coords.push({
                                    X: 250,
                                    Y: 908,
                                    cp1X: 247,
                                    cp1Y: 402,
                                    cp2X: 247,
                                    cp2Y: 858
                                }, {X: 230, Y: 978}, {X: 0, Y: 978});
                                for ($i = 0; $i < 15; $i++) {
                                    $x = Math.round(($i + 0.5) * (230 / 15));
                                    item_drawing.accents.push({
                                        type: "line",
                                        coords: [{X: $x, Y: 918}, {X: $x, Y: 978}]
                                    });
                                }
                                measurement_arrows.pant_waist = {
                                    mirror: false,
                                    coords: [{X: -250, Y: 908}, {X: 250, Y: 908}],
                                    style: arcStyle,
                                    lift: false,
                                    color: arrowColor
                                };
                            } else {
                                item_drawing.coords.push({
                                    X: 250,
                                    Y: 978,
                                    cp1X: 245,
                                    cp1Y: 402,
                                    cp2X: 245,
                                    cp2Y: 928
                                }, {X: 0, Y: 978});
                                measurement_arrows.pant_waist = {
                                    mirror: false,
                                    coords: [{X: -250, Y: 978}, {X: 250, Y: 978}],
                                    style: arcStyle,
                                    lift: false,
                                    color: arrowColor
                                };
                            }
                            break;
                        case 4:	// hips
                        /* falls through */
                        case 5:	// half-way-thigh
                        /* falls through */
                        default:
                            var $base_y = 978;
                            if (itemTypeArr[5] === 5) {
                                $base_y = 1038;
                            }
                            if (itemTypeArr[6] === 1) {	// elastic
                                item_drawing.coords.push({
                                    X: 250,
                                    Y: $base_y,
                                    cp1X: 247,
                                    cp1Y: 402,
                                    cp2X: 247,
                                    cp2Y: 908
                                }, {X: 230, Y: ($base_y + 60)}, {X: 0, Y: ($base_y + 60)});
                                for ($i = 0; $i < 15; $i++) {
                                    $x = Math.round(($i + 0.5) * (230 / 15));
                                    item_drawing.accents.push({
                                        type: "line",
                                        coords: [{X: $x, Y: ($base_y + 10)}, {X: $x, Y: ($base_y + 60)}]
                                    });
                                }
                                measurement_arrows.front_height.coords[1].Y = ($base_y + 60);
                                measurement_arrows.hips = {
                                    mirror: false,
                                    coords: [{X: -250, Y: $base_y}, {X: 250, Y: $base_y}],
                                    style: arcStyle,
                                    lift: false,
                                    color: arrowColor
                                };
                            } else {
                                item_drawing.coords.push({
                                    X: 250,
                                    Y: ($base_y + 60),
                                    cp1X: 245,
                                    cp1Y: 402,
                                    cp2X: 245,
                                    cp2Y: $base_y
                                }, {X: 0, Y: ($base_y + 60)});
                                measurement_arrows.front_height.coords[1].Y = ($base_y + 60);
                                measurement_arrows.hips = {
                                    mirror: false,
                                    coords: [{X: -250, Y: ($base_y + 60)}, {X: 250, Y: ($base_y + 60)}],
                                    style: arcStyle,
                                    lift: false,
                                    color: arrowColor
                                };
                            }
                            break;
                    }

                    break;	// case 1 shirts/coats

                case 2:	// trousers/shorts
                    item_drawing.mirror = false; // for accents mainly
                    item_drawing.coords.push({X: -232, Y: 0}, {
                        X: 222,
                        Y: 0,
                        cp1X: -100,
                        cp1Y: 10,
                        cp2X: 90,
                        cp2Y: 10
                    }, {X: 263, Y: 171});

                    switch (itemTypeArr[3]) { // sleeve
                        case 1:	// very short
                        case 2:	// short
                        case 3:	// short-medium
                            item_drawing.coords.push({X: 278, Y: 449}, {X: 38, Y: 474});
                            break;
                        case 4:	// medium
                            item_drawing.coords.push({X: 291, Y: 626}, {X: 71, Y: 651});
                            break;
                        case 5:  // semi-long
                        case 6:  // long
                            item_drawing.coords.push({X: 302, Y: 1071}, {X: 151, Y: 1084});
                            break;
                    }

                    item_drawing.coords.push({X: 5, Y: 297}, {X: -17, Y: 297});

                    switch (itemTypeArr[3]) { // sleeve again as not mirror
                        case 1:	// very short
                        case 2:	// short
                        case 3:	// short-medium
                            item_drawing.coords.push({X: -38, Y: 474}, {X: -278, Y: 449});
                            measurement_arrows.outseam = {
                                mirror: false,
                                coords: [{X: 222, Y: 0}, {X: 263, Y: 171}, {X: 278, Y: 449}],
                                style: "line",
                                lift: true,
                                color: arrowColor
                            };
                            measurement_arrows.knee_width = {
                                mirror: false,
                                coords: [{X: -278, Y: 449}, {X: -38, Y: 474}],
                                style: arcStyle,
                                lift: false,
                                color: arrowColor
                            };
                            break;
                        case 4:	// medium
                            item_drawing.coords.push({X: -71, Y: 651}, {X: -291, Y: 626});
                            measurement_arrows.outseam = {
                                mirror: false,
                                coords: [{X: 222, Y: 0}, {X: 263, Y: 171}, {X: 291, Y: 626}],
                                style: "line",
                                lift: true,
                                color: arrowColor
                            };
                            measurement_arrows.knee_width = {
                                mirror: false,
                                coords: [{X: -291, Y: 626}, {X: -71, Y: 651}],
                                style: arcStyle,
                                lift: false,
                                color: arrowColor
                            };
                            break;
                        case 5:  // semi-long
                        case 6:  // long
                            item_drawing.coords.push({X: -152, Y: 1084}, {X: -301, Y: 1071});
                            break;
                    }

                    item_drawing.coords.push({X: -261, Y: 171});
                    item_drawing.accents.push({
                            type: "area",
                            coords: [{X: -232, Y: 0}, {X: 222, Y: 0, cp1X: -100, cp1Y: 10, cp2X: 90, cp2Y: 10}, {
                                X: -232,
                                Y: 0,
                                cp1X: 122,
                                cp1Y: 40,
                                cp2X: -132,
                                cp2Y: 40
                            }]
                        },
                        {
                            type: "line",
                            coords: [{X: -237, Y: 37}, {X: 229, Y: 37, cp1X: -137, cp1Y: 76, cp2X: 129, cp2Y: 76}]
                        },
                        {
                            type: "line",
                            coords: [{X: -14, Y: 19}, {X: -8, Y: 297, cp1X: 3, cp1Y: 114, cp2X: 0, cp2Y: 215}]
                        },
                        {
                            type: "line",
                            coords: [{X: -4, Y: 254}, {X: 29, Y: 64, cp1X: 34, cp1Y: 242, cp2X: 35, cp2Y: 188}]
                        },
                        {
                            type: "line",
                            coords: [{X: -233, Y: 160}, {X: -147, Y: 81, cp1X: -182, cp1Y: 157, cp2X: -152, cp2Y: 123}]
                        },
                        {
                            type: "line",
                            coords: [{X: 150, Y: 85}, {X: 236, Y: 164, cp1X: 158, cp1Y: 128, cp2X: 195, cp2Y: 160}]
                        });
                    if (itemTypeArr[6] === '4') {	// rope waistband
                        item_drawing.accents.push({
                                type: "line",
                                coords: [{X: 9, Y: 49}, {X: 8, Y: 47, cp1X: -24, cp1Y: 168, cp2X: -69, cp2Y: 84}]
                            },
                            {
                                type: "line",
                                coords: [{X: 9, Y: 50}, {X: 8, Y: 49, cp1X: 47, cp1Y: 149, cp2X: 70, cp2Y: 99}]
                            },
                            {
                                type: "line",
                                coords: [{X: 9, Y: 49}, {X: 49, Y: 49, cp1X: 27, cp1Y: 59, cp2X: 36, cp2Y: 54}]
                            },
                            {
                                type: "line",
                                coords: [{X: 9, Y: 49}, {X: 9, Y: 64, cp1X: 11, cp1Y: 54, cp2X: 11, cp2Y: 54}]
                            });
                    } else {
                        item_drawing.accents.push({type: "circle", coords: [{X: 9, Y: 48, R: 10}]});
                    }

                    break; 	// case 2 trousers

                case 3:	// shoes for my friends
                    item_drawing.mirror = false;
                    item_drawing.coords = [{X: 130, Y: 0}, {X: 363, Y: 456, cp1X: 240, cp1Y: 8, cp2X: 345, cp2Y: 214},
                        {X: 328, Y: 633, cp1X: 358, cp1Y: 532, cp2X: 328, cp2Y: 564}, {
                            X: 182,
                            Y: 999,
                            cp1X: 330,
                            cp1Y: 732,
                            cp2X: 327,
                            cp2Y: 994
                        },
                        {X: 48, Y: 628, cp1X: 3, cp1Y: 994, cp2X: 48, cp2Y: 789},
                        {X: 0, Y: 340, cp1X: 42, cp1Y: 447, cp2X: 0, cp2Y: 444}, {
                            X: 130,
                            Y: 0,
                            cp1X: 0,
                            cp1Y: 114,
                            cp2X: 72,
                            cp2Y: 0
                        }];
                    item_drawing.accents = [{
                        type: "area",
                        coords: [{X: 164, Y: 625}, {
                            X: 266,
                            Y: 716,
                            cp1X: 270,
                            cp1Y: 632,
                            cp2X: 276,
                            cp2Y: 638
                        }, {X: 168, Y: 990, cp1X: 236, cp1Y: 982, cp2X: 208, cp2Y: 987},
                            {X: 69, Y: 716, cp1X: 92, cp1Y: 978, cp2X: 83, cp2Y: 852}, {
                                X: 164,
                                Y: 625,
                                cp1X: 64,
                                cp1Y: 641,
                                cp2X: 57,
                                cp2Y: 628
                            }]
                    },
                        {
                            type: "line",
                            coords: [{X: 103, Y: 431}, {X: 212, Y: 430, cp1X: 112, cp1Y: 404, cp2X: 203, cp2Y: 405}]
                        },
                        {
                            type: "line",
                            coords: [{X: 115, Y: 469}, {X: 200, Y: 469, cp1X: 121, cp1Y: 447, cp2X: 188, cp2Y: 450}]
                        },
                        {
                            type: "line",
                            coords: [{X: 115, Y: 506}, {X: 200, Y: 506, cp1X: 121, cp1Y: 484, cp2X: 188, cp2Y: 484}]
                        },
                        {
                            type: "line",
                            coords: [{X: 115, Y: 555}, {X: 200, Y: 555, cp1X: 121, cp1Y: 533, cp2X: 188, cp2Y: 533}]
                        },
                        {
                            type: "line",
                            coords: [{X: 164, Y: 539}, {
                                X: 283,
                                Y: 541,
                                cp1X: 242,
                                cp1Y: 523,
                                cp2X: 279,
                                cp2Y: 609
                            }, {X: 164, Y: 539, cp1X: 277, cp1Y: 492, cp2X: 209, cp2Y: 515}]
                        },
                        {
                            type: "line",
                            coords: [{X: 164, Y: 539}, {
                                X: 45,
                                Y: 492,
                                cp1X: 123,
                                cp1Y: 517,
                                cp2X: 34,
                                cp2Y: 532
                            }, {X: 164, Y: 539, cp1X: 65, cp1Y: 457, cp2X: 129, cp2Y: 509}]
                        }
                    ];
                    break;	// case 3 shoes

                case 4:	// hats off
                    switch (itemTypeArr[1]) {
                        case 1:	// bucket
                            item_drawing.mirror = false;
                            item_drawing.coords = [{X: 300, Y: 0},
                                {X: 522, Y: 214, cp1X: 452, cp1Y: 17, cp2X: 458, cp2Y: 61},
                                {X: 599, Y: 311, cp1X: 594, cp1Y: 245, cp2X: 601, cp2Y: 283},
                                {X: 293, Y: 437, cp1X: 597, cp1Y: 361, cp2X: 494, cp2Y: 433},
                                {X: 0, Y: 306, cp1X: 87, cp1Y: 433, cp2X: 2, cp2Y: 355},
                                {X: 92, Y: 209, cp1X: 1, cp1Y: 258, cp2X: 44, cp2Y: 227},
                                {X: 300, Y: 0, cp1X: 156, cp1Y: 28, cp2X: 186, cp2Y: 16}];
                            item_drawing.accents = [
                                {
                                    type: "line",
                                    coords: [{X: 222, Y: 48}, {X: 367, Y: 43, cp1X: 269, cp1Y: 29, cp2X: 288, cp2Y: 64}]
                                },
                                {
                                    type: "line", coords: [{X: 523, Y: 214}, {X: 544, Y: 280},
                                    {X: 63, Y: 278, cp1X: 376, cp1Y: 368, cp2X: 209, cp2Y: 373}, {X: 92, Y: 209}]
                                }];
                            break;
                    }
                    break;	// case 4 hats
            }
        }


        function getSliderHtml(systemsGo) {
            var sliderHtml = "";
            var basePosX = 0;
            var cellTitle = "";
            sliderHtml += "<div class='sizeme_slider'>";
            if (systemsGo) {
                sliderHtml += "<div class='slider_text slider_text_above'></div>";
                sliderHtml += "<div class='slider_container'>";
                sliderHtml += "<div class='slider_bar'>";
                sliderHtml += "</div>";
                if (sizeme_local_options.fitAreaSlider) {
                    sliderHtml += "<div class='slider_area'></div>";
                }
                sliderHtml += "<table class='slider_table'><tr>";
                for (var singleFit in FIT_RANGES) {
                    if (FIT_RANGES.hasOwnProperty(singleFit)) {
                        if (singleFit > 1) {
                            if (basePosX !== 0) {
                                var perc_width = Math.round((singleFit - basePosX) * sliderScale);
                                sliderHtml += "<td class='" + cellTitle + "'";
                                sliderHtml += " style='width: " + perc_width + "%; min-width: " + perc_width + "%;'>";
                                sliderHtml += i18n.FIT_VERDICT[cellTitle];
                                sliderHtml += "</td>";
                            }
                            basePosX = (+singleFit);
                            cellTitle = FIT_RANGES[singleFit].label;
                        }
                    }
                }
                sliderHtml += "</tr></table>";
                sliderHtml += "</div>";
            }
            sliderHtml += "<div class='slider_text slider_text_below'></div>";
            sliderHtml += "<div class='slider_text slider_text_more_below'></div>";
            sliderHtml += "</div>";

            return sliderHtml;
        }

        function sliderPos(fitValue, offset) {
            var returnPos = (Math.min(fitValue, sliderPosXMax) - sliderPosXMin) * sliderScale;
            returnPos = Math.max(0, returnPos);
            returnPos += offset;   // with +offset for graphics

            return returnPos;
        }

        function killExtraSlider() {
            $("#slider_secondary").remove();
            return true;
        }

        function drawExtraSlider(fitValue) {
            killExtraSlider(); // in case of hang arounds
            var sliderHtml = "<div class='slider_bar' id='slider_secondary'></div>";
            $(sliderHtml).hide().appendTo(".sizeme_detailed_view_window .slider_container").fadeIn(fadeLength);
            var newWidth = sliderPos(fitValue, 0);
            $("#slider_secondary").width(newWidth + '%');
            return true;
        }


        function writeSliderFlag(fitValue, fitLabel, thisSize, thisId) {
            // first, out with the old
            var sliderFlagHtml = "<div class='sliderFlag' id='sm_sf_" + thisSize + "'";
            sliderFlagHtml += " style='width: " + sliderPos(fitValue, 0) + "%'>";
            sliderFlagHtml += "<a class='flagItself " + fitLabel + "' href='#'>" + thisSize + "</a>";
            sliderFlagHtml += "</div>";
            $(".slider_container").append(sliderFlagHtml);
            $(".sm_sf_" + thisSize).hover(function () {
                $(this).toggleClass("activeFlag");
            }).click(function () {
                $(thisId).prop("checked", true);
                moveSlider(fitValue, true);
                return false;
            });
        }

        function moveSlider(fitValue, shouldAnimate) {
            var newWidth = sliderPos(fitValue, 0) + '%';
            if (shouldAnimate) {
                $('.slider_bar').stop().animate({width: newWidth});
            } else {
                $('.slider_bar').width(newWidth);
            }
        }

        function moveAreaSlider(fitValue, matchMap, shouldAnimate) {
            var smallestFit = 9999;
            var biggestFit = 0;
            var endX, startX, newWidth, newMarginLeft;
            for (var measurement in matchMap) {
                if (matchMap.hasOwnProperty(measurement)) {
                    if (isImportant(matchMap[measurement].importance, matchMap[measurement].componentFit)) {
                        if (matchMap[measurement].componentFit > 0 && matchMap[measurement].componentFit < smallestFit) {
                            smallestFit = matchMap[measurement].componentFit;
                        }
                        if (matchMap[measurement].componentFit > 0 && matchMap[measurement].componentFit > biggestFit) {
                            biggestFit = matchMap[measurement].componentFit;
                        }
                    }
                }
            }

            if (fitValue > smallestFit) {
                endX = sliderPos(fitValue, 0);
                startX = sliderPos(smallestFit, 0);
                newWidth = (endX - startX);
                newMarginLeft = startX;
            } else {
                endX = sliderPos(biggestFit, 0);
                startX = sliderPos(fitValue, 0);
                newWidth = (endX - startX);
                newMarginLeft = startX;
            }

            if (shouldAnimate) {
                $('.slider_area').stop().animate({width: newWidth + '%', marginLeft: newMarginLeft + '%'});
            } else {
                $('.slider_area').width(newWidth + '%').css('marginLeft', newMarginLeft + '%');
            }
        }

        function goWriteMessages(matchMap, missingMeasurements, accuracy, totalFit) {
            var $message = "";
            var $message_type = "";
            var $message_link = "";

            $(".sizeme_slider .slider_text_more_below").empty();

            if (!selectedProfile) {
                $message_type = "noMeasurements";
                $message_link = linkToSelectedProfile;
                $message = i18n.MESSAGE.add_profiles;
            } else {
                if (missingMeasurements[0]) {
                    if (missingMeasurements[0].length > 0) {
                        $message_type = "missingMeasurements";
                        $message_link = linkToSelectedProfile;
                        $message = i18n.MESSAGE.missing_measurements;
                    }
                }

                if (accuracy < accuracyThreshold) {
                    $message_type = "noMeasurements";
                    $message_link = linkToSelectedProfile;
                    $message = i18n.MESSAGE.no_measurements;
                }

                if ((!$message_type) && (typeof matchMap.neck_opening_width !== "undefined")) {
                    if ((totalFit >= 1000) && (matchMap.neck_opening_width.overlap < 0)) {
                        $message_type = "info";
                        $message = i18n.MESSAGE.no_top_button;
                    }
                }
            }

            if ($message_type) {
                if ($message_link) {
                    $('<a></a>')
                        .addClass("message_container " + $message_type)
                        .text($message)
                        .attr("href", linkToSelectedProfile)
                        .attr("target", "_blank")
                        .appendTo(".sizeme_slider .slider_text_more_below");
                } else {
                    $('<div></div>')
                        .addClass("message_container " + $message_type)
                        .text($message)
                        .appendTo(".sizeme_slider .slider_text_more_below");
                }
            }
        }

        function selectToButtons(element) {
            $(element + " select").hide();
            var numClass = "num_" + $(element + " option").length;
            var $content = $(document.createElement("div")).addClass("sm-buttonset " + numClass);
            $(element + " option").each(function () {
                var thisId = this.id;
                var thisLabel = sizeText($(this).text());
                var thisClass = $(this).attr("class");
                var thisVal = $(this).val();
                var $div = $('<div>')
                    .addClass('sm-button ' + thisClass)
                    .attr("id", "button_" + thisId)
                    .text(thisLabel)
                    .on("click", function () {
                        $(".sm-buttonset").find(".sm-selectable").removeClass("sm-state-active");
                        $(".element_for_" + thisVal).addClass("sm-state-active");
                        $(sizeme_UI_options.sizeSelectionContainer + ':not(".cloned")').find("select").val(thisVal);
                        $(sizeme_UI_options.sizeSelectionContainer + ':not(".cloned")').find("select").trigger("change");	// yell change at original size selector
                    });
                $content.append($div);
            });
            $(element).append($content);
        }

        function getMaxY(data) {
            var max = 0;
            for (var i = 0; i < data.coords.length; i++) {
                max = Math.max(max, data.coords[i].Y);
            }
            return max;
        }

        function getMaxX(data) {
            var max = 0;
            for (var i = 0; i < data.coords.length; i++) {
                max = Math.max(max, data.coords[i].X);
            }
            return max;
        }

        function getMinX(data) {
            var min = 99999;
            for (var i = 0; i < data.coords.length; i++) {
                min = Math.min(min, data.coords[i].X);
            }
            return min;
        }

        function getMinY(data) {
            var min = 99999;
            for (var i = 0; i < data.coords.length; i++) {
                min = Math.min(min, data.coords[i].Y);
            }
            return min;
        }

        function getArced(p1, p2) {
            var dX = p2.X - p1.X;
            p2.cp1X = p1.X + Math.round(dX / arcRadius);
            p2.cp1Y = p1.Y + Math.round(dX / arcRadius);
            p2.cp2X = p2.X - Math.round(dX / arcRadius);
            p2.cp2Y = p2.Y + Math.round(dX / arcRadius);
            return true;
        }

        function liftCoords(data) {
            data.nX = 0;
            data.nY = 0;
            if (data.lift) {
                for (var i = 1; i < data.coords.length; i++) {
                    var dX = data.coords[i].X - data.coords[i - 1].X;
                    var dY = data.coords[i].Y - data.coords[i - 1].Y;
                    var angleA = Math.atan2(dY, dX);
                    data.nX = Math.sin(angleA) * arrowLift;
                    data.nY = -Math.cos(angleA) * arrowLift;
                }
            }
            return true;
        }

        function getMidPoints(data) {
            var dX = data.coords[1].X - data.coords[0].X;
            var dY = data.coords[1].Y - data.coords[0].Y;
            data.mid = {X: Math.round(dX / 2) + data.coords[0].X, Y: Math.round(dY / 2) + data.coords[0].Y};
            if (data.style === "arc") {
                data.mid.Y += Math.round(dX / arcRadius * 0.7);
            }
        }

        function plotItem(c, data, isArrow, scale, offsetX, offsetY, highlighted) {
            function pX(coord) {
                return (coord * scale) + offsetX;
            }

            function pY(coord) {
                return (coord * scale) + offsetY;
            }

            var i, j, lcp;

            c.beginPath();

            if (isArrow) {	// ARROW
                c.lineWidth = arrowLineWidth;
                if (highlighted) {
                    c.lineWidth = arrowLineWidth + 2;
                }
                liftCoords(data);
                c.moveTo(pX(data.coords[0].X + data.nX), pY(data.coords[0].Y + data.nY));
                for (i = 1; i < data.coords.length; i++) {
                    switch (data.style) {
                        case "circle":
                            getArced(data.coords[i - 1], data.coords[i]);
                            c.bezierCurveTo(pX(data.coords[i].cp1X + data.nX), pY(data.coords[i].cp1Y + data.nY),
                                pX(data.coords[i].cp2X + data.nX), pY(data.coords[i].cp2Y + data.nY),
                                pX(data.coords[i].X + data.nX), pY(data.coords[i].Y + data.nY));
                            c.bezierCurveTo(pX(-data.coords[i].cp1X + data.nX), pY(-data.coords[i].cp1Y + data.nY),
                                pX(-data.coords[i].cp2X + data.nX), pY(-data.coords[i].cp2Y + data.nY),
                                pX(data.coords[0].X + data.nX), pY(data.coords[0].Y + data.nY));
                            break;
                        case "arc":
                            getArced(data.coords[i - 1], data.coords[i]);
                        /* falls through */
                        case "line":
                            if (typeof data.coords[i].cp1X !== 'undefined') {
                                c.bezierCurveTo(pX(data.coords[i].cp1X + data.nX), pY(data.coords[i].cp1Y + data.nY), pX(data.coords[i].cp2X + data.nX), pY(data.coords[i].cp2Y + data.nY), pX(data.coords[i].X + data.nX), pY(data.coords[i].Y + data.nY));
                            } else {
                                c.lineTo(pX(data.coords[i].X + data.nX), pY(data.coords[i].Y + data.nY));
                            }
                            break;
                    }
                }
                c.stroke();

                if (data.style === "line") {
                    // start and end circles
                    c.beginPath();
                    c.arc(pX(data.coords[0].X + data.nX), pY(data.coords[0].Y + data.nY), arrowEndRadius, 0, Math.PI * 2, true);
                    c.fill();
                    c.beginPath();
                    c.arc(pX(data.coords[data.coords.length - 1].X + data.nX), pY(data.coords[data.coords.length - 1].Y + data.nY), arrowEndRadius, 0, Math.PI * 2, true);
                    c.fill();
                }

                // mid circle
                getMidPoints(data);
                if (typeof data.midCircle !== 'undefined') {
                    data.mid.X = data.midCircle.X;
                    data.mid.Y = data.midCircle.Y;
                }
                var rad = arrowNumberRadius;
                if (highlighted) {
                    rad += 5;
                }
                c.beginPath();
                c.arc(pX(data.mid.X + data.nX), pY(data.mid.Y + data.nY), rad, 0, Math.PI * 2, true);
                c.fill();
                c.beginPath();
                c.fillStyle = "#FFFFFF";
                c.font = arrowNumberFont;
                c.textAlign = "center";
                c.textBaseline = "middle";
                if (highlighted) {
                    c.font = arrowNumberHighlightFont;
                }
                c.fillText(data.num, pX(data.mid.X + data.nX), pY(data.mid.Y + data.nY));

            } else {	// ITEM
                c.fillStyle = fillColor;
                c.strokeStyle = fillColor;
                c.lineWidth = 0.1;

                c.moveTo(pX(data.coords[0].X), pY(data.coords[0].Y));

                for (i = 1; i < data.coords.length; i++) {
                    if (typeof data.coords[i].cp1X !== 'undefined') {
                        c.bezierCurveTo(pX(data.coords[i].cp1X), pY(data.coords[i].cp1Y), pX(data.coords[i].cp2X), pY(data.coords[i].cp2Y), pX(data.coords[i].X), pY(data.coords[i].Y));
                    } else {
                        c.lineTo(pX(data.coords[i].X), pY(data.coords[i].Y));
                    }
                }

                if (data.mirror) {
                    lcp = [{X: null, Y: null}, {X: null, Y: null}];

                    for (i = data.coords.length - 1; i >= 0; i--) {
                        if (lcp[0].X) {
                            c.bezierCurveTo(pX(lcp[0].X), pY(lcp[0].Y), pX(lcp[1].X), pY(lcp[1].Y), pX(-data.coords[i].X), pY(data.coords[i].Y));
                        } else {
                            c.lineTo(pX(-data.coords[i].X), pY(data.coords[i].Y));
                        }

                        if (typeof data.coords[i].cp1X !== 'undefined') {
                            lcp[0].X = -data.coords[i].cp2X;
                            lcp[0].Y = data.coords[i].cp2Y;
                            lcp[1].X = -data.coords[i].cp1X;
                            lcp[1].Y = data.coords[i].cp1Y;
                        } else {
                            lcp = [{X: null, Y: null}, {X: null, Y: null}];
                        }
                    }
                }

                c.fill();
                c.stroke();

                // accents
                c.fillStyle = drawColor;
                c.strokeStyle = drawColor;
                c.lineWidth = itemLineWidth;
                c.lineCap = "butt";
                c.lineJoin = "miter";
                c.miterLimit = 1;

                for (i = 0; i < data.accents.length; i++) {
                    c.beginPath();
                    if (data.accents[i].type === "circle") {
                        c.arc(pX(data.accents[i].coords[0].X), pY(data.accents[i].coords[0].Y), data.accents[i].coords[0].R * realCanvasWidth / 1000, 0, Math.PI * 2, true);
                    } else {
                        c.moveTo(pX(data.accents[i].coords[0].X), pY(data.accents[i].coords[0].Y));
                        for (j = 1; j < data.accents[i].coords.length; j++) {
                            if (typeof data.accents[i].coords[j].cp1X !== 'undefined') {
                                c.bezierCurveTo(pX(data.accents[i].coords[j].cp1X), pY(data.accents[i].coords[j].cp1Y), pX(data.accents[i].coords[j].cp2X), pY(data.accents[i].coords[j].cp2Y), pX(data.accents[i].coords[j].X), pY(data.accents[i].coords[j].Y));
                            } else {
                                c.lineTo(pX(data.accents[i].coords[j].X), pY(data.accents[i].coords[j].Y));
                            }
                        }
                    }
                    if (data.accents[i].type === "area") {
                        c.fill();
                    }
                    c.stroke();

                    if (data.mirror) {
                        if (typeof data.accents[i].noMirror === 'undefined') {
                            lcp = [{X: null, Y: null}, {X: null, Y: null}];
                            c.beginPath();
                            c.moveTo(pX(-data.accents[i].coords[data.accents[i].coords.length - 1].X), pY(data.accents[i].coords[data.accents[i].coords.length - 1].Y));
                            for (j = data.accents[i].coords.length - 1; j >= 0; j--) {
                                if (lcp[0].X) {
                                    c.bezierCurveTo(pX(lcp[0].X), pY(lcp[0].Y), pX(lcp[1].X), pY(lcp[1].Y), pX(-data.accents[i].coords[j].X), pY(data.accents[i].coords[j].Y));
                                } else {
                                    c.lineTo(pX(-data.accents[i].coords[j].X), pY(data.accents[i].coords[j].Y));
                                }

                                if (typeof data.accents[i].coords[j].cp1X !== 'undefined') {
                                    lcp[0].X = -data.accents[i].coords[j].cp2X;
                                    lcp[0].Y = data.accents[i].coords[j].cp2Y;
                                    lcp[1].X = -data.accents[i].coords[j].cp1X;
                                    lcp[1].Y = data.accents[i].coords[j].cp1Y;
                                } else {
                                    lcp = [{X: null, Y: null}, {X: null, Y: null}];
                                }
                            }
                            if (data.accents[i].type === "area") {
                                c.fill();
                            }
                            c.stroke();
                        }
                    }
                } // end for accents
            }
        }

        function writeItemCanvas(canvas_id, matchMap, highlight) {

            if (document.getElementById(canvas_id).getContext) {
                var c = document.getElementById(canvas_id).getContext('2d');
                $("#" + canvas_id).attr("width", realCanvasWidth).attr("height", realCanvasHeight);

                // get scale and offsets
                var canvasWidth = realCanvasWidth * (1 - (2 * padding));
                var canvasHeight = realCanvasHeight * (1 - (2 * padding));

                var maxX = getMaxX(item_drawing) - getMinX(item_drawing);
                if (item_drawing.mirror) {
                    maxX = getMaxX(item_drawing) * 2;
                }
                var maxY = getMaxY(item_drawing) - getMinY(item_drawing);
                var scale = 1;
                if (maxX !== 0) {
                    scale = canvasWidth / maxX;
                }
                if (maxY !== 0 && (canvasWidth / canvasHeight) > (maxX / maxY)) {
                    scale = canvasHeight / maxY;
                }

                var offsetX = (realCanvasWidth - ((getMaxX(item_drawing) + getMinX(item_drawing)) * scale)) / 2;
                if (item_drawing.mirror) {
                    offsetX = realCanvasWidth / 2;
                }
                var offsetY = (realCanvasHeight - ((getMaxY(item_drawing) + getMinY(item_drawing)) * scale)) / 2;

                // item
                plotItem(c, item_drawing, false, scale, offsetX, offsetY, false);
                var inputKey = $(sizeme_UI_options.sizeSelectionContainer).find("select").val();

                // arrows
                if (matchMap) {
                    // Detailed
                    sizeme_product.item.measurements[inputKey].each(function (measurement) {
                        if (sizeme_product.item.measurements[inputKey][measurement] > 0 && measurement_arrows[measurement]) {
                            // var draw = (matchMap[measurement].componentFit > 0);
                            var draw = true;
                            if (draw) {
                                c.strokeStyle = measurement_arrows[measurement].color;
                                c.fillStyle = measurement_arrows[measurement].color;
                                plotItem(c, measurement_arrows[measurement], true, scale, offsetX, offsetY, (measurement === highlight && highlight !== null));
                            }
                        }
                    });
                } else {
                    // Size Guider
                    if (!inputKey) {
                        inputKey = Object.keys(sizeme_product.item.measurements)[0];
                    }
                    if (inputKey) {
                        if (typeof sizeme_product.item.measurements[inputKey] !== "undefined") {
                            sizeme_product.item.measurements[inputKey].each(function (measurement) {
                                if (sizeme_product.item.measurements[inputKey][measurement] > 0 && measurement_arrows[measurement]) {
                                    c.strokeStyle = measurement_arrows[measurement].color;
                                    c.fillStyle = measurement_arrows[measurement].color;
                                    plotItem(c, measurement_arrows[measurement], true, scale, offsetX, offsetY, (measurement === highlight && highlight !== null));
                                }
                            });
                        }
                    }
                }
            }
        }

        function initOpentip() {
            Opentip.lastZIndex = 999999999;
            Opentip.styles.myDefaultStyle = {
                //target: true,
                //tipJoint: "center top",
                group: "myTips"
            };
            Opentip.defaultStyle = "myDefaultStyle";
        }

        function hasNeckOpening() {
            var inputKey = $(sizeme_UI_options.sizeSelectionContainer).find("select").val();
            if (!inputKey) {
                inputKey = Object.keys(sizeme_product.item.measurements)[0];
            }
            var retval = false;
            if (typeof sizeme_product.item.measurements[inputKey] !== "undefined") {
                if (typeof sizeme_product.item.measurements[inputKey].neck_opening_width !== "undefined") {
                    retval = (sizeme_product.item.measurements[inputKey].neck_opening_width > 0);
                }
            }
            return retval;
        }

        function noThanks() {
            return readCookie("sizeme_no_thanks") === "true";
        }

        function noProductSplash() {
            return readCookie("sizeme_no_product_splash") === "true";
        }

        function writeDetailedWindow(isSizeGuide) {
            // create detailed dialog window
            itemName = sizeme_product.name;
            var txts = i18n.DETAILED;
            var linkTarget = ".sizeme_slider .slider_text_below";

            initOpentip();

            if (isSizeGuide) {
                txts = i18n.SIZE_GUIDE;
                linkTarget = sizeme_UI_options.appendContentTo;
            }

            var $dialog = $('<div id="sizeme_detailed_view_content"></div>')
                .dialog({
                    position: {my: "center", at: "center", of: window},
                    autoOpen: false,
                    dialogClass: "sizeme_detailed_view_window",
                    minHeight: 620,
                    minWidth: 940,
                    scaleH: 1,
                    scaleW: 1,
                    closeText: i18n.COMMON.close_text,
                    title: txts.window_title + ' <span class="name">' + itemName + '</span>'
                });

            // add toggle link to main page
            $("<a class='a_button sm_detailed_view" + (isSizeGuide ? " size_guide" : "") + "' id='popup_opener' href='#'>" + txts.button_text + "</a>")
                .click(function () {
                    if (isSizeGuide) {
                        SizeMe.trackEvent("sizeGuideOpened", "Store: Size guide opened");
                    } else {
                        SizeMe.trackEvent("detailedViewOpened", "Store: Detailed view opened");
                    }
                    $dialog.dialog('open');
                    return false;
                })
                .appendTo(linkTarget);

            // write two columns
            $("<div class='dialog_col' id='col1'></div><div class='dialog_col' id='col2'></div>").appendTo("#sizeme_detailed_view_content");

            // add bottom title bar
            $("<div class='sm-bottombar ui-dialog-bottombar'></div>").appendTo("#sizeme_detailed_view_content");

            // write item image canvas to first column
            $("<div class='sizeme_detailed_section'></div>")
                .append("<canvas id='sizeme_item_view'></canvas>")
                .appendTo("#col1");

            // add shopping for selection to second (no cloning)
            if (!isSizeGuide) {
                $("<div class='sizeme_detailed_section'></div>")
                    .append("<h2>" + i18n.COMMON.shopping_for + "</h2>")
                    .append("<div class='shopping_for'></div>")
                    .appendTo("#col2");

                // clone size select (and possible buttons) to detailed window
                var $clone = $(sizeme_UI_options.sizeSelectionContainer).clone(true, true);
				$clone.addClass("cloned");
                $clone.find("[id]").each(function () {
                    this.id = "clone_" + this.id;
                    $(this).addClass("cloned");
                    if (this.name) {
                        this.name = "clone_" + this.name;
                    }

                });
				
                $("<div class='sizeme_detailed_section'></div>")
                    .append("<h2>" + i18n.COMMON.selected_size + "</h2>")
                    .append($clone)
                    .appendTo("#col2");
					
				// add change event to cloned select too
				$(sizeme_UI_options.sizeSelectionContainer + '.cloned').find("select").change(function () {
					thisVal = $(this).val();
					// send value to original select and trigger change there
					$(sizeme_UI_options.sizeSelectionContainer + ':not(".cloned")').find("select").val(thisVal);
					$(sizeme_UI_options.sizeSelectionContainer + ':not(".cloned")').find("select").trigger("change");
				});

                // clone slider (without detailed view toggler and in content stuff)
                var $slider_clone = $(".sizeme_slider")
                    .clone(true, true)
                    .find(".slider_text_below").remove()
                    .end();

                $("<div class='sizeme_detailed_section'></div>")
                    .append("<h2>" + i18n.FIT_INFO.overall_fit + "</h2>")
                    .append($slider_clone)
                    .appendTo("#col2");
            }

            // write detailed table to col 2
            $("<div class='sizeme_detailed_section'></div>")
                .append("<h2>" + txts.table_title + "</h2>")
                .append("<table id='detailed_table'><tbody></tbody></table>")
                .appendTo("#col2");

            // bind hover event to run_highlights
            $("#detailed_table").on("mouseenter", ".run_highlight", function () {
                var highlight = $(this).data("measurement");
                $(this).find("td.cell_" + highlight).addClass("highlighted");
                var $matchMap = $("#detailed_table").find("tbody").data("matchMap");
                writeItemCanvas('sizeme_item_view', $matchMap, highlight);
                if (sizeme_local_options.fitAreaSlider && $matchMap) {
                    if ($matchMap[highlight]) {
                        if (($matchMap[highlight].componentFit > 0) && (isImportant($matchMap[highlight].importance, $matchMap[highlight].componentFit))) {
                            drawExtraSlider($matchMap[highlight].componentFit);
                        }
                    }
                }
            }).on("mouseleave", ".run_highlight", function () {
                var highlight = $(this).data("measurement");
                $(this).find("td.cell_" + highlight).removeClass("highlighted");
                writeItemCanvas('sizeme_item_view', $("#detailed_table").find("tbody").data("matchMap"), "");
                if (sizeme_local_options.fitAreaSlider) {
                    killExtraSlider();
                }
            });

            // disclaimers
            if (isSizeGuide) {
                var $txt = i18n.SIZE_GUIDE.measurement_disclaimer;
                if (hasNeckOpening()) {
                    $txt += "<br />" + i18n.SIZE_GUIDE.measurement_disclaimer_collar;
                }
                if (isInside()) {
                    $txt = i18n.SIZE_GUIDE.measurement_disclaimer_inside;
                }
                $("<div class='sizeme_explanation'></div>")
                    .append("<p>" + $txt + "</p>")
                    .appendTo("#col2");

                if (sizeme_options.service_status === "on") {
                    $("<div class='sizeme_advertisement'></div>")
                        .append("<p>" + i18n.SIZE_GUIDE.advertisement + " " +
                            "<a id='sizeme_ad_link' href='" + SizeMe.contextAddress + "' class='logo' target='_blank'></a></p>")
                        .appendTo("#sizeme_detailed_view_content");
                    $("#sizeme_ad_link").on("click", function () {
                        clearAuthToken();
                        if (noThanks()) {
                            eraseCookie("sizeme_no_thanks");
                            $(".splash").fadeIn();
                            return false;
                        }
                    });
                }
            }
        }

        function isImportant(importance, componentFit) {
            return (importance === 1 || ((importance === -1) && (componentFit < 1000)));
        }

        function colorCell($cell, value, arrow) {
            if (arrow) {
                arrow.color = arrowColorInfo;
            }
            if (value) {
                var selectedFit = getFit(value.componentFit, value.importance);
                $cell.addClass(selectedFit.label);
                if (arrow) {
                    arrow.color = selectedFit.arrowColor;
                }
            }
            return $cell;
        }

        function getMissingMeasurement(missingMeasurements, measurement) {
            for (var $i = 0; $i < missingMeasurements.length; $i++) {
                if (missingMeasurements[$i][0] === measurement) {
                    return missingMeasurements[$i][1];
                }
            }
            return null;
        }

        function isPinched(measurement) {
            return (PINCHED_FITS.indexOf(measurement) >= 0);
        }

        function isLongFit(measurement) {
            return (LONG_FITS.indexOf(measurement) >= 0);
        }

        function isPinchedTxt(measurement) {
            if (isPinched(measurement)) {
                return " " + i18n.FIT_INFO.when_pinched;
            }
            return "";
        }

        function getStretchedTxt(stretch_value) {
            if (stretch_value > 0) {
                if (stretch_value < 25) {
                    return i18n.FIT_INFO.stretched_little + "  ";
                } else if (stretch_value < 75) {
                    return i18n.FIT_INFO.stretched_somewhat + "  ";
                } else if (stretch_value < 95) {
                    return i18n.FIT_INFO.stretched_much + "  ";
                } else {
                    return i18n.FIT_INFO.stretched_max + "  ";
                }
            }
            return "";
        }


        function updateDetailedTable(matchMap, inputKey, missingMeasurements) {
            var $table = $("#detailed_table").find("tbody"),
                $row, $i, $tip, $txt;
            $table.empty();
            if (matchMap) {
                // *** Detailed View ***
                $table.data("matchMap", matchMap);

                $row = $(document.createElement("tr")).addClass("header_row");
                $i = 0;
                sizeme_product.item.measurements[inputKey].each(function (measurement) {
                    if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                        var $txt = '<span class="num">' + (++$i) + '</span>' + i18n.MEASUREMENT[measurement];
                        if (measurement_arrows[measurement]) {
                            measurement_arrows[measurement].num = $i;
                        }
                        $row.append($(document.createElement("td")).html($txt).addClass("run_highlight cell_" + measurement).data("measurement", measurement));
                    }
                });
                $table.append($row);

                var $tip_txts = [];
                var $tip_classes = [];

                if (sizeme_local_options.writeOverlaps) {
                    $row = $(document.createElement("tr")).addClass("data_row");
                    sizeme_product.item.measurements[inputKey].each(function (measurement) {
                        var drawReason = 0;
                        if (matchMap[measurement] && matchMap[measurement].componentFit > 0) {
                            drawReason = 1;
                        }
                        if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                            drawReason = 2;
                        }
                        if (drawReason > 0) {
                            var $txt = "";
                            var $meas_top = 0;
                            $tip_txts[measurement] = i18n.FIT_INFO.the_item + " " + i18n.MEASUREMENT[measurement].toLowerCase() + " " + i18n.FIT_INFO.the_measurement + " ";

                            if (matchMap[measurement]) {
                                $txt = (matchMap[measurement].overlap / 10).toFixed(1) + " cm";
                                if (isPinched(measurement)) {
                                    $txt = (matchMap[measurement].overlap / 20).toFixed(1) + " cm";
                                }
                                if ((matchMap[measurement].overlap <= 0) && (matchMap[measurement].componentFit >= 1000)) {
                                    $txt = "0.0 cm";
                                }

                                switch (measurement) {
                                    case "sleeve":
                                        var $sleeve_txt = "<div class='sleeve" + (matchMap[measurement].overlap < 0 ? " negative_overlap" : "") + "'>";
                                        var $sleeve_height = Math.round(29 + (75 * (matchMap[measurement].percentage / 0.3)));	// zero-point + (wrist_to_finger * (overlap_percentage / normal_finger_ratio))
                                        $sleeve_height = Math.max(11, $sleeve_height);	// never under 11 (34 px)
                                        $sleeve_height = Math.min(105, $sleeve_height);	// never over overlap image height

                                        $meas_top = Math.round((($sleeve_height - 29) / 2) + 29 - 9);
                                        if (($sleeve_height - 29) < 14) { // no fit in middle if no room
                                            $meas_top = $sleeve_height + 23;
                                        }
                                        if (matchMap[measurement].overlap < 0) {
                                            $sleeve_txt += "<div class='meas' style='top:14px;left:-7px;'>" + $txt + "</div>";	// negative overlap in different place
                                            if (matchMap[measurement].componentFit >= 1000) {
                                                $sleeve_height = 29;
                                            }
                                        } else {
                                            $sleeve_txt += "<div class='meas' style='top:" + $meas_top + "px;";
                                            if (matchMap[measurement].overlap >= 100) {
                                                $sleeve_txt += "left:-7px;";
                                            }
                                            $sleeve_txt += "'>" + $txt + "</div>";	// mid point?
                                        }

                                        $sleeve_txt += "<div class='sleeve_overlap' style='height:" + ($sleeve_height + 23) + "px;'></div>";	// sleeve + image bottom clearance
                                        $sleeve_txt += "</div>";
                                        $tip_txts[measurement] = $sleeve_txt + $tip_txts[measurement];
                                        break;
                                    case "front_height":
                                        var $front_height_txt = "<div class='front_height" + (matchMap[measurement].overlap < 0 ? " negative_overlap" : "") + "'>";
                                        var $front_height_height = Math.round(25 + (matchMap[measurement].percentage * (9 / 0.05)));	// zero-point + (overlap_percentage * (pant waistband height in px / pant waistband in %))
                                        $front_height_height = Math.max(0, $front_height_height);	// never under 0 (+23 = 34 px)
                                        $front_height_height = Math.min(105, $front_height_height);	// never over overlap image height (+23 px)

                                        $meas_top = Math.round((($front_height_height - 25) / 2) + 25 - 9);
                                        if (($front_height_height - 25) < 12) { // no fit in middle if no room
                                            $meas_top = $front_height_height + 23;
                                        }
                                        if (matchMap[measurement].overlap < 0) {
                                            $front_height_txt += "<div class='meas' style='top:14px;left:-7px;'>" + $txt + "</div>";	// negative overlap in different place
                                            if (matchMap[measurement].componentFit >= 1000) {
                                                $front_height_height = 28;
                                            }
                                        } else {
                                            $front_height_txt += "<div class='meas' style='top:" + $meas_top + "px;";
                                            if (matchMap[measurement].overlap >= 100) {
                                                $front_height_txt += "left:-12px;";
                                            }
                                            $front_height_txt += "'>" + $txt + "</div>";	// mid point?
                                        }

                                        $front_height_txt += "<div class='front_height_overlap' style='height:" + ($front_height_height + 23) + "px;'></div>";	// front_height + image (arrow) bottom clearance
                                        $front_height_txt += "</div>";
                                        $tip_txts[measurement] = $front_height_txt + $tip_txts[measurement];
                                        break;
                                }	// end switch measurement

                                if (matchMap[measurement].overlap <= 0) {
                                    if (matchMap[measurement].componentFit >= 1000) {
                                        $txt = "0.0 cm";
                                        $tip_txts[measurement] += i18n.FIT_INFO.no_overlap + "  ";
                                        $tip_txts[measurement] += getStretchedTxt(matchMap[measurement].componentStretch);
                                    } else {
                                        $tip_txts[measurement] += i18n.FIT_INFO.is_smaller + " ";
                                        $tip_txts[measurement] += $txt.replace("-", "");
                                        $tip_txts[measurement] += isPinchedTxt(measurement) + ".  ";
                                    }
                                } else {
                                    if (isPinched(measurement)) {
                                        $tip_txts[measurement] = "<div class='pinched'><div class='meas'>" + $txt + "</div></div>" + $tip_txts[measurement];
                                    }

                                    $txt = "+" + $txt;
                                    $tip_txts[measurement] += i18n.FIT_INFO.overlaps_you + " <b>" + $txt + "</b>" + isPinchedTxt(measurement);
                                    if (measurement === "sleeve") {
                                        $tip_txts[measurement] += " " + i18n.FIT_INFO.arm_sleeve_straight;
                                    }
                                    $tip_txts[measurement] += ".  ";
                                }

                                if (matchMap[measurement].componentFit > 0) {
                                    var $fitVerdict = i18n.FIT_VERDICT[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];
                                    if (isLongFit(measurement)) {
                                        $fitVerdict = i18n.FIT_VERDICT_LONG[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];
                                    }
                                    $tip_txts[measurement] += i18n.FIT_INFO.sm_considers_fit + " <b>" + $fitVerdict.toLowerCase() + "</b>.";
                                }

                            } else if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                                $txt = (sizeme_product.item.measurements[inputKey][measurement] / 10).toFixed(1) + " cm";
                                $tip_txts[measurement] += i18n.COMMON.is + " " + $txt + ".  ";
                                if (missingMeasurements) {
                                    if (getMissingMeasurement(missingMeasurements, measurement) !== null) {
                                        $tip_txts[measurement] += i18n.MESSAGE.add_this_measurement;
                                    }
                                }
                            }

                            var $cell = $(document.createElement("td"))
                                .text($txt)
                                .attr("id", "overlap_" + measurement)
                                .addClass("run_highlight cell_" + measurement)
                                .data("measurement", measurement);
                            $row.append(colorCell($cell, matchMap[measurement], measurement_arrows[measurement]));
                            $tip_classes[measurement] = "";
                            if (isPinched(measurement)) {
                                $tip_classes[measurement] = "isPinched";
                            }
                            if (measurement === "sleeve") {
                                $tip_classes[measurement] = "sleeve";
                            }
                            $tip = new Opentip($cell, $tip_txts[measurement], {className: $tip_classes[measurement]});
                        }
                    });
                    $table.append($row);
                }

                $row = $(document.createElement("tr")).addClass("data_row fit_label_row");
                sizeme_product.item.measurements[inputKey].each(function (measurement, value) {
                    var $cell;
                    if (matchMap[measurement]) {
                        if (matchMap[measurement].componentFit > 0) {
                            $txt = i18n.FIT_VERDICT[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];

                            if (isLongFit(measurement)) {
                                $txt = i18n.FIT_VERDICT_LONG[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];
                            }

                            $cell = $(document.createElement("td"))
                                .html('<div>' + $txt + '</div>')
                                .addClass("run_highlight")
                                .data("measurement", measurement);

                            $row.append(colorCell($cell, matchMap[measurement], measurement_arrows[measurement]));
                        } else if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                            $txt = "";
                            $cell = $(document.createElement("td"))
                                .html($txt)
                                .addClass("info run_highlight cell_" + measurement)
                                .data("measurement", measurement);
                            $row.append($cell);
                        }
                    } else if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                        $txt = "";
                        var $class = "",
                            missing;
                        if (missingMeasurements) {
                            if ((missing = getMissingMeasurement(missingMeasurements, measurement)) !== null) {
                                $txt = "<a target='_blank' href='" + linkToSelectedProfile + "#" + missing + "'>" + i18n.COMMON.add_to_profile + "</a>";
                                $class = " add";
                            }
                        }
                        $cell = $(document.createElement("td"))
                            .html($txt)
                            .addClass("info run_highlight cell_" + measurement + $class)
                            .data("measurement", measurement);
                        $row.append($cell);
                    }
                    if ($cell) {
                        $tip = new Opentip($cell, $tip_txts[measurement], {className: $tip_classes[measurement]});
                    }
                });
                $table.append($row);

            } else {
                // *** Size Guide ***
                $row = $(document.createElement("tr")).addClass("header_row");
                $i = 0;
                var $first = Object.keys(sizeme_product.item.measurements)[0],
                    $j, measurement;
                $row.append($(document.createElement("td")).html(i18n.COMMON.size).addClass("size_column"));
                for ($j = 0; $j < FIT_ORDER.length; $j++) {
                    measurement = FIT_ORDER[$j];
                    if (sizeme_product.item.measurements[$first][measurement] > 0) {
                        $txt = '<span class="num">' + (++$i) + '</span>' + i18n.MEASUREMENT[measurement];
                        if (measurement_arrows[measurement]) {
                            measurement_arrows[measurement].num = $i;
                        }
                        $row.append($(document.createElement("td")).html($txt).addClass("run_highlight cell_" + measurement).data("measurement", measurement));
                    }
                }
                $table.append($row);

                for ($i = 0; $i < sizeKeys.length; $i++) {
                    var key = sizeKeys[$i].key, $cell;

                    var $class = "data_row";
                    if (key === inputKey) {
                        $class += " active";
                    }

                    $row = $(document.createElement("tr")).addClass($class);

                    $row.append($(document.createElement("td")).html(sizeText(sizeKeys[$i].sizeLabel)).addClass("size_column"));
                    for ($j = 0; $j < FIT_ORDER.length; $j++) {
                        measurement = FIT_ORDER[$j];
                        if (sizeme_product.item.measurements[key][measurement] > 0) {
                            $txt = (sizeme_product.item.measurements[key][measurement] / 10).toFixed(1);
                            $cell = $(document.createElement("td")).text($txt + " cm").addClass("run_highlight cell_" + measurement).data("measurement", measurement);
                            $row.append(colorCell($cell, "", measurement_arrows[measurement]));
                        }
                    }
                    $table.append($row);
                }
            }

            writeItemCanvas('sizeme_item_view', matchMap, "");

        }

        function updateDetailedSliderTip(thisSize, thisFit) {
            // tip for overall slider in detailed
            var $trigger = $("#sizeme_detailed_view_content").find(".slider_container");
            var $tip_txt = i18n.FIT_INFO.overall_fit_for_size + " " + sizeText(thisSize) + "</b>";
            $tip_txt += " " + i18n.COMMON.is + " <b>" + i18n.FIT_VERDICT[getFit(thisFit, 1).label].toLowerCase() + "</b>";
            var $tip = new Opentip($trigger, $tip_txt);
        }

        function updateSlider(thisSize, thisData, isRecommended, detailedContainer, animateSlider) {
            if (typeof thisData !== "undefined") {
                var thisFit = thisData.totalFit;
                var thisLabel = thisData.fitRangeLabel;
                var matchMap = thisData.matchMap;
                moveSlider(thisFit, animateSlider);
                if (sizeme_local_options.fitAreaSlider) {
                    moveAreaSlider(thisFit, matchMap, animateSlider);
                }
                if (sizeme_local_options.writeMessages) {
                    goWriteMessages(matchMap, thisData.missingMeasurements, thisData.accuracy, thisFit);
                }
                updateDetailedSliderTip(thisSize, thisFit);
                updateDetailedTable(matchMap, thisData.inputKey, thisData.missingMeasurements);
            }
        }

        function getStandardHeader() {
            // *** SizeMe Header injection
            var headerHtml = "<div id='sizeme_header' class='in_content'>";
            headerHtml += "<div id='logo'></div>";
            headerHtml += "<div class='sizeme_header_content'>";
            headerHtml += "<div class='shopping_for'>" + i18n.COMMON.fetching_profiles + "</div>";
            headerHtml += "<div class='top_right'>";
            headerHtml += "<div id='log_info'><span id='logged_in'></span></div>";
            headerHtml += "</div>";
            headerHtml += "</div>";
            return headerHtml;
        }

        function getHeaderToggler() {
            // *** SizeMe Header toggler
            var headerHtml = "<div id='sizeme_header_toggler' class='in_content'>";
            headerHtml += "</div>";
            return headerHtml;
        }

        function getSplashDetailed() {
            // *** SizeMe Splash #2 injection (detailed)
            var headerHtml = "<div id='sizeme_detailed_splash' class='splash'>";
            headerHtml += "<p class='splash_text'>";
            headerHtml += i18n.SPLASH.detailed_text;
            headerHtml += "</p>";
            headerHtml += "<ul class='splash_choices'>";
            headerHtml += "<li class='sign_in'>";
            headerHtml += "<a href='" + SizeMe.contextAddress + "/?mode=signup' target='_blank' class='a_button' id='sizeme_btn_sign_up' title='" + i18n.SPLASH.btn_sign_up_label.replace(/'/g, "&#39;") + "'>";
            headerHtml += i18n.SPLASH.btn_sign_up_title + "</a>";
            headerHtml += "</li>";
            headerHtml += "<li class='log_in'><a href='#' class='a_button' id='sizeme_btn_login' title='" + i18n.SPLASH.btn_log_in_label.replace(/'/g, "&#39;") + "'>" + i18n.SPLASH.btn_log_in_title + "</a></li>";
            headerHtml += "<li class='no_thanks'><td><a href='#' class='a_button' id='sizeme_btn_no_thanks' title='" + i18n.SPLASH.btn_no_thanks_label.replace(/'/g, "&#39;") + "'>" + i18n.SPLASH.btn_no_thanks_title + "</a></li>";
            headerHtml += "</ul></div>";
            return headerHtml;
        }

        function getProductSplash() {
            // *** SizeMe Splash in Product page
            var splashHtml = "<div id='sizeme_product_splash'>";
            splashHtml += "<p>" + i18n.SPLASH.product_page_splashes[0] + " ";
            splashHtml += "<a href='" + SizeMe.contextAddress + "' target='_blank' id='sizeme_product_page_link' title='" + i18n.SPLASH.product_page_splash_title + "'></a>";
            splashHtml += "<a href='#' id='sizeme_btn_no_thanks_product_splash' title='" + i18n.COMMON.close_text + "'></a>";
            splashHtml += "</p></div>";
            return splashHtml;
        }

        function findMaxMeasurement() {
            var maxVal = 0;
            sizeme_product.item.measurements.each(function (key, measurement_set) {
                sizeme_product.item.measurements[key].each(function (key_2, value) {
                    maxVal = Math.max(value, maxVal);
                });
            });
            return maxVal;
        }

        var DataStorage = (function () {

            function DataStorage(type) {
                if (storageAvailable(type)) {
                    this.storage = window[type];
                } else {
                    this.storage = null;
                }
            }

            DataStorage.prototype.storage = null;

            function storageAvailable(type) {
                try {
                    var _tstorage = window[type];
                    var x = '__storage_test__';
                    _tstorage.setItem(x, x);
                    _tstorage.removeItem(x);
                    return true;
                } catch (e) {
                    return false;
                }
            }

            DataStorage.prototype.withStorage = function (callback) {
                if (this.storage === null) {
                    return;
                }

                return callback(this.storage);
            };

            return DataStorage;
        })();

        var Storage = new DataStorage('sessionStorage');
        var sizeMe;

        function sizeMeLogout() {
            sizeMe = null;
            clearAuthToken();
        }

        function clearAuthToken() {
            Storage.withStorage(function (storage) {
                storage.removeItem('authToken');
            });
        }

        function getAuthToken() {
            var deferred = $.Deferred();

            Storage.withStorage(function (storage) {
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
                        Storage.withStorage(function (storage) {
                            storage.setItem('authToken', JSON.stringify(authTokenObj));
                        });
                        deferred.resolve(authTokenObj.token);
                    }
                });
            }

            return deferred.promise();
        }

        function sizeMeInit(authorizedCb, unauthorizedCb) {
            var deferred = $.Deferred();
            getAuthToken().then(
                function (authToken) {
                    deferred.resolve(new SizeMe(authToken));
                }, function () {
                    deferred.reject(null);
                }
            );

            sizeMe = deferred.promise();
            sizeMe.then(
                function (smObj) {
                    if (authorizedCb !== null) {
                        authorizedCb(smObj);
                    }
                },
                function () {
                    if (unauthorizedCb !== null) {
                        unauthorizedCb();
                    }
                }
            );
        }

        // Load on ready for all pages
        $(function () {

            var systemsGo = true;

            i18n = SizeMeI18N.get(sizeme_UI_options.lang);

            // check options (and service status)
            if (typeof sizeme_options === 'undefined') {
                systemsGo = false;
            } else if (sizeme_options.service_status === "off") {
                systemsGo = false;
            }

            // check data
            if (typeof sizeme_product === 'undefined') {
                systemsGo = false;
            } else if (sizeme_product.item.itemType === 0) {
                systemsGo = false;
            } else if (findMaxMeasurement() === 0) {
                systemsGo = false;
            }

            // check existence of size selection element
            if ($(sizeme_UI_options.sizeSelectionContainer).find('select').length === 0) {
                systemsGo = false;
            }

            if (systemsGo) {
                loadArrows(false); // everyone needs arrows
            }

            //stuff we do anyway
            addIds(sizeme_UI_options.sizeSelectionContainer);

            // buttonize
            if (typeof sizeme_options !== 'undefined') {
                if (sizeme_options.buttonize === "yes") {
                    selectToButtons(sizeme_UI_options.sizeSelectionContainer);
                    $("#button_choose").remove();
                }
            }

            // add add to cart event
            if (sizeme_UI_options.addToCartEvent) {
                $(sizeme_UI_options.addToCartElement).on(sizeme_UI_options.addToCartEvent, function () {
                    if (isLoggedIn()) {
                        SizeMe.trackEvent("addToCartSM", "Store: Product added to cart by SizeMe user");
                    } else {
                        SizeMe.trackEvent("addToCart", "Store: Product added to cart");
                    }

                });
            }

            var getMatchResponseHandler = function (prodId, sizeme_product) {
                if (!systemsGo) {
                    return function () {
                    };
                }
                return function (responseMap) {
                    var smallestOffset = 9999,  // for recommendation
                        thisVal, thisId, thisData, thisSize;

                    responseMap.each(function (key, result) {
                        var classKey = ".element_for_" + key;
                        $(classKey)
                            .removeClass('sm-too_small sm-slim sm-regular sm-loose sm-very_loose sm-huge sm-too_big')
                            .addClass('sm-' + result.fitRangeLabel);

                        // Analyze fit for recommendations
                        var fitOffset = Math.abs(result.totalFit - OPTIMAL_FIT);
                        if (fitOffset < smallestOffset) {
                            // check if recommended option exists (is for sale)
                            if ($("#input_" + key).length > 0) {
                                smallestOffset = fitOffset;
                                recommendedId = key;
                                recommendedLabel = result.fitRangeLabel;
                            }
                        }

                        // check if there are results in the first place
                        if (result.accuracy < accuracyThreshold) {
                            $('.slider_bar, .slider_area').hide();
                        } else {
                            $('.slider_bar, .slider_area').show();
                        }

                        // write data to inputs
                        $("#input_" + key).data("fitData", {
                            totalFit: result.totalFit,
                            fitRangeLabel: result.fitRangeLabel,
                            matchMap: result.matchMap,
                            missingMeasurements: result.missingMeasurements,
                            accuracy: result.accuracy,
                            inputKey: key
                        });
                    });

                    // bind change to size selector (only original, clone handled separately)
                    $(sizeme_UI_options.sizeSelectionContainer + ':not(".cloned")').find("select").change(function () {
                        thisVal = $(this).val();
                        thisId = '#input_' + thisVal;
                        thisData = $(thisId).data("fitData");
                        thisSize = $(thisId).text();
                        if (thisVal) {
                            updateSlider(thisSize, thisData, (thisVal === recommendedId), sizeme_UI_options.detailedViewContainer, true);
                        }
                        // relay change to cloned (if exists), but do not trigger change there
                        $(sizeme_UI_options.sizeSelectionContainer + '.cloned').find("select").val(thisVal);
                        SizeMe.trackEvent("sizeChanged", "Store: Product size changed");
                    });

                    // remove existing recommendation
                    $(".sm-buttonset").find(".sm-selectable").removeClass('sm-recommended');

                    // set selection to recommendation on first match
                    if (sizeme_local_options.firstRecommendation) {
                        // select recommended
                        $(sizeme_UI_options.sizeSelectionContainer).find("select").val(recommendedId);
                        // remove existing active
                        $(".sm-buttonset").find(".sm-selectable").removeClass('sm-state-active');
                        // add class
                        $(".element_for_" + recommendedId).addClass('sm-recommended sm-state-active');
                        var recommendedInput = $("#input_" + recommendedId);
                        if (recommendedInput.data("fitData")) {
                            thisData = recommendedInput.data("fitData");
                            thisSize = recommendedInput.text();
                            updateSlider(thisSize, thisData, true, sizeme_UI_options.detailedViewContainer, true);
                        }
                        sizeme_local_options.firstRecommendation = false;
                    } else {
                        thisId = '#input_' + $(sizeme_UI_options.sizeSelectionContainer).find("select").val();
                        if ($(thisId).data("fitData")) {
                            thisData = $(thisId).data("fitData");
                            thisSize = $(thisId).text();
                            updateSlider(thisSize, thisData, true, sizeme_UI_options.detailedViewContainer, true);
                        }
                    }
                };
                // end of function 	getMatchResponseHandler
            };

            var matchErrorHandler = function () {
                // this is called when the match function returns an error.  This is most likely due to a wrong or unadded itemType and only visible when the user is logged in.
                // if the itemType is
                $(".sizeme_slider").hide();
                console.error("SizeMe: error in match function.  Please contact your local SizeMe dealer.");

                // end of function 	matchErrorHandler
            };


            var loggedInCb = function (sizeMeObj) {

                function setProfileLink() {
                    if (selectedProfile === null) {
                        linkToSelectedProfile = SizeMe.contextAddress + "/account/profiles.html";
                    } else {
                        linkToSelectedProfile = SizeMe.contextAddress + "/account/profiles/" + selectedProfile + "/profile.html";
                    }
                }

                var doProfileChange = function (newValue) {
                    selectedProfile = newValue;
                    setProfileLink();

                    if (selectedProfile === null) {
                        eraseCookie("sizeme_profileId");
                        goWriteMessages();
                    } else {
                        $(".profileSelect").val(selectedProfile);
                        createCookie("sizeme_profileId", selectedProfile, cookieLifetime);

                        if (typeof sizeme_product !== 'undefined') {
                            var prodId = null;
                            var tmpItem = $.extend({}, sizeme_product.item);
                            var itemType = tmpItem.itemType;
                            if (itemType.indexOf('.') < 0) {
                                tmpItem.itemType = itemType.split('').join('.');
                            }
                            sizeMeObj.match(new SizeMe.FitRequest(selectedProfile, tmpItem), getMatchResponseHandler(prodId, sizeme_product), matchErrorHandler);
                        }
                        SizeMe.trackEvent("activeProfileChanged", "Store: Active profile changed");
                    }
                    $('#logged_in_link').attr("href", linkToSelectedProfile);
                    // end of function  doProfileChange
                };

                eraseCookie("sizeme_no_thanks");
                eraseCookie("sizeme_no_product_splash");

                // remove existing (if exists)
                $("#sizeme_header").remove();
                $("#popup_opener").remove();
                $("#sizeme_product_splash").remove();
                $("#sizeme_detailed_view_content").dialog("destroy").remove();

                // *** SizeMe Magic
                if (sizeMeObj !== null) {
                    sizeMeObj.fetchProfilesForAccount(function (profileList) {
                        var cookieProfile = readCookie("sizeme_profileId");
                        var $i = 0;
                        var $new = "<div id='sizeme_header_container'>" + getStandardHeader() + "</div>";

                        // Prepend header to body
                        $(sizeme_UI_options.appendContentTo).append(getSliderHtml(systemsGo));
                        $(".sizeme_slider .slider_text_below").append($new);
                        $("#sizeme_header.in_content").find("#logo").on("click", function () {
                            $("#sizeme_header.in_content").toggleClass("opened");
                        });

                        if (profileList.length > 0) {
                            selectedProfile = profileList[0].id;
                            $.each(profileList, function () {
                                if (this.id === cookieProfile) {
                                    selectedProfile = this.id;
                                    return false;
                                }
                            });

                            writeDetailedWindow(false);
                            moveSlider(OPTIMAL_FIT, false);

                            $(".shopping_for").empty().html("<span class='shopping_for_text'>" + i18n.COMMON.shopping_for + ": </span>")
                                .append(function () {
                                    var select = document.createElement("select");
                                    select.className = "profileSelect";
                                    select.id = "id_profileSelect_" + (++$i);
                                    return select;
                                });
                            $.each(profileList, function () {
                                $("<option>").appendTo(".profileSelect")
                                    .attr("value", this.id)
                                    .text(this.profileName);
                            });
                            $('.profileSelect')
                                .val(selectedProfile)
                                .change(function () {
                                    doProfileChange(this.value);
                                });
                        } else {
                            selectedProfile = null;
                            setProfileLink();
                            writeDetailedWindow(false);
                            updateDetailedTable();
                            $('.slider_bar, .slider_area').hide();
                            $(".shopping_for").empty();
                            $(".sizeme_header_content .shopping_for")
                                .html("<span class='shopping_for_text no-profile'>" + i18n.MESSAGE.no_profiles + "</span>");
                            $(".sizeme_detailed_section .shopping_for")
                                .append(
                                    $("<span>").addClass("shopping_for_text no-profile")
                                        .html(i18n.MESSAGE.no_profiles + " " + i18n.COMMON.go_to +
                                            "<a id='logged_in_link' href='" + linkToSelectedProfile + "' target='_blank'>" + i18n.COMMON.my_profiles + "</a> " + i18n + COMMON.and_create_one)
                                );
                        }

                        $('#logged_in').html("<a id='logged_in_link' href='#' target='_blank'>" + i18n.COMMON.my_profiles + "</a>");

                        // Yell change
                        doProfileChange(selectedProfile);
                    });
                }

                $("#logout").click(loggedOutCb);

                // end of function 	loggedInCb
            };

            var loggedOutCb = function () {

                loadArrows(true);

                // Size Guide for non-loving users
                writeDetailedWindow(true);
                updateDetailedTable();

                // Makia live temporary exception
                // Show size guide text only if there actually is a size guide (otherwise hidden with css)
                $(".sizeme p").show();

                // bind change to select
                $(sizeme_UI_options.sizeSelectionContainer).find("select").change(function () {
                    var thisVal = $(this).val();
                    // relay change to cloned and vice versa
                    $(sizeme_UI_options.sizeSelectionContainer).find("select").val(thisVal);
                    updateDetailedTable("", thisVal);
                });

                if (sizeme_options.service_status === "on") {
                    var splashContent;
                    // Add splash content in detailed
                    splashContent = getSplashDetailed();
                    if (noThanks()) {
                        splashContent = $(splashContent).hide();
                    }
                    $("#sizeme_detailed_view_content").append(splashContent);

                    // login button
                    $("#sizeme_btn_login").click(function () {
                        SizeMe.trackEvent("clickLogin", "Store: Login clicked");
                        clearAuthToken();
                        SizeMe.loginFrame(function () {
                            sizeMeInit(loggedInCb);
                        });
                        return false;
                    });

                    $("#sizeme_btn_sign_up").click(function () {
                        SizeMe.trackEvent("clickSignUp", "Store: Sign up clicked");
                        clearAuthToken();
                        return true;
                    });

                    // no thanks button
                    $("#sizeme_btn_no_thanks").on("click", function () {
                        SizeMe.trackEvent("noThanks", "Store: SizeMe, no thanks");
                        createCookie("sizeme_no_thanks", "true", cookieLifetime);
                        $(".splash").hide();
                        $("#sizeme_btn_no_thanks_product_splash").trigger("click");		// also close possible product splasher
                        return false;
                    });

                    // Product page splash
                    if (!noProductSplash()) {
                        $(sizeme_UI_options.appendSplashTo).append(getProductSplash());
                        $("#sizeme_btn_no_thanks_product_splash").on("click", function () {
                            SizeMe.trackEvent("noProductSplash", "Store: Product splash closed");
                            createCookie("sizeme_no_product_splash", "true", cookieLifetime);
                            $("#sizeme_product_splash").slideUp();
                            return false;
                        });

                        $("#sizeme_product_page_link").on("click", function () {
                            SizeMe.trackEvent("clickProductSplash", "Store: Product splash clicked");
                        });

                    }
                }

                // end of function 	loggedOutCb
            };

            if (systemsGo) {
                if (noThanks()) {
                    SizeMe.trackEvent("productPageNoSM", "Store: Product page load, SizeMe refused");
                    loggedOutCb();
                } else {
                    sizeMeInit(function (smObj) {
                        SizeMe.trackEvent("productPageLoggedIn", "Store: Product page load, logged in");
                        loggedInCb(smObj);
                    }, function () {
                        SizeMe.trackEvent("productPageLoggedOut", "Store: Product page load, logged out");
                        loggedOutCb();
                    });
                }
            }
            // *** End
        });

        function isLoggedIn() {
            return sizeMe !== null && sizeMe.state() === "resolved";
        }

        // Cookie functions
        function createCookie(name, value, days) {
            var expires;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            }
            else {
                expires = "";
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        }

        function readCookie(name) {
            var ca = document.cookie.split(';'), c;
            for (var i = 0; i < ca.length; i++) {
                c = ca[i].trim().split('=');
                if (c[0] === name) {
                    return c[1];
                }
            }
            return null;
        }

        function eraseCookie(name) {
            createCookie(name, "", -1);
        }
    };
})(window);
;(function(window, undefined) {
window.sizemeDeps = function (jQuery) {
    (function ($, undefined) {
        var uuid = 0, runiqueId = /^ui-id-\d+$/;
        // prevent duplicate loading
        // this is only a problem because we proxy existing functions
        // and we don't want to double proxy them
        $.ui = $.ui || {};
        if ($.ui.version) {
            return;
        }
        $.extend($.ui, {
            version: '1.9.2',
            keyCode: {
                BACKSPACE: 8,
                COMMA: 188,
                DELETE: 46,
                DOWN: 40,
                END: 35,
                ENTER: 13,
                ESCAPE: 27,
                HOME: 36,
                LEFT: 37,
                NUMPAD_ADD: 107,
                NUMPAD_DECIMAL: 110,
                NUMPAD_DIVIDE: 111,
                NUMPAD_ENTER: 108,
                NUMPAD_MULTIPLY: 106,
                NUMPAD_SUBTRACT: 109,
                PAGE_DOWN: 34,
                PAGE_UP: 33,
                PERIOD: 190,
                RIGHT: 39,
                SPACE: 32,
                TAB: 9,
                UP: 38
            }
        });
        // plugins
        $.fn.extend({
            _focus: $.fn.focus,
            focus: function (delay, fn) {
                return typeof delay === 'number' ? this.each(function () {
                    var elem = this;
                    setTimeout(function () {
                        $(elem).focus();
                        if (fn) {
                            fn.call(elem);
                        }
                    }, delay);
                }) : this._focus.apply(this, arguments);
            },
            scrollParent: function () {
                var scrollParent;
                if ($.ui.ie && /(static|relative)/.test(this.css('position')) || /absolute/.test(this.css('position'))) {
                    scrollParent = this.parents().filter(function () {
                        return /(relative|absolute|fixed)/.test($.css(this, 'position')) && /(auto|scroll)/.test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
                    }).eq(0);
                } else {
                    scrollParent = this.parents().filter(function () {
                        return /(auto|scroll)/.test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
                    }).eq(0);
                }
                return /fixed/.test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
            },
            zIndex: function (zIndex) {
                if (zIndex !== undefined) {
                    return this.css('zIndex', zIndex);
                }
                if (this.length) {
                    var elem = $(this[0]), position, value;
                    while (elem.length && elem[0] !== document) {
                        // Ignore z-index if position is set to a value where z-index is ignored by the browser
                        // This makes behavior of this function consistent across browsers
                        // WebKit always returns auto if the element is positioned
                        position = elem.css('position');
                        if (position === 'absolute' || position === 'relative' || position === 'fixed') {
                            // IE returns 0 when zIndex is not specified
                            // other browsers return a string
                            // we ignore the case of nested elements with an explicit value of 0
                            // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                            value = parseInt(elem.css('zIndex'), 10);
                            if (!isNaN(value) && value !== 0) {
                                return value;
                            }
                        }
                        elem = elem.parent();
                    }
                }
                return 0;
            },
            uniqueId: function () {
                return this.each(function () {
                    if (!this.id) {
                        this.id = 'ui-id-' + ++uuid;
                    }
                });
            },
            removeUniqueId: function () {
                return this.each(function () {
                    if (runiqueId.test(this.id)) {
                        $(this).removeAttr('id');
                    }
                });
            }
        });
        // selectors
        function focusable(element, isTabIndexNotNaN) {
            var map, mapName, img, nodeName = element.nodeName.toLowerCase();
            if ('area' === nodeName) {
                map = element.parentNode;
                mapName = map.name;
                if (!element.href || !mapName || map.nodeName.toLowerCase() !== 'map') {
                    return false;
                }
                img = $('img[usemap=#' + mapName + ']')[0];
                return !!img && visible(img);
            }
            return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled : 'a' === nodeName ? element.href || isTabIndexNotNaN : isTabIndexNotNaN) && // the element and all of its ancestors must be visible
            visible(element);
        }
        function visible(element) {
            return $.expr.filters.visible(element) && !$(element).parents().andSelf().filter(function () {
                return $.css(this, 'visibility') === 'hidden';
            }).length;
        }
        $.extend($.expr[':'], {
            data: $.expr.createPseudo ? $.expr.createPseudo(function (dataName) {
                return function (elem) {
                    return !!$.data(elem, dataName);
                };
            }) : // support: jQuery <1.8
            function (elem, i, match) {
                return !!$.data(elem, match[3]);
            },
            focusable: function (element) {
                return focusable(element, !isNaN($.attr(element, 'tabindex')));
            },
            tabbable: function (element) {
                var tabIndex = $.attr(element, 'tabindex'), isTabIndexNaN = isNaN(tabIndex);
                return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
            }
        });
        // support
        $(function () {
            var body = document.body, div = body.appendChild(div = document.createElement('div'));
            // access offsetHeight before setting the style to prevent a layout bug
            // in IE 9 which causes the element to continue to take up space even
            // after it is removed from the DOM (#8026)
            div.offsetHeight;
            $.extend(div.style, {
                minHeight: '100px',
                height: 'auto',
                padding: 0,
                borderWidth: 0
            });
            $.support.minHeight = div.offsetHeight === 100;
            $.support.selectstart = 'onselectstart' in div;
            // set display to none to avoid a layout bug in IE
            // http://dev.jquery.com/ticket/4014
            body.removeChild(div).style.display = 'none';
        });
        // support: jQuery <1.8
        if (!$('<a>').outerWidth(1).jquery) {
            $.each([
                'Width',
                'Height'
            ], function (i, name) {
                var side = name === 'Width' ? [
                        'Left',
                        'Right'
                    ] : [
                        'Top',
                        'Bottom'
                    ], type = name.toLowerCase(), orig = {
                        innerWidth: $.fn.innerWidth,
                        innerHeight: $.fn.innerHeight,
                        outerWidth: $.fn.outerWidth,
                        outerHeight: $.fn.outerHeight
                    };
                function reduce(elem, size, border, margin) {
                    $.each(side, function () {
                        size -= parseFloat($.css(elem, 'padding' + this)) || 0;
                        if (border) {
                            size -= parseFloat($.css(elem, 'border' + this + 'Width')) || 0;
                        }
                        if (margin) {
                            size -= parseFloat($.css(elem, 'margin' + this)) || 0;
                        }
                    });
                    return size;
                }
                $.fn['inner' + name] = function (size) {
                    if (size === undefined) {
                        return orig['inner' + name].call(this);
                    }
                    return this.each(function () {
                        $(this).css(type, reduce(this, size) + 'px');
                    });
                };
                $.fn['outer' + name] = function (size, margin) {
                    if (typeof size !== 'number') {
                        return orig['outer' + name].call(this, size);
                    }
                    return this.each(function () {
                        $(this).css(type, reduce(this, size, true, margin) + 'px');
                    });
                };
            });
        }
        // support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
        if ($('<a>').data('a-b', 'a').removeData('a-b').data('a-b')) {
            $.fn.removeData = function (removeData) {
                return function (key) {
                    if (arguments.length) {
                        return removeData.call(this, $.camelCase(key));
                    } else {
                        return removeData.call(this);
                    }
                };
            }($.fn.removeData);
        }
        // deprecated
        (function () {
            var uaMatch = /msie ([\w.]+)/.exec(navigator.userAgent.toLowerCase()) || [];
            $.ui.ie = uaMatch.length ? true : false;
            $.ui.ie6 = parseFloat(uaMatch[1], 10) === 6;
        }());
        $.fn.extend({
            disableSelection: function () {
                return this.bind(($.support.selectstart ? 'selectstart' : 'mousedown') + '.ui-disableSelection', function (event) {
                    event.preventDefault();
                });
            },
            enableSelection: function () {
                return this.unbind('.ui-disableSelection');
            }
        });
        $.extend($.ui, {
            // $.ui.plugin is deprecated.  Use the proxy pattern instead.
            plugin: {
                add: function (module, option, set) {
                    var i, proto = $.ui[module].prototype;
                    for (i in set) {
                        proto.plugins[i] = proto.plugins[i] || [];
                        proto.plugins[i].push([
                            option,
                            set[i]
                        ]);
                    }
                },
                call: function (instance, name, args) {
                    var i, set = instance.plugins[name];
                    if (!set || !instance.element[0].parentNode || instance.element[0].parentNode.nodeType === 11) {
                        return;
                    }
                    for (i = 0; i < set.length; i++) {
                        if (instance.options[set[i][0]]) {
                            set[i][1].apply(instance.element, args);
                        }
                    }
                }
            },
            contains: $.contains,
            // only used by resizable
            hasScroll: function (el, a) {
                //If overflow is hidden, the element might have extra content, but the user wants to hide it
                if ($(el).css('overflow') === 'hidden') {
                    return false;
                }
                var scroll = a && a === 'left' ? 'scrollLeft' : 'scrollTop', has = false;
                if (el[scroll] > 0) {
                    return true;
                }
                // TODO: determine which cases actually cause this to happen
                // if the element doesn't have the scroll set, see if it's possible to
                // set the scroll
                el[scroll] = 1;
                has = el[scroll] > 0;
                el[scroll] = 0;
                return has;
            },
            // these are odd functions, fix the API or move into individual plugins
            isOverAxis: function (x, reference, size) {
                //Determines when x coordinate is over "b" element axis
                return x > reference && x < reference + size;
            },
            isOver: function (y, x, top, left, height, width) {
                //Determines when x, y coordinates is over "b" element
                return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
            }
        });
    }(jQuery));
    /*!
 * jQuery UI Widget 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */
    (function ($, undefined) {
        var uuid = 0, slice = Array.prototype.slice, _cleanData = $.cleanData;
        $.cleanData = function (elems) {
            for (var i = 0, elem; (elem = elems[i]) != null; i++) {
                try {
                    $(elem).triggerHandler('remove');    // http://bugs.jquery.com/ticket/8235
                } catch (e) {
                }
            }
            _cleanData(elems);
        };
        $.widget = function (name, base, prototype) {
            var fullName, existingConstructor, constructor, basePrototype, namespace = name.split('.')[0];
            name = name.split('.')[1];
            fullName = namespace + '-' + name;
            if (!prototype) {
                prototype = base;
                base = $.Widget;
            }
            // create selector for plugin
            $.expr[':'][fullName.toLowerCase()] = function (elem) {
                return !!$.data(elem, fullName);
            };
            $[namespace] = $[namespace] || {};
            existingConstructor = $[namespace][name];
            constructor = $[namespace][name] = function (options, element) {
                // allow instantiation without "new" keyword
                if (!this._createWidget) {
                    return new constructor(options, element);
                }
                // allow instantiation without initializing for simple inheritance
                // must use "new" keyword (the code above always passes args)
                if (arguments.length) {
                    this._createWidget(options, element);
                }
            };
            // extend with the existing constructor to carry over any static properties
            $.extend(constructor, existingConstructor, {
                version: prototype.version,
                // copy the object used to create the prototype in case we need to
                // redefine the widget later
                _proto: $.extend({}, prototype),
                // track widgets that inherit from this widget in case this widget is
                // redefined after a widget inherits from it
                _childConstructors: []
            });
            basePrototype = new base();
            // we need to make the options hash a property directly on the new instance
            // otherwise we'll modify the options hash on the prototype that we're
            // inheriting from
            basePrototype.options = $.widget.extend({}, basePrototype.options);
            $.each(prototype, function (prop, value) {
                if ($.isFunction(value)) {
                    prototype[prop] = function () {
                        var _super = function () {
                                return base.prototype[prop].apply(this, arguments);
                            }, _superApply = function (args) {
                                return base.prototype[prop].apply(this, args);
                            };
                        return function () {
                            var __super = this._super, __superApply = this._superApply, returnValue;
                            this._super = _super;
                            this._superApply = _superApply;
                            returnValue = value.apply(this, arguments);
                            this._super = __super;
                            this._superApply = __superApply;
                            return returnValue;
                        };
                    }();
                }
            });
            constructor.prototype = $.widget.extend(basePrototype, {
                // TODO: remove support for widgetEventPrefix
                // always use the name + a colon as the prefix, e.g., draggable:start
                // don't prefix for widgets that aren't DOM-based
                widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix : name
            }, prototype, {
                constructor: constructor,
                namespace: namespace,
                widgetName: name,
                // TODO remove widgetBaseClass, see #8155
                widgetBaseClass: fullName,
                widgetFullName: fullName
            });
            // If this widget is being redefined then we need to find all widgets that
            // are inheriting from it and redefine all of them so that they inherit from
            // the new version of this widget. We're essentially trying to replace one
            // level in the prototype chain.
            if (existingConstructor) {
                $.each(existingConstructor._childConstructors, function (i, child) {
                    var childPrototype = child.prototype;
                    // redefine the child widget using the same prototype that was
                    // originally used, but inherit from the new version of the base
                    $.widget(childPrototype.namespace + '.' + childPrototype.widgetName, constructor, child._proto);
                });
                // remove the list of existing child constructors from the old constructor
                // so the old child constructors can be garbage collected
                delete existingConstructor._childConstructors;
            } else {
                base._childConstructors.push(constructor);
            }
            $.widget.bridge(name, constructor);
        };
        $.widget.extend = function (target) {
            var input = slice.call(arguments, 1), inputIndex = 0, inputLength = input.length, key, value;
            for (; inputIndex < inputLength; inputIndex++) {
                for (key in input[inputIndex]) {
                    value = input[inputIndex][key];
                    if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
                        // Clone objects
                        if ($.isPlainObject(value)) {
                            target[key] = $.isPlainObject(target[key]) ? $.widget.extend({}, target[key], value) : // Don't extend strings, arrays, etc. with objects
                            $.widget.extend({}, value);    // Copy everything else by reference
                        } else {
                            target[key] = value;
                        }
                    }
                }
            }
            return target;
        };
        $.widget.bridge = function (name, object) {
            var fullName = object.prototype.widgetFullName || name;
            $.fn[name] = function (options) {
                var isMethodCall = typeof options === 'string', args = slice.call(arguments, 1), returnValue = this;
                // allow multiple hashes to be passed on init
                options = !isMethodCall && args.length ? $.widget.extend.apply(null, [options].concat(args)) : options;
                if (isMethodCall) {
                    this.each(function () {
                        var methodValue, instance = $.data(this, fullName);
                        if (!instance) {
                            return $.error('cannot call methods on ' + name + ' prior to initialization; ' + 'attempted to call method \'' + options + '\'');
                        }
                        if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                            return $.error('no such method \'' + options + '\' for ' + name + ' widget instance');
                        }
                        methodValue = instance[options].apply(instance, args);
                        if (methodValue !== instance && methodValue !== undefined) {
                            returnValue = methodValue && methodValue.jquery ? returnValue.pushStack(methodValue.get()) : methodValue;
                            return false;
                        }
                    });
                } else {
                    this.each(function () {
                        var instance = $.data(this, fullName);
                        if (instance) {
                            instance.option(options || {})._init();
                        } else {
                            $.data(this, fullName, new object(options, this));
                        }
                    });
                }
                return returnValue;
            };
        };
        $.Widget = function () {
        };
        $.Widget._childConstructors = [];
        $.Widget.prototype = {
            widgetName: 'widget',
            widgetEventPrefix: '',
            defaultElement: '<div>',
            options: {
                disabled: false,
                // callbacks
                create: null
            },
            _createWidget: function (options, element) {
                element = $(element || this.defaultElement || this)[0];
                this.element = $(element);
                this.uuid = uuid++;
                this.eventNamespace = '.' + this.widgetName + this.uuid;
                this.options = $.widget.extend({}, this.options, this._getCreateOptions(), options);
                this.bindings = $();
                this.hoverable = $();
                this.focusable = $();
                if (element !== this) {
                    // 1.9 BC for #7810
                    // TODO remove dual storage
                    $.data(element, this.widgetName, this);
                    $.data(element, this.widgetFullName, this);
                    this._on(true, this.element, {
                        remove: function (event) {
                            if (event.target === element) {
                                this.destroy();
                            }
                        }
                    });
                    this.document = $(element.style ? // element within the document
                    element.ownerDocument : // element is window or document
                    element.document || element);
                    this.window = $(this.document[0].defaultView || this.document[0].parentWindow);
                }
                this._create();
                this._trigger('create', null, this._getCreateEventData());
                this._init();
            },
            _getCreateOptions: $.noop,
            _getCreateEventData: $.noop,
            _create: $.noop,
            _init: $.noop,
            destroy: function () {
                this._destroy();
                // we can probably remove the unbind calls in 2.0
                // all event bindings should go through this._on()
                this.element.unbind(this.eventNamespace)    // 1.9 BC for #7810
                                                            // TODO remove dual storage
.removeData(this.widgetName).removeData(this.widgetFullName)    // support: jquery <1.6.3
                                                                // http://bugs.jquery.com/ticket/9413
.removeData($.camelCase(this.widgetFullName));
                this.widget().unbind(this.eventNamespace).removeAttr('aria-disabled').removeClass(this.widgetFullName + '-disabled ' + 'ui-state-disabled');
                // clean up events and states
                this.bindings.unbind(this.eventNamespace);
                this.hoverable.removeClass('ui-state-hover');
                this.focusable.removeClass('ui-state-focus');
            },
            _destroy: $.noop,
            widget: function () {
                return this.element;
            },
            option: function (key, value) {
                var options = key, parts, curOption, i;
                if (arguments.length === 0) {
                    // don't return a reference to the internal hash
                    return $.widget.extend({}, this.options);
                }
                if (typeof key === 'string') {
                    // handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
                    options = {};
                    parts = key.split('.');
                    key = parts.shift();
                    if (parts.length) {
                        curOption = options[key] = $.widget.extend({}, this.options[key]);
                        for (i = 0; i < parts.length - 1; i++) {
                            curOption[parts[i]] = curOption[parts[i]] || {};
                            curOption = curOption[parts[i]];
                        }
                        key = parts.pop();
                        if (value === undefined) {
                            return curOption[key] === undefined ? null : curOption[key];
                        }
                        curOption[key] = value;
                    } else {
                        if (value === undefined) {
                            return this.options[key] === undefined ? null : this.options[key];
                        }
                        options[key] = value;
                    }
                }
                this._setOptions(options);
                return this;
            },
            _setOptions: function (options) {
                var key;
                for (key in options) {
                    this._setOption(key, options[key]);
                }
                return this;
            },
            _setOption: function (key, value) {
                this.options[key] = value;
                if (key === 'disabled') {
                    this.widget().toggleClass(this.widgetFullName + '-disabled ui-state-disabled', !!value).attr('aria-disabled', value);
                    this.hoverable.removeClass('ui-state-hover');
                    this.focusable.removeClass('ui-state-focus');
                }
                return this;
            },
            enable: function () {
                return this._setOption('disabled', false);
            },
            disable: function () {
                return this._setOption('disabled', true);
            },
            _on: function (suppressDisabledCheck, element, handlers) {
                var delegateElement, instance = this;
                // no suppressDisabledCheck flag, shuffle arguments
                if (typeof suppressDisabledCheck !== 'boolean') {
                    handlers = element;
                    element = suppressDisabledCheck;
                    suppressDisabledCheck = false;
                }
                // no element argument, shuffle and use this.element
                if (!handlers) {
                    handlers = element;
                    element = this.element;
                    delegateElement = this.widget();
                } else {
                    // accept selectors, DOM elements
                    element = delegateElement = $(element);
                    this.bindings = this.bindings.add(element);
                }
                $.each(handlers, function (event, handler) {
                    function handlerProxy() {
                        // allow widgets to customize the disabled handling
                        // - disabled as an array instead of boolean
                        // - disabled class as method for disabling individual parts
                        if (!suppressDisabledCheck && (instance.options.disabled === true || $(this).hasClass('ui-state-disabled'))) {
                            return;
                        }
                        return (typeof handler === 'string' ? instance[handler] : handler).apply(instance, arguments);
                    }
                    // copy the guid so direct unbinding works
                    if (typeof handler !== 'string') {
                        handlerProxy.guid = handler.guid = handler.guid || handlerProxy.guid || $.guid++;
                    }
                    var match = event.match(/^(\w+)\s*(.*)$/), eventName = match[1] + instance.eventNamespace, selector = match[2];
                    if (selector) {
                        delegateElement.delegate(selector, eventName, handlerProxy);
                    } else {
                        element.bind(eventName, handlerProxy);
                    }
                });
            },
            _off: function (element, eventName) {
                eventName = (eventName || '').split(' ').join(this.eventNamespace + ' ') + this.eventNamespace;
                element.unbind(eventName).undelegate(eventName);
            },
            _delay: function (handler, delay) {
                function handlerProxy() {
                    return (typeof handler === 'string' ? instance[handler] : handler).apply(instance, arguments);
                }
                var instance = this;
                return setTimeout(handlerProxy, delay || 0);
            },
            _hoverable: function (element) {
                this.hoverable = this.hoverable.add(element);
                this._on(element, {
                    mouseenter: function (event) {
                        $(event.currentTarget).addClass('ui-state-hover');
                    },
                    mouseleave: function (event) {
                        $(event.currentTarget).removeClass('ui-state-hover');
                    }
                });
            },
            _focusable: function (element) {
                this.focusable = this.focusable.add(element);
                this._on(element, {
                    focusin: function (event) {
                        $(event.currentTarget).addClass('ui-state-focus');
                    },
                    focusout: function (event) {
                        $(event.currentTarget).removeClass('ui-state-focus');
                    }
                });
            },
            _trigger: function (type, event, data) {
                var prop, orig, callback = this.options[type];
                data = data || {};
                event = $.Event(event);
                event.type = (type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type).toLowerCase();
                // the original event may come from any element
                // so we need to reset the target on the new event
                event.target = this.element[0];
                // copy original event properties over to the new event
                orig = event.originalEvent;
                if (orig) {
                    for (prop in orig) {
                        if (!(prop in event)) {
                            event[prop] = orig[prop];
                        }
                    }
                }
                this.element.trigger(event, data);
                return !($.isFunction(callback) && callback.apply(this.element[0], [event].concat(data)) === false || event.isDefaultPrevented());
            }
        };
        $.each({
            show: 'fadeIn',
            hide: 'fadeOut'
        }, function (method, defaultEffect) {
            $.Widget.prototype['_' + method] = function (element, options, callback) {
                if (typeof options === 'string') {
                    options = { effect: options };
                }
                var hasOptions, effectName = !options ? method : options === true || typeof options === 'number' ? defaultEffect : options.effect || defaultEffect;
                options = options || {};
                if (typeof options === 'number') {
                    options = { duration: options };
                }
                hasOptions = !$.isEmptyObject(options);
                options.complete = callback;
                if (options.delay) {
                    element.delay(options.delay);
                }
                if (hasOptions && $.effects && ($.effects.effect[effectName] || $.uiBackCompat !== false && $.effects[effectName])) {
                    element[method](options);
                } else if (effectName !== method && element[effectName]) {
                    element[effectName](options.duration, options.easing, callback);
                } else {
                    element.queue(function (next) {
                        $(this)[method]();
                        if (callback) {
                            callback.call(element[0]);
                        }
                        next();
                    });
                }
            };
        });
        // DEPRECATED
        if ($.uiBackCompat !== false) {
            $.Widget.prototype._getCreateOptions = function () {
                return $.metadata && $.metadata.get(this.element[0])[this.widgetName];
            };
        }
    }(jQuery));
    /*!
 * jQuery UI Mouse 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/mouse/
 *
 * Depends:
 *	jquery.ui.widget.js
 */
    (function ($, undefined) {
        var mouseHandled = false;
        $(document).mouseup(function (e) {
            mouseHandled = false;
        });
        $.widget('ui.mouse', {
            version: '1.9.2',
            options: {
                cancel: 'input,textarea,button,select,option',
                distance: 1,
                delay: 0
            },
            _mouseInit: function () {
                var that = this;
                this.element.bind('mousedown.' + this.widgetName, function (event) {
                    return that._mouseDown(event);
                }).bind('click.' + this.widgetName, function (event) {
                    if (true === $.data(event.target, that.widgetName + '.preventClickEvent')) {
                        $.removeData(event.target, that.widgetName + '.preventClickEvent');
                        event.stopImmediatePropagation();
                        return false;
                    }
                });
                this.started = false;
            },
            // TODO: make sure destroying one instance of mouse doesn't mess with
            // other instances of mouse
            _mouseDestroy: function () {
                this.element.unbind('.' + this.widgetName);
                if (this._mouseMoveDelegate) {
                    $(document).unbind('mousemove.' + this.widgetName, this._mouseMoveDelegate).unbind('mouseup.' + this.widgetName, this._mouseUpDelegate);
                }
            },
            _mouseDown: function (event) {
                // don't let more than one widget handle mouseStart
                if (mouseHandled) {
                    return;
                }
                // we may have missed mouseup (out of window)
                this._mouseStarted && this._mouseUp(event);
                this._mouseDownEvent = event;
                var that = this, btnIsLeft = event.which === 1,
                    // event.target.nodeName works around a bug in IE 8 with
                    // disabled inputs (#7620)
                    elIsCancel = typeof this.options.cancel === 'string' && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false;
                if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
                    return true;
                }
                this.mouseDelayMet = !this.options.delay;
                if (!this.mouseDelayMet) {
                    this._mouseDelayTimer = setTimeout(function () {
                        that.mouseDelayMet = true;
                    }, this.options.delay);
                }
                if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                    this._mouseStarted = this._mouseStart(event) !== false;
                    if (!this._mouseStarted) {
                        event.preventDefault();
                        return true;
                    }
                }
                // Click event may never have fired (Gecko & Opera)
                if (true === $.data(event.target, this.widgetName + '.preventClickEvent')) {
                    $.removeData(event.target, this.widgetName + '.preventClickEvent');
                }
                // these delegates are required to keep context
                this._mouseMoveDelegate = function (event) {
                    return that._mouseMove(event);
                };
                this._mouseUpDelegate = function (event) {
                    return that._mouseUp(event);
                };
                $(document).bind('mousemove.' + this.widgetName, this._mouseMoveDelegate).bind('mouseup.' + this.widgetName, this._mouseUpDelegate);
                event.preventDefault();
                mouseHandled = true;
                return true;
            },
            _mouseMove: function (event) {
                // IE mouseup check - mouseup happened when mouse was out of window
                if ($.ui.ie && !(document.documentMode >= 9) && !event.button) {
                    return this._mouseUp(event);
                }
                if (this._mouseStarted) {
                    this._mouseDrag(event);
                    return event.preventDefault();
                }
                if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                    this._mouseStarted = this._mouseStart(this._mouseDownEvent, event) !== false;
                    this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event);
                }
                return !this._mouseStarted;
            },
            _mouseUp: function (event) {
                $(document).unbind('mousemove.' + this.widgetName, this._mouseMoveDelegate).unbind('mouseup.' + this.widgetName, this._mouseUpDelegate);
                if (this._mouseStarted) {
                    this._mouseStarted = false;
                    if (event.target === this._mouseDownEvent.target) {
                        $.data(event.target, this.widgetName + '.preventClickEvent', true);
                    }
                    this._mouseStop(event);
                }
                return false;
            },
            _mouseDistanceMet: function (event) {
                return Math.max(Math.abs(this._mouseDownEvent.pageX - event.pageX), Math.abs(this._mouseDownEvent.pageY - event.pageY)) >= this.options.distance;
            },
            _mouseDelayMet: function (event) {
                return this.mouseDelayMet;
            },
            // These are placeholder methods, to be overriden by extending plugin
            _mouseStart: function (event) {
            },
            _mouseDrag: function (event) {
            },
            _mouseStop: function (event) {
            },
            _mouseCapture: function (event) {
                return true;
            }
        });
    }(jQuery));
    /*!
 * jQuery UI Position 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */
    (function ($, undefined) {
        $.ui = $.ui || {};
        var cachedScrollbarWidth, max = Math.max, abs = Math.abs, round = Math.round, rhorizontal = /left|center|right/, rvertical = /top|center|bottom/, roffset = /[\+\-]\d+%?/, rposition = /^\w+/, rpercent = /%$/, _position = $.fn.position;
        function getOffsets(offsets, width, height) {
            return [
                parseInt(offsets[0], 10) * (rpercent.test(offsets[0]) ? width / 100 : 1),
                parseInt(offsets[1], 10) * (rpercent.test(offsets[1]) ? height / 100 : 1)
            ];
        }
        function parseCss(element, property) {
            return parseInt($.css(element, property), 10) || 0;
        }
        $.position = {
            scrollbarWidth: function () {
                if (cachedScrollbarWidth !== undefined) {
                    return cachedScrollbarWidth;
                }
                var w1, w2, div = $('<div style=\'display:block;width:50px;height:50px;overflow:hidden;\'><div style=\'height:100px;width:auto;\'></div></div>'), innerDiv = div.children()[0];
                $('body').append(div);
                w1 = innerDiv.offsetWidth;
                div.css('overflow', 'scroll');
                w2 = innerDiv.offsetWidth;
                if (w1 === w2) {
                    w2 = div[0].clientWidth;
                }
                div.remove();
                return cachedScrollbarWidth = w1 - w2;
            },
            getScrollInfo: function (within) {
                var overflowX = within.isWindow ? '' : within.element.css('overflow-x'), overflowY = within.isWindow ? '' : within.element.css('overflow-y'), hasOverflowX = overflowX === 'scroll' || overflowX === 'auto' && within.width < within.element[0].scrollWidth, hasOverflowY = overflowY === 'scroll' || overflowY === 'auto' && within.height < within.element[0].scrollHeight;
                return {
                    width: hasOverflowX ? $.position.scrollbarWidth() : 0,
                    height: hasOverflowY ? $.position.scrollbarWidth() : 0
                };
            },
            getWithinInfo: function (element) {
                var withinElement = $(element || window), isWindow = $.isWindow(withinElement[0]);
                return {
                    element: withinElement,
                    isWindow: isWindow,
                    offset: withinElement.offset() || {
                        left: 0,
                        top: 0
                    },
                    scrollLeft: withinElement.scrollLeft(),
                    scrollTop: withinElement.scrollTop(),
                    width: isWindow ? withinElement.width() : withinElement.outerWidth(),
                    height: isWindow ? withinElement.height() : withinElement.outerHeight()
                };
            }
        };
        $.fn.position = function (options) {
            if (!options || !options.of) {
                return _position.apply(this, arguments);
            }
            // make a copy, we don't want to modify arguments
            options = $.extend({}, options);
            var atOffset, targetWidth, targetHeight, targetOffset, basePosition, target = $(options.of), within = $.position.getWithinInfo(options.within), scrollInfo = $.position.getScrollInfo(within), targetElem = target[0], collision = (options.collision || 'flip').split(' '), offsets = {};
            if (targetElem.nodeType === 9) {
                targetWidth = target.width();
                targetHeight = target.height();
                targetOffset = {
                    top: 0,
                    left: 0
                };
            } else if ($.isWindow(targetElem)) {
                targetWidth = target.width();
                targetHeight = target.height();
                targetOffset = {
                    top: target.scrollTop(),
                    left: target.scrollLeft()
                };
            } else if (targetElem.preventDefault) {
                // force left top to allow flipping
                options.at = 'left top';
                targetWidth = targetHeight = 0;
                targetOffset = {
                    top: targetElem.pageY,
                    left: targetElem.pageX
                };
            } else {
                targetWidth = target.outerWidth();
                targetHeight = target.outerHeight();
                targetOffset = target.offset();
            }
            // clone to reuse original targetOffset later
            basePosition = $.extend({}, targetOffset);
            // force my and at to have valid horizontal and vertical positions
            // if a value is missing or invalid, it will be converted to center
            $.each([
                'my',
                'at'
            ], function () {
                var pos = (options[this] || '').split(' '), horizontalOffset, verticalOffset;
                if (pos.length === 1) {
                    pos = rhorizontal.test(pos[0]) ? pos.concat(['center']) : rvertical.test(pos[0]) ? ['center'].concat(pos) : [
                        'center',
                        'center'
                    ];
                }
                pos[0] = rhorizontal.test(pos[0]) ? pos[0] : 'center';
                pos[1] = rvertical.test(pos[1]) ? pos[1] : 'center';
                // calculate offsets
                horizontalOffset = roffset.exec(pos[0]);
                verticalOffset = roffset.exec(pos[1]);
                offsets[this] = [
                    horizontalOffset ? horizontalOffset[0] : 0,
                    verticalOffset ? verticalOffset[0] : 0
                ];
                // reduce to just the positions without the offsets
                options[this] = [
                    rposition.exec(pos[0])[0],
                    rposition.exec(pos[1])[0]
                ];
            });
            // normalize collision option
            if (collision.length === 1) {
                collision[1] = collision[0];
            }
            if (options.at[0] === 'right') {
                basePosition.left += targetWidth;
            } else if (options.at[0] === 'center') {
                basePosition.left += targetWidth / 2;
            }
            if (options.at[1] === 'bottom') {
                basePosition.top += targetHeight;
            } else if (options.at[1] === 'center') {
                basePosition.top += targetHeight / 2;
            }
            atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
            basePosition.left += atOffset[0];
            basePosition.top += atOffset[1];
            return this.each(function () {
                var collisionPosition, using, elem = $(this), elemWidth = elem.outerWidth(), elemHeight = elem.outerHeight(), marginLeft = parseCss(this, 'marginLeft'), marginTop = parseCss(this, 'marginTop'), collisionWidth = elemWidth + marginLeft + parseCss(this, 'marginRight') + scrollInfo.width, collisionHeight = elemHeight + marginTop + parseCss(this, 'marginBottom') + scrollInfo.height, position = $.extend({}, basePosition), myOffset = getOffsets(offsets.my, elem.outerWidth(), elem.outerHeight());
                if (options.my[0] === 'right') {
                    position.left -= elemWidth;
                } else if (options.my[0] === 'center') {
                    position.left -= elemWidth / 2;
                }
                if (options.my[1] === 'bottom') {
                    position.top -= elemHeight;
                } else if (options.my[1] === 'center') {
                    position.top -= elemHeight / 2;
                }
                position.left += myOffset[0];
                position.top += myOffset[1];
                // if the browser doesn't support fractions, then round for consistent results
                if (!$.support.offsetFractions) {
                    position.left = round(position.left);
                    position.top = round(position.top);
                }
                collisionPosition = {
                    marginLeft: marginLeft,
                    marginTop: marginTop
                };
                $.each([
                    'left',
                    'top'
                ], function (i, dir) {
                    if ($.ui.position[collision[i]]) {
                        $.ui.position[collision[i]][dir](position, {
                            targetWidth: targetWidth,
                            targetHeight: targetHeight,
                            elemWidth: elemWidth,
                            elemHeight: elemHeight,
                            collisionPosition: collisionPosition,
                            collisionWidth: collisionWidth,
                            collisionHeight: collisionHeight,
                            offset: [
                                atOffset[0] + myOffset[0],
                                atOffset[1] + myOffset[1]
                            ],
                            my: options.my,
                            at: options.at,
                            within: within,
                            elem: elem
                        });
                    }
                });
                if ($.fn.bgiframe) {
                    elem.bgiframe();
                }
                if (options.using) {
                    // adds feedback as second argument to using callback, if present
                    using = function (props) {
                        var left = targetOffset.left - position.left, right = left + targetWidth - elemWidth, top = targetOffset.top - position.top, bottom = top + targetHeight - elemHeight, feedback = {
                                target: {
                                    element: target,
                                    left: targetOffset.left,
                                    top: targetOffset.top,
                                    width: targetWidth,
                                    height: targetHeight
                                },
                                element: {
                                    element: elem,
                                    left: position.left,
                                    top: position.top,
                                    width: elemWidth,
                                    height: elemHeight
                                },
                                horizontal: right < 0 ? 'left' : left > 0 ? 'right' : 'center',
                                vertical: bottom < 0 ? 'top' : top > 0 ? 'bottom' : 'middle'
                            };
                        if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
                            feedback.horizontal = 'center';
                        }
                        if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
                            feedback.vertical = 'middle';
                        }
                        if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
                            feedback.important = 'horizontal';
                        } else {
                            feedback.important = 'vertical';
                        }
                        options.using.call(this, props, feedback);
                    };
                }
                elem.offset($.extend(position, { using: using }));
            });
        };
        $.ui.position = {
            fit: {
                left: function (position, data) {
                    var within = data.within, withinOffset = within.isWindow ? within.scrollLeft : within.offset.left, outerWidth = within.width, collisionPosLeft = position.left - data.collisionPosition.marginLeft, overLeft = withinOffset - collisionPosLeft, overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset, newOverRight;
                    // element is wider than within
                    if (data.collisionWidth > outerWidth) {
                        // element is initially over the left side of within
                        if (overLeft > 0 && overRight <= 0) {
                            newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
                            position.left += overLeft - newOverRight;    // element is initially over right side of within
                        } else if (overRight > 0 && overLeft <= 0) {
                            position.left = withinOffset;    // element is initially over both left and right sides of within
                        } else {
                            if (overLeft > overRight) {
                                position.left = withinOffset + outerWidth - data.collisionWidth;
                            } else {
                                position.left = withinOffset;
                            }
                        }    // too far left -> align with left edge
                    } else if (overLeft > 0) {
                        position.left += overLeft;    // too far right -> align with right edge
                    } else if (overRight > 0) {
                        position.left -= overRight;    // adjust based on position and margin
                    } else {
                        position.left = max(position.left - collisionPosLeft, position.left);
                    }
                },
                top: function (position, data) {
                    var within = data.within, withinOffset = within.isWindow ? within.scrollTop : within.offset.top, outerHeight = data.within.height, collisionPosTop = position.top - data.collisionPosition.marginTop, overTop = withinOffset - collisionPosTop, overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset, newOverBottom;
                    // element is taller than within
                    if (data.collisionHeight > outerHeight) {
                        // element is initially over the top of within
                        if (overTop > 0 && overBottom <= 0) {
                            newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
                            position.top += overTop - newOverBottom;    // element is initially over bottom of within
                        } else if (overBottom > 0 && overTop <= 0) {
                            position.top = withinOffset;    // element is initially over both top and bottom of within
                        } else {
                            if (overTop > overBottom) {
                                position.top = withinOffset + outerHeight - data.collisionHeight;
                            } else {
                                position.top = withinOffset;
                            }
                        }    // too far up -> align with top
                    } else if (overTop > 0) {
                        position.top += overTop;    // too far down -> align with bottom edge
                    } else if (overBottom > 0) {
                        position.top -= overBottom;    // adjust based on position and margin
                    } else {
                        position.top = max(position.top - collisionPosTop, position.top);
                    }
                }
            },
            flip: {
                left: function (position, data) {
                    var within = data.within, withinOffset = within.offset.left + within.scrollLeft, outerWidth = within.width, offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left, collisionPosLeft = position.left - data.collisionPosition.marginLeft, overLeft = collisionPosLeft - offsetLeft, overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft, myOffset = data.my[0] === 'left' ? -data.elemWidth : data.my[0] === 'right' ? data.elemWidth : 0, atOffset = data.at[0] === 'left' ? data.targetWidth : data.at[0] === 'right' ? -data.targetWidth : 0, offset = -2 * data.offset[0], newOverRight, newOverLeft;
                    if (overLeft < 0) {
                        newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
                        if (newOverRight < 0 || newOverRight < abs(overLeft)) {
                            position.left += myOffset + atOffset + offset;
                        }
                    } else if (overRight > 0) {
                        newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
                        if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
                            position.left += myOffset + atOffset + offset;
                        }
                    }
                },
                top: function (position, data) {
                    var within = data.within, withinOffset = within.offset.top + within.scrollTop, outerHeight = within.height, offsetTop = within.isWindow ? within.scrollTop : within.offset.top, collisionPosTop = position.top - data.collisionPosition.marginTop, overTop = collisionPosTop - offsetTop, overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop, top = data.my[1] === 'top', myOffset = top ? -data.elemHeight : data.my[1] === 'bottom' ? data.elemHeight : 0, atOffset = data.at[1] === 'top' ? data.targetHeight : data.at[1] === 'bottom' ? -data.targetHeight : 0, offset = -2 * data.offset[1], newOverTop, newOverBottom;
                    if (overTop < 0) {
                        newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
                        if (position.top + myOffset + atOffset + offset > overTop && (newOverBottom < 0 || newOverBottom < abs(overTop))) {
                            position.top += myOffset + atOffset + offset;
                        }
                    } else if (overBottom > 0) {
                        newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
                        if (position.top + myOffset + atOffset + offset > overBottom && (newOverTop > 0 || abs(newOverTop) < overBottom)) {
                            position.top += myOffset + atOffset + offset;
                        }
                    }
                }
            },
            flipfit: {
                left: function () {
                    $.ui.position.flip.left.apply(this, arguments);
                    $.ui.position.fit.left.apply(this, arguments);
                },
                top: function () {
                    $.ui.position.flip.top.apply(this, arguments);
                    $.ui.position.fit.top.apply(this, arguments);
                }
            }
        };
        // fraction support test
        (function () {
            var testElement, testElementParent, testElementStyle, offsetLeft, i, body = document.getElementsByTagName('body')[0], div = document.createElement('div');
            //Create a "fake body" for testing based on method used in jQuery.support
            testElement = document.createElement(body ? 'div' : 'body');
            testElementStyle = {
                visibility: 'hidden',
                width: 0,
                height: 0,
                border: 0,
                margin: 0,
                background: 'none'
            };
            if (body) {
                $.extend(testElementStyle, {
                    position: 'absolute',
                    left: '-1000px',
                    top: '-1000px'
                });
            }
            for (i in testElementStyle) {
                testElement.style[i] = testElementStyle[i];
            }
            testElement.appendChild(div);
            testElementParent = body || document.documentElement;
            testElementParent.insertBefore(testElement, testElementParent.firstChild);
            div.style.cssText = 'position: absolute; left: 10.7432222px;';
            offsetLeft = $(div).offset().left;
            $.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;
            testElement.innerHTML = '';
            testElementParent.removeChild(testElement);
        }());
        // DEPRECATED
        if ($.uiBackCompat !== false) {
            // offset option
            (function ($) {
                var _position = $.fn.position;
                $.fn.position = function (options) {
                    if (!options || !options.offset) {
                        return _position.call(this, options);
                    }
                    var offset = options.offset.split(' '), at = options.at.split(' ');
                    if (offset.length === 1) {
                        offset[1] = offset[0];
                    }
                    if (/^\d/.test(offset[0])) {
                        offset[0] = '+' + offset[0];
                    }
                    if (/^\d/.test(offset[1])) {
                        offset[1] = '+' + offset[1];
                    }
                    if (at.length === 1) {
                        if (/left|center|right/.test(at[0])) {
                            at[1] = 'center';
                        } else {
                            at[1] = at[0];
                            at[0] = 'center';
                        }
                    }
                    return _position.call(this, $.extend(options, {
                        at: at[0] + offset[0] + ' ' + at[1] + offset[1],
                        offset: undefined
                    }));
                };
            }(jQuery));
        }
    }(jQuery));
    /*!
 * jQuery UI Draggable 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/draggable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
    (function ($, undefined) {
        $.widget('ui.draggable', $.ui.mouse, {
            version: '1.9.2',
            widgetEventPrefix: 'drag',
            options: {
                addClasses: true,
                appendTo: 'parent',
                axis: false,
                connectToSortable: false,
                containment: false,
                cursor: 'auto',
                cursorAt: false,
                grid: false,
                handle: false,
                helper: 'original',
                iframeFix: false,
                opacity: false,
                refreshPositions: false,
                revert: false,
                revertDuration: 500,
                scope: 'default',
                scroll: true,
                scrollSensitivity: 20,
                scrollSpeed: 20,
                snap: false,
                snapMode: 'both',
                snapTolerance: 20,
                stack: false,
                zIndex: false
            },
            _create: function () {
                if (this.options.helper == 'original' && !/^(?:r|a|f)/.test(this.element.css('position')))
                    this.element[0].style.position = 'relative';
                this.options.addClasses && this.element.addClass('ui-draggable');
                this.options.disabled && this.element.addClass('ui-draggable-disabled');
                this._mouseInit();
            },
            _destroy: function () {
                this.element.removeClass('ui-draggable ui-draggable-dragging ui-draggable-disabled');
                this._mouseDestroy();
            },
            _mouseCapture: function (event) {
                var o = this.options;
                // among others, prevent a drag on a resizable-handle
                if (this.helper || o.disabled || $(event.target).is('.ui-resizable-handle'))
                    return false;
                //Quit if we're not on a valid handle
                this.handle = this._getHandle(event);
                if (!this.handle)
                    return false;
                $(o.iframeFix === true ? 'iframe' : o.iframeFix).each(function () {
                    $('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({
                        width: this.offsetWidth + 'px',
                        height: this.offsetHeight + 'px',
                        position: 'absolute',
                        opacity: '0.001',
                        zIndex: 1000
                    }).css($(this).offset()).appendTo('body');
                });
                return true;
            },
            _mouseStart: function (event) {
                var o = this.options;
                //Create and append the visible helper
                this.helper = this._createHelper(event);
                this.helper.addClass('ui-draggable-dragging');
                //Cache the helper size
                this._cacheHelperProportions();
                //If ddmanager is used for droppables, set the global draggable
                if ($.ui.ddmanager)
                    $.ui.ddmanager.current = this;
                /*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */
                //Cache the margins of the original element
                this._cacheMargins();
                //Store the helper's css position
                this.cssPosition = this.helper.css('position');
                this.scrollParent = this.helper.scrollParent();
                //The element's absolute position on the page minus margins
                this.offset = this.positionAbs = this.element.offset();
                this.offset = {
                    top: this.offset.top - this.margins.top,
                    left: this.offset.left - this.margins.left
                };
                $.extend(this.offset, {
                    click: {
                        //Where the click happened, relative to the element
                        left: event.pageX - this.offset.left,
                        top: event.pageY - this.offset.top
                    },
                    parent: this._getParentOffset(),
                    relative: this._getRelativeOffset()    //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
                });
                //Generate the original position
                this.originalPosition = this.position = this._generatePosition(event);
                this.originalPageX = event.pageX;
                this.originalPageY = event.pageY;
                //Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
                o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt);
                //Set a containment if given in the options
                if (o.containment)
                    this._setContainment();
                //Trigger event + callbacks
                if (this._trigger('start', event) === false) {
                    this._clear();
                    return false;
                }
                //Recache the helper size
                this._cacheHelperProportions();
                //Prepare the droppable offsets
                if ($.ui.ddmanager && !o.dropBehaviour)
                    $.ui.ddmanager.prepareOffsets(this, event);
                this._mouseDrag(event, true);
                //Execute the drag once - this causes the helper not to be visible before getting its correct position
                //If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
                if ($.ui.ddmanager)
                    $.ui.ddmanager.dragStart(this, event);
                return true;
            },
            _mouseDrag: function (event, noPropagation) {
                //Compute the helpers position
                this.position = this._generatePosition(event);
                this.positionAbs = this._convertPositionTo('absolute');
                //Call plugins and callbacks and use the resulting position if something is returned
                if (!noPropagation) {
                    var ui = this._uiHash();
                    if (this._trigger('drag', event, ui) === false) {
                        this._mouseUp({});
                        return false;
                    }
                    this.position = ui.position;
                }
                if (!this.options.axis || this.options.axis != 'y')
                    this.helper[0].style.left = this.position.left + 'px';
                if (!this.options.axis || this.options.axis != 'x')
                    this.helper[0].style.top = this.position.top + 'px';
                if ($.ui.ddmanager)
                    $.ui.ddmanager.drag(this, event);
                return false;
            },
            _mouseStop: function (event) {
                //If we are using droppables, inform the manager about the drop
                var dropped = false;
                if ($.ui.ddmanager && !this.options.dropBehaviour)
                    dropped = $.ui.ddmanager.drop(this, event);
                //if a drop comes from outside (a sortable)
                if (this.dropped) {
                    dropped = this.dropped;
                    this.dropped = false;
                }
                //if the original element is no longer in the DOM don't bother to continue (see #8269)
                var element = this.element[0], elementInDom = false;
                while (element && (element = element.parentNode)) {
                    if (element == document) {
                        elementInDom = true;
                    }
                }
                if (!elementInDom && this.options.helper === 'original')
                    return false;
                if (this.options.revert == 'invalid' && !dropped || this.options.revert == 'valid' && dropped || this.options.revert === true || $.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped)) {
                    var that = this;
                    $(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function () {
                        if (that._trigger('stop', event) !== false) {
                            that._clear();
                        }
                    });
                } else {
                    if (this._trigger('stop', event) !== false) {
                        this._clear();
                    }
                }
                return false;
            },
            _mouseUp: function (event) {
                //Remove frame helpers
                $('div.ui-draggable-iframeFix').each(function () {
                    this.parentNode.removeChild(this);
                });
                //If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
                if ($.ui.ddmanager)
                    $.ui.ddmanager.dragStop(this, event);
                return $.ui.mouse.prototype._mouseUp.call(this, event);
            },
            cancel: function () {
                if (this.helper.is('.ui-draggable-dragging')) {
                    this._mouseUp({});
                } else {
                    this._clear();
                }
                return this;
            },
            _getHandle: function (event) {
                var handle = !this.options.handle || !$(this.options.handle, this.element).length ? true : false;
                $(this.options.handle, this.element).find('*').andSelf().each(function () {
                    if (this == event.target)
                        handle = true;
                });
                return handle;
            },
            _createHelper: function (event) {
                var o = this.options;
                var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : o.helper == 'clone' ? this.element.clone().removeAttr('id') : this.element;
                if (!helper.parents('body').length)
                    helper.appendTo(o.appendTo == 'parent' ? this.element[0].parentNode : o.appendTo);
                if (helper[0] != this.element[0] && !/(fixed|absolute)/.test(helper.css('position')))
                    helper.css('position', 'absolute');
                return helper;
            },
            _adjustOffsetFromHelper: function (obj) {
                if (typeof obj == 'string') {
                    obj = obj.split(' ');
                }
                if ($.isArray(obj)) {
                    obj = {
                        left: +obj[0],
                        top: +obj[1] || 0
                    };
                }
                if ('left' in obj) {
                    this.offset.click.left = obj.left + this.margins.left;
                }
                if ('right' in obj) {
                    this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
                }
                if ('top' in obj) {
                    this.offset.click.top = obj.top + this.margins.top;
                }
                if ('bottom' in obj) {
                    this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
                }
            },
            _getParentOffset: function () {
                //Get the offsetParent and cache its position
                this.offsetParent = this.helper.offsetParent();
                var po = this.offsetParent.offset();
                // This is a special case where we need to modify a offset calculated on start, since the following happened:
                // 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
                // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
                //    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
                if (this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
                    po.left += this.scrollParent.scrollLeft();
                    po.top += this.scrollParent.scrollTop();
                }
                if (this.offsetParent[0] == document.body || this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.ui.ie)
                    //Ugly IE fix
                    po = {
                        top: 0,
                        left: 0
                    };
                return {
                    top: po.top + (parseInt(this.offsetParent.css('borderTopWidth'), 10) || 0),
                    left: po.left + (parseInt(this.offsetParent.css('borderLeftWidth'), 10) || 0)
                };
            },
            _getRelativeOffset: function () {
                if (this.cssPosition == 'relative') {
                    var p = this.element.position();
                    return {
                        top: p.top - (parseInt(this.helper.css('top'), 10) || 0) + this.scrollParent.scrollTop(),
                        left: p.left - (parseInt(this.helper.css('left'), 10) || 0) + this.scrollParent.scrollLeft()
                    };
                } else {
                    return {
                        top: 0,
                        left: 0
                    };
                }
            },
            _cacheMargins: function () {
                this.margins = {
                    left: parseInt(this.element.css('marginLeft'), 10) || 0,
                    top: parseInt(this.element.css('marginTop'), 10) || 0,
                    right: parseInt(this.element.css('marginRight'), 10) || 0,
                    bottom: parseInt(this.element.css('marginBottom'), 10) || 0
                };
            },
            _cacheHelperProportions: function () {
                this.helperProportions = {
                    width: this.helper.outerWidth(),
                    height: this.helper.outerHeight()
                };
            },
            _setContainment: function () {
                var o = this.options;
                if (o.containment == 'parent')
                    o.containment = this.helper[0].parentNode;
                if (o.containment == 'document' || o.containment == 'window')
                    this.containment = [
                        o.containment == 'document' ? 0 : $(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
                        o.containment == 'document' ? 0 : $(window).scrollTop() - this.offset.relative.top - this.offset.parent.top,
                        (o.containment == 'document' ? 0 : $(window).scrollLeft()) + $(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
                        (o.containment == 'document' ? 0 : $(window).scrollTop()) + ($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
                    ];
                if (!/^(document|window|parent)$/.test(o.containment) && o.containment.constructor != Array) {
                    var c = $(o.containment);
                    var ce = c[0];
                    if (!ce)
                        return;
                    var co = c.offset();
                    var over = $(ce).css('overflow') != 'hidden';
                    this.containment = [
                        (parseInt($(ce).css('borderLeftWidth'), 10) || 0) + (parseInt($(ce).css('paddingLeft'), 10) || 0),
                        (parseInt($(ce).css('borderTopWidth'), 10) || 0) + (parseInt($(ce).css('paddingTop'), 10) || 0),
                        (over ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css('borderLeftWidth'), 10) || 0) - (parseInt($(ce).css('paddingRight'), 10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right,
                        (over ? Math.max(ce.scrollHeight, ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css('borderTopWidth'), 10) || 0) - (parseInt($(ce).css('paddingBottom'), 10) || 0) - this.helperProportions.height - this.margins.top - this.margins.bottom
                    ];
                    this.relative_container = c;
                } else if (o.containment.constructor == Array) {
                    this.containment = o.containment;
                }
            },
            _convertPositionTo: function (d, pos) {
                if (!pos)
                    pos = this.position;
                var mod = d == 'absolute' ? 1 : -1;
                var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = /(html|body)/i.test(scroll[0].tagName);
                return {
                    top: pos.top + this.offset.relative.top * mod    // Only for relative positioned nodes: Relative offset from element to offset parent
+ this.offset.parent.top * mod    // The offsetParent's offset without borders (offset + border)
- (this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : scrollIsRootNode ? 0 : scroll.scrollTop()) * mod,
                    left: pos.left + this.offset.relative.left * mod    // Only for relative positioned nodes: Relative offset from element to offset parent
+ this.offset.parent.left * mod    // The offsetParent's offset without borders (offset + border)
- (this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft()) * mod
                };
            },
            _generatePosition: function (event) {
                var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = /(html|body)/i.test(scroll[0].tagName);
                var pageX = event.pageX;
                var pageY = event.pageY;
                /*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */
                if (this.originalPosition) {
                    //If we are not dragging yet, we won't check for options
                    var containment;
                    if (this.containment) {
                        if (this.relative_container) {
                            var co = this.relative_container.offset();
                            containment = [
                                this.containment[0] + co.left,
                                this.containment[1] + co.top,
                                this.containment[2] + co.left,
                                this.containment[3] + co.top
                            ];
                        } else {
                            containment = this.containment;
                        }
                        if (event.pageX - this.offset.click.left < containment[0])
                            pageX = containment[0] + this.offset.click.left;
                        if (event.pageY - this.offset.click.top < containment[1])
                            pageY = containment[1] + this.offset.click.top;
                        if (event.pageX - this.offset.click.left > containment[2])
                            pageX = containment[2] + this.offset.click.left;
                        if (event.pageY - this.offset.click.top > containment[3])
                            pageY = containment[3] + this.offset.click.top;
                    }
                    if (o.grid) {
                        //Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
                        var top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
                        pageY = containment ? !(top - this.offset.click.top < containment[1] || top - this.offset.click.top > containment[3]) ? top : !(top - this.offset.click.top < containment[1]) ? top - o.grid[1] : top + o.grid[1] : top;
                        var left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
                        pageX = containment ? !(left - this.offset.click.left < containment[0] || left - this.offset.click.left > containment[2]) ? left : !(left - this.offset.click.left < containment[0]) ? left - o.grid[0] : left + o.grid[0] : left;
                    }
                }
                return {
                    top: pageY    // The absolute mouse position
- this.offset.click.top - this.offset.relative.top - this.offset.parent.top + (this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : scrollIsRootNode ? 0 : scroll.scrollTop()),
                    left: pageX    // The absolute mouse position
- this.offset.click.left - this.offset.relative.left - this.offset.parent.left + (this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft())
                };
            },
            _clear: function () {
                this.helper.removeClass('ui-draggable-dragging');
                if (this.helper[0] != this.element[0] && !this.cancelHelperRemoval)
                    this.helper.remove();
                //if($.ui.ddmanager) $.ui.ddmanager.current = null;
                this.helper = null;
                this.cancelHelperRemoval = false;
            },
            // From now on bulk stuff - mainly helpers
            _trigger: function (type, event, ui) {
                ui = ui || this._uiHash();
                $.ui.plugin.call(this, type, [
                    event,
                    ui
                ]);
                if (type == 'drag')
                    this.positionAbs = this._convertPositionTo('absolute');
                //The absolute position has to be recalculated after plugins
                return $.Widget.prototype._trigger.call(this, type, event, ui);
            },
            plugins: {},
            _uiHash: function (event) {
                return {
                    helper: this.helper,
                    position: this.position,
                    originalPosition: this.originalPosition,
                    offset: this.positionAbs
                };
            }
        });
        $.ui.plugin.add('draggable', 'connectToSortable', {
            start: function (event, ui) {
                var inst = $(this).data('draggable'), o = inst.options, uiSortable = $.extend({}, ui, { item: inst.element });
                inst.sortables = [];
                $(o.connectToSortable).each(function () {
                    var sortable = $.data(this, 'sortable');
                    if (sortable && !sortable.options.disabled) {
                        inst.sortables.push({
                            instance: sortable,
                            shouldRevert: sortable.options.revert
                        });
                        sortable.refreshPositions();
                        // Call the sortable's refreshPositions at drag start to refresh the containerCache since the sortable container cache is used in drag and needs to be up to date (this will ensure it's initialised as well as being kept in step with any changes that might have happened on the page).
                        sortable._trigger('activate', event, uiSortable);
                    }
                });
            },
            stop: function (event, ui) {
                //If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
                var inst = $(this).data('draggable'), uiSortable = $.extend({}, ui, { item: inst.element });
                $.each(inst.sortables, function () {
                    if (this.instance.isOver) {
                        this.instance.isOver = 0;
                        inst.cancelHelperRemoval = true;
                        //Don't remove the helper in the draggable instance
                        this.instance.cancelHelperRemoval = false;
                        //Remove it in the sortable instance (so sortable plugins like revert still work)
                        //The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: 'valid/invalid'
                        if (this.shouldRevert)
                            this.instance.options.revert = true;
                        //Trigger the stop of the sortable
                        this.instance._mouseStop(event);
                        this.instance.options.helper = this.instance.options._helper;
                        //If the helper has been the original item, restore properties in the sortable
                        if (inst.options.helper == 'original')
                            this.instance.currentItem.css({
                                top: 'auto',
                                left: 'auto'
                            });
                    } else {
                        this.instance.cancelHelperRemoval = false;
                        //Remove the helper in the sortable instance
                        this.instance._trigger('deactivate', event, uiSortable);
                    }
                });
            },
            drag: function (event, ui) {
                var inst = $(this).data('draggable'), that = this;
                var checkPos = function (o) {
                    var dyClick = this.offset.click.top, dxClick = this.offset.click.left;
                    var helperTop = this.positionAbs.top, helperLeft = this.positionAbs.left;
                    var itemHeight = o.height, itemWidth = o.width;
                    var itemTop = o.top, itemLeft = o.left;
                    return $.ui.isOver(helperTop + dyClick, helperLeft + dxClick, itemTop, itemLeft, itemHeight, itemWidth);
                };
                $.each(inst.sortables, function (i) {
                    var innermostIntersecting = false;
                    var thisSortable = this;
                    //Copy over some variables to allow calling the sortable's native _intersectsWith
                    this.instance.positionAbs = inst.positionAbs;
                    this.instance.helperProportions = inst.helperProportions;
                    this.instance.offset.click = inst.offset.click;
                    if (this.instance._intersectsWith(this.instance.containerCache)) {
                        innermostIntersecting = true;
                        $.each(inst.sortables, function () {
                            this.instance.positionAbs = inst.positionAbs;
                            this.instance.helperProportions = inst.helperProportions;
                            this.instance.offset.click = inst.offset.click;
                            if (this != thisSortable && this.instance._intersectsWith(this.instance.containerCache) && $.ui.contains(thisSortable.instance.element[0], this.instance.element[0]))
                                innermostIntersecting = false;
                            return innermostIntersecting;
                        });
                    }
                    if (innermostIntersecting) {
                        //If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
                        if (!this.instance.isOver) {
                            this.instance.isOver = 1;
                            //Now we fake the start of dragging for the sortable instance,
                            //by cloning the list group item, appending it to the sortable and using it as inst.currentItem
                            //We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
                            this.instance.currentItem = $(that).clone().removeAttr('id').appendTo(this.instance.element).data('sortable-item', true);
                            this.instance.options._helper = this.instance.options.helper;
                            //Store helper option to later restore it
                            this.instance.options.helper = function () {
                                return ui.helper[0];
                            };
                            event.target = this.instance.currentItem[0];
                            this.instance._mouseCapture(event, true);
                            this.instance._mouseStart(event, true, true);
                            //Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
                            this.instance.offset.click.top = inst.offset.click.top;
                            this.instance.offset.click.left = inst.offset.click.left;
                            this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
                            this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;
                            inst._trigger('toSortable', event);
                            inst.dropped = this.instance.element;
                            //draggable revert needs that
                            //hack so receive/update callbacks work (mostly)
                            inst.currentItem = inst.element;
                            this.instance.fromOutside = inst;
                        }
                        //Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
                        if (this.instance.currentItem)
                            this.instance._mouseDrag(event);
                    } else {
                        //If it doesn't intersect with the sortable, and it intersected before,
                        //we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
                        if (this.instance.isOver) {
                            this.instance.isOver = 0;
                            this.instance.cancelHelperRemoval = true;
                            //Prevent reverting on this forced stop
                            this.instance.options.revert = false;
                            // The out event needs to be triggered independently
                            this.instance._trigger('out', event, this.instance._uiHash(this.instance));
                            this.instance._mouseStop(event, true);
                            this.instance.options.helper = this.instance.options._helper;
                            //Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
                            this.instance.currentItem.remove();
                            if (this.instance.placeholder)
                                this.instance.placeholder.remove();
                            inst._trigger('fromSortable', event);
                            inst.dropped = false;    //draggable revert needs that
                        }
                    }
                    ;
                });
            }
        });
        $.ui.plugin.add('draggable', 'cursor', {
            start: function (event, ui) {
                var t = $('body'), o = $(this).data('draggable').options;
                if (t.css('cursor'))
                    o._cursor = t.css('cursor');
                t.css('cursor', o.cursor);
            },
            stop: function (event, ui) {
                var o = $(this).data('draggable').options;
                if (o._cursor)
                    $('body').css('cursor', o._cursor);
            }
        });
        $.ui.plugin.add('draggable', 'opacity', {
            start: function (event, ui) {
                var t = $(ui.helper), o = $(this).data('draggable').options;
                if (t.css('opacity'))
                    o._opacity = t.css('opacity');
                t.css('opacity', o.opacity);
            },
            stop: function (event, ui) {
                var o = $(this).data('draggable').options;
                if (o._opacity)
                    $(ui.helper).css('opacity', o._opacity);
            }
        });
        $.ui.plugin.add('draggable', 'scroll', {
            start: function (event, ui) {
                var i = $(this).data('draggable');
                if (i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML')
                    i.overflowOffset = i.scrollParent.offset();
            },
            drag: function (event, ui) {
                var i = $(this).data('draggable'), o = i.options, scrolled = false;
                if (i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') {
                    if (!o.axis || o.axis != 'x') {
                        if (i.overflowOffset.top + i.scrollParent[0].offsetHeight - event.pageY < o.scrollSensitivity)
                            i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
                        else if (event.pageY - i.overflowOffset.top < o.scrollSensitivity)
                            i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
                    }
                    if (!o.axis || o.axis != 'y') {
                        if (i.overflowOffset.left + i.scrollParent[0].offsetWidth - event.pageX < o.scrollSensitivity)
                            i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
                        else if (event.pageX - i.overflowOffset.left < o.scrollSensitivity)
                            i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
                    }
                } else {
                    if (!o.axis || o.axis != 'x') {
                        if (event.pageY - $(document).scrollTop() < o.scrollSensitivity)
                            scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
                        else if ($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
                            scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
                    }
                    if (!o.axis || o.axis != 'y') {
                        if (event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
                            scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
                        else if ($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
                            scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
                    }
                }
                if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
                    $.ui.ddmanager.prepareOffsets(i, event);
            }
        });
        $.ui.plugin.add('draggable', 'snap', {
            start: function (event, ui) {
                var i = $(this).data('draggable'), o = i.options;
                i.snapElements = [];
                $(o.snap.constructor != String ? o.snap.items || ':data(draggable)' : o.snap).each(function () {
                    var $t = $(this);
                    var $o = $t.offset();
                    if (this != i.element[0])
                        i.snapElements.push({
                            item: this,
                            width: $t.outerWidth(),
                            height: $t.outerHeight(),
                            top: $o.top,
                            left: $o.left
                        });
                });
            },
            drag: function (event, ui) {
                var inst = $(this).data('draggable'), o = inst.options;
                var d = o.snapTolerance;
                var x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width, y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;
                for (var i = inst.snapElements.length - 1; i >= 0; i--) {
                    var l = inst.snapElements[i].left, r = l + inst.snapElements[i].width, t = inst.snapElements[i].top, b = t + inst.snapElements[i].height;
                    //Yes, I know, this is insane ;)
                    if (!(l - d < x1 && x1 < r + d && t - d < y1 && y1 < b + d || l - d < x1 && x1 < r + d && t - d < y2 && y2 < b + d || l - d < x2 && x2 < r + d && t - d < y1 && y1 < b + d || l - d < x2 && x2 < r + d && t - d < y2 && y2 < b + d)) {
                        if (inst.snapElements[i].snapping)
                            inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item }));
                        inst.snapElements[i].snapping = false;
                        continue;
                    }
                    if (o.snapMode != 'inner') {
                        var ts = Math.abs(t - y2) <= d;
                        var bs = Math.abs(b - y1) <= d;
                        var ls = Math.abs(l - x2) <= d;
                        var rs = Math.abs(r - x1) <= d;
                        if (ts)
                            ui.position.top = inst._convertPositionTo('relative', {
                                top: t - inst.helperProportions.height,
                                left: 0
                            }).top - inst.margins.top;
                        if (bs)
                            ui.position.top = inst._convertPositionTo('relative', {
                                top: b,
                                left: 0
                            }).top - inst.margins.top;
                        if (ls)
                            ui.position.left = inst._convertPositionTo('relative', {
                                top: 0,
                                left: l - inst.helperProportions.width
                            }).left - inst.margins.left;
                        if (rs)
                            ui.position.left = inst._convertPositionTo('relative', {
                                top: 0,
                                left: r
                            }).left - inst.margins.left;
                    }
                    var first = ts || bs || ls || rs;
                    if (o.snapMode != 'outer') {
                        var ts = Math.abs(t - y1) <= d;
                        var bs = Math.abs(b - y2) <= d;
                        var ls = Math.abs(l - x1) <= d;
                        var rs = Math.abs(r - x2) <= d;
                        if (ts)
                            ui.position.top = inst._convertPositionTo('relative', {
                                top: t,
                                left: 0
                            }).top - inst.margins.top;
                        if (bs)
                            ui.position.top = inst._convertPositionTo('relative', {
                                top: b - inst.helperProportions.height,
                                left: 0
                            }).top - inst.margins.top;
                        if (ls)
                            ui.position.left = inst._convertPositionTo('relative', {
                                top: 0,
                                left: l
                            }).left - inst.margins.left;
                        if (rs)
                            ui.position.left = inst._convertPositionTo('relative', {
                                top: 0,
                                left: r - inst.helperProportions.width
                            }).left - inst.margins.left;
                    }
                    if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first))
                        inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item }));
                    inst.snapElements[i].snapping = ts || bs || ls || rs || first;
                }
                ;
            }
        });
        $.ui.plugin.add('draggable', 'stack', {
            start: function (event, ui) {
                var o = $(this).data('draggable').options;
                var group = $.makeArray($(o.stack)).sort(function (a, b) {
                    return (parseInt($(a).css('zIndex'), 10) || 0) - (parseInt($(b).css('zIndex'), 10) || 0);
                });
                if (!group.length) {
                    return;
                }
                var min = parseInt(group[0].style.zIndex) || 0;
                $(group).each(function (i) {
                    this.style.zIndex = min + i;
                });
                this[0].style.zIndex = min + group.length;
            }
        });
        $.ui.plugin.add('draggable', 'zIndex', {
            start: function (event, ui) {
                var t = $(ui.helper), o = $(this).data('draggable').options;
                if (t.css('zIndex'))
                    o._zIndex = t.css('zIndex');
                t.css('zIndex', o.zIndex);
            },
            stop: function (event, ui) {
                var o = $(this).data('draggable').options;
                if (o._zIndex)
                    $(ui.helper).css('zIndex', o._zIndex);
            }
        });
    }(jQuery));
    /*!
 * jQuery UI Resizable 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/resizable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
    (function ($, undefined) {
        $.widget('ui.resizable', $.ui.mouse, {
            version: '1.9.2',
            widgetEventPrefix: 'resize',
            options: {
                alsoResize: false,
                animate: false,
                animateDuration: 'slow',
                animateEasing: 'swing',
                aspectRatio: false,
                autoHide: false,
                containment: false,
                ghost: false,
                grid: false,
                handles: 'e,s,se',
                helper: false,
                maxHeight: null,
                maxWidth: null,
                minHeight: 10,
                minWidth: 10,
                zIndex: 1000
            },
            _create: function () {
                var that = this, o = this.options;
                this.element.addClass('ui-resizable');
                $.extend(this, {
                    _aspectRatio: !!o.aspectRatio,
                    aspectRatio: o.aspectRatio,
                    originalElement: this.element,
                    _proportionallyResizeElements: [],
                    _helper: o.helper || o.ghost || o.animate ? o.helper || 'ui-resizable-helper' : null
                });
                //Wrap the element if it cannot hold child nodes
                if (this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)) {
                    //Create a wrapper element and set the wrapper to the new current internal element
                    this.element.wrap($('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({
                        position: this.element.css('position'),
                        width: this.element.outerWidth(),
                        height: this.element.outerHeight(),
                        top: this.element.css('top'),
                        left: this.element.css('left')
                    }));
                    //Overwrite the original this.element
                    this.element = this.element.parent().data('resizable', this.element.data('resizable'));
                    this.elementIsWrapper = true;
                    //Move margins to the wrapper
                    this.element.css({
                        marginLeft: this.originalElement.css('marginLeft'),
                        marginTop: this.originalElement.css('marginTop'),
                        marginRight: this.originalElement.css('marginRight'),
                        marginBottom: this.originalElement.css('marginBottom')
                    });
                    this.originalElement.css({
                        marginLeft: 0,
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: 0
                    });
                    //Prevent Safari textarea resize
                    this.originalResizeStyle = this.originalElement.css('resize');
                    this.originalElement.css('resize', 'none');
                    //Push the actual element to our proportionallyResize internal array
                    this._proportionallyResizeElements.push(this.originalElement.css({
                        position: 'static',
                        zoom: 1,
                        display: 'block'
                    }));
                    // avoid IE jump (hard set the margin)
                    this.originalElement.css({ margin: this.originalElement.css('margin') });
                    // fix handlers offset
                    this._proportionallyResize();
                }
                this.handles = o.handles || (!$('.ui-resizable-handle', this.element).length ? 'e,s,se' : {
                    n: '.ui-resizable-n',
                    e: '.ui-resizable-e',
                    s: '.ui-resizable-s',
                    w: '.ui-resizable-w',
                    se: '.ui-resizable-se',
                    sw: '.ui-resizable-sw',
                    ne: '.ui-resizable-ne',
                    nw: '.ui-resizable-nw'
                });
                if (this.handles.constructor == String) {
                    if (this.handles == 'all')
                        this.handles = 'n,e,s,w,se,sw,ne,nw';
                    var n = this.handles.split(',');
                    this.handles = {};
                    for (var i = 0; i < n.length; i++) {
                        var handle = $.trim(n[i]), hname = 'ui-resizable-' + handle;
                        var axis = $('<div class="ui-resizable-handle ' + hname + '"></div>');
                        // Apply zIndex to all handles - see #7960
                        axis.css({ zIndex: o.zIndex });
                        //TODO : What's going on here?
                        if ('se' == handle) {
                            axis.addClass('ui-icon ui-icon-gripsmall-diagonal-se');
                        }
                        ;
                        //Insert into internal handles object and append to element
                        this.handles[handle] = '.ui-resizable-' + handle;
                        this.element.append(axis);
                    }
                }
                this._renderAxis = function (target) {
                    target = target || this.element;
                    for (var i in this.handles) {
                        if (this.handles[i].constructor == String)
                            this.handles[i] = $(this.handles[i], this.element).show();
                        //Apply pad to wrapper element, needed to fix axis position (textarea, inputs, scrolls)
                        if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i)) {
                            var axis = $(this.handles[i], this.element), padWrapper = 0;
                            //Checking the correct pad and border
                            padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();
                            //The padding type i have to apply...
                            var padPos = [
                                'padding',
                                /ne|nw|n/.test(i) ? 'Top' : /se|sw|s/.test(i) ? 'Bottom' : /^e$/.test(i) ? 'Right' : 'Left'
                            ].join('');
                            target.css(padPos, padWrapper);
                            this._proportionallyResize();
                        }
                        //TODO: What's that good for? There's not anything to be executed left
                        if (!$(this.handles[i]).length)
                            continue;
                    }
                };
                //TODO: make renderAxis a prototype function
                this._renderAxis(this.element);
                this._handles = $('.ui-resizable-handle', this.element).disableSelection();
                //Matching axis name
                this._handles.mouseover(function () {
                    if (!that.resizing) {
                        if (this.className)
                            var axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
                        //Axis, default = se
                        that.axis = axis && axis[1] ? axis[1] : 'se';
                    }
                });
                //If we want to auto hide the elements
                if (o.autoHide) {
                    this._handles.hide();
                    $(this.element).addClass('ui-resizable-autohide').mouseenter(function () {
                        if (o.disabled)
                            return;
                        $(this).removeClass('ui-resizable-autohide');
                        that._handles.show();
                    }).mouseleave(function () {
                        if (o.disabled)
                            return;
                        if (!that.resizing) {
                            $(this).addClass('ui-resizable-autohide');
                            that._handles.hide();
                        }
                    });
                }
                //Initialize the mouse interaction
                this._mouseInit();
            },
            _destroy: function () {
                this._mouseDestroy();
                var _destroy = function (exp) {
                    $(exp).removeClass('ui-resizable ui-resizable-disabled ui-resizable-resizing').removeData('resizable').removeData('ui-resizable').unbind('.resizable').find('.ui-resizable-handle').remove();
                };
                //TODO: Unwrap at same DOM position
                if (this.elementIsWrapper) {
                    _destroy(this.element);
                    var wrapper = this.element;
                    this.originalElement.css({
                        position: wrapper.css('position'),
                        width: wrapper.outerWidth(),
                        height: wrapper.outerHeight(),
                        top: wrapper.css('top'),
                        left: wrapper.css('left')
                    }).insertAfter(wrapper);
                    wrapper.remove();
                }
                this.originalElement.css('resize', this.originalResizeStyle);
                _destroy(this.originalElement);
                return this;
            },
            _mouseCapture: function (event) {
                var handle = false;
                for (var i in this.handles) {
                    if ($(this.handles[i])[0] == event.target) {
                        handle = true;
                    }
                }
                return !this.options.disabled && handle;
            },
            _mouseStart: function (event) {
                var o = this.options, iniPos = this.element.position(), el = this.element;
                this.resizing = true;
                this.documentScroll = {
                    top: $(document).scrollTop(),
                    left: $(document).scrollLeft()
                };
                // bugfix for http://dev.jquery.com/ticket/1749
                if (el.is('.ui-draggable') || /absolute/.test(el.css('position'))) {
                    el.css({
                        position: 'absolute',
                        top: iniPos.top,
                        left: iniPos.left
                    });
                }
                this._renderProxy();
                var curleft = num(this.helper.css('left')), curtop = num(this.helper.css('top'));
                if (o.containment) {
                    curleft += $(o.containment).scrollLeft() || 0;
                    curtop += $(o.containment).scrollTop() || 0;
                }
                //Store needed variables
                this.offset = this.helper.offset();
                this.position = {
                    left: curleft,
                    top: curtop
                };
                this.size = this._helper ? {
                    width: el.outerWidth(),
                    height: el.outerHeight()
                } : {
                    width: el.width(),
                    height: el.height()
                };
                this.originalSize = this._helper ? {
                    width: el.outerWidth(),
                    height: el.outerHeight()
                } : {
                    width: el.width(),
                    height: el.height()
                };
                this.originalPosition = {
                    left: curleft,
                    top: curtop
                };
                this.sizeDiff = {
                    width: el.outerWidth() - el.width(),
                    height: el.outerHeight() - el.height()
                };
                this.originalMousePosition = {
                    left: event.pageX,
                    top: event.pageY
                };
                //Aspect Ratio
                this.aspectRatio = typeof o.aspectRatio == 'number' ? o.aspectRatio : this.originalSize.width / this.originalSize.height || 1;
                var cursor = $('.ui-resizable-' + this.axis).css('cursor');
                $('body').css('cursor', cursor == 'auto' ? this.axis + '-resize' : cursor);
                el.addClass('ui-resizable-resizing');
                this._propagate('start', event);
                return true;
            },
            _mouseDrag: function (event) {
                //Increase performance, avoid regex
                var el = this.helper, o = this.options, props = {}, that = this, smp = this.originalMousePosition, a = this.axis;
                var dx = event.pageX - smp.left || 0, dy = event.pageY - smp.top || 0;
                var trigger = this._change[a];
                if (!trigger)
                    return false;
                // Calculate the attrs that will be change
                var data = trigger.apply(this, [
                    event,
                    dx,
                    dy
                ]);
                // Put this in the mouseDrag handler since the user can start pressing shift while resizing
                this._updateVirtualBoundaries(event.shiftKey);
                if (this._aspectRatio || event.shiftKey)
                    data = this._updateRatio(data, event);
                data = this._respectSize(data, event);
                // plugins callbacks need to be called first
                this._propagate('resize', event);
                el.css({
                    top: this.position.top + 'px',
                    left: this.position.left + 'px',
                    width: this.size.width + 'px',
                    height: this.size.height + 'px'
                });
                if (!this._helper && this._proportionallyResizeElements.length)
                    this._proportionallyResize();
                this._updateCache(data);
                // calling the user callback at the end
                this._trigger('resize', event, this.ui());
                return false;
            },
            _mouseStop: function (event) {
                this.resizing = false;
                var o = this.options, that = this;
                if (this._helper) {
                    var pr = this._proportionallyResizeElements, ista = pr.length && /textarea/i.test(pr[0].nodeName), soffseth = ista && $.ui.hasScroll(pr[0], 'left')    /* TODO - jump height */ ? 0 : that.sizeDiff.height, soffsetw = ista ? 0 : that.sizeDiff.width;
                    var s = {
                            width: that.helper.width() - soffsetw,
                            height: that.helper.height() - soffseth
                        }, left = parseInt(that.element.css('left'), 10) + (that.position.left - that.originalPosition.left) || null, top = parseInt(that.element.css('top'), 10) + (that.position.top - that.originalPosition.top) || null;
                    if (!o.animate)
                        this.element.css($.extend(s, {
                            top: top,
                            left: left
                        }));
                    that.helper.height(that.size.height);
                    that.helper.width(that.size.width);
                    if (this._helper && !o.animate)
                        this._proportionallyResize();
                }
                $('body').css('cursor', 'auto');
                this.element.removeClass('ui-resizable-resizing');
                this._propagate('stop', event);
                if (this._helper)
                    this.helper.remove();
                return false;
            },
            _updateVirtualBoundaries: function (forceAspectRatio) {
                var o = this.options, pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b;
                b = {
                    minWidth: isNumber(o.minWidth) ? o.minWidth : 0,
                    maxWidth: isNumber(o.maxWidth) ? o.maxWidth : Infinity,
                    minHeight: isNumber(o.minHeight) ? o.minHeight : 0,
                    maxHeight: isNumber(o.maxHeight) ? o.maxHeight : Infinity
                };
                if (this._aspectRatio || forceAspectRatio) {
                    // We want to create an enclosing box whose aspect ration is the requested one
                    // First, compute the "projected" size for each dimension based on the aspect ratio and other dimension
                    pMinWidth = b.minHeight * this.aspectRatio;
                    pMinHeight = b.minWidth / this.aspectRatio;
                    pMaxWidth = b.maxHeight * this.aspectRatio;
                    pMaxHeight = b.maxWidth / this.aspectRatio;
                    if (pMinWidth > b.minWidth)
                        b.minWidth = pMinWidth;
                    if (pMinHeight > b.minHeight)
                        b.minHeight = pMinHeight;
                    if (pMaxWidth < b.maxWidth)
                        b.maxWidth = pMaxWidth;
                    if (pMaxHeight < b.maxHeight)
                        b.maxHeight = pMaxHeight;
                }
                this._vBoundaries = b;
            },
            _updateCache: function (data) {
                var o = this.options;
                this.offset = this.helper.offset();
                if (isNumber(data.left))
                    this.position.left = data.left;
                if (isNumber(data.top))
                    this.position.top = data.top;
                if (isNumber(data.height))
                    this.size.height = data.height;
                if (isNumber(data.width))
                    this.size.width = data.width;
            },
            _updateRatio: function (data, event) {
                var o = this.options, cpos = this.position, csize = this.size, a = this.axis;
                if (isNumber(data.height))
                    data.width = data.height * this.aspectRatio;
                else if (isNumber(data.width))
                    data.height = data.width / this.aspectRatio;
                if (a == 'sw') {
                    data.left = cpos.left + (csize.width - data.width);
                    data.top = null;
                }
                if (a == 'nw') {
                    data.top = cpos.top + (csize.height - data.height);
                    data.left = cpos.left + (csize.width - data.width);
                }
                return data;
            },
            _respectSize: function (data, event) {
                var el = this.helper, o = this._vBoundaries, pRatio = this._aspectRatio || event.shiftKey, a = this.axis, ismaxw = isNumber(data.width) && o.maxWidth && o.maxWidth < data.width, ismaxh = isNumber(data.height) && o.maxHeight && o.maxHeight < data.height, isminw = isNumber(data.width) && o.minWidth && o.minWidth > data.width, isminh = isNumber(data.height) && o.minHeight && o.minHeight > data.height;
                if (isminw)
                    data.width = o.minWidth;
                if (isminh)
                    data.height = o.minHeight;
                if (ismaxw)
                    data.width = o.maxWidth;
                if (ismaxh)
                    data.height = o.maxHeight;
                var dw = this.originalPosition.left + this.originalSize.width, dh = this.position.top + this.size.height;
                var cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);
                if (isminw && cw)
                    data.left = dw - o.minWidth;
                if (ismaxw && cw)
                    data.left = dw - o.maxWidth;
                if (isminh && ch)
                    data.top = dh - o.minHeight;
                if (ismaxh && ch)
                    data.top = dh - o.maxHeight;
                // fixing jump error on top/left - bug #2330
                var isNotwh = !data.width && !data.height;
                if (isNotwh && !data.left && data.top)
                    data.top = null;
                else if (isNotwh && !data.top && data.left)
                    data.left = null;
                return data;
            },
            _proportionallyResize: function () {
                var o = this.options;
                if (!this._proportionallyResizeElements.length)
                    return;
                var element = this.helper || this.element;
                for (var i = 0; i < this._proportionallyResizeElements.length; i++) {
                    var prel = this._proportionallyResizeElements[i];
                    if (!this.borderDif) {
                        var b = [
                                prel.css('borderTopWidth'),
                                prel.css('borderRightWidth'),
                                prel.css('borderBottomWidth'),
                                prel.css('borderLeftWidth')
                            ], p = [
                                prel.css('paddingTop'),
                                prel.css('paddingRight'),
                                prel.css('paddingBottom'),
                                prel.css('paddingLeft')
                            ];
                        this.borderDif = $.map(b, function (v, i) {
                            var border = parseInt(v, 10) || 0, padding = parseInt(p[i], 10) || 0;
                            return border + padding;
                        });
                    }
                    prel.css({
                        height: element.height() - this.borderDif[0] - this.borderDif[2] || 0,
                        width: element.width() - this.borderDif[1] - this.borderDif[3] || 0
                    });
                }
                ;
            },
            _renderProxy: function () {
                var el = this.element, o = this.options;
                this.elementOffset = el.offset();
                if (this._helper) {
                    this.helper = this.helper || $('<div style="overflow:hidden;"></div>');
                    // fix ie6 offset TODO: This seems broken
                    var ie6offset = $.ui.ie6 ? 1 : 0, pxyoffset = $.ui.ie6 ? 2 : -1;
                    this.helper.addClass(this._helper).css({
                        width: this.element.outerWidth() + pxyoffset,
                        height: this.element.outerHeight() + pxyoffset,
                        position: 'absolute',
                        left: this.elementOffset.left - ie6offset + 'px',
                        top: this.elementOffset.top - ie6offset + 'px',
                        zIndex: ++o.zIndex
                    });
                    this.helper.appendTo('body').disableSelection();
                } else {
                    this.helper = this.element;
                }
            },
            _change: {
                e: function (event, dx, dy) {
                    return { width: this.originalSize.width + dx };
                },
                w: function (event, dx, dy) {
                    var o = this.options, cs = this.originalSize, sp = this.originalPosition;
                    return {
                        left: sp.left + dx,
                        width: cs.width - dx
                    };
                },
                n: function (event, dx, dy) {
                    var o = this.options, cs = this.originalSize, sp = this.originalPosition;
                    return {
                        top: sp.top + dy,
                        height: cs.height - dy
                    };
                },
                s: function (event, dx, dy) {
                    return { height: this.originalSize.height + dy };
                },
                se: function (event, dx, dy) {
                    return $.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [
                        event,
                        dx,
                        dy
                    ]));
                },
                sw: function (event, dx, dy) {
                    return $.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [
                        event,
                        dx,
                        dy
                    ]));
                },
                ne: function (event, dx, dy) {
                    return $.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [
                        event,
                        dx,
                        dy
                    ]));
                },
                nw: function (event, dx, dy) {
                    return $.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [
                        event,
                        dx,
                        dy
                    ]));
                }
            },
            _propagate: function (n, event) {
                $.ui.plugin.call(this, n, [
                    event,
                    this.ui()
                ]);
                n != 'resize' && this._trigger(n, event, this.ui());
            },
            plugins: {},
            ui: function () {
                return {
                    originalElement: this.originalElement,
                    element: this.element,
                    helper: this.helper,
                    position: this.position,
                    size: this.size,
                    originalSize: this.originalSize,
                    originalPosition: this.originalPosition
                };
            }
        });
        /*
 * Resizable Extensions
 */
        $.ui.plugin.add('resizable', 'alsoResize', {
            start: function (event, ui) {
                var that = $(this).data('resizable'), o = that.options;
                var _store = function (exp) {
                    $(exp).each(function () {
                        var el = $(this);
                        el.data('resizable-alsoresize', {
                            width: parseInt(el.width(), 10),
                            height: parseInt(el.height(), 10),
                            left: parseInt(el.css('left'), 10),
                            top: parseInt(el.css('top'), 10)
                        });
                    });
                };
                if (typeof o.alsoResize == 'object' && !o.alsoResize.parentNode) {
                    if (o.alsoResize.length) {
                        o.alsoResize = o.alsoResize[0];
                        _store(o.alsoResize);
                    } else {
                        $.each(o.alsoResize, function (exp) {
                            _store(exp);
                        });
                    }
                } else {
                    _store(o.alsoResize);
                }
            },
            resize: function (event, ui) {
                var that = $(this).data('resizable'), o = that.options, os = that.originalSize, op = that.originalPosition;
                var delta = {
                        height: that.size.height - os.height || 0,
                        width: that.size.width - os.width || 0,
                        top: that.position.top - op.top || 0,
                        left: that.position.left - op.left || 0
                    }, _alsoResize = function (exp, c) {
                        $(exp).each(function () {
                            var el = $(this), start = $(this).data('resizable-alsoresize'), style = {}, css = c && c.length ? c : el.parents(ui.originalElement[0]).length ? [
                                    'width',
                                    'height'
                                ] : [
                                    'width',
                                    'height',
                                    'top',
                                    'left'
                                ];
                            $.each(css, function (i, prop) {
                                var sum = (start[prop] || 0) + (delta[prop] || 0);
                                if (sum && sum >= 0)
                                    style[prop] = sum || null;
                            });
                            el.css(style);
                        });
                    };
                if (typeof o.alsoResize == 'object' && !o.alsoResize.nodeType) {
                    $.each(o.alsoResize, function (exp, c) {
                        _alsoResize(exp, c);
                    });
                } else {
                    _alsoResize(o.alsoResize);
                }
            },
            stop: function (event, ui) {
                $(this).removeData('resizable-alsoresize');
            }
        });
        $.ui.plugin.add('resizable', 'animate', {
            stop: function (event, ui) {
                var that = $(this).data('resizable'), o = that.options;
                var pr = that._proportionallyResizeElements, ista = pr.length && /textarea/i.test(pr[0].nodeName), soffseth = ista && $.ui.hasScroll(pr[0], 'left')    /* TODO - jump height */ ? 0 : that.sizeDiff.height, soffsetw = ista ? 0 : that.sizeDiff.width;
                var style = {
                        width: that.size.width - soffsetw,
                        height: that.size.height - soffseth
                    }, left = parseInt(that.element.css('left'), 10) + (that.position.left - that.originalPosition.left) || null, top = parseInt(that.element.css('top'), 10) + (that.position.top - that.originalPosition.top) || null;
                that.element.animate($.extend(style, top && left ? {
                    top: top,
                    left: left
                } : {}), {
                    duration: o.animateDuration,
                    easing: o.animateEasing,
                    step: function () {
                        var data = {
                            width: parseInt(that.element.css('width'), 10),
                            height: parseInt(that.element.css('height'), 10),
                            top: parseInt(that.element.css('top'), 10),
                            left: parseInt(that.element.css('left'), 10)
                        };
                        if (pr && pr.length)
                            $(pr[0]).css({
                                width: data.width,
                                height: data.height
                            });
                        // propagating resize, and updating values for each animation step
                        that._updateCache(data);
                        that._propagate('resize', event);
                    }
                });
            }
        });
        $.ui.plugin.add('resizable', 'containment', {
            start: function (event, ui) {
                var that = $(this).data('resizable'), o = that.options, el = that.element;
                var oc = o.containment, ce = oc instanceof $ ? oc.get(0) : /parent/.test(oc) ? el.parent().get(0) : oc;
                if (!ce)
                    return;
                that.containerElement = $(ce);
                if (/document/.test(oc) || oc == document) {
                    that.containerOffset = {
                        left: 0,
                        top: 0
                    };
                    that.containerPosition = {
                        left: 0,
                        top: 0
                    };
                    that.parentData = {
                        element: $(document),
                        left: 0,
                        top: 0,
                        width: $(document).width(),
                        height: $(document).height() || document.body.parentNode.scrollHeight
                    };
                }    // i'm a node, so compute top, left, right, bottom
                else {
                    var element = $(ce), p = [];
                    $([
                        'Top',
                        'Right',
                        'Left',
                        'Bottom'
                    ]).each(function (i, name) {
                        p[i] = num(element.css('padding' + name));
                    });
                    that.containerOffset = element.offset();
                    that.containerPosition = element.position();
                    that.containerSize = {
                        height: element.innerHeight() - p[3],
                        width: element.innerWidth() - p[1]
                    };
                    var co = that.containerOffset, ch = that.containerSize.height, cw = that.containerSize.width, width = $.ui.hasScroll(ce, 'left') ? ce.scrollWidth : cw, height = $.ui.hasScroll(ce) ? ce.scrollHeight : ch;
                    that.parentData = {
                        element: ce,
                        left: co.left,
                        top: co.top,
                        width: width,
                        height: height
                    };
                }
            },
            resize: function (event, ui) {
                var that = $(this).data('resizable'), o = that.options, ps = that.containerSize, co = that.containerOffset, cs = that.size, cp = that.position, pRatio = that._aspectRatio || event.shiftKey, cop = {
                        top: 0,
                        left: 0
                    }, ce = that.containerElement;
                if (ce[0] != document && /static/.test(ce.css('position')))
                    cop = co;
                if (cp.left < (that._helper ? co.left : 0)) {
                    that.size.width = that.size.width + (that._helper ? that.position.left - co.left : that.position.left - cop.left);
                    if (pRatio)
                        that.size.height = that.size.width / that.aspectRatio;
                    that.position.left = o.helper ? co.left : 0;
                }
                if (cp.top < (that._helper ? co.top : 0)) {
                    that.size.height = that.size.height + (that._helper ? that.position.top - co.top : that.position.top);
                    if (pRatio)
                        that.size.width = that.size.height * that.aspectRatio;
                    that.position.top = that._helper ? co.top : 0;
                }
                that.offset.left = that.parentData.left + that.position.left;
                that.offset.top = that.parentData.top + that.position.top;
                var woset = Math.abs((that._helper ? that.offset.left - cop.left : that.offset.left - cop.left) + that.sizeDiff.width), hoset = Math.abs((that._helper ? that.offset.top - cop.top : that.offset.top - co.top) + that.sizeDiff.height);
                var isParent = that.containerElement.get(0) == that.element.parent().get(0), isOffsetRelative = /relative|absolute/.test(that.containerElement.css('position'));
                if (isParent && isOffsetRelative)
                    woset -= that.parentData.left;
                if (woset + that.size.width >= that.parentData.width) {
                    that.size.width = that.parentData.width - woset;
                    if (pRatio)
                        that.size.height = that.size.width / that.aspectRatio;
                }
                if (hoset + that.size.height >= that.parentData.height) {
                    that.size.height = that.parentData.height - hoset;
                    if (pRatio)
                        that.size.width = that.size.height * that.aspectRatio;
                }
            },
            stop: function (event, ui) {
                var that = $(this).data('resizable'), o = that.options, cp = that.position, co = that.containerOffset, cop = that.containerPosition, ce = that.containerElement;
                var helper = $(that.helper), ho = helper.offset(), w = helper.outerWidth() - that.sizeDiff.width, h = helper.outerHeight() - that.sizeDiff.height;
                if (that._helper && !o.animate && /relative/.test(ce.css('position')))
                    $(this).css({
                        left: ho.left - cop.left - co.left,
                        width: w,
                        height: h
                    });
                if (that._helper && !o.animate && /static/.test(ce.css('position')))
                    $(this).css({
                        left: ho.left - cop.left - co.left,
                        width: w,
                        height: h
                    });
            }
        });
        $.ui.plugin.add('resizable', 'ghost', {
            start: function (event, ui) {
                var that = $(this).data('resizable'), o = that.options, cs = that.size;
                that.ghost = that.originalElement.clone();
                that.ghost.css({
                    opacity: 0.25,
                    display: 'block',
                    position: 'relative',
                    height: cs.height,
                    width: cs.width,
                    margin: 0,
                    left: 0,
                    top: 0
                }).addClass('ui-resizable-ghost').addClass(typeof o.ghost == 'string' ? o.ghost : '');
                that.ghost.appendTo(that.helper);
            },
            resize: function (event, ui) {
                var that = $(this).data('resizable'), o = that.options;
                if (that.ghost)
                    that.ghost.css({
                        position: 'relative',
                        height: that.size.height,
                        width: that.size.width
                    });
            },
            stop: function (event, ui) {
                var that = $(this).data('resizable'), o = that.options;
                if (that.ghost && that.helper)
                    that.helper.get(0).removeChild(that.ghost.get(0));
            }
        });
        $.ui.plugin.add('resizable', 'grid', {
            resize: function (event, ui) {
                var that = $(this).data('resizable'), o = that.options, cs = that.size, os = that.originalSize, op = that.originalPosition, a = that.axis, ratio = o._aspectRatio || event.shiftKey;
                o.grid = typeof o.grid == 'number' ? [
                    o.grid,
                    o.grid
                ] : o.grid;
                var ox = Math.round((cs.width - os.width) / (o.grid[0] || 1)) * (o.grid[0] || 1), oy = Math.round((cs.height - os.height) / (o.grid[1] || 1)) * (o.grid[1] || 1);
                if (/^(se|s|e)$/.test(a)) {
                    that.size.width = os.width + ox;
                    that.size.height = os.height + oy;
                } else if (/^(ne)$/.test(a)) {
                    that.size.width = os.width + ox;
                    that.size.height = os.height + oy;
                    that.position.top = op.top - oy;
                } else if (/^(sw)$/.test(a)) {
                    that.size.width = os.width + ox;
                    that.size.height = os.height + oy;
                    that.position.left = op.left - ox;
                } else {
                    that.size.width = os.width + ox;
                    that.size.height = os.height + oy;
                    that.position.top = op.top - oy;
                    that.position.left = op.left - ox;
                }
            }
        });
        var num = function (v) {
            return parseInt(v, 10) || 0;
        };
        var isNumber = function (value) {
            return !isNaN(parseInt(value, 10));
        };
    }(jQuery));
    /*!
 * jQuery UI Button 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/button/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
    (function ($, undefined) {
        var lastActive, startXPos, startYPos, clickDragged, baseClasses = 'ui-button ui-widget ui-state-default ui-corner-all', stateClasses = 'ui-state-hover ui-state-active ', typeClasses = 'ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only', formResetHandler = function () {
                var buttons = $(this).find(':ui-button');
                setTimeout(function () {
                    buttons.button('refresh');
                }, 1);
            }, radioGroup = function (radio) {
                var name = radio.name, form = radio.form, radios = $([]);
                if (name) {
                    if (form) {
                        radios = $(form).find('[name=\'' + name + '\']');
                    } else {
                        radios = $('[name=\'' + name + '\']', radio.ownerDocument).filter(function () {
                            return !this.form;
                        });
                    }
                }
                return radios;
            };
        $.widget('ui.button', {
            version: '1.9.2',
            defaultElement: '<button>',
            options: {
                disabled: null,
                text: true,
                label: null,
                icons: {
                    primary: null,
                    secondary: null
                }
            },
            _create: function () {
                this.element.closest('form').unbind('reset' + this.eventNamespace).bind('reset' + this.eventNamespace, formResetHandler);
                if (typeof this.options.disabled !== 'boolean') {
                    this.options.disabled = !!this.element.prop('disabled');
                } else {
                    this.element.prop('disabled', this.options.disabled);
                }
                this._determineButtonType();
                this.hasTitle = !!this.buttonElement.attr('title');
                var that = this, options = this.options, toggleButton = this.type === 'checkbox' || this.type === 'radio', activeClass = !toggleButton ? 'ui-state-active' : '', focusClass = 'ui-state-focus';
                if (options.label === null) {
                    options.label = this.type === 'input' ? this.buttonElement.val() : this.buttonElement.html();
                }
                this._hoverable(this.buttonElement);
                this.buttonElement.addClass(baseClasses).attr('role', 'button').bind('mouseenter' + this.eventNamespace, function () {
                    if (options.disabled) {
                        return;
                    }
                    if (this === lastActive) {
                        $(this).addClass('ui-state-active');
                    }
                }).bind('mouseleave' + this.eventNamespace, function () {
                    if (options.disabled) {
                        return;
                    }
                    $(this).removeClass(activeClass);
                }).bind('click' + this.eventNamespace, function (event) {
                    if (options.disabled) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }
                });
                this.element.bind('focus' + this.eventNamespace, function () {
                    // no need to check disabled, focus won't be triggered anyway
                    that.buttonElement.addClass(focusClass);
                }).bind('blur' + this.eventNamespace, function () {
                    that.buttonElement.removeClass(focusClass);
                });
                if (toggleButton) {
                    this.element.bind('change' + this.eventNamespace, function () {
                        if (clickDragged) {
                            return;
                        }
                        that.refresh();
                    });
                    // if mouse moves between mousedown and mouseup (drag) set clickDragged flag
                    // prevents issue where button state changes but checkbox/radio checked state
                    // does not in Firefox (see ticket #6970)
                    this.buttonElement.bind('mousedown' + this.eventNamespace, function (event) {
                        if (options.disabled) {
                            return;
                        }
                        clickDragged = false;
                        startXPos = event.pageX;
                        startYPos = event.pageY;
                    }).bind('mouseup' + this.eventNamespace, function (event) {
                        if (options.disabled) {
                            return;
                        }
                        if (startXPos !== event.pageX || startYPos !== event.pageY) {
                            clickDragged = true;
                        }
                    });
                }
                if (this.type === 'checkbox') {
                    this.buttonElement.bind('click' + this.eventNamespace, function () {
                        if (options.disabled || clickDragged) {
                            return false;
                        }
                        $(this).toggleClass('ui-state-active');
                        that.buttonElement.attr('aria-pressed', that.element[0].checked);
                    });
                } else if (this.type === 'radio') {
                    this.buttonElement.bind('click' + this.eventNamespace, function () {
                        if (options.disabled || clickDragged) {
                            return false;
                        }
                        $(this).addClass('ui-state-active');
                        that.buttonElement.attr('aria-pressed', 'true');
                        var radio = that.element[0];
                        radioGroup(radio).not(radio).map(function () {
                            return $(this).button('widget')[0];
                        }).removeClass('ui-state-active').attr('aria-pressed', 'false');
                    });
                } else {
                    this.buttonElement.bind('mousedown' + this.eventNamespace, function () {
                        if (options.disabled) {
                            return false;
                        }
                        $(this).addClass('ui-state-active');
                        lastActive = this;
                        that.document.one('mouseup', function () {
                            lastActive = null;
                        });
                    }).bind('mouseup' + this.eventNamespace, function () {
                        if (options.disabled) {
                            return false;
                        }
                        $(this).removeClass('ui-state-active');
                    }).bind('keydown' + this.eventNamespace, function (event) {
                        if (options.disabled) {
                            return false;
                        }
                        if (event.keyCode === $.ui.keyCode.SPACE || event.keyCode === $.ui.keyCode.ENTER) {
                            $(this).addClass('ui-state-active');
                        }
                    }).bind('keyup' + this.eventNamespace, function () {
                        $(this).removeClass('ui-state-active');
                    });
                    if (this.buttonElement.is('a')) {
                        this.buttonElement.keyup(function (event) {
                            if (event.keyCode === $.ui.keyCode.SPACE) {
                                // TODO pass through original event correctly (just as 2nd argument doesn't work)
                                $(this).click();
                            }
                        });
                    }
                }
                // TODO: pull out $.Widget's handling for the disabled option into
                // $.Widget.prototype._setOptionDisabled so it's easy to proxy and can
                // be overridden by individual plugins
                this._setOption('disabled', options.disabled);
                this._resetButton();
            },
            _determineButtonType: function () {
                var ancestor, labelSelector, checked;
                if (this.element.is('[type=checkbox]')) {
                    this.type = 'checkbox';
                } else if (this.element.is('[type=radio]')) {
                    this.type = 'radio';
                } else if (this.element.is('input')) {
                    this.type = 'input';
                } else {
                    this.type = 'button';
                }
                if (this.type === 'checkbox' || this.type === 'radio') {
                    // we don't search against the document in case the element
                    // is disconnected from the DOM
                    ancestor = this.element.parents().last();
                    labelSelector = 'label[for=\'' + this.element.attr('id') + '\']';
                    this.buttonElement = ancestor.find(labelSelector);
                    if (!this.buttonElement.length) {
                        ancestor = ancestor.length ? ancestor.siblings() : this.element.siblings();
                        this.buttonElement = ancestor.filter(labelSelector);
                        if (!this.buttonElement.length) {
                            this.buttonElement = ancestor.find(labelSelector);
                        }
                    }
                    this.element.addClass('ui-helper-hidden-accessible');
                    checked = this.element.is(':checked');
                    if (checked) {
                        this.buttonElement.addClass('ui-state-active');
                    }
                    this.buttonElement.prop('aria-pressed', checked);
                } else {
                    this.buttonElement = this.element;
                }
            },
            widget: function () {
                return this.buttonElement;
            },
            _destroy: function () {
                this.element.removeClass('ui-helper-hidden-accessible');
                this.buttonElement.removeClass(baseClasses + ' ' + stateClasses + ' ' + typeClasses).removeAttr('role').removeAttr('aria-pressed').html(this.buttonElement.find('.ui-button-text').html());
                if (!this.hasTitle) {
                    this.buttonElement.removeAttr('title');
                }
            },
            _setOption: function (key, value) {
                this._super(key, value);
                if (key === 'disabled') {
                    if (value) {
                        this.element.prop('disabled', true);
                    } else {
                        this.element.prop('disabled', false);
                    }
                    return;
                }
                this._resetButton();
            },
            refresh: function () {
                //See #8237 & #8828
                var isDisabled = this.element.is('input, button') ? this.element.is(':disabled') : this.element.hasClass('ui-button-disabled');
                if (isDisabled !== this.options.disabled) {
                    this._setOption('disabled', isDisabled);
                }
                if (this.type === 'radio') {
                    radioGroup(this.element[0]).each(function () {
                        if ($(this).is(':checked')) {
                            $(this).button('widget').addClass('ui-state-active').attr('aria-pressed', 'true');
                        } else {
                            $(this).button('widget').removeClass('ui-state-active').attr('aria-pressed', 'false');
                        }
                    });
                } else if (this.type === 'checkbox') {
                    if (this.element.is(':checked')) {
                        this.buttonElement.addClass('ui-state-active').attr('aria-pressed', 'true');
                    } else {
                        this.buttonElement.removeClass('ui-state-active').attr('aria-pressed', 'false');
                    }
                }
            },
            _resetButton: function () {
                if (this.type === 'input') {
                    if (this.options.label) {
                        this.element.val(this.options.label);
                    }
                    return;
                }
                var buttonElement = this.buttonElement.removeClass(typeClasses), buttonText = $('<span></span>', this.document[0]).addClass('ui-button-text').html(this.options.label).appendTo(buttonElement.empty()).text(), icons = this.options.icons, multipleIcons = icons.primary && icons.secondary, buttonClasses = [];
                if (icons.primary || icons.secondary) {
                    if (this.options.text) {
                        buttonClasses.push('ui-button-text-icon' + (multipleIcons ? 's' : icons.primary ? '-primary' : '-secondary'));
                    }
                    if (icons.primary) {
                        buttonElement.prepend('<span class=\'ui-button-icon-primary ui-icon ' + icons.primary + '\'></span>');
                    }
                    if (icons.secondary) {
                        buttonElement.append('<span class=\'ui-button-icon-secondary ui-icon ' + icons.secondary + '\'></span>');
                    }
                    if (!this.options.text) {
                        buttonClasses.push(multipleIcons ? 'ui-button-icons-only' : 'ui-button-icon-only');
                        if (!this.hasTitle) {
                            buttonElement.attr('title', $.trim(buttonText));
                        }
                    }
                } else {
                    buttonClasses.push('ui-button-text-only');
                }
                buttonElement.addClass(buttonClasses.join(' '));
            }
        });
        $.widget('ui.buttonset', {
            version: '1.9.2',
            options: { items: 'button, input[type=button], input[type=submit], input[type=reset], input[type=checkbox], input[type=radio], a, :data(button)' },
            _create: function () {
                this.element.addClass('ui-buttonset');
            },
            _init: function () {
                this.refresh();
            },
            _setOption: function (key, value) {
                if (key === 'disabled') {
                    this.buttons.button('option', key, value);
                }
                this._super(key, value);
            },
            refresh: function () {
                var rtl = this.element.css('direction') === 'rtl';
                this.buttons = this.element.find(this.options.items).filter(':ui-button').button('refresh').end().not(':ui-button').button().end().map(function () {
                    return $(this).button('widget')[0];
                }).removeClass('ui-corner-all ui-corner-left ui-corner-right').filter(':first').addClass(rtl ? 'ui-corner-right' : 'ui-corner-left').end().filter(':last').addClass(rtl ? 'ui-corner-left' : 'ui-corner-right').end().end();
            },
            _destroy: function () {
                this.element.removeClass('ui-buttonset');
                this.buttons.map(function () {
                    return $(this).button('widget')[0];
                }).removeClass('ui-corner-left ui-corner-right').end().button('destroy');
            }
        });
    }(jQuery));
    /*!
 * jQuery UI Dialog 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/dialog/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.ui.button.js
 *	jquery.ui.draggable.js
 *	jquery.ui.mouse.js
 *	jquery.ui.position.js
 *	jquery.ui.resizable.js
 */
    (function ($, undefined) {
        var uiDialogClasses = 'ui-dialog ui-widget ui-widget-content ui-corner-all ', sizeRelatedOptions = {
                buttons: true,
                height: true,
                maxHeight: true,
                maxWidth: true,
                minHeight: true,
                minWidth: true,
                width: true
            }, resizableRelatedOptions = {
                maxHeight: true,
                maxWidth: true,
                minHeight: true,
                minWidth: true
            };
        $.widget('ui.dialog', {
            version: '1.9.2',
            options: {
                autoOpen: true,
                buttons: {},
                closeOnEscape: true,
                closeText: 'close',
                dialogClass: '',
                draggable: true,
                hide: null,
                height: 'auto',
                maxHeight: false,
                maxWidth: false,
                minHeight: 150,
                minWidth: 150,
                modal: false,
                position: {
                    my: 'center',
                    at: 'center',
                    of: window,
                    collision: 'fit',
                    // ensure that the titlebar is never outside the document
                    using: function (pos) {
                        var topOffset = $(this).css(pos).offset().top;
                        if (topOffset < 0) {
                            $(this).css('top', pos.top - topOffset);
                        }
                    }
                },
                resizable: true,
                show: null,
                stack: true,
                title: '',
                width: 300,
                zIndex: 1000
            },
            _create: function () {
                this.originalTitle = this.element.attr('title');
                // #5742 - .attr() might return a DOMElement
                if (typeof this.originalTitle !== 'string') {
                    this.originalTitle = '';
                }
                this.oldPosition = {
                    parent: this.element.parent(),
                    index: this.element.parent().children().index(this.element)
                };
                this.options.title = this.options.title || this.originalTitle;
                var that = this, options = this.options, title = options.title || '&#160;', uiDialog, uiDialogTitlebar, uiDialogTitlebarClose, uiDialogTitle, uiDialogButtonPane;
                uiDialog = (this.uiDialog = $('<div>')).addClass(uiDialogClasses + options.dialogClass).css({
                    display: 'none',
                    outline: 0,
                    // TODO: move to stylesheet
                    zIndex: options.zIndex
                })    // setting tabIndex makes the div focusable
.attr('tabIndex', -1).keydown(function (event) {
                    if (options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode && event.keyCode === $.ui.keyCode.ESCAPE) {
                        that.close(event);
                        event.preventDefault();
                    }
                }).mousedown(function (event) {
                    that.moveToTop(false, event);
                }).appendTo('body');
                this.element.show().removeAttr('title').addClass('ui-dialog-content ui-widget-content').appendTo(uiDialog);
                uiDialogTitlebar = (this.uiDialogTitlebar = $('<div>')).addClass('ui-dialog-titlebar  ui-widget-header  ' + 'ui-corner-all  ui-helper-clearfix').bind('mousedown', function () {
                    // Dialog isn't getting focus when dragging (#8063)
                    uiDialog.focus();
                }).prependTo(uiDialog);
                uiDialogTitlebarClose = $('<a href=\'#\'></a>').addClass('ui-dialog-titlebar-close  ui-corner-all').attr('role', 'button').click(function (event) {
                    event.preventDefault();
                    that.close(event);
                }).appendTo(uiDialogTitlebar);
                (this.uiDialogTitlebarCloseText = $('<span>')).addClass('ui-icon ui-icon-closethick').text(options.closeText).appendTo(uiDialogTitlebarClose);
                uiDialogTitle = $('<span>').uniqueId().addClass('ui-dialog-title').html(title).prependTo(uiDialogTitlebar);
                uiDialogButtonPane = (this.uiDialogButtonPane = $('<div>')).addClass('ui-dialog-buttonpane ui-widget-content ui-helper-clearfix');
                (this.uiButtonSet = $('<div>')).addClass('ui-dialog-buttonset').appendTo(uiDialogButtonPane);
                uiDialog.attr({
                    role: 'dialog',
                    'aria-labelledby': uiDialogTitle.attr('id')
                });
                uiDialogTitlebar.find('*').add(uiDialogTitlebar).disableSelection();
                this._hoverable(uiDialogTitlebarClose);
                this._focusable(uiDialogTitlebarClose);
                if (options.draggable && $.fn.draggable) {
                    this._makeDraggable();
                }
                if (options.resizable && $.fn.resizable) {
                    this._makeResizable();
                }
                this._createButtons(options.buttons);
                this._isOpen = false;
                if ($.fn.bgiframe) {
                    uiDialog.bgiframe();
                }
                // prevent tabbing out of modal dialogs
                this._on(uiDialog, {
                    keydown: function (event) {
                        if (!options.modal || event.keyCode !== $.ui.keyCode.TAB) {
                            return;
                        }
                        var tabbables = $(':tabbable', uiDialog), first = tabbables.filter(':first'), last = tabbables.filter(':last');
                        if (event.target === last[0] && !event.shiftKey) {
                            first.focus(1);
                            return false;
                        } else if (event.target === first[0] && event.shiftKey) {
                            last.focus(1);
                            return false;
                        }
                    }
                });
            },
            _init: function () {
                if (this.options.autoOpen) {
                    this.open();
                }
            },
            _destroy: function () {
                var next, oldPosition = this.oldPosition;
                if (this.overlay) {
                    this.overlay.destroy();
                }
                this.uiDialog.hide();
                this.element.removeClass('ui-dialog-content ui-widget-content').hide().appendTo('body');
                this.uiDialog.remove();
                if (this.originalTitle) {
                    this.element.attr('title', this.originalTitle);
                }
                next = oldPosition.parent.children().eq(oldPosition.index);
                // Don't try to place the dialog next to itself (#8613)
                if (next.length && next[0] !== this.element[0]) {
                    next.before(this.element);
                } else {
                    oldPosition.parent.append(this.element);
                }
            },
            widget: function () {
                return this.uiDialog;
            },
            close: function (event) {
                var that = this, maxZ, thisZ;
                if (!this._isOpen) {
                    return;
                }
                if (false === this._trigger('beforeClose', event)) {
                    return;
                }
                this._isOpen = false;
                if (this.overlay) {
                    this.overlay.destroy();
                }
                if (this.options.hide) {
                    this._hide(this.uiDialog, this.options.hide, function () {
                        that._trigger('close', event);
                    });
                } else {
                    this.uiDialog.hide();
                    this._trigger('close', event);
                }
                $.ui.dialog.overlay.resize();
                // adjust the maxZ to allow other modal dialogs to continue to work (see #4309)
                if (this.options.modal) {
                    maxZ = 0;
                    $('.ui-dialog').each(function () {
                        if (this !== that.uiDialog[0]) {
                            thisZ = $(this).css('z-index');
                            if (!isNaN(thisZ)) {
                                maxZ = Math.max(maxZ, thisZ);
                            }
                        }
                    });
                    $.ui.dialog.maxZ = maxZ;
                }
                return this;
            },
            isOpen: function () {
                return this._isOpen;
            },
            // the force parameter allows us to move modal dialogs to their correct
            // position on open
            moveToTop: function (force, event) {
                var options = this.options, saveScroll;
                if (options.modal && !force || !options.stack && !options.modal) {
                    return this._trigger('focus', event);
                }
                if (options.zIndex > $.ui.dialog.maxZ) {
                    $.ui.dialog.maxZ = options.zIndex;
                }
                if (this.overlay) {
                    $.ui.dialog.maxZ += 1;
                    $.ui.dialog.overlay.maxZ = $.ui.dialog.maxZ;
                    this.overlay.$el.css('z-index', $.ui.dialog.overlay.maxZ);
                }
                // Save and then restore scroll
                // Opera 9.5+ resets when parent z-index is changed.
                // http://bugs.jqueryui.com/ticket/3193
                saveScroll = {
                    scrollTop: this.element.scrollTop(),
                    scrollLeft: this.element.scrollLeft()
                };
                $.ui.dialog.maxZ += 1;
                this.uiDialog.css('z-index', $.ui.dialog.maxZ);
                this.element.attr(saveScroll);
                this._trigger('focus', event);
                return this;
            },
            open: function () {
                if (this._isOpen) {
                    return;
                }
                var hasFocus, options = this.options, uiDialog = this.uiDialog;
                this._size();
                this._position(options.position);
                uiDialog.show(options.show);
                this.overlay = options.modal ? new $.ui.dialog.overlay(this) : null;
                this.moveToTop(true);
                // set focus to the first tabbable element in the content area or the first button
                // if there are no tabbable elements, set focus on the dialog itself
                hasFocus = this.element.find(':tabbable');
                if (!hasFocus.length) {
                    hasFocus = this.uiDialogButtonPane.find(':tabbable');
                    if (!hasFocus.length) {
                        hasFocus = uiDialog;
                    }
                }
                hasFocus.eq(0).focus();
                this._isOpen = true;
                this._trigger('open');
                return this;
            },
            _createButtons: function (buttons) {
                var that = this, hasButtons = false;
                // if we already have a button pane, remove it
                this.uiDialogButtonPane.remove();
                this.uiButtonSet.empty();
                if (typeof buttons === 'object' && buttons !== null) {
                    $.each(buttons, function () {
                        return !(hasButtons = true);
                    });
                }
                if (hasButtons) {
                    $.each(buttons, function (name, props) {
                        var button, click;
                        props = $.isFunction(props) ? {
                            click: props,
                            text: name
                        } : props;
                        // Default to a non-submitting button
                        props = $.extend({ type: 'button' }, props);
                        // Change the context for the click callback to be the main element
                        click = props.click;
                        props.click = function () {
                            click.apply(that.element[0], arguments);
                        };
                        button = $('<button></button>', props).appendTo(that.uiButtonSet);
                        if ($.fn.button) {
                            button.button();
                        }
                    });
                    this.uiDialog.addClass('ui-dialog-buttons');
                    this.uiDialogButtonPane.appendTo(this.uiDialog);
                } else {
                    this.uiDialog.removeClass('ui-dialog-buttons');
                }
            },
            _makeDraggable: function () {
                var that = this, options = this.options;
                function filteredUi(ui) {
                    return {
                        position: ui.position,
                        offset: ui.offset
                    };
                }
                this.uiDialog.draggable({
                    cancel: '.ui-dialog-content, .ui-dialog-titlebar-close',
                    handle: '.ui-dialog-titlebar',
                    containment: 'document',
                    start: function (event, ui) {
                        $(this).addClass('ui-dialog-dragging');
                        that._trigger('dragStart', event, filteredUi(ui));
                    },
                    drag: function (event, ui) {
                        that._trigger('drag', event, filteredUi(ui));
                    },
                    stop: function (event, ui) {
                        options.position = [
                            ui.position.left - that.document.scrollLeft(),
                            ui.position.top - that.document.scrollTop()
                        ];
                        $(this).removeClass('ui-dialog-dragging');
                        that._trigger('dragStop', event, filteredUi(ui));
                        $.ui.dialog.overlay.resize();
                    }
                });
            },
            _makeResizable: function (handles) {
                handles = handles === undefined ? this.options.resizable : handles;
                var that = this, options = this.options,
                    // .ui-resizable has position: relative defined in the stylesheet
                    // but dialogs have to use absolute or fixed positioning
                    position = this.uiDialog.css('position'), resizeHandles = typeof handles === 'string' ? handles : 'n,e,s,w,se,sw,ne,nw';
                function filteredUi(ui) {
                    return {
                        originalPosition: ui.originalPosition,
                        originalSize: ui.originalSize,
                        position: ui.position,
                        size: ui.size
                    };
                }
                this.uiDialog.resizable({
                    cancel: '.ui-dialog-content',
                    containment: 'document',
                    alsoResize: this.element,
                    maxWidth: options.maxWidth,
                    maxHeight: options.maxHeight,
                    minWidth: options.minWidth,
                    minHeight: this._minHeight(),
                    handles: resizeHandles,
                    start: function (event, ui) {
                        $(this).addClass('ui-dialog-resizing');
                        that._trigger('resizeStart', event, filteredUi(ui));
                    },
                    resize: function (event, ui) {
                        that._trigger('resize', event, filteredUi(ui));
                    },
                    stop: function (event, ui) {
                        $(this).removeClass('ui-dialog-resizing');
                        options.height = $(this).height();
                        options.width = $(this).width();
                        that._trigger('resizeStop', event, filteredUi(ui));
                        $.ui.dialog.overlay.resize();
                    }
                }).css('position', position).find('.ui-resizable-se').addClass('ui-icon ui-icon-grip-diagonal-se');
            },
            _minHeight: function () {
                var options = this.options;
                if (options.height === 'auto') {
                    return options.minHeight;
                } else {
                    return Math.min(options.minHeight, options.height);
                }
            },
            _position: function (position) {
                var myAt = [], offset = [
                        0,
                        0
                    ], isVisible;
                if (position) {
                    // deep extending converts arrays to objects in jQuery <= 1.3.2 :-(
                    //		if (typeof position == 'string' || $.isArray(position)) {
                    //			myAt = $.isArray(position) ? position : position.split(' ');
                    if (typeof position === 'string' || typeof position === 'object' && '0' in position) {
                        myAt = position.split ? position.split(' ') : [
                            position[0],
                            position[1]
                        ];
                        if (myAt.length === 1) {
                            myAt[1] = myAt[0];
                        }
                        $.each([
                            'left',
                            'top'
                        ], function (i, offsetPosition) {
                            if (+myAt[i] === myAt[i]) {
                                offset[i] = myAt[i];
                                myAt[i] = offsetPosition;
                            }
                        });
                        position = {
                            my: myAt[0] + (offset[0] < 0 ? offset[0] : '+' + offset[0]) + ' ' + myAt[1] + (offset[1] < 0 ? offset[1] : '+' + offset[1]),
                            at: myAt.join(' ')
                        };
                    }
                    position = $.extend({}, $.ui.dialog.prototype.options.position, position);
                } else {
                    position = $.ui.dialog.prototype.options.position;
                }
                // need to show the dialog to get the actual offset in the position plugin
                isVisible = this.uiDialog.is(':visible');
                if (!isVisible) {
                    this.uiDialog.show();
                }
                this.uiDialog.position(position);
                if (!isVisible) {
                    this.uiDialog.hide();
                }
            },
            _setOptions: function (options) {
                var that = this, resizableOptions = {}, resize = false;
                $.each(options, function (key, value) {
                    that._setOption(key, value);
                    if (key in sizeRelatedOptions) {
                        resize = true;
                    }
                    if (key in resizableRelatedOptions) {
                        resizableOptions[key] = value;
                    }
                });
                if (resize) {
                    this._size();
                }
                if (this.uiDialog.is(':data(resizable)')) {
                    this.uiDialog.resizable('option', resizableOptions);
                }
            },
            _setOption: function (key, value) {
                var isDraggable, isResizable, uiDialog = this.uiDialog;
                switch (key) {
                case 'buttons':
                    this._createButtons(value);
                    break;
                case 'closeText':
                    // ensure that we always pass a string
                    this.uiDialogTitlebarCloseText.text('' + value);
                    break;
                case 'dialogClass':
                    uiDialog.removeClass(this.options.dialogClass).addClass(uiDialogClasses + value);
                    break;
                case 'disabled':
                    if (value) {
                        uiDialog.addClass('ui-dialog-disabled');
                    } else {
                        uiDialog.removeClass('ui-dialog-disabled');
                    }
                    break;
                case 'draggable':
                    isDraggable = uiDialog.is(':data(draggable)');
                    if (isDraggable && !value) {
                        uiDialog.draggable('destroy');
                    }
                    if (!isDraggable && value) {
                        this._makeDraggable();
                    }
                    break;
                case 'position':
                    this._position(value);
                    break;
                case 'resizable':
                    // currently resizable, becoming non-resizable
                    isResizable = uiDialog.is(':data(resizable)');
                    if (isResizable && !value) {
                        uiDialog.resizable('destroy');
                    }
                    // currently resizable, changing handles
                    if (isResizable && typeof value === 'string') {
                        uiDialog.resizable('option', 'handles', value);
                    }
                    // currently non-resizable, becoming resizable
                    if (!isResizable && value !== false) {
                        this._makeResizable(value);
                    }
                    break;
                case 'title':
                    // convert whatever was passed in o a string, for html() to not throw up
                    $('.ui-dialog-title', this.uiDialogTitlebar).html('' + (value || '&#160;'));
                    break;
                }
                this._super(key, value);
            },
            _size: function () {
                /* If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
		 * divs will both have width and height set, so we need to reset them
		 */
                var nonContentHeight, minContentHeight, autoHeight, options = this.options, isVisible = this.uiDialog.is(':visible');
                // reset content sizing
                this.element.show().css({
                    width: 'auto',
                    minHeight: 0,
                    height: 0
                });
                if (options.minWidth > options.width) {
                    options.width = options.minWidth;
                }
                // reset wrapper sizing
                // determine the height of all the non-content elements
                nonContentHeight = this.uiDialog.css({
                    height: 'auto',
                    width: options.width
                }).outerHeight();
                minContentHeight = Math.max(0, options.minHeight - nonContentHeight);
                if (options.height === 'auto') {
                    // only needed for IE6 support
                    if ($.support.minHeight) {
                        this.element.css({
                            minHeight: minContentHeight,
                            height: 'auto'
                        });
                    } else {
                        this.uiDialog.show();
                        autoHeight = this.element.css('height', 'auto').height();
                        if (!isVisible) {
                            this.uiDialog.hide();
                        }
                        this.element.height(Math.max(autoHeight, minContentHeight));
                    }
                } else {
                    this.element.height(Math.max(options.height - nonContentHeight, 0));
                }
                if (this.uiDialog.is(':data(resizable)')) {
                    this.uiDialog.resizable('option', 'minHeight', this._minHeight());
                }
            }
        });
        $.extend($.ui.dialog, {
            uuid: 0,
            maxZ: 0,
            getTitleId: function ($el) {
                var id = $el.attr('id');
                if (!id) {
                    this.uuid += 1;
                    id = this.uuid;
                }
                return 'ui-dialog-title-' + id;
            },
            overlay: function (dialog) {
                this.$el = $.ui.dialog.overlay.create(dialog);
            }
        });
        $.extend($.ui.dialog.overlay, {
            instances: [],
            // reuse old instances due to IE memory leak with alpha transparency (see #5185)
            oldInstances: [],
            maxZ: 0,
            events: $.map('focus,mousedown,mouseup,keydown,keypress,click'.split(','), function (event) {
                return event + '.dialog-overlay';
            }).join(' '),
            create: function (dialog) {
                if (this.instances.length === 0) {
                    // prevent use of anchors and inputs
                    // we use a setTimeout in case the overlay is created from an
                    // event that we're going to be cancelling (see #2804)
                    setTimeout(function () {
                        // handle $(el).dialog().dialog('close') (see #4065)
                        if ($.ui.dialog.overlay.instances.length) {
                            $(document).bind($.ui.dialog.overlay.events, function (event) {
                                // stop events if the z-index of the target is < the z-index of the overlay
                                // we cannot return true when we don't want to cancel the event (#3523)
                                if ($(event.target).zIndex() < $.ui.dialog.overlay.maxZ) {
                                    return false;
                                }
                            });
                        }
                    }, 1);
                    // handle window resize
                    $(window).bind('resize.dialog-overlay', $.ui.dialog.overlay.resize);
                }
                var $el = this.oldInstances.pop() || $('<div>').addClass('ui-widget-overlay');
                // allow closing by pressing the escape key
                $(document).bind('keydown.dialog-overlay', function (event) {
                    var instances = $.ui.dialog.overlay.instances;
                    // only react to the event if we're the top overlay
                    if (instances.length !== 0 && instances[instances.length - 1] === $el && dialog.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode && event.keyCode === $.ui.keyCode.ESCAPE) {
                        dialog.close(event);
                        event.preventDefault();
                    }
                });
                $el.appendTo(document.body).css({
                    width: this.width(),
                    height: this.height()
                });
                if ($.fn.bgiframe) {
                    $el.bgiframe();
                }
                this.instances.push($el);
                return $el;
            },
            destroy: function ($el) {
                var indexOf = $.inArray($el, this.instances), maxZ = 0;
                if (indexOf !== -1) {
                    this.oldInstances.push(this.instances.splice(indexOf, 1)[0]);
                }
                if (this.instances.length === 0) {
                    $([
                        document,
                        window
                    ]).unbind('.dialog-overlay');
                }
                $el.height(0).width(0).remove();
                // adjust the maxZ to allow other modal dialogs to continue to work (see #4309)
                $.each(this.instances, function () {
                    maxZ = Math.max(maxZ, this.css('z-index'));
                });
                this.maxZ = maxZ;
            },
            height: function () {
                var scrollHeight, offsetHeight;
                // handle IE
                if ($.ui.ie) {
                    scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
                    offsetHeight = Math.max(document.documentElement.offsetHeight, document.body.offsetHeight);
                    if (scrollHeight < offsetHeight) {
                        return $(window).height() + 'px';
                    } else {
                        return scrollHeight + 'px';
                    }    // handle "good" browsers
                } else {
                    return $(document).height() + 'px';
                }
            },
            width: function () {
                var scrollWidth, offsetWidth;
                // handle IE
                if ($.ui.ie) {
                    scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
                    offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);
                    if (scrollWidth < offsetWidth) {
                        return $(window).width() + 'px';
                    } else {
                        return scrollWidth + 'px';
                    }    // handle "good" browsers
                } else {
                    return $(document).width() + 'px';
                }
            },
            resize: function () {
                /* If the dialog is draggable and the user drags it past the
		 * right edge of the window, the document becomes wider so we
		 * need to stretch the overlay. If the user then drags the
		 * dialog back to the left, the document will become narrower,
		 * so we need to shrink the overlay to the appropriate size.
		 * This is handled by shrinking the overlay before setting it
		 * to the full document size.
		 */
                var $overlays = $([]);
                $.each($.ui.dialog.overlay.instances, function () {
                    $overlays = $overlays.add(this);
                });
                $overlays.css({
                    width: 0,
                    height: 0
                }).css({
                    width: $.ui.dialog.overlay.width(),
                    height: $.ui.dialog.overlay.height()
                });
            }
        });
        $.extend($.ui.dialog.overlay.prototype, {
            destroy: function () {
                $.ui.dialog.overlay.destroy(this.$el);
            }
        });
    }(jQuery));
    ;
    (function ($, undefined) {
        /*
 * jQuery UI dialogOptions v1.0
 * @desc extending jQuery Ui Dialog - Responsive, click outside, class handling
 * @author Jason Day
 *
 * Dependencies:
 *		jQuery: http://jquery.com/
 *		jQuery UI: http://jqueryui.com/
 *		Modernizr: http://modernizr.com/
 *
 * MIT license:
 *              http://www.opensource.org/licenses/mit-license.php
 *
 * (c) Jason Day 2014
 *
 * New Options:
 *  clickOut: true          // closes dialog when clicked outside
 *  responsive: true        // fluid width & height based on viewport
 *                          // true: always responsive
 *                          // false: never responsive
 *                          // "touch": only responsive on touch device
 *  scaleH: 0.8             // responsive scale height percentage, 0.8 = 80% of viewport
 *  scaleW: 0.8             // responsive scale width percentage, 0.8 = 80% of viewport
 *  showTitleBar: true      // false: hide titlebar
 *  showCloseButton: true   // false: hide close button
 *
 * Added functionality:
 *  add & remove dialogClass to .ui-widget-overlay for scoping styles
 *	patch for: http://bugs.jqueryui.com/ticket/4671
 *	recenter dialog - ajax loaded content
 */
        // add new options with default values
        $.ui.dialog.prototype.options.clickOut = true;
        $.ui.dialog.prototype.options.responsive = true;
        $.ui.dialog.prototype.options.scaleH = 0.8;
        $.ui.dialog.prototype.options.scaleW = 0.8;
        $.ui.dialog.prototype.options.showTitleBar = true;
        $.ui.dialog.prototype.options.showCloseButton = true;
        // extend _init
        var _init = $.ui.dialog.prototype._init;
        $.ui.dialog.prototype._init = function () {
            var self = this;
            // apply original arguments
            _init.apply(this, arguments);
            //patch
            if ($.ui && $.ui.dialog && $.ui.dialog.overlay) {
                $.ui.dialog.overlay.events = $.map('focus,keydown,keypress'.split(','), function (event) {
                    return event + '.dialog-overlay';
                }).join(' ');
            }
        };
        // end _init
        // extend open function
        var _open = $.ui.dialog.prototype.open;
        $.ui.dialog.prototype.open = function () {
            var self = this;
            // apply original arguments
            _open.apply(this, arguments);
            // get dialog original size on open
            var oHeight = self.element.parent().outerHeight(), oWidth = self.element.parent().outerWidth(), isTouch = $('html').hasClass('touch');
            // responsive width & height
            var resize = function () {
                // check if responsive
                // dependent on modernizr for device detection / html.touch
                if (self.options.responsive === true || self.options.responsive === 'touch' && isTouch) {
                    var elem = self.element, wHeight = $(window).height(), wWidth = $(window).width(), dHeight = elem.parent().outerHeight(), dWidth = elem.parent().outerWidth(), setHeight = Math.min(wHeight * self.options.scaleH, oHeight), setWidth = Math.min(wWidth * self.options.scaleW, oWidth);
                    // check & set height
                    if (oHeight + 100 > wHeight || elem.hasClass('resizedH')) {
                        elem.dialog('option', 'height', setHeight).parent().css('max-height', setHeight);
                        elem.addClass('resizedH');
                    }
                    // check & set width
                    if (oWidth + 100 > wWidth || elem.hasClass('resizedW')) {
                        elem.dialog('option', 'width', setWidth).parent().css('max-width', setWidth);
                        elem.addClass('resizedW');
                    }
                    // only recenter & add overflow if dialog has been resized
                    if (elem.hasClass('resizedH') || elem.hasClass('resizedW')) {
                        elem.dialog('option', 'position', 'center');
                        elem.css('overflow', 'auto');
                    }
                }
                // add webkit scrolling to all dialogs for touch devices
                if (isTouch) {
                    elem.css('-webkit-overflow-scrolling', 'touch');
                }
            };
            // call resize()
            resize();
            // resize on window resize
            $(window).on('resize', function () {
                resize();
            });
            // resize on orientation change
            if (window.addEventListener) {
                // Add extra condition because IE8 doesn't support addEventListener (or orientationchange)
                window.addEventListener('orientationchange', function () {
                    resize();
                });
            }
            // hide titlebar
            if (!self.options.showTitleBar) {
                self.uiDialogTitlebar.css({
                    'height': 0,
                    'padding': 0,
                    'background': 'none',
                    'border': 0
                });
                self.uiDialogTitlebar.find('.ui-dialog-title').css('display', 'none');
            }
            //hide close button
            if (!self.options.showCloseButton) {
                self.uiDialogTitlebar.find('.ui-dialog-titlebar-close').css('display', 'none');
            }
            // close on clickOut
            if (self.options.clickOut && !self.options.modal) {
                // use transparent div - simplest approach (rework)
                $('<div id="dialog-overlay"></div>').insertBefore(self.element.parent());
                $('#dialog-overlay').css({
                    'position': 'fixed',
                    'top': 0,
                    'right': 0,
                    'bottom': 0,
                    'left': 0,
                    'background-color': 'transparent'
                });
                $('#dialog-overlay').click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.close();
                });    // else close on modal click
            } else if (self.options.clickOut && self.options.modal) {
                $('.ui-widget-overlay').click(function (e) {
                    self.close();
                });
            }
            // add dialogClass to overlay
            if (self.options.dialogClass) {
                $('.ui-widget-overlay').addClass(self.options.dialogClass);
            }
        };
        //end open
        // extend close function
        var _close = $.ui.dialog.prototype.close;
        $.ui.dialog.prototype.close = function () {
            var self = this;
            // apply original arguments
            _close.apply(this, arguments);
            // remove dialogClass to overlay
            if (self.options.dialogClass) {
                $('.ui-widget-overlay').removeClass(self.options.dialogClass);
            }
            //remove clickOut overlay
            if ($('#dialog-overlay').length) {
                $('#dialog-overlay').remove();
            }
        };    //end close
    }(jQuery));
    ;
    (function (undefined) {
        /*
#
# Opentip v2.4.6
#
# More info at [www.opentip.org](http://www.opentip.org)
# 
# Copyright (c) 2012, Matias Meno  
# Graphics by Tjandra Mayerhold
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
*/
        var Opentip, firstAdapter, i, mouseMoved, mousePosition, mousePositionObservers, position, vendors, _i, _len, _ref, __slice = [].slice, __indexOf = [].indexOf || function (item) {
                for (var i = 0, l = this.length; i < l; i++) {
                    if (i in this && this[i] === item)
                        return i;
                }
                return -1;
            }, __hasProp = {}.hasOwnProperty;
        Opentip = function () {
            Opentip.prototype.STICKS_OUT_TOP = 1;
            Opentip.prototype.STICKS_OUT_BOTTOM = 2;
            Opentip.prototype.STICKS_OUT_LEFT = 1;
            Opentip.prototype.STICKS_OUT_RIGHT = 2;
            Opentip.prototype['class'] = {
                container: 'opentip-container',
                opentip: 'opentip',
                header: 'ot-header',
                content: 'ot-content',
                loadingIndicator: 'ot-loading-indicator',
                close: 'ot-close',
                goingToHide: 'ot-going-to-hide',
                hidden: 'ot-hidden',
                hiding: 'ot-hiding',
                goingToShow: 'ot-going-to-show',
                showing: 'ot-showing',
                visible: 'ot-visible',
                loading: 'ot-loading',
                ajaxError: 'ot-ajax-error',
                fixed: 'ot-fixed',
                showEffectPrefix: 'ot-show-effect-',
                hideEffectPrefix: 'ot-hide-effect-',
                stylePrefix: 'style-'
            };
            function Opentip(element, content, title, options) {
                var elementsOpentips, hideTrigger, methodToBind, optionSources, prop, styleName, _i, _j, _len, _len1, _ref, _ref1, _ref2, _tmpStyle, _this = this;
                this.id = ++Opentip.lastId;
                this.debug('Creating Opentip.');
                Opentip.tips.push(this);
                this.adapter = Opentip.adapter;
                elementsOpentips = this.adapter.data(element, 'opentips') || [];
                elementsOpentips.push(this);
                this.adapter.data(element, 'opentips', elementsOpentips);
                this.triggerElement = this.adapter.wrap(element);
                if (this.triggerElement.length > 1) {
                    throw new Error('You can\'t call Opentip on multiple elements.');
                }
                if (this.triggerElement.length < 1) {
                    throw new Error('Invalid element.');
                }
                this.loaded = false;
                this.loading = false;
                this.visible = false;
                this.waitingToShow = false;
                this.waitingToHide = false;
                this.currentPosition = {
                    left: 0,
                    top: 0
                };
                this.dimensions = {
                    width: 100,
                    height: 50
                };
                this.content = '';
                this.redraw = true;
                this.currentObservers = {
                    showing: false,
                    visible: false,
                    hiding: false,
                    hidden: false
                };
                options = this.adapter.clone(options);
                if (typeof content === 'object') {
                    options = content;
                    content = title = void 0;
                } else if (typeof title === 'object') {
                    options = title;
                    title = void 0;
                }
                if (title != null) {
                    options.title = title;
                }
                if (content != null) {
                    this.setContent(content);
                }
                if (options['extends'] == null) {
                    if (options.style != null) {
                        options['extends'] = options.style;
                    } else {
                        options['extends'] = Opentip.defaultStyle;
                    }
                }
                optionSources = [options];
                _tmpStyle = options;
                while (_tmpStyle['extends']) {
                    styleName = _tmpStyle['extends'];
                    _tmpStyle = Opentip.styles[styleName];
                    if (_tmpStyle == null) {
                        throw new Error('Invalid style: ' + styleName);
                    }
                    optionSources.unshift(_tmpStyle);
                    if (!(_tmpStyle['extends'] != null || styleName === 'standard')) {
                        _tmpStyle['extends'] = 'standard';
                    }
                }
                options = (_ref = this.adapter).extend.apply(_ref, [{}].concat(__slice.call(optionSources)));
                options.hideTriggers = function () {
                    var _i, _len, _ref1, _results;
                    _ref1 = options.hideTriggers;
                    _results = [];
                    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                        hideTrigger = _ref1[_i];
                        _results.push(hideTrigger);
                    }
                    return _results;
                }();
                if (options.hideTrigger && options.hideTriggers.length === 0) {
                    options.hideTriggers.push(options.hideTrigger);
                }
                _ref1 = [
                    'tipJoint',
                    'targetJoint',
                    'stem'
                ];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    prop = _ref1[_i];
                    if (options[prop] && typeof options[prop] === 'string') {
                        options[prop] = new Opentip.Joint(options[prop]);
                    }
                }
                if (options.ajax && (options.ajax === true || !options.ajax)) {
                    if (this.adapter.tagName(this.triggerElement) === 'A') {
                        options.ajax = this.adapter.attr(this.triggerElement, 'href');
                    } else {
                        options.ajax = false;
                    }
                }
                if (options.showOn === 'click' && this.adapter.tagName(this.triggerElement) === 'A') {
                    this.adapter.observe(this.triggerElement, 'click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        return e.stopped = true;
                    });
                }
                if (options.target) {
                    options.fixed = true;
                }
                if (options.stem === true) {
                    options.stem = new Opentip.Joint(options.tipJoint);
                }
                if (options.target === true) {
                    options.target = this.triggerElement;
                } else if (options.target) {
                    options.target = this.adapter.wrap(options.target);
                }
                this.currentStem = options.stem;
                if (options.delay == null) {
                    options.delay = options.showOn === 'mouseover' ? 0.2 : 0;
                }
                if (options.targetJoint == null) {
                    options.targetJoint = new Opentip.Joint(options.tipJoint).flip();
                }
                this.showTriggers = [];
                this.showTriggersWhenVisible = [];
                this.hideTriggers = [];
                if (options.showOn && options.showOn !== 'creation') {
                    this.showTriggers.push({
                        element: this.triggerElement,
                        event: options.showOn
                    });
                }
                if (options.ajaxCache != null) {
                    options.cache = options.ajaxCache;
                    delete options.ajaxCache;
                }
                this.options = options;
                this.bound = {};
                _ref2 = [
                    'prepareToShow',
                    'prepareToHide',
                    'show',
                    'hide',
                    'reposition'
                ];
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                    methodToBind = _ref2[_j];
                    this.bound[methodToBind] = function (methodToBind) {
                        return function () {
                            return _this[methodToBind].apply(_this, arguments);
                        };
                    }(methodToBind);
                }
                this.adapter.domReady(function () {
                    _this.activate();
                    if (_this.options.showOn === 'creation') {
                        return _this.prepareToShow();
                    }
                });
            }
            Opentip.prototype._setup = function () {
                var hideOn, hideTrigger, hideTriggerElement, i, _i, _j, _len, _len1, _ref, _ref1, _results;
                this.debug('Setting up the tooltip.');
                this._buildContainer();
                this.hideTriggers = [];
                _ref = this.options.hideTriggers;
                for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                    hideTrigger = _ref[i];
                    hideTriggerElement = null;
                    hideOn = this.options.hideOn instanceof Array ? this.options.hideOn[i] : this.options.hideOn;
                    if (typeof hideTrigger === 'string') {
                        switch (hideTrigger) {
                        case 'trigger':
                            hideOn = hideOn || 'mouseout';
                            hideTriggerElement = this.triggerElement;
                            break;
                        case 'tip':
                            hideOn = hideOn || 'mouseover';
                            hideTriggerElement = this.container;
                            break;
                        case 'target':
                            hideOn = hideOn || 'mouseover';
                            hideTriggerElement = this.options.target;
                            break;
                        case 'closeButton':
                            break;
                        default:
                            throw new Error('Unknown hide trigger: ' + hideTrigger + '.');
                        }
                    } else {
                        hideOn = hideOn || 'mouseover';
                        hideTriggerElement = this.adapter.wrap(hideTrigger);
                    }
                    if (hideTriggerElement) {
                        this.hideTriggers.push({
                            element: hideTriggerElement,
                            event: hideOn,
                            original: hideTrigger
                        });
                    }
                }
                _ref1 = this.hideTriggers;
                _results = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    hideTrigger = _ref1[_j];
                    _results.push(this.showTriggersWhenVisible.push({
                        element: hideTrigger.element,
                        event: 'mouseover'
                    }));
                }
                return _results;
            };
            Opentip.prototype._buildContainer = function () {
                this.container = this.adapter.create('<div id="opentip-' + this.id + '" class="' + this['class'].container + ' ' + this['class'].hidden + ' ' + this['class'].stylePrefix + this.options.className + '"></div>');
                this.adapter.css(this.container, { position: 'absolute' });
                if (this.options.ajax) {
                    this.adapter.addClass(this.container, this['class'].loading);
                }
                if (this.options.fixed) {
                    this.adapter.addClass(this.container, this['class'].fixed);
                }
                if (this.options.showEffect) {
                    this.adapter.addClass(this.container, '' + this['class'].showEffectPrefix + this.options.showEffect);
                }
                if (this.options.hideEffect) {
                    return this.adapter.addClass(this.container, '' + this['class'].hideEffectPrefix + this.options.hideEffect);
                }
            };
            Opentip.prototype._buildElements = function () {
                var headerElement, titleElement;
                this.tooltipElement = this.adapter.create('<div class="' + this['class'].opentip + '"><div class="' + this['class'].header + '"></div><div class="' + this['class'].content + '"></div></div>');
                this.backgroundCanvas = this.adapter.wrap(document.createElement('canvas'));
                this.adapter.css(this.backgroundCanvas, { position: 'absolute' });
                if (typeof G_vmlCanvasManager !== 'undefined' && G_vmlCanvasManager !== null) {
                    G_vmlCanvasManager.initElement(this.adapter.unwrap(this.backgroundCanvas));
                }
                headerElement = this.adapter.find(this.tooltipElement, '.' + this['class'].header);
                if (this.options.title) {
                    titleElement = this.adapter.create('<h1></h1>');
                    this.adapter.update(titleElement, this.options.title, this.options.escapeTitle);
                    this.adapter.append(headerElement, titleElement);
                }
                if (this.options.ajax && !this.loaded) {
                    this.adapter.append(this.tooltipElement, this.adapter.create('<div class="' + this['class'].loadingIndicator + '"><span>\u21BB</span></div>'));
                }
                if (__indexOf.call(this.options.hideTriggers, 'closeButton') >= 0) {
                    this.closeButtonElement = this.adapter.create('<a href="javascript:undefined;" class="' + this['class'].close + '"><span>Close</span></a>');
                    this.adapter.append(headerElement, this.closeButtonElement);
                }
                this.adapter.append(this.container, this.backgroundCanvas);
                this.adapter.append(this.container, this.tooltipElement);
                this.adapter.append(document.body, this.container);
                this._newContent = true;
                return this.redraw = true;
            };
            Opentip.prototype.setContent = function (content) {
                this.content = content;
                this._newContent = true;
                if (typeof this.content === 'function') {
                    this._contentFunction = this.content;
                    this.content = '';
                } else {
                    this._contentFunction = null;
                }
                if (this.visible) {
                    return this._updateElementContent();
                }
            };
            Opentip.prototype._updateElementContent = function () {
                var contentDiv;
                if (this._newContent || !this.options.cache && this._contentFunction) {
                    contentDiv = this.adapter.find(this.container, '.' + this['class'].content);
                    if (contentDiv != null) {
                        if (this._contentFunction) {
                            this.debug('Executing content function.');
                            this.content = this._contentFunction(this);
                        }
                        this.adapter.update(contentDiv, this.content, this.options.escapeContent);
                    }
                    this._newContent = false;
                }
                this._storeAndLockDimensions();
                return this.reposition();
            };
            Opentip.prototype._storeAndLockDimensions = function () {
                var prevDimension;
                if (!this.container) {
                    return;
                }
                prevDimension = this.dimensions;
                this.adapter.css(this.container, {
                    width: 'auto',
                    left: '0px',
                    top: '0px'
                });
                this.dimensions = this.adapter.dimensions(this.container);
                this.dimensions.width += 1;
                this.adapter.css(this.container, {
                    width: '' + this.dimensions.width + 'px',
                    top: '' + this.currentPosition.top + 'px',
                    left: '' + this.currentPosition.left + 'px'
                });
                if (!this._dimensionsEqual(this.dimensions, prevDimension)) {
                    this.redraw = true;
                    return this._draw();
                }
            };
            Opentip.prototype.activate = function () {
                return this._setupObservers('hidden', 'hiding');
            };
            Opentip.prototype.deactivate = function () {
                this.debug('Deactivating tooltip.');
                this.hide();
                return this._setupObservers('-showing', '-visible', '-hidden', '-hiding');
            };
            Opentip.prototype._setupObservers = function () {
                var observeOrStop, removeObserver, state, states, trigger, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _this = this;
                states = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                for (_i = 0, _len = states.length; _i < _len; _i++) {
                    state = states[_i];
                    removeObserver = false;
                    if (state.charAt(0) === '-') {
                        removeObserver = true;
                        state = state.substr(1);
                    }
                    if (this.currentObservers[state] === !removeObserver) {
                        continue;
                    }
                    this.currentObservers[state] = !removeObserver;
                    observeOrStop = function () {
                        var args, _ref, _ref1;
                        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                        if (removeObserver) {
                            return (_ref = _this.adapter).stopObserving.apply(_ref, args);
                        } else {
                            return (_ref1 = _this.adapter).observe.apply(_ref1, args);
                        }
                    };
                    switch (state) {
                    case 'showing':
                        _ref = this.hideTriggers;
                        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                            trigger = _ref[_j];
                            observeOrStop(trigger.element, trigger.event, this.bound.prepareToHide);
                        }
                        observeOrStop(document.onresize != null ? document : window, 'resize', this.bound.reposition);
                        observeOrStop(window, 'scroll', this.bound.reposition);
                        break;
                    case 'visible':
                        _ref1 = this.showTriggersWhenVisible;
                        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                            trigger = _ref1[_k];
                            observeOrStop(trigger.element, trigger.event, this.bound.prepareToShow);
                        }
                        break;
                    case 'hiding':
                        _ref2 = this.showTriggers;
                        for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
                            trigger = _ref2[_l];
                            observeOrStop(trigger.element, trigger.event, this.bound.prepareToShow);
                        }
                        break;
                    case 'hidden':
                        break;
                    default:
                        throw new Error('Unknown state: ' + state);
                    }
                }
                return null;
            };
            Opentip.prototype.prepareToShow = function () {
                this._abortHiding();
                this._abortShowing();
                if (this.visible) {
                    return;
                }
                this.debug('Showing in ' + this.options.delay + 's.');
                if (this.container == null) {
                    this._setup();
                }
                if (this.options.group) {
                    Opentip._abortShowingGroup(this.options.group, this);
                }
                this.preparingToShow = true;
                this._setupObservers('-hidden', '-hiding', 'showing');
                this._followMousePosition();
                if (this.options.fixed && !this.options.target) {
                    this.initialMousePosition = mousePosition;
                }
                this.reposition();
                return this._showTimeoutId = this.setTimeout(this.bound.show, this.options.delay || 0);
            };
            Opentip.prototype.show = function () {
                var _this = this;
                this._abortHiding();
                if (this.visible) {
                    return;
                }
                this._clearTimeouts();
                if (!this._triggerElementExists()) {
                    return this.deactivate();
                }
                this.debug('Showing now.');
                if (this.container == null) {
                    this._setup();
                }
                if (this.options.group) {
                    Opentip._hideGroup(this.options.group, this);
                }
                this.visible = true;
                this.preparingToShow = false;
                if (this.tooltipElement == null) {
                    this._buildElements();
                }
                this._updateElementContent();
                if (this.options.ajax && (!this.loaded || !this.options.cache)) {
                    this._loadAjax();
                }
                this._searchAndActivateCloseButtons();
                this._startEnsureTriggerElement();
                this.adapter.css(this.container, { zIndex: Opentip.lastZIndex++ });
                this._setupObservers('-hidden', '-hiding', '-showing', '-visible', 'showing', 'visible');
                if (this.options.fixed && !this.options.target) {
                    this.initialMousePosition = mousePosition;
                }
                this.reposition();
                this.adapter.removeClass(this.container, this['class'].hiding);
                this.adapter.removeClass(this.container, this['class'].hidden);
                this.adapter.addClass(this.container, this['class'].goingToShow);
                this.setCss3Style(this.container, { transitionDuration: '0s' });
                this.defer(function () {
                    var delay;
                    if (!_this.visible || _this.preparingToHide) {
                        return;
                    }
                    _this.adapter.removeClass(_this.container, _this['class'].goingToShow);
                    _this.adapter.addClass(_this.container, _this['class'].showing);
                    delay = 0;
                    if (_this.options.showEffect && _this.options.showEffectDuration) {
                        delay = _this.options.showEffectDuration;
                    }
                    _this.setCss3Style(_this.container, { transitionDuration: '' + delay + 's' });
                    _this._visibilityStateTimeoutId = _this.setTimeout(function () {
                        _this.adapter.removeClass(_this.container, _this['class'].showing);
                        return _this.adapter.addClass(_this.container, _this['class'].visible);
                    }, delay);
                    return _this._activateFirstInput();
                });
                return this._draw();
            };
            Opentip.prototype._abortShowing = function () {
                if (this.preparingToShow) {
                    this.debug('Aborting showing.');
                    this._clearTimeouts();
                    this._stopFollowingMousePosition();
                    this.preparingToShow = false;
                    return this._setupObservers('-showing', '-visible', 'hiding', 'hidden');
                }
            };
            Opentip.prototype.prepareToHide = function () {
                this._abortShowing();
                this._abortHiding();
                if (!this.visible) {
                    return;
                }
                this.debug('Hiding in ' + this.options.hideDelay + 's');
                this.preparingToHide = true;
                this._setupObservers('-showing', 'visible', '-hidden', 'hiding');
                return this._hideTimeoutId = this.setTimeout(this.bound.hide, this.options.hideDelay);
            };
            Opentip.prototype.hide = function () {
                var _this = this;
                this._abortShowing();
                if (!this.visible) {
                    return;
                }
                this._clearTimeouts();
                this.debug('Hiding!');
                this.visible = false;
                this.preparingToHide = false;
                this._stopEnsureTriggerElement();
                this._setupObservers('-showing', '-visible', '-hiding', '-hidden', 'hiding', 'hidden');
                if (!this.options.fixed) {
                    this._stopFollowingMousePosition();
                }
                if (!this.container) {
                    return;
                }
                this.adapter.removeClass(this.container, this['class'].visible);
                this.adapter.removeClass(this.container, this['class'].showing);
                this.adapter.addClass(this.container, this['class'].goingToHide);
                this.setCss3Style(this.container, { transitionDuration: '0s' });
                return this.defer(function () {
                    var hideDelay;
                    _this.adapter.removeClass(_this.container, _this['class'].goingToHide);
                    _this.adapter.addClass(_this.container, _this['class'].hiding);
                    hideDelay = 0;
                    if (_this.options.hideEffect && _this.options.hideEffectDuration) {
                        hideDelay = _this.options.hideEffectDuration;
                    }
                    _this.setCss3Style(_this.container, { transitionDuration: '' + hideDelay + 's' });
                    return _this._visibilityStateTimeoutId = _this.setTimeout(function () {
                        _this.adapter.removeClass(_this.container, _this['class'].hiding);
                        _this.adapter.addClass(_this.container, _this['class'].hidden);
                        _this.setCss3Style(_this.container, { transitionDuration: '0s' });
                        if (_this.options.removeElementsOnHide) {
                            _this.debug('Removing HTML elements.');
                            _this.adapter.remove(_this.container);
                            delete _this.container;
                            return delete _this.tooltipElement;
                        }
                    }, hideDelay);
                });
            };
            Opentip.prototype._abortHiding = function () {
                if (this.preparingToHide) {
                    this.debug('Aborting hiding.');
                    this._clearTimeouts();
                    this.preparingToHide = false;
                    return this._setupObservers('-hiding', 'showing', 'visible');
                }
            };
            Opentip.prototype.reposition = function () {
                var position, stem, _ref, _this = this;
                position = this.getPosition();
                if (position == null) {
                    return;
                }
                stem = this.options.stem;
                if (this.options.containInViewport) {
                    _ref = this._ensureViewportContainment(position), position = _ref.position, stem = _ref.stem;
                }
                if (this._positionsEqual(position, this.currentPosition)) {
                    return;
                }
                if (!(!this.options.stem || stem.eql(this.currentStem))) {
                    this.redraw = true;
                }
                this.currentPosition = position;
                this.currentStem = stem;
                this._draw();
                this.adapter.css(this.container, {
                    left: '' + position.left + 'px',
                    top: '' + position.top + 'px'
                });
                return this.defer(function () {
                    var rawContainer, redrawFix;
                    rawContainer = _this.adapter.unwrap(_this.container);
                    rawContainer.style.visibility = 'hidden';
                    redrawFix = rawContainer.offsetHeight;
                    return rawContainer.style.visibility = 'visible';
                });
            };
            Opentip.prototype.getPosition = function (tipJoint, targetJoint, stem) {
                var additionalHorizontal, additionalVertical, offsetDistance, position, stemLength, targetDimensions, targetPosition, unwrappedTarget, _ref;
                if (!this.container) {
                    return;
                }
                if (tipJoint == null) {
                    tipJoint = this.options.tipJoint;
                }
                if (targetJoint == null) {
                    targetJoint = this.options.targetJoint;
                }
                position = {};
                if (this.options.target) {
                    targetPosition = this.adapter.offset(this.options.target);
                    targetDimensions = this.adapter.dimensions(this.options.target);
                    position = targetPosition;
                    if (targetJoint.right) {
                        unwrappedTarget = this.adapter.unwrap(this.options.target);
                        if (unwrappedTarget.getBoundingClientRect != null) {
                            position.left = unwrappedTarget.getBoundingClientRect().right + ((_ref = window.pageXOffset) != null ? _ref : document.body.scrollLeft);
                        } else {
                            position.left += targetDimensions.width;
                        }
                    } else if (targetJoint.center) {
                        position.left += Math.round(targetDimensions.width / 2);
                    }
                    if (targetJoint.bottom) {
                        position.top += targetDimensions.height;
                    } else if (targetJoint.middle) {
                        position.top += Math.round(targetDimensions.height / 2);
                    }
                    if (this.options.borderWidth) {
                        if (this.options.tipJoint.left) {
                            position.left += this.options.borderWidth;
                        }
                        if (this.options.tipJoint.right) {
                            position.left -= this.options.borderWidth;
                        }
                        if (this.options.tipJoint.top) {
                            position.top += this.options.borderWidth;
                        } else if (this.options.tipJoint.bottom) {
                            position.top -= this.options.borderWidth;
                        }
                    }
                } else {
                    if (this.initialMousePosition) {
                        position = {
                            top: this.initialMousePosition.y,
                            left: this.initialMousePosition.x
                        };
                    } else {
                        position = {
                            top: mousePosition.y,
                            left: mousePosition.x
                        };
                    }
                }
                if (this.options.autoOffset) {
                    stemLength = this.options.stem ? this.options.stemLength : 0;
                    offsetDistance = stemLength && this.options.fixed ? 2 : 10;
                    additionalHorizontal = tipJoint.middle && !this.options.fixed ? 15 : 0;
                    additionalVertical = tipJoint.center && !this.options.fixed ? 15 : 0;
                    if (tipJoint.right) {
                        position.left -= offsetDistance + additionalHorizontal;
                    } else if (tipJoint.left) {
                        position.left += offsetDistance + additionalHorizontal;
                    }
                    if (tipJoint.bottom) {
                        position.top -= offsetDistance + additionalVertical;
                    } else if (tipJoint.top) {
                        position.top += offsetDistance + additionalVertical;
                    }
                    if (stemLength) {
                        if (stem == null) {
                            stem = this.options.stem;
                        }
                        if (stem.right) {
                            position.left -= stemLength;
                        } else if (stem.left) {
                            position.left += stemLength;
                        }
                        if (stem.bottom) {
                            position.top -= stemLength;
                        } else if (stem.top) {
                            position.top += stemLength;
                        }
                    }
                }
                position.left += this.options.offset[0];
                position.top += this.options.offset[1];
                if (tipJoint.right) {
                    position.left -= this.dimensions.width;
                } else if (tipJoint.center) {
                    position.left -= Math.round(this.dimensions.width / 2);
                }
                if (tipJoint.bottom) {
                    position.top -= this.dimensions.height;
                } else if (tipJoint.middle) {
                    position.top -= Math.round(this.dimensions.height / 2);
                }
                return position;
            };
            Opentip.prototype._ensureViewportContainment = function (position) {
                var needsRepositioning, newSticksOut, originals, revertedX, revertedY, scrollOffset, stem, sticksOut, targetJoint, tipJoint, viewportDimensions, viewportPosition;
                stem = this.options.stem;
                originals = {
                    position: position,
                    stem: stem
                };
                if (!(this.visible && position)) {
                    return originals;
                }
                sticksOut = this._sticksOut(position);
                if (!(sticksOut[0] || sticksOut[1])) {
                    return originals;
                }
                tipJoint = new Opentip.Joint(this.options.tipJoint);
                if (this.options.targetJoint) {
                    targetJoint = new Opentip.Joint(this.options.targetJoint);
                }
                scrollOffset = this.adapter.scrollOffset();
                viewportDimensions = this.adapter.viewportDimensions();
                viewportPosition = [
                    position.left - scrollOffset[0],
                    position.top - scrollOffset[1]
                ];
                needsRepositioning = false;
                if (viewportDimensions.width >= this.dimensions.width) {
                    if (sticksOut[0]) {
                        needsRepositioning = true;
                        switch (sticksOut[0]) {
                        case this.STICKS_OUT_LEFT:
                            tipJoint.setHorizontal('left');
                            if (this.options.targetJoint) {
                                targetJoint.setHorizontal('right');
                            }
                            break;
                        case this.STICKS_OUT_RIGHT:
                            tipJoint.setHorizontal('right');
                            if (this.options.targetJoint) {
                                targetJoint.setHorizontal('left');
                            }
                        }
                    }
                }
                if (viewportDimensions.height >= this.dimensions.height) {
                    if (sticksOut[1]) {
                        needsRepositioning = true;
                        switch (sticksOut[1]) {
                        case this.STICKS_OUT_TOP:
                            tipJoint.setVertical('top');
                            if (this.options.targetJoint) {
                                targetJoint.setVertical('bottom');
                            }
                            break;
                        case this.STICKS_OUT_BOTTOM:
                            tipJoint.setVertical('bottom');
                            if (this.options.targetJoint) {
                                targetJoint.setVertical('top');
                            }
                        }
                    }
                }
                if (!needsRepositioning) {
                    return originals;
                }
                if (this.options.stem) {
                    stem = tipJoint;
                }
                position = this.getPosition(tipJoint, targetJoint, stem);
                newSticksOut = this._sticksOut(position);
                revertedX = false;
                revertedY = false;
                if (newSticksOut[0] && newSticksOut[0] !== sticksOut[0]) {
                    revertedX = true;
                    tipJoint.setHorizontal(this.options.tipJoint.horizontal);
                    if (this.options.targetJoint) {
                        targetJoint.setHorizontal(this.options.targetJoint.horizontal);
                    }
                }
                if (newSticksOut[1] && newSticksOut[1] !== sticksOut[1]) {
                    revertedY = true;
                    tipJoint.setVertical(this.options.tipJoint.vertical);
                    if (this.options.targetJoint) {
                        targetJoint.setVertical(this.options.targetJoint.vertical);
                    }
                }
                if (revertedX && revertedY) {
                    return originals;
                }
                if (revertedX || revertedY) {
                    if (this.options.stem) {
                        stem = tipJoint;
                    }
                    position = this.getPosition(tipJoint, targetJoint, stem);
                }
                return {
                    position: position,
                    stem: stem
                };
            };
            Opentip.prototype._sticksOut = function (position) {
                var positionOffset, scrollOffset, sticksOut, viewportDimensions;
                scrollOffset = this.adapter.scrollOffset();
                viewportDimensions = this.adapter.viewportDimensions();
                positionOffset = [
                    position.left - scrollOffset[0],
                    position.top - scrollOffset[1]
                ];
                sticksOut = [
                    false,
                    false
                ];
                if (positionOffset[0] < 0) {
                    sticksOut[0] = this.STICKS_OUT_LEFT;
                } else if (positionOffset[0] + this.dimensions.width > viewportDimensions.width) {
                    sticksOut[0] = this.STICKS_OUT_RIGHT;
                }
                if (positionOffset[1] < 0) {
                    sticksOut[1] = this.STICKS_OUT_TOP;
                } else if (positionOffset[1] + this.dimensions.height > viewportDimensions.height) {
                    sticksOut[1] = this.STICKS_OUT_BOTTOM;
                }
                return sticksOut;
            };
            Opentip.prototype._draw = function () {
                var backgroundCanvas, bulge, canvasDimensions, canvasPosition, closeButton, closeButtonInner, closeButtonOuter, ctx, drawCorner, drawLine, hb, position, stemBase, stemLength, _i, _len, _ref, _ref1, _ref2, _this = this;
                if (!(this.backgroundCanvas && this.redraw)) {
                    return;
                }
                this.debug('Drawing background.');
                this.redraw = false;
                if (this.currentStem) {
                    _ref = [
                        'top',
                        'right',
                        'bottom',
                        'left'
                    ];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        position = _ref[_i];
                        this.adapter.removeClass(this.container, 'stem-' + position);
                    }
                    this.adapter.addClass(this.container, 'stem-' + this.currentStem.horizontal);
                    this.adapter.addClass(this.container, 'stem-' + this.currentStem.vertical);
                }
                closeButtonInner = [
                    0,
                    0
                ];
                closeButtonOuter = [
                    0,
                    0
                ];
                if (__indexOf.call(this.options.hideTriggers, 'closeButton') >= 0) {
                    closeButton = new Opentip.Joint(((_ref1 = this.currentStem) != null ? _ref1.toString() : void 0) === 'top right' ? 'top left' : 'top right');
                    closeButtonInner = [
                        this.options.closeButtonRadius + this.options.closeButtonOffset[0],
                        this.options.closeButtonRadius + this.options.closeButtonOffset[1]
                    ];
                    closeButtonOuter = [
                        this.options.closeButtonRadius - this.options.closeButtonOffset[0],
                        this.options.closeButtonRadius - this.options.closeButtonOffset[1]
                    ];
                }
                canvasDimensions = this.adapter.clone(this.dimensions);
                canvasPosition = [
                    0,
                    0
                ];
                if (this.options.borderWidth) {
                    canvasDimensions.width += this.options.borderWidth * 2;
                    canvasDimensions.height += this.options.borderWidth * 2;
                    canvasPosition[0] -= this.options.borderWidth;
                    canvasPosition[1] -= this.options.borderWidth;
                }
                if (this.options.shadow) {
                    canvasDimensions.width += this.options.shadowBlur * 2;
                    canvasDimensions.width += Math.max(0, this.options.shadowOffset[0] - this.options.shadowBlur * 2);
                    canvasDimensions.height += this.options.shadowBlur * 2;
                    canvasDimensions.height += Math.max(0, this.options.shadowOffset[1] - this.options.shadowBlur * 2);
                    canvasPosition[0] -= Math.max(0, this.options.shadowBlur - this.options.shadowOffset[0]);
                    canvasPosition[1] -= Math.max(0, this.options.shadowBlur - this.options.shadowOffset[1]);
                }
                bulge = {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                };
                if (this.currentStem) {
                    if (this.currentStem.left) {
                        bulge.left = this.options.stemLength;
                    } else if (this.currentStem.right) {
                        bulge.right = this.options.stemLength;
                    }
                    if (this.currentStem.top) {
                        bulge.top = this.options.stemLength;
                    } else if (this.currentStem.bottom) {
                        bulge.bottom = this.options.stemLength;
                    }
                }
                if (closeButton) {
                    if (closeButton.left) {
                        bulge.left = Math.max(bulge.left, closeButtonOuter[0]);
                    } else if (closeButton.right) {
                        bulge.right = Math.max(bulge.right, closeButtonOuter[0]);
                    }
                    if (closeButton.top) {
                        bulge.top = Math.max(bulge.top, closeButtonOuter[1]);
                    } else if (closeButton.bottom) {
                        bulge.bottom = Math.max(bulge.bottom, closeButtonOuter[1]);
                    }
                }
                canvasDimensions.width += bulge.left + bulge.right;
                canvasDimensions.height += bulge.top + bulge.bottom;
                canvasPosition[0] -= bulge.left;
                canvasPosition[1] -= bulge.top;
                if (this.currentStem && this.options.borderWidth) {
                    _ref2 = this._getPathStemMeasures(this.options.stemBase, this.options.stemLength, this.options.borderWidth), stemLength = _ref2.stemLength, stemBase = _ref2.stemBase;
                }
                backgroundCanvas = this.adapter.unwrap(this.backgroundCanvas);
                backgroundCanvas.width = canvasDimensions.width;
                backgroundCanvas.height = canvasDimensions.height;
                this.adapter.css(this.backgroundCanvas, {
                    width: '' + backgroundCanvas.width + 'px',
                    height: '' + backgroundCanvas.height + 'px',
                    left: '' + canvasPosition[0] + 'px',
                    top: '' + canvasPosition[1] + 'px'
                });
                ctx = backgroundCanvas.getContext('2d');
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
                ctx.beginPath();
                ctx.fillStyle = this._getColor(ctx, this.dimensions, this.options.background, this.options.backgroundGradientHorizontal);
                ctx.lineJoin = 'miter';
                ctx.miterLimit = 500;
                hb = this.options.borderWidth / 2;
                if (this.options.borderWidth) {
                    ctx.strokeStyle = this.options.borderColor;
                    ctx.lineWidth = this.options.borderWidth;
                } else {
                    stemLength = this.options.stemLength;
                    stemBase = this.options.stemBase;
                }
                if (stemBase == null) {
                    stemBase = 0;
                }
                drawLine = function (length, stem, first) {
                    if (first) {
                        ctx.moveTo(Math.max(stemBase, _this.options.borderRadius, closeButtonInner[0]) + 1 - hb, -hb);
                    }
                    if (stem) {
                        ctx.lineTo(length / 2 - stemBase / 2, -hb);
                        ctx.lineTo(length / 2, -stemLength - hb);
                        return ctx.lineTo(length / 2 + stemBase / 2, -hb);
                    }
                };
                drawCorner = function (stem, closeButton, i) {
                    var angle1, angle2, innerWidth, offset;
                    if (stem) {
                        ctx.lineTo(-stemBase + hb, 0 - hb);
                        ctx.lineTo(stemLength + hb, -stemLength - hb);
                        return ctx.lineTo(hb, stemBase - hb);
                    } else if (closeButton) {
                        offset = _this.options.closeButtonOffset;
                        innerWidth = closeButtonInner[0];
                        if (i % 2 !== 0) {
                            offset = [
                                offset[1],
                                offset[0]
                            ];
                            innerWidth = closeButtonInner[1];
                        }
                        angle1 = Math.acos(offset[1] / _this.options.closeButtonRadius);
                        angle2 = Math.acos(offset[0] / _this.options.closeButtonRadius);
                        ctx.lineTo(-innerWidth + hb, -hb);
                        return ctx.arc(hb - offset[0], -hb + offset[1], _this.options.closeButtonRadius, -(Math.PI / 2 + angle1), angle2, false);
                    } else {
                        ctx.lineTo(-_this.options.borderRadius + hb, -hb);
                        return ctx.quadraticCurveTo(hb, -hb, hb, _this.options.borderRadius - hb);
                    }
                };
                ctx.translate(-canvasPosition[0], -canvasPosition[1]);
                ctx.save();
                (function () {
                    var cornerStem, i, lineLength, lineStem, positionIdx, positionX, positionY, rotation, _j, _ref3, _results;
                    _results = [];
                    for (i = _j = 0, _ref3 = Opentip.positions.length / 2; 0 <= _ref3 ? _j < _ref3 : _j > _ref3; i = 0 <= _ref3 ? ++_j : --_j) {
                        positionIdx = i * 2;
                        positionX = i === 0 || i === 3 ? 0 : _this.dimensions.width;
                        positionY = i < 2 ? 0 : _this.dimensions.height;
                        rotation = Math.PI / 2 * i;
                        lineLength = i % 2 === 0 ? _this.dimensions.width : _this.dimensions.height;
                        lineStem = new Opentip.Joint(Opentip.positions[positionIdx]);
                        cornerStem = new Opentip.Joint(Opentip.positions[positionIdx + 1]);
                        ctx.save();
                        ctx.translate(positionX, positionY);
                        ctx.rotate(rotation);
                        drawLine(lineLength, lineStem.eql(_this.currentStem), i === 0);
                        ctx.translate(lineLength, 0);
                        drawCorner(cornerStem.eql(_this.currentStem), cornerStem.eql(closeButton), i);
                        _results.push(ctx.restore());
                    }
                    return _results;
                }());
                ctx.closePath();
                ctx.save();
                if (this.options.shadow) {
                    ctx.shadowColor = this.options.shadowColor;
                    ctx.shadowBlur = this.options.shadowBlur;
                    ctx.shadowOffsetX = this.options.shadowOffset[0];
                    ctx.shadowOffsetY = this.options.shadowOffset[1];
                }
                ctx.fill();
                ctx.restore();
                if (this.options.borderWidth) {
                    ctx.stroke();
                }
                ctx.restore();
                if (closeButton) {
                    return function () {
                        var crossCenter, crossHeight, crossWidth, hcs, linkCenter;
                        crossWidth = crossHeight = _this.options.closeButtonRadius * 2;
                        if (closeButton.toString() === 'top right') {
                            linkCenter = [
                                _this.dimensions.width - _this.options.closeButtonOffset[0],
                                _this.options.closeButtonOffset[1]
                            ];
                            crossCenter = [
                                linkCenter[0] + hb,
                                linkCenter[1] - hb
                            ];
                        } else {
                            linkCenter = [
                                _this.options.closeButtonOffset[0],
                                _this.options.closeButtonOffset[1]
                            ];
                            crossCenter = [
                                linkCenter[0] - hb,
                                linkCenter[1] - hb
                            ];
                        }
                        ctx.translate(crossCenter[0], crossCenter[1]);
                        hcs = _this.options.closeButtonCrossSize / 2;
                        ctx.save();
                        ctx.beginPath();
                        ctx.strokeStyle = _this.options.closeButtonCrossColor;
                        ctx.lineWidth = _this.options.closeButtonCrossLineWidth;
                        ctx.lineCap = 'round';
                        ctx.moveTo(-hcs, -hcs);
                        ctx.lineTo(hcs, hcs);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(hcs, -hcs);
                        ctx.lineTo(-hcs, hcs);
                        ctx.stroke();
                        ctx.restore();
                        return _this.adapter.css(_this.closeButtonElement, {
                            left: '' + (linkCenter[0] - hcs - _this.options.closeButtonLinkOverscan) + 'px',
                            top: '' + (linkCenter[1] - hcs - _this.options.closeButtonLinkOverscan) + 'px',
                            width: '' + (_this.options.closeButtonCrossSize + _this.options.closeButtonLinkOverscan * 2) + 'px',
                            height: '' + (_this.options.closeButtonCrossSize + _this.options.closeButtonLinkOverscan * 2) + 'px'
                        });
                    }();
                }
            };
            Opentip.prototype._getPathStemMeasures = function (outerStemBase, outerStemLength, borderWidth) {
                var angle, distanceBetweenTips, halfAngle, hb, rhombusSide, stemBase, stemLength;
                hb = borderWidth / 2;
                halfAngle = Math.atan(outerStemBase / 2 / outerStemLength);
                angle = halfAngle * 2;
                rhombusSide = hb / Math.sin(angle);
                distanceBetweenTips = 2 * rhombusSide * Math.cos(halfAngle);
                stemLength = hb + outerStemLength - distanceBetweenTips;
                if (stemLength < 0) {
                    throw new Error('Sorry but your stemLength / stemBase ratio is strange.');
                }
                stemBase = Math.tan(halfAngle) * stemLength * 2;
                return {
                    stemLength: stemLength,
                    stemBase: stemBase
                };
            };
            Opentip.prototype._getColor = function (ctx, dimensions, color, horizontal) {
                var colorStop, gradient, i, _i, _len;
                if (horizontal == null) {
                    horizontal = false;
                }
                if (typeof color === 'string') {
                    return color;
                }
                if (horizontal) {
                    gradient = ctx.createLinearGradient(0, 0, dimensions.width, 0);
                } else {
                    gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
                }
                for (i = _i = 0, _len = color.length; _i < _len; i = ++_i) {
                    colorStop = color[i];
                    gradient.addColorStop(colorStop[0], colorStop[1]);
                }
                return gradient;
            };
            Opentip.prototype._searchAndActivateCloseButtons = function () {
                var element, _i, _len, _ref;
                _ref = this.adapter.findAll(this.container, '.' + this['class'].close);
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    element = _ref[_i];
                    this.hideTriggers.push({
                        element: this.adapter.wrap(element),
                        event: 'click'
                    });
                }
                if (this.currentObservers.showing) {
                    this._setupObservers('-showing', 'showing');
                }
                if (this.currentObservers.visible) {
                    return this._setupObservers('-visible', 'visible');
                }
            };
            Opentip.prototype._activateFirstInput = function () {
                var input;
                input = this.adapter.unwrap(this.adapter.find(this.container, 'input, textarea'));
                return input != null ? typeof input.focus === 'function' ? input.focus() : void 0 : void 0;
            };
            Opentip.prototype._followMousePosition = function () {
                if (!this.options.fixed) {
                    return Opentip._observeMousePosition(this.bound.reposition);
                }
            };
            Opentip.prototype._stopFollowingMousePosition = function () {
                if (!this.options.fixed) {
                    return Opentip._stopObservingMousePosition(this.bound.reposition);
                }
            };
            Opentip.prototype._clearShowTimeout = function () {
                return clearTimeout(this._showTimeoutId);
            };
            Opentip.prototype._clearHideTimeout = function () {
                return clearTimeout(this._hideTimeoutId);
            };
            Opentip.prototype._clearTimeouts = function () {
                clearTimeout(this._visibilityStateTimeoutId);
                this._clearShowTimeout();
                return this._clearHideTimeout();
            };
            Opentip.prototype._triggerElementExists = function () {
                var el;
                el = this.adapter.unwrap(this.triggerElement);
                while (el.parentNode) {
                    if (el.parentNode.tagName === 'BODY') {
                        return true;
                    }
                    el = el.parentNode;
                }
                return false;
            };
            Opentip.prototype._loadAjax = function () {
                var _this = this;
                if (this.loading) {
                    return;
                }
                this.loaded = false;
                this.loading = true;
                this.adapter.addClass(this.container, this['class'].loading);
                this.setContent('');
                this.debug('Loading content from ' + this.options.ajax);
                return this.adapter.ajax({
                    url: this.options.ajax,
                    method: this.options.ajaxMethod,
                    onSuccess: function (responseText) {
                        _this.debug('Loading successful.');
                        _this.adapter.removeClass(_this.container, _this['class'].loading);
                        return _this.setContent(responseText);
                    },
                    onError: function (error) {
                        var message;
                        message = _this.options.ajaxErrorMessage;
                        _this.debug(message, error);
                        _this.setContent(message);
                        return _this.adapter.addClass(_this.container, _this['class'].ajaxError);
                    },
                    onComplete: function () {
                        _this.adapter.removeClass(_this.container, _this['class'].loading);
                        _this.loading = false;
                        _this.loaded = true;
                        _this._searchAndActivateCloseButtons();
                        _this._activateFirstInput();
                        return _this.reposition();
                    }
                });
            };
            Opentip.prototype._ensureTriggerElement = function () {
                if (!this._triggerElementExists()) {
                    this.deactivate();
                    return this._stopEnsureTriggerElement();
                }
            };
            Opentip.prototype._ensureTriggerElementInterval = 1000;
            Opentip.prototype._startEnsureTriggerElement = function () {
                var _this = this;
                return this._ensureTriggerElementTimeoutId = setInterval(function () {
                    return _this._ensureTriggerElement();
                }, this._ensureTriggerElementInterval);
            };
            Opentip.prototype._stopEnsureTriggerElement = function () {
                return clearInterval(this._ensureTriggerElementTimeoutId);
            };
            return Opentip;
        }();
        vendors = [
            'khtml',
            'ms',
            'o',
            'moz',
            'webkit'
        ];
        Opentip.prototype.setCss3Style = function (element, styles) {
            var prop, value, vendor, vendorProp, _results;
            element = this.adapter.unwrap(element);
            _results = [];
            for (prop in styles) {
                if (!__hasProp.call(styles, prop))
                    continue;
                value = styles[prop];
                if (element.style[prop] != null) {
                    _results.push(element.style[prop] = value);
                } else {
                    _results.push(function () {
                        var _i, _len, _results1;
                        _results1 = [];
                        for (_i = 0, _len = vendors.length; _i < _len; _i++) {
                            vendor = vendors[_i];
                            vendorProp = '' + this.ucfirst(vendor) + this.ucfirst(prop);
                            if (element.style[vendorProp] != null) {
                                _results1.push(element.style[vendorProp] = value);
                            } else {
                                _results1.push(void 0);
                            }
                        }
                        return _results1;
                    }.call(this));
                }
            }
            return _results;
        };
        Opentip.prototype.defer = function (func) {
            return setTimeout(func, 0);
        };
        Opentip.prototype.setTimeout = function (func, seconds) {
            return setTimeout(func, seconds ? seconds * 1000 : 0);
        };
        Opentip.prototype.ucfirst = function (string) {
            if (string == null) {
                return '';
            }
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        Opentip.prototype.dasherize = function (string) {
            return string.replace(/([A-Z])/g, function (_, character) {
                return '-' + character.toLowerCase();
            });
        };
        mousePositionObservers = [];
        mousePosition = {
            x: 0,
            y: 0
        };
        mouseMoved = function (e) {
            var observer, _i, _len, _results;
            mousePosition = Opentip.adapter.mousePosition(e);
            _results = [];
            for (_i = 0, _len = mousePositionObservers.length; _i < _len; _i++) {
                observer = mousePositionObservers[_i];
                _results.push(observer());
            }
            return _results;
        };
        Opentip.followMousePosition = function () {
            return Opentip.adapter.observe(document.body, 'mousemove', mouseMoved);
        };
        Opentip._observeMousePosition = function (observer) {
            return mousePositionObservers.push(observer);
        };
        Opentip._stopObservingMousePosition = function (removeObserver) {
            var observer;
            return mousePositionObservers = function () {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = mousePositionObservers.length; _i < _len; _i++) {
                    observer = mousePositionObservers[_i];
                    if (observer !== removeObserver) {
                        _results.push(observer);
                    }
                }
                return _results;
            }();
        };
        Opentip.Joint = function () {
            function Joint(pointerString) {
                if (pointerString == null) {
                    return;
                }
                if (pointerString instanceof Opentip.Joint) {
                    pointerString = pointerString.toString();
                }
                this.set(pointerString);
                this;
            }
            Joint.prototype.set = function (string) {
                string = string.toLowerCase();
                this.setHorizontal(string);
                this.setVertical(string);
                return this;
            };
            Joint.prototype.setHorizontal = function (string) {
                var i, valid, _i, _j, _len, _len1, _results;
                valid = [
                    'left',
                    'center',
                    'right'
                ];
                for (_i = 0, _len = valid.length; _i < _len; _i++) {
                    i = valid[_i];
                    if (~string.indexOf(i)) {
                        this.horizontal = i.toLowerCase();
                    }
                }
                if (this.horizontal == null) {
                    this.horizontal = 'center';
                }
                _results = [];
                for (_j = 0, _len1 = valid.length; _j < _len1; _j++) {
                    i = valid[_j];
                    _results.push(this[i] = this.horizontal === i ? i : void 0);
                }
                return _results;
            };
            Joint.prototype.setVertical = function (string) {
                var i, valid, _i, _j, _len, _len1, _results;
                valid = [
                    'top',
                    'middle',
                    'bottom'
                ];
                for (_i = 0, _len = valid.length; _i < _len; _i++) {
                    i = valid[_i];
                    if (~string.indexOf(i)) {
                        this.vertical = i.toLowerCase();
                    }
                }
                if (this.vertical == null) {
                    this.vertical = 'middle';
                }
                _results = [];
                for (_j = 0, _len1 = valid.length; _j < _len1; _j++) {
                    i = valid[_j];
                    _results.push(this[i] = this.vertical === i ? i : void 0);
                }
                return _results;
            };
            Joint.prototype.eql = function (pointer) {
                return pointer != null && this.horizontal === pointer.horizontal && this.vertical === pointer.vertical;
            };
            Joint.prototype.flip = function () {
                var flippedIndex, positionIdx;
                positionIdx = Opentip.position[this.toString(true)];
                flippedIndex = (positionIdx + 4) % 8;
                this.set(Opentip.positions[flippedIndex]);
                return this;
            };
            Joint.prototype.toString = function (camelized) {
                var horizontal, vertical;
                if (camelized == null) {
                    camelized = false;
                }
                vertical = this.vertical === 'middle' ? '' : this.vertical;
                horizontal = this.horizontal === 'center' ? '' : this.horizontal;
                if (vertical && horizontal) {
                    if (camelized) {
                        horizontal = Opentip.prototype.ucfirst(horizontal);
                    } else {
                        horizontal = ' ' + horizontal;
                    }
                }
                return '' + vertical + horizontal;
            };
            return Joint;
        }();
        Opentip.prototype._positionsEqual = function (posA, posB) {
            return posA != null && posB != null && posA.left === posB.left && posA.top === posB.top;
        };
        Opentip.prototype._dimensionsEqual = function (dimA, dimB) {
            return dimA != null && dimB != null && dimA.width === dimB.width && dimA.height === dimB.height;
        };
        Opentip.prototype.debug = function () {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (Opentip.debug && (typeof console !== 'undefined' && console !== null ? console.debug : void 0) != null) {
                args.unshift('#' + this.id + ' |');
                return console.debug.apply(console, args);
            }
        };
        Opentip.findElements = function () {
            var adapter, content, element, optionName, optionValue, options, _i, _len, _ref, _results;
            adapter = Opentip.adapter;
            _ref = adapter.findAll(document.body, '[data-ot]');
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                element = _ref[_i];
                options = {};
                content = adapter.data(element, 'ot');
                if (content === '' || content === 'true' || content === 'yes') {
                    content = adapter.attr(element, 'title');
                    adapter.attr(element, 'title', '');
                }
                content = content || '';
                for (optionName in Opentip.styles.standard) {
                    optionValue = adapter.data(element, 'ot' + Opentip.prototype.ucfirst(optionName));
                    if (optionValue != null) {
                        if (optionValue === 'yes' || optionValue === 'true' || optionValue === 'on') {
                            optionValue = true;
                        } else if (optionValue === 'no' || optionValue === 'false' || optionValue === 'off') {
                            optionValue = false;
                        }
                        options[optionName] = optionValue;
                    }
                }
                _results.push(new Opentip(element, content, options));
            }
            return _results;
        };
        Opentip.version = '2.4.6';
        Opentip.debug = false;
        Opentip.lastId = 0;
        Opentip.lastZIndex = 100;
        Opentip.tips = [];
        Opentip._abortShowingGroup = function (group, originatingOpentip) {
            var opentip, _i, _len, _ref, _results;
            _ref = Opentip.tips;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                opentip = _ref[_i];
                if (opentip !== originatingOpentip && opentip.options.group === group) {
                    _results.push(opentip._abortShowing());
                } else {
                    _results.push(void 0);
                }
            }
            return _results;
        };
        Opentip._hideGroup = function (group, originatingOpentip) {
            var opentip, _i, _len, _ref, _results;
            _ref = Opentip.tips;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                opentip = _ref[_i];
                if (opentip !== originatingOpentip && opentip.options.group === group) {
                    _results.push(opentip.hide());
                } else {
                    _results.push(void 0);
                }
            }
            return _results;
        };
        Opentip.adapters = {};
        Opentip.adapter = null;
        firstAdapter = true;
        Opentip.addAdapter = function (adapter) {
            Opentip.adapters[adapter.name] = adapter;
            if (firstAdapter) {
                Opentip.adapter = adapter;
                adapter.domReady(Opentip.findElements);
                adapter.domReady(Opentip.followMousePosition);
                return firstAdapter = false;
            }
        };
        Opentip.positions = [
            'top',
            'topRight',
            'right',
            'bottomRight',
            'bottom',
            'bottomLeft',
            'left',
            'topLeft'
        ];
        Opentip.position = {};
        _ref = Opentip.positions;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            position = _ref[i];
            Opentip.position[position] = i;
        }
        Opentip.styles = {
            standard: {
                'extends': null,
                title: void 0,
                escapeTitle: true,
                escapeContent: false,
                className: 'standard',
                stem: true,
                delay: null,
                hideDelay: 0.1,
                fixed: false,
                showOn: 'mouseover',
                hideTrigger: 'trigger',
                hideTriggers: [],
                hideOn: null,
                removeElementsOnHide: false,
                offset: [
                    0,
                    0
                ],
                containInViewport: true,
                autoOffset: true,
                showEffect: 'appear',
                hideEffect: 'fade',
                showEffectDuration: 0.3,
                hideEffectDuration: 0.2,
                stemLength: 5,
                stemBase: 8,
                tipJoint: 'top left',
                target: null,
                targetJoint: null,
                cache: true,
                ajax: false,
                ajaxMethod: 'GET',
                ajaxErrorMessage: 'There was a problem downloading the content.',
                group: null,
                style: null,
                background: '#fff18f',
                backgroundGradientHorizontal: false,
                closeButtonOffset: [
                    5,
                    5
                ],
                closeButtonRadius: 7,
                closeButtonCrossSize: 4,
                closeButtonCrossColor: '#d2c35b',
                closeButtonCrossLineWidth: 1.5,
                closeButtonLinkOverscan: 6,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#f2e37b',
                shadow: true,
                shadowBlur: 10,
                shadowOffset: [
                    3,
                    3
                ],
                shadowColor: 'rgba(0, 0, 0, 0.1)'
            },
            glass: {
                'extends': 'standard',
                className: 'glass',
                background: [
                    [
                        0,
                        'rgba(252, 252, 252, 0.8)'
                    ],
                    [
                        0.5,
                        'rgba(255, 255, 255, 0.8)'
                    ],
                    [
                        0.5,
                        'rgba(250, 250, 250, 0.9)'
                    ],
                    [
                        1,
                        'rgba(245, 245, 245, 0.9)'
                    ]
                ],
                borderColor: '#eee',
                closeButtonCrossColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 15,
                closeButtonRadius: 10,
                closeButtonOffset: [
                    8,
                    8
                ]
            },
            dark: {
                'extends': 'standard',
                className: 'dark',
                borderRadius: 13,
                borderColor: '#444',
                closeButtonCrossColor: 'rgba(240, 240, 240, 1)',
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowOffset: [
                    2,
                    2
                ],
                background: [
                    [
                        0,
                        'rgba(30, 30, 30, 0.7)'
                    ],
                    [
                        0.5,
                        'rgba(30, 30, 30, 0.8)'
                    ],
                    [
                        0.5,
                        'rgba(10, 10, 10, 0.8)'
                    ],
                    [
                        1,
                        'rgba(10, 10, 10, 0.9)'
                    ]
                ]
            },
            alert: {
                'extends': 'standard',
                className: 'alert',
                borderRadius: 1,
                borderColor: '#AE0D11',
                closeButtonCrossColor: 'rgba(255, 255, 255, 1)',
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowOffset: [
                    2,
                    2
                ],
                background: [
                    [
                        0,
                        'rgba(203, 15, 19, 0.7)'
                    ],
                    [
                        0.5,
                        'rgba(203, 15, 19, 0.8)'
                    ],
                    [
                        0.5,
                        'rgba(189, 14, 18, 0.8)'
                    ],
                    [
                        1,
                        'rgba(179, 14, 17, 0.9)'
                    ]
                ]
            }
        };
        Opentip.defaultStyle = 'standard';
        if (typeof module !== 'undefined' && module !== null) {
            module.exports = Opentip;
        } else {
            window.Opentip = Opentip;
        }
    }());
    var __slice = [].slice;
    (function ($) {
        var Adapter;
        $.fn.opentip = function (content, title, options) {
            return new Opentip(this, content, title, options);
        };
        Adapter = function () {
            function Adapter() {
            }
            Adapter.prototype.name = 'jquery';
            Adapter.prototype.domReady = function (callback) {
                return $(callback);
            };
            Adapter.prototype.create = function (html) {
                return $(html);
            };
            Adapter.prototype.wrap = function (element) {
                element = $(element);
                if (element.length > 1) {
                    throw new Error('Multiple elements provided.');
                }
                return element;
            };
            Adapter.prototype.unwrap = function (element) {
                return $(element)[0];
            };
            Adapter.prototype.tagName = function (element) {
                return this.unwrap(element).tagName;
            };
            Adapter.prototype.attr = function () {
                var args, element, _ref;
                element = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                return (_ref = $(element)).attr.apply(_ref, args);
            };
            Adapter.prototype.data = function () {
                var args, element, _ref;
                element = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                return (_ref = $(element)).data.apply(_ref, args);
            };
            Adapter.prototype.find = function (element, selector) {
                return $(element).find(selector).get(0);
            };
            Adapter.prototype.findAll = function (element, selector) {
                return $(element).find(selector);
            };
            Adapter.prototype.update = function (element, content, escape) {
                element = $(element);
                if (escape) {
                    return element.text(content);
                } else {
                    return element.html(content);
                }
            };
            Adapter.prototype.append = function (element, child) {
                return $(element).append(child);
            };
            Adapter.prototype.remove = function (element) {
                return $(element).remove();
            };
            Adapter.prototype.addClass = function (element, className) {
                return $(element).addClass(className);
            };
            Adapter.prototype.removeClass = function (element, className) {
                return $(element).removeClass(className);
            };
            Adapter.prototype.css = function (element, properties) {
                return $(element).css(properties);
            };
            Adapter.prototype.dimensions = function (element) {
                return {
                    width: $(element).outerWidth(),
                    height: $(element).outerHeight()
                };
            };
            Adapter.prototype.scrollOffset = function () {
                return [
                    window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
                    window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
                ];
            };
            Adapter.prototype.viewportDimensions = function () {
                return {
                    width: document.documentElement.clientWidth,
                    height: document.documentElement.clientHeight
                };
            };
            Adapter.prototype.mousePosition = function (e) {
                if (e == null) {
                    return null;
                }
                return {
                    x: e.pageX,
                    y: e.pageY
                };
            };
            Adapter.prototype.offset = function (element) {
                var offset;
                offset = $(element).offset();
                return {
                    left: offset.left,
                    top: offset.top
                };
            };
            Adapter.prototype.observe = function (element, eventName, observer) {
                return $(element).bind(eventName, observer);
            };
            Adapter.prototype.stopObserving = function (element, eventName, observer) {
                return $(element).unbind(eventName, observer);
            };
            Adapter.prototype.ajax = function (options) {
                var _ref, _ref1;
                if (options.url == null) {
                    throw new Error('No url provided');
                }
                return $.ajax({
                    url: options.url,
                    type: (_ref = (_ref1 = options.method) != null ? _ref1.toUpperCase() : void 0) != null ? _ref : 'GET'
                }).done(function (content) {
                    return typeof options.onSuccess === 'function' ? options.onSuccess(content) : void 0;
                }).fail(function (request) {
                    return typeof options.onError === 'function' ? options.onError('Server responded with status ' + request.status) : void 0;
                }).always(function () {
                    return typeof options.onComplete === 'function' ? options.onComplete() : void 0;
                });
            };
            Adapter.prototype.clone = function (object) {
                return $.extend({}, object);
            };
            Adapter.prototype.extend = function () {
                var sources, target;
                target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                return $.extend.apply($, [target].concat(__slice.call(sources)));
            };
            return Adapter;
        }();
        return Opentip.addAdapter(new Adapter());
    }(jQuery));
};
})(window);
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