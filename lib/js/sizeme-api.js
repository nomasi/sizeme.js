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
      Fetches item types and their measurement properties from the server.
      Returned object contains item type id ("id") as a key and an object
      containing the name of the item type ("name") and defined properties
      of the item type as an array ("properties")
    
      @param [Function] callback
      @param [Function] errorCallback
     */

    SizeMe.prototype.getItemTypes = function(callback, errorCallback) {
      if (errorCallback == null) {
        errorCallback = defaultErrorCallback;
      }
      createCORSRequest("GET", "/api/itemTypes", function(xhr) {
        SizeMe.trackEvent("getItemTypes", "API: getItemTypes");
        return callback(JSON.parse(xhr.responseText));
      }, function(xhr) {
        return errorCallback(xhr, xhr.status, xhr.statusText);
      }).send();
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
      @param [SizeMe.Item] item object containing the item information
     */
    function FitRequest(profileId, item) {
      this.profileId = profileId;
      this.item = item;
    }

    return FitRequest;

  })();


  /*
  A class for holding the information for specific item.
   */

  SizeMe.Item = (function() {

    /*
      @param [Number] itemType the type of the Item
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
     */

    Item.prototype.addSize = function(size, measurements) {
      this.measurements.addItem(size, measurements);
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
