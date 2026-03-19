/**
 * Performance Context for managing global performance state
 */

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { PerformanceContextError } from '@/errors/domainErrors';
import type { PerformanceConfig, PerformanceMetrics } from '@/utils/performance';
import {
  clearPerformanceMetrics,
  getPerformanceMetrics,
  getPerformanceSummary,
  initPerformanceMonitoring,
  logPerformanceReport,
} from '@/utils/performance';

interface PerformanceContextType {
  metrics: PerformanceMetrics[];
  summary: Record<string, unknown>;
  isEnabled: boolean;
  logReport: () => void;
  clearMetrics: () => void;
  refreshMetrics: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
  config?: Partial<PerformanceConfig>;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children, config }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring(config);
    setIsEnabled(process.env.NODE_ENV === 'development' && config?.enabled !== false);

    // Set up periodic metrics refresh
    const interval = setInterval(() => {
      refreshMetrics();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [config]);

  const refreshMetrics = () => {
    const newMetrics = getPerformanceMetrics();
    const newSummary = getPerformanceSummary();
    setMetrics(newMetrics);
    setSummary(newSummary);
  };

  const logReport = () => {
    logPerformanceReport();
    refreshMetrics();
  };

  const clearMetrics = () => {
    clearPerformanceMetrics();
    setMetrics([]);
    setSummary({});
  };

  const contextValue: PerformanceContextType = {
    metrics,
    summary,
    isEnabled,
    logReport,
    clearMetrics,
    refreshMetrics,
  };

  return <PerformanceContext.Provider value={contextValue}>{children}</PerformanceContext.Provider>;
};

export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new PerformanceContextError('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

// Hook for component-specific performance monitoring
export const useComponentPerformance = (componentName: string) => {
  const { metrics, isEnabled } = usePerformance();

  const componentMetrics = metrics.filter(m => m.componentName === componentName);
  const avgRenderTime =
    componentMetrics.length > 0
      ? componentMetrics.reduce((sum, m) => sum + m.actualDuration, 0) / componentMetrics.length
      : 0;
  const maxRenderTime = Math.max(...componentMetrics.map(m => m.actualDuration), 0);
  const renderCount = componentMetrics.length;

  return {
    metrics: componentMetrics,
    avgRenderTime,
    maxRenderTime,
    renderCount,
    isEnabled,
  };
};

// Performance monitoring hook for development
export const useDevPerformance = () => {
  const { metrics, summary, isEnabled, logReport, clearMetrics } = usePerformance();

  useEffect(() => {
    if (isEnabled && process.env.NODE_ENV === 'development') {
      // Log performance metrics in development
      console.log('📈 Performance Metrics:', { metrics, summary });
    }
  }, [metrics, summary, isEnabled]);

  return {
    metrics,
    summary,
    isEnabled,
    logReport,
    clearMetrics,
    isDevelopment: process.env.NODE_ENV === 'development',
  };
};

export default PerformanceContext;
