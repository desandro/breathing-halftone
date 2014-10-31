/*!
 * Breathing Halftone
 * Images go whoa with lots of floaty dots
 * http://breathing-halftone.desandro.com
 */

( function( window ) {

'use strict';

// ----- vars ----- //

var Halftone = window.BreathingHalftone = window.BreathingHalftone || {};

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

Vector.prototype.subtract = function( v ) {
  this.x -= v.x;
  this.y -= v.y;
};

Vector.prototype.scale = function( s )  {
  this.x *= s;
  this.y *= s;
};

Vector.prototype.multiply = function( v ) {
  this.x *= v.x;
  this.y *= v.y;
};

// custom getter whaaaaaaat
Object.defineProperty( Vector.prototype, 'magnitude', {
  get: function() {
    return Math.sqrt( this.x * this.x  + this.y * this.y );
  }
});

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

( function( window ) {

'use strict';

// ----- vars ----- //

var TAU = Math.PI * 2;
var ROOT_2 = Math.sqrt( 2 );

// ----- helpers ----- //

var objToString = Object.prototype.toString;
var isArray = Array.isArray || function( obj ) {
  return objToString.call( obj ) === '[object Array]';
};

// extend objects
function extend( a, b, isDeep ) {
  for ( var prop in b ) {
    var value = b[ prop ];
    if ( isDeep && typeof value === 'object' && !isArray( value )  ) {
      // deep extend
      a[ prop ] = extend( a[ prop ] || {}, value, true );
    } else {
      a[ prop ] = value;
    }
  }
  return a;
}

function insertAfter( elem, afterElem ) {
  var parent = afterElem.parentNode;
  var nextElem = afterElem.nextElementSibling;
  if ( nextElem ) {
    parent.insertBefore( elem, nextElem );
  } else {
    parent.appendChild( elem );
  }
}

// -------------------------- supports -------------------------- //

var supports = {};

( function() {
  // check canvas support
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext && canvas.getContext('2d');
  supports.canvas = !!ctx;
  if ( !supports.canvas ) {
    return;
  }

  // check darker composite support
  canvas.width = 1;
  canvas.height = 1;
  ctx.globalCompositeOperation = 'darker';
  ctx.fillStyle = '#F00';
  ctx.fillRect( 0, 0, 1, 1 );
  ctx.fillStyle = '#999';
  ctx.fillRect( 0, 0, 1, 1 );
  var imgData = ctx.getImageData( 0, 0, 1, 1 ).data;
  supports.darker = imgData[0] === 153 && imgData[1] === 0;
})();

// -------------------------- requestAnimationFrame -------------------------- //

// https://gist.github.com/1866474

var lastTime = 0;
var prefixes = 'webkit moz ms o'.split(' ');
// get unprefixed rAF and cAF, if present
var requestAnimationFrame = window.requestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame;
// loop through vendor prefixes and get prefixed rAF and cAF
var prefix;
for( var i = 0; i < prefixes.length; i++ ) {
  if ( requestAnimationFrame && cancelAnimationFrame ) {
    break;
  }
  prefix = prefixes[i];
  requestAnimationFrame = requestAnimationFrame || window[ prefix + 'RequestAnimationFrame' ];
  cancelAnimationFrame  = cancelAnimationFrame  || window[ prefix + 'CancelAnimationFrame' ] ||
                            window[ prefix + 'CancelRequestAnimationFrame' ];
}

// fallback to setTimeout and clearTimeout if either request/cancel is not supported
if ( !requestAnimationFrame || !cancelAnimationFrame )  {
  requestAnimationFrame = function( callback ) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
    var id = setTimeout( function() {
      callback( currTime + timeToCall );
    }, timeToCall );
    lastTime = currTime + timeToCall;
    return id;
  };

  cancelAnimationFrame = function( id ) {
    clearTimeout( id );
  };
}

// --------------------------  -------------------------- //

var _Halftone = window.BreathingHalftone || {};
var Vector = _Halftone.Vector;
var Particle = _Halftone.Particle;

// -------------------------- BreathingHalftone -------------------------- //

function Halftone( img, options ) {
  // set options
  this.options = extend( {}, this.constructor.defaults, true );
  extend( this.options, options, true );

  this.img = img;
  // bail if canvas is not supported
  if ( !supports.canvas ) {
    return;
  }

  this.create();
}

Halftone.defaults = {
  // dot size
  dotSize: 1/40,
  dotSizeThreshold: 0.05,
  initVelocity: 0.02,
  oscPeriod: 3,
  oscAmplitude: 0.2,
  // layout and color
  isAdditive: false,
  isRadial: false,
  channels: [ 'red', 'green', 'blue' ],
  isChannelLens: true,
  // behavoir
  friction: 0.06,
  hoverDiameter: 0.3,
  hoverForce: -0.02,
  activeDiameter: 0.6,
  activeForce: 0.01
};

function makeCanvasAndCtx() {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  return {
    canvas: canvas,
    ctx: ctx
  };
}



Halftone.prototype.create = function() {
  this.isActive = true;

  // create main canvas
  var canvasAndCtx = makeCanvasAndCtx();
  this.canvas = canvasAndCtx.canvas;
  this.ctx = canvasAndCtx.ctx;
  // copy over class
  this.canvas.className = this.img.className;
  insertAfter( this.canvas, this.img );
  // hide img visually
  this.img.style.visibility = 'hidden';

  // fall back to lum channel if subtractive and darker isn't supported
  this.channels = !this.options.isAdditive && !supports.darker ?
    [ 'lum' ] : this.options.channels;

  // create separate canvases for each color
  this.proxyCanvases = {};
  for ( var i=0, len = this.channels.length; i < len; i++ ) {
    var channel = this.channels[i];
    this.proxyCanvases[ channel ] = makeCanvasAndCtx();
  }

  this.loadImage();

  // properties
  this.canvasPosition = new Vector();
  this.getCanvasPosition();
  // hash of mouse / touch events
  this.cursors = {};
  // position -100,000, -100,000 so its not on screen
  this.addCursor( 'mouse', { pageX: -1e5, pageY: -1e5 });

  this.bindEvents();
};

Halftone.prototype.getCanvasPosition = function() {
  var rect = this.canvas.getBoundingClientRect();
  var x = rect.left + window.pageXOffset;
  var y = rect.top + window.pageYOffset;
  this.canvasPosition.set( x, y );
  this.canvasScale = this.width ? this.width / this.canvas.offsetWidth  : 1;
};

// -------------------------- img -------------------------- //

Halftone.prototype.loadImage = function() {
  // hack img load
  var src = this.img.getAttribute('data-src') || this.img.src;
  var loadingImg = new Image();
  loadingImg.onload = function() {
    this.onImgLoad();
  }.bind( this );
  loadingImg.src = src;
  // set src on image, so we can get correct sizes
  if ( this.img.src !== src ) {
    this.img.src = src;
  }
};

Halftone.prototype.onImgLoad = function() {
  this.getImgData();
  this.resizeCanvas();
  this.getCanvasPosition();
  // hide image completely
  this.img.style.display = 'none';
  this.getCanvasPosition();
  this.initParticles();
  this.animate();
};

Halftone.prototype.getImgData = function() {
  // get imgData
  var canvasAndCtx = makeCanvasAndCtx();
  var imgCanvas = canvasAndCtx.canvas;
  var ctx = canvasAndCtx.ctx;
  this.imgWidth = imgCanvas.width = this.img.naturalWidth;
  this.imgHeight = imgCanvas.height = this.img.naturalHeight;
  ctx.drawImage( this.img, 0, 0 );
  this.imgData = ctx.getImageData( 0, 0, this.imgWidth, this.imgHeight ).data;
};

Halftone.prototype.resizeCanvas = function() {
  // width & height
  var w = this.width = this.img.offsetWidth;
  var h = this.height = this.img.offsetHeight;
  // size properties
  this.diagonal = Math.sqrt( w*w + h*h );
  this.imgScale = this.width / this.imgWidth;
  this.gridSize = this.options.dotSize * this.diagonal;

  // set proxy canvases size
  for ( var prop in this.proxyCanvases ) {
    var proxy = this.proxyCanvases[ prop ];
    proxy.canvas.width = w;
    proxy.canvas.height = h;
  }
  this.canvas.width = w;
  this.canvas.height = h;
};

Halftone.prototype.initParticles = function() {

  var getParticlesMethod = this.options.isRadial ?
    'getRadialGridParticles' : 'getCartesianGridParticles';

  // all particles
  this.particles = [];
  // separate array of particles for each color
  this.channelParticles = {};

  var angles = { red: 1, green: 2.5, blue: 5, lum: 4 };

  for ( var i=0, len = this.channels.length; i < len; i++ ) {
    var channel = this.channels[i];
    var angle = angles[ channel ];
    var particles = this[ getParticlesMethod ]( channel, angle );
    // associate with channel
    this.channelParticles[ channel ] = particles;
    // add to all collection
    this.particles = this.particles.concat( particles );
  }

};

Halftone.prototype.animate = function() {
  // do not animate if not active
  if ( !this.isActive ) {
    return;
  }
  this.update();
  this.render();
  requestAnimationFrame( this.animate.bind( this ) );
};

Halftone.prototype.update = function() {
  // displace particles with cursors (mouse, touches)

  for ( var i=0, len = this.particles.length; i < len; i++ ) {
    var particle = this.particles[i];
    // apply forces for each cursor
    for ( var identifier in this.cursors ) {
      var cursor = this.cursors[ identifier ];
      var cursorState = cursor.isDown ? 'active' : 'hover';
      var forceScale = this.options[ cursorState + 'Force' ];
      var diameter = this.options[ cursorState + 'Diameter' ];
      var radius = diameter / 2 * this.diagonal;
      var force = Vector.subtract( particle.position, cursor.position );
      var distanceScale = Math.max( 0, radius - force.magnitude ) / radius;
      // easeInOutSine
      distanceScale = Math.cos( distanceScale * Math.PI ) * -0.5 + 0.5;
      force.scale( distanceScale * forceScale );
      particle.applyForce( force );
    }

    particle.update();
  }
};

Halftone.prototype.render = function() {
  // clear
  this.ctx.globalCompositeOperation = 'source-over';
  this.ctx.fillStyle = this.options.isAdditive ? 'black' : 'white';
  this.ctx.fillRect( 0, 0, this.width, this.height );

  // composite grids
  this.ctx.globalCompositeOperation = this.options.isAdditive ? 'lighter' : 'darker';

  // render channels
  for ( var i=0, len = this.channels.length; i < len; i++ ) {
    var channel = this.channels[i];
    this.renderGrid( channel );
  }

};

var channelFillStyles = {
  additive: {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    lum: '#FFF'
  },
  subtractive: {
    red: '#00FFFF',
    green: '#FF00FF',
    blue: '#FFFF00',
    lum: '#000'
  }
};

Halftone.prototype.renderGrid = function( channel ) {
  var proxy = this.proxyCanvases[ channel ];
  // clear
  proxy.ctx.fillStyle = this.options.isAdditive ? 'black' : 'white';
  proxy.ctx.fillRect( 0, 0, this.width, this.height );

  // set fill color
  var blend = this.options.isAdditive ? 'additive' : 'subtractive';
  proxy.ctx.fillStyle = channelFillStyles[ blend ][ channel ];

  // render particles
  var particles = this.channelParticles[ channel ];
  for ( var i=0, len = particles.length; i < len; i++ ) {
    var particle = particles[i];
    particle.render( proxy.ctx );
  }

  // draw proxy canvas to actual canvas as whole layer
  this.ctx.drawImage( proxy.canvas, 0, 0 );
};

Halftone.prototype.getCartesianGridParticles = function( channel, angle ) {
  var particles = [];

  var w = this.width;
  var h = this.height;

  var diag = Math.max( w, h ) * ROOT_2;

  var gridSize = this.gridSize;
  var cols = Math.ceil( diag / gridSize );
  var rows = Math.ceil( diag / gridSize );

  for ( var row = 0; row < rows; row++ ) {
    for ( var col = 0; col < cols; col++ ) {
      var x1 = ( col + 0.5 ) * gridSize;
      var y1 = ( row + 0.5 ) * gridSize;
      // offset for diagonal
      x1 -= ( diag - w ) / 2;
      y1 -= ( diag - h ) / 2;
      // shift to center
      x1 -= w / 2;
      y1 -= h / 2;
      // rotate grid
      var x2 = x1 * Math.cos( angle ) - y1 * Math.sin( angle );
      var y2 = x1 * Math.sin( angle ) + y1 * Math.cos( angle );
      // shift back
      x2 += w / 2;
      y2 += h / 2;

      var particle = this.initParticle( channel, x2, y2 );
      if ( particle ) {
        particles.push( particle );
      }
    }
  }

  return particles;
};

Halftone.prototype.getRadialGridParticles = function( channel, angle ) {
  var particles = [];

  var w = this.width;
  var h = this.height;
  var diag = Math.max( w, h ) * ROOT_2;

  var gridSize = this.gridSize;

  var halfW = w / 2;
  var halfH = h / 2;
  var offset = gridSize;
  var centerX = halfW + Math.cos( angle ) * offset;
  var centerY = halfH + Math.sin( angle ) * offset;

  var maxLevel = Math.ceil( ( diag + offset ) / gridSize );

  for ( var level=0; level < maxLevel; level++ ) {
    var max = level * 6 || 1;
    for ( var j=0; j < max; j++ ) {
      var theta = TAU * j / max + angle;
      var x = centerX + Math.cos( theta ) * level * gridSize;
      var y = centerY + Math.sin( theta ) * level * gridSize;
      var particle = this.initParticle( channel, x, y );
      if ( particle ) {
        particles.push( particle );
      }
    }
  }

  return particles;

};

Halftone.prototype.initParticle = function( channel, x, y ) {
  // don't render if coords are outside image
  // don't display if under threshold
  var pixelChannelValue = this.getPixelChannelValue( x, y, channel );
  if ( pixelChannelValue < this.options.dotSizeThreshold ) {
    return;
  }

  return new Particle({
    channel: channel,
    parent: this,
    origin: new Vector( x, y ),
    naturalSize: this.gridSize * ROOT_2 / 2,
    friction: this.options.friction
  });

};

var channelOffset = {
  red: 0,
  green: 1,
  blue: 2
};

Halftone.prototype.getPixelChannelValue = function( x, y, channel ) {
  x = Math.round( x / this.imgScale );
  y = Math.round( y / this.imgScale );
  var w = this.imgWidth;
  var h = this.imgHeight;

  // return 0 if position is outside of image
  if ( x < 0 || x > w || y < 0 || y > h ) {
    return 0;
  }

  var pixelIndex = ( x + y * w ) * 4;
  var value;
  // return 1;
  if ( channel === 'lum' ) {
    value = this.getPixelLum( pixelIndex );
  } else {
    // rgb
    var index = pixelIndex + channelOffset[ channel ];
    value = this.imgData[ index ] / 255;
  }

  value = value || 0;
  if ( !this.options.isAdditive ) {
    value = 1 - value;
  }

  return value;
};

Halftone.prototype.getPixelLum = function( pixelIndex ) {
  // thx @jfsiii
  // https://github.com/jfsiii/chromath/blob/master/src/chromath.js
  var r = this.imgData[ pixelIndex + 0 ] / 255;
  var g = this.imgData[ pixelIndex + 1 ] / 255;
  var b = this.imgData[ pixelIndex + 2 ] / 255;
  var max = Math.max( r, g, b );
  var min = Math.min( r, g, b );
  return ( max + min ) / 2;
};

// ----- bindEvents ----- //

Halftone.prototype.bindEvents = function() {
  this.canvas.addEventListener( 'mousedown', this, false );
  this.canvas.addEventListener( 'touchstart', this, false );
  window.addEventListener( 'mousemove', this, false );
  window.addEventListener( 'touchmove', this, false );
  window.addEventListener( 'touchend', this, false );
  window.addEventListener( 'resize', this, false );
};

Halftone.prototype.unbindEvents = function() {
  this.canvas.removeEventListener( 'mousedown', this, false );
  this.canvas.removeEventListener( 'touchstart', this, false );
  window.removeEventListener( 'mousemove', this, false );
  window.removeEventListener( 'touchmove', this, false );
  window.removeEventListener( 'touchend', this, false );
  window.removeEventListener( 'resize', this, false );
};

Halftone.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

Halftone.prototype.onmousedown = function( event ) {
  event.preventDefault();
  this.cursors.mouse.isDown = true;
  window.addEventListener( 'mouseup', this, false );
};

Halftone.prototype.ontouchstart = function( event ) {
  event.preventDefault();
  for ( var i=0, len = event.changedTouches.length; i < len; i++ ) {
    var touch = event.changedTouches[i];
    var cursor = this.addCursor( touch.identifier, touch );
    cursor.isDown = true;
  }
};

/**
 * @param {MouseEvent or Touch} cursorEvent - with pageX and pageY
 */
Halftone.prototype.addCursor = function( identifier, cursorEvent ) {
  var position = this.setCursorPosition( cursorEvent );
  var cursor = this.cursors[ identifier ] = {
    position: position,
    isDown: false
  };
  return cursor;
};

/**
 * @param {MouseEvent or Touch} cursorEvent - with pageX and pageY
 * @param {Vector} position - optional
 */
Halftone.prototype.setCursorPosition = function( cursorEvent, position ) {
  position = position || new Vector();
  position.set( cursorEvent.pageX, cursorEvent.pageY );
  position.subtract( this.canvasPosition );
  position.scale( this.canvasScale );
  return position;
};


Halftone.prototype.onmousemove = function( event ) {
  this.setCursorPosition( event, this.cursors.mouse.position );
};

Halftone.prototype.ontouchmove = function( event ) {
  // move matching cursors
  for ( var i=0, len = event.changedTouches.length; i < len; i++ ) {
    var touch = event.changedTouches[i];
    var cursor = this.cursors[ touch.identifier ];
    if ( cursor ) {
      this.setCursorPosition( touch, cursor.position );
    }
  }
};

Halftone.prototype.onmouseup = function() {
  this.cursors.mouse.isDown = false;
  window.removeEventListener( 'mouseup', this, false );
};

Halftone.prototype.ontouchend = function( event ) {
  // remove matching cursors
  for ( var i=0, len = event.changedTouches.length; i < len; i++ ) {
    var touch = event.changedTouches[i];
    var cursor = this.cursors[ touch.identifier ];
    if ( cursor ) {
      delete this.cursors[ touch.identifier ];
    }
  }
};


function debounceProto( _class, methodName, threshold ) {
  // original method
  var method = _class.prototype[ methodName ];
  var timeoutName = methodName + 'Timeout';

  _class.prototype[ methodName ] = function() {
    var timeout = this[ timeoutName ];
    if ( timeout ) {
      clearTimeout( timeout );
    }
    var args = arguments;

    this[ timeoutName ] = setTimeout( function() {
      method.apply( this, args );
      delete this[ timeoutName ];
    }.bind( this ), threshold || 100 );
  };
}

Halftone.prototype.onresize = function() {
  this.getCanvasPosition();
};

debounceProto( Halftone, 'onresize', 200 );

// ----- destroy ----- //

Halftone.prototype.destroy = function() {
  this.isActive = false;
  this.unbindEvents();

  this.img.style.visibility = '';
  this.img.style.display = '';
  this.canvas.parentNode.removeChild( this.canvas );
};

// --------------------------  -------------------------- //

Halftone.Vector = Vector;
Halftone.Particle = Particle;
window.BreathingHalftone = Halftone;


})( window );

