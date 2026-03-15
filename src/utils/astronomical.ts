/**
 * Astronomical Utilities
 *
 * Provides functions for calculating moon phases, daylight duration,
 * and other astronomical data for weather displays.
 */

import type { MoonPhase } from '@/types/weather';

/**
 * Moon phase names with their emoji representations
 */
export const MOON_PHASE_INFO: Record<
  MoonPhase,
  { name: string; emoji: string; description: string }
> = {
  new: {
    name: 'New Moon',
    emoji: '🌑',
    description: 'Moon is not visible',
  },
  'waxing-crescent': {
    name: 'Waxing Crescent',
    emoji: '🌒',
    description: 'Moon is partially visible, growing',
  },
  'first-quarter': {
    name: 'First Quarter',
    emoji: '🌓',
    description: 'Half moon, right side visible',
  },
  'waxing-gibbous': {
    name: 'Waxing Gibbous',
    emoji: '🌔',
    description: 'Moon is mostly visible, growing',
  },
  full: {
    name: 'Full Moon',
    emoji: '🌕',
    description: 'Moon is fully visible',
  },
  'waning-gibbous': {
    name: 'Waning Gibbous',
    emoji: '🌖',
    description: 'Moon is mostly visible, shrinking',
  },
  'last-quarter': {
    name: 'Last Quarter',
    emoji: '🌗',
    description: 'Half moon, left side visible',
  },
  'waning-crescent': {
    name: 'Waning Crescent',
    emoji: '🌘',
    description: 'Moon is partially visible, shrinking',
  },
};

/**
 * Calculate the moon phase for a given date
 * Uses a simplified algorithm based on the lunar cycle
 *
 * @param date - The date to calculate moon phase for
 * @returns The moon phase name
 */
export function calculateMoonPhase(date: Date = new Date()): MoonPhase {
  // Known new moon date: January 6, 2000 at 18:14 UTC
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const lunarCycle = 29.53058867; // Average lunar cycle in days

  // Calculate days since known new moon
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);

  // Calculate position in current lunar cycle (0 to 1)
  const lunarAge = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;
  const phase = lunarAge / lunarCycle;

  // Map phase (0-1) to moon phase name
  if (phase < 0.0625 || phase >= 0.9375) return 'new';
  if (phase < 0.1875) return 'waxing-crescent';
  if (phase < 0.3125) return 'first-quarter';
  if (phase < 0.4375) return 'waxing-gibbous';
  if (phase < 0.5625) return 'full';
  if (phase < 0.6875) return 'waning-gibbous';
  if (phase < 0.8125) return 'last-quarter';
  return 'waning-crescent';
}

/**
 * Calculate moon illumination percentage for a given date
 *
 * @param date - The date to calculate illumination for
 * @returns Illumination percentage (0-100)
 */
export function calculateMoonIllumination(date: Date = new Date()): number {
  // Known new moon date
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const lunarCycle = 29.53058867;

  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const lunarAge = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;
  const phase = lunarAge / lunarCycle;

  // Illumination follows a cosine curve from 0 at new moon to 100 at full moon
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  return Math.round(illumination * 100);
}

/**
 * Calculate daylight duration from sunrise and sunset times
 *
 * @param sunrise - Sunrise time in ISO format or HH:MM format
 * @param sunset - Sunset time in ISO format or HH:MM format
 * @returns Duration in minutes
 */
export function calculateDaylightDuration(sunrise: string, sunset: string): number {
  const sunriseDate = new Date(sunrise);
  const sunsetDate = new Date(sunset);

  if (isNaN(sunriseDate.getTime()) || isNaN(sunsetDate.getTime())) {
    return 0;
  }

  const durationMs = sunsetDate.getTime() - sunriseDate.getTime();
  return Math.round(durationMs / (1000 * 60));
}

/**
 * Format daylight duration into hours and minutes string
 *
 * @param minutes - Duration in minutes
 * @returns Formatted string like "12h 34m"
 */
export function formatDaylightDuration(minutes: number): string {
  if (minutes <= 0) return '0h 0m';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Format time from ISO string to local time string
 *
 * @param isoString - ISO format datetime string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted time string
 */
export function formatSunTime(
  isoString: string,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString(undefined, options);
}

/**
 * Check if the sun is currently up based on sunrise/sunset times
 *
 * @param sunrise - Sunrise time in ISO format
 * @param sunset - Sunset time in ISO format
 * @returns True if sun is currently up
 */
export function isSunUp(sunrise: string, sunset: string): boolean {
  const now = new Date();
  const sunriseDate = new Date(sunrise);
  const sunsetDate = new Date(sunset);

  if (isNaN(sunriseDate.getTime()) || isNaN(sunsetDate.getTime())) {
    return true; // Default to day time if invalid
  }

  return now >= sunriseDate && now <= sunsetDate;
}

