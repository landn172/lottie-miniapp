import { createSizedArray } from '../index';

function MaskInterface(mask, data) {
  this._mask = mask;
  this._data = data;
}
Object.defineProperty(MaskInterface.prototype, 'maskPath', {
  get: function () {
    if (this._mask.prop.k) {
      this._mask.prop.getValue();
    }
    return this._mask.prop;
  }
});

export default function (maskManager) {
  let _masksInterfaces = createSizedArray(maskManager.viewData.length);
  let i;
  let len = maskManager.viewData.length;
  for (i = 0; i < len; i += 1) {
    _masksInterfaces[i] = new MaskInterface(maskManager.viewData[i], maskManager.masksProperties[i]);
  }

  let maskFunction = function (name) {
    i = 0;
    while (i < len) {
      if (maskManager.masksProperties[i].nm === name) {
        return _masksInterfaces[i];
      }
      i += 1;
    }
  };
  return maskFunction;
}
