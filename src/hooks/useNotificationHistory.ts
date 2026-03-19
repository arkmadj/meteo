/**
 * useNotificationHistory Hook
 *
 * A comprehensive hook for managing notification history with filtering,
 * sorting, pagination, search, and bulk actions.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNotification } from '@/contexts/NotificationContext';
import type {
  DateRangePreset,
  NotificationCategory,
  NotificationChannel,
  NotificationHistoryFilters,
  NotificationHistoryPage,
  NotificationHistorySortDirection,
  NotificationHistorySortField,
  NotificationHistoryStats,
  NotificationItem,
  NotificationPriority,
} from '@/types/notification';
import { DEFAULT_NOTIFICATION_HISTORY_FILTERS } from '@/types/notification';

// ============================================================================
// TYPES
// ============================================================================

export interface UseNotificationHistoryOptions {
  /** Initial page size */
  pageSize?: number;
  /** Initial sort field */
  initialSortBy?: NotificationHistorySortField;
  /** Initial sort direction */
  initialSortDirection?: NotificationHistorySortDirection;
  /** Auto-refresh interval in ms (0 to disable) */
  autoRefreshInterval?: number;
}

export interface UseNotificationHistoryReturn {
  // Data
  notifications: NotificationItem[];
  page: NotificationHistoryPage;
  stats: NotificationHistoryStats | null;

  // Filters
  filters: NotificationHistoryFilters;
  setFilters: (filters: Partial<NotificationHistoryFilters>) => void;
  resetFilters: () => void;

  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Sorting
  sortBy: NotificationHistorySortField;
  sortDirection: NotificationHistorySortDirection;
  setSorting: (
    field: NotificationHistorySortField,
    direction?: NotificationHistorySortDirection
  ) => void;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;

  // Actions
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => Promise<void>;
  bulkMarkAsRead: (ids: string[]) => void;
  bulkDismiss: (ids: string[]) => void;

  // Selection
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;

  // Date Range
  setDateRange: (preset: DateRangePreset) => void;
  setCustomDateRange: (startDate: Date | null, endDate: Date | null) => void;

  // State
  isLoading: boolean;
  isEmpty: boolean;
  hasFiltersApplied: boolean;
  unreadCount: number;

  // Refresh
  refresh: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get date range based on preset
 */
function getDateRangeFromPreset(preset: DateRangePreset): { startDate: Date; endDate: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);

  switch (preset) {
    case 'today':
      return { startDate: today, endDate: endOfToday };
    case 'yesterday': {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return { startDate: yesterday, endDate: new Date(today.getTime() - 1) };
    }
    case 'last7days':
      return {
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: endOfToday,
      };
    case 'last30days':
      return {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: endOfToday,
      };
    case 'thisMonth':
      return { startDate: new Date(now.getFullYear(), now.getMonth(), 1), endDate: endOfToday };
    case 'lastMonth': {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { startDate: lastMonthStart, endDate: lastMonthEnd };
    }
    default:
      return { startDate: today, endDate: endOfToday };
  }
}

/**
 * Check if a notification is unread using the isRead field
 */
function isUnread(notification: NotificationItem): boolean {
  return !notification.isRead;
}

/**
 * Sort notifications by field
 */
function sortNotifications(
  notifications: NotificationItem[],
  sortBy: NotificationHistorySortField,
  direction: NotificationHistorySortDirection
): NotificationItem[] {
  return [...notifications].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'priority': {
        const priorityOrder: Record<NotificationPriority, number> = {
          urgent: 0,
          high: 1,
          normal: 2,
          low: 3,
        };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      }
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter notifications based on query
 */
function filterNotifications(
  notifications: NotificationItem[],
  filters: NotificationHistoryFilters
): NotificationItem[] {
  return notifications.filter(notification => {
    // Category filter
    if (filters.category !== 'all' && notification.category !== filters.category) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && notification.status !== filters.status) {
      return false;
    }

    // Channel filter
    if (filters.channel !== 'all' && notification.channel !== filters.channel) {
      return false;
    }

    // Priority filter
    if (filters.priority !== 'all' && notification.priority !== filters.priority) {
      return false;
    }

    // Read status filter
    if (filters.readStatus === 'read' && isUnread(notification)) {
      return false;
    }
    if (filters.readStatus === 'unread' && !isUnread(notification)) {
      return false;
    }

    // Date range filter
    const createdAt = new Date(notification.createdAt);
    if (filters.startDate && createdAt < filters.startDate) {
      return false;
    }
    if (filters.endDate && createdAt > filters.endDate) {
      return false;
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const titleMatch = notification.title.toLowerCase().includes(searchLower);
      const bodyMatch = notification.body.toLowerCase().includes(searchLower);
      if (!titleMatch && !bodyMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculate extended history stats
 */
function calculateHistoryStats(notifications: NotificationItem[]): NotificationHistoryStats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const categoryCounts: Record<NotificationCategory, number> = {
    'weather-alert': 0,
    'weather-update': 0,
    forecast: 0,
    system: 0,
    reminder: 0,
    promotional: 0,
  };

  const channelCounts: Record<NotificationChannel, number> = {
    push: 0,
    'in-app': 0,
    email: 0,
    sms: 0,
  };

  let delivered = 0;
  let clicked = 0;
  let dismissed = 0;
  let failed = 0;
  let pending = 0;
  let archived = 0;
  let today = 0;
  let thisWeek = 0;
  let thisMonth = 0;

  for (const n of notifications) {
    categoryCounts[n.category]++;
    channelCounts[n.channel]++;

    switch (n.status) {
      case 'delivered':
        delivered++;
        break;
      case 'clicked':
        clicked++;
        break;
      case 'dismissed':
        dismissed++;
        break;
      case 'failed':
        failed++;
        break;
      case 'pending':
      case 'scheduled':
        pending++;
        break;
      case 'expired':
        archived++;
        break;
    }

    const createdAt = new Date(n.createdAt);
    if (createdAt >= todayStart) today++;
    if (createdAt >= weekStart) thisWeek++;
    if (createdAt >= monthStart) thisMonth++;
  }

  // Find most active category
  let mostActiveCategory: NotificationCategory | null = null;
  let maxCount = 0;
  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostActiveCategory = category as NotificationCategory;
    }
  }

  // Calculate click-through rate
  const clickThroughRate = delivered > 0 ? clicked / (delivered + clicked) : 0;

  return {
    total: notifications.length,
    delivered,
    clicked,
    dismissed,
    failed,
    pending,
    archived,
    today,
    thisWeek,
    thisMonth,
    mostActiveCategory,
    clickThroughRate,
    byCategory: categoryCounts,
    byChannel: channelCounts,
  };
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useNotificationHistory(
  options: UseNotificationHistoryOptions = {}
): UseNotificationHistoryReturn {
  const {
    pageSize: initialPageSize = 10,
    initialSortBy = 'createdAt',
    initialSortDirection = 'desc',
    autoRefreshInterval = 0,
  } = options;

  const {
    state,
    getHistory,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    markAsDismissed,
    clearHistory,
    refreshHistory,
  } = useNotification();

  // State
  const [filters, setFiltersState] = useState<NotificationHistoryFilters>(
    DEFAULT_NOTIFICATION_HISTORY_FILTERS
  );
  const [sortBy, setSortBy] = useState<NotificationHistorySortField>(initialSortBy);
  const [sortDirection, setSortDirection] =
    useState<NotificationHistorySortDirection>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Get all notifications from context
  const allNotifications = state.history;

  // Apply filters and sorting
  const filteredNotifications = useMemo(() => {
    const filtered = filterNotifications(allNotifications, filters);
    return sortNotifications(filtered, sortBy, sortDirection);
  }, [allNotifications, filters, sortBy, sortDirection]);

  // Calculate pagination
  const totalItems = filteredNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  // Create page object
  const page: NotificationHistoryPage = useMemo(
    () => ({
      items: paginatedNotifications,
      totalItems,
      totalPages,
      currentPage,
      pageSize,
      hasMore: currentPage < totalPages,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage >= totalPages,
    }),
    [paginatedNotifications, totalItems, totalPages, currentPage, pageSize]
  );

  // Calculate stats
  const stats = useMemo(() => calculateHistoryStats(allNotifications), [allNotifications]);

  // Check if filters are applied
  const hasFiltersApplied = useMemo(() => {
    return (
      filters.category !== 'all' ||
      filters.status !== 'all' ||
      filters.channel !== 'all' ||
      filters.priority !== 'all' ||
      filters.searchTerm !== '' ||
      filters.startDate !== null ||
      filters.endDate !== null ||
      filters.readStatus !== 'all'
    );
  }, [filters]);

  // Unread count
  const unreadCount = useMemo(() => allNotifications.filter(isUnread).length, [allNotifications]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        refreshHistory();
      }, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, refreshHistory]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection, pageSize]);

  // ---- Filter Actions ----
  const setFilters = useCallback((newFilters: Partial<NotificationHistoryFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_NOTIFICATION_HISTORY_FILTERS);
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setFiltersState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  // ---- Sorting Actions ----
  const setSorting = useCallback(
    (field: NotificationHistorySortField, direction?: NotificationHistorySortDirection) => {
      setSortBy(field);
      if (direction) {
        setSortDirection(direction);
      } else {
        // Toggle direction if same field
        setSortDirection(prev => (sortBy === field && prev === 'desc' ? 'asc' : 'desc'));
      }
    },
    [sortBy]
  );

  // ---- Pagination Actions ----
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(Math.max(1, size));
    setCurrentPage(1);
  }, []);

  // ---- Selection Actions ----
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(paginatedNotifications.map(n => n.id)));
  }, [paginatedNotifications]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  // ---- Notification Actions ----
  const handleMarkAsUnread = useCallback(
    (id: string) => {
      markAsUnread(id);
    },
    [markAsUnread]
  );

  const bulkMarkAsRead = useCallback(
    (ids: string[]) => {
      ids.forEach(id => markAsRead(id));
      clearSelection();
    },
    [markAsRead, clearSelection]
  );

  const bulkDismiss = useCallback(
    (ids: string[]) => {
      ids.forEach(id => markAsDismissed(id));
      clearSelection();
    },
    [markAsDismissed, clearSelection]
  );

  const handleClearAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await clearHistory();
      setCurrentPage(1);
      clearSelection();
    } finally {
      setIsLoading(false);
    }
  }, [clearHistory, clearSelection]);

  // ---- Date Range Actions ----
  const setDateRange = useCallback((preset: DateRangePreset) => {
    if (preset === 'custom') {
      return; // Use setCustomDateRange for custom dates
    }
    const { startDate, endDate } = getDateRangeFromPreset(preset);
    setFiltersState(prev => ({ ...prev, startDate, endDate }));
  }, []);

  const setCustomDateRange = useCallback((startDate: Date | null, endDate: Date | null) => {
    setFiltersState(prev => ({ ...prev, startDate, endDate }));
  }, []);

  // ---- Refresh ----
  const refresh = useCallback(() => {
    setIsLoading(true);
    refreshHistory();
    setIsLoading(false);
  }, [refreshHistory]);

  return {
    // Data
    notifications: paginatedNotifications,
    page,
    stats,

    // Filters
    filters,
    setFilters,
    resetFilters,

    // Search
    searchTerm: filters.searchTerm,
    setSearchTerm,

    // Sorting
    sortBy,
    sortDirection,
    setSorting,

    // Pagination
    currentPage,
    pageSize,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,

    // Actions
    markAsRead,
    markAsUnread: handleMarkAsUnread,
    markAllAsRead,
    dismiss: markAsDismissed,
    clearAll: handleClearAll,
    bulkMarkAsRead,
    bulkDismiss,

    // Selection
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,

    // Date Range
    setDateRange,
    setCustomDateRange,

    // State
    isLoading,
    isEmpty: totalItems === 0,
    hasFiltersApplied,
    unreadCount,

    // Refresh
    refresh,
  };
}

export default useNotificationHistory;
