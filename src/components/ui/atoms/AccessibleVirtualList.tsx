/**
 * AccessibleVirtualList Component
 * 
 * A high-performance virtual scrolling list that maintains full accessibility.
 * Balances performance with focus management for large interactive lists.
 * 
 * Features:
 * - Virtual scrolling for performance (DOM recycling)
 * - Focus restoration after DOM recycling
 * - Roving tabindex for efficient keyboard navigation
 * - Aria-live announcements for scroll position
 * - Keyboard shortcuts (arrows, Home, End, Page Up/Down)
 * - Screen reader support
 * 
 * @example
 * ```tsx
 * <AccessibleVirtualList
 *   items={items}
 *   itemHeight={50}
 *   height={400}
 *   renderItem={(item) => <div>{item.name}</div>}
 *   onItemClick={(item) => console.log(item)}
 * />
 * ```
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface AccessibleVirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  
  /** Height of each item in pixels */
  itemHeight: number;
  
  /** Height of the visible container in pixels */
  height: number;
  
  /** Width of the container (default: '100%') */
  width?: string | number;
  
  /** Function to render each item */
  renderItem: (item: T, index: number, isFocused: boolean) => React.ReactNode;
  
  /** Callback when an item is clicked or activated */
  onItemClick?: (item: T, index: number) => void;
  
  /** Aria label for the list */
  ariaLabel?: string;
  
  /** Whether to announce scroll position to screen readers */
  announceScroll?: boolean;
  
  /** Custom scroll announcement message */
  scrollAnnouncementMessage?: (firstIndex: number, lastIndex: number, total: number) => string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Loading message */
  loadingMessage?: string;
  
  /** Class name for the container */
  className?: string;
}

interface FocusState {
  itemId: string | null;
  itemIndex: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AccessibleVirtualList = <T extends { id: string }>({
  items,
  itemHeight,
  height,
  width = '100%',
  renderItem,
  onItemClick,
  ariaLabel,
  announceScroll = true,
  scrollAnnouncementMessage,
  loading = false,
  loadingMessage = 'Loading more items...',
  className = '',
}: AccessibleVirtualListProps<T>) => {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const focusStateRef = useRef<FocusState>({ itemId: null, itemIndex: -1 });
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const visibleCount = Math.ceil(height / itemHeight);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2); // Overscan
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + 4); // Overscan
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // ============================================================================
  // FOCUS RESTORATION
  // ============================================================================

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement;
    if (activeElement?.hasAttribute('data-item-id')) {
      focusStateRef.current = {
        itemId: activeElement.getAttribute('data-item-id'),
        itemIndex: parseInt(activeElement.getAttribute('data-item-index') || '-1'),
      };
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const { itemId, itemIndex } = focusStateRef.current;
    
    requestAnimationFrame(() => {
      // Try to find by ID first
      let element = itemId 
        ? document.querySelector(`[data-item-id="${itemId}"]`)
        : null;
      
      // Fallback to index
      if (!element && itemIndex >= 0) {
        element = document.querySelector(`[data-item-index="${itemIndex}"]`);
      }
      
      if (element instanceof HTMLElement) {
        element.focus();
      }
    });
  }, []);

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    
    const targetScrollTop = index * itemHeight;
    const maxScrollTop = totalHeight - height;
    const clampedScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
    
    containerRef.current.scrollTop = clampedScrollTop;
  }, [itemHeight, totalHeight, height]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(index + 1, items.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(index - 1, 0);
        break;
      case 'PageDown':
        e.preventDefault();
        newIndex = Math.min(index + visibleCount, items.length - 1);
        break;
      case 'PageUp':
        e.preventDefault();
        newIndex = Math.max(index - visibleCount, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onItemClick?.(items[index], index);
        return;
      default:
        return;
    }

    if (newIndex !== index) {
      setFocusedIndex(newIndex);
      scrollToIndex(newIndex);
      
      // Announce navigation
      if (announceScroll) {
        const message = `Item ${newIndex + 1} of ${items.length}`;
        setAnnouncement(message);
        setTimeout(() => setAnnouncement(''), 1000);
      }
    }
  }, [items, onItemClick, visibleCount, scrollToIndex, announceScroll]);

  // ============================================================================
  // SCROLL HANDLING
  // ============================================================================

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    
    saveFocus();
    
    if (!announceScroll) return;
    
    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Debounce scroll announcements (500ms)
    scrollTimeoutRef.current = setTimeout(() => {
      const firstVisibleIndex = Math.floor(newScrollTop / itemHeight);
      const lastVisibleIndex = Math.min(
        firstVisibleIndex + visibleCount - 1,
        items.length - 1
      );
      
      const message = scrollAnnouncementMessage
        ? scrollAnnouncementMessage(firstVisibleIndex + 1, lastVisibleIndex + 1, items.length)
        : `Showing items ${firstVisibleIndex + 1} to ${lastVisibleIndex + 1} of ${items.length}`;
      
      setAnnouncement(message);
      
      setTimeout(() => {
        setAnnouncement('');
        restoreFocus();
      }, 1000);
    }, 500);
  }, [items.length, itemHeight, visibleCount, announceScroll, scrollAnnouncementMessage, saveFocus, restoreFocus]);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={className}>
      {/* Screen reader announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
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
        {announcement}
      </div>

      {/* Loading announcement */}
      {loading && (
        <div
          role="status"
          aria-live="polite"
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
          {loadingMessage}
        </div>
      )}

      {/* Virtual list container */}
      <div
        ref={containerRef}
        role="list"
        aria-label={ariaLabel || `List with ${items.length} items`}
        tabIndex={0}
        onScroll={handleScroll}
        style={{
          height,
          width,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {/* Spacer for total height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible items */}
          {visibleItems.map((item, i) => {
            const actualIndex = startIndex + i;
            const isFocused = actualIndex === focusedIndex;
            const offsetTop = actualIndex * itemHeight;

            return (
              <div
                key={item.id}
                role="listitem"
                data-item-id={item.id}
                data-item-index={actualIndex}
                tabIndex={isFocused ? 0 : -1}
                onKeyDown={(e) => handleKeyDown(e, actualIndex)}
                onFocus={() => setFocusedIndex(actualIndex)}
                onClick={() => onItemClick?.(item, actualIndex)}
                style={{
                  position: 'absolute',
                  top: offsetTop,
                  left: 0,
                  right: 0,
                  height: itemHeight,
                }}
              >
                {renderItem(item, actualIndex, isFocused)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AccessibleVirtualList;

