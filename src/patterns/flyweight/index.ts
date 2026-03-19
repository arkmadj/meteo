/**
 * Flyweight Pattern Exports
 *
 * Exports all components of the Flyweight pattern implementation
 * for optimizing map marker rendering.
 */

export { MarkerFlyweight } from './MarkerFlyweight';
export type { IMarkerIntrinsicState, IMarkerExtrinsicState, IMarkerData } from './MarkerFlyweight';

export { MarkerFlyweightFactory, MARKER_TYPES } from './MarkerFlyweightFactory';
