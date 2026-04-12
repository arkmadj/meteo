/**
 * EmblaCarouselPlugins
 * Enhanced Embla Carousel with additional plugins and features
 * for weather app specific functionality
 */

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import ClassNames from 'embla-carousel-class-names';
import useEmblaCarousel from 'embla-carousel-react';
import WheelGestures from 'embla-carousel-wheel-gestures';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface EmblaCarouselPluginsProps {
  /** Carousel slides/children */
  children: React.ReactNode;
  /** Embla carousel options */
  options?: EmblaOptionsType;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
  /** Show slide counter */
  showCounter?: boolean;
  /** Enable autoplay */
  autoplay?: boolean;
  /** Autoplay delay in milliseconds */
  autoplayDelay?: number;
  /** Show autoplay controls */
  showAutoplayControls?: boolean;
  /** Enable wheel/scroll gestures */
  enableWheelGestures?: boolean;
  /** Enable drag free mode */
  dragFree?: boolean;
  /** Custom class name */
  className?: string;
  /** ARIA label for the carousel */
  ariaLabel?: string;
  /** Callback when slide changes */
  onSlideChange?: (index: number) => void;
  /** Callback when autoplay starts/stops */
  onAutoplayToggle?: (isPlaying: boolean) => void;
}

const EmblaCarouselPlugins: React.FC<EmblaCarouselPluginsProps> = ({
  children,
  options = { loop: false, align: 'start' },
  showArrows = true,
  showDots = true,
  showProgress = false,
  showCounter = false,
  autoplay = false,
  autoplayDelay = 4000,
  showAutoplayControls = false,
  enableWheelGestures = true,
  dragFree = false,
  className = '',
  ariaLabel = 'Enhanced Carousel',
  onSlideChange,
  onAutoplayToggle,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [isAutoplayActive, setIsAutoplayActive] = useState(autoplay);
  const [scrollProgress, setScrollProgress] = useState(0);

  const autoplayRef = useRef<unknown>(null);

  // Configure enhanced options
  const enhancedOptions: EmblaOptionsType = {
    ...options,
    dragFree,
  };

  // Configure plugins
  const plugins = [];

  if (autoplay) {
    autoplayRef.current = Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      playOnInit: true,
    });
    plugins.push(autoplayRef.current);
  }

  plugins.push(
    ClassNames({
      snapped: 'embla__slide--snapped',
      inView: 'embla__slide--in-view',
    })
  );

  if (enableWheelGestures) {
    plugins.push(WheelGestures());
  }

  const [emblaRef, emblaApi] = useEmblaCarousel(enhancedOptions, plugins);

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

  const toggleAutoplay = useCallback(() => {
    if (!autoplayRef.current) return;

    const autoplayPlugin = autoplayRef.current as { stop: () => void; play: () => void };
    if (isAutoplayActive) {
      autoplayPlugin.stop();
      setIsAutoplayActive(false);
    } else {
      autoplayPlugin.play();
      setIsAutoplayActive(true);
    }

    if (onAutoplayToggle) {
      onAutoplayToggle(!isAutoplayActive);
    }
  }, [isAutoplayActive, onAutoplayToggle]);

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

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress * 100);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    onScroll(emblaApi);
    setScrollSnaps(emblaApi.scrollSnapList());

    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
    emblaApi.on('scroll', onScroll);

    return () => {
      emblaApi.off('reInit', onSelect);
      emblaApi.off('select', onSelect);
      emblaApi.off('scroll', onScroll);
    };
  }, [emblaApi, onSelect, onScroll]);

  const slides = React.Children.toArray(children);

  return (
    <div
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={`relative bg-transparent ${className}`}
      role="region"
    >
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-4">
          <div className="relative w-full h-1 bg-gray-200/80 dark:bg-gray-600/80 rounded-sm overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-sm transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Header with Counter and Autoplay Controls */}
      {(showCounter || showAutoplayControls) && (
        <div className="flex justify-between items-center mb-4">
          {showCounter && (
            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {selectedIndex + 1} / {slides.length}
            </div>
          )}

          {showAutoplayControls && autoplay && (
            <button
              aria-label={isAutoplayActive ? 'Pause autoplay' : 'Start autoplay'}
              className="flex items-center gap-2 px-3 py-2 rounded-md
                bg-gray-100/80 dark:bg-gray-600/80
                hover:bg-gray-200/90 dark:hover:bg-gray-600/90
                hover:-translate-y-0.5
                text-gray-700 dark:text-gray-50 text-sm
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={toggleAutoplay}
            >
              {isAutoplayActive ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
              <span>{isAutoplayActive ? 'Pause' : 'Play'}</span>
            </button>
          )}
        </div>
      )}

      {/* Carousel Viewport */}
      <div ref={emblaRef} className="overflow-hidden rounded-2xl shadow-md">
        <div className="flex touch-pan-y touch-pinch-zoom -ml-4">
          {slides.map((slide, index) => (
            <div
              key={index}
              aria-label={`${index + 1} of ${slides.length}`}
              aria-roledescription="slide"
              className="flex-shrink-0 flex-grow-0 min-w-0 pl-4 translate-z-0 transition-all duration-300 ease-out opacity-100 scale-100"
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
              absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10
              w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg
              shadow-md hover:shadow-lg
              ${
                prevBtnDisabled
                  ? 'opacity-30 cursor-not-allowed scale-100'
                  : 'opacity-80 hover:opacity-100 cursor-pointer hover:scale-110'
              }
            `}
            disabled={prevBtnDisabled}
            onClick={scrollPrev}
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-700 dark:text-gray-50" />
          </button>

          <button
            aria-label="Next slide"
            className={`
              absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10
              w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg
              shadow-md hover:shadow-lg
              ${
                nextBtnDisabled
                  ? 'opacity-30 cursor-not-allowed scale-100'
                  : 'opacity-80 hover:opacity-100 cursor-pointer hover:scale-110'
              }
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
        <div className="flex justify-center items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              aria-current={index === selectedIndex ? 'true' : 'false'}
              aria-label={`Go to slide ${index + 1}`}
              className={`
                w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-200 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  index === selectedIndex
                    ? 'bg-blue-500 dark:bg-blue-400 scale-125'
                    : 'bg-gray-400/60 dark:bg-gray-400/40 hover:bg-gray-500/80 dark:hover:bg-gray-400/60 hover:scale-110'
                }
              `}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmblaCarouselPlugins;
