/**
 * Breakpoint Hook
 * Detects current screen size breakpoint for responsive design
 */

import { useEffect, useState } from 'react';

/**
 * Breakpoint types
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Breakpoint values in pixels
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
} as const;

/**
 * Get current breakpoint based on window width
 */
function getCurrentBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.tablet) {
    return 'mobile';
  } else if (width < BREAKPOINTS.desktop) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Hook to detect current breakpoint
 * 
 * @returns Current breakpoint ('mobile', 'tablet', or 'desktop')
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const breakpoint = useBreakpoint();
 *   
 *   return (
 *     <div>
 *       Current breakpoint: {breakpoint}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    // Initialize with current window width (SSR-safe)
    if (typeof window !== 'undefined') {
      return getCurrentBreakpoint(window.innerWidth);
    }
    return 'desktop'; // Default for SSR
  });

  useEffect(() => {
    // Update breakpoint on window resize
    const handleResize = () => {
      const newBreakpoint = getCurrentBreakpoint(window.innerWidth);
      setBreakpoint(newBreakpoint);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return breakpoint;
}

/**
 * Hook to check if current breakpoint matches
 * 
 * @param targetBreakpoint - Breakpoint to check against
 * @returns True if current breakpoint matches target
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isMobile = useBreakpointMatch('mobile');
 *   
 *   return (
 *     <div>
 *       {isMobile ? 'Mobile view' : 'Desktop view'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBreakpointMatch(targetBreakpoint: Breakpoint): boolean {
  const currentBreakpoint = useBreakpoint();
  return currentBreakpoint === targetBreakpoint;
}

/**
 * Hook to check if current breakpoint is at least the target
 * 
 * @param targetBreakpoint - Minimum breakpoint
 * @returns True if current breakpoint is >= target
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isTabletOrLarger = useBreakpointMin('tablet');
 *   
 *   return (
 *     <div>
 *       {isTabletOrLarger ? 'Tablet or Desktop' : 'Mobile'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBreakpointMin(targetBreakpoint: Breakpoint): boolean {
  const currentBreakpoint = useBreakpoint();
  
  const breakpointOrder: Breakpoint[] = ['mobile', 'tablet', 'desktop'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const targetIndex = breakpointOrder.indexOf(targetBreakpoint);
  
  return currentIndex >= targetIndex;
}

/**
 * Hook to check if current breakpoint is at most the target
 * 
 * @param targetBreakpoint - Maximum breakpoint
 * @returns True if current breakpoint is <= target
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isTabletOrSmaller = useBreakpointMax('tablet');
 *   
 *   return (
 *     <div>
 *       {isTabletOrSmaller ? 'Mobile or Tablet' : 'Desktop'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBreakpointMax(targetBreakpoint: Breakpoint): boolean {
  const currentBreakpoint = useBreakpoint();
  
  const breakpointOrder: Breakpoint[] = ['mobile', 'tablet', 'desktop'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const targetIndex = breakpointOrder.indexOf(targetBreakpoint);
  
  return currentIndex <= targetIndex;
}

/**
 * Hook to get responsive value based on breakpoint
 * 
 * @param values - Object with values for each breakpoint
 * @returns Value for current breakpoint
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const padding = useResponsiveValue({
 *     mobile: '12px',
 *     tablet: '16px',
 *     desktop: '20px',
 *   });
 *   
 *   return <div style={{ padding }}>{content}</div>;
 * }
 * ```
 */
export function useResponsiveValue<T>(values: Record<Breakpoint, T>): T {
  const breakpoint = useBreakpoint();
  return values[breakpoint];
}

/**
 * Get window dimensions
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>(() => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return {
      width: 1024,
      height: 768,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Check if device is mobile (touch-enabled)
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkMobile();
  }, []);

  return isMobile;
}

/**
 * Export utility functions
 */
export const breakpointUtils = {
  getCurrentBreakpoint,
  BREAKPOINTS,
};

