/**
 * Radar Frame Utilities
 *
 * Utilities for generating and managing radar animation frames
 * from various weather data sources.
 */

import type { RadarFrame } from '@/components/maps/RadarPlayback';

/**
 * Radar data source types
 */
export type RadarSource = 'openweathermap' | 'rainviewer' | 'custom';

/**
 * Options for generating radar frames
 */
export interface RadarFrameOptions {
  /** Data source for radar tiles */
  source?: RadarSource;
  /** API key (required for some sources) */
  apiKey?: string;
  /** Number of frames to generate */
  frameCount?: number;
  /** Time interval between frames in minutes */
  intervalMinutes?: number;
  /** Start time (defaults to current time) */
  startTime?: Date;
  /** Whether to include future forecast frames */
  includeForecast?: boolean;
}

/**
 * Format timestamp to human-readable label
 */
export const formatFrameLabel = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes === 0) {
    return 'Now';
  } else if (diffMinutes > 0 && diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffMinutes >= 60 && diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ago`;
  } else if (diffMinutes < 0 && Math.abs(diffMinutes) < 60) {
    return `+${Math.abs(diffMinutes)}m`;
  } else if (diffMinutes < 0 && Math.abs(diffMinutes) < 1440) {
    const hours = Math.floor(Math.abs(diffMinutes) / 60);
    return `+${hours}h`;
  }

  // Fallback to time format
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Generate radar frames for OpenWeatherMap
 */
const generateOpenWeatherMapFrames = (
  apiKey: string,
  frameCount: number,
  intervalMinutes: number,
  startTime: Date
): RadarFrame[] => {
  const frames: RadarFrame[] = [];
  const now = startTime.getTime();

  for (let i = 0; i < frameCount; i++) {
    const timestamp = now - (frameCount - 1 - i) * intervalMinutes * 60 * 1000;
    const _date = new Date(timestamp);

    frames.push({
      timestamp,
      tileUrl: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}&date=${Math.floor(timestamp / 1000)}`,
      label: formatFrameLabel(timestamp),
    });
  }

  return frames;
};

/**
 * Generate radar frames for RainViewer
 * RainViewer provides free radar data without API key
 */
const generateRainViewerFrames = async (frameCount: number): Promise<RadarFrame[]> => {
  try {
    // Fetch available radar timestamps from RainViewer API
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    const data = await response.json();

    if (!data.radar || !data.radar.past) {
      throw new Error('No radar data available');
    }

    // Get the most recent frames
    const radarTimestamps = data.radar.past.slice(-frameCount);

    const frames: RadarFrame[] = radarTimestamps.map((item: unknown) => {
      const itemWithProps = item as { time: number; path: string };
      const timestamp = itemWithProps.time * 1000; // Convert to milliseconds
      return {
        timestamp,
        tileUrl: `https://tilecache.rainviewer.com${itemWithProps.path}/256/{z}/{x}/{y}/2/1_1.png`,
        label: formatFrameLabel(timestamp),
      };
    });

    return frames;
  } catch (error) {
    console.error('Failed to fetch RainViewer frames:', error);
    return [];
  }
};

/**
 * Generate sample radar frames for demonstration
 */
const generateSampleFrames = (
  frameCount: number,
  intervalMinutes: number,
  startTime: Date
): RadarFrame[] => {
  const frames: RadarFrame[] = [];
  const now = startTime.getTime();

  for (let i = 0; i < frameCount; i++) {
    const timestamp = now - (frameCount - 1 - i) * intervalMinutes * 60 * 1000;

    frames.push({
      timestamp,
      // Use a placeholder tile service (OpenStreetMap as fallback)
      tileUrl: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,
      label: formatFrameLabel(timestamp),
    });
  }

  return frames;
};

/**
 * Generate radar frames based on source and options
 */
export const generateRadarFrames = async (
  options: RadarFrameOptions = {}
): Promise<RadarFrame[]> => {
  const {
    source = 'rainviewer',
    apiKey,
    frameCount = 10,
    intervalMinutes = 10,
    startTime = new Date(),
    _includeForecast = false,
  } = options;

  try {
    switch (source) {
      case 'openweathermap':
        if (!apiKey) {
          throw new Error('API key required for OpenWeatherMap');
        }
        return generateOpenWeatherMapFrames(apiKey, frameCount, intervalMinutes, startTime);

      case 'rainviewer':
        return await generateRainViewerFrames(frameCount);

      case 'custom':
      default:
        return generateSampleFrames(frameCount, intervalMinutes, startTime);
    }
  } catch (error) {
    console.error('Failed to generate radar frames:', error);
    return generateSampleFrames(frameCount, intervalMinutes, startTime);
  }
};

/**
 * Get radar frame at specific time
 */
export const getFrameAtTime = (frames: RadarFrame[], targetTime: Date): RadarFrame | null => {
  if (frames.length === 0) return null;

  const targetTimestamp = targetTime.getTime();

  // Find closest frame
  let closestFrame = frames[0];
  let minDiff = Math.abs(frames[0].timestamp - targetTimestamp);

  for (const frame of frames) {
    const diff = Math.abs(frame.timestamp - targetTimestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closestFrame = frame;
    }
  }

  return closestFrame;
};

/**
 * Interpolate between two frames for smoother animation
 */
export const interpolateFrames = (
  frame1: RadarFrame,
  frame2: RadarFrame,
  steps: number = 2
): RadarFrame[] => {
  const interpolated: RadarFrame[] = [frame1];
  const timeDiff = frame2.timestamp - frame1.timestamp;

  for (let i = 1; i < steps; i++) {
    const ratio = i / steps;
    const timestamp = frame1.timestamp + timeDiff * ratio;

    interpolated.push({
      timestamp,
      // Use the closer frame's tile URL
      tileUrl: ratio < 0.5 ? frame1.tileUrl : frame2.tileUrl,
      label: formatFrameLabel(timestamp),
    });
  }

  interpolated.push(frame2);
  return interpolated;
};

/**
 * Filter frames by time range
 */
export const filterFramesByTimeRange = (
  frames: RadarFrame[],
  startTime: Date,
  endTime: Date
): RadarFrame[] => {
  const startTimestamp = startTime.getTime();
  const endTimestamp = endTime.getTime();

  return frames.filter(
    frame => frame.timestamp >= startTimestamp && frame.timestamp <= endTimestamp
  );
};

/**
 * Get time range covered by frames
 */
export const getFramesTimeRange = (
  frames: RadarFrame[]
): { start: Date; end: Date; duration: number } | null => {
  if (frames.length === 0) return null;

  const timestamps = frames.map(f => f.timestamp);
  const start = new Date(Math.min(...timestamps));
  const end = new Date(Math.max(...timestamps));
  const duration = end.getTime() - start.getTime();

  return { start, end, duration };
};

/**
 * Validate radar frames
 */
export const validateRadarFrames = (frames: RadarFrame[]): boolean => {
  if (frames.length === 0) return false;

  // Check that all frames have required properties
  for (const frame of frames) {
    if (!frame.timestamp || !frame.tileUrl || !frame.label) {
      return false;
    }
  }

  // Check that timestamps are in order
  for (let i = 1; i < frames.length; i++) {
    if (frames[i].timestamp < frames[i - 1].timestamp) {
      return false;
    }
  }

  return true;
};
