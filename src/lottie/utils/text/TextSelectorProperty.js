import PropertyFactory from '../PropertyFactory';
import BezierFactory from '../../3rd_party/BezierEaser';
import { GetTextSelectorProp } from '../expressions/Decorator';
import DynamicPropertyContainer from '../dynamicProperties';
import { addDynamicProperty } from '../helpers/dynamicProperties';

let max = Math.max;
let min = Math.min;
let floor = Math.floor;

class TextSelectorProp extends DynamicPropertyContainer {
  constructor(elem, data) {
    super();
    this._mdf = false;
    this.k = false;
    this.data = data;
    this.dynamicProperties = [];
    this.elem = elem;
    this.container = elem;
    this.comp = elem.comp;
    this.finalS = 0;
    this.finalE = 0;
    this.s = PropertyFactory.getProp(elem, data.s || {
      k: 0
    }, 0, 0, this);
    if ('e' in data) {
      this.e = PropertyFactory.getProp(elem, data.e, 0, 0, this);
    } else {
      this.e = {
        v: 100
      };
    }
    this.o = PropertyFactory.getProp(elem, data.o || {
      k: 0
    }, 0, 0, this);
    this.xe = PropertyFactory.getProp(elem, data.xe || {
      k: 0
    }, 0, 0, this);
    this.ne = PropertyFactory.getProp(elem, data.ne || {
      k: 0
    }, 0, 0, this);
    this.a = PropertyFactory.getProp(elem, data.a, 0, 0.01, this);
    if (!this.dynamicProperties.length) {
      this.getValue();
    }
  }

  addDynamicProperty= addDynamicProperty

  getMult(ind) {
    if (this._currentTextLength !== this.elem.textProperty.currentData.l.length) {
      this.getValue();
    }
    // let easer = bez.getEasingCurve(this.ne.v/100,0,1-this.xe.v/100,1);
    let easer = BezierFactory.getBezierEasing(this.ne.v / 100, 0, 1 - this.xe.v / 100, 1).get;
    let mult = 0;
    let s = this.finalS;
    let e = this.finalE;
    let type = this.data.sh;
    if (type === 2) {
      if (e === s) {
        mult = ind >= e ? 1 : 0;
      } else {
        mult = max(0, min(0.5 / (e - s) + (ind - s) / (e - s), 1));
      }
      mult = easer(mult);
    } else if (type === 3) {
      if (e === s) {
        mult = ind >= e ? 0 : 1;
      } else {
        mult = 1 - max(0, min(0.5 / (e - s) + (ind - s) / (e - s), 1));
      }

      mult = easer(mult);
    } else if (type === 4) {
      if (e === s) {
        mult = 0;
      } else {
        mult = max(0, min(0.5 / (e - s) + (ind - s) / (e - s), 1));
        if (mult < 0.5) {
          mult *= 2;
        } else {
          mult = 1 - 2 * (mult - 0.5);
        }
      }
      mult = easer(mult);
    } else if (type === 5) {
      if (e === s) {
        mult = 0;
      } else {
        let tot = e - s;
        /* ind += 0.5;
          mult = -4/(tot*tot)*(ind*ind)+(4/tot)*ind; */
        ind = min(max(0, ind + 0.5 - s), e - s);
        let x = -tot / 2 + ind;
        let a = tot / 2;
        mult = Math.sqrt(1 - (x * x) / (a * a));
      }
      mult = easer(mult);
    } else if (type === 6) {
      if (e === s) {
        mult = 0;
      } else {
        ind = min(max(0, ind + 0.5 - s), e - s);
        mult = (1 + (Math.cos((Math.PI + Math.PI * 2 * (ind) / (e - s))))) / 2;
      /*
         ind = Math.min(Math.max(s,ind),e-1);
         mult = (1+(Math.cos((Math.PI+Math.PI*2*(ind-s)/(e-1-s)))))/2;
         mult = Math.max(mult,(1/(e-1-s))/(e-1-s)); */
      }
      mult = easer(mult);
    } else {
      if (ind >= floor(s)) {
        if (ind - s < 0) {
          mult = 1 - (s - ind);
        } else {
          mult = max(0, min(e - ind, 1));
        }
      }
      mult = easer(mult);
    }
    return mult * this.a.v;
  }

  getValue(newCharsFlag) {
    this.iterateDynamicProperties();
    this._mdf = newCharsFlag || this._mdf;
    this._currentTextLength = this.elem.textProperty.currentData.l.length || 0;
    if (newCharsFlag && this.data.r === 2) {
      this.e.v = this._currentTextLength;
    }
    let divisor = this.data.r === 2 ? 1 : 100 / this.data.totalChars;
    let o = this.o.v / divisor;
    let s = this.s.v / divisor + o;
    let e = (this.e.v / divisor) + o;
    if (s > e) {
      let _s = s;
      s = e;
      e = _s;
    }
    this.finalS = s;
    this.finalE = e;
  }
}

class TextSelectorProperty {
  @GetTextSelectorProp
  getTextSelectorProp(elem, data, arr) {
    return new TextSelectorProp(elem, data, arr);
  }
}

export default new TextSelectorProperty();
