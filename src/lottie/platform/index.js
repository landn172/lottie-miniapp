// @jgb-ignore
import { getEnvObj } from '../utils/getEnvObj';
import wxToAliApi from './wx2ali';

export function getUserDataPath() {
  return wx.env.USER_DATA_PATH;
}

const api = { ...getEnvObj() };

if (!api.getFileSystemManager) {
  api.getFileSystemManager = () => {
  };
}

// 支付宝
if (api.ap) {
  Object.keys(wxToAliApi).forEach(key => {
    api[key] = wxToAliApi[key];
  });
}

export default api;
