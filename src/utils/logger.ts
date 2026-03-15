import { sanitizeLogRecord } from '@/utils/sanitizer';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Record<string, unknown>;

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  context?: LogContext;
}

type LogTransport = (record: LogRecord) => void;

const isConsoleAvailable = typeof console !== 'undefined' && console !== undefined;

const bindConsoleMethod = (method: keyof Console): ((...args: unknown[]) => void) => {
  if (!isConsoleAvailable) {
    return () => {
      /* noop */
    };
  }

  const consoleMethod = console[method];

  if (typeof consoleMethod === 'function') {
    const callable = consoleMethod as (...args: unknown[]) => void;
    return (...args: unknown[]) => {
      callable.apply(console, args as unknown[]);
    };
  }

  const fallback = console.log as (...args: unknown[]) => void;
  return (...args: unknown[]) => {
    fallback.apply(console, args as unknown[]);
  };
};

const consoleMethods: Record<LogLevel, (...args: unknown[]) => void> = {
  debug: bindConsoleMethod('debug'),
  info: bindConsoleMethod('info'),
  warn: bindConsoleMethod('warn'),
  error: bindConsoleMethod('error'),
};

const defaultTransport: LogTransport = ({ timestamp, level, scope, message, context }) => {
  const method = consoleMethods[level];
  const formattedScope = scope.length > 0 ? `[${scope}]` : '';
  const prefix = `[${timestamp}]${formattedScope ? ` ${formattedScope}` : ''} ${level.toUpperCase()}`;

  if (context && Object.keys(context).length > 0) {
    method(`${prefix}: ${message}`, context);
    return;
  }

  method(`${prefix}: ${message}`);
};

const cloneContext = (context?: LogContext): LogContext | undefined => {
  if (!context) {
    return undefined;
  }

  return { ...context };
};

const mergeContexts = (base?: LogContext, patch?: LogContext): LogContext | undefined => {
  if (!base && !patch) {
    return undefined;
  }

  if (!base) {
    return cloneContext(patch);
  }

  if (!patch) {
    return cloneContext(base);
  }

  return { ...base, ...patch };
};

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(scope: string, defaultContext?: LogContext): Logger;
}

class StructuredLogger implements Logger {
  private readonly scopePath: readonly string[];

  private readonly transport: LogTransport;

  private readonly defaultContext?: LogContext;

  constructor(scopePath: readonly string[], transport: LogTransport, defaultContext?: LogContext) {
    this.scopePath = scopePath;
    this.transport = transport;
    this.defaultContext = cloneContext(defaultContext);
  }

  child(scope: string, defaultContext?: LogContext): Logger {
    const childScope = [...this.scopePath, scope];
    const context = mergeContexts(this.defaultContext, defaultContext);

    return new StructuredLogger(childScope, this.transport, context);
  }

  debug(message: string, context?: LogContext): void {
    this.emit('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.emit('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.emit('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.emit('error', message, context);
  }

  private emit(level: LogLevel, message: string, context?: LogContext) {
    const mergedContext = mergeContexts(this.defaultContext, context);

    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      scope: this.scopePath.join(':'),
      message,
      context: mergedContext,
    };

    const sanitizedRecord = sanitizeLogRecord(record);

    this.transport(sanitizedRecord);
  }
}

export interface LoggerOptions {
  scope: string;
  defaultContext?: LogContext;
  transport?: LogTransport;
}

export const createLogger = ({ scope, defaultContext, transport }: LoggerOptions): Logger =>
  new StructuredLogger([scope], transport ?? defaultTransport, defaultContext);

export const appLogger = createLogger({ scope: 'WeatherApp' });

export const getLogger = (scope: string, defaultContext?: LogContext): Logger =>
  appLogger.child(scope, defaultContext);

export type { LogTransport };
