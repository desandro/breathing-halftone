/*jshint node: true, strict: false */

var gulp = require('gulp');
var concat = require('gulp-concat');
var gulpMarkdown = require('gulp-markdown');
var rename = require('gulp-rename');
var highlight = require('highlight.js');

gulp.task( 'scripts', function() {
  gulp.src([
      'js/vector.js',
      'js/particle.js',
      'js/breathing-halftone.js'
    ])
    .pipe( concat('breathing-halftone.pkgd.js') )
    .pipe( gulp.dest('dist/') );
});

// add syntax highlighter to markdown parser
var markdown = gulpMarkdown({
  highlight: function( code, lang ) {
    return lang ? highlight.highlight( lang, code ).value : code;
  }
});

gulp.task( 'docs', function() {
  gulp.src('README.md')
    .pipe( markdown )
    .pipe( rename('index.html') )
    .pipe( gulp.dest('./') );
});
