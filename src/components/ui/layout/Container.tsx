/**
 * Container Component
 * Provides consistent max-widths and centering for content
 */

import React from 'react';

import { SPACING } from '../../../design-system/tokens';

type SpacingValue = keyof typeof SPACING;

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;

  // Size variants
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  // Centering
  centerContent?: boolean;

  // Spacing
  padding?: SpacingValue | 'none';
  paddingX?: SpacingValue | 'none';
  paddingY?: SpacingValue | 'none';

  // Custom max width
  maxWidth?: string | number;

  className?: string;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      size = 'lg',
      centerContent = false,
      padding = 'none',
      paddingX,
      paddingY,
      maxWidth,
      className = '',
      ...props
    },
    ref
  ) => {
    // Size configurations
    const sizeClasses = {
      sm: 'max-w-2xl', // 672px
      md: 'max-w-4xl', // 896px
      lg: 'max-w-6xl', // 1152px
      xl: 'max-w-7xl', // 1280px
      full: 'max-w-full', // 100%
    };

    // Build CSS classes
    const classes: string[] = ['w-full mx-auto', sizeClasses?.[size]];

    // Add centering if requested
    if (centerContent) {
      classes.push('flex items-center justify-center min-h-screen');
    }

    // Add padding
    if (padding && padding !== 'none') {
      classes.push(`p-[${SPACING?.[padding]}]`);
    }
    if (paddingX && paddingX !== 'none') {
      classes.push(`px-[${SPACING?.[paddingX]}]`);
    }
    if (paddingY && paddingY !== 'none') {
      classes.push(`py-[${SPACING?.[paddingY]}]`);
    }

    // Add custom className
    if (className) {
      classes.push(className);
    }

    // Build inline styles for custom maxWidth
    const inlineStyles: React.CSSProperties = {};
    if (maxWidth) {
      inlineStyles.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
    }

    return (
      <div ref={ref} className={classes.join(' ')} style={inlineStyles} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;
