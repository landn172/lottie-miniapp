import api from '../platform/index';

/* eslint-disable vars-on-top */
var emptyChar = {
  w: 0,
  size: 0,
  shapes: []
};
var combinedCharacters = [];
// Hindi characters
combinedCharacters = combinedCharacters.concat([2304, 2305, 2306, 2307, 2362, 2363, 2364, 2364, 2366,
  2367, 2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379,
  2380, 2381, 2382, 2383, 2387, 2388, 2389, 2390, 2391, 2402, 2403]);

class Font {
  constructor() {
    this.fonts = [];
    this.chars = null;
    this.typekitLoaded = 0;
    this.isLoaded = false;
    this.initTime = Date.now();
  }

  static getCombinedCharacterCodes() {
    return combinedCharacters;
  }

  addChars(chars) {
    if (!chars) {
      return;
    }
    if (!this.chars) {
      this.chars = [];
    }
    var i;
    var len = chars.length;
    var j;
    var jLen = this.chars.length;
    var found;

    for (i = 0; i < len; i += 1) {
      j = 0;
      found = false;
      while (j < jLen) {
        if (this.chars[j].style === chars[i].style && this.chars[j].fFamily === chars[i].fFamily && this.chars[j].ch === chars[i].ch) {
          found = true;
        }
        j += 1;
      }
      if (!found) {
        this.chars.push(chars[i]);
        jLen += 1;
      }
    }
  }

  addFonts(fontData, /* defs */) {
    if (!fontData) {
      this.isLoaded = true;
      return;
    }
    if (this.chars) {
      this.isLoaded = true;
      this.fonts = fontData.list;
      return;
    }

    const fontArr = fontData.list;
    let i;
    const len = fontArr.length;
    let _pendingFonts = len;
    for (i = 0; i < len; i += 1) {
      var shouldLoadFont = true;
      fontArr[i].loaded = false;
      fontArr[i].monoCase = this.setUpNode(fontArr[i].fFamily, 'monospace');
      fontArr[i].sansCase = this.setUpNode(fontArr[i].fFamily, 'sans-serif');
      if (!fontArr[i].fPath) {
        fontArr[i].loaded = true;
        _pendingFonts -= 1;
      } else if (fontArr[i].fOrigin === 'p' || fontArr[i].origin === 3) {
        if (shouldLoadFont) {
          if (api.loadFontFace) {
            api.loadFontFace({
              family: fontArr[i].fFamily,
              source: fontArr[i].fPath,
              fail(e) {
                console.error(e);
              }
            });
          } else {
            console.warn('下载字体文件方法：wx.loadFontFace 基础库 2.1.0 开始支持');
          }
        }
      } else if (fontArr[i].fOrigin === 't' || fontArr[i].origin === 2) {
        console.warn('not support');
        // Font is already loaded
        shouldLoadFont = false;
      }

      // fontArr[i].helper = createHelper(defs, fontArr[i]);
      fontArr[i].cache = {};
      this.fonts.push(fontArr[i]);
    }

    if (_pendingFonts === 0) {
      this.isLoaded = true;
    } else {
      // On some cases even if the font is loaded, it won't load correctly when measuring text on canvas.
      // Adding this timeout seems to fix it
      setTimeout(this.checkLoadedFonts.bind(this), 100);
    }
  }

  setUpNode(font, family) {
    console.log(font, family);
  }

  checkLoadedFonts() {
    // ignore
  }

  getCharData(char, style, font) {
    let i = 0;
    if (!this.chars) {
      return emptyChar;
    }
    const len = this.chars.length;
    while (i < len) {
      if (this.chars[i].ch === char && this.chars[i].style === style && this.chars[i].fFamily === font) {
        return this.chars[i];
      }
      i += 1;
    }
    if ((typeof char === 'string' && char.charCodeAt(0) !== 13 || !char) && console && console.warn) {
      console.warn('Missing character from exported characters list: ', char, style, font);
    }
    return emptyChar;
  }

  getFontByName(name) {
    let i = 0;
    const len = this.fonts.length;
    while (i < len) {
      if (this.fonts[i].fName === name) {
        return this.fonts[i];
      }
      i += 1;
    }
    return this.fonts[0];
  }

  measureText(/* char, fontName, size */) {
    return 0;
  }

  loaded() {
    return this.isLoaded;
  }
}

export { Font, Font as FontManager };
