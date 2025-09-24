# Composite Polyfill

A polyfill for the [**TC39 Composites proposal (Stage 1)**](https://github.com/tc39/proposal-composites): structured, immutable objects with well-defined equality semantics, suitable for use as keys in `Map` and `Set`.  

This implementation allows you to create **composite objects** that:  
- Are immutable (`Object.freeze`).  
- Support nested composites.  
- Can be compared with `Composite.equal`.  
- Can be used in Sets/Maps (with custom equality checks).  
- Support ordinal composites (`Composite.of`) like arrays with fixed positions.  

---

## Installation

```bash
npm install composite.js
````

or

```bash
yarn add composite.js
```

---

## Usage

```ts
const Composite = require("composite.js"); // ESM also works

// Create simple composite
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

// Using in a Set
const positions = new Set();
positions.add(pos1);
console.log([...positions].some((p) => Composite.equal(p, pos2))); // true
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

---

## Notes

* Composites are **shallowly immutable**. Nested objects are not frozen unless explicitly made composites.
* Composites are compared **by structure**, not by reference.
* Can be used with `Set`/`Map` by wrapping operations with `Composite.equal`.
* Symbols as keys are supported.

---

## License

MIT