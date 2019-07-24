import RenderableElement from './RenderableElement';

class RenderableDOMElement extends RenderableElement {
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

  hide() {}

  show() {}

  renderFrame() {
    // If it is exported as hidden (data.hd === true) no need to render
    // If it is not visible no need to render
    if (this.data.hd || this.hidden) {
      return;
    }
    this.renderTransform();
    this.renderRenderable();
    this.renderElement();
    this.renderInnerContent();
    if (this._isFirstFrame) {
      this._isFirstFrame = false;
    }
  }

  renderInnerContent() {}

  prepareFrame(num) {
    this._mdf = false;
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);
    this.checkTransparency();
  }

  destroy() {
    this.innerElem = null;
    this.destroyBaseElement();
  }
}

export default RenderableDOMElement;
