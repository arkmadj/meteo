/**
 * Enhanced Language Selector Component
 * A revamped language selector matching SearchEngine UI aesthetics
 * Features glass morphism, blue accents, and modern styling
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SupportedLanguage } from '@/i18n/config/types';

import CustomScrollbar from '@/components/ui/forms/CustomScrollbar';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

interface EnhancedLanguageSelectorProps {
  currentLanguage: string;
  supportedLanguages: Record<string, string>;
  changeLanguage: (lang: SupportedLanguage) => void;
  variant?: 'compact' | 'full' | 'button';
  size?: 'sm' | 'md' | 'lg';
  showFlags?: boolean;
  showNativeNames?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  theme?: 'light' | 'dark';
}

const EnhancedLanguageSelector: React.FC<EnhancedLanguageSelectorProps> = ({
  currentLanguage,
  supportedLanguages,
  changeLanguage,
  variant = 'full',
  size = 'md',
  showFlags = true,
  showNativeNames = true,
  position = 'bottom-right',
  theme = 'light',
}) => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Enhanced language data with flags and native names
  const languageData: Record<string, LanguageOption> = {
    en: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      region: 'United States',
    },
    es: {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      region: 'Spain',
    },
    fr: {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
      region: 'France',
    },
    de: {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      region: 'Germany',
    },
  };

  const availableLanguages = Object.keys(supportedLanguages)
    .map(code => languageData?.[code])
    .filter(Boolean);

  const currentLangData = languageData?.[currentLanguage];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0) {
          changeLanguage(availableLanguages?.[focusedIndex].code as SupportedLanguage);
          setIsOpen(false);
          setFocusedIndex(-1);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => (prev < availableLanguages.length - 1 ? prev + 1 : 0));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : availableLanguages.length - 1));
        }
        break;
    }
  };

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'px-3 py-2 text-sm',
      dropdown: 'py-1',
      item: 'px-3 py-2 text-sm',
      flag: 'text-sm',
    },
    md: {
      button: 'px-4 py-2.5 text-base',
      dropdown: 'py-2',
      item: 'px-4 py-3 text-base',
      flag: 'text-base',
    },
    lg: {
      button: 'px-5 py-3 text-lg',
      dropdown: 'py-2',
      item: 'px-5 py-4 text-lg',
      flag: 'text-lg',
    },
  };

  // Position classes for dropdown
  const positionClasses = {
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
  };

  const themeStyles = {
    light: {
      trigger: [
        'bg-blue-50',
        'border',
        'border-transparent',
        'backdrop-blur-sm',
        'hover:bg-blue-100',
        'hover:border-blue-200',
        'focus:bg-white',
        'focus:border-blue-500',
        'focus:ring-blue-100',
        'text-gray-900',
        'shadow-sm',
        'hover:shadow-md',
        'focus:shadow-md',
      ],
      triggerOpen: 'ring-2 ring-blue-300 border-blue-500',
      label: 'text-gray-700',
      subLabel: 'text-gray-500',
      dropdown: 'bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl',
      itemBase: 'text-gray-900 hover:bg-blue-50 hover:border-l-blue-200 border-l-transparent',
      itemFocused: 'bg-blue-50 text-blue-700 border-l-blue-500 shadow-sm',
      itemSelected: 'bg-blue-100 text-blue-800 border-l-blue-500 shadow-sm',
    },
    dark: {
      trigger: [
        'bg-gray-800/80',
        'border',
        'border-gray-700',
        'backdrop-blur-sm',
        'hover:bg-gray-700/80',
        'hover:border-gray-600',
        'focus:bg-gray-700',
        'focus:border-blue-400',
        'focus:ring-blue-300/40',
        'focus:ring-offset-gray-900',
        'text-gray-100',
        'shadow-sm',
        'hover:shadow-md',
        'focus:shadow-md',
      ],
      triggerOpen: 'ring-2 ring-blue-400/60 border-blue-400',
      label: 'text-gray-200',
      subLabel: 'text-gray-400',
      dropdown: 'bg-gray-900/95 backdrop-blur-sm border border-gray-700 shadow-2xl',
      itemBase:
        'text-gray-100 hover:bg-gray-800/80 hover:border-l-blue-400/40 border-l-transparent',
      itemFocused: 'bg-blue-500/20 text-blue-100 border-l-blue-400 shadow-sm',
      itemSelected: 'bg-blue-600/20 text-blue-100 border-l-blue-400 shadow-sm',
    },
  } as const;

  const themeTokens = themeStyles[theme];

  // SearchEngine UI matching styles
  const renderTriggerButton = () => {
    const baseClasses = [
      'relative',
      'inline-flex',
      'items-center',
      'justify-between',
      'w-full',
      'min-w-0',
      'font-medium',
      'transition-all',
      'duration-200',
      'ease-in-out',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      sizeClasses?.[size].button,
    ];

    if (variant === 'button') {
      baseClasses.push(
        'bg-blue-500',
        'hover:bg-blue-600',
        'focus:bg-blue-600',
        'text-white',
        'rounded-xl',
        'shadow-sm',
        'hover:shadow-md',
        'focus:shadow-md',
        'focus:ring-blue-100'
      );
    } else {
      baseClasses.push(...themeTokens.trigger, 'rounded-xl');
    }

    if (isOpen) {
      if (variant === 'button') {
        baseClasses.push('ring-2', 'ring-blue-300', 'border-blue-500');
      } else {
        baseClasses.push(themeTokens.triggerOpen);
      }
    }

    return (
      <button
        ref={buttonRef}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('navigation.language')}
        className={baseClasses.join(' ')}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        <span className="flex items-center min-w-0 flex-1">
          {showFlags && currentLangData && (
            <span className={`${sizeClasses?.[size].flag} mr-2 flex-shrink-0`}>
              {currentLangData.flag}
            </span>
          )}
          <span className="flex flex-col items-start min-w-0 flex-1">
            <span className="truncate">
              {variant === 'compact'
                ? currentLangData?.code.toUpperCase()
                : showNativeNames
                  ? currentLangData?.nativeName
                  : currentLangData?.name}
            </span>
            {variant === 'full' && size !== 'sm' && (
              <span className={`text-xs ${themeTokens.subLabel} truncate`}>
                {currentLangData?.name !== currentLangData?.nativeName
                  ? currentLangData?.name
                  : currentLangData?.region}
              </span>
            )}
          </span>
        </span>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      </button>
    );
  };

  const renderDropdown = () => {
    if (!isOpen) return null;

    return (
      <div
        aria-label={t('navigation.selectLanguage')}
        className={`
          absolute
          ${positionClasses?.[position]}
          z-50
          w-full
          min-w-max
          ${themeTokens.dropdown}
        `}
        role="listbox"
      >
        <CustomScrollbar
          className={sizeClasses?.[size].dropdown}
          fadeIn={true}
          maxHeight="20rem"
          smoothScroll={true}
          variant="autocomplete"
        >
          {availableLanguages.map((lang, index) => {
            const isSelected = lang.code === currentLanguage;
            const isFocused = index === focusedIndex;
            const itemClasses = [
              'w-full',
              'flex',
              'items-center',
              'text-left',
              'transition-colors',
              'duration-150',
              'ease-in-out',
              sizeClasses?.[size].item,
              'border-l-4',
              isFocused
                ? themeTokens.itemFocused
                : isSelected
                  ? themeTokens.itemSelected
                  : themeTokens.itemBase,
              index === 0 ? 'rounded-t-xl' : '',
              index === availableLanguages.length - 1 ? 'rounded-b-xl' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={lang.code}
                aria-selected={isSelected}
                className={itemClasses}
                role="option"
                type="button"
                onClick={() => {
                  changeLanguage(lang.code as SupportedLanguage);
                  setIsOpen(false);
                  setFocusedIndex(-1);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                {showFlags && (
                  <span className={`${sizeClasses?.[size].flag} mr-3 flex-shrink-0`}>
                    {lang.flag}
                  </span>
                )}
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium truncate">
                    {showNativeNames ? lang.nativeName : lang.name}
                  </span>
                  {variant === 'full' && size !== 'sm' && (
                    <span className={`text-xs ${themeTokens.subLabel} truncate`}>
                      {showNativeNames && lang.name !== lang.nativeName ? lang.name : lang.region}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <span aria-hidden="true" className="ml-2 flex-shrink-0">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </CustomScrollbar>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full max-w-xs">
      {/* Label */}
      {variant === 'full' && (
        <label className={`block text-sm font-medium ${themeTokens.label} mb-2`}>
          {t('navigation.language')}
        </label>
      )}

      {/* Trigger Button */}
      {renderTriggerButton()}

      {/* Dropdown */}
      {renderDropdown()}
    </div>
  );
};

export default EnhancedLanguageSelector;
