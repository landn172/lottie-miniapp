import LetterProps from '../utils/LetterProps';
import TextProperty from '../utils/text/TextProperty';
import TextAnimatorProperty from '../utils/text/TextAnimatorProperty';
import buildShapeString from '../shapes/buildShapeString';

class ITextElement {
  initElement(data, globalData, comp) {
    this.lettersChangedFlag = true;
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.textProperty = new TextProperty(this, data.t, this.dynamicProperties);
    this.textAnimator = new TextAnimatorProperty(data.t, this.renderType, this);
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
    this.initRenderable();
    this.initRendererElement();
    this.createContainerElements();
    this.addMasks();
    this.createContent();
    this.hide();
    this.textAnimator.searchProperties(this.dynamicProperties);
  }

  prepareFrame(num) {
    this._mdf = false;
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);
    if (this.textProperty._mdf || this.textProperty._isFirstFrame) {
      this.buildNewText();
      this.textProperty._isFirstFrame = false;
      this.textProperty._mdf = false;
    }
  }

  createPathShape(matrixHelper, shapes) {
    let j;
    let jLen = shapes.length;
    // let k;
    // let kLen;
    let pathNodes;
    let shapeStr = '';
    for (j = 0; j < jLen; j += 1) {
      pathNodes = shapes[j].ks.k;
      shapeStr += buildShapeString(pathNodes, pathNodes.i.length, true, matrixHelper);
    }
    return shapeStr;
  }

  updateDocumentData(newData, index) {
    this.textProperty.updateDocumentData(newData, index);
  }

  canResizeFont(_canResize) {
    this.textProperty.canResizeFont(_canResize);
  }

  setMinimumFontSize(_fontSize) {
    this.textProperty.setMinimumFontSize(_fontSize);
  }

  applyTextPropertiesToMatrix(documentData, matrixHelper, lineNumber, xPos, yPos) {
    if (documentData.ps) {
      matrixHelper.translate(documentData.ps[0], documentData.ps[1] + documentData.ascent, 0);
    }
    matrixHelper.translate(0, -documentData.ls, 0);
    switch (documentData.j) {
      case 1:
        matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]), 0, 0);
        break;
      case 2:
        matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]) / 2, 0, 0);
        break;
      default: break;
    }
    matrixHelper.translate(xPos, yPos, 0);
  }

  buildColor(colorData) {
    return 'rgb(' + Math.round(colorData[0] * 255) + ',' + Math.round(colorData[1] * 255) + ',' + Math.round(colorData[2] * 255) + ')';
  }

  emptyProp = new LetterProps()

  destroy() {}
}

export default ITextElement;
