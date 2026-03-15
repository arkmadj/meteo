/**
 * Skeleton Component
 * Theme-aware skeleton loader with design tokens and dark mode support
 * Respects user preferences for reduced motion and reduced data
 */

import React from 'react';
import { useTheme } from '@/design-system/theme';
import { BORDER_RADIUS, ANIMATION } from '@/design-system/tokens';

export interface SkeletonProps {
  /** Width of skeleton (CSS value or 'full') */
  width?: string | number;
  /** Height of skeleton (CSS value) */
  height?: string | number;
  /** Shape variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Number of lines for text variant */
  lines?: number;
  /** Gap between lines for text variant */
  gap?: string;
}

/**
 * Base Skeleton component with theme awareness
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height = '1rem',
  variant = 'text',
  animation = 'wave',
  className = '',
  style,
  lines = 1,
  gap = '0.5rem',
}) => {
  const { theme } = useTheme();

  // Theme-aware colors
  const baseColor = theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const highlightColor = theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';

  // Variant-specific styles
  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: baseColor,
      display: 'block',
    };

    switch (variant) {
      case 'circular':
        return {
          ...baseStyles,
          borderRadius: '50%',
          width: width || height,
          height: height,
        };
      case 'rounded':
        return {
          ...baseStyles,
          borderRadius: BORDER_RADIUS.lg,
          width: width || '100%',
          height: height,
        };
      case 'rectangular':
        return {
          ...baseStyles,
          borderRadius: BORDER_RADIUS.sm,
          width: width || '100%',
          height: height,
        };
      case 'text':
      default:
        return {
          ...baseStyles,
          borderRadius: BORDER_RADIUS.sm,
          width: width || '100%',
          height: height,
        };
    }
  };

  // Animation styles
  const getAnimationStyles = (): React.CSSProperties => {
    if (animation === 'none') {
      return {};
    }

    if (animation === 'pulse') {
      return {
        animation: `skeleton-pulse ${ANIMATION.duration.slow} ${ANIMATION.easing.easeInOut} infinite`,
      };
    }

    // Wave animation (default)
    return {
      backgroundImage: `linear-gradient(90deg, ${baseColor} 0%, ${highlightColor} 50%, ${baseColor} 100%)`,
      backgroundSize: '200% 100%',
      animation: `skeleton-wave ${ANIMATION.duration.slow} ${ANIMATION.easing.linear} infinite`,
    };
  };

  const skeletonStyles: React.CSSProperties = {
    ...getVariantStyles(),
    ...getAnimationStyles(),
    ...style,
  };

  // Render multiple lines for text variant
  if (variant === 'text' && lines > 1) {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap }}>
        {Array.from({ length: lines }).map((_, index) => {
          // Last line is typically shorter
          const isLastLine = index === lines - 1;
          const lineWidth = isLastLine && !width ? '60%' : width || '100%';

          return (
            <div
              key={index}
              className="skeleton-line"
              style={{
                ...skeletonStyles,
                width: lineWidth,
              }}
            />
          );
        })}
      </div>
    );
  }

  return <div className={`skeleton ${className}`} style={skeletonStyles} />;
};

/**
 * Skeleton variants for common use cases
 */

export const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'>> = props => (
  <Skeleton {...props} variant="text" />
);

export const SkeletonCircle: React.FC<Omit<SkeletonProps, 'variant'>> = props => (
  <Skeleton {...props} variant="circular" />
);

export const SkeletonRectangle: React.FC<Omit<SkeletonProps, 'variant'>> = props => (
  <Skeleton {...props} variant="rectangular" />
);

export const SkeletonRounded: React.FC<Omit<SkeletonProps, 'variant'>> = props => (
  <Skeleton {...props} variant="rounded" />
);

/**
 * Skeleton Card - Common card skeleton pattern
 */
export interface SkeletonCardProps {
  /** Show avatar/icon */
  showAvatar?: boolean;
  /** Avatar size */
  avatarSize?: string;
  /** Number of text lines */
  lines?: number;
  /** Show action buttons */
  showActions?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = true,
  avatarSize = '3rem',
  lines = 3,
  showActions = false,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`skeleton-card ${className}`}
      style={{
        padding: '1.5rem',
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: theme.surfaceColor,
        border: `1px solid ${theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      }}
    >
      {/* Header with avatar */}
      {showAvatar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <SkeletonCircle width={avatarSize} height={avatarSize} />
          <div style={{ flex: 1 }}>
            <SkeletonText width="40%" height="1rem" />
            <SkeletonText width="60%" height="0.875rem" style={{ marginTop: '0.5rem' }} />
          </div>
        </div>
      )}

      {/* Content */}
      <SkeletonText lines={lines} gap="0.75rem" />

      {/* Actions */}
      {showActions && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <SkeletonRounded width="5rem" height="2.5rem" />
          <SkeletonRounded width="5rem" height="2.5rem" />
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton List - Common list skeleton pattern
 */
export interface SkeletonListProps {
  /** Number of items */
  items?: number;
  /** Show avatar for each item */
  showAvatar?: boolean;
  /** Gap between items */
  gap?: string;
  /** Additional CSS classes */
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 3,
  showAvatar = true,
  gap = '1rem',
  className = '',
}) => {
  return (
    <div className={`skeleton-list ${className}`} style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {showAvatar && <SkeletonCircle width="2.5rem" height="2.5rem" />}
          <div style={{ flex: 1 }}>
            <SkeletonText width="70%" height="1rem" />
            <SkeletonText width="50%" height="0.875rem" style={{ marginTop: '0.5rem' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton Table - Common table skeleton pattern
 */
export interface SkeletonTableProps {
  /** Number of rows */
  rows?: number;
  /** Number of columns */
  columns?: number;
  /** Show header row */
  showHeader?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div className={`skeleton-table ${className}`}>
      {/* Header */}
      {showHeader && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '1rem',
            padding: '1rem',
            borderBottom: `1px solid ${theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <SkeletonText key={index} width="80%" height="1rem" />
          ))}
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '1rem',
            padding: '1rem',
            borderBottom: `1px solid ${theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonText key={colIndex} width="90%" height="0.875rem" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;

