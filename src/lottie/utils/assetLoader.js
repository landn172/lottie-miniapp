export default {
  // load json
  load: function assetLoader(path, callback, error_callback) {
    const self = this;
    if (path.includes('.zip')) {
      // eslint-disable-next-line no-use-before-define
      return loadZipFiles(path)
        .then(({ data, tempDir }) => {
          self.path = tempDir;
          callback(data);
        });
    }
    wx.request({
      url: path,
      success(res) {
        callback(res.data);
      },
      fail(err) {
        if (typeof error_callback !== 'function') return;
        error_callback(err);
      }
    });
  }
};

const fs = wx.getFileSystemManager();

export function downloadZip(url) {
  return new Promise(resolve => {
    wx.downloadFile({
      url,
      success(res) {
        console.log('downloadZip', res);
        resolve(res.tempFilePath);
      }
    });
  });
}

export function unzipFile(tempFilePath, targetPath = `${wx.env.USER_DATA_PATH}/tmp-unzip`) {
  return new Promise(resolve => {
    try {
      fs.rmdirSync(targetPath, true);
    } catch (error) {
      // ignore
    }
    fs.unzip({
      targetPath,
      zipFilePath: tempFilePath,
      success(res) {
        console.log('unzipFile', res);
        resolve({
          targetPath
        });
      },
      fail(err) {
        console.error('unzipFile', err);
      }
    });
  });
}

export function getDirStat(dir) {
  return fs.statSync(dir);
}

export function getFileTree(dir, tree = {}) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = `${dir}/${file}`;
    const Stats = getDirStat(filePath);
    const isDir = Stats.isDirectory();

    if (isDir) {
      tree[file] = getFileTree(filePath);
    } else {
      tree[file] = filePath;
    }
  });
  return tree;
}

export function loadZipFiles(url) {
  let tempDir = '';
  return downloadZip(url)
    .then(tempFilePath => {
      return unzipFile(tempFilePath);
    })
    .then(({ targetPath }) => {
      tempDir = `${targetPath}/`;
      const tree = getFileTree(targetPath);
      const keys = Object.keys(tree);
      const dataJsonPath = keys.find(key => key.endsWith('.json'));
      if (!dataJsonPath) return;
      return {
        tempDir,
        data: JSON.parse(fs.readFileSync(tree[dataJsonPath], 'utf-8') || '{}')
      };
    });
}

