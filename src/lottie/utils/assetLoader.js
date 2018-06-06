export default {
  // load json
  load: function assetLoader(path, callback, error_callback) {
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
