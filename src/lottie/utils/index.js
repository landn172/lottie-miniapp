export const defaultCurveSegments = 200;

function rafFactory() {
  // if (typeof requestAnimationFrame !== 'undefined') return requestAnimationFrame;
  let lastTime = Date.now();
  const FPS60 = 1000 / 60;
  const FPS24 = 1000 / 24;
  return function Raf(callback) {
    let currTime = Date.now();
    // pref：优化js密集计算 资源竞争恶性循环
    let timeToCall = Math.min(FPS24, Math.max(FPS60, FPS60 + (currTime - lastTime)));
    // let timeToCall = Math.max(0, 16 - (currTime - lastTime));
    let id = setTimeout(() => {
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
  } if (type === 'int16') {
    return new Int16Array(len);
  } if (type === 'uint8c') {
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
