'use strict';

var _index = require('../lottie/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Component({
  properties: {
    width: {
      type: Number,
      value: 100
    },
    height: {
      type: Number,
      value: 100
    },
    path: {
      type: String,
      observer: function observer() {
        this.init();
      }
    },
    animationData: {
      type: Object,
      observer: function observer() {
        this.init();
      }
    },
    loop: {
      type: Boolean,
      value: true
    },
    autoplay: {
      type: Boolean,
      value: true
    }
  },
  ready: function ready() {
    this.init();
  },

  methods: {
    init: function init(animationData) {
      var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.properties.width;
      var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.properties.height;

      var data = animationData || this.properties.animationData;
      var dataPath = this.properties.path;
      if (!data && !dataPath) {
        return;
      }

      this.destory();

      var canvasContext = _index.api.createCanvasContext('lottie-canvas', this);
      canvasContext.canvas = {
        width: width,
        height: height
      };

      this.lottie = _index2.default.loadAnimation({
        renderer: 'canvas', // 只支持canvas
        loop: this.data.loop,
        autoplay: this.data.autoplay,
        animationData: data,
        path: dataPath,
        rendererSettings: {
          context: canvasContext,
          clearCanvas: true
        }
      });
    },
    destory: function destory() {
      if (this.lottie) {
        this.lottie.destroy();
        this.lottie = null;
      }
    }
  },
  detached: function detached() {
    this.destory();
  }
});