import IImageElement from '../elements/ImageElement';

class CVSolidElement {
  constructor(data, globalData, comp) {
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

  prepareFrame =IImageElement.prototype.prepareFrame
  renderInnerContent() {
    let ctx = this.canvasContext;
    ctx.setFillStyle(this.data.sc);
    ctx.fillRect(0, 0, this.data.sw, this.data.sh);
    // ctx.draw(true);
  }
}

export default CVSolidElement;
