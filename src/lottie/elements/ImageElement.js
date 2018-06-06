import Mixin from '../utils/mixin';
import BaseElement from '../elements/BaseElement';
import TransformElement from '../elements/TransformElement';
import HierarchyElement from '../elements/HierarchyElement';
import FrameElement from '../elements/FrameElement';
import SVGBaseElement from '../elements/SVGBaseElement';
import RenderableDOMElement from '../elements/RenderableDOMElement';

class IImageElement extends Mixin(BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement) {
  constructor(data, globalData, comp) {
    super();
    this.assetData = globalData.getAssetData(data.refId);
    this.initElement(data, globalData, comp);
  }

  createContent() {
    console.warn('createContent');
  }
}

export default IImageElement;
