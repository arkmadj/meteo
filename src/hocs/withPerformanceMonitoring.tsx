/**
 * Higher-Order Component for performance monitoring
 */

import React from 'react';

import { PerformanceProfiler } from '@/utils/performance';

export interface WithPerformanceMonitoringProps {
  // Add any additional props here if needed
}

export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  const profilerId = componentName || displayName;

  const ComponentWithPerformanceMonitoring: React.FC<
    P & WithPerformanceMonitoringProps
  > = props => {
    return (
      <PerformanceProfiler id={profilerId}>
        <WrappedComponent {...props} />
      </PerformanceProfiler>
    );
  };

  ComponentWithPerformanceMonitoring.displayName = `WithPerformanceMonitoring(${displayName})`;

  return ComponentWithPerformanceMonitoring;
};

// Performance monitoring decorator for class components
export function PerformanceMonitoring<T extends new (...args: unknown[]) => React.Component>(
  componentName?: string
) {
  return function (constructor: T) {
    const displayName = constructor.name || 'Component';
    const profilerId = componentName || displayName;

    return class extends constructor {
      static displayName = `PerformanceMonitoring(${displayName})`;

      render() {
        return <PerformanceProfiler id={profilerId}>{super.render()}</PerformanceProfiler>;
      }
    };
  };
}
