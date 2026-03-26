/**
 * NotificationHistoryPanel Component
 *
 * A comprehensive panel for displaying notification history with filtering,
 * sorting, pagination, bulk actions, and statistics.
 */

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/design-system/theme';
import { useNotificationHistory } from '@/hooks/useNotificationHistory';
import type { NotificationHistorySortField, NotificationItem } from '@/types/notification';

import NotificationHistoryFilters from './NotificationHistoryFilters';
import NotificationHistoryItem from './NotificationHistoryItem';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationHistoryPanelProps {
  /** Initial page size */
  pageSize?: number;
  /** Whether to show statistics summary */
  showStats?: boolean;
  /** Whether to show bulk action controls */
  showBulkActions?: boolean;
  /** Whether to enable item selection */
  enableSelection?: boolean;
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: NotificationItem) => void;
  /** Additional CSS class */
  className?: string;
  /** Whether to use compact mode */
  compact?: boolean;
  /** Title for the panel */
  title?: string;
  /** Empty state message */
  emptyMessage?: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation('common');

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-[var(--theme-border)]">
      {/* Info */}
      <div className="text-sm text-[var(--theme-text-secondary)]">
        {t('notifications.history.showing', {
          start: startItem,
          end: endItem,
          total: totalItems,
          defaultValue: 'Showing {{start}}-{{end}} of {{total}}',
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Page Size */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--theme-text-secondary)]">
            {t('notifications.history.perPage', { defaultValue: 'Per page:' })}
          </label>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-sm rounded border bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)]"
          >
            {[5, 10, 25, 50].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded hover:bg-[var(--theme-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('notifications.history.firstPage', { defaultValue: 'First page' })}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded hover:bg-[var(--theme-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('notifications.history.prevPage', { defaultValue: 'Previous page' })}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <span className="px-3 text-sm text-[var(--theme-text)]">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded hover:bg-[var(--theme-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('notifications.history.nextPage', { defaultValue: 'Next page' })}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded hover:bg-[var(--theme-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('notifications.history.lastPage', { defaultValue: 'Last page' })}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const NotificationHistoryPanel: React.FC<NotificationHistoryPanelProps> = ({
  pageSize: initialPageSize = 10,
  showStats = true,
  showBulkActions = true,
  enableSelection = true,
  onNotificationClick,
  className = '',
  compact = false,
  title,
  emptyMessage,
}) => {
  const { t } = useTranslation('common');
  const { theme: _theme } = useTheme();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const {
    notifications,
    page,
    stats,
    filters,
    setFilters,
    resetFilters,
    sortBy,
    sortDirection,
    setSorting,
    currentPage,
    pageSize,
    totalPages,
    goToPage,
    setPageSize,
    markAsRead,
    markAllAsRead,
    dismiss,
    clearAll,
    bulkMarkAsRead,
    bulkDismiss,
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    isLoading,
    isEmpty,
    hasFiltersApplied,
    unreadCount,
    refresh,
  } = useNotificationHistory({ pageSize: initialPageSize });

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSortChange = useCallback(
    (field: NotificationHistorySortField) => {
      setSorting(field);
    },
    [setSorting]
  );

  const handleBulkMarkAsRead = useCallback(() => {
    bulkMarkAsRead(Array.from(selectedIds));
  }, [bulkMarkAsRead, selectedIds]);

  const handleBulkDismiss = useCallback(() => {
    bulkDismiss(Array.from(selectedIds));
  }, [bulkDismiss, selectedIds]);

  const hasSelection = selectedIds.size > 0;

  return (
    <div
      className={`flex flex-col bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-border)] overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[var(--theme-text)]">
            {title || t('notifications.history.title', { defaultValue: 'Notification History' })}
          </h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--theme-accent)] text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-[var(--theme-hover)] text-[var(--theme-text-secondary)] disabled:opacity-50"
            aria-label={t('notifications.history.refresh', { defaultValue: 'Refresh' })}
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-sm text-[var(--theme-accent)] hover:underline"
            >
              {t('notifications.history.markAllRead', { defaultValue: 'Mark all as read' })}
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {showStats && !isEmpty && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 py-3 bg-[var(--theme-surface-secondary)] border-b border-[var(--theme-border)]">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--theme-text)]">{stats.total}</div>
            <div className="text-xs text-[var(--theme-text-secondary)]">
              {t('notifications.history.stats.total', { defaultValue: 'Total' })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--theme-accent)]">{stats.today}</div>
            <div className="text-xs text-[var(--theme-text-secondary)]">
              {t('notifications.history.stats.today', { defaultValue: 'Today' })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.clicked}</div>
            <div className="text-xs text-[var(--theme-text-secondary)]">
              {t('notifications.history.stats.clicked', { defaultValue: 'Clicked' })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{unreadCount}</div>
            <div className="text-xs text-[var(--theme-text-secondary)]">
              {t('notifications.history.stats.unread', { defaultValue: 'Unread' })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-4 py-3 border-b border-[var(--theme-border)]">
        <NotificationHistoryFilters
          filters={filters}
          onFiltersChange={setFilters}
          onResetFilters={resetFilters}
          hasActiveFilters={hasFiltersApplied}
          compact={compact}
        />
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && hasSelection && (
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--theme-accent)]/10 border-b border-[var(--theme-border)]">
          <span className="text-sm text-[var(--theme-text)]">
            {t('notifications.history.selected', {
              count: selectedIds.size,
              defaultValue: '{{count}} selected',
            })}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBulkMarkAsRead}
              className="text-sm text-[var(--theme-accent)] hover:underline"
            >
              {t('notifications.history.markSelectedRead', { defaultValue: 'Mark as read' })}
            </button>
            <button
              type="button"
              onClick={handleBulkDismiss}
              className="text-sm text-red-500 hover:underline"
            >
              {t('notifications.history.dismissSelected', { defaultValue: 'Dismiss' })}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="text-sm text-[var(--theme-text-secondary)] hover:underline"
            >
              {t('notifications.history.clearSelection', { defaultValue: 'Clear selection' })}
            </button>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      {!isEmpty && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-2">
            {enableSelection && (
              <button
                type="button"
                onClick={hasSelection ? clearSelection : selectAll}
                className="text-sm text-[var(--theme-accent)] hover:underline"
              >
                {hasSelection
                  ? t('notifications.history.deselectAll', { defaultValue: 'Deselect all' })
                  : t('notifications.history.selectAll', { defaultValue: 'Select all' })}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--theme-text-secondary)]">
              {t('notifications.history.sortBy', { defaultValue: 'Sort by:' })}
            </span>
            <select
              value={sortBy}
              onChange={e => handleSortChange(e.target.value as NotificationHistorySortField)}
              className="px-2 py-1 text-xs rounded border bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)]"
            >
              <option value="createdAt">
                {t('notifications.history.sortOptions.date', { defaultValue: 'Date' })}
              </option>
              <option value="title">
                {t('notifications.history.sortOptions.title', { defaultValue: 'Title' })}
              </option>
              <option value="priority">
                {t('notifications.history.sortOptions.priority', { defaultValue: 'Priority' })}
              </option>
              <option value="category">
                {t('notifications.history.sortOptions.category', { defaultValue: 'Category' })}
              </option>
            </select>
            <button
              type="button"
              onClick={() => setSorting(sortBy)}
              className="p-1 rounded hover:bg-[var(--theme-hover)]"
              aria-label={
                sortDirection === 'asc'
                  ? t('notifications.history.sortAsc', { defaultValue: 'Sort ascending' })
                  : t('notifications.history.sortDesc', { defaultValue: 'Sort descending' })
              }
            >
              <svg
                className={`w-4 h-4 text-[var(--theme-text-secondary)] transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg
              className="w-16 h-16 text-[var(--theme-text-secondary)] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="text-[var(--theme-text-secondary)]">
              {emptyMessage ||
                (hasFiltersApplied
                  ? t('notifications.history.noResults', {
                      defaultValue: 'No notifications match your filters',
                    })
                  : t('notifications.history.empty', {
                      defaultValue: 'No notifications yet',
                    }))}
            </p>
            {hasFiltersApplied && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 text-sm text-[var(--theme-accent)] hover:underline"
              >
                {t('notifications.history.clearFilters', { defaultValue: 'Clear filters' })}
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--theme-border)]">
            {notifications.map(notification => (
              <div key={notification.id} className="px-4 py-2">
                <NotificationHistoryItem
                  notification={notification}
                  isSelected={isSelected(notification.id)}
                  showCheckbox={enableSelection}
                  expanded={expandedIds.has(notification.id)}
                  onClick={onNotificationClick}
                  onMarkAsRead={markAsRead}
                  onDismiss={dismiss}
                  onSelectionChange={(id, selected) =>
                    selected ? toggleSelection(id) : toggleSelection(id)
                  }
                  onToggleExpand={handleToggleExpand}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isEmpty && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={page.totalItems}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Footer Actions */}
      {!isEmpty && (
        <div className="flex items-center justify-end px-4 py-3 border-t border-[var(--theme-border)]">
          <button
            type="button"
            onClick={() => {
              void clearAll();
            }}
            className="text-sm text-red-500 hover:underline"
          >
            {t('notifications.history.clearAll', { defaultValue: 'Clear all notifications' })}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationHistoryPanel;
