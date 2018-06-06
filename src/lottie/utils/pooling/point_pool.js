import { createTypedArray } from '../index';
import pool_factory from './pool_factory';

function create() {
  return createTypedArray('float32', 2);
}

const point_pool = pool_factory(8, create);

export default point_pool;
