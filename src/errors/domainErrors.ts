export interface DomainErrorOptions {
  code?: string;
  cause?: unknown;
  details?: Record<string, unknown>;
}

export class DomainError extends Error {
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, { code, cause, details }: DomainErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.details = details;

    if (cause !== undefined) {
      // @ts-expect-error expose cause for modern runtimes; harmless in legacy envs
      this.cause = cause;
    }

    // Ensure proper prototype chain when targeting ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ContextUnavailableError extends DomainError {}

export class ThemeContextError extends ContextUnavailableError {}

export class ErrorContextUnavailableError extends ContextUnavailableError {}

export class PerformanceContextError extends ContextUnavailableError {}

export class OnlineStatusContextUnavailableError extends ContextUnavailableError {}

export class SnackbarContextUnavailableError extends ContextUnavailableError {}

export class NotificationContextUnavailableError extends ContextUnavailableError {}

export class WeatherServiceError extends DomainError {}

export class GeocodingError extends WeatherServiceError {}

export class CityNotFoundError extends WeatherServiceError {}

export class WeatherDataFetchError extends WeatherServiceError {}

// Weather Alert Errors
export class WeatherAlertError extends DomainError {}

export class AlertConditionEvaluationError extends WeatherAlertError {}

export class AlertNotFoundError extends WeatherAlertError {}

export class AlertConditionNotFoundError extends WeatherAlertError {}

export class AlertServiceNotInitializedError extends WeatherAlertError {}

export class AlertThresholdConfigurationError extends WeatherAlertError {}

export class AlertNotificationDeliveryError extends WeatherAlertError {}

export class PrototypePollutionError extends DomainError {}

export class UnsafeObjectOperationError extends DomainError {}

export class MetadataUnavailableError extends DomainError {}

export class NotImplementedError extends DomainError {}

export class DependencyInjectionError extends DomainError {}

export class SecurityInvariantError extends DomainError {}

export class UnauthorizedAccessError extends SecurityInvariantError {}

export class ApplicationBootstrapError extends DomainError {}
