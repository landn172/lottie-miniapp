class BaseEvent {
  triggerEvent(eventName, args) {
    if (this._cbs[eventName]) {
      let len = this._cbs[eventName].length;
      for (let i = 0; i < len; i++) {
        this._cbs[eventName][i](args);
      }
    }
  }

  addEventListener(eventName, callback) {
    if (!this._cbs[eventName]) {
      this._cbs[eventName] = [];
    }
    this._cbs[eventName].push(callback);

    return function () {
      this.removeEventListener(eventName, callback);
    }.bind(this);
  }

  removeEventListener(eventName, callback) {
    if (!callback) {
      this._cbs[eventName] = null;
    } else if (this._cbs[eventName]) {
      let i = 0;
      let len = this._cbs[eventName].length;
      while (i < len) {
        if (this._cbs[eventName][i] === callback) {
          this._cbs[eventName].splice(i, 1);
          i -= 1;
          len -= 1;
        }
        i += 1;
      }
      if (!this._cbs[eventName].length) {
        this._cbs[eventName] = null;
      }
    }
  }
}

export default BaseEvent;
