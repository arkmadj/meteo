/**
 * Motion-Safe Component Wrappers
 * Provides motion-aware animations that respect user preferences
 */

import React, { CSSProperties } from 'react';

import { ANIMATION_DURATION, ANIMATION_EASING, usePrefersReducedMotion } from '@/hooks/useMotion';

/**
 * Animation type
 */
export type AnimationType = 'slide' | 'fade' | 'scale' | 'slideUp' | 'slideDown' | 'none';

/**
 * Motion-safe wrapper props
 */
export interface MotionSafeProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Get animation styles based on type and motion preference
 */
function getAnimationStyles(
  animation: AnimationType,
  duration: number,
  delay: number,
  prefersReducedMotion: boolean
): {
  initial: CSSProperties;
  animate: CSSProperties;
} {
  // Reduced motion: only use opacity
  if (prefersReducedMotion) {
    return {
      initial: {
        opacity: 0,
      },
      animate: {
        opacity: 1,
        transition: `opacity ${Math.min(duration * 0.3, 100)}ms ${ANIMATION_EASING.easeOut} ${delay}ms`,
      },
    };
  }

  // Full motion animations
  const animations: Record<AnimationType, { initial: CSSProperties; animate: CSSProperties }> = {
    none: {
      initial: {},
      animate: {},
    },
    fade: {
      initial: {
        opacity: 0,
      },
      animate: {
        opacity: 1,
        transition: `opacity ${duration}ms ${ANIMATION_EASING.easeOut} ${delay}ms`,
      },
    },
    scale: {
      initial: {
        opacity: 0,
        transform: 'scale(0.95)',
      },
      animate: {
        opacity: 1,
        transform: 'scale(1)',
        transition: `opacity ${duration}ms ${ANIMATION_EASING.easeOut} ${delay}ms, transform ${duration}ms ${ANIMATION_EASING.easeOut} ${delay}ms`,
      },
    },
    slide: {
      initial: {
        opacity: 0,
        transform: 'translateX(-20px)',
      },
      animate: {
        opacity: 1,
        transform: 'translateX(0)',
        transition: `opacity ${duration}ms ${ANIMATION_EASING.easeOut} ${delay}ms, transform ${duration}ms ${ANIMATION_EASING.easeOut} ${delay}ms`,
      },
    },
    slideUp: {
      initial: {
        opacity: 0,
        transform: 'translateY(20px)',
      },
      animate: {
        opacity: 1,
        transform: 'translateY(0)',
        transition: `opacity ${duration}ms ${ANIMATION_EASING.easeOut} ${delay}ms, transform ${duration}ms ${ANIMATION_EASING.easeOut} ${delay}ms`,
      },
    },
    slideDown: {
      initial: {
        opacity: 0,
        transform: 'translateY(-20px)',
      },
      animate: {
        opacity: 1,
        transform: 'translateY(0)',
        transition: `opacity ${duration}ms ${ANIMATION_EASING.easeOut} ${delay}ms, transform ${duration}ms ${ANIMATION_EASING.easeOut} ${delay}ms`,
      },
    },
  };

  return animations[animation];
}

/**
 * Motion-Safe Wrapper Component
 * Automatically adapts animations based on user motion preferences
 */
export const MotionSafe: React.FC<MotionSafeProps> = ({
  children,
  animation = 'fade',
  duration = ANIMATION_DURATION.fast,
  delay = 0,
  className = '',
  style = {},
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const { initial, animate } = getAnimationStyles(animation, duration, delay, prefersReducedMotion);

  return (
    <div
      className={className}
      style={{
        ...style,
        ...(isVisible ? animate : initial),
      }}
    >
      {children}
    </div>
  );
};

/**
 * Fade In Component
 */
export const FadeIn: React.FC<Omit<MotionSafeProps, 'animation'>> = props => (
  <MotionSafe {...props} animation="fade" />
);

/**
 * Scale In Component
 */
export const ScaleIn: React.FC<Omit<MotionSafeProps, 'animation'>> = props => (
  <MotionSafe {...props} animation="scale" />
);

/**
 * Slide In Component
 */
export const SlideIn: React.FC<Omit<MotionSafeProps, 'animation'>> = props => (
  <MotionSafe {...props} animation="slide" />
);

/**
 * Slide Up Component
 */
export const SlideUp: React.FC<Omit<MotionSafeProps, 'animation'>> = props => (
  <MotionSafe {...props} animation="slideUp" />
);

/**
 * Slide Down Component
 */
export const SlideDown: React.FC<Omit<MotionSafeProps, 'animation'>> = props => (
  <MotionSafe {...props} animation="slideDown" />
);

/**
 * Conditional Motion Component
 * Only applies animation if motion is enabled
 */
export interface ConditionalMotionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalMotion: React.FC<ConditionalMotionProps> = ({ children, fallback }) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Motion-Safe Button Component
 * Button with safe press animation
 */
export interface MotionSafeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const MotionSafeButton: React.FC<MotionSafeButtonProps> = ({
  children,
  style,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  ...props
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isPressed, setIsPressed] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!prefersReducedMotion) {
      setIsPressed(true);
    }
    onMouseDown?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    onMouseUp?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    onMouseLeave?.(e);
  };

  const pressStyle: CSSProperties = prefersReducedMotion
    ? {}
    : {
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: `transform ${ANIMATION_DURATION.fast}ms ${ANIMATION_EASING.easeOut}`,
      };

  return (
    <button
      {...props}
      style={{
        ...style,
        ...pressStyle,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
};

/**
 * Motion-Safe Link Component
 * Link with safe hover animation
 */
export interface MotionSafeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export const MotionSafeLink: React.FC<MotionSafeLinkProps> = ({ children, style, ...props }) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const linkStyle: CSSProperties = prefersReducedMotion
    ? {}
    : {
        transition: `color ${ANIMATION_DURATION.fast}ms ${ANIMATION_EASING.easeOut}`,
      };

  return (
    <a
      {...props}
      style={{
        ...style,
        ...linkStyle,
      }}
    >
      {children}
    </a>
  );
};

export default MotionSafe;
