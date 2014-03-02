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

  var img = document.querySelector('#hero img');
  new BreathingHalftone( img );

}

document.addEventListener( 'DOMContentLoaded', init, false );
window.onload = init;

})( window );
