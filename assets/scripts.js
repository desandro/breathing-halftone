( function( window ) {

'use strict';

var BreathingHalftone = window.BreathingHalftone;

var isInited = false;

function init() {
  // init once
  if ( isInited ) {
    return;
  }
  isInited = true;

  // var img = document.querySelector('.sarah');
  // var halftone = new BreathingHalftone( img );

  // var img = document.querySelector('.ncsu');
  // var halftone = new BreathingHalftone( img, {
  //   isAdditive: true,
  //   isRadial: true,
  //   friction: 0.04,
  //   displacement: {
  //     hoverDiameter: 0.8,
  //     hoverForce: 0.007,
  //     activeDiameter: 0.8,
  //     activeForce: -0.007
  //   }
  // });

  var img = document.querySelector('.the-look');
  var halftone = new BreathingHalftone( img, {
    dotSize: {
      diameter: 1/70,
      initVelocity: 0.05,
      oscAmplitude: 0
    },
    friction: 0.05,
    channels: [ 'lum' ]
  });

  window.halftone = halftone;
}

document.addEventListener( 'DOMContentLoaded', init, false );
window.onload = init;

})( window );
