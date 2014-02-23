( function( window ) {

'use strict';

// ----- vars ----- //

var TAU = Math.PI * 2;
var ROOT_2 = Math.sqrt( 2 );

// ----- helpers ----- //

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

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

var isCanvasSupported = (function() {
  var isSupported;

  function checkCanvasSupport() {
    if ( isFinite( isSupported ) ) {
      return isSupported;
    }

    var canvas = document.createElement('canvas');
    isSupported = !!( canvas.getContext && canvas.getContext('2d') );
    return isSupported;
  }

  return checkCanvasSupport;
})();


// --------------------------  -------------------------- //

var _Halftone = window.BreathingHalftone || {};
var Vector = _Halftone.Vector;
var Particle = _Halftone.Particle;

// -------------------------- BreathingHalftone -------------------------- //

function Halftone( img, options ) {
  // var defaults = this.constructor.defaults;
  // this.options = {};
  this.options = extend( {}, this.constructor.defaults, true );
  extend( this.options, options, true );
  // this.options.displacement = extend( defaults.displacement, options.displacement );
  this.img = img;
  // bail if canvas is not supported
  if ( !isCanvasSupported() ) {
    return;
  }

  this.create();
}

Halftone.defaults = {
  gridSize: 20,
  zoom: 1,
  isAdditive: true,
  channels: [
    'red',
    'green',
    'blue'
  ],
  isChannelLens: true,
  friction: 0.1,
  displacement: {
    hoverRadius: 1/7,
    hoverForce: -0.01,
    activeRadius: 1/7,
    activeForce: 0.05
  }
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
  // create main canvas
  var canvasAndCtx = makeCanvasAndCtx();
  this.canvas = canvasAndCtx.canvas;
  this.ctx = canvasAndCtx.ctx;
  insertAfter( this.canvas, this.img );
  this.img.style.display = 'none';

  // this.img.parentNode.insertBefore();

  // create separate canvases for each color
  this.proxyCanvases = {
    red: makeCanvasAndCtx(),
    green: makeCanvasAndCtx(),
    blue: makeCanvasAndCtx()
  };

  this.getImageData();

  // properties
  this.canvasPosition = new Vector();
  this.cursorPosition = new Vector();
  this.getCanvasPosition();

  this.bindEvents();

};

Halftone.prototype.getCanvasPosition = function() {
  var rect = this.canvas.getBoundingClientRect();
  var x = rect.left + window.scrollX;
  var y = rect.top + window.scrollY;
  this.canvasPosition.set( x, y );
};

// -------------------------- img -------------------------- //

Halftone.prototype.getImageData = function( callback ) {
  // hack img load
  var src = this.img.src;
  this.img = new Image();
  this.img.onload = function() {
    this.onImgLoad( callback );
  }.bind( this );
  this.img.src = src;
};

Halftone.prototype.onImgLoad = function( callback ) {
  var imgCanvas = document.createElement('canvas');
  var ctx = imgCanvas.getContext('2d');
  var w = imgCanvas.width = this.img.width;
  var h = imgCanvas.height = this.img.height;
  ctx.drawImage( this.img, 0, 0 );
  this.imgData = ctx.getImageData( 0, 0, w, h ).data;

  w *= this.options.zoom;
  h *= this.options.zoom;

  this.width = w;
  this.height = h;
  this.diagonal = Math.sqrt( w*w + h*h );

  // console.log( this.imgData.length );
  // set proxy canvases size
  for ( var prop in this.proxyCanvases ) {
    var proxy = this.proxyCanvases[ prop ];
    proxy.canvas.width = w;
    proxy.canvas.height = h;
  }
  this.canvas.width = w;
  this.canvas.height = h;
  this.initParticles();
  this.animate();


  if ( callback ) {
    callback.call( this );
  }
};

Halftone.prototype.initParticles = function() {

  var getParticlesMethod = this.options.isRadial ?
    'getRadialGridParticles' : 'getCartesianGridParticles';

  // separate array of particles for each color
  this.particles = {
    red: this[ getParticlesMethod ]( 1 ),
    green: this[ getParticlesMethod ]( 2.5 ),
    blue: this[ getParticlesMethod ]( 5 )
  };

};

Halftone.prototype.animate = function() {
  this.update();
  this.render();
  requestAnimationFrame( this.animate.bind( this ) );
};

Halftone.prototype.update = function() {
  // displace particles with cursors (mouse, touches)
  var displaceOpts = this.options.displacement;
  var forceScale = this.isMousedown ? displaceOpts.activeForce : displaceOpts.hoverForce;
  var radius = this.isMousedown ? displaceOpts.activeRadius : displaceOpts.hoverRadius;
  radius *= this.diagonal;
  var particles = this.particles.red.concat( this.particles.green )
    .concat( this.particles.blue );

  for ( var i=0, len = particles.length; i < len; i++ ) {
    var particle = particles[i];

    var force = Vector.subtract( particle.position, this.cursorPosition );
    var scale = Math.max( 0, radius - force.getMagnitude() ) / radius;
    // scale = Math.cos( scale );
    scale = Math.cos( (1 - scale) * Math.PI ) * 0.5 + 0.5;
    force.scale( scale * forceScale );
    particle.applyForce( force );
    particle.update();
  }
};

Halftone.prototype.render = function() {
  // this.ctx.drawImage( this.img, 0, 0 );

  // black out
  this.ctx.globalCompositeOperation = 'source-over';
  this.ctx.fillStyle = this.options.isAdditive ? 'black' : 'white';
  var w = this.width;
  var h = this.height;
  this.ctx.fillRect( 0, 0, w, h );

  // composite grids
  this.ctx.globalCompositeOperation = this.options.isAdditive ? 'lighter' : 'darker';

  // render channels
  var channels = this.options.channels;
  for ( var i=0, len = channels.length; i < len; i++ ) {
    var channel = channels[i];
    this.renderGrid( channel );
  }

};

Halftone.prototype.renderGrid = function( color ) {
  var proxy = this.proxyCanvases[ color ];

  // proxy.ctx.fillStyle = this.options.isAdditive ? 'black' : 'white';
  // proxy.ctx.fillRect( 0, 0, this.width, this.height );
  proxy.ctx.clearRect( 0, 0, this.width, this.height );

  // set fill color
  proxy.ctx.fillStyle = {
    additive: {
      red: '#FF0000',
      green: '#00FF00',
      blue: '#0000FF'
    },
    subtractive: {
      red: '#00FFFF',
      green: '#FF00FF',
      blue: '#FFFF00'
    }
  }[ this.options.isAdditive ? 'additive' : 'subtractive' ][ color ];

  var particles = this.particles[ color ];

  for ( var i=0, len = particles.length; i < len; i++ ) {
    var particle = particles[i];
    particle.render( proxy.ctx, color );
  }

  // draw proxy canvas to actual canvas as whole layer
  this.ctx.drawImage( proxy.canvas, 0, 0 );

};

Halftone.prototype.getCartesianGridParticles = function( angle ) {
  var particles = [];

  var w = this.width;
  var h = this.height;

  var diag = Math.max( w, h ) * ROOT_2;

  var gridSize = this.options.gridSize;
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

      var particle = this.initParticle( x2, y2 );
      if ( particle ) {
        particles.push( particle );
      }
    }
  }

  return particles;
};

Halftone.prototype.getRadialGridParticles = function( angle ) {
  var particles = [];

  var w = this.width;
  var h = this.height;
  var diag = Math.max( w, h ) * ROOT_2;

  var gridSize = this.options.gridSize;

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
      var particle = this.initParticle( x, y );
      if ( particle ) {
        particles.push( particle );
      }
    }
  }

  return particles;

};

Halftone.prototype.initParticle = function( x2, y2 ) {
  var w = this.canvas.width;
  var h = this.canvas.height;
  // don't render if coords are outside image
  if ( x2 < 0 || x2 > w || y2 < 0 || y2 > h ) {
    return;
  }

  var gridSize = this.options.gridSize;

  var redValue = this.getPixelChannelValue( x2, y2, 'red' );
  var greenValue = this.getPixelChannelValue( x2, y2, 'green' );
  var blueValue = this.getPixelChannelValue( x2, y2, 'blue' );

  // don't render unecessary dots
  var totalColor = redValue + greenValue + blueValue;
  var nullColor = this.options.isAdditive ? 0 : 3;
  if ( totalColor === nullColor ) {
    return;
  }

  return new Particle({
    parent: this,
    origin: new Vector( x2, y2 ),
    naturalSize: gridSize * ROOT_2 / 2,
    friction: this.options.friction
  });

};

Halftone.prototype.getPixelData = function( x, y ) {

  x = Math.round( x / this.options.zoom );
  y = Math.round( y / this.options.zoom );
  var pixelIndex = x + y * this.img.width;
  pixelIndex *= 4;
  return {
    red: this.imgData[ pixelIndex + 0 ],
    green: this.imgData[ pixelIndex + 1 ],
    blue: this.imgData[ pixelIndex + 2 ],
    alpha: this.imgData[ pixelIndex + 3 ]
  };
};

var channelOffset = {
  red: 0,
  green: 1,
  blue: 2
};

Halftone.prototype.getPixelChannelValue = function( x, y, channel ) {
  x = Math.round( x / this.options.zoom );
  y = Math.round( y / this.options.zoom );

  var pixelIndex = x + y * this.img.width;
  var index = pixelIndex * 4 + channelOffset[ channel ];
  return this.imgData[ index ] / 255;
};

// ----- bindEvents ----- //

Halftone.prototype.bindEvents = function() {
  this.canvas.addEventListener( 'mousedown', this, false );
  window.addEventListener( 'mousemove', this, false );
  window.addEventListener( 'resize', this, false );
};

Halftone.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

Halftone.prototype.onmousedown = function( event ) {
  event.preventDefault();
  this.isMousedown = true;
  window.addEventListener( 'mouseup', this, false );
};

Halftone.prototype.onmouseup = function() {
  this.isMousedown = false;
  window.removeEventListener( 'mouseup', this, false );
};

Halftone.prototype.onmousemove = function( event ) {
  // set cursorPositon
  this.cursorPosition.set( event.pageX, event.pageY );
  this.cursorPosition.subtract( this.canvasPosition );
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


// --------------------------  -------------------------- //

Halftone.Vector = Vector;
Halftone.Particle = Particle;
window.BreathingHalftone = Halftone;


})( window );

