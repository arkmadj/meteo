/**
 * Adaptive Weather Updates Service
 * Chooses optimal real-time communication method based on network conditions and user preferences
 */

export type UpdateMethod = 'websocket' | 'sse' | 'polling';
export type UpdateFrequency = 'high' | 'medium' | 'low';

interface WeatherUpdateConfig {
  method: UpdateMethod;
  frequency: UpdateFrequency;
  interval: number;
  fallbackMethod: UpdateMethod;
}

interface NetworkConditions {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface WeatherUpdateData {
  timestamp: number;
  location: { lat: number; lon: number };
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  conditions: string;
  alerts?: WeatherAlert[];
}

interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  startTime: number;
  endTime: number;
}

class AdaptiveWeatherUpdatesService {
  private currentMethod: UpdateMethod = 'polling';
  private websocket: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private updateCallback: ((data: WeatherUpdateData) => void) | null = null;
  private alertCallback: ((alert: WeatherAlert) => void) | null = null;
  private isActive = false;
  private currentLocation: { lat: number; lon: number } | null = null;

  /**
   * Determine optimal update method based on conditions
   */
  private determineOptimalMethod(
    networkConditions: NetworkConditions,
    userPreferences: unknown,
    updateFrequency: UpdateFrequency
  ): WeatherUpdateConfig {
    // Respect save-data preference
    const userPrefs = userPreferences as { saveData?: boolean };
    if (networkConditions.saveData || userPrefs.saveData) {
      return {
        method: 'polling',
        frequency: 'low',
        interval: 300000, // 5 minutes
        fallbackMethod: 'polling',
      };
    }

    // Poor network conditions
    if (networkConditions.effectiveType === 'slow-2g' || networkConditions.effectiveType === '2g') {
      return {
        method: 'polling',
        frequency: 'low',
        interval: 120000, // 2 minutes
        fallbackMethod: 'polling',
      };
    }

    // Good network conditions - choose based on update frequency needs
    switch (updateFrequency) {
      case 'high':
        // Real-time radar, storm tracking
        return {
          method: 'websocket',
          frequency: 'high',
          interval: 5000, // 5 seconds
          fallbackMethod: 'sse',
        };

      case 'medium':
        // Current conditions, alerts
        return {
          method: 'sse',
          frequency: 'medium',
          interval: 30000, // 30 seconds
          fallbackMethod: 'polling',
        };

      case 'low':
      default:
        // General weather updates
        return {
          method: 'polling',
          frequency: 'low',
          interval: 60000, // 1 minute
          fallbackMethod: 'polling',
        };
    }
  }

  /**
   * Get current network conditions
   */
  private getNetworkConditions(): NetworkConditions {
    const connection = (navigator as unknown as Record<string, unknown>).connection as
      | { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean }
      | undefined;

    return {
      effectiveType: (connection?.effectiveType as 'slow-2g' | '2g' | '3g' | '4g') || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 100,
      saveData: connection?.saveData || false,
    };
  }

  /**
   * Start weather updates with adaptive method selection
   */
  public startUpdates(
    location: { lat: number; lon: number },
    updateFrequency: UpdateFrequency = 'medium',
    onUpdate: (data: WeatherUpdateData) => void,
    onAlert?: (alert: WeatherAlert) => void
  ) {
    this.currentLocation = location;
    this.updateCallback = onUpdate;
    this.alertCallback = onAlert || null;
    this.isActive = true;

    // Get network conditions and user preferences
    const networkConditions = this.getNetworkConditions();
    const userPreferences = {}; // Would get from context in real implementation

    // Determine optimal configuration
    const config = this.determineOptimalMethod(networkConditions, userPreferences, updateFrequency);

    console.log(
      `🌐 Starting weather updates with ${config.method} (${config.frequency} frequency)`
    );

    // Start with optimal method
    this.startWithMethod(config.method, config);
  }

  /**
   * Start updates with specific method
   */
  private startWithMethod(method: UpdateMethod, config: WeatherUpdateConfig) {
    this.stopCurrentMethod();
    this.currentMethod = method;

    switch (method) {
      case 'websocket':
        this.startWebSocket(config);
        break;
      case 'sse':
        this.startSSE(config);
        break;
      case 'polling':
        this.startPolling(config);
        break;
    }
  }

  /**
   * WebSocket implementation
   */
  private startWebSocket(config: WeatherUpdateConfig) {
    if (!this.currentLocation) return;

    const wsUrl = `wss://api.weather.com/ws?lat=${this.currentLocation.lat}&lon=${this.currentLocation.lon}`;
    this.websocket = new WebSocket(wsUrl);

    this.websocket.onopen = () => {
      console.log('🔌 WebSocket connected for weather updates');
    };

    this.websocket.onmessage = event => {
      try {
        const data: WeatherUpdateData = JSON.parse(event.data);
        this.updateCallback?.(data);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    this.websocket.onclose = () => {
      console.log('🔌 WebSocket disconnected, falling back to', config.fallbackMethod);
      if (this.isActive) {
        setTimeout(() => {
          this.startWithMethod(config.fallbackMethod, config);
        }, 1000);
      }
    };

    this.websocket.onerror = error => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * Server-Sent Events implementation
   */
  private startSSE(config: WeatherUpdateConfig) {
    if (!this.currentLocation) return;

    const sseUrl = `https://api.weather.com/sse/weather?lat=${this.currentLocation.lat}&lon=${this.currentLocation.lon}`;
    this.eventSource = new EventSource(sseUrl);

    this.eventSource.onopen = () => {
      console.log('📡 SSE connected for weather updates');
    };

    this.eventSource.onmessage = event => {
      try {
        const data: WeatherUpdateData = JSON.parse(event.data);
        this.updateCallback?.(data);
      } catch (error) {
        console.error('SSE message parsing error:', error);
      }
    };

    this.eventSource.addEventListener('weather-alert', event => {
      try {
        const alert: WeatherAlert = JSON.parse(event.data);
        this.alertCallback?.(alert);
      } catch (error) {
        console.error('SSE alert parsing error:', error);
      }
    });

    this.eventSource.onerror = () => {
      console.log('📡 SSE error, falling back to', config.fallbackMethod);
      if (this.isActive) {
        this.eventSource?.close();
        setTimeout(() => {
          this.startWithMethod(config.fallbackMethod, config);
        }, 1000);
      }
    };
  }

  /**
   * Long polling implementation
   */
  private startPolling(config: WeatherUpdateConfig) {
    if (!this.currentLocation) return;

    console.log(`🔄 Starting polling every ${config.interval}ms`);

    const poll = async () => {
      if (!this.isActive || !this.currentLocation) return;

      try {
        const response = await fetch(
          `https://api.weather.com/current?lat=${this.currentLocation.lat}&lon=${this.currentLocation.lon}&timestamp=${Date.now()}`
        );

        if (response.ok) {
          const data: WeatherUpdateData = await response.json();
          this.updateCallback?.(data);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      if (this.isActive) {
        this.pollingInterval = setTimeout(poll, config.interval);
      }
    };

    poll();
  }

  /**
   * Stop current update method
   */
  private stopCurrentMethod() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Update location for weather updates
   */
  public updateLocation(newLocation: { lat: number; lon: number }) {
    this.currentLocation = newLocation;

    // For WebSocket, send location update
    if (this.currentMethod === 'websocket' && this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(
        JSON.stringify({
          type: 'location_update',
          data: newLocation,
        })
      );
    } else {
      // For SSE and polling, restart with new location
      if (this.isActive) {
        const networkConditions = this.getNetworkConditions();
        const config = this.determineOptimalMethod(networkConditions, {}, 'medium');
        this.startWithMethod(this.currentMethod, config);
      }
    }
  }

  /**
   * Stop all weather updates
   */
  public stopUpdates() {
    this.isActive = false;
    this.stopCurrentMethod();
    console.log('🛑 Weather updates stopped');
  }

  /**
   * Get current update method
   */
  public getCurrentMethod(): UpdateMethod {
    return this.currentMethod;
  }

  /**
   * Force switch to specific method (for testing)
   */
  public switchToMethod(method: UpdateMethod, frequency: UpdateFrequency = 'medium') {
    if (!this.isActive) return;

    const networkConditions = this.getNetworkConditions();
    const config = this.determineOptimalMethod(networkConditions, {}, frequency);
    config.method = method; // Override with forced method

    this.startWithMethod(method, config);
  }
}

// Export singleton instance
export const adaptiveWeatherUpdatesService = new AdaptiveWeatherUpdatesService();

export default adaptiveWeatherUpdatesService;
