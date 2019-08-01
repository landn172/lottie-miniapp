import BezierFactory from '../../3rd_party/BezierEaser';
import interpreter from '../../3rd_party/interpreterWrap';
import BMMath from '../common';
import { createTypedArray } from '../index';
import shape_pool from '../pooling/shape_pool';

let ob = {};
const degToRads = Math.PI / 180;

function $bm_isInstanceOfArray(arr) {
  return arr.constructor === Array || arr.constructor === Float32Array;
}

function isNumerable(tOfV, v) {
  return tOfV === 'number' || tOfV === 'boolean' || tOfV === 'string' || v instanceof Number;
}

function $bm_neg(a) {
  let tOfA = typeof a;
  if (tOfA === 'number' || tOfA === 'boolean' || a instanceof Number) {
    return -a;
  }
  if ($bm_isInstanceOfArray(a)) {
    let i,
      lenA = a.length;
    let retArr = [];
    for (i = 0; i < lenA; i += 1) {
      retArr[i] = -a[i];
    }
    return retArr;
  }
  if (a.propType) {
    return a.v;
  }
}

const easeInBez = BezierFactory.getBezierEasing(0.333, 0, .833, .833, 'easeIn').get;
const easeOutBez = BezierFactory.getBezierEasing(0.167, 0.167, .667, 1, 'easeOut').get;
const easeInOutBez = BezierFactory.getBezierEasing(.33, 0, .667, 1, 'easeInOut').get;

function sum(a, b) {
  let tOfA = typeof a;
  let tOfB = typeof b;
  if (tOfA === 'string' || tOfB === 'string') {
    return a + b;
  }
  if (isNumerable(tOfA, a) && isNumerable(tOfB, b)) {
    return a + b;
  }
  if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
    a = a.slice(0);
    a[0] = a[0] + b;
    return a;
  }
  if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
    b = b.slice(0);
    b[0] = a + b[0];
    return b;
  }
  if ($bm_isInstanceOfArray(a) && $bm_isInstanceOfArray(b)) {

    let i = 0,
      lenA = a.length,
      lenB = b.length;
    let retArr = [];
    while (i < lenA || i < lenB) {
      if ((typeof a[i] === 'number' || a[i] instanceof Number) && (typeof b[i] === 'number' || b[i] instanceof Number)) {
        retArr[i] = a[i] + b[i];
      } else {
        retArr[i] = b[i] === undefined ? a[i] : a[i] || b[i];
      }
      i += 1;
    }
    return retArr;
  }
  return 0;
}
const add = sum;

function sub(a, b) {
  let tOfA = typeof a;
  let tOfB = typeof b;
  if (isNumerable(tOfA, a) && isNumerable(tOfB, b)) {
    if (tOfA === 'string') {
      a = parseInt(a);
    }
    if (tOfB === 'string') {
      b = parseInt(b);
    }
    return a - b;
  }
  if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
    a = a.slice(0);
    a[0] = a[0] - b;
    return a;
  }
  if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
    b = b.slice(0);
    b[0] = a - b[0];
    return b;
  }
  if ($bm_isInstanceOfArray(a) && $bm_isInstanceOfArray(b)) {
    let i = 0,
      lenA = a.length,
      lenB = b.length;
    let retArr = [];
    while (i < lenA || i < lenB) {
      if ((typeof a[i] === 'number' || a[i] instanceof Number) && (typeof b[i] === 'number' || b[i] instanceof Number)) {
        retArr[i] = a[i] - b[i];
      } else {
        retArr[i] = b[i] === undefined ? a[i] : a[i] || b[i];
      }
      i += 1;
    }
    return retArr;
  }
  return 0;
}

function mul(a, b) {
  let tOfA = typeof a;
  let tOfB = typeof b;
  let arr;
  if (isNumerable(tOfA, a) && isNumerable(tOfB, b)) {
    return a * b;
  }

  let i,
    len;
  if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
    len = a.length;
    arr = createTypedArray('float32', len);
    for (i = 0; i < len; i += 1) {
      arr[i] = a[i] * b;
    }
    return arr;
  }
  if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
    len = b.length;
    arr = createTypedArray('float32', len);
    for (i = 0; i < len; i += 1) {
      arr[i] = a * b[i];
    }
    return arr;
  }
  return 0;
}

function div(a, b) {
  let tOfA = typeof a;
  let tOfB = typeof b;
  let arr;
  if (isNumerable(tOfA, a) && isNumerable(tOfB, b)) {
    return a / b;
  }
  let i,
    len;
  if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
    len = a.length;
    arr = createTypedArray('float32', len);
    for (i = 0; i < len; i += 1) {
      arr[i] = a[i] / b;
    }
    return arr;
  }
  if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
    len = b.length;
    arr = createTypedArray('float32', len);
    for (i = 0; i < len; i += 1) {
      arr[i] = a / b[i];
    }
    return arr;
  }
  return 0;
}

function mod(a, b) {
  if (typeof a === 'string') {
    a = parseInt(a);
  }
  if (typeof b === 'string') {
    b = parseInt(b);
  }
  return a % b;
}

const $bm_sum = sum;
const $bm_sub = sub;
const $bm_mul = mul;
const $bm_div = div;
const $bm_mod = mod;

function clamp(num, min, max) {
  if (min > max) {
    let mm = max;
    max = min;
    min = mm;
  }
  return Math.min(Math.max(num, min), max);
}

function radiansToDegrees(val) {
  return val / degToRads;
}

let radians_to_degrees = radiansToDegrees;

function degreesToRadians(val) {
  return val * degToRads;
}

let degrees_to_radians = radiansToDegrees;

let helperLengthArray = [0, 0, 0, 0, 0, 0];

function length(arr1, arr2) {
  if (typeof arr1 === 'number' || arr1 instanceof Number) {
    arr2 = arr2 || 0;
    return Math.abs(arr1 - arr2);
  }
  if (!arr2) {
    arr2 = helperLengthArray;
  }
  let i;
  let len = Math.min(arr1.length, arr2.length);
  let addedLength = 0;
  for (i = 0; i < len; i += 1) {
    addedLength += Math.pow(arr2[i] - arr1[i], 2);
  }
  return Math.sqrt(addedLength);
}

function normalize(vec) {
  return div(vec, length(vec));
}

function rgbToHsl(val) {
  let r = val[0];
  let g = val[1];
  let b = val[2];
  let max = Math.max(r, g, b)
  let min = Math.min(r, g, b);
  let h;
  let s;
  let l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l, val[3]];
}

function hue2rgb(p, q, t) {
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(val) {
  let h = val[0];
  let s = val[1];
  let l = val[2];

  let r,
    g,
    b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r, g, b, val[3]];
}

function linear(t, tMin, tMax, value1, value2) {
  if (value1 === undefined || value2 === undefined) {
    return linear(t, 0, 1, tMin, tMax);
  }
  if (t <= tMin) {
    return value1;
  } else if (t >= tMax) {
    return value2;
  }
  let perc = tMax === tMin ? 0 : (t - tMin) / (tMax - tMin);
  if (!value1.length) {
    return value1 + (value2 - value1) * perc;
  }
  let i;
  let len = value1.length;
  let arr = createTypedArray('float32', len);
  for (i = 0; i < len; i += 1) {
    arr[i] = value1[i] + (value2[i] - value1[i]) * perc;
  }
  return arr;
}

function random(min, max) {
  if (max === undefined) {
    if (min === undefined) {
      min = 0;
      max = 1;
    } else {
      max = min;
      min = undefined;
    }
  }
  if (max.length) {
    let i;
    let len = max.length;
    if (!min) {
      min = createTypedArray('float32', len);
    }
    let arr = createTypedArray('float32', len);
    let rnd = BMMath.random();
    for (i = 0; i < len; i += 1) {
      arr[i] = min[i] + rnd * (max[i] - min[i]);
    }
    return arr;
  }
  if (min === undefined) {
    min = 0;
  }
  let rndm = BMMath.random();
  return min + rndm * (max - min);
}

function createPath(points, inTangents, outTangents, closed) {
  let i,
    len = points.length;
  let path = shape_pool.newElement();
  path.setPathData(!!closed, len);
  let arrPlaceholder = [0, 0],
    inVertexPoint,
    outVertexPoint;
  for (i = 0; i < len; i += 1) {
    inVertexPoint = (inTangents && inTangents[i]) ? inTangents[i] : arrPlaceholder;
    outVertexPoint = (outTangents && outTangents[i]) ? outTangents[i] : arrPlaceholder;
    path.setTripleAt(points[i][0], points[i][1], outVertexPoint[0] + points[i][0], outVertexPoint[1] + points[i][1], inVertexPoint[0] + points[i][0], inVertexPoint[1] + points[i][1], i, true);
  }
  return path;
}

function initiateExpression(elem, data, property) {
  let val = data.x;
  let needsVelocity = /velocity(?![\w\d])/.test(val);
  let _needsRandom = val.indexOf('random') !== -1;
  let elemType = elem.data.ty;
  let transform,
    $bm_transform,
    content,
    effect;
  let thisProperty = property;
  thisProperty.valueAtTime = thisProperty.getValueAtTime;
  Object.defineProperty(thisProperty, 'value', {
    get: function() {
      return thisProperty.v
    }
  })
  elem.comp.frameDuration = 1 / elem.comp.globalData.frameRate;
  elem.comp.displayStartTime = 0;
  let inPoint = elem.data.ip / elem.comp.globalData.frameRate;
  let outPoint = elem.data.op / elem.comp.globalData.frameRate;
  let width = elem.data.sw ? elem.data.sw : 0;
  let height = elem.data.sh ? elem.data.sh : 0;
  let name = elem.data.nm;
  let loopIn,
    loop_in,
    loopOut,
    loop_out,
    smooth;
  let toWorld,
    fromWorld,
    fromComp,
    toComp,
    fromCompToSurface,
    position,
    rotation,
    anchorPoint,
    scale,
    thisLayer,
    thisComp,
    mask,
    valueAtTime,
    velocityAtTime;
  let __expression_functions = [];

  /** append Api */
  interpreter.appendApis({
    thisProperty: thisProperty,
    _needsRandom: _needsRandom,
    loopInDuration: loopInDuration,
    loopOutDuration: loopOutDuration,
    outPoint: outPoint,
    inPoint: inPoint,
    width: width,
    height: height,
    lookAt: lookAt,
    easeOut: easeOut,
    sourceRectAtTime: sourceRectAtTime,
    easeIn: easeIn,
    ease: ease,
    key: key,
    wiggle: wiggle,
    substring: substring,
    substr: substr,
    framesToTime: framesToTime,
    timeToFrames: timeToFrames,
    nearestKey: nearestKey,
    'scoped_bm_rt': scoped_bm_rt
  })

  if (data.xf) {
    let i;
    let len = data.xf.length;

    for (i = 0; i < len; i += 1) {
      // __expression_functions[i] = eval('(function(){ return ' + data.xf[i] + '}())');
      __expression_functions[i] = interpreter.run(`module.exports = ${data.xf[i]}`)
    }
  }

  let scoped_bm_rt;
  // let expression_function = eval('[function _expression_function(){' + val + ';scoped_bm_rt=$bm_rt}' + ']')[0];

  let numKeys = property.kf ? data.k.length : 0;
  let active = !this.data || this.data.hd !== true;

  let wiggle = function wiggle(freq, amp) {
    let i,
      j,
      len = this.pv.length ? this.pv.length : 1;
    let addedAmps = createTypedArray('float32', len);
    freq = 5;
    let iterations = Math.floor(time * freq);
    i = 0;
    j = 0;
    while (i < iterations) {
      //let rnd = BMMath.random();
      for (j = 0; j < len; j += 1) {
        addedAmps[j] += -amp + amp * 2 * BMMath.random();
      //addedAmps[j] += -amp + amp*2*rnd;
      }
      i += 1;
    }
    //let rnd2 = BMMath.random();
    let periods = time * freq;
    let perc = periods - Math.floor(periods);
    let arr = createTypedArray('float32', len);
    if (len > 1) {
      for (j = 0; j < len; j += 1) {
        arr[j] = this.pv[j] + addedAmps[j] + (-amp + amp * 2 * BMMath.random()) * perc;
      //arr[j] = this.pv[j] + addedAmps[j] + (-amp + amp*2*rnd)*perc;
      //arr[i] = this.pv[i] + addedAmp + amp1*perc + amp2*(1-perc);
      }
      return arr;
    } else {
      return this.pv + addedAmps[0] + (-amp + amp * 2 * BMMath.random()) * perc;
    }
  }.bind(this);

  if (thisProperty.loopIn) {
    loopIn = thisProperty.loopIn.bind(thisProperty);
    loop_in = loopIn;
  }

  if (thisProperty.loopOut) {
    loopOut = thisProperty.loopOut.bind(thisProperty);
    loop_out = loopOut;
  }

  if (thisProperty.smooth) {
    smooth = thisProperty.smooth.bind(thisProperty);
  }

  function loopInDuration(type, duration) {
    return loopIn(type, duration, true);
  }

  function loopOutDuration(type, duration) {
    return loopOut(type, duration, true);
  }

  if (this.getValueAtTime) {
    valueAtTime = this.getValueAtTime.bind(this);
  }

  if (this.getVelocityAtTime) {
    velocityAtTime = this.getVelocityAtTime.bind(this);
  }

  let comp = elem.comp.globalData.projectInterface.bind(elem.comp.globalData.projectInterface);

  function lookAt(elem1, elem2) {
    let fVec = [elem2[0] - elem1[0], elem2[1] - elem1[1], elem2[2] - elem1[2]];
    let pitch = Math.atan2(fVec[0], Math.sqrt(fVec[1] * fVec[1] + fVec[2] * fVec[2])) / degToRads;
    let yaw = -Math.atan2(fVec[1], fVec[2]) / degToRads;
    return [yaw, pitch, 0];
  }

  function easeOut(t, tMin, tMax, val1, val2) {
    return applyEase(easeOutBez, t, tMin, tMax, val1, val2);
  }

  function easeIn(t, tMin, tMax, val1, val2) {
    return applyEase(easeInBez, t, tMin, tMax, val1, val2);
  }

  function ease(t, tMin, tMax, val1, val2) {
    return applyEase(easeInOutBez, t, tMin, tMax, val1, val2);
  }

  function applyEase(fn, t, tMin, tMax, val1, val2) {
    if (val1 === undefined) {
      val1 = tMin;
      val2 = tMax;
    } else {
      t = (t - tMin) / (tMax - tMin);
    }
    t = t > 1 ? 1 : t < 0 ? 0 : t;
    var mult = fn(t);
    if ($bm_isInstanceOfArray(val1)) {
      var i,
        len = val1.length;
      var arr = createTypedArray('float32', len);
      for (i = 0; i < len; i += 1) {
        arr[i] = (val2[i] - val1[i]) * mult + val1[i];
      }
      return arr;
    } else {
      return (val2 - val1) * mult + val1;
    }
  }

  function nearestKey(time) {
    var i,
      len = data.k.length,
      index,
      keyTime;
    if (!data.k.length || typeof (data.k[0]) === 'number') {
      index = 0;
      keyTime = 0;
    } else {
      index = -1;
      time *= elem.comp.globalData.frameRate;
      if (time < data.k[0].t) {
        index = 1;
        keyTime = data.k[0].t;
      } else {
        for (i = 0; i < len - 1; i += 1) {
          if (time === data.k[i].t) {
            index = i + 1;
            keyTime = data.k[i].t;
            break;
          } else if (time > data.k[i].t && time < data.k[i + 1].t) {
            if (time - data.k[i].t > data.k[i + 1].t - time) {
              index = i + 2;
              keyTime = data.k[i + 1].t;
            } else {
              index = i + 1;
              keyTime = data.k[i].t;
            }
            break;
          }
        }
        if (index === -1) {
          index = i + 1;
          keyTime = data.k[i].t;
        }
      }

    }
    var ob = {};
    ob.index = index;
    ob.time = keyTime / elem.comp.globalData.frameRate;
    return ob;
  }

  function key(ind) {
    var ob,
      i,
      len;
    if (!data.k.length || typeof (data.k[0]) === 'number') {
      throw new Error('The property has no keyframe at index ' + ind);
    }
    ind -= 1;
    ob = {
      time: data.k[ind].t / elem.comp.globalData.frameRate,
      value: []
    };
    var arr = data.k[ind].hasOwnProperty('s') ? data.k[ind].s : data.k[ind - 1].e;

    len = arr.length;
    for (i = 0; i < len; i += 1) {
      ob[i] = arr[i];
      ob.value[i] = arr[i]
    }
    return ob;
  }

  function framesToTime(frames, fps) {
    if (!fps) {
      fps = elem.comp.globalData.frameRate;
    }
    return frames / fps;
  }

  function timeToFrames(t, fps) {
    if (!t && t !== 0) {
      t = time;
    }
    if (!fps) {
      fps = elem.comp.globalData.frameRate;
    }
    return t * fps;
  }

  function seedRandom(seed) {
    BMMath.seedrandom(randSeed + seed);
  }

  function sourceRectAtTime() {
    return elem.sourceRectAtTime();
  }

  function substring(init, end) {
    if (typeof value === 'string') {
      if (end === undefined) {
        return value.substring(init)
      }
      return value.substring(init, end)
    }
    return '';
  }

  function substr(init, end) {
    if (typeof value === 'string') {
      if (end === undefined) {
        return value.substr(init)
      }
      return value.substr(init, end)
    }
    return '';
  }

  var time,
    velocity,
    value,
    text,
    textIndex,
    textTotal,
    selectorValue;
  var index = elem.data.ind;
  var hasParent = !!(elem.hierarchy && elem.hierarchy.length);
  var parent;
  var randSeed = Math.floor(Math.random() * 1000000);
  var globalData = elem.globalData;

  function executeExpression(_value) {
    value = _value;
    if (_needsRandom) {
      seedRandom(randSeed);
    }
    if (this.frameExpressionId === elem.globalData.frameId && this.propType !== 'textSelector') {
      return value;
    }
    if (this.propType === 'textSelector') {
      textIndex = this.textIndex;
      textTotal = this.textTotal;
      selectorValue = this.selectorValue;
    }
    if (!thisLayer) {
      text = elem.layerInterface.text;
      thisLayer = elem.layerInterface;
      thisComp = elem.comp.compInterface;
      toWorld = thisLayer.toWorld.bind(thisLayer);
      fromWorld = thisLayer.fromWorld.bind(thisLayer);
      fromComp = thisLayer.fromComp.bind(thisLayer);
      toComp = thisLayer.toComp.bind(thisLayer);
      mask = thisLayer.mask ? thisLayer.mask.bind(thisLayer) : null;
      fromCompToSurface = fromComp;
    }
    if (!transform) {
      transform = elem.layerInterface("ADBE Transform Group");
      $bm_transform = transform;
      if (transform) {
        anchorPoint = transform.anchorPoint;
      /*position = transform.position;
      rotation = transform.rotation;
      scale = transform.scale;*/
      }
    }

    if (elemType === 4 && !content) {
      content = thisLayer('ADBE Root Vectors Group');
    }
    if (!effect) {
      effect = thisLayer(4);
    }
    hasParent = !!(elem.hierarchy && elem.hierarchy.length);
    if (hasParent && !parent) {
      parent = elem.hierarchy[0].layerInterface;
    }
    time = this.comp.renderedFrame / this.comp.globalData.frameRate;
    if (needsVelocity) {
      velocity = velocityAtTime(time);
    }

    try {
      interpreter.appendApis({
        velocity,
        parent,
        anchorPoint,
        textIndex,
        textTotal,
        selectorValue,
        index,
        'transform': transform,
        loopOut: loopOut,
        loop_out: loop_out,
        loop_in: loop_in,
        smooth: smooth,
        text: text,
        thisLayer: thisLayer,
        toWorld: toWorld,
        fromWorld: fromWorld,
        fromComp: fromComp,
        toComp: toComp,
        mask: mask,
        fromCompToSurface: fromCompToSurface,
        $bm_transform: $bm_transform
      })
      scoped_bm_rt = interpreter.run(`${val};module.exports = $bm_rt`)
    } catch (error) {
      console.error(error)
    }

    this.frameExpressionId = elem.globalData.frameId;

    // TODO: Check if it's possible to return on ShapeInterface the .v value
    if (scoped_bm_rt.propType === 'shape') {
      scoped_bm_rt = shape_pool.clone(scoped_bm_rt.v);
    }
    return scoped_bm_rt;
  }
  return executeExpression;
}

ob.initiateExpression = initiateExpression;

export default ob;
