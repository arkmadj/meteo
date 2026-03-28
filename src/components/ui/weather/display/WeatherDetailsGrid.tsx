import React from 'react';

import { useTheme } from '@/design-system/theme';

export interface WeatherDetailsGridProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({
  children,
  title = 'Weather Details',
  className = '',
}) => {
  const { theme } = useTheme();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Keep all Weather Detail cards at a uniform height based on the tallest card
  // Only sync heights on larger screens (sm and up), let mobile cards be natural height
  const syncCardHeights = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const cardElements = Array.from(
      container.querySelectorAll<HTMLElement>('[data-weather-detail-card-root]')
    );

    if (!cardElements.length) {
      return;
    }

    // Check if we're on mobile (less than 640px)
    const isMobile = window.innerWidth < 640;

    // Reset heights so we measure each card's natural height first
    cardElements.forEach(card => {
      card.style.height = 'auto';
    });

    // On mobile, keep natural heights for better readability
    if (isMobile) {
      return;
    }

    let maxHeight = 0;
    cardElements.forEach(card => {
      const { height } = card.getBoundingClientRect();
      if (height > maxHeight) {
        maxHeight = height;
      }
    });

    if (!maxHeight) {
      return;
    }

    cardElements.forEach(card => {
      card.style.height = `${maxHeight}px`;
    });
  }, []);

  // Recalculate when children or theme change (fonts/colors can subtly affect layout)
  React.useEffect(() => {
    syncCardHeights();
  }, [syncCardHeights, children, theme]);

  // Also keep card heights in sync on window resize
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      syncCardHeights();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [syncCardHeights]);

  return (
    <div className={`space-y-3 sm:space-y-4 md:space-y-6 ${className}`}>
      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[var(--theme-text)] mb-3 sm:mb-4 md:mb-6 text-center px-2 sm:px-4">
        {title}
      </h3>

      {/* Responsive Grid with Consistent Height */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 auto-rows"
      >
        {children}
      </div>
    </div>
  );
};

export default WeatherDetailsGrid;
