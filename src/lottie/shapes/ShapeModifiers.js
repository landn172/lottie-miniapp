import shapeCollection_pool from '../utils/pooling/shapeCollection_pool';
import DynamicPropertyContainer from '../utils/dynamicProperties';

export class ShapeModifier extends DynamicPropertyContainer {
  initModifierProperties() {}

  addShapeToModifier() {}

  addShape(data) {
    if (!this.closed) {
      // Adding shape to dynamic properties. It covers the case where a shape has no effects applied, to reset it's _mdf state on every tick.
      data.sh.container.addDynamicProperty(data.sh);
      let shapeData = {
        shape: data.sh,
        data: data,
        localShapeCollection: shapeCollection_pool.newShapeCollection()
      };
      this.shapes.push(shapeData);
      this.addShapeToModifier(shapeData);
      if (this._isAnimated) {
        data.setAsAnimated();
      }
    }
  }

  init(elem, data) {
    this.shapes = [];
    this.elem = elem;
    this.initDynamicPropertyContainer(elem);
    this.initModifierProperties(elem, data);
    this.frameId = -999999;
    this.closed = false;
    this.k = false;
    if (this.dynamicProperties.length) {
      this.k = true;
    } else {
      this.getValue(true);
    }
  }

  processKeys() {
    if (this.elem.globalData.frameId === this.frameId) {
      return;
    }
    this.frameId = this.elem.globalData.frameId;
    this.iterateDynamicProperties();
  }
}

const modifiers = {};

export default {
  registerModifier: function registerModifier(nm, factory) {
    if (!modifiers[nm]) {
      modifiers[nm] = factory;
    }
  },
  getModifier: function getModifier(nm, elem, data) {
    return new modifiers[nm](elem, data);
  }
};
