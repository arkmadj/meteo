/**
 * HTTP Request Builder Pattern
 *
 * Implements the Builder pattern for creating complex HTTP request objects
 * with a fluent, chainable API for configuring all aspects of an HTTP request.
 *
 * @example
 * ```typescript
 * const request = new HttpRequestBuilder()
 *   .setUrl('/api/weather')
 *   .setMethod('POST')
 *   .addHeader('Authorization', 'Bearer token')
 *   .setBody({ location: 'Lagos' })
 *   .setTimeout(5000)
 *   .setRetries(3)
 *   .build();
 * ```
 */

/**
 * HTTP methods supported by the builder
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Request priority levels
 */
export type RequestPriority = 'low' | 'normal' | 'high' | 'critical';

/**
 * Cache strategies
 */
export type CacheStrategy = 'no-cache' | 'force-cache' | 'cache-first' | 'network-first';

/**
 * Authentication types
 */
export type AuthType = 'bearer' | 'basic' | 'api-key' | 'custom';

/**
 * Complete HTTP request configuration
 */
export interface IHttpRequest {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  queryParams: Record<string, string | number | boolean>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  priority?: RequestPriority;
  cache?: CacheStrategy;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
  metadata?: Record<string, unknown>;
}

/**
 * Authentication configuration
 */
interface IAuthConfig {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  headerName?: string;
}

/**
 * HTTP Request Builder
 *
 * Provides a fluent interface for constructing complex HTTP requests
 * with validation and sensible defaults.
 */
export class HttpRequestBuilder {
  private url: string = '';
  private method: HttpMethod = 'GET';
  private headers: Record<string, string> = {};
  private queryParams: Record<string, string | number | boolean> = {};
  private body?: unknown;
  private timeout?: number;
  private retries?: number;
  private retryDelay?: number;
  private priority?: RequestPriority;
  private cache?: CacheStrategy;
  private credentials?: RequestCredentials;
  private signal?: AbortSignal;
  private metadata: Record<string, unknown> = {};

  /**
   * Set the request URL
   */
  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  /**
   * Set the HTTP method
   */
  setMethod(method: HttpMethod): this {
    this.method = method;
    return this;
  }

  /**
   * Add a single header
   */
  addHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  /**
   * Set multiple headers at once
   */
  setHeaders(headers: Record<string, string>): this {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  /**
   * Add a query parameter
   */
  addQueryParam(key: string, value: string | number | boolean): this {
    this.queryParams[key] = value;
    return this;
  }

  /**
   * Set multiple query parameters at once
   */
  setQueryParams(params: Record<string, string | number | boolean>): this {
    this.queryParams = { ...this.queryParams, ...params };
    return this;
  }

  /**
   * Set the request body
   */
  setBody(body: unknown): this {
    this.body = body;
    return this;
  }

  /**
   * Set JSON body and automatically add Content-Type header
   */
  setJsonBody(data: unknown): this {
    this.body = data;
    this.addHeader('Content-Type', 'application/json');
    return this;
  }

  /**
   * Set form data body
   */
  setFormData(data: Record<string, string | Blob>): this {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    this.body = formData;
    return this;
  }

  /**
   * Set URL-encoded form body
   */
  setUrlEncodedBody(data: Record<string, string>): this {
    const params = new URLSearchParams(data);
    this.body = params.toString();
    this.addHeader('Content-Type', 'application/x-www-form-urlencoded');
    return this;
  }

  /**
   * Set request timeout in milliseconds
   */
  setTimeout(timeout: number): this {
    if (timeout < 0) {
      throw new Error('Timeout must be a positive number');
    }
    this.timeout = timeout;
    return this;
  }

  /**
   * Set number of retry attempts
   */
  setRetries(retries: number): this {
    if (retries < 0) {
      throw new Error('Retries must be a non-negative number');
    }
    this.retries = retries;
    return this;
  }

  /**
   * Set delay between retries in milliseconds
   */
  setRetryDelay(delay: number): this {
    if (delay < 0) {
      throw new Error('Retry delay must be a positive number');
    }
    this.retryDelay = delay;
    return this;
  }

  /**
   * Set request priority
   */
  setPriority(priority: RequestPriority): this {
    this.priority = priority;
    return this;
  }

  /**
   * Set cache strategy
   */
  setCacheStrategy(strategy: CacheStrategy): this {
    this.cache = strategy;
    return this;
  }

  /**
   * Set credentials mode
   */
  setCredentials(credentials: RequestCredentials): this {
    this.credentials = credentials;
    return this;
  }

  /**
   * Set abort signal for cancellation
   */
  setAbortSignal(signal: AbortSignal): this {
    this.signal = signal;
    return this;
  }

  /**
   * Add metadata (custom data not sent with request)
   */
  addMetadata(key: string, value: unknown): this {
    this.metadata[key] = value;
    return this;
  }

  /**
   * Set multiple metadata entries
   */
  setMetadata(metadata: Record<string, unknown>): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  /**
   * Configure authentication
   */
  setAuth(config: IAuthConfig): this {
    switch (config.type) {
      case 'bearer':
        if (!config.token) {
          throw new Error('Bearer token is required');
        }
        this.addHeader('Authorization', `Bearer ${config.token}`);
        break;

      case 'basic':
        if (!config.username || !config.password) {
          throw new Error('Username and password are required for basic auth');
        }
        const credentials = btoa(`${config.username}:${config.password}`);
        this.addHeader('Authorization', `Basic ${credentials}`);
        break;

      case 'api-key':
        if (!config.apiKey || !config.headerName) {
          throw new Error('API key and header name are required');
        }
        this.addHeader(config.headerName, config.apiKey);
        break;

      case 'custom':
        // Custom auth handled by caller via addHeader
        break;

      default:
        throw new Error(`Unknown auth type: ${config.type}`);
    }
    return this;
  }

  /**
   * Set bearer token authentication
   */
  setBearerToken(token: string): this {
    return this.setAuth({ type: 'bearer', token });
  }

  /**
   * Set basic authentication
   */
  setBasicAuth(username: string, password: string): this {
    return this.setAuth({ type: 'basic', username, password });
  }

  /**
   * Set API key authentication
   */
  setApiKey(apiKey: string, headerName: string = 'X-API-Key'): this {
    return this.setAuth({ type: 'api-key', apiKey, headerName });
  }

  /**
   * Convenience method for GET requests
   */
  get(url: string): this {
    return this.setUrl(url).setMethod('GET');
  }

  /**
   * Convenience method for POST requests
   */
  post(url: string, body?: unknown): this {
    this.setUrl(url).setMethod('POST');
    if (body !== undefined) {
      this.setJsonBody(body);
    }
    return this;
  }

  /**
   * Convenience method for PUT requests
   */
  put(url: string, body?: unknown): this {
    this.setUrl(url).setMethod('PUT');
    if (body !== undefined) {
      this.setJsonBody(body);
    }
    return this;
  }

  /**
   * Convenience method for PATCH requests
   */
  patch(url: string, body?: unknown): this {
    this.setUrl(url).setMethod('PATCH');
    if (body !== undefined) {
      this.setJsonBody(body);
    }
    return this;
  }

  /**
   * Convenience method for DELETE requests
   */
  delete(url: string): this {
    return this.setUrl(url).setMethod('DELETE');
  }

  /**
   * Add common headers for JSON API requests
   */
  asJson(): this {
    return this.addHeader('Content-Type', 'application/json').addHeader(
      'Accept',
      'application/json'
    );
  }

  /**
   * Add CORS headers
   */
  withCors(): this {
    return this.setCredentials('include');
  }

  /**
   * Disable caching
   */
  noCache(): this {
    return this.setCacheStrategy('no-cache')
      .addHeader('Cache-Control', 'no-cache')
      .addHeader('Pragma', 'no-cache');
  }

  /**
   * Validate the request configuration
   */
  private validate(): void {
    if (!this.url) {
      throw new Error('URL is required');
    }

    // Validate URL format
    try {
      new URL(this.url, window.location.origin);
    } catch {
      throw new Error(`Invalid URL: ${this.url}`);
    }

    // Validate body for methods that shouldn't have one
    if ((this.method === 'GET' || this.method === 'HEAD') && this.body !== undefined) {
      throw new Error(`${this.method} requests cannot have a body`);
    }

    // Validate timeout
    if (this.timeout !== undefined && this.timeout <= 0) {
      throw new Error('Timeout must be greater than 0');
    }

    // Validate retries
    if (this.retries !== undefined && this.retries < 0) {
      throw new Error('Retries must be non-negative');
    }
  }

  /**
   * Build the final request configuration
   */
  build(): IHttpRequest {
    this.validate();

    return {
      url: this.url,
      method: this.method,
      headers: { ...this.headers },
      queryParams: { ...this.queryParams },
      body: this.body,
      timeout: this.timeout,
      retries: this.retries,
      retryDelay: this.retryDelay,
      priority: this.priority,
      cache: this.cache,
      credentials: this.credentials,
      signal: this.signal,
      metadata: { ...this.metadata },
    };
  }

  /**
   * Clone the builder with current configuration
   */
  clone(): HttpRequestBuilder {
    const cloned = new HttpRequestBuilder();
    cloned.url = this.url;
    cloned.method = this.method;
    cloned.headers = { ...this.headers };
    cloned.queryParams = { ...this.queryParams };
    cloned.body = this.body;
    cloned.timeout = this.timeout;
    cloned.retries = this.retries;
    cloned.retryDelay = this.retryDelay;
    cloned.priority = this.priority;
    cloned.cache = this.cache;
    cloned.credentials = this.credentials;
    cloned.signal = this.signal;
    cloned.metadata = { ...this.metadata };
    return cloned;
  }

  /**
   * Reset the builder to initial state
   */
  reset(): this {
    this.url = '';
    this.method = 'GET';
    this.headers = {};
    this.queryParams = {};
    this.body = undefined;
    this.timeout = undefined;
    this.retries = undefined;
    this.retryDelay = undefined;
    this.priority = undefined;
    this.cache = undefined;
    this.credentials = undefined;
    this.signal = undefined;
    this.metadata = {};
    return this;
  }

  /**
   * Create a new builder from an existing request configuration
   */
  static from(request: Partial<IHttpRequest>): HttpRequestBuilder {
    const builder = new HttpRequestBuilder();

    if (request.url) builder.setUrl(request.url);
    if (request.method) builder.setMethod(request.method);
    if (request.headers) builder.setHeaders(request.headers);
    if (request.queryParams) builder.setQueryParams(request.queryParams);
    if (request.body !== undefined) builder.setBody(request.body);
    if (request.timeout !== undefined) builder.setTimeout(request.timeout);
    if (request.retries !== undefined) builder.setRetries(request.retries);
    if (request.retryDelay !== undefined) builder.setRetryDelay(request.retryDelay);
    if (request.priority) builder.setPriority(request.priority);
    if (request.cache) builder.setCacheStrategy(request.cache);
    if (request.credentials) builder.setCredentials(request.credentials);
    if (request.signal) builder.setAbortSignal(request.signal);
    if (request.metadata) builder.setMetadata(request.metadata);

    return builder;
  }
}
