/**
 * Performance monitoring utilities for React Weather App
 */

import type { ProfilerOnRenderCallback } from 'react';
import React, { Profiler } from 'react';

import { getLogger } from '@/utils/logger';
import { sanitizeAnalyticsPayload } from '@/utils/sanitizer';

// Performance metrics interface
export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
  mountTime?: number;
  updateCount: number;
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: unknown[];
}

// Performance monitoring configuration
export interface PerformanceConfig {
  enabled: boolean;
  logThreshold: number; // in milliseconds
  maxMetrics: number;
  trackInteractions: boolean;
}

// Default configuration
const defaultConfig: PerformanceConfig = {
  enabled: process.env.NODE_ENV === 'development',
  logThreshold: 16, // 60fps = 16.67ms per frame
  maxMetrics: 100,
  trackInteractions: true,
};

const performanceLogger = getLogger('Performance');

// Global performance state
let performanceConfig: PerformanceConfig = { ...defaultConfig };
let performanceMetrics: PerformanceMetrics[] = [];
const mountTimes: Map<string, number> = new Map();

// Initialize performance monitoring
export const initPerformanceMonitoring = (config?: Partial<PerformanceConfig>) => {
  performanceConfig = { ...defaultConfig, ...config };
  performanceMetrics = [];
  mountTimes.clear();

  if (performanceConfig.enabled) {
    performanceLogger.info('Performance monitoring initialized', {
      config: sanitizeAnalyticsPayload(performanceConfig),
    });
  }
};

// Profiler render callback
export const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (!performanceConfig.enabled) return;

  const mountTime = mountTimes.get(id);
  const updateCount = performanceMetrics.filter(m => m.componentName === id).length;

  const metric: PerformanceMetrics = {
    componentName: id,
    renderTime: actualDuration,
    timestamp: Date.now(),
    mountTime,
    updateCount,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions: [],
  };

  performanceMetrics.push(metric);

  // Keep only the most recent metrics
  if (performanceMetrics.length > performanceConfig.maxMetrics) {
    performanceMetrics = performanceMetrics.slice(-performanceConfig.maxMetrics);
  }

  // Log slow renders
  if (actualDuration > performanceConfig.logThreshold) {
    performanceLogger.warn('Slow render detected', {
      component: id,
      actualDurationMs: Number(actualDuration.toFixed(2)),
      baseDurationMs: Number(baseDuration.toFixed(2)),
      phase,
      updateCount,
    });
  }

  // Track mount time
  if (phase === 'mount' && !mountTime) {
    mountTimes.set(id, actualDuration);
  }
};

// Performance monitoring component
export const PerformanceProfiler: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  if (!performanceConfig.enabled) {
    return React.createElement(React.Fragment, null, children);
  }

  return React.createElement(Profiler, { id, onRender: onRenderCallback }, children);
};

// Get performance metrics
export const getPerformanceMetrics = (): PerformanceMetrics[] => {
  return sanitizeAnalyticsPayload([...performanceMetrics]);
};

// Get metrics for a specific component
export const getComponentMetrics = (componentName: string): PerformanceMetrics[] => {
  return sanitizeAnalyticsPayload(
    performanceMetrics.filter(m => m.componentName === componentName)
  );
};

// Get average render time for a component
export const getAverageRenderTime = (componentName: string): number => {
  const metrics = getComponentMetrics(componentName);
  if (metrics.length === 0) return 0;

  const total = metrics.reduce((sum, m) => sum + m.actualDuration, 0);
  return total / metrics.length;
};

// Get performance summary
export const getPerformanceSummary = () => {
  const componentStats = new Map<
    string,
    {
      count: number;
      totalTime: number;
      maxTime: number;
      minTime: number;
      avgTime: number;
    }
  >();

  performanceMetrics.forEach(metric => {
    const current = componentStats.get(metric.componentName) || {
      count: 0,
      totalTime: 0,
      maxTime: 0,
      minTime: Infinity,
      avgTime: 0,
    };

    current.count++;
    current.totalTime += metric.actualDuration;
    current.maxTime = Math.max(current.maxTime, metric.actualDuration);
    current.minTime = Math.min(current.minTime, metric.actualDuration);
    current.avgTime = current.totalTime / current.count;

    componentStats.set(metric.componentName, current);
  });

  return sanitizeAnalyticsPayload(Object.fromEntries(componentStats));
};

// Log performance report
export const logPerformanceReport = () => {
  if (!performanceConfig.enabled) return;

  const summary = getPerformanceSummary();
  performanceLogger.info('Performance report generated', {
    summary,
  });
};

// Clear performance metrics
export const clearPerformanceMetrics = () => {
  performanceMetrics = [];
  mountTimes.clear();
};

// Performance monitoring hook
export const usePerformanceMonitoring = (componentName: string) => {
  const getMetrics = () => getComponentMetrics(componentName);
  const getAvgTime = () => getAverageRenderTime(componentName);

  return {
    getMetrics,
    getAvgTime,
    isEnabled: performanceConfig.enabled,
  };
};
