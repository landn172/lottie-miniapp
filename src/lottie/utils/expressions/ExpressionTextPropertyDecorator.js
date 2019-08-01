import ExpressionManager from './ExpressionManager';

export function searchExpressions() {
  if (this.data.d.x) {
    this.calculateExpression = ExpressionManager.initiateExpression.bind(this)(this.elem, this.data.d, this);
    this.addEffect(this.getExpressionValue.bind(this));
    return true;
  }
}

export function getExpressionValue(currentValue, text) {
  var newValue = this.calculateExpression(text);
  if (currentValue.t !== newValue) {
    let newData = {};
    this.copyData(newData, currentValue);
    newData.t = newValue.toString();
    newData.__complete = false;
    return newData;
  }
  return currentValue;
}

export function searchProperty() {
  var isKeyframed = this.searchKeyframes();
  var hasExpressions = this.searchExpressions();
  this.kf = isKeyframed || hasExpressions;
  return this.kf;
}
