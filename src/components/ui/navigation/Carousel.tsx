/**
 * Carousel Component
 * Accessible, responsive carousel component for presenting the 7-day forecast
 * with keyboard navigation, touch support, and consistent design
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useTheme } from '@/design-system/theme';

export type CarouselOrientation = 'horizontal' | 'vertical';
export type CarouselAlignment = 'start' | 'center' | 'end';
export type CarouselSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CarouselProps {
  /** Carousel items */
  children: React.ReactNode;
  /** Orientation of the carousel */
  orientation?: CarouselOrientation;
  /** Number of items to show at once */
  itemsPerPage?: number;
  /** Spacing between items */
  spacing?: CarouselSpacing;
  /** Alignment of items */
  align?: CarouselAlignment;
  /** Show navigation controls */
  showControls?: boolean;
  /** Show pagination dots */
  showDots?: boolean;
  /** Enable infinite scrolling */
  infinite?: boolean;
  /** Enable autoplay */
  autoplay?: boolean;
  /** Autoplay interval in milliseconds */
  autoplayInterval?: number;
  /** Enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Enable touch/swipe navigation */
  touchNavigation?: boolean;
  /** Custom class name */
  className?: string;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  orientation = 'horizontal',
  itemsPerPage = 1,
  spacing = 'md',
  align = 'center',
  showControls = true,
  showDots = true,
  infinite = true,
  autoplay = false,
  autoplayInterval = 5000,
  keyboardNavigation = true,
  touchNavigation = true,
  className = '',
  onPageChange,
}) => {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Convert children to array for easier manipulation
  const items = React.Children.toArray(children);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Handle autoplay
  const startAutoplay = useCallback(() => {
    if (autoplay && !isPaused) {
      autoplayRef.current = setInterval(() => {
        setCurrentPage(prev => {
          const nextPage = infinite ? (prev + 1) % totalPages : Math.min(prev + 1, totalPages - 1);
          onPageChange?.(nextPage);
          return nextPage;
        });
      }, autoplayInterval);
    }
  }, [autoplay, isPaused, infinite, totalPages, autoplayInterval, onPageChange]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  // Autoplay lifecycle
  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!carouselRef.current?.contains(document.activeElement)) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextPage();
          break;
        case 'Home':
          event.preventDefault();
          goToPage(0);
          break;
        case 'End':
          event.preventDefault();
          goToPage(totalPages - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardNavigation, totalPages, goToNextPage, goToPreviousPage, goToPage]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!touchNavigation) return;
    setTouchStart(e.targetTouches?.[0].clientX);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchNavigation) return;
    setTouchEnd(e.targetTouches?.[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchNavigation) return;
    setIsPaused(false);

    const diff = touchStart - touchEnd;
    const threshold = 50; // Minimum swipe distance

    if (diff > threshold) {
      goToNextPage();
    } else if (diff < -threshold) {
      goToPreviousPage();
    }
  };

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      const boundedPage = Math.max(0, Math.min(page, totalPages - 1));
      setCurrentPage(boundedPage);
      onPageChange?.(boundedPage);
    },
    [totalPages, onPageChange]
  );

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => {
      const nextPage = infinite ? (prev + 1) % totalPages : Math.min(prev + 1, totalPages - 1);
      onPageChange?.(nextPage);
      return nextPage;
    });
  }, [infinite, totalPages, onPageChange]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => {
      const prevPage = infinite ? (prev - 1 + totalPages) % totalPages : Math.max(prev - 1, 0);
      onPageChange?.(prevPage);
      return prevPage;
    });
  }, [infinite, totalPages, onPageChange]);

  // Calculate transform
  const getTransform = () => {
    const offset = currentPage * itemsPerPage;
    const direction = orientation === 'horizontal' ? 'translateX' : 'translateY';
    const percentage = orientation === 'horizontal' ? '-100%' : '-100%';
    return `${direction}(${offset * parseInt(percentage)})`;
  };

  // Get alignment classes
  const getAlignmentClasses = () => {
    const alignmentMap = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
    };
    return alignmentMap?.[align];
  };

  // Render navigation controls
  const renderControls = () => {
    if (!showControls) return null;

    return (
      <>
        <button
          aria-label="Previous slide"
          className={`
            absolute left-2 top-1/2 -translate-y-1/2 z-10
            flex items-center justify-center w-10 h-10
            bg-white/80 backdrop-blur-sm rounded-full
            border border-gray-200 shadow-sm
            hover:bg-white hover:shadow-md
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[${theme.primaryColor}]
          `}
          disabled={!infinite && currentPage === 0}
          onClick={goToPreviousPage}
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>

        <button
          aria-label="Next slide"
          className={`
            absolute right-2 top-1/2 -translate-y-1/2 z-10
            flex items-center justify-center w-10 h-10
            bg-white/80 backdrop-blur-sm rounded-full
            border border-gray-200 shadow-sm
            hover:bg-white hover:shadow-md
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[${theme.primaryColor}]
          `}
          disabled={!infinite && currentPage === totalPages - 1}
          onClick={goToNextPage}
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </button>
      </>
    );
  };

  // Render pagination dots
  const renderDots = () => {
    if (!showDots || totalPages <= 1) return null;

    return (
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            aria-current={index === currentPage ? 'true' : 'false'}
            aria-label={`Go to slide ${index + 1}`}
            className={`
              w-2 h-2 rounded-full transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[${theme.primaryColor}]
              ${
                index === currentPage
                  ? `bg-[${theme.primaryColor}] w-8`
                  : 'bg-gray-300 hover:bg-gray-400'
              }
            `}
            onClick={() => goToPage(index)}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={carouselRef}
      aria-label="7-day weather forecast"
      aria-roledescription="carousel"
      className={`
        relative w-full
        ${orientation === 'horizontal' ? 'overflow-x-hidden' : 'overflow-y-hidden'}
        ${className}
      `}
      role="region"
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      {/* Carousel track */}
      <div
        className={`
          flex ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'}
          ${getAlignmentClasses()}
          transition-transform duration-300 ease-in-out
          ${spacing !== 'none' ? `gap-${spacing}` : ''}
        `}
        style={{
          transform: getTransform(),
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={`
              flex-shrink-0
              ${orientation === 'horizontal' ? 'w-full' : 'h-full'}
            `}
            style={{
              flexBasis:
                orientation === 'horizontal'
                  ? `calc(100% / ${itemsPerPage})`
                  : `calc(100% / ${itemsPerPage})`,
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      {renderControls()}

      {/* Pagination dots */}
      {renderDots()}
    </div>
  );
};

export default Carousel;
