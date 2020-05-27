// import Matrix from '../3rd_party/transformation-matrix';
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
import RenderableDOMElement from '../elements/RenderableDOMElement';
import { bm_floor } from '../utils/common';
import DashProperty from '../shapes/DashProperty';
import ShapeModifiers from '../shapes/ShapeModifiers';
import { GradientProperty } from '../shapes/GradientProperty';
import RoundCornersModifier from '../shapes/RoundCornersModifier';
import MouseModifier from '../shapes/MouseModifier';
import RepeaterModifier from '../shapes/RepeaterModifier';
import TrimModifier from '../shapes/TrimModifier';
import { ShapeTransformManager } from '../utils/helpers/ShapeTransformManager';

ShapeModifiers.registerModifier('rd', RoundCornersModifier);
ShapeModifiers.registerModifier('ms', MouseModifier);
ShapeModifiers.registerModifier('rp', RepeaterModifier);
ShapeModifiers.registerModifier('tm', TrimModifier);

const degToRads = Math.PI / 180;

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
    this.transformsManager = new ShapeTransformManager();
    this.initElement(data, globalData, comp);
  }

  initElement = RenderableDOMElement.prototype.initElement

  transformHelper = {
    opacity: 1,
    _opMdf: false
  }

  dashResetter = []

  createContent() {
    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true, []);
  }

  createStyleElement(data, transforms) {
    let styleElem = {
      data: data,
      type: data.ty,
      preTransforms: this.transformsManager.addTransformSequence(transforms),
      transforms: [],
      elements: [],
      closed: data.hd === true
    };
    let elementData = {};
    if (data.ty === 'fl' || data.ty === 'st') {
      elementData.c = PropertyFactory.getProp(this, data.c, 1, 255, this);
      if (!elementData.c.k) {
        styleElem.co = 'rgb(' + bm_floor(elementData.c.v[0]) + ',' + bm_floor(elementData.c.v[1]) + ',' + bm_floor(elementData.c.v[2]) + ')';
      }
    } else if (data.ty === 'gf' || data.ty === 'gs') {
      elementData.s = PropertyFactory.getProp(this, data.s, 1, null, this);
      elementData.e = PropertyFactory.getProp(this, data.e, 1, null, this);
      elementData.h = PropertyFactory.getProp(this, data.h || {
        k: 0
      }, 0, 0.01, this);
      elementData.a = PropertyFactory.getProp(this, data.a || {
        k: 0
      }, 0, degToRads, this);
      elementData.g = new GradientProperty(this, data.g, this);
    }
    elementData.o = PropertyFactory.getProp(this, data.o, 0, 0.01, this);
    if (data.ty === 'st' || data.ty === 'gs') {
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
        let d = new DashProperty(this, data.d, 'canvas', this);
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
        opacity: 1,
        _opMdf: false,
        key: this.transformsManager.getNewKey(),
        op: PropertyFactory.getProp(this, data.o, 0, 0.01, this),
        mProps: TransformPropertyFactory.getTransformProperty(this, data, this)
      }
    };
    return elementData;
  }

  createShapeElement(data) {
    let elementData = new CVShapeData(this, data, this.stylesList, this.transformsManager);

    this.shapes.push(elementData);
    this.addShapeToModifiers(elementData);
    return elementData;
  }

  reloadShapes() {
    this._isFirstFrame = true;
    let i;
    let len = this.itemsData.length;
    for (i = 0; i < len; i += 1) {
      this.prevViewData[i] = this.itemsData[i];
    }
    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true, []);
    len = this.dynamicProperties.length;
    for (i = 0; i < len; i += 1) {
      this.dynamicProperties[i].getValue();
    }
    this.renderModifiers();
    this.transformsManager.processSequences(this._isFirstFrame);
  }

  addTransformToStyleList(transform) {
    let i;
    let len = this.stylesList.length;
    for (i = 0; i < len; i += 1) {
      if (!this.stylesList[i].closed) {
        this.stylesList[i].transforms.push(transform);
      }
    }
  }

  removeTransformFromStyleList() {
    let i;
    let len = this.stylesList.length;
    for (i = 0; i < len; i += 1) {
      if (!this.stylesList[i].closed) {
        this.stylesList[i].transforms.pop();
      }
    }
  }

  closeStyles(styles) {
    let i;
    let len = styles.length;
    // let j;
    // let jLen;
    for (i = 0; i < len; i += 1) {
      styles[i].closed = true;
    }
  }

  searchShapes(arr, itemsData, prevViewData, shouldRender, transforms) {
    let i;
    let len = arr.length - 1;
    let j;
    let jLen;
    let ownStyles = [];
    let ownModifiers = [];
    let processedPos;
    let modifier;
    let currentTransform;
    let ownTransforms = [].concat(transforms);
    for (i = len; i >= 0; i -= 1) {
      processedPos = this.searchProcessedElement(arr[i]);
      if (!processedPos) {
        arr[i]._shouldRender = shouldRender;
      } else {
        itemsData[i] = prevViewData[processedPos - 1];
      }
      if (arr[i].ty === 'fl' || arr[i].ty === 'st' || arr[i].ty === 'gf' || arr[i].ty === 'gs') {
        if (!processedPos) {
          itemsData[i] = this.createStyleElement(arr[i], ownTransforms);
        } else {
          itemsData[i].style.closed = false;
        }

        ownStyles.push(itemsData[i].style);
      } else if (arr[i].ty === 'gr') {
        if (!processedPos) {
          itemsData[i] = this.createGroupElement(arr[i]);
        } else {
          jLen = itemsData[i].it.length;
          for (j = 0; j < jLen; j += 1) {
            itemsData[i].prevViewData[j] = itemsData[i].it[j];
          }
        }
        this.searchShapes(arr[i].it, itemsData[i].it, itemsData[i].prevViewData, shouldRender, ownTransforms);
      } else if (arr[i].ty === 'tr') {
        if (!processedPos) {
          currentTransform = this.createTransformElement(arr[i]);
          itemsData[i] = currentTransform;
        }
        ownTransforms.push(itemsData[i]);
        this.addTransformToStyleList(itemsData[i]);
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
          modifier = ShapeModifiers.getModifier(arr[i].ty);
          itemsData[i] = modifier;
          modifier.init(this, arr, i, itemsData);
          this.shapeModifiers.push(modifier);
          shouldRender = false;
        } else {
          modifier = itemsData[i];
          modifier.closed = true;
        }
        ownModifiers.push(modifier);
      }
      this.addProcessedElement(arr[i], i + 1);
    }
    this.removeTransformFromStyleList();
    this.closeStyles(ownStyles);
    len = ownModifiers.length;
    for (i = 0; i < len; i += 1) {
      ownModifiers[i].closed = true;
    }
  }

  renderInnerContent() {
    this.transformHelper.opacity = 1;
    this.transformHelper._opMdf = false;
    this.renderModifiers();
    this.transformsManager.processSequences(this._isFirstFrame);

    this.renderShape(this.transformHelper, this.shapesData, this.itemsData, true);
  }

  renderShapeTransform(parentTransform, groupTransform) {
    // let props;
    // let groupMatrix;
    if (parentTransform._opMdf || groupTransform.op._mdf || this._isFirstFrame) {
      groupTransform.opacity = parentTransform.opacity;
      groupTransform.opacity *= groupTransform.op.v;
      groupTransform._opMdf = true;
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
    for (i = 0; i < len; i += 1) {
      currentStyle = this.stylesList[i];
      type = currentStyle.type;

      // Skipping style when
      // Stroke width equals 0
      // style should not be rendered (extra unused repeaters)
      // current opacity equals 0
      // global opacity equals 0
      if (((type === 'st' || type === 'gs') && currentStyle.wi === 0) || !currentStyle.data._shouldRender || currentStyle.coOp === 0 || this.globalData.currentGlobalAlpha === 0) {
        continue;
      }
      renderer.save();
      elems = currentStyle.elements;
      if (type === 'st' || type === 'gs') {
        ctx.strokeStyle = type === 'st' ? currentStyle.co : currentStyle.grd;
        ctx.lineWidth = currentStyle.wi;
        ctx.lineCap = currentStyle.lc;
        ctx.lineJoin = currentStyle.lj;
        ctx.miterLimit = currentStyle.ml || 0;
      } else {
        ctx.fillStyle = type === 'fl' ? currentStyle.co : currentStyle.grd;
      }
      renderer.ctxOpacity(currentStyle.coOp);
      if (type !== 'st' && type !== 'gs') {
        ctx.beginPath();
      }
      renderer.ctxTransform(currentStyle.preTransforms.finalTransform.props);
      jLen = elems.length;
      for (j = 0; j < jLen; j += 1) {
        if (type === 'st' || type === 'gs') {
          ctx.beginPath();
          if (currentStyle.da) {
            ctx.setLineDash(currentStyle.da);
            ctx.lineDashOffset = currentStyle.do;
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
        if (type === 'st' || type === 'gs') {
          ctx.stroke();
          if (currentStyle.da) {
            ctx.setLineDash(this.dashResetter);
          }
        }
      }

      if (type !== 'st' && type !== 'gs') {
        if (currentStyle.r === 'nonzero') {
          ctx.fill();
        } else {
          ctx.fill(currentStyle.r);
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
        this.renderPath(items[i], data[i]);
      } else if (items[i].ty === 'fl') {
        this.renderFill(items[i], data[i], groupTransform);
      } else if (items[i].ty === 'st') {
        this.renderStroke(items[i], data[i], groupTransform);
      } else if (items[i].ty === 'gf' || items[i].ty === 'gs') {
        this.renderGradientFill(items[i], data[i], groupTransform);
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

  renderStyledShape(styledShape, shape) {
    if (this._isFirstFrame || shape._mdf || styledShape.transforms._mdf) {
      let shapeNodes = styledShape.trNodes;
      let paths = shape.paths;
      let i;
      let len;
      let j;
      let jLen = paths._length;
      shapeNodes.length = 0;
      let groupTransformMat = styledShape.transforms.finalTransform;
      for (j = 0; j < jLen; j += 1) {
        let pathNodes = paths.shapes[j];
        if (pathNodes && pathNodes.v) {
          len = pathNodes._length;
          for (i = 1; i < len; i += 1) {
            if (i === 1) {
              shapeNodes.push({
                t: 'm',
                p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
              });
            }
            shapeNodes.push({
              t: 'c',
              pts: groupTransformMat.applyToTriplePoints(pathNodes.o[i - 1], pathNodes.i[i], pathNodes.v[i])
            });
          }
          if (len === 1) {
            shapeNodes.push({
              t: 'm',
              p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
            });
          }
          if (pathNodes.c && len) {
            shapeNodes.push({
              t: 'c',
              pts: groupTransformMat.applyToTriplePoints(pathNodes.o[i - 1], pathNodes.i[0], pathNodes.v[0])
            });
            shapeNodes.push({
              t: 'z'
            });
          }
        }
      }
      styledShape.trNodes = shapeNodes;
    }
  }

  renderPath(pathData, itemData) {
    if (pathData.hd !== true && pathData._shouldRender) {
      let i;
      let len = itemData.styledShapes.length;
      for (i = 0; i < len; i += 1) {
        this.renderStyledShape(itemData.styledShapes[i], itemData.sh);
      }
    }
  }

  renderFill(styleData, itemData, groupTransform) {
    let styleElem = itemData.style;

    if (itemData.c._mdf || this._isFirstFrame) {
      styleElem.co = 'rgb('
        + bm_floor(itemData.c.v[0]) + ','
        + bm_floor(itemData.c.v[1]) + ','
        + bm_floor(itemData.c.v[2]) + ')';
    }
    if (itemData.o._mdf || groupTransform._opMdf || this._isFirstFrame) {
      styleElem.coOp = itemData.o.v * groupTransform.opacity;
    }
  }

  renderGradientFill(styleData, itemData, groupTransform) {
    let styleElem = itemData.style;
    if (!styleElem.grd || itemData.g._mdf || itemData.s._mdf || itemData.e._mdf || (styleData.t !== 1 && (itemData.h._mdf || itemData.a._mdf))) {
      let ctx = this.globalData.canvasContext;
      let grd;
      let pt1 = itemData.s.v;
      let pt2 = itemData.e.v;
      if (styleData.t === 1) {
        grd = ctx.createLinearGradient(pt1[0], pt1[1], pt2[0], pt2[1]);
      } else {
        let rad = Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
        let ang = Math.atan2(pt2[1] - pt1[1], pt2[0] - pt1[0]);

        let percent = itemData.h.v >= 1 ? 0.99 : itemData.h.v <= -1 ? -0.99 : itemData.h.v;
        let dist = rad * percent;
        let x = Math.cos(ang + itemData.a.v) * dist + pt1[0];
        let y = Math.sin(ang + itemData.a.v) * dist + pt1[1];
        grd = ctx.createRadialGradient(x, y, 0, pt1[0], pt1[1], rad);
      }

      let i;
      let len = styleData.g.p;
      let cValues = itemData.g.c;
      let opacity = 1;

      for (i = 0; i < len; i += 1) {
        if (itemData.g._hasOpacity && itemData.g._collapsable) {
          opacity = itemData.g.o[i * 2 + 1];
        }
        grd.addColorStop(cValues[i * 4] / 100, 'rgba(' + cValues[i * 4 + 1] + ',' + cValues[i * 4 + 2] + ',' + cValues[i * 4 + 3] + ',' + opacity + ')');
      }
      styleElem.grd = grd;
    }
    styleElem.coOp = itemData.o.v * groupTransform.opacity;
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
