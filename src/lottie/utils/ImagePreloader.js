/* eslint-disable no-console */
import api, { getUserDataPath } from '../platform/index';

class ImagePreloader {
  constructor() {
    this.assetsPath = '';
    this.path = '';
    this.totalAssets = 0;
    this.totalImages = 0;
    this.loadedAssets = 0;
    this.imagesLoadedCb = null;
    // canvas type=2d 需要指定
    this.canvas = null;
    this.images = [];
  }

  imageLoaded() {
    this.loadedAssets += 1;
    if (this.loadedAssets === this.totalImages) {
      if (this.imagesLoadedCb) {
        this.imagesLoadedCb(null);
      }
    }
  }

  getAssetsPath(assetData) {
    let path = '';
    if (assetData.e) {
      path = assetData.p;
    } else if (this.assetsPath) {
      let imagePath = assetData.p;
      if (imagePath.indexOf('images/') !== -1) {
        imagePath = imagePath.split('/')[1];
      }
      path = this.assetsPath + imagePath;
    } else {
      path = this.path;
      path += assetData.u ? assetData.u : '';
      path += assetData.p;
    }
    return path;
  }

  getImage(assetData) {
    let i = 0;
    const len = this.images.length;
    while (i < len) {
      if (this.images[i].assetData === assetData) {
        return this.images[i].img;
      }
      i += 1;
    }
  }

  createImageData(assetData) {
    const path = this.getAssetsPath(assetData, this.assetsPath, this.path);
    const img = {
      src: path
    };
    this.loadImage(path, (tmpPath) => {
      if (tmpPath) {
        if (this.canvas && this.canvas.createImage) {
          const image = this.canvas.createImage();
          new Promise(resolve => {
            image.onload = resolve;
            image.onerror = resolve;
            img.src = image;
            image.src = tmpPath;
          }).then(() => this.imageLoaded());
          return;
        }

        new Promise(resolve => api.getImageInfo({
          src: tmpPath,
          success(res) {
            const { width, height } = res;
            img.src = tmpPath;
            img.width = width;
            img.height = height;
          },
          complete: resolve
        })).then(() => this.imageLoaded());
      }
    });
    const ob = {
      img,
      assetData
    };
    return ob;
  }

  loadImage(path, cb) {
    const imageLoaded = this.imageLoaded.bind(this);
    // 读取base64图片
    if (path.startsWith('data:')) {
      loadBase64Image(path)
        .then(filePath => {
          console.log('loadImage base64', filePath);
          cb(filePath);
        }, (err) => {
          console.log('loadBase64Image:fail', err);
          cb();
        });
    } else if (path.startsWith('http')) {
      // 下载网络图片
      api.downloadFile({
        url: path,
        success: (res) => {
          // 本地路径
          cb(res.tempFilePath);
        },
        fail: () => {
          cb();
          imageLoaded();
        }
      });
    } else {
      // 读取本地文件
      cb(path);
    }
  }

  loaded() {
    return this.totalImages === this.loadedAssets;
  }

  loadAssets(assets, cb) {
    this.imagesLoadedCb = cb;
    let i;
    let len = assets.length;
    for (i = 0; i < len; i += 1) {
      if (!assets[i].layers) {
        this.images.push(this.createImageData(assets[i]));
        this.totalImages += 1;
      }
    }
  }

  setPath(path) {
    this.path = path || '';
  }

  setAssetsPath(path) {
    this.assetsPath = path || '';
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  destroy() {
    this.imagesLoadedCb = null;
    this.images.length = 0;
  }
}

function easyHashCode(str = '') {
  const len = str.length;
  let i = 0;
  let hash = 0;
  while (i < len) {
    const character = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + character;
    hash = hash & hash;
    i++;
  }
  return Math.abs(`${hash}`.toString(16));
}

function loadBase64Image(base64data) {
  return new Promise((resolve, reject) => {
    const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
    if (!format) {
      return reject(new Error('ERROR_BASE64SRC_PARSE'));
    }

    const buffer = api.base64ToArrayBuffer(bodyData);
    const fsm = api.getFileSystemManager();
    // 没有fsm 或者 支付宝
    if (!fsm || (typeof my !== 'undefined' && !!my.ap)) {
      // if (!fsm) {
      try {
        return resolve(new Uint8ClampedArray(buffer));
      } catch (error) {
        return reject();
      }
    }
    const filename = `lottie-${easyHashCode(bodyData)}`;
    const filePath = `${getUserDataPath()}/${filename}.${format}`;
    try {
      // 如果已经存在缓存, 直接缓存
      if (fsm.accessSync(filePath)) {
        return resolve(filePath);
      }
    } catch (error) {
      // @ignore
    }

    fsm.writeFile({
      filePath,
      data: buffer,
      encoding: 'binary',
      success() {
        resolve(filePath);
      },
      fail(res) {
        console.error(res.errMsg);
        reject(new Error('ERROR_BASE64SRC_WRITE'));
      }
    });
  });
}

export default ImagePreloader;
