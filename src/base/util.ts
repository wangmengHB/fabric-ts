const sqrt = Math.sqrt,
  atan2 = Math.atan2,
  pow = Math.pow,
  PiBy180 = Math.PI / 180,
  PiBy2 = Math.PI / 2;


/**
 * Returns string representation of function body
 * @param {Function} fn Function to get body of
 * @return {String} Function body
 */
export function getFunctionBody(fn: Function) {
  const str = String(fn);
  const match = str.match(/function[^{]*\{([\s\S]*)\}/);
  if (match && match[1]) {
    return match[1];
  }
  return undefined;
}


/**
 * Returns offset for a given element
 * @function
 * @memberOf fabric.util
 * @param {HTMLElement} element Element to get offset for
 * @return {Object} Object with "left" and "top" properties
 */
export function getElementOffset(element: HTMLElement) {
  let docElem,
      doc = element && element.ownerDocument,
      box = { left: 0, top: 0 },
      offset: any = { left: 0, top: 0 },
      scrollLeftTop,
      offsetAttributes: any = {
        borderLeftWidth: 'left',
        borderTopWidth:  'top',
        paddingLeft:     'left',
        paddingTop:      'top'
      };

  if (!doc) {
    return offset;
  }

  for (let attr in offsetAttributes) {
    offset[offsetAttributes[attr]] += parseInt(getElementStyle(element, attr), 10) || 0;
  }

  docElem = doc.documentElement;
  if ( typeof element.getBoundingClientRect !== 'undefined' ) {
    box = element.getBoundingClientRect();
  }

  scrollLeftTop = getScrollLeftTop(element);

  return {
    left: box.left + scrollLeftTop.left - (docElem.clientLeft || 0) + offset.left,
    top: box.top + scrollLeftTop.top - (docElem.clientTop || 0)  + offset.top
  };
}


/**
 * Returns element scroll offsets
 * @memberOf fabric.util
 * @param {HTMLElement} element Element to operate on
 * @return {Object} Object with left/top values
 */
export function getScrollLeftTop(element: HTMLElement) {
  let left = 0, top = 0;
  // While loop checks (and then sets element to) .parentNode OR .host
  //  to account for ShadowDOM. We still want to traverse up out of ShadowDOM,
  //  but the .parentNode of a root ShadowDOM node will always be null, instead
  //  it should be accessed through .host. See http://stackoverflow.com/a/24765528/4383938
  while (element && (element.parentNode)) {

    // Set element to element parent, or 'host' in case of ShadowDOM
    element = element.parentNode as HTMLElement;

    left += element.scrollLeft || 0;
    top += element.scrollTop || 0;
    
    if (element.nodeType === 1 && element.style.position === 'fixed') {
      break;
    }
  }

  return { left: left, top: top };
}




export function getElementStyle(element: HTMLElement, attr: string) {
  let style = (window as any).document.defaultView.getComputedStyle(element, null);
  return style ? style[attr] : undefined;
};




/**
 * Creates specified element with specified attributes
 * @memberOf fabric.util
 * @param {String} tagName Type of an element to create
 * @param {Object} [attributes] Attributes to set on an element
 * @return {HTMLElement} Newly created element
 */
export function makeElement(tagName: string, attributes: any) {
  let el = window.document.createElement(tagName) as HTMLElement;
  for (let prop in attributes) {
    if (prop === 'class') {
      el.className = attributes[prop];
    } else if (prop === 'for') {
      (el as any).htmlFor = attributes[prop];
    } else {
      el.setAttribute(prop, attributes[prop]);
    }
  }
  return el;
}

/**
 * Adds class to an element
 * @memberOf fabric.util
 * @param {HTMLElement} element Element to add class to
 * @param {String} className Class to add to an element
 */
export function addClass(element: HTMLElement, className: string) {
  if (element && (' ' + element.className + ' ').indexOf(' ' + className + ' ') === -1) {
    element.className += (element.className ? ' ' : '') + className;
  }
}

/**
 * Wraps element with another element
 * @memberOf fabric.util
 * @param {HTMLElement} element Element to wrap
 * @param {HTMLElement|String} wrapper Element to wrap with
 * @param {Object} [attributes] Attributes to set on a wrapper
 * @return {HTMLElement} wrapper
 */
export function wrapElement(element: HTMLElement, wrapper: string | HTMLElement, attributes: any) {
  if (typeof wrapper === 'string') {
    wrapper = makeElement(wrapper, attributes);
  }
  if (element.parentNode) {
    element.parentNode.replaceChild(wrapper, element);
  }
  wrapper.appendChild(element);
  return wrapper;
}



const style = window.document.documentElement.style;
const selectProp: string = 'userSelect' in style
  ? 'userSelect'
  : 'MozUserSelect' in style
    ? 'MozUserSelect'
    : 'WebkitUserSelect' in style
      ? 'WebkitUserSelect'
      : 'KhtmlUserSelect' in style
        ? 'KhtmlUserSelect'
        : '';

/**
 * Makes element unselectable
 * @memberOf fabric.util
 * @param {HTMLElement} element Element to make unselectable
 * @return {HTMLElement} Element that was passed in
 */
export function makeElementUnselectable(element: HTMLElement) {
  if (typeof element.onselectstart !== 'undefined') {
    element.onselectstart = () => false;
  }
  if (selectProp) {
    element.style[selectProp as any] = 'none';
  } else if (typeof (element as any).unselectable === 'string') {
    (element as any).unselectable = 'on';
  }
  return element;
}

/**
 * Makes element selectable
 * @memberOf fabric.util
 * @param {HTMLElement} element Element to make selectable
 * @return {HTMLElement} Element that was passed in
 */
export function makeElementSelectable(element: HTMLElement) {
  if (typeof element.onselectstart !== 'undefined') {
    element.onselectstart = null;
  }
  if (selectProp) {
    element.style[selectProp as any] = '';
  } else if (typeof (element as any).unselectable === 'string') {
    (element as any).unselectable = '';
  }
  return element;
}


/**
 * Calculate the cos of an angle, avoiding returning floats for known results
 * @static
 * @memberOf fabric.util
 * @param {Number} angle the angle in radians or in degree
 * @return {Number}
 */
export function cos(angle: number) {
  if (angle === 0) { return 1; }
  if (angle < 0) {
    // cos(a) = cos(-a)
    angle = -angle;
  }
  let angleSlice = angle / PiBy2;
  switch (angleSlice) {
    case 1: case 3: return 0;
    case 2: return -1;
  }
  return Math.cos(angle);
}

/**
 * Calculate the sin of an angle, avoiding returning floats for known results
 * @static
 * @memberOf fabric.util
 * @param {Number} angle the angle in radians or in degree
 * @return {Number}
 */
export function sin(angle: number) {
  if (angle === 0) { return 0; }
  let angleSlice = angle / PiBy2, sign = 1;
  if (angle < 0) {
    // sin(-a) = -sin(a)
    sign = -1;
  }
  switch (angleSlice) {
    case 1: return sign;
    case 2: return 0;
    case 3: return -sign;
  }
  return Math.sin(angle);
}

/**
 * Removes value from an array.
 * Presence of value (and its position in an array) is determined via `Array.prototype.indexOf`
 * @static
 * @memberOf fabric.util
 * @param {Array} array
 * @param {*} value
 * @return {Array} original array
 */
export function removeFromArray(array: any[], value: any) {
  let idx = array.indexOf(value);
  if (idx !== -1) {
    array.splice(idx, 1);
  }
  return array;
}

/**
 * Returns random number between 2 specified ones.
 * @static
 * @memberOf fabric.util
 * @param {Number} min lower limit
 * @param {Number} max upper limit
 * @return {Number} random value (between min and max)
 */
export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Transforms degrees to radians.
 * @static
 * @memberOf fabric.util
 * @param {Number} degrees value in degrees
 * @return {Number} value in radians
 */
export function degreesToRadians(degrees: number) {
  return degrees * PiBy180;
}

/**
 * Transforms radians to degrees.
 * @static
 * @memberOf fabric.util
 * @param {Number} radians value in radians
 * @return {Number} value in degrees
 */
export function radiansToDegrees(radians: number) {
  return radians / PiBy180;
}

/**
 * Rotates `point` around `origin` with `radians`
 * @static
 * @memberOf fabric.util
 * @param {fabric.Point} point The point to rotate
 * @param {fabric.Point} origin The origin of the rotation
 * @param {Number} radians The radians of the angle for the rotation
 * @return {fabric.Point} The new rotated point
 */
export function rotatePoint(point, origin, radians) {
  point.subtractEquals(origin);
  let v = fabric.util.rotateVector(point, radians);
  return new fabric.Point(v.x, v.y).addEquals(origin);
}

/**
 * Rotates `vector` with `radians`
 * @static
 * @memberOf fabric.util
 * @param {Object} vector The vector to rotate (x and y)
 * @param {Number} radians The radians of the angle for the rotation
 * @return {Object} The new rotated point
 */
export function rotateVector(vector, radians) {
  let sin = fabric.util.sin(radians),
      cos = fabric.util.cos(radians),
      rx = vector.x * cos - vector.y * sin,
      ry = vector.x * sin + vector.y * cos;
  return {
    x: rx,
    y: ry
  };
}

/**
 * Apply transform t to point p
 * @static
 * @memberOf fabric.util
 * @param  {fabric.Point} p The point to transform
 * @param  {Array} t The transform
 * @param  {Boolean} [ignoreOffset] Indicates that the offset should not be applied
 * @return {fabric.Point} The transformed point
 */
export function transformPoint(p, t, ignoreOffset) {
  if (ignoreOffset) {
    return new fabric.Point(
      t[0] * p.x + t[2] * p.y,
      t[1] * p.x + t[3] * p.y
    );
  }
  return new fabric.Point(
    t[0] * p.x + t[2] * p.y + t[4],
    t[1] * p.x + t[3] * p.y + t[5]
  );
}

/**
 * Returns coordinates of points's bounding rectangle (left, top, width, height)
 * @param {Array} points 4 points array
 * @param {Array} [transform] an array of 6 numbers representing a 2x3 transform matrix
 * @return {Object} Object with left, top, width, height properties
 */
export function makeBoundingBoxFromPoints(points, transform) {
  if (transform) {
    for (let i = 0; i < points.length; i++) {
      points[i] = fabric.util.transformPoint(points[i], transform);
    }
  }
  let xPoints = [points[0].x, points[1].x, points[2].x, points[3].x],
      minX = fabric.util.array.min(xPoints),
      maxX = fabric.util.array.max(xPoints),
      width = maxX - minX,
      yPoints = [points[0].y, points[1].y, points[2].y, points[3].y],
      minY = fabric.util.array.min(yPoints),
      maxY = fabric.util.array.max(yPoints),
      height = maxY - minY;

  return {
    left: minX,
    top: minY,
    width: width,
    height: height
  };
}

/**
 * Invert transformation t
 * @static
 * @memberOf fabric.util
 * @param {Array} t The transform
 * @return {Array} The inverted transform
 */
export function invertTransform(t) {
  let a = 1 / (t[0] * t[3] - t[1] * t[2]),
      r = [a * t[3], -a * t[1], -a * t[2], a * t[0]],
      o = fabric.util.transformPoint({ x: t[4], y: t[5] } r, true);
  r[4] = -o.x;
  r[5] = -o.y;
  return r;
}

/**
 * A wrapper around Number#toFixed, which contrary to native method returns number, not string.
 * @static
 * @memberOf fabric.util
 * @param {Number|String} number number to operate on
 * @param {Number} fractionDigits number of fraction digits to "leave"
 * @return {Number}
 */
export function toFixed(number, fractionDigits) {
  return parseFloat(Number(number).toFixed(fractionDigits));
}

/**
 * Converts from attribute value to pixel value if applicable.
 * Returns converted pixels or original value not converted.
 * @param {Number|String} value number to operate on
 * @param {Number} fontSize
 * @return {Number|String}
 */
export function parseUnit(value, fontSize) {
  let unit = /\D{0,2}$/.exec(value),
      number = parseFloat(value);
  if (!fontSize) {
    fontSize = fabric.Text.DEFAULT_SVG_FONT_SIZE;
  }
  switch (unit[0]) {
    case 'mm':
      return number * fabric.DPI / 25.4;

    case 'cm':
      return number * fabric.DPI / 2.54;

    case 'in':
      return number * fabric.DPI;

    case 'pt':
      return number * fabric.DPI / 72; // or * 4 / 3

    case 'pc':
      return number * fabric.DPI / 72 * 12; // or * 16

    case 'em':
      return number * fontSize;

    default:
      return number;
  }
}

/**
 * Function which always returns `false`.
 * @static
 * @memberOf fabric.util
 * @return {Boolean}
 */
export function falseFunction() {
  return false;
}

/**
 * Returns klass "Class" object of given namespace
 * @memberOf fabric.util
 * @param {String} type Type of object (eg. 'circle')
 * @param {String} namespace Namespace to get klass "Class" object from
 * @return {Object} klass "Class"
 */
export function getKlass(type, namespace) {
  // capitalize first letter only
  type = fabric.util.string.camelize(type.charAt(0).toUpperCase() + type.slice(1));
  return fabric.util.resolveNamespace(namespace)[type];
}

/**
 * Returns array of attributes for given svg that fabric parses
 * @memberOf fabric.util
 * @param {String} type Type of svg element (eg. 'circle')
 * @return {Array} string names of supported attributes
 */
export function getSvgAttributes(type) {
  let attributes = [
    'instantiated_by_use',
    'style',
    'id',
    'class'
  ];
  switch (type) {
    case 'linearGradient':
      attributes = attributes.concat(['x1', 'y1', 'x2', 'y2', 'gradientUnits', 'gradientTransform']);
      break;
    case 'radialGradient':
      attributes = attributes.concat(['gradientUnits', 'gradientTransform', 'cx', 'cy', 'r', 'fx', 'fy', 'fr']);
      break;
    case 'stop':
      attributes = attributes.concat(['offset', 'stop-color', 'stop-opacity']);
      break;
  }
  return attributes;
}

/**
 * Returns object of given namespace
 * @memberOf fabric.util
 * @param {String} namespace Namespace string e.g. 'fabric.Image.filter' or 'fabric'
 * @return {Object} Object for given namespace (default fabric)
 */
export function resolveNamespace(namespace) {
  if (!namespace) {
    return fabric;
  }

  let parts = namespace.split('.'),
      len = parts.length, i,
      obj = global || fabric.window;

  for (i = 0; i < len; ++i) {
    obj = obj[parts[i]];
  }

  return obj;
}

/**
 * Loads image element from given url and passes it to a callback
 * @memberOf fabric.util
 * @param {String} url URL representing an image
 * @param {Function} callback Callback; invoked with loaded image
 * @param {*} [context] Context to invoke callback in
 * @param {Object} [crossOrigin] crossOrigin value to set image element to
 */
export function loadImage(url, callback, context, crossOrigin) {
  if (!url) {
    callback && callback.call(context, url);
    return;
  }

  let img = document.createElement('img');

  /** @ignore */
  let onLoadCallback = function () {
    callback && callback.call(context, img);
    img = img.onload = img.onerror = null;
  };

  img.onload = onLoadCallback;
  /** @ignore */
  img.onerror = function() {
    fabric.log('Error loading ' + img.src);
    callback && callback.call(context, null, true);
    img = img.onload = img.onerror = null;
  };

  // data-urls appear to be buggy with crossOrigin
  // https://github.com/kangax/fabric.js/commit/d0abb90f1cd5c5ef9d2a94d3fb21a22330da3e0a#commitcomment-4513767
  // see https://code.google.com/p/chromium/issues/detail?id=315152
  //     https://bugzilla.mozilla.org/show_bug.cgi?id=935069
  if (url.indexOf('data') !== 0 && crossOrigin) {
    img.crossOrigin = crossOrigin;
  }

  // IE10 / IE11-Fix: SVG contents from data: URI
  // will only be available if the IMG is present
  // in the DOM (and visible)
  if (url.substring(0,14) === 'data:image/svg') {
    img.onload = null;
    loadImageInDom(img, onLoadCallback);
  }

  img.src = url;
}

/**
 * Attaches SVG image with data: URL to the dom
 * @memberOf fabric.util
 * @param {Object} img Image object with data:image/svg src
 * @param {Function} callback Callback; invoked with loaded image
 * @return {Object} DOM element (div containing the SVG image)
 */
export function loadImageInDom(img, onLoadCallback) {
  let div = document.createElement('div');
  div.style.width = div.style.height = '1px';
  div.style.left = div.style.top = '-100%';
  div.style.position = 'absolute';
  div.appendChild(img);
  fabric.document.querySelector('body').appendChild(div);
  /**
   * Wrap in function to:
   *   1. Call existing callback
   *   2. Cleanup DOM
   */
  img.onload = function () {
    onLoadCallback();
    div.parentNode.removeChild(div);
    div = null;
  };
}

/**
 * Creates corresponding fabric instances from their object representations
 * @static
 * @memberOf fabric.util
 * @param {Array} objects Objects to enliven
 * @param {Function} callback Callback to invoke when all objects are created
 * @param {String} namespace Namespace to get klass "Class" object from
 * @param {Function} reviver Method for further parsing of object elements,
 * called after each fabric object created.
 */
export function enlivenObjects(objects, callback, namespace, reviver) {
  objects = objects || [];

  let enlivenedObjects = [],
      numLoadedObjects = 0,
      numTotalObjects = objects.length;

  function onLoaded() {
    if (++numLoadedObjects === numTotalObjects) {
      callback && callback(enlivenedObjects.filter(function(obj) {
        // filter out undefined objects (objects that gave error)
        return obj;
      }));
    }
  }

  if (!numTotalObjects) {
    callback && callback(enlivenedObjects);
    return;
  }

  objects.forEach(function (o, index) {
    // if sparse array
    if (!o || !o.type) {
      onLoaded();
      return;
    }
    let klass = fabric.util.getKlass(o.type, namespace);
    klass.fromObject(o, function (obj, error) {
      error || (enlivenedObjects[index] = obj);
      reviver && reviver(o, obj, error);
      onLoaded();
    });
  });
}

/**
 * Create and wait for loading of patterns
 * @static
 * @memberOf fabric.util
 * @param {Array} patterns Objects to enliven
 * @param {Function} callback Callback to invoke when all objects are created
 * called after each fabric object created.
 */
export function enlivenPatterns(patterns, callback) {
  patterns = patterns || [];

  function onLoaded() {
    if (++numLoadedPatterns === numPatterns) {
      callback && callback(enlivenedPatterns);
    }
  }

  let enlivenedPatterns = [],
      numLoadedPatterns = 0,
      numPatterns = patterns.length;

  if (!numPatterns) {
    callback && callback(enlivenedPatterns);
    return;
  }

  patterns.forEach(function (p, index) {
    if (p && p.source) {
      new fabric.Pattern(p, function(pattern) {
        enlivenedPatterns[index] = pattern;
        onLoaded();
      });
    }
    else {
      enlivenedPatterns[index] = p;
      onLoaded();
    }
  });
}

/**
 * Groups SVG elements (usually those retrieved from SVG document)
 * @static
 * @memberOf fabric.util
 * @param {Array} elements SVG elements to group
 * @param {Object} [options] Options object
 * @param {String} path Value to set sourcePath to
 * @return {fabric.Object|fabric.Group}
 */
export function groupSVGElements(elements, options, path) {
  let object;
  if (elements && elements.length === 1) {
    return elements[0];
  }
  if (options) {
    if (options.width && options.height) {
      options.centerPoint = {
        x: options.width / 2,
        y: options.height / 2
      };
    }
    else {
      delete options.width;
      delete options.height;
    }
  }
  object = new fabric.Group(elements, options);
  if (typeof path !== 'undefined') {
    object.sourcePath = path;
  }
  return object;
}

/**
 * Populates an object with properties of another object
 * @static
 * @memberOf fabric.util
 * @param {Object} source Source object
 * @param {Object} destination Destination object
 * @return {Array} properties Properties names to include
 */
export function populateWithProperties(source, destination, properties) {
  if (properties && Object.prototype.toString.call(properties) === '[object Array]') {
    for (let i = 0, len = properties.length; i < len; i++) {
      if (properties[i] in source) {
        destination[properties[i]] = source[properties[i]];
      }
    }
  }
}

/**
 * Draws a dashed line between two points
 *
 * This method is used to draw dashed line around selection area.
 * See <a href="http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas">dotted stroke in canvas</a>
 *
 * @param {CanvasRenderingContext2D} ctx context
 * @param {Number} x  start x coordinate
 * @param {Number} y start y coordinate
 * @param {Number} x2 end x coordinate
 * @param {Number} y2 end y coordinate
 * @param {Array} da dash array pattern
 */
export function drawDashedLine(ctx, x, y, x2, y2, da) {
  let dx = x2 - x,
      dy = y2 - y,
      len = sqrt(dx * dx + dy * dy),
      rot = atan2(dy, dx),
      dc = da.length,
      di = 0,
      draw = true;

  ctx.save();
  ctx.translate(x, y);
  ctx.moveTo(0, 0);
  ctx.rotate(rot);

  x = 0;
  while (len > x) {
    x += da[di++ % dc];
    if (x > len) {
      x = len;
    }
    ctx[draw ? 'lineTo' : 'moveTo'](x, 0);
    draw = !draw;
  }

  ctx.restore();
}


/**
 * Creates a canvas element that is a copy of another and is also painted
 * @param {CanvasElement} canvas to copy size and content of
 * @static
 * @memberOf fabric.util
 * @return {CanvasElement} initialized canvas element
 */
export function copyCanvasElement(canvas: HTMLCanvasElement) {
  let newCanvas = document.createElement('canvas');
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  (newCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(canvas, 0, 0);
  return newCanvas;
}

/**
 * since 2.6.0 moved from canvas instance to utility.
 * @param {CanvasElement} canvasEl to copy size and content of
 * @param {String} format 'jpeg' or 'png', in some browsers 'webp' is ok too
 * @param {Number} quality <= 1 and > 0
 * @static
 * @memberOf fabric.util
 * @return {String} data url
 */
export function toDataURL(canvasEl: HTMLCanvasElement, format: string, quality: number) {
  return canvasEl.toDataURL('image/' + format, quality);
}


/**
 * @static
 * @memberOf fabric.util
 * @deprecated since 2.0.0
 * @param {fabric.Object} receiver Object implementing `clipTo` method
 * @param {CanvasRenderingContext2D} ctx Context to clip
 */
export function clipContext(receiver, ctx) {
  ctx.save();
  ctx.beginPath();
  receiver.clipTo(ctx);
  ctx.clip();
}

/**
 * Multiply matrix A by matrix B to nest transformations
 * @static
 * @memberOf fabric.util
 * @param  {Array} a First transformMatrix
 * @param  {Array} b Second transformMatrix
 * @param  {Boolean} is2x2 flag to multiply matrices as 2x2 matrices
 * @return {Array} The product of the two transform matrices
 */
export function multiplyTransformMatrices(a, b, is2x2) {
  // Matrix multiply a * b
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    is2x2 ? 0 : a[0] * b[4] + a[2] * b[5] + a[4],
    is2x2 ? 0 : a[1] * b[4] + a[3] * b[5] + a[5]
  ];
}

/**
 * Decomposes standard 2x3 matrix into transform components
 * @static
 * @memberOf fabric.util
 * @param  {Array} a transformMatrix
 * @return {Object} Components of transform
 */
export function qrDecompose(a) {
  let angle = atan2(a[1], a[0]),
      denom = pow(a[0], 2) + pow(a[1], 2),
      scaleX = sqrt(denom),
      scaleY = (a[0] * a[3] - a[2] * a [1]) / scaleX,
      skewX = atan2(a[0] * a[2] + a[1] * a [3], denom);
  return {
    angle: angle  / PiBy180,
    scaleX: scaleX,
    scaleY: scaleY,
    skewX: skewX / PiBy180,
    skewY: 0,
    translateX: a[4],
    translateY: a[5]
  };
}

/**
 * Returns a transform matrix starting from an object of the same kind of
 * the one returned from qrDecompose, useful also if you want to calculate some
 * transformations from an object that is not enlived yet
 * @static
 * @memberOf fabric.util
 * @param  {Object} options
 * @param  {Number} [options.angle] angle in degrees
 * @return {Number[]} transform matrix
 */
export function calcRotateMatrix(options) {
  if (!options.angle) {
    return fabric.iMatrix.concat();
  }
  let theta = fabric.util.degreesToRadians(options.angle),
      cos = fabric.util.cos(theta),
      sin = fabric.util.sin(theta);
  return [cos, sin, -sin, cos, 0, 0];
}

/**
 * Returns a transform matrix starting from an object of the same kind of
 * the one returned from qrDecompose, useful also if you want to calculate some
 * transformations from an object that is not enlived yet.
 * is called DimensionsTransformMatrix because those properties are the one that influence
 * the size of the resulting box of the object.
 * @static
 * @memberOf fabric.util
 * @param  {Object} options
 * @param  {Number} [options.scaleX]
 * @param  {Number} [options.scaleY]
 * @param  {Boolean} [options.flipX]
 * @param  {Boolean} [options.flipY]
 * @param  {Number} [options.skewX]
 * @param  {Number} [options.skewX]
 * @return {Number[]} transform matrix
 */
export function calcDimensionsMatrix(options) {
  let scaleX = typeof options.scaleX === 'undefined' ? 1 : options.scaleX,
      scaleY = typeof options.scaleY === 'undefined' ? 1 : options.scaleY,
      scaleMatrix = [
        options.flipX ? -scaleX : scaleX,
        0,
        0,
        options.flipY ? -scaleY : scaleY,
        0,
        0],
      multiply = fabric.util.multiplyTransformMatrices,
      degreesToRadians = fabric.util.degreesToRadians;
  if (options.skewX) {
    scaleMatrix = multiply(
      scaleMatrix,
      [1, 0, Math.tan(degreesToRadians(options.skewX)), 1],
      true);
  }
  if (options.skewY) {
    scaleMatrix = multiply(
      scaleMatrix,
      [1, Math.tan(degreesToRadians(options.skewY)), 0, 1],
      true);
  }
  return scaleMatrix;
}

/**
 * Returns a transform matrix starting from an object of the same kind of
 * the one returned from qrDecompose, useful also if you want to calculate some
 * transformations from an object that is not enlived yet
 * @static
 * @memberOf fabric.util
 * @param  {Object} options
 * @param  {Number} [options.angle]
 * @param  {Number} [options.scaleX]
 * @param  {Number} [options.scaleY]
 * @param  {Boolean} [options.flipX]
 * @param  {Boolean} [options.flipY]
 * @param  {Number} [options.skewX]
 * @param  {Number} [options.skewX]
 * @param  {Number} [options.translateX]
 * @param  {Number} [options.translateY]
 * @return {Number[]} transform matrix
 */
export function composeMatrix(options) {
  let matrix = [1, 0, 0, 1, options.translateX || 0, options.translateY || 0],
      multiply = multiplyTransformMatrices;
  if (options.angle) {
    matrix = multiply(matrix, calcRotateMatrix(options));
  }
  if (options.scaleX || options.scaleY || options.skewX || options.skewY || options.flipX || options.flipY) {
    matrix = multiply(matrix, calcDimensionsMatrix(options));
  }
  return matrix;
}

/**
 * Returns a transform matrix that has the same effect of scaleX, scaleY and skewX.
 * Is deprecated for composeMatrix. Please do not use it.
 * @static
 * @deprecated since 3.4.0
 * @memberOf fabric.util
 * @param  {Number} scaleX
 * @param  {Number} scaleY
 * @param  {Number} skewX
 * @return {Number[]} transform matrix
 */
export function customTransformMatrix(scaleX, scaleY, skewX) {
  return composeMatrix({ scaleX: scaleX, scaleY: scaleY, skewX: skewX });
}

/**
 * reset an object transform state to neutral. Top and left are not accounted for
 * @static
 * @memberOf fabric.util
 * @param  {fabric.Object} target object to transform
 */
export function resetObjectTransform (target) {
  target.scaleX = 1;
  target.scaleY = 1;
  target.skewX = 0;
  target.skewY = 0;
  target.flipX = false;
  target.flipY = false;
  target.rotate(0);
}

/**
 * Extract Object transform values
 * @static
 * @memberOf fabric.util
 * @param  {fabric.Object} target object to read from
 * @return {Object} Components of transform
 */
export function saveObjectTransform(target) {
  return {
    scaleX: target.scaleX,
    scaleY: target.scaleY,
    skewX: target.skewX,
    skewY: target.skewY,
    angle: target.angle,
    left: target.left,
    flipX: target.flipX,
    flipY: target.flipY,
    top: target.top
  };
}


/**
 * Returns true if context has transparent pixel
 * at specified location (taking tolerance into account)
 * @param {CanvasRenderingContext2D} ctx context
 * @param {Number} x x coordinate
 * @param {Number} y y coordinate
 * @param {Number} tolerance Tolerance
 */
export function isTransparent(ctx, x, y, tolerance) {

  // If tolerance is > 0 adjust start coords to take into account.
  // If moves off Canvas fix to 0
  if (tolerance > 0) {
    if (x > tolerance) {
      x -= tolerance;
    }
    else {
      x = 0;
    }
    if (y > tolerance) {
      y -= tolerance;
    }
    else {
      y = 0;
    }
  }

  let _isTransparent = true, i, temp,
      imageData = ctx.getImageData(x, y, (tolerance * 2) || 1, (tolerance * 2) || 1),
      l = imageData.data.length;

  // Split image data - for tolerance > 1, pixelDataSize = 4;
  for (i = 3; i < l; i += 4) {
    temp = imageData.data[i];
    _isTransparent = temp <= 0;
    if (_isTransparent === false) {
      break; // Stop if colour found
    }
  }

  imageData = null;

  return _isTransparent;
}

/**
 * Parse preserveAspectRatio attribute from element
 * @param {string} attribute to be parsed
 * @return {Object} an object containing align and meetOrSlice attribute
 */
export function parsePreserveAspectRatioAttribute(attribute) {
  let meetOrSlice = 'meet', alignX = 'Mid', alignY = 'Mid',
      aspectRatioAttrs = attribute.split(' '), align;

  if (aspectRatioAttrs && aspectRatioAttrs.length) {
    meetOrSlice = aspectRatioAttrs.pop();
    if (meetOrSlice !== 'meet' && meetOrSlice !== 'slice') {
      align = meetOrSlice;
      meetOrSlice = 'meet';
    }
    else if (aspectRatioAttrs.length) {
      align = aspectRatioAttrs.pop();
    }
  }
  //divide align in alignX and alignY
  alignX = align !== 'none' ? align.slice(1, 4) : 'none';
  alignY = align !== 'none' ? align.slice(5, 8) : 'none';
  return {
    meetOrSlice: meetOrSlice,
    alignX: alignX,
    alignY: alignY
  };
}

/**
 * Clear char widths cache for the given font family or all the cache if no
 * fontFamily is specified.
 * Use it if you know you are loading fonts in a lazy way and you are not waiting
 * for custom fonts to load properly when adding text objects to the canvas.
 * If a text object is added when its own font is not loaded yet, you will get wrong
 * measurement and so wrong bounding boxes.
 * After the font cache is cleared, either change the textObject text content or call
 * initDimensions() to trigger a recalculation
 * @memberOf fabric.util
 * @param {String} [fontFamily] font family to clear
 */
export function clearFabricFontCache(fontFamily) {
  fontFamily = (fontFamily || '').toLowerCase();
  if (!fontFamily) {
    fabric.charWidthsCache = { };
  }
  else if (fabric.charWidthsCache[fontFamily]) {
    delete fabric.charWidthsCache[fontFamily];
  }
}

/**
 * Given current aspect ratio, determines the max width and height that can
 * respect the total allowed area for the cache.
 * @memberOf fabric.util
 * @param {Number} ar aspect ratio
 * @param {Number} maximumArea Maximum area you want to achieve
 * @return {Object.x} Limited dimensions by X
 * @return {Object.y} Limited dimensions by Y
 */
export function limitDimsByArea(ar, maximumArea) {
  let roughWidth = Math.sqrt(maximumArea * ar),
      perfLimitSizeY = Math.floor(maximumArea / roughWidth);
  return { x: Math.floor(roughWidth), y: perfLimitSizeY };
}

export function capValue(min, value, max) {
  return Math.max(min, Math.min(value, max));
}

export function findScaleToFit(source, destination) {
  return Math.min(destination.width / source.width, destination.height / source.height);
}

export function findScaleToCover(source, destination) {
  return Math.max(destination.width / source.width, destination.height / source.height);
}

/**
 * given an array of 6 number returns something like `"matrix(...numbers)"`
 * @memberOf fabric.util
 * @param {Array} trasnform an array with 6 numbers
 * @return {String} transform matrix for svg
 * @return {Object.y} Limited dimensions by Y
 */
export function matrixToSVG(transform) {
  return 'matrix(' + transform.map(function(value) {
    return fabric.util.toFixed(value, fabric.Object.NUM_FRACTION_DIGITS);
  }).join(' ') + ')';
}




