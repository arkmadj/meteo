/**
 * Enhanced Search Input Component
 * A redesigned search input with cleaner UI and better UX
 */

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import { BORDER_RADIUS } from '@/design-system/tokens';

import type { BaseComponentProps } from '../base/BaseComponent';
import { useComponentState } from '../base/BaseComponent';

export type SearchInputSize = 'sm' | 'md' | 'lg' | 'xl';
export type SearchInputVariant = 'default' | 'filled' | 'outlined';

export interface SearchInputProps
  extends Omit<BaseComponentProps, 'variant'>,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Search input variant */
  variant?: SearchInputVariant;
  /** Search input size */
  size?: SearchInputSize;
  /** Placeholder text */
  placeholder?: string;
  /** Input value */
  value?: string;
  /** Whether the input is loading */
  loading?: boolean;
  /** Whether to show clear button */
  clearable?: boolean;
  /** Clear button callback */
  onClear?: () => void;
  /** Search button callback */
  onSearch?: (value: string) => void;
  /** Focus callback */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Blur callback */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Change callback */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Key down callback */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Whether to show search suggestions */
  showSuggestions?: boolean;
  /** Suggestions dropdown content */
  suggestionsContent?: React.ReactNode;
  /** Custom search icon */
  searchIcon?: React.ReactNode;
  /** Custom clear icon */
  clearIcon?: React.ReactNode;
  /** Use Current Location button callback */
  onUseCurrentLocation?: () => void;
  /** Whether Use Current Location is supported */
  useCurrentLocationSupported?: boolean;
  /** Loading state for Use Current Location */
  useCurrentLocationLoading?: boolean;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      variant = 'filled',
      size = 'lg',
      placeholder,
      value = '',
      loading = false,
      clearable = true,
      onClear,
      onSearch,
      onFocus,
      onBlur,
      onChange,
      onKeyDown,
      showSuggestions = false,
      suggestionsContent,
      searchIcon,
      clearIcon,
      disabled,
      className = '',
      testId,
      onUseCurrentLocation,
      useCurrentLocationSupported = false,
      useCurrentLocationLoading = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const { t } = useTranslation();

    const { isDisabled } = useComponentState({
      disabled,
      testId,
    });

    // Sync internal value with prop value
    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    // ============================================================================
    // STYLING
    // ============================================================================

    const baseClasses = [
      'relative',
      'w-full',
      'transition-all',
      'duration-200',
      'ease-in-out',
    ].join(' ');

    const variantClasses: Record<SearchInputVariant, string> = {
      default: [
        'bg-[var(--theme-surface)]',
        'border-[var(--theme-border)]',
        'border',
        'focus-within:border-[var(--theme-primary)]',
        'focus-within:ring-2',
        'focus-within:ring-[var(--theme-primary)]/20',
        'hover:border-[var(--theme-border-light)]',
        'shadow-[0_1px_2px_var(--theme-shadow)]',
        'focus-within:shadow-[0_4px_6px_var(--theme-shadow)]',
      ].join(' '),

      filled: [
        'bg-[var(--theme-hover)]',
        'border',
        'border-transparent',
        'focus-within:bg-[var(--theme-surface)]',
        'focus-within:border-[var(--theme-primary)]',
        'focus-within:ring-2',
        'focus-within:ring-[var(--theme-primary)]/20',
        'hover:bg-[var(--theme-active)]',
        'shadow-[0_1px_2px_var(--theme-shadow)]',
        'focus-within:shadow-[0_4px_6px_var(--theme-shadow)]',
        'rounded-full',
      ].join(' '),

      outlined: [
        'bg-transparent',
        'border-2',
        'border-[var(--theme-border)]',
        'focus-within:border-[var(--theme-primary)]',
        'focus-within:ring-2',
        'focus-within:ring-[var(--theme-primary)]/20',
        'hover:border-[var(--theme-border-light)]',
      ].join(' '),
    };

    const sizeClasses: Record<SearchInputSize, { container: string; input: string; icon: string }> =
      {
        sm: {
          container: `rounded-[${BORDER_RADIUS.md}] h-10`,
          input: 'px-10 py-2 text-sm',
          icon: 'w-4 h-4',
        },
        md: {
          container: `rounded-[${BORDER_RADIUS.lg}] h-12`,
          input: 'px-12 py-3 text-base',
          icon: 'w-5 h-5',
        },
        lg: {
          container: `rounded-[${BORDER_RADIUS.xl}] h-14`,
          input: 'px-14 py-4 text-lg',
          icon: 'w-6 h-6',
        },
        xl: {
          container: `rounded-[${BORDER_RADIUS?.['2xl']}] h-16`,
          input: 'px-16 py-5 text-xl',
          icon: 'w-7 h-7',
        },
      };

    const inputClasses = [
      'w-full',
      'bg-transparent',
      'border-0',
      'outline-none',
      'placeholder-[var(--theme-text-secondary)]',
      'text-[var(--theme-text)]',
      'font-medium',
      sizeClasses?.[size].input,
    ].join(' ');

    const iconClasses = [
      'absolute',
      'top-1/2',
      'transform',
      '-translate-y-1/2',
      'text-[var(--theme-text-secondary)]',
      'transition-colors',
      'duration-200',
      sizeClasses?.[size].icon,
    ].join(' ');

    const containerClasses = [
      baseClasses,
      variantClasses?.[variant],
      sizeClasses?.[size].container,
      isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text',
      isFocused ? 'ring-2 ring-[var(--theme-primary)]/20' : '',
      className,
    ].join(' ');

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSearch?.(internalValue);
      }
      onKeyDown?.(e);
    };

    const handleClear = () => {
      setInternalValue('');
      onClear?.();
      // Focus back to input after clearing
      if (ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
    };

    const handleSearchClick = () => {
      onSearch?.(internalValue);
    };

    const handleContainerClick = () => {
      if (ref && 'current' in ref && ref.current && !isDisabled) {
        ref.current.focus();
      }
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    const showClearButton = clearable && internalValue.length > 0 && !loading;
    const showUseCurrentLocationButton =
      useCurrentLocationSupported && typeof onUseCurrentLocation === 'function';

    const isLocationButtonDisabled = isDisabled || loading || useCurrentLocationLoading;

    return (
      <div className="relative w-full">
        {/* Main Input Container */}
        <div
          ref={containerRef}
          className={containerClasses}
          data-testid={testId}
          onClick={handleContainerClick}
        >
          {/* Search Icon */}
          <div className={`${iconClasses} left-4`}>
            {searchIcon || (
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          {/* Input Field */}
          <input
            ref={ref}
            className={inputClasses}
            disabled={isDisabled}
            placeholder={placeholder || t('search.placeholder')}
            type="text"
            value={internalValue}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            {...props}
          />

          {/* Right Side Icons */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {/* Loading Spinner */}
            {loading && (
              <div
                className={`${sizeClasses?.[size].icon} text-[var(--theme-text-secondary)] flex-shrink-0`}
              >
                <svg
                  className="animate-spin w-full h-full"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            )}

            {/* Use Current Location Button */}
            {showUseCurrentLocationButton && (
              <button
                aria-label={t('search.useCurrentLocation')}
                title={t('search.useCurrentLocationTooltip')}
                className={`
                  ${sizeClasses?.[size].icon}
                  text-[var(--theme-text-secondary)]
                  hover:text-[var(--theme-text)]
                  transition-colors
                  duration-200
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[var(--theme-primary)]/30
                  focus:ring-offset-1
                  rounded-sm
                  flex-shrink-0
                  flex
                  items-center
                  justify-center
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                `}
                disabled={isLocationButtonDisabled}
                type="button"
                onClick={() => {
                  if (!isLocationButtonDisabled) {
                    onUseCurrentLocation?.();
                  }
                }}
              >
                {useCurrentLocationLoading ? (
                  <svg
                    className="animate-spin w-full h-full"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-full h-full"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2a7 7 0 0 0-7 7c0 5.25 7 11 7 11s7-5.75 7-11a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
            )}

            {/* Clear Button */}
            {showClearButton && (
              <button
                className={`
                  ${sizeClasses?.[size].icon}
                  text-[var(--theme-text-secondary)]
                  hover:text-[var(--theme-text)]
                  transition-colors
                  duration-200
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[var(--theme-primary)]/30
                  focus:ring-offset-1
                  rounded-sm
                  flex-shrink-0
                  flex
                  items-center
                  justify-center
                `}
                type="button"
                onClick={handleClear}
              >
                {clearIcon || (
                  <svg
                    className="w-full h-full"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )}

            {/* Search Button (for larger sizes) */}
            {(size === 'lg' || size === 'xl') && !loading && (
              <button
                className={`
                  px-4 py-2
                  bg-[var(--theme-primary)]
                  hover:bg-[var(--theme-primary)]/90
                  text-white
                  rounded-full
                  transition-colors
                  duration-200
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[var(--theme-primary)]/30
                  focus:ring-offset-2
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                `}
                disabled={isDisabled || !internalValue.trim()}
                type="button"
                onClick={handleSearchClick}
              >
                <span className="text-sm font-medium">Search</span>
              </button>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestionsContent && (
          <div className="absolute z-50 w-full mt-2">{suggestionsContent}</div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
