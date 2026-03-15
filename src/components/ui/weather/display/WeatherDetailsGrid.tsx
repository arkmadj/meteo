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

    // Reset heights so we measure each card's natural height first
    cardElements.forEach(card => {
      card.style.height = 'auto';
    });

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
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      <h3 className="text-base sm:text-lg font-semibold text-[var(--theme-text)] mb-4 sm:mb-6 text-center px-4">
        {title}
      </h3>

      {/* Responsive Grid with Consistent Height */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 auto-rows px-4 sm:px-0"
      >
        {children}
      </div>
    </div>
  );
};

export default WeatherDetailsGrid;
