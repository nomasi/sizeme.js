gulp        = require 'gulp'
coffee      = require 'gulp-coffee'
coffeelint  = require 'gulp-coffeelint'
jshint      = require 'gulp-jshint'
uglify      = require 'gulp-uglify'
minifyCss   = require 'gulp-minify-css'
rename      = require 'gulp-rename'
concat      = require 'gulp-concat'
concatCss   = require 'gulp-concat-css'
series      = require 'stream-series'
del         = require 'del'
codo        = require 'gulp-codo'
merge       = require 'gulp-merge'
closure     = require 'gulp-jsclosure'
config      = require './gulp-config.json'
sourcemaps  = require 'gulp-sourcemaps'
wrapJs      = require 'gulp-wrap-js'

##### CLEAN #####

gulp.task 'clean.doc', (done) ->
  del [ config.dest.doc ], done

gulp.task 'clean', (done) ->
  del [ config.dest.js, config.dest.css + "/**/*.css", config.dest.css + "/maps" ], done

##### API #####

gulp.task 'api.lint', ->
  gulp.src config.api.src
    .pipe coffeelint()
    .pipe coffeelint.reporter()

gulp.task 'api.js', gulp.series('api.lint', ->
  merge(
    gulp.src(config.ga.src),
    gulp.src(config.api.src).pipe(coffee())
  )
    .pipe concat('sizeme-api.js')
    .pipe gulp.dest config.dest.js
    .pipe sourcemaps.init()
      .pipe uglify()
      .pipe rename extname: '.min.js'
    .pipe sourcemaps.write './maps'
    .pipe gulp.dest config.dest.js
)

gulp.task 'api.doc', gulp.series('clean.doc', ->
  gulp.src config.api.src
    .pipe codo
      name: "SizeMe API"
      title: "API documentation for SizeMe"
      readme: "README.md"
      dir: config.dest.doc
)

##### UI #####

gulp.task 'ui.lint', ->
  gulp.src config.ui.lang.src.concat(config.ui.js.src)
  .pipe jshint()
  .pipe jshint.reporter("default")

gulp.task 'ui.js', gulp.series('ui.lint', ->
  gulp.src config.ui.lang.src.concat(config.ui.js.src)
  .pipe concat "sizeme-ui.js"
  .pipe gulp.dest config.dest.js
  .pipe sourcemaps.init()
    .pipe uglify()
    .pipe rename extname: '.min.js'
  .pipe sourcemaps.write './maps'
  .pipe gulp.dest config.dest.js
)

gulp.task 'ui.css', ->
  gulp.src config.ui.css.src
  .pipe gulp.dest config.dest.css
  .pipe sourcemaps.init()
    .pipe minifyCss keepSpecialComments: "*"
    .pipe rename extname: '.min.css'
  .pipe sourcemaps.write './maps'
  .pipe gulp.dest config.dest.css


##### DEPS ######

gulp.task 'deps.js', ->
  series gulp.src(config.jquery_ui.js)
  , gulp.src(config.jqueryDialogOptions.js).pipe(closure($:'jQuery'))
  , gulp.src(config.opentip.core).pipe(closure())
  , gulp.src(config.opentip.adapter)
  .pipe concat("sizeme-deps.js")
  .pipe(wrapJs('window.sizemeDeps = function(jQuery) { %= body % }'))
  .pipe(closure(window:'window'))
  .pipe gulp.dest config.dest.js
  .pipe sourcemaps.init()
  .pipe uglify()
  .pipe rename extname: '.min.js'
  .pipe sourcemaps.write './maps'
  .pipe gulp.dest config.dest.js


##### HELPERS #####

gulp.task 'all.js', gulp.series('api.js', 'ui.js', 'deps.js', ->
  gulp.src [
    config.dest.js + "/sizeme-api.js"
    config.dest.js + "/sizeme-ui.js"
    config.dest.js + "/sizeme-deps.js"
    config.loader.js
  ]
  .pipe concat("sizeme-all.js")
  .pipe gulp.dest config.dest.js
)

gulp.task 'all.css', gulp.series('ui.css', ->
  series gulp.src(config.jquery_ui.css)
  , gulp.src(config.opentip.css)
  , gulp.src(config.dest.css + "/sizeme-ui.css")
  .pipe concatCss "sizeme-all.css", rebaseUrls: false
  .pipe gulp.dest config.dest.css
)

gulp.task 'shops.js', gulp.series('all.js', (cb) ->
  config.shops.forEach (shop) ->
    gulp.src [ config[shop].js, config.dest.js + "/sizeme-all.js" ]
    .pipe concat("sizeme-#{shop}.js")
    .pipe gulp.dest config.dest.js
    .pipe sourcemaps.init()
    .pipe uglify()
    .pipe rename extname: '.min.js'
    .pipe gulp.dest config.dest.js
  cb()
)

gulp.task 'shops.css', gulp.series('all.css', (cb) ->
  config.shops.forEach (shop) ->
    series gulp.src(config.dest.css + "/sizeme-all.css")
    , gulp.src(config[shop].css)
    .pipe concatCss "sizeme-#{shop}.css", rebaseUrls: false
    .pipe gulp.dest config.dest.css
    .pipe sourcemaps.init()
    .pipe minifyCss keepSpecialComments: "*"
    .pipe rename extname: '.min.css'
    .pipe sourcemaps.write './maps'
    .pipe gulp.dest config.dest.css
  cb()
)

##### RUN #####

gulp.task 'default', gulp.series('clean', gulp.parallel('shops.js', 'shops.css')), (cb) ->
  cb()
