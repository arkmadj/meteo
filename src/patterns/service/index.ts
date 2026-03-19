/**
 * Service Pattern Exports
 *
 * Exports all components of the Service pattern implementation
 * for dependency injection and service management.
 */

// ============================================================================
// CORE TYPES AND INTERFACES
// ============================================================================

export type {
  Constructor,
  IInjectableMetadata,
  IInjectMetadata,
  IResolutionContext,
  IServiceContainer,
  IServiceContainerOptions,
  IServiceRegistration,
  IServiceRegistrationOptions,
  ServiceContainerEvent,
  ServiceContainerEventListener,
  ServiceFactory,
  ServiceLifetime,
  ServiceToken,
} from './ServiceTypes';

// ============================================================================
// SERVICE CONTAINER
// ============================================================================

export { createServiceContainer, ServiceContainer } from './ServiceContainer';

// ============================================================================
// DECORATORS
// ============================================================================

export {
  getInjectableMetadata,
  getInjectMetadata,
  Inject,
  Injectable,
  registerInjectable,
  Scoped,
  Singleton,
  Transient,
} from './ServiceDecorators';

// ============================================================================
// EXAMPLE INTERFACES AND IMPLEMENTATIONS
// ============================================================================

export type { IConfig, ILogger, IUser, IUserRepository, IUserService } from './examples';

export {
  AppConfig,
  ConfigToken,
  ConsoleLogger,
  InMemoryUserRepository,
  LoggerToken,
  UserRepositoryToken,
  UserService,
  UserServiceToken,
} from './examples';

// ============================================================================
// EXAMPLES
// ============================================================================

export {
  example1_BasicServiceContainer,
  example2_DecoratorBasedDI,
  example3_ScopedContainers,
  example4_ServiceValidation,
  example5_ContainerEvents,
  runAllExamples,
} from './examples';
