/**
 * Toggle Language Selector Component
 * A modern toggle-style language selector matching SearchEngine UI aesthetics
 * Features glass morphism, blue accents, and smooth animations
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SupportedLanguage } from '@/i18n/config/types';

interface ToggleLanguageSelectorProps {
  currentLanguage: string;
  supportedLanguages: Record<string, string>;
  changeLanguage: (lang: SupportedLanguage) => void;
  variant?: 'horizontal' | 'grid';
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

const ToggleLanguageSelector: React.FC<ToggleLanguageSelectorProps> = ({
  currentLanguage,
  supportedLanguages,
  changeLanguage,
  variant = 'horizontal',
  showLabels = true,
  size = 'md',
  theme = 'light',
}) => {
  const { t } = useTranslation('common');
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);

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

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'w-10 h-10 text-sm',
      flag: 'text-sm',
      label: 'text-xs',
      gap: 'gap-2',
    },
    md: {
      button: 'w-12 h-12 text-base',
      flag: 'text-base',
      label: 'text-sm',
      gap: 'gap-3',
    },
    lg: {
      button: 'w-14 h-14 text-lg',
      flag: 'text-lg',
      label: 'text-base',
      gap: 'gap-4',
    },
  };

  const themeStyles = {
    light: {
      label: 'text-gray-700',
      buttonActive:
        'bg-blue-500 border-blue-500 text-white shadow-lg scale-105 focus:ring-blue-100',
      buttonInactive:
        'bg-blue-50 border-transparent text-gray-900 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-600 hover:scale-105 shadow-sm hover:shadow-md focus:ring-blue-100',
      labelActive: 'text-blue-600',
      labelInactive: 'text-gray-600',
      subLabelActive: 'text-blue-500',
      subLabelInactive: 'text-gray-400',
      focusRingOffset: 'focus:ring-offset-2',
      selectionBadge:
        'inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200',
      indicatorBg: 'bg-green-500',
      indicatorBorder: 'border-white',
    },
    dark: {
      label: 'text-gray-200',
      buttonActive:
        'bg-blue-500 border-blue-500 text-white shadow-xl scale-105 focus:ring-blue-300/40',
      buttonInactive:
        'bg-gray-800/80 border-gray-700 text-gray-100 hover:border-blue-400/60 hover:bg-gray-700/80 hover:text-blue-300 hover:scale-105 shadow-md hover:shadow-lg focus:ring-blue-300/40',
      labelActive: 'text-blue-300',
      labelInactive: 'text-gray-300',
      subLabelActive: 'text-blue-300',
      subLabelInactive: 'text-gray-500',
      focusRingOffset: 'focus:ring-offset-2 focus:ring-offset-gray-900',
      selectionBadge:
        'inline-flex items-center px-3 py-1.5 bg-gray-800/80 text-blue-200 rounded-full text-sm font-medium border border-blue-400/40',
      indicatorBg: 'bg-green-400',
      indicatorBorder: 'border-gray-900',
    },
  } as const;

  const themeTokens = themeStyles[theme];

  const config = sizeConfig?.[size];

  // Layout classes
  const containerClasses =
    variant === 'horizontal' ? `flex items-center ${config.gap}` : `grid grid-cols-2 ${config.gap}`;

  return (
    <div className="w-full">
      {/* Label */}
      {showLabels && (
        <label className={`block text-sm font-medium ${themeTokens.label} mb-3`}>
          {t('navigation.language')}
        </label>
      )}

      {/* Language Toggle Buttons */}
      <div className={containerClasses}>
        {availableLanguages.map(lang => {
          const isActive = lang.code === currentLanguage;
          const isHovered = hoveredLang === lang.code;

          return (
            <div key={lang.code} className="relative">
              <button
                aria-label={`${t('navigation.selectLanguage')}: ${lang.nativeName}`}
                aria-pressed={isActive}
                className={`
                  relative
                  ${config.button}
                  rounded-xl
                  border-2
                  backdrop-blur-sm
                  transition-all
                  duration-300
                  ease-in-out
                  focus:outline-none
                  focus:ring-2
                  ${themeTokens.focusRingOffset}
                  transform
                  ${isActive ? themeTokens.buttonActive : themeTokens.buttonInactive}
                `}
                type="button"
                onClick={() => changeLanguage(lang.code as SupportedLanguage)}
                onMouseEnter={() => setHoveredLang(lang.code)}
                onMouseLeave={() => setHoveredLang(null)}
              >
                {/* Flag */}
                <span
                  aria-label={lang.name}
                  className={`${config.flag} transition-transform duration-200 ${
                    isActive || isHovered ? 'scale-110' : 'scale-100'
                  }`}
                  role="img"
                >
                  {lang.flag}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className={`
                    absolute
                    -top-1
                    -right-1
                    w-4
                    h-4
                    ${themeTokens.indicatorBg}
                    rounded-full
                    border-2
                    ${themeTokens.indicatorBorder}
                    flex
                    items-center
                    justify-center
                  `}
                  >
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </span>
                )}

                {/* Ripple effect */}
                <span
                  aria-hidden="true"
                  className={`
                  absolute
                  inset-0
                  rounded-xl
                  bg-current
                  opacity-0
                  transition-opacity
                  duration-200
                  ${isHovered && !isActive ? 'opacity-5' : ''}
                `}
                />
              </button>

              {/* Language Label */}
              {showLabels && (
                <div className="mt-2 text-center">
                  <div
                    className={`
                    ${config.label}
                    font-medium
                    transition-colors
                    duration-200
                    ${isActive ? themeTokens.labelActive : themeTokens.labelInactive}
                  `}
                  >
                    {lang.nativeName}
                  </div>
                  {size !== 'sm' && (
                    <div
                      className={`
                      text-xs
                      transition-colors
                      duration-200
                      ${isActive ? themeTokens.subLabelActive : themeTokens.subLabelInactive}
                    `}
                    >
                      {lang.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Selection Indicator */}
      <div className="mt-4 text-center">
        <div className={themeTokens.selectionBadge}>
          <span className="mr-2">{languageData?.[currentLanguage]?.flag}</span>
          {t('navigation.currentLanguage')}: {languageData?.[currentLanguage]?.nativeName}
        </div>
      </div>
    </div>
  );
};

export default ToggleLanguageSelector;
