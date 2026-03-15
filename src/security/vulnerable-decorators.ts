/**
 * VULNERABLE DECORATOR EXAMPLES
 *
 * ⚠️  WARNING: These are examples of INSECURE implementations
 * DO NOT use these patterns in production code
 */
import { UnauthorizedAccessError } from '@/errors/domainErrors';
import { getLogger } from '@/utils/logger';
import { getMetadata, setMetadata } from '@/utils/metadataPolyfill';
const vulnerableLogger = getLogger('Security:VulnerableDecorators');
const logger = vulnerableLogger;

// ❌ VULNERABLE: Decorator order dependency
export function VulnerableCache(ttl: number) {
  const cache = new Map<string, { value: any; expires: number }>();

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const key = `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;
      const cached = cache.get(key);

      if (cached && cached.expires > Date.now()) {
        vulnerableLogger.warn('Returning cached result without auth check', {
          cacheKey: key,
          risk: 'auth-bypass',
        });
        return cached.value;
      }

      const result = originalMethod.apply(this, args);
      cache.set(key, { value: result, expires: Date.now() + ttl });
      return result;
    };
  };
}

// ❌ VULNERABLE: Metadata-based auth that can be tampered
export function VulnerableRequireRole(role: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Store role in easily accessible metadata
    setMetadata('required-role', role, target, propertyKey);

    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const requiredRole = getMetadata<string>('required-role', target, propertyKey);
      const currentUser = getCurrentUser();
      if (!requiredRole) {
        throw new UnauthorizedAccessError('Authorization metadata missing');
      }

      if (!currentUser || !currentUser.roles.includes(requiredRole)) {
        throw new UnauthorizedAccessError('Unauthorized');
      }

      return originalMethod.apply(this, args);
    };
  };
}

// ❌ VULNERABLE: Singleton DI with shared mutable state
export class VulnerableAuthContext {
  private static instance: VulnerableAuthContext;
  private currentUser: any = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new VulnerableAuthContext();
    }
    return this.instance;
  }

  setCurrentUser(user: any) {
    vulnerableLogger.warn('Setting user in shared singleton', { hasUser: Boolean(user) });
    this.currentUser = user; // Shared across all requests!
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

// ❌ VULNERABLE: DI container that can be poisoned
export class VulnerableDIContainer {
  private static services = new Map<string, any>();

  static register(token: string, service: any) {
    vulnerableLogger.warn('Allowing unrestricted service registration', { token });
    this.services.set(token, service);
  }

  static get<T>(token: string): T {
    return this.services.get(token);
  }
}

export function VulnerableInject(token: string) {
  return function (target: any, _propertyKey: string | symbol | undefined, parameterIndex: number) {
    const existingTokens = getMetadata<Array<string | undefined>>('inject-tokens', target) ?? [];

    existingTokens[parameterIndex] = token;
    setMetadata('inject-tokens', existingTokens, target);
  };
}

// ❌ VULNERABLE: Conditional auth that can be bypassed
export function VulnerableConditionalAuth(condition: () => boolean) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      if (condition()) {
        logger.info('🔓 SECURITY ISSUE: Auth check depends on external condition');
        const user = getCurrentUser();
        if (!user || !user.isAdmin) {
          throw new UnauthorizedAccessError('Unauthorized');
        }
      } else {
        logger.info('🔓 SECURITY ISSUE: Skipping auth check due to condition');
      }

      return originalMethod.apply(this, args);
    };
  };
}

// ❌ VULNERABLE: Race condition in async auth
export function VulnerableAsyncAuth() {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      logger.info('🔓 SECURITY ISSUE: Race condition between auth and execution');

      // Race condition: both promises start simultaneously
      const authPromise = checkAuthAsync();
      const resultPromise = originalMethod.apply(this, args);

      // Auth might complete after method execution
      await authPromise;
      return resultPromise;
    };
  };
}

// ❌ VULNERABLE: Prototype pollution via decorator
export function VulnerableAddMethod(methodName: string, implementation: Function) {
  return function (constructor: Function) {
    logger.info('🔓 SECURITY ISSUE: Modifying prototype unsafely');
    (constructor.prototype as Record<string, unknown>)[methodName] = implementation;
  };
}

// ❌ VULNERABLE: Memoization without considering security context
const memoCache = new Map<string, any>();

export function VulnerableMemoize() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const key = `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;

      if (memoCache.has(key)) {
        logger.info(
          '🔓 SECURITY ISSUE: Returning memoized result without considering user context'
        );
        return memoCache.get(key);
      }

      const result = originalMethod.apply(this, args);
      memoCache.set(key, result);
      return result;
    };
  };
}

// Mock functions for examples
function getCurrentUser(): any {
  return VulnerableAuthContext.getInstance().getCurrentUser();
}

async function checkAuthAsync(): Promise<void> {
  // Simulate async auth check
  await new Promise(resolve => setTimeout(resolve, 100));
  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    throw new UnauthorizedAccessError('Unauthorized');
  }
}

// Example vulnerable service using these decorators
export class VulnerableUserService {
  @VulnerableCache(5000) // Cache executes first
  @VulnerableRequireRole('admin') // Auth check executes second
  async deleteUser(userId: string) {
    logger.info(`Deleting user ${userId}`);
    return { success: true, userId };
  }

  @VulnerableMemoize()
  @VulnerableRequireRole('admin')
  async getUserSecrets(userId: string) {
    logger.info(`Getting secrets for user ${userId}`);
    return { secrets: ['secret1', 'secret2'] };
  }

  @VulnerableConditionalAuth(() => process.env.NODE_ENV === 'production')
  async dangerousOperation() {
    logger.info('Performing dangerous operation');
    return { result: 'dangerous data' };
  }

  @VulnerableAsyncAuth()
  async asyncProtectedMethod() {
    logger.info('Executing protected method');
    return { data: 'protected data' };
  }
}

// Example of how these vulnerabilities can be exploited
export class SecurityExploitExamples {
  static demonstrateMetadataTampering() {
    logger.info('\n🔴 DEMONSTRATING: Metadata tampering attack');

    const service = new VulnerableUserService();

    // Attacker modifies metadata at runtime
    setMetadata('required-role', 'user', service, 'deleteUser');

    logger.info('Metadata tampered - deleteUser now requires "user" role instead of "admin"');
  }

  static demonstrateContainerPoisoning() {
    logger.info('\n🔴 DEMONSTRATING: DI container poisoning');

    // Attacker registers malicious service
    class MaliciousAuthService {
      isAuthorized() {
        logger.info('Malicious auth service always returns true');
        return true;
      }
    }

    VulnerableDIContainer.register('AuthService', new MaliciousAuthService());
    logger.info('DI container poisoned with malicious auth service');
  }

  static demonstrateSharedStateAttack() {
    logger.info('\n🔴 DEMONSTRATING: Shared state attack');

    const authContext = VulnerableAuthContext.getInstance();

    // Admin user sets context
    authContext.setCurrentUser({ id: 1, roles: ['admin'], isAdmin: true });
    logger.info('Admin user context set');

    // Regular user gets admin context due to shared singleton
    const currentUser = authContext.getCurrentUser();
    logger.info('Regular user gets admin context', { currentUser });
  }

  static async demonstrateCacheBypass() {
    logger.info('\n🔴 DEMONSTRATING: Cache-based auth bypass');

    const service = new VulnerableUserService();
    const authContext = VulnerableAuthContext.getInstance();

    // Admin user calls method - result gets cached
    authContext.setCurrentUser({ id: 1, roles: ['admin'], isAdmin: true });
    await service.deleteUser('123');
    logger.info('Admin called deleteUser - result cached');

    // Regular user calls same method - gets cached result without auth check
    authContext.setCurrentUser({ id: 2, roles: ['user'], isAdmin: false });
    try {
      const result = await service.deleteUser('123');
      logger.info('Regular user got cached admin result', { result });
    } catch (_error) {
      logger.info('Auth check prevented access');
    }
  }

  static async demonstrateRaceCondition() {
    logger.info('\n🔴 DEMONSTRATING: Race condition attack');

    const service = new VulnerableUserService();
    const authContext = VulnerableAuthContext.getInstance();

    // Set unauthorized user
    authContext.setCurrentUser({ id: 2, roles: ['user'], isAdmin: false });

    try {
      // Method might execute before auth check completes
      const result = await service.asyncProtectedMethod();
      logger.info('Method executed despite unauthorized user', { result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.info('Auth check prevented access', { message });
    }
  }
}

// Example of prototype pollution
@VulnerableAddMethod('isAdmin', () => true)
export class ExampleClass {}

// This would make ALL objects have isAdmin() method returning true
// console.log(({} as any).isAdmin()); // true - DANGEROUS!
