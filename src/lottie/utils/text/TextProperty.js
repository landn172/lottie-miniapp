
import { FontManager } from '../FontManager';
import * as ExpressionTextPropertyDecorator from '../expressions/ExpressionTextPropertyDecorator';

export default class TextProperty {
  constructor(elem, data) {
    this._frameId = -999999;
    this.pv = '';
    this.v = '';
    this.kf = false;
    this._isFirstFrame = true;
    this._mdf = false;
    this.data = data;
    this.elem = elem;
    this.comp = this.elem.comp;
    this.keysIndex = 0;
    this.canResize = false;
    this.minimumFontSize = 1;
    this.effectsSequence = [];
    this.currentData = {
      ascent: 0,
      boxWidth: this.defaultBoxWidth,
      f: '',
      fStyle: '',
      fWeight: '',
      fc: '',
      j: '',
      justifyOffset: '',
      l: [],
      lh: 0,
      lineWidths: [],
      ls: '',
      of: '',
      s: '',
      sc: '',
      sw: 0,
      t: 0,
      tr: 0,
      sz: 0,
      ps: null,
      fillColorAnim: false,
      strokeColorAnim: false,
      strokeWidthAnim: false,
      yOffset: 0,
      finalSize: 0,
      finalText: [],
      finalLineHeight: 0,
      __complete: false

    };
    this.copyData(this.currentData, this.data.d.k[0].s);

    if (!this.searchProperty()) {
      this.completeTextData(this.currentData);
    }
  }

  defaultBoxWidth =[0, 0]

  copyData(obj, data) {
    // eslint-disable-next-line no-restricted-syntax
    for (let s in data) {
      if (data.hasOwnProperty(s)) {
        obj[s] = data[s];
      }
    }
    return obj;
  }

  setCurrentData = function (data) {
    if (!data.__complete) {
      this.completeTextData(data);
    }
    this.currentData = data;
    this.currentData.boxWidth = this.currentData.boxWidth || this.defaultBoxWidth;
    this._mdf = true;
  }

  searchProperty() {
    return this.searchKeyframes();
  }

  searchKeyframes() {
    this.kf = this.data.d.k.length > 1;
    if (this.kf) {
      this.addEffect(this.getKeyframeValue.bind(this));
    }
    return this.kf;
  }

  addEffect(effectFunction) {
    this.effectsSequence.push(effectFunction);
    this.elem.addDynamicProperty(this);
  }

  getValue(_finalValue) {
    if ((this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length) && !_finalValue) {
      return;
    }
    this.currentData.t = this.data.d.k[this.keysIndex].s.t;
    let currentValue = this.currentData;
    let currentIndex = this.keysIndex;
    if (this.lock) {
      this.setCurrentData(this.currentData);
      return;
    }
    this.lock = true;
    this._mdf = false;
    // let multipliedValue;
    let i;
    let len = this.effectsSequence.length;
    let finalValue = _finalValue || this.data.d.k[this.keysIndex].s;
    for (i = 0; i < len; i += 1) {
      // Checking if index changed to prevent creating a new object every time the expression updates.
      if (currentIndex !== this.keysIndex) {
        finalValue = this.effectsSequence[i](finalValue, finalValue.t);
      } else {
        finalValue = this.effectsSequence[i](this.currentData, finalValue.t);
      }
    }
    if (currentValue !== finalValue) {
      this.setCurrentData(finalValue);
    }
    this.pv = this.v = this.currentData;
    this.lock = false;
    this.frameId = this.elem.globalData.frameId;
  }

  getKeyframeValue() {
    let textKeys = this.data.d.k;
    // let textDocumentData;
    let frameNum = this.elem.comp.renderedFrame;
    let i = 0;
    let len = textKeys.length;
    while (i <= len - 1) {
      // textDocumentData = textKeys[i].s;
      if (i === len - 1 || textKeys[i + 1].t > frameNum) {
        break;
      }
      i += 1;
    }
    if (this.keysIndex !== i) {
      this.keysIndex = i;
    }
    return this.data.d.k[this.keysIndex].s;
  }

  buildFinalText(text) {
    let combinedCharacters = FontManager.getCombinedCharacterCodes();
    let charactersArray = [];
    let i = 0;
    let len = text.length;
    let charCode;
    while (i < len) {
      charCode = text.charCodeAt(i);
      if (combinedCharacters.indexOf(charCode) !== -1) {
        charactersArray[charactersArray.length - 1] += text.charAt(i);
      } else if (charCode >= 0xD800 && charCode <= 0xDBFF) {
        charCode = text.charCodeAt(i + 1);
        if (charCode >= 0xDC00 && charCode <= 0xDFFF) {
          charactersArray.push(text.substr(i, 2));
          ++i;
        } else {
          charactersArray.push(text.charAt(i));
        }
      } else {
        charactersArray.push(text.charAt(i));
      }
      i += 1;
    }
    return charactersArray;
  }

  completeTextData(documentData) {
    documentData.__complete = true;
    let fontManager = this.elem.globalData.fontManager;
    let data = this.data;
    let letters = [];
    let i;
    let len;
    let newLineFlag;
    let index = 0;
    let val;
    let anchorGrouping = data.m.g;
    let currentSize = 0;
    let currentPos = 0;
    let currentLine = 0;
    let lineWidths = [];
    let lineWidth = 0;
    let maxLineWidth = 0;
    let j;
    let jLen;
    let fontData = fontManager.getFontByName(documentData.f);
    let charData;
    let cLength = 0;
    let styles = fontData.fStyle ? fontData.fStyle.split(' ') : [];

    let fWeight = 'normal';
    let fStyle = 'normal';
    len = styles.length;
    let styleName;
    for (i = 0; i < len; i += 1) {
      styleName = styles[i].toLowerCase();
      // eslint-disable-next-line default-case
      switch (styleName) {
        case 'italic':
          fStyle = 'italic';
          break;
        case 'bold':
          fWeight = '700';
          break;
        case 'black':
          fWeight = '900';
          break;
        case 'medium':
          fWeight = '500';
          break;
        case 'regular':
        case 'normal':
          fWeight = '400';
          break;
        case 'light':
        case 'thin':
          fWeight = '200';
          break;
      }
    }
    documentData.fWeight = fontData.fWeight || fWeight;
    documentData.fStyle = fStyle;
    documentData.finalSize = documentData.s;
    documentData.finalText = this.buildFinalText(documentData.t);
    len = documentData.finalText.length;
    documentData.finalLineHeight = documentData.lh;
    let trackingOffset = documentData.tr / 1000 * documentData.finalSize;
    let charCode;
    if (documentData.sz) {
      let flag = true;
      let boxWidth = documentData.sz[0];
      let boxHeight = documentData.sz[1];
      let currentHeight;
      let finalText;
      while (flag) {
        finalText = this.buildFinalText(documentData.t);
        currentHeight = 0;
        lineWidth = 0;
        len = finalText.length;
        trackingOffset = documentData.tr / 1000 * documentData.finalSize;
        let lastSpaceIndex = -1;
        for (i = 0; i < len; i += 1) {
          charCode = finalText[i].charCodeAt(0);
          newLineFlag = false;
          if (finalText[i] === ' ') {
            lastSpaceIndex = i;
          } else if (charCode === 13 || charCode === 3) {
            lineWidth = 0;
            newLineFlag = true;
            currentHeight += documentData.finalLineHeight || documentData.finalSize * 1.2;
          }
          if (fontManager.chars) {
            charData = fontManager.getCharData(finalText[i], fontData.fStyle, fontData.fFamily);
            cLength = newLineFlag ? 0 : charData.w * documentData.finalSize / 100;
          } else {
            // tCanvasHelper.font = documentData.s + 'px '+ fontData.fFamily;
            cLength = fontManager.measureText(finalText[i], documentData.f, documentData.finalSize);
          }
          if (lineWidth + cLength > boxWidth && finalText[i] !== ' ') {
            if (lastSpaceIndex === -1) {
              len += 1;
            } else {
              i = lastSpaceIndex;
            }
            currentHeight += documentData.finalLineHeight || documentData.finalSize * 1.2;
            finalText.splice(i, lastSpaceIndex === i ? 1 : 0, '\r');
            // finalText = finalText.substr(0,i) + "\r" + finalText.substr(i === lastSpaceIndex ? i + 1 : i);
            lastSpaceIndex = -1;
            lineWidth = 0;
          } else {
            lineWidth += cLength;
            lineWidth += trackingOffset;
          }
        }
        currentHeight += fontData.ascent * documentData.finalSize / 100;
        if (this.canResize && documentData.finalSize > this.minimumFontSize && boxHeight < currentHeight) {
          documentData.finalSize -= 1;
          documentData.finalLineHeight = documentData.finalSize * documentData.lh / documentData.s;
        } else {
          documentData.finalText = finalText;
          len = documentData.finalText.length;
          flag = false;
        }
      }
    }
    lineWidth = -trackingOffset;
    cLength = 0;
    let uncollapsedSpaces = 0;
    let currentChar;
    for (i = 0; i < len; i += 1) {
      newLineFlag = false;
      currentChar = documentData.finalText[i];
      charCode = currentChar.charCodeAt(0);
      if (currentChar === ' ') {
        val = '\u00A0';
      } else if (charCode === 13 || charCode === 3) {
        uncollapsedSpaces = 0;
        lineWidths.push(lineWidth);
        maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
        lineWidth = -2 * trackingOffset;
        val = '';
        newLineFlag = true;
        currentLine += 1;
      } else {
        val = documentData.finalText[i];
      }
      if (fontManager.chars) {
        charData = fontManager.getCharData(currentChar, fontData.fStyle, fontManager.getFontByName(documentData.f).fFamily);
        cLength = newLineFlag ? 0 : charData.w * documentData.finalSize / 100;
      } else {
        // let charWidth = fontManager.measureText(val, documentData.f, documentData.finalSize);
        // tCanvasHelper.font = documentData.finalSize + 'px '+ fontManager.getFontByName(documentData.f).fFamily;
        cLength = fontManager.measureText(val, documentData.f, documentData.finalSize);
      }

      //
      if (currentChar === ' ') {
        uncollapsedSpaces += cLength + trackingOffset;
      } else {
        lineWidth += cLength + trackingOffset + uncollapsedSpaces;
        uncollapsedSpaces = 0;
      }
      letters.push({
        l: cLength,
        an: cLength,
        add: currentSize,
        n: newLineFlag,
        anIndexes: [],
        val: val,
        line: currentLine,
        animatorJustifyOffset: 0
      });
      if (anchorGrouping === 2) {
        currentSize += cLength;
        if (val === '' || val === '\u00A0' || i === len - 1) {
          if (val === '' || val === '\u00A0') {
            currentSize -= cLength;
          }
          while (currentPos <= i) {
            letters[currentPos].an = currentSize;
            letters[currentPos].ind = index;
            letters[currentPos].extra = cLength;
            currentPos += 1;
          }
          index += 1;
          currentSize = 0;
        }
      } else if (anchorGrouping === 3) {
        currentSize += cLength;
        if (val === '' || i === len - 1) {
          if (val === '') {
            currentSize -= cLength;
          }
          while (currentPos <= i) {
            letters[currentPos].an = currentSize;
            letters[currentPos].ind = index;
            letters[currentPos].extra = cLength;
            currentPos += 1;
          }
          currentSize = 0;
          index += 1;
        }
      } else {
        letters[index].ind = index;
        letters[index].extra = 0;
        index += 1;
      }
    }
    documentData.l = letters;
    maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
    lineWidths.push(lineWidth);
    if (documentData.sz) {
      documentData.boxWidth = documentData.sz[0];
      documentData.justifyOffset = 0;
    } else {
      documentData.boxWidth = maxLineWidth;
      switch (documentData.j) {
        case 1:
          documentData.justifyOffset = -documentData.boxWidth;
          break;
        case 2:
          documentData.justifyOffset = -documentData.boxWidth / 2;
          break;
        default:
          documentData.justifyOffset = 0;
      }
    }
    documentData.lineWidths = lineWidths;

    let animators = data.a;
    let animatorData;
    let letterData;
    jLen = animators.length;
    let based;
    let ind;
    let indexes = [];
    for (j = 0; j < jLen; j += 1) {
      animatorData = animators[j];
      if (animatorData.a.sc) {
        documentData.strokeColorAnim = true;
      }
      if (animatorData.a.sw) {
        documentData.strokeWidthAnim = true;
      }
      if (animatorData.a.fc || animatorData.a.fh || animatorData.a.fs || animatorData.a.fb) {
        documentData.fillColorAnim = true;
      }
      ind = 0;
      based = animatorData.s.b;
      for (i = 0; i < len; i += 1) {
        letterData = letters[i];
        letterData.anIndexes[j] = ind;
        if ((based === 1 && letterData.val !== '') || (based === 2 && letterData.val !== '' && letterData.val !== '\u00A0') || (based === 3 && (letterData.n || letterData.val === '\u00A0' || i === len - 1)) || (based === 4 && (letterData.n || i === len - 1))) {
          if (animatorData.s.rn === 1) {
            indexes.push(ind);
          }
          ind += 1;
        }
      }
      data.a[j].s.totalChars = ind;
      let currentInd = -1;
      let newInd;
      if (animatorData.s.rn === 1) {
        for (i = 0; i < len; i += 1) {
          letterData = letters[i];
          if (currentInd !== letterData.anIndexes[j]) {
            currentInd = letterData.anIndexes[j];
            newInd = indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0];
          }
          letterData.anIndexes[j] = newInd;
        }
      }
    }
    documentData.yOffset = documentData.finalLineHeight || documentData.finalSize * 1.2;
    documentData.ls = documentData.ls || 0;
    documentData.ascent = fontData.ascent * documentData.finalSize / 100;
  }

  updateDocumentData(newData, index) {
    index = index === undefined ? this.keysIndex : index;
    let dData = this.copyData({}, this.data.d.k[index].s);
    dData = this.copyData(dData, newData);
    this.data.d.k[index].s = dData;
    this.recalculate(index);
    this.elem.addDynamicProperty(this);
  }

  recalculate(index) {
    var dData = this.data.d.k[index].s;
    dData.__complete = false;
    this.keysIndex = 0;
    this._isFirstFrame = true;
    this.getValue(dData);
  }

  canResizeFont(_canResize) {
    this.canResize = _canResize;
    this.recalculate(this.keysIndex);
    this.elem.addDynamicProperty(this);
  }

  setMinimumFontSize(_fontValue) {
    this.minimumFontSize = Math.floor(_fontValue) || 1;
    this.recalculate(this.keysIndex);
    this.elem.addDynamicProperty(this);
  }
}

TextProperty.prototype.getExpressionValue = ExpressionTextPropertyDecorator.getExpressionValue;
TextProperty.prototype.searchProperty = ExpressionTextPropertyDecorator.searchProperty;
TextProperty.prototype.searchExpressions = ExpressionTextPropertyDecorator.searchExpressions;
