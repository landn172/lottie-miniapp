import PropertyFactory from '../utils/PropertyFactory';
import { createTypedArray } from '../utils/index';

export class GradientProperty {
  constructor(elem, data) {
    this.container = elem;
    this.prop = PropertyFactory.getProp(elem, data.k, 1, null, this);
    this.data = data;
    this.k = this.prop.k;
    this.c = createTypedArray('uint8c', data.p * 4);
    let cLength = data.k.k[0].s ? (data.k.k[0].s.length - data.p * 4) : data.k.k.length - data.p * 4;
    this.o = createTypedArray('float32', cLength);
    this._cmdf = false;
    this._omdf = false;
    this._collapsable = this.checkCollapsable();
    this._hasOpacity = cLength;
    this._mdf = false;
    this.getValue(true);
  }

  addDynamicProperty(/* prop */) {
    this.container.addDynamicProperty(this);
  }

  comparePoints(values, points) {
    let i = 0;
    let len = this.o.length / 2;
    let diff;
    while (i < len) {
      diff = Math.abs(values[i * 4] - values[points * 4 + i * 2]);
      if (diff > 0.01) {
        return false;
      }
      i += 1;
    }
    return true;
  }

  checkCollapsable() {
    if (this.o.length / 2 !== this.c.length / 4) {
      return false;
    }
    if (this.data.k.k[0].s) {
      let i = 0;
      let len = this.data.k.k.length;
      while (i < len) {
        if (!this.comparePoints(this.data.k.k[i].s, this.data.p)) {
          return false;
        }
        i += 1;
      }
    } else if (!this.comparePoints(this.data.k.k, this.data.p)) {
      return false;
    }
    return true;
  }

  getValue(forceRender) {
    this.prop.getValue();
    this._mdf = false;
    this._cmdf = false;
    this._omdf = false;
    if (this.prop._mdf || forceRender) {
      let i;
      let len = this.data.p * 4;
      let mult;
      let val;
      for (i = 0; i < len; i += 1) {
        mult = i % 4 === 0 ? 100 : 255;
        val = Math.round(this.prop.v[i] * mult);
        if (this.c[i] !== val) {
          this.c[i] = val;
          this._cmdf = !forceRender;
        }
      }
      if (this.o.length) {
        len = this.prop.v.length;
        for (i = this.data.p * 4; i < len; i += 1) {
          mult = i % 2 === 0 ? 100 : 1;
          val = i % 2 === 0 ? Math.round(this.prop.v[i] * 100) : this.prop.v[i];
          if (this.o[i - this.data.p * 4] !== val) {
            this.o[i - this.data.p * 4] = val;
            this._omdf = !forceRender;
          }
        }
      }
      this._mdf = !forceRender;
    }
  }
}
