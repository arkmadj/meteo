/**
 * Subscription Encryption Utilities
 * Provides secure encryption/decryption for push subscription sensitive data
 * using Web Crypto API with AES-GCM encryption and PBKDF2 key derivation
 */

import type { EncryptedSubscriptionKeys, SubscriptionKeys } from '@/types/subscriptionStorage';

/**
 * Default encryption configuration
 */
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM' as const,
  keyLength: 256,
  ivLength: 12,
  saltLength: 16,
  pbkdf2Iterations: 100000,
  tagLength: 128,
};

/**
 * Check if Web Crypto API is available
 */
export const isCryptoSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.subtle !== 'undefined'
  );
};

/**
 * Generate a random initialization vector
 */
const generateIV = (): Uint8Array<ArrayBuffer> => {
  return window.crypto.getRandomValues(
    new Uint8Array(ENCRYPTION_CONFIG.ivLength)
  ) as Uint8Array<ArrayBuffer>;
};

/**
 * Generate a random salt for key derivation
 */
const generateSalt = (): Uint8Array<ArrayBuffer> => {
  return window.crypto.getRandomValues(
    new Uint8Array(ENCRYPTION_CONFIG.saltLength)
  ) as Uint8Array<ArrayBuffer>;
};

/**
 * Convert ArrayBuffer to base64 string
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

/**
 * Convert base64 string to ArrayBuffer
 */
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Derive an encryption key from a password using PBKDF2
 */
const deriveKey = async (
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number = ENCRYPTION_CONFIG.pbkdf2Iterations
): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ENCRYPTION_CONFIG.algorithm, length: ENCRYPTION_CONFIG.keyLength },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Get or generate a device-specific encryption passphrase
 * Uses a combination of device fingerprint and stored secret
 */
const getEncryptionPassphrase = async (): Promise<string> => {
  const storageKey = 'push_subscription_enc_key';
  let storedKey = localStorage.getItem(storageKey);

  if (!storedKey) {
    // Generate a new random key
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
    storedKey = arrayBufferToBase64(randomBytes.buffer);
    localStorage.setItem(storageKey, storedKey);
  }

  // Combine with device fingerprint elements for additional security
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.colorDepth.toString(),
  ].join('|');

  // Create a combined passphrase
  const encoder = new TextEncoder();
  const combined = encoder.encode(storedKey + fingerprint);
  const hash = await window.crypto.subtle.digest('SHA-256', combined);
  return arrayBufferToBase64(hash);
};

/**
 * Encrypt a string value
 */
const encryptValue = async (
  value: string,
  key: CryptoKey,
  iv: Uint8Array<ArrayBuffer>
): Promise<string> => {
  const encoder = new TextEncoder();
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv: iv as BufferSource,
      tagLength: ENCRYPTION_CONFIG.tagLength,
    },
    key,
    encoder.encode(value)
  );
  return arrayBufferToBase64(encrypted);
};

/**
 * Decrypt an encrypted string value
 */
const decryptValue = async (
  encryptedValue: string,
  key: CryptoKey,
  iv: Uint8Array<ArrayBuffer>
): Promise<string> => {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv: iv as BufferSource,
      tagLength: ENCRYPTION_CONFIG.tagLength,
    },
    key,
    base64ToArrayBuffer(encryptedValue)
  );
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};

/**
 * Encrypt subscription keys (p256dh and auth)
 */
export const encryptSubscriptionKeys = async (
  keys: SubscriptionKeys
): Promise<EncryptedSubscriptionKeys> => {
  if (!isCryptoSupported()) {
    throw new Error('Web Crypto API is not supported in this environment');
  }

  const passphrase = await getEncryptionPassphrase();
  const salt = generateSalt();
  const iv = generateIV();
  const encryptionKey = await deriveKey(passphrase, salt);

  const [encryptedP256dh, encryptedAuth] = await Promise.all([
    encryptValue(keys.p256dh, encryptionKey, iv),
    encryptValue(keys.auth, encryptionKey, iv),
  ]);

  return {
    encryptedP256dh,
    encryptedAuth,
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    algorithm: ENCRYPTION_CONFIG.algorithm,
    keyDerivation: {
      algorithm: 'PBKDF2',
      iterations: ENCRYPTION_CONFIG.pbkdf2Iterations,
      salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    },
  };
};

/**
 * Decrypt subscription keys
 */
export const decryptSubscriptionKeys = async (
  encryptedKeys: EncryptedSubscriptionKeys
): Promise<SubscriptionKeys> => {
  if (!isCryptoSupported()) {
    throw new Error('Web Crypto API is not supported in this environment');
  }

  const passphrase = await getEncryptionPassphrase();
  const salt = new Uint8Array(base64ToArrayBuffer(encryptedKeys.keyDerivation.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(encryptedKeys.iv));
  const decryptionKey = await deriveKey(passphrase, salt, encryptedKeys.keyDerivation.iterations);

  const [p256dh, auth] = await Promise.all([
    decryptValue(encryptedKeys.encryptedP256dh, decryptionKey, iv),
    decryptValue(encryptedKeys.encryptedAuth, decryptionKey, iv),
  ]);

  return { p256dh, auth };
};

/**
 * Generate a SHA-256 hash of an endpoint URL for indexing
 */
export const hashEndpoint = async (endpoint: string): Promise<string> => {
  if (!isCryptoSupported()) {
    // Fallback to simple hash for non-crypto environments
    let hash = 0;
    for (let i = 0; i < endpoint.length; i++) {
      const char = endpoint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  const encoder = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(endpoint));
  return arrayBufferToBase64(hashBuffer);
};

/**
 * Generate a checksum for data integrity verification
 */
export const generateChecksum = async (data: string): Promise<string> => {
  if (!isCryptoSupported()) {
    // Simple fallback checksum
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum = (sum + data.charCodeAt(i)) % 0xffffffff;
    }
    return `cs_${sum.toString(16)}`;
  }

  const encoder = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(data));
  // Use first 8 bytes for checksum (16 hex chars)
  const hashArray = new Uint8Array(hashBuffer).slice(0, 8);
  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Verify checksum for data integrity
 */
export const verifyChecksum = async (data: string, checksum: string): Promise<boolean> => {
  const computedChecksum = await generateChecksum(data);
  return computedChecksum === checksum;
};

/**
 * Securely clear encryption keys from memory (best effort)
 * Note: JavaScript doesn't guarantee memory clearing, but this helps
 */
export const secureClearKeys = (): void => {
  // Remove the stored encryption key
  localStorage.removeItem('push_subscription_enc_key');
};

/**
 * Generate a unique subscription ID
 */
export const generateSubscriptionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = window.crypto.getRandomValues(new Uint8Array(8));
  const randomStr = Array.from(randomPart)
    .map(b => b.toString(36))
    .join('');
  return `sub_${timestamp}_${randomStr}`;
};
