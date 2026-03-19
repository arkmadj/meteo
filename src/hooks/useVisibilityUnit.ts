import { useCallback } from 'react';
import { useUserPreferencesContext } from '@/contexts/UserPreferencesContext';

export type VisibilityUnit = 'm' | 'km' | 'mi' | 'nm';

// Conversion factors from meters to other units
const VISIBILITY_CONVERSIONS: Record<VisibilityUnit, number> = {
  m: 1,
  km: 0.001,
  mi: 0.000621371,
  nm: 0.000539957,
};

/**
 * Hook for visibility unit management
 */
export const useVisibilityUnit = () => {
  const { preferences, updateVisibilityUnit } = useUserPreferencesContext();

  /**
   * Convert visibility from meters to the preferred unit
   */
  const convertVisibility = useCallback(
    (visibilityInMeters: number, targetUnit?: VisibilityUnit): number => {
      const unit = targetUnit || preferences.visibilityUnit;
      return visibilityInMeters * VISIBILITY_CONVERSIONS[unit];
    },
    [preferences.visibilityUnit]
  );

  /**
   * Format visibility with the current unit
   */
  const formatVisibility = useCallback(
    (
      visibilityInMeters: number,
      options?: {
        unit?: VisibilityUnit;
        decimals?: number;
        showUnit?: boolean;
      }
    ): string => {
      const unit = options?.unit || preferences.visibilityUnit;
      const decimals = options?.decimals ?? 1;
      const showUnit = options?.showUnit ?? true;

      const convertedVisibility = convertVisibility(visibilityInMeters, unit);

      // Special formatting for different units
      let formattedValue: string;
      if (unit === 'm') {
        // For meters, show whole numbers for large values
        formattedValue =
          convertedVisibility >= 1000
            ? Math.round(convertedVisibility).toString()
            : convertedVisibility.toFixed(0);
      } else {
        // For other units, use decimal places
        formattedValue = convertedVisibility.toFixed(decimals);
      }

      if (!showUnit) return formattedValue;

      const unitSymbols: Record<VisibilityUnit, string> = {
        m: 'm',
        km: 'km',
        mi: 'mi',
        nm: 'nm',
      };

      return `${formattedValue} ${unitSymbols[unit]}`;
    },
    [convertVisibility, preferences.visibilityUnit]
  );

  /**
   * Get the unit symbol for the current or specified unit
   */
  const getUnitSymbol = useCallback(
    (unit?: VisibilityUnit): string => {
      const targetUnit = unit || preferences.visibilityUnit;
      const unitSymbols: Record<VisibilityUnit, string> = {
        m: 'm',
        km: 'km',
        mi: 'mi',
        nm: 'nm',
      };
      return unitSymbols[targetUnit];
    },
    [preferences.visibilityUnit]
  );

  /**
   * Get localized unit name
   */
  const getUnitName = useCallback(
    (unit?: VisibilityUnit): string => {
      const targetUnit = unit || preferences.visibilityUnit;
      const unitNames: Record<VisibilityUnit, string> = {
        m: 'meters',
        km: 'kilometers',
        mi: 'miles',
        nm: 'nautical miles',
      };
      return unitNames[targetUnit];
    },
    [preferences.visibilityUnit]
  );

  return {
    currentUnit: preferences.visibilityUnit,
    convertVisibility,
    formatVisibility,
    getUnitSymbol,
    getUnitName,
    updateVisibilityUnit,
  };
};

export default useVisibilityUnit;
