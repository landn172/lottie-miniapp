import { raf } from '../utils/index';
import AnimationItem from './AnimationItem';

class AnimationManager {
  constructor() {
    this.moduleOb = {};
    this.registeredAnimations = [];
    this.initTime = 0;
    this.len = 0;
    this.playingAnimationsNum = 0;
    this._stopped = true;
    this._isFrozen = false;
    this.raf = raf;
  }

  removeElement(ev) {
    let i = 0;
    let animItem = ev.target;
    const registeredAnimations = this.registeredAnimations;
    while (i < this.len) {
      if (registeredAnimations[i].animation === animItem) {
        registeredAnimations.splice(i, 1);
        i -= 1;
        this.len -= 1;
        if (!animItem.isPaused) {
          this.subtractPlayingCount();
        }
      }
      i += 1;
    }
  }

  getRegisteredAnimations() {
    const registeredAnimations = this.registeredAnimations;
    let i;
    let len = registeredAnimations.length;
    let animations = [];
    for (i = 0; i < len; i += 1) {
      animations.push(registeredAnimations[i].animation);
    }
    return animations;
  }

  addPlayingCount() {
    this.playingAnimationsNum += 1;
    this.activate();
  }

  subtractPlayingCount() {
    this.playingAnimationsNum -= 1;
  }

  setupAnimation(animItem, element) {
    animItem.addEventListener('destroy', this.removeElement.bind(this));
    animItem.addEventListener('_active', this.addPlayingCount.bind(this));
    animItem.addEventListener('_idle', this.subtractPlayingCount.bind(this));
    this.registeredAnimations.push({
      elem: element,
      animation: animItem
    });
    this.len += 1;
  }

  loadAnimation(params) {
    let animItem = new AnimationItem();
    this.setupAnimation(animItem, null);
    animItem.setParams(params);
    if (params.rendererSettings && params.rendererSettings.canvas && params.rendererSettings.canvas.requestAnimationFrame) {
      this.raf = params.rendererSettings.canvas.requestAnimationFrame.bind(params.rendererSettings.canvas);
    }
    return animItem;
  }

  setSpeed(val, animation) {
    let i;
    const registeredAnimations = this.registeredAnimations;
    for (i = 0; i < this.len; i += 1) {
      registeredAnimations[i].animation.setSpeed(val, animation);
    }
  }

  setDirection(val, animation) {
    let i;
    const registeredAnimations = this.registeredAnimations;
    for (i = 0; i < this.len; i += 1) {
      registeredAnimations[i].animation.setDirection(val, animation);
    }
  }

  play(animation) {
    let i;
    const registeredAnimations = this.registeredAnimations;
    for (i = 0; i < this.len; i += 1) {
      registeredAnimations[i].animation.play(animation);
    }
  }

  resume(nowTime) {
    let elapsedTime = ~~(nowTime - this.initTime);
    const registeredAnimations = this.registeredAnimations;
    let i;
    for (i = 0; i < this.len; i += 1) {
      registeredAnimations[i].animation.advanceTime(elapsedTime);
    }
    this.initTime = nowTime;
    if (this.playingAnimationsNum && !this._isFrozen) {
      this.raf(this.resume.bind(this));
    } else {
      this._stopped = true;
    }
  }

  first(nowTime) {
    this.initTime = nowTime;
    this.raf(this.resume.bind(this));
  }

  pause(animation) {
    let i;
    const registeredAnimations = this.registeredAnimations;
    for (i = 0; i < this.len; i += 1) {
      registeredAnimations[i].animation.pause(animation);
    }
  }

  goToAndStop(value, isFrame, animation) {
    let i;
    const registeredAnimations = this.registeredAnimations;
    for (i = 0; i < this.len; i += 1) {
      registeredAnimations[i].animation.goToAndStop(value, isFrame, animation);
    }
  }

  stop(animation) {
    let i;
    const registeredAnimations = this.registeredAnimations;
    for (i = 0; i < this.len; i += 1) {
      registeredAnimations[i].animation.stop(animation);
    }
  }

  togglePause(animation) {
    let i;
    const registeredAnimations = this.registeredAnimations;
    for (i = 0; i < this.len; i += 1) {
      registeredAnimations[i].animation.togglePause(animation);
    }
  }

  destroy(animation) {
    let i;
    const registeredAnimations = this.registeredAnimations;
    for (i = (this.len - 1); i >= 0; i -= 1) {
      registeredAnimations[i].animation.destroy(animation);
    }
    this.registeredAnimations.length = 0;
    this.len = 0;
  }

  resize() {
    let i;
    const registeredAnimations = this.registeredAnimations;
    for (i = 0; i < this.len; i += 1) {
      registeredAnimations[i].animation.resize();
    }
  }

  activate() {
    if (!this._isFrozen && this.playingAnimationsNum) {
      if (this._stopped) {
        this.raf(this.first.bind(this));
        this._stopped = false;
      }
    }
  }

  freeze() {
    this._isFrozen = true;
  }

  unfreeze() {
    this._isFrozen = false;
    this.activate();
  }
}

export default new AnimationManager();
