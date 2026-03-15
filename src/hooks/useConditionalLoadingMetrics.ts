import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to monitor conditional loading performance metrics
 */

interface LoadingMetric {
  componentName: string;
  loadingStrategy: string;
  triggerTime: number;
  loadStartTime: number;
  loadEndTime?: number;
  loadDuration?: number;
  wasVisible: boolean;
  wasHovered: boolean;
  wasClicked: boolean;
  userInitiated: boolean;
  bundleSize?: number;
  error?: string;
}

interface LoadingMetrics {
  totalComponents: number;
  loadedComponents: number;
  averageLoadTime: number;
  totalBundleSize: number;
  loadingStrategies: Record<string, number>;
  successRate: number;
  userInitiatedLoads: number;
  automaticLoads: number;
  metrics: LoadingMetric[];
}

interface ConditionalLoadingMetricsHook {
  metrics: LoadingMetrics;
  recordLoadStart: (
    componentName: string,
    strategy: string,
    context: Partial<LoadingMetric>
  ) => void;
  recordLoadEnd: (componentName: string, success: boolean, error?: string) => void;
  recordBundleSize: (componentName: string, size: number) => void;
  getMetricsSummary: () => string;
  exportMetrics: () => LoadingMetric[];
  clearMetrics: () => void;
}

export const useConditionalLoadingMetrics = (): ConditionalLoadingMetricsHook => {
  const [loadingMetrics, setLoadingMetrics] = useState<LoadingMetric[]>([]);
  const metricsRef = useRef<Map<string, LoadingMetric>>(new Map());

  // Record when a component starts loading
  const recordLoadStart = useCallback(
    (componentName: string, strategy: string, context: Partial<LoadingMetric> = {}) => {
      const metric: LoadingMetric = {
        componentName,
        loadingStrategy: strategy,
        triggerTime: performance.now(),
        loadStartTime: performance.now(),
        wasVisible: context.wasVisible || false,
        wasHovered: context.wasHovered || false,
        wasClicked: context.wasClicked || false,
        userInitiated:
          strategy === 'click' || strategy === 'manual' || context.userInitiated || false,
        ...context,
      };

      metricsRef.current.set(componentName, metric);
      setLoadingMetrics(prev => [...prev.filter(m => m.componentName !== componentName), metric]);
    },
    []
  );

  // Record when a component finishes loading
  const recordLoadEnd = useCallback((componentName: string, success: boolean, error?: string) => {
    const metric = metricsRef.current.get(componentName);
    if (!metric) return;

    const endTime = performance.now();
    const updatedMetric: LoadingMetric = {
      ...metric,
      loadEndTime: endTime,
      loadDuration: endTime - metric.loadStartTime,
      error: success ? undefined : error,
    };

    metricsRef.current.set(componentName, updatedMetric);
    setLoadingMetrics(prev =>
      prev.map(m => (m.componentName === componentName ? updatedMetric : m))
    );
  }, []);

  // Record bundle size for a component
  const recordBundleSize = useCallback((componentName: string, size: number) => {
    const metric = metricsRef.current.get(componentName);
    if (!metric) return;

    const updatedMetric: LoadingMetric = {
      ...metric,
      bundleSize: size,
    };

    metricsRef.current.set(componentName, updatedMetric);
    setLoadingMetrics(prev =>
      prev.map(m => (m.componentName === componentName ? updatedMetric : m))
    );
  }, []);

  // Calculate aggregated metrics
  const metrics: LoadingMetrics = {
    totalComponents: loadingMetrics.length,
    loadedComponents: loadingMetrics.filter(m => m.loadEndTime).length,
    averageLoadTime:
      loadingMetrics
        .filter(m => m.loadDuration)
        .reduce((sum, m) => sum + (m.loadDuration || 0), 0) /
      Math.max(1, loadingMetrics.filter(m => m.loadDuration).length),
    totalBundleSize: loadingMetrics
      .filter(m => m.bundleSize)
      .reduce((sum, m) => sum + (m.bundleSize || 0), 0),
    loadingStrategies: loadingMetrics.reduce(
      (acc, m) => {
        acc[m.loadingStrategy] = (acc[m.loadingStrategy] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    successRate:
      loadingMetrics.length > 0
        ? loadingMetrics.filter(m => m.loadEndTime && !m.error).length / loadingMetrics.length
        : 0,
    userInitiatedLoads: loadingMetrics.filter(m => m.userInitiated).length,
    automaticLoads: loadingMetrics.filter(m => !m.userInitiated).length,
    metrics: loadingMetrics,
  };

  // Generate metrics summary
  const getMetricsSummary = useCallback(() => {
    const summary = [
      `📊 Conditional Loading Metrics Summary`,
      `=====================================`,
      `Total Components: ${metrics.totalComponents}`,
      `Loaded Components: ${metrics.loadedComponents}`,
      `Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`,
      `Average Load Time: ${metrics.averageLoadTime.toFixed(2)}ms`,
      `Total Bundle Size: ${(metrics.totalBundleSize / 1024).toFixed(2)}KB`,
      ``,
      `Loading Strategies:`,
      ...Object.entries(metrics.loadingStrategies).map(
        ([strategy, count]) => `  ${strategy}: ${count} components`
      ),
      ``,
      `User vs Automatic:`,
      `  User Initiated: ${metrics.userInitiatedLoads}`,
      `  Automatic: ${metrics.automaticLoads}`,
      ``,
      `Component Details:`,
      ...loadingMetrics.map(
        m =>
          `  ${m.componentName}: ${m.loadingStrategy} (${m.loadDuration?.toFixed(2) || 'pending'}ms)`
      ),
    ];

    return summary.join('\n');
  }, [metrics, loadingMetrics]);

  // Export metrics for analysis
  const exportMetrics = useCallback(() => {
    return [...loadingMetrics];
  }, [loadingMetrics]);

  // Clear all metrics
  const clearMetrics = useCallback(() => {
    setLoadingMetrics([]);
    metricsRef.current.clear();
  }, []);

  // Performance observer for bundle size estimation
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.name.includes('chunk')) {
            // Try to match chunk names to component names
            const chunkName = entry.name.split('/').pop()?.split('.')[0];
            if (chunkName) {
              const size = (entry as any).transferSize || (entry as any).encodedBodySize || 0;
              // Find matching component metric
              const matchingMetric = Array.from(metricsRef.current.values()).find(m =>
                m.componentName.toLowerCase().includes(chunkName.toLowerCase())
              );

              if (matchingMetric) {
                recordBundleSize(matchingMetric.componentName, size);
              }
            }
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });

      return () => observer.disconnect();
    }
  }, [recordBundleSize]);

  return {
    metrics,
    recordLoadStart,
    recordLoadEnd,
    recordBundleSize,
    getMetricsSummary,
    exportMetrics,
    clearMetrics,
  };
};

/**
 * Global metrics instance for tracking across the app
 */
let globalMetricsInstance: ConditionalLoadingMetricsHook | null = null;

export const getGlobalMetrics = () => {
  if (!globalMetricsInstance) {
    // This is a simplified version - in a real app you'd use a context or state management
    console.warn('Global metrics instance not initialized. Use useConditionalLoadingMetrics hook.');
  }
  return globalMetricsInstance;
};

export const initializeGlobalMetrics = (instance: ConditionalLoadingMetricsHook) => {
  globalMetricsInstance = instance;
};

/**
 * Higher-order component to automatically track loading metrics
 */
export const withLoadingMetrics = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string,
  loadingStrategy: string
) => {
  const WithLoadingMetricsComponent = (props: P) => {
    const metrics = useConditionalLoadingMetrics();

    useEffect(() => {
      metrics.recordLoadStart(componentName, loadingStrategy, {});

      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        metrics.recordLoadEnd(componentName, true);
      };
    }, [metrics, componentName, loadingStrategy]);

    return React.createElement(WrappedComponent, props);
  };

  WithLoadingMetricsComponent.displayName = `withLoadingMetrics(${componentName})`;

  return WithLoadingMetricsComponent;
};

/**
 * Hook to track individual component loading performance
 */
export const useComponentLoadingMetrics = (componentName: string, loadingStrategy: string) => {
  const metrics = useConditionalLoadingMetrics();
  const hasRecordedStart = useRef(false);

  useEffect(() => {
    if (!hasRecordedStart.current) {
      metrics.recordLoadStart(componentName, loadingStrategy, {});
      hasRecordedStart.current = true;
    }

    return () => {
      metrics.recordLoadEnd(componentName, true);
    };
  }, [metrics, componentName, loadingStrategy]);

  return {
    recordError: (error: string) => metrics.recordLoadEnd(componentName, false, error),
    recordSuccess: () => metrics.recordLoadEnd(componentName, true),
  };
};

export default useConditionalLoadingMetrics;
