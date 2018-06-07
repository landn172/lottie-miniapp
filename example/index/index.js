import lottie, { configProxy, proxyCtx } from '../lottie/index'
import animationData from '../data/data2.json'

const app = getApp()

Page({
  data: {

  },
  error(e) {
    console.error(e)
  },
  onReady: function() {
    const canvasContext = wx.createCanvasContext('test-canvas')
    const ctx = canvasContext
    // proxyCtx(ctx)
    lottieTest(ctx)
  },
})

function lottieTest(canvasContext) {

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

  lottie.loadAnimation({
    renderer: 'canvas',
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      context: canvasContext,
      clearCanvas: true
    }
  })
}
