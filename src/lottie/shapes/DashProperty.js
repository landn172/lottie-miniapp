import { createSizedArray, createTypedArray } from '../utils/index';
import PropertyFactory from '../utils/PropertyFactory';
import DynamicPropertyContainer from '../utils/dynamicProperties';

export default class DashProperty extends DynamicPropertyContainer {
  constructor(elem, data, renderer, container) {
    super();
    this.elem = elem;
    this.frameId = -1;
    this.dataProps = createSizedArray(data.length);
    this.renderer = renderer;
    this.k = false;
    this.dashStr = '';
    this.dashArray = createTypedArray('float32', data.length ? data.length - 1 : 0);
    this.dashoffset = createTypedArray('float32', 1);
    this.initDynamicPropertyContainer(container);
    let i;
    let len = data.length || 0;
    let prop;
    for (i = 0; i < len; i += 1) {
      prop = PropertyFactory.getProp(elem, data[i].v, 0, 0, this);
      this.k = prop.k || this.k;
      this.dataProps[i] = {
        n: data[i].n,
        p: prop
      };
    }
    if (!this.k) {
      this.getValue(true);
    }
    this._isAnimated = this.k;
  }

  getValue(forceRender) {
    if (this.elem.globalData.frameId === this.frameId && !forceRender) {
      return;
    }
    this.frameId = this.elem.globalData.frameId;
    this.iterateDynamicProperties();
    this._mdf = this._mdf || forceRender;
    if (this._mdf) {
      let i = 0;
      const len = this.dataProps.length;
      if (this.renderer === 'svg') {
        this.dashStr = '';
      }
      for (i = 0; i < len; i += 1) {
        if (this.dataProps[i].n !== 'o') {
          if (this.renderer === 'svg') {
            this.dashStr += ' ' + this.dataProps[i].p.v;
          } else {
            this.dashArray[i] = this.dataProps[i].p.v;
          }
        } else {
          this.dashoffset[0] = this.dataProps[i].p.v;
        }
      }
    }
  }
}
