import { createSizedArray } from '../utils/index';
import shape_pool from '../utils/pooling/shape_pool';

class ShapeCollection {
  constructor() {
    this._length = 0;
    this._maxLength = 4;
    this.shapes = createSizedArray(this._maxLength);
  }

  addShape(shapeData) {
    if (this._length === this._maxLength) {
      this.shapes = this.shapes.concat(createSizedArray(this._maxLength));
      this._maxLength *= 2;
    }
    this.shapes[this._length] = shapeData;
    this._length += 1;
  }

  releaseShapes() {
    let i;
    for (i = 0; i < this._length; i += 1) {
      shape_pool.release(this.shapes[i]);
    }
    this._length = 0;
  }
}

export default ShapeCollection;
