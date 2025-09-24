module.exports = (() => {
  const compositeStore = new WeakMap();

  function isComposite(value) {
    return compositeStore.has(value);
  };

  function equal(a, b) {
    if (a === b) return true;
    if (!isComposite(a) || !isComposite(b)) return false;

    const aData = compositeStore.get(a);
    const bData = compositeStore.get(b);

    const aKeys = Object.keys(aData);
    const bKeys = Object.keys(bData);

    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
      if (!(key in bData)) return false;
      const valueA = aData[key];
      const valueB = bData[key];

      if (isComposite(valueA) && isComposite(valueB)) {
        if (!equal(valueA, valueB)) return false;
      } else if (!Object.is(valueA, valueB)) {
        return false;
      };
    };

    return true;
  };

  function create(object) {
    if (object === null || typeof object !== "object") throw new TypeError("Composite argument must be an object");

    const proxy = new Proxy(Object.freeze({ ...object }), {
      get(target, prop) {
        return target[prop];
      },

      ownKeys(target) {
        return Reflect.ownKeys(target);
      },

      getOwnPropertyDescriptor(target, prop) {
        return Object.getOwnPropertyDescriptor(target, prop);
      }
    });

    compositeStore.set(proxy, object);

    return proxy;
  }

  create.of = (...args) => create({ ...args, length: args.length });

  create.equal = equal;
  create.isComposite = isComposite;

  return create;
})();