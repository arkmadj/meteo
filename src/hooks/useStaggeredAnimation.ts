/**
 * useStaggeredAnimation Hook
 * Manages staggered entry animations for multiple elements
 */

import { useEffect, useState } from 'react';

interface UseStaggeredAnimationOptions {
  itemCount: number;
  baseDelay?: number;
  staggerDelay?: number;
  enabled?: boolean;
}

interface AnimationState {
  isReady: boolean;
  getDelay: (index: number) => number;
  getAnimationType: (index: number) => 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale';
}

export const useStaggeredAnimation = ({
  itemCount,
  baseDelay = 100,
  staggerDelay = 150,
  enabled = true,
}: UseStaggeredAnimationOptions): AnimationState => {
  const [isReady, setIsReady] = useState(!enabled);

  // Suppress unused parameter warning - itemCount is used for documentation/API consistency
  void itemCount;

  useEffect(() => {
    if (!enabled) {
      setIsReady(true);
      return;
    }

    // Small delay to ensure component is mounted
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(readyTimer);
  }, [enabled]);

  const getDelay = (index: number): number => {
    if (!enabled) return 0;
    return baseDelay + index * staggerDelay;
  };

  const getAnimationType = (
    index: number
  ): 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale' => {
    if (!enabled) return 'fadeInUp';

    // Alternate animation types for visual variety
    const animations: Array<'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale'> = [
      'fadeInUp',
      'fadeInUp',
      'fadeInLeft',
      'fadeInRight',
      'fadeInScale',
      'fadeInUp',
      'fadeInUp',
    ];

    return animations?.[index % animations.length];
  };

  return {
    isReady,
    getDelay,
    getAnimationType,
  };
};
