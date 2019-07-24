import Mixin from '../utils/mixin';
import BaseElement from '../elements/BaseElement';
import TransformElement from '../elements/TransformElement';
import HierarchyElement from '../elements/HierarchyElement';
import FrameElement from '../elements/FrameElement';

class NullElement extends Mixin(BaseElement, TransformElement, HierarchyElement, FrameElement) {
  constructor(data, globalData, comp) {
    super();
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.initFrame();
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
  }

  prepareFrame(num) {
    this.prepareProperties(num, true);
  }

  renderFrame() {}

  getBaseElement() {
    return null;
  }

  destroy() {}

  sourceRectAtTime() {}

  hide() {}
}

export default NullElement;
