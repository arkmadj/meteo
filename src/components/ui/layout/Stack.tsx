/**
 * Stack Component
 * Vertical stacking layout with consistent spacing
 */

import React from 'react';

import { SPACING } from '../../../design-system/tokens';

type SpacingValue = keyof typeof SPACING | 'sm' | 'md' | 'lg' | 'xl' | 'xs' | '2xl';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;

  // Spacing between items
  spacing?: SpacingValue | 'none';

  // Direction
  direction?: 'column' | 'column-reverse' | 'row' | 'row-reverse';

  // Alignment
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';

  // Wrapping
  wrap?: boolean;

  // Dividers
  dividers?: boolean;
  dividerColor?: string;

  // Component props
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      children,
      spacing = 'md',
      direction = 'column',
      alignItems = 'stretch',
      justifyContent = 'flex-start',
      wrap = false,
      dividers = false,
      dividerColor = 'border-gray-200',
      as: Component = 'div',
      className = '',
      ...props
    },
    ref
  ) => {
    // Map alignment values to proper Tailwind classes
    const alignItemsMap: Record<string, string> = {
      stretch: 'items-stretch',
      'flex-start': 'items-start',
      'flex-end': 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
    };

    const justifyContentMap: Record<string, string> = {
      'flex-start': 'justify-start',
      'flex-end': 'justify-end',
      center: 'justify-center',
      'space-between': 'justify-between',
      'space-around': 'justify-around',
      'space-evenly': 'justify-evenly',
    };

    // Map direction values to proper Tailwind classes
    const directionMap: Record<string, string> = {
      column: 'flex-col',
      'column-reverse': 'flex-col-reverse',
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
    };

    // Build CSS classes
    const classes: string[] = [
      'flex',
      directionMap?.[direction] || 'flex-col',
      alignItemsMap?.[alignItems] || 'items-stretch',
      justifyContentMap?.[justifyContent] || 'justify-start',
    ];

    if (wrap) {
      classes.push('flex-wrap');
    }

    if (className) {
      classes.push(className);
    }

    // Resolve spacing token to SPACING key and Tailwind class
    const resolveSpacing = (
      s: SpacingValue | 'none'
    ): { key: keyof typeof SPACING | 'none'; class: string } => {
      if (s === 'none') return { key: 'none', class: '' };

      // Map shorthand values to SPACING keys
      const shorthandMap: Record<string, keyof typeof SPACING> = {
        xs: 1,
        sm: 2,
        md: 4,
        lg: 6,
        xl: 8,
        '2xl': 12,
      };

      // Get the actual spacing key
      const spacingKey = shorthandMap?.[s as string] ?? (s as keyof typeof SPACING);

      // Map spacing keys to Tailwind classes
      const tailwindClassMap: Record<string, string> = {
        px: 'px',
        0: '0',
        0.5: '0.5',
        1: '1',
        1.5: '1.5',
        2: '2',
        2.5: '2.5',
        3: '3',
        3.5: '3.5',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
        8: '8',
        9: '9',
        10: '10',
        11: '11',
        12: '12',
        14: '14',
        16: '16',
        18: '18',
        20: '20',
        24: '24',
        28: '28',
        32: '32',
        36: '36',
        40: '40',
        44: '44',
        48: '48',
        52: '52',
        56: '56',
        60: '60',
        64: '64',
        72: '72',
        80: '80',
        96: '96',
      };

      const tailwindClass = tailwindClassMap?.[String(spacingKey)] || '4';

      return {
        key: spacingKey,
        class: tailwindClass,
      };
    };

    // Process children with spacing and dividers
    const processedChildren = React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;

      const childClasses: string[] = [];
      const childStyles: React.CSSProperties = {};

      // Add spacing (except for the first child)
      if (index > 0 && spacing !== 'none') {
        const { class: spacingClass } = resolveSpacing(spacing);
        if (spacingClass) {
          if (direction === 'column' || direction === 'column-reverse') {
            childClasses.push(`mt-${spacingClass}`);
          } else {
            childClasses.push(`ml-${spacingClass}`);
          }
        }
      }

      // Clone child with additional classes and styles
      if (childClasses.length > 0) {
        const existingClassName = (child.props as unknown).className || '';
        return React.cloneElement(child, {
          ...child.props,
          className: `${existingClassName} ${childClasses.join(' ')}`.trim(),
          style: { ...childStyles, ...(child.props as unknown).style },
        });
      }

      return child;
    });

    // If dividers are requested, add divider elements between children
    let finalChildren = processedChildren;
    if (dividers && React.Children.count(children) > 1) {
      const childrenArray = React.Children.toArray(processedChildren);
      finalChildren = childrenArray.reduce((acc: unknown[], child, index) => {
        acc.push(child as unknown);

        // Add divider between items (not after the last one)
        if (index < childrenArray.length - 1) {
          const { key: spacingKey } = resolveSpacing(spacing);
          const divider = (
            <div
              key={`divider-${String((child as unknown)?.key ?? index)}-${String((childrenArray?.[index + 1] as unknown)?.key ?? index + 1)}`}
              className={`flex-shrink-0 border-t ${dividerColor}`}
              style={{
                height: direction === 'column' || direction === 'column-reverse' ? '1px' : 'auto',
                width: direction === 'column' || direction === 'column-reverse' ? 'auto' : '1px',
                marginTop:
                  (direction === 'column' || direction === 'column-reverse') &&
                  spacing !== 'none' &&
                  spacingKey !== 'none'
                    ? `calc(${SPACING?.[spacingKey]} / 2)`
                    : undefined,
                marginBottom:
                  (direction === 'column' || direction === 'column-reverse') &&
                  spacing !== 'none' &&
                  spacingKey !== 'none'
                    ? `calc(${SPACING?.[spacingKey]} / 2)`
                    : undefined,
                marginLeft:
                  (direction === 'row' || direction === 'row-reverse') &&
                  spacing !== 'none' &&
                  spacingKey !== 'none'
                    ? `calc(${SPACING?.[spacingKey]} / 2)`
                    : undefined,
                marginRight:
                  (direction === 'row' || direction === 'row-reverse') &&
                  spacing !== 'none' &&
                  spacingKey !== 'none'
                    ? `calc(${SPACING?.[spacingKey]} / 2)`
                    : undefined,
              }}
            />
          );
          acc.push(divider);
        }

        return acc;
      }, []);
    }

    const Comp = Component as unknown;
    return (
      <Comp ref={ref as unknown} className={classes.join(' ')} {...(props as unknown)}>
        {finalChildren}
      </Comp>
    );
  }
);

Stack.displayName = 'Stack';

export default Stack;
