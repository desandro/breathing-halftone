/*jshint node: true, strict: false */

var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var gulpMarkdown = require('gulp-markdown');
var rename = require('gulp-rename');
var highlight = require('highlight.js');
var through = require('through2');

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

// template
var templateSrc = fs.readFileSync('./assets/page.html');

var template = through.obj( function( file, enc, callback ) {
  if ( file.isBuffer() ) {
    var templated = templateSrc.toString()
      .replace('{{{ content }}}', file.contents.toString() );
    file.contents = new Buffer( templated );
    this.push( file );
  }

  return callback();
});

gulp.task( 'docs', function() {
  gulp.src('README.md')
    .pipe( markdown )
    .pipe( rename('index.html') )
    .pipe( template )
    .pipe( gulp.dest('./') );
});
