import Matrix from '../3rd_party/transformation-matrix';
import PropertyFactory from '../utils/PropertyFactory';
import TransformPropertyFactory from '../utils/TransformProperty';
import CVShapeData from '../shapes/CVShapeData';
import Mixin from '../utils/mixin';
import CVBaseElement from '../canvasElements/CVBaseElement';
import BaseElement from '../elements/BaseElement';
import TransformElement from '../elements/TransformElement';
import IShapeElement from '../elements/ShapeElement';
import HierarchyElement from '../elements/HierarchyElement';
import FrameElement from '../elements/FrameElement';
import RenderableElement from '../elements/RenderableElement';
import { bm_floor } from '../utils/common';
import DashProperty from '../shapes/DashProperty';
import ShapeModifiers from '../shapes/ShapeModifiers';
import RoundCornersModifier from '../shapes/RoundCornersModifier';
import MouseModifier from '../shapes/MouseModifier';
import RepeaterModifier from '../shapes/RepeaterModifier';
import TrimModifier from '../shapes/TrimModifier';

ShapeModifiers.registerModifier('rd', RoundCornersModifier);
ShapeModifiers.registerModifier('ms', MouseModifier);
ShapeModifiers.registerModifier('rp', RepeaterModifier);
ShapeModifiers.registerModifier('tm', TrimModifier);

class CVShapeElement extends Mixin(BaseElement, TransformElement, CVBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableElement) {
  constructor(data, globalData, comp) {
    super();
    this.shapes = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.itemsData = [];
    this.prevViewData = [];
    this.shapeModifiers = [];
    this.processedElements = [];
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

  transformHelper = {
    opacity: 1,
    mat: new Matrix(),
    _matMdf: false,
    _opMdf: false
  }

  dashResetter = []

  createContent() {
    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true);
  }

  createStyleElement(data) {
    let styleElem = {
      data: data,
      type: data.ty,
      elements: []
    };
    let elementData = {};
    if (data.ty === 'fl' || data.ty === 'st') {
      elementData.c = PropertyFactory.getProp(this, data.c, 1, 255, this);
      if (!elementData.c.k) {
        styleElem.co = 'rgb(' + bm_floor(elementData.c.v[0]) + ',' + bm_floor(elementData.c.v[1]) + ',' + bm_floor(elementData.c.v[2]) + ')';
      }
    }
    elementData.o = PropertyFactory.getProp(this, data.o, 0, 0.01, this);
    if (data.ty === 'st') {
      styleElem.lc = this.lcEnum[data.lc] || 'round';
      styleElem.lj = this.ljEnum[data.lj] || 'round';
      if (data.lj === 1) {
        styleElem.ml = data.ml;
      }
      elementData.w = PropertyFactory.getProp(this, data.w, 0, null, this);
      if (!elementData.w.k) {
        styleElem.wi = elementData.w.v;
      }
      if (data.d) {
        let d = new DashProperty(this, data.d, 'canvas');
        elementData.d = d;
        if (!elementData.d.k) {
          styleElem.da = elementData.d.dashArray;
          styleElem.do = elementData.d.dashoffset[0];
        }
      }
    } else {
      styleElem.r = data.r === 2 ? 'evenodd' : 'nonzero';
    }
    this.stylesList.push(styleElem);
    elementData.style = styleElem;
    return elementData;
  }

  createGroupElement() {
    let elementData = {
      it: [],
      prevViewData: []
    };
    return elementData;
  }

  createTransformElement(data) {
    let elementData = {
      transform: {
        mat: new Matrix(),
        opacity: 1,
        _matMdf: false,
        _opMdf: false,
        op: PropertyFactory.getProp(this, data.o, 0, 0.01, this),
        mProps: TransformPropertyFactory.getTransformProperty(this, data, this)
      },
      elements: []
    };
    return elementData;
  }

  createShapeElement(data) {
    let elementData = new CVShapeData(this, data);

    this.shapes.push(elementData);
    this.addShapeToModifiers(elementData);
    let j;
    const jLen = this.stylesList.length;
    let hasStrokes = false;
    let hasFills = false;
    for (j = 0; j < jLen; j += 1) {
      if (!this.stylesList[j].closed) {
        this.stylesList[j].elements.push(elementData);
        if (this.stylesList[j].type === 'st') {
          hasStrokes = true;
        } else {
          hasFills = true;
        }
      }
    }
    elementData.st = hasStrokes;
    elementData.fl = hasFills;
    return elementData;
  }

  reloadShapes() {
    this._isFirstFrame = true;
    let i;
    let len = this.itemsData.length;
    for (i = 0; i < len; i += 1) {
      this.prevViewData[i] = this.itemsData[i];
    }
    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true);
    len = this.dynamicProperties.length;
    for (i = 0; i < len; i += 1) {
      this.dynamicProperties[i].getValue();
    }
    this.renderModifiers();
  }

  searchShapes(arr, itemsData, prevViewData, render) {
    let i;
    let len = arr.length - 1;
    let j;
    let jLen;
    let ownArrays = [];
    let ownModifiers = [];
    let processedPos;
    let modifier;
    for (i = len; i >= 0; i -= 1) {
      processedPos = this.searchProcessedElement(arr[i]);
      if (!processedPos) {
        arr[i]._render = render;
      } else {
        itemsData[i] = prevViewData[processedPos - 1];
      }
      if (arr[i].ty === 'fl' || arr[i].ty === 'st') {
        if (!processedPos) {
          itemsData[i] = this.createStyleElement(arr[i]);
        } else {
          itemsData[i].style.closed = false;
        }

        ownArrays.push(itemsData[i].style);
      } else if (arr[i].ty === 'gr') {
        if (!processedPos) {
          itemsData[i] = this.createGroupElement(arr[i]);
        } else {
          jLen = itemsData[i].it.length;
          for (j = 0; j < jLen; j += 1) {
            itemsData[i].prevViewData[j] = itemsData[i].it[j];
          }
        }
        this.searchShapes(arr[i].it, itemsData[i].it, itemsData[i].prevViewData, render);
      } else if (arr[i].ty === 'tr') {
        if (!processedPos) {
          itemsData[i] = this.createTransformElement(arr[i]);
        }
      } else if (arr[i].ty === 'sh' || arr[i].ty === 'rc' || arr[i].ty === 'el' || arr[i].ty === 'sr') {
        if (!processedPos) {
          itemsData[i] = this.createShapeElement(arr[i]);
        }
      } else if (arr[i].ty === 'tm' || arr[i].ty === 'rd') {
        if (!processedPos) {
          modifier = ShapeModifiers.getModifier(arr[i].ty);
          modifier.init(this, arr[i]);
          itemsData[i] = modifier;
          this.shapeModifiers.push(modifier);
        } else {
          modifier = itemsData[i];
          modifier.closed = false;
        }
        ownModifiers.push(modifier);
      } else if (arr[i].ty === 'rp') {
        if (!processedPos) {
          modifier = this.ShapeModifiers.getModifier(arr[i].ty);
          itemsData[i] = modifier;
          modifier.init(this, arr, i, itemsData);
          this.shapeModifiers.push(modifier);
          render = false;
        } else {
          modifier = itemsData[i];
          modifier.closed = true;
        }
        ownModifiers.push(modifier);
      }
      this.addProcessedElement(arr[i], i + 1);
    }
    len = ownArrays.length;
    for (i = 0; i < len; i += 1) {
      ownArrays[i].closed = true;
    }
    len = ownModifiers.length;
    for (i = 0; i < len; i += 1) {
      ownModifiers[i].closed = true;
    }
  }

  renderInnerContent() {
    this.transformHelper.mat.reset();
    this.transformHelper.opacity = 1;
    this.transformHelper._matMdf = false;
    this.transformHelper._opMdf = false;
    this.renderModifiers();
    this.renderShape(this.transformHelper, this.shapesData, this.itemsData, true);
  }

  renderShapeTransform(parentTransform, groupTransform) {
    let props;
    let groupMatrix;
    if (parentTransform._opMdf || groupTransform.op._mdf || this._isFirstFrame) {
      groupTransform.opacity = parentTransform.opacity;
      groupTransform.opacity *= groupTransform.op.v;
      groupTransform._opMdf = true;
    }
    if (parentTransform._matMdf || groupTransform.mProps._mdf || this._isFirstFrame) {
      groupMatrix = groupTransform.mat;
      groupMatrix.cloneFromProps(groupTransform.mProps.v.props);
      groupTransform._matMdf = true;
      props = parentTransform.mat.props;
      groupMatrix.transform(props[0], props[1], props[2], props[3], props[4], props[5], props[6], props[7], props[8], props[9], props[10], props[11], props[12], props[13], props[14], props[15]);
    }
  }

  drawLayer() {
    let i;
    let len = this.stylesList.length;
    let j;
    let jLen;
    let k;
    let kLen;
    let elems;
    let nodes;
    let renderer = this.globalData.renderer;
    let ctx = this.globalData.canvasContext;
    let type;
    let currentStyle;

    // const isFirstFrame = this._isFirstFrame;

    for (i = 0; i < len; i += 1) {
      currentStyle = this.stylesList[i];
      type = currentStyle.type;
      if ((type === 'st' && currentStyle.wi === 0) || !currentStyle.data._render || currentStyle.coOp === 0) {
        continue;
      }
      renderer.save();
      elems = currentStyle.elements;
      if (type === 'st') {
        ctx.setStrokeStyle(currentStyle.co);
        ctx.setLineWidth(currentStyle.wi);
        ctx.setLineCap(currentStyle.lc);
        ctx.setLineJoin(currentStyle.lj);
        ctx.setMiterLimit(currentStyle.ml || 0);
      } else {
        ctx.setFillStyle(currentStyle.co);
      }
      renderer.ctxOpacity(currentStyle.coOp);
      if (this.globalData.currentGlobalAlpha !== 0) {
        if (type !== 'st') {
          ctx.beginPath();
        }
        jLen = elems.length;
        for (j = 0; j < jLen; j += 1) {
          if (type === 'st') {
            ctx.beginPath();
            if (currentStyle.da) {
              ctx.setLineDash(currentStyle.da);
              ctx.lineDashOffset = currentStyle.do;
              this.globalData.isDashed = true;
            } else if (this.globalData.isDashed) {
              ctx.setLineDash(this.dashResetter);
              this.globalData.isDashed = false;
            }
          }
          nodes = elems[j].trNodes;
          kLen = nodes.length;

          for (k = 0; k < kLen; k += 1) {
            if (nodes[k].t === 'm') {
              ctx.moveTo(nodes[k].p[0], nodes[k].p[1]);
            } else if (nodes[k].t === 'c') {
              ctx.bezierCurveTo(nodes[k].pts[0], nodes[k].pts[1], nodes[k].pts[2], nodes[k].pts[3], nodes[k].pts[4], nodes[k].pts[5]);
            } else {
              ctx.closePath();
            }
          }
          if (type === 'st') {
            ctx.stroke();
          // ctx.draw(true);
          }
        }
        if (type !== 'st') {
          ctx.fill(currentStyle.r);
        // ctx.draw(true);
        }
      }

      renderer.restore();
    }
  }


  renderShape(parentTransform, items, data, isMain) {
    let i;
    let len = items.length - 1;
    let groupTransform;
    groupTransform = parentTransform;
    for (i = len; i >= 0; i -= 1) {
      if (items[i].ty === 'tr') {
        groupTransform = data[i].transform;
        this.renderShapeTransform(parentTransform, groupTransform);
      } else if (items[i].ty === 'sh' || items[i].ty === 'el' || items[i].ty === 'rc' || items[i].ty === 'sr') {
        this.renderPath(items[i], data[i], groupTransform);
      } else if (items[i].ty === 'fl') {
        this.renderFill(items[i], data[i], groupTransform);
      } else if (items[i].ty === 'st') {
        this.renderStroke(items[i], data[i], groupTransform);
      } else if (items[i].ty === 'gr') {
        this.renderShape(groupTransform, items[i].it, data[i].it);
      } else if (items[i].ty === 'tm') {
        //
      }
    }
    if (isMain) {
      this.drawLayer();
    }
  }

  renderPath(pathData, itemData, groupTransform) {
    let len;
    let i;
    let j;
    let jLen;
    let redraw = groupTransform._matMdf || itemData.sh._mdf || this._isFirstFrame;
    if (redraw) {
      let paths = itemData.sh.paths;
      let groupTransformMat = groupTransform.mat;
      jLen = pathData._render === false ? 0 : paths._length;
      let pathStringTransformed = itemData.trNodes;
      pathStringTransformed.length = 0;
      for (j = 0; j < jLen; j += 1) {
        let pathNodes = paths.shapes[j];
        if (pathNodes && pathNodes.v) {
          len = pathNodes._length;
          for (i = 1; i < len; i += 1) {
            if (i === 1) {
              pathStringTransformed.push({
                t: 'm',
                p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
              });
            }
            pathStringTransformed.push({
              t: 'c',
              pts: groupTransformMat.applyToTriplePoints(pathNodes.o[i - 1], pathNodes.i[i], pathNodes.v[i])
            });
          }
          if (len === 1) {
            pathStringTransformed.push({
              t: 'm',
              p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
            });
          }
          if (pathNodes.c && len) {
            pathStringTransformed.push({
              t: 'c',
              pts: groupTransformMat.applyToTriplePoints(pathNodes.o[i - 1], pathNodes.i[0], pathNodes.v[0])
            });
            pathStringTransformed.push({
              t: 'z'
            });
          }
          itemData.lStr = pathStringTransformed;
        }
      }

      if (itemData.st) {
        for (i = 0; i < 16; i += 1) {
          itemData.tr[i] = groupTransform.mat.props[i];
        }
      }
      itemData.trNodes = pathStringTransformed;
    }
  }

  renderFill(styleData, itemData, groupTransform) {
    let styleElem = itemData.style;

    if (itemData.c._mdf || this._isFirstFrame) {
      styleElem.co = 'rgb(' + bm_floor(itemData.c.v[0]) + ',' + bm_floor(itemData.c.v[1]) + ',' + bm_floor(itemData.c.v[2]) + ')';
    }
    if (itemData.o._mdf || groupTransform._opMdf || this._isFirstFrame) {
      styleElem.coOp = itemData.o.v * groupTransform.opacity;
    }
  }

  renderStroke(styleData, itemData, groupTransform) {
    let styleElem = itemData.style;
    let d = itemData.d;
    if (d && (d._mdf || this._isFirstFrame)) {
      styleElem.da = d.dashArray;
      styleElem.do = d.dashoffset[0];
    }
    if (itemData.c._mdf || this._isFirstFrame) {
      styleElem.co = 'rgb(' + bm_floor(itemData.c.v[0]) + ',' + bm_floor(itemData.c.v[1]) + ',' + bm_floor(itemData.c.v[2]) + ')';
    }
    if (itemData.o._mdf || groupTransform._opMdf || this._isFirstFrame) {
      styleElem.coOp = itemData.o.v * groupTransform.opacity;
    }
    if (itemData.w._mdf || this._isFirstFrame) {
      styleElem.wi = itemData.w.v;
    }
  }
  destroy() {
    this.shapesData = null;
    this.globalData = null;
    this.canvasContext = null;
    this.stylesList.length = 0;
    this.itemsData.length = 0;
  }
}

export default CVShapeElement;
