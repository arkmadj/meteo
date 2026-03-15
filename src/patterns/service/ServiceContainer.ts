/**
 * Service Container Implementation
 *
 * A robust dependency injection container that supports:
 * - Service registration with multiple lifetimes (singleton, transient, scoped)
 * - Automatic dependency resolution
 * - Scoped child containers
 * - Type-safe service resolution
 */

import { DependencyInjectionError } from '@/errors/domainErrors';
import { getLogger } from '@/utils/logger';

import type {
  IResolutionContext,
  IServiceContainer,
  IServiceContainerOptions,
  IServiceRegistration,
  IServiceRegistrationOptions,
  ServiceContainerEventListener,
  ServiceFactory,
  ServiceLifetime,
  ServiceToken,
} from './ServiceTypes';

const logger = getLogger('Patterns:ServiceContainer');

/**
 * Generate a unique scope ID
 */
const generateScopeId = (): string => {
  return `scope_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Get a string representation of a service token for logging
 */
const getTokenName = (token: ServiceToken): string => {
  if (typeof token === 'symbol') {
    return token.description ?? 'Symbol';
  }
  if (typeof token === 'string') {
    return token;
  }
  return token.name;
};

/**
 * Service Container
 *
 * Manages service registration and resolution with support for
 * different lifetimes and scoped containers.
 */
export class ServiceContainer implements IServiceContainer {
  private readonly registrations = new Map<ServiceToken, IServiceRegistration>();
  private readonly singletonInstances = new Map<ServiceToken, unknown>();
  private readonly resolutionContext: IResolutionContext;
  private readonly parent?: IServiceContainer;
  private readonly strict: boolean;
  private readonly onEvent?: ServiceContainerEventListener;
  private isDisposed = false;

  constructor(options: IServiceContainerOptions = {}) {
    this.parent = options.parent;
    this.strict = options.strict ?? true;
    this.onEvent = options.onEvent;
    this.resolutionContext = {
      parent: undefined,
      instances: new Map(),
      scopeId: generateScopeId(),
    };

    logger.debug('Service container created', { scopeId: this.resolutionContext.scopeId });
  }

  /**
   * Register a service with the container
   */
  register<T>(token: ServiceToken<T>, options: IServiceRegistrationOptions<T>): this {
    this.ensureNotDisposed();

    const lifetime: ServiceLifetime = options.lifetime ?? 'transient';
    let factory: ServiceFactory<T>;

    if (options.instance !== undefined) {
      // Pre-instantiated singleton
      factory = () => options.instance as T;
      this.singletonInstances.set(token, options.instance);
    } else if (options.factory) {
      factory = options.factory;
    } else if (typeof token === 'function') {
      // Use the constructor as the factory
      factory = container => {
        const deps = options.dependencies ?? [];
        const resolvedDeps = deps.map(dep => container.resolve(dep));
        return new (token as new (...args: unknown[]) => T)(...resolvedDeps);
      };
    } else {
      throw new DependencyInjectionError(`No factory provided for service: ${getTokenName(token)}`);
    }

    const registration: IServiceRegistration<T> = {
      token,
      factory,
      lifetime,
      validator: options.validator,
      registeredAt: Date.now(),
    };

    this.registrations.set(token, registration as IServiceRegistration);

    logger.debug('Service registered', {
      token: getTokenName(token),
      lifetime,
    });

    this.onEvent?.({ type: 'registered', token, lifetime });

    return this;
  }

  /**
   * Resolve a service from the container
   */
  resolve<T>(token: ServiceToken<T>): T {
    this.ensureNotDisposed();

    const instance = this.tryResolve<T>(token);
    if (instance === undefined) {
      throw new DependencyInjectionError(`Service not registered: ${getTokenName(token)}`);
    }
    return instance;
  }

  /**
   * Try to resolve a service, returning undefined if not found
   */
  tryResolve<T>(token: ServiceToken<T>): T | undefined {
    this.ensureNotDisposed();

    // Check singleton cache first
    if (this.singletonInstances.has(token)) {
      const instance = this.singletonInstances.get(token) as T;
      this.onEvent?.({ type: 'resolved', token, fromCache: true });
      return instance;
    }

    // Check scoped cache
    if (this.resolutionContext.instances.has(token)) {
      const instance = this.resolutionContext.instances.get(token) as T;
      this.onEvent?.({ type: 'resolved', token, fromCache: true });
      return instance;
    }

    // Get registration
    const registration = this.getRegistration<T>(token);
    if (!registration) {
      // Try parent container
      if (this.parent) {
        return this.parent.tryResolve<T>(token);
      }
      return undefined;
    }

    // Create instance
    const instance = this.createInstance<T>(registration);
    this.onEvent?.({ type: 'resolved', token, fromCache: false });

    return instance;
  }

  /**
   * Check if a service is registered
   */
  has(token: ServiceToken): boolean {
    this.ensureNotDisposed();

    if (this.registrations.has(token)) {
      return true;
    }

    if (this.parent) {
      return this.parent.has(token);
    }

    return false;
  }

  /**
   * Create a scoped child container
   */
  createScope(): IServiceContainer {
    this.ensureNotDisposed();

    const scopedContainer = new ServiceContainer({
      parent: this,
      strict: this.strict,
      onEvent: this.onEvent,
    });

    // Copy registrations for scoped services
    for (const [token, registration] of this.registrations) {
      if (registration.lifetime === 'scoped') {
        scopedContainer.registrations.set(token, registration);
      }
    }

    logger.debug('Scoped container created', {
      parentScopeId: this.resolutionContext.scopeId,
    });

    return scopedContainer;
  }

  /**
   * Dispose of the container and its resources
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    // Dispose all instances that implement dispose
    for (const instance of this.singletonInstances.values()) {
      if (instance && typeof instance === 'object' && 'dispose' in instance) {
        try {
          (instance as { dispose: () => void }).dispose();
        } catch (error) {
          logger.warn('Error disposing service instance', { error });
        }
      }
    }

    for (const instance of this.resolutionContext.instances.values()) {
      if (instance && typeof instance === 'object' && 'dispose' in instance) {
        try {
          (instance as { dispose: () => void }).dispose();
        } catch (error) {
          logger.warn('Error disposing scoped instance', { error });
        }
      }
    }

    this.singletonInstances.clear();
    this.resolutionContext.instances.clear();
    this.registrations.clear();

    logger.debug('Service container disposed', {
      scopeId: this.resolutionContext.scopeId,
    });

    this.onEvent?.({ type: 'disposed' });
  }

  /**
   * Get registration for a token
   */
  private getRegistration<T>(token: ServiceToken<T>): IServiceRegistration<T> | undefined {
    return this.registrations.get(token) as IServiceRegistration<T> | undefined;
  }

  /**
   * Create an instance based on registration
   */
  private createInstance<T>(registration: IServiceRegistration<T>): T {
    const instance = registration.factory(this);

    // Validate instance if validator provided
    if (registration.validator && !registration.validator(instance)) {
      throw new DependencyInjectionError(
        `Service validation failed: ${getTokenName(registration.token)}`
      );
    }

    // Cache based on lifetime
    switch (registration.lifetime) {
      case 'singleton':
        this.singletonInstances.set(registration.token, instance);
        break;
      case 'scoped':
        this.resolutionContext.instances.set(registration.token, instance);
        break;
      case 'transient':
        // No caching for transient
        break;
    }

    logger.debug('Service instance created', {
      token: getTokenName(registration.token),
      lifetime: registration.lifetime,
    });

    return instance;
  }

  /**
   * Ensure container is not disposed
   */
  private ensureNotDisposed(): void {
    if (this.isDisposed) {
      throw new DependencyInjectionError('Service container has been disposed');
    }
  }
}

/**
 * Create a new service container
 */
export const createServiceContainer = (options?: IServiceContainerOptions): IServiceContainer => {
  return new ServiceContainer(options);
};
