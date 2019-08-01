import BezierFactory from '../../3rd_party/BezierEaser';
import shape_pool from '../pooling/shape_pool';

export const initFrame = -9999;

export function interpolateShape(frameNum, previousValue, caching) {
  let iterationIndex = caching.lastIndex;
  let keyPropS;
  let keyPropE;
  let isHold;
  let j;
  let k;
  let jLen;
  let kLen;
  let perc;
  let vertexValue;
  let kf = this.keyframes;
  if (frameNum < kf[0].t - this.offsetTime) {
    keyPropS = kf[0].s[0];
    isHold = true;
    iterationIndex = 0;
  } else if (frameNum >= kf[kf.length - 1].t - this.offsetTime) {
    keyPropS = kf[kf.length - 1].s ? kf[kf.length - 1].s[0] : kf[kf.length - 2].e[0];
    /* if(kf[kf.length - 1].s){
        keyPropS = kf[kf.length - 1].s[0];
    }else{
        keyPropS = kf[kf.length - 2].e[0];
    } */
    isHold = true;
  } else {
    let i = iterationIndex;
    let len = kf.length - 1;
    let flag = true;
    let keyData;
    let nextKeyData;
    while (flag) {
      keyData = kf[i];
      nextKeyData = kf[i + 1];
      if ((nextKeyData.t - this.offsetTime) > frameNum) {
        break;
      }
      if (i < len - 1) {
        i += 1;
      } else {
        flag = false;
      }
    }
    isHold = keyData.h === 1;
    iterationIndex = i;
    if (!isHold) {
      if (frameNum >= nextKeyData.t - this.offsetTime) {
        perc = 1;
      } else if (frameNum < keyData.t - this.offsetTime) {
        perc = 0;
      } else {
        let fnc;
        if (keyData.__fnct) {
          fnc = keyData.__fnct;
        } else {
          fnc = BezierFactory.getBezierEasing(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y).get;
          keyData.__fnct = fnc;
        }
        perc = fnc((frameNum - (keyData.t - this.offsetTime)) / ((nextKeyData.t - this.offsetTime) - (keyData.t - this.offsetTime)));
      }
      keyPropE = nextKeyData.s ? nextKeyData.s[0] : keyData.e[0];
    }
    keyPropS = keyData.s[0];
  }
  jLen = previousValue._length;
  kLen = keyPropS.i[0].length;
  caching.lastIndex = iterationIndex;

  for (j = 0; j < jLen; j += 1) {
    for (k = 0; k < kLen; k += 1) {
      vertexValue = isHold ? keyPropS.i[j][k] : keyPropS.i[j][k] + (keyPropE.i[j][k] - keyPropS.i[j][k]) * perc;
      previousValue.i[j][k] = vertexValue;
      vertexValue = isHold ? keyPropS.o[j][k] : keyPropS.o[j][k] + (keyPropE.o[j][k] - keyPropS.o[j][k]) * perc;
      previousValue.o[j][k] = vertexValue;
      vertexValue = isHold ? keyPropS.v[j][k] : keyPropS.v[j][k] + (keyPropE.v[j][k] - keyPropS.v[j][k]) * perc;
      previousValue.v[j][k] = vertexValue;
    }
  }
}

export function interpolateShapeCurrentTime() {
  let frameNum = this.comp.renderedFrame - this.offsetTime;
  let initTime = this.keyframes[0].t - this.offsetTime;
  let endTime = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
  let lastFrame = this._caching.lastFrame;
  if (!(lastFrame !== initFrame && ((lastFrame < initTime && frameNum < initTime) || (lastFrame > endTime && frameNum > endTime)))) {
    // //
    this._caching.lastIndex = lastFrame < frameNum ? this._caching.lastIndex : 0;
    this.interpolateShape(frameNum, this.pv, this._caching);
  // //
  }
  this._caching.lastFrame = frameNum;
  return this.pv;
}

export function resetShape() {
  this.paths = this.localShapeCollection;
}

export function shapesEqual(shape1, shape2) {
  if (shape1._length !== shape2._length || shape1.c !== shape2.c) {
    return false;
  }
  let i;
  let len = shape1._length;
  for (i = 0; i < len; i += 1) {
    if (shape1.v[i][0] !== shape2.v[i][0]
      || shape1.v[i][1] !== shape2.v[i][1]
      || shape1.o[i][0] !== shape2.o[i][0]
      || shape1.o[i][1] !== shape2.o[i][1]
      || shape1.i[i][0] !== shape2.i[i][0]
      || shape1.i[i][1] !== shape2.i[i][1]) {
      return false;
    }
  }
  return true;
}

export function setVValue(newPath) {
  if (!shapesEqual(this.v, newPath)) {
    this.v = shape_pool.clone(newPath);
    this.localShapeCollection.releaseShapes();
    this.localShapeCollection.addShape(this.v);
    this._mdf = true;
    this.paths = this.localShapeCollection;
  }
}

export function processEffectsSequence() {
  if (this.elem.globalData.frameId === this.frameId) {
    return;
  }
  if (!this.effectsSequence.length) {
    this._mdf = false;
    return;
  }
  if (this.lock) {
    this.setVValue(this.pv);
    return;
  }
  this.lock = true;
  this._mdf = false;
  let finalValue = this.kf ? this.pv : this.data.ks ? this.data.ks.k : this.data.pt.k;
  let i;
  let len = this.effectsSequence.length;
  for (i = 0; i < len; i += 1) {
    finalValue = this.effectsSequence[i](finalValue);
  }
  this.setVValue(finalValue);
  this.lock = false;
  this.frameId = this.elem.globalData.frameId;
}

export function addEffect(effectFunction) {
  this.effectsSequence.push(effectFunction);
  this.container.addDynamicProperty(this);
}
