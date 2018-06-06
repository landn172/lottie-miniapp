let enableProxyLog = true;

export function enableDebug(b) {
  enableProxyLog = !!b;
}

const methods = ['save', 'setFillStyle', 'moveTo', 'bezierCurveTo', 'closePath', 'fill', 'draw', 'beginPath', 'stroke', 'setTransform'];

export function proxyCtx(ctx) {
  methods.forEach((method) => {
    const oldMethod = ctx[method];
    if (typeof oldMethod === 'function') {
      Object.defineProperty(ctx, method, {
        value: function (...args) {
          if (enableProxyLog) {
            console.log.call(null, [`ctx.${method}(`].concat(args.join(',')).concat(')').join(''));
          }
          return oldMethod.apply(ctx, args);
        }
      });
    }
  });

  if (typeof Proxy !== 'undefined') {
    /* eslint no-new: 0 */
    new Proxy(ctx, {
      set(target, propKey, value) {
        console.log(`ctx.${propKey} = ${value}`);
        ctx[propKey] = value;
      }
    });
  }
}

function debugElapsedTimeFactory() {
  const nameLog = {};
  return {
    start(groupName) {
      nameLog[groupName] = +new Date();
    },
    end(groupName) {
      const value = nameLog[groupName];
      if (typeof value === 'undefined') {
        throw new Error(`debugElapsedTimeFactory start(${groupName}) is not invoke before end()`);
      }
      console.log(`debug:${groupName}`, +new Date() - value + 'ms');
      delete nameLog[groupName];
    }
  };
}

// 打印耗时
export const debug = debugElapsedTimeFactory();
