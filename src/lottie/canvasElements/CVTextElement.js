import Mixin from '../utils/mixin';
import CVBaseElement from '../canvasElements/CVBaseElement';
import BaseElement from '../elements/BaseElement';
import TransformElement from '../elements/TransformElement';
import HierarchyElement from '../elements/HierarchyElement';
import FrameElement from '../elements/FrameElement';
import RenderableElement from '../elements/RenderableElement';
import ITextElement from '../elements/TextElement';
import { createTag, createSizedArray } from '../utils/index';

class CVTextElement extends Mixin(BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement, ITextElement) {
  constructor(data, globalData, comp) {
    super();
    this.textSpans = [];
    this.yOffset = 0;
    this.fillColorAnim = false;
    this.strokeColorAnim = false;
    this.strokeWidthAnim = false;
    this.stroke = false;
    this.fill = false;
    this.justifyOffset = 0;
    this.currentRender = null;
    this.renderType = 'canvas';
    this.values = {
      fill: 'rgba(0,0,0,0)',
      stroke: 'rgba(0,0,0,0)',
      sWidth: 0,
      fValue: ''
    };
    this.initElement(data, globalData, comp);
  }

  tHelper = createTag('canvas')

  buildNewText() {
    let documentData = this.textProperty.currentData;
    this.renderedLetters = createSizedArray(documentData.l ? documentData.l.length : 0);

    let hasFill = false;
    if (documentData.fc) {
      hasFill = true;
      this.values.fill = this.buildColor(documentData.fc);
    } else {
      this.values.fill = 'rgba(0,0,0,0)';
    }
    this.fill = hasFill;
    let hasStroke = false;
    if (documentData.sc) {
      hasStroke = true;
      this.values.stroke = this.buildColor(documentData.sc);
      this.values.sWidth = documentData.sw;
    }
    let fontData = this.globalData.fontManager.getFontByName(documentData.f);
    let i;
    let len;
    let letters = documentData.l;
    let matrixHelper = this.mHelper;
    this.stroke = hasStroke;
    this.values.fValue = documentData.finalSize + 'px ' + this.globalData.fontManager.getFontByName(documentData.f).fFamily;
    len = documentData.finalText.length;
    // this.tHelper.font = this.values.fValue;
    let charData;
    let shapeData;
    let k;
    let kLen;
    let shapes;
    let j;
    let jLen;
    let pathNodes;
    let commands;
    let pathArr;
    let singleShape = this.data.singleShape;
    let trackingOffset = documentData.tr / 1000 * documentData.finalSize;
    let xPos = 0;
    let yPos = 0;
    let firstLine = true;
    let cnt = 0;
    for (i = 0; i < len; i += 1) {
      charData = this.globalData.fontManager.getCharData(documentData.finalText[i], fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
      shapeData = charData && charData.data || {};
      matrixHelper.reset();
      if (singleShape && letters[i].n) {
        xPos = -trackingOffset;
        yPos += documentData.yOffset;
        yPos += firstLine ? 1 : 0;
        firstLine = false;
      }

      shapes = shapeData.shapes ? shapeData.shapes[0].it : [];
      jLen = shapes.length;
      matrixHelper.scale(documentData.finalSize / 100, documentData.finalSize / 100);
      if (singleShape) {
        this.applyTextPropertiesToMatrix(documentData, matrixHelper, letters[i].line, xPos, yPos);
      }
      commands = createSizedArray(jLen);
      for (j = 0; j < jLen; j += 1) {
        kLen = shapes[j].ks.k.i.length;
        pathNodes = shapes[j].ks.k;
        pathArr = [];
        for (k = 1; k < kLen; k += 1) {
          if (k === 1) {
            pathArr.push(matrixHelper.applyToX(pathNodes.v[0][0], pathNodes.v[0][1], 0), matrixHelper.applyToY(pathNodes.v[0][0], pathNodes.v[0][1], 0));
          }
          pathArr.push(matrixHelper.applyToX(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToY(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToX(pathNodes.i[k][0], pathNodes.i[k][1], 0), matrixHelper.applyToY(pathNodes.i[k][0], pathNodes.i[k][1], 0), matrixHelper.applyToX(pathNodes.v[k][0], pathNodes.v[k][1], 0), matrixHelper.applyToY(pathNodes.v[k][0], pathNodes.v[k][1], 0));
        }
        pathArr.push(matrixHelper.applyToX(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToY(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToX(pathNodes.i[0][0], pathNodes.i[0][1], 0), matrixHelper.applyToY(pathNodes.i[0][0], pathNodes.i[0][1], 0), matrixHelper.applyToX(pathNodes.v[0][0], pathNodes.v[0][1], 0), matrixHelper.applyToY(pathNodes.v[0][0], pathNodes.v[0][1], 0));
        commands[j] = pathArr;
      }
      if (singleShape) {
        xPos += letters[i].l;
        xPos += trackingOffset;
      }
      if (this.textSpans[cnt]) {
        this.textSpans[cnt].elem = commands;
      } else {
        this.textSpans[cnt] = {
          elem: commands
        };
      }
      cnt += 1;
    }
  }

  renderInnerContent() {
    let ctx = this.canvasContext;
    // let finalMat = this.finalTransform.mat.props;
    ctx.font = this.values.fValue;
    ctx.setLineCap('butt');
    ctx.setLineJoin('miter');
    ctx.setMiterLimit(4);

    if (!this.data.singleShape) {
      this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag);
    }

    let i;
    let len;
    let j;
    let jLen;
    let k;
    let kLen;
    let renderedLetters = this.textAnimator.renderedLetters;

    let letters = this.textProperty.currentData.l;

    len = letters.length;
    let renderedLetter;
    let lastFill = null;
    let lastStroke = null;
    let lastStrokeW = null;
    let commands;
    let pathArr;
    for (i = 0; i < len; i += 1) {
      if (letters[i].n) {
        continue;
      }
      renderedLetter = renderedLetters[i];
      if (renderedLetter) {
        this.globalData.renderer.save();
        this.globalData.renderer.ctxTransform(renderedLetter.p);
        this.globalData.renderer.ctxOpacity(renderedLetter.o);
      }
      if (this.fill) {
        if (renderedLetter && renderedLetter.fc) {
          if (lastFill !== renderedLetter.fc) {
            lastFill = renderedLetter.fc;
            ctx.setFillStyle(renderedLetter.fc);
          }
        } else if (lastFill !== this.values.fill) {
          lastFill = this.values.fill;
          ctx.setFillStyle(this.values.fill);
        }
        commands = this.textSpans[i].elem;
        jLen = commands.length;
        this.globalData.canvasContext.beginPath();
        for (j = 0; j < jLen; j += 1) {
          pathArr = commands[j];
          kLen = pathArr.length;
          this.globalData.canvasContext.moveTo(pathArr[0], pathArr[1]);
          for (k = 2; k < kLen; k += 6) {
            this.globalData.canvasContext.bezierCurveTo(pathArr[k], pathArr[k + 1], pathArr[k + 2], pathArr[k + 3], pathArr[k + 4], pathArr[k + 5]);
          }
        }
        this.globalData.canvasContext.closePath();
        this.globalData.canvasContext.fill();
      // /ctx.fillText(this.textSpans[i].val,0,0);
      }
      if (this.stroke) {
        if (renderedLetter && renderedLetter.sw) {
          if (lastStrokeW !== renderedLetter.sw) {
            lastStrokeW = renderedLetter.sw;
            ctx.setLineWidth(renderedLetter.sw);
          }
        } else if (lastStrokeW !== this.values.sWidth) {
          lastStrokeW = this.values.sWidth;
          ctx.setLineWidth(this.values.sWidth);
        }
        if (renderedLetter && renderedLetter.sc) {
          if (lastStroke !== renderedLetter.sc) {
            lastStroke = renderedLetter.sc;
            ctx.setStrokeStyle(renderedLetter.sc);
          }
        } else if (lastStroke !== this.values.stroke) {
          lastStroke = this.values.stroke;
          ctx.setStrokeStyle(this.values.stroke);
        }
        commands = this.textSpans[i].elem;
        jLen = commands.length;
        this.globalData.canvasContext.beginPath();
        for (j = 0; j < jLen; j += 1) {
          pathArr = commands[j];
          kLen = pathArr.length;
          this.globalData.canvasContext.moveTo(pathArr[0], pathArr[1]);
          for (k = 2; k < kLen; k += 6) {
            this.globalData.canvasContext.bezierCurveTo(pathArr[k], pathArr[k + 1], pathArr[k + 2], pathArr[k + 3], pathArr[k + 4], pathArr[k + 5]);
          }
        }
        this.globalData.canvasContext.closePath();
        this.globalData.canvasContext.stroke();
      // /ctx.strokeText(letters[i].val,0,0);
      }
      if (renderedLetter) {
        this.globalData.renderer.restore();
      }
      // ctx.draw(true);
    }
  /* if(this.data.hasMask){
   this.globalData.renderer.restore(true);
   } */
  }
}

export default CVTextElement;
