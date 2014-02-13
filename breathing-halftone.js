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
  gridSize: 40,
  zoom: 1
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
  
  // this.img.parentNode.insertBefore();

  // create separate canvases for each color
  this.proxyCanvases = {
    red: makeCanvasAndCtx(),
    green: makeCanvasAndCtx(),
    blue: makeCanvasAndCtx()
  };

  this.getImageData( function() {
    // console.log( this.imgData.length );
    console.log( this.getPixelData( 350, 350 ));
    // set proxy canvases size
    for ( var prop in this.proxyCanvases ) {
      var proxy = this.proxyCanvases[ prop ];
      proxy.canvas.width = this.img.width;
      proxy.canvas.height = this.img.height;
    }
    this.canvas.width = this.img.width;
    this.canvas.height = this.img.height;
    this.render();
  });
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
  callback.call( this );
};

Halftone.prototype.render = function() {
  // this.ctx.drawImage( this.img, 0, 0 );

  // black out
  this.ctx.globalCompositeOperation = 'source-over';
  this.ctx.fillStyle = 'black';
  var w = this.canvas.width;
  var h = this.canvas.height;
  this.ctx.fillRect( 0, 0, w, h );

  // composite grids
  this.ctx.globalCompositeOperation = 'lighter';
  this.renderGrid( 'red', 1 );
  this.renderGrid( 'green', 2.5 );
  this.renderGrid( 'blue', 5 );

};

Halftone.prototype.renderGrid = function( color, angle ) {

  var proxy = this.proxyCanvases[ color ];
  // var renderCtx = renderCanvases[ color ].ctx;
  proxy.ctx.fillStyle = 'black';
  proxy.ctx.fillRect( 0, 0, w, h );


  var w = this.canvas.width;
  var h = this.canvas.height;
  var diag = Math.max( w, h ) * ROOT_2;
  
  var zoom = 1;

  var gridSize = this.options.gridSize;
  var cols = Math.ceil( diag / gridSize );
  var rows = Math.ceil( diag / gridSize );
  console.log( cols, rows );
  var radius = gridSize * ROOT_2 / 2;

  // set color
  switch ( color ) {
    case 'red' :
      proxy.ctx.fillStyle = 'rgb(255,0,0)';
      break;
    case 'green' :
      proxy.ctx.fillStyle = 'rgb(0,255,0)';
      break;
    case 'blue' :
      proxy.ctx.fillStyle = 'rgb(0,0,255)';
      break;
  }

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
      if ( x2 > 0 && x2 < w && y2 > 0 && y2 < h ) {
        var x3 = x2 / zoom;
        var y3 = y2 / zoom;
        var pixelData = this.getPixelData( x3, y3 );
        var colorSize = pixelData[ color ] / 255;
        circle( proxy.ctx, x2, y2, colorSize * radius );
        // rect( renderCtx, x2, y2, colorSize * spacing, angle );
      }
    }
  }

  // draw proxy canvas to actual canvas as whole layer
  this.ctx.drawImage( proxy.canvas, 0, 0 );

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

