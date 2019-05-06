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

```xml
// 指定canvas-id 及 id 需一样
<canvas id="test-canvas" canvas-id="test-canvas"></canvas>
```

```es6
import lottie from 'lottie-miniapp';

const canvasContext = wx.createCanvasContext('test-canvas');
//  请求到的lottie json数据
const animationData = {};
// 请求lottie的路径。注意开启downloadFile域名并且返回格式是json
const animationPath = 'https://xxxxx';

// 指定canvas大小
canvasContext.canvas = {
  width: 100,
  height: 100
};

// 如果同时指定 animationData 和 path， 优先取 animationData
lottie.loadAnimation({
  renderer: 'canvas', // 只支持canvas
  loop: true,
  autoplay: true,
  animationData: animationData,
  path: animationPath,
  rendererSettings: {
    context: canvasContext,
    clearCanvas: true
  }
});
```

## Component

（v1.4.0）增加小程序自定义组件

### 使用

使用小程序自带npm安装组件包

```json
{
    "usingComponents":{
        "lottie": "lottie-miniapp/component/lottie"
    }
}
```

### 参数

| 参数名        | 描述                                                         | 默认值 |
| ------------- | ------------------------------------------------------------ | ------ |
| width         | 指定显示宽度                                                 | 100    |
| height        | 指定显示高度                                                 | 100    |
| path          | 请求lottie的路径。注意开启downloadFile域名并且返回格式是json | null   |
| animationData | 请求到的lottie的json数据                                     | null   |
|               |                                                              |        |

### 注意

- canvas默认样式宽高100%,需要一个container指定宽高


## 调试

```cmd
yarn run build:debug --watch // 编译文件到example
```
