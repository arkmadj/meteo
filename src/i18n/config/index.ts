/**
 * Main i18n configuration for React Weather App
 */

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import deCommon from '../locales/de/common.json';
import deDates from '../locales/de/dates.json';
import deErrors from '../locales/de/errors.json';
import deWeather from '../locales/de/weather.json';
import enCommon from '../locales/en/common.json';
import enDates from '../locales/en/dates.json';
import enErrors from '../locales/en/errors.json';
import enWeather from '../locales/en/weather.json';
import esCommon from '../locales/es/common.json';
import esDates from '../locales/es/dates.json';
import esErrors from '../locales/es/errors.json';
import esWeather from '../locales/es/weather.json';
import frCommon from '../locales/fr/common.json';
import frDates from '../locales/fr/dates.json';
import frErrors from '../locales/fr/errors.json';
import frWeather from '../locales/fr/weather.json';

import { supportedLanguages } from './types';

export { supportedLanguages, type SupportedLanguage } from './types';

// Initialize i18n
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: Object.keys(supportedLanguages),
    ns: ['common', 'weather', 'errors', 'dates'],
    defaultNS: 'common',
    resources: {
      en: {
        common: enCommon,
        weather: enWeather,
        errors: enErrors,
        dates: enDates,
      },
      es: {
        common: esCommon,
        weather: esWeather,
        errors: esErrors,
        dates: esDates,
      },
      fr: {
        common: frCommon,
        weather: frWeather,
        errors: frErrors,
        dates: frDates,
      },
      de: {
        common: deCommon,
        weather: deWeather,
        errors: deErrors,
        dates: deDates,
      },
    },
    interpolation: {
      escapeValue: false,
      format(value, format, _lng) {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        return value;
      },
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
