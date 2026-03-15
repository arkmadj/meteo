/**
 * Custom hook for date internationalization
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useDateI18n = () => {
  const { i18n } = useTranslation(['dates']);

  const formatDate = useMemo(() => {
    return (date: Date | string, format: 'short' | 'long' | 'time' = 'long') => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      const options = {
        short: {
          month: 'short' as const,
          day: 'numeric' as const,
          year: 'numeric' as const,
        },
        long: {
          weekday: 'long' as const,
          month: 'long' as const,
          day: 'numeric' as const,
          year: 'numeric' as const,
        },
        time: {
          hour: '2-digit' as const,
          minute: '2-digit' as const,
        },
      }?.[format] as Intl.DateTimeFormatOptions;

      return new Intl.DateTimeFormat(i18n.language, options).format(dateObj);
    };
  }, [i18n.language]);

  const formatWeekday = useMemo(() => {
    return (date: Date | string, format: 'short' | 'long' = 'short') => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      const options = {
        short: { weekday: 'short' as const },
        long: { weekday: 'long' as const },
      }?.[format] as Intl.DateTimeFormatOptions;

      return new Intl.DateTimeFormat(i18n.language, options).format(dateObj);
    };
  }, [i18n.language]);

  const getMonthNames = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      return new Intl.DateTimeFormat(i18n.language, { month: 'long' }).format(new Date(2000, i, 1));
    });
  }, [i18n.language]);

  const getDayNames = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      return new Intl.DateTimeFormat(i18n.language, { weekday: 'long' }).format(
        new Date(2000, 0, i + 2)
      ); // Start from Sunday (Jan 2, 2000 was a Sunday)
    });
  }, [i18n.language]);

  return {
    formatDate,
    formatWeekday,
    getMonthNames,
    getDayNames,
    language: i18n.language,
  };
};
