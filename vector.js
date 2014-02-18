( function( window ) {

'use strict';

// ----- vars ----- //

var Halftone = window.BreathingHalftone || {};

// -------------------------- Vector -------------------------- //

function Vector( x, y ) {
  this.set( x || 0, y || 0 );
}

Vector.prototype.set = function( x, y ) {
  this.x = x;
  this.y = y;
};

Vector.prototype.add = function( v ) {
  this.x += v.x;
  this.y += v.y;
};

Vector.prototype.scale = function( s )  {
  this.x *= s;
  this.y *= s;
};

// ----- class functions ----- //

Vector.subtract = function( a, b ) {
  return new Vector( a.x - b.x, a.y - b.y );
};

Vector.add = function( a, b ) {
  return new Vector( a.x + b.x, a.y + b.y );
};

Vector.copy = function( v ) {
  return new Vector( v.x, v.y );
};

Halftone.Vector = Vector;

})( window );
