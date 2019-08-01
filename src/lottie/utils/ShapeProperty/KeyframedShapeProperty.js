import {
  interpolateShape, processEffectsSequence, resetShape, addEffect, setVValue, interpolateShapeCurrentTime, initFrame
} from './index';
import shape_pool from '../pooling/shape_pool';
import shapeCollection_pool from '../pooling/shapeCollection_pool';
import ShapeExpressions from '../expressions/ShapeExpressions';
import { getShapeValueAtTime } from '../expressions/Decorator';
import ExpressionManager from '../expressions/ExpressionManager';

class KeyframedShapeProperty extends ShapeExpressions {
  constructor(elem, data, type) {
    super();
    this.propType = 'shape';
    this.comp = elem.comp;
    this.elem = elem;
    this.container = elem;
    this.offsetTime = elem.data.st;
    this.keyframes = type === 3 ? data.pt.k : data.ks.k;
    this.k = true;
    this.kf = true;
    // let i;
    let len = this.keyframes[0].s[0].i.length;
    // let jLen = this.keyframes[0].s[0].i[0].length;
    this.v = shape_pool.newElement();
    this.v.setPathData(this.keyframes[0].s[0].c, len);
    this.pv = shape_pool.clone(this.v);
    this.localShapeCollection = shapeCollection_pool.newShapeCollection();
    this.paths = this.localShapeCollection;
    this.paths.addShape(this.v);
    this.lastFrame = initFrame;
    this.reset = resetShape;
    this._caching = {
      lastFrame: initFrame,
      lastIndex: 0
    };
    this.effectsSequence = [interpolateShapeCurrentTime.bind(this)];
  }

  getShapeValueAtTime=getShapeValueAtTime

  initiateExpression=ExpressionManager.initiateExpression
}

KeyframedShapeProperty.prototype.getValue = processEffectsSequence;
KeyframedShapeProperty.prototype.interpolateShape = interpolateShape;
KeyframedShapeProperty.prototype.setVValue = setVValue;
KeyframedShapeProperty.prototype.addEffect = addEffect;

export default KeyframedShapeProperty;
