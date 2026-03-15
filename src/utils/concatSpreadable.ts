/**
 * A collection class that controls its behavior when used with Array.prototype.concat
 * using Symbol.isConcatSpreadable.
 *
 * When Symbol.isConcatSpreadable is true, the object is spread into individual elements.
 * When false, the object is added as a single element.
 */
export class ConcatSpreadableCollection<T> {
  private items: T[];
  private spreadable: boolean;
  [index: number]: T;

  /**
   * Creates a new ConcatSpreadableCollection
   * @param items - Initial items in the collection
   * @param spreadable - Whether this collection should be spread when concatenated (default: true)
   */
  constructor(items: T[] = [], spreadable = true) {
    this.items = [...items];
    this.spreadable = spreadable;

    // Set up numeric indices to make the object array-like
    this.items.forEach((item, index) => {
      (this as any)[index] = item;
    });
  }

  /**
   * Controls whether this object is spread during Array.prototype.concat
   */
  get [Symbol.isConcatSpreadable](): boolean {
    return this.spreadable;
  }

  /**
   * Required for concat to work properly - returns the length of the collection
   */
  get length(): number {
    return this.items.length;
  }

  /**
   * Updates numeric indices when items change
   */
  private updateIndices(): void {
    // Clear old indices
    Object.keys(this).forEach(key => {
      if (/^\d+$/.test(key)) {
        delete (this as any)[key];
      }
    });

    // Set new indices
    this.items.forEach((item, index) => {
      (this as any)[index] = item;
    });
  }

  /**
   * Enables spreading by setting Symbol.isConcatSpreadable to true
   */
  enableSpreading(): this {
    this.spreadable = true;
    return this;
  }

  /**
   * Disables spreading by setting Symbol.isConcatSpreadable to false
   */
  disableSpreading(): this {
    this.spreadable = false;
    return this;
  }

  /**
   * Toggles the spreading behavior
   */
  toggleSpreading(): this {
    this.spreadable = !this.spreadable;
    return this;
  }

  /**
   * Adds an item to the collection
   */
  add(item: T): this {
    this.items.push(item);
    this.updateIndices();
    return this;
  }

  /**
   * Removes an item from the collection
   */
  remove(item: T): this {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      this.updateIndices();
    }
    return this;
  }

  /**
   * Gets an item at a specific index
   */
  get(index: number): T | undefined {
    return this.items[index];
  }

  /**
   * Returns all items as an array
   */
  toArray(): T[] {
    return [...this.items];
  }

  /**
   * Checks if the collection is currently spreadable
   */
  isSpreadable(): boolean {
    return this.spreadable;
  }

  /**
   * Makes the collection iterable
   */
  *[Symbol.iterator](): Iterator<T> {
    yield* this.items;
  }

  /**
   * Custom toString for better debugging
   */
  toString(): string {
    return `ConcatSpreadableCollection(${this.items.length} items, spreadable: ${this.spreadable})`;
  }
}

/**
 * Factory function that creates a ConcatSpreadableCollection
 * This is the recommended way to create instances
 */
export function createConcatSpreadableCollection<T>(
  items: T[] = [],
  spreadable = true
): ConcatSpreadableCollection<T> {
  return new ConcatSpreadableCollection(items, spreadable);
}
