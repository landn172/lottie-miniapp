import { SliderEffect, AngleEffect, ColorEffect, PointEffect, CheckboxEffect, NoValueEffect } from './effects/SliderEffect';

export function EffectsManager(data, element, dynamicProperties) {
  let effects = data.ef || [];
  this.effectElements = [];
  let i;
  let len = effects.length;
  let effectItem;
  for (i = 0; i < len; i++) {
    effectItem = new GroupEffect(effects[i], element, dynamicProperties);
    this.effectElements.push(effectItem);
  }
}


function GroupEffect(data, element, dynamicProperties) {
  this.dynamicProperties = [];
  this.init(data, element, this.dynamicProperties);
  if (this.dynamicProperties.length) {
    dynamicProperties.push(this);
  }
}

GroupEffect.prototype.getValue = function () {
  this.mdf = false;
  let i;
  let len = this.dynamicProperties.length;
  for (i = 0; i < len; i += 1) {
    this.dynamicProperties[i].getValue();
    this.mdf = this.dynamicProperties[i].mdf ? true : this.mdf;
  }
};

GroupEffect.prototype.init = function (data, element, dynamicProperties) {
  this.data = data;
  this.mdf = false;
  this.effectElements = [];
  let i;
  let len = this.data.ef.length;
  let eff;
  let effects = this.data.ef;
  for (i = 0; i < len; i += 1) {
    switch (effects[i].ty) {
      case 0:
        eff = new SliderEffect(effects[i], element, dynamicProperties);
        this.effectElements.push(eff);
        break;
      case 1:
        eff = new AngleEffect(effects[i], element, dynamicProperties);
        this.effectElements.push(eff);
        break;
      case 2:
        eff = new ColorEffect(effects[i], element, dynamicProperties);
        this.effectElements.push(eff);
        break;
      case 3:
        eff = new PointEffect(effects[i], element, dynamicProperties);
        this.effectElements.push(eff);
        break;
      case 4:
      case 7:
        eff = new CheckboxEffect(effects[i], element, dynamicProperties);
        this.effectElements.push(eff);
        break;
      case 5:
        eff = new EffectsManager(effects[i], element, dynamicProperties);
        this.effectElements.push(eff);
        break;
      case 6:
        eff = new NoValueEffect(effects[i], element, dynamicProperties);
        this.effectElements.push(eff);
        break;
      default: break;
    }
  }
};

export { GroupEffect };
