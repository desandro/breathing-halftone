/*jshint node: true, strict: false */

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task( 'dist', function() {
  gulp.src([
      'js/vector.js',
      'js/particle.js',
      'js/breathing-halftone.js'
    ])
    .pipe( concat('breathing-halftone.pkgd.js') )
    .pipe( gulp.dest('./dist/') )

  gulp.src('dist/breathing-halftone.pkgd.js')
    .pipe( uglify() )
    .pipe( gulp.dest('dist/breathing-halftone.pkgd.min.js') )

});
