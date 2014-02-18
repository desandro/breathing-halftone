( function( window ) {

'use strict';

// ----- vars ----- //

var TAU = Math.PI * 2;

var Halftone = window.BreathingHalftone || {};
var Vector = Halftone.Vector;

// -------------------------- Particle -------------------------- //

function Particle( properties ) {
  this.origin = properties.origin;
  this.naturalSize = properties.naturalSize;
  this.friction = properties.friction;
  this.position = Vector.copy( this.origin );
  this.velocity = new Vector();
  this.acceleration = new Vector();
}

Particle.prototype.update = function() {
  // velocity
  this.velocity.add( this.acceleration );
  this.velocity.scale( 1 - this.friction );
  // position
  this.position.add( this.velocity );
  // reset acceleration
  this.acceleration.set( 0, 0 );
};

Particle.prototype.render = function( ctx ) {
  var size = this.naturalSize;
  ctx.beginPath();
  ctx.arc( this.position.x, this.position.y, size, 0, TAU );
  ctx.fill();
  ctx.closePath();
};

Halftone.Particle = Particle;

})( window );
