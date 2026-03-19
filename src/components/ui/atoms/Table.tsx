/**
 * Table Atom Component
 * A fully accessible table component using semantic HTML elements
 * with proper scope attributes for screen reader clarity
 *
 * Features:
 * - Sticky headers with position: sticky (stays in DOM flow)
 * - Screen reader announcements for scroll position
 * - Proper ARIA attributes for accessibility
 */

import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { COLORS, SPACING } from '../../../design-system/tokens';
import type { BaseComponentProps, ComponentSize } from '../base/BaseComponent';
import { useComponentState } from '../base/BaseComponent';

// ============================================================================
// TABLE SPECIFIC TYPES
// ============================================================================

export type TableSize = ComponentSize;
export type TableVariant = 'default' | 'striped' | 'bordered' | 'hoverable';
export type TableDensity = 'compact' | 'normal' | 'comfortable';

/**
 * Column definition for table headers
 */
export interface TableColumn<T = unknown> {
  /** Unique identifier for the column (also used as header cell id) */
  id: string;
  /** Column header label */
  label: string;
  /** Accessor function or key to get cell value */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Column width (CSS value) */
  width?: string;
  /** Minimum column width (CSS value) */
  minWidth?: string;
  /** Maximum column width (CSS value) */
  maxWidth?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Custom cell renderer */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  /** Scope attribute for header cells */
  scope?: 'col' | 'colgroup';
  /** ARIA label for the column */
  ariaLabel?: string;
  /** Column span for merged headers (complex tables) */
  colSpan?: number;
  /** Row span for merged headers (complex tables) */
  rowSpan?: number;
  /** Parent header ID for nested headers (complex tables) */
  parentHeaderId?: string;
  /** Additional header IDs this cell is associated with (complex tables) */
  additionalHeaderIds?: string[];
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Row definition for table data
 */
export interface TableRow<T = unknown> {
  /** Unique identifier for the row */
  id: string | number;
  /** Row data */
  data: T;
  /** Whether this row is selected */
  selected?: boolean;
  /** Whether this row is disabled */
  disabled?: boolean;
  /** Custom row class name */
  className?: string;
  /** Whether this row is expandable */
  expandable?: boolean;
  /** Whether this row is expanded */
  expanded?: boolean;
  /** Content to show when row is expanded */
  expandedContent?: React.ReactNode;
  /** Custom expansion renderer */
  renderExpanded?: (row: T, index: number) => React.ReactNode;
}

// ============================================================================
// TABLE COMPONENT
// ============================================================================

export interface TableProps<T = unknown> extends Omit<BaseComponentProps, 'variant'> {
  /** Table columns configuration */
  columns: TableColumn<T>[];
  /** Table rows data */
  rows: TableRow<T>[];
  /** Table variant */
  variant?: TableVariant;
  /** Table size */
  size?: TableSize;
  /** Table density */
  density?: TableDensity;
  /** Table caption (required for accessibility) */
  caption?: string;
  /** Whether to hide the caption visually (still accessible to screen readers) */
  hideCaption?: boolean;
  /** Whether the table is sortable */
  sortable?: boolean;
  /** Current sort column */
  sortColumn?: string;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Sort handler */
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void;
  /** Whether rows are selectable */
  selectable?: boolean;
  /** Selected row IDs */
  selectedRows?: (string | number)[];
  /** Selection handler */
  onSelectRow?: (rowId: string | number) => void;
  /** Select all handler */
  onSelectAll?: (selected: boolean) => void;
  /** Row click handler */
  onRowClick?: (row: TableRow<T>) => void;
  /** Whether to show row hover effect */
  hoverable?: boolean;
  /** Whether to show striped rows */
  striped?: boolean;
  /** Whether to show borders */
  bordered?: boolean;
  /** Whether the table is loading */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Maximum height for scrollable table */
  maxHeight?: string;
  /** ARIA label for the table */
  ariaLabel?: string;
  /** ARIA described by */
  ariaDescribedBy?: string;
  /** Whether to announce scroll position to screen readers */
  announceScroll?: boolean;
  /** Custom scroll announcement message */
  scrollAnnouncementMessage?: (scrollTop: number, scrollHeight: number) => string;
  /** Whether rows are expandable */
  expandable?: boolean;
  /** Expanded row IDs */
  expandedRows?: (string | number)[];
  /** Row expansion handler */
  onExpandRow?: (rowId: string | number) => void;
  /** Expand all handler */
  onExpandAll?: (expanded: boolean) => void;
  /** Custom expansion icon renderer */
  renderExpansionIcon?: (expanded: boolean, disabled: boolean) => React.ReactNode;
  /** Whether to show expansion column */
  showExpansionColumn?: boolean;
  /** Expansion column width */
  expansionColumnWidth?: string;
  /** ARIA label for expansion buttons */
  expansionAriaLabel?: (rowData: T, expanded: boolean) => string;
  /** Whether to automatically focus expanded content */
  autoFocusExpandedContent?: boolean;
  /** Whether to announce expansion state changes to screen readers */
  announceExpansionChanges?: boolean;
  /** Custom announcement message for expansion changes */
  expansionAnnouncementMessage?: (rowData: T, expanded: boolean) => string;
  /** Whether to use ARIA live regions for dynamic content updates */
  useAriaLiveRegions?: boolean;
  /** Whether to announce sort changes to screen readers */
  announceSortChanges?: boolean;
  /** Custom announcement message for sort changes */
  sortAnnouncementMessage?: (columnLabel: string, direction: 'asc' | 'desc' | 'none') => string;
  /** Custom focus indicator styles */
  focusIndicatorStyle?: React.CSSProperties;
  /** Whether to use enhanced focus management with logical tab order */
  enhancedFocusManagement?: boolean;
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      columns,
      rows,
      variant = 'default',
      size = 'md',
      density = 'normal',
      caption,
      hideCaption = false,
      sortable = false,
      sortColumn,
      sortDirection,
      onSort,
      selectable = false,
      selectedRows = [],
      onSelectRow,
      onSelectAll,
      onRowClick,
      hoverable = false,
      striped = false,
      bordered = false,
      loading = false,
      loadingMessage = 'Loading data...',
      emptyMessage = 'No data available',
      stickyHeader = false,
      maxHeight,
      ariaLabel,
      ariaDescribedBy,
      announceScroll = true,
      scrollAnnouncementMessage,
      expandable = false,
      expandedRows = [],
      onExpandRow,
      onExpandAll,
      renderExpansionIcon,
      showExpansionColumn = true,
      expansionColumnWidth = '48px',
      expansionAriaLabel,
      autoFocusExpandedContent = true,
      announceExpansionChanges = true,
      expansionAnnouncementMessage,
      useAriaLiveRegions = true,
      announceSortChanges = true,
      sortAnnouncementMessage,
      focusIndicatorStyle,
      enhancedFocusManagement: _enhancedFocusManagement = true,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const { isDisabled } = useComponentState({ disabled });

    // ========================================================================
    // REFS AND STATE FOR ACCESSIBILITY
    // ========================================================================

    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollAnnouncement, setScrollAnnouncement] = useState('');
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();

    // Expansion announcement state
    const [expansionAnnouncement, setExpansionAnnouncement] = useState('');
    const expansionAnnouncementTimeoutRef = useRef<NodeJS.Timeout>();

    // Sort announcement state
    const [sortAnnouncement, setSortAnnouncement] = useState('');
    const sortAnnouncementTimeoutRef = useRef<NodeJS.Timeout>();

    // Focus management refs
    const expandedContentRefs = useRef<Map<string | number, HTMLDivElement>>(new Map());
    const expansionButtonRefs = useRef<Map<string | number, HTMLButtonElement>>(new Map());

    // Default focus indicator styles
    const defaultFocusIndicatorStyle: React.CSSProperties = {
      outline: `2px solid ${COLORS.primary[500]}`,
      outlineOffset: '2px',
      boxShadow: `0 0 0 4px ${COLORS.primary[100]}`,
    };

    const focusStyle = focusIndicatorStyle || defaultFocusIndicatorStyle;

    // Helper function to apply focus styles
    const applyFocusStyle = useCallback(
      (element: HTMLElement) => {
        Object.assign(element.style, focusStyle);
      },
      [focusStyle]
    );

    // Helper function to remove focus styles
    const removeFocusStyle = useCallback((element: HTMLElement) => {
      element.style.outline = '';
      element.style.outlineOffset = '';
      element.style.boxShadow = '';
    }, []);

    // Calculate logical tab index for enhanced focus management
    // Note: We use 0 for all focusable elements to maintain natural tab order
    // Enhanced focus management provides visual indicators and better UX
    const getTabIndex = useCallback(
      (
        _elementType: 'header' | 'expansion' | 'selection' | 'row',
        _rowIndex?: number,
        _columnIndex?: number
      ): number => {
        // Always return 0 to maintain natural tab order and accessibility compliance
        // The enhanced focus management provides better visual indicators and UX
        // without breaking accessibility guidelines
        return 0;
      },
      []
    );

    useEffect(() => {
      if (!stickyHeader || !maxHeight || !announceScroll) return;

      const container = containerRef.current;
      if (!container) return;

      const handleScroll = () => {
        // Clear previous timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Debounce scroll announcements (wait 500ms after scrolling stops)
        scrollTimeoutRef.current = setTimeout(() => {
          const scrollTop = container.scrollTop;
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;
          const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);

          // Only announce if scrolled more than 10%
          if (scrollPercentage > 10) {
            const message = scrollAnnouncementMessage
              ? scrollAnnouncementMessage(scrollTop, scrollHeight)
              : `Scrolled ${scrollPercentage}% through table`;

            setScrollAnnouncement(message);

            // Clear announcement after 1 second
            setTimeout(() => setScrollAnnouncement(''), 1000);
          }
        }, 500);
      };

      container.addEventListener('scroll', handleScroll);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, [stickyHeader, maxHeight, announceScroll, scrollAnnouncementMessage]);

    // ========================================================================
    // DENSITY STYLES
    // ========================================================================

    const densityStyles = {
      compact: {
        padding: `${SPACING[1]} ${SPACING[2]}`,
        fontSize: '0.875rem',
      },
      normal: {
        padding: `${SPACING[2]} ${SPACING[3]}`,
        fontSize: '0.9375rem',
      },
      comfortable: {
        padding: `${SPACING[3]} ${SPACING[4]}`,
        fontSize: '1rem',
      },
    };

    const currentDensity = densityStyles[density];

    // ========================================================================
    // VARIANT STYLES
    // ========================================================================

    const getVariantClasses = () => {
      const classes: string[] = [];

      if (striped || variant === 'striped') {
        classes.push('table-striped');
      }

      if (bordered || variant === 'bordered') {
        classes.push('table-bordered');
      }

      if (hoverable || variant === 'hoverable') {
        classes.push('table-hoverable');
      }

      return classes.join(' ');
    };

    // ========================================================================
    // SELECTION HANDLERS
    // ========================================================================

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onSelectAll) {
        onSelectAll(e.target.checked);
      }
    };

    const handleSelectRow = (rowId: string | number) => {
      if (onSelectRow && !isDisabled) {
        onSelectRow(rowId);
      }
    };

    const handleRowClick = (row: TableRow) => {
      if (onRowClick && !row.disabled && !isDisabled) {
        onRowClick(row);
      }
    };

    // ========================================================================
    // EXPANSION HANDLERS
    // ========================================================================

    const _handleExpandAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onExpandAll) {
        onExpandAll(e.target.checked);
      }
    };

    const handleExpandRow = useCallback(
      (rowId: string | number) => {
        if (onExpandRow && !isDisabled) {
          const row = rows.find(r => r.id === rowId);
          const wasExpanded = expandedRows.includes(rowId);

          // Call the expansion handler
          onExpandRow(rowId);

          // Announce the change to screen readers
          if (announceExpansionChanges && row) {
            const message = expansionAnnouncementMessage
              ? expansionAnnouncementMessage(row.data, !wasExpanded)
              : `${(row.data as Record<string, unknown>).name || `Row ${rowId}`} ${!wasExpanded ? 'expanded' : 'collapsed'}`;

            // Clear previous timeout
            if (expansionAnnouncementTimeoutRef.current) {
              clearTimeout(expansionAnnouncementTimeoutRef.current);
            }

            setExpansionAnnouncement(message);

            // Clear announcement after 1 second
            expansionAnnouncementTimeoutRef.current = setTimeout(() => {
              setExpansionAnnouncement('');
            }, 1000);
          }

          // Focus management for expanded content
          if (autoFocusExpandedContent && !wasExpanded) {
            // Use setTimeout to ensure the content is rendered before focusing
            setTimeout(() => {
              const expandedContentElement = expandedContentRefs.current.get(rowId);
              if (expandedContentElement) {
                // Try to focus the first focusable element in the expanded content
                const focusableElements = expandedContentElement.querySelectorAll(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (focusableElements.length > 0) {
                  (focusableElements[0] as HTMLElement).focus();
                } else {
                  // If no focusable elements, focus the container itself
                  expandedContentElement.focus();
                }
              }
            }, 100);
          }
        }
      },
      [
        onExpandRow,
        isDisabled,
        rows,
        expandedRows,
        announceExpansionChanges,
        expansionAnnouncementMessage,
        autoFocusExpandedContent,
      ]
    );

    const handleExpansionKeyDown = (
      e: React.KeyboardEvent,
      rowId: string | number,
      rowDisabled: boolean
    ) => {
      if (rowDisabled || isDisabled) return;

      // Handle Enter and Space keys for expansion
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        handleExpandRow(rowId);
      }
    };

    const handleRowKeyDown = (e: React.KeyboardEvent, row: TableRow, isExpandableRow: boolean) => {
      if (row.disabled || isDisabled) return;

      // Handle Enter and Space keys for row interaction
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();

        if (isExpandableRow && row.expandable) {
          handleExpandRow(row.id);
        } else if (onRowClick) {
          handleRowClick(row);
        }
      }
    };

    // ========================================================================
    // SORT HANDLERS
    // ========================================================================

    const handleSort = useCallback(
      (columnId: string) => {
        if (!sortable || !onSort || isDisabled) return;

        const column = columns.find(col => col.id === columnId);
        if (!column || !column.sortable) return;

        const newDirection = sortColumn === columnId && sortDirection === 'asc' ? 'desc' : 'asc';

        // Call the sort handler
        onSort(columnId, newDirection);

        // Announce the sort change to screen readers
        if (announceSortChanges && column) {
          const message = sortAnnouncementMessage
            ? sortAnnouncementMessage(column.label, newDirection)
            : `Table sorted by ${column.label} in ${newDirection === 'asc' ? 'ascending' : 'descending'} order`;

          // Clear previous timeout
          if (sortAnnouncementTimeoutRef.current) {
            clearTimeout(sortAnnouncementTimeoutRef.current);
          }

          setSortAnnouncement(message);

          // Clear announcement after 1.5 seconds
          sortAnnouncementTimeoutRef.current = setTimeout(() => {
            setSortAnnouncement('');
          }, 1500);
        }
      },
      [
        sortable,
        onSort,
        isDisabled,
        columns,
        sortColumn,
        sortDirection,
        announceSortChanges,
        sortAnnouncementMessage,
      ]
    );

    // ========================================================================
    // CELL VALUE ACCESSOR
    // ========================================================================

    const getCellValue = (column: TableColumn, row: TableRow) => {
      if (typeof column.accessor === 'function') {
        return column.accessor(row.data);
      }
      return row.data[column.accessor];
    };

    // ========================================================================
    // RENDER HELPERS
    // ========================================================================

    const allRowsSelected = rows.length > 0 && selectedRows.length === rows.length;
    const someRowsSelected = selectedRows.length > 0 && selectedRows.length < rows.length;

    const expandableRows = rows.filter(row => row.expandable);
    const allRowsExpanded =
      expandableRows.length > 0 && expandedRows.length === expandableRows.length;
    const _someRowsExpanded =
      expandedRows.length > 0 && expandedRows.length < expandableRows.length;

    const getExpansionIcon = (expanded: boolean, disabled: boolean) => {
      if (renderExpansionIcon) {
        return renderExpansionIcon(expanded, disabled);
      }

      return (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            transition: 'transform 0.2s ease',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            fontSize: '0.875rem',
            color: disabled ? COLORS.neutral[400] : COLORS.neutral[600],
          }}
        >
          ▶
        </span>
      );
    };

    const getExpansionAriaLabel = (row: TableRow, expanded: boolean) => {
      if (expansionAriaLabel) {
        return expansionAriaLabel(row.data, expanded);
      }
      return expanded ? `Collapse row ${row.id}` : `Expand row ${row.id}`;
    };

    // Keyboard handler for sortable columns
    const handleSortKeyDown = useCallback(
      (e: React.KeyboardEvent, columnId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSort(columnId);
        }
      },
      [handleSort]
    );

    // Cleanup function for timeouts
    useEffect(() => {
      return () => {
        if (expansionAnnouncementTimeoutRef.current) {
          clearTimeout(expansionAnnouncementTimeoutRef.current);
        }
        if (sortAnnouncementTimeoutRef.current) {
          clearTimeout(sortAnnouncementTimeoutRef.current);
        }
      };
    }, []);

    // Helper function to set expanded content ref
    const setExpandedContentRef = useCallback(
      (rowId: string | number, element: HTMLDivElement | null) => {
        if (element) {
          expandedContentRefs.current.set(rowId, element);
        } else {
          expandedContentRefs.current.delete(rowId);
        }
      },
      []
    );

    // Helper function to set expansion button ref
    const setExpansionButtonRef = useCallback(
      (rowId: string | number, element: HTMLButtonElement | null) => {
        if (element) {
          expansionButtonRefs.current.set(rowId, element);
        } else {
          expansionButtonRefs.current.delete(rowId);
        }
      },
      []
    );

    // ========================================================================
    // RENDER
    // ========================================================================

    const containerClasses = ['table-container', maxHeight ? 'overflow-auto' : '', className]
      .filter(Boolean)
      .join(' ');

    const tableClasses = [
      'table',
      `table-${size}`,
      `table-${density}`,
      getVariantClasses(),
      isDisabled ? 'table-disabled' : '',
      stickyHeader ? 'table-sticky-header' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={containerRef}
        className={containerClasses}
        style={{
          maxHeight: maxHeight,
          position: 'relative',
          overflowY: maxHeight ? 'auto' : undefined,
          overflowX: 'auto',
        }}
        role={maxHeight ? 'region' : undefined}
        aria-label={
          maxHeight ? `Scrollable table: ${caption || ariaLabel || 'Data table'}` : undefined
        }
        tabIndex={maxHeight ? 0 : undefined}
      >
        {/* Screen reader announcement for scroll position */}
        {stickyHeader && maxHeight && announceScroll && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            {scrollAnnouncement}
          </div>
        )}

        {/* Screen reader announcement for expansion changes */}
        {useAriaLiveRegions && announceExpansionChanges && (
          <div
            role="status"
            aria-live="assertive"
            aria-atomic="true"
            className="sr-only"
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            {expansionAnnouncement}
          </div>
        )}

        {/* Screen reader announcement for sort changes */}
        {useAriaLiveRegions && announceSortChanges && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            {sortAnnouncement}
          </div>
        )}

        <table
          ref={ref}
          className={tableClasses}
          aria-label={ariaLabel || caption}
          aria-describedby={ariaDescribedBy}
          aria-busy={loading}
          role="table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: COLORS.neutral[50],
            color: COLORS.neutral[900],
          }}
          {...props}
        >
          {/* Caption for accessibility */}
          {caption && (
            <caption
              style={{
                padding: currentDensity.padding,
                textAlign: 'left',
                fontWeight: 600,
                fontSize: currentDensity.fontSize,
                color: COLORS.neutral[700],
                ...(hideCaption && {
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }),
              }}
            >
              {caption}
            </caption>
          )}

          {/* Table Header */}
          <thead
            role="rowgroup"
            style={{
              backgroundColor: COLORS.neutral[100],
              borderBottom: `2px solid ${COLORS.neutral[300]}`,
              ...(stickyHeader && {
                position: 'sticky',
                top: 0,
                zIndex: 10,
                // Ensure background is opaque when sticky
                backgroundColor: COLORS.neutral[100],
                boxShadow: stickyHeader ? `0 2px 4px ${COLORS.neutral[200]}` : undefined,
              }),
            }}
          >
            <tr role="row">
              {/* Expansion column */}
              {expandable && showExpansionColumn && (
                <th
                  scope="col"
                  role="columnheader"
                  style={{
                    padding: currentDensity.padding,
                    width: expansionColumnWidth,
                    textAlign: 'center',
                  }}
                >
                  <span className="sr-only">Expand/Collapse</span>
                  {expandableRows.length > 0 && onExpandAll && (
                    <button
                      type="button"
                      onClick={() => onExpandAll(!allRowsExpanded)}
                      disabled={isDisabled}
                      aria-label={allRowsExpanded ? 'Collapse all rows' : 'Expand all rows'}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isDisabled ? 0.5 : 1,
                      }}
                      onMouseEnter={e => {
                        if (!isDisabled) {
                          e.currentTarget.style.backgroundColor = COLORS.neutral[100];
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isDisabled) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {getExpansionIcon(allRowsExpanded, isDisabled)}
                    </button>
                  )}
                </th>
              )}

              {/* Selection column */}
              {selectable && (
                <th
                  scope="col"
                  role="columnheader"
                  style={{
                    padding: currentDensity.padding,
                    width: '48px',
                    textAlign: 'center',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allRowsSelected}
                    ref={input => {
                      if (input) {
                        input.indeterminate = someRowsSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                    disabled={isDisabled}
                    aria-label="Select all rows"
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                  />
                </th>
              )}

              {/* Data columns */}
              {columns.map((column, columnIndex) => (
                <th
                  key={column.id}
                  id={column.id}
                  scope={column.scope || 'col'}
                  role="columnheader"
                  aria-label={
                    column.sortable
                      ? `${column.ariaLabel || column.label}, ${
                          sortColumn === column.id
                            ? `sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}, activate to sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`
                            : 'not sorted, activate to sort ascending'
                        }`
                      : column.ariaLabel || column.label
                  }
                  aria-sort={
                    column.sortable
                      ? sortColumn === column.id
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                      : undefined
                  }
                  colSpan={column.colSpan}
                  rowSpan={column.rowSpan}
                  onClick={() => column.sortable && handleSort(column.id)}
                  onKeyDown={column.sortable ? e => handleSortKeyDown(e, column.id) : undefined}
                  tabIndex={
                    column.sortable && !isDisabled
                      ? getTabIndex('header', undefined, columnIndex)
                      : undefined
                  }
                  style={{
                    padding: currentDensity.padding,
                    textAlign: column.align || 'left',
                    width: column.width,
                    fontWeight: 600,
                    fontSize: currentDensity.fontSize,
                    color: COLORS.neutral[700],
                    cursor: column.sortable && !isDisabled ? 'pointer' : 'default',
                    userSelect: 'none',
                    outline: 'none',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={e => {
                    if (column.sortable) {
                      applyFocusStyle(e.currentTarget);
                    }
                  }}
                  onBlur={e => {
                    if (column.sortable) {
                      removeFocusStyle(e.currentTarget);
                    }
                  }}
                  onMouseEnter={e => {
                    if (column.sortable && !isDisabled) {
                      e.currentTarget.style.backgroundColor = COLORS.neutral[100];
                    }
                  }}
                  onMouseLeave={e => {
                    if (column.sortable && !isDisabled) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        column.align === 'center'
                          ? 'center'
                          : column.align === 'right'
                            ? 'flex-end'
                            : 'flex-start',
                      gap: SPACING[2],
                    }}
                  >
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span
                        aria-hidden="true"
                        style={{
                          display: 'inline-flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          fontSize: '0.75rem',
                          lineHeight: 1,
                          opacity: sortColumn === column.id ? 1 : 0.3,
                          transition: 'opacity 0.2s ease',
                        }}
                      >
                        {sortColumn === column.id ? (
                          sortDirection === 'asc' ? (
                            <span style={{ color: COLORS.primary[600] }}>▲</span>
                          ) : (
                            <span style={{ color: COLORS.primary[600] }}>▼</span>
                          )
                        ) : (
                          <span
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1px',
                              color: COLORS.neutral[400],
                            }}
                          >
                            <span style={{ fontSize: '0.6rem' }}>▲</span>
                            <span style={{ fontSize: '0.6rem' }}>▼</span>
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          {loading ? (
            <tbody role="rowgroup" aria-label="Loading state">
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (expandable && showExpansionColumn ? 1 : 0) +
                    (selectable ? 1 : 0)
                  }
                  style={{
                    padding: `${SPACING[8]} ${currentDensity.padding}`,
                    textAlign: 'center',
                    color: COLORS.neutral[500],
                  }}
                >
                  {loadingMessage}
                </td>
              </tr>
            </tbody>
          ) : rows.length === 0 ? (
            <tbody role="rowgroup" aria-label="Empty state">
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (expandable && showExpansionColumn ? 1 : 0) +
                    (selectable ? 1 : 0)
                  }
                  style={{
                    padding: `${SPACING[8]} ${currentDensity.padding}`,
                    textAlign: 'center',
                    color: COLORS.neutral[500],
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            </tbody>
          ) : (
            rows.map((row, rowIndex) => {
              const isSelected = selectedRows.includes(row.id);
              const isExpanded = expandedRows.includes(row.id);
              const isRowDisabled = row.disabled || isDisabled;
              const isExpandableRow = expandable && row.expandable;
              const isClickable = (!!onRowClick || isExpandableRow) && !isRowDisabled;

              // Create a separate tbody for each expandable row group
              // This preserves logical hierarchy for screen readers
              const rowGroupAriaLabel = isExpandableRow
                ? `Row group for ${(row.data as Record<string, unknown>).name || `row ${row.id}`}${isExpanded ? ', expanded' : ', collapsed'}`
                : `Row ${rowIndex + 1}`;

              return (
                <tbody key={`rowgroup-${row.id}`} role="rowgroup" aria-label={rowGroupAriaLabel}>
                  {/* Main row */}
                  <tr
                    key={row.id}
                    role="row"
                    aria-selected={selectable ? isSelected : undefined}
                    aria-describedby={isExpanded ? `expanded-content-${row.id}` : undefined}
                    onClick={() => handleRowClick(row)}
                    onKeyDown={e => handleRowKeyDown(e, row, !!isExpandableRow)}
                    tabIndex={isClickable ? getTabIndex('row', rowIndex) : undefined}
                    className={row.className}
                    style={{
                      backgroundColor: isSelected
                        ? COLORS.primary[50]
                        : rowIndex % 2 === 1 && (striped || variant === 'striped')
                          ? COLORS.neutral[50]
                          : 'transparent',
                      borderBottom: bordered ? `1px solid ${COLORS.neutral[200]}` : undefined,
                      cursor: isClickable ? 'pointer' : 'default',
                      opacity: isRowDisabled ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      outline: 'none',
                    }}
                    onFocus={e => {
                      if (isClickable && !isRowDisabled) {
                        applyFocusStyle(e.currentTarget);
                      }
                    }}
                    onBlur={e => {
                      if (isClickable && !isRowDisabled) {
                        removeFocusStyle(e.currentTarget);
                      }
                    }}
                    onMouseEnter={e => {
                      if ((hoverable || variant === 'hoverable') && !isRowDisabled) {
                        e.currentTarget.style.backgroundColor = COLORS.neutral[100];
                      }
                    }}
                    onMouseLeave={e => {
                      if ((hoverable || variant === 'hoverable') && !isRowDisabled) {
                        e.currentTarget.style.backgroundColor = isSelected
                          ? COLORS.primary[50]
                          : rowIndex % 2 === 1 && (striped || variant === 'striped')
                            ? COLORS.neutral[50]
                            : 'transparent';
                      }
                    }}
                  >
                    {/* Expansion cell */}
                    {expandable && showExpansionColumn && (
                      <td
                        role="cell"
                        style={{
                          padding: currentDensity.padding,
                          textAlign: 'center',
                        }}
                      >
                        {row.expandable && (
                          <button
                            ref={element => setExpansionButtonRef(row.id, element)}
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleExpandRow(row.id);
                            }}
                            onKeyDown={e => handleExpansionKeyDown(e, row.id, isRowDisabled)}
                            disabled={isRowDisabled}
                            tabIndex={!isRowDisabled ? getTabIndex('expansion', rowIndex) : -1}
                            aria-label={getExpansionAriaLabel(row, isExpanded)}
                            aria-expanded={isExpanded}
                            aria-controls={isExpanded ? `expanded-content-${row.id}` : undefined}
                            aria-describedby={isExpanded ? `expanded-content-${row.id}` : undefined}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: isRowDisabled ? 'not-allowed' : 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: isRowDisabled ? 0.5 : 1,
                              outline: 'none',
                              transition: 'all 0.2s ease',
                            }}
                            onFocus={e => {
                              if (!isRowDisabled) {
                                applyFocusStyle(e.currentTarget);
                              }
                            }}
                            onBlur={e => {
                              if (!isRowDisabled) {
                                removeFocusStyle(e.currentTarget);
                              }
                            }}
                            onMouseEnter={e => {
                              if (!isRowDisabled) {
                                e.currentTarget.style.backgroundColor = COLORS.neutral[100];
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isRowDisabled) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {getExpansionIcon(isExpanded, isRowDisabled)}
                          </button>
                        )}
                      </td>
                    )}

                    {/* Selection cell */}
                    {selectable && (
                      <td
                        role="cell"
                        style={{
                          padding: currentDensity.padding,
                          textAlign: 'center',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                          disabled={isRowDisabled}
                          tabIndex={isRowDisabled ? -1 : undefined}
                          aria-label={`Select row ${row.id}`}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: isRowDisabled ? 'not-allowed' : 'pointer',
                            outline: 'none',
                          }}
                          onFocus={e => {
                            if (!isRowDisabled) {
                              applyFocusStyle(e.currentTarget);
                            }
                          }}
                          onBlur={e => {
                            if (!isRowDisabled) {
                              removeFocusStyle(e.currentTarget);
                            }
                          }}
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map(column => {
                      const cellValue = getCellValue(column, row);
                      const renderedValue = column.render
                        ? column.render(cellValue, row.data, rowIndex)
                        : cellValue;

                      // Build headers attribute for complex tables
                      const headersAttr = column.parentHeaderId
                        ? [column.parentHeaderId, column.id, ...(column.additionalHeaderIds || [])]
                            .filter(Boolean)
                            .join(' ')
                        : column.additionalHeaderIds && column.additionalHeaderIds.length > 0
                          ? [column.id, ...column.additionalHeaderIds].filter(Boolean).join(' ')
                          : undefined;

                      return (
                        <td
                          key={column.id}
                          role="cell"
                          headers={headersAttr}
                          style={{
                            padding: currentDensity.padding,
                            textAlign: column.align || 'left',
                            fontSize: currentDensity.fontSize,
                            color: COLORS.neutral[700],
                          }}
                        >
                          {renderedValue}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expanded row within the same tbody for proper grouping */}
                  {isExpandableRow && isExpanded && (
                    <tr
                      key={`${row.id}-expanded`}
                      role="row"
                      aria-label={`Expanded content for row ${row.id}`}
                      aria-labelledby={`expansion-button-${row.id}`}
                      style={{
                        backgroundColor: COLORS.neutral[50],
                        borderBottom: bordered ? `1px solid ${COLORS.neutral[200]}` : undefined,
                      }}
                    >
                      <td
                        colSpan={
                          columns.length +
                          (expandable && showExpansionColumn ? 1 : 0) +
                          (selectable ? 1 : 0)
                        }
                        style={{
                          padding: currentDensity.padding,
                          borderTop: `1px solid ${COLORS.neutral[200]}`,
                        }}
                        role="cell"
                      >
                        <div
                          ref={element => setExpandedContentRef(row.id, element)}
                          id={`expanded-content-${row.id}`}
                          role="region"
                          aria-label={`Expanded details for row ${row.id}`}
                          aria-live={useAriaLiveRegions ? 'polite' : undefined}
                          aria-atomic="true"
                          tabIndex={-1}
                          style={{
                            padding: `${SPACING[3]} ${SPACING[4]}`,
                            backgroundColor: COLORS.neutral[50],
                            borderRadius: '6px',
                            border: `1px solid ${COLORS.neutral[200]}`,
                            outline: 'none',
                            position: 'relative',
                          }}
                          onFocus={e => {
                            // Add focus indicator when programmatically focused
                            applyFocusStyle(e.currentTarget);
                          }}
                          onBlur={e => {
                            // Remove focus indicator
                            removeFocusStyle(e.currentTarget);
                          }}
                        >
                          {/* Screen reader instructions */}
                          <div
                            className="sr-only"
                            style={{
                              position: 'absolute',
                              width: '1px',
                              height: '1px',
                              padding: 0,
                              margin: '-1px',
                              overflow: 'hidden',
                              clip: 'rect(0, 0, 0, 0)',
                              whiteSpace: 'nowrap',
                              border: 0,
                            }}
                          >
                            Expanded content region. Press Escape to return to the expansion button.
                          </div>

                          {/* Actual content */}
                          <div
                            role="group"
                            aria-label={`Details for ${(row.data as Record<string, unknown>).name || `row ${row.id}`}`}
                          >
                            {row.renderExpanded
                              ? row.renderExpanded(row.data, rowIndex)
                              : row.expandedContent}
                          </div>

                          {/* Return focus helper (invisible but focusable) */}
                          <button
                            type="button"
                            className="sr-only"
                            style={{
                              position: 'absolute',
                              width: '1px',
                              height: '1px',
                              padding: 0,
                              margin: '-1px',
                              overflow: 'hidden',
                              clip: 'rect(0, 0, 0, 0)',
                              whiteSpace: 'nowrap',
                              border: 0,
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                const expansionButton = expansionButtonRefs.current.get(row.id);
                                if (expansionButton) {
                                  expansionButton.focus();
                                }
                              }
                            }}
                            aria-label={`Return focus to expansion button for row ${row.id}`}
                          >
                            Return to expansion button
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })
          )}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

export default Table;
