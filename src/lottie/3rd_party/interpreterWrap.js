// const interpreter = require('./interpreter');
import { run } from './interpreter';

let appendApis = Object.create(null);

export default {
  clearApi() {
    appendApis = Object.create(null);
  },
  appendApis(v = {}) {
    Object.keys(v).forEach(key => {
      appendApis[key] = v[key];
    });
  },
  run(code, appendApi = {}) {
    return run(code, Object.assign(appendApis, appendApi));
  }
};
