# Lottie for Miniapp

Lottie 小程序版 [LottieWeb](https://github.com/airbnb/lottie-web)

## 说明

小程序版主要依据LottieWeb改写，意在解决需要在小程序上播放lottie动画，因为工作需要所以写了这库考虑可能大家有这个需求所以开源出来。

目前支持工作上碰到一些简单的lottie动画，对于一些复杂动画可能会出现问题，故欢迎提交issue并提供对应的动画json以供复现，并在有时间精力的情况下会一一修复（由于小程序和web的canvas实现会有一定的差异导致某些功能无法实现），也欢迎大家提交pr。

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
