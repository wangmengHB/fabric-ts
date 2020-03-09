import CommonBase from '../base/CommonBase';
import { noop } from '../base/constant';
import { getConfig } from '../base/global';
import { getElementOffset, addClass, transformPoint } from '../base/util';


export default class FabricStaticCanvas extends CommonBase{

  /**
   * Background color of canvas instance.
   * Should be set via {@link fabric.StaticCanvas#setBackgroundColor}.
   * @type {(String|fabric.Pattern)}
   * @default
   */
  backgroundColor = '';

  /**
   * Background image of canvas instance.
   * Should be set via {@link fabric.StaticCanvas#setBackgroundImage}.
   * <b>Backwards incompatibility note:</b> The "backgroundImageOpacity"
   * and "backgroundImageStretch" properties are deprecated since 1.3.9.
   * Use {@link fabric.Image#opacity}, {@link fabric.Image#width} and {@link fabric.Image#height}.
   * since 2.4.0 image caching is active, please when putting an image as background, add to the
   * canvas property a reference to the canvas it is on. Otherwise the image cannot detect the zoom
   * vale. As an alternative you can disable image objectCaching
   * @type fabric.Image
   * @default
   */
  backgroundImage = null;

  /**
   * Overlay color of canvas instance.
   * Should be set via {@link fabric.StaticCanvas#setOverlayColor}
   * @since 1.3.9
   * @type {(String|fabric.Pattern)}
   * @default
   */
  overlayColor = '';

  /**
   * Overlay image of canvas instance.
   * Should be set via {@link fabric.StaticCanvas#setOverlayImage}.
   * <b>Backwards incompatibility note:</b> The "overlayImageLeft"
   * and "overlayImageTop" properties are deprecated since 1.3.9.
   * Use {@link fabric.Image#left} and {@link fabric.Image#top}.
   * since 2.4.0 image caching is active, please when putting an image as overlay, add to the
   * canvas property a reference to the canvas it is on. Otherwise the image cannot detect the zoom
   * vale. As an alternative you can disable image objectCaching
   * @type fabric.Image
   * @default
   */
  overlayImage = null;

  /**
   * Indicates whether toObject/toDatalessObject should include default values
   * if set to false, takes precedence over the object value.
   * @type Boolean
   * @default
   */
  includeDefaultValues = true;

  /**
   * Indicates whether objects' state should be saved
   * @type Boolean
   * @default
   */
  stateful = false;

  /**
   * Indicates whether {@link fabric.Collection.add}, {@link fabric.Collection.insertAt} and {@link fabric.Collection.remove},
   * {@link fabric.StaticCanvas.moveTo}, {@link fabric.StaticCanvas.clear} and many more, should also re-render canvas.
   * Disabling this option will not give a performance boost when adding/removing a lot of objects to/from canvas at once
   * since the renders are quequed and executed one per frame.
   * Disabling is suggested anyway and managing the renders of the app manually is not a big effort ( canvas.requestRenderAll() )
   * Left default to true to do not break documentation and old app, fiddles.
   * @type Boolean
   * @default
   */
  renderOnAddRemove = true;

  /**
   * Function that determines clipping of entire canvas area
   * Being passed context as first argument.
   * If you are using code minification, ctx argument can be minified/manglied you should use
   * as a workaround `var ctx = arguments[0];` in the function;
   * See clipping canvas area in {@link https://github.com/kangax/fabric.js/wiki/FAQ}
   * @deprecated since 2.0.0
   * @type Function
   * @default
   */
  clipTo = null;

  /**
   * Indicates whether object controls (borders/controls) are rendered above overlay image
   * @type Boolean
   * @default
   */
  controlsAboveOverlay = false;

  /**
   * Indicates whether the browser can be scrolled when using a touchscreen and dragging on the canvas
   * @type Boolean
   * @default
   */
  allowTouchScrolling = false;

  /**
   * Indicates whether this canvas will use image smoothing, this is on by default in browsers
   * @type Boolean
   * @default
   */
  imageSmoothingEnabled = true;

  /**
   * The transformation (in the format of Canvas transform) which focuses the viewport
   * @type Array
   * @default
   */
  viewportTransform = getConfig('iMatrix').concat();

  /**
   * if set to false background image is not affected by viewport transform
   * @since 1.6.3
   * @type Boolean
   * @default
   */
  backgroundVpt = true;

  /**
   * if set to false overlya image is not affected by viewport transform
   * @since 1.6.3
   * @type Boolean
   * @default
   */
  overlayVpt = true;

  /**
   * Callback; invoked right before object is about to be scaled/rotated
   * @deprecated since 2.3.0
   * Use before:transform event
   */
  onBeforeScaleRotate = noop;
    /* NOOP */
  

  /**
   * When true, canvas is scaled by devicePixelRatio for better rendering on retina screens
   * @type Boolean
   * @default
   */
  enableRetinaScaling = true;

  /**
   * Describe canvas element extension over design
   * properties are tl,tr,bl,br.
   * if canvas is not zoomed/panned those points are the four corner of canvas
   * if canvas is viewportTransformed you those points indicate the extension
   * of canvas element in plain untrasformed coordinates
   * The coordinates get updated with @method calcViewportBoundaries.
   * @memberOf fabric.StaticCanvas.prototype
   */
  vptCoords = { };

  /**
   * Based on vptCoords and object.aCoords, skip rendering of objects that
   * are not included in current viewport.
   * May greatly help in applications with crowded canvas and use of zoom/pan
   * If One of the corner of the bounding box of the object is on the canvas
   * the objects get rendered.
   * @memberOf fabric.StaticCanvas.prototype
   * @type Boolean
   * @default
   */
  skipOffscreen = true;

  /**
   * a fabricObject that, without stroke define a clipping area with their shape. filled in black
   * the clipPath object gets used when the canvas has rendered, and the context is placed in the
   * top left corner of the canvas.
   * clipPath will clip away controls, if you do not want this to happen use controlsAboveOverlay = true
   * @type fabric.Object
   */
  clipPath = undefined;

  
  private _objects: any[] = [];
  private _activeObject: any[] = [];
  private interactive: boolean = false;
  private lowerCanvasEl: HTMLCanvasElement;
  private upperCanvasEl: HTMLCanvasElement;
  private cacheCanvasEl: HTMLCanvasElement;
  private width: number = 0;
  private height: number = 0;
  private _offset: any = {left: 0, top: 0};
  private contextContainer: CanvasRenderingContext2D;
  private _isCurrentlyDrawing: boolean = false;
  private freeDrawingBrush: any;
  private hasLostContext: boolean = false;


  /**
   * Constructor
   * @param {HTMLElement | String} el &lt;canvas> element to initialize instance on
   * @param {Object} [options] Options object
   * @return {Object} thisArg
   */
  constructor(el: HTMLElement, options: any = {}) {
    super();
    this._initStatic(el, options);
  }

  renderAndResetBound = () => {

  }

  requestRenderAllBound = () => {

  }

  /**
   * Calculates canvas element offset relative to the document
   * This method is also attached as "resize" event handler of window
   * @return {fabric.Canvas} instance
   * @chainable
   */
  calcOffset() {
    this._offset = getElementOffset(this.lowerCanvasEl);
    return this;
  }


  setOverlayImage(image: any, callback: Function, options?: any) {
    return this.__setBgOverlayImage('overlayImage', image, callback, options);
  }

  // TODO: fix stretched examples
  setBackgroundImage(image: any, callback: Function, options?: any) {
    return this.__setBgOverlayImage('backgroundImage', image, callback, options);
  }

  setOverlayColor(overlayColor: string, callback: Function) {
    return this.__setBgOverlayColor('overlayColor', overlayColor, callback);
  }

  setBackgroundColor(backgroundColor: string, callback: Function) {
    return this.__setBgOverlayColor('backgroundColor', backgroundColor, callback);
  }

  /**
   * Returns canvas width (in px)
   * @return {Number}
   */
  getWidth() {
    return this.width;
  }

  /**
   * Returns canvas height (in px)
   * @return {Number}
   */
  getHeight() {
    return this.height;
  }

  /**
   * Sets width of this canvas instance
   * @param {Number|String} value                         Value to set width to
   * @param {Object}        [options]                     Options object
   * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
   * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
   * @return {fabric.Canvas} instance
   * @chainable true
   */
  setWidth (value: number, options: any) {
    return this.setDimensions({ width: value }, options);
  }

  /**
   * Sets height of this canvas instance
   * @param {Number|String} value                         Value to set height to
   * @param {Object}        [options]                     Options object
   * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
   * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
   * @return {fabric.Canvas} instance
   * @chainable true
   */
  setHeight (value: number, options: any) {
    return this.setDimensions({ height: value }, options);
  }

  /**
   * Sets dimensions (width, height) of this canvas instance. when options.cssOnly flag active you should also supply the unit of measure (px/%/em)
   * @param {Object}        dimensions                    Object with width/height properties
   * @param {Number|String} [dimensions.width]            Width of canvas element
   * @param {Number|String} [dimensions.height]           Height of canvas element
   * @param {Object}        [options]                     Options object
   * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
   * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  setDimensions(dimensions: any, options: any) {
    var cssValue;

    options = options || {};

    for (var prop in dimensions) {
      cssValue = dimensions[prop];

      // FIX ME: hasLostContext is buggy!!!
      if (!options.cssOnly) {
        this._setBackstoreDimension(prop, dimensions[prop]);
        cssValue += 'px';
        this.hasLostContext = true;
      }

      if (!options.backstoreOnly) {
        this._setCssDimension(prop, cssValue);
      }
    }
    if (this._isCurrentlyDrawing) {
      this.freeDrawingBrush && this.freeDrawingBrush._setBrushStyles();
    }
    this._initRetinaScaling();
    this._setImageSmoothing();
    this.calcOffset();

    if (!options.cssOnly) {
      this.requestRenderAll();
    }

    return this;
  }

  /**
   * Returns canvas zoom level
   * @return {Number}
   */
  getZoom() {
    return this.viewportTransform[0];
  }

  /**
   * Sets viewport transform of this canvas instance
   * @param {Array} vpt the transform in the form of context.transform
   * @return {fabric.Canvas} instance
   * @chainable true
   */
  setViewportTransform(vpt: any) {
    var activeObject = this._activeObject, object, ignoreVpt = false, skipAbsolute = true, i, len;
    this.viewportTransform = vpt;
    for (i = 0, len = this._objects.length; i < len; i++) {
      object = this._objects[i];
      object.group || object.setCoords(ignoreVpt, skipAbsolute);
    }
    if (activeObject && activeObject.type === 'activeSelection') {
      activeObject.setCoords(ignoreVpt, skipAbsolute);
    }
    this.calcViewportBoundaries();
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  }

  /**
   * Sets zoom level of this canvas instance, zoom centered around point
   * @param {fabric.Point} point to zoom with respect to
   * @param {Number} value to set zoom to, less than 1 zooms out
   * @return {fabric.Canvas} instance
   * @chainable true
   */
  zoomToPoint(point: any, value: number) {
    // TODO: just change the scale, preserve other transformations
    var before = point, vpt = this.viewportTransform.slice(0);
    point = transformPoint(point, invertTransform(this.viewportTransform));
    vpt[0] = value;
    vpt[3] = value;
    var after = transformPoint(point, vpt);
    vpt[4] += before.x - after.x;
    vpt[5] += before.y - after.y;
    return this.setViewportTransform(vpt);
  }

  /**
   * Sets zoom level of this canvas instance
   * @param {Number} value to set zoom to, less than 1 zooms out
   * @return {fabric.Canvas} instance
   * @chainable true
   */
  setZoom(value: number) {
    // this.zoomToPoint(new fabric.Point(0, 0), value);
    return this;
  }

  /**
   * Pan viewport so as to place point at top left corner of canvas
   * @param {fabric.Point} point to move to
   * @return {fabric.Canvas} instance
   * @chainable true
   */
  absolutePan(point: any) {
    var vpt = this.viewportTransform.slice(0);
    vpt[4] = -point.x;
    vpt[5] = -point.y;
    return this.setViewportTransform(vpt);
  }

  /**
   * Pans viewpoint relatively
   * @param {fabric.Point} point (position vector) to move by
   * @return {fabric.Canvas} instance
   * @chainable true
   */
  relativePan(point: any) {
    // return this.absolutePan(new fabric.Point(
    //   -point.x - this.viewportTransform[4],
    //   -point.y - this.viewportTransform[5]
    // ));
  }

  /**
   * Returns &lt;canvas> element corresponding to this instance
   * @return {HTMLCanvasElement}
   */
  getElement () {
    return this.lowerCanvasEl;
  }

  /**
   * Clears specified context of canvas element
   * @param {CanvasRenderingContext2D} ctx Context to clear
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  clearContext(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    return this;
  }

  /**
   * Returns context of canvas where objects are drawn
   * @return {CanvasRenderingContext2D}
   */
  getContext() {
    return this.contextContainer;
  }

  /**
   * Clears all contexts (background, main, top) of an instance
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  clear() {
    this._objects.length = 0;
    this.backgroundImage = null;
    this.overlayImage = null;
    this.backgroundColor = '';
    this.overlayColor = '';
    // if (this._hasITextHandlers) {
    //   this.off('mouse:up', this._mouseUpITextHandler);
    //   this._iTextInstances = null;
    //   this._hasITextHandlers = false;
    // }
    // this.clearContext(this.contextContainer);
    // this.fire('canvas:cleared');
    // this.renderOnAddRemove && this.requestRenderAll();
    return this;
  }


  // FIXME: really not necessary to set a canvas element into it
  // Container element is Good Enough
  private _initStatic(el: HTMLElement, options: any) {
    // TODO: mount canvas container into el

    const cb = this.requestRenderAllBound;
    this._createLowerCanvas(el);
    
    this._initOptions(options);
    this._setImageSmoothing();
    // only initialize retina scaling once
    if (!this.interactive) {
      this._initRetinaScaling();
    }

    if (options.overlayImage) {
      this.setOverlayImage(options.overlayImage, cb);
    }
    if (options.backgroundImage) {
      this.setBackgroundImage(options.backgroundImage, cb);
    }
    if (options.backgroundColor) {
      this.setBackgroundColor(options.backgroundColor, cb);
    }
    if (options.overlayColor) {
      this.setOverlayColor(options.overlayColor, cb);
    }
    this.calcOffset();
  }


  private _isRetinaScaling() {
    return (getConfig('devicePixelRatio') !== 1 && this.enableRetinaScaling);
  }

  /**
   * @private
   * @return {Number} retinaScaling if applied, otherwise 1;
   */
  private getRetinaScaling() {
    return this._isRetinaScaling() ? getConfig('devicePixelRatio') : 1;
  }

  private _initRetinaScaling() {
    if (!this._isRetinaScaling()) {
      return;
    }
    this.lowerCanvasEl.width = this.width * this.getRetinaScaling();
    this.lowerCanvasEl.height = this.height * this.getRetinaScaling();
    this.contextContainer.scale(this.getRetinaScaling(), this.getRetinaScaling());
  }


  /**
   * @private
   * @see {@link http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-imagesmoothingenabled|WhatWG Canvas Standard}
   */
  private _setImageSmoothing() {
    var ctx = this.getContext();

    ctx.imageSmoothingEnabled = ctx.imageSmoothingEnabled || ctx.webkitImageSmoothingEnabled
      || ctx.mozImageSmoothingEnabled || ctx.msImageSmoothingEnabled || ctx.oImageSmoothingEnabled;
    ctx.imageSmoothingEnabled = this.imageSmoothingEnabled;
  };

  /**
   * @private
   * @param {String} property Property to set ({@link fabric.StaticCanvas#backgroundImage|backgroundImage}
   * or {@link fabric.StaticCanvas#overlayImage|overlayImage})
   * @param {(fabric.Image|String|null)} image fabric.Image instance, URL of an image or null to set background or overlay to
   * @param {Function} callback Callback to invoke when image is loaded and set as background or overlay
   * @param {Object} [options] Optional options to set for the {@link fabric.Image|image}.
   */

  // TODO: set image
  private __setBgOverlayImage(property: string, image: any, callback: Function, options: any) {
    // if (typeof image === 'string') {
    //   fabric.util.loadImage(image, function(img) {
    //     if (img) {
    //       var instance = new fabric.Image(img, options);
    //       this[property] = instance;
    //       instance.canvas = this;
    //     }
    //     callback && callback(img);
    //   }, this, options && options.crossOrigin);
    // }
    // else {
    //   options && image.setOptions(options);
    //   this[property] = image;
    //   image && (image.canvas = this);
    //   callback && callback(image);
    // }
    return this;
  }

  /**
   * @private
   * @param {String} property Property to set ({@link fabric.StaticCanvas#backgroundColor|backgroundColor}
   * or {@link fabric.StaticCanvas#overlayColor|overlayColor})
   * @param {(Object|String|null)} color Object with pattern information, color value or null
   * @param {Function} [callback] Callback is invoked when color is set
   */
  private __setBgOverlayColor(property: string, color: string, callback: Function) {
    // this[property] = color;
    // this._initGradient(color, property);
    // this._initPattern(color, property, callback);
    return this;
  }

  /**
   * @private
   * @param {Object} [options] Options object
   */
  private _initOptions(options: any) {
    let lowerCanvasEl: HTMLCanvasElement = this.lowerCanvasEl;
    this._setOptions(options);

    this.width = this.width || lowerCanvasEl.width || 0;
    this.height = this.height || lowerCanvasEl.height || 0;

    if (!this.lowerCanvasEl.style) {
      return;
    }

    lowerCanvasEl.width = this.width;
    lowerCanvasEl.height = this.height;

    lowerCanvasEl.style.width = this.width + 'px';
    lowerCanvasEl.style.height = this.height + 'px';

    this.viewportTransform = this.viewportTransform.slice();
  }

  private _createLowerCanvas(canvasEl: HTMLCanvasElement) {
    // canvasEl === 'HTMLCanvasElement' does not work on jsdom/node
    if (canvasEl && canvasEl.getContext) {
      this.lowerCanvasEl = canvasEl;
    } else {
      this.lowerCanvasEl = document.createElement('canvas');
    }
    addClass(this.lowerCanvasEl, 'lower-canvas');
    if (this.interactive) {
      this._applyCanvasStyle(this.lowerCanvasEl);
    }
    this.contextContainer = this.lowerCanvasEl.getContext('2d') as CanvasRenderingContext2D;
  }

  /**
   * Helper for setting width/height
   * @private
   * @param {String} prop property (width|height)
   * @param {Number} value value to set property to
   * @return {fabric.Canvas} instance
   * @chainable true
   */
  private _setBackstoreDimension(prop: 'width' | 'height', value: number) {
    this.lowerCanvasEl[prop] = value;

    if (this.upperCanvasEl) {
      this.upperCanvasEl[prop] = value;
    }

    if (this.cacheCanvasEl) {
      this.cacheCanvasEl[prop] = value;
    }

    this[prop] = value;

    return this;
  }

  /**
   * Helper for setting css width/height
   * @private
   * @param {String} prop property (width|height)
   * @param {String} value value to set property to
   * @return {fabric.Canvas} instance
   * @chainable true
   */
  private _setCssDimension(prop: 'width' | 'height', value: string) {
    this.lowerCanvasEl.style[prop] = value;

    if (this.upperCanvasEl) {
      this.upperCanvasEl.style[prop] = value;
    }

    if (this.wrapperEl) {
      this.wrapperEl.style[prop] = value;
    }

    return this;
  }



  









}