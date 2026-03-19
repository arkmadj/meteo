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

import { COLORS, SHADOWS } from '@/design-system/tokens';

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
      className={`embla-enhanced relative ${className}`}
      role="region"
    >
      {/* Progress Bar */}
      {showProgress && (
        <div className="embla__progress mb-4">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Header with Counter and Autoplay Controls */}
      {(showCounter || showAutoplayControls) && (
        <div className="embla__header flex justify-between items-center mb-4">
          {showCounter && (
            <div className="embla__counter text-sm text-gray-600">
              {selectedIndex + 1} / {slides.length}
            </div>
          )}

          {showAutoplayControls && autoplay && (
            <button
              aria-label={isAutoplayActive ? 'Pause autoplay' : 'Start autoplay'}
              className="embla__autoplay-btn flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={toggleAutoplay}
            >
              {isAutoplayActive ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
              <span className="text-sm">{isAutoplayActive ? 'Pause' : 'Play'}</span>
            </button>
          )}
        </div>
      )}

      {/* Carousel Viewport */}
      <div ref={emblaRef} className="embla__viewport overflow-hidden rounded-lg">
        <div className="embla__container flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              aria-label={`${index + 1} of ${slides.length}`}
              aria-roledescription="slide"
              className="embla__slide flex-shrink-0 flex-grow-0 min-w-0"
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
              embla__prev absolute left-2 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${
                prevBtnDisabled
                  ? 'opacity-30 cursor-not-allowed'
                  : 'opacity-80 hover:opacity-100 cursor-pointer hover:scale-110'
              }
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
              embla__next absolute right-2 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${
                nextBtnDisabled
                  ? 'opacity-30 cursor-not-allowed'
                  : 'opacity-80 hover:opacity-100 cursor-pointer hover:scale-110'
              }
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
