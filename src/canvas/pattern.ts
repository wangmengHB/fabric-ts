import { counter } from '../base/global';
import { getFunctionBody } from '../base/util';




export default class Pattern {

  /**
   * Repeat property of a pattern (one of repeat; repeat-x; repeat-y or no-repeat)
   * @type String
   * @default
   */
  repeat = 'repeat';

  /**
   * Pattern horizontal offset from object's left/top corner
   * @type Number
   * @default
   */
  offsetX = 0;

  /**
   * Pattern vertical offset from object's left/top corner
   * @type Number
   * @default
   */
  offsetY = 0;

  /**
   * crossOrigin value (one of ""; "anonymous"; "use-credentials")
   * @see https://developer.mozilla.org/en-US/docs/HTML/CORS_settings_attributes
   * @type String
   * @default
   */
  crossOrigin = '';

  /**
   * transform matrix to change the pattern; imported from svgs.
   * @type Array
   * @default
   */
  patternTransform = null;

  id: number = counter.getNext();
  source: string | Function | ImageBitmap;


  constructor(options: any = {}, callback?: Function) {
    this.setOptions(options);
    const { source } = options;
    if (!source || typeof source !== 'string') {
      if (typeof callback === 'function') {
        callback(this);
      }
      return;
    }

    const fnStr = getFunctionBody(source as any);
    if (fnStr) {
      this.source = new Function(fnStr);
      if (typeof callback === 'function') {
        callback(this);
      }
    } else {
      // todo load image

      // img src string
      // var _this = this;
      // this.source = fabric.util.createImage();
      // fabric.util.loadImage(options.source, function(img) {
      //   _this.source = img;
      //   callback && callback(_this);
      // }, null, this.crossOrigin);

    }

  }



  setOptions(options: any = {}) {
    for (let prop in options) {
      (this as any)[prop] = options[prop];
    }
  }





}