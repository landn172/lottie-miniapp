// @jgb-ignore
import { getEnvObj } from '../utils/getEnvObj';
import wxToAliApi from './wx2ali';

export function getUserDataPath() {
  try {
    return wx.env.USER_DATA_PATH;
  } catch (error) {
    console.warn('getUserDataPath error');
    return '/';
  }
}

const api = { ...getEnvObj() };

if (!api.getFileSystemManager) {
  api.getFileSystemManager = () => {
    // eslint-disable-next-line no-console
    console.warn('当前小程序不支持 getFileSystemManager');
  };
}

// 支付宝
if (api.ap) {
  Object.keys(wxToAliApi).forEach(key => {
    api[key] = wxToAliApi[key];
  });
}

export default api;
