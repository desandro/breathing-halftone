( function( window ) {

'use strict';

// -------------------------- BreathingHalftone -------------------------- //

function Halftone( canvas ) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.create();
}

Halftone.prototype.create = function() {
  this.getImageData( function() {
    // console.log( this.imgData.length );
    console.log( this.getPixelData( 350, 350 ));
  });
};

Halftone.prototype.getImageData = function( callback ) {
  this.img = new Image();
  this.img.onload = function() {
    this.onImgLoad( callback );
  }.bind( this ); 
  this.img.src = this.canvas.getAttribute('data-src');
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

window.BreathingHalftone = Halftone;


})( window );

