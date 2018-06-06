import { searchExpressions, getVelocityAtTime, getValueAtTime, getStaticValueAtTime, setGroupProperty } from './Decorator';

function getValueProxy(index, total) {
  this.textIndex = index + 1;
  this.textTotal = total;
  this.getValue();
  return this.v;
}

export default function TextExpressionSelectorProp(elem, data) {
  this.pv = 1;
  this.comp = elem.comp;
  this.elem = elem;
  this.mult = 0.01;
  this.propType = 'textSelector';
  this.textTotal = data.totalChars;
  this.selectorValue = 100;
  this.lastValue = [1, 1, 1];
  searchExpressions.bind(this)(elem, data, this);
  this.getMult = getValueProxy;
  this.getVelocityAtTime = getVelocityAtTime;
  if (this.kf) {
    this.getValueAtTime = getValueAtTime.bind(this);
  } else {
    this.getValueAtTime = getStaticValueAtTime.bind(this);
  }
  this.setGroupProperty = setGroupProperty;
}
