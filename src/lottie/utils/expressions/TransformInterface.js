import { ExpressionPropertyInterface } from '../expressions/ExpressionValueFactory';

export default (transform) => {
  /* eslint consistent-return: 0 */
  function thisFunction(name) {
    switch (name) {
      case 'scale':
      case 'Scale':
      case 'ADBE Scale':
      case 6:
        return thisFunction.scale;
      case 'rotation':
      case 'Rotation':
      case 'ADBE Rotation':
      case 'ADBE Rotate Z':
      case 10:
        return thisFunction.rotation;
      case 'ADBE Rotate X':
        return thisFunction.xRotation;
      case 'ADBE Rotate Y':
        return thisFunction.yRotation;
      case 'position':
      case 'Position':
      case 'ADBE Position':
      case 2:
        return thisFunction.position;
      case 'ADBE Position_0':
        return thisFunction.xPosition;
      case 'ADBE Position_1':
        return thisFunction.yPosition;
      case 'ADBE Position_2':
        return thisFunction.zPosition;
      case 'anchorPoint':
      case 'AnchorPoint':
      case 'Anchor Point':
      case 'ADBE AnchorPoint':
      case 1:
        return thisFunction.anchorPoint;
      case 'opacity':
      case 'Opacity':
      case 11:
        return thisFunction.opacity;
      default:
        break;
    }
  }

  Object.defineProperty(thisFunction, 'rotation', {
    get: ExpressionPropertyInterface(transform.r || transform.rz)
  });

  Object.defineProperty(thisFunction, 'zRotation', {
    get: ExpressionPropertyInterface(transform.rz || transform.r)
  });

  Object.defineProperty(thisFunction, 'xRotation', {
    get: ExpressionPropertyInterface(transform.rx)
  });

  Object.defineProperty(thisFunction, 'yRotation', {
    get: ExpressionPropertyInterface(transform.ry)
  });
  Object.defineProperty(thisFunction, 'scale', {
    get: ExpressionPropertyInterface(transform.s)
  });

  let _transformFactory;
  if (transform.p) {
    _transformFactory = ExpressionPropertyInterface(transform.p);
  }
  Object.defineProperty(thisFunction, 'position', {
    get: function () {
      if (transform.p) {
        return _transformFactory();
      }
      return [transform.px.v, transform.py.v, transform.pz ? transform.pz.v : 0];
    }
  });

  Object.defineProperty(thisFunction, 'xPosition', {
    get: ExpressionPropertyInterface(transform.px)
  });

  Object.defineProperty(thisFunction, 'yPosition', {
    get: ExpressionPropertyInterface(transform.py)
  });

  Object.defineProperty(thisFunction, 'zPosition', {
    get: ExpressionPropertyInterface(transform.pz)
  });

  Object.defineProperty(thisFunction, 'anchorPoint', {
    get: ExpressionPropertyInterface(transform.a)
  });

  Object.defineProperty(thisFunction, 'opacity', {
    get: ExpressionPropertyInterface(transform.o)
  });

  Object.defineProperty(thisFunction, 'skew', {
    get: ExpressionPropertyInterface(transform.sk)
  });

  Object.defineProperty(thisFunction, 'skewAxis', {
    get: ExpressionPropertyInterface(transform.sa)
  });

  Object.defineProperty(thisFunction, 'orientation', {
    get: ExpressionPropertyInterface(transform.or)
  });

  return thisFunction;
};
