class DynamicPropertyContainer {
  addDynamicProperty(prop) {
    if (this.dynamicProperties.indexOf(prop) === -1) {
      this.dynamicProperties.push(prop);
      this.container.addDynamicProperty(this);
      this._isAnimated = true;
    }
  }

  iterateDynamicProperties() {
    this._mdf = false;
    let i;
    let len = this.dynamicProperties.length;
    for (i = 0; i < len; i += 1) {
      this.dynamicProperties[i].getValue();
      if (this.dynamicProperties[i]._mdf) {
        this._mdf = true;
      }
    }
  }

  initDynamicPropertyContainer(container) {
    this.container = container;
    this.dynamicProperties = [];
    this._mdf = false;
    this._isAnimated = false;
  }
}

export default DynamicPropertyContainer;
