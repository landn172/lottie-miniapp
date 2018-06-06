import Matrix from '../../3rd_party/transformation-matrix';
import MaskManagerInterface from './MaskInterface';
import TransformExpressionInterface from './TransformInterface';
import { getDescriptor } from '../index';

function toWorld(arr, time) {
  let toWorldMat = new Matrix();
  toWorldMat.reset();
  let transformMat;
  if (time) {
    // Todo implement value at time on transform properties
    // transformMat = this._elem.finalTransform.mProp.getValueAtTime(time);
    transformMat = this._elem.finalTransform.mProp;
  } else {
    transformMat = this._elem.finalTransform.mProp;
  }
  transformMat.applyToMatrix(toWorldMat);
  if (this._elem.hierarchy && this._elem.hierarchy.length) {
    let i;
    let len = this._elem.hierarchy.length;
    for (i = 0; i < len; i += 1) {
      this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
    }
    return toWorldMat.applyToPointArray(arr[0], arr[1], arr[2] || 0);
  }
  return toWorldMat.applyToPointArray(arr[0], arr[1], arr[2] || 0);
}
function fromWorld(arr, time) {
  let toWorldMat = new Matrix();
  toWorldMat.reset();
  let transformMat;
  if (time) {
    // Todo implement value at time on transform properties
    // transformMat = this._elem.finalTransform.mProp.getValueAtTime(time);
    transformMat = this._elem.finalTransform.mProp;
  } else {
    transformMat = this._elem.finalTransform.mProp;
  }
  transformMat.applyToMatrix(toWorldMat);
  if (this._elem.hierarchy && this._elem.hierarchy.length) {
    let i;
    let len = this._elem.hierarchy.length;
    for (i = 0; i < len; i += 1) {
      this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
    }
    return toWorldMat.inversePoint(arr);
  }
  return toWorldMat.inversePoint(arr);
}
function fromComp(arr) {
  let toWorldMat = new Matrix();
  toWorldMat.reset();
  this._elem.finalTransform.mProp.applyToMatrix(toWorldMat);
  if (this._elem.hierarchy && this._elem.hierarchy.length) {
    let i;
    let len = this._elem.hierarchy.length;
    for (i = 0; i < len; i += 1) {
      this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
    }
    return toWorldMat.inversePoint(arr);
  }
  return toWorldMat.inversePoint(arr);
}

function sampleImage() {
  return [1, 1, 1, 1];
}

export default function (elem) {
  let transformInterface;

  function thisLayerFunction(name) {
    switch (name) {
      case 'ADBE Root Vectors Group':
      case 'Contents':
      case 2:
        return thisLayerFunction.shapeInterface;
      case 1:
      case 6:
      case 'Transform':
      case 'transform':
      case 'ADBE Transform Group':
        return transformInterface;
      case 4:
      case 'ADBE Effect Parade':
        return thisLayerFunction.effect;
      default:
        break;
    }
  }
  function _registerMaskInterface(maskManager) {
    thisLayerFunction.mask = new MaskManagerInterface(maskManager, elem);
  }
  function _registerEffectsInterface(effects) {
    thisLayerFunction.effect = effects;
  }
  thisLayerFunction.toWorld = toWorld;
  thisLayerFunction.fromWorld = fromWorld;
  thisLayerFunction.toComp = toWorld;
  thisLayerFunction.fromComp = fromComp;
  thisLayerFunction.sampleImage = sampleImage;
  thisLayerFunction.sourceRectAtTime = elem.sourceRectAtTime.bind(elem);
  thisLayerFunction._elem = elem;
  transformInterface = TransformExpressionInterface(elem.finalTransform.mProp);
  let anchorPointDescriptor = getDescriptor(transformInterface, 'anchorPoint');
  Object.defineProperties(thisLayerFunction, {
    hasParent: {
      get: function () {
        return elem.hierarchy.length;
      }
    },
    parent: {
      get: function () {
        return elem.hierarchy[0].layerInterface;
      }
    },
    rotation: getDescriptor(transformInterface, 'rotation'),
    scale: getDescriptor(transformInterface, 'scale'),
    position: getDescriptor(transformInterface, 'position'),
    opacity: getDescriptor(transformInterface, 'opacity'),
    anchorPoint: anchorPointDescriptor,
    anchor_point: anchorPointDescriptor,
    transform: {
      get: function () {
        return transformInterface;
      }
    },
    active: {
      get: function () {
        return elem.isInRange;
      }
    }
  });

  thisLayerFunction.startTime = elem.data.st;
  thisLayerFunction.index = elem.data.ind;
  thisLayerFunction.source = elem.data.refId;
  thisLayerFunction.height = elem.data.ty === 0 ? elem.data.h : 100;
  thisLayerFunction.width = elem.data.ty === 0 ? elem.data.w : 100;

  thisLayerFunction.registerMaskInterface = _registerMaskInterface;
  thisLayerFunction.registerEffectsInterface = _registerEffectsInterface;
  return thisLayerFunction;
}
