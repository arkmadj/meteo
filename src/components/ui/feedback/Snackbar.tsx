/**
 * Snackbar Component
 * Displays temporary notification messages to users
 * Responsive across mobile, tablet, and desktop breakpoints
 */

import React, { useEffect, useState } from 'react';

import type {
  SnackbarDisplayMode,
  Snackbar as SnackbarType,
  SnackbarVariant,
} from '@/contexts/SnackbarContext';
import { ANIMATION, BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/design-system/tokens';
import { useBreakpoint, type Breakpoint } from '@/hooks/useBreakpoint';

export interface SnackbarProps {
  snackbar: SnackbarType;
  onClose: (id: string) => void;
  index?: number; // Position in stack (0 = top/front)
  totalCount?: number; // Total number of snackbars
  stackOffset?: number; // Offset in pixels for stacked mode
  displayMode?: SnackbarDisplayMode;
}

/**
 * Get responsive styles based on breakpoint
 */
const getResponsiveStyles = (breakpoint: Breakpoint) => {
  const styles = {
    mobile: {
      width: '95%',
      maxWidth: 'calc(100vw - 16px)',
      minWidth: '280px',
      padding: `${SPACING[3]} ${SPACING[4]}`,
      fontSize: '14px',
      gap: SPACING[2],
      buttonPadding: `${SPACING[3]} ${SPACING[4]}`,
      buttonMinHeight: '44px',
      closeButtonSize: '44px',
      closeFontSize: '20px',
    },
    tablet: {
      width: 'auto',
      maxWidth: '400px',
      minWidth: '320px',
      padding: `${SPACING[3.5]} ${SPACING[4]}`,
      fontSize: '14px',
      gap: SPACING[3],
      buttonPadding: `${SPACING[2.5]} ${SPACING[3.5]}`,
      buttonMinHeight: '40px',
      closeButtonSize: '40px',
      closeFontSize: '18px',
    },
    desktop: {
      width: 'auto',
      maxWidth: '500px',
      minWidth: '300px',
      padding: `${SPACING[3]} ${SPACING[4]}`,
      fontSize: '14px',
      gap: SPACING[3],
      buttonPadding: `${SPACING[2]} ${SPACING[3]}`,
      buttonMinHeight: '36px',
      closeButtonSize: '36px',
      closeFontSize: '16px',
    },
  };

  return styles[breakpoint];
};

/**
 * Get variant-specific styles
 */
const getVariantStyles = (variant: SnackbarVariant = 'info') => {
  const styles = {
    info: {
      bg: `linear-gradient(135deg, ${COLORS.primary[500]}, ${COLORS.primary[600]})`,
      text: COLORS.neutral[50],
      icon: 'ℹ️',
      iconBg: COLORS.primary[600],
    },
    success: {
      bg: `linear-gradient(135deg, ${COLORS.semantic.success[500]}, ${COLORS.semantic.success[600]})`,
      text: COLORS.neutral[50],
      icon: '✅',
      iconBg: COLORS.semantic.success[600],
    },
    warning: {
      bg: `linear-gradient(135deg, ${COLORS.semantic.warning[500]}, ${COLORS.semantic.warning[600]})`,
      text: COLORS.neutral[900],
      icon: '⚠️',
      iconBg: COLORS.semantic.warning[600],
    },
    error: {
      bg: `linear-gradient(135deg, ${COLORS.semantic.error[500]}, ${COLORS.semantic.error[600]})`,
      text: COLORS.neutral[50],
      icon: '❌',
      iconBg: COLORS.semantic.error[600],
    },
  };

  return styles[variant];
};

/**
 * Snackbar Component
 */
const Snackbar: React.FC<SnackbarProps> = ({
  snackbar,
  onClose,
  index = 0,
  totalCount = 1,
  stackOffset = 8,
  displayMode = 'stack',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const breakpoint = useBreakpoint();
  const variantStyles = getVariantStyles(snackbar.variant);
  const responsiveStyles = getResponsiveStyles(breakpoint);

  // Entry animation
  useEffect(() => {
    // Trigger entry animation after mount
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Handle close with exit animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(snackbar.id);
    }, 300); // Match animation duration
  };

  // Handle action click
  const handleActionClick = () => {
    snackbar.action?.onClick();
    handleClose();
  };

  // Calculate stacking transform and opacity
  const getStackingStyles = (): React.CSSProperties => {
    if (displayMode === 'queue') {
      return {};
    }

    // Stack mode: apply offsets and scale
    const offset = index * stackOffset;
    const scale = 1 - index * 0.05; // Slight scale reduction for depth
    const opacity = 1 - index * 0.15; // Slight opacity reduction for depth
    const zIndex = totalCount - index; // Higher z-index for items in front

    return {
      transform: `translateY(-${offset}px) scale(${scale})`,
      opacity: Math.max(opacity, 0.4), // Minimum opacity
      zIndex,
      transformOrigin: 'bottom center',
    };
  };

  // Combine entry/exit animation with stacking styles
  const baseTransform = isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)';
  const stackingStyles = getStackingStyles();

  // Merge transforms
  const combinedTransform = stackingStyles.transform
    ? `${baseTransform} ${stackingStyles.transform}`
    : baseTransform;

  // Determine ARIA attributes based on variant
  // Error and warning are assertive (interrupt screen reader immediately)
  // Info and success are polite (wait for screen reader to finish)
  const isUrgent = snackbar.variant === 'error' || snackbar.variant === 'warning';
  const ariaLive = isUrgent ? 'assertive' : 'polite';
  const role = isUrgent ? 'alert' : 'status';

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={`snackbar-item snackbar-item--${displayMode}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: responsiveStyles.gap,
        padding: responsiveStyles.padding,
        borderRadius: BORDER_RADIUS.lg,
        background: variantStyles.bg,
        color: variantStyles.text,
        boxShadow: SHADOWS.xl,
        width: responsiveStyles.width,
        minWidth: responsiveStyles.minWidth,
        maxWidth: responsiveStyles.maxWidth,
        marginBottom: displayMode === 'stack' ? SPACING[2] : 0,
        opacity: (isVisible && !isExiting ? 1 : 0) * ((stackingStyles.opacity as number) ?? 1),
        transform: combinedTransform,
        transition: `all ${ANIMATION.duration.normal} ${ANIMATION.easing.smooth}`,
        pointerEvents: 'auto',
        position: 'relative',
        zIndex: stackingStyles.zIndex,
        transformOrigin: stackingStyles.transformOrigin,
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      {/* Icon */}
      <div
        className="snackbar-icon"
        style={{
          fontSize: '20px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: BORDER_RADIUS.full,
          background: variantStyles.iconBg,
        }}
        aria-hidden="true"
      >
        {variantStyles.icon}
      </div>

      {/* Message */}
      <div
        className="snackbar-message"
        style={{
          flex: 1,
          fontSize: responsiveStyles.fontSize,
          fontWeight: 500,
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}
      >
        {snackbar.message}
      </div>

      {/* Action Button */}
      {snackbar.action && (
        <button
          className="snackbar-action"
          onClick={handleActionClick}
          style={{
            padding: responsiveStyles.buttonPadding,
            minHeight: responsiveStyles.buttonMinHeight,
            borderRadius: BORDER_RADIUS.md,
            background: 'rgba(255, 255, 255, 0.2)',
            color: variantStyles.text,
            border: 'none',
            fontSize: responsiveStyles.fontSize,
            fontWeight: 600,
            cursor: 'pointer',
            transition: `background ${ANIMATION.duration.fast} ${ANIMATION.easing.smooth}`,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          {snackbar.action.label}
        </button>
      )}

      {/* Close Button */}
      {snackbar.dismissible !== false && (
        <button
          className="snackbar-close"
          onClick={handleClose}
          aria-label="Close notification"
          style={{
            padding: 0,
            width: responsiveStyles.closeButtonSize,
            height: responsiveStyles.closeButtonSize,
            minWidth: responsiveStyles.closeButtonSize,
            minHeight: responsiveStyles.closeButtonSize,
            borderRadius: BORDER_RADIUS.full,
            background: 'transparent',
            color: variantStyles.text,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: `background ${ANIMATION.duration.fast} ${ANIMATION.easing.smooth}`,
            fontSize: responsiveStyles.closeFontSize,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg
            width={responsiveStyles.closeFontSize}
            height={responsiveStyles.closeFontSize}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Snackbar;
