import ExpressionManager from './ExpressionManager';
import { createTypedArray } from '../index';

export function searchExpressions(elem, data, prop) {
  if (data.x) {
    prop.k = true;
    prop.x = true;
    prop.initiateExpression = ExpressionManager.initiateExpression;
    prop.effectsSequence.push(prop.initiateExpression(elem, data, prop).bind(prop));
  }
}
export function getValueAtTime(frameNum) {
  frameNum *= this.elem.globalData.frameRate;
  frameNum -= this.offsetTime;
  if (frameNum !== this._cachingAtTime.lastFrame) {
    this._cachingAtTime.lastIndex = this._cachingAtTime.lastFrame < frameNum ? this._cachingAtTime.lastIndex : 0;
    this._cachingAtTime.value = this.interpolateValue(frameNum, this._cachingAtTime);
    this._cachingAtTime.lastFrame = frameNum;
  }
  return this._cachingAtTime.value;
}

export function getSpeedAtTime(frameNum) {
  let delta = -0.01;
  let v1 = this.getValueAtTime(frameNum);
  let v2 = this.getValueAtTime(frameNum + delta);
  let speed = 0;
  if (v1.length) {
    let i;
    for (i = 0; i < v1.length; i += 1) {
      speed += Math.pow(v2[i] - v1[i], 2);
    }
    speed = Math.sqrt(speed) * 100;
  } else {
    speed = 0;
  }
  return speed;
}

export function getVelocityAtTime(frameNum) {
  if (this.vel !== undefined) {
    return this.vel;
  }
  let delta = -0.001;
  // frameNum += this.elem.data.st;
  let v1 = this.getValueAtTime(frameNum);
  let v2 = this.getValueAtTime(frameNum + delta);
  let velocity;
  if (v1.length) {
    velocity = createTypedArray('float32', v1.length);
    let i;
    for (i = 0; i < v1.length; i += 1) {
      // removing frameRate
      // if needed, don't add it here
      // velocity[i] = this.elem.globalData.frameRate*((v2[i] - v1[i])/delta);
      velocity[i] = (v2[i] - v1[i]) / delta;
    }
  } else {
    velocity = (v2 - v1) / delta;
  }
  return velocity;
}

export function getStaticValueAtTime() {
  return this.pv;
}

export function setGroupProperty(propertyGroup) {
  this.propertyGroup = propertyGroup;
}
