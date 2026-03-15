/**
 * Safe Object Operations to Prevent Prototype Pollution
 * Production-ready utilities for secure object manipulation
 */
import { UnsafeObjectOperationError } from '@/errors/domainErrors';

interface SafeObjectOptions {
  maxDepth?: number;
  allowedKeys?: string[];
  blockedKeys?: string[];
  strictMode?: boolean;
}

/**
 * Comprehensive safe object utilities for production use
 */
export class SafeObjectOperations {
  private static readonly DANGEROUS_KEYS = [
    '__proto__',
    'constructor',
    'prototype',
    '__defineGetter__',
    '__defineSetter__',
    '__lookupGetter__',
    '__lookupSetter__',
  ];

  private static readonly DEFAULT_OPTIONS: SafeObjectOptions = {
    maxDepth: 10,
    allowedKeys: [],
    blockedKeys: [],
    strictMode: false,
  };

  /**
   * Safe deep merge that prevents prototype pollution
   */
  static deepMerge(target: any, source: any, options: SafeObjectOptions = {}): any {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    return this.deepMergeRecursive(target, source, opts, 0);
  }

  private static deepMergeRecursive(
    target: any,
    source: any,
    options: SafeObjectOptions,
    depth: number
  ): any {
    if (depth >= (options.maxDepth || 10)) {
      if (options.strictMode) {
        throw new UnsafeObjectOperationError(`Maximum merge depth (${options.maxDepth}) exceeded`, {
          details: { maxDepth: options.maxDepth, depth },
        });
      }
      return target;
    }

    if (!this.isValidObject(source)) {
      return target;
    }

    if (!this.isValidObject(target)) {
      target = {};
    }

    const targetRecord = target as Record<string, any>;

    for (const key of Object.keys(source)) {
      if (!this.isKeySafe(key, options)) {
        if (options.strictMode) {
          throw new UnsafeObjectOperationError(`Blocked key detected: ${key}`, {
            details: { key },
          });
        }
        continue;
      }

      const sourceValue = (source as Record<string, any>)[key];
      const targetValue = targetRecord[key];

      if (this.isValidObject(sourceValue) && !Array.isArray(sourceValue)) {
        targetRecord[key] = this.deepMergeRecursive(
          this.isValidObject(targetValue) ? targetValue : {},
          sourceValue,
          options,
          depth + 1
        );
      } else {
        targetRecord[key] = sourceValue;
      }
    }

    return targetRecord;
  }

  /**
   * Safe Object.assign alternative
   */
  static safeAssign(target: any, ...sources: any[]): any {
    if (!this.isValidObject(target)) {
      target = {};
    }

    const targetRecord = target as Record<string, any>;

    for (const source of sources) {
      if (!this.isValidObject(source)) continue;

      for (const key of Object.keys(source)) {
        if (this.isKeySafe(key)) {
          targetRecord[key] = (source as Record<string, any>)[key];
        }
      }
    }

    return targetRecord;
  }

  /**
   * Safe property path setter
   */
  static setPath(
    obj: any,
    path: string | string[],
    value: any,
    options: SafeObjectOptions = {}
  ): void {
    if (!this.isValidObject(obj)) {
      throw new UnsafeObjectOperationError('Target must be an object', {
        details: { path: Array.isArray(path) ? path.join('.') : path },
      });
    }

    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const keys = Array.isArray(path) ? path : path.split('.');

    for (const key of keys) {
      if (!this.isKeySafe(key, opts)) {
        if (opts.strictMode) {
          throw new UnsafeObjectOperationError(`Blocked key in path: ${key}`, {
            details: { key, path: keys.join('.') },
          });
        }
        return;
      }
    }

    let current: Record<string, any> = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      if (!this.isValidObject(current[key])) {
        current[key] = {};
      }

      current = current[key];
    }

    const finalKey = keys[keys.length - 1];
    current[finalKey] = value;
  }

  /**
   * Safe property path getter
   */
  static getPath(obj: any, path: string | string[], defaultValue?: any): any {
    if (!this.isValidObject(obj)) return defaultValue;

    const keys = Array.isArray(path) ? path : path.split('.');
    let current = obj;

    for (const key of keys) {
      if (!this.isKeySafe(key) || !this.isValidObject(current) || !(key in current)) {
        return defaultValue;
      }
      current = current?.[key];
    }

    return current;
  }

  /**
   * Create a safe object with null prototype
   */
  static createSafeObject(properties?: Record<string, any>): any {
    const obj = Object.create(null);

    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        if (this.isKeySafe(key)) {
          (obj as Record<string, any>)[key] = value;
        }
      }
    }

    return obj;
  }

  /**
   * Safe JSON parsing with validation
   */
  static safeJsonParse(json: string, options: SafeObjectOptions = {}): any {
    try {
      const parsed = JSON.parse(json);
      return this.sanitizeObject(parsed, options);
    } catch (error: unknown) {
      if (options.strictMode) {
        const parsedError = error instanceof Error ? error : new Error(String(error));
        throw new UnsafeObjectOperationError(`JSON parsing failed: ${parsedError.message}`, {
          cause: parsedError,
        });
      }
      return null;
    }
  }

  /**
   * Sanitize an object by removing dangerous properties
   */
  static sanitizeObject(obj: any, options: SafeObjectOptions = {}): any {
    if (!this.isValidObject(obj)) return obj;

    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const sanitized = Array.isArray(obj) ? [] : {};

    const sanitizedRecord = sanitized as Record<string, any>;
    const sourceRecord = obj as Record<string, any>;

    for (const key of Object.keys(obj)) {
      if (!this.isKeySafe(key, opts)) {
        continue;
      }

      const value = sourceRecord[key];
      if (this.isValidObject(value)) {
        sanitizedRecord[key] = this.sanitizeObject(value, opts);
      } else {
        sanitizedRecord[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Freeze object recursively to prevent modification
   */
  static deepFreeze(obj: any): any {
    if (!this.isValidObject(obj)) return obj;

    Object.freeze(obj);

    Object.values(obj).forEach(value => {
      if (this.isValidObject(value)) {
        this.deepFreeze(value);
      }
    });

    return obj;
  }

  /**
   * Clone object safely
   */
  static safeClone(obj: any, options: SafeObjectOptions = {}): any {
    if (!this.isValidObject(obj)) return obj;

    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    return this.cloneRecursive(obj, opts, 0, new WeakMap());
  }

  private static cloneRecursive(
    obj: any,
    options: SafeObjectOptions,
    depth: number,
    seen: WeakMap<any, any>
  ): any {
    if (depth >= (options.maxDepth || 10)) {
      return {};
    }

    if (!this.isValidObject(obj)) return obj;

    // Handle circular references
    if (seen.has(obj)) {
      return seen.get(obj);
    }

    const cloned = Array.isArray(obj) ? [] : {};
    const clonedRecord = cloned as Record<string, any>;
    const sourceRecord = obj as Record<string, any>;
    seen.set(obj, cloned);

    for (const key of Object.keys(obj)) {
      if (!this.isKeySafe(key, options)) {
        continue;
      }

      const value = sourceRecord[key];
      if (this.isValidObject(value)) {
        clonedRecord[key] = this.cloneRecursive(value, options, depth + 1, seen);
      } else {
        clonedRecord[key] = value;
      }
    }

    return cloned;
  }

  /**
   * Validate if an object is safe from prototype pollution
   */
  static validateObject(obj: any, options: SafeObjectOptions = {}): boolean {
    if (!this.isValidObject(obj)) return true;

    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    return this.validateRecursive(obj, opts, 0);
  }

  private static validateRecursive(obj: any, options: SafeObjectOptions, depth: number): boolean {
    if (depth >= (options.maxDepth || 10)) {
      return true;
    }

    for (const key of Object.keys(obj)) {
      if (!this.isKeySafe(key, options)) {
        return false;
      }

      const value = obj?.[key];
      if (this.isValidObject(value)) {
        if (!this.validateRecursive(value, options, depth + 1)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if a key is safe to use
   */
  private static isKeySafe(key: string, options: SafeObjectOptions = {}): boolean {
    // Check blocked keys
    const blockedKeys = [...this.DANGEROUS_KEYS, ...(options.blockedKeys || [])];
    if (blockedKeys.includes(key)) {
      return false;
    }

    // Check allowed keys (if specified)
    if (options.allowedKeys && options.allowedKeys.length > 0) {
      return options.allowedKeys.includes(key);
    }

    return true;
  }

  /**
   * Check if value is a valid object for processing
   */
  private static isValidObject(value: any): boolean {
    return value !== null && typeof value === 'object';
  }
}

/**
 * Express.js middleware to prevent prototype pollution in request data
 */
export function prototypePollutionMiddleware(options: SafeObjectOptions = {}) {
  return (req: any, res: any, next: any) => {
    try {
      // Sanitize request body
      if (req.body) {
        req.body = SafeObjectOperations.sanitizeObject(req.body, options);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = SafeObjectOperations.sanitizeObject(req.query, options);
      }

      // Sanitize route parameters
      if (req.params) {
        req.params = SafeObjectOperations.sanitizeObject(req.params, options);
      }

      next();
    } catch (error) {
      if (options.strictMode) {
        res.status(400).json({ error: 'Invalid request data' });
      } else {
        next();
      }
    }
  };
}

/**
 * Utility functions for common use cases
 */
export const SafeUtils = {
  /**
   * Safe merge for configuration objects
   */
  mergeConfig: (defaultConfig: any, userConfig: any) =>
    SafeObjectOperations.deepMerge(defaultConfig, userConfig, { strictMode: true }),

  /**
   * Safe parsing of user input
   */
  parseUserInput: (input: string) =>
    SafeObjectOperations.safeJsonParse(input, { strictMode: false }),

  /**
   * Create safe storage object
   */
  createStorage: () => SafeObjectOperations.createSafeObject(),

  /**
   * Validate API response
   */
  validateApiResponse: (response: any) =>
    SafeObjectOperations.validateObject(response, { maxDepth: 5 }),
};
