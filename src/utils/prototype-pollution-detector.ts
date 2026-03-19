/**
 * Runtime Prototype Pollution Detection and Prevention Utilities
 */

import { PrototypePollutionError } from '@/errors/domainErrors';
import { getLogger } from '@/utils/logger';

const detectorLogger = getLogger('Security:PrototypePollutionDetector');

interface PrototypePollutionOptions {
  enableLogging?: boolean;
  throwOnDetection?: boolean;
  monitoredPrototypes?: unknown[];
  alertCallback?: (details: PollutionAlert) => void;
}

interface PollutionAlert {
  type: 'pollution_detected' | 'pollution_attempt';
  prototype: string;
  property: string;
  value: unknown;
  stack: string;
  timestamp: number;
}

class PrototypePollutionDetector {
  private options: PrototypePollutionOptions;
  private originalDescriptors: Map<unknown, Map<string, PropertyDescriptor>> = new Map();
  private monitoredKeys = ['__proto__', 'constructor', 'prototype'];

  constructor(options: PrototypePollutionOptions = {}) {
    this.options = {
      enableLogging: true,
      throwOnDetection: false,
      monitoredPrototypes: [Object.prototype, Array.prototype, Function.prototype],
      ...options,
    };

    this.setupMonitoring();
  }

  private setupMonitoring(): void {
    const prototypes = this.options.monitoredPrototypes || [];

    prototypes.forEach(proto => {
      this.monitoredKeys.forEach(key => {
        this.protectProperty(proto, key);
      });
    });
  }

  private protectProperty(obj: unknown, property: string): void {
    const originalDescriptor = Object.getOwnPropertyDescriptor(obj, property);

    if (!this.originalDescriptors.has(obj)) {
      this.originalDescriptors.set(obj, new Map());
    }

    if (originalDescriptor) {
      this.originalDescriptors.get(obj)!.set(property, originalDescriptor);
    }

    Object.defineProperty(obj, property, {
      get: originalDescriptor?.get || (() => originalDescriptor?.value),
      set: (value: unknown) => {
        const alert: PollutionAlert = {
          type: 'pollution_attempt',
          prototype: obj.constructor.name,
          property,
          value,
          stack: new Error().stack || '',
          timestamp: Date.now(),
        };

        this.handlePollutionAttempt(alert);

        if (!this.options.throwOnDetection) {
          // Allow the assignment but log it
          if (originalDescriptor?.set) {
            originalDescriptor.set.call(this, value);
          } else if (originalDescriptor?.writable) {
            originalDescriptor.value = value;
          }
        }
      },
      configurable: true,
      enumerable: originalDescriptor?.enumerable || false,
    });
  }

  private handlePollutionAttempt(alert: PollutionAlert): void {
    if (this.options.enableLogging) {
      detectorLogger.warn('Prototype pollution attempt detected', { alert });
    }

    if (this.options.alertCallback) {
      this.options.alertCallback(alert);
    }

    if (this.options.throwOnDetection) {
      throw new PrototypePollutionError(
        `Prototype pollution attempt blocked: ${alert.prototype}.${alert.property}`,
        {
          details: {
            prototype: alert.prototype,
            property: alert.property,
            value: alert.value,
          },
        }
      );
    }
  }

  /**
   * Scan for existing prototype pollution
   */
  scanForPollution(): PollutionAlert[] {
    const alerts: PollutionAlert[] = [];
    const prototypes = this.options.monitoredPrototypes || [];

    prototypes.forEach(proto => {
      const protoName = proto.constructor.name;

      // Check for unexpected properties
      Object.getOwnPropertyNames(proto).forEach(prop => {
        if (!this.isExpectedProperty(proto, prop)) {
          alerts.push({
            type: 'pollution_detected',
            prototype: protoName,
            property: prop,
            value: proto?.[prop],
            stack: '',
            timestamp: Date.now(),
          });
        }
      });
    });

    return alerts;
  }

  private isExpectedProperty(proto: unknown, property: string): boolean {
    // Define expected properties for common prototypes
    const expectedProperties: Record<string, string[]> = {
      Object: [
        'constructor',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'toLocaleString',
        'toString',
        'valueOf',
      ],
      Array: [
        'constructor',
        'length',
        'concat',
        'join',
        'pop',
        'push',
        'reverse',
        'shift',
        'slice',
        'sort',
        'splice',
        'unshift',
        'indexOf',
        'lastIndexOf',
        'forEach',
        'map',
        'filter',
        'reduce',
        'reduceRight',
        'every',
        'some',
        'find',
        'findIndex',
        'includes',
      ],
      Function: ['constructor', 'apply', 'bind', 'call', 'toString', 'length', 'name'],
    };

    const protoName = proto.constructor.name;
    const expected = expectedProperties?.[protoName] || [];

    return expected.includes(property) || property.startsWith('Symbol.');
  }

  /**
   * Clean up detected pollution
   */
  cleanupPollution(): void {
    const alerts = this.scanForPollution();

    alerts.forEach(alert => {
      try {
        const proto = this.options.monitoredPrototypes?.find(
          p => p.constructor.name === alert.prototype
        );

        if (proto && proto.hasOwnProperty(alert.property)) {
          delete proto?.[alert.property];

          if (this.options.enableLogging) {
            detectorLogger.info('Cleaned up polluted property', {
              prototype: alert.prototype,
              property: alert.property,
            });
          }
        }
      } catch (error) {
        detectorLogger.error('Failed to cleanup polluted property', {
          prototype: alert.prototype,
          property: alert.property,
          error,
        });
      }
    });
  }

  /**
   * Restore original property descriptors
   */
  restore(): void {
    this.originalDescriptors.forEach((descriptors, obj) => {
      descriptors.forEach((descriptor, property) => {
        try {
          Object.defineProperty(obj, property, descriptor);
        } catch (error) {
          detectorLogger.error('Failed to restore property descriptor', {
            property,
            prototype: obj.constructor?.name ?? 'UnknownPrototype',
            error,
          });
        }
      });
    });

    this.originalDescriptors.clear();
  }
}

/**
 * Safe object utilities to prevent prototype pollution
 */
export class SafeObjectUtils {
  private static dangerousKeys = ['__proto__', 'constructor', 'prototype'];

  /**
   * Safe object merge that prevents prototype pollution
   */
  static safeMerge(target: unknown, source: unknown, maxDepth = 10): unknown {
    if (maxDepth <= 0) {
      throw new PrototypePollutionError('Maximum merge depth exceeded', {
        details: { maxDepth },
      });
    }

    if (!source || typeof source !== 'object') {
      return target;
    }

    if (!target || typeof target !== 'object') {
      throw new PrototypePollutionError('Target must be an object', {
        details: { target },
      });
    }

    const targetObject = target as Record<string, unknown>;
    const sourceObject = source as Record<string, unknown>;

    for (const key of Object.keys(sourceObject)) {
      if (this.dangerousKeys.includes(key)) {
        continue;
      }

      const sourceValue = sourceObject[key];

      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        if (!targetObject[key] || typeof targetObject[key] !== 'object') {
          targetObject[key] = {};
        }
        this.safeMerge(targetObject[key], sourceValue, maxDepth - 1);
      } else {
        targetObject[key] = sourceValue;
      }
    }

    return targetObject;
  }

  /**
   * Safe Object.assign alternative
   */
  static safeAssign(target: unknown, ...sources: unknown[]): unknown {
    if (!target || typeof target !== 'object') {
      throw new PrototypePollutionError('Target must be an object', {
        details: { target },
      });
    }

    const targetObject = target as Record<string, unknown>;

    sources.forEach(source => {
      if (source && typeof source === 'object') {
        Object.keys(source).forEach(key => {
          if (!this.dangerousKeys.includes(key)) {
            targetObject[key] = (source as Record<string, unknown>)[key];
          }
        });
      }
    });

    return targetObject;
  }

  /**
   * Safe property setter with path validation
   */
  static safeSet(obj: unknown, path: string, value: unknown): void {
    if (!obj || typeof obj !== 'object') {
      throw new PrototypePollutionError('Target must be an object', {
        details: { path },
      });
    }

    const keys = path.split('.');

    if (keys.some(key => this.dangerousKeys.includes(key))) {
      throw new PrototypePollutionError(`Dangerous key detected in path: ${path}`, {
        details: { path },
      });
    }

    let current: Record<string, unknown> = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const currentValue = current[key];

      if (!currentValue || typeof currentValue !== 'object') {
        current[key] = {};
      }

      current = current[key];
    }

    const finalKey = keys[keys.length - 1];
    if (!this.dangerousKeys.includes(finalKey)) {
      current[finalKey] = value;
    }
  }

  /**
   * Create object with null prototype to prevent pollution
   */
  static createSafeObject(): unknown {
    return Object.create(null);
  }

  /**
   * Validate object doesn't contain prototype pollution
   */
  static validateObject(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') {
      return true;
    }

    // Check for dangerous keys at any level
    const checkRecursive = (current: unknown, depth = 0): boolean => {
      if (depth > 10) return true; // Prevent infinite recursion

      for (const key in current) {
        if (this.dangerousKeys.includes(key)) {
          return false;
        }

        const child = (current as Record<string, unknown>)[key];
        if (child && typeof child === 'object') {
          if (!checkRecursive(child, depth + 1)) {
            return false;
          }
        }
      }

      return true;
    };

    return checkRecursive(obj);
  }
}

// Global detector instance
let globalDetector: PrototypePollutionDetector | null = null;

/**
 * Initialize global prototype pollution protection
 */
export function initializePrototypePollutionProtection(
  options: PrototypePollutionOptions = {}
): PrototypePollutionDetector {
  if (globalDetector) {
    globalDetector.restore();
  }

  globalDetector = new PrototypePollutionDetector(options);
  return globalDetector;
}

/**
 * Get the global detector instance
 */
export function getPrototypePollutionDetector(): PrototypePollutionDetector | null {
  return globalDetector;
}

export { PrototypePollutionDetector };
