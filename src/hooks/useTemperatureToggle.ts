/**
 * Enhanced Temperature Toggle Hook
 * Provides smooth temperature unit switching with loading states and animations
 */

import { useState, useCallback, useEffect } from 'react';

import { TEMPERATURE_CONVERSION } from '@/constants/weather';

export interface TemperatureToggleHook {
  /** Current temperature unit */
  temperatureUnit: 'C' | 'F';
  /** Whether currently in Celsius mode */
  isCelsius: boolean;
  /** Loading state during unit switching */
  isToggling: boolean;
  /** Toggle temperature unit with smooth transition */
  toggleTemperatureUnit: () => void;
  /** Convert temperature between units */
  convertTemperature: (temp: number, targetUnit?: 'C' | 'F') => number;
  /** Format temperature with unit */
  formatTemperature: (temp: number, unit?: 'C' | 'F') => string;
  /** Get temperature in both units */
  getTemperatureInBothUnits: (temp: number) => { celsius: number; fahrenheit: number };
}

export interface TemperatureToggleOptions {
  /** Initial temperature unit */
  initialUnit?: 'C' | 'F';
  /** Callback when unit changes */
  onUnitChange?: (unit: 'C' | 'F') => void;
  /** Delay for smooth transitions (ms) */
  transitionDelay?: number;
  /** Enable local storage persistence */
  persistToStorage?: boolean;
  /** Storage key for persistence */
  storageKey?: string;
}

const DEFAULT_OPTIONS: Required<TemperatureToggleOptions> = {
  initialUnit: 'C',
  onUnitChange: () => {},
  transitionDelay: 150,
  persistToStorage: true,
  storageKey: 'weather-app-temperature-unit',
};

export const useTemperatureToggle = (
  options: TemperatureToggleOptions = {}
): TemperatureToggleHook => {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Initialize temperature unit from storage or default
  const getInitialUnit = (): 'C' | 'F' => {
    if (config.persistToStorage && typeof window !== 'undefined') {
      const stored = localStorage.getItem(config.storageKey);
      if (stored === 'C' || stored === 'F') {
        return stored;
      }
    }
    return config.initialUnit;
  };

  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>(getInitialUnit);
  const [isToggling, setIsToggling] = useState(false);

  // Computed values
  const isCelsius = temperatureUnit === 'C';

  // Persist to storage when unit changes
  useEffect(() => {
    if (config.persistToStorage && typeof window !== 'undefined') {
      localStorage.setItem(config.storageKey, temperatureUnit);
    }
    config.onUnitChange(temperatureUnit);
  }, [temperatureUnit, config]);

  // Convert temperature between units
  const convertTemperature = useCallback(
    (temp: number, targetUnit?: 'C' | 'F'): number => {
      const target = targetUnit || temperatureUnit;

      if (target === 'C') {
        // Convert to Celsius (assuming input is Fahrenheit if target is Celsius)
        return (
          ((temp - TEMPERATURE_CONVERSION.FAHRENHEIT_OFFSET) *
            TEMPERATURE_CONVERSION.FAHRENHEIT_DIVISOR) /
          TEMPERATURE_CONVERSION.FAHRENHEIT_MULTIPLIER
        );
      } else {
        // Convert to Fahrenheit (assuming input is Celsius if target is Fahrenheit)
        return (
          (temp * TEMPERATURE_CONVERSION.FAHRENHEIT_MULTIPLIER) /
            TEMPERATURE_CONVERSION.FAHRENHEIT_DIVISOR +
          TEMPERATURE_CONVERSION.FAHRENHEIT_OFFSET
        );
      }
    },
    [temperatureUnit]
  );

  // Format temperature with unit
  const formatTemperature = useCallback(
    (temp: number, unit?: 'C' | 'F'): string => {
      const targetUnit = unit || temperatureUnit;
      return `${Math.round(temp)}°${targetUnit}`;
    },
    [temperatureUnit]
  );

  // Get temperature in both units
  const getTemperatureInBothUnits = useCallback(
    (temp: number) => {
      // Assume input temperature is in current unit
      if (isCelsius) {
        return {
          celsius: temp,
          fahrenheit: convertTemperature(temp, 'F'),
        };
      } else {
        return {
          celsius: convertTemperature(temp, 'C'),
          fahrenheit: temp,
        };
      }
    },
    [isCelsius, convertTemperature]
  );

  // Toggle temperature unit with smooth transition
  const toggleTemperatureUnit = useCallback(() => {
    if (isToggling) return; // Prevent rapid toggling

    setIsToggling(true);

    // Add slight delay for smooth visual transition
    setTimeout(() => {
      setTemperatureUnit(prev => (prev === 'C' ? 'F' : 'C'));

      // Reset toggling state after transition
      setTimeout(() => {
        setIsToggling(false);
      }, config.transitionDelay);
    }, 50);
  }, [isToggling, config.transitionDelay]);

  return {
    temperatureUnit,
    isCelsius,
    isToggling,
    toggleTemperatureUnit,
    convertTemperature,
    formatTemperature,
    getTemperatureInBothUnits,
  };
};
