// import RenderableDOMElement from '../elements/RenderableDOMElement';
import Mixin from '../utils/mixin';
import BaseElement from '../elements/BaseElement';
import TransformElement from '../elements/TransformElement';
import CVBaseElement from '../canvasElements/CVBaseElement';
import HierarchyElement from '../elements/HierarchyElement';
import FrameElement from '../elements/FrameElement';
import RenderableElement from '../elements/RenderableElement';
import IImageElement from '../elements/ImageElement';

class CVSolidElement extends Mixin(BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement) {
  constructor(data, globalData, comp) {
    super();
    this.initElement(data, globalData, comp);
  }

  initElement(data, globalData, comp) {
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
    this.initRenderable();
    this.initRendererElement();
    this.createContainerElements();
    this.addMasks();
    this.createContent();
    this.hide();
  }

  prepareFrame = IImageElement.prototype.prepareFrame

  renderInnerContent() {
    let ctx = this.canvasContext;
    ctx.setFillStyle(this.data.sc);
    ctx.fillRect(0, 0, this.data.sw, this.data.sh);
  }
}

export default CVSolidElement;
