/**
 * Notification Permission Status Component
 *
 * Displays the current push notification permission status with
 * appropriate actions based on the state.
 *
 * Features:
 * - Visual status indicator
 * - Enable/disable actions
 * - Theme-aware styling
 * - Helpful messages for each state
 *
 * @example
 * ```tsx
 * <NotificationPermissionStatus
 *   status={state.browserPermission}
 *   isFullyEnabled={state.isFullyEnabled}
 *   onEnable={actions.showPrompt}
 *   isLoading={state.isRequesting}
 * />
 * ```
 */

import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import type { PermissionStatusDisplayProps, PushPermissionStatus } from '@/types/pushNotification';

import { Button } from '@/components/ui/atoms';

// =============================================================================
// STATUS CONFIGURATION
// =============================================================================

interface StatusConfig {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  darkBgColor: string;
}

const getStatusConfig = (
  status: PushPermissionStatus,
  isFullyEnabled: boolean,
  t: (key: string, fallback: string) => string
): StatusConfig => {
  if (isFullyEnabled && status === 'granted') {
    return {
      icon: <CheckIcon className="h-5 w-5" />,
      label: t('notifications.status.enabled', 'Enabled'),
      description: t(
        'notifications.status.enabledDescription',
        'You will receive weather alerts and updates'
      ),
      color: '#22c55e',
      bgColor: '#dcfce7',
      darkBgColor: '#14532d',
    };
  }

  switch (status) {
    case 'granted':
      return {
        icon: <CheckIcon className="h-5 w-5" />,
        label: t('notifications.status.granted', 'Permission Granted'),
        description: t(
          'notifications.status.grantedDescription',
          'Notifications are allowed but not fully set up'
        ),
        color: '#22c55e',
        bgColor: '#dcfce7',
        darkBgColor: '#14532d',
      };

    case 'denied':
      return {
        icon: <XMarkIcon className="h-5 w-5" />,
        label: t('notifications.status.blocked', 'Blocked'),
        description: t(
          'notifications.status.blockedDescription',
          'Notifications are blocked. Enable them in your browser settings.'
        ),
        color: '#ef4444',
        bgColor: '#fee2e2',
        darkBgColor: '#7f1d1d',
      };

    case 'unsupported':
      return {
        icon: '!',
        label: t('notifications.status.unsupported', 'Not Supported'),
        description: t(
          'notifications.status.unsupportedDescription',
          'Your browser does not support push notifications'
        ),
        color: '#6b7280',
        bgColor: '#f3f4f6',
        darkBgColor: '#374151',
      };

    case 'default':
    default:
      return {
        icon: '🔔',
        label: t('notifications.status.notEnabled', 'Not Enabled'),
        description: t(
          'notifications.status.notEnabledDescription',
          'Enable notifications to receive weather alerts'
        ),
        color: '#f59e0b',
        bgColor: '#fef3c7',
        darkBgColor: '#78350f',
      };
  }
};

// =============================================================================
// SIZE VARIANTS
// =============================================================================

const sizeClasses = {
  sm: {
    container: 'p-3',
    icon: 'w-8 h-8 text-sm',
    title: 'text-sm font-medium',
    description: 'text-xs',
    button: 'sm' as const,
  },
  md: {
    container: 'p-4',
    icon: 'w-10 h-10 text-base',
    title: 'text-base font-medium',
    description: 'text-sm',
    button: 'md' as const,
  },
  lg: {
    container: 'p-5',
    icon: 'w-12 h-12 text-lg',
    title: 'text-lg font-semibold',
    description: 'text-base',
    button: 'lg' as const,
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export const NotificationPermissionStatus: React.FC<PermissionStatusDisplayProps> = ({
  status,
  isFullyEnabled,
  onEnable,
  onOpenSettings,
  isLoading = false,
  size = 'md',
  showDetails = true,
}) => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const isDark = theme.isDark;

  const config = getStatusConfig(status, isFullyEnabled, t);
  const sizeConfig = sizeClasses[size];

  const canEnable = status === 'default' || (status === 'granted' && !isFullyEnabled);
  const isBlocked = status === 'denied';

  return (
    <div
      className={`rounded-lg ${sizeConfig.container} transition-colors duration-200`}
      style={{
        backgroundColor: isDark ? config.darkBgColor : config.bgColor,
        border: `1px solid ${config.color}20`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div
          className={`flex-shrink-0 rounded-full flex items-center justify-center ${sizeConfig.icon}`}
          style={{
            backgroundColor: `${config.color}20`,
            color: config.color,
          }}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={sizeConfig.title} style={{ color: isDark ? '#f9fafb' : '#111827' }}>
            {config.label}
          </h4>

          {showDetails && (
            <p
              className={`${sizeConfig.description} mt-1`}
              style={{ color: isDark ? '#d1d5db' : '#6b7280' }}
            >
              {config.description}
            </p>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            {canEnable && onEnable && (
              <Button
                variant="primary"
                size={sizeConfig.button}
                onClick={onEnable}
                loading={isLoading}
                loadingText={t('notifications.status.enabling', 'Enabling...')}
              >
                {status === 'granted'
                  ? t('notifications.status.completeSetup', 'Complete Setup')
                  : t('notifications.status.enable', 'Enable Notifications')}
              </Button>
            )}

            {isBlocked && onOpenSettings && (
              <Button variant="outline" size={sizeConfig.button} onClick={onOpenSettings}>
                {t('notifications.status.openSettings', 'Open Browser Settings')}
              </Button>
            )}

            {isFullyEnabled && status === 'granted' && (
              <span
                className={`inline-flex items-center gap-1 ${sizeConfig.description}`}
                style={{ color: config.color }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {t('notifications.status.allSet', 'All set!')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionStatus;
