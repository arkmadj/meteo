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
  IInjectMetadata,
  IInjectableMetadata,
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

export { ServiceContainer, createServiceContainer } from './ServiceContainer';

// ============================================================================
// DECORATORS
// ============================================================================

export {
  Inject,
  Injectable,
  Scoped,
  Singleton,
  Transient,
  getInjectMetadata,
  getInjectableMetadata,
  registerInjectable,
} from './ServiceDecorators';

// ============================================================================
// EXAMPLE INTERFACES AND IMPLEMENTATIONS
// ============================================================================

// Examples file not yet created
// export type { IConfig, ILogger, IUser, IUserRepository, IUserService } from './examples';

// export {
//   AppConfig,
//   ConfigToken,
//   ConsoleLogger,
//   InMemoryUserRepository,
//   LoggerToken,
//   UserRepositoryToken,
//   UserService,
//   UserServiceToken,
// } from './examples';

// ============================================================================
// EXAMPLES
// ============================================================================

// export {
//   example1_BasicServiceContainer,
//   example2_DecoratorBasedDI,
//   example3_ScopedContainers,
//   example4_ServiceValidation,
//   example5_ContainerEvents,
//   runAllExamples,
// } from './examples';
