import * as expressionHelpers from './expressionHelpers';
import { createSizedArray } from '../index';
import bez from '../bez';

class ShapeExpressions {
  vertices(prop, time) {
    if (this.k) {
      this.getValue();
    }
    let shapePath = this.v;
    if (time !== undefined) {
      shapePath = this.getValueAtTime(time, 0);
    }
    let i;
    let len = shapePath._length;
    let vertices = shapePath[prop];
    let points = shapePath.v;
    let arr = createSizedArray(len);
    for (i = 0; i < len; i += 1) {
      if (prop === 'i' || prop === 'o') {
        arr[i] = [vertices[i][0] - points[i][0], vertices[i][1] - points[i][1]];
      } else {
        arr[i] = [vertices[i][0], vertices[i][1]];
      }
    }
    return arr;
  }

  points(time) {
    return this.vertices('v', time);
  }

  inTangents(time) {
    return this.vertices('i', time);
  }

  outTangents(time) {
    return this.vertices('o', time);
  }

  isClosed() {
    return this.v.c;
  }

  pointOnPath(perc, time) {
    let shapePath = this.v;
    if (time !== undefined) {
      shapePath = this.getValueAtTime(time, 0);
    }
    if (!this._segmentsLength) {
      this._segmentsLength = bez.getSegmentsLength(shapePath);
    }

    let segmentsLength = this._segmentsLength;
    let lengths = segmentsLength.lengths;
    let lengthPos = segmentsLength.totalLength * perc;
    let i = 0;
    let len = lengths.length;
    // let j = 0;
    // let jLen;
    let accumulatedLength = 0;
    let pt;
    while (i < len) {
      if (accumulatedLength + lengths[i].addedLength > lengthPos) {
        let initIndex = i;
        let endIndex = (shapePath.c && i === len - 1) ? 0 : i + 1;
        let segmentPerc = (lengthPos - accumulatedLength) / lengths[i].addedLength;
        pt = bez.getPointInSegment(shapePath.v[initIndex], shapePath.v[endIndex], shapePath.o[initIndex], shapePath.i[endIndex], segmentPerc, lengths[i]);
        break;
      } else {
        accumulatedLength += lengths[i].addedLength;
      }
      i += 1;
    }
    if (!pt) {
      pt = shapePath.c ? [shapePath.v[0][0], shapePath.v[0][1]] : [shapePath.v[shapePath._length - 1][0], shapePath.v[shapePath._length - 1][1]];
    }
    return pt;
  }

  vectorOnPath(perc, time, vectorType) {
    // perc doesn't use triple equality because it can be a Number object as well as a primitive.
    perc = perc === 1 ? this.v.c ? 0 : 0.999 : perc;
    let pt1 = this.pointOnPath(perc, time);
    let pt2 = this.pointOnPath(perc + 0.001, time);
    let xLength = pt2[0] - pt1[0];
    let yLength = pt2[1] - pt1[1];
    let magnitude = Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2));
    if (magnitude === 0) {
      return [0, 0];
    }
    let unitVector = vectorType === 'tangent' ? [xLength / magnitude, yLength / magnitude] : [-yLength / magnitude, xLength / magnitude];
    return unitVector;
  }

  tangentOnPath(perc, time) {
    return this.vectorOnPath(perc, time, 'tangent');
  }

  normalOnPath(perc, time) {
    return this.vectorOnPath(perc, time, 'normal');
  }

  setGroupProperty= expressionHelpers.setGroupProperty

  getValueAtTime= expressionHelpers.getStaticValueAtTime
}

export default ShapeExpressions;
