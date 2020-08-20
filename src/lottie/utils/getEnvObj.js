// @jgb-ignore
export function getEnvObj() {
  if (typeof wx !== 'undefined' && ('getSystemInfo' in wx) && typeof wx.getSystemInfo === 'function') {
    return wx;
  }
  if (typeof my !== 'undefined' && typeof my.getSystemInfo === 'function') {
    return my;
  }
  if (typeof swan !== 'undefined' && typeof swan.getSystemInfo === 'function') {
    return swan;
  }
  if (typeof qq !== 'undefined' && typeof qq.getSystemInfo === 'function') {
    return qq;
  }
  if (typeof tt !== 'undefined' && typeof tt.getSystemInfo === 'function') {
    return tt;
  }
  console.log('in uni');
}
