import { ShapeModifier } from './ShapeModifiers';
import PropertyFactory from '../utils/PropertyFactory';
import segments_length_pool from '../utils/pooling/segments_length_pool';
import bez from '../utils/bez';
import shape_pool from '../utils/pooling/shape_pool';

export default class TrimModifier extends ShapeModifier {
  initModifierProperties(elem, data) {
    this.s = PropertyFactory.getProp(elem, data.s, 0, 0.01, this);
    this.e = PropertyFactory.getProp(elem, data.e, 0, 0.01, this);
    this.o = PropertyFactory.getProp(elem, data.o, 0, 0, this);
    this.sValue = 0;
    this.eValue = 0;
    this.getValue = this.processKeys;
    this.m = data.m;
    this._isAnimated = !!this.s.effectsSequence.length || !!this.e.effectsSequence.length || !!this.o.effectsSequence.length;
  }

  addShapeToModifier(shapeData) {
    shapeData.pathsData = [];
  }

  calculateShapeEdges(s, e, shapeLength, addedLength, totalModifierLength) {
    let segments = [];
    if (e <= 1) {
      segments.push({
        s: s,
        e: e
      });
    } else if (s >= 1) {
      segments.push({
        s: s - 1,
        e: e - 1
      });
    } else {
      segments.push({
        s: s,
        e: 1
      });
      segments.push({
        s: 0,
        e: e - 1
      });
    }
    let shapeSegments = [];
    let i;
    let len = segments.length;
    let segmentOb;
    for (i = 0; i < len; i += 1) {
      segmentOb = segments[i];
      if (segmentOb.e * totalModifierLength < addedLength || segmentOb.s * totalModifierLength > addedLength + shapeLength) {
        // ignore
      } else {
        let shapeS;
        let shapeE;
        if (segmentOb.s * totalModifierLength <= addedLength) {
          shapeS = 0;
        } else {
          shapeS = (segmentOb.s * totalModifierLength - addedLength) / shapeLength;
        }
        if (segmentOb.e * totalModifierLength >= addedLength + shapeLength) {
          shapeE = 1;
        } else {
          shapeE = ((segmentOb.e * totalModifierLength - addedLength) / shapeLength);
        }
        shapeSegments.push([shapeS, shapeE]);
      }
    }
    if (!shapeSegments.length) {
      shapeSegments.push([0, 0]);
    }
    return shapeSegments;
  }

  releasePathsData(pathsData) {
    let i;
    let len = pathsData.length;
    for (i = 0; i < len; i += 1) {
      segments_length_pool.release(pathsData[i]);
    }
    pathsData.length = 0;
    return pathsData;
  }

  processShapes(_isFirstFrame) {
    let s;
    let e;
    if (this._mdf || _isFirstFrame) {
      let o = (this.o.v % 360) / 360;
      if (o < 0) {
        o += 1;
      }
      s = (this.s.v > 1 ? 1 : this.s.v < 0 ? 0 : this.s.v) + o;
      e = (this.e.v > 1 ? 1 : this.e.v < 0 ? 0 : this.e.v) + o;
      if (s === e) {
        // ignore
      }
      if (s > e) {
        let _s = s;
        s = e;
        e = _s;
      }
      s = Math.round(s * 10000) * 0.0001;
      e = Math.round(e * 10000) * 0.0001;
      this.sValue = s;
      this.eValue = e;
    } else {
      s = this.sValue;
      e = this.eValue;
    }
    let shapePaths;
    let i;
    let len = this.shapes.length;
    let j;
    let jLen;
    let pathsData;
    let pathData;
    let totalShapeLength;
    let totalModifierLength = 0;

    if (e === s) {
      for (i = 0; i < len; i += 1) {
        this.shapes[i].localShapeCollection.releaseShapes();
        this.shapes[i].shape._mdf = true;
        this.shapes[i].shape.paths = this.shapes[i].localShapeCollection;
      }
    } else if (!((e === 1 && s === 0) || (e === 0 && s === 1))) {
      let segments = [];
      let shapeData;
      let localShapeCollection;
      for (i = 0; i < len; i += 1) {
        shapeData = this.shapes[i];
        // if shape hasn't changed and trim properties haven't changed, cached previous path can be used
        if (!shapeData.shape._mdf && !this._mdf && !_isFirstFrame && this.m !== 2) {
          shapeData.shape.paths = shapeData.localShapeCollection;
        } else {
          shapePaths = shapeData.shape.paths;
          jLen = shapePaths._length;
          totalShapeLength = 0;
          if (!shapeData.shape._mdf && shapeData.pathsData.length) {
            totalShapeLength = shapeData.totalShapeLength;
          } else {
            pathsData = this.releasePathsData(shapeData.pathsData);
            for (j = 0; j < jLen; j += 1) {
              pathData = bez.getSegmentsLength(shapePaths.shapes[j]);
              pathsData.push(pathData);
              totalShapeLength += pathData.totalLength;
            }
            shapeData.totalShapeLength = totalShapeLength;
            shapeData.pathsData = pathsData;
          }

          totalModifierLength += totalShapeLength;
          shapeData.shape._mdf = true;
        }
      }
      let shapeS = s;
      let shapeE = e;
      let addedLength = 0;
      let edges;
      for (i = len - 1; i >= 0; i -= 1) {
        shapeData = this.shapes[i];
        if (shapeData.shape._mdf) {
          localShapeCollection = shapeData.localShapeCollection;
          localShapeCollection.releaseShapes();
          // if m === 2 means paths are trimmed individually so edges need to be found for this specific shape relative to whoel group
          if (this.m === 2 && len > 1) {
            edges = this.calculateShapeEdges(s, e, shapeData.totalShapeLength, addedLength, totalModifierLength);
            addedLength += shapeData.totalShapeLength;
          } else {
            edges = [[shapeS, shapeE]];
          }
          jLen = edges.length;
          for (j = 0; j < jLen; j += 1) {
            shapeS = edges[j][0];
            shapeE = edges[j][1];
            segments.length = 0;
            if (shapeE <= 1) {
              segments.push({
                s: shapeData.totalShapeLength * shapeS,
                e: shapeData.totalShapeLength * shapeE
              });
            } else if (shapeS >= 1) {
              segments.push({
                s: shapeData.totalShapeLength * (shapeS - 1),
                e: shapeData.totalShapeLength * (shapeE - 1)
              });
            } else {
              segments.push({
                s: shapeData.totalShapeLength * shapeS,
                e: shapeData.totalShapeLength
              });
              segments.push({
                s: 0,
                e: shapeData.totalShapeLength * (shapeE - 1)
              });
            }
            let newShapesData = this.addShapes(shapeData, segments[0]);
            if (segments[0].s !== segments[0].e) {
              if (segments.length > 1) {
                let lastShapeInCollection = shapeData.shape.paths.shapes[shapeData.shape.paths._length - 1];
                if (lastShapeInCollection.c) {
                  let lastShape = newShapesData.pop();
                  this.addPaths(newShapesData, localShapeCollection);
                  newShapesData = this.addShapes(shapeData, segments[1], lastShape);
                } else {
                  this.addPaths(newShapesData, localShapeCollection);
                  newShapesData = this.addShapes(shapeData, segments[1]);
                }
              }
              this.addPaths(newShapesData, localShapeCollection);
            }
          }
          shapeData.shape.paths = localShapeCollection;
        }
      }
    } else if (this._mdf) {
      for (i = 0; i < len; i += 1) {
        // Releasign Trim Cached paths data when no trim applied in case shapes are modified inbetween.
        // Don't remove this even if it's losing cached info.
        this.shapes[i].pathsData.length = 0;
        this.shapes[i].shape._mdf = true;
      }
    }
  }

  addPaths(newPaths, localShapeCollection) {
    let i;
    let len = newPaths.length;
    for (i = 0; i < len; i += 1) {
      localShapeCollection.addShape(newPaths[i]);
    }
  }

  addSegment(pt1, pt2, pt3, pt4, shapePath, pos, newShape) {
    shapePath.setXYAt(pt2[0], pt2[1], 'o', pos);
    shapePath.setXYAt(pt3[0], pt3[1], 'i', pos + 1);
    if (newShape) {
      shapePath.setXYAt(pt1[0], pt1[1], 'v', pos);
    }
    shapePath.setXYAt(pt4[0], pt4[1], 'v', pos + 1);
  }

  addSegmentFromArray(points, shapePath, pos, newShape) {
    shapePath.setXYAt(points[1], points[5], 'o', pos);
    shapePath.setXYAt(points[2], points[6], 'i', pos + 1);
    if (newShape) {
      shapePath.setXYAt(points[0], points[4], 'v', pos);
    }
    shapePath.setXYAt(points[3], points[7], 'v', pos + 1);
  }

  addShapes(shapeData, shapeSegment, shapePath) {
    let pathsData = shapeData.pathsData;
    let shapePaths = shapeData.shape.paths.shapes;
    let i;
    let len = shapeData.shape.paths._length;
    let j;
    let jLen;
    let addedLength = 0;
    let currentLengthData;
    let segmentCount;
    let lengths;
    let segment;
    let shapes = [];
    let initPos;
    let newShape = true;
    if (!shapePath) {
      shapePath = shape_pool.newElement();
      segmentCount = 0;
      initPos = 0;
    } else {
      segmentCount = shapePath._length;
      initPos = shapePath._length;
    }
    shapes.push(shapePath);
    for (i = 0; i < len; i += 1) {
      lengths = pathsData[i].lengths;
      shapePath.c = shapePaths[i].c;
      jLen = shapePaths[i].c ? lengths.length : lengths.length + 1;
      for (j = 1; j < jLen; j += 1) {
        currentLengthData = lengths[j - 1];
        if (addedLength + currentLengthData.addedLength < shapeSegment.s) {
          addedLength += currentLengthData.addedLength;
          shapePath.c = false;
        } else if (addedLength > shapeSegment.e) {
          shapePath.c = false;
          break;
        } else {
          if (shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + currentLengthData.addedLength) {
            this.addSegment(shapePaths[i].v[j - 1], shapePaths[i].o[j - 1], shapePaths[i].i[j], shapePaths[i].v[j], shapePath, segmentCount, newShape);
            newShape = false;
          } else {
            segment = bez.getNewSegment(shapePaths[i].v[j - 1], shapePaths[i].v[j], shapePaths[i].o[j - 1], shapePaths[i].i[j], (shapeSegment.s - addedLength) / currentLengthData.addedLength, (shapeSegment.e - addedLength) / currentLengthData.addedLength, lengths[j - 1]);
            this.addSegmentFromArray(segment, shapePath, segmentCount, newShape);
            // this.addSegment(segment.pt1, segment.pt3, segment.pt4, segment.pt2, shapePath, segmentCount, newShape);
            newShape = false;
            shapePath.c = false;
          }
          addedLength += currentLengthData.addedLength;
          segmentCount += 1;
        }
      }
      if (shapePaths[i].c && lengths.length) {
        currentLengthData = lengths[j - 1];
        if (addedLength <= shapeSegment.e) {
          let segmentLength = lengths[j - 1].addedLength;
          if (shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + segmentLength) {
            this.addSegment(shapePaths[i].v[j - 1], shapePaths[i].o[j - 1], shapePaths[i].i[0], shapePaths[i].v[0], shapePath, segmentCount, newShape);
            newShape = false;
          } else {
            segment = bez.getNewSegment(shapePaths[i].v[j - 1], shapePaths[i].v[0], shapePaths[i].o[j - 1], shapePaths[i].i[0], (shapeSegment.s - addedLength) / segmentLength, (shapeSegment.e - addedLength) / segmentLength, lengths[j - 1]);
            this.addSegmentFromArray(segment, shapePath, segmentCount, newShape);
            // this.addSegment(segment.pt1, segment.pt3, segment.pt4, segment.pt2, shapePath, segmentCount, newShape);
            newShape = false;
            shapePath.c = false;
          }
        } else {
          shapePath.c = false;
        }
        addedLength += currentLengthData.addedLength;
        segmentCount += 1;
      }
      if (shapePath._length) {
        shapePath.setXYAt(shapePath.v[initPos][0], shapePath.v[initPos][1], 'i', initPos);
        shapePath.setXYAt(shapePath.v[shapePath._length - 1][0], shapePath.v[shapePath._length - 1][1], 'o', shapePath._length - 1);
      }
      if (addedLength > shapeSegment.e) {
        break;
      }
      if (i < len - 1) {
        shapePath = shape_pool.newElement();
        newShape = true;
        shapes.push(shapePath);
        segmentCount = 0;
      }
    }
    return shapes;
  }
}
