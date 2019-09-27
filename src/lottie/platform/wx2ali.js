import { getEnvObj } from '../utils/getEnvObj';

const ALI_OBJ = getEnvObj();

/**
 * @param {Object} opts 原参数
 * @param {Function} getOptions 获取 success 回调修改后的参数
 */
const handleSuccess = (opts, getOptions = noop, thisObj) => {
  if (!opts.success) {
    return;
  }
  const _this = thisObj;
  const cacheSuc = opts.success;
  opts.success = res => {
    const changedRes = getOptions(res) || res;
    cacheSuc.call(_this, changedRes);
  };
};

function noop() {
}

const wxToAliApi = {
  /**
   * 网络
   */

  request(options = {}) {
    const opts = changeOpts(options, {
      header: 'headers'
    });

    handleSuccess(opts, res => {
      return changeOpts(res, {
        headers: 'header',
        status: 'statusCode'
      });
    });

    // request 在 1.11.0 以上版本才支持
    // httpRequest 即将被废弃，钉钉端仍需要使用
    if (ALI_OBJ.canIUse('request')) {
      return ALI_OBJ.request(opts);
    }
    return ALI_OBJ.httpRequest(opts);
  },
  downloadFile(options = {}) {
    const opts = changeOpts(options);

    handleSuccess(opts, res => {
      return changeOpts(res, {
        apFilePath: 'tempFilePath'
      });
    });

    return ALI_OBJ.downloadFile(opts);
  }
};

export default wxToAliApi;

function changeOpts(options, updateOrRemoveOpt = {}, extraOpt = {}) {
  let opts = {};

  Object.keys(options).forEach(key => {
    let myKey = Object.prototype.hasOwnProperty.call(updateOrRemoveOpt, key) ? updateOrRemoveOpt[key] : key;
    if (myKey !== '') {
      opts[myKey] = options[key];
    }
  });

  opts = { ...opts, ...extraOpt };

  return opts;
}
