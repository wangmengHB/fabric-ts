import Gradient from '../color/gradient';
import Pattern from '../canvas/pattern';
import { getFunctionBody } from '../base/util';

/*
  all the fabric Object extend Common class

  1. ShapeBase extends Common
   and all other Shapes class extend ShapeBase

  2. CanvasObject extends Common

*/

interface CommonProps {
  [property: string]: any;
}



export default class Common implements CommonProps {

  get(property: string): any {
    return (this as any)[property];
  }

  /**
   * Sets property to a given value. When changing position/dimension -related properties (left, top, scale, angle, etc.) `set` does not update position of object's borders/controls. If you need to update those, call `setCoords()`.
   * @param {String|Object} key Property name or object (if object, iterate over the object properties)
   * @param {Object|Function} value Property value (if function, the value is passed into it and its return value is used as a new one)
   * @return {fabric.Object} thisArg
   * @chainable
   */
  set(key: any, value: any) {
    if (typeof key === 'object') {
      this._setObject(key);
    } else {
      // why ???
      if (typeof value === 'function' && key !== 'clipTo') {
        this._set(key, value(this.get(key)))
      } else {
        this._set(key, value);
      }
    }
    return this;
  }

  toggle(property: string) {
    let value: any = this.get(property);
    if (typeof value === 'boolean') {
      this.set(property, !value);
    }
    return this;
  }



  protected _setOptions(options: any) {
    for (let prop in options) {
      this.set(prop, options[prop]);
    }
  }


  protected _initGradient(filter: any, property: string) {
    if (filter && filter.colorStops && !(filter instanceof Gradient)) {
      this.set(property, new Gradient(filter));
    }
  }

  protected _initPattern(filter: any, property: string, callback?: Function) {
    if (filter && filter.source && !(filter instanceof Pattern)) {
      this.set(property, new Pattern(filter, callback));
      return;
    }
    if (typeof callback === 'function') {
      callback();
    }
  }

  protected _initClipping(options: any) {
    if (!options.clipTo || typeof options.clipTo !== 'string') {
      return;
    }
    const fnBody = getFunctionBody(options.clipTo);
    if (typeof fnBody !== 'undefined') {
      (this as any).clipTo = new Function('ctx', fnBody);
    }
  }


  private _set(key: string, value: any) {
    (this as any)[key] = value;
  }

  private _setObject(obj: any) {
    for (let prop in obj) {
      this._set(prop, obj[prop]);
    }
  }




}



