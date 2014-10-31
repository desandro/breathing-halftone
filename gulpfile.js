/*jshint node: true, strict: false */

var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task( 'dist', function() {
  gulp.src([
      'js/vector.js',
      'js/particle.js',
      'js/breathing-halftone.js'
    ])
    .pipe( concat('breathing-halftone.pkgd.js') )
    .pipe( gulp.dest('./dist/') );
});
