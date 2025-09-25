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
  };

  create.of = (...args) => create({ ...args, length: args.length });
  create.equal = equal;
  create.isComposite = isComposite;

  const _MapProto = Map.prototype;
  const _SetProto = Set.prototype;

  const orig = {
    mapGet: _MapProto.get,
    mapHas: _MapProto.has,
    mapSet: _MapProto.set,
    mapDelete: _MapProto.delete,
    mapForEach: _MapProto.forEach,

    setHas: _SetProto.has,
    setAdd: _SetProto.add,
    setDelete: _SetProto.delete,
    setForEach: _SetProto.forEach,
  };

  function findCompositeKeyInMap(map, compositeKey) {
    if (orig.mapHas.call(map, compositeKey)) return compositeKey;

    for (const key of map.keys()) {
      if (isComposite(key) && equal(key, compositeKey)) {
        return key;
      };
    };

    return undefined;
  };

  _MapProto.get = function (key) {
    if (isComposite(key)) {
      const found = findCompositeKeyInMap(this, key);

      return (found === undefined) ? undefined : orig.mapGet.call(this, found);
    };

    return orig.mapGet.call(this, key);
  };

  _MapProto.has = function (key) {
    if (isComposite(key)) return (findCompositeKeyInMap(this, key) !== undefined);

    return orig.mapHas.call(this, key);
  };

  _MapProto.set = function (key, value) {
    if (isComposite(key)) {
      const found = findCompositeKeyInMap(this, key);

      if (found !== undefined) {
        orig.mapSet.call(this, found, value);

        return this;
      };

      return orig.mapSet.call(this, key, value);
    };

    return orig.mapSet.call(this, key, value);
  };

  _MapProto.delete = function (key) {
    if (isComposite(key)) {
      const found = findCompositeKeyInMap(this, key);

      return (found !== undefined) ? orig.mapDelete.call(this, found) : false;
    };

    return orig.mapDelete.call(this, key);
  };

  _SetProto.has = function (value) {
    if (isComposite(value)) {
      if (orig.setHas.call(this, value)) return true;

      for (const v of this) {
        if (isComposite(v) && equal(v, value)) return true;
      };

      return false;
    };

    return orig.setHas.call(this, value);
  };

  _SetProto.add = function (value) {
    if (isComposite(value)) {
      if (this.has(value)) return this;

      return orig.setAdd.call(this, value);
    };

    return orig.setAdd.call(this, value);
  };

  _SetProto.delete = function (value) {
    if (isComposite(value)) {
      for (const v of this) {
        if (isComposite(v) && equal(v, value)) {
          return orig.setDelete.call(this, v);
        };
      };

      return false;
    };

    return orig.setDelete.call(this, value);
  };

  create.unpatch = function () {
    _MapProto.get = orig.mapGet;
    _MapProto.has = orig.mapHas;
    _MapProto.set = orig.mapSet;
    _MapProto.delete = orig.mapDelete;
    _MapProto.forEach = orig.mapForEach;

    _SetProto.has = orig.setHas;
    _SetProto.add = orig.setAdd;
    _SetProto.delete = orig.setDelete;
    _SetProto.forEach = orig.setForEach;
  };

  return create;
})();