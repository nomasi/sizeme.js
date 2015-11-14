###
 Helper object to handle the communication to the SizeMe server.
  Exposes two functions to fetch the profiles for the accountInfo and
  get the match results for the items.

  @version 2.0
###
class SizeMe

  ###
    Address for the SizeMe API service
  ###
  @contextAddress = "https://www.sizeme.com"

  ###
    Version of the API
  ###
  @version = "2.0"

  _authToken = undefined
  _facepalm = not ("withCredentials" of new XMLHttpRequest())

  ###
    Creates a new instance of SizeMe

    @param [Object] authToken the authentication token for the SizeMe service,
      obtained with the {SizeMe.getAuthToken} method.
  ###
  constructor: (authToken) ->
    _authToken = authToken

  addMessageListener = (callback) ->
    if window.attachEvent? then window.attachEvent "onmessage", callback
    else window.addEventListener "message", callback

  removeMessageListener = (callback) ->
    if window.detachEvent? then window.detachEvent "onmessage", callback
    else window.removeEventListener "message", callback


  createCORSRequest = (method, service, callback, errorCallback) ->
    xhr = undefined
    url = "#{SizeMe.contextAddress}#{service}"

    if not _facepalm
      xhr = new XMLHttpRequest()
      xhr.onreadystatechange = ->
        if xhr.readyState is 4
          if xhr.status >= 200 and xhr.status < 300
            callback(xhr)
          else
            errorCallback(xhr)
      xhr.open(method, url, true)
      xhr.setRequestHeader(
        "Authorization", "Bearer #{_authToken}"
      ) if _authToken?
    else if XDomainRequest?
      xhr = new XDomainRequest()
      url = "#{url}?_tm=#{new Date().getTime()}"
      url = "#{url}&authToken=#{_authToken}" if _authToken?
      xhr.onload = -> callback(xhr)
      xhr.onerror = -> errorCallback(xhr)
      xhr.open(method, url, true)
    else
      console.error "Unsupported browser"
    xhr

  defaultErrorCallback = (xhr, status, statusText) ->
    console.log("Error: #{statusText} (#{status})") \
      if window.console and console.log

  ###
    Tries to fetch a new auth token from the SizeMe service. User needs to be
    logged in to the service to receive a valid token.

    The returned token is passed as an argument to the callback function. If
    user is not logged in, the returned token is null.

    This function is executed asynchronously, so it will return immediately.

    @param [Function] callback
      function to execute after the request is completed
    @param [Function] errorCallback function to execute if there was an error
  ###
  @getAuthToken = (callback, errorCallback = defaultErrorCallback) ->
    if _facepalm
      iframe = document.createElement("iframe")
      cb = (event) ->
        if event.origin == SizeMe.contextAddress
          tokenObj = event.data
          removeMessageListener(cb)
          document.body.removeChild(iframe)
          callback?(tokenObj) if callback?
        return
      addMessageListener(cb)
      iframe.setAttribute("src", "#{SizeMe.contextAddress}/api/authToken.html")
      iframe.setAttribute("style", "display:none")
      document.body.appendChild(iframe)

    else
      xhr = createCORSRequest("GET", "/api/authToken",
        (xhr) -> callback(JSON.parse(xhr.responseText))
      ,
        (xhr) -> errorCallback(xhr, xhr.status, xhr.statusText)
      )
      xhr.withCredentials = true
      xhr.send()
    return

  createFitResponse = (xhr) ->
    response = JSON.parse(xhr.responseText)
    responseMap = new SizeMe.Map()
    for own size, fitResponse of response
      fitResponse.matchMap = SizeMe.Map.fromObject(fitResponse.matchMap)
      responseMap.addItem(size, fitResponse)
    responseMap

  ###
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
  ###
  fetchProfilesForAccount: (callback, errorCallback = defaultErrorCallback) ->
    createCORSRequest("GET", "/api/profiles",
      (xhr) -> callback(JSON.parse(xhr.responseText))
    ,
      (xhr) -> errorCallback(xhr, xhr.status, xhr.statusText)
    ).send()
    undefined

  ###
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
  ###
  match: (fitRequest, successCallback, errorCallback = defaultErrorCallback) ->
    data = JSON.stringify(fitRequest)
    xhr = createCORSRequest("POST", "/api/compareSizes",
      (xhr) -> successCallback(createFitResponse(xhr))
    ,
      (xhr) -> errorCallback(xhr, xhr.status, xhr.statusText)
    )
    xhr.setRequestHeader("Content-Type", "application/json") \
      if xhr.setRequestHeader?
    xhr.send(data)
    undefined

  ###
    Fetches item types and their measurement properties from the server.
    Returned object contains item type id ("id") as a key and an object
    containing the name of the item type ("name") and defined properties
    of the item type as an array ("properties")

    @param [Function] callback
    @param [Function] errorCallback
  ###
  getItemTypes: (callback, errorCallback = defaultErrorCallback) ->
    createCORSRequest("GET", "/api/itemTypes",
      (xhr) -> callback(JSON.parse(xhr.responseText))
    ,
      (xhr) -> errorCallback(xhr, xhr.status, xhr.statusText)
    ).send()
    undefined

  ###
    Open the login frame and set the callback function for logging in

    @param loggedInCallback [Function]
      the function to execute when user logs themselves in
  ###
  @loginFrame: (callback) ->
    url = "#{SizeMe.contextAddress}/remote-login.html"
    options = "height=375,width=349,left=200,top=200,location=no,menubar=no,
               resizable=no,scrollbars=no,toolbar=no"

    cb = (e) ->
      if e.origin == SizeMe.contextAddress
        removeMessageListener cb
        callback() if e.data

    addMessageListener cb
    window.open(url, "loginframe", options)
    return

  ###
    Logout from SizeMe

    @param callback [Function]
      callback to execute after logout
  ###
  @logout: (callback) ->
    iframe = document.createElement("iframe")
    cb = (event) ->
      if event.origin == SizeMe.contextAddress and event.data == "logout"
        removeMessageListener(cb)
        document.body.removeChild(iframe)
        callback() if callback?
      return
    addMessageListener(cb)
    iframe.setAttribute("src", "#{SizeMe.contextAddress}/remote-logout")
    iframe.setAttribute("style", "display:none")
    document.body.appendChild(iframe)

###
  A simple map implementation to help pass the item properties to server
###
class SizeMe.Map
  constructor: ->

  ###
    Returns the keys of this map as an array
    @return [Array]
  ###
  keys: -> (k for own k of @)

  ###
    Executes the callback function for each key in this map. The key and the
    value corresponding to the key are passed as parameters to the callback
    function. The value is also binded as <b>this</b> in the scope of the
    callback

    @param [Function] f the callback function
  ###
  each: (f) ->
    f(k,v) for own k,v of @
    undefined

  ###
    Adds an item to this map. Returns itself so that this method can be used
    in a chain.

    @param [*] key the key for the value
    @param [*] value value to be added
    @return [SizeMe.Map]
  ###
  addItem: (key, value) ->
    @[key] = value
    @

  ###
    Adds multiple items at a time to this map. Returns itself so that this
    method can be used in a chain.

    @param [*] arguments
      items to add as key/value-pairs, ie. key1, value1, key2, value2, ...
    @return [SizeMe.Map]
  ###
  addItems: (items...) ->
    throw new Error(
      'Arguments must be "tuples" (example: (key1, value1, key2, value2, ...)'
    ) unless items.length % 2 is 0
    for i in [0 ... items.length] by 2
      @addItem(items[i], items[i+1])
    @

  ###
    Creates a new SizeMe.Map from an arbitrary object

    @param [Object] obj the object to transform
  ###
  @fromObject: (obj) ->
    map = new SizeMe.Map()
    map.addItem(k,v) for own k,v of obj
    map

###
    Request object used to make the match requests to the server
###
class SizeMe.FitRequest
  ###
    @param [String] profileId the id of the profile
    @param [SizeMe.Item] item object containing the item information
  ###
  constructor: (@profileId, @item) ->

###
A class for holding the information for specific item.
###
class SizeMe.Item
  ###
    @param [Number] itemType the type of the Item
    @param [Number] itemLayer optional layer information
    @param [Number] itemThickness optional thickness value of the Item
    @param [Number] itemStretch optional stretch value of the Item
  ###
  constructor: (@itemType, @itemLayer = 0,
  @itemThickness = 0, @itemStretch = 0) ->
    @measurements = new SizeMe.Map()

  ###
    Adds a new size information to this item.

    @param {*} size the label for the size
    @param {SizeMe.Map} measurements a map of "property->measurement" pairs.
    @return {SizeMe.Item}
  ###
  addSize: (size, measurements) ->
    @.measurements.addItem(size, measurements)
    @

class SizeMe.FitRange
  ranges =
    too_small:
      start: 0
      end: 1000
    slim:
      start: 1000
      end: 1050
    regular:
      start: 1050
      end: 1110
    loose:
      start: 1110
      end: 1170
    too_big:
      start: 1170
      end: 99990

  @getFitRangeLabels: -> ranges

  @getFitRangeLabel: (fitValue) ->
    result = (
      label for own label, range of ranges \
        when range.start <= fitValue and range.end > fitValue
    )
    result

window.SizeMe = SizeMe
