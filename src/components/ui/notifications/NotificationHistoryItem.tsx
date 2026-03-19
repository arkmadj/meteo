/**
 * NotificationHistoryItem Component
 *
 * A reusable component for rendering individual notification items in the history
 * with actions for marking as read, dismissing, and viewing details.
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import { usePrefersReducedMotion } from '@/hooks/useMotion';
import type {
  NotificationCategory,
  NotificationItem,
  NotificationPriority,
} from '@/types/notification';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationHistoryItemProps {
  /** The notification item to display */
  notification: NotificationItem;
  /** Whether the item is selected */
  isSelected?: boolean;
  /** Whether to show selection checkbox */
  showCheckbox?: boolean;
  /** Whether to show the full body content */
  expanded?: boolean;
  /** Callback when notification is clicked */
  onClick?: (notification: NotificationItem) => void;
  /** Callback when marked as read */
  onMarkAsRead?: (id: string) => void;
  /** Callback when dismissed */
  onDismiss?: (id: string) => void;
  /** Callback when selection changes */
  onSelectionChange?: (id: string, selected: boolean) => void;
  /** Callback when expand/collapse is toggled */
  onToggleExpand?: (id: string) => void;
  /** Additional CSS class */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if notification is unread using the isRead field
 */
function isUnread(notification: NotificationItem): boolean {
  return !notification.isRead;
}

/**
 * Get icon for notification category
 */
function getCategoryIcon(category: NotificationCategory): string {
  const icons: Record<NotificationCategory, string> = {
    'weather-alert': '⚠️',
    'weather-update': '🌤️',
    forecast: '📅',
    system: '⚙️',
    reminder: '🔔',
    promotional: '🎁',
  };
  return icons[category] || '📢';
}

/**
 * Get badge color for priority
 */
function getPriorityColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    urgent: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    normal: 'bg-blue-500 text-white',
    low: 'bg-gray-400 text-white',
  };
  return colors[priority];
}

/**
 * Format relative time
 */
function formatRelativeTime(
  date: Date,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return t('notifications.history.justNow', { defaultValue: 'Just now' });
  if (minutes < 60)
    return t('notifications.history.minutesAgo', {
      count: minutes,
      defaultValue: '{{count}}m ago',
    });
  if (hours < 24)
    return t('notifications.history.hoursAgo', { count: hours, defaultValue: '{{count}}h ago' });
  if (days < 7)
    return t('notifications.history.daysAgo', { count: days, defaultValue: '{{count}}d ago' });

  return new Date(date).toLocaleDateString();
}

// ============================================================================
// COMPONENT
// ============================================================================

const NotificationHistoryItem: React.FC<NotificationHistoryItemProps> = ({
  notification,
  isSelected = false,
  showCheckbox = false,
  expanded = false,
  onClick,
  onMarkAsRead,
  onDismiss,
  onSelectionChange,
  onToggleExpand,
  className = '',
}) => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const _prefersReducedMotion = usePrefersReducedMotion();

  const unread = isUnread(notification);

  const handleClick = useCallback(() => {
    onClick?.(notification);
  }, [onClick, notification]);

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onSelectionChange?.(notification.id, e.target.checked);
    },
    [notification.id, onSelectionChange]
  );

  const handleMarkAsRead = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMarkAsRead?.(notification.id);
    },
    [notification.id, onMarkAsRead]
  );

  const handleDismiss = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDismiss?.(notification.id);
    },
    [notification.id, onDismiss]
  );

  const handleToggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand?.(notification.id);
    },
    [notification.id, onToggleExpand]
  );

  const containerClasses = [
    'relative flex items-start gap-3 p-4 rounded-lg border',
    'transition-all duration-150',
    unread
      ? 'bg-[var(--theme-accent)]/5 border-[var(--theme-accent)]/20'
      : 'bg-[var(--theme-surface)] border-[var(--theme-border)]',
    isSelected ? 'ring-2 ring-[var(--theme-accent)]' : '',
    onClick ? 'cursor-pointer hover:bg-[var(--theme-hover)]' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => e.key === 'Enter' && handleClick() : undefined}
      aria-selected={isSelected}
    >
      {/* Checkbox */}
      {showCheckbox && (
        <div className="flex-shrink-0 pt-0.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="w-4 h-4 rounded border-[var(--theme-border)] text-[var(--theme-accent)] focus:ring-[var(--theme-accent)]"
            aria-label={t('notifications.history.selectNotification', {
              defaultValue: 'Select notification',
            })}
          />
        </div>
      )}

      {/* Category Icon */}
      <div className="flex-shrink-0 text-xl" role="img" aria-hidden="true">
        {getCategoryIcon(notification.category)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h4
              className={`text-sm truncate ${unread ? 'font-semibold' : 'font-medium'} text-[var(--theme-text)]`}
            >
              {notification.title}
            </h4>
            {notification.priority !== 'normal' && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded ${getPriorityColor(notification.priority)}`}
              >
                {t(`notifications.history.priority.${notification.priority}`, {
                  defaultValue: notification.priority,
                })}
              </span>
            )}
          </div>
          <span className="flex-shrink-0 text-xs text-[var(--theme-text-secondary)]">
            {formatRelativeTime(notification.createdAt, t)}
          </span>
        </div>

        {/* Body */}
        <p
          className={`text-sm text-[var(--theme-text-secondary)] ${expanded ? '' : 'line-clamp-2'}`}
        >
          {notification.body}
        </p>

        {/* Meta Row */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-[var(--theme-text-secondary)] capitalize">
            {notification.category.replace('-', ' ')}
          </span>
          <span className="text-xs text-[var(--theme-text-secondary)]">•</span>
          <span className="text-xs text-[var(--theme-text-secondary)] capitalize">
            {notification.channel}
          </span>
          {notification.status === 'failed' && (
            <>
              <span className="text-xs text-[var(--theme-text-secondary)]">•</span>
              <span className="text-xs text-red-500">
                {t('notifications.history.failed', { defaultValue: 'Failed' })}
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3">
          {unread && onMarkAsRead && (
            <button
              type="button"
              onClick={handleMarkAsRead}
              className="text-xs text-[var(--theme-accent)] hover:underline focus:outline-none focus-visible:underline"
            >
              {t('notifications.history.markRead', { defaultValue: 'Mark as read' })}
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:underline focus:outline-none"
            >
              {t('notifications.history.dismiss', { defaultValue: 'Dismiss' })}
            </button>
          )}
          {notification.body.length > 100 && onToggleExpand && (
            <button
              type="button"
              onClick={handleToggleExpand}
              className="text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:underline focus:outline-none"
            >
              {expanded
                ? t('notifications.history.showLess', { defaultValue: 'Show less' })
                : t('notifications.history.showMore', { defaultValue: 'Show more' })}
            </button>
          )}
        </div>
      </div>

      {/* Unread Indicator */}
      {unread && (
        <div className="absolute top-4 right-4">
          <span
            className="block w-2.5 h-2.5 rounded-full bg-[var(--theme-accent)]"
            aria-label={t('notifications.history.unread', { defaultValue: 'Unread' })}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationHistoryItem;
