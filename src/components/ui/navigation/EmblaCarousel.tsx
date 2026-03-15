/**
 * EmblaCarousel Component
 * Modern, accessible carousel component using Embla Carousel
 * with enhanced features for weather app components
 */

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import ClassNames from 'embla-carousel-class-names';
import useEmblaCarousel from 'embla-carousel-react';
import WheelGestures from 'embla-carousel-wheel-gestures';
import React, { useCallback, useEffect, useState } from 'react';

import { COLORS, SHADOWS } from '@/design-system/tokens';

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
      className={`embla relative ${className}`}
      role="region"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {/* Carousel Viewport */}
      <div ref={emblaRef} className={`embla__viewport overflow-hidden ${containerClassName}`}>
        <div className="embla__container flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              aria-label={`${index + 1} of ${slides.length}`}
              aria-roledescription="slide"
              className={`embla__slide flex-shrink-0 flex-grow-0 ${slideClassName}`}
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
              embla__prev absolute left-4 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${
                prevBtnDisabled
                  ? 'opacity-30 cursor-not-allowed'
                  : 'opacity-80 hover:opacity-100 cursor-pointer'
              }
              ${arrowClassName}
            `}
            disabled={prevBtnDisabled}
            style={{
              backgroundColor: COLORS.glass?.background || 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: SHADOWS.md,
            }}
            onClick={scrollPrev}
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
          </button>

          <button
            aria-label="Next slide"
            className={`
              embla__next absolute right-4 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${
                nextBtnDisabled
                  ? 'opacity-30 cursor-not-allowed'
                  : 'opacity-80 hover:opacity-100 cursor-pointer'
              }
              ${arrowClassName}
            `}
            disabled={nextBtnDisabled}
            style={{
              backgroundColor: COLORS.glass?.background || 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: SHADOWS.md,
            }}
            onClick={scrollNext}
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && slides.length > 1 && scrollSnaps.length > 1 && (
        <div className="embla__dots flex justify-center space-x-2 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              aria-current={index === selectedIndex ? 'true' : 'false'}
              aria-label={`Go to slide ${index + 1}`}
              className={`
                embla__dot w-2 h-2 rounded-full transition-all duration-200
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
