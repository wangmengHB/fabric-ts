


  /**
   * Point class
   * @class fabric.Point
   * @memberOf fabric
   * @constructor
   * @param {Number} x
   * @param {Number} y
   * @return {fabric.Point} thisArg
   */
  export default class Point{

    type = 'point';


    constructor(public x: number, public y: number) { }

    /**
     * Adds another point to this one and returns another one
     * @param {fabric.Point} that
     * @return {fabric.Point} new Point instance with added values
     */
    add(that: Point) {
      return new Point(this.x + that.x, this.y + that.y);
    }

    /**
     * Adds another point to this one
     * @param {fabric.Point} that
     * @return {fabric.Point} thisArg
     * @chainable
     */
    addEquals(that: Point) {
      this.x += that.x;
      this.y += that.y;
      return this;
    }

    /**
     * Adds value to this point and returns a new one
     * @param {Number} scalar
     * @return {fabric.Point} new Point with added value
     */
    scalarAdd(scalar: number) {
      return new Point(this.x + scalar, this.y + scalar);
    }

    /**
     * Adds value to this point
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    scalarAddEquals(scalar: number) {
      this.x += scalar;
      this.y += scalar;
      return this;
    }

    /**
     * Subtracts another point from this point and returns a new one
     * @param {fabric.Point} that
     * @return {fabric.Point} new Point object with subtracted values
     */
    subtract(that: Point) {
      return new Point(this.x - that.x, this.y - that.y);
    }

    /**
     * Subtracts another point from this point
     * @param {fabric.Point} that
     * @return {fabric.Point} thisArg
     * @chainable
     */
    subtractEquals(that: Point) {
      this.x -= that.x;
      this.y -= that.y;
      return this;
    }

    /**
     * Subtracts value from this point and returns a new one
     * @param {Number} scalar
     * @return {fabric.Point}
     */
    scalarSubtract(scalar: number) {
      return new Point(this.x - scalar, this.y - scalar);
    }

    /**
     * Subtracts value from this point
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    scalarSubtractEquals(scalar: number) {
      this.x -= scalar;
      this.y -= scalar;
      return this;
    }

    /**
     * Multiplies this point by a value and returns a new one
     * TODO: rename in scalarMultiply in 2.0
     * @param {Number} scalar
     * @return {fabric.Point}
     */
    multiply(scalar: number) {
      return new Point(this.x * scalar, this.y * scalar);
    }

    /**
     * Multiplies this point by a value
     * TODO: rename in scalarMultiplyEquals in 2.0
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    multiplyEquals(scalar: number) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    }

    /**
     * Divides this point by a value and returns a new one
     * TODO: rename in scalarDivide in 2.0
     * @param {Number} scalar
     * @return {fabric.Point}
     */
    divide(scalar: number) {
      return new Point(this.x / scalar, this.y / scalar);
    }

    /**
     * Divides this point by a value
     * TODO: rename in scalarDivideEquals in 2.0
     * @param {Number} scalar
     * @return {fabric.Point} thisArg
     * @chainable
     */
    divideEquals(scalar: number) {
      this.x /= scalar;
      this.y /= scalar;
      return this;
    }

    /**
     * Returns true if this point is equal to another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    eq(that: Point) {
      return (this.x === that.x && this.y === that.y);
    }

    /**
     * Returns true if this point is less than another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    lt(that: Point) {
      return (this.x < that.x && this.y < that.y);
    }

    /**
     * Returns true if this point is less than or equal to another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    lte(that: Point) {
      return (this.x <= that.x && this.y <= that.y);
    }

    /**

     * Returns true if this point is greater another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    gt(that: Point) {
      return (this.x > that.x && this.y > that.y);
    }

    /**
     * Returns true if this point is greater than or equal to another one
     * @param {fabric.Point} that
     * @return {Boolean}
     */
    gte(that: Point) {
      return (this.x >= that.x && this.y >= that.y);
    }

    /**
     * Returns new point which is the result of linear interpolation with this one and another one
     * @param {fabric.Point} that
     * @param {Number} t , position of interpolation, between 0 and 1 default 0.5
     * @return {fabric.Point}
     */
    lerp(that: Point, t?: number) {
      if (typeof t === 'undefined') {
        t = 0.5;
      }
      t = Math.max(Math.min(1, t), 0);
      return new Point(this.x + (that.x - this.x) * t, this.y + (that.y - this.y) * t);
    }

    /**
     * Returns distance from this point and another one
     * @param {fabric.Point} that
     * @return {Number}
     */
    distanceFrom(that: Point) {
      var dx = this.x - that.x,
          dy = this.y - that.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Returns the point between this point and another one
     * @param {fabric.Point} that
     * @return {fabric.Point}
     */
    midPointFrom(that: Point) {
      return this.lerp(that);
    }

    /**
     * Returns a new point which is the min of this and another one
     * @param {fabric.Point} that
     * @return {fabric.Point}
     */
    min(that: Point) {
      return new Point(Math.min(this.x, that.x), Math.min(this.y, that.y));
    }

    /**
     * Returns a new point which is the max of this and another one
     * @param {fabric.Point} that
     * @return {fabric.Point}
     */
    max(that: Point) {
      return new Point(Math.max(this.x, that.x), Math.max(this.y, that.y));
    }

    /**
     * Returns string representation of this point
     * @return {String}
     */
    toString() {
      return this.x + ',' + this.y;
    }

    /**
     * Sets x/y of this point
     * @param {Number} x
     * @param {Number} y
     * @chainable
     */
    setXY(x: number, y: number) {
      this.x = x;
      this.y = y;
      return this;
    }

    /**
     * Sets x of this point
     * @param {Number} x
     * @chainable
     */
    setX(x: number) {
      this.x = x;
      return this;
    }

    /**
     * Sets y of this point
     * @param {Number} y
     * @chainable
     */
    setY(y: number) {
      this.y = y;
      return this;
    }

    /**
     * Sets x/y of this point from another point
     * @param {fabric.Point} that
     * @chainable
     */
    setFromPoint(that: Point) {
      this.x = that.x;
      this.y = that.y;
      return this;
    }

    /**
     * Swaps x/y of this point and another point
     * @param {fabric.Point} that
     */
    swap(that: Point) {
      var x = this.x,
          y = this.y;
      this.x = that.x;
      this.y = that.y;
      that.x = x;
      that.y = y;
    }

    /**
     * return a cloned instance of the point
     * @return {fabric.Point}
     */
    clone() {
      return new Point(this.x, this.y);
    }
    
  }

  