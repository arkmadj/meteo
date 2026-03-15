/**
 * Hook for managing wind speed unit preferences and conversions
 */

import { useCallback } from 'react';
import { useUserPreferencesContext } from '@/contexts/UserPreferencesContext';

export type WindSpeedUnit = 'ms' | 'kmh' | 'mph' | 'knots';

/**
 * Wind speed conversion factors from m/s (base unit)
 */
const WIND_SPEED_CONVERSIONS: Record<WindSpeedUnit, number> = {
  ms: 1,        // meters per second (base)
  kmh: 3.6,     // kilometers per hour
  mph: 2.237,   // miles per hour
  knots: 1.944, // knots
};

/**
 * Hook for wind speed unit management
 */
export const useWindSpeedUnit = () => {
  const { preferences, updateWindSpeedUnit } = useUserPreferencesContext();

  /**
   * Convert wind speed from m/s to the preferred unit
   */
  const convertWindSpeed = useCallback(
    (speedInMs: number, targetUnit?: WindSpeedUnit): number => {
      const unit = targetUnit || preferences.windSpeedUnit;
      return speedInMs * WIND_SPEED_CONVERSIONS[unit];
    },
    [preferences.windSpeedUnit]
  );

  /**
   * Convert wind speed between any two units
   */
  const convertWindSpeedBetweenUnits = useCallback(
    (speed: number, fromUnit: WindSpeedUnit, toUnit: WindSpeedUnit): number => {
      // First convert to m/s (base unit), then to target unit
      const speedInMs = speed / WIND_SPEED_CONVERSIONS[fromUnit];
      return speedInMs * WIND_SPEED_CONVERSIONS[toUnit];
    },
    []
  );

  /**
   * Format wind speed with the current unit
   */
  const formatWindSpeed = useCallback(
    (speedInMs: number, options?: {
      unit?: WindSpeedUnit;
      decimals?: number;
      showUnit?: boolean;
    }): string => {
      const unit = options?.unit || preferences.windSpeedUnit;
      const decimals = options?.decimals ?? 1;
      const showUnit = options?.showUnit ?? true;
      
      const convertedSpeed = convertWindSpeed(speedInMs, unit);
      const formattedSpeed = convertedSpeed.toFixed(decimals);
      
      if (!showUnit) return formattedSpeed;
      
      const unitSymbols: Record<WindSpeedUnit, string> = {
        ms: 'm/s',
        kmh: 'km/h',
        mph: 'mph',
        knots: 'knots',
      };
      
      return `${formattedSpeed} ${unitSymbols[unit]}`;
    },
    [convertWindSpeed, preferences.windSpeedUnit]
  );

  /**
   * Get the unit symbol for the current or specified unit
   */
  const getUnitSymbol = useCallback(
    (unit?: WindSpeedUnit): string => {
      const targetUnit = unit || preferences.windSpeedUnit;
      const unitSymbols: Record<WindSpeedUnit, string> = {
        ms: 'm/s',
        kmh: 'km/h',
        mph: 'mph',
        knots: 'knots',
      };
      return unitSymbols[targetUnit];
    },
    [preferences.windSpeedUnit]
  );

  /**
   * Get localized unit name
   */
  const getUnitName = useCallback(
    (unit?: WindSpeedUnit): string => {
      const targetUnit = unit || preferences.windSpeedUnit;
      const unitNames: Record<WindSpeedUnit, string> = {
        ms: 'meters per second',
        kmh: 'kilometers per hour',
        mph: 'miles per hour',
        knots: 'knots',
      };
      return unitNames[targetUnit];
    },
    [preferences.windSpeedUnit]
  );

  return {
    currentUnit: preferences.windSpeedUnit,
    updateWindSpeedUnit,
    convertWindSpeed,
    convertWindSpeedBetweenUnits,
    formatWindSpeed,
    getUnitSymbol,
    getUnitName,
  };
};

export default useWindSpeedUnit;
