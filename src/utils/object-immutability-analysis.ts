/**
 * Comprehensive analysis of Object.freeze, Object.seal, and Object.preventExtensions
 * for prototype pollution protection
 */

interface ImmutabilityTestResult {
  method: string;
  canAddProperties: boolean;
  canModifyProperties: boolean;
  canDeleteProperties: boolean;
  canModifyPrototype: boolean;
  canPolluteThroughPrototype: boolean;
  protectionLevel: 'none' | 'partial' | 'strong';
  notes: string[];
}

export class ObjectImmutabilityAnalyzer {
  /**
   * Test Object.freeze() behavior
   */
  static testFreeze(): ImmutabilityTestResult {
    const notes: string[] = [];

    // Test basic object
    const obj = { existing: 'value' };
    Object.freeze(obj);

    // Test property addition
    let canAddProperties = false;
    try {
      (obj as Record<string, unknown>).newProp = 'new';
      canAddProperties = (obj as Record<string, unknown>).newProp === 'new';
    } catch (_e) {
      notes.push('Property addition throws in strict mode');
    }

    // Test property modification
    let canModifyProperties = false;
    try {
      obj.existing = 'modified';
      canModifyProperties = obj.existing === 'modified';
    } catch (_e) {
      notes.push('Property modification throws in strict mode');
    }

    // Test property deletion
    let canDeleteProperties = false;
    try {
      delete (obj as Record<string, unknown>).existing;
      canDeleteProperties = !Object.prototype.hasOwnProperty.call(obj, 'existing');
    } catch (_e) {
      notes.push('Property deletion throws in strict mode');
    }

    // Test prototype modification
    let canModifyPrototype = false;
    try {
      (obj as Record<string, unknown>).__proto__ = { polluted: true };
      canModifyPrototype = (obj as Record<string, unknown>).polluted === true;
    } catch (_e) {
      notes.push('Direct __proto__ assignment may throw');
    }

    // Test pollution through prototype chain
    let canPolluteThroughPrototype = false;
    try {
      (Object.prototype as Record<string, unknown>).testPollution = 'freeze-test';
      canPolluteThroughPrototype = (obj as Record<string, unknown>).testPollution === 'freeze-test';
      delete (Object.prototype as Record<string, unknown>).testPollution; // Cleanup
    } catch (_e) {
      notes.push('Prototype pollution test failed');
    }

    return {
      method: 'Object.freeze()',
      canAddProperties,
      canModifyProperties,
      canDeleteProperties,
      canModifyPrototype,
      canPolluteThroughPrototype,
      protectionLevel: canPolluteThroughPrototype ? 'partial' : 'strong',
      notes,
    };
  }

  /**
   * Test Object.seal() behavior
   */
  static testSeal(): ImmutabilityTestResult {
    const notes: string[] = [];

    const obj = { existing: 'value' };
    Object.seal(obj);

    // Test property addition
    let canAddProperties = false;
    try {
      (obj as Record<string, unknown>).newProp = 'new';
      canAddProperties = (obj as Record<string, unknown>).newProp === 'new';
    } catch (_e) {
      notes.push('Property addition throws in strict mode');
    }

    // Test property modification (should work with seal)
    let canModifyProperties = false;
    try {
      obj.existing = 'modified';
      canModifyProperties = obj.existing === 'modified';
    } catch (_e) {
      notes.push('Property modification unexpectedly threw');
    }

    // Test property deletion
    let canDeleteProperties = false;
    try {
      delete (obj as Record<string, unknown>).existing;
      canDeleteProperties = !Object.prototype.hasOwnProperty.call(obj, 'existing');
    } catch (_e) {
      notes.push('Property deletion throws in strict mode');
    }

    // Test prototype modification
    let canModifyPrototype = false;
    try {
      (obj as Record<string, unknown>).__proto__ = { polluted: true };
      canModifyPrototype = (obj as Record<string, unknown>).polluted === true;
    } catch (_e) {
      notes.push('Direct __proto__ assignment may throw');
    }

    // Test pollution through prototype chain
    let canPolluteThroughPrototype = false;
    try {
      (Object.prototype as Record<string, unknown>).testPollution = 'seal-test';
      canPolluteThroughPrototype = (obj as Record<string, unknown>).testPollution === 'seal-test';
      delete (Object.prototype as Record<string, unknown>).testPollution; // Cleanup
    } catch (_e) {
      notes.push('Prototype pollution test failed');
    }

    return {
      method: 'Object.seal()',
      canAddProperties,
      canModifyProperties,
      canDeleteProperties,
      canModifyPrototype,
      canPolluteThroughPrototype,
      protectionLevel: canPolluteThroughPrototype ? 'partial' : 'strong',
      notes,
    };
  }

  /**
   * Test Object.preventExtensions() behavior
   */
  static testPreventExtensions(): ImmutabilityTestResult {
    const notes: string[] = [];

    const obj = { existing: 'value' };
    Object.preventExtensions(obj);

    // Test property addition
    let canAddProperties = false;
    try {
      (obj as Record<string, unknown>).newProp = 'new';
      canAddProperties = (obj as Record<string, unknown>).newProp === 'new';
    } catch (_e) {
      notes.push('Property addition throws in strict mode');
    }

    // Test property modification (should work)
    let canModifyProperties = false;
    try {
      obj.existing = 'modified';
      canModifyProperties = obj.existing === 'modified';
    } catch (_e) {
      notes.push('Property modification unexpectedly threw');
    }

    // Test property deletion (should work)
    let canDeleteProperties = false;
    try {
      delete (obj as Record<string, unknown>).existing;
      canDeleteProperties = !Object.prototype.hasOwnProperty.call(obj, 'existing');
    } catch (_e) {
      notes.push('Property deletion unexpectedly threw');
    }

    // Test prototype modification
    let canModifyPrototype = false;
    try {
      (obj as Record<string, unknown>).__proto__ = { polluted: true };
      canModifyPrototype = (obj as Record<string, unknown>).polluted === true;
    } catch (_e) {
      notes.push('Direct __proto__ assignment may throw');
    }

    // Test pollution through prototype chain
    let canPolluteThroughPrototype = false;
    try {
      (Object.prototype as Record<string, unknown>).testPollution = 'preventExt-test';
      canPolluteThroughPrototype =
        (obj as Record<string, unknown>).testPollution === 'preventExt-test';
      delete (Object.prototype as Record<string, unknown>).testPollution; // Cleanup
    } catch (_e) {
      notes.push('Prototype pollution test failed');
    }

    return {
      method: 'Object.preventExtensions()',
      canAddProperties,
      canModifyProperties,
      canDeleteProperties,
      canModifyPrototype,
      canPolluteThroughPrototype,
      protectionLevel: 'none', // Offers minimal protection
      notes,
    };
  }

  /**
   * Test deep freezing approach
   */
  static testDeepFreeze(): ImmutabilityTestResult {
    const notes: string[] = [];

    const obj = {
      level1: {
        level2: {
          value: 'deep',
        },
      },
    };

    // Deep freeze implementation
    function deepFreeze(obj: unknown): unknown {
      Object.getOwnPropertyNames(obj).forEach(prop => {
        if (obj?.[prop] !== null && typeof obj?.[prop] === 'object') {
          deepFreeze(obj?.[prop]);
        }
      });
      return Object.freeze(obj);
    }

    deepFreeze(obj);

    // Test nested modification
    let canModifyNested = false;
    try {
      obj.level1.level2.value = 'modified';
      canModifyNested = obj.level1.level2.value === 'modified';
    } catch (_e) {
      notes.push('Nested modification throws in strict mode');
    }

    // Test prototype pollution
    let canPolluteThroughPrototype = false;
    try {
      (Object.prototype as Record<string, unknown>).testPollution = 'deep-freeze-test';
      canPolluteThroughPrototype =
        (obj as Record<string, unknown>).testPollution === 'deep-freeze-test';
      delete (Object.prototype as Record<string, unknown>).testPollution; // Cleanup
    } catch (_e) {
      notes.push('Prototype pollution test failed');
    }

    return {
      method: 'Deep Object.freeze()',
      canAddProperties: false,
      canModifyProperties: !canModifyNested,
      canDeleteProperties: false,
      canModifyPrototype: false,
      canPolluteThroughPrototype,
      protectionLevel: canPolluteThroughPrototype ? 'partial' : 'strong',
      notes,
    };
  }

  /**
   * Test prototype-specific protection
   */
  static testPrototypeProtection(): ImmutabilityTestResult {
    const notes: string[] = [];

    // Freeze the prototypes themselves
    const _originalObjectProto = Object.getOwnPropertyDescriptors(Object.prototype);
    Object.freeze(Object.prototype);

    let canPolluteThroughPrototype = false;
    let canModifyPrototype = false;

    try {
      // Try to add property to Object.prototype
      (Object.prototype as Record<string, unknown>).polluted = 'test';
      canPolluteThroughPrototype = ({} as Record<string, unknown>).polluted === 'test';

      if (canPolluteThroughPrototype) {
        notes.push('Object.prototype pollution succeeded despite freeze');
      } else {
        notes.push('Object.prototype pollution blocked by freeze');
      }
    } catch (_e) {
      notes.push('Object.prototype modification threw error');
    }

    try {
      // Try to modify existing prototype property
      const originalToString = Object.prototype.toString;
      (Object.prototype as Record<string, unknown>).toString = () => 'hacked';
      canModifyPrototype = Object.prototype.toString !== originalToString;
    } catch (_e) {
      notes.push('Prototype method modification threw error');
    }

    // Cleanup
    delete (Object.prototype as unknown).polluted;

    return {
      method: 'Object.freeze(Object.prototype)',
      canAddProperties: false,
      canModifyProperties: false,
      canDeleteProperties: false,
      canModifyPrototype,
      canPolluteThroughPrototype,
      protectionLevel: canPolluteThroughPrototype ? 'none' : 'strong',
      notes,
    };
  }

  /**
   * Run comprehensive analysis
   */
  static runFullAnalysis(): ImmutabilityTestResult[] {
    return [
      this.testFreeze(),
      this.testSeal(),
      this.testPreventExtensions(),
      this.testDeepFreeze(),
      this.testPrototypeProtection(),
    ];
  }

  /**
   * Generate security recommendations
   */
  static generateRecommendations(): string[] {
    return [
      '❌ Object.freeze/seal/preventExtensions do NOT protect against prototype pollution',
      '✅ These methods only protect the specific object instance, not the prototype chain',
      '⚠️  Freezing Object.prototype itself can provide protection but may break libraries',
      '🔒 Use Object.create(null) to create objects without prototype chain',
      '🛡️  Implement input validation and sanitization instead',
      '🔍 Use runtime detection for comprehensive protection',
      '📦 Consider using Map/Set for key-value storage instead of plain objects',
    ];
  }
}

/**
 * Practical protection strategies that actually work
 */
export class EffectivePrototypeProtection {
  /**
   * Create truly safe object without prototype
   */
  static createSafeObject(properties?: Record<string, unknown>): unknown {
    const obj = Object.create(null);
    if (properties) {
      Object.assign(obj, properties);
    }
    return obj;
  }

  /**
   * Safe object creation with controlled prototype
   */
  static createControlledObject(prototype: unknown = null): unknown {
    return Object.create(prototype);
  }

  /**
   * Defensive prototype freezing (use with caution)
   */
  static freezePrototypes(): void {
    // Only in controlled environments
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
      Object.freeze(Object.prototype);
      Object.freeze(Array.prototype);
      Object.freeze(Function.prototype);
    }
  }

  /**
   * Check if an object has a safe prototype chain
   */
  static hasSafePrototype(obj: unknown): boolean {
    if (obj === null || typeof obj !== 'object') return true;

    let current = obj;
    let depth = 0;
    const maxDepth = 10;

    while (current && depth < maxDepth) {
      const proto = Object.getPrototypeOf(current);

      if (proto === null) return true; // Null prototype is safe
      if (proto === Object.prototype) return true; // Standard prototype is acceptable

      // Check for suspicious properties
      const ownProps = Object.getOwnPropertyNames(proto);
      const suspiciousProps = ['polluted', 'isAdmin', 'constructor'];

      if (ownProps.some(prop => suspiciousProps.includes(prop))) {
        return false;
      }

      current = proto;
      depth++;
    }

    return depth < maxDepth; // Avoid infinite chains
  }
}
