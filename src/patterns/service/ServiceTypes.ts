/**
 * Service Pattern Types
 *
 * Core interfaces and types for the Service pattern with dependency injection.
 * Provides type-safe service registration, resolution, and lifecycle management.
 */

/**
 * Service lifecycle scopes
 * - 'singleton': Single instance shared across the entire application
 * - 'transient': New instance created on each resolution
 * - 'scoped': Single instance within a defined scope (e.g., request)
 */
export type ServiceLifetime = 'singleton' | 'transient' | 'scoped';

/**
 * Token used to identify services in the container
 */
export type ServiceToken<T = unknown> = symbol | string | (new (...args: never[]) => T);

/**
 * Factory function for creating service instances
 */
export type ServiceFactory<T> = (container: IServiceContainer) => T;

/**
 * Options for service registration
 */
export interface IServiceRegistrationOptions<T> {
  /** Factory function to create the service instance */
  factory?: ServiceFactory<T>;
  /** Service lifetime/scope */
  lifetime?: ServiceLifetime;
  /** Service instance for singleton pre-registration */
  instance?: T;
  /** Dependencies required by this service (for auto-resolution) */
  dependencies?: ServiceToken[];
  /** Optional validator to verify service instance */
  validator?: (instance: T) => boolean;
}

/**
 * Internal service registration record
 */
export interface IServiceRegistration<T = unknown> {
  token: ServiceToken<T>;
  factory: ServiceFactory<T>;
  lifetime: ServiceLifetime;
  validator?: (instance: T) => boolean;
  registeredAt: number;
}

/**
 * Service container interface
 */
export interface IServiceContainer {
  /**
   * Register a service with the container
   */
  register<T>(token: ServiceToken<T>, options: IServiceRegistrationOptions<T>): this;

  /**
   * Resolve a service from the container
   */
  resolve<T>(token: ServiceToken<T>): T;

  /**
   * Try to resolve a service, returning undefined if not found
   */
  tryResolve<T>(token: ServiceToken<T>): T | undefined;

  /**
   * Check if a service is registered
   */
  has(token: ServiceToken): boolean;

  /**
   * Create a scoped child container
   */
  createScope(): IServiceContainer;

  /**
   * Dispose of the container and its resources
   */
  dispose(): void;
}

/**
 * Constructor type for injectable classes
 */
export type Constructor<T = unknown> = new (...args: never[]) => T;

/**
 * Metadata for injectable services
 */
export interface IInjectableMetadata {
  token?: ServiceToken;
  lifetime: ServiceLifetime;
  dependencies: ServiceToken[];
}

/**
 * Metadata for injected parameters
 */
export interface IInjectMetadata {
  parameterIndex: number;
  token: ServiceToken;
}

/**
 * Service resolution context for scoped services
 */
export interface IResolutionContext {
  /** Parent scope if this is a child scope */
  parent?: IResolutionContext;
  /** Scoped instances */
  instances: Map<ServiceToken, unknown>;
  /** Unique scope identifier */
  scopeId: string;
}

/**
 * Service container events
 */
export type ServiceContainerEvent =
  | { type: 'registered'; token: ServiceToken; lifetime: ServiceLifetime }
  | { type: 'resolved'; token: ServiceToken; fromCache: boolean }
  | { type: 'disposed' };

/**
 * Event listener for container events
 */
export type ServiceContainerEventListener = (event: ServiceContainerEvent) => void;

/**
 * Options for creating a service container
 */
export interface IServiceContainerOptions {
  /** Parent container for hierarchical DI */
  parent?: IServiceContainer;
  /** Enable strict mode (throw on missing dependencies) */
  strict?: boolean;
  /** Event listener for container events */
  onEvent?: ServiceContainerEventListener;
}

