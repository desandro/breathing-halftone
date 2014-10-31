/*jshint node: true, strict: false */

var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task( 'dist', function() {
  var jsFiles = [
    'js/vector.js',
    'js/particle.js',
    'js/breathing-halftone.js'
  ];

  gulp.src( jsFiles )
    .pipe( concat('breathing-halftone.pkgd.js') )
    .pipe( gulp.dest('dist') );

  gulp.src( jsFiles )
    .pipe( rename('breathing-halftone.pkgd.min.js') )
    .pipe( uglify({ preserveComments: 'some' }) )
    .pipe( gulp.dest('dist') );

});
