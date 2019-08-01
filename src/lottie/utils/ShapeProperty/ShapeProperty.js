import {
  interpolateShape, processEffectsSequence, resetShape, addEffect, setVValue
} from './index';
import shape_pool from '../pooling/shape_pool';
import shapeCollection_pool from '../pooling/shapeCollection_pool';
import ShapeExpressions from '../expressions/ShapeExpressions';

class ShapeProperty extends ShapeExpressions {
  constructor(elem, data, type) {
    super();
    this.propType = 'shape';
    this.comp = elem.comp;
    this.container = elem;
    this.elem = elem;
    this.data = data;
    this.k = false;
    this.kf = false;
    this._mdf = false;
    let pathData = type === 3 ? data.pt.k : data.ks.k;
    this.v = shape_pool.clone(pathData);
    this.pv = shape_pool.clone(this.v);
    this.localShapeCollection = shapeCollection_pool.newShapeCollection();
    this.paths = this.localShapeCollection;
    this.paths.addShape(this.v);
    this.reset = resetShape;
    this.effectsSequence = [];
  }
}

ShapeProperty.prototype.interpolateShape = interpolateShape;
ShapeProperty.prototype.getValue = processEffectsSequence;
ShapeProperty.prototype.setVValue = setVValue;
ShapeProperty.prototype.addEffect = addEffect;

export default ShapeProperty;
