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
  this.applyOriginAttraction();

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

Particle.prototype.applyOriginAttraction = function() {
  var attraction = Vector.subtract( this.position, this.origin );
  attraction.scale( -0.01 );
  this.applyForce( attraction );
};

Halftone.Particle = Particle;

})( window );
