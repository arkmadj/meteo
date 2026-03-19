/**
 * useWeatherShare Hook
 * Handles weather card sharing logic including image generation and platform detection
 */

import { useCallback, useRef, useState } from 'react';

import { useSnackbar } from '@/contexts/SnackbarContext';
import type {
  ShareableWeatherData,
  ShareCardConfig,
  ShareResult,
  SocialPlatform,
} from '@/types/socialShare';
import { DEFAULT_SHARE_CARD_CONFIG } from '@/types/socialShare';
import {
  copyToClipboard,
  generateWeatherText,
  getShareableUrl,
  nativeShare,
  shareToSocialPlatform,
  supportsNativeShare,
} from '@/utils/socialShare';

export interface UseWeatherShareOptions {
  /** Weather data to share */
  weatherData: ShareableWeatherData | null;
  /** Card configuration */
  config?: Partial<ShareCardConfig>;
  /** Callback after successful share */
  onShareSuccess?: (result: ShareResult) => void;
  /** Callback after share error */
  onShareError?: (error: string) => void;
}

export interface UseWeatherShareReturn {
  /** Whether sharing is in progress */
  isSharing: boolean;
  /** Whether native share is supported */
  supportsNative: boolean;
  /** Share to a specific platform */
  share: (platform: SocialPlatform) => Promise<ShareResult>;
  /** Use native share API */
  shareNative: () => Promise<ShareResult>;
  /** Copy share URL to clipboard */
  copyUrl: () => Promise<boolean>;
  /** Copy weather text to clipboard */
  copyText: () => Promise<boolean>;
  /** Get shareable URL */
  getUrl: () => string;
  /** Get weather description text */
  getText: () => string;
  /** Ref for the shareable card element (for image generation) */
  cardRef: React.RefObject<HTMLDivElement>;
  /** Card configuration */
  config: ShareCardConfig;
  /** Last share result */
  lastResult: ShareResult | null;
}

/**
 * Hook for sharing weather cards to social media platforms
 */
export function useWeatherShare(options: UseWeatherShareOptions): UseWeatherShareReturn {
  const { weatherData, config: userConfig, onShareSuccess, onShareError } = options;
  const { showSuccess, showError } = useSnackbar();

  const [isSharing, setIsSharing] = useState(false);
  const [lastResult, setLastResult] = useState<ShareResult | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const config: ShareCardConfig = {
    ...DEFAULT_SHARE_CARD_CONFIG,
    ...userConfig,
  };

  const getUrl = useCallback((): string => {
    if (!weatherData) return window.location.href;
    return getShareableUrl(weatherData);
  }, [weatherData]);

  const getText = useCallback((): string => {
    if (!weatherData) return '';
    return generateWeatherText(weatherData);
  }, [weatherData]);

  const copyUrl = useCallback(async (): Promise<boolean> => {
    const url = getUrl();
    const success = await copyToClipboard(url);
    if (success) {
      showSuccess('Weather link copied to clipboard!');
    } else {
      showError('Failed to copy link');
    }
    return success;
  }, [getUrl, showSuccess, showError]);

  const copyText = useCallback(async (): Promise<boolean> => {
    const text = getText();
    const success = await copyToClipboard(text);
    if (success) {
      showSuccess('Weather info copied to clipboard!');
    } else {
      showError('Failed to copy text');
    }
    return success;
  }, [getText, showSuccess, showError]);

  const share = useCallback(
    async (platform: SocialPlatform): Promise<ShareResult> => {
      if (!weatherData) {
        const result: ShareResult = {
          success: false,
          platform,
          error: 'No weather data available',
        };
        onShareError?.(result.error!);
        return result;
      }

      setIsSharing(true);
      try {
        const result = await shareToSocialPlatform(platform, weatherData);
        setLastResult(result);

        if (result.success) {
          showSuccess(`Shared to ${platform}!`);
          onShareSuccess?.(result);
        } else if (result.error && result.error !== 'Share cancelled') {
          showError(result.error);
          onShareError?.(result.error);
        }

        return result;
      } finally {
        setIsSharing(false);
      }
    },
    [weatherData, showSuccess, showError, onShareSuccess, onShareError]
  );

  const shareNative = useCallback(async (): Promise<ShareResult> => {
    if (!weatherData) {
      const result: ShareResult = {
        success: false,
        platform: 'copy',
        error: 'No weather data available',
      };
      onShareError?.(result.error!);
      return result;
    }

    setIsSharing(true);
    try {
      const result = await nativeShare(weatherData);
      setLastResult(result);

      if (result.success) {
        showSuccess('Weather shared successfully!');
        onShareSuccess?.(result);
      } else if (result.error && result.error !== 'Share cancelled') {
        showError(result.error);
        onShareError?.(result.error);
      }

      return result;
    } finally {
      setIsSharing(false);
    }
  }, [weatherData, showSuccess, showError, onShareSuccess, onShareError]);

  return {
    isSharing,
    supportsNative: supportsNativeShare(),
    share,
    shareNative,
    copyUrl,
    copyText,
    getUrl,
    getText,
    cardRef,
    config,
    lastResult,
  };
}

export default useWeatherShare;
