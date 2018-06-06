import IImageElement from '../elements/ImageElement';
import { createTag } from '../utils/index';

class CVImageElement {
  constructor(data, globalData, comp) {
    this.failed = false;
    this.img = {};
    this.assetData = globalData.getAssetData(data.refId);
    this.initElement(data, globalData, comp);
    this.globalData.addPendingElement();
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

  imageLoaded() {
    this.globalData.elementLoaded();
    // 压缩图片比例
    if (this.assetData.w !== this.img.width || this.assetData.h !== this.img.height) {
      let canvas = createTag('canvas');
      canvas.width = this.assetData.w;
      canvas.height = this.assetData.h;
      let ctx = canvas.getContext('2d');

      let imgW = this.img.width;
      let imgH = this.img.height;
      let imgRel = imgW / imgH;
      let canvasRel = this.assetData.w / this.assetData.h;
      let widthCrop;
      let heightCrop;
      if (imgRel > canvasRel) {
        heightCrop = imgH;
        widthCrop = heightCrop * canvasRel;
      } else {
        widthCrop = imgW;
        heightCrop = widthCrop / canvasRel;
      }
      ctx.drawImage(this.img, (imgW - widthCrop) / 2, (imgH - heightCrop) / 2, widthCrop, heightCrop, 0, 0, this.assetData.w, this.assetData.h);
      this.img = canvas;
    }
  }

  imageFailed() {
    this.failed = true;
    this.globalData.elementLoaded();
  }

  createContent() {
    let assetPath = this.globalData.getAssetsPath(this.assetData);
    wx.downloadFile({
      url: assetPath,
      success: (res) => {
        wx.getImageInfo({
          src: res.tempFilePath,
          success: ({ width, height }) => {
            this.img.src = res.tempFilePath;
            this.img.width = width;
            this.img.height = height;
            this.imageLoaded();
          }
        });
      },
      fail() {
        this.imageFailed();
      }
    });
  }

  renderInnerContent() {
    if (this.failed) {
      return;
    }
    this.canvasContext.drawImage(this.img.src, 0, 0);
  }

  destroy() {
    this.img = null;
  }
}

export default CVImageElement;
