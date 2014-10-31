( function( window ) {

'use strict';

var BreathingHalftone = window.BreathingHalftone;

var isInited = false;

var halftone;

// options for each demo
var demoOptions = {
  sarah: {},
  ncsu: {
    isAdditive: true,
    isRadial: true,
    friction: 0.04,
    displacement: {
      hoverDiameter: 0.8,
      hoverForce: 0.007,
      activeDiameter: 0.8,
      activeForce: -0.007
    }
  },
  'the-look': {
    dotSize: {
      diameter: 1/70,
      initVelocity: 0.05,
      oscAmplitude: 0
    },
    friction: 0.05,
    channels: [ 'lum' ]
  }
};

function init() {
  // init once
  if ( isInited ) {
    return;
  }
  isInited = true;

  var thumbnailRail = document.querySelector('.thumbnails');
  var setName;

  function initHalftone( name ) {
    // do not re-init
    if ( name === setName ) {
      return;
    }
    var img = document.querySelector( 'img.' + name );
    var opts = demoOptions[ name ];
    if ( halftone ) {
      halftone.destroy();
    }
    halftone = new BreathingHalftone( img, opts );
    window.halftone = halftone;
    setName = name;
  }

  initHalftone('sarah');

  thumbnailRail.addEventListener( 'click', onThumbnailClick, false );

  function onThumbnailClick( event ) {
    if ( event.target.nodeName !== 'IMG' ) {
      return;
    }
    var name = event.target.getAttribute('data-name');
    initHalftone( name );
    thumbnailRail.querySelector('.is-selected').className = '';
    event.target.className = 'is-selected';
  }

}

document.addEventListener( 'DOMContentLoaded', init, false );
window.onload = init;

})( window );
