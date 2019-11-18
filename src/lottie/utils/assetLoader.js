/* eslint-disable no-console */
import api, { getUserDataPath } from '../platform/index';
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
        }).catch((err) => {
          if (typeof error_callback !== 'function') return;
          error_callback(err);
        });
    }
    api.request({
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

const fs = typeof api.getFileSystemManager === 'function' ? api.getFileSystemManager() : {};

export function downloadZip(url) {
  return new Promise(resolve => {
    api.downloadFile({
      url,
      success(res) {
        console.log('downloadZip', res);
        resolve(res.tempFilePath);
      }
    });
  });
}

/**
 * 确保路径存在
 */
function ensureDir(dir) {
  const dirs = dir.split('/');
  let len = dirs.length;
  let i = 1;
  while (i <= len) {
    const targetPath = dirs.slice(0, i).join('/');
    try {
      fs.mkdirSync(targetPath);
    } catch (error) {
      console.warn(`ensureDir [${targetPath}]`, error);
    }
    i++;
  }
}

export function unzipFile(tempFilePath, targetPath = `${getUserDataPath()}/tmp-unzip`) {
  return new Promise(resolve => {
    ensureDir(targetPath);
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
  const unzipDir = `${getUserDataPath()}/tmp-unzip/${easyHashCode(url)}`;
  return downloadZip(url)
    .then(tempFilePath => {
      return unzipFile(tempFilePath, unzipDir);
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
