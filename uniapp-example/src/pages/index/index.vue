<template>
  <canvas
    id="test-canvas"
    canvas-id="test-canvas"
    class="test-canvas"
    binderror="error"
  ></canvas>
</template>

<script>
import lottie from 'lottie-miniapp';

export default {
  data() {
    return {
      title: 'Hello'
    };
  },
  onReady() {
    const canvasContext = wx.createCanvasContext('test-canvas');
    canvasContext.canvas = {
      width: 200,
      height: 200
    };

    lottie.loadAnimation({
      renderer: 'canvas', // 只支持canvas
      loop: true,
      autoplay: true,
      path: `http://172.16.234.74:8080/157/data.json`,
      rendererSettings: {
        context: canvasContext,
        clearCanvas: true
      }
    });
  },
  methods: {}
};
</script>

<style>
.test-canvas {
  height: 200px;
  width: 200px;
}
</style>
