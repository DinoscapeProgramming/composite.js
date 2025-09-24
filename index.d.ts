export interface CompositeObject {
  readonly [key: string]: any;
};

export interface Composite {
  /**
   * Create a new composite object from a plain object.
   * @param obj A plain object
   */
  (obj: object): CompositeObject;

  /**
   * Create a new composite from a list of values (ordinal composite)
   * @param args Values for the composite
   */
  of(...args: any[]): CompositeObject;

  /**
   * Check if two composites are equal
   * @param a First composite
   * @param b Second composite
   */
  equal(a: CompositeObject, b: CompositeObject): boolean;

  /**
   * Check if a value is a composite
   * @param value Value to check
   */
  isComposite(value: any): value is CompositeObject;
};

declare const Composite: Composite;

export default Composite;