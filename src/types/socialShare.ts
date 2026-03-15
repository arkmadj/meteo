/**
 * Social Share Types
 * TypeScript definitions for social media sharing functionality
 */

import type { CurrentWeatherData, ForecastDay } from './weather';

/**
 * Supported social media platforms
 */
export type SocialPlatform =
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'whatsapp'
  | 'telegram'
  | 'email'
  | 'pinterest'
  | 'copy';

/**
 * Share card layout variants
 */
export type ShareCardLayout = 'compact' | 'standard' | 'detailed' | 'forecast';

/**
 * Share card theme variants
 */
export type ShareCardTheme = 'light' | 'dark' | 'gradient' | 'weather-adaptive';

/**
 * Image dimensions for social media platforms
 */
export interface ShareImageDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

/**
 * Platform-specific image requirements
 */
export const SOCIAL_IMAGE_DIMENSIONS: Record<SocialPlatform, ShareImageDimensions> = {
  twitter: { width: 1200, height: 675, aspectRatio: '16:9' },
  facebook: { width: 1200, height: 630, aspectRatio: '1.91:1' },
  linkedin: { width: 1200, height: 627, aspectRatio: '1.91:1' },
  whatsapp: { width: 800, height: 800, aspectRatio: '1:1' },
  telegram: { width: 800, height: 800, aspectRatio: '1:1' },
  email: { width: 600, height: 400, aspectRatio: '3:2' },
  pinterest: { width: 1000, height: 1500, aspectRatio: '2:3' },
  copy: { width: 1200, height: 675, aspectRatio: '16:9' },
};

/**
 * Platform configuration for sharing
 */
export interface SocialPlatformConfig {
  name: string;
  icon: string;
  color: string;
  baseUrl: string;
  supportsImage: boolean;
  maxTextLength?: number;
}

/**
 * Platform configurations
 */
export const SOCIAL_PLATFORMS: Record<SocialPlatform, SocialPlatformConfig> = {
  twitter: {
    name: 'Twitter/X',
    icon: 'twitter',
    color: '#1DA1F2',
    baseUrl: 'https://twitter.com/intent/tweet',
    supportsImage: false,
    maxTextLength: 280,
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    baseUrl: 'https://www.facebook.com/sharer/sharer.php',
    supportsImage: false,
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    baseUrl: 'https://www.linkedin.com/sharing/share-offsite/',
    supportsImage: false,
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: 'whatsapp',
    color: '#25D366',
    baseUrl: 'https://wa.me/',
    supportsImage: false,
  },
  telegram: {
    name: 'Telegram',
    icon: 'telegram',
    color: '#0088CC',
    baseUrl: 'https://t.me/share/url',
    supportsImage: false,
  },
  email: {
    name: 'Email',
    icon: 'email',
    color: '#6B7280',
    baseUrl: 'mailto:',
    supportsImage: false,
  },
  pinterest: {
    name: 'Pinterest',
    icon: 'pinterest',
    color: '#E60023',
    baseUrl: 'https://pinterest.com/pin/create/button/',
    supportsImage: true,
  },
  copy: {
    name: 'Copy Link',
    icon: 'copy',
    color: '#6B7280',
    baseUrl: '',
    supportsImage: false,
  },
};

/**
 * Weather data to be shared
 */
export interface ShareableWeatherData {
  current: CurrentWeatherData;
  forecast?: ForecastDay[];
}

/**
 * Share card configuration options
 */
export interface ShareCardConfig {
  layout: ShareCardLayout;
  theme: ShareCardTheme;
  showLogo: boolean;
  showAppName: boolean;
  showTimestamp: boolean;
  showForecast: boolean;
  forecastDays: number;
  customBranding?: {
    logoUrl?: string;
    appName?: string;
    tagline?: string;
  };
}

/**
 * Default share card configuration
 */
export const DEFAULT_SHARE_CARD_CONFIG: ShareCardConfig = {
  layout: 'standard',
  theme: 'weather-adaptive',
  showLogo: true,
  showAppName: true,
  showTimestamp: true,
  showForecast: false,
  forecastDays: 3,
};

/**
 * Share result callback data
 */
export interface ShareResult {
  success: boolean;
  platform: SocialPlatform;
  error?: string;
  sharedUrl?: string;
}

