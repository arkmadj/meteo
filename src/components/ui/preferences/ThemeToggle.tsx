/**
 * Theme Toggle Component
 * Provides a toggle button to switch between light, dark, and auto themes
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';

export interface ThemeToggleProps {
  /** Component variant */
  variant?: 'default' | 'compact' | 'minimal' | 'icon-only';
  /** Show labels for theme options */
  showLabels?: boolean;
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Custom className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'default',
  showLabels = false,
  showTooltip = true,
  className = '',
  disabled = false,
}) => {
  const { t } = useTranslation('common');
  const { theme, setThemeMode, toggleTheme } = useTheme();
  const [showTooltipState, setShowTooltipState] = useState(false);

  // Theme icons mapping
  const getThemeIcon = (mode: string) => {
    switch (mode) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🔄';
      default:
        return '☀️';
    }
  };

  // Get theme label
  const getThemeLabel = (mode: string) => {
    switch (mode) {
      case 'light':
        return t('theme.light', 'Light');
      case 'dark':
        return t('theme.dark', 'Dark');
      case 'auto':
        return t('theme.auto', 'Auto');
      default:
        return t('theme.light', 'Light');
    }
  };

  // Get next theme in cycle
  const getNextTheme = () => {
    switch (theme.mode) {
      case 'light':
        return 'dark';
      case 'dark':
        return 'auto';
      case 'auto':
        return 'light';
      default:
        return 'dark';
    }
  };

  // Handle theme toggle
  const handleToggle = () => {
    if (disabled) return;

    if (variant === 'compact' || variant === 'icon-only') {
      // Simple toggle between light and dark
      toggleTheme();
    } else {
      // Cycle through all three options
      const nextTheme = getNextTheme();
      setThemeMode(nextTheme as 'light' | 'dark' | 'auto');
    }
  };

  // Get variant styles using CSS custom properties
  const getVariantStyles = () => {
    const baseStyles = `
      inline-flex items-center justify-center
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    switch (variant) {
      case 'compact':
        return `${baseStyles}
          w-10 h-10 rounded-lg
          bg-[var(--theme-surface)]
          border border-[var(--theme-border)]
          hover:bg-[var(--theme-hover)]
          text-[var(--theme-text)]
          focus:ring-[var(--theme-primary)]
          shadow-sm
        `;
      case 'minimal':
        return `${baseStyles}
          w-8 h-8 rounded-md
          text-[var(--theme-text-secondary)]
          hover:text-[var(--theme-text)]
          hover:bg-[var(--theme-hover)]
          focus:ring-[var(--theme-primary)]
        `;
      case 'icon-only':
        return `${baseStyles}
          w-9 h-9 rounded-full
          bg-[var(--theme-hover)]
          text-[var(--theme-text)]
          hover:bg-[var(--theme-active)]
          focus:ring-[var(--theme-primary)]
        `;
      default:
        return `${baseStyles}
          px-3 py-2 rounded-lg
          bg-[var(--theme-surface)]
          border border-[var(--theme-border)]
          hover:bg-[var(--theme-hover)]
          text-[var(--theme-text)]
          focus:ring-[var(--theme-primary)]
          shadow-sm
          ${showLabels ? 'space-x-2' : ''}
        `;
    }
  };

  // Render tooltip
  const renderTooltip = () => {
    if (!showTooltip || !showTooltipState) return null;

    const nextTheme = getNextTheme();
    const tooltipText =
      variant === 'compact' || variant === 'icon-only'
        ? `${t('theme.switchTo', 'Switch to')} ${getThemeLabel(theme.mode === 'light' ? 'dark' : 'light')}`
        : `${t('theme.switchTo', 'Switch to')} ${getThemeLabel(nextTheme)}`;

    return (
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
        <div className="bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-lg">
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  };

  // Render content based on variant
  const renderContent = () => {
    const currentIcon = getThemeIcon(theme.mode);
    const currentLabel = getThemeLabel(theme.mode);

    if (variant === 'icon-only' || variant === 'minimal') {
      return (
        <span className="text-lg" role="img" aria-label={currentLabel}>
          {currentIcon}
        </span>
      );
    }

    if (variant === 'compact') {
      return (
        <span className="text-lg" role="img" aria-label={currentLabel}>
          {currentIcon}
        </span>
      );
    }

    return (
      <>
        <span className="text-lg" role="img" aria-label={currentLabel}>
          {currentIcon}
        </span>
        {showLabels && (
          <span className="text-sm font-medium text-[var(--theme-text)]">{currentLabel}</span>
        )}
      </>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className={getVariantStyles()}
        onClick={handleToggle}
        disabled={disabled}
        aria-label={`${t('theme.current', 'Current theme')}: ${getThemeLabel(theme.mode)}`}
        title={
          variant === 'compact' || variant === 'icon-only'
            ? `${t('theme.switchTo', 'Switch to')} ${getThemeLabel(theme.mode === 'light' ? 'dark' : 'light')}`
            : `${t('theme.switchTo', 'Switch to')} ${getThemeLabel(getNextTheme())}`
        }
        onMouseEnter={() => setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        {renderContent()}
      </button>

      {renderTooltip()}
    </div>
  );
};

export default ThemeToggle;
