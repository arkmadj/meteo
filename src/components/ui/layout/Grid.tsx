/**
 * Grid Component
 * Responsive grid layout component
 */

import React from 'react';

import { SPACING } from '../../../design-system/tokens';

type SpacingValue = keyof typeof SPACING | 'sm' | 'md' | 'lg' | 'xl';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;

  // Grid template
  columns?: number | string | Record<string, number>;
  rows?: number | string;
  templateColumns?: string;
  templateRows?: string;
  templateAreas?: string;

  // Gap
  gap?: SpacingValue | 'none';
  columnGap?: SpacingValue | 'none';
  rowGap?: SpacingValue | 'none';

  // Alignment
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  justifyContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'space-around'
    | 'space-between'
    | 'space-evenly';
  alignContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'space-around'
    | 'space-between'
    | 'space-evenly';

  // Auto flow
  autoFlow?: 'row' | 'column' | 'row dense' | 'column dense';
  autoColumns?: string;
  autoRows?: string;

  // Component props
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      columns,
      rows,
      templateColumns,
      templateRows,
      templateAreas,
      gap,
      columnGap,
      rowGap,
      justifyItems,
      alignItems,
      justifyContent,
      alignContent,
      autoFlow,
      autoColumns,
      autoRows,
      as: Component = 'div',
      className = '',
      ...props
    },
    ref
  ) => {
    // Build CSS classes
    const classes: string[] = ['grid'];

    const resolveSpacing = (s?: SpacingValue | 'none') => {
      if (!s || s === 'none') return null;
      const map: Record<string, keyof typeof SPACING> = {
        sm: 2 as unknown,
        md: 4 as unknown,
        lg: 6 as unknown,
        xl: 8 as unknown,
      };
      const key = (SPACING as unknown)[s]
        ? (s as keyof typeof SPACING)
        : (map[s as string] ?? (s as unknown));
      return SPACING[key];
    };

    // Add gap classes
    const g = resolveSpacing(gap);
    if (g) classes.push(`gap-[${g}]`);
    const gx = resolveSpacing(columnGap);
    if (gx) classes.push(`gap-x-[${gx}]`);
    const gy = resolveSpacing(rowGap);
    if (gy) classes.push(`gap-y-[${gy}]`);

    // Add alignment classes
    if (justifyItems) classes.push(`justify-items-${justifyItems}`);
    if (alignItems) classes.push(`items-${alignItems}`);
    if (justifyContent) classes.push(`justify-${justifyContent}`);
    if (alignContent) classes.push(`content-${alignContent}`);

    // Add custom className
    if (className) {
      classes.push(className);
    }

    // Build inline styles for dynamic grid properties
    const inlineStyles: React.CSSProperties = {};

    // Handle columns
    if (columns) {
      if (typeof columns === 'number') {
        inlineStyles.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
      } else if (typeof columns === 'string') {
        inlineStyles.gridTemplateColumns = columns;
      }
      // if it's an object (responsive signature), ignore at runtime but allow typing
    }

    // Handle rows
    if (rows) {
      if (typeof rows === 'number') {
        inlineStyles.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
      } else {
        inlineStyles.gridTemplateRows = rows;
      }
    }

    // Handle template overrides
    if (templateColumns) inlineStyles.gridTemplateColumns = templateColumns;
    if (templateRows) inlineStyles.gridTemplateRows = templateRows;
    if (templateAreas) inlineStyles.gridTemplateAreas = templateAreas;

    // Handle auto properties
    if (autoFlow) inlineStyles.gridAutoFlow = autoFlow;
    if (autoColumns) inlineStyles.gridAutoColumns = autoColumns;
    if (autoRows) inlineStyles.gridAutoRows = autoRows;

    const Comp = Component as unknown;
    return (
      <Comp
        ref={ref as unknown}
        className={classes.join(' ')}
        style={inlineStyles}
        {...(props as unknown)}
      >
        {children}
      </Comp>
    );
  }
);

Grid.displayName = 'Grid';

export default Grid;
