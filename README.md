# Composite Polyfill

A polyfill for the [**TC39 Composites proposal (Stage 1)**](https://github.com/tc39/proposal-composites): structured, immutable objects with well-defined equality semantics, suitable for use as keys in `Map` and `Set`.

This implementation allows you to create **composite objects** that:

* Are immutable (`Object.freeze`).
* Support nested composites.
* Can be compared with `Composite.equal`.
* Work **directly in `Map` and `Set`** with structural equality (patched globally).
* Support ordinal composites (`Composite.of`) like arrays with fixed positions.

---

## Installation

```bash
$ npm install composite.js
```

or

```bash
$ yarn add composite.js
```

---

## Usage

```ts
const Composite = require("composite.js"); // ESM also works

// Create simple composites
const pos1 = Composite({ x: 1, y: 4 });
const pos2 = Composite({ x: 1, y: 4 });

console.log(Composite.equal(pos1, pos2)); // true
console.log(Composite.isComposite(pos1)); // true

// Nested composites
const nested1 = Composite({ a: 1, b: Composite({ c: 2 }) });
const nested2 = Composite({ a: 1, b: Composite({ c: 2 }) });

console.log(Composite.equal(nested1, nested2)); // true

// Ordinal composite
const ord = Composite.of("a", "b", "c");
console.log(ord[0], ord[1], ord[2]); // a b c
console.log(ord.length); // 3

// Using composites in a Set (structural equality)
const positions = new Set();
positions.add(pos1);
console.log(positions.has(pos2)); // true

// Using composites as keys in a Map
const map = new Map();
map.set(pos1, "point");
console.log(map.get(pos2)); // "point"

// If you need to restore native behavior
Composite.unpatch();
console.log(positions.has(pos2)); // false (back to reference equality)
```

---

## API

### `Composite(object: object): CompositeObject`

Creates a new composite object from a plain object. Throws if `object` is not an object.

### `Composite.of(...args: any[]): CompositeObject`

Creates an **ordinal composite** (like a tuple) from a list of values.

### `Composite.equal(a: CompositeObject, b: CompositeObject): boolean`

Checks if two composites are equal. Works recursively for nested composites.

### `Composite.isComposite(value: any): value is CompositeObject`

Returns `true` if the value is a composite created with `Composite()`.

### `Composite.unpatch(): void`

Restores the native `Map` and `Set` behavior, disabling composite structural equality.

---

## Notes

* Composites are **shallowly immutable**. Nested objects are not frozen unless explicitly made composites.
* Composites are compared **by structure**, not by reference.
* `Map` and `Set` are **patched automatically** so that composites are compared structurally. No manual equality checks are needed.
* `WeakMap` and `WeakSet` are **not patched** — they continue to use reference equality, just like with normal objects.
* Symbols as keys are supported.

---

## License

MIT