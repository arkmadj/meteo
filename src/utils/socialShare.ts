/**
 * Social Share Utilities
 * Functions for generating share URLs and handling social media sharing
 */

import type { ShareableWeatherData, ShareResult, SocialPlatform } from '@/types/socialShare';
import { SOCIAL_PLATFORMS } from '@/types/socialShare';

/**
 * Generate a weather description for sharing
 */
export function generateWeatherText(data: ShareableWeatherData): string {
  const { current } = data;
  const temp = Math.round(current.temperature.current);
  const condition = current.condition.description;
  const location = current.country ? `${current.city}, ${current.country}` : current.city;

  return (
    `Weather in ${location}: ${temp}°C, ${condition}. ` +
    `Humidity: ${current.humidity}%, Wind: ${Math.round(current.wind.speed)} km/h`
  );
}

/**
 * Generate a short weather text for platforms with character limits
 */
export function generateShortWeatherText(data: ShareableWeatherData): string {
  const { current } = data;
  const temp = Math.round(current.temperature.current);
  const location = current.city;

  return `🌤️ ${location}: ${temp}°C - ${current.condition.description}`;
}

/**
 * Get the share URL for the current weather location
 */
export function getShareableUrl(data: ShareableWeatherData): string {
  const { current } = data;
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    lat: current.latitude.toString(),
    lon: current.longitude.toString(),
    city: current.city,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate platform-specific share URL
 */
export function generateShareUrl(platform: SocialPlatform, data: ShareableWeatherData): string {
  const config = SOCIAL_PLATFORMS[platform];
  const shareUrl = getShareableUrl(data);
  const text = platform === 'twitter' ? generateShortWeatherText(data) : generateWeatherText(data);

  switch (platform) {
    case 'twitter': {
      const params = new URLSearchParams({
        text: text,
        url: shareUrl,
        hashtags: 'weather,forecast',
      });
      return `${config.baseUrl}?${params.toString()}`;
    }

    case 'facebook': {
      const params = new URLSearchParams({
        u: shareUrl,
        quote: text,
      });
      return `${config.baseUrl}?${params.toString()}`;
    }

    case 'linkedin': {
      const params = new URLSearchParams({
        url: shareUrl,
      });
      return `${config.baseUrl}?${params.toString()}`;
    }

    case 'whatsapp': {
      const message = `${text}\n${shareUrl}`;
      return `${config.baseUrl}?text=${encodeURIComponent(message)}`;
    }

    case 'telegram': {
      const params = new URLSearchParams({
        url: shareUrl,
        text: text,
      });
      return `${config.baseUrl}?${params.toString()}`;
    }

    case 'email': {
      const { current } = data;
      const subject = `Weather in ${current.city}`;
      const body = `${text}\n\nView more at: ${shareUrl}`;
      return `${config.baseUrl}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    case 'pinterest': {
      const params = new URLSearchParams({
        url: shareUrl,
        description: text,
      });
      return `${config.baseUrl}?${params.toString()}`;
    }

    case 'copy':
    default:
      return shareUrl;
  }
}

/**
 * Open share URL in a new window
 */
export function openShareWindow(url: string, platform: SocialPlatform): void {
  if (platform === 'email') {
    window.location.href = url;
    return;
  }

  const width = 600;
  const height = 400;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  window.open(
    url,
    `share_${platform}`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
  );
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallbackCopyToClipboard(text);
    }
  }
  return fallbackCopyToClipboard(text);
}

function fallbackCopyToClipboard(text: string): boolean {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.select();
  const success = document.execCommand('copy');
  document.body.removeChild(textArea);
  return success;
}

/**
 * Check if native Web Share API is supported
 */
export function supportsNativeShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Check if native share supports files
 */
export function supportsFileShare(): boolean {
  return supportsNativeShare() && 'canShare' in navigator;
}

/**
 * Share using native Web Share API
 */
export async function nativeShare(
  data: ShareableWeatherData,
  imageBlob?: Blob
): Promise<ShareResult> {
  if (!supportsNativeShare()) {
    return {
      success: false,
      platform: 'copy',
      error: 'Native sharing not supported',
    };
  }

  const text = generateWeatherText(data);
  const url = getShareableUrl(data);
  const title = `Weather in ${data.current.city}`;

  try {
    const shareData: ShareData = {
      title,
      text,
      url,
    };

    // Add file if supported and provided
    if (imageBlob && supportsFileShare()) {
      const file = new File([imageBlob], 'weather-card.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        shareData.files = [file];
      }
    }

    await navigator.share(shareData);
    return {
      success: true,
      platform: 'copy',
      sharedUrl: url,
    };
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return {
        success: false,
        platform: 'copy',
        error: 'Share cancelled',
      };
    }
    return {
      success: false,
      platform: 'copy',
      error: (error as Error).message,
    };
  }
}

/**
 * Share to a specific platform
 */
export async function shareToSocialPlatform(
  platform: SocialPlatform,
  data: ShareableWeatherData
): Promise<ShareResult> {
  try {
    if (platform === 'copy') {
      const url = getShareableUrl(data);
      const success = await copyToClipboard(url);
      return {
        success,
        platform,
        sharedUrl: url,
        error: success ? undefined : 'Failed to copy to clipboard',
      };
    }

    const shareUrl = generateShareUrl(platform, data);
    openShareWindow(shareUrl, platform);

    return {
      success: true,
      platform,
      sharedUrl: shareUrl,
    };
  } catch (error) {
    return {
      success: false,
      platform,
      error: (error as Error).message,
    };
  }
}

/**
 * Get weather icon emoji based on weather code
 */
export function getWeatherEmoji(weatherCode: number): string {
  if (weatherCode === 0) return '☀️';
  if (weatherCode <= 3) return '⛅';
  if (weatherCode <= 48) return '🌫️';
  if (weatherCode <= 67) return '🌧️';
  if (weatherCode <= 77) return '❄️';
  if (weatherCode <= 82) return '🌦️';
  if (weatherCode <= 86) return '🌨️';
  return '⛈️';
}
