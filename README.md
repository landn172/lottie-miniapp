# Lottie for Miniapp

Lottie 小程序版 [LottieWeb](https://github.com/airbnb/lottie-web)

## 说明

小程序版主要依据 LottieWeb 改写，意在解决需要在小程序上播放 lottie 动画，因为工作需要所以写了这库考虑可能大家有这个需求所以开源出来。

目前支持工作上碰到一些简单的 lottie 动画，对于一些复杂动画可能会出现问题，故欢迎提交 issue 并提供对应的动画 json 以供复现，并在有时间精力的情况下会一一修复（由于小程序和 web 的 canvas 实现会有一定的差异导致某些功能无法实现），也欢迎大家提交 pr。

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
import lottie from "lottie-miniapp";

const canvasContext = wx.createCanvasContext("test-canvas");
//  请求到的lottie json数据
const animationData = {};
// 请求lottie的路径。注意开启downloadFile域名并且返回格式是json
const animationPath = "https://xxxxx";

// 指定canvas大小
canvasContext.canvas = {
  width: 100,
  height: 100,
};

// 如果同时指定 animationData 和 path， 优先取 animationData
lottie.loadAnimation({
  renderer: "canvas", // 只支持canvas
  loop: true,
  autoplay: true,
  animationData: animationData,
  path: animationPath,
  rendererSettings: {
    context: canvasContext,
    clearCanvas: true,
  },
});
```

## Component

（v1.4.0）增加小程序自定义组件

### 使用

使用小程序自带 npm 安装组件包

```json
{
  "usingComponents": {
    "lottie": "lottie-miniapp/component/lottie"
  }
}
```

```xml
<lottie id="lottie" path="https://xxxxx" width="300" height="300"/>
```

### 参数

| 参数名        | 描述                                                              | 默认值 |
| ------------- | ----------------------------------------------------------------- | ------ |
| width         | 指定显示宽度                                                      | 100    |
| height        | 指定显示高度                                                      | 100    |
| path          | 请求 lottie 的路径。注意开启 downloadFile 域名并且返回格式是 json | null   |
| animationData | 请求到的 lottie 的 json 数据                                      | null   |
| loop          | 循环播放                                                          | true   |
| autoplay      | 自动播放                                                          | true   |

### 注意

- canvas 默认样式宽高 100%,需要一个 container 指定宽高
- 如果想要获取`lottie`的实例

```js
Page({
  getLottie() {
    const lottieComponent = this.selectComponent("#lottie");
    // here!
    console.log(lottieComponent.lottie);
  },
});
```

### lottie-miniapp@1.9.0

`lottie-miniapp@1.9.0` 起支持 `<canvas type=2d />`。初始化和原来有区别。

** 但是目前不推荐使用，可能会碰到许多问题。 **

#### 使用方式

参考官方示例 https://developers.weixin.qq.com/miniprogram/dev/component/canvas.html

```xml
  <!-- canvas.wxml -->
  <canvas type="2d" id="myCanvas"></canvas>
```

```js
// canvas.js
import lottie from "lottie-miniapp";
Page({
  onReady() {
    const query = wx.createSelectorQuery();
    query
      .select("#myCanvas")
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");

        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        lottie.loadAnimation({
          renderer: "canvas", // 只支持canvas
          loop: true,
          autoplay: true,
          animationData: animationData,
          path: animationPath,
          rendererSettings: {
            // 这里需要填 canvas
            canvas: canvas,
            context: canvasContext,
            clearCanvas: true,
          },
        });
      });
  },
});
```

## 调试

```cmd
yarn run build:debug --watch // 编译文件到example
```
