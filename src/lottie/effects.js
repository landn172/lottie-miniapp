import {
  AngleEffect, CheckboxEffect, ColorEffect, NoValueEffect, PointEffect, SliderEffect, LayerIndexEffect, MaskIndexEffect
} from './effects/SliderEffect';
import DynamicPropertyContainer from './utils/dynamicProperties';

export function EffectsManager(data, element) {
  let effects = data.ef || [];
  this.effectElements = [];
  let i;
  let len = effects.length;
  let effectItem;
  for (i = 0; i < len; i++) {
    effectItem = new GroupEffect(effects[i], element);
    this.effectElements.push(effectItem);
  }
}

class GroupEffect extends DynamicPropertyContainer {
  constructor(data, element) {
    super();
    this.init(data, element);
  }

  init(data, element) {
    this.data = data;
    this.effectElements = [];
    this.initDynamicPropertyContainer(element);
    let i;
    let len = this.data.ef.length;
    let eff;
    let effects = this.data.ef;
    for (i = 0; i < len; i += 1) {
      eff = null;
      switch (effects[i].ty) {
        case 0:
          eff = new SliderEffect(effects[i], element, this);
          break;
        case 1:
          eff = new AngleEffect(effects[i], element, this);
          break;
        case 2:
          eff = new ColorEffect(effects[i], element, this);
          break;
        case 3:
          eff = new PointEffect(effects[i], element, this);
          break;
        case 4:
        case 7:
          eff = new CheckboxEffect(effects[i], element, this);
          break;
        case 10:
          eff = new LayerIndexEffect(effects[i], element, this);
          break;
        case 11:
          eff = new MaskIndexEffect(effects[i], element, this);
          break;
        case 5:
          eff = new EffectsManager(effects[i], element, this);
          break;
        // case 6:
        default:
          eff = new NoValueEffect(effects[i], element, this);
          break;
      }
      if (eff) {
        this.effectElements.push(eff);
      }
    }
  }
}

GroupEffect.prototype.getValue = GroupEffect.prototype.iterateDynamicProperties;

export { GroupEffect };
