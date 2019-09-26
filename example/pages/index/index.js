import lottie from '../../lottie/index';

Page({
  data: {
    currentValue: '',
    json: [
      {
        name: '本地动画',
        value: "../../data/data1.json.js"
      },
      {
        name: '字母B',
        value: "https://github.com/landn172/lottie-miniapp/files/3146707/data.txt"
      },
      {
        name: '小树',
        value: "https://github.com/landn172/lottie-miniapp/files/3146709/data2.txt"
      },
      {
        name: '字体',
        value: "https://github.com/landn172/lottie-miniapp/files/3147067/font.txt"
      }
    ],
  },
  error(e) {
    console.error(e)
  },
  onChange(e) {
    const idx = e.detail.value * 1
    const value = this.data.json[idx]
    this.setData({
      currentValue: value.name
    })
    this.playLottie(value.value)
  },
  playLottie(lottieData) {
    const ctx = wx.createCanvasContext('test-canvas')
    const l = lottieTest(ctx, lottieData);
    l.addEventListener('loopComplete', ()=>{
      console.log('loopComplete')
    })
  },
  onReady: function() {
    const lottieData = this.options.path
    if (lottieData) {
      this.playLottie(lottieData)
    }
  },
})

function lottieTest(canvasContext, lottieData) {
  if (!canvasContext || !lottieData) return

  lottie.destroy();
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
  if (typeof lottieData === 'string') {
    if (lottieData.startsWith('http')) {
      return lottie.loadAnimation({
        renderer: 'canvas',
        loop: true,
        autoplay: true,
        path: lottieData,
        rendererSettings: {
          context: canvasContext,
          clearCanvas: true
        }
      })
    }
    if (lottieData.startsWith('.')) {
      lottieData = require(lottieData)
    }
  }

  return lottie.loadAnimation({
    renderer: 'canvas',
    loop: true,
    autoplay: true,
    animationData: lottieData,
    rendererSettings: {
      context: canvasContext,
      clearCanvas: true
    }
  })
}
