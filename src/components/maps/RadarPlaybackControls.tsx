/**
 * RadarPlaybackControls Component
 *
 * Timeline controls for radar playback with play/pause, speed control,
 * and frame scrubbing.
 *
 * Performance optimizations:
 * - Debounced frame scrubbing to reduce re-renders
 * - Memoized callbacks and computed values
 * - React.memo with custom comparison
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';

import { useTheme } from '@/design-system/theme';
import type { RadarFrame } from './RadarPlayback';
import { useMapResponsive, useMapCompactMode } from '@/hooks/useMapResponsive';

export interface RadarPlaybackControlsProps {
  /** Current frame index */
  currentFrame: number;
  /** Total number of frames */
  totalFrames: number;
  /** Whether playback is active */
  isPlaying: boolean;
  /** Current playback speed (fps) */
  speed: number;
  /** Available speed options */
  speedOptions?: number[];
  /** Radar frames for timeline labels */
  frames?: RadarFrame[];
  /** Show timeline scrubber */
  showTimeline?: boolean;
  /** Show speed control */
  showSpeedControl?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Position on map */
  position?: 'top' | 'bottom';
  /** Callback when play/pause is toggled */
  onPlayPause: () => void;
  /** Callback when frame is changed */
  onFrameChange: (frameIndex: number) => void;
  /** Callback when speed is changed */
  onSpeedChange: (speed: number) => void;
  /** Callback when next frame is requested */
  onNextFrame?: () => void;
  /** Callback when previous frame is requested */
  onPreviousFrame?: () => void;
  /** Custom className */
  className?: string;
}

/**
 * RadarPlaybackControls Component (Optimized)
 */
const RadarPlaybackControls: React.FC<RadarPlaybackControlsProps> = React.memo(
  ({
    currentFrame,
    totalFrames,
    isPlaying,
    speed,
    speedOptions = [1, 2, 4, 8],
    frames = [],
    showTimeline = true,
    showSpeedControl = true,
    compact = false,
    position = 'bottom',
    onPlayPause,
    onFrameChange,
    onSpeedChange,
    onNextFrame,
    onPreviousFrame,
    className = '',
  }) => {
    const { theme } = useTheme();
    const responsive = useMapResponsive();
    const autoCompact = useMapCompactMode();
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Use responsive compact mode if not explicitly set
    const isCompact = compact || autoCompact;

    // Memoize theme-dependent styles
    const styles = useMemo(() => {
      const isDark = theme.isDark;
      return {
        bgColor: isDark ? 'bg-gray-800/95' : 'bg-white/95',
        textColor: isDark ? 'text-gray-100' : 'text-gray-900',
        secondaryTextColor: isDark ? 'text-gray-400' : 'text-gray-600',
        borderColor: isDark ? 'border-gray-700' : 'border-gray-200',
        buttonBg: isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
        activeBg: isDark ? 'bg-blue-600' : 'bg-blue-500',
        progressColor: isDark ? '#3B82F6' : '#2563EB',
        trackColor: isDark ? '#374151' : '#E5E7EB',
      };
    }, [theme.isDark]);

    // Memoize position classes
    const positionClasses = useMemo(
      () =>
        position === 'top'
          ? 'top-4 left-1/2 -translate-x-1/2'
          : 'bottom-4 left-1/2 -translate-x-1/2',
      [position]
    );

    // Memoize current frame data and progress
    const currentFrameData = useMemo(() => frames[currentFrame], [frames, currentFrame]);
    const progress = useMemo(
      () => (totalFrames > 0 ? (currentFrame / (totalFrames - 1)) * 100 : 0),
      [currentFrame, totalFrames]
    );

    // Debounced frame change handler
    const handleFrameChangeDebounced = useCallback(
      (frameIndex: number) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          onFrameChange(frameIndex);
        }, 16); // ~60fps debounce
      },
      [onFrameChange]
    );

    // Cleanup debounce timer
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    return (
      <div
        className={`radar-controls map-control absolute ${positionClasses} z-[1000] ${className}`}
        style={{
          pointerEvents: 'auto',
          bottom:
            responsive.isMobile && position === 'bottom'
              ? `${responsive.safeAreaInsets.bottom + 8}px`
              : undefined,
        }}
      >
        <div
          className={`radar-controls-compact map-control-panel ${styles.bgColor} ${styles.borderColor} rounded-lg shadow-2xl border-2 backdrop-blur-sm ${
            isCompact ? 'p-2' : 'p-3'
          } ${isCompact ? 'min-w-[300px]' : 'min-w-[400px]'} max-w-[600px]`}
        >
          <div className="space-y-3">
            {/* Timeline Scrubber */}
            {showTimeline && (
              <div className="space-y-2">
                {/* Time Label */}
                {currentFrameData && (
                  <div className={`text-center text-sm font-medium ${styles.textColor}`}>
                    {currentFrameData.label}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="radar-timeline relative">
                  <input
                    type="range"
                    min="0"
                    max={totalFrames - 1}
                    value={currentFrame}
                    onChange={e => handleFrameChangeDebounced(parseInt(e.target.value))}
                    className="radar-timeline-slider w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${styles.progressColor} 0%, ${styles.progressColor} ${progress}%, ${styles.trackColor} ${progress}%, ${styles.trackColor} 100%)`,
                    }}
                  />

                  {/* Frame Markers */}
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs ${styles.secondaryTextColor}`}>
                      {frames[0]?.label || 'Start'}
                    </span>
                    <span className={`text-xs ${styles.secondaryTextColor}`}>
                      {frames[totalFrames - 1]?.label || 'End'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="radar-controls-buttons flex items-center justify-center space-x-2">
              {/* Previous Frame */}
              <button
                onClick={onPreviousFrame}
                className={`radar-nav-button map-button ${styles.buttonBg} ${styles.textColor} rounded-lg p-2 transition-colors`}
                style={{
                  minWidth: responsive.controlSizes.buttonSize,
                  minHeight: responsive.controlSizes.buttonSize,
                }}
                title="Previous frame"
                aria-label="Previous frame"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={onPlayPause}
                className={`radar-play-button map-button ${isPlaying ? styles.activeBg : styles.buttonBg} text-white rounded-lg p-3 transition-colors`}
                style={{
                  minWidth: responsive.controlSizes.buttonSize + 12,
                  minHeight: responsive.controlSizes.buttonSize + 12,
                }}
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Next Frame */}
              <button
                onClick={onNextFrame}
                className={`radar-nav-button map-button ${styles.buttonBg} ${styles.textColor} rounded-lg p-2 transition-colors`}
                style={{
                  minWidth: responsive.controlSizes.buttonSize,
                  minHeight: responsive.controlSizes.buttonSize,
                }}
                title="Next frame"
                aria-label="Next frame"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Speed Control */}
              {showSpeedControl && (
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`text-sm ${styles.secondaryTextColor}`}>Speed:</span>
                  <div className="flex space-x-1">
                    {speedOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => onSpeedChange(option)}
                        className={`radar-speed-button map-button ${
                          speed === option
                            ? styles.activeBg + ' text-white'
                            : styles.buttonBg + ' ' + styles.textColor
                        } rounded px-2 py-1 text-sm transition-colors`}
                        style={{
                          minWidth: responsive.controlSizes.buttonSize,
                          minHeight: responsive.controlSizes.buttonSize,
                        }}
                        title={`${option}x speed`}
                        aria-label={`${option}x speed`}
                      >
                        {option}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Frame Counter */}
            {!isCompact && (
              <div className={`text-center text-xs ${styles.secondaryTextColor}`}>
                Frame {currentFrame + 1} of {totalFrames}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for React.memo optimization
    return (
      prevProps.currentFrame === nextProps.currentFrame &&
      prevProps.totalFrames === nextProps.totalFrames &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.speed === nextProps.speed &&
      prevProps.showTimeline === nextProps.showTimeline &&
      prevProps.showSpeedControl === nextProps.showSpeedControl &&
      prevProps.compact === nextProps.compact &&
      prevProps.position === nextProps.position &&
      prevProps.frames.length === nextProps.frames.length
    );
  }
);

RadarPlaybackControls.displayName = 'RadarPlaybackControls';

export default RadarPlaybackControls;
