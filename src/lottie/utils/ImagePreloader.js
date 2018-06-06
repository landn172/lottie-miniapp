class ImagePreloader {
  constructor() {
    this.assetsPath = '';
    this.path = '';
    this.totalAssets = 0;
    this.totalImages = 0;
    this.loadedAssets = 0;
    this.imagesLoadedCb = null;
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

  loadImage(path, cb) {
    const imageLoaded = this.imageLoaded;
    wx.downloadFile({
      url: path,
      success: (res) => {
        // 本地路径
        cb(res.tempFilePath);
        imageLoaded();
      },
      fail: () => {
        imageLoaded();
      }
    });
  }

  loadAssets(assets, cb) {
    this.imagesLoadedCb = cb;
    this.totalAssets = assets.length;
    const { getAssetsPath, loadImage } = this;
    let i;
    for (i = 0; i < this.totalAssets; i += 1) {
      if (!assets[i].layers) {
        loadImage(getAssetsPath(assets[i]), loadImageCB);
        this.totalImages += 1;
      }
    }
    function loadImageCB(tempFilePath) {
      assets[i] = tempFilePath;
    }
  }

  setPath(path) {
    this.path = path || '';
  }

  setAssetsPath(path) {
    this.assetsPath = path || '';
  }

  destroy() {
    this.imagesLoadedCb = null;
  }
}

export default ImagePreloader;
