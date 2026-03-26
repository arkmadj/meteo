import {
  PreferenceAwareClasses,
  useUserPreferencesContext,
} from '@/contexts/UserPreferencesContext';
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import React, { forwardRef } from 'react';

/**
 * Preference-aware button component
 */
interface PreferenceAwareButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const PreferenceAwareButton = forwardRef<HTMLButtonElement, PreferenceAwareButtonProps>(
  (
    { className = '', variant = 'primary', size = 'md', loading = false, children, ...props },
    ref
  ) => {
    const { getAnimationDuration, shouldUseReducedAnimations } = useUserPreferencesContext();

    const baseClasses = `
      inline-flex items-center justify-center font-medium rounded-md
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200 ease-in-out
      ${size === 'sm' ? 'px-3 py-1.5 text-sm' : ''}
      ${size === 'md' ? 'px-4 py-2 text-sm' : ''}
      ${size === 'lg' ? 'px-6 py-3 text-base' : ''}
      ${variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' : ''}
      ${variant === 'secondary' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500' : ''}
      ${variant === 'ghost' ? 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500' : ''}
    `;

    const reducedMotionClasses = 'transition-none';
    const saveDataClasses = 'transition-opacity'; // Simpler transitions
    const highContrastClasses = 'border-2 border-current';
    const touchClasses = 'min-h-[44px] min-w-[44px]'; // Larger touch targets

    return (
      <PreferenceAwareClasses
        baseClasses={baseClasses}
        reducedMotionClasses={reducedMotionClasses}
        saveDataClasses={saveDataClasses}
        highContrastClasses={highContrastClasses}
        touchClasses={touchClasses}
      >
        {classes => (
          <button
            ref={ref}
            className={`${classes} ${className}`}
            disabled={loading || props.disabled}
            style={{
              animationDuration: shouldUseReducedAnimations()
                ? '0ms'
                : `${getAnimationDuration(200)}ms`,
            }}
            {...props}
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                style={{
                  animationDuration: shouldUseReducedAnimations() ? '0ms' : '1s',
                }}
                fill="none"
                viewBox="0 0 24 24"
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
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {children}
          </button>
        )}
      </PreferenceAwareClasses>
    );
  }
);

PreferenceAwareButton.displayName = 'PreferenceAwareButton';

/**
 * Preference-aware card component
 */
interface PreferenceAwareCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  interactive?: boolean;
}

export const PreferenceAwareCard = forwardRef<HTMLDivElement, PreferenceAwareCardProps>(
  ({ className = '', hover = false, interactive = false, children, ...props }, ref) => {
    const { shouldUseReducedAnimations: _shouldUseReducedAnimations, preferences: _preferences } =
      useUserPreferencesContext();

    const baseClasses = `
      bg-white rounded-lg shadow-sm border border-gray-200
      ${hover ? 'hover:shadow-md hover:border-gray-300' : ''}
      ${interactive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500' : ''}
      transition-all duration-200 ease-in-out
    `;

    const reducedMotionClasses = 'transition-none hover:shadow-sm';
    const saveDataClasses = 'transition-shadow'; // Only shadow transitions
    const highContrastClasses = 'border-2 border-gray-800';
    const darkModeClasses = 'bg-gray-800 border-gray-700 text-white';
    const touchClasses = interactive ? 'min-h-[44px]' : '';

    return (
      <PreferenceAwareClasses
        baseClasses={baseClasses}
        reducedMotionClasses={reducedMotionClasses}
        saveDataClasses={saveDataClasses}
        highContrastClasses={highContrastClasses}
        darkModeClasses={darkModeClasses}
        touchClasses={touchClasses}
      >
        {classes => (
          <div
            ref={ref}
            className={`${classes} ${className}`}
            tabIndex={interactive ? 0 : undefined}
            role={interactive ? 'button' : undefined}
            {...props}
          >
            {children}
          </div>
        )}
      </PreferenceAwareClasses>
    );
  }
);

PreferenceAwareCard.displayName = 'PreferenceAwareCard';

/**
 * Preference-aware modal/dialog component
 */
interface PreferenceAwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PreferenceAwareModal: React.FC<PreferenceAwareModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
}) => {
  const { shouldUseReducedAnimations, getAnimationDuration, preferences } =
    useUserPreferencesContext();

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const overlayClasses = `
    fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50
    ${shouldUseReducedAnimations() ? '' : 'animate-fadeIn'}
  `;

  const modalClasses = `
    bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-auto
    ${shouldUseReducedAnimations() ? '' : 'animate-slideUp'}
    ${preferences.prefersHighContrast ? 'border-4 border-black' : ''}
    ${preferences.colorScheme === 'dark' ? 'bg-gray-800 text-white' : ''}
  `;

  return (
    <div
      className={overlayClasses}
      onClick={onClose}
      style={{
        animationDuration: shouldUseReducedAnimations() ? '0ms' : `${getAnimationDuration(200)}ms`,
      }}
    >
      <div
        className={modalClasses}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        style={{
          animationDuration: shouldUseReducedAnimations()
            ? '0ms'
            : `${getAnimationDuration(300)}ms`,
        }}
      >
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg font-semibold">
              {title}
            </h2>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/**
 * Preference-aware loading spinner
 */
interface PreferenceAwareSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PreferenceAwareSpinner: React.FC<PreferenceAwareSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const { shouldUseReducedAnimations, preferences: _preferences } = useUserPreferencesContext();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  if (shouldUseReducedAnimations()) {
    // Show a static indicator instead of spinning animation
    return (
      <div
        className={`${sizeClasses[size]} ${className} rounded-full border-2 border-gray-300 border-t-blue-600`}
        role="status"
        aria-label="Loading"
      />
    );
  }

  return (
    <svg
      className={`${sizeClasses[size]} ${className} animate-spin`}
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * Preference-aware image component
 */
interface PreferenceAwareImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  lowQualitySrc?: string;
  mediumQualitySrc?: string;
  highQualitySrc?: string;
  fallbackSrc?: string;
}

export const PreferenceAwareImage = forwardRef<HTMLImageElement, PreferenceAwareImageProps>(
  (
    {
      src,
      lowQualitySrc,
      mediumQualitySrc,
      highQualitySrc,
      fallbackSrc,
      alt,
      className = '',
      ...props
    },
    ref
  ) => {
    const { getImageQuality, preferences } = useUserPreferencesContext();

    const getOptimalSrc = () => {
      const quality = getImageQuality();

      switch (quality) {
        case 'low':
          return lowQualitySrc || src;
        case 'medium':
          return mediumQualitySrc || src;
        case 'high':
          return highQualitySrc || src;
        default:
          return src;
      }
    };

    const imageClasses = `
      ${className}
      ${preferences.prefersReducedMotion ? '' : 'transition-opacity duration-300'}
      ${preferences.prefersHighContrast ? 'contrast-125' : ''}
    `;

    return (
      <img
        ref={ref}
        src={getOptimalSrc()}
        alt={alt}
        className={imageClasses}
        loading={preferences.saveData ? 'lazy' : 'eager'}
        onError={e => {
          if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
            e.currentTarget.src = fallbackSrc;
          }
        }}
        {...props}
      />
    );
  }
);

PreferenceAwareImage.displayName = 'PreferenceAwareImage';

export default {
  PreferenceAwareButton,
  PreferenceAwareCard,
  PreferenceAwareModal,
  PreferenceAwareSpinner,
  PreferenceAwareImage,
};
