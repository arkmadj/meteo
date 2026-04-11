/**
 * Push Notification Consent Modal
 *
 * An accessible modal dialog that explains push notification benefits
 * and requests user consent before triggering the browser's permission prompt.
 *
 * Features:
 * - Clear explanation of notification benefits
 * - Accept, Decline, and "Ask Later" options
 * - Loading state during permission request
 * - Theme-aware styling
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <PushNotificationConsentModal
 *   isOpen={showPrompt}
 *   onAccept={acceptConsent}
 *   onDecline={declineConsent}
 *   onLater={postponeConsent}
 *   onClose={hidePrompt}
 *   isLoading={state.isRequesting}
 * />
 * ```
 */

import { CheckIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ConsentPromptProps, PushPermissionStatus } from '@/types/pushNotification';

import { Button } from '@/components/ui/atoms';
import { AccessibleModal } from '@/components/ui/molecules/AccessibleModal';

// =============================================================================
// DEFAULT BENEFITS
// =============================================================================

const DEFAULT_BENEFITS = [
  'notifications.consent.benefits.weatherAlerts',
  'notifications.consent.benefits.severeWeather',
  'notifications.consent.benefits.dailyForecast',
  'notifications.consent.benefits.customAlerts',
];

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface BenefitListProps {
  benefits: string[];
}

const BenefitList: React.FC<BenefitListProps> = ({ benefits }) => {
  const { t } = useTranslation('common');

  return (
    <ul className="space-y-2 my-4">
      {benefits.map((benefit, index) => (
        <li
          key={index}
          className="flex items-start gap-2 text-sm"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          <span
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--accent-color, #3b82f6)',
              color: 'white',
            }}
          >
            <CheckIcon className="h-4 w-4" />
          </span>
          <span>{t(benefit, benefit)}</span>
        </li>
      ))}
    </ul>
  );
};

interface PermissionStatusBadgeProps {
  status?: PushPermissionStatus;
}

const PermissionStatusBadge: React.FC<PermissionStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation('common');

  if (!status || status === 'default') return null;

  const statusConfig = {
    granted: {
      label: t('notifications.status.granted', 'Enabled'),
      color: '#22c55e',
      bgColor: '#dcfce7',
    },
    denied: {
      label: t('notifications.status.denied', 'Blocked'),
      color: '#ef4444',
      bgColor: '#fee2e2',
    },
    unsupported: {
      label: t('notifications.status.unsupported', 'Not Supported'),
      color: '#6b7280',
      bgColor: '#f3f4f6',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return null;

  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const PushNotificationConsentModal: React.FC<ConsentPromptProps> = ({
  isOpen,
  onAccept,
  onDecline,
  onLater,
  onNever,
  onClose,
  isLoading = false,
  permissionStatus,
  title,
  description,
  benefits = DEFAULT_BENEFITS,
}) => {
  const { t } = useTranslation('common');

  const modalTitle = title || t('notifications.consent.title', 'Enable Push Notifications');
  const modalDescription =
    description ||
    t(
      'notifications.consent.description',
      'Stay informed about weather changes with timely notifications. We only send relevant alerts.'
    );

  // If permission is already denied, show a different message
  const isDenied = permissionStatus === 'denied';
  const isUnsupported = permissionStatus === 'unsupported';

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="md"
      variant="confirmation"
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="p-6">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: 'var(--accent-color-light, #dbeafe)' }}
          >
            🔔
          </div>
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--theme-text)' }}
              id="consent-modal-title"
            >
              {modalTitle}
            </h2>
            {permissionStatus && <PermissionStatusBadge status={permissionStatus} />}
          </div>
        </div>

        {/* Description */}
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--theme-text-secondary)' }}
          id="consent-modal-description"
        >
          {isDenied
            ? t(
                'notifications.consent.deniedMessage',
                'Notifications are currently blocked. Please enable them in your browser settings to receive weather alerts.'
              )
            : isUnsupported
              ? t(
                  'notifications.consent.unsupportedMessage',
                  'Your browser does not support push notifications. Try using a modern browser like Chrome, Firefox, or Edge.'
                )
              : modalDescription}
        </p>

        {/* Benefits list (only show if not denied/unsupported) */}
        {!isDenied && !isUnsupported && <BenefitList benefits={benefits} />}

        {/* Privacy note */}
        {!isDenied && !isUnsupported && (
          <p className="text-xs mb-6" style={{ color: 'var(--theme-text-tertiary, #9ca3af)' }}>
            {t(
              'notifications.consent.privacy',
              'You can change your notification preferences at any time in Settings.'
            )}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          {/* Show different buttons based on permission state */}
          {isDenied || isUnsupported ? (
            <Button variant="primary" onClick={onClose} size="md">
              {t('notifications.consent.understood', 'Understood')}
            </Button>
          ) : (
            <>
              {/* "Ask Later" button */}
              {onLater && (
                <Button variant="ghost" onClick={onLater} disabled={isLoading} size="md">
                  {t('notifications.consent.later', 'Ask Later')}
                </Button>
              )}

              {/* Decline button */}
              <Button variant="outline" onClick={onDecline} disabled={isLoading} size="md">
                {t('notifications.consent.decline', 'No Thanks')}
              </Button>

              {/* Accept button */}
              <Button
                variant="primary"
                onClick={onAccept}
                loading={isLoading}
                loadingText={t('notifications.consent.enabling', 'Enabling...')}
                size="md"
              >
                {t('notifications.consent.accept', 'Enable Notifications')}
              </Button>
            </>
          )}
        </div>

        {/* "Never ask again" option */}
        {!isDenied && !isUnsupported && onNever && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onNever}
              disabled={isLoading}
              className="text-xs hover:underline transition-colors"
              style={{ color: 'var(--theme-text-tertiary, #9ca3af)' }}
            >
              {t('notifications.consent.never', "Don't ask me again")}
            </button>
          </div>
        )}
      </div>
    </AccessibleModal>
  );
};

export default PushNotificationConsentModal;
