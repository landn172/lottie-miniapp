export const defaultCurveSegments = 200;

function rafFactory() {
  if (typeof requestAnimationFrame !== 'undefined') return requestAnimationFrame;
  let lastTime = 0;
  return function Raf(callback) {
    let currTime = new Date().getTime();
    let timeToCall = Math.max(0, 16 - (currTime - lastTime));
    let id = setTimeout(function setTimeout() {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

export const raf = rafFactory();

export function createSizedArray(len) {
  return Array.apply(null, {
    length: len
  });
}

export function createTypedArray(type, len) {
  if (type === 'float32') {
    return new Float32Array(len);
  } else if (type === 'int16') {
    return new Int16Array(len);
  } else if (type === 'uint8c') {
    return new Uint8ClampedArray(len);
  }
  return null;
}

export function createTag(type) {
  const tag = {};
  switch (type) {
    case 'canvas':
      tag.getContext = () => {
        // TODO: get temp canvas
      };
      return tag;
    default:
      return tag;
  }
}

export function randomString(length, chars) {
  if (chars === undefined) {
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  }
  let i;
  let result = '';
  for (i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

export const subframeEnabled = true;

export function getDescriptor(object, prop) {
  return Object.getOwnPropertyDescriptor(object, prop);
}

export function createProxyFunction(prototype) {
  function ProxyFunction() {
  }
  ProxyFunction.prototype = prototype;
  return ProxyFunction;
}
