/**
 * React hook for adaptive weather updates
 * Automatically chooses the best real-time communication method
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UpdateMethod, UpdateFrequency } from '@/services/adaptiveWeatherUpdatesService';
import { adaptiveWeatherUpdatesService } from '@/services/adaptiveWeatherUpdatesService';
import { useUserPreferencesContext } from '@/contexts/UserPreferencesContext';

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

interface UseAdaptiveWeatherUpdatesOptions {
  location: { lat: number; lon: number };
  frequency?: UpdateFrequency;
  enabled?: boolean;
  onAlert?: (alert: WeatherAlert) => void;
}

interface UseAdaptiveWeatherUpdatesReturn {
  weatherData: WeatherUpdateData | null;
  alerts: WeatherAlert[];
  isConnected: boolean;
  currentMethod: UpdateMethod;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdate: number | null;
  startUpdates: () => void;
  stopUpdates: () => void;
  switchMethod: (method: UpdateMethod) => void;
  clearAlerts: () => void;
}

export function useAdaptiveWeatherUpdates({
  location,
  frequency = 'medium',
  enabled = true,
  onAlert,
}: UseAdaptiveWeatherUpdatesOptions): UseAdaptiveWeatherUpdatesReturn {
  const [weatherData, setWeatherData] = useState<WeatherUpdateData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<UpdateMethod>('polling');
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<
    'excellent' | 'good' | 'fair' | 'poor'
  >('good');

  const { _preferences } = useUserPreferencesContext();
  const locationRef = useRef(location);
  const enabledRef = useRef(enabled);

  // Update refs when props change
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  /**
   * Handle weather data updates
   */
  const handleWeatherUpdate = useCallback(
    (data: WeatherUpdateData) => {
      setWeatherData(data);
      setLastUpdate(Date.now());
      setIsConnected(true);

      // Determine connection quality based on update frequency
      const now = Date.now();
      const timeSinceLastUpdate = lastUpdate ? now - lastUpdate : 0;

      if (timeSinceLastUpdate < 10000) {
        setConnectionQuality('excellent');
      } else if (timeSinceLastUpdate < 30000) {
        setConnectionQuality('good');
      } else if (timeSinceLastUpdate < 60000) {
        setConnectionQuality('fair');
      } else {
        setConnectionQuality('poor');
      }
    },
    [lastUpdate]
  );

  /**
   * Handle weather alerts
   */
  const handleWeatherAlert = useCallback(
    (alert: WeatherAlert) => {
      setAlerts(prev => {
        // Avoid duplicate alerts
        if (prev.some(a => a.id === alert.id)) {
          return prev;
        }

        // Add new alert and sort by severity
        const newAlerts = [...prev, alert].sort((a, b) => {
          const severityOrder = { extreme: 4, severe: 3, moderate: 2, minor: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        });

        // Limit to 10 alerts
        return newAlerts.slice(0, 10);
      });

      // Call external alert handler
      onAlert?.(alert);
    },
    [onAlert]
  );

  /**
   * Start weather updates
   */
  const startUpdates = useCallback(() => {
    if (!enabledRef.current) return;

    adaptiveWeatherUpdatesService.startUpdates(
      locationRef.current,
      frequency,
      handleWeatherUpdate,
      handleWeatherAlert
    );

    setCurrentMethod(adaptiveWeatherUpdatesService.getCurrentMethod());
    setIsConnected(true);
  }, [frequency, handleWeatherUpdate, handleWeatherAlert]);

  /**
   * Stop weather updates
   */
  const stopUpdates = useCallback(() => {
    adaptiveWeatherUpdatesService.stopUpdates();
    setIsConnected(false);
  }, []);

  /**
   * Switch to specific update method
   */
  const switchMethod = useCallback(
    (method: UpdateMethod) => {
      adaptiveWeatherUpdatesService.switchToMethod(method, frequency);
      setCurrentMethod(method);
    },
    [frequency]
  );

  /**
   * Clear all alerts
   */
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  /**
   * Handle location changes
   */
  useEffect(() => {
    if (isConnected) {
      adaptiveWeatherUpdatesService.updateLocation(location);
    }
  }, [location, isConnected]);

  /**
   * Start/stop updates based on enabled state
   */
  useEffect(() => {
    if (enabled) {
      startUpdates();
    } else {
      stopUpdates();
    }

    return () => {
      stopUpdates();
    };
  }, [enabled, startUpdates, stopUpdates]);

  /**
   * Handle network condition changes
   */
  useEffect(() => {
    const handleOnline = () => {
      if (enabled) {
        startUpdates();
      }
    };

    const handleOffline = () => {
      setIsConnected(false);
      setConnectionQuality('poor');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, startUpdates]);

  /**
   * Monitor connection quality
   */
  useEffect(() => {
    const checkConnectionQuality = () => {
      if (!lastUpdate) return;

      const timeSinceLastUpdate = Date.now() - lastUpdate;

      if (timeSinceLastUpdate > 120000) {
        // 2 minutes
        setConnectionQuality('poor');
        setIsConnected(false);
      } else if (timeSinceLastUpdate > 60000) {
        // 1 minute
        setConnectionQuality('fair');
      }
    };

    const interval = setInterval(checkConnectionQuality, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [lastUpdate]);

  /**
   * Clean up expired alerts
   */
  useEffect(() => {
    const cleanupExpiredAlerts = () => {
      const now = Date.now();
      setAlerts(prev => prev.filter(alert => alert.endTime > now));
    };

    const interval = setInterval(cleanupExpiredAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return {
    weatherData,
    alerts,
    isConnected,
    currentMethod,
    connectionQuality,
    lastUpdate,
    startUpdates,
    stopUpdates,
    switchMethod,
    clearAlerts,
  };
}

/**
 * Hook for weather alerts only (lighter weight)
 */
export function useWeatherAlerts(location: { lat: number; lon: number }) {
  const { alerts, clearAlerts } = useAdaptiveWeatherUpdates({
    location,
    frequency: 'low', // Alerts don't need high frequency
    enabled: true,
  });

  return { alerts, clearAlerts };
}

/**
 * Hook for high-frequency weather updates (radar, storms)
 */
export function useHighFrequencyWeatherUpdates(location: { lat: number; lon: number }) {
  return useAdaptiveWeatherUpdates({
    location,
    frequency: 'high',
    enabled: true,
  });
}

export default useAdaptiveWeatherUpdates;
