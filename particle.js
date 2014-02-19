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
  this.size = properties.naturalSize;
  this.parent = properties.parent;
  this.friction = properties.friction;
  this.position = Vector.copy( this.origin );
  this.velocity = new Vector();
  this.acceleration = new Vector();
  this.sizeVelocity = 0;
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

  this.calculateSize( color );

  ctx.beginPath();
  ctx.arc( x, y, Math.abs( this.size ), 0, TAU );
  ctx.fill();
  ctx.closePath();
};

Particle.prototype.calculateSize = function( color ) {

  // var x = this.position.x;
  // var y = this.position.y;
  // var colorSize = this.parent.getPixelData( x, y )[ color ] / 255;
  // if ( !this.parent.options.isAdditive ) {
  //   colorSize = 1 - colorSize;
  // }
  var targetSize = this.naturalSize * this.getColorValue( this.position, color );
  
  var sizeAcceleration = (targetSize - this.size) * 0.4;
  this.sizeVelocity += sizeAcceleration;
  // friction
  this.sizeVelocity *= ( 1 - 0.4 );
  this.size += this.sizeVelocity;
  this.size = this.size;
  // this.size = targetSize;
};

Particle.prototype.getColorValue = function( position, color ) {

  var colorValue = this.parent.getPixelData( position.x, position.y )[ color ] / 255;
  colorValue = colorValue || 0;
  if ( !this.parent.options.isAdditive ) {
    colorValue = 1 - colorValue;
  }
  return colorValue;
};

Particle.prototype.applyOriginAttraction = function() {
  var attraction = Vector.subtract( this.position, this.origin );
  attraction.scale( -0.02 );
  this.applyForce( attraction );
};

Halftone.Particle = Particle;

})( window );
