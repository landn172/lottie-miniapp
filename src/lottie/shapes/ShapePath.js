import { createSizedArray } from '../utils/index';
import point_pool from '../utils/pooling/point_pool';


class ShapePath {
  constructor() {
    this.c = false;
    this._length = 0;
    this._maxLength = 8;
    this.v = createSizedArray(this._maxLength);
    this.o = createSizedArray(this._maxLength);
    this.i = createSizedArray(this._maxLength);
  }

  setPathData(closed, len) {
    this.c = closed;
    this.setLength(len);
    let i = 0;
    while (i < len) {
      this.v[i] = point_pool.newElement();
      this.o[i] = point_pool.newElement();
      this.i[i] = point_pool.newElement();
      i += 1;
    }
  }

  setLength(len) {
    while (this._maxLength < len) {
      this.doubleArrayLength();
    }
    this._length = len;
  }

  doubleArrayLength() {
    this.v = this.v.concat(createSizedArray(this._maxLength));
    this.i = this.i.concat(createSizedArray(this._maxLength));
    this.o = this.o.concat(createSizedArray(this._maxLength));
    this._maxLength *= 2;
  }

  setXYAt(x, y, type, pos, replace) {
    let arr;
    this._length = Math.max(this._length, pos + 1);
    if (this._length >= this._maxLength) {
      this.doubleArrayLength();
    }
    switch (type) {
      case 'v':
        arr = this.v;
        break;
      case 'i':
        arr = this.i;
        break;
      case 'o':
        arr = this.o;
        break;
      default: break;
    }
    if (!arr[pos] || (arr[pos] && !replace)) {
      arr[pos] = point_pool.newElement();
    }
    arr[pos][0] = x;
    arr[pos][1] = y;
  }

  setTripleAt(vX, vY, oX, oY, iX, iY, pos, replace) {
    this.setXYAt(vX, vY, 'v', pos, replace);
    this.setXYAt(oX, oY, 'o', pos, replace);
    this.setXYAt(iX, iY, 'i', pos, replace);
  }

  reverse() {
    let newPath = new ShapePath();
    newPath.setPathData(this.c, this._length);
    let vertices = this.v;
    let outPoints = this.o;
    let inPoints = this.i;
    let init = 0;
    if (this.c) {
      newPath.setTripleAt(vertices[0][0], vertices[0][1], inPoints[0][0], inPoints[0][1], outPoints[0][0], outPoints[0][1], 0, false);
      init = 1;
    }
    let cnt = this._length - 1;
    let len = this._length;

    let i;
    for (i = init; i < len; i += 1) {
      newPath.setTripleAt(vertices[cnt][0], vertices[cnt][1], inPoints[cnt][0], inPoints[cnt][1], outPoints[cnt][0], outPoints[cnt][1], i, false);
      cnt -= 1;
    }
    return newPath;
  }
}

export default ShapePath;
