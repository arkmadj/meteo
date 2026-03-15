/**
 * Custom hook for weather data formatting utilities
 * Provides memoized formatting functions for weather data
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDateI18n } from '@/i18n/hooks/useDateI18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';

export interface WeatherFormattingHook {
  formatWeekday: (date: string, format?: 'short' | 'long') => string;
  toDate: (date: string) => string;
  getLocalizedWeatherDescription: (code: number) => string;
  getLocalizedTemperature: (temp: number, isCelsius: boolean) => string;
  convertTemperature: (temp: number, toCelsius: boolean) => number;
}

export const useWeatherFormatting = (): WeatherFormattingHook => {
  const { t } = useTranslation(['weather']);
  const { currentLanguage } = useLanguage();
  const { formatDate } = useDateI18n();

  // Memoized weekday formatter
  const formatWeekday = useMemo(
    () =>
      (date: string, format: 'short' | 'long' = 'short') => {
        return formatDate(date, format);
      },
    [formatDate]
  );

  // Memoized date formatter
  const toDate = useMemo(
    () => (date: string) => {
      return new Date(date).toLocaleDateString(currentLanguage, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    },
    [currentLanguage]
  );

  // Memoized weather description formatter
  const getLocalizedWeatherDescription = useMemo(
    () => (code: number) => {
      const descriptions = {
        0: t('weather:clear'),
        1: t('weather:mainlyClear'),
        2: t('weather:partlyCloudy'),
        3: t('weather:overcast'),
        45: t('weather:fog'),
        48: t('weather:depositingRimeFog'),
        51: t('weather:drizzleLight'),
        53: t('weather:drizzleModerate'),
        55: t('weather:drizzleDense'),
        56: t('weather:freezingDrizzleLight'),
        57: t('weather:freezingDrizzleDense'),
        61: t('weather:rainLight'),
        63: t('weather:rainModerate'),
        65: t('weather:rainHeavy'),
        66: t('weather:freezingRainLight'),
        67: t('weather:freezingRainHeavy'),
        71: t('weather:snowFallLight'),
        73: t('weather:snowFallModerate'),
        75: t('weather:snowFallHeavy'),
        77: t('weather:snowGrains'),
        80: t('weather:showersLight'),
        81: t('weather:showersModerate'),
        82: t('weather:showersViolent'),
        85: t('weather:snowShowersLight'),
        86: t('weather:snowShowersHeavy'),
        95: t('weather:thunderstorm'),
        96: t('weather:thunderstormSlightHail'),
        99: t('weather:thunderstormHeavyHail'),
      };
      return descriptions?.[code as keyof typeof descriptions] || t('weather:unknown');
    },
    [t]
  );

  // Temperature conversion utility
  const convertTemperature = useMemo(
    () => (temp: number, toCelsius: boolean) => {
      return toCelsius ? temp : (temp * 9) / 5 + 32;
    },
    []
  );

  // Memoized temperature formatter
  const getLocalizedTemperature = useMemo(
    () => (temp: number, isCelsius: boolean) => {
      const convertedTemp = convertTemperature(temp, isCelsius);
      return `${Math.round(convertedTemp)}°${isCelsius ? 'C' : 'F'}`;
    },
    [convertTemperature]
  );

  return {
    formatWeekday,
    toDate,
    getLocalizedWeatherDescription,
    getLocalizedTemperature,
    convertTemperature,
  };
};
