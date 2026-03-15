/**
 * MapLoadingOverlay Component
 *
 * Loading overlay for map tiles and weather layers with progress indication
 * and error handling.
 */

import React from 'react';

import { useTheme } from '@/design-system/theme';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface MapLoadingOverlayProps {
  /** Current loading state */
  state: LoadingState;
  /** Loading message */
  message?: string;
  /** Error message */
  errorMessage?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Show progress bar */
  showProgress?: boolean;
  /** Retry callback for errors */
  onRetry?: () => void;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Position on the map */
  position?: 'center' | 'top' | 'bottom';
  /** Compact mode */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * MapLoadingOverlay Component
 */
const MapLoadingOverlay: React.FC<MapLoadingOverlayProps> = ({
  state,
  message = 'Loading map data...',
  errorMessage = 'Failed to load map data',
  progress = 0,
  showProgress = false,
  onRetry,
  onDismiss,
  position = 'center',
  compact = false,
  className = '',
}) => {
  const { theme } = useTheme();

  const isDark = theme.isDark;
  const bgColor = isDark ? 'bg-gray-800/95' : 'bg-white/95';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const secondaryTextColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const progressBarBgColor = isDark ? '#374151' : '#e5e7eb';
  const spinnerBorderColor = isDark ? '#1f2937' : '#dbeafe';
  const spinnerBorderTopColor = theme.accentColor;

  if (state === 'idle' || state === 'success') return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div
      className={`absolute ${getPositionClasses()} z-[2000] ${className}`}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className={`${bgColor} ${borderColor} rounded-lg shadow-2xl border-2 backdrop-blur-sm ${
          compact ? 'p-3' : 'p-4'
        } ${compact ? 'min-w-[200px]' : 'min-w-[280px]'} max-w-[400px]`}
      >
        {/* Loading State */}
        {state === 'loading' && (
          <div className="space-y-3">
            {/* Spinner and Message */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div
                  className="w-8 h-8 border-4 rounded-full animate-spin"
                  style={{
                    borderColor: spinnerBorderColor,
                    borderTopColor: spinnerBorderTopColor,
                  }}
                />
              </div>
              <div className="flex-1">
                <div className={`${compact ? 'text-sm' : 'text-base'} font-medium ${textColor}`}>
                  {message}
                </div>
                {showProgress && (
                  <div className={`text-xs ${secondaryTextColor} mt-1`}>
                    {progress.toFixed(0)}% complete
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {showProgress && (
              <div
                className="w-full rounded-full h-2 overflow-hidden"
                style={{ backgroundColor: progressBarBgColor }}
              >
                <div
                  className="h-full transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    backgroundColor: theme.accentColor,
                  }}
                />
              </div>
            )}

            {/* Dismiss Button */}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`text-xs ${secondaryTextColor} hover:${textColor} transition-colors underline`}
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="space-y-3">
            {/* Error Icon and Message */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div
                  className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-red-600 dark:text-red-400`}
                >
                  Error Loading Map
                </div>
                <div className={`text-sm ${secondaryTextColor} mt-1`}>{errorMessage}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: theme.accentColor,
                  }}
                >
                  Retry
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`flex-1 px-4 py-2 ${bgColor} hover:bg-gray-100 dark:hover:bg-gray-700 ${textColor} rounded-lg text-sm font-medium transition-colors border ${borderColor}`}
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapLoadingOverlay;
