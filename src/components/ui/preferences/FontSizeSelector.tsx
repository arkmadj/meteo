import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/design-system/theme';

export interface FontSizeSelectorProps {
  /** Current font size */
  fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Function to change font size */
  onFontSizeChange: (fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => void;
  /** Component variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Show size labels */
  showLabels?: boolean;
  /** Show description of sizes */
  showDescriptions?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Loading state for smooth transitions */
  loading?: boolean;
}

type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Font size metadata for display and translation
const FONT_SIZE_METADATA: Record<
  FontSize,
  { labelKey: string; fallbackLabel: string; descriptionKey: string; scale: number }
> = {
  xs: {
    labelKey: 'common:settings.options.fontSize.xs',
    fallbackLabel: 'XS',
    descriptionKey: 'common:settings.options.fontSize.xsDescription',
    scale: 0.75,
  },
  sm: {
    labelKey: 'common:settings.options.fontSize.sm',
    fallbackLabel: 'SM',
    descriptionKey: 'common:settings.options.fontSize.smDescription',
    scale: 0.875,
  },
  md: {
    labelKey: 'common:settings.options.fontSize.md',
    fallbackLabel: 'MD',
    descriptionKey: 'common:settings.options.fontSize.mdDescription',
    scale: 1,
  },
  lg: {
    labelKey: 'common:settings.options.fontSize.lg',
    fallbackLabel: 'LG',
    descriptionKey: 'common:settings.options.fontSize.lgDescription',
    scale: 1.125,
  },
  xl: {
    labelKey: 'common:settings.options.fontSize.xl',
    fallbackLabel: 'XL',
    descriptionKey: 'common:settings.options.fontSize.xlDescription',
    scale: 1.25,
  },
};

// Component variant styles
const getVariantStyles = (_theme: unknown) => ({
  default: {
    container: 'bg-[var(--theme-surface)] border border-[var(--theme-border)] p-1 shadow-sm',
    button: 'px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
    sizeText: 'text-lg font-semibold',
    labelText: 'text-xs',
  },
  compact: {
    container:
      'bg-[var(--theme-surface)] border border-[var(--theme-border-light)] p-0.5 rounded-md',
    button: 'px-2 py-1 text-xs font-medium rounded transition-all duration-200',
    sizeText: 'text-sm font-semibold',
    labelText: 'text-xs',
  },
  detailed: {
    container:
      'bg-[var(--theme-surface)] border border-[var(--theme-border)] p-2 shadow-md rounded-lg',
    button:
      'px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex flex-col items-center',
    sizeText: 'text-xl font-bold',
    labelText: 'text-xs mt-1',
  },
});

const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
  fontSize,
  onFontSizeChange,
  variant = 'default',
  showLabels = true,
  showDescriptions = false,
  disabled = false,
  className = '',
  loading = false,
}) => {
  const { t } = useTranslation(['common']);
  const { theme, accentColor } = useTheme();
  const [hoveredSize, setHoveredSize] = useState<FontSize | null>(null);

  const styles = getVariantStyles(theme)[variant];

  const handleFontSizeChange = (size: FontSize) => {
    if (!disabled && !loading) {
      onFontSizeChange(size);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, size: FontSize) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFontSizeChange(size);
    }
  };

  return (
    <div
      className={`
        inline-flex rounded-lg transition-all duration-200
        ${styles.container}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${loading ? 'animate-pulse' : ''}
        ${className}
      `}
      role="radiogroup"
      aria-label={t('common:settings.options.fontSize.label')}
    >
      {(Object.keys(FONT_SIZE_METADATA) as FontSize[]).map(size => {
        const metadata = FONT_SIZE_METADATA[size];
        const isActive = fontSize === size;
        const isHovered = hoveredSize === size;

        return (
          <button
            key={size}
            className={`
              ${styles.button}
              ${
                isActive
                  ? 'bg-[var(--theme-accent)] text-white shadow-sm'
                  : 'text-[var(--theme-text)] hover:bg-[var(--theme-hover)]'
              }
              ${!disabled && !loading ? 'cursor-pointer' : 'cursor-not-allowed'}
              ${isHovered && !isActive ? 'bg-[var(--theme-hover)]' : ''}
              focus-visible:outline-2 focus-visible:outline-[var(--theme-accent)] focus-visible:outline-offset-2
            `}
            onClick={() => handleFontSizeChange(size)}
            onKeyDown={e => handleKeyDown(e, size)}
            onMouseEnter={() => setHoveredSize(size)}
            onMouseLeave={() => setHoveredSize(null)}
            role="radio"
            aria-checked={isActive}
            aria-label={`${t(metadata.labelKey, { fallback: metadata.fallbackLabel })} ${isActive ? t('common:settings.options.fontSize.currentSelection') : ''}`}
            tabIndex={isActive ? 0 : -1}
            style={
              {
                '--theme-accent': accentColor,
                '--theme-accent-hover': `color-mix(in srgb, ${accentColor} 85%, black)`,
              } as React.CSSProperties
            }
          >
            <span
              className={`${styles.sizeText} ${isActive ? 'text-white' : 'text-[var(--theme-text)]'}`}
              style={{ fontSize: `${metadata.scale}rem` }}
            >
              Aa
            </span>

            {showLabels && (
              <span
                className={`mt-1 ${styles.labelText} ${isActive ? 'text-white' : 'text-[var(--theme-text-secondary)]'}`}
              >
                {t(metadata.labelKey, { fallback: metadata.fallbackLabel })}
              </span>
            )}

            {showDescriptions && (
              <span
                className={`text-xs mt-1 block max-w-xs ${isActive ? 'text-white' : 'text-[var(--theme-text-secondary)]'}`}
              >
                {t(metadata.descriptionKey, { fallback: '' })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FontSizeSelector;
