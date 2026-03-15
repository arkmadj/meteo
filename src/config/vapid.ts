/**
 * VAPID Key Configuration
 * Configuration for Web Push VAPID (Voluntary Application Server Identification) keys
 * 
 * VAPID keys are used to identify your application server to the push service.
 * The public key is shared with the browser for subscription, while the private
 * key is used server-side to sign push messages.
 * 
 * @see https://datatracker.ietf.org/doc/html/rfc8292
 */

/**
 * VAPID configuration interface
 */
export interface VapidConfig {
  /** Base64 URL-encoded public key for push subscription */
  publicKey: string;
  /** Subject (usually mailto: or https: URL identifying the app) */
  subject?: string;
  /** Whether VAPID is properly configured */
  isConfigured: boolean;
  /** Validation errors if configuration is invalid */
  validationErrors: string[];
}

/**
 * VAPID key format validation regex
 * VAPID public keys should be base64url encoded and typically 87 characters
 */
const VAPID_PUBLIC_KEY_REGEX = /^[A-Za-z0-9_-]{87}$/;

/**
 * Minimum length for a valid VAPID public key
 */
const MIN_VAPID_KEY_LENGTH = 65;

/**
 * Get VAPID public key from environment variables
 */
function getVapidPublicKey(): string {
  // Check for Vite environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VAPID_PUBLIC_KEY) {
    return import.meta.env.VITE_VAPID_PUBLIC_KEY;
  }
  
  // Fallback for Node.js/testing environments
  if (typeof process !== 'undefined' && process.env?.VITE_VAPID_PUBLIC_KEY) {
    return process.env.VITE_VAPID_PUBLIC_KEY;
  }
  
  return '';
}

/**
 * Get VAPID subject from environment variables
 */
function getVapidSubject(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VAPID_SUBJECT) {
    return import.meta.env.VITE_VAPID_SUBJECT;
  }
  
  if (typeof process !== 'undefined' && process.env?.VITE_VAPID_SUBJECT) {
    return process.env.VITE_VAPID_SUBJECT;
  }
  
  return '';
}

/**
 * Validate VAPID public key format
 */
export function validateVapidPublicKey(key: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!key || key.trim() === '') {
    errors.push('VAPID public key is not configured');
    return { isValid: false, errors };
  }
  
  if (key.length < MIN_VAPID_KEY_LENGTH) {
    errors.push(`VAPID public key is too short (minimum ${MIN_VAPID_KEY_LENGTH} characters)`);
  }
  
  // Check for common placeholder values
  if (key.includes('your_') || key.includes('YOUR_') || key === 'replace_with_your_key') {
    errors.push('VAPID public key contains placeholder value');
  }
  
  // Validate base64url format (standard VAPID keys are 87 chars)
  if (key.length >= MIN_VAPID_KEY_LENGTH && !VAPID_PUBLIC_KEY_REGEX.test(key)) {
    // Allow slightly different lengths but warn about format
    const base64urlRegex = /^[A-Za-z0-9_-]+$/;
    if (!base64urlRegex.test(key)) {
      errors.push('VAPID public key contains invalid characters (must be base64url encoded)');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate VAPID subject format
 */
export function validateVapidSubject(subject: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!subject || subject.trim() === '') {
    // Subject is optional but recommended
    return { isValid: true, errors };
  }
  
  // Subject should be a mailto: or https: URL
  if (!subject.startsWith('mailto:') && !subject.startsWith('https://')) {
    errors.push('VAPID subject must be a mailto: or https: URL');
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Get the complete VAPID configuration
 */
export function getVapidConfig(): VapidConfig {
  const publicKey = getVapidPublicKey();
  const subject = getVapidSubject();
  
  const keyValidation = validateVapidPublicKey(publicKey);
  const subjectValidation = validateVapidSubject(subject);
  
  const validationErrors = [...keyValidation.errors, ...subjectValidation.errors];
  
  return {
    publicKey,
    subject: subject || undefined,
    isConfigured: keyValidation.isValid,
    validationErrors,
  };
}

/**
 * Check if VAPID is properly configured
 */
export function isVapidConfigured(): boolean {
  const config = getVapidConfig();
  return config.isConfigured;
}

/**
 * Get the VAPID public key for push subscription
 * Returns undefined if not configured
 */
export function getVapidPublicKeyForSubscription(): string | undefined {
  const config = getVapidConfig();
  return config.isConfigured ? config.publicKey : undefined;
}

/**
 * Log VAPID configuration status (for debugging)
 */
export function logVapidConfigStatus(): void {
  const config = getVapidConfig();
  
  if (config.isConfigured) {
    console.log('[VAPID] Configuration valid');
    console.log('[VAPID] Public key:', config.publicKey.substring(0, 20) + '...');
    if (config.subject) {
      console.log('[VAPID] Subject:', config.subject);
    }
  } else {
    console.warn('[VAPID] Configuration invalid:');
    config.validationErrors.forEach(error => console.warn('[VAPID]  -', error));
  }
}

