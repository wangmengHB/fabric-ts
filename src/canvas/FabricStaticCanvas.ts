import CommonMethod from '../mixins/CommonMethod';
import Collection from '../mixins/Collection';
import { noop } from '../base/constant';
import { getConfig } from '../base/global';
import { 
  getElementOffset, addClass, transformPoint, invertTransform,
  clipContext, populateWithProperties, removeFromArray, extend,
  applyMixins,
} from '../base/util';
import Point from '../base/Point';





export default class FabricStaticCanvas extends Collection {

  /**
   * Background color of canvas instance.
   * Should be set via {@link fabric.StaticCanvas#setBackgroundColor}.
   * @type {(String|fabric.Pattern)}
   * @default
   */
  backgroundColor: any = '';

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
  backgroundImage: any = null;

  /**
   * Overlay color of canvas instance.
   * Should be set via {@link fabric.StaticCanvas#setOverlayColor}
   * @since 1.3.9
   * @type {(String|fabric.Pattern)}
   * @default
   */
  overlayColor: any = '';

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
  overlayImage: any = null;

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
  clipPath: any = undefined;

  
  private _objects: any[] = [];
  private _activeObject: any;
  private interactive: boolean = false;
  private lowerCanvasEl: HTMLCanvasElement;
  private upperCanvasEl: HTMLCanvasElement;
  private cacheCanvasEl: HTMLCanvasElement;
  private wrapperEl: HTMLElement;
  private width: number = 0;
  private height: number = 0;
  private _offset: any = {left: 0, top: 0};
  private contextContainer: CanvasRenderingContext2D;
  private _isCurrentlyDrawing: boolean = false;
  private freeDrawingBrush: any;
  private isRendering: number = 0;
  private hasLostContext: boolean = false;


  /**
   * Constructor
   * @param {HTMLElement | String} el &lt;canvas> element to initialize instance on
   * @param {Object} [options] Options object
   * @return {Object} thisArg
   */
  constructor(el: HTMLElement, options: any = {}) {
    super();
    this._initStatic(options);
    // MOUNT canvas to el;
    if (el) {
      el.appendChild(this.lowerCanvasEl);
      // this.wrapperEl = this.lowerCanvasEl;
    }


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
  setDimensions(dimensions: {width?: number; height?: number}, options: any) {
    
    options = options || {};

    for (let prop in dimensions) {
      let value = (dimensions as any)[prop];
      if (!value || (prop !== 'width' && prop !== 'height')) {
        break;
      }
      // FIX ME: hasLostContext is buggy!!!
      if (!options.cssOnly) {
        this._setBackstoreDimension(prop, value);
        this.hasLostContext = true;
      }

      if (!options.backstoreOnly) {
        this._setCssDimension(prop, value);
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
    this.zoomToPoint(new Point(0, 0), value);
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
  relativePan(point: Point) {
    return this.absolutePan(new Point(
      -point.x - this.viewportTransform[4],
      -point.y - this.viewportTransform[5]
    ));
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


  /**
   * Calculate the position of the 4 corner of canvas with current viewportTransform.
   * helps to determinate when an object is in the current rendering viewport using
   * object absolute coordinates ( aCoords )
   * @return {Object} points.tl
   * @chainable
   */
  calcViewportBoundaries() {
    var points: any = { }, width = this.width, height = this.height,
        iVpt = invertTransform(this.viewportTransform);
    points.tl = transformPoint({ x: 0, y: 0 } as Point, iVpt);
    points.br = transformPoint({ x: width, y: height } as Point, iVpt);
    points.tr = new Point(points.br.x, points.tl.y);
    points.bl = new Point(points.tl.x, points.br.y);
    this.vptCoords = points;
    return points;
  }

  /**
   * Renders the canvas
   * @return {fabric.Canvas} instance
   * @chainable
   */
  renderAll() {
    var canvasToDrawOn = this.contextContainer;
    this.renderCanvas(canvasToDrawOn, this._objects);
    return this;
  }

  /**
   * Function created to be instance bound at initialization
   * used in requestAnimationFrame rendering
   * Let the fabricJS call it. If you call it manually you could have more
   * animationFrame stacking on to of each other
   * for an imperative rendering, use canvas.renderAll
   * @private
   * @return {fabric.Canvas} instance
   * @chainable
   */
  renderAndReset() {
    this.isRendering = 0;
    this.renderAll();
  }

  /**
   * Append a renderAll request to next animation frame.
   * unless one is already in progress, in that case nothing is done
   * a boolean flag will avoid appending more.
   * @return {fabric.Canvas} instance
   * @chainable
   */
  requestRenderAll() {
    if (!this.isRendering) {
      this.isRendering = window.requestAnimationFrame(this.renderAndResetBound);
    }
    return this;
  }

  cancelRequestedRender() {
    if (this.isRendering) {
      window.cancelAnimationFrame(this.isRendering);
      this.isRendering = 0;
    }
  }

  /**
   * Renders background, objects, overlay and controls.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array} objects to render
   * @return {fabric.Canvas} instance
   * @chainable
   */
  renderCanvas(ctx: CanvasRenderingContext2D, objects: any[]) {
    var v = this.viewportTransform, path = this.clipPath;
    this.cancelRequestedRender();
    this.calcViewportBoundaries();
    this.clearContext(ctx);
    this.fire('before:render', { ctx: ctx, });
    if (this.clipTo) {
      clipContext(this, ctx);
    }
    this._renderBackground(ctx);

    ctx.save();
    //apply viewport transform once for all rendering process
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
    this._renderObjects(ctx, objects);
    ctx.restore();
    if (!this.controlsAboveOverlay && this.interactive) {
      this.drawControls(ctx);
    }
    if (this.clipTo) {
      ctx.restore();
    }
    if (path) {
      path.canvas = this;
      // needed to setup a couple of variables
      path.shouldCache();
      path._transformDone = true;
      path.renderCache({ forClipping: true });
      this.drawClipPathOnCanvas(ctx);
    }
    this._renderOverlay(ctx);
    if (this.controlsAboveOverlay && this.interactive) {
      this.drawControls(ctx);
    }
    this.fire('after:render', { ctx: ctx, });
  }

  /**
   * Paint the cached clipPath on the lowerCanvasEl
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  drawClipPathOnCanvas(ctx: CanvasRenderingContext2D) {
    var v = this.viewportTransform, path = this.clipPath;
    ctx.save();
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
    // DEBUG: uncomment this line, comment the following
    // ctx.globalAlpha = 0.4;
    ctx.globalCompositeOperation = 'destination-in';
    path.transform(ctx);
    ctx.scale(1 / path.zoomX, 1 / path.zoomY);
    ctx.drawImage(path._cacheCanvas, -path.cacheTranslationX, -path.cacheTranslationY);
    ctx.restore();
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   * @param {Array} objects to render
   */
  _renderObjects(ctx: CanvasRenderingContext2D, objects: any[]) {
    var i, len;
    for (i = 0, len = objects.length; i < len; ++i) {
      objects[i] && objects[i].render(ctx);
    }
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   * @param {string} property 'background' or 'overlay'
   */
  _renderBackgroundOrOverlay(ctx: CanvasRenderingContext2D, property: string) {
    var fill = (this as any)[property + 'Color'], object = (this as any)[property + 'Image'],
        v = this.viewportTransform, needsVpt = (this as any)[property + 'Vpt'];
    if (!fill && !object) {
      return;
    }
    if (fill) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.width, 0);
      ctx.lineTo(this.width, this.height);
      ctx.lineTo(0, this.height);
      ctx.closePath();
      ctx.fillStyle = fill.toLive
        ? fill.toLive(ctx, this)
        : fill;
      if (needsVpt) {
        ctx.transform(
          v[0], v[1], v[2], v[3],
          v[4] + (fill.offsetX || 0),
          v[5] + (fill.offsetY || 0)
        );
      }
      var m = fill.gradientTransform || fill.patternTransform;
      m && ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      ctx.fill();
      ctx.restore();
    }
    if (object) {
      ctx.save();
      if (needsVpt) {
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      }
      object.render(ctx);
      ctx.restore();
    }
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  _renderBackground(ctx: CanvasRenderingContext2D) {
    this._renderBackgroundOrOverlay(ctx, 'background');
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  _renderOverlay(ctx: CanvasRenderingContext2D) {
    this._renderBackgroundOrOverlay(ctx, 'overlay');
  }

  /**
   * Returns coordinates of a center of canvas.
   * Returned value is an object with top and left properties
   * @return {Object} object with "top" and "left" number values
   */
  getCenter() {
    return {
      top: this.height / 2,
      left: this.width / 2
    };
  }

  /**
   * Centers object horizontally in the canvas
   * @param {fabric.Object} object Object to center horizontally
   * @return {fabric.Canvas} thisArg
   */
  centerObjectH(object: any) {
    return this._centerObject(object, new Point(this.getCenter().left, object.getCenterPoint().y));
  }

  /**
   * Centers object vertically in the canvas
   * @param {fabric.Object} object Object to center vertically
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  centerObjectV(object: any) {
    return this._centerObject(object, new Point(object.getCenterPoint().x, this.getCenter().top));
  }

  /**
   * Centers object vertically and horizontally in the canvas
   * @param {fabric.Object} object Object to center vertically and horizontally
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  centerObject(object: any) {
    var center = this.getCenter();

    return this._centerObject(object, new Point(center.left, center.top));
  }

  /**
   * Centers object vertically and horizontally in the viewport
   * @param {fabric.Object} object Object to center vertically and horizontally
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  viewportCenterObject(object: any) {
    var vpCenter = this.getVpCenter();

    return this._centerObject(object, vpCenter);
  }

  /**
   * Centers object horizontally in the viewport, object.top is unchanged
   * @param {fabric.Object} object Object to center vertically and horizontally
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  viewportCenterObjectH(object: any) {
    var vpCenter = this.getVpCenter();
    this._centerObject(object, new Point(vpCenter.x, object.getCenterPoint().y));
    return this;
  }

  /**
   * Centers object Vertically in the viewport, object.top is unchanged
   * @param {fabric.Object} object Object to center vertically and horizontally
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  viewportCenterObjectV(object: any) {
    var vpCenter = this.getVpCenter();

    return this._centerObject(object, new Point(object.getCenterPoint().x, vpCenter.y));
  }

  /**
   * Calculate the point in canvas that correspond to the center of actual viewport.
   * @return {fabric.Point} vpCenter, viewport center
   * @chainable
   */
  getVpCenter() {
    var center = this.getCenter(),
        iVpt = invertTransform(this.viewportTransform);
    return transformPoint({ x: center.left, y: center.top } as Point, iVpt);
  }

  /**
   * @private
   * @param {fabric.Object} object Object to center
   * @param {fabric.Point} center Center point
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  _centerObject(object: any, center: Point) {
    object.setPositionByOrigin(center, 'center', 'center');
    object.setCoords();
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  }




  /**
   * Returs dataless JSON representation of canvas
   * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
   * @return {String} json string
   */
  toDatalessJSON(propertiesToInclude: any[]) {
    return this.toDatalessObject(propertiesToInclude);
  }

  /**
   * Returns object representation of canvas
   * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
   * @return {Object} object representation of an instance
   */
  toObject(propertiesToInclude: any[]) {
    return this._toObjectMethod('toObject', propertiesToInclude);
  }

  /**
   * Returns dataless object representation of canvas
   * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
   * @return {Object} object representation of an instance
   */
  toDatalessObject(propertiesToInclude: any[]) {
    return this._toObjectMethod('toDatalessObject', propertiesToInclude);
  }

  /**
   * @private
   */
  _toObjectMethod(methodName: string, propertiesToInclude: any[]) {

    var clipPath = this.clipPath, data: any = {
      version: '0.0.1',
      objects: this._toObjects(methodName, propertiesToInclude),
    };
    if (clipPath) {
      data.clipPath = this._toObject(this.clipPath, methodName, propertiesToInclude);
    }
    extend(data, this.__serializeBgOverlay(methodName, propertiesToInclude));

    populateWithProperties(this, data, propertiesToInclude);

    return data;
  }

  /**
   * @private
   */
  _toObjects(methodName: string, propertiesToInclude: any[]) {
    return this._objects.filter(function(object) {
      return !object.excludeFromExport;
    }).map((instance) => {
      return this._toObject(instance, methodName, propertiesToInclude);
    });
  }

  /**
   * @private
   */
  _toObject(instance: any, methodName: string, propertiesToInclude: any[]) {
    var originalValue;

    if (!this.includeDefaultValues) {
      originalValue = instance.includeDefaultValues;
      instance.includeDefaultValues = false;
    }

    var object = instance[methodName](propertiesToInclude);
    if (!this.includeDefaultValues) {
      instance.includeDefaultValues = originalValue;
    }
    return object;
  }

  /**
   * @private
   */
  __serializeBgOverlay(methodName: string, propertiesToInclude: any[]) {
    var data: any = { }, bgImage = this.backgroundImage, overlay = this.overlayImage;

    if (this.backgroundColor) {
      data.background = this.backgroundColor.toObject
        ? this.backgroundColor.toObject(propertiesToInclude)
        : this.backgroundColor;
    }

    if (this.overlayColor) {
      data.overlay = this.overlayColor.toObject
        ? this.overlayColor.toObject(propertiesToInclude)
        : this.overlayColor;
    }
    if (bgImage && !bgImage.excludeFromExport) {
      data.backgroundImage = this._toObject(bgImage, methodName, propertiesToInclude);
    }
    if (overlay && !overlay.excludeFromExport) {
      data.overlayImage = this._toObject(overlay, methodName, propertiesToInclude);
    }

    return data;
  }


  /**
   * Moves an object or the objects of a multiple selection
   * to the bottom of the stack of drawn objects
   * @param {fabric.Object} object Object to send to back
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  sendToBack(object: any) {
    if (!object) {
      return this;
    }
    var activeSelection = this._activeObject,
        i, obj, objs;
    if (object === activeSelection && object.type === 'activeSelection') {
      objs = activeSelection._objects;
      for (i = objs.length; i--;) {
        obj = objs[i];
        removeFromArray(this._objects, obj);
        this._objects.unshift(obj);
      }
    } else {
      removeFromArray(this._objects, object);
      this._objects.unshift(object);
    }
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  }

  /**
   * Moves an object or the objects of a multiple selection
   * to the top of the stack of drawn objects
   * @param {fabric.Object} object Object to send
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  bringToFront(object: any) {
    if (!object) {
      return this;
    }
    var activeSelection = this._activeObject,
        i, obj, objs;
    if (object === activeSelection && object.type === 'activeSelection') {
      objs = activeSelection._objects;
      for (i = 0; i < objs.length; i++) {
        obj = objs[i];
        removeFromArray(this._objects, obj);
        this._objects.push(obj);
      }
    } else {
      removeFromArray(this._objects, object);
      this._objects.push(object);
    }
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  }

  /**
   * Moves an object or a selection down in stack of drawn objects
   * An optional paramter, intersecting allowes to move the object in behind
   * the first intersecting object. Where intersection is calculated with
   * bounding box. If no intersection is found, there will not be change in the
   * stack.
   * @param {fabric.Object} object Object to send
   * @param {Boolean} [intersecting] If `true`, send object behind next lower intersecting object
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  sendBackwards(object: any, intersecting?: boolean) {
    if (!object) {
      return this;
    }
    var activeSelection = this._activeObject,
        i, obj, idx, newIdx, objs, objsMoved = 0;

    if (object === activeSelection && object.type === 'activeSelection') {
      objs = activeSelection._objects;
      for (i = 0; i < objs.length; i++) {
        obj = objs[i];
        idx = this._objects.indexOf(obj);
        if (idx > 0 + objsMoved) {
          newIdx = idx - 1;
          removeFromArray(this._objects, obj);
          this._objects.splice(newIdx, 0, obj);
        }
        objsMoved++;
      }
    } else {
      idx = this._objects.indexOf(object);
      if (idx !== 0) {
        // if object is not on the bottom of stack
        newIdx = this._findNewLowerIndex(object, idx, intersecting);
        removeFromArray(this._objects, object);
        this._objects.splice(newIdx, 0, object);
      }
    }
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  }

  /**
   * @private
   */
  _findNewLowerIndex(object: any, idx: number, intersecting?: boolean) {
    var newIdx, i;

    if (intersecting) {
      newIdx = idx;

      // traverse down the stack looking for the nearest intersecting object
      for (i = idx - 1; i >= 0; --i) {

        var isIntersecting = object.intersectsWithObject(this._objects[i]) ||
                              object.isContainedWithinObject(this._objects[i]) ||
                              this._objects[i].isContainedWithinObject(object);

        if (isIntersecting) {
          newIdx = i;
          break;
        }
      }
    }
    else {
      newIdx = idx - 1;
    }

    return newIdx;
  }

  /**
   * Moves an object or a selection up in stack of drawn objects
   * An optional paramter, intersecting allowes to move the object in front
   * of the first intersecting object. Where intersection is calculated with
   * bounding box. If no intersection is found, there will not be change in the
   * stack.
   * @param {fabric.Object} object Object to send
   * @param {Boolean} [intersecting] If `true`, send object in front of next upper intersecting object
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  bringForward(object: any, intersecting?: boolean) {
    if (!object) {
      return this;
    }
    var activeSelection = this._activeObject,
        i, obj, idx, newIdx, objs, objsMoved = 0;

    if (object === activeSelection && object.type === 'activeSelection') {
      objs = activeSelection._objects;
      for (i = objs.length; i--;) {
        obj = objs[i];
        idx = this._objects.indexOf(obj);
        if (idx < this._objects.length - 1 - objsMoved) {
          newIdx = idx + 1;
          removeFromArray(this._objects, obj);
          this._objects.splice(newIdx, 0, obj);
        }
        objsMoved++;
      }
    } else {
      idx = this._objects.indexOf(object);
      if (idx !== this._objects.length - 1) {
        // if object is not on top of stack (last item in an array)
        newIdx = this._findNewUpperIndex(object, idx, intersecting);
        removeFromArray(this._objects, object);
        this._objects.splice(newIdx, 0, object);
      }
    }
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  }

  /**
   * @private
   */
  _findNewUpperIndex(object: any, idx: number, intersecting?: boolean) {
    var newIdx, i, len;

    if (intersecting) {
      newIdx = idx;

      // traverse up the stack looking for the nearest intersecting object
      for (i = idx + 1, len = this._objects.length; i < len; ++i) {

        var isIntersecting = object.intersectsWithObject(this._objects[i]) ||
                              object.isContainedWithinObject(this._objects[i]) ||
                              this._objects[i].isContainedWithinObject(object);

        if (isIntersecting) {
          newIdx = i;
          break;
        }
      }
    }
    else {
      newIdx = idx + 1;
    }

    return newIdx;
  }

  /**
   * Moves an object to specified level in stack of drawn objects
   * @param {fabric.Object} object Object to send
   * @param {Number} index Position to move to
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  moveTo(object: any, index: number) {
    removeFromArray(this._objects, object);
    this._objects.splice(index, 0, object);
    return this.renderOnAddRemove && this.requestRenderAll();
  }

  /**
   * Clears a canvas element and dispose objects
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  dispose () {
    // cancel eventually ongoing renders
    if (this.isRendering) {
      window.cancelAnimationFrame(this.isRendering);
      this.isRendering = 0;
    }
    // FIXME, later!!!
    this.forEachObject(function(object) {
      object.dispose && object.dispose();
    });
    this._objects = [];
    if (this.backgroundImage && this.backgroundImage.dispose) {
      this.backgroundImage.dispose();
    }
    this.backgroundImage = null;
    if (this.overlayImage && this.overlayImage.dispose) {
      this.overlayImage.dispose();
    }
    this.overlayImage = null;
    // this._iTextInstances = null;
    // this.contextContainer = null;
    // this.lowerCanvasEl = undefined;
    return this;
  }

  /**
   * Returns a string representation of an instance
   * @return {String} string representation of an instance
   */
  toString() {
    return '#<fabric.Canvas (' + this.complexity() + '): ' +
              '{ objects: ' + this._objects.length + ' }>';
  }








  // FIXME: really not necessary to set a canvas element into it
  // Container element is Good Enough
  private _initStatic(options: any) {
    // TODO: mount canvas container into el

    const cb = this.requestRenderAllBound;
    this._createLowerCanvas();
    
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

  private _createLowerCanvas() {
    this.lowerCanvasEl = document.createElement('canvas');
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
  private _setCssDimension(prop: 'width' | 'height', value: number) {
    this.lowerCanvasEl.style[prop] = value + 'px';

    if (this.upperCanvasEl) {
      this.upperCanvasEl.style[prop] = value + 'px';
    }

    if (this.wrapperEl) {
      this.wrapperEl.style[prop] = value + 'px';
    }

    return this;
  }






  









}


applyMixins(FabricStaticCanvas, [CommonMethod]);