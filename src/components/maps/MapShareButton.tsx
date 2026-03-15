/**
 * Map Share Button Component
 * Allows users to copy shareable URL for current map view
 *
 * Features:
 * - Native Web Share API support with fallback to clipboard
 * - Secure context validation
 * - Comprehensive error handling
 * - Accessibility support
 * - Theme-aware styling
 */

import { useSnackbar } from '@/contexts/SnackbarContext';
import { useTheme } from '@/design-system/theme';
import { useMapUrlSync } from '@/hooks/useMapUrlSync';
import React, { useCallback, useState } from 'react';

export interface MapShareButtonProps {
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost';

  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Show label text
   * @default true
   */
  showLabel?: boolean;

  /**
   * Custom label text
   */
  label?: string;

  /**
   * Callback when URL is copied
   */
  onCopy?: (url: string) => void;
}

/**
 * Validates if a URL is valid and can be shared
 */
function isValidShareUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks if the browser supports the Web Share API
 */
function supportsWebShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator;
}

/**
 * Checks if the current context is secure (HTTPS or localhost)
 */
function isSecureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext;
}

/**
 * Checks if the Clipboard API is available
 */
function supportsClipboardApi(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'clipboard' in navigator &&
    'writeText' in navigator.clipboard
  );
}

const MapShareButton: React.FC<MapShareButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  showLabel = true,
  label = 'Share Map',
  onCopy,
}) => {
  const { getShareableUrl, hasMapParams } = useMapUrlSync();
  const { showSuccess, showError } = useSnackbar();
  const { theme } = useTheme();
  const [isCopying, setIsCopying] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  /**
   * Attempt to share using the native Web Share API
   */
  const tryNativeShare = useCallback(
    async (url: string): Promise<boolean> => {
      if (!supportsWebShare()) {
        return false;
      }

      try {
        const shareData = {
          title: 'Weather Map View',
          text: 'Check out this weather map view',
          url: url,
        };

        // Validate that the share data can be shared
        if (!navigator.canShare(shareData)) {
          return false;
        }

        await navigator.share(shareData);
        showSuccess('Map view shared successfully!');
        onCopy?.(url);
        return true;
      } catch (error) {
        // User cancelled (AbortError) - don't log as error
        if ((error as Error).name === 'AbortError') {
          return false;
        }
        // Other errors will be handled by clipboard fallback
        console.warn('Native share failed, falling back to clipboard:', error);
        return false;
      }
    },
    [showSuccess, onCopy]
  );

  /**
   * Attempt to copy URL to clipboard
   */
  const tryClipboardCopy = useCallback(
    async (url: string): Promise<boolean> => {
      if (!supportsClipboardApi()) {
        return false;
      }

      if (!isSecureContext()) {
        console.warn('Clipboard API requires secure context (HTTPS or localhost)');
        return false;
      }

      try {
        await navigator.clipboard.writeText(url);
        showSuccess('Map URL copied to clipboard!');
        onCopy?.(url);
        return true;
      } catch (error) {
        console.error('Clipboard copy failed:', error);
        return false;
      }
    },
    [showSuccess, onCopy]
  );

  /**
   * Fallback: Copy to clipboard using deprecated method
   */
  const tryLegacyCopy = useCallback(
    (url: string): boolean => {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (success) {
          showSuccess('Map URL copied to clipboard!');
          onCopy?.(url);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Legacy copy failed:', error);
        return false;
      }
    },
    [showSuccess, onCopy]
  );

  /**
   * Main share handler with fallback chain
   */
  const handleShare = useCallback(async () => {
    // Prevent multiple concurrent requests
    if (isCopying) {
      return;
    }

    try {
      setIsCopying(true);
      setLastError(null);

      const url = getShareableUrl();

      // Validate URL before attempting to share
      if (!isValidShareUrl(url)) {
        setLastError('Invalid map URL');
        showError('Unable to generate a valid map URL. Please try again.');
        return;
      }

      // Try native share first
      const nativeShareSuccess = await tryNativeShare(url);
      if (nativeShareSuccess) {
        return;
      }

      // Try modern clipboard API
      const clipboardSuccess = await tryClipboardCopy(url);
      if (clipboardSuccess) {
        return;
      }

      // Try legacy copy method
      const legacySuccess = tryLegacyCopy(url);
      if (legacySuccess) {
        return;
      }

      // All methods failed
      const errorMsg =
        'Unable to copy URL. Your browser may not support clipboard operations. Please try a different browser or manually copy the URL from the address bar.';
      setLastError(errorMsg);
      showError(errorMsg);
    } catch (error) {
      const errorMsg = `Failed to share map: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setLastError(errorMsg);
      console.error('Share handler error:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setIsCopying(false);
    }
  }, [isCopying, getShareableUrl, tryNativeShare, tryClipboardCopy, tryLegacyCopy, showError]);

  // Variant styles with theme awareness
  const variantStyles = {
    primary: `text-white transition-opacity hover:opacity-90`,
    secondary: `text-white transition-opacity hover:opacity-90`,
    ghost: `transition-colors border`,
  };

  // Theme-aware variant colors
  const variantColors = {
    primary: {
      backgroundColor: theme.accentColor,
      borderColor: theme.accentColor,
    },
    secondary: {
      backgroundColor: theme.isDark ? '#4b5563' : '#6b7280',
      borderColor: theme.isDark ? '#4b5563' : '#6b7280',
    },
    ghost: {
      backgroundColor: theme.isDark ? '#1f2937' : '#ffffff',
      color: theme.isDark ? '#f3f4f6' : '#111827',
      borderColor: theme.isDark ? '#374151' : '#d1d5db',
    },
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const isDisabled = isCopying || !hasMapParams;
  const buttonLabel = isCopying ? 'Copying...' : label;
  const buttonTitle = hasMapParams
    ? lastError || 'Share current map view'
    : 'Move the map to enable sharing';

  return (
    <button
      onClick={handleShare}
      disabled={isDisabled}
      className={`
        inline-flex items-center gap-2 rounded-lg font-medium
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      style={{
        ...variantColors[variant],
        outlineColor: theme.accentColor,
      }}
      aria-label={buttonLabel}
      aria-busy={isCopying}
      aria-disabled={isDisabled}
      title={buttonTitle}
    >
      {/* Icon */}
      {isCopying ? (
        <svg
          className={`animate-spin ${iconSizes[size]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
      ) : (
        <svg
          className={iconSizes[size]}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      )}

      {/* Label */}
      {showLabel && <span>{buttonLabel}</span>}
    </button>
  );
};

export default MapShareButton;
