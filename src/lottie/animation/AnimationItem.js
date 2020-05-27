/* eslint-disable no-unused-expressions */
import api from '../platform/index';
import CanvasRenderer from '../renderers/CanvasRenderer';
import assetLoader from '../utils/assetLoader';
import BaseEvent from '../utils/BaseEvent';
import {
  BMCompleteEvent, BMCompleteLoopEvent, BMDestroyEvent, BMEnterFrameEvent, BMSegmentStartEvent
} from '../utils/common';
import dataManager from '../utils/DataManager';
import expressionsPlugin from '../utils/expressions/Expressions';
import ImagePreloader from '../utils/ImagePreloader';
import { randomString, subframeEnabled } from '../utils/index';
import ProjectInterface from '../utils/ProjectInterface';

class AnimationItem extends BaseEvent {
  constructor() {
    super();
    this._cbs = [];
    this.name = '';
    this.path = '';
    this.isLoaded = false;
    this.currentFrame = 0;
    this.currentRawFrame = 0;
    this.totalFrames = 0;
    this.frameRate = 0;
    this.frameMult = 0;
    this.playSpeed = 1;
    this.playDirection = 1;
    this.pendingElements = 0;
    this.playCount = 0;
    this.animationData = {};
    this.assets = [];
    this.isPaused = true;
    this.autoplay = false;
    this.loop = true;
    this.renderer = null;
    this.animationID = randomString(10);
    this.assetsPath = '';
    this.timeCompleted = 0;
    this.segmentPos = 0;
    this.subframeEnabled = subframeEnabled;
    this.segments = [];
    this._idle = true;
    this.projectInterface = ProjectInterface();
    this.imagePreloader = new ImagePreloader();
  }

  fixMissingApi(context) {
    [{
      fn: 'setGlobalAlpha',
      key: 'globalAlpha'
    }, {
      fn: 'setFillStyle',
      key: 'fillStyle'
    }, {
      fn: 'setFontSize',
      key: 'font'
    }, {
      fn: 'setLineCap',
      key: 'lineCap'
    }, {
      fn: 'setLineJoin',
      key: 'lineJoin'
    }, {
      fn: 'setLineWidth',
      key: 'lineWidth'
    }, {
      fn: 'setMiterLimit',
      key: 'miterLimit'
    }, {
      fn: 'setStrokeStyle',
      key: 'strokeStyle'
    }/* {
      fn: 'setLineDash',
      key: 'lineDashOffset'
    } */].forEach(({ fn, key }) => {
      if (typeof context[fn] !== 'function') {
        Object.defineProperty(context, fn, {
          value: function (value) {
            context[key] = value;
          }
        });
      }
    });
  }

  setParams(params) {
    this.fixMissingApi(params.rendererSettings.context);
    // 小程序中一些api需要context， 指向Page或者Component
    if (params.context) {
      this.context = params.context;
    }

    if (params.wrapper || params.container) {
      this.wrapper = params.wrapper || params.container;
    }

    this.renderer = new CanvasRenderer(this, params.rendererSettings);
    this.renderer.setProjectInterface(this.projectInterface);
    this.animType = 'canvas';

    if (params.loop === '' || params.loop === null) {
      this.loop = false;
    } else if (params.loop === false) {
      this.loop = false;
    } else if (params.loop === true) {
      this.loop = true;
    } else {
      this.loop = parseInt(params.loop, 10);
    }
    this.autoplay = 'autoplay' in params ? params.autoplay : true;
    this.hasTriggerplay = false;
    this.name = params.name ? params.name : '';
    this.autoloadSegments = params.autoloadSegments ? params.autoloadSegments : true;
    this.assetsPath = params.assetsPath;
    if (params.animationData) {
      this.configAnimation(params.animationData);
    } else if (params.path) {
      if (params.path.lastIndexOf('.zip') === -1) {
        if (params.path.substr(-4) !== 'json') {
          if (params.path.substr(-1, 1) !== '/') {
            params.path += '/';
          }
          params.path += 'data.json';
        }
      }

      if (params.path.lastIndexOf('\\') !== -1) {
        this.path = params.path.substr(0, params.path.lastIndexOf('\\') + 1);
      } else {
        this.path = params.path.substr(0, params.path.lastIndexOf('/') + 1);
      }
      this.fileName = params.path.substr(params.path.lastIndexOf('/') + 1);
      this.fileName = this.fileName.substr(0, this.fileName.lastIndexOf('.json'));

      assetLoader.load.call(this, params.path, this.configAnimation.bind(this), function () {
        this.trigger('data_failed');
      }.bind(this));
    }

    // 判断是否在可视区域内
    if (api.createIntersectionObserver) {
      const canvasId = params.rendererSettings.context.canvasId;
      const observer = api.createIntersectionObserver(this.context);
      this.$observer = observer;
      observer.relativeToViewport({
        bottom: 10,
        top: 10,
        left: 0,
        right: 10
      }).observe(`#${canvasId}`, (res) => {
        if (!this.hasTriggerplay) return;
        if (res.intersectionRatio > 0) {
          this.play();
        } else {
          this.stop();
        }
      });
    }
  }

  includeLayers(data) {
    if (data.op > this.animationData.op) {
      this.animationData.op = data.op;
      this.totalFrames = Math.floor(data.op - this.animationData.ip);
    }
    let layers = this.animationData.layers;
    let i;
    let len = layers.length;
    let newLayers = data.layers;
    let j;
    let jLen = newLayers.length;
    for (j = 0; j < jLen; j += 1) {
      i = 0;
      while (i < len) {
        if (layers[i].id === newLayers[j].id) {
          layers[i] = newLayers[j];
          break;
        }
        i += 1;
      }
    }
    if (data.chars || data.fonts) {
      this.renderer.globalData.fontManager.addChars(data.chars);
      this.renderer.globalData.fontManager.addFonts(data.fonts, this.renderer.globalData.defs);
    }
    if (data.assets) {
      len = data.assets.length;
      for (i = 0; i < len; i += 1) {
        this.animationData.assets.push(data.assets[i]);
      }
    }
    this.animationData.__complete = false;
    dataManager.completeData(this.animationData, this.renderer.globalData.fontManager);
    this.renderer.includeLayers(data.layers);
    if (expressionsPlugin) {
      expressionsPlugin.initExpressions(this);
    }
    this.loadNextSegment();
  }

  loadNextSegment() {
    let segments = this.animationData.segments;
    if (!segments || segments.length === 0 || !this.autoloadSegments) {
      this.trigger('data_ready');
      this.timeCompleted = this.totalFrames;
      return;
    }
    let segment = segments.shift();
    this.timeCompleted = segment.time * this.frameRate;
    let segmentPath = this.path + this.fileName + '_' + this.segmentPos + '.json';
    this.segmentPos += 1;
    assetLoader.load(segmentPath, this.includeLayers.bind(this), function () {
      this.trigger('data_failed');
    }.bind(this));
  }

  loadSegments() {
    let segments = this.animationData.segments;
    if (!segments) {
      this.timeCompleted = this.totalFrames;
    }
    this.loadNextSegment();
  }

  imagesLoaded() {
    this.trigger('loaded_images');
    this.checkLoaded();
  }

  preloadImages() {
    this.imagePreloader.setCanvas(this.renderer.renderConfig.canvas);
    this.imagePreloader.setAssetsPath(this.assetsPath);
    this.imagePreloader.setPath(this.path);
    this.imagePreloader.loadAssets(this.animationData.assets, this.imagesLoaded.bind(this));
  }

  configAnimation(animData) {
    if (!this.renderer) {
      return;
    }
    this.animationData = animData;
    this.totalFrames = Math.floor(this.animationData.op - this.animationData.ip);
    this.renderer.configAnimation(animData);
    if (!animData.assets) {
      animData.assets = [];
    }
    this.renderer.searchExtraCompositions(animData.assets);

    this.assets = this.animationData.assets;
    this.frameRate = this.animationData.fr;
    this.firstFrame = Math.round(this.animationData.ip);
    this.frameMult = this.animationData.fr / 1000;
    this.trigger('config_ready');
    this.preloadImages();
    this.loadSegments();
    this.updaFrameModifier();
    this.waitForFontsLoaded();
  }

  waitForFontsLoaded() {
    if (!this.renderer) {
      return;
    }
    if (true /* this.renderer.globalData.fontManager.loaded */) {
      this.checkLoaded();
    } else {
      setTimeout(this.waitForFontsLoaded.bind(this), 20);
    }
  }

  checkLoaded() {
    if (!this.isLoaded && this.renderer.globalData.fontManager.loaded() && (this.imagePreloader.loaded())) {
      this.isLoaded = true;
      dataManager.completeData(this.animationData, this.renderer.globalData.fontManager);
      if (expressionsPlugin) {
        expressionsPlugin.initExpressions(this);
      }
      this.renderer.initItems();
      setTimeout(function () {
        this.trigger('DOMLoaded');
      }.bind(this), 0);
      this.gotoFrame();
      if (this.autoplay) {
        this.play();
      }
    }
  }

  resize() {
    this.renderer.updateContainerSize();
  }

  setSubframe(flag) {
    this.subframeEnabled = !!flag;
  }

  gotoFrame() {
    this.currentFrame = this.subframeEnabled ? this.currentRawFrame : ~~this.currentRawFrame;

    if (this.timeCompleted !== this.totalFrames && this.currentFrame > this.timeCompleted) {
      this.currentFrame = this.timeCompleted;
    }
    this.trigger('enterFrame');
    this.renderFrame();
  }

  renderFrame() {
    if (this.isLoaded === false) {
      return;
    }
    this.renderer && this.renderer.renderFrame(this.currentFrame + this.firstFrame);
  }

  play(name) {
    if (name && this.name !== name) {
      return;
    }
    if (this.isPaused === true) {
      this.isPaused = false;
      if (this._idle) {
        this._idle = false;
        this.hasTriggerplay = true;
        this.trigger('_active');
      }
    }
  }

  pause(name) {
    if (name && this.name !== name) {
      return;
    }
    if (this.isPaused === false) {
      this.isPaused = true;
      this._idle = true;
      this.trigger('_idle');
    }
  }

  togglePause(name) {
    if (name && this.name !== name) {
      return;
    }
    if (this.isPaused === true) {
      this.play();
    } else {
      this.pause();
    }
  }

  stop(name) {
    if (name && this.name !== name) {
      return;
    }
    this.pause();
    this.playCount = 0;
    this.setCurrentRawFrameValue(0);
  }

  goToAndStop(value, isFrame, name) {
    if (name && this.name !== name) {
      return;
    }
    if (isFrame) {
      this.setCurrentRawFrameValue(value);
    } else {
      this.setCurrentRawFrameValue(value * this.frameModifier);
    }
    this.pause();
  }

  goToAndPlay(value, isFrame, name) {
    this.goToAndStop(value, isFrame, name);
    this.play();
  }

  advanceTime(value) {
    if (this.isPaused === true || this.isLoaded === false) {
      return;
    }
    let nextValue = this.currentRawFrame + value * this.frameModifier;
    let _isComplete = false;
    // Checking if nextValue > totalFrames - 1 for addressing non looping and looping animations.
    // If animation won't loop, it should stop at totalFrames - 1. If it will loop it should complete the last frame and then loop.
    if (nextValue >= this.totalFrames - 1 && this.frameModifier > 0) {
      if (!this.loop || this.playCount === this.loop) {
        if (!this.checkSegments(nextValue % this.totalFrames)) {
          _isComplete = true;
          nextValue = this.totalFrames - 1;
        }
      } else if (nextValue >= this.totalFrames) {
        this.playCount += 1;
        if (!this.checkSegments(nextValue % this.totalFrames)) {
          this.setCurrentRawFrameValue(nextValue % this.totalFrames);
          this.trigger('loopComplete');
        }
      } else {
        this.setCurrentRawFrameValue(nextValue);
      }
    } else if (nextValue < 0) {
      if (!this.checkSegments(nextValue % this.totalFrames)) {
        if (this.loop && !(this.playCount-- <= 0 && this.loop !== true)) {
          this.setCurrentRawFrameValue(this.totalFrames + (nextValue % this.totalFrames));
          this.trigger('loopComplete');
        } else {
          _isComplete = true;
          nextValue = 0;
        }
      }
    } else {
      this.setCurrentRawFrameValue(nextValue);
    }
    if (_isComplete) {
      this.setCurrentRawFrameValue(nextValue);
      this.pause();
      this.trigger('complete');
    }
  }

  adjustSegment(arr, offset) {
    this.playCount = 0;
    if (arr[1] < arr[0]) {
      if (this.frameModifier > 0) {
        if (this.playSpeed < 0) {
          this.setSpeed(-this.playSpeed);
        } else {
          this.setDirection(-1);
        }
      }
      this.timeCompleted = this.totalFrames = arr[0] - arr[1];
      this.firstFrame = arr[1];
      this.setCurrentRawFrameValue(this.totalFrames - 0.001 - offset);
    } else if (arr[1] > arr[0]) {
      if (this.frameModifier < 0) {
        if (this.playSpeed < 0) {
          this.setSpeed(-this.playSpeed);
        } else {
          this.setDirection(1);
        }
      }
      this.timeCompleted = this.totalFrames = arr[1] - arr[0];
      this.firstFrame = arr[0];
      this.setCurrentRawFrameValue(0.001 + offset);
    }
    this.trigger('segmentStart');
  }

  setSegment(init, end) {
    let pendingFrame = -1;
    if (this.isPaused) {
      if (this.currentRawFrame + this.firstFrame < init) {
        pendingFrame = init;
      } else if (this.currentRawFrame + this.firstFrame > end) {
        pendingFrame = end - init;
      }
    }

    this.firstFrame = init;
    this.timeCompleted = this.totalFrames = end - init;
    if (pendingFrame !== -1) {
      this.goToAndStop(pendingFrame, true);
    }
  }

  playSegments(arr, forceFlag) {
    if (typeof arr[0] === 'object') {
      let i;
      let len = arr.length;
      for (i = 0; i < len; i += 1) {
        this.segments.push(arr[i]);
      }
    } else {
      this.segments.push(arr);
    }
    if (forceFlag) {
      this.checkSegments(0);
    }
    if (this.isPaused) {
      this.play();
    }
  }

  resetSegments(forceFlag) {
    this.segments.length = 0;
    this.segments.push([this.animationData.ip, this.animationData.op]);
    // this.segments.push([this.animationData.ip*this.frameRate,Math.floor(this.animationData.op - this.animationData.ip+this.animationData.ip*this.frameRate)]);
    if (forceFlag) {
      this.checkSegments(0);
    }
  }

  checkSegments(offset) {
    if (this.segments.length) {
      this.adjustSegment(this.segments.shift(), offset);
      return true;
    }
    return false;
  }

  destroy(name) {
    if ((name && this.name !== name) || !this.renderer) {
      return;
    }
    this.renderer.destroy();
    this.trigger('destroy');
    this._cbs = null;
    this.onEnterFrame = this.onLoopComplete = this.onComplete = this.onSegmentStart = this.onDestroy = null;
    this.renderer = null;
    if (this.$observer) {
      this.$observer.disconnect();
    }
  }

  setCurrentRawFrameValue(value) {
    this.currentRawFrame = value;
    this.gotoFrame();
  }

  setSpeed(val) {
    this.playSpeed = val;
    this.updaFrameModifier();
  }

  setDirection(val) {
    this.playDirection = val < 0 ? -1 : 1;
    this.updaFrameModifier();
  }

  updaFrameModifier() {
    this.frameModifier = this.frameMult * this.playSpeed * this.playDirection;
  }

  getPath() {
    return this.path;
  }

  getAssetsPath(assetData) {
    let path = '';
    if (assetData.e) {
      path = assetData.p;
    } else if (this.assetsPath) {
      let imagePath = assetData.p;
      if (imagePath.indexOf('images/') !== -1) {
        imagePath = imagePath.split('/')[1];
      }
      path = this.assetsPath + imagePath;
    } else {
      path = this.path;
      path += assetData.u ? assetData.u : '';
      path += assetData.p;
    }
    return path;
  }

  getAssetData(id) {
    let i = 0;
    let len = this.assets.length;
    while (i < len) {
      if (id === this.assets[i].id) {
        return this.assets[i];
      }
      i += 1;
    }
  }

  hide() {
    this.renderer.hide();
  }

  show() {
    this.renderer.show();
  }

  getDuration(isFrame) {
    return isFrame ? this.totalFrames : this.totalFrames / this.frameRate;
  }

  trigger(name) {
    if (this._cbs && this._cbs[name]) {
      switch (name) {
        case 'enterFrame':
          this.triggerEvent(name, new BMEnterFrameEvent(name, this.currentFrame, this.totalFrames, this.frameMult));
          break;
        case 'loopComplete':
          this.triggerEvent(name, new BMCompleteLoopEvent(name, this.loop, this.playCount, this.frameMult));
          break;
        case 'complete':
          this.triggerEvent(name, new BMCompleteEvent(name, this.frameMult));
          break;
        case 'segmentStart':
          this.triggerEvent(name, new BMSegmentStartEvent(name, this.firstFrame, this.totalFrames));
          break;
        case 'destroy':
          this.triggerEvent(name, new BMDestroyEvent(name, this));
          break;
        default:
          this.triggerEvent(name);
      }
    }
    if (name === 'enterFrame' && this.onEnterFrame) {
      this.onEnterFrame.call(this, new BMEnterFrameEvent(name, this.currentFrame, this.totalFrames, this.frameMult));
    }
    if (name === 'loopComplete' && this.onLoopComplete) {
      this.onLoopComplete.call(this, new BMCompleteLoopEvent(name, this.loop, this.playCount, this.frameMult));
    }
    if (name === 'complete' && this.onComplete) {
      this.onComplete.call(this, new BMCompleteEvent(name, this.frameMult));
    }
    if (name === 'segmentStart' && this.onSegmentStart) {
      this.onSegmentStart.call(this, new BMSegmentStartEvent(name, this.firstFrame, this.totalFrames));
    }
    if (name === 'destroy' && this.onDestroy) {
      this.onDestroy.call(this, new BMDestroyEvent(name, this));
    }
  }
}

export default AnimationItem;
