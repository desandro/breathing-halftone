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
  this.parent = properties.parent;
  this.friction = properties.friction;
  this.position = Vector.copy( this.origin );
  this.velocity = new Vector();
  this.acceleration = new Vector();
}

Particle.prototype.applyForce = function( force ) {
  this.acceleration.add( force );
};

Particle.prototype.update = function() {
  // velocity
  this.velocity.add( this.acceleration );
  this.velocity.scale( 1 - this.friction );
  // position
  this.position.add( this.velocity );
  // reset acceleration
  this.acceleration.set( 0, 0 );
};

Particle.prototype.render = function( ctx, color ) {
  var x = this.position.x;
  var y = this.position.y;
  var colorSize = this.parent.getPixelData( x, y )[ color ] / 255;
  if ( !this.parent.options.isAdditive ) {
    colorSize = 1 - colorSize;
  }
  var size = this.naturalSize * colorSize;
  ctx.beginPath();
  ctx.arc( x, y, size, 0, TAU );
  ctx.fill();
  ctx.closePath();
};

Halftone.Particle = Particle;

})( window );
