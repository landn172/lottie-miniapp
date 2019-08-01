import PropertyFactory from '../PropertyFactory';
import { resetShape } from './index';
import shape_pool from '../pooling/shape_pool';
import shapeCollection_pool from '../pooling/shapeCollection_pool';
import DynamicPropertyContainer from '../dynamicProperties';

const degToRads = Math.PI / 180;

class StarShapeProperty extends DynamicPropertyContainer {
  constructor(elem, data) {
    super();
    this.v = shape_pool.newElement();
    this.v.setPathData(true, 0);
    this.elem = elem;
    this.comp = elem.comp;
    this.data = data;
    this.frameId = -1;
    this.d = data.d;
    this.initDynamicPropertyContainer(elem);
    if (data.sy === 1) {
      this.ir = PropertyFactory.getProp(elem, data.ir, 0, 0, this);
      this.is = PropertyFactory.getProp(elem, data.is, 0, 0.01, this);
      this.convertToPath = this.convertStarToPath;
    } else {
      this.convertToPath = this.convertPolygonToPath;
    }
    this.pt = PropertyFactory.getProp(elem, data.pt, 0, 0, this);
    this.p = PropertyFactory.getProp(elem, data.p, 1, 0, this);
    this.r = PropertyFactory.getProp(elem, data.r, 0, degToRads, this);
    this.or = PropertyFactory.getProp(elem, data.or, 0, 0, this);
    this.os = PropertyFactory.getProp(elem, data.os, 0, 0.01, this);
    this.localShapeCollection = shapeCollection_pool.newShapeCollection();
    this.localShapeCollection.addShape(this.v);
    this.paths = this.localShapeCollection;
    if (this.dynamicProperties.length) {
      this.k = true;
    } else {
      this.k = false;
      this.convertToPath();
    }
  }

  reset= resetShape

  getValue() {
    if (this.elem.globalData.frameId === this.frameId) {
      return;
    }
    this.frameId = this.elem.globalData.frameId;
    this.iterateDynamicProperties();
    if (this._mdf) {
      this.convertToPath();
    }
  }

  convertStarToPath() {
    let numPts = Math.floor(this.pt.v) * 2;
    let angle = Math.PI * 2 / numPts;
    /* this.v.v.length = numPts;
                this.v.i.length = numPts;
                this.v.o.length = numPts; */
    let longFlag = true;
    let longRad = this.or.v;
    let shortRad = this.ir.v;
    let longRound = this.os.v;
    let shortRound = this.is.v;
    let longPerimSegment = 2 * Math.PI * longRad / (numPts * 2);
    let shortPerimSegment = 2 * Math.PI * shortRad / (numPts * 2);
    let i;
    let rad;
    let roundness;
    let perimSegment;
    let currentAng = -Math.PI / 2;
    currentAng += this.r.v;
    let dir = this.data.d === 3 ? -1 : 1;
    this.v._length = 0;
    for (i = 0; i < numPts; i += 1) {
      rad = longFlag ? longRad : shortRad;
      roundness = longFlag ? longRound : shortRound;
      perimSegment = longFlag ? longPerimSegment : shortPerimSegment;
      let x = rad * Math.cos(currentAng);
      let y = rad * Math.sin(currentAng);
      let ox = x === 0 && y === 0 ? 0 : y / Math.sqrt(x * x + y * y);
      let oy = x === 0 && y === 0 ? 0 : -x / Math.sqrt(x * x + y * y);
      x += +this.p.v[0];
      y += +this.p.v[1];
      this.v.setTripleAt(x, y, x - ox * perimSegment * roundness * dir, y - oy * perimSegment * roundness * dir, x + ox * perimSegment * roundness * dir, y + oy * perimSegment * roundness * dir, i, true);

      /* this.v.v[i] = [x,y];
                    this.v.i[i] = [x+ox*perimSegment*roundness*dir,y+oy*perimSegment*roundness*dir];
                    this.v.o[i] = [x-ox*perimSegment*roundness*dir,y-oy*perimSegment*roundness*dir];
                    this.v._length = numPts; */
      longFlag = !longFlag;
      currentAng += angle * dir;
    }
  }

  convertPolygonToPath() {
    let numPts = Math.floor(this.pt.v);
    let angle = Math.PI * 2 / numPts;
    let rad = this.or.v;
    let roundness = this.os.v;
    let perimSegment = 2 * Math.PI * rad / (numPts * 4);
    let i;
    let currentAng = -Math.PI / 2;
    let dir = this.data.d === 3 ? -1 : 1;
    currentAng += this.r.v;
    this.v._length = 0;
    for (i = 0; i < numPts; i += 1) {
      let x = rad * Math.cos(currentAng);
      let y = rad * Math.sin(currentAng);
      let ox = x === 0 && y === 0 ? 0 : y / Math.sqrt(x * x + y * y);
      let oy = x === 0 && y === 0 ? 0 : -x / Math.sqrt(x * x + y * y);
      x += +this.p.v[0];
      y += +this.p.v[1];
      this.v.setTripleAt(x, y, x - ox * perimSegment * roundness * dir, y - oy * perimSegment * roundness * dir, x + ox * perimSegment * roundness * dir, y + oy * perimSegment * roundness * dir, i, true);
      currentAng += angle * dir;
    }
    this.paths.length = 0;
    this.paths[0] = this.v;
  }
}

export default StarShapeProperty;
