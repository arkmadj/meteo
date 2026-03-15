/**
 * Push Notification Banner
 *
 * A dismissible banner component for prompting users to enable push notifications.
 * Less intrusive than a modal, suitable for subtle permission prompts.
 *
 * Features:
 * - Animated entrance/exit
 * - Top or bottom positioning
 * - Theme-aware styling
 * - Dismissible with optional "don't show again" option
 * - Loading state during permission request
 *
 * @example
 * ```tsx
 * <PushNotificationBanner
 *   isVisible={showBanner}
 *   onEnable={acceptConsent}
 *   onDismiss={postponeConsent}
 *   onDontShowAgain={neverAskAgain}
 *   position="bottom"
 * />
 * ```
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import type { PermissionBannerProps } from '@/types/pushNotification';

import { Button } from '@/components/ui/atoms';

// =============================================================================
// COMPONENT
// =============================================================================

export const PushNotificationBanner: React.FC<PermissionBannerProps> = ({
  isVisible,
  onEnable,
  onDismiss,
  onDontShowAgain,
  isLoading = false,
  position = 'bottom',
  message,
}) => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const isDark = theme.isDark;

  // Handle mount/unmount animation
  useEffect(() => {
    if (isVisible) {
      setIsMounted(true);
      // Small delay to ensure CSS transition works
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isMounted) return null;

  const bannerMessage =
    message ||
    t(
      'notifications.banner.message',
      'Enable notifications to receive weather alerts and updates'
    );

  const positionClasses = position === 'top' ? 'top-0' : 'bottom-0';
  const translateClass = position === 'top'
    ? (isAnimating ? 'translate-y-0' : '-translate-y-full')
    : (isAnimating ? 'translate-y-0' : 'translate-y-full');

  const bannerContent = (
    <div
      className={`fixed left-0 right-0 z-50 ${positionClasses} transform transition-transform duration-300 ease-out ${translateClass}`}
      role="alert"
      aria-live="polite"
    >
      <div
        className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8"
        style={{
          backgroundColor: isDark ? '#1e3a5f' : '#dbeafe',
          borderBottom: position === 'top' ? `1px solid ${isDark ? '#2563eb' : '#93c5fd'}` : 'none',
          borderTop: position === 'bottom' ? `1px solid ${isDark ? '#2563eb' : '#93c5fd'}` : 'none',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Icon and Message */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: isDark ? '#2563eb' : '#3b82f6',
                color: 'white',
              }}
            >
              🔔
            </span>
            <p
              className="text-sm font-medium truncate"
              style={{ color: isDark ? '#e0f2fe' : '#1e40af' }}
            >
              {bannerMessage}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Enable button */}
            <Button
              variant="primary"
              size="sm"
              onClick={onEnable}
              loading={isLoading}
              loadingText={t('notifications.banner.enabling', 'Enabling...')}
            >
              {t('notifications.banner.enable', 'Enable')}
            </Button>

            {/* Dismiss button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              disabled={isLoading}
              aria-label={t('notifications.banner.dismiss', 'Dismiss')}
            >
              <span className="sr-only">{t('notifications.banner.dismiss', 'Dismiss')}</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* "Don't show again" option */}
        {onDontShowAgain && (
          <div className="mt-2 text-right">
            <button
              onClick={onDontShowAgain}
              disabled={isLoading}
              className="text-xs hover:underline transition-colors"
              style={{ color: isDark ? '#93c5fd' : '#3b82f6' }}
            >
              {t('notifications.banner.dontShowAgain', "Don't show again")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render via portal
  if (typeof document === 'undefined') {
    return bannerContent;
  }

  return createPortal(bannerContent, document.body);
};

export default PushNotificationBanner;
