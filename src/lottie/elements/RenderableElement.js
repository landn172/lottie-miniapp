class RenderableElement {
  initRenderable() {
    // layer's visibility related to inpoint and outpoint. Rename isVisible to isInRange
    this.isInRange = false;
    // layer's display state
    this.hidden = false;
    // If layer's transparency equals 0, it can be hidden
    this.isTransparent = false;
    // list of animated components
    this.renderableComponents = [];
  }

  addRenderableComponent(component) {
    if (this.renderableComponents.indexOf(component) === -1) {
      this.renderableComponents.push(component);
    }
  }

  removeRenderableComponent(component) {
    if (this.renderableComponents.indexOf(component) !== -1) {
      this.renderableComponents.splice(this.renderableComponents.indexOf(component), 1);
    }
  }

  prepareRenderableFrame(num) {
    this.checkLayerLimits(num);
  }

  checkTransparency() {
    if (this.finalTransform.mProp.o.v <= 0) {
      if (!this.isTransparent && this.globalData.renderConfig.hideOnTransparent) {
        this.isTransparent = true;
        this.hide();
      }
    } else if (this.isTransparent) {
      this.isTransparent = false;
      this.show();
    }
  }

  /**
   * @function
   * Initializes frame related properties.
   *
   * @param {number} num
   * current frame number in Layer's time
   *
   */
  checkLayerLimits(num) {
    if (this.data.ip - this.data.st <= num && this.data.op - this.data.st > num) {
      if (this.isInRange !== true) {
        this.globalData._mdf = true;
        this._mdf = true;
        this.isInRange = true;
        this.show();
      }
    } else if (this.isInRange !== false) {
      this.globalData._mdf = true;
      this.isInRange = false;
      this.hide();
    }
  }

  renderRenderable() {
    let i;
    let len = this.renderableComponents.length;
    for (i = 0; i < len; i += 1) {
      this.renderableComponents[i].renderFrame(this._isFirstFrame);
    }
    /* this.maskManager.renderFrame(this.finalTransform.mat);
    this.renderableEffectsManager.renderFrame(this._isFirstFrame); */
  }

  sourceRectAtTime() {
    return {
      top: 0,
      left: 0,
      width: 100,
      height: 100
    };
  }

  getLayerSize() {
    if (this.data.ty === 5) {
      return {
        w: this.data.textData.width,
        h: this.data.textData.height
      };
    }
    return {
      w: this.data.width,
      h: this.data.height
    };
  }
}

export default RenderableElement;
