( function( window ) {

'use strict';

// ----- vars ----- //

var TAU = Math.PI * 2;
var ROOT_2 = Math.sqrt( 2 );

// ----- helpers ----- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
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

// -------------------------- BreathingHalftone -------------------------- //

function Halftone( img, options ) {
  this.options = extend( {}, this.constructor.defaults );
  this.options = extend( this.options, options );
  this.img = img;
  this.create();
}

Halftone.defaults = {
  gridSize: 20,
  zoom: 1,
  isAdditive: true
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
};

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

  // console.log( this.imgData.length );
  // console.log( this.getPixelData( 350, 350 ));
  // set proxy canvases size
  for ( var prop in this.proxyCanvases ) {
    var proxy = this.proxyCanvases[ prop ];
    proxy.canvas.width = w;
    proxy.canvas.height = h;
  }
  this.canvas.width = w;
  this.canvas.height = h;
  this.render();


  if ( callback ) {
    callback.call( this );
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
  this.renderGrid( 'red', 1 );
  this.renderGrid( 'green', 2.5 );
  this.renderGrid( 'blue', 5 );

};

Halftone.prototype.renderGrid = function( color, angle ) {

  var proxy = this.proxyCanvases[ color ];
  // var renderCtx = renderCanvases[ color ].ctx;

  // console.log( w, h );

  proxy.ctx.fillStyle = this.options.isAdditive ? 'black' : 'white';
  proxy.ctx.fillRect( 0, 0, this.width, this.height );

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

  var renderMethod = this.options.isRadial ? 'renderRadialGrid' : 'renderCartesianGrid';
  this[ renderMethod ]( color, angle, proxy );

  // draw proxy canvas to actual canvas as whole layer
  this.ctx.drawImage( proxy.canvas, 0, 0 );

};

Halftone.prototype.renderCartesianGrid = function( color, angle, proxy ) {

  var w = this.width;
  var h = this.height;

  var diag = Math.max( w, h ) * ROOT_2;

  var gridSize = this.options.gridSize;
  var cols = Math.ceil( diag / gridSize );
  var rows = Math.ceil( diag / gridSize );


  // var mod = ( frame % repeatFrames ) / repeatFrames || 1;
  for ( var row = 0; row < rows; row++ ) {
    for ( var col = 0; col < cols; col++ ) {
      var x1 = ( col + 0.5 ) * gridSize;
      var y1 = ( row + 0.5 ) * gridSize;
      // move by x
      // x1 += ((frame % repeatFrames) / repeatFrames) * spacing;
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
      this.renderDot( x2, y2, color, proxy );
    }
  }
};

Halftone.prototype.renderRadialGrid = function( color, angle, proxy ) {
  var w = this.width;
  var h = this.height;
  var diag = Math.max( w, h ) * ROOT_2;

  var gridSize = this.options.gridSize;

  var halfW = w / 2;
  var halfH = h / 2;
  var offset = 100;
  var centerX = halfW + Math.cos( angle ) * offset;
  var centerY = halfH + Math.sin( angle ) * offset;

  var maxLevel = Math.ceil( ( diag + offset ) / gridSize );

  for ( var level=0; level < maxLevel; level++ ) {
    var max = level * 6 || 1;
    for ( var j=0; j < max; j++ ) {
      var theta = TAU * j / max + angle;
      var x = centerX + Math.cos( theta ) * level * gridSize;
      var y = centerY + Math.sin( theta ) * level * gridSize;
      this.renderDot( x, y, color, proxy );
    }
  }

};

Halftone.prototype.renderDot = function( x2, y2, color, proxy ) {
  var w = this.canvas.width;
  var h = this.canvas.height;

  // don't render if coords are outside image
  if ( x2 < 0 || x2 > w || y2 < 0 || y2 > h ) {
    return;
  }

  var gridSize = this.options.gridSize;
  var radius = gridSize * ROOT_2 / 2;

  var x3 = x2 / this.options.zoom;
  var y3 = y2 / this.options.zoom;
  var pixelData = this.getPixelData( x3, y3 );

  // don't render unecessary dots
  var totalColor = pixelData.red + pixelData.green + pixelData.blue;
  // console.log( totalColor );
  var nullColor = this.options.isAdditive ? 0 : 255;
  if ( totalColor === nullColor ) {
    // console.log('no dot');
    return;
  }

  var colorSize = pixelData[ color ] / 255;
  if ( !this.options.isAdditive ) {
    colorSize = 1 - colorSize;
  }
  circle( proxy.ctx, x2, y2, colorSize * radius );
  // rect( renderCtx, x2, y2, colorSize * spacing, angle );

};

Halftone.prototype.getPixelData = function( x, y ) {
  x = Math.round( x );
  y = Math.round( y );
  var pixelIndex = x + y * this.img.width;
  pixelIndex *= 4;
  return {
    red: this.imgData[ pixelIndex + 0 ],
    green: this.imgData[ pixelIndex + 1 ],
    blue: this.imgData[ pixelIndex + 2 ],
    alpha: this.imgData[ pixelIndex + 3 ]
  };
};


function circle( ctx, x, y, r ) {
  ctx.beginPath();
  ctx.arc( x, y, r, 0, TAU );
  ctx.fill();
  ctx.closePath();
}


window.BreathingHalftone = Halftone;


})( window );

