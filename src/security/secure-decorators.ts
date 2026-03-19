/**
 * SECURE DECORATOR IMPLEMENTATIONS
 *
 * ✅ These are examples of SECURE implementations
 * Use these patterns in production code
 */

import crypto from 'crypto';

import { getLogger } from '@/utils/logger';

import { SecurityInvariantError } from '@/errors/domainErrors';

import { createMetadataToken, getMetadataValue, setMetadataValue } from '@/utils/metadata';

// Security metadata descriptors to prevent tampering
type SecurityMetadata = Readonly<{
  role: string;
  timestamp: number;
  checksum: string;
}>;

type InjectionMetadata = Array<{ token: string; validated: boolean }>;

const securityLogger = getLogger('Security:SecureDecorators');
const monitorLogger = securityLogger.child('Monitor');
const serviceLogger = securityLogger.child('SecureUserService');

const SECURITY_METADATA = createMetadataToken<SecurityMetadata>('security-metadata');
const INJECTION_METADATA = createMetadataToken<InjectionMetadata>('injection-metadata');

// ✅ SECURE: Context-aware caching that respects security boundaries
export function SecureCache(ttl: number) {
  const cache = new Map<string, { value: unknown; expires: number; userContext: string }>();

  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const user = getCurrentUser();
      const userContext = user ? `${user.id}:${user.roles.join(',')}` : 'anonymous';
      const key = `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}:${userContext}`;

      const cached = cache.get(key);
      if (cached && cached.expires > Date.now() && cached.userContext === userContext) {
        return cached.value;
      }

      const result = originalMethod.apply(this, args);
      cache.set(key, { value: result, expires: Date.now() + ttl, userContext });
      return result;
    };
  };
}

// ✅ SECURE: Tamper-resistant role-based authorization
export function SecureRequireRole(role: string) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    // Create tamper-resistant metadata
    const metadata: SecurityMetadata = Object.freeze({
      role,
      timestamp: Date.now(),
      checksum: generateChecksum(role + propertyKey + target.constructor.name),
    });

    setMetadataValue(SECURITY_METADATA, metadata, target, propertyKey);

    descriptor.value = function (...args: unknown[]) {
      // Validate metadata integrity
      const storedMetadata = getMetadataValue(SECURITY_METADATA, target, propertyKey);
      if (
        !storedMetadata ||
        !validateMetadata(storedMetadata, role, propertyKey, target.constructor.name)
      ) {
        throw new SecurityError('Security metadata has been tampered with');
      }

      const user = getCurrentUser();
      if (!user || !user.roles.includes(role)) {
        SecurityMonitor.logUnauthorizedAccess(user, target.constructor.name, propertyKey);
        throw new UnauthorizedError(`Role '${role}' required`);
      }

      SecurityMonitor.logAuthorizedAccess(user, target.constructor.name, propertyKey);
      return originalMethod.apply(this, args);
    };

    // Seal descriptor to prevent tampering
    Object.seal(descriptor);
  };
}

// ✅ SECURE: Request-scoped authentication context
export class SecureAuthContext {
  private static contexts = new WeakMap<object, SecureAuthContext>();
  private user: unknown = null;
  private readonly createdAt: number;
  private readonly requestId: string;

  private constructor(requestId: string) {
    this.createdAt = Date.now();
    this.requestId = requestId;
  }

  static getContext(request: object): SecureAuthContext {
    if (!this.contexts.has(request)) {
      const requestId = generateRequestId();
      this.contexts.set(request, new SecureAuthContext(requestId));
    }
    return this.contexts.get(request)!;
  }

  setCurrentUser(user: unknown) {
    // Validate user object
    if (!user || typeof user.id === 'undefined') {
      throw new SecurityInvariantError('Invalid user object');
    }

    // Prevent context hijacking by checking age
    if (Date.now() - this.createdAt > 300000) {
      // 5 minutes
      throw new SecurityError('Context expired');
    }

    this.user = Object.freeze({ ...user }); // Immutable user object
    SecurityMonitor.logContextChange(this.requestId, user.id);
  }

  getCurrentUser() {
    return this.user;
  }

  getRequestId(): string {
    return this.requestId;
  }
}

// ✅ SECURE: Validated dependency injection container
export class SecureDIContainer {
  private static readonly registrations = new Map<string, ServiceRegistration>();
  private static readonly instances = new Map<string, WeakMap<object, unknown>>();
  private static readonly allowedTokens = new Set<string>();

  static registerAllowedToken(token: string) {
    this.allowedTokens.add(token);
  }

  static register<T>(token: string, factory: () => T, options: DIOptions = {}) {
    // Validate token is allowed
    if (!this.allowedTokens.has(token)) {
      throw new SecurityError(`Token '${token}' is not in allowed list`);
    }

    // Validate factory
    if (typeof factory !== 'function') {
      throw new DependencyInjectionError('Factory must be a function');
    }

    const registration: ServiceRegistration = {
      factory,
      scope: options.scope || 'scoped',
      validator: options.validator,
      createdAt: Date.now(),
    };

    this.registrations.set(token, registration);
  }

  static resolve<T>(token: string, context: object): T {
    const registration = this.registrations.get(token);
    if (!registration) {
      throw new SecurityError(`No registration found for token: ${token}`);
    }

    // For singleton scope, use a special singleton context
    const resolveContext = registration.scope === 'singleton' ? {} : context;

    if (!this.instances.has(token)) {
      this.instances.set(token, new WeakMap());
    }

    const scopedInstances = this.instances.get(token)!;

    if (!scopedInstances.has(resolveContext)) {
      const instance = registration.factory();

      // Validate instance if validator provided
      if (registration.validator && !registration.validator(instance)) {
        throw new SecurityError(`Instance validation failed for token: ${token}`);
      }

      scopedInstances.set(resolveContext, instance);
    }

    return scopedInstances.get(resolveContext);
  }
}

// ✅ SECURE: Validated injection decorator
export function SecureInject(token: string) {
  return function (
    target: unknown,
    _propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    // Validate token format
    if (!token || typeof token !== 'string' || token.length === 0) {
      throw new DependencyInjectionError('Invalid injection token');
    }

    const existingTokens = getMetadataValue(INJECTION_METADATA, target) ?? [];
    const tokens: InjectionMetadata = [...existingTokens];

    tokens[parameterIndex] = { token, validated: true };
    setMetadataValue(INJECTION_METADATA, tokens, target);
  };
}

// ✅ SECURE: Always-on authentication with proper error handling
export function SecureRequireAuth(options: AuthOptions = {}) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const user = getCurrentUser();

      // Always require authentication unless explicitly allowed
      if (!user && !options.allowAnonymous) {
        SecurityMonitor.logUnauthorizedAccess(null, target.constructor.name, propertyKey);
        throw new UnauthorizedError('Authentication required');
      }

      // Additional validation if user exists
      if (user) {
        if (!validateUserSession(user)) {
          throw new SecurityError('Invalid user session');
        }

        if (options.requireEmailVerified && !user.emailVerified) {
          throw new UnauthorizedError('Email verification required');
        }
      }

      return originalMethod.apply(this, args);
    };
  };
}

// ✅ SECURE: Race condition-free async authentication
export function SecureAsyncAuth() {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      // Always complete auth check BEFORE executing method
      await checkAuthAsync();

      // Double-check auth state hasn't changed
      const user = getCurrentUser();
      if (!user || !user.isAdmin) {
        throw new UnauthorizedError('Authorization check failed');
      }

      return originalMethod.apply(this, args);
    };
  };
}

// ✅ SECURE: Context-aware memoization
export function SecureMemoize() {
  const cache = new Map<string, { value: unknown; userContext: string; expires: number }>();

  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const user = getCurrentUser();
      const userContext = user ? `${user.id}:${user.roles.join(',')}` : 'anonymous';
      const key = `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;

      const cached = cache.get(key);
      if (cached && cached.userContext === userContext && cached.expires > Date.now()) {
        return cached.value;
      }

      const result = originalMethod.apply(this, args);
      cache.set(key, {
        value: result,
        userContext,
        expires: Date.now() + 300000, // 5 minutes
      });

      return result;
    };
  };
}

// Security monitoring and logging
export class SecurityMonitor {
  private static readonly accessLog = new Map<string, AccessRecord[]>();
  private static readonly suspiciousActivity = new Set<string>();

  static logAuthorizedAccess(user: unknown, className: string, method: string) {
    this.logAccess(user, className, method, 'authorized');
  }

  static logUnauthorizedAccess(user: unknown, className: string, method: string) {
    this.logAccess(user, className, method, 'unauthorized');
    this.detectSuspiciousActivity(user, className, method);
  }

  static logContextChange(requestId: string, userId: string) {
    monitorLogger.info('Context change detected', { requestId, userId });
  }

  private static logAccess(user: unknown, className: string, method: string, type: string) {
    const key = `${user?.id || 'anonymous'}:${className}:${method}`;
    const records = this.accessLog.get(key) || [];

    records.push({
      timestamp: Date.now(),
      type,
      userAgent: getCurrentUserAgent(),
      ip: getCurrentIP(),
    });

    // Keep only recent records
    const recentRecords = records.filter(r => Date.now() - r.timestamp < 3600000); // 1 hour
    this.accessLog.set(key, recentRecords);
  }

  private static detectSuspiciousActivity(user: unknown, className: string, method: string) {
    const key = `${user?.id || 'anonymous'}:${className}:${method}`;
    const records = this.accessLog.get(key) || [];
    const recentUnauthorized = records.filter(
      r => r.type === 'unauthorized' && Date.now() - r.timestamp < 300000 // 5 minutes
    );

    if (recentUnauthorized.length > 5) {
      this.suspiciousActivity.add(key);
      monitorLogger.warn('Suspicious activity detected', {
        key,
        recentUnauthorizedAttempts: recentUnauthorized.length,
      });
    }
  }
}

// Utility functions
function generateChecksum(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function validateMetadata(
  metadata: unknown,
  role: string,
  propertyKey: string,
  className: string
): boolean {
  if (!metadata || metadata.role !== role) return false;

  const expectedChecksum = generateChecksum(role + propertyKey + className);
  return metadata.checksum === expectedChecksum;
}

function generateRequestId(): string {
  return crypto.randomBytes(16).toString('hex');
}

function getCurrentUser(): unknown {
  // Implementation would get user from current request context
  return null; // Placeholder
}

function getCurrentUserAgent(): string {
  return 'test-agent'; // Placeholder
}

function getCurrentIP(): string {
  return '127.0.0.1'; // Placeholder
}

function validateUserSession(_user: unknown): boolean {
  // Validate session hasn't expired, user is still active, etc.
  return true; // Placeholder
}

async function checkAuthAsync(): Promise<void> {
  // Async authentication check
  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    throw new UnauthorizedError('Authentication failed');
  }
}

// Types and interfaces
interface ServiceRegistration {
  factory: () => unknown;
  scope: 'singleton' | 'scoped';
  validator?: (instance: unknown) => boolean;
  createdAt: number;
}

interface DIOptions {
  scope?: 'singleton' | 'scoped';
  validator?: (instance: unknown) => boolean;
}

interface AuthOptions {
  allowAnonymous?: boolean;
  requireEmailVerified?: boolean;
}

interface AccessRecord {
  timestamp: number;
  type: string;
  userAgent: string;
  ip: string;
}

// Custom error classes
export class DependencyInjectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DependencyInjectionError';
  }
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// Example secure service using these decorators
export class SecureUserService {
  @SecureCache(5000)
  @SecureRequireRole('admin')
  async deleteUser(userId: string) {
    serviceLogger.info('Deleting user securely', { userId });
    return { success: true, userId };
  }

  @SecureMemoize()
  @SecureRequireRole('admin')
  async getUserSecrets(userId: string) {
    serviceLogger.info('Retrieving secrets securely', { userId });
    return { secrets: ['secret1', 'secret2'] };
  }

  @SecureRequireAuth({ requireEmailVerified: true })
  async sensitiveOperation() {
    serviceLogger.info('Performing sensitive operation securely');
    return { result: 'sensitive data' };
  }

  @SecureAsyncAuth()
  async asyncProtectedMethod() {
    serviceLogger.info('Executing async protected method securely');
    return { data: 'protected data' };
  }
}
