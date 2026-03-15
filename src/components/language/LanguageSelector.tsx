import React from 'react';

import { useTheme } from '@/design-system/theme';
import type { SupportedLanguage } from '@/i18n/config/types';

import CompactLanguageSelector from './CompactLanguageSelector';
import EnhancedLanguageSelector from './EnhancedLanguageSelector';
import ToggleLanguageSelector from './ToggleLanguageSelector';

export type LanguageSelectorVariant = 'enhanced' | 'compact' | 'toggle' | 'legacy';

interface LanguageSelectorProps {
  currentLanguage: string;
  supportedLanguages: Record<string, string>;
  changeLanguage: (lang: SupportedLanguage) => void;
  variant?: LanguageSelectorVariant;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  showFlags?: boolean;
  showNativeNames?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = React.memo(
  ({
    currentLanguage,
    supportedLanguages,
    changeLanguage,
    variant = 'enhanced',
    size = 'md',
    theme: themeOverride,
    showFlags = true,
    showNativeNames = true,
    position = 'bottom-right',
  }) => {
    const { theme: appTheme } = useTheme();
    const resolvedTheme = themeOverride ?? (appTheme.isDark ? 'dark' : 'light');

    // Render based on variant
    switch (variant) {
      case 'compact':
        return (
          <CompactLanguageSelector
            changeLanguage={changeLanguage}
            currentLanguage={currentLanguage}
            supportedLanguages={supportedLanguages}
            theme={resolvedTheme}
          />
        );

      case 'toggle':
        return (
          <ToggleLanguageSelector
            changeLanguage={changeLanguage}
            currentLanguage={currentLanguage}
            showLabels={showNativeNames}
            size={size}
            supportedLanguages={supportedLanguages}
            theme={resolvedTheme}
            variant="horizontal"
          />
        );

      case 'enhanced':
      default:
        return (
          <EnhancedLanguageSelector
            changeLanguage={changeLanguage}
            currentLanguage={currentLanguage}
            position={position}
            showFlags={showFlags}
            showNativeNames={showNativeNames}
            size={size}
            supportedLanguages={supportedLanguages}
            theme={resolvedTheme}
            variant="full"
          />
        );
    }
  }
);

LanguageSelector.displayName = 'LanguageSelector';

export default LanguageSelector;
