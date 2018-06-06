import PropertyFactory from '../PropertyFactory';
import { resetShape } from './index';
import shape_pool from '../pooling/shape_pool';
import shapeCollection_pool from '../pooling/shapeCollection_pool';
import DynamicPropertyContainer from '../dynamicProperties';
import { bm_min, roundCorner } from '../common';

class RectShapeProperty extends DynamicPropertyContainer {
  constructor(elem, data) {
    super();
    this.v = shape_pool.newElement();
    this.v.c = true;
    this.localShapeCollection = shapeCollection_pool.newShapeCollection();
    this.localShapeCollection.addShape(this.v);
    this.paths = this.localShapeCollection;
    this.elem = elem;
    this.comp = elem.comp;
    this.frameId = -1;
    this.d = data.d;
    this.initDynamicPropertyContainer(elem);
    this.p = PropertyFactory.getProp(elem, data.p, 1, 0, this);
    this.s = PropertyFactory.getProp(elem, data.s, 1, 0, this);
    this.r = PropertyFactory.getProp(elem, data.r, 0, 0, this);
    if (this.dynamicProperties.length) {
      this.k = true;
    } else {
      this.k = false;
      this.convertRectToPath();
    }
  }

  convertRectToPath() {
    let p0 = this.p.v[0];
    let p1 = this.p.v[1];
    let v0 = this.s.v[0] / 2;
    let v1 = this.s.v[1] / 2;
    let round = bm_min(v0, v1, this.r.v);
    let cPoint = round * (1 - roundCorner);
    this.v._length = 0;

    if (this.d === 2 || this.d === 1) {
      this.v.setTripleAt(p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + cPoint, 0, true);
      this.v.setTripleAt(p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - cPoint, p0 + v0, p1 + v1 - round, 1, true);
      if (round !== 0) {
        this.v.setTripleAt(p0 + v0 - round, p1 + v1, p0 + v0 - round, p1 + v1, p0 + v0 - cPoint, p1 + v1, 2, true);
        this.v.setTripleAt(p0 - v0 + round, p1 + v1, p0 - v0 + cPoint, p1 + v1, p0 - v0 + round, p1 + v1, 3, true);
        this.v.setTripleAt(p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - cPoint, 4, true);
        this.v.setTripleAt(p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + cPoint, p0 - v0, p1 - v1 + round, 5, true);
        this.v.setTripleAt(p0 - v0 + round, p1 - v1, p0 - v0 + round, p1 - v1, p0 - v0 + cPoint, p1 - v1, 6, true);
        this.v.setTripleAt(p0 + v0 - round, p1 - v1, p0 + v0 - cPoint, p1 - v1, p0 + v0 - round, p1 - v1, 7, true);
      } else {
        this.v.setTripleAt(p0 - v0, p1 + v1, p0 - v0 + cPoint, p1 + v1, p0 - v0, p1 + v1, 2);
        this.v.setTripleAt(p0 - v0, p1 - v1, p0 - v0, p1 - v1 + cPoint, p0 - v0, p1 - v1, 3);
      }
    } else {
      this.v.setTripleAt(p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + cPoint, p0 + v0, p1 - v1 + round, 0, true);
      if (round !== 0) {
        this.v.setTripleAt(p0 + v0 - round, p1 - v1, p0 + v0 - round, p1 - v1, p0 + v0 - cPoint, p1 - v1, 1, true);
        this.v.setTripleAt(p0 - v0 + round, p1 - v1, p0 - v0 + cPoint, p1 - v1, p0 - v0 + round, p1 - v1, 2, true);
        this.v.setTripleAt(p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + cPoint, 3, true);
        this.v.setTripleAt(p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - cPoint, p0 - v0, p1 + v1 - round, 4, true);
        this.v.setTripleAt(p0 - v0 + round, p1 + v1, p0 - v0 + round, p1 + v1, p0 - v0 + cPoint, p1 + v1, 5, true);
        this.v.setTripleAt(p0 + v0 - round, p1 + v1, p0 + v0 - cPoint, p1 + v1, p0 + v0 - round, p1 + v1, 6, true);
        this.v.setTripleAt(p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - cPoint, 7, true);
      } else {
        this.v.setTripleAt(p0 - v0, p1 - v1, p0 - v0 + cPoint, p1 - v1, p0 - v0, p1 - v1, 1, true);
        this.v.setTripleAt(p0 - v0, p1 + v1, p0 - v0, p1 + v1 - cPoint, p0 - v0, p1 + v1, 2, true);
        this.v.setTripleAt(p0 + v0, p1 + v1, p0 + v0 - cPoint, p1 + v1, p0 + v0, p1 + v1, 3, true);
      }
    }
  }

  getValue() {
    if (this.elem.globalData.frameId === this.frameId) {
      return;
    }
    this.frameId = this.elem.globalData.frameId;
    this.iterateDynamicProperties();
    if (this._mdf) {
      this.convertRectToPath();
    }
  }

  reset= resetShape
}

export default RectShapeProperty;
