import Mixin from '../utils/mixin';
import BaseElement from './BaseElement';
import TransformElement from './TransformElement';
import HierarchyElement from './HierarchyElement';
import FrameElement from './FrameElement';
import RenderableDOMElement from './RenderableDOMElement';

class ICompElement extends Mixin(BaseElement, TransformElement, HierarchyElement, FrameElement, RenderableDOMElement) {
  initElement(data, globalData, comp) {
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.initTransform(data, globalData, comp);
    this.initRenderable();
    this.initHierarchy();
    this.initRendererElement();
    this.createContainerElements();
    this.addMasks();
    if (this.data.xt || !globalData.progressiveLoad) {
      this.buildAllItems();
    }
    this.hide();
  }

  prepareFrame(num) {
    this._mdf = false;
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);
    if (!this.isInRange && !this.data.xt) {
      return;
    }

    if (!this.tm._placeholder) {
      let timeRemapped = this.tm.v;
      if (timeRemapped === this.data.op) {
        timeRemapped = this.data.op - 1;
      }
      this.renderedFrame = timeRemapped;
    } else {
      this.renderedFrame = num / this.data.sr;
    }
    let i;
    let len = this.elements.length;
    if (!this.completeLayers) {
      this.checkLayers(this.renderedFrame);
    }
    // This iteration needs to be backwards because of how expressions connect between each other
    for (i = len - 1; i >= 0; i -= 1) {
      if (this.completeLayers || this.elements[i]) {
        this.elements[i].prepareFrame(this.renderedFrame - this.layers[i].st);
        if (this.elements[i]._mdf) {
          this._mdf = true;
        }
      }
    }
  }

  renderInnerContent() {
    let i;
    let len = this.layers.length;
    for (i = 0; i < len; i += 1) {
      if (this.completeLayers || this.elements[i]) {
        this.elements[i].renderFrame();
      }
    }
  }

  setElements(elems) {
    this.elements = elems;
  }

  getElements() {
    return this.elements;
  }

  destroyElements() {
    let i;
    let len = this.layers.length;
    for (i = 0; i < len; i += 1) {
      if (this.elements[i]) {
        this.elements[i].destroy();
      }
    }
  }

  destroy() {
    this.destroyElements();
    this.destroyBaseElement();
  }
}

export default ICompElement;
