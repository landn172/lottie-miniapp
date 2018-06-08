import Mixin from '../utils/mixin';
import ICompElement from '../elements/CompElement';
import CVBaseElement from './CVBaseElement';
import PropertyFactory from '../utils/PropertyFactory';

let CVCompElementClass;

export default (CanvasRenderer) => {
  if (CVCompElementClass) return CVCompElementClass;
  CVCompElementClass = class CVCompElement extends Mixin(CanvasRenderer, ICompElement, CVBaseElement) {
    constructor(data, globalData, comp) {
      super();
      this.completeLayers = false;
      this.layers = data.layers || [];
      this.pendingElements = [];
      this.elements = Array.apply(null, {
        length: this.layers.length
      });
      this.initElement(data, globalData, comp);
      this.tm = data.tm ? PropertyFactory.getProp(this, data.tm, 0, globalData.frameRate, this) : {
        _placeholder: true
      };
    }

    renderInnerContent() {
      let i;
      let len = this.layers.length;
      for (i = len - 1; i >= 0; i -= 1) {
        if (this.completeLayers || this.elements[i]) {
          this.elements[i].renderFrame();
        }
      }
    }

    destroy() {
      let i;
      let len = this.layers.length;
      for (i = len - 1; i >= 0; i -= 1) {
        if (this.elements[i]) {
          this.elements[i].destroy();
        }
      }
      this.layers = null;
      this.elements = null;
    }
  };
  return CVCompElementClass;
};
