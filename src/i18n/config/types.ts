/**
 * TypeScript types for i18n configuration
 */

export const supportedLanguages = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

export interface I18nState {
  currentLanguage: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => void;
  supportedLanguages: Record<SupportedLanguage, string>;
}

export interface WeatherI18n {
  getWeatherDescription: (code: number, isDay?: boolean) => string;
  getLocalizedTemperature: (temp: number, unit?: 'celsius' | 'fahrenheit') => string;
  getLocalizedWindSpeed: (speed: number, unit?: 'metric' | 'imperial') => string;
  getWeatherUnit: (type: 'temperature' | 'wind' | 'humidity') => string;
  getWeatherLabel: (type: 'windSpeed' | 'humidity' | 'pressure') => string;
}

export interface DateI18n {
  formatDate: (date: Date | string, format?: 'short' | 'long' | 'time') => string;
  formatWeekday: (date: Date | string, format?: 'short' | 'long') => string;
  language: string;
}
