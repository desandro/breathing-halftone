# Breathing Halftone

_Images go whoa with lots of floaty dots_

Made for [Yaron](http://yaronschoen.com/info)

## Install

[breathing-halftone.pkgd.js](http://breathing-halftone.desandro.com/dist/breathing-halftone.pkgd.js)

[breathing-halftone.pkgd.min.js](http://breathing-halftone.desandro.com/dist/breathing-halftone.pkgd.min.js)

## Usage

``` js
// get the image
// jquery
var img = $('#hero img')[0];
// or vanilla JS
var img = document.querySelector('#hero img');

// init halftone
new BreathingHalftone( img, {
  // options...
});
```

Browsers that do not support `<canvas>` will fall back to the original image.

Set `data-src` to use a different source image, so you can display stylized halftone-y image as a fallback.

``` html
<img src="portrait-dots.png" data-src="portrait.jpg" />
```

## Options

There are a bunch of options so you can fine-tune to your heart's content.

``` js
// default options
{
  // ----- dot size ----- //

  dotSize: 1/40,
  // size of dots
  // as a fraction of the diagonal of the image
  // smaller dots = more dots = poorer performance

  dotSizeThreshold: 0.05,
  // hides dots that are smaller than a percentage

  initVelocity: 0.02,
  // speed at which dots initially grow

  oscPeriod: 3,
  // duration in seconds of a cycle of dot size oscilliation or 'breathing'

  oscAmplitude: 0.2
  // percentage of change of oscillation

  // ----- color & layout ----- //

  isAdditive: false,
  // additive is black with RGB dots,
  // subtractive is white with CMK dots

  isRadial: false,
  // enables radial grid layout

  channels: [ 'red', 'green', 'blue' ],
  // layers of dots
  // 'lum' is another supported channel, for luminosity

  isChannelLens: true,
  // disables changing size of dots when displaced

  // ----- behavior ----- //

  friction: 0.06,
  // lower makes dots easier to move, higher makes it harder

  hoverDiameter: 0.3,
  // size of hover effect
  // as a fraction of the diagonal of the image

  hoverForce: -0.02,
  // amount of force of hover effect
  // negative values pull dots in, positive push out

  activeDiameter: 0.6,
  // size of click/tap effect
  // as a fraction of the diagonal of the image

  activeForce: 0.01
  // amount of force of hover effect
  // negative values pull dots in, positive push out
}
```

## Gotchas

As the halftone is low resolution, you don't need a high resolution source image.

Images must be hosted on the same domain as the site. Cross-domain images cannot be used for [security according to the `<canvas>` spec](http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#security-with-canvas-elements).

Smaller dots = lots more dots = poorer browser performance.

As [Firefox and IE do not support `darker` compositing](http://dropshado.ws/post/77229081704/firefox-doesnt-support-canvas-composite-darker), so these browsers will fallback to simple black and white design, using `channels: [ 'lum' ]`.

## MIT License

Breathing Halftone is released under the [MIT License](http://desandro.mit-license.org/). Have at it.
