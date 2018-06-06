import { createSizedArray } from '../index';

function double(arr) {
  return arr.concat(createSizedArray(arr.length));
}

export default {
  double: double
};
