/**
 * NotificationHistoryFilters Component
 *
 * A comprehensive filter panel for notification history with support for
 * category, status, priority, date range, and search filters.
 */

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import type {
  DateRangePreset,
  NotificationHistoryFilters as FilterState,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from '@/types/notification';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationHistoryFiltersProps {
  /** Current filter state */
  filters: FilterState;
  /** Callback when filters change */
  onFiltersChange: (filters: Partial<FilterState>) => void;
  /** Callback to reset filters */
  onResetFilters: () => void;
  /** Whether filters are currently active */
  hasActiveFilters: boolean;
  /** Optional date range presets to show */
  dateRangePresets?: DateRangePreset[];
  /** Additional CSS class */
  className?: string;
  /** Compact mode for mobile */
  compact?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_OPTIONS: Array<{ value: NotificationCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All Categories' },
  { value: 'weather-alert', label: 'Weather Alerts' },
  { value: 'weather-update', label: 'Weather Updates' },
  { value: 'forecast', label: 'Forecasts' },
  { value: 'system', label: 'System' },
  { value: 'reminder', label: 'Reminders' },
  { value: 'promotional', label: 'Promotional' },
];

const STATUS_OPTIONS: Array<{ value: NotificationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'clicked', label: 'Clicked' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

const PRIORITY_OPTIONS: Array<{ value: NotificationPriority | 'all'; label: string }> = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

const CHANNEL_OPTIONS: Array<{ value: NotificationChannel | 'all'; label: string }> = [
  { value: 'all', label: 'All Channels' },
  { value: 'push', label: 'Push' },
  { value: 'in-app', label: 'In-App' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
];

const READ_STATUS_OPTIONS: Array<{ value: 'all' | 'read' | 'unread'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

const DEFAULT_DATE_PRESETS: DateRangePreset[] = [
  'today',
  'yesterday',
  'last7days',
  'last30days',
  'thisMonth',
  'lastMonth',
];

// ============================================================================
// COMPONENT
// ============================================================================

const NotificationHistoryFilters: React.FC<NotificationHistoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  hasActiveFilters,
  dateRangePresets: _dateRangePresets = DEFAULT_DATE_PRESETS,
  className = '',
  compact = false,
}) => {
  const { t } = useTranslation('common');
  const { theme: _theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Note: dateRangePresets is available for future date range picker implementation
  void _dateRangePresets;
  void _theme;

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ searchTerm: e.target.value });
    },
    [onFiltersChange]
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({ category: e.target.value as NotificationCategory | 'all' });
    },
    [onFiltersChange]
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({ status: e.target.value as NotificationStatus | 'all' });
    },
    [onFiltersChange]
  );

  const handlePriorityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({ priority: e.target.value as NotificationPriority | 'all' });
    },
    [onFiltersChange]
  );

  const handleChannelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({ channel: e.target.value as NotificationChannel | 'all' });
    },
    [onFiltersChange]
  );

  const handleReadStatusChange = useCallback(
    (value: 'all' | 'read' | 'unread') => {
      onFiltersChange({ readStatus: value });
    },
    [onFiltersChange]
  );

  // File continues below...
  const selectClasses = `
    w-full px-3 py-2 text-sm rounded-lg border
    bg-[var(--theme-surface)] border-[var(--theme-border)]
    text-[var(--theme-text)]
    focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent
    appearance-none cursor-pointer
  `.trim();

  const inputClasses = `
    w-full px-3 py-2 text-sm rounded-lg border
    bg-[var(--theme-surface)] border-[var(--theme-border)]
    text-[var(--theme-text)] placeholder-[var(--theme-text-secondary)]
    focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent
  `.trim();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar - Always Visible */}
      <div className="relative">
        <input
          type="text"
          value={filters.searchTerm}
          onChange={handleSearchChange}
          placeholder={t('notifications.history.searchPlaceholder', {
            defaultValue: 'Search notifications...',
          })}
          className={inputClasses}
          aria-label={t('notifications.history.search', { defaultValue: 'Search' })}
        />
        {/* Search Icon */}
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Expand/Collapse Button for Compact Mode */}
      {compact && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-[var(--theme-accent)] hover:underline"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {isExpanded
            ? t('notifications.history.hideFilters', { defaultValue: 'Hide filters' })
            : t('notifications.history.showFilters', { defaultValue: 'Show filters' })}
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)]" />}
        </button>
      )}

      {/* Filter Controls */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Read Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[var(--theme-surface-secondary)] rounded-lg">
            {READ_STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleReadStatusChange(option.value)}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filters.readStatus === option.value
                    ? 'bg-[var(--theme-accent)] text-white'
                    : 'text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]'
                }`}
              >
                {t(`notifications.history.readStatus.${option.value}`, {
                  defaultValue: option.label,
                })}
              </button>
            ))}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[var(--theme-text-secondary)] mb-1">
                {t('notifications.history.category', { defaultValue: 'Category' })}
              </label>
              <select
                value={filters.category}
                onChange={handleCategoryChange}
                className={selectClasses}
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {t(`notifications.history.categories.${opt.value}`, {
                      defaultValue: opt.label,
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-[var(--theme-text-secondary)] mb-1">
                {t('notifications.history.status', { defaultValue: 'Status' })}
              </label>
              <select
                value={filters.status}
                onChange={handleStatusChange}
                className={selectClasses}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {t(`notifications.history.statuses.${opt.value}`, { defaultValue: opt.label })}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-[var(--theme-text-secondary)] mb-1">
                {t('notifications.history.priority', { defaultValue: 'Priority' })}
              </label>
              <select
                value={filters.priority}
                onChange={handlePriorityChange}
                className={selectClasses}
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {t(`notifications.history.priorities.${opt.value}`, {
                      defaultValue: opt.label,
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel */}
            <div>
              <label className="block text-xs font-medium text-[var(--theme-text-secondary)] mb-1">
                {t('notifications.history.channel', { defaultValue: 'Channel' })}
              </label>
              <select
                value={filters.channel}
                onChange={handleChannelChange}
                className={selectClasses}
              >
                {CHANNEL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {t(`notifications.history.channels.${opt.value}`, { defaultValue: opt.label })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-2 text-sm text-[var(--theme-accent)] hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {t('notifications.history.resetFilters', { defaultValue: 'Reset filters' })}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationHistoryFilters;
