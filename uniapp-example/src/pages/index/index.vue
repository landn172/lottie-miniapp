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
      path: `https://github.com/landn172/lottie-miniapp/files/3711191/home_animete.-.txt`,
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
