import lottie, { configProxy, proxyCtx } from '../../lottie/index'
import animationData from '../../data/data2.json';
import imageLoadAnimateData from '../../data/image.json';
import fontAnimateData from '../../data/font.json'

const app = getApp()

Page({
  data: {

  },
  error(e) {
    console.error(e)
  },
  onReady: function(opts = {}) {
    const canvasContext = wx.createCanvasContext('test-canvas')
    const ctx = canvasContext
    // proxyCtx(ctx)
    lottieTest(ctx, opts)
  },
})

function lottieTest(canvasContext, opts) {

  const systemInfo = wx.getSystemInfoSync()

  const context = canvasContext

  canvasContext.canvas = {
    width: systemInfo.windowWidth,
    height: systemInfo.windowHeight
  }

  Object.defineProperty(canvasContext, 'globalAlpha', {
    get() {
      return this._globalAlpha
    },
    set(value) {
      this._globalAlpha = value
    }
  })
  canvasContext.globalAlpha = 1
  const { path } = opts

  lottie.loadAnimation({
    renderer: 'canvas',
    loop: true,
    autoplay: true,
    animationData: !path ? fontAnimateData : '',
    path,
    rendererSettings: {
      context: canvasContext,
      clearCanvas: true
    }
  })
}
