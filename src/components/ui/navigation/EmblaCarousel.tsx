/**
 * EmblaCarousel Component
 * Modern, accessible carousel component using Embla Carousel
 * with enhanced features for weather app components
 */

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import ClassNames from 'embla-carousel-class-names';
import useEmblaCarousel from 'embla-carousel-react';
import WheelGestures from 'embla-carousel-wheel-gestures';
import React, { useCallback, useEffect, useState } from 'react';

export interface EmblaCarouselProps {
  /** Carousel slides/children */
  children: React.ReactNode;
  /** Embla carousel options */
  options?: EmblaOptionsType;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Enable autoplay */
  autoplay?: boolean;
  /** Autoplay delay in milliseconds */
  autoplayDelay?: number;
  /** Enable wheel/scroll gestures */
  enableWheelGestures?: boolean;
  /** Custom class name */
  className?: string;
  /** Slide class name */
  slideClassName?: string;
  /** Container class name */
  containerClassName?: string;
  /** Arrow button class name */
  arrowClassName?: string;
  /** Dot indicator class name */
  dotClassName?: string;
  /** ARIA label for the carousel */
  ariaLabel?: string;
  /** Callback when slide changes */
  onSlideChange?: (index: number) => void;
  /** Callback when carousel is initialized */
  onInit?: (embla: EmblaCarouselType) => void;
}

const EmblaCarousel: React.FC<EmblaCarouselProps> = ({
  children,
  options = { loop: false, align: 'start' },
  showArrows = true,
  showDots = true,
  autoplay = false,
  autoplayDelay = 4000,
  enableWheelGestures = true,
  className = '',
  slideClassName = '',
  containerClassName = '',
  arrowClassName = '',
  dotClassName = '',
  ariaLabel = 'Carousel',
  onSlideChange,
  onInit,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  // Configure plugins
  const plugins = [];

  if (autoplay) {
    plugins.push(Autoplay({ delay: autoplayDelay, stopOnInteraction: false }));
  }

  plugins.push(ClassNames());

  if (enableWheelGestures) {
    plugins.push(WheelGestures());
  }

  const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(
    (emblaApi: EmblaCarouselType) => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());

      if (onSlideChange) {
        onSlideChange(emblaApi.selectedScrollSnap());
      }
    },
    [onSlideChange]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!emblaApi) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          scrollPrev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          scrollNext();
          break;
        case 'Home':
          event.preventDefault();
          scrollTo(0);
          break;
        case 'End':
          event.preventDefault();
          scrollTo(scrollSnaps.length - 1);
          break;
      }
    },
    [emblaApi, scrollPrev, scrollNext, scrollTo, scrollSnaps.length]
  );

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);

    if (onInit) {
      onInit(emblaApi);
    }

    return () => {
      emblaApi.off('reInit', onSelect);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect, onInit]);

  const slides = React.Children.toArray(children);

  return (
    <div
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={`relative bg-transparent ${className}`}
      role="region"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {/* Carousel Viewport */}
      <div
        ref={emblaRef}
        className={`overflow-hidden rounded-xl p-4 max-md:p-2 ${containerClassName}`}
      >
        <div className="flex touch-pan-y touch-pinch-zoom -ml-4">
          {slides.map((slide, index) => (
            <div
              key={index}
              aria-label={`${index + 1} of ${slides.length}`}
              aria-roledescription="slide"
              className={`flex-shrink-0 flex-grow-0 min-w-0 translate-z-0 ${slideClassName}`}
              role="group"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            className={`
              absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10
              w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg
              shadow-md hover:shadow-lg hover:scale-110
              ${
                prevBtnDisabled
                  ? 'opacity-30 cursor-not-allowed scale-100'
                  : 'opacity-80 hover:opacity-100 cursor-pointer'
              }
              ${arrowClassName}
            `}
            disabled={prevBtnDisabled}
            onClick={scrollPrev}
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-700 dark:text-gray-50" />
          </button>

          <button
            aria-label="Next slide"
            className={`
              absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10
              w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg
              shadow-md hover:shadow-lg hover:scale-110
              ${
                nextBtnDisabled
                  ? 'opacity-30 cursor-not-allowed scale-100'
                  : 'opacity-80 hover:opacity-100 cursor-pointer'
              }
              ${arrowClassName}
            `}
            disabled={nextBtnDisabled}
            onClick={scrollNext}
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-700 dark:text-gray-50" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && slides.length > 1 && scrollSnaps.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              aria-current={index === selectedIndex ? 'true' : 'false'}
              aria-label={`Go to slide ${index + 1}`}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  index === selectedIndex
                    ? 'bg-blue-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }
                ${dotClassName}
              `}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmblaCarousel;
