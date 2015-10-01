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
config      = require './gulp-config.json'

gulp.task 'api.lint', ->
  gulp.src config.api.src
    .pipe coffeelint()
    .pipe coffeelint.reporter()

gulp.task 'api.js', ['clean.js', 'api.lint'], ->
  gulp.src config.api.src
    .pipe coffee()
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

gulp.task 'magento.lint', ->
  gulp.src config.magento.js
  .pipe jshint()
  .pipe jshint.reporter("default")

gulp.task 'magento.js', ['clean.js', 'magento.lint'], ->
  gulp.src config.magento.js
  .pipe concat("sizeme-magento.js")
  .pipe gulp.dest config.dest.js
  .pipe uglify()
  .pipe rename extname: '.min.js'
  .pipe gulp.dest config.dest.js

gulp.task 'magento-with-deps', ['magento.js'], ->
  series gulp.src(config.jquery_ui.js)
  , gulp.src(config.opentip.js)
  , gulp.src(config.dest + "/sizeme-magento.js")
    .pipe concat("sizeme-magento-with-deps.js")
    .pipe gulp.dest config.dest.js
    .pipe uglify()
    .pipe rename extname: '.min.js'
    .pipe gulp.dest config.dest.js

gulp.task 'magento.css', ['clean.css'], ->
  series gulp.src(config.jquery_ui.css)
  , gulp.src(config.opentip.css)
  , gulp.src(config.magento.css)
    .pipe concatCss "sizeme-magento.css", rebaseUrls: false
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

gulp.task 'default', ['api.js', 'magento-with-deps', 'magento.css']