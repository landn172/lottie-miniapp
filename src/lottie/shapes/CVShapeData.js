import ShapePropertyFactory from '../utils/ShapePropertyFactory';

class CVShapeData {
  constructor(element, data) {
    this.nodes = [];
    this.trNodes = [];
    this.tr = [0, 0, 0, 0, 0, 0];
    let ty = 4;
    if (data.ty === 'rc') {
      ty = 5;
    } else if (data.ty === 'el') {
      ty = 6;
    } else if (data.ty === 'sr') {
      ty = 7;
    }
    this.sh = ShapePropertyFactory.getShapeProp(element, data, ty, element);
    this.st = false;
    this.fl = false;
  }

  setAsAnimated() {
    this._isAnimated = true;
  }
}

export default CVShapeData;
