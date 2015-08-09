class SizeMe

  @contextAddress = "https://www.sizeme.com"
  @version = "2.0"

  _authToken = undefined
  _facepalm = -> not ("withCredentials" of XMLHttpRequest.prototype)

  constructor: (authToken) ->
    _authToken = authToken

  createCORSRequest = (method, service, callback, errorCallback) ->
    xhr = undefined
    url = "#{SizeMe.contextAddress}#{service}"

    if not _facepalm()
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

  @getAuthToken = (callback, errorCallback = defaultErrorCallback) ->
    if _facepalm()
      iframe = document.createElement("iframe")
      cb = (event) ->
        tokenObj = JSON.parse(event.data)
        window.detachEvent("onmessage", cb)
        document.body.removeChild(iframe)
        callback?(tokenObj) if callback?
        return
      window.attachEvent("onmessage", cb)
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

  fetchProfilesForAccount: (callback, errorCallback = defaultErrorCallback) ->
    createCORSRequest("GET", "/api/profiles",
      (xhr) -> callback(JSON.parse(xhr.responseText))
    ,
      (xhr) -> errorCallback(xhr, xhr.status, xhr.statusText)
    ).send()
    undefined

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

  getItemTypes: (callback, errorCallback = defaultErrorCallback) ->
    createCORSRequest("GET", "/api/itemTypes",
      (xhr) -> callback(JSON.parse(xhr.responseText))
    ,
      (xhr) -> errorCallback(xhr, xhr.status, xhr.statusText)
    ).send()
    undefined

  @loginFrame: (callback) ->
    url = "#{SizeMe.contextAddress}/loginframe.html"
    options = "height=375,width=349,left=200,top=200,location=no,menubar=no,
               resizable=no,scrollbars=no,toolbar=no"
    win = window.open(url, "", options)
    timer = if win?
      setInterval ->
        if win.closed
          clearInterval timer
          callback() if win?
      , 100
    return

class SizeMe.Map
  constructor: ->

  keys: -> (k for own k of @)

  each: (f) ->
    f(k,v) for own k,v of @
    undefined

  addItem: (key, value) ->
    @[key] = value
    @

  addItems: (items...) ->
    throw new Error(
      'Arguments must be "tuples" (example: (key1, value1, key2, value2, ...)'
    ) unless items.length % 2 is 0
    for i in [0 ... items.length] by 2
      @addItem(items[i], items[i+1])
    @

  @fromObject: (obj) ->
    map = new SizeMe.Map()
    map.addItem(k,v) for own k,v of obj
    map

class SizeMe.FitRequest
  constructor: (@profileId, @item) ->

class SizeMe.Item
  constructor: (@itemType, @itemLayer = 0,
                @itemThickness = 0, @itemStretch = 0) ->
    @measurements = new SizeMe.Map()

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