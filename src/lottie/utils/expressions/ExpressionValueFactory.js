import { createTypedArray } from '../index';

/* eslint-disable no-new-wrappers */
let defaultUnidimensionalValue = {
  pv: 0,
  v: 0,
  mult: 1
};
let defaultMultidimensionalValue = {
  pv: [0, 0, 0],
  v: [0, 0, 0],
  mult: 1
};

function completeProperty(expressionValue, property, type) {
  Object.defineProperty(expressionValue, 'velocity', {
    get: function () {
      return property.getVelocityAtTime(property.comp.currentFrame);
    }
  });
  expressionValue.numKeys = property.keyframes ? property.keyframes.length : 0;
  expressionValue.key = function (pos) {
    if (!expressionValue.numKeys) {
      return 0;
    }
    let value = '';
    if ('s' in property.keyframes[pos - 1]) {
      value = property.keyframes[pos - 1].s;
    } else if ('e' in property.keyframes[pos - 2]) {
      value = property.keyframes[pos - 2].e;
    } else {
      value = property.keyframes[pos - 2].s;
    }
    let valueProp = type === 'unidimensional' ? new Number(value) : ({ ...value });
    valueProp.time = property.keyframes[pos - 1].t / property.elem.comp.globalData.frameRate;
    return valueProp;
  };
  expressionValue.valueAtTime = property.getValueAtTime;
  expressionValue.speedAtTime = property.getSpeedAtTime;
  expressionValue.velocityAtTime = property.getVelocityAtTime;
  expressionValue.propertyGroup = property.propertyGroup;
}

function UnidimensionalPropertyInterface(property) {
  if (!property || !('pv' in property)) {
    property = defaultUnidimensionalValue;
  }
  let mult = 1 / property.mult;
  let val = property.pv * mult;
  let expressionValue = new Number(val);
  expressionValue.value = val;
  completeProperty(expressionValue, property, 'unidimensional');

  return function () {
    if (property.k) {
      property.getValue();
    }
    val = property.v * mult;
    if (expressionValue.value !== val) {
      expressionValue = new Number(val);
      expressionValue.value = val;
      completeProperty(expressionValue, property, 'unidimensional');
    }
    return expressionValue;
  };
}

function MultidimensionalPropertyInterface(property) {
  if (!property || !('pv' in property)) {
    property = defaultMultidimensionalValue;
  }
  let mult = 1 / property.mult;
  let len = property.pv.length;
  let expressionValue = createTypedArray('float32', len);
  let arrValue = createTypedArray('float32', len);
  expressionValue.value = arrValue;
  completeProperty(expressionValue, property, 'multidimensional');

  return function () {
    if (property.k) {
      property.getValue();
    }
    for (let i = 0; i < len; i += 1) {
      expressionValue[i] = arrValue[i] = property.v[i] * mult;
    }
    return expressionValue;
  };
}

// TODO: try to avoid using this getter
function defaultGetter() {
  return defaultUnidimensionalValue;
}

export function ExpressionPropertyInterface(property) {
  if (!property) {
    return defaultGetter;
  } if (property.propType === 'unidimensional') {
    return UnidimensionalPropertyInterface(property);
  }
  return MultidimensionalPropertyInterface(property);
}
