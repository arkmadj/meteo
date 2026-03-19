/**
 * Service Pattern Decorators
 *
 * Provides decorators for dependency injection:
 * - @Injectable: Mark a class as injectable
 * - @Singleton: Mark a service as singleton
 * - @Inject: Inject a dependency by token
 */

import { DependencyInjectionError } from '@/errors/domainErrors';
import { getLogger } from '@/utils/logger';
import { createMetadataToken, getMetadataValue, setMetadataValue } from '@/utils/metadata';

import type {
  Constructor,
  IInjectableMetadata,
  IInjectMetadata,
  IServiceContainer,
  ServiceLifetime,
  ServiceToken,
} from './ServiceTypes';

const logger = getLogger('Patterns:ServiceDecorators');

// Metadata tokens for decorator data
const INJECTABLE_METADATA = createMetadataToken<IInjectableMetadata>('service:injectable');
const INJECT_METADATA = createMetadataToken<IInjectMetadata[]>('service:inject');

/**
 * Get injectable metadata for a class
 */
export const getInjectableMetadata = (target: Constructor): IInjectableMetadata | undefined => {
  return getMetadataValue(INJECTABLE_METADATA, target);
};

/**
 * Get injection metadata for constructor parameters
 */
export const getInjectMetadata = (target: Constructor): IInjectMetadata[] => {
  return getMetadataValue(INJECT_METADATA, target) ?? [];
};

/**
 * @Injectable decorator
 *
 * Marks a class as injectable and specifies its lifetime.
 *
 * @example
 * ```typescript
 * @Injectable({ lifetime: 'singleton' })
 * class UserService {
 *   constructor(@Inject(LoggerToken) private logger: ILogger) {}
 * }
 * ```
 */
export function Injectable(options: { lifetime?: ServiceLifetime; token?: ServiceToken } = {}) {
  return function <T extends Constructor>(target: T): T {
    const metadata: IInjectableMetadata = {
      token: options.token ?? target,
      lifetime: options.lifetime ?? 'transient',
      dependencies: [],
    };

    // Collect dependencies from @Inject decorators
    const injectMetadata = getMetadataValue(INJECT_METADATA, target) ?? [];
    metadata.dependencies = injectMetadata.map(meta => meta.token);

    setMetadataValue(INJECTABLE_METADATA, metadata, target);

    logger.debug('Class marked as injectable', {
      className: target.name,
      lifetime: metadata.lifetime,
      dependencies: metadata.dependencies.length,
    });

    return target;
  };
}

/**
 * @Singleton decorator
 *
 * Convenience decorator for singleton services.
 *
 * @example
 * ```typescript
 * @Singleton()
 * class ConfigService {
 *   readonly apiUrl = 'https://api.example.com';
 * }
 * ```
 */
export function Singleton(options: { token?: ServiceToken } = {}) {
  return Injectable({ ...options, lifetime: 'singleton' });
}

/**
 * @Scoped decorator
 *
 * Convenience decorator for scoped services.
 */
export function Scoped(options: { token?: ServiceToken } = {}) {
  return Injectable({ ...options, lifetime: 'scoped' });
}

/**
 * @Transient decorator
 *
 * Convenience decorator for transient services.
 */
export function Transient(options: { token?: ServiceToken } = {}) {
  return Injectable({ ...options, lifetime: 'transient' });
}

/**
 * @Inject decorator
 *
 * Marks a constructor parameter for injection.
 *
 * @example
 * ```typescript
 * class UserService {
 *   constructor(
 *     @Inject(LoggerToken) private logger: ILogger,
 *     @Inject(ConfigToken) private config: IConfig
 *   ) {}
 * }
 * ```
 */
export function Inject(token: ServiceToken) {
  return function (
    target: object,
    _propertyKey: string | symbol | undefined,
    parameterIndex: number
  ): void {
    if (!token) {
      throw new DependencyInjectionError('Inject decorator requires a valid token');
    }

    const constructor = target as Constructor;
    const existingMetadata = getMetadataValue(INJECT_METADATA, constructor) ?? [];
    const newMetadata: IInjectMetadata[] = [...existingMetadata];

    newMetadata[parameterIndex] = {
      parameterIndex,
      token,
    };

    setMetadataValue(INJECT_METADATA, newMetadata, constructor);

    logger.debug('Parameter marked for injection', {
      className: constructor.name,
      parameterIndex,
      token: typeof token === 'symbol' ? token.description : String(token),
    });
  };
}

/**
 * Auto-register an injectable class with a container
 */
export const registerInjectable = <T>(
  container: IServiceContainer,
  target: Constructor<T>
): void => {
  const metadata = getInjectableMetadata(target);

  if (!metadata) {
    throw new DependencyInjectionError(`Class ${target.name} is not decorated with @Injectable`);
  }

  container.register(metadata.token ?? target, {
    lifetime: metadata.lifetime,
    dependencies: metadata.dependencies,
  });
};
