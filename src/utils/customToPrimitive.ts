/**
 * Custom class that overrides Symbol.toPrimitive to return different values
 * based on the hint type ("string", "number", or "default")
 *
 * Symbol.toPrimitive is a well-known symbol that specifies a function valued property
 * that is called to convert an object to a corresponding primitive value.
 */

/**
 * A custom class that demonstrates Symbol.toPrimitive implementation
 * Returns different values based on the conversion hint
 */
export class SmartValue {
  constructor(
    private readonly numericValue: number,
    private readonly stringValue: string,
    private readonly defaultValue: number | string = numericValue
  ) {}

  /**
   * Override Symbol.toPrimitive to control type coercion behavior
   * @param hint - The type hint: "string", "number", or "default"
   * @returns The appropriate primitive value based on the hint
   */
  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string | number {
    switch (hint) {
      case 'string':
        return this.stringValue;
      case 'number':
        return this.numericValue;
      case 'default':
        return this.defaultValue;
      default:
        // TypeScript ensures this is exhaustive, but for runtime safety
        return this.defaultValue;
    }
  }

  /**
   * Get the numeric value directly
   */
  getNumericValue(): number {
    return this.numericValue;
  }

  /**
   * Get the string value directly
   */
  getStringValue(): string {
    return this.stringValue;
  }

  /**
   * Get the default value directly
   */
  getDefaultValue(): number | string {
    return this.defaultValue;
  }
}

/**
 * A temperature class that converts between Celsius and Fahrenheit
 * based on the conversion hint
 */
export class Temperature {
  constructor(private readonly celsius: number) {}

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string | number {
    switch (hint) {
      case 'string':
        // Return formatted string with both units
        return `${this.celsius}°C (${this.toFahrenheit()}°F)`;
      case 'number':
        // Return numeric value in Celsius
        return this.celsius;
      case 'default':
        // Default to Celsius for arithmetic operations
        return this.celsius;
      default:
        return this.celsius;
    }
  }

  private toFahrenheit(): number {
    return Math.round((this.celsius * 9) / 5 + 32);
  }

  getCelsius(): number {
    return this.celsius;
  }

  getFahrenheit(): number {
    return this.toFahrenheit();
  }
}

/**
 * A currency class that formats differently based on context
 */
export class Currency {
  constructor(
    private readonly amount: number,
    private readonly code: string = 'USD',
    private readonly symbol: string = '$'
  ) {}

  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string | number {
    switch (hint) {
      case 'string':
        // Return formatted currency string
        return `${this.symbol}${this.amount.toFixed(2)} ${this.code}`;
      case 'number':
        // Return raw numeric amount for calculations
        return this.amount;
      case 'default':
        // Default to numeric for arithmetic operations
        return this.amount;
      default:
        return this.amount;
    }
  }

  getAmount(): number {
    return this.amount;
  }

  getCode(): string {
    return this.code;
  }

  getSymbol(): string {
    return this.symbol;
  }
}

/**
 * Factory function to create a SmartValue instance
 */
export function createSmartValue(
  numericValue: number,
  stringValue: string,
  defaultValue?: number | string
): SmartValue {
  return new SmartValue(numericValue, stringValue, defaultValue);
}

/**
 * Factory function to create a Temperature instance
 */
export function createTemperature(celsius: number): Temperature {
  return new Temperature(celsius);
}

/**
 * Factory function to create a Currency instance
 */
export function createCurrency(amount: number, code?: string, symbol?: string): Currency {
  return new Currency(amount, code, symbol);
}
