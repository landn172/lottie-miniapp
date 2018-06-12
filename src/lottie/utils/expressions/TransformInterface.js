import ExpressionValue from './ExpressionValue';

const degToRads = Math.PI / 180;

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
    get: function rotation() {
      if (transform.r) {
        return ExpressionValue(transform.r, 1 / degToRads);
      }
      return ExpressionValue(transform.rz, 1 / degToRads);
    }
  });

  Object.defineProperty(thisFunction, 'xRotation', {
    get: function () {
      return ExpressionValue(transform.rx, 1 / degToRads);
    }
  });

  Object.defineProperty(thisFunction, 'yRotation', {
    get: function () {
      return ExpressionValue(transform.ry, 1 / degToRads);
    }
  });
  Object.defineProperty(thisFunction, 'scale', {
    get: function () {
      return ExpressionValue(transform.s, 100);
    }
  });

  Object.defineProperty(thisFunction, 'position', {
    get: function () {
      if (transform.p) {
        return ExpressionValue(transform.p);
      }
      return [transform.px.v, transform.py.v, transform.pz ? transform.pz.v : 0];
    }
  });

  Object.defineProperty(thisFunction, 'xPosition', {
    get: function () {
      return ExpressionValue(transform.px);
    }
  });

  Object.defineProperty(thisFunction, 'yPosition', {
    get: function () {
      return ExpressionValue(transform.py);
    }
  });

  Object.defineProperty(thisFunction, 'zPosition', {
    get: function () {
      return ExpressionValue(transform.pz);
    }
  });

  Object.defineProperty(thisFunction, 'anchorPoint', {
    get: function () {
      return ExpressionValue(transform.a);
    }
  });

  Object.defineProperty(thisFunction, 'opacity', {
    get: function () {
      return ExpressionValue(transform.o, 100);
    }
  });

  Object.defineProperty(thisFunction, 'skew', {
    get: function () {
      return ExpressionValue(transform.sk);
    }
  });

  Object.defineProperty(thisFunction, 'skewAxis', {
    get: function () {
      return ExpressionValue(transform.sa);
    }
  });

  Object.defineProperty(thisFunction, 'orientation', {
    get: function () {
      return ExpressionValue(transform.or);
    }
  });

  return thisFunction;
};
