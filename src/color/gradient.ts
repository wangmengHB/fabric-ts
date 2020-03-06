import { counter } from '../base/global';


type GradientType = 'linear' | 'radial';
type GradientUnits = 'pixels' | 'percentage';


export default class Gradient {

  /**
   * Horizontal offset for aligning gradients coming from SVG when outside pathgroups
   * @type Number
   * @default 0
   */
  offsetX = 0;

  /**
   * Vertical offset for aligning gradients coming from SVG when outside pathgroups
   * @type Number
   * @default 0
   */
  offsetY = 0;

  /**
   * A transform matrix to apply to the gradient before painting.
   * Imported from svg gradients, is not applied with the current transform in the center.
   * Before this transform is applied, the origin point is at the top left corner of the object
   * plus the addition of offsetY and offsetX.
   * @type Number[]
   * @default null
   */
  gradientTransform = null;

  /**
   * coordinates units for coords.
   * If `pixels`, the number of coords are in the same unit of width / height.
   * If set as `percentage` the coords are still a number, but 1 means 100% of width
   * for the X and 100% of the height for the y. It can be bigger than 1 and negative.
   * allowed values pixels or percentage.
   * @type String
   * @default 'pixels'
   */
  gradientUnits: GradientUnits = 'pixels';

  /**
   * Gradient type linear or radial
   * @type String
   * @default 'pixels'
   */
  type: GradientType = 'linear';


  id: number = counter.getNext();


  // fixme
  coords: any;
  colorStops: any;

  /**
   * Constructor
   * @param {Object} options Options object with type, coords, gradientUnits and colorStops
   * @param {Object} [options.type] gradient type linear or radial
   * @param {Object} [options.gradientUnits] gradient units
   * @param {Object} [options.offsetX] SVG import compatibility
   * @param {Object} [options.offsetY] SVG import compatibility
   * @param {Object[]} options.colorStops contains the colorstops.
   * @param {Object} options.coords contains the coords of the gradient
   * @param {Number} [options.coords.x1] X coordiante of the first point for linear or of the focal point for radial
   * @param {Number} [options.coords.y1] Y coordiante of the first point for linear or of the focal point for radial
   * @param {Number} [options.coords.x2] X coordiante of the second point for linear or of the center point for radial
   * @param {Number} [options.coords.y2] Y coordiante of the second point for linear or of the center point for radial
   * @param {Number} [options.coords.r1] only for radial gradient, radius of the inner circle
   * @param {Number} [options.coords.r2] only for radial gradient, radius of the external circle
   * @return {fabric.Gradient} thisArg
   */
  constructor(options: any = {}) {

    // fix me!! it is not safe to set everything!!!
    // sets everything, then coords and colorstops get sets again
    Object.keys(options).forEach((name: string) => {
      if ( name !== 'id') {
        (this as any)[name] = options[name];
      }
    });

    const coords: any = {
      x1: options?.coords?.x1 || 0,
      y1: options?.coords?.y1 || 0,
      x2: options?.coords?.x2 || 0,
      y2: options?.coords?.y2 || 0
    }

    if (this.type === 'radial') {
      coords.r1 = options.coords.r1 || 0;
      coords.r2 = options.coords.r2 || 0;
    }

    this.coords = coords;
    this.colorStops = options?.colorStops?.slice() || [];


  }






}