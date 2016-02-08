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

##### API #####

gulp.task 'api.lint', ->
  gulp.src config.api.src
    .pipe coffeelint()
    .pipe coffeelint.reporter()

gulp.task 'api.js', ['clean.js', 'api.lint'], ->
  merge(
    gulp.src(config.ga.src),
    gulp.src(config.api.src).pipe(coffee())
  )
    .pipe concat('sizeme-api.js')
    .pipe gulp.dest config.dest.js
    .pipe uglify()
    .pipe rename extname: '.min.js'
    .pipe gulp.dest config.dest.js

gulp.task 'api.doc', ['clean.doc'], ->
  gulp.src config.api.src
    .pipe codo
      name: "SizeMe API"
      title: "API documentation for SizeMe"
      readme: "README.md"
      dir: config.dest.doc

##### UI #####

gulp.task 'ui.lint', ->
  gulp.src config.ui.js.src
  .pipe jshint()
  .pipe jshint.reporter("default")

gulp.task 'ui.js', ['clean.js', 'ui.lint'], ->
  gulp.src config.ui.js.src
  .pipe gulp.dest config.dest.js
  .pipe uglify()
  .pipe rename extname: '.min.js'
  .pipe gulp.dest config.dest.js

gulp.task 'ui.css', ['clean.css'], ->
  gulp.src config.ui.css.src
  .pipe gulp.dest config.dest.css
  .pipe minifyCss keepSpecialComments: "*"
  .pipe rename extname: '.min.css'
  .pipe gulp.dest config.dest.css

##### MAGENTO #####

gulp.task 'magento.lint', ->
  gulp.src config.magento.js
  .pipe jshint()
  .pipe jshint.reporter("default")

gulp.task 'magento.js', ['api.js', 'ui.js', 'magento.lint'], ->
  gulp.src [config.dest.js + "/sizeme-api.js", config.dest.js + "/sizeme-ui.js", config.magento.js]
  .pipe concat("sizeme-magento.js")
  .pipe gulp.dest config.dest.js
  .pipe uglify()
  .pipe rename extname: '.min.js'
  .pipe gulp.dest config.dest.js

gulp.task 'magento-with-deps', ['magento.js'], ->
  series gulp.src(config.jquery.js)
  , gulp.src(config.jquery_ui.js)
  , gulp.src(config.opentip.js).pipe(closure())
  , gulp.src(config.dest.js + "/sizeme-magento.js")
    .pipe concat("sizeme-magento-with-deps.js")
    .pipe gulp.dest config.dest.js
    .pipe uglify()
    .pipe rename extname: '.min.js'
    .pipe gulp.dest config.dest.js

gulp.task 'magento.css', ['ui.css'], ->
  series gulp.src(config.jquery_ui.css)
  , gulp.src(config.opentip.css)
  , gulp.src(config.dest.css + "/sizeme-ui.css")
  , gulp.src(config.magento.css)
    .pipe concatCss "sizeme-magento.css", rebaseUrls: false
    .pipe gulp.dest config.dest.css
    .pipe minifyCss keepSpecialComments: "*"
    .pipe rename extname: '.min.css'
    .pipe gulp.dest config.dest.css

##### WOOCOMMERCE #####

gulp.task 'woocommerce.lint', ->
  gulp.src config.woocommerce.js
  .pipe jshint()
  .pipe jshint.reporter("default")

gulp.task 'woocommerce.js', ['api.js', 'ui.js', 'woocommerce.lint'], ->
  gulp.src [config.dest.js + "/sizeme-api.js", config.dest.js + "/sizeme-ui.js", config.woocommerce.js]
  .pipe concat("sizeme-woocommerce.js")
  .pipe gulp.dest config.dest.js
  .pipe uglify()
  .pipe rename extname: '.min.js'
  .pipe gulp.dest config.dest.js

gulp.task 'woocommerce-with-deps', ['woocommerce.js'], ->
  series gulp.src(config.jquery.js)
  , gulp.src(config.jquery_ui.js)
  , gulp.src(config.opentip.js).pipe(closure())
  , gulp.src(config.dest.js + "/sizeme-woocommerce.js")
  .pipe concat("sizeme-woocommerce-with-deps.js")
  .pipe gulp.dest config.dest.js
  .pipe uglify()
  .pipe rename extname: '.min.js'
  .pipe gulp.dest config.dest.js

gulp.task 'woocommerce.css', ['ui.css'], ->
  series gulp.src(config.jquery_ui.css)
  , gulp.src(config.opentip.css)
  , gulp.src(config.dest.css + "/sizeme-ui.css")
  , gulp.src(config.woocommerce.css)
  .pipe concatCss "sizeme-woocommerce.css", rebaseUrls: false
  .pipe gulp.dest config.dest.css
  .pipe minifyCss keepSpecialComments: "*"
  .pipe rename extname: '.min.css'
  .pipe gulp.dest config.dest.css

gulp.task 'clean.js', (cb) ->
  del [ config.dest.js ], cb

gulp.task 'clean.doc', (cb) ->
  del [ config.dest.doc ], cb

gulp.task 'clean.css', (cb) ->
  del [ config.dest.css + "/**/*.css" ], cb

gulp.task 'clean', [ 'clean.js', 'clean.css', 'clean.doc' ]

gulp.task 'default', ['api.js', 'magento-with-deps', 'magento.css', 'woocommerce-with-deps', 'woocommerce.css']