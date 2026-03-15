/**
 * AnimatedCard Component
 * Provides smooth entry animations for weather detail cards
 */

import React, { useEffect, useState } from 'react';

import type { CardProps } from '@/components/ui/atoms';
import { Card } from '@/components/ui/atoms';

interface AnimatedCardProps extends CardProps {
  children: React.ReactNode;
  delay?: number;
  animationType?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeInScale' | 'fadeInRotate';
  duration?: number;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  animationType = 'fadeInUp',
  duration = 600,
  className = '',
  ...cardProps
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasAnimated(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Animation styles based on type
  const getAnimationStyles = () => {
    const baseStyles = {
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      willChange: 'transform, opacity',
    };

    if (!isVisible && !hasAnimated) {
      switch (animationType) {
        case 'fadeInUp':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'translateY(30px)',
          };
        case 'fadeInLeft':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'translateX(-30px)',
          };
        case 'fadeInRight':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'translateX(30px)',
          };
        case 'fadeInScale':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'scale(0.9)',
          };
        case 'fadeInRotate':
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'scale(0.95) rotate(-2deg)',
          };
        default:
          return {
            ...baseStyles,
            opacity: 0,
            transform: 'translateY(30px)',
          };
      }
    }

    return {
      ...baseStyles,
      opacity: 1,
      transform: 'translateY(0) translateX(0) scale(1) rotate(0deg)',
    };
  };

  // Add hover animations for enhanced interactivity
  const getHoverStyles = () => {
    if (!hasAnimated) return {};

    return {
      transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
      cursor: 'default',
    };
  };

  const combinedClassName = `
    ${className}
    hover:transform hover:scale-[1.02] hover:shadow-lg
    active:scale-[0.98]
    transition-all duration-200 ease-out
  `.trim();

  return (
    <div
      className="h-full"
      style={{
        ...getAnimationStyles(),
        ...getHoverStyles(),
      }}
    >
      <Card {...cardProps} className={combinedClassName}>
        {children}
      </Card>
    </div>
  );
};

export default AnimatedCard;
