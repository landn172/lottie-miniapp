import { ShapeModifier } from './ShapeModifiers';

export default class MouseModifier extends ShapeModifier {
  processKeys(forceRender) {
    if (this.elem.globalData.frameId === this.frameId && !forceRender) {
      return;
    }
    this._mdf = true;
  }

  addShapeToModifier() {
    this.positions.push([]);
  }

  processPath(path, mouseCoords, positions) {
    let i;
    let len = path.v.length;
    let vValues = [];
    let oValues = [];
    let iValues = [];
    // let dist;
    let theta;
    let x;
    let y;
    // // OPTION A
    for (i = 0; i < len; i += 1) {
      if (!positions.v[i]) {
        positions.v[i] = [path.v[i][0], path.v[i][1]];
        positions.o[i] = [path.o[i][0], path.o[i][1]];
        positions.i[i] = [path.i[i][0], path.i[i][1]];
        positions.distV[i] = 0;
        positions.distO[i] = 0;
        positions.distI[i] = 0;
      }
      theta = Math.atan2(
        path.v[i][1] - mouseCoords[1],
        path.v[i][0] - mouseCoords[0]
      );

      x = mouseCoords[0] - positions.v[i][0];
      y = mouseCoords[1] - positions.v[i][1];
      let distance = Math.sqrt((x * x) + (y * y));
      positions.distV[i] += (distance - positions.distV[i]) * this.data.dc;

      positions.v[i][0] = Math.cos(theta) * Math.max(0, this.data.maxDist - positions.distV[i]) / 2 + (path.v[i][0]);
      positions.v[i][1] = Math.sin(theta) * Math.max(0, this.data.maxDist - positions.distV[i]) / 2 + (path.v[i][1]);


      theta = Math.atan2(
        path.o[i][1] - mouseCoords[1],
        path.o[i][0] - mouseCoords[0]
      );

      x = mouseCoords[0] - positions.o[i][0];
      y = mouseCoords[1] - positions.o[i][1];
      distance = Math.sqrt((x * x) + (y * y));
      positions.distO[i] += (distance - positions.distO[i]) * this.data.dc;

      positions.o[i][0] = Math.cos(theta) * Math.max(0, this.data.maxDist - positions.distO[i]) / 2 + (path.o[i][0]);
      positions.o[i][1] = Math.sin(theta) * Math.max(0, this.data.maxDist - positions.distO[i]) / 2 + (path.o[i][1]);


      theta = Math.atan2(
        path.i[i][1] - mouseCoords[1],
        path.i[i][0] - mouseCoords[0]
      );

      x = mouseCoords[0] - positions.i[i][0];
      y = mouseCoords[1] - positions.i[i][1];
      distance = Math.sqrt((x * x) + (y * y));
      positions.distI[i] += (distance - positions.distI[i]) * this.data.dc;

      positions.i[i][0] = Math.cos(theta) * Math.max(0, this.data.maxDist - positions.distI[i]) / 2 + (path.i[i][0]);
      positions.i[i][1] = Math.sin(theta) * Math.max(0, this.data.maxDist - positions.distI[i]) / 2 + (path.i[i][1]);

      // ///OPTION 1
      vValues.push(positions.v[i]);
      oValues.push(positions.o[i]);
      iValues.push(positions.i[i]);
    }

    return {
      v: vValues,
      o: oValues,
      i: iValues,
      c: path.c
    };
  }

  processShapes() {
    let mouseX = this.elem.globalData.mouseX;
    let mouseY = this.elem.globalData.mouseY;
    let shapePaths;
    let i;
    let len = this.shapes.length;
    let j;
    let jLen;

    if (mouseX) {
      let localMouseCoords = this.elem.globalToLocal([mouseX, mouseY, 0]);

      let shapeData;
      let newPaths = [];
      const { shapes, _mdf, positions } = this;
      for (i = 0; i < len; i += 1) {
        shapeData = shapes[i];
        if (!shapeData.shape._mdf && !_mdf) {
          shapeData.shape.paths = shapeData.last;
        } else {
          shapeData.shape._mdf = true;
          shapePaths = shapeData.shape.paths;
          jLen = shapePaths.length;
          for (j = 0; j < jLen; j += 1) {
            if (!positions[i][j]) {
              this.positions[i][j] = {
                v: [],
                o: [],
                i: [],
                distV: [],
                distO: [],
                distI: []
              };
            }
            newPaths.push(this.processPath(shapePaths[j], localMouseCoords, this.positions[i][j]));
          }
          shapeData.shape.paths = newPaths;
          shapeData.last = newPaths;
        }
      }
    }
  }

  initModifierProperties(elem, data) {
    this.getValue = this.processKeys;
    this.data = data;
    this.positions = [];
  }
}
