function registerComposition(comp) {
  this.compositions.push(comp);
}

export default function () {
  /* eslint consistent-return: 0 */
  function thisProjectFunction(name) {
    let i = 0;
    let len = this.compositions.length;
    while (i < len) {
      if (this.compositions[i].data && this.compositions[i].data.nm === name) {
        if (this.compositions[i].prepareFrame && this.compositions[i].data.xt) {
          this.compositions[i].prepareFrame(this.currentFrame);
        }
        return this.compositions[i].compInterface;
      }
      i += 1;
    }
  }

  thisProjectFunction.compositions = [];
  thisProjectFunction.currentFrame = 0;

  thisProjectFunction.registerComposition = registerComposition;


  return thisProjectFunction;
}
