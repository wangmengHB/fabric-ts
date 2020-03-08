
import CommonBase from '../base/CommonBase';
import { STATE_PROPERTIES, CACHE_PROPERTIES } from '../base/constant';
import { getConfig } from '../base/global';




export default class ShapeBase extends CommonBase{

    /**
     * Type of an object (rect; circle; path; etc.).
     * Note that this property is meant to be read-only and not meant to be modified.
     * If you modify; certain parts of Fabric (such as JSON loading) won't work correctly.
     * @type String
     * @default
     */
    type =                     'object';

    /**
     * Horizontal origin of transformation of an object (one of "left"; "right"; "center")
     * See http =//jsfiddle.net/1ow02gea/244/ on how originX/originY affect objects in groups
     * @type String
     * @default
     */
    originX =                  'left';

    /**
     * Vertical origin of transformation of an object (one of "top"; "bottom"; "center")
     * See http =//jsfiddle.net/1ow02gea/244/ on how originX/originY affect objects in groups
     * @type String
     * @default
     */
    originY =                  'top';

    /**
     * Top position of an object. Note that by default it's relative to object top. You can change this by setting originY={top/center/bottom}
     * @type Number
     * @default
     */
    top =                      0;

    /**
     * Left position of an object. Note that by default it's relative to object left. You can change this by setting originX={left/center/right}
     * @type Number
     * @default
     */
    left =                     0;

    /**
     * Object width
     * @type Number
     * @default
     */
    width =                    0;

    /**
     * Object height
     * @type Number
     * @default
     */
    height =                   0;

    /**
     * Object scale factor (horizontal)
     * @type Number
     * @default
     */
    scaleX =                   1;

    /**
     * Object scale factor (vertical)
     * @type Number
     * @default
     */
    scaleY =                   1;

    /**
     * When true; an object is rendered as flipped horizontally
     * @type Boolean
     * @default
     */
    flipX =                    false;

    /**
     * When true; an object is rendered as flipped vertically
     * @type Boolean
     * @default
     */
    flipY =                    false;

    /**
     * Opacity of an object
     * @type Number
     * @default
     */
    opacity =                  1;

    /**
     * Angle of rotation of an object (in degrees)
     * @type Number
     * @default
     */
    angle =                    0;

    /**
     * Angle of skew on x axes of an object (in degrees)
     * @type Number
     * @default
     */
    skewX =                    0;

    /**
     * Angle of skew on y axes of an object (in degrees)
     * @type Number
     * @default
     */
    skewY =                    0;

    /**
     * Size of object's controlling corners (in pixels)
     * @type Number
     * @default
     */
    cornerSize =               13;

    /**
     * When true; object's controlling corners are rendered as transparent inside (i.e. stroke instead of fill)
     * @type Boolean
     * @default
     */
    transparentCorners =       true;

    /**
     * Default cursor value used when hovering over this object on canvas
     * @type String
     * @default
     */
    hoverCursor =              null;

    /**
     * Default cursor value used when moving this object on canvas
     * @type String
     * @default
     */
    moveCursor =               null;

    /**
     * Padding between object and its controlling borders (in pixels)
     * @type Number
     * @default
     */
    padding =                  0;

    /**
     * Color of controlling borders of an object (when it's active)
     * @type String
     * @default
     */
    borderColor =              'rgba(102;153;255;0.75)';

    /**
     * Array specifying dash pattern of an object's borders (hasBorder must be true)
     * @since 1.6.2
     * @type Array
     */
    borderDashArray =          null;

    /**
     * Color of controlling corners of an object (when it's active)
     * @type String
     * @default
     */
    cornerColor =              'rgba(102;153;255;0.5)';

    /**
     * Color of controlling corners of an object (when it's active and transparentCorners false)
     * @since 1.6.2
     * @type String
     * @default
     */
    cornerStrokeColor =        null;

    /**
     * Specify style of control; 'rect' or 'circle'
     * @since 1.6.2
     * @type String
     */
    cornerStyle =          'rect';

    /**
     * Array specifying dash pattern of an object's control (hasBorder must be true)
     * @since 1.6.2
     * @type Array
     */
    cornerDashArray =          null;

    /**
     * When true; this object will use center point as the origin of transformation
     * when being scaled via the controls.
     * <b>Backwards incompatibility note =</b> This property replaces "centerTransform" (Boolean).
     * @since 1.3.4
     * @type Boolean
     * @default
     */
    centeredScaling =          false;

    /**
     * When true; this object will use center point as the origin of transformation
     * when being rotated via the controls.
     * <b>Backwards incompatibility note =</b> This property replaces "centerTransform" (Boolean).
     * @since 1.3.4
     * @type Boolean
     * @default
     */
    centeredRotation =         true;

    /**
     * Color of object's fill
     * takes css colors https =//www.w3.org/TR/css-color-3/
     * @type String
     * @default
     */
    fill =                     'rgb(0;0;0)';

    /**
     * Fill rule used to fill an object
     * accepted values are nonzero; evenodd
     * <b>Backwards incompatibility note =</b> This property was used for setting globalCompositeOperation until v1.4.12 (use `fabric.Object#globalCompositeOperation` instead)
     * @type String
     * @default
     */
    fillRule =                 'nonzero';

    /**
     * Composite rule used for canvas globalCompositeOperation
     * @type String
     * @default
     */
    globalCompositeOperation = 'source-over';

    /**
     * Background color of an object.
     * takes css colors https =//www.w3.org/TR/css-color-3/
     * @type String
     * @default
     */
    backgroundColor =          '';

    /**
     * Selection Background color of an object. colored layer behind the object when it is active.
     * does not mix good with globalCompositeOperation methods.
     * @type String
     * @default
     */
    selectionBackgroundColor =          '';

    /**
     * When defined; an object is rendered via stroke and this property specifies its color
     * takes css colors https =//www.w3.org/TR/css-color-3/
     * @type String
     * @default
     */
    stroke =                   null;

    /**
     * Width of a stroke used to render this object
     * @type Number
     * @default
     */
    strokeWidth =              1;

    /**
     * Array specifying dash pattern of an object's stroke (stroke must be defined)
     * @type Array
     */
    strokeDashArray =          null;

    /**
     * Line offset of an object's stroke
     * @type Number
     * @default
     */
    strokeDashOffset = 0;

    /**
     * Line endings style of an object's stroke (one of "butt"; "round"; "square")
     * @type String
     * @default
     */
    strokeLineCap =            'butt';

    /**
     * Corner style of an object's stroke (one of "bevil"; "round"; "miter")
     * @type String
     * @default
     */
    strokeLineJoin =           'miter';

    /**
     * Maximum miter length (used for strokeLineJoin = "miter") of an object's stroke
     * @type Number
     * @default
     */
    strokeMiterLimit =         4;

    /**
     * Shadow object representing shadow of this shape
     * @type fabric.Shadow
     * @default
     */
    shadow =                   null;

    /**
     * Opacity of object's controlling borders when object is active and moving
     * @type Number
     * @default
     */
    borderOpacityWhenMoving =  0.4;

    /**
     * Scale factor of object's controlling borders
     * @type Number
     * @default
     */
    borderScaleFactor =        1;

    /**
     * Transform matrix (similar to SVG's transform matrix)
     * This property has been depreacted. Since caching and and qrDecompose this
     * property can be handled with the standard top;left;scaleX;scaleY;angle and skewX.
     * A documentation example on how to parse and merge a transformMatrix will be provided before
     * completely removing it in fabric 4.0
     * If you are starting a project now; DO NOT use it.
     * @deprecated since 3.2.0
     * @type Array
     */
    transformMatrix =          null;

    /**
     * Minimum allowed scale value of an object
     * @type Number
     * @default
     */
    minScaleLimit =            0;

    /**
     * When set to `false`; an object can not be selected for modification (using either point-click-based or group-based selection).
     * But events still fire on it.
     * @type Boolean
     * @default
     */
    selectable =               true;

    /**
     * When set to `false`; an object can not be a target of events. All events propagate through it. Introduced in v1.3.4
     * @type Boolean
     * @default
     */
    evented =                  true;

    /**
     * When set to `false`; an object is not rendered on canvas
     * @type Boolean
     * @default
     */
    visible =                  true;

    /**
     * When set to `false`; object's controls are not displayed and can not be used to manipulate object
     * @type Boolean
     * @default
     */
    hasControls =              true;

    /**
     * When set to `false`; object's controlling borders are not rendered
     * @type Boolean
     * @default
     */
    hasBorders =               true;

    /**
     * When set to `false`; object's controlling rotating point will not be visible or selectable
     * @type Boolean
     * @default
     */
    hasRotatingPoint =         true;

    /**
     * Offset for object's controlling rotating point (when enabled via `hasRotatingPoint`)
     * @type Number
     * @default
     */
    rotatingPointOffset =      40;

    /**
     * When set to `true`; objects are "found" on canvas on per-pixel basis rather than according to bounding box
     * @type Boolean
     * @default
     */
    perPixelTargetFind =       false;

    /**
     * When `false`; default object's values are not included in its serialization
     * @type Boolean
     * @default
     */
    includeDefaultValues =     true;

    /**
     * Function that determines clipping of an object (context is passed as a first argument).
     * If you are using code minification; ctx argument can be minified/manglied you should use
     * as a workaround `var ctx = arguments[0];` in the function;
     * Note that context origin is at the object's center point (not left/top corner)
     * @deprecated since 2.0.0
     * @type Function
     */
    clipTo =                   null;

    /**
     * When `true`; object horizontal movement is locked
     * @type Boolean
     * @default
     */
    lockMovementX =            false;

    /**
     * When `true`; object vertical movement is locked
     * @type Boolean
     * @default
     */
    lockMovementY =            false;

    /**
     * When `true`; object rotation is locked
     * @type Boolean
     * @default
     */
    lockRotation =             false;

    /**
     * When `true`; object horizontal scaling is locked
     * @type Boolean
     * @default
     */
    lockScalingX =             false;

    /**
     * When `true`; object vertical scaling is locked
     * @type Boolean
     * @default
     */
    lockScalingY =             false;

    /**
     * When `true`; object non-uniform scaling is locked
     * @type Boolean
     * @default
     */
    lockUniScaling =           false;

    /**
     * When `true`; object horizontal skewing is locked
     * @type Boolean
     * @default
     */
    lockSkewingX =             false;

    /**
     * When `true`; object vertical skewing is locked
     * @type Boolean
     * @default
     */
    lockSkewingY =             false;

    /**
     * When `true`; object cannot be flipped by scaling into negative values
     * @type Boolean
     * @default
     */
    lockScalingFlip =          false;

    /**
     * When `true`; object is not exported in OBJECT/JSON
     * @since 1.6.3
     * @type Boolean
     * @default
     */
    excludeFromExport =        false;

    /**
     * When `true`; object is cached on an additional canvas.
     * When `false`; object is not cached unless necessary ( clipPath )
     * default to true
     * @since 1.7.0
     * @type Boolean
     * @default true
     */
    objectCaching =            getConfig('objectCaching');

    /**
     * When `true`; object properties are checked for cache invalidation. In some particular
     * situation you may want this to be disabled ( spray brush; very big; groups)
     * or if your application does not allow you to modify properties for groups child you want
     * to disable it for groups.
     * default to false
     * since 1.7.0
     * @type Boolean
     * @default false
     */
    statefullCache =            false;

    /**
     * When `true`; cache does not get updated during scaling. The picture will get blocky if scaled
     * too much and will be redrawn with correct details at the end of scaling.
     * this setting is performance and application dependant.
     * default to true
     * since 1.7.0
     * @type Boolean
     * @default true
     */
    noScaleCache =              true;

    /**
     * When `false`; the stoke width will scale with the object.
     * When `true`; the stroke will always match the exact pixel size entered for stroke width.
     * default to false
     * @since 2.6.0
     * @type Boolean
     * @default false
     * @type Boolean
     * @default false
     */
    strokeUniform =              false;

    /**
     * When set to `true`; object's cache will be rerendered next render call.
     * since 1.7.0
     * @type Boolean
     * @default true
     */
    dirty =                true;

    /**
     * keeps the value of the last hovered corner during mouse move.
     * 0 is no corner; or 'mt'; 'ml'; 'mtr' etc..
     * It should be private; but there is no harm in using it as
     * a read-only property.
     * @type number|string|any
     * @default 0
     */
    __corner = 0;

    /**
     * Determines if the fill or the stroke is drawn first (one of "fill" or "stroke")
     * @type String
     * @default
     */
    paintFirst =           'fill';

    /**
     * List of properties to consider when checking if state
     * of an object is changed (fabric.Object#hasStateChanged)
     * as well as for history (undo/redo) purposes
     * @type Array
     */
    stateProperties = STATE_PROPERTIES;

    /**
     * List of properties to consider when checking if cache needs refresh
     * Those properties are checked by statefullCache ON ( or lazy mode if we want ) or from single
     * calls to Object.set(key; value). If the key is in this list; the object is marked as dirty
     * and refreshed at the next render
     * @type Array
     */
    cacheProperties = CACHE_PROPERTIES;

    /**
     * a fabricObject that; without stroke define a clipping area with their shape. filled in black
     * the clipPath object gets used when the object has rendered; and the context is placed in the center
     * of the object cacheCanvas.
     * If you want 0;0 of a clipPath to align with an object center; use clipPath.originX/Y to 'center'
     * @type fabric.Object
     */
    clipPath = undefined;

    /**
     * Meaningful ONLY when the object is used as clipPath.
     * if true; the clipPath will make the object clip to the outside of the clipPath
     * since 2.4.0
     * @type boolean
     * @default false
     */
    inverted = false;

    /**
     * Meaningful ONLY when the object is used as clipPath.
     * if true; the clipPath will have its top and left relative to canvas; and will
     * not be influenced by the object transform. This will make the clipPath relative
     * to the canvas; but clipping just a particular object.
     * WARNING this is beta; this feature may change or be renamed.
     * since 2.4.0
     * @type boolean
     * @default false
     */
    absolutePositioned = false;

    constructor(options: any) {
      super();
      if (options) {
        this.setOptions(options);
      }
    }



    setOptions(options: any) {
      this._setOptions(options);
      this._initGradient(options.fill, 'fill');
      this._initGradient(options.stroke, 'stroke');
      this._initClipping(options);
      this._initPattern(options.fill, 'fill');
      this._initPattern(options.stroke, 'stroke');
    }






}





