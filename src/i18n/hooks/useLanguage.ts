/**
 * Custom hook for language management
 */

import { useCallback, useEffect, useState } from 'react';

import i18n, { supportedLanguages } from '../config';
import type { SupportedLanguage } from '../config/types';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    (i18n.language as SupportedLanguage) || 'en'
  );

  // Listen to i18n language changes to keep state in sync
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng as SupportedLanguage);
    };

    // Subscribe to language change events
    i18n.on('languageChanged', handleLanguageChanged);

    // Cleanup subscription on unmount
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  // Memoize changeLanguage to prevent recreation on every render
  const changeLanguage = useCallback((language: SupportedLanguage) => {
    void i18n.changeLanguage(language);
    localStorage.setItem('preferred-language', language);
    // Note: setCurrentLanguage will be called by the languageChanged event handler
  }, []);

  // Memoize initializeLanguage to prevent recreation on every render
  const initializeLanguage = useCallback(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    const browserLanguage = navigator.language.split('-')?.[0];

    const initialLanguage = (savedLanguage || browserLanguage) as SupportedLanguage;
    if (Object.keys(supportedLanguages).includes(initialLanguage)) {
      changeLanguage(initialLanguage);
    }
  }, [changeLanguage]);

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  return {
    currentLanguage,
    changeLanguage,
    supportedLanguages,
  };
};
