/**
 * Custom hook for weather-specific internationalization
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useWeatherI18n = () => {
  const { t, i18n } = useTranslation(['weather', 'common', 'errors']);

  const getWeatherDescription = useMemo(() => {
    return (code: number, isDay: boolean = true) => {
      const descriptionKey = `weather.conditions.${code}`;
      const baseDescription = t(descriptionKey);

      // Handle day/night variations if needed
      if (!isDay && [0, 1, 2, 3].includes(code)) {
        const nightKey = `weather.conditions.night.${code}`;
        const nightDescription = t(nightKey, { defaultValue: baseDescription });
        return nightDescription;
      }

      return baseDescription;
    };
  }, [t]);

  const getLocalizedTemperature = useMemo(() => {
    return (temp: number, unit?: 'celsius' | 'fahrenheit') => {
      const formattedTemp = new Intl.NumberFormat(i18n.language, {
        style: 'decimal',
        maximumFractionDigits: 1,
      }).format(Math.round(temp));

      const unitSymbol = unit === 'celsius' ? '°C' : '°F';
      return `${formattedTemp}${unitSymbol}`;
    };
  }, [i18n.language]);

  const getLocalizedWindSpeed = useMemo(() => {
    return (speed: number, unit?: 'metric' | 'imperial') => {
      const convertedSpeed = unit === 'imperial' ? speed * 2.237 : speed;
      const unitSymbol = unit === 'metric' ? 'm/s' : 'mph';

      return `${new Intl.NumberFormat(i18n.language, {
        style: 'decimal',
        maximumFractionDigits: 1,
      }).format(convertedSpeed)} ${unitSymbol}`;
    };
  }, [i18n.language]);

  const getWeatherUnit = useMemo(() => {
    return (type: 'temperature' | 'wind' | 'humidity') => {
      return t(`weather.units.${type}`, {
        defaultValue: {
          temperature: '°C',
          wind: 'm/s',
          humidity: '%',
        }?.[type],
      });
    };
  }, [t]);

  const getWeatherLabel = useMemo(() => {
    return (type: 'windSpeed' | 'humidity' | 'pressure') => {
      return t(`weather.labels.${type}`);
    };
  }, [t]);

  const getLanguage = useMemo(() => {
    return () => t('common.language');
  }, [t]);

  return {
    getWeatherDescription,
    getLocalizedTemperature,
    getLocalizedWindSpeed,
    getWeatherUnit,
    getWeatherLabel,
    getLanguage,
    t,
    i18n,
  };
};
