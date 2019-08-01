import KeyframedShapeProperty from './ShapeProperty/KeyframedShapeProperty';
import ShapeProperty from './ShapeProperty/ShapeProperty';
import RectShapeProperty from './ShapeProperty/RectShapeProperty';
import EllShapeProperty from './ShapeProperty/EllShapeProperty';
import StarShapeProperty from './ShapeProperty/StarShapeProperty';
import { GetShapeProp } from './expressions/Decorator';

class ShapePropertyFactory {
  @GetShapeProp
  getShapeProp(elem, data, type) {
    let prop;
    if (type === 3 || type === 4) {
      let dataProp = type === 3 ? data.pt : data.ks;
      let keys = dataProp.k;
      if (keys.length) {
        prop = new KeyframedShapeProperty(elem, data, type);
      } else {
        prop = new ShapeProperty(elem, data, type);
      }
    } else if (type === 5) {
      prop = new RectShapeProperty(elem, data);
    } else if (type === 6) {
      prop = new EllShapeProperty(elem, data);
    } else if (type === 7) {
      prop = new StarShapeProperty(elem, data);
    }
    if (prop.k) {
      elem.addDynamicProperty(prop);
    }
    return prop;
  }

  getConstructorFunction() {
    return ShapeProperty;
  }

  getKeyframedConstructorFunction() {
    return KeyframedShapeProperty;
  }
}

export default new ShapePropertyFactory();
