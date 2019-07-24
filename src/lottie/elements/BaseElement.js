import { randomString } from '../utils/index';
import { EffectsManager } from '../effects';
import LayerExpressionInterface from '../utils/expressions/LayerInterface';
import EffectsExpressionInterface from '../utils/expressions/EffectInterface';
import ShapeExpressionInterface from '../utils/expressions/ShapeInterface';
import CompExpressionInterface from '../utils/expressions/CompInterface';
import TextExpressionInterface from '../utils/expressions/TransformInterface';

class BaseElement {
  checkMasks() {
    if (!this.data.hasMask) {
      return false;
    }
    let i = 0;
    let len = this.data.masksProperties.length;
    while (i < len) {
      if ((this.data.masksProperties[i].mode !== 'n' && this.data.masksProperties[i].cl !== false)) {
        return true;
      }
      i += 1;
    }
    return false;
  }

  initExpressions() {
    this.layerInterface = LayerExpressionInterface(this);
    if (this.data.hasMask && this.maskManager) {
      this.layerInterface.registerMaskInterface(this.maskManager);
    }
    let effectsInterface = EffectsExpressionInterface.createEffectsInterface(this, this.layerInterface);
    this.layerInterface.registerEffectsInterface(effectsInterface);

    if (this.data.ty === 0 || this.data.xt) {
      this.compInterface = CompExpressionInterface(this);
    } else if (this.data.ty === 4) {
      this.layerInterface.shapeInterface = ShapeExpressionInterface(this.shapesData, this.itemsData, this.layerInterface);
      this.layerInterface.content = this.layerInterface.shapeInterface;
    } else if (this.data.ty === 5) {
      this.layerInterface.textInterface = TextExpressionInterface(this);
      this.layerInterface.text = this.layerInterface.textInterface;
    }
  }

  get blendModeEnums() {
    return {
      1: 'multiply',
      2: 'screen',
      3: 'overlay',
      4: 'darken',
      5: 'lighten',
      6: 'color-dodge',
      7: 'color-burn',
      8: 'hard-light',
      9: 'soft-light',
      10: 'difference',
      11: 'exclusion',
      12: 'hue',
      13: 'saturation',
      14: 'color',
      15: 'luminosity'
    };
  }

  getBlendMode() {
    return this.blendModeEnums[this.data.bm] || '';
  }

  setBlendMode() {
    let blendModeValue = this.getBlendMode();
    let elem = this.baseElement || this.layerElement;

    elem.style['mix-blend-mode'] = blendModeValue;
  }

  initBaseData(data, globalData, comp) {
    this.globalData = globalData;
    this.comp = comp;
    this.data = data;
    this.layerId = 'ly_' + randomString(10);

    // Stretch factor for old animations missing this property.
    if (!this.data.sr) {
      this.data.sr = 1;
    }
    // effects manager
    this.effectsManager = new EffectsManager(this.data, this, this.dynamicProperties);
  }

  getType() {
    return this.type;
  }
}

export default BaseElement;
