
let beziers = {};


// These values are established by empiricism with tests (tradeoff: performance VS precision)
let NEWTON_ITERATIONS = 4;
let NEWTON_MIN_SLOPE = 0.001;
let SUBDIVISION_PRECISION = 0.0000001;
let SUBDIVISION_MAX_ITERATIONS = 10;

let kSplineTableSize = 11;
let kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

let float32ArraySupported = typeof Float32Array === 'function';

function A(aA1, aA2) {
  return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}
function B(aA1, aA2) {
  return 3.0 * aA2 - 6.0 * aA1;
}
function C(aA1) {
  return 3.0 * aA1;
}

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier(aT, aA1, aA2) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope(aT, aA1, aA2) {
  return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
}

function binarySubdivide(aX, aA, aB, mX1, mX2) {
  let currentX;
  let currentT;
  let i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
  for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
    let currentSlope = getSlope(aGuessT, mX1, mX2);
    if (+currentSlope === 0) return aGuessT;
    let currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }
  return aGuessT;
}

/**
 * points is an array of [ mX1, mY1, mX2, mY2 ]
 */
function BezierEasing(points) {
  this._p = points;
  this._mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  this._precomputed = false;

  this.get = this.get.bind(this);
}

BezierEasing.prototype = {

  get: function (x) {
    let mX1 = this._p[0];
    let mY1 = this._p[1];
    let mX2 = this._p[2];
    let mY2 = this._p[3];
    if (!this._precomputed) this._precompute();
    if (mX1 === mY1 && mX2 === mY2) return x; // linear
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) return 0;
    if (x === 1) return 1;
    return calcBezier(this._getTForX(x), mY1, mY2);
  },

  // Private part

  _precompute: function () {
    let mX1 = this._p[0];
    let mY1 = this._p[1];
    let mX2 = this._p[2];
    let mY2 = this._p[3];
    this._precomputed = true;
    if (mX1 !== mY1 || mX2 !== mY2) { this._calcSampleValues(); }
  },

  _calcSampleValues: function () {
    let mX1 = this._p[0];
    let mX2 = this._p[2];
    for (let i = 0; i < kSplineTableSize; ++i) {
      this._mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  },

  /**
   * getTForX chose the fastest heuristic to determine the percentage value precisely from a given X projection.
   */
  _getTForX: function (aX) {
    let mX1 = this._p[0];
    let mX2 = this._p[2];
    let mSampleValues = this._mSampleValues;

    let intervalStart = 0.0;
    let currentSample = 1;
    let lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    let dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]);
    let guessForT = intervalStart + dist * kSampleStepSize;

    let initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } if (initialSlope === 0.0) {
      return guessForT;
    }
    return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
  }
};

function getBezierEasing(a, b, c, d, nm) {
  let str = nm || ('bez_' + a + '_' + b + '_' + c + '_' + d).replace(/\./g, 'p');
  if (beziers[str]) {
    return beziers[str];
  }
  let bezEasing = new BezierEasing([a, b, c, d]);
  beziers[str] = bezEasing;
  return bezEasing;
}

let ob = {};
ob.getBezierEasing = getBezierEasing;

export default ob;
