import { createTypedArray } from '../index';
import ExpressionManager from './ExpressionManager';
import shape_pool from '../pooling/shape_pool';

export function getStaticValueAtTime() {
  return this.pv;
}

export function loopOut(type, duration, durationFlag) {
  if (!this.k || !this.keyframes) {
    return this.pv;
  }
  type = type ? type.toLowerCase() : '';
  let currentFrame = this.comp.renderedFrame;
  let keyframes = this.keyframes;
  let lastKeyFrame = keyframes[keyframes.length - 1].t;
  if (currentFrame <= lastKeyFrame) {
    return this.pv;
  }
  let cycleDuration;
  let firstKeyFrame;
  if (!durationFlag) {
    if (!duration || duration > keyframes.length - 1) {
      duration = keyframes.length - 1;
    }
    firstKeyFrame = keyframes[keyframes.length - 1 - duration].t;
    cycleDuration = lastKeyFrame - firstKeyFrame;
  } else {
    if (!duration) {
      cycleDuration = Math.max(0, lastKeyFrame - this.elem.data.ip);
    } else {
      cycleDuration = Math.abs(lastKeyFrame - this.elem.comp.globalData.frameRate * duration);
    }
    firstKeyFrame = lastKeyFrame - cycleDuration;
  }
  let i;
  let len;
  let ret;
  if (type === 'pingpong') {
    let iterations = Math.floor((currentFrame - firstKeyFrame) / cycleDuration);
    if (iterations % 2 !== 0) {
      return this.getValueAtTime(((cycleDuration - (currentFrame - firstKeyFrame) % cycleDuration + firstKeyFrame)) / this.comp.globalData.frameRate, 0);
    }
  } else if (type === 'offset') {
    let initV = this.getValueAtTime(firstKeyFrame / this.comp.globalData.frameRate, 0);
    let endV = this.getValueAtTime(lastKeyFrame / this.comp.globalData.frameRate, 0);
    let current = this.getValueAtTime(((currentFrame - firstKeyFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
    let repeats = Math.floor((currentFrame - firstKeyFrame) / cycleDuration);
    if (this.pv.length) {
      ret = new Array(initV.length);
      len = ret.length;
      for (i = 0; i < len; i += 1) {
        ret[i] = (endV[i] - initV[i]) * repeats + current[i];
      }
      return ret;
    }
    return (endV - initV) * repeats + current;
  } else if (type === 'continue') {
    let lastValue = this.getValueAtTime(lastKeyFrame / this.comp.globalData.frameRate, 0);
    let nextLastValue = this.getValueAtTime((lastKeyFrame - 0.001) / this.comp.globalData.frameRate, 0);
    if (this.pv.length) {
      ret = new Array(lastValue.length);
      len = ret.length;
      for (i = 0; i < len; i += 1) {
        ret[i] = lastValue[i] + (lastValue[i] - nextLastValue[i]) * ((currentFrame - lastKeyFrame) / this.comp.globalData.frameRate) / 0.0005;
      }
      return ret;
    }
    return lastValue + (lastValue - nextLastValue) * (((currentFrame - lastKeyFrame)) / 0.001);
  }
  return this.getValueAtTime((((currentFrame - firstKeyFrame) % cycleDuration + firstKeyFrame)) / this.comp.globalData.frameRate, 0);
}

export function loopIn(type, duration, durationFlag) {
  if (!this.k) {
    return this.pv;
  }
  type = type ? type.toLowerCase() : '';
  let currentFrame = this.comp.renderedFrame;
  let keyframes = this.keyframes;
  let firstKeyFrame = keyframes[0].t;
  if (currentFrame >= firstKeyFrame) {
    return this.pv;
  }
  let cycleDuration;
  let lastKeyFrame;
  if (!durationFlag) {
    if (!duration || duration > keyframes.length - 1) {
      duration = keyframes.length - 1;
    }
    lastKeyFrame = keyframes[duration].t;
    cycleDuration = lastKeyFrame - firstKeyFrame;
  } else {
    if (!duration) {
      cycleDuration = Math.max(0, this.elem.data.op - firstKeyFrame);
    } else {
      cycleDuration = Math.abs(this.elem.comp.globalData.frameRate * duration);
    }
    lastKeyFrame = firstKeyFrame + cycleDuration;
  }
  let i;
  let len;
  let ret;
  if (type === 'pingpong') {
    let iterations = Math.floor((firstKeyFrame - currentFrame) / cycleDuration);
    if (iterations % 2 === 0) {
      return this.getValueAtTime((((firstKeyFrame - currentFrame) % cycleDuration + firstKeyFrame)) / this.comp.globalData.frameRate, 0);
    }
  } else if (type === 'offset') {
    let initV = this.getValueAtTime(firstKeyFrame / this.comp.globalData.frameRate, 0);
    let endV = this.getValueAtTime(lastKeyFrame / this.comp.globalData.frameRate, 0);
    let current = this.getValueAtTime((cycleDuration - (firstKeyFrame - currentFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
    let repeats = Math.floor((firstKeyFrame - currentFrame) / cycleDuration) + 1;
    if (this.pv.length) {
      ret = new Array(initV.length);
      len = ret.length;
      for (i = 0; i < len; i += 1) {
        ret[i] = current[i] - (endV[i] - initV[i]) * repeats;
      }
      return ret;
    }
    return current - (endV - initV) * repeats;
  } else if (type === 'continue') {
    let firstValue = this.getValueAtTime(firstKeyFrame / this.comp.globalData.frameRate, 0);
    let nextFirstValue = this.getValueAtTime((firstKeyFrame + 0.001) / this.comp.globalData.frameRate, 0);
    if (this.pv.length) {
      ret = new Array(firstValue.length);
      len = ret.length;
      for (i = 0; i < len; i += 1) {
        ret[i] = firstValue[i] + (firstValue[i] - nextFirstValue[i]) * (firstKeyFrame - currentFrame) / 0.001;
      }
      return ret;
    }
    return firstValue + (firstValue - nextFirstValue) * (firstKeyFrame - currentFrame) / 0.001;
  }
  return this.getValueAtTime(((cycleDuration - (firstKeyFrame - currentFrame) % cycleDuration + firstKeyFrame)) / this.comp.globalData.frameRate, 0);
}

export function getValueAtTime(frameNum) {
  if (frameNum !== this._cachingAtTime.lastFrame) {
    frameNum *= this.elem.globalData.frameRate;
    frameNum -= this.offsetTime;
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

export function setGroupProperty(propertyGroup) {
  this.propertyGroup = propertyGroup;
}

export function searchExpressions(elem, data, prop) {
  if (data.x) {
    prop.k = true;
    prop.x = true;
    prop.initiateExpression = ExpressionManager.initiateExpression;
    prop.effectsSequence.push(prop.initiateExpression(elem, data, prop).bind(prop));
  }
}

export function getTransformValueAtTime() {
  console.warn('Transform at time not supported');
}

export function getTransformStaticValueAtTime() {
}

export function getShapeValueAtTime(frameNum) {
  // For now this caching object is created only when needed instead of creating it when the shape is initialized.
  if (!this._cachingAtTime) {
    this._cachingAtTime = {
      shapeValue: shape_pool.clone(this.pv),
      lastIndex: 0,
      lastTime: -999999
    };
  }
  if (frameNum !== this._cachingAtTime.lastTime) {
    this._cachingAtTime.lastIndex = this._cachingAtTime.lastTime < frameNum ? this._caching.lastIndex : 0;
    this._cachingAtTime.lastTime = frameNum;
    frameNum *= this.elem.globalData.frameRate;
    this.interpolateShape(frameNum, this._cachingAtTime.shapeValue, this._cachingAtTime);
  }
  return this._cachingAtTime.shapeValue;
}

// TransformPropertyFactory.getTransformProperty
export function GetTransformProperty(target, name, descriptor) {
  let getTransformProperty = descriptor.value;
  descriptor.value = (elem, data, container) => {
    let prop = getTransformProperty(elem, data, container);
    if (prop.dynamicProperties.length) {
      prop.getValueAtTime = getTransformValueAtTime.bind(prop);
    } else {
      prop.getValueAtTime = getTransformStaticValueAtTime.bind(prop);
    }
    prop.setGroupProperty = setGroupProperty;
    return prop;
  };

  return descriptor;
}

// PropertyFactory.getProp
export function GetProp(target, name, descriptor) {
  let propertyGetProp = descriptor.value;
  descriptor.value = (elem, data, type, mult, container) => {
    let prop = propertyGetProp(elem, data, type, mult, container);
    // prop.getVelocityAtTime = getVelocityAtTime;
    // prop.loopOut = loopOut;
    // prop.loopIn = loopIn;
    if (prop.kf) {
      prop.getValueAtTime = getValueAtTime.bind(prop);
    } else {
      prop.getValueAtTime = getStaticValueAtTime.bind(prop);
    }
    prop.setGroupProperty = setGroupProperty;
    prop.loopOut = loopOut;
    prop.loopIn = loopIn;
    prop.getVelocityAtTime = getVelocityAtTime.bind(prop);
    prop.getSpeedAtTime = getSpeedAtTime.bind(prop);
    prop.numKeys = data.a === 1 ? data.k.length : 0;
    prop.propertyIndex = data.ix;
    let value = 0;
    if (type !== 0) {
      value = createTypedArray('float32', data.a === 1 ? data.k[0].s.length : data.k.length);
    }
    prop._cachingAtTime = {
      lastFrame: -999999,
      lastIndex: 0,
      value: value
    };
    searchExpressions(elem, data, prop);
    if (prop.k) {
      container.addDynamicProperty(prop);
    }

    return prop;
  };
  return descriptor;
}

export function GetShapeProp(target, name, descriptor) {
  const propertyGetShapeProp = descriptor.value;

  descriptor.value = (elem, data, type, arr, trims) => {
    let prop = propertyGetShapeProp(elem, data, type, arr, trims);
    prop.propertyIndex = data.ix;
    prop.lock = false;
    if (type === 3) {
      searchExpressions(elem, data.pt, prop);
    } else if (type === 4) {
      searchExpressions(elem, data.ks, prop);
    }
    if (prop.k) {
      elem.addDynamicProperty(prop);
    }
    return prop;
  };

  return descriptor;
}

function getValueProxy(index, total) {
  this.textIndex = index + 1;
  this.textTotal = total;
  this.getValue();
  return this.v;
}

export function TextExpressionSelectorProp(elem, data) {
  this.pv = 1;
  this.comp = elem.comp;
  this.elem = elem;
  this.mult = 0.01;
  this.propType = 'textSelector';
  this.textTotal = data.totalChars;
  this.selectorValue = 100;
  this.lastValue = [1, 1, 1];
  searchExpressions.bind(this)(elem, data, this);
  this.getMult = getValueProxy;
  this.getVelocityAtTime = getVelocityAtTime;
  if (this.kf) {
    this.getValueAtTime = getValueAtTime.bind(this);
  } else {
    this.getValueAtTime = getStaticValueAtTime.bind(this);
  }
  this.setGroupProperty = setGroupProperty;
}

//  TextSelectorProp.getTextSelectorProp
export function GetTextSelectorProp(target, name, descriptor) {
  const propertyGetTextProp = descriptor.value;

  descriptor.value = (elem, data, arr) => {
    if (data.t === 1) {
      return new TextExpressionSelectorProp(elem, data, arr);
    }
    return propertyGetTextProp(elem, data, arr);
  };

  return descriptor;
}
