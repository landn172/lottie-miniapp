import pool_factory from './pool_factory';
import { defaultCurveSegments, createTypedArray } from '../index';

export default pool_factory(0, function create() {
  return {
    addedLength: 0,
    percents: createTypedArray('float32', defaultCurveSegments),
    lengths: createTypedArray('float32', defaultCurveSegments)
  };
});
