/**
 * Layout Components Barrel Export
 *
 * Base layout components for consistent structure and reusability:
 * - Box: Basic wrapper with spacing utilities and layout properties
 * - Container: Consistent max-widths and centering
 * - Stack: Vertical stacking with consistent spacing
 * - Flex: Flexible box layout for horizontal arrangements
 * - Grid: Responsive grid layout component
 */

export { default as Box } from './Box';
export { default as Container } from './Container';
export { default as Stack } from './Stack';
export { default as Flex } from './Flex';
export { default as Grid } from './Grid';

// Re-export types for convenience
export type { default as BoxProps } from './Box';
export type { default as ContainerProps } from './Container';
export type { default as StackProps } from './Stack';
export type { default as FlexProps } from './Flex';
export type { default as GridProps } from './Grid';
