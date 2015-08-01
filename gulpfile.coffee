gulp        = require 'gulp'
coffee      = require 'gulp-coffee'
coffeelint  = require 'gulp-coffeelint'
uglify      = require 'gulp-uglify'
rename      = require 'gulp-rename'

gulp.task 'lint', ->
  gulp.src './src/sizeme-api.coffee'
    .pipe coffeelint()
    .pipe coffeelint.reporter()

gulp.task 'js', ->
  gulp.src './src/sizeme-api.coffee'
    .pipe coffee()
    .pipe gulp.dest './dist'
    .pipe uglify()
    .pipe rename extname: '.min.js'
    .pipe gulp.dest './dist'

gulp.task 'default', ['lint', 'js']