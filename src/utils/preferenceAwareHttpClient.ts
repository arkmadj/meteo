/**
 * Preference-aware HTTP client that respects user preferences
 * for data usage, connection speed, and accessibility
 */

export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  priority?: 'low' | 'normal' | 'high';
  respectSaveData?: boolean;
  respectConnection?: boolean;
}

export interface PreferenceAwareRequestConfig extends RequestConfig {
  // Image optimization
  imageQuality?: 'low' | 'medium' | 'high' | 'auto';
  imageFormat?: 'webp' | 'jpeg' | 'png' | 'auto';
  
  // Data optimization
  compression?: boolean;
  minifyResponse?: boolean;
  
  // Connection optimization
  maxParallelRequests?: number;
  adaptiveTimeout?: boolean;
}

export interface UserConnectionInfo {
  saveData: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink: number;
  rtt: number;
}

/**
 * Get user connection information
 */
export const getUserConnectionInfo = (): UserConnectionInfo => {
  const defaultInfo: UserConnectionInfo = {
    saveData: false,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  };

  if (!('connection' in navigator)) {
    return defaultInfo;
  }

  const connection = (navigator as any).connection;
  if (!connection) {
    return defaultInfo;
  }

  return {
    saveData: connection.saveData || false,
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
  };
};

/**
 * Request queue manager for respecting parallel request limits
 */
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private activeRequests = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 6) {
    this.maxConcurrent = maxConcurrent;
  }

  setMaxConcurrent(max: number) {
    this.maxConcurrent = max;
    this.processQueue();
  }

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const requestFn = this.queue.shift();
    if (!requestFn) return;

    this.activeRequests++;
    
    try {
      await requestFn();
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }
}

/**
 * Preference-aware HTTP client
 */
export class PreferenceAwareHttpClient {
  private requestQueue: RequestQueue;
  private connectionInfo: UserConnectionInfo;

  constructor() {
    this.connectionInfo = getUserConnectionInfo();
    this.requestQueue = new RequestQueue(this.getOptimalMaxRequests());
    
    // Listen for connection changes
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', () => {
        this.connectionInfo = getUserConnectionInfo();
        this.requestQueue.setMaxConcurrent(this.getOptimalMaxRequests());
      });
    }
  }

  private getOptimalMaxRequests(): number {
    if (this.connectionInfo.saveData) return 2;
    
    switch (this.connectionInfo.effectiveType) {
      case 'slow-2g': return 1;
      case '2g': return 2;
      case '3g': return 4;
      case '4g': return 6;
      default: return 6;
    }
  }

  private getOptimalTimeout(baseTimeout: number = 10000): number {
    if (!this.connectionInfo.rtt) return baseTimeout;
    
    // Adjust timeout based on RTT
    const rttMultiplier = Math.max(1, this.connectionInfo.rtt / 100);
    return Math.min(baseTimeout * rttMultiplier, 30000);
  }

  private optimizeRequestConfig(config: PreferenceAwareRequestConfig): RequestConfig {
    const optimized: RequestConfig = { ...config };

    // Respect save-data preference
    if (this.connectionInfo.saveData && config.respectSaveData !== false) {
      // Add save-data header
      optimized.headers = {
        ...optimized.headers,
        'Save-Data': 'on',
      };

      // Reduce timeout for faster failure
      optimized.timeout = Math.min(optimized.timeout || 10000, 5000);
      
      // Reduce retries
      optimized.retries = Math.min(optimized.retries || 3, 1);
    }

    // Adapt to connection speed
    if (config.respectConnection !== false) {
      switch (this.connectionInfo.effectiveType) {
        case 'slow-2g':
        case '2g':
          optimized.timeout = Math.min(optimized.timeout || 10000, 8000);
          optimized.retries = Math.min(optimized.retries || 3, 1);
          break;
        case '3g':
          optimized.timeout = Math.min(optimized.timeout || 10000, 12000);
          optimized.retries = Math.min(optimized.retries || 3, 2);
          break;
      }
    }

    // Set adaptive timeout
    if (config.adaptiveTimeout !== false) {
      optimized.timeout = this.getOptimalTimeout(optimized.timeout);
    }

    return optimized;
  }

  private async makeRequest(config: RequestConfig): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = config.timeout 
      ? setTimeout(() => controller.abort(), config.timeout)
      : null;

    try {
      const response = await fetch(config.url, {
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      throw error;
    }
  }

  async request<T = any>(config: PreferenceAwareRequestConfig): Promise<T> {
    const optimizedConfig = this.optimizeRequestConfig(config);
    const maxRetries = optimizedConfig.retries || 3;

    return this.requestQueue.add(async () => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await this.makeRequest(optimizedConfig);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          lastError = error as Error;
          
          // Don't retry on certain errors
          if (error instanceof Error) {
            if (error.name === 'AbortError' || 
                error.message.includes('HTTP 4')) {
              break;
            }
          }

          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError || new Error('Request failed after all retries');
    });
  }

  async get<T = any>(url: string, config: Partial<PreferenceAwareRequestConfig> = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T = any>(url: string, body: any, config: Partial<PreferenceAwareRequestConfig> = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'POST', body });
  }

  async put<T = any>(url: string, body: any, config: Partial<PreferenceAwareRequestConfig> = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PUT', body });
  }

  async delete<T = any>(url: string, config: Partial<PreferenceAwareRequestConfig> = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  // Utility methods
  getConnectionInfo(): UserConnectionInfo {
    return { ...this.connectionInfo };
  }

  shouldOptimizeForSaveData(): boolean {
    return this.connectionInfo.saveData;
  }

  getRecommendedImageQuality(): 'low' | 'medium' | 'high' {
    if (this.connectionInfo.saveData) return 'low';
    
    switch (this.connectionInfo.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'low';
      case '3g':
        return 'medium';
      case '4g':
      default:
        return 'high';
    }
  }

  getRecommendedRequestPriority(): 'low' | 'normal' | 'high' {
    if (this.connectionInfo.saveData) return 'low';
    
    switch (this.connectionInfo.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'low';
      case '3g':
        return 'normal';
      case '4g':
      default:
        return 'high';
    }
  }
}

// Global instance
export const preferenceAwareHttpClient = new PreferenceAwareHttpClient();

export default preferenceAwareHttpClient;
