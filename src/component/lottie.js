
import lottie, { api } from '../lottie/index.js';

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
      observer() {
        this.init();
      }
    },
    animationData: {
      type: Object,
      observer() {
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
  ready() {
    this.init();
  },
  methods: {
    init(animationData, width = this.properties.width, height = this.properties.height) {
      const data = animationData || this.properties.animationData;
      const dataPath = this.properties.path;
      if (!data && !dataPath) {
        return;
      }

      this.destory();

      let canvasContext = api.createCanvasContext('lottie-canvas', this);
      canvasContext.canvas = {
        width: width,
        height: height
      };

      this.lottie = lottie.loadAnimation({
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
    destory() {
      if (this.lottie) {
        this.lottie.destroy();
        this.lottie = null;
      }
    }
  },
  detached() {
    this.destory();
  }
});
