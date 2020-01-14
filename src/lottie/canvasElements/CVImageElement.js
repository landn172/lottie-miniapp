import CVBaseElement from '../canvasElements/CVBaseElement';
import BaseElement from '../elements/BaseElement';
import FrameElement from '../elements/FrameElement';
import HierarchyElement from '../elements/HierarchyElement';
import IImageElement from '../elements/ImageElement';
import RenderableElement from '../elements/RenderableElement';
import TransformElement from '../elements/TransformElement';
import RenderableDOMElement from '../elements/RenderableDOMElement';
import Mixin from '../utils/mixin';

class CVImageElement extends Mixin(BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement) {
  constructor(data, globalData, comp) {
    super();
    this.failed = false;
    this.assetData = globalData.getAssetData(data.refId);
    this.img = globalData.imageLoader.getImage(this.assetData);
    // this.globalData.addPendingElement();
    // 指向CanvasRenderer
    this.renderer = comp;
    this.initElement(data, globalData, comp);
  }

  // SVGShapeElement.prototype.initElement
  initElement = RenderableDOMElement.prototype.initElement

  prepareFrame = IImageElement.prototype.prepareFrame

  createContent() {
    // 小程序暂不支持裁剪
  }

  renderInnerContent() {
    if (this.failed || !this.img.src) {
      return;
    }

    if (this.img.src instanceof Uint8ClampedArray) {
      this.canvasContext.canvasPutImageData({
        canvasId: this.canvasContext.canvasId || '',
        data: this.img.src,
        x: 0,
        y: 0
      });
      return;
    }

    // fix 宽高不同，导致绘制差异
    if (this.img.width && (this.assetData.w !== this.img.width || this.assetData.h !== this.img.height)) {
      this.canvasContext.drawImage(this.img.src || this.img, 0, 0, this.assetData.w, this.assetData.h);
      return;
    }

    this.canvasContext.drawImage(this.img.src || this.img, 0, 0);
  }

  destroy() {
    this.img = null;
  }
}

export default CVImageElement;
