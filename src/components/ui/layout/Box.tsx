/**
 * Box Component
 * Basic wrapper component with spacing utilities and layout properties
 */

import React from 'react';

import { COLORS, SPACING } from '../../../design-system/tokens';

type SpacingValue = keyof typeof SPACING;
type ColorValue = keyof typeof COLORS;

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;

  // Spacing props
  padding?: SpacingValue | 'none';
  paddingX?: SpacingValue | 'none';
  paddingY?: SpacingValue | 'none';
  paddingTop?: SpacingValue | 'none';
  paddingRight?: SpacingValue | 'none';
  paddingBottom?: SpacingValue | 'none';
  paddingLeft?: SpacingValue | 'none';

  margin?: SpacingValue | 'none' | 'auto';
  marginX?: SpacingValue | 'none' | 'auto';
  marginY?: SpacingValue | 'none' | 'auto';
  marginTop?: SpacingValue | 'none' | 'auto';
  marginRight?: SpacingValue | 'none' | 'auto';
  marginBottom?: SpacingValue | 'none' | 'auto';
  marginLeft?: SpacingValue | 'none' | 'auto';

  // Layout props
  display?:
    | 'block'
    | 'inline'
    | 'inline-block'
    | 'flex'
    | 'inline-flex'
    | 'grid'
    | 'inline-grid'
    | 'none';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;

  // Background and border
  backgroundColor?: ColorValue;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

  // Flexbox props (when display includes flex)
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

  // Grid props (when display includes grid)
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
  gap?: SpacingValue;
  columnGap?: SpacingValue;
  rowGap?: SpacingValue;

  // Positioning
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: number;

  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';

  // Text alignment
  textAlign?: 'left' | 'right' | 'center' | 'justify';

  // Opacity
  opacity?: number;

  // Transform
  transform?: string;

  // Transition
  transition?: string;

  // Cursor
  cursor?: 'pointer' | 'default' | 'text' | 'move' | 'not-allowed' | 'grab' | 'grabbing';

  // Component props
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      children,
      as: Component = 'div',
      className = '',

      // Spacing
      padding,
      paddingX,
      paddingY,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      margin,
      marginX,
      marginY,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,

      // Layout
      display,
      position,
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,

      // Background and border
      backgroundColor,
      borderRadius,

      // Flexbox
      flexDirection,
      justifyContent,
      alignItems,
      flexWrap,
      flexGrow,
      flexShrink,
      flexBasis,
      alignSelf,

      // Grid
      gridTemplateColumns,
      gridTemplateRows,
      gridColumn,
      gridRow,
      gridArea,
      gap,
      columnGap,
      rowGap,

      // Positioning
      top,
      right,
      bottom,
      left,
      zIndex,

      // Overflow
      overflow,
      overflowX,
      overflowY,

      // Text
      textAlign,

      // Other
      opacity,
      transform,
      transition,
      cursor,

      ...props
    },
    ref
  ) => {
    // Build CSS classes
    const classes: string[] = [];

    // Spacing classes
    if (padding && padding !== 'none') classes.push(`p-[${SPACING?.[padding]}]`);
    if (paddingX && paddingX !== 'none') {
      classes.push(`px-[${SPACING?.[paddingX]}]`);
    }
    if (paddingY && paddingY !== 'none') {
      classes.push(`py-[${SPACING?.[paddingY]}]`);
    }
    if (paddingTop && paddingTop !== 'none') classes.push(`pt-[${SPACING?.[paddingTop]}]`);
    if (paddingRight && paddingRight !== 'none') classes.push(`pr-[${SPACING?.[paddingRight]}]`);
    if (paddingBottom && paddingBottom !== 'none') classes.push(`pb-[${SPACING?.[paddingBottom]}]`);
    if (paddingLeft && paddingLeft !== 'none') classes.push(`pl-[${SPACING?.[paddingLeft]}]`);

    if (margin && margin !== 'none') {
      classes.push(margin === 'auto' ? 'm-auto' : `m-[${SPACING?.[margin as SpacingValue]}]`);
    }
    if (marginX && marginX !== 'none') {
      classes.push(marginX === 'auto' ? 'mx-auto' : `mx-[${SPACING?.[marginX as SpacingValue]}]`);
    }
    if (marginY && marginY !== 'none') {
      classes.push(marginY === 'auto' ? 'my-auto' : `my-[${SPACING?.[marginY as SpacingValue]}]`);
    }
    if (marginTop && marginTop !== 'none')
      classes.push(
        marginTop === 'auto' ? 'mt-auto' : `mt-[${SPACING?.[marginTop as SpacingValue]}]`
      );
    if (marginRight && marginRight !== 'none')
      classes.push(
        marginRight === 'auto' ? 'mr-auto' : `mr-[${SPACING?.[marginRight as SpacingValue]}]`
      );
    if (marginBottom && marginBottom !== 'none')
      classes.push(
        marginBottom === 'auto' ? 'mb-auto' : `mb-[${SPACING?.[marginBottom as SpacingValue]}]`
      );
    if (marginLeft && marginLeft !== 'none')
      classes.push(
        marginLeft === 'auto' ? 'ml-auto' : `ml-[${SPACING?.[marginLeft as SpacingValue]}]`
      );

    // Layout classes
    if (display) classes.push(display);
    if (position) classes.push(position);

    // Background and border
    if (backgroundColor) classes.push(`bg-[${COLORS?.[backgroundColor]}]`);
    if (borderRadius && borderRadius !== 'none') {
      const radiusMap = {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      };
      classes.push(radiusMap?.[borderRadius]);
    }

    // Flexbox classes
    if (flexDirection) classes.push(`flex-${flexDirection}`);
    if (justifyContent) classes.push(`justify-${justifyContent}`);
    if (alignItems) classes.push(`items-${alignItems}`);
    if (flexWrap) classes.push(`flex-${flexWrap}`);
    if (alignSelf) classes.push(`self-${alignSelf}`);

    // Grid classes
    if (gap) classes.push(`gap-[${SPACING?.[gap]}]`);
    if (columnGap) classes.push(`gap-x-[${SPACING?.[columnGap]}]`);
    if (rowGap) classes.push(`gap-y-[${SPACING?.[rowGap]}]`);

    // Text alignment
    if (textAlign) classes.push(`text-${textAlign}`);

    // Cursor
    if (cursor) classes.push(`cursor-${cursor}`);

    // Overflow
    if (overflow) classes.push(`overflow-${overflow}`);
    if (overflowX) classes.push(`overflow-x-${overflowX}`);
    if (overflowY) classes.push(`overflow-y-${overflowY}`);

    // Build inline styles for dynamic values
    const inlineStyles: React.CSSProperties = {};

    if (width !== undefined) inlineStyles.width = typeof width === 'number' ? `${width}px` : width;
    if (height !== undefined)
      inlineStyles.height = typeof height === 'number' ? `${height}px` : height;
    if (minWidth !== undefined)
      inlineStyles.minWidth = typeof minWidth === 'number' ? `${minWidth}px` : minWidth;
    if (minHeight !== undefined)
      inlineStyles.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
    if (maxWidth !== undefined)
      inlineStyles.maxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
    if (maxHeight !== undefined)
      inlineStyles.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;

    if (flexGrow !== undefined) inlineStyles.flexGrow = flexGrow;
    if (flexShrink !== undefined) inlineStyles.flexShrink = flexShrink;
    if (flexBasis !== undefined)
      inlineStyles.flexBasis = typeof flexBasis === 'number' ? `${flexBasis}px` : flexBasis;

    if (gridTemplateColumns) inlineStyles.gridTemplateColumns = gridTemplateColumns;
    if (gridTemplateRows) inlineStyles.gridTemplateRows = gridTemplateRows;
    if (gridColumn) inlineStyles.gridColumn = gridColumn;
    if (gridRow) inlineStyles.gridRow = gridRow;
    if (gridArea) inlineStyles.gridArea = gridArea;

    if (top !== undefined) inlineStyles.top = typeof top === 'number' ? `${top}px` : top;
    if (right !== undefined) inlineStyles.right = typeof right === 'number' ? `${right}px` : right;
    if (bottom !== undefined)
      inlineStyles.bottom = typeof bottom === 'number' ? `${bottom}px` : bottom;
    if (left !== undefined) inlineStyles.left = typeof left === 'number' ? `${left}px` : left;
    if (zIndex !== undefined) inlineStyles.zIndex = zIndex;

    if (opacity !== undefined) inlineStyles.opacity = opacity;
    if (transform) inlineStyles.transform = transform;
    if (transition) inlineStyles.transition = transition;

    const finalClassName = [...classes, className].filter(Boolean).join(' ');

    const Comp = Component as React.ElementType;
    return (
      <Comp
        ref={ref as React.Ref<HTMLElement>}
        className={finalClassName}
        style={inlineStyles}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </Comp>
    );
  }
);

Box.displayName = 'Box';

export default Box;
