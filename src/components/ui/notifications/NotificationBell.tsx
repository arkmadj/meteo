/**
 * NotificationBell Component
 *
 * A header component that displays a bell icon with an unread notification count badge.
 * Clicking opens a dropdown panel showing recent notifications with actions to mark as read,
 * dismiss, or clear all.
 *
 * Features:
 * - Unread notification count badge
 * - Dropdown panel with notification list
 * - Theme-aware styling
 * - Accessible with keyboard navigation
 * - Integrates with NotificationContext
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import { ANIMATION_DURATION, ANIMATION_EASING, usePrefersReducedMotion } from '@/hooks/useMotion';
import type { NotificationItem } from '@/types/notification';

export interface NotificationBellProps {
  /** Notification items to display */
  notifications: NotificationItem[];
  /** Unread count to display on badge */
  unreadCount: number;
  /** Callback when a notification is marked as read */
  onMarkAsRead?: (id: string) => void;
  /** Callback when a notification is dismissed */
  onDismiss?: (id: string) => void;
  /** Callback when all notifications are marked as read */
  onMarkAllAsRead?: () => void;
  /** Callback when all notifications are cleared */
  onClearAll?: () => void;
  /** Maximum notifications to show in dropdown */
  maxNotifications?: number;
  /** Additional CSS class */
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onDismiss,
  onMarkAllAsRead,
  onClearAll,
  maxNotifications = 5,
  className = '',
}) => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const hasUnread = unreadCount > 0;
  const displayNotifications = notifications.slice(0, maxNotifications);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleMarkAsRead = useCallback(
    (id: string) => {
      onMarkAsRead?.(id);
    },
    [onMarkAsRead]
  );

  const handleDismiss = useCallback(
    (id: string) => {
      onDismiss?.(id);
    },
    [onDismiss]
  );

  const handleMarkAllAsRead = useCallback(() => {
    onMarkAllAsRead?.();
  }, [onMarkAllAsRead]);

  const handleClearAll = useCallback(() => {
    onClearAll?.();
    setIsOpen(false);
  }, [onClearAll]);

  // Format relative time
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('notifications.justNow', 'Just now');
    if (diffMins < 60) return t('notifications.minutesAgo', '{{count}}m ago', { count: diffMins });
    if (diffHours < 24) return t('notifications.hoursAgo', '{{count}}h ago', { count: diffHours });
    return t('notifications.daysAgo', '{{count}}d ago', { count: diffDays });
  };

  // Get category icon
  const getCategoryIcon = (category: NotificationItem['category']): string => {
    switch (category) {
      case 'weather-alert':
        return '⚠️';
      case 'weather-update':
        return '🌤️';
      case 'forecast':
        return '📅';
      case 'system':
        return '⚙️';
      case 'reminder':
        return '🔔';
      case 'promotional':
        return '🎁';
      default:
        return '📢';
    }
  };

  const animationDuration = prefersReducedMotion
    ? ANIMATION_DURATION.fast
    : ANIMATION_DURATION.normal;

  const baseButtonClasses = [
    'relative inline-flex items-center justify-center',
    'w-10 h-10 rounded-lg',
    'bg-[var(--theme-surface)]',
    'border border-[var(--theme-border)]',
    'transition-colors duration-150',
    'hover:bg-[var(--theme-hover)]',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-1',
  ].join(' ');

  const dropdownClasses = [
    'absolute right-0 top-full mt-2',
    'w-80 max-h-96 overflow-hidden',
    'bg-[var(--theme-surface)]',
    'border border-[var(--theme-border)]',
    'rounded-xl shadow-lg',
    'z-50',
  ].join(' ');

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={baseButtonClasses}
        aria-label={t('notifications.bell', 'Notifications')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Bell Icon */}
        <svg
          className="w-5 h-5 text-[var(--theme-text)]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {hasUnread && (
          <span
            className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white bg-[var(--theme-accent)] rounded-full"
            aria-label={t('notifications.unreadCount', '{{count}} unread', { count: unreadCount })}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={dropdownClasses}
          role="menu"
          aria-label={t('notifications.panel', 'Notifications panel')}
          style={{
            animation: `${prefersReducedMotion ? 'none' : `fadeIn ${animationDuration}ms ${ANIMATION_EASING.easeOut}`}`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)]">
            <h3 className="text-sm font-semibold text-[var(--theme-text)]">
              {t('notifications.title', 'Notifications')}
            </h3>
            {hasUnread && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs text-[var(--theme-accent)] hover:underline focus:outline-none focus-visible:underline"
              >
                {t('notifications.markAllRead', 'Mark all read')}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-72">
            {displayNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-3xl mb-2" role="img" aria-label="No notifications">
                  🔔
                </span>
                <p className="text-sm text-[var(--theme-text-secondary)]">
                  {t('notifications.empty', 'No notifications yet')}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--theme-border)]">
                {displayNotifications.map(notification => {
                  // Use isRead field to determine unread state
                  const isUnread = !notification.isRead;
                  return (
                    <li
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-[var(--theme-hover)] transition-colors ${
                        isUnread ? 'bg-[var(--theme-accent)]/5' : ''
                      }`}
                      role="menuitem"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0" role="img" aria-hidden="true">
                          {getCategoryIcon(notification.category)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm ${isUnread ? 'font-semibold' : 'font-medium'} text-[var(--theme-text)] truncate`}
                            >
                              {notification.title}
                            </p>
                            <span className="text-xs text-[var(--theme-text-secondary)] whitespace-nowrap">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--theme-text-secondary)] line-clamp-2 mt-0.5">
                            {notification.body}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {isUnread && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-[var(--theme-accent)] hover:underline focus:outline-none"
                              >
                                {t('notifications.markRead', 'Mark read')}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDismiss(notification.id)}
                              className="text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:underline focus:outline-none"
                            >
                              {t('notifications.dismiss', 'Dismiss')}
                            </button>
                          </div>
                        </div>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)] flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--theme-border)]">
              <span className="text-xs text-[var(--theme-text-secondary)]">
                {notifications.length > maxNotifications
                  ? t('notifications.showingOf', 'Showing {{shown}} of {{total}}', {
                      shown: maxNotifications,
                      total: notifications.length,
                    })
                  : t('notifications.count', '{{count}} notification(s)', {
                      count: notifications.length,
                    })}
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-error,#ef4444)] hover:underline focus:outline-none"
              >
                {t('notifications.clearAll', 'Clear all')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
