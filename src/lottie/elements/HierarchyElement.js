class HierarchyElement {
  /**
     * @function
     * Initializes hierarchy properties
     *
     */
  initHierarchy() {
    // element's parent list
    this.hierarchy = [];
    // if element is parent of another layer _isParent will be true
    this._isParent = false;
    this.checkParenting();
  }

  /**
     * @function
     * Sets layer's hierarchy.
     * @param {array} hierarch
     * layer's parent list
     *
     */
  setHierarchy(hierarchy) {
    this.hierarchy = hierarchy;
  }

  /**
     * @function
     * Sets layer as parent.
     *
     */
  setAsParent() {
    this._isParent = true;
  }

  /**
     * @function
     * Searches layer's parenting chain
     *
     */
  checkParenting() {
    if (this.data.parent !== undefined) {
      this.comp.buildElementParenting(this, this.data.parent, []);
    }
  }
}

export default HierarchyElement;
