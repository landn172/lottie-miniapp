function Mixin(baseClass, ...mixins) {
  const copyProps = (target, source) => { // this function copies all properties and symbols, filtering out some special ones
    Object.getOwnPropertyNames(source)
      // .concat(Object.getOwnPropertySymbols(source))
      .forEach((prop) => {
        try {
          if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
            Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
          }
        } catch (err) {
          console.error(err);
        }
      });
  };

  class base extends baseClass {
    constructor(...args) {
      super(...args);
      mixins.forEach((mixin) => {
        const mixinConstructor = (new mixin());
        copyProps(this, mixinConstructor);
      });
    }
  }


  mixins.forEach((mixin) => { // outside contructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
    let proto = mixin.prototype.__proto__;
    while (proto && proto.constructor !== Object) {
      copyProps(base.prototype, proto);
      proto = proto.__proto__;
    }

    copyProps(base.prototype, mixin.prototype);
    copyProps(base, mixin);
  });

  return base;
}

function copyProperties(target, source) {
  if (typeof source !== 'object') return;
  for (let key of [...Object.getOwnPropertyNames(source)]) {
    if (key !== 'constructor'
      && key !== 'prototype'
      && key !== 'name'
    ) {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}

function extendClasses(...args) {
  const constructors = [];

  class Class {
    /**
     * Creates an instance of Class.
     *
     * @memberOf Class
     */

    constructor(...opts) {
      for (const arg of args) {
        const props = Object.getOwnPropertyNames(arg.prototype);

        for (const prop of props) {
          if (prop === 'constructor') {
            constructors.push(arg.prototype.constructor);
          } else {
            Class.prototype[prop] = arg.prototype[prop];
          }
        }
      }

      for (const constructor of constructors) {
        Object.assign(Class.prototype, new constructor(...opts));
      }
    }
  }

  return Class;
}

export default Mixin;
