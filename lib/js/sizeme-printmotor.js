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

(function($) {
    "use strict";

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
		var itemTypeArr = [0,0,0,0,0,0,0];
		var separator = '';
		if (itemTypeStr.indexOf('.') > -1) separator = '.';
		var itemTypeSplitted = itemTypeStr.split(separator, 7);
		for(var i=0; i<itemTypeSplitted.length;i++) itemTypeArr[i] = +itemTypeSplitted[i];
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

        measurement_arrows.chest = { mirror: false, coords: [{X: -250,Y: 399},{X: 250,Y: 399}], style: arcStyle, lift: false, color: arrowColor };
        measurement_arrows.waist = { mirror: false, coords: [{X: -250,Y: 635},{X: 250,Y: 635}], style: arcStyle, lift: false, color: arrowColor };
        measurement_arrows.front_height = { mirror: false, coords: [{X: -174,Y: 0},{X: -174,Y: 978}], style: "line", lift: false, color: arrowColor };
        measurement_arrows.neck_opening_width = {
            mirror: false,
            coords: [{X: 0,Y: 47}, {X: 174,Y: 0, cp1X: 65, cp1Y: 45, cp2X: 140, cp2Y: 23}, {X: 0,Y: 100, cp1X: 150, cp1Y: 46, cp2X: 50, cp2Y: 92},
                {X: -174,Y: 0, cp1X: -50, cp1Y: 92, cp2X: -150, cp2Y: 46}, {X: 0,Y: 47, cp1X: -140, cp1Y: 23, cp2X: -65, cp2Y: 45}],
            style: "line",
            lift: true,
            color: arrowColor};

        measurement_arrows.hood_height = { mirror: false, coords: [{X: 195,Y: -5},{X: 195,Y: -390}], style: "line", lift: false, color: arrowColor };
        measurement_arrows.shoulder_width = { mirror: false, coords: [{X: -329,Y: 42},{X: -164,Y: -7}], style: "line", lift: true, color: arrowColor };

        measurement_arrows.pant_waist = { mirror: false, coords: [{X: -232,Y: 0},{X: 222,Y: 0}], style: arcStyle, lift: true, color: arrowColor };
        measurement_arrows.hips = { mirror: false, coords: [{X: -261,Y: 171}, {X: 263,Y: 171}], style: arcStyle, lift: false, color: arrowColor };
        measurement_arrows.outseam = { mirror: false, coords: [{X: 222,Y: 0},{X: 263,Y: 171},{X: 302,Y: 1071}], style: "line", lift: true, color: arrowColor };
        measurement_arrows.inseam = { mirror: false, coords: [{X: 5,Y: 297},{X: 151, Y: 1084}], style: "line", lift: false, color: arrowColor };
        measurement_arrows.thigh_width = { mirror: false, coords: [{X: -266,Y: 274},{X: -17,Y: 297}], style: arcStyle, lift: false, color: arrowColor };
        measurement_arrows.knee_width = { mirror: false, coords: [{X: -286,Y: 727},{X: -93,Y: 744}], style: arcStyle, lift: false, color: arrowColor };
        measurement_arrows.pant_sleeve_width = { mirror: false, coords: [{X: -301,Y: 1071},{X: -152,Y: 1084}], style: arcStyle, lift: false, color: arrowColor };

        measurement_arrows.shoe_inside_length = { mirror: false, coords: [{X: 169,Y: 984},{X: 132,Y: 18}], style: "line", lift: false, color: arrowColor };

        measurement_arrows.hat_width = {
            mirror: false,
            coords: [{X: 534,Y: 238},
                {X: 539,Y: 265, cp1X: 559, cp1Y: 236, cp2X: 567, cp2Y: 252},
                {X: 70,Y: 262, cp1X: 352, cp1Y: 353, cp2X: 223, cp2Y: 351},
                {X: 77,Y: 242, cp1X: 38, cp1Y: 241, cp2X: 60, cp2Y: 234}],
            midCircle: {X: 300, Y: 325},
            style: "line",
            lift: false,
            color: arrowColor };

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
                        item_drawing.coords.push({X: 0,Y: -60},{X: 119,Y: -48, cp1X: 68, cp1Y: -60, cp2X: 106, cp2Y: -57}, {X: 128,Y: 0});
                        item_drawing.accents.push({type: "area", coords: [	{X: 0,Y: -47},
                            {X: 100,Y: -35, cp1X: 64, cp1Y: -48, cp2X: 105, cp2Y: -47},
                            {X: -5,Y: 59, cp1X: 66, cp1Y: 8, cp2X: 6, cp2Y: 40},
                            {X: -104,Y: -34, cp1X: -25, cp1Y: 32, cp2X: -93, cp2Y: -12},
                            {X: 0,Y: -46, cp1X: -117, cp1Y: -48, cp2X: -52, cp2Y: -48}
                        ], noMirror: true});
                        item_drawing.accents.push({type: "line", coords:[	{X: 129,Y: 0},
                            {X: 136,Y: 26, cp1X: 132, cp1Y: 14, cp2X: 133, cp2Y: 18},
                            {X: 78,Y: 125, cp1X: 123, cp1Y: 63, cp2X: 100, cp2Y: 95},
                            {X: 37,Y: 78, cp1X: 60, cp1Y: 106, cp2X: 51, cp2Y: 101},
                            {X: -12,Y: 111, cp1X: 24, cp1Y: 8, cp2X: -32, cp2Y: 66}
                        ], noMirror: true});	// non mirrored turnover collar right
                        item_drawing.accents.push({type: "line", coords:[	{X: -129,Y: 0},
                            {X: -136,Y: 26, cp1X: -132, cp1Y: 14, cp2X: -133, cp2Y: 18},
                            {X: -90,Y: 127, cp1X: -127, cp1Y: 68, cp2X: -106, cp2Y: 110},
                            {X: -9,Y: 59, cp1X: -33, cp1Y: 88, cp2X: -61, cp2Y: 25}
                        ], noMirror: true});	// non mirrored turnover collar left
                        item_drawing.accents.push({type: "circle", coords: [{X: 0,Y: 100, R: 5}]});
                        measurement_arrows.neck_opening_width = {
                            mirror: false,
                            coords: [{X: 0,Y: -47}, {X: 100,Y: -35, cp1X: 64, cp1Y: -48, cp2X: 105, cp2Y: -47},
                                {X: -5,Y: 59, cp1X: 66, cp1Y: 8, cp2X: 6, cp2Y: 40}, {X: -104,Y: -34, cp1X: -25, cp1Y: 32, cp2X: -93, cp2Y: -12},
                                {X: 0,Y: -46, cp1X: -117, cp1Y: -48, cp2X: -52, cp2Y: -48}],
                            style: "line",
                            lift: false,
                            midCircle: {X: 0, Y: -47},
                            color: arrowColor};
                        measurement_arrows.shoulder_width = { mirror: false, coords: [{X: -329,Y: 49},{X: -129,Y: -5}], style: "line", lift: true, color: arrowColor };
                        measurement_arrows.front_height = { mirror: false, coords: [{X: -167,Y: -4},{X: -167,Y: 978}], style: "line", lift: false, color: arrowColor };

                        break;
                    case 3:	// hood
                        item_drawing.coords.push({X: 0,Y: -390},{X: 185,Y: 6, cp1X: 180, cp1Y: -400, cp2X: 160, cp2Y: -20});
                        item_drawing.accents.push({type: "line", coords: [{X: 185,Y: 6}, {X: 0,Y: 123, cp1X: 140, cp1Y: 70, cp2X: 70, cp2Y: 100}]});	// basic round collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: -320}, {X: 144,Y: 0, cp1X: 150, cp1Y: -320, cp2X: 140, cp2Y: -20}, {X: 0,Y: 100, cp1X: 140, cp1Y: 46, cp2X: 40, cp2Y: 92}]}); // hood area
                        measurement_arrows.shoulder_width = { mirror: false, coords: [{X: -329,Y: 42},{X: -174,Y: -7}], style: "line", lift: true, color: arrowColor };
                        break;
                    case 5:	// open high round
                        item_drawing.coords.push({X: 0,Y: 90},{X: 189,Y: 0});
                        item_drawing.accents.push({type: "line", coords: [{X: 210,Y: 6}, {X: 0,Y: 123, cp1X: 165, cp1Y: 70, cp2X: 100, cp2Y: 123}]});	// open round collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: 49}, {X: 189,Y: 0, cp1X: 100, cp1Y: 47, cp2X: 155, cp2Y: 23}, {X: 0,Y: 102, cp1X: 165, cp1Y: 46, cp2X: 95, cp2Y: 102}]}); // open collar area
                        break;
                    case 6:	// open low round
                        item_drawing.coords.push({X: 0,Y: 180},{X: 164,Y: 0});
                        item_drawing.accents.push({type: "line", coords: [{X: 181,Y: 5}, {X: 0,Y: 196, cp1X: 146, cp1Y: 196, cp2X: 50, cp2Y: 196}]});	// collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: 47}, {X: 164,Y: 0, cp1X: 55, cp1Y: 45, cp2X: 130, cp2Y: 23}, {X: 0,Y: 180, cp1X: 130, cp1Y: 180, cp2X: 45, cp2Y: 180}]}); // basic area
                        break;
                    case 7:	// v-style high
                        item_drawing.coords.push({X: 0,Y: 90},{X: 189,Y: 0});
                        item_drawing.accents.push({type: "line", coords: [{X: 210,Y: 6}, {X: 0,Y: 123, cp1X: 165, cp1Y: 70, cp2X: 80, cp2Y: 100}]});	// open round collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: 47}, {X: 189,Y: 0, cp1X: 80, cp1Y: 45, cp2X: 155, cp2Y: 23}, {X: 0,Y: 100, cp1X: 165, cp1Y: 46, cp2X: 65, cp2Y: 92}]}); // open collar area
                        break;
                    case 8:	// v-style low
                        item_drawing.coords.push({X: 0,Y: 90},{X: 189,Y: 0});
                        item_drawing.accents.push({type: "line", coords: [{X: 210,Y: 6}, {X: 0,Y: 123, cp1X: 165, cp1Y: 70, cp2X: 80, cp2Y: 100}]});	// open round collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: 47}, {X: 189,Y: 0, cp1X: 80, cp1Y: 45, cp2X: 155, cp2Y: 23}, {X: 0,Y: 100, cp1X: 165, cp1Y: 46, cp2X: 65, cp2Y: 92}]}); // open collar area
                        break;
                    default:	// elastic round
                        item_drawing.coords.push({X: 0,Y: 90},{X: 164,Y: 0});
                        item_drawing.accents.push({type: "line", coords: [{X: 185,Y: 6}, {X: 0,Y: 110, cp1X: 140, cp1Y: 70, cp2X: 70, cp2Y: 108}]});	// basic round collar line
                        item_drawing.accents.push({type: "area", coords: [{X: 0,Y: 47}, {X: 164,Y: 0, cp1X: 55, cp1Y: 45, cp2X: 130, cp2Y: 23}, {X: 0,Y: 90, cp1X: 140, cp1Y: 46, cp2X: 55, cp2Y: 90}]}); // basic area
                        break;
                }

                switch (itemTypeArr[3]) { // sleeve length
                    case 0:	// tank top, string top or poncho
                    case 1:	// very short (vest)
                        item_drawing.coords.push({X: 289,Y: 34});
                        item_drawing.coords.push({X: 250,Y: 399, cp1X: 285, cp1Y: 44, cp2X: 220, cp2Y: 389});
                        measurement_arrows.shoulder_width = { mirror: false, coords: [{X: -299,Y: 32},{X: -164,Y: -7}], style: "line", lift: true, color: arrowColor };
						measurement_arrows.sleeve_top_width = { mirror: false, coords: [{X: 250,Y: 399},{X: 289,Y: 34}], style: arcStyle, lift: false, color: arrowColor };

                        if (itemTypeArr[4] !== 0) {
							// is it you, poncho?
                            item_drawing.coords.push({X: 250,Y: 399, cp1X: 328, cp1Y: 44, cp2X: 250, cp2Y: 260});
                            FIT_ORDER.splice(13, 1);  // remove sleeve top
                            measurement_arrows.sleeve_top_width = false;
                        }
                        break;
                    case 2:  // short
                    case 3:  // short-medium (normal t-shirt)
                        item_drawing.coords.push({X: 329,Y: 44});
                        item_drawing.coords.push({X: 482,Y: 460},{X: 324,Y: 529});
                        item_drawing.coords.push({X: 250,Y: 399});

                        measurement_arrows.sleeve_top_width = { mirror: false, coords: [{X: 250,Y: 399},{X: 430,Y: 322}], style: arcStyle, lift: false, color: arrowColor };
                        measurement_arrows.wrist_width = { mirror: false, coords: [{X: 324,Y: 529},{X: 482,Y: 460}], style: arcStyle, lift: false, color: arrowColor };
						
                        i18n.MEASUREMENT.wrist_width = i18n.MEASUREMENT.sleeve_opening;

						switch (itemTypeArr[2]) { // shoulder types
							case 3:	// dropped
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 381,Y: 184}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 482,Y: 460}], style: "line", lift: true, midCircle: {X: 406, Y: 243}, color: arrowColor };
								break;
							case 2:	// raglan line
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 185,Y: 6, cp1X: 220, cp1Y: 320, cp2X: 185, cp2Y: 6}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 482,Y: 460}], style: "line", lift: true, midCircle: {X: 406, Y: 243}, color: arrowColor };
								break;
							case 1:	// normal shoulder line
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 329,Y: 44},{X: 482,Y: 460}], style: "line", lift: true, color: arrowColor };
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 329,Y: 44, cp1X: 250, cp1Y: 250, cp2X: 300, cp2Y: 70}]});
								break;
						}
                        break;
                    case 4:  // medium
                    case 5:  // semi-long
                        item_drawing.coords.push({X: 329,Y: 44});
                        item_drawing.coords.push({X: 527,Y: 719},{X: 389,Y: 769});
                        item_drawing.coords.push({X: 250,Y: 399});

                        measurement_arrows.sleeve_top_width = { mirror: false, coords: [{X: 250,Y: 399},{X: 419,Y: 340}], style: arcStyle, lift: false, color: arrowColor };
                        measurement_arrows.wrist_width = { mirror: false, coords: [{X: 389,Y: 769},{X: 527,Y: 719}], style: arcStyle, lift: false, color: arrowColor };
						
                        i18n.MEASUREMENT.wrist_width = i18n.MEASUREMENT.sleeve_opening;

						switch (itemTypeArr[2]) { // shoulder types
							case 3:	// dropped
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 369,Y: 196}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 527,Y: 719}], style: "line", lift: true, midCircle: {X: 450, Y: 444}, color: arrowColor };
								break;
							case 2:	// raglan line
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 185,Y: 6, cp1X: 220, cp1Y: 320, cp2X: 185, cp2Y: 6}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 527,Y: 719}], style: "line", lift: true, midCircle: {X: 450, Y: 444}, color: arrowColor };
								break;
							case 1:	// normal shoulder line
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 329,Y: 44},{X: 527,Y: 719}], style: "line", lift: true, color: arrowColor };
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 329,Y: 44, cp1X: 250, cp1Y: 250, cp2X: 300, cp2Y: 70}]});
								break;
						}
						break;
                    case 6:  // long
                    case 7:  // very long
                    case 8:  // extra long
                        item_drawing.coords.push({X: 329,Y: 44});
						measurement_arrows.sleeve_top_width = { mirror: false, coords: [{X: 250,Y: 399},{X: 410,Y: 348}], style: arcStyle, lift: false, color: arrowColor };

                        if (itemTypeArr[4] === 1) {	// elastic
                            item_drawing.coords.push({X: 556,Y: 902},{X: 547,Y: 930}, {X: 557,Y: 978},{X: 463,Y: 998},{X: 449,Y: 951},{X: 430,Y: 934});
                            item_drawing.accents.push({type: "line", coords: [{X: 465,Y: 944}, {X: 476,Y: 996}]},
                                {type: "line", coords: [{X: 476,Y: 941}, {X: 487,Y: 993}]},
                                {type: "line", coords: [{X: 487,Y: 938}, {X: 498,Y: 990}]},
                                {type: "line", coords: [{X: 498,Y: 935}, {X: 509,Y: 987}]},
                                {type: "line", coords: [{X: 509,Y: 932}, {X: 520,Y: 984}]},
                                {type: "line", coords: [{X: 520,Y: 929}, {X: 531,Y: 981}]},
                                {type: "line", coords: [{X: 531,Y: 926}, {X: 542,Y: 978}]});
                            item_drawing.coords.push({X: 250,Y: 399});
                            measurement_arrows.wrist_width = { mirror: false, coords: [{X: 430,Y: 934}, {X: 556,Y: 902}], style: arcStyle, lift: false, color: arrowColor };
                        } else {
                            item_drawing.coords.push({X: 571,Y: 978},{X: 454,Y: 1009});
                            item_drawing.coords.push({X: 250,Y: 399});
							measurement_arrows.wrist_width = { mirror: false, coords: [{X: 571,Y: 978},{X: 454,Y: 1009}], style: arcStyle, lift: false, color: arrowColor };
                        }

						switch (itemTypeArr[2]) { // shoulder types
							case 3:	// dropped
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 369,Y: 196}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 571,Y: 978}], style: "line", lift: true, midCircle: {X: 437, Y: 444}, color: arrowColor };
								break;
							case 2:	// raglan line
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 185,Y: 6, cp1X: 220, cp1Y: 320, cp2X: 185, cp2Y: 6}]});
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: -16}, {X: 329,Y: 27},{X: 571,Y: 978}], style: "line", lift: true, midCircle: {X: 437, Y: 444}, color: arrowColor };
								break;
							case 1:	// normal shoulder line
								measurement_arrows.sleeve = { mirror: false, coords: [{X: 329,Y: 44},{X: 569,Y: 975}], style: "line", lift: true, color: arrowColor };
								item_drawing.accents.push({type: "line", coords: [{X: 250,Y: 399}, {X: 329,Y: 44, cp1X: 250, cp1Y: 250, cp2X: 300, cp2Y: 70}]});
								break;
						}
                        break;
                }

                switch (itemTypeArr[5]) { // waistband
                    case 0:	// poncho dude
                        item_drawing.coords.push({X: 550,Y: 750, cp1X: 450, cp1Y: 70, cp2X: 450, cp2Y: 550});
                        item_drawing.coords.push({X: 0,Y: 1038, cp1X: 450, cp1Y: 800, cp2X: 400, cp2Y: 1038});
                        measurement_arrows.front_height = { mirror: false, coords: [{X: -174,Y: 5},{X: -174,Y: 1018}], style: "line", lift: false, color: arrowColor };
                        measurement_arrows.sleeve = { mirror: false, coords: [{X: 174,Y: 0}, {X: 394,Y: 59},{X: 550,Y: 750}], style: "line", lift: true, midCircle: {X: 480, Y: 444}, color: arrowColor };
                        break;
                    case 3:	// pant waist
                        if (itemTypeArr[6] === 1) {	// elastic
                            item_drawing.coords.push({X: 250,Y: 908, cp1X: 247, cp1Y: 402, cp2X: 247, cp2Y: 858},{X: 230,Y: 978},{X: 0,Y: 978});
                            for ($i = 0; $i<15; $i++) {
                                $x = Math.round(($i+0.5)*(230/15));
                                item_drawing.accents.push({type: "line", coords: [{X: $x,Y: 918}, {X: $x,Y: 978}]});
                            }
                            measurement_arrows.pant_waist = { mirror: false, coords: [{X: -250,Y: 908}, {X: 250,Y: 908}], style: arcStyle, lift: false, color: arrowColor };
                        } else {
                            item_drawing.coords.push({X: 250,Y: 978, cp1X: 245, cp1Y: 402, cp2X: 245, cp2Y: 928},{X: 0,Y: 978});
                            measurement_arrows.pant_waist = { mirror: false, coords: [{X: -250,Y: 978}, {X: 250,Y: 978}], style: arcStyle, lift: false, color: arrowColor };
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
                            item_drawing.coords.push({X: 250,Y: $base_y, cp1X: 247, cp1Y: 402, cp2X: 247, cp2Y: 908},{X: 230,Y: ($base_y+60)},{X: 0,Y: ($base_y+60)});
                            for ($i = 0; $i<15; $i++) {
                                $x = Math.round(($i+0.5)*(230/15));
                                item_drawing.accents.push({type: "line", coords: [{X: $x,Y: ($base_y+10)}, {X: $x,Y: ($base_y+60)}]});
                            }
                            measurement_arrows.front_height.coords[1].Y = ($base_y+60);
                            measurement_arrows.hips = { mirror: false, coords: [{X: -250,Y: $base_y}, {X: 250,Y: $base_y}], style: arcStyle, lift: false, color: arrowColor };
                        } else {
                            item_drawing.coords.push({X: 250,Y: ($base_y+60), cp1X: 245, cp1Y: 402, cp2X: 245, cp2Y: $base_y},{X: 0,Y: ($base_y+60)});
                            measurement_arrows.front_height.coords[1].Y = ($base_y+60);
                            measurement_arrows.hips = { mirror: false, coords: [{X: -250,Y: ($base_y+60)}, {X: 250,Y: ($base_y+60)}], style: arcStyle, lift: false, color: arrowColor };
                        }
                        break;
                }

                break;	// case 1 shirts/coats

            case 2:	// trousers/shorts
                item_drawing.mirror = false; // for accents mainly
                item_drawing.coords.push({X: -232,Y: 0},{X: 222,Y: 0, cp1X: -100, cp1Y: 10, cp2X: 90, cp2Y: 10},{X: 263,Y: 171});

                switch (itemTypeArr[3]) { // sleeve
                    case 1:	// very short
                    case 2:	// short
                    case 3:	// short-medium
                        item_drawing.coords.push({X: 278,Y: 449},{X: 38, Y: 474});
                        break;
                    case 4:	// medium
                        item_drawing.coords.push({X: 291,Y: 626},{X: 71, Y: 651});
                        break;
                    case 5:  // semi-long
                    case 6:  // long
                        item_drawing.coords.push({X: 302,Y: 1071},{X: 151, Y: 1084});
                        break;
                }

                item_drawing.coords.push({X: 5,Y: 297},{X: -17,Y: 297});

                switch (itemTypeArr[3]) { // sleeve again as not mirror
                    case 1:	// very short
                    case 2:	// short
                    case 3:	// short-medium
                        item_drawing.coords.push({X: -38, Y: 474}, {X: -278,Y: 449});
                        measurement_arrows.outseam = { mirror: false, coords: [{X: 222,Y: 0},{X: 263,Y: 171},{X: 278,Y: 449}], style: "line", lift: true, color: arrowColor };
                        measurement_arrows.knee_width = { mirror: false, coords: [{X: -278,Y: 449},{X: -38,Y: 474}], style: arcStyle, lift: false, color: arrowColor };
                        break;
                    case 4:	// medium
                        item_drawing.coords.push({X: -71,Y: 651},{X: -291,Y: 626});
                        measurement_arrows.outseam = { mirror: false, coords: [{X: 222,Y: 0},{X: 263,Y: 171},{X: 291,Y: 626}], style: "line", lift: true, color: arrowColor };
                        measurement_arrows.knee_width = { mirror: false, coords: [{X: -291,Y: 626},{X: -71,Y: 651}], style: arcStyle, lift: false, color: arrowColor };
                        break;
                    case 5:  // semi-long
                    case 6:  // long
                        item_drawing.coords.push({X: -152,Y: 1084},{X: -301,Y: 1071});
                        break;
                }

                item_drawing.coords.push({X: -261,Y: 171});
                item_drawing.accents.push(	{type: "area", coords: [{X: -232,Y: 0}, {X: 222,Y: 0, cp1X: -100, cp1Y: 10, cp2X: 90, cp2Y: 10}, {X: -232,Y: 0, cp1X: 122, cp1Y: 40, cp2X: -132, cp2Y: 40}]},
                    {type: "line", coords: [{X: -237,Y: 37}, {X: 229,Y: 37, cp1X: -137, cp1Y: 76, cp2X: 129, cp2Y: 76}]},
                    {type: "line", coords: [{X: -14,Y: 19}, {X: -8,Y: 297, cp1X: 3, cp1Y: 114, cp2X: 0, cp2Y: 215}]},
                    {type: "line", coords: [{X: -4,Y: 254}, {X: 29,Y: 64, cp1X: 34, cp1Y: 242, cp2X: 35, cp2Y: 188}]},
                    {type: "line", coords: [{X: -233,Y: 160}, {X: -147,Y: 81, cp1X: -182, cp1Y: 157, cp2X: -152, cp2Y: 123}]},
                    {type: "line", coords: [{X: 150,Y: 85}, {X: 236,Y: 164, cp1X: 158, cp1Y: 128, cp2X: 195, cp2Y: 160}]});
                if (itemTypeArr[6] === '4') {	// rope waistband
                    item_drawing.accents.push(	{type: "line", coords: [{X: 9,Y: 49}, {X: 8,Y: 47, cp1X: -24, cp1Y: 168, cp2X: -69, cp2Y: 84}]},
                        {type: "line", coords: [{X: 9,Y: 50}, {X: 8,Y: 49, cp1X: 47, cp1Y: 149, cp2X: 70, cp2Y: 99}]},
                        {type: "line", coords: [{X: 9,Y: 49}, {X: 49,Y: 49, cp1X: 27, cp1Y: 59, cp2X: 36, cp2Y: 54}]},
                        {type: "line", coords: [{X: 9,Y: 49}, {X: 9,Y: 64, cp1X: 11, cp1Y: 54, cp2X: 11, cp2Y: 54}]});
                } else {
                    item_drawing.accents.push({type: "circle", coords: [{X: 9,Y: 48, R: 10}]});
                }

                break; 	// case 2 trousers

            case 3:	// shoes for my friends
                item_drawing.mirror = false;
                item_drawing.coords = [	{X: 130,Y: 0},{X: 363,Y: 456, cp1X: 240, cp1Y: 8, cp2X: 345, cp2Y: 214},
                    {X: 328,Y: 633, cp1X: 358, cp1Y: 532, cp2X: 328, cp2Y: 564},{X: 182,Y: 999, cp1X: 330, cp1Y: 732, cp2X: 327, cp2Y: 994},
                    {X: 48,Y: 628, cp1X: 3, cp1Y: 994, cp2X: 48, cp2Y: 789},
                    {X: 0,Y: 340, cp1X: 42, cp1Y: 447, cp2X: 0, cp2Y: 444},{X: 130,Y: 0, cp1X: 0, cp1Y: 114, cp2X: 72, cp2Y: 0} ];
                item_drawing.accents = [{type: "area", coords: [{X: 164,Y: 625}, {X: 266,Y: 716, cp1X: 270, cp1Y: 632, cp2X: 276, cp2Y: 638}, {X: 168,Y: 990, cp1X: 236, cp1Y: 982, cp2X: 208, cp2Y: 987},
                    {X: 69,Y: 716, cp1X: 92, cp1Y: 978, cp2X: 83, cp2Y: 852}, {X: 164,Y: 625, cp1X: 64, cp1Y: 641, cp2X: 57, cp2Y: 628}]},
                    {type: "line", coords: [{X: 103,Y: 431}, {X: 212,Y: 430, cp1X: 112, cp1Y: 404, cp2X: 203, cp2Y: 405}]},
                    {type: "line", coords: [{X: 115,Y: 469}, {X: 200,Y: 469, cp1X: 121, cp1Y: 447, cp2X: 188, cp2Y: 450}]},
                    {type: "line", coords: [{X: 115,Y: 506}, {X: 200,Y: 506, cp1X: 121, cp1Y: 484, cp2X: 188, cp2Y: 484}]},
                    {type: "line", coords: [{X: 115,Y: 555}, {X: 200,Y: 555, cp1X: 121, cp1Y: 533, cp2X: 188, cp2Y: 533}]},
                    {type: "line", coords: [{X: 164,Y: 539}, {X: 283,Y: 541, cp1X: 242, cp1Y: 523, cp2X: 279, cp2Y: 609}, {X: 164,Y: 539, cp1X: 277, cp1Y: 492, cp2X: 209, cp2Y: 515}]},
                    {type: "line", coords: [{X: 164,Y: 539}, {X: 45,Y: 492, cp1X: 123, cp1Y: 517, cp2X: 34, cp2Y: 532}, {X: 164,Y: 539, cp1X: 65, cp1Y: 457, cp2X: 129, cp2Y: 509}]}
                ];
                break;	// case 3 shoes

            case 4:	// hats off
                switch (itemTypeArr[1]) {
                    case 1:	// bucket
                        item_drawing.mirror = false;
                        item_drawing.coords = [	{X: 300,Y: 0},
                            {X: 522,Y: 214, cp1X: 452, cp1Y: 17, cp2X: 458, cp2Y: 61},
                            {X: 599,Y: 311, cp1X: 594, cp1Y: 245, cp2X: 601, cp2Y: 283},
                            {X: 293,Y: 437, cp1X: 597, cp1Y: 361, cp2X: 494, cp2Y: 433},
                            {X: 0,Y: 306, cp1X: 87, cp1Y: 433, cp2X: 2, cp2Y: 355},
                            {X: 92,Y: 209, cp1X: 1, cp1Y: 258, cp2X: 44, cp2Y: 227},
                            {X: 300,Y: 0, cp1X: 156, cp1Y: 28, cp2X: 186, cp2Y: 16} ];
                        item_drawing.accents = [
                            {type: "line", coords: [{X: 222,Y: 48}, {X: 367,Y: 43, cp1X: 269, cp1Y: 29, cp2X: 288, cp2Y: 64}]},
                            {type: "line", coords: [{X: 523,Y: 214}, {X: 544,Y: 280},
                                {X: 63,Y: 278, cp1X: 376, cp1Y: 368, cp2X: 209, cp2Y: 373}, {X: 92,Y: 209}]} ];
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
        $("#slider_secondary").width(newWidth+'%');
        return true;
    }


    function writeSliderFlag(fitValue, fitLabel, thisSize, thisId) {
        // first, out with the old
        var sliderFlagHtml = "<div class='sliderFlag' id='sm_sf_"+thisSize+"'";
        sliderFlagHtml += " style='width: "+sliderPos(fitValue, 0)+"%'>";
        sliderFlagHtml += "<a class='flagItself "+fitLabel+"' href='#'>"+thisSize+"</a>";
        sliderFlagHtml += "</div>";
        $(".slider_container").append(sliderFlagHtml);
        $(".sm_sf_"+thisSize).hover(function() {
            $(this).toggleClass("activeFlag");
        }).click(function() {
            $(thisId).prop("checked", true);
            moveSlider(fitValue, true);
            return false;
        });
    }

    function moveSlider(fitValue, shouldAnimate) {
        var newWidth = sliderPos(fitValue, 0)+'%';
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
        for(var measurement in matchMap) {
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
            $('.slider_area').stop().animate({width: newWidth+'%', marginLeft: newMarginLeft+'%'});
        } else {
            $('.slider_area').width(newWidth+'%').css('marginLeft', newMarginLeft+'%');
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
			
			if ( (!$message_type) && (typeof matchMap.neck_opening_width !== "undefined") ) {
				if ( (totalFit >= 1000) && (matchMap.neck_opening_width.overlap < 0) )	{
					$message_type = "info";
					$message = i18n.MESSAGE.no_top_button;
				}
			}
        }

        if ($message_type) {
			if ($message_link) {
				$('<a></a>')
					.addClass("message_container "+$message_type)
					.text($message)
					.attr("href", linkToSelectedProfile)
					.attr("target", "_blank")
					.appendTo(".sizeme_slider .slider_text_more_below");
			} else {
				$('<div></div>')
					.addClass("message_container "+$message_type)
					.text($message)
					.appendTo(".sizeme_slider .slider_text_more_below");
			}
        }
    }

    function selectToButtons(element) {
        $(element+" select").hide();
        var numClass = "num_"+$(element+" option").length;
        var $content = $(document.createElement("div")).addClass("sm-buttonset "+numClass);
        $(element+" option").each(function() {
            var thisId = this.id;
            var thisLabel = sizeText($(this).text());
            var thisClass = $(this).attr("class");
            var thisVal = $(this).val();
            var $div = $('<div>')
                .addClass('sm-button '+thisClass)
                .attr("id", "button_"+thisId)
                .text(thisLabel)
                .on("click", function() {
                    $(".sm-buttonset").find(".sm-selectable").removeClass("sm-state-active");
                    $(".element_for_"+thisVal).addClass("sm-state-active");
                    $(sizeme_UI_options.sizeSelectionContainer).find("select").val(thisVal);
                    $(sizeme_UI_options.sizeSelectionContainer).find("select").change();	// yell change
                    SizeMe.trackEvent("sizeChanged", "Store: Product size changed");
                });
            $content.append($div);
        });
        $(element).append($content);
    }

    function getMaxY(data) {
        var max = 0;
        for (var i = 0; i < data.coords.length; i++) { max = Math.max(max, data.coords[i].Y); }
        return max;
    }

    function getMaxX(data) {
        var max = 0;
        for(var i = 0; i < data.coords.length; i++) { max = Math.max(max, data.coords[i].X); }
        return max;
    }

    function getMinX(data) {
        var min = 99999;
        for(var i = 0; i < data.coords.length; i++) { min = Math.min(min, data.coords[i].X); }
        return min;
    }

    function getMinY(data) {
        var min = 99999;
        for(var i = 0; i < data.coords.length; i++) { min = Math.min(min, data.coords[i].Y); }
        return min;
    }

    function getArced(p1, p2) {
        var dX = p2.X - p1.X;
        p2.cp1X = p1.X + Math.round(dX / arcRadius); p2.cp1Y = p1.Y + Math.round(dX / arcRadius);
        p2.cp2X = p2.X - Math.round(dX / arcRadius); p2.cp2Y = p2.Y + Math.round(dX / arcRadius);
        return true;
    }

    function liftCoords(data) {
        data.nX = 0; data.nY = 0;
        if (data.lift) {
            for(var i = 1; i < data.coords.length; i++) {
                var dX = data.coords[i].X - data.coords[i-1].X;
                var dY = data.coords[i].Y - data.coords[i-1].Y;
                var angleA = Math.atan2(dY, dX);
                data.nX = Math.sin(angleA) * arrowLift;
                data.nY = -Math.cos(angleA) * arrowLift;
            }
        }
        return true;
    }

    function getMidPoints(data) {
        var dX = data.coords[1].X - data.coords[0].X;  var dY = data.coords[1].Y - data.coords[0].Y;
        data.mid = {X: Math.round(dX / 2)+data.coords[0].X, Y: Math.round(dY / 2)+data.coords[0].Y };
        if (data.style === "arc") { data.mid.Y += Math.round(dX / arcRadius * 0.7); }
    }

    function plotItem(c, data, isArrow, scale, offsetX, offsetY, highlighted) {
        function pX(coord) {
            return (coord*scale)+offsetX;
        }
        function pY(coord) {
            return (coord*scale)+offsetY;
        }

        var i, j, lcp;

        c.beginPath();

        if (isArrow) {	// ARROW
            c.lineWidth = arrowLineWidth;
            if (highlighted) {
                c.lineWidth = arrowLineWidth + 2;
            }
            liftCoords(data);
            c.moveTo(pX(data.coords[0].X+data.nX), pY(data.coords[0].Y+data.nY));
            for(i = 1; i < data.coords.length; i++) {
                switch (data.style) {
                    case "circle":
                        getArced(data.coords[i-1], data.coords[i]);
                        c.bezierCurveTo(pX(data.coords[i].cp1X+data.nX), pY(data.coords[i].cp1Y+data.nY),
                            pX(data.coords[i].cp2X+data.nX), pY(data.coords[i].cp2Y+data.nY),
                            pX(data.coords[i].X+data.nX), pY(data.coords[i].Y+data.nY));
                        c.bezierCurveTo(pX(-data.coords[i].cp1X+data.nX), pY(-data.coords[i].cp1Y+data.nY),
                            pX(-data.coords[i].cp2X+data.nX), pY(-data.coords[i].cp2Y+data.nY),
                            pX(data.coords[0].X+data.nX), pY(data.coords[0].Y+data.nY));
                        break;
                    case "arc":
                        getArced(data.coords[i-1], data.coords[i]);
                    /* falls through */
                    case "line":
                        if (typeof data.coords[i].cp1X !== 'undefined') {
                            c.bezierCurveTo(pX(data.coords[i].cp1X+data.nX), pY(data.coords[i].cp1Y+data.nY), pX(data.coords[i].cp2X+data.nX), pY(data.coords[i].cp2Y+data.nY), pX(data.coords[i].X+data.nX), pY(data.coords[i].Y+data.nY));
                        } else {
                            c.lineTo(pX(data.coords[i].X+data.nX), pY(data.coords[i].Y+data.nY));
                        }
                        break;
                }
            }
            c.stroke();

            if (data.style === "line") {
                // start and end circles
                c.beginPath(); c.arc(pX(data.coords[0].X+data.nX), pY(data.coords[0].Y+data.nY), arrowEndRadius, 0, Math.PI*2, true); c.fill();
                c.beginPath(); c.arc(pX(data.coords[data.coords.length-1].X+data.nX), pY(data.coords[data.coords.length-1].Y+data.nY), arrowEndRadius, 0, Math.PI*2, true);	c.fill();
            }

            // mid circle
            getMidPoints(data);
            if (typeof data.midCircle !== 'undefined') { data.mid.X = data.midCircle.X; data.mid.Y = data.midCircle.Y; }
            var rad = arrowNumberRadius;
            if (highlighted) {
                rad += 5;
            }
            c.beginPath(); c.arc(pX(data.mid.X+data.nX), pY(data.mid.Y+data.nY), rad, 0, Math.PI*2, true); c.fill();
            c.beginPath(); c.fillStyle = "#FFFFFF"; c.font = arrowNumberFont; c.textAlign = "center"; c.textBaseline = "middle";
            if (highlighted) {
                c.font = arrowNumberHighlightFont;
            }
            c.fillText(data.num, pX(data.mid.X+data.nX), pY(data.mid.Y+data.nY));

        } else {	// ITEM
            c.fillStyle = fillColor; c.strokeStyle = fillColor; c.lineWidth = 0.1;

            c.moveTo(pX(data.coords[0].X), pY(data.coords[0].Y));

            for(i = 1; i < data.coords.length; i++) {
                if (typeof data.coords[i].cp1X !== 'undefined') {
                    c.bezierCurveTo(pX(data.coords[i].cp1X), pY(data.coords[i].cp1Y), pX(data.coords[i].cp2X), pY(data.coords[i].cp2Y), pX(data.coords[i].X), pY(data.coords[i].Y));
                } else {
                    c.lineTo(pX(data.coords[i].X), pY(data.coords[i].Y));
                }
            }

            if (data.mirror) {
                lcp = [{X: null, Y: null}, {X: null, Y: null}];

                for(i = data.coords.length-1; i >= 0; i--) {
                    if (lcp[0].X) {
                        c.bezierCurveTo(pX(lcp[0].X), pY(lcp[0].Y), pX(lcp[1].X), pY(lcp[1].Y), pX(-data.coords[i].X), pY(data.coords[i].Y));
                    } else {
                        c.lineTo(pX(-data.coords[i].X), pY(data.coords[i].Y));
                    }

                    if (typeof data.coords[i].cp1X !== 'undefined') {
                        lcp[0].X = -data.coords[i].cp2X; lcp[0].Y = data.coords[i].cp2Y;
                        lcp[1].X = -data.coords[i].cp1X; lcp[1].Y = data.coords[i].cp1Y;
                    } else {
                        lcp = [{X: null, Y: null}, {X: null, Y: null}];
                    }
                }
            }

            c.fill();
            c.stroke();

            // accents
            c.fillStyle = drawColor; c.strokeStyle = drawColor; c.lineWidth = itemLineWidth;
            c.lineCap = "butt"; c.lineJoin = "miter"; c.miterLimit = 1;

            for(i = 0; i < data.accents.length; i++) {
                c.beginPath();
                if (data.accents[i].type === "circle") {
                    c.arc(pX(data.accents[i].coords[0].X), pY(data.accents[i].coords[0].Y), data.accents[i].coords[0].R*realCanvasWidth/1000, 0, Math.PI*2, true);
                } else {
                    c.moveTo(pX(data.accents[i].coords[0].X), pY(data.accents[i].coords[0].Y));
                    for(j = 1; j < data.accents[i].coords.length; j++) {
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
                        c.moveTo(pX(-data.accents[i].coords[data.accents[i].coords.length-1].X), pY(data.accents[i].coords[data.accents[i].coords.length-1].Y));
                        for(j = data.accents[i].coords.length-1; j >= 0; j--) {
                            if (lcp[0].X) {
                                c.bezierCurveTo(pX(lcp[0].X), pY(lcp[0].Y), pX(lcp[1].X), pY(lcp[1].Y), pX(-data.accents[i].coords[j].X), pY(data.accents[i].coords[j].Y));
                            } else {
                                c.lineTo(pX(-data.accents[i].coords[j].X), pY(data.accents[i].coords[j].Y));
                            }

                            if (typeof data.accents[i].coords[j].cp1X !== 'undefined') {
                                lcp[0].X = -data.accents[i].coords[j].cp2X; lcp[0].Y = data.accents[i].coords[j].cp2Y;
                                lcp[1].X = -data.accents[i].coords[j].cp1X; lcp[1].Y = data.accents[i].coords[j].cp1Y;
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
            $("#"+canvas_id).attr("width", realCanvasWidth).attr("height", realCanvasHeight);

            // get scale and offsets
            var canvasWidth = realCanvasWidth * (1-(2*padding));
            var canvasHeight = realCanvasHeight * (1-(2*padding));

            var maxX = getMaxX(item_drawing) - getMinX(item_drawing);
            if (item_drawing.mirror) {
                maxX = getMaxX(item_drawing) * 2;
            }
            var maxY = getMaxY(item_drawing) - getMinY(item_drawing);
            var scale = 1;
            if (maxX !== 0) {
                scale = canvasWidth / maxX;
            }
            if (maxY !== 0 && (canvasWidth/canvasHeight) > (maxX/maxY)) {
                scale = canvasHeight / maxY;
            }

            var offsetX = (realCanvasWidth - ((getMaxX(item_drawing) + getMinX(item_drawing)) * scale)) / 2;
            if (item_drawing.mirror) {
                offsetX = realCanvasWidth / 2;
            }
            var offsetY = (realCanvasHeight - ((getMaxY(item_drawing) + getMinY(item_drawing))*scale)) / 2;

            // item
            plotItem(c, item_drawing, false, scale, offsetX, offsetY, false);
            var inputKey = $(sizeme_UI_options.sizeSelectionContainer).find("select").val();

            // arrows
            if (matchMap) {
                // Detailed
                sizeme_product.item.measurements[inputKey].each(function(measurement) {
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
						sizeme_product.item.measurements[inputKey].each(function(measurement) {
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
                position: { my: "center", at: "center", of: window },
                autoOpen: false,
                dialogClass: "sizeme_detailed_view_window",
                minHeight: 620,
                minWidth: 940,
				scaleH: 1,
				scaleW: 1,
				closeText: i18n.COMMON.close_text,
                title: txts.window_title+' <span class="name">'+itemName+'</span>'
            });

        // add toggle link to main page
        $("<a class='a_button sm_detailed_view"+(isSizeGuide ? " size_guide" : "")+"' id='popup_opener' href='#'>"+txts.button_text+"</a>")
            .click(function() {
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
                .append("<h2>"+i18n.COMMON.shopping_for+"</h2>")
                .append("<div class='shopping_for'></div>")
                .appendTo("#col2");

            // clone buttons to second
            var $clone = $(sizeme_UI_options.sizeSelectionContainer).clone(true, true);
            $clone.find("[id]").each(function() {
                this.id = "clone_"+this.id;
                $(this).addClass("cloned");
                if (this.name) {
                    this.name = "clone_"+this.name;
                }
            });
            $("<div class='sizeme_detailed_section'></div>")
                .append("<h2>"+i18n.COMMON.selected_size+"</h2>")
                .append($clone)
                .appendTo("#col2");

            // clone slider (without detailed view toggler and in content stuff)
            var $slider_clone = $(".sizeme_slider")
                .clone(true, true)
                .find(".slider_text_below").remove()
                .end();

            $("<div class='sizeme_detailed_section'></div>")
                .append("<h2>"+i18n.FIT_INFO.overall_fit+"</h2>")
                .append($slider_clone)
                .appendTo("#col2");
        }

        // write detailed table to col 2
        $("<div class='sizeme_detailed_section'></div>")
            .append("<h2>"+txts.table_title+"</h2>")
            .append("<table id='detailed_table'><tbody></tbody></table>")
            .appendTo("#col2");

        // bind hover event to run_highlights
        $("#detailed_table").on("mouseenter", ".run_highlight", function () {
            var highlight = $(this).data("measurement");
            $(this).find("td.cell_"+highlight).addClass("highlighted");
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
            $(this).find("td.cell_"+highlight).removeClass("highlighted");
            writeItemCanvas('sizeme_item_view', $("#detailed_table").find("tbody").data("matchMap"), "");
            if (sizeme_local_options.fitAreaSlider) {
                killExtraSlider();
            }
        });

        // disclaimers
        if (isSizeGuide) {
            var $txt = i18n.SIZE_GUIDE.measurement_disclaimer;
            if (hasNeckOpening()) {
                $txt += "<br />"+i18n.SIZE_GUIDE.measurement_disclaimer_collar;
            }
            if (isInside()) {
                $txt = i18n.SIZE_GUIDE.measurement_disclaimer_inside;
            }
            $("<div class='sizeme_explanation'></div>")
                .append("<p>"+$txt+"</p>")
                .appendTo("#col2");

            if (sizeme_options.service_status === "on") {
                $("<div class='sizeme_advertisement'></div>")
                    .append("<p>"+i18n.SIZE_GUIDE.advertisement+" " +
                        "<a id='sizeme_ad_link' href='" + SizeMe.contextAddress + "' class='logo' target='_blank'></a></p>")
                    .appendTo("#sizeme_detailed_view_content");
                $("#sizeme_ad_link").on("click", function() {
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
        for(var $i = 0; $i < missingMeasurements.length; $i++) {
            if (missingMeasurements[$i][0] === measurement) {
                return missingMeasurements[$i][1];
            }
        }
        return null;
    }

    function isPinched(measurement) { return (PINCHED_FITS.indexOf(measurement) >= 0); }
    function isLongFit(measurement) { return (LONG_FITS.indexOf(measurement) >= 0); }

    function isPinchedTxt(measurement) {
        if (isPinched(measurement)) {
            return " "+i18n.FIT_INFO.when_pinched;
        }
        return "";
    }

    function getStretchedTxt(stretch_value) {
        if (stretch_value > 0) {
            if (stretch_value < 25) {
                return i18n.FIT_INFO.stretched_little+"  ";
            } else if (stretch_value < 75) {
                return i18n.FIT_INFO.stretched_somewhat+"  ";
            } else if (stretch_value < 95) {
                return i18n.FIT_INFO.stretched_much+"  ";
            } else {
                return i18n.FIT_INFO.stretched_max+"  ";
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
            sizeme_product.item.measurements[inputKey].each(function(measurement) {
                if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                    var $txt = '<span class="num">'+(++$i)+'</span>'+i18n.MEASUREMENT[measurement];
                    if (measurement_arrows[measurement]) {
                        measurement_arrows[measurement].num = $i;
                    }
                    $row.append($(document.createElement("td")).html($txt).addClass("run_highlight cell_"+measurement).data("measurement", measurement));
                }
            });
            $table.append($row);

            var $tip_txts = [];
            var $tip_classes = [];

            if (sizeme_local_options.writeOverlaps) {
                $row = $(document.createElement("tr")).addClass("data_row");
                sizeme_product.item.measurements[inputKey].each(function(measurement) {
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
                        $tip_txts[measurement] = i18n.FIT_INFO.the_item+" "+i18n.MEASUREMENT[measurement].toLowerCase()+" "+i18n.FIT_INFO.the_measurement+" ";

                        if (matchMap[measurement]) {
                            $txt = (matchMap[measurement].overlap/10).toFixed(1)+" cm";
                            if (isPinched(measurement)) {
                                $txt = (matchMap[measurement].overlap/20).toFixed(1)+" cm";
                            }
                            if ((matchMap[measurement].overlap <= 0) && (matchMap[measurement].componentFit >= 1000)) {
                                $txt = "0.0 cm";
                            }

							switch(measurement) {
								case "sleeve":
									var $sleeve_txt = "<div class='sleeve" + (matchMap[measurement].overlap < 0 ? " negative_overlap" : "") + "'>";
									var $sleeve_height = Math.round(29 + (75*(matchMap[measurement].percentage / 0.3)));	// zero-point + (wrist_to_finger * (overlap_percentage / normal_finger_ratio))
									$sleeve_height = Math.max(11, $sleeve_height);	// never under 11 (34 px)
									$sleeve_height = Math.min(105, $sleeve_height);	// never over overlap image height

									$meas_top = Math.round((($sleeve_height - 29) / 2)+29-9);
									if (($sleeve_height - 29) < 14) { // no fit in middle if no room
										$meas_top = $sleeve_height+23;
									}
									if (matchMap[measurement].overlap < 0) {
										$sleeve_txt += "<div class='meas' style='top:14px;left:-7px;'>"+$txt+"</div>";	// negative overlap in different place
										if (matchMap[measurement].componentFit >= 1000) {
											$sleeve_height = 29;
										}
									} else {
										$sleeve_txt += "<div class='meas' style='top:"+$meas_top+"px;";
										if (matchMap[measurement].overlap >= 100) {
											$sleeve_txt += "left:-7px;";
										}
										$sleeve_txt += "'>"+$txt+"</div>";	// mid point?
									}

									$sleeve_txt += "<div class='sleeve_overlap' style='height:"+($sleeve_height+23)+"px;'></div>";	// sleeve + image bottom clearance
									$sleeve_txt += "</div>";
									$tip_txts[measurement] = $sleeve_txt + $tip_txts[measurement];
									break;
								case "front_height":
									var $front_height_txt = "<div class='front_height" + (matchMap[measurement].overlap < 0 ? " negative_overlap" : "") + "'>";
									var $front_height_height = Math.round(25 + (matchMap[measurement].percentage*(9 / 0.05)));	// zero-point + (overlap_percentage * (pant waistband height in px / pant waistband in %))
									$front_height_height = Math.max(0, $front_height_height);	// never under 0 (+23 = 34 px)
									$front_height_height = Math.min(105, $front_height_height);	// never over overlap image height (+23 px)

									$meas_top = Math.round((($front_height_height - 25) / 2)+25-9);
									if (($front_height_height - 25) < 12) { // no fit in middle if no room
										$meas_top = $front_height_height+23;
									}
									if (matchMap[measurement].overlap < 0) {
										$front_height_txt += "<div class='meas' style='top:14px;left:-7px;'>"+$txt+"</div>";	// negative overlap in different place
										if (matchMap[measurement].componentFit >= 1000) {
											$front_height_height = 28;
										}
									} else {
										$front_height_txt += "<div class='meas' style='top:"+$meas_top+"px;";
										if (matchMap[measurement].overlap >= 100) {
											$front_height_txt += "left:-12px;";
										}
										$front_height_txt += "'>"+$txt+"</div>";	// mid point?
									}

									$front_height_txt += "<div class='front_height_overlap' style='height:"+($front_height_height+23)+"px;'></div>";	// front_height + image (arrow) bottom clearance
									$front_height_txt += "</div>";
									$tip_txts[measurement] = $front_height_txt + $tip_txts[measurement];
									break;
                            }	// end switch measurement					

                            if (matchMap[measurement].overlap <= 0) {
                                if (matchMap[measurement].componentFit >= 1000) {
                                    $txt = "0.0 cm";
                                    $tip_txts[measurement] += i18n.FIT_INFO.no_overlap+"  ";
                                    $tip_txts[measurement] += getStretchedTxt(matchMap[measurement].componentStretch);
                                } else {
                                    $tip_txts[measurement] += i18n.FIT_INFO.is_smaller+" ";
                                    $tip_txts[measurement] += $txt.replace("-","");
                                    $tip_txts[measurement] += isPinchedTxt(measurement)+".  ";
                                }
                            } else {
                                if (isPinched(measurement)) {
                                    $tip_txts[measurement] = "<div class='pinched'><div class='meas'>"+$txt+"</div></div>" + $tip_txts[measurement];
                                }

                                $txt = "+"+$txt;
                                $tip_txts[measurement] += i18n.FIT_INFO.overlaps_you+" <b>"+$txt+"</b>"+isPinchedTxt(measurement);
                                if (measurement === "sleeve") {
                                    $tip_txts[measurement] += " "+i18n.FIT_INFO.arm_sleeve_straight;
                                }
                                $tip_txts[measurement] += ".  ";
                            }

                            if (matchMap[measurement].componentFit > 0) {
                                var $fitVerdict = i18n.FIT_VERDICT[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];
                                if (isLongFit(measurement)) {
                                    $fitVerdict = i18n.FIT_VERDICT_LONG[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];
                                }
                                $tip_txts[measurement] += i18n.FIT_INFO.sm_considers_fit+" <b>"+$fitVerdict.toLowerCase()+"</b>.";
                            }

                        } else if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                            $txt = (sizeme_product.item.measurements[inputKey][measurement]/10).toFixed(1)+" cm";
                            $tip_txts[measurement] += i18n.COMMON.is+" "+$txt+".  ";
                            if (missingMeasurements) {
                                if (getMissingMeasurement(missingMeasurements, measurement) !== null) {
                                    $tip_txts[measurement] += i18n.MESSAGE.add_this_measurement;
                                }
                            }
                        }

                        var $cell = $(document.createElement("td"))
                            .text($txt)
                            .attr("id","overlap_"+measurement)
                            .addClass("run_highlight cell_"+measurement)
                            .data("measurement", measurement);
                        $row.append(colorCell($cell, matchMap[measurement], measurement_arrows[measurement]));
                        $tip_classes[measurement] = "";
                        if (isPinched(measurement)) {
                            $tip_classes[measurement] = "isPinched";
                        }
                        if (measurement === "sleeve") {
                            $tip_classes[measurement] = "sleeve";
                        }
                        $tip = new Opentip($cell, $tip_txts[measurement], { className: $tip_classes[measurement] } );
                    }
                });
                $table.append($row);
            }

            $row = $(document.createElement("tr")).addClass("data_row fit_label_row");
            sizeme_product.item.measurements[inputKey].each(function(measurement, value) {
                var $cell;
                if (matchMap[measurement]) {
                    if (matchMap[measurement].componentFit > 0) {
                        $txt = i18n.FIT_VERDICT[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];
						
                        if (isLongFit(measurement)) {
                            $txt = i18n.FIT_VERDICT_LONG[getFit(matchMap[measurement].componentFit, matchMap[measurement].importance).label];
                        }
						
                        $cell = $(document.createElement("td"))
                            .html('<div>'+$txt+'</div>')
                            .addClass("run_highlight")
                            .data("measurement", measurement);
						
                        $row.append(colorCell($cell, matchMap[measurement], measurement_arrows[measurement]));
                    } else if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                        $txt = "";
                        $cell = $(document.createElement("td"))
                            .html($txt)
                            .addClass("info run_highlight cell_"+measurement)
                            .data("measurement", measurement);
                        $row.append($cell);
                    }
                } else if (sizeme_product.item.measurements[inputKey][measurement] > 0) {
                    $txt = "";
                    var $class = "",
                        missing;
                    if (missingMeasurements) {
                        if ((missing = getMissingMeasurement(missingMeasurements, measurement)) !== null) {
                            $txt = "<a target='_blank' href='"+linkToSelectedProfile+"#"+missing+"'>"+i18n.COMMON.add_to_profile+"</a>";
                            $class = " add";
                        }
                    }
                    $cell = $(document.createElement("td"))
                        .html($txt)
                        .addClass("info run_highlight cell_"+measurement+$class)
                        .data("measurement", measurement);
                    $row.append($cell);
                }
                if ($cell) {
                    $tip = new Opentip($cell, $tip_txts[measurement], { className: $tip_classes[measurement] } );
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
                    $txt = '<span class="num">'+(++$i)+'</span>'+i18n.MEASUREMENT[measurement];
                    if (measurement_arrows[measurement]) {
                        measurement_arrows[measurement].num = $i;
                    }
                    $row.append($(document.createElement("td")).html($txt).addClass("run_highlight cell_"+measurement).data("measurement", measurement));
                }
            }
            $table.append($row);

            for ($i=0;$i<sizeKeys.length;$i++) {
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
                        $txt = (sizeme_product.item.measurements[key][measurement]/10).toFixed(1);
                        $cell = $(document.createElement("td")).text($txt+" cm").addClass("run_highlight cell_"+measurement).data("measurement", measurement);
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
        var $tip_txt = i18n.FIT_INFO.overall_fit_for_size+" "+sizeText(thisSize)+"</b>";
        $tip_txt += " "+i18n.COMMON.is+" <b>"+i18n.FIT_VERDICT[getFit(thisFit, 1).label].toLowerCase()+"</b>";
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
        headerHtml += "<div class='shopping_for'>"+i18n.COMMON.fetching_profiles+"</div>";
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
		headerHtml += "<a href='" + SizeMe.contextAddress + "/?mode=signup' target='_blank' class='a_button' id='sizeme_btn_sign_up' title='"+i18n.SPLASH.btn_sign_up_label.replace(/'/g, "&#39;")+"'>";
		headerHtml += i18n.SPLASH.btn_sign_up_title+"</a>";
		headerHtml += "</li>";
        headerHtml += "<li class='log_in'><a href='#' class='a_button' id='sizeme_btn_login' title='"+i18n.SPLASH.btn_log_in_label.replace(/'/g, "&#39;")+"'>"+i18n.SPLASH.btn_log_in_title+"</a></li>";
        headerHtml += "<li class='no_thanks'><td><a href='#' class='a_button' id='sizeme_btn_no_thanks' title='"+i18n.SPLASH.btn_no_thanks_label.replace(/'/g, "&#39;")+"'>"+i18n.SPLASH.btn_no_thanks_title+"</a></li>";
        headerHtml += "</ul></div>";
        return headerHtml;
    }

    function getProductSplash() {
        // *** SizeMe Splash in Product page
        var splashHtml = "<div id='sizeme_product_splash'>";
		splashHtml += "<p>"+i18n.SPLASH.product_page_splashes[0]+" ";
		splashHtml += "<a href='" + SizeMe.contextAddress + "' target='_blank' id='sizeme_product_page_link' title='"+i18n.SPLASH.product_page_splash_title+"'></a>";
		splashHtml += "<a href='#' id='sizeme_btn_no_thanks_product_splash' title='"+i18n.COMMON.close_text+"'></a>";
        splashHtml += "</p></div>";
        return splashHtml;
    }

    function findMaxMeasurement() {
        var maxVal = 0;
        sizeme_product.item.measurements.each(function(key, measurement_set) {
            sizeme_product.item.measurements[key].each(function(key_2, value) { maxVal = Math.max(value, maxVal); });
        });
        return maxVal;
    }

    var DataStorage = (function() {

        function DataStorage(type) {
            if (storageAvailable(type)) {
                this.storage = window[type];
            } else{
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

        DataStorage.prototype.withStorage = function(callback) {
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
        Storage.withStorage(function(storage) {
            storage.removeItem('authToken');
        });
    }

    function getAuthToken() {
        var deferred = $.Deferred();

        Storage.withStorage(function(storage) {
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
                    Storage.withStorage(function(storage) {
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
            function(authToken) {
                deferred.resolve(new SizeMe(authToken));
            }, function() {
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
    $(function() {

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
			$(sizeme_UI_options.addToCartElement).on(sizeme_UI_options.addToCartEvent, function() {
				if (isLoggedIn()) {
					SizeMe.trackEvent("addToCartSM", "Store: Product added to cart by SizeMe user");
				} else {
					SizeMe.trackEvent("addToCart", "Store: Product added to cart");
				}

			});
		}

        var getMatchResponseHandler = function(prodId, sizeme_product) {
            if (!systemsGo) {
                return function() {};
            }
            return function(responseMap) {
                var smallestOffset = 9999,  // for recommendation
                    thisVal, thisId, thisData, thisSize;

                responseMap.each(function(key, result) {
                    var classKey = ".element_for_" + key;
                    $(classKey)
                        .removeClass('sm-too_small sm-slim sm-regular sm-loose sm-very_loose sm-huge sm-too_big')
                        .addClass('sm-'+result.fitRangeLabel);

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
                    $("#input_" + key).data("fitData", { totalFit: result.totalFit,
                        fitRangeLabel: result.fitRangeLabel,
                        matchMap: result.matchMap,
                        missingMeasurements: result.missingMeasurements,
                        accuracy: result.accuracy,
                        inputKey: key });
                });

                // bind change to inputs
                $(sizeme_UI_options.sizeSelectionContainer).find("select").change(function() {
                    thisVal = $(this).val();
                    thisId = '#input_'+thisVal;
                    thisData = $(thisId).data("fitData");
                    thisSize = $(thisId).text();
                    if (thisVal) {
                        updateSlider(thisSize, thisData, (thisVal === recommendedId), sizeme_UI_options.detailedViewContainer, true);
                    }
                    // relay change to cloned and vice versa
                    $(sizeme_UI_options.sizeSelectionContainer).find("select").val(thisVal);
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
                    thisId = '#input_'+$(sizeme_UI_options.sizeSelectionContainer).find("select").val();
                    if ($(thisId).data("fitData")) {
                        thisData = $(thisId).data("fitData");
                        thisSize = $(thisId).text();
                        updateSlider(thisSize, thisData, true, sizeme_UI_options.detailedViewContainer, true);
                    }
                }
            };
            // end of function 	getMatchResponseHandler
        };

        var matchErrorHandler = function() {
			// this is called when the match function returns an error.  This is most likely due to a wrong or unadded itemType and only visible when the user is logged in.
			// if the itemType is
			$(".sizeme_slider").hide();
			console.error("SizeMe: error in match function.  Please contact your local SizeMe dealer.");

            // end of function 	matchErrorHandler
        };


        var loggedInCb = function(sizeMeObj) {

            function setProfileLink() {
                if (selectedProfile === null) {
                    linkToSelectedProfile = SizeMe.contextAddress + "/account/profiles.html";
                } else {
                    linkToSelectedProfile = SizeMe.contextAddress + "/account/profiles/" + selectedProfile + "/profile.html";
                }
            }

            var doProfileChange = function(newValue) {
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
                    var $new = "<div id='sizeme_header_container'>"+getStandardHeader()+"</div>";

                    // Prepend header to body
                    $(sizeme_UI_options.appendContentTo).append(getSliderHtml(systemsGo));
                    $(".sizeme_slider .slider_text_below").append($new);
                    $("#sizeme_header.in_content").find("#logo").on("click", function() {
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

                        $(".shopping_for").empty().html("<span class='shopping_for_text'>"+i18n.COMMON.shopping_for+": </span>")
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
                            .html("<span class='shopping_for_text no-profile'>"+i18n.MESSAGE.no_profiles+"</span>");
                        $(".sizeme_detailed_section .shopping_for")
                            .append(
                                $("<span>").addClass("shopping_for_text no-profile")
                                    .html(i18n.MESSAGE.no_profiles+" "+i18n.COMMON.go_to+
                                        "<a id='logged_in_link' href='" + linkToSelectedProfile + "' target='_blank'>" + i18n.COMMON.my_profiles + "</a> "+i18n+COMMON.and_create_one)
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

        var loggedOutCb = function() {

            loadArrows(true);

            // Size Guide for non-loving users
            writeDetailedWindow(true);
            updateDetailedTable();

			// Makia live temporary exception
			// Show size guide text only if there actually is a size guide (otherwise hidden with css)
			$(".sizeme p").show();

            // bind change to select
            $(sizeme_UI_options.sizeSelectionContainer).find("select").change(function() {
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
                $("#sizeme_btn_login").click(function() {
					SizeMe.trackEvent("clickLogin", "Store: Login clicked");
                    clearAuthToken();
                    SizeMe.loginFrame(function() {
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
                $("#sizeme_btn_no_thanks").on("click", function() {
                    SizeMe.trackEvent("noThanks", "Store: SizeMe, no thanks");
                    createCookie("sizeme_no_thanks", "true", cookieLifetime);
                    $(".splash").hide();
					$("#sizeme_btn_no_thanks_product_splash").trigger("click");		// also close possible product splasher
                    return false;
                });

				// Product page splash
				if (!noProductSplash()) {
					$(sizeme_UI_options.appendSplashTo).append(getProductSplash());
					$("#sizeme_btn_no_thanks_product_splash").on("click", function() {
						SizeMe.trackEvent("noProductSplash", "Store: Product splash closed");
						createCookie("sizeme_no_product_splash", "true", cookieLifetime);
						$("#sizeme_product_splash").slideUp();
						return false;
					});

					$("#sizeme_product_page_link").on("click", function() {
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
    function createCookie(name,value,days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = "; expires="+date.toGMTString();
        }
        else {
            expires = "";
        }
        document.cookie = name+"="+value+expires+"; path=/";
    }

    function readCookie(name) {
        var ca = document.cookie.split(';'), c;
        for (var i=0;i<ca.length;i++) {
            c = ca[i].trim().split('=');
            if (c[0] === name) {
                return c[1];
            }
        }
        return null;
    }

    function eraseCookie(name) {
        createCookie(name,"",-1);
    }

})(jQuery);

/* globals jQuery: false */

var sizeme_UI_options = {
	appendContentTo: ".sizeme-size-guide",
	appendSplashTo: ".descriptionholder .variationdataholder-size",
	sizeSelectionContainer: ".descriptionholder .variationdataholder-size",
	addToCartElement: ".addtocartlink",
	addToCartEvent: "click",
	lang: "en"
};

jQuery.noConflict(true);