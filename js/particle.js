( function( window ) {

'use strict';

// ----- vars ----- //

var TAU = Math.PI * 2;

function getNow() {
  return new Date();
}

// --------------------------  -------------------------- //

var Halftone = window.BreathingHalftone || {};
var Vector = Halftone.Vector;

// -------------------------- Particle -------------------------- //

function Particle( properties ) {
  this.channel = properties.channel;
  this.origin = properties.origin;
  this.parent = properties.parent;
  this.friction = properties.friction;

  this.position = Vector.copy( this.origin );
  this.velocity = new Vector();
  this.acceleration = new Vector();

  this.naturalSize = properties.naturalSize;
  this.size = 0;
  this.sizeVelocity = 0;
  this.oscSize = 0;
  this.initSize = 0;
  this.initSizeVelocity = ( Math.random() * 0.5 + 0.5 ) *
    this.parent.options.initVelocity;

  this.oscillationOffset = Math.random() * TAU;
  this.oscillationMagnitude = Math.random();
  this.isVisible = false;
}

Particle.prototype.applyForce = function( force ) {
  this.acceleration.add( force );
};

Particle.prototype.update = function() {
  // stagger starting
  if ( !this.isVisible && Math.random() > 0.03 ) {
    return;
  }
  this.isVisible = true;

  this.applyOriginAttraction();

  // velocity
  this.velocity.add( this.acceleration );
  this.velocity.scale( 1 - this.friction );
  // position
  this.position.add( this.velocity );
  // reset acceleration
  this.acceleration.set( 0, 0 );

  this.calculateSize();
};

Particle.prototype.render = function( ctx ) {

  var size = this.size * this.oscSize;
  // apply initSize with easing
  var initSize = Math.cos( this.initSize * TAU / 2 ) * -0.5 + 0.5;
  size *= initSize;
  size = Math.max( 0, size );
  ctx.beginPath();
  ctx.arc( this.position.x, this.position.y, size, 0, TAU );
  ctx.fill();
  ctx.closePath();
};

Particle.prototype.calculateSize = function() {

  if ( this.initSize !== 1 ) {
    this.initSize += this.initSizeVelocity;
    this.initSize = Math.min( 1, this.initSize );
  }

  var targetSize = this.naturalSize * this.getChannelValue();

  // use accel/velocity to smooth changes in size
  var sizeAcceleration = ( targetSize - this.size ) * 0.1;
  this.sizeVelocity += sizeAcceleration;
  // friction
  this.sizeVelocity *= ( 1 - 0.3 );
  this.size += this.sizeVelocity;

  // oscillation size
  var now = getNow();
  var opts = this.parent.options;
  var oscSize = ( now / ( 1000 * opts.oscPeriod ) ) * TAU;
  oscSize = Math.cos( oscSize + this.oscillationOffset );
  oscSize = oscSize * opts.oscAmplitude + 1;
  this.oscSize = oscSize;
};

Particle.prototype.getChannelValue = function() {
  var channelValue;
  // return origin channel value if not lens
  var position = this.parent.options.isChannelLens ? this.position : this.origin;
  if ( this.parent.options.isChannelLens ) {
    channelValue = this.parent.getPixelChannelValue( position.x, position.y, this.channel );
  } else {
    if ( !this.originChannelValue ) {
      this.originChannelValue = this.parent.getPixelChannelValue( position.x, position.y, this.channel );
    }
    channelValue = this.originChannelValue;
  }

  return channelValue;
};

Particle.prototype.applyOriginAttraction = function() {
  var attraction = Vector.subtract( this.position, this.origin );
  attraction.scale( -0.02 );
  this.applyForce( attraction );
};

Halftone.Particle = Particle;

})( window );
