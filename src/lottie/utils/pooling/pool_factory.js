import pooling from './pooling';
import { createSizedArray } from '../index';

export default function (initialLength, _create, _release, _clone) {
  let _length = 0;
  let _maxLength = initialLength;
  let pool = createSizedArray(_maxLength);

  function newElement() {
    let element;
    if (_length) {
      _length -= 1;
      element = pool[_length];
    } else {
      element = _create();
    }
    return element;
  }

  function release(element) {
    if (_length === _maxLength) {
      pool = pooling.double(pool);
      _maxLength *= 2;
    }
    if (_release) {
      _release(element);
    }
    pool[_length] = element;
    _length += 1;
  }

  function clone() {
    let clonedElement = newElement();
    return _clone(clonedElement);
  }

  return {
    clone,
    newElement,
    release
  };
}
