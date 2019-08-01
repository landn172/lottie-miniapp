// import ExpressionValue from './ExpressionValue';
import { ExpressionPropertyInterface } from './ExpressionValueFactory';

function createEffectsInterface(elem, propertyGroup) {
  if (elem.effectsManager) {
    let effectElements = [];
    let effectsData = elem.data.ef;
    let i;
    let len = elem.effectsManager.effectElements.length;
    for (i = 0; i < len; i += 1) {
      effectElements.push(createGroupInterface(effectsData[i], elem.effectsManager.effectElements[i], propertyGroup, elem));
    }

    return function (name) {
      let effects = elem.data.ef || [];
      // let i = 0;
      // let len = effects.length;
      while (i < len) {
        if (name === effects[i].nm || name === effects[i].mn || name === effects[i].ix) {
          return effectElements[i];
        }
        i += 1;
      }
    };
  }
}

function createGroupInterface(data, elements, propertyGroup, elem) {
  let effectElements = [];
  let i;
  let len = data.ef.length;
  for (i = 0; i < len; i += 1) {
    if (data.ef[i].ty === 5) {
      effectElements.push(createGroupInterface(data.ef[i], elements.effectElements[i], elements.effectElements[i].propertyGroup, elem));
    } else {
      effectElements.push(createValueInterface(elements.effectElements[i], data.ef[i].ty, elem, _propertyGroup));
    }
  }

  let groupInterface = function (name) {
    let effects = data.ef;
    // let i = 0;
    // let len = effects.length;
    while (i < len) {
      if (name === effects[i].nm || name === effects[i].mn || name === effects[i].ix) {
        if (effects[i].ty === 5) {
          return effectElements[i];
        }
        return effectElements[i]();
      }
      i += 1;
    }
    return effectElements[0]();
  };

  function _propertyGroup(val) {
    if (val === 1) {
      return groupInterface;
    }
    return propertyGroup(val - 1);
  }


  groupInterface.propertyGroup = _propertyGroup;

  if (data.mn === 'ADBE Color Control') {
    Object.defineProperty(groupInterface, 'color', {
      get: function () {
        return effectElements[0]();
      }
    });
  }
  Object.defineProperty(groupInterface, 'numProperties', {
    get: function () {
      return data.np;
    }
  });
  groupInterface.active = groupInterface.enabled = data.en !== 0;
  return groupInterface;
}

function createValueInterface(element, type, elem, propertyGroup) {
  var expressionProperty = ExpressionPropertyInterface(element.p);
  function interfaceFunction() {
    if (type === 10) {
      return elem.comp.compInterface(element.p.v);
    }
    return expressionProperty();
  }

  if (element.p.setGroupProperty) {
    element.p.setGroupProperty(propertyGroup);
  }

  return interfaceFunction;
}

let ob = {
  createEffectsInterface: createEffectsInterface
};

export default ob;
