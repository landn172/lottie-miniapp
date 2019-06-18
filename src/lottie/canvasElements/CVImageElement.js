import CVBaseElement from '../canvasElements/CVBaseElement';
import BaseElement from '../elements/BaseElement';
import FrameElement from '../elements/FrameElement';
import HierarchyElement from '../elements/HierarchyElement';
import IImageElement from '../elements/ImageElement';
import RenderableElement from '../elements/RenderableElement';
import TransformElement from '../elements/TransformElement';
import Mixin from '../utils/mixin';

class CVImageElement extends Mixin(BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement) {
  constructor(data, globalData, comp) {
    super();
    this.failed = false;
    this.assetData = globalData.getAssetData(data.refId);
    this.img = globalData.imageLoader.getImage(this.assetData);
    this.initElement(data, globalData, comp);
    // this.globalData.addPendingElement();
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

  prepareFrame=IImageElement.prototype.prepareFrame

  createContent() {
    // 压缩图片比例
    // if (this.assetData.w !== this.img.width || this.assetData.h !== this.img.height) {
    //   let canvas = createTag('canvas');
    //   canvas.width = this.assetData.w;
    //   canvas.height = this.assetData.h;
    //   let ctx = canvas.getContext('2d');

    //   let imgW = this.img.width;
    //   let imgH = this.img.height;
    //   let imgRel = imgW / imgH;
    //   let canvasRel = this.assetData.w / this.assetData.h;
    //   let widthCrop;
    //   let heightCrop;
    //   if (imgRel > canvasRel) {
    //     heightCrop = imgH;
    //     widthCrop = heightCrop * canvasRel;
    //   } else {
    //     widthCrop = imgW;
    //     heightCrop = widthCrop / canvasRel;
    //   }
    //   ctx.drawImage(this.img, (imgW - widthCrop) / 2, (imgH - heightCrop) / 2, widthCrop, heightCrop, 0, 0, this.assetData.w, this.assetData.h);
    //   this.img = canvas;
    // }
  }

  renderInnerContent() {
    if (this.failed) {
      return;
    }
    this.canvasContext.drawImage(this.img.src || this.img, 0, 0);
  }

  destroy() {
    this.img = null;
  }
}

export default CVImageElement;
