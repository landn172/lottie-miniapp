import CompExpressionInterface from './CompInterface';

export default {
  initExpressions(animation) {
    animation.renderer.compInterface = CompExpressionInterface(animation.renderer);
    animation.renderer.globalData.projectInterface.registerComposition(animation.renderer);
  }
};
