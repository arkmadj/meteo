/**
 * useResponsiveItemsPerPage Hook
 * CSS-based responsive detection for carousel items per page
 * using media queries for better performance than window.innerWidth
 */

import { useState, useEffect } from 'react';

export type ResponsiveBreakpoints = {
  sm: number;
  md: number;
  lg: number;
};

export const useResponsiveItemsPerPage = (breakpoints: ResponsiveBreakpoints): number => {
  const [itemsPerPage, setItemsPerPage] = useState(breakpoints.md);

  useEffect(() => {
    // Media query for mobile (sm)
    const smMediaQuery = window.matchMedia('(max-width: 639px)');
    // Media query for tablet (md)
    const mdMediaQuery = window.matchMedia('(min-width: 640px) and (max-width: 1023px)');
    // Media query for desktop (lg)
    const lgMediaQuery = window.matchMedia('(min-width: 1024px)');

    const updateItemsPerPage = () => {
      if (smMediaQuery.matches) {
        setItemsPerPage(breakpoints.sm);
      } else if (mdMediaQuery.matches) {
        setItemsPerPage(breakpoints.md);
      } else if (lgMediaQuery.matches) {
        setItemsPerPage(breakpoints.lg);
      }
    };

    // Initial check
    updateItemsPerPage();

    // Add listeners for media query changes
    smMediaQuery.addEventListener('change', updateItemsPerPage);
    mdMediaQuery.addEventListener('change', updateItemsPerPage);
    lgMediaQuery.addEventListener('change', updateItemsPerPage);

    // Cleanup
    return () => {
      smMediaQuery.removeEventListener('change', updateItemsPerPage);
      mdMediaQuery.removeEventListener('change', updateItemsPerPage);
      lgMediaQuery.removeEventListener('change', updateItemsPerPage);
    };
  }, [breakpoints]);

  return itemsPerPage;
};
