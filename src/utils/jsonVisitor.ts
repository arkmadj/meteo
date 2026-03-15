/**
 * Visitor Pattern for JSON Object Traversal
 *
 * The Visitor pattern is a behavioral design pattern that lets you separate
 * algorithms from the objects on which they operate. This implementation
 * provides a flexible way to traverse JSON objects and perform operations
 * on different value types.
 *
 * Benefits:
 * - Separation of concerns: traversal logic separate from collection logic
 * - Extensibility: easy to add new visitor implementations
 * - Type safety: TypeScript interfaces ensure correct implementation
 * - Flexibility: supports custom filtering and transformation
 */

/**
 * Represents any valid JSON value type
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * Context information passed to visitor methods
 */
export interface IVisitContext {
  /** Current path in the object (e.g., "user.address.city") */
  path: string;
  /** Current depth in the object tree (0-based) */
  depth: number;
  /** Parent key name (if any) */
  key?: string;
  /** Parent object reference */
  parent?: JSONValue;
}

/**
 * Visitor interface for JSON traversal
 * Implement this interface to create custom visitors
 */
export interface IJSONVisitor<T = void> {
  /**
   * Visit a string value
   */
  visitString(value: string, context: IVisitContext): T;

  /**
   * Visit a number value
   */
  visitNumber(value: number, context: IVisitContext): T;

  /**
   * Visit a boolean value
   */
  visitBoolean(value: boolean, context: IVisitContext): T;

  /**
   * Visit a null value
   */
  visitNull(context: IVisitContext): T;

  /**
   * Visit an array (called before visiting array elements)
   */
  visitArrayStart(array: JSONValue[], context: IVisitContext): T;

  /**
   * Visit an array (called after visiting array elements)
   */
  visitArrayEnd(array: JSONValue[], context: IVisitContext): T;

  /**
   * Visit an object (called before visiting object properties)
   */
  visitObjectStart(obj: Record<string, JSONValue>, context: IVisitContext): T;

  /**
   * Visit an object (called after visiting object properties)
   */
  visitObjectEnd(obj: Record<string, JSONValue>, context: IVisitContext): T;
}

/**
 * Options for JSON traversal
 */
export interface ITraversalOptions {
  /** Maximum depth to traverse (default: Infinity) */
  maxDepth?: number;
  /** Filter function to skip certain paths */
  filter?: (value: JSONValue, context: IVisitContext) => boolean;
  /** Whether to visit array/object containers before their children (default: true) */
  preOrder?: boolean;
  /** Whether to visit array/object containers after their children (default: false) */
  postOrder?: boolean;
}

/**
 * Base abstract visitor class with default no-op implementations
 */
export abstract class BaseJSONVisitor<T = void> implements IJSONVisitor<T> {
  visitString(_value: string, _context: IVisitContext): T {
    return undefined as T;
  }

  visitNumber(_value: number, _context: IVisitContext): T {
    return undefined as T;
  }

  visitBoolean(_value: boolean, _context: IVisitContext): T {
    return undefined as T;
  }

  visitNull(_context: IVisitContext): T {
    return undefined as T;
  }

  visitArrayStart(_array: JSONValue[], _context: IVisitContext): T {
    return undefined as T;
  }

  visitArrayEnd(_array: JSONValue[], _context: IVisitContext): T {
    return undefined as T;
  }

  visitObjectStart(_obj: Record<string, JSONValue>, _context: IVisitContext): T {
    return undefined as T;
  }

  visitObjectEnd(_obj: Record<string, JSONValue>, _context: IVisitContext): T {
    return undefined as T;
  }
}

/**
 * String Collector Visitor
 * Collects all string values from a JSON object
 */
export class StringCollectorVisitor extends BaseJSONVisitor<void> {
  private strings: string[] = [];
  private paths: string[] = [];

  visitString(value: string, context: IVisitContext): void {
    this.strings.push(value);
    this.paths.push(context.path);
  }

  /**
   * Get all collected strings
   */
  getStrings(): string[] {
    return [...this.strings];
  }

  /**
   * Get all paths where strings were found
   */
  getPaths(): string[] {
    return [...this.paths];
  }

  /**
   * Get strings with their paths
   */
  getStringsWithPaths(): Array<{ value: string; path: string }> {
    return this.strings.map((value, index) => ({
      value,
      path: this.paths[index],
    }));
  }

  /**
   * Reset the collector
   */
  reset(): void {
    this.strings = [];
    this.paths = [];
  }

  /**
   * Get the count of collected strings
   */
  getCount(): number {
    return this.strings.length;
  }
}

/**
 * JSON Walker - Traverses a JSON object and applies a visitor
 */
export class JSONWalker {
  private options: Required<ITraversalOptions>;

  constructor(options: ITraversalOptions = {}) {
    this.options = {
      maxDepth: options.maxDepth ?? Infinity,
      filter: options.filter ?? (() => true),
      preOrder: options.preOrder ?? true,
      postOrder: options.postOrder ?? false,
    };
  }

  /**
   * Walk through a JSON object and apply the visitor
   */
  walk<T>(value: JSONValue, visitor: IJSONVisitor<T>): void {
    this.walkInternal(value, visitor, {
      path: '$',
      depth: 0,
    });
  }

  private walkInternal<T>(
    value: JSONValue,
    visitor: IJSONVisitor<T>,
    context: IVisitContext
  ): void {
    // Check depth limit
    if (context.depth > this.options.maxDepth) {
      return;
    }

    // Apply filter
    if (!this.options.filter(value, context)) {
      return;
    }

    // Handle different value types
    if (value === null) {
      visitor.visitNull(context);
    } else if (typeof value === 'string') {
      visitor.visitString(value, context);
    } else if (typeof value === 'number') {
      visitor.visitNumber(value, context);
    } else if (typeof value === 'boolean') {
      visitor.visitBoolean(value, context);
    } else if (Array.isArray(value)) {
      this.walkArray(value, visitor, context);
    } else if (typeof value === 'object') {
      this.walkObject(value as Record<string, JSONValue>, visitor, context);
    }
  }

  private walkArray<T>(array: JSONValue[], visitor: IJSONVisitor<T>, context: IVisitContext): void {
    // Pre-order visit
    if (this.options.preOrder) {
      visitor.visitArrayStart(array, context);
    }

    // Visit array elements
    array.forEach((element, index) => {
      this.walkInternal(element, visitor, {
        path: `${context.path}[${index}]`,
        depth: context.depth + 1,
        key: String(index),
        parent: array,
      });
    });

    // Post-order visit
    if (this.options.postOrder) {
      visitor.visitArrayEnd(array, context);
    }
  }

  private walkObject<T>(
    obj: Record<string, JSONValue>,
    visitor: IJSONVisitor<T>,
    context: IVisitContext
  ): void {
    // Pre-order visit
    if (this.options.preOrder) {
      visitor.visitObjectStart(obj, context);
    }

    // Visit object properties
    Object.entries(obj).forEach(([key, value]) => {
      this.walkInternal(value, visitor, {
        path: `${context.path}.${key}`,
        depth: context.depth + 1,
        key,
        parent: obj,
      });
    });

    // Post-order visit
    if (this.options.postOrder) {
      visitor.visitObjectEnd(obj, context);
    }
  }
}

/**
 * Convenience function to collect all strings from a JSON object
 *
 * @param json - The JSON object to traverse
 * @param options - Optional traversal options
 * @returns Array of all string values found
 *
 * @example
 * const data = { name: "John", age: 30, address: { city: "NYC" } };
 * const strings = collectStrings(data);
 * // ["John", "NYC"]
 */
export function collectStrings(json: JSONValue, options?: ITraversalOptions): string[] {
  const visitor = new StringCollectorVisitor();
  const walker = new JSONWalker(options);
  walker.walk(json, visitor);
  return visitor.getStrings();
}

/**
 * Convenience function to collect strings with their paths
 *
 * @param json - The JSON object to traverse
 * @param options - Optional traversal options
 * @returns Array of objects containing string values and their paths
 *
 * @example
 * const data = { name: "John", address: { city: "NYC" } };
 * const result = collectStringsWithPaths(data);
 * // [{ value: "John", path: "$.name" }, { value: "NYC", path: "$.address.city" }]
 */
export function collectStringsWithPaths(
  json: JSONValue,
  options?: ITraversalOptions
): Array<{ value: string; path: string }> {
  const visitor = new StringCollectorVisitor();
  const walker = new JSONWalker(options);
  walker.walk(json, visitor);
  return visitor.getStringsWithPaths();
}
