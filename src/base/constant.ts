
export const STATE_PROPERTIES = (
  'top left width height scaleX scaleY flipX flipY originX originY transformMatrix ' +
  'stroke strokeWidth strokeDashArray strokeLineCap strokeDashOffset strokeLineJoin strokeMiterLimit ' +
  'angle opacity fill globalCompositeOperation shadow clipTo visible backgroundColor ' +
  'skewX skewY fillRule paintFirst clipPath strokeUniform'
).split(' ');


export const CACHE_PROPERTIES = (
  'fill stroke strokeWidth strokeDashArray width height paintFirst strokeUniform' +
  ' strokeLineCap strokeDashOffset strokeLineJoin strokeMiterLimit backgroundColor clipPath'
).split(' ');

export const ALIASING_LIMIT = 2;

export const noop = () => {};