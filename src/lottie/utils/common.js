export let subframeEnabled = true;
export let expressionsPlugin;
export let isSafari = false;
export let cachedColors = {};
export let bm_rounder = Math.round;
export let bm_rnd;
export let bm_pow = Math.pow;
export let bm_sqrt = Math.sqrt;
export let bm_abs = Math.abs;
export let bm_floor = Math.floor;
export let bm_max = Math.max;
export let bm_min = Math.min;
export let blitter = 10;
export const roundCorner = 0.5519;

export default Math;

export function RGBtoHSV(r, g, b) {
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let d = max - min;
  let h;
  let s = (max === 0 ? 0 : d / max);
  let v = max / 255;

  switch (max) {
    case min: h = 0; break;
    case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
    case g: h = (b - r) + d * 2; h /= 6 * d; break;
    case b: h = (r - g) + d * 4; h /= 6 * d; break;
    default: break;
  }

  return [
    h,
    s,
    v
  ];
}

export function HSVtoRGB(h, s, v) {
  let r;
  let g;
  let b;
  let i;
  let f;
  let p;
  let q;
  let t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: break;
  }
  return [r, g, b];
}

export function addHueToRGB(color, offset) {
  var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
  hsv[0] += offset / 360;
  if (hsv[0] > 1) {
    hsv[0] -= 1;
  } else if (hsv[0] < 0) {
    hsv[0] += 1;
  }
  return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
}

export function addSaturationToRGB(color, offset) {
  var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
  hsv[1] += offset;
  if (hsv[1] > 1) {
    hsv[1] = 1;
  } else if (hsv[1] <= 0) {
    hsv[1] = 0;
  }
  return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
}

export function addBrightnessToRGB(color, offset) {
  var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
  hsv[2] += offset;
  if (hsv[2] > 1) {
    hsv[2] = 1;
  } else if (hsv[2] < 0) {
    hsv[2] = 0;
  }
  return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
}

export function BMEnterFrameEvent(n, c, t, d) {
  this.type = n;
  this.currentTime = c;
  this.totalTime = t;
  this.direction = d < 0 ? -1 : 1;
}

export function BMCompleteEvent(n, d) {
  this.type = n;
  this.direction = d < 0 ? -1 : 1;
}

export function BMCompleteLoopEvent(n, c, t, d) {
  this.type = n;
  this.currentLoop = t;
  this.totalLoops = c;
  this.direction = d < 0 ? -1 : 1;
}

export function BMSegmentStartEvent(n, f, t) {
  this.type = n;
  this.firstFrame = f;
  this.totalFrames = t;
}

export function BMDestroyEvent(n, t) {
  this.type = n;
  this.target = t;
}
