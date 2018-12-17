import fontAnimateData from '../../data/font.json'

Page({
  data: {
    anidata: null,
    aniPath: '',
    width: 300,
    height: 300
  },
  onReady() {
    func3.call(this)
  }
})

/** 手动调用 init */
function func1() {
  const lottie = this.selectComponent('#lottie')
  const info = wx.getSystemInfoSync()

  lottie.init(fontAnimateData, info.windowWidth, info.windowHeight)
}

/** setData: <lottie animation-data="{{*}}" />  */
function func2() {
  this.setData({
    anidata: fontAnimateData
  })
}

/** 设置请求数据   <lottie path="{{*}}" /> */
function func3() {
  this.setData({
    aniPath: 'https://img1.tuhu.org/ActivityPageAe/dbf1/6269/ee0b86f8cb06bbe58b535eec.json'
  })
}
