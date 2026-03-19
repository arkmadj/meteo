/**
 * CVD-Aware Status Badge Component
 * Displays status with multiple visual indicators for color vision deficiency accessibility
 * Uses color + icon + text + pattern for redundant encoding
 */

import React from 'react';

import { BORDER_RADIUS, SPACING } from '@/design-system/tokens';
import { getStatusConfig, type PatternType } from '@/utils/colorVisionDeficiency';

export interface CVDStatusBadgeProps {
  /** Status type */
  status: 'success' | 'warning' | 'error' | 'info';
  /** Show icon */
  showIcon?: boolean;
  /** Show text label */
  showLabel?: boolean;
  /** Use pattern overlay */
  usePattern?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Custom label text */
  label?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * Get size-specific styles
 */
const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: {
      padding: `${SPACING[1]} ${SPACING[2]}`,
      fontSize: '12px',
      iconSize: '14px',
      gap: SPACING[1],
    },
    medium: {
      padding: `${SPACING[2]} ${SPACING[3]}`,
      fontSize: '14px',
      iconSize: '16px',
      gap: SPACING[2],
    },
    large: {
      padding: `${SPACING[3]} ${SPACING[4]}`,
      fontSize: '16px',
      iconSize: '20px',
      gap: SPACING[2],
    },
  };

  return sizes[size];
};

/**
 * Get pattern overlay styles
 */
const getPatternOverlay = (pattern: PatternType, _color: string): React.CSSProperties => {
  if (pattern === 'solid') return {};

  const patterns: Record<PatternType, React.CSSProperties> = {
    solid: {},
    stripes: {
      backgroundImage: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 4px,
        rgba(255, 255, 255, 0.3) 4px,
        rgba(255, 255, 255, 0.3) 8px
      )`,
    },
    dots: {
      backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
      backgroundSize: '6px 6px',
    },
    grid: {
      backgroundImage: `
        linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
      `,
      backgroundSize: '6px 6px',
    },
    diagonal: {
      backgroundImage: `repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 4px,
        rgba(255, 255, 255, 0.3) 4px,
        rgba(255, 255, 255, 0.3) 8px
      )`,
    },
    crosshatch: {
      backgroundImage: `
        repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255, 255, 255, 0.2) 4px, rgba(255, 255, 255, 0.2) 8px),
        repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255, 255, 255, 0.2) 4px, rgba(255, 255, 255, 0.2) 8px)
      `,
    },
  };

  return patterns[pattern] || {};
};

/**
 * CVD-Aware Status Badge Component
 */
const CVDStatusBadge: React.FC<CVDStatusBadgeProps> = ({
  status,
  showIcon = true,
  showLabel = true,
  usePattern = false,
  size = 'medium',
  label,
  className = '',
}) => {
  const config = getStatusConfig(status, usePattern);
  const sizeStyles = getSizeStyles(size);
  const patternStyles = usePattern ? getPatternOverlay(config.pattern, config.color) : {};

  return (
    <div
      role="status"
      aria-label={config.ariaLabel}
      className={`cvd-status-badge cvd-status-badge--${status} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizeStyles.gap,
        padding: sizeStyles.padding,
        backgroundColor: config.backgroundColor,
        color: config.color,
        borderRadius: BORDER_RADIUS.md,
        fontSize: sizeStyles.fontSize,
        fontWeight: 600,
        border: `2px solid ${config.color}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Pattern overlay */}
      {usePattern && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            ...patternStyles,
          }}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      {showIcon && (
        <span
          className="cvd-status-badge__icon"
          style={{
            fontSize: sizeStyles.iconSize,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
          aria-hidden="true"
        >
          {config.icon}
        </span>
      )}

      {/* Label */}
      {showLabel && (
        <span
          className="cvd-status-badge__label"
          style={{
            lineHeight: 1,
            zIndex: 1,
          }}
        >
          {label || config.label}
        </span>
      )}
    </div>
  );
};

export default CVDStatusBadge;
