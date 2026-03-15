/**
 * Compact Language Selector Component
 * A minimal, flag-based language selector matching SearchEngine UI aesthetics
 * Features glass morphism, blue accents, and modern styling
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SupportedLanguage } from '@/i18n/config/types';

import CustomScrollbar from '@/components/ui/forms/CustomScrollbar';

interface CompactLanguageSelectorProps {
  currentLanguage: string;
  supportedLanguages: Record<string, string>;
  changeLanguage: (lang: SupportedLanguage) => void;
  theme?: 'light' | 'dark';
}

const CompactLanguageSelector: React.FC<CompactLanguageSelectorProps> = ({
  currentLanguage,
  supportedLanguages,
  changeLanguage,
  theme = 'light',
}) => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Language data with flags
  const languageData: Record<string, { flag: string; name: string; nativeName: string }> = {
    en: { flag: '🇺🇸', name: 'English', nativeName: 'English' },
    es: { flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
    fr: { flag: '🇫🇷', name: 'French', nativeName: 'Français' },
    de: { flag: '🇩🇪', name: 'German', nativeName: 'Deutsch' },
  };

  const availableLanguages = Object.keys(supportedLanguages)
    .map(code => ({ code, ...languageData?.[code] }))
    .filter(lang => lang.flag);

  const currentLangData = languageData?.[currentLanguage];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // SearchEngine UI matching styles with glass morphism
  const themeStyles = {
    light: {
      button: [
        'bg-blue-50',
        'border',
        'border-transparent',
        'backdrop-blur-sm',
        'text-gray-900',
        'hover:bg-blue-100',
        'hover:border-blue-200',
        'focus:bg-white',
        'focus:border-blue-500',
        'focus:ring-2',
        'focus:ring-blue-100',
        'focus:ring-offset-2',
        'focus:ring-offset-white',
        'shadow-sm',
        'hover:shadow-md',
        'focus:shadow-md',
        'transition-all',
        'duration-200',
        'ease-in-out',
      ].join(' '),
      dropdown: [
        'bg-white/95',
        'backdrop-blur-sm',
        'border',
        'border-gray-200',
        'shadow-xl',
        'rounded-xl',
      ].join(' '),
      item: 'text-gray-900 hover:bg-blue-50 transition-colors duration-150',
      itemActive: 'bg-blue-100 text-blue-800 border-l-4 border-l-blue-500',
      itemPrimary: 'text-gray-900',
      itemSecondary: 'text-gray-500',
      indicatorBorder: 'border-white',
    },
    dark: {
      button: [
        'bg-gray-800/80',
        'border',
        'border-transparent',
        'backdrop-blur-sm',
        'text-gray-100',
        'hover:bg-gray-700/80',
        'hover:border-gray-600',
        'focus:bg-gray-700',
        'focus:border-blue-400',
        'focus:ring-2',
        'focus:ring-blue-200/50',
        'focus:ring-offset-2',
        'focus:ring-offset-gray-900',
        'shadow-sm',
        'hover:shadow-md',
        'focus:shadow-md',
        'transition-all',
        'duration-200',
        'ease-in-out',
      ].join(' '),
      dropdown: [
        'bg-gray-800/95',
        'backdrop-blur-sm',
        'border',
        'border-gray-700',
        'shadow-xl',
        'rounded-xl',
      ].join(' '),
      item: 'text-gray-100 hover:bg-gray-700/80 transition-colors duration-150',
      itemActive: 'bg-blue-600/80 text-white border-l-4 border-l-blue-400',
      itemPrimary: 'text-gray-100',
      itemSecondary: 'text-gray-400',
      indicatorBorder: 'border-gray-900',
    },
  } as const;

  const styles = themeStyles[theme] ?? themeStyles.light;

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger Button */}
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('navigation.language')}
        className={`
          relative
          inline-flex
          items-center
          justify-center
          w-10
          h-10
          rounded-full
          focus:outline-none
          ${styles.button}
          ${isOpen ? 'ring-2 ring-blue-300 border-blue-500' : ''}
        `}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span aria-label={currentLangData?.name} className="text-lg" role="img">
          {currentLangData?.flag || '🌐'}
        </span>

        {/* Modern indicator dot */}
        <span
          aria-hidden="true"
          className={`
          absolute
          -bottom-0.5
          -right-0.5
          h-3
          w-3
          rounded-full
          border-2
          bg-blue-500
          ${styles.indicatorBorder}
          shadow-sm
          transition-all
          duration-200
          ${isOpen ? 'scale-110 bg-blue-600' : 'scale-100'}
        `}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          aria-label={t('navigation.selectLanguage')}
          className={`
            absolute
            top-full
            right-0
            mt-2
            z-50
            min-w-max
            ${styles.dropdown}
          `}
          role="listbox"
        >
          <CustomScrollbar
            className="py-1"
            fadeIn={true}
            maxHeight="16rem"
            smoothScroll={true}
            variant="autocomplete"
          >
            {availableLanguages.map((lang, index) => (
              <button
                key={lang.code}
                aria-selected={lang.code === currentLanguage}
                className={`
                w-full
                flex
                items-center
                px-4
                py-3
                text-left
                transition-colors
                duration-150
                ease-in-out
                ${lang.code === currentLanguage ? styles.itemActive : styles.item}
                ${index === 0 ? 'rounded-t-xl' : ''}
                ${index === availableLanguages.length - 1 ? 'rounded-b-xl' : ''}
              `}
                role="option"
                type="button"
                onClick={() => {
                  changeLanguage(lang.code as SupportedLanguage);
                  setIsOpen(false);
                }}
              >
                <span aria-label={lang.name} className="text-lg mr-3 flex-shrink-0" role="img">
                  {lang.flag}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className={`font-medium text-sm truncate ${styles.itemPrimary}`}>
                    {lang.nativeName}
                  </span>
                  <span className={`text-xs truncate ${styles.itemSecondary}`}>{lang.name}</span>
                </span>
                {lang.code === currentLanguage && (
                  <span aria-hidden="true" className="ml-3 flex-shrink-0">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                  </span>
                )}
              </button>
            ))}
          </CustomScrollbar>
        </div>
      )}
    </div>
  );
};

export default CompactLanguageSelector;
