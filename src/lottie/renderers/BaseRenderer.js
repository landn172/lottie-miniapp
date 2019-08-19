import { FontManager } from '../utils/FontManager';

class BaseRenderer {
  checkLayers(num) {
    let i;
    let len = this.layers.length;
    let data;
    this.completeLayers = true;
    for (i = len - 1; i >= 0; i--) {
      if (!this.elements[i]) {
        data = this.layers[i];
        if (data.ip - data.st <= (num - this.layers[i].st) && data.op - data.st > (num - this.layers[i].st)) {
          this.buildItem(i);
        }
      }
      this.completeLayers = this.elements[i] ? this.completeLayers : false;
    }
    this.checkPendingElements();
  }

  createItem(layer) {
    switch (layer.ty) {
      case 2:
        return this.createImage(layer);
      case 0:
        return this.createComp(layer);
      case 1:
        return this.createSolid(layer);
      case 3:
        return this.createNull(layer);
      case 4:
        return this.createShape(layer);
      case 5:
        return this.createText(layer);
      case 13:
        return this.createCamera(layer);
      default: break;
    }
    return this.createNull(layer);
  }

  createCamera() {
    throw new Error('You\'re using a 3d camera. Try the html renderer.');
  }

  buildAllItems() {
    let i;
    let len = this.layers.length;
    for (i = 0; i < len; i += 1) {
      this.buildItem(i);
    }
    this.checkPendingElements();
  }

  includeLayers(newLayers) {
    this.completeLayers = false;
    let i;
    let len = newLayers.length;
    let j;
    let jLen = this.layers.length;
    for (i = 0; i < len; i += 1) {
      j = 0;
      while (j < jLen) {
        if (this.layers[j].id === newLayers[i].id) {
          this.layers[j] = newLayers[i];
          break;
        }
        j += 1;
      }
    }
  }

  setProjectInterface(pInterface) {
    this.globalData.projectInterface = pInterface;
  }

  initItems() {
    if (!this.globalData.progressiveLoad) {
      this.buildAllItems();
    }
  }

  buildElementParenting(element, parentName, hierarchy) {
    let elements = this.elements;
    let layers = this.layers;
    let i = 0;
    let len = layers.length;
    while (i < len) {
      if (layers[i].ind === parentName) {
        if (!elements[i] || elements[i] === true) {
          this.buildItem(i);
          this.addPendingElement(element);
        } else {
          hierarchy.push(elements[i]);
          elements[i].setAsParent();
          if (layers[i].parent !== undefined) {
            this.buildElementParenting(element, layers[i].parent, hierarchy);
          } else {
            element.setHierarchy(hierarchy);
          }
        }
      }
      i += 1;
    }
  }

  addPendingElement(element) {
    this.pendingElements.push(element);
  }

  searchExtraCompositions(assets) {
    let i;
    let len = assets.length;
    for (i = 0; i < len; i += 1) {
      if (assets[i].xt) {
        let comp = this.createComp(assets[i]);
        comp.initExpressions();
        this.globalData.projectInterface.registerComposition(comp);
      }
    }
  }

  setupGlobalData(animData, fontsContainer) {
    this.globalData.fontManager = new FontManager();
    this.globalData.fontManager.addChars(animData.chars);
    this.globalData.fontManager.addFonts(animData.fonts, fontsContainer);
    this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
    this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem);
    this.globalData.imageLoader = this.animationItem.imagePreloader;
    this.globalData.frameId = 0;
    this.globalData.frameRate = animData.fr;
    this.globalData.nm = animData.nm;
    this.globalData.compSize = {
      w: animData.w,
      h: animData.h
    };
  }
}

export default BaseRenderer;
