/**
 * Custom Scrollbar Component
 * A React wrapper component that provides custom scrollbar styling
 * matching the SearchEngine UI design patterns
 */

import React, { forwardRef, useEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

export type ScrollbarVariant = 'default' | 'thin' | 'thick' | 'autocomplete';
export type ScrollbarBehavior = 'auto' | 'always' | 'hidden';

export interface CustomScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Scrollbar variant style */
  variant?: ScrollbarVariant;
  /** Scrollbar visibility behavior */
  behavior?: ScrollbarBehavior;
  /** Maximum height of the scrollable area */
  maxHeight?: string | number;
  /** Maximum width of the scrollable area */
  maxWidth?: string | number;
  /** Whether to enable smooth scrolling */
  smoothScroll?: boolean;
  /** Whether to add scroll padding */
  scrollPadding?: boolean;
  /** Whether to show fade-in animation */
  fadeIn?: boolean;
  /** Whether to show glow effect on hover */
  hoverGlow?: boolean;
  /** Custom scroll position callback */
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  /** Callback when scrolled to top */
  onScrollTop?: () => void;
  /** Callback when scrolled to bottom */
  onScrollBottom?: () => void;
  /** Children to render inside the scrollable area */
  children: React.ReactNode;
}

const CustomScrollbar = forwardRef<HTMLDivElement, CustomScrollbarProps>(
  (
    {
      variant = 'default',
      behavior = 'auto',
      maxHeight,
      maxWidth,
      smoothScroll = true,
      scrollPadding = false,
      fadeIn = false,
      hoverGlow = false,
      onScroll,
      onScrollTop,
      onScrollBottom,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isScrolling, setIsScrolling] = useState(false);
    const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0 });
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const containerRef = useRef<HTMLDivElement>(null);

    // Combine refs
    const combinedRef = (node: HTMLDivElement) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Handle scroll events
    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const { scrollTop, scrollLeft, scrollHeight, clientHeight } = target;

      // Update scroll position
      setScrollPosition({ top: scrollTop, left: scrollLeft });

      // Set scrolling state
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to reset scrolling state
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      // Check for scroll boundaries
      if (scrollTop === 0 && onScrollTop) {
        onScrollTop();
      }

      if (scrollTop + clientHeight >= scrollHeight - 1 && onScrollBottom) {
        onScrollBottom();
      }

      // Call custom onScroll handler
      if (onScroll) {
        onScroll(event);
      }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    // Build CSS classes
    const scrollbarClasses = {
      default: 'custom-scrollbar',
      thin: 'custom-scrollbar-thin',
      thick: 'custom-scrollbar-thick',
      autocomplete: 'autocomplete-scrollbar',
    };

    const behaviorClasses = {
      auto: '',
      always: 'scrollbar-always',
      hidden: 'scrollbar-hide',
    };

    const containerClasses = cn(
      // Base classes
      'relative overflow-auto',

      // Scrollbar variant
      scrollbarClasses?.[variant],

      // Behavior classes
      behaviorClasses?.[behavior],

      // Optional classes
      smoothScroll && 'scroll-smooth',
      scrollPadding && 'scroll-padding',
      fadeIn && 'scrollbar-fade-in',
      hoverGlow && 'scrollbar-hover-glow',

      // Custom className
      className
    );

    // Build inline styles
    const containerStyles: React.CSSProperties = {
      maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
      maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
      ...props.style,
    };

    return (
      <div
        ref={combinedRef}
        className={containerClasses}
        data-scroll-left={scrollPosition.left}
        data-scroll-top={scrollPosition.top}
        data-scrolling={isScrolling}
        style={containerStyles}
        onScroll={handleScroll}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CustomScrollbar.displayName = 'CustomScrollbar';

export default CustomScrollbar;

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to detect scroll position and direction
 */
export const useScrollPosition = (elementRef: React.RefObject<HTMLElement>) => {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(
    null
  );
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (!elementRef.current) return;

    let lastScrollY = elementRef.current.scrollTop;
    let lastScrollX = elementRef.current.scrollLeft;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      const currentScrollY = elementRef.current?.scrollTop || 0;
      const currentScrollX = elementRef.current?.scrollLeft || 0;

      // Update position
      setScrollPosition({ x: currentScrollX, y: currentScrollY });

      // Determine direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      } else if (currentScrollX > lastScrollX) {
        setScrollDirection('right');
      } else if (currentScrollX < lastScrollX) {
        setScrollDirection('left');
      }

      // Set scrolling state
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Reset scrolling state after delay
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        setScrollDirection(null);
      }, 150);

      lastScrollY = currentScrollY;
      lastScrollX = currentScrollX;
    };

    const element = elementRef.current;
    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [elementRef]);

  return { scrollPosition, scrollDirection, isScrolling };
};

/**
 * Hook to scroll to specific position with smooth animation
 */
export const useScrollTo = (elementRef: React.RefObject<HTMLElement>) => {
  const scrollTo = (options: { top?: number; left?: number; behavior?: 'auto' | 'smooth' }) => {
    if (!elementRef.current) return;

    elementRef.current.scrollTo({
      top: options.top,
      left: options.left,
      behavior: options.behavior || 'smooth',
    });
  };

  const scrollToTop = (behavior: 'auto' | 'smooth' = 'smooth') => {
    scrollTo({ top: 0, behavior });
  };

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    if (!elementRef.current) return;
    scrollTo({ top: elementRef.current.scrollHeight, behavior });
  };

  const scrollIntoView = (selector: string, behavior: 'auto' | 'smooth' = 'smooth') => {
    if (!elementRef.current) return;

    const element = elementRef.current.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior, block: 'nearest' });
    }
  };

  return { scrollTo, scrollToTop, scrollToBottom, scrollIntoView };
};
