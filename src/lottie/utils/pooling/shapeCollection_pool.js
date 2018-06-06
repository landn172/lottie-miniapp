import { createSizedArray } from '../index';
import ShapeCollection from '../../shapes/ShapeCollection';
import pooling from './pooling';
import shape_pool from './shape_pool';

let _length = 0;
let _maxLength = 4;
let pool = createSizedArray(_maxLength);

function newShapeCollection() {
  let shapeCollection;
  if (_length) {
    _length -= 1;
    shapeCollection = pool[_length];
  } else {
    shapeCollection = new ShapeCollection();
  }
  return shapeCollection;
}

function release(shapeCollection) {
  let i;
  let len = shapeCollection._length;
  for (i = 0; i < len; i += 1) {
    shape_pool.release(shapeCollection.shapes[i]);
  }
  shapeCollection._length = 0;

  if (_length === _maxLength) {
    pool = pooling.double(pool);
    _maxLength *= 2;
  }
  pool[_length] = shapeCollection;
  _length += 1;
}

let ob = {
  newShapeCollection: newShapeCollection,
  release: release
};

export default ob;
