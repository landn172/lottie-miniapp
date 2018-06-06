import poolFactory from './pool_factory';
import ShapePath from '../../shapes/ShapePath';
// import { createTypedArray } from '../index';
import point_pool from './point_pool';

function create() {
  return new ShapePath();
}

function release(shapePath) {
  let len = shapePath._length;
  let i;
  for (i = 0; i < len; i += 1) {
    point_pool.release(shapePath.v[i]);
    point_pool.release(shapePath.i[i]);
    point_pool.release(shapePath.o[i]);
    shapePath.v[i] = null;
    shapePath.i[i] = null;
    shapePath.o[i] = null;
  }
  shapePath._length = 0;
  shapePath.c = false;
}


let factory = poolFactory(4, create, release);
factory.clone = function clone(shape) {
  let cloned = factory.newElement();
  let i;
  let len = shape._length === undefined ? shape.v.length : shape._length;
  cloned.setLength(len);
  cloned.c = shape.c;
  // let pt;

  for (i = 0; i < len; i += 1) {
    cloned.setTripleAt(shape.v[i][0], shape.v[i][1], shape.o[i][0], shape.o[i][1], shape.i[i][0], shape.i[i][1], i);
  }
  return cloned;
};

export default factory;
