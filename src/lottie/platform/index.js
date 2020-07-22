// @jgb-ignore
import { getEnvObj } from '../utils/getEnvObj';
import wxToAliApi from './wx2ali';


export function canvasPutImageData({
  canvasContext, data, x, y, width, height
}) {
  if (canvasContext.canvasPutImageData) {
    canvasContext.canvasPutImageData({
      canvasId: canvasContext.canvasId || '',
      data,
      x,
      y,
      width,
      height
    });
  } else {
    // 支付宝
    canvasContext.putImageData({
      data,
      x,
      y,
      width,
      height
    });
  }
}

const api = { ...getEnvObj() };

export function getUserDataPath() {
  try {
    return api.env.USER_DATA_PATH;
  } catch (error) {
    console.warn('getUserDataPath error');
    return '/USER_DATA_PATH';
  }
}

if (!api.getFileSystemManager) {
  api.getFileSystemManager = () => {
    // eslint-disable-next-line no-console
    console.warn('当前小程序不支持 getFileSystemManager');
  };
}

if (!api.base64ToArrayBuffer) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  api.base64ToArrayBuffer = (base64) => {
    let bufferLength = base64.length * 0.75;
    let len = base64.length; let i; let p = 0;
    let encoded1; let encoded2; let encoded3; let encoded4;

    if (base64[base64.length - 1] === '=') {
      bufferLength--;
      if (base64[base64.length - 2] === '=') {
        bufferLength--;
      }
    }

    let arraybuffer = new ArrayBuffer(bufferLength);
    let bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i += 4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i + 1)];
      encoded3 = lookup[base64.charCodeAt(i + 2)];
      encoded4 = lookup[base64.charCodeAt(i + 3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
}

// 支付宝
if (api.ap) {
  Object.keys(wxToAliApi).forEach(key => {
    api[key] = wxToAliApi[key];
  });
}

export default api;
