import { createTypedArray } from '../utils/index';

let _cos = Math.cos;
let _sin = Math.sin;
let _tan = Math.tan;
let _rnd = Math.round;

class Matrix {
  constructor() {
    this._identity = true;
    this._identityCalculated = false;
    this.props = new Float32Array(16);
    this.reset();
  }

  reset() {
    this.props[0] = 1;
    this.props[1] = 0;
    this.props[2] = 0;
    this.props[3] = 0;
    this.props[4] = 0;
    this.props[5] = 1;
    this.props[6] = 0;
    this.props[7] = 0;
    this.props[8] = 0;
    this.props[9] = 0;
    this.props[10] = 1;
    this.props[11] = 0;
    this.props[12] = 0;
    this.props[13] = 0;
    this.props[14] = 0;
    this.props[15] = 1;
    return this;
  }

  rotate(angle) {
    if (angle === 0) {
      return this;
    }
    let mCos = _cos(angle);
    let mSin = _sin(angle);
    return this._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  rotateX(angle) {
    if (angle === 0) {
      return this;
    }
    let mCos = _cos(angle);
    let mSin = _sin(angle);
    return this._t(1, 0, 0, 0, 0, mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1);
  }

  rotateY(angle) {
    if (angle === 0) {
      return this;
    }
    let mCos = _cos(angle);
    let mSin = _sin(angle);
    return this._t(mCos, 0, mSin, 0, 0, 1, 0, 0, -mSin, 0, mCos, 0, 0, 0, 0, 1);
  }

  rotateZ(angle) {
    if (angle === 0) {
      return this;
    }
    let mCos = _cos(angle);
    let mSin = _sin(angle);
    return this._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  shear(sx, sy) {
    return this._t(1, sy, sx, 1, 0, 0);
  }

  skew(ax, ay) {
    return this.shear(_tan(ax), _tan(ay));
  }

  skewFromAxis(ax, angle) {
    let mCos = _cos(angle);
    let mSin = _sin(angle);
    return this._t(mCos, mSin, 0, 0, -mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      ._t(1, 0, 0, 0, _tan(ax), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      ._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  // return this._t(mCos, mSin, -mSin, mCos, 0, 0)._t(1, 0, _tan(ax), 1, 0, 0)._t(mCos, -mSin, mSin, mCos, 0, 0);
  }

  scale(sx, sy, sz) {
    sz = isNaN(sz) ? 1 : sz;
    if (sx === 1 && sy === 1 && sz === 1) {
      return this;
    }
    return this._t(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
  }

  setTransform(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    this.props[0] = a;
    this.props[1] = b;
    this.props[2] = c;
    this.props[3] = d;
    this.props[4] = e;
    this.props[5] = f;
    this.props[6] = g;
    this.props[7] = h;
    this.props[8] = i;
    this.props[9] = j;
    this.props[10] = k;
    this.props[11] = l;
    this.props[12] = m;
    this.props[13] = n;
    this.props[14] = o;
    this.props[15] = p;
    return this;
  }

  translate(tx, ty, tz) {
    tz = tz || 0;
    if (tx !== 0 || ty !== 0 || tz !== 0) {
      return this._t(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1);
    }
    return this;
  }

  transform(a2, b2, c2, d2, e2, f2, g2, h2, i2, j2, k2, l2, m2, n2, o2, p2) {
    let _p = this.props;

    if (a2 === 1 && b2 === 0 && c2 === 0 && d2 === 0 && e2 === 0 && f2 === 1 && g2 === 0 && h2 === 0 && i2 === 0 && j2 === 0 && k2 === 1 && l2 === 0) {
      // NOTE: commenting this condition because TurboFan deoptimizes code when present
      // if(m2 !== 0 || n2 !== 0 || o2 !== 0){
      _p[12] = _p[12] * a2 + _p[15] * m2;
      _p[13] = _p[13] * f2 + _p[15] * n2;
      _p[14] = _p[14] * k2 + _p[15] * o2;
      _p[15] *= p2;
      // }
      this._identityCalculated = false;
      return this;
    }

    let a1 = _p[0];
    let b1 = _p[1];
    let c1 = _p[2];
    let d1 = _p[3];
    let e1 = _p[4];
    let f1 = _p[5];
    let g1 = _p[6];
    let h1 = _p[7];
    let i1 = _p[8];
    let j1 = _p[9];
    let k1 = _p[10];
    let l1 = _p[11];
    let m1 = _p[12];
    let n1 = _p[13];
    let o1 = _p[14];
    let p1 = _p[15];

    /* matrix order (canvas compatible):
     * ace
     * bdf
     * 001
     */
    _p[0] = a1 * a2 + b1 * e2 + c1 * i2 + d1 * m2;
    _p[1] = a1 * b2 + b1 * f2 + c1 * j2 + d1 * n2;
    _p[2] = a1 * c2 + b1 * g2 + c1 * k2 + d1 * o2;
    _p[3] = a1 * d2 + b1 * h2 + c1 * l2 + d1 * p2;

    _p[4] = e1 * a2 + f1 * e2 + g1 * i2 + h1 * m2;
    _p[5] = e1 * b2 + f1 * f2 + g1 * j2 + h1 * n2;
    _p[6] = e1 * c2 + f1 * g2 + g1 * k2 + h1 * o2;
    _p[7] = e1 * d2 + f1 * h2 + g1 * l2 + h1 * p2;

    _p[8] = i1 * a2 + j1 * e2 + k1 * i2 + l1 * m2;
    _p[9] = i1 * b2 + j1 * f2 + k1 * j2 + l1 * n2;
    _p[10] = i1 * c2 + j1 * g2 + k1 * k2 + l1 * o2;
    _p[11] = i1 * d2 + j1 * h2 + k1 * l2 + l1 * p2;

    _p[12] = m1 * a2 + n1 * e2 + o1 * i2 + p1 * m2;
    _p[13] = m1 * b2 + n1 * f2 + o1 * j2 + p1 * n2;
    _p[14] = m1 * c2 + n1 * g2 + o1 * k2 + p1 * o2;
    _p[15] = m1 * d2 + n1 * h2 + o1 * l2 + p1 * p2;

    this._identityCalculated = false;
    return this;
  }

  isIdentity() {
    const props = this.props;
    if (!this._identityCalculated) {
      this._identity = !(props[0] !== 1 || props[1] !== 0 || props[2] !== 0 || props[3] !== 0 || props[4] !== 0 || props[5] !== 1 || props[6] !== 0 || props[7] !== 0 || props[8] !== 0 || props[9] !== 0 || props[10] !== 1 || props[11] !== 0 || props[12] !== 0 || props[13] !== 0 || props[14] !== 0 || props[15] !== 1);
      this._identityCalculated = true;
    }
    return this._identity;
  }

  equals(matr) {
    let i = 0;
    const props = this.props;
    while (i < 16) {
      if (matr.props[i] !== props[i]) {
        return false;
      }
      i += 1;
    }
    return true;
  }

  clone(matr) {
    let i;
    const props = this.props;
    for (i = 0; i < 16; i += 1) {
      matr.props[i] = props[i];
    }
  }

  cloneFromProps(props) {
    let i;
    for (i = 0; i < 16; i += 1) {
      this.props[i] = props[i];
    }
  }

  applyToPoint(x, y, z) {
    const props = this.props;
    return {
      x: x * props[0] + y * props[4] + z * props[8] + props[12],
      y: x * props[1] + y * props[5] + z * props[9] + props[13],
      z: x * props[2] + y * props[6] + z * props[10] + props[14]
    };
  /* return {
   x: x * me.a + y * me.c + me.e,
   y: x * me.b + y * me.d + me.f
   }; */
  }

  applyToX(x, y, z) {
    const props = this.props;
    return x * props[0] + y * props[4] + z * props[8] + props[12];
  }

  applyToY(x, y, z) {
    const props = this.props;
    return x * props[1] + y * props[5] + z * props[9] + props[13];
  }

  applyToZ(x, y, z) {
    const props = this.props;
    return x * props[2] + y * props[6] + z * props[10] + props[14];
  }

  inversePoint(pt) {
    const props = this.props;
    let determinant = props[0] * props[5] - props[1] * props[4];
    let a = props[5] / determinant;
    let b = -props[1] / determinant;
    let c = -props[4] / determinant;
    let d = props[0] / determinant;
    let e = (props[4] * props[13] - props[5] * props[12]) / determinant;
    let f = -(props[0] * props[13] - props[1] * props[12]) / determinant;
    return [pt[0] * a + pt[1] * c + e, pt[0] * b + pt[1] * d + f, 0];
  }

  inversePoints(pts) {
    let i;
    let len = pts.length;
    let retPts = [];
    for (i = 0; i < len; i += 1) {
      retPts[i] = this.inversePoint(pts[i]);
    }
    return retPts;
  }

  applyToTriplePoints(pt1, pt2, pt3) {
    let arr = createTypedArray('float32', 6);
    if (this.isIdentity()) {
      arr[0] = pt1[0];
      arr[1] = pt1[1];
      arr[2] = pt2[0];
      arr[3] = pt2[1];
      arr[4] = pt3[0];
      arr[5] = pt3[1];
    } else {
      const props = this.props;
      let p0 = props[0];
      let p1 = props[1];
      let p4 = props[4];
      let p5 = props[5];
      let p12 = props[12];
      let p13 = props[13];
      arr[0] = pt1[0] * p0 + pt1[1] * p4 + p12;
      arr[1] = pt1[0] * p1 + pt1[1] * p5 + p13;
      arr[2] = pt2[0] * p0 + pt2[1] * p4 + p12;
      arr[3] = pt2[0] * p1 + pt2[1] * p5 + p13;
      arr[4] = pt3[0] * p0 + pt3[1] * p4 + p12;
      arr[5] = pt3[0] * p1 + pt3[1] * p5 + p13;
    }
    return arr;
  }

  applyToPointArray(x, y, z) {
    let arr;
    if (this.isIdentity()) {
      arr = [x, y, z];
    } else {
      const props = this.props;
      arr = [x * props[0] + y * props[4] + z * props[8] + props[12], x * props[1] + y * props[5] + z * props[9] + props[13], x * props[2] + y * props[6] + z * props[10] + props[14]];
    }
    return arr;
  }

  applyToPointStringified(x, y) {
    if (this.isIdentity()) {
      return x + ',' + y;
    }
    let _p = this.props;
    return Math.round((x * _p[0] + y * _p[4] + _p[12]) * 100) / 100 + ',' + Math.round((x * _p[1] + y * _p[5] + _p[13]) * 100) / 100;
  }

  toCSS() {
    // Doesn't make much sense to add this optimization. If it is an identity matrix, it's very likely this will get called only once since it won't be keyframed.
    /* if(this.isIdentity()) {
        return '';
    } */
    let i = 0;
    let props = this.props;
    let cssValue = 'matrix3d(';
    let v = 10000;
    while (i < 16) {
      cssValue += _rnd(props[i] * v) / v;
      cssValue += i === 15 ? ')' : ',';
      i += 1;
    }
    return cssValue;
  }

  roundMatrixProperty(val) {
    let v = 10000;
    if ((val < 0.000001 && val > 0) || (val > -0.000001 && val < 0)) {
      return _rnd(val * v) / v;
    }
    return val;
  }

  to2dCSS() {
    // Doesn't make much sense to add this optimization. If it is an identity matrix, it's very likely this will get called only once since it won't be keyframed.
    /* if(this.isIdentity()) {
        return '';
    } */
    let props = this.props;
    let roundMatrixProperty = this.roundMatrixProperty;
    let _a = roundMatrixProperty(props[0]);
    let _b = roundMatrixProperty(props[1]);
    let _c = roundMatrixProperty(props[4]);
    let _d = roundMatrixProperty(props[5]);
    let _e = roundMatrixProperty(props[12]);
    let _f = roundMatrixProperty(props[13]);
    return 'matrix(' + _a + ',' + _b + ',' + _c + ',' + _d + ',' + _e + ',' + _f + ')';
  }

  _t(...args) {
    return this.transform(...args);
  }
}

export default Matrix;
