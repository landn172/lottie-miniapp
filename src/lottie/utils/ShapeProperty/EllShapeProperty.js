import PropertyFactory from '../PropertyFactory';
import { resetShape } from './index';
import shape_pool from '../pooling/shape_pool';
import shapeCollection_pool from '../pooling/shapeCollection_pool';
import DynamicPropertyContainer from '../dynamicProperties';

let cPoint = 0.5519;

class EllShapeProperty extends DynamicPropertyContainer {
  constructor(elem, data) {
    super();

    this.v = shape_pool.newElement();
    this.v.setPathData(true, 4);
    this.localShapeCollection = shapeCollection_pool.newShapeCollection();
    this.paths = this.localShapeCollection;
    this.localShapeCollection.addShape(this.v);
    this.d = data.d;
    this.elem = elem;
    this.comp = elem.comp;
    this.frameId = -1;
    this.initDynamicPropertyContainer(elem);
    this.p = PropertyFactory.getProp(elem, data.p, 1, 0, this);
    this.s = PropertyFactory.getProp(elem, data.s, 1, 0, this);
    if (this.dynamicProperties.length) {
      this.k = true;
    } else {
      this.k = false;
      this.convertEllToPath();
    }
  }

  reset=resetShape

  getValue() {
    if (this.elem.globalData.frameId === this.frameId) {
      return;
    }
    this.frameId = this.elem.globalData.frameId;
    this.iterateDynamicProperties();

    if (this._mdf) {
      this.convertEllToPath();
    }
  }

  convertEllToPath() {
    let p0 = this.p.v[0];
    let p1 = this.p.v[1];
    let s0 = this.s.v[0] / 2;
    let s1 = this.s.v[1] / 2;
    let _cw = this.d !== 3;
    let _v = this.v;
    _v.v[0][0] = p0;
    _v.v[0][1] = p1 - s1;
    _v.v[1][0] = _cw ? p0 + s0 : p0 - s0;
    _v.v[1][1] = p1;
    _v.v[2][0] = p0;
    _v.v[2][1] = p1 + s1;
    _v.v[3][0] = _cw ? p0 - s0 : p0 + s0;
    _v.v[3][1] = p1;
    _v.i[0][0] = _cw ? p0 - s0 * cPoint : p0 + s0 * cPoint;
    _v.i[0][1] = p1 - s1;
    _v.i[1][0] = _cw ? p0 + s0 : p0 - s0;
    _v.i[1][1] = p1 - s1 * cPoint;
    _v.i[2][0] = _cw ? p0 + s0 * cPoint : p0 - s0 * cPoint;
    _v.i[2][1] = p1 + s1;
    _v.i[3][0] = _cw ? p0 - s0 : p0 + s0;
    _v.i[3][1] = p1 + s1 * cPoint;
    _v.o[0][0] = _cw ? p0 + s0 * cPoint : p0 - s0 * cPoint;
    _v.o[0][1] = p1 - s1;
    _v.o[1][0] = _cw ? p0 + s0 : p0 - s0;
    _v.o[1][1] = p1 + s1 * cPoint;
    _v.o[2][0] = _cw ? p0 - s0 * cPoint : p0 + s0 * cPoint;
    _v.o[2][1] = p1 + s1;
    _v.o[3][0] = _cw ? p0 - s0 : p0 + s0;
    _v.o[3][1] = p1 - s1 * cPoint;
  }
}

export default EllShapeProperty;
