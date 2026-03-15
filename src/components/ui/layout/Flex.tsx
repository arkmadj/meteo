/**
 * Flex Component
 * Flexible box layout component for horizontal arrangements
 */

import React from 'react';

import { SPACING } from '../../../design-system/tokens';

type SpacingValue = keyof typeof SPACING;

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;

  // Direction
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';

  // Alignment
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  alignContent?:
    | 'stretch'
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';

  // Wrapping
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';

  // Spacing (gap)
  gap?: SpacingValue | 'none';
  columnGap?: SpacingValue | 'none';
  rowGap?: SpacingValue | 'none';

  // Flex properties
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;

  // Component props
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      children,
      direction = 'row',
      justifyContent = 'flex-start',
      alignItems = 'stretch',
      alignContent,
      wrap = 'nowrap',
      gap,
      columnGap,
      rowGap,
      flexGrow,
      flexShrink,
      flexBasis,
      as: Component = 'div',
      className = '',
      ...props
    },
    ref
  ) => {
    // Build CSS classes
    const classes: string[] = [
      'flex',
      `flex-${direction}`,
      `justify-${justifyContent}`,
      `items-${alignItems}`,
      `flex-${wrap}`,
    ];

    // Add align-content if specified
    if (alignContent) {
      classes.push(`content-${alignContent}`);
    }

    // Add gap classes
    if (gap && gap !== 'none') {
      classes.push(`gap-[${SPACING?.[gap]}]`);
    }
    if (columnGap && columnGap !== 'none') {
      classes.push(`gap-x-[${SPACING?.[columnGap]}]`);
    }
    if (rowGap && rowGap !== 'none') {
      classes.push(`gap-y-[${SPACING?.[rowGap]}]`);
    }

    // Add custom className
    if (className) {
      classes.push(className);
    }

    // Build inline styles for dynamic flex properties
    const inlineStyles: React.CSSProperties = {};

    if (flexGrow !== undefined) inlineStyles.flexGrow = flexGrow;
    if (flexShrink !== undefined) inlineStyles.flexShrink = flexShrink;
    if (flexBasis !== undefined)
      inlineStyles.flexBasis = typeof flexBasis === 'number' ? `${flexBasis}px` : flexBasis;

    const Comp = Component as any;
    return (
      <Comp ref={ref as any} className={classes.join(' ')} style={inlineStyles} {...(props as any)}>
        {children}
      </Comp>
    );
  }
);

Flex.displayName = 'Flex';

export default Flex;
