/**
 * Data sanitization utilities for ensuring logs, analytics, and integrations
 * do not leak personally identifiable information (PII) or other sensitive data.
 */

export type SanitizableValue = unknown;

interface SanitizerRule {
  pattern: RegExp;
  replacement: string;
}

const STRING_RULES: readonly SanitizerRule[] = [
  {
    pattern: /\b[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, // email addresses
    replacement: '[REDACTED_EMAIL]',
  },
  {
    pattern: /(?<!\d)(?:\+?\d[\s-]?){7,15}(?!\d)/g, // phone numbers and international formats
    replacement: '[REDACTED_PHONE]',
  },
  {
    pattern: /(?<!\d)(?:\d[ -]?){13,19}(?:\d)(?!\d)/g, // credit/debit card numbers
    replacement: '[REDACTED_CARD]',
  },
  {
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g, // US SSN pattern
    replacement: '[REDACTED_SSN]',
  },
  {
    pattern: /(?<![A-Za-z0-9])(?:[A-Za-z0-9]{32,}|sk-[A-Za-z0-9]{20,})(?![A-Za-z0-9])/g, // API keys, tokens
    replacement: '[REDACTED_TOKEN]',
  },
];

interface SensitiveKeyRule {
  pattern: RegExp;
  replacement: string;
}

const SENSITIVE_KEY_RULES: readonly SensitiveKeyRule[] = [
  { pattern: /(password|passcode|pwd)/i, replacement: '[REDACTED_PASSWORD]' },
  { pattern: /(token|apikey|api_key|secret|signature|auth)/i, replacement: '[REDACTED_TOKEN]' },
  { pattern: /(ssn|social|nationalid)/i, replacement: '[REDACTED_SSN]' },
  { pattern: /(email|e-mail)/i, replacement: '[REDACTED_EMAIL]' },
  { pattern: /(phone|mobile|contact)/i, replacement: '[REDACTED_PHONE]' },
  { pattern: /(address|street|city|zip|postal)/i, replacement: '[REDACTED_ADDRESS]' },
  { pattern: /(latitude|longitude|lat|lon|lng)/i, replacement: '[REDACTED_COORDINATE]' },
  { pattern: /(credit|card|cc|cvc|cvv|iban|account)/i, replacement: '[REDACTED_PAYMENT]' },
];

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const sanitizeString = (value: string): string => {
  let sanitized = value;

  for (const rule of STRING_RULES) {
    sanitized = sanitized.replace(rule.pattern, rule.replacement);
  }

  return sanitized;
};

const redactForKey = (keyPath: readonly string[]): string | null => {
  if (keyPath.length === 0) {
    return null;
  }

  const key = keyPath[keyPath.length - 1];

  for (const rule of SENSITIVE_KEY_RULES) {
    if (rule.pattern.test(key)) {
      return rule.replacement;
    }
  }

  return null;
};

const sanitizeArray = (
  value: unknown[],
  keyPath: readonly string[],
  visited: WeakMap<object, unknown>
): unknown[] => {
  if (visited.has(value)) {
    return visited.get(value) as unknown[];
  }

  const result: unknown[] = [];
  visited.set(value, result);

  value.forEach((item, index) => {
    result[index] = sanitizeValue(item, [...keyPath, String(index)], visited);
  });

  return result;
};

const sanitizeObject = (
  value: Record<string, unknown>,
  keyPath: readonly string[],
  visited: WeakMap<object, unknown>
): Record<string, unknown> => {
  if (visited.has(value)) {
    return visited.get(value) as Record<string, unknown>;
  }

  const result: Record<string, unknown> = {};
  visited.set(value, result);

  for (const [key, nestedValue] of Object.entries(value)) {
    result[key] = sanitizeValue(nestedValue, [...keyPath, key], visited);
  }

  return result;
};

const sanitizeValue = (
  value: SanitizableValue,
  keyPath: readonly string[],
  visited: WeakMap<object, unknown>
): unknown => {
  if (value === null || typeof value === 'undefined') {
    return value;
  }

  const redaction = redactForKey(keyPath);
  if (redaction) {
    return redaction;
  }

  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof Error) {
    return {
      name: sanitizeString(value.name),
      message: sanitizeString(value.message),
      stack: value.stack ? sanitizeString(value.stack) : undefined,
    };
  }

  if (Array.isArray(value)) {
    return sanitizeArray(value, keyPath, visited);
  }

  if (isPlainObject(value)) {
    return sanitizeObject(value, keyPath, visited);
  }

  return value;
};

/**
 * Deeply sanitize any value, returning a cloned structure with sensitive
 * values redacted.
 */
export const sanitizeData = <T>(value: T): T => {
  return sanitizeValue(value as SanitizableValue, [], new WeakMap()) as T;
};

/**
 * Sanitize a log record's message and context before it is emitted.
 */
export const sanitizeLogRecord = <T extends { message: string; context?: Record<string, unknown> }>(
  record: T
): T => {
  const sanitizedMessage = sanitizeString(record.message);
  const sanitizedContext = record.context ? sanitizeData(record.context) : undefined;

  return {
    ...record,
    message: sanitizedMessage,
    context: sanitizedContext,
  };
};

/**
 * Sanitize analytics or integration payloads prior to transmission.
 */
export const sanitizeAnalyticsPayload = <T>(payload: T): T => {
  return sanitizeData(payload);
};

export { sanitizeString };
