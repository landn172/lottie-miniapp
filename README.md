# Lottie for Miniapp

Lottie 小程序版 [LottieWeb](https://github.com/airbnb/lottie-web)

## 使用

安装

```cmd
  npm i -S lottie-miniapp
```

使用

```es6
import lottie from 'lottie-miniapp';

const canvasContext = wx.createCanvasContext('test-canvas');
//  请求到的lottie json数据
const animationData = {};

// 指定canvas大小
canvasContext.canvas = {
  width: 100,
  height: 100
};

lottie.loadAnimation({
  renderer: 'canvas', // 只支持canvas
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    context: canvasContext,
    clearCanvas: true
  }
});
```

## 调试

```cmd
yarn run build:debug --watch // 编译文件到example
```