gulp        = require 'gulp'
coffee      = require 'gulp-coffee'
coffeelint  = require 'gulp-coffeelint'
uglify      = require 'gulp-uglify'
rename      = require 'gulp-rename'
concat      = require 'gulp-concat'
series      = require 'stream-series'
del         = require 'del'
config      = require './gulp-config.json'

gulp.task 'lint', ->
  gulp.src config.api.src
    .pipe coffeelint()
    .pipe coffeelint.reporter()

gulp.task 'js', ->
  gulp.src config.api.src
    .pipe coffee()
    .pipe gulp.dest config.dest
    .pipe uglify()
    .pipe rename extname: '.min.js'
    .pipe gulp.dest config.dest

gulp.task 'magento', ->
  gulp.src config.magento.src
  .pipe concat("sizeme-magento.js")
  .pipe gulp.dest config.dest
  .pipe uglify()
  .pipe rename extname: '.min.js'
  .pipe gulp.dest config.dest

gulp.task 'magento-with-deps', ['magento'], ->
  series gulp.src(config.jquery_ui.src)
  , gulp.src(config.opentip.src)
  , gulp.src(config.dest + "/sizeme-magento.js")
    .pipe concat("sizeme-magento-with-deps.js")
    .pipe gulp.dest config.dest
    .pipe uglify()
    .pipe rename extname: '.min.js'
    .pipe gulp.dest config.dest

gulp.task 'clean', (cb) ->
  del [
    'lib/*.*'
  ], cb

gulp.task 'default', ['clean', 'lint', 'js', 'magento-with-deps']