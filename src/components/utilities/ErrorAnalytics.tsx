/**
 * Error Analytics Component
 * Displays error statistics and patterns for debugging
 */

import React, { useEffect, useState } from 'react';

import Card, { CardBody, CardHeader } from '@/components/ui/atoms/Card';
import { useTheme } from '@/design-system/theme';
import type { ErrorPattern } from '@/utils/errorMonitoring';
import { errorMonitor } from '@/utils/errorMonitoring';

const ErrorAnalytics: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(errorMonitor.getStats());
  const [patterns, setPatterns] = useState<ErrorPattern[]>([]);

  useEffect(() => {
    // Refresh stats every 5 seconds
    const interval = setInterval(() => {
      setStats(errorMonitor.getStats());
      setPatterns(errorMonitor.getPatterns());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const textColor = theme.isDark ? 'text-gray-200' : 'text-gray-800';
  const secondaryTextColor = theme.isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme.isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overview Stats */}
      <Card className={borderColor}>
        <CardHeader>
          <h2 className={`text-lg font-semibold ${textColor}`}>📊 Error Analytics</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${textColor}`}>{stats.totalErrors}</div>
              <div className={`text-sm ${secondaryTextColor}`}>Total Errors</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${textColor}`}>{stats.errorRate.toFixed(1)}</div>
              <div className={`text-sm ${secondaryTextColor}`}>Errors/min</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${textColor}`}>{stats.recentErrors.length}</div>
              <div className={`text-sm ${secondaryTextColor}`}>Recent (1h)</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${textColor}`}>{patterns.length}</div>
              <div className={`text-sm ${secondaryTextColor}`}>Patterns</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Errors by Type */}
      <Card className={borderColor}>
        <CardHeader>
          <h3 className={`text-md font-semibold ${textColor}`}>Errors by Type</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {Object.entries(stats.errorsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className={secondaryTextColor}>{type.replace(/_/g, ' ')}</span>
                <span className={`font-semibold ${textColor}`}>{count}</span>
              </div>
            ))}
            {Object.keys(stats.errorsByType).length === 0 && (
              <p className={secondaryTextColor}>No errors recorded</p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Errors by Severity */}
      <Card className={borderColor}>
        <CardHeader>
          <h3 className={`text-md font-semibold ${textColor}`}>Errors by Severity</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {Object.entries(stats.errorsBySeverity).map(([severity, count]) => (
              <div key={severity} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {severity === 'critical' && <span className="text-red-500">🔴</span>}
                  {severity === 'high' && <span className="text-orange-500">🟠</span>}
                  {severity === 'medium' && <span className="text-yellow-500">🟡</span>}
                  {severity === 'low' && <span className="text-green-500">🟢</span>}
                  <span className={secondaryTextColor}>{severity}</span>
                </div>
                <span className={`font-semibold ${textColor}`}>{count}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Top Errors */}
      {stats.topErrors.length > 0 && (
        <Card className={borderColor}>
          <CardHeader>
            <h3 className={`text-md font-semibold ${textColor}`}>Top Errors</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {stats.topErrors.map((err, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <span className={`text-sm ${secondaryTextColor} flex-1 truncate`}>
                    {err.error}
                  </span>
                  <span className={`font-semibold ${textColor} ml-2`}>{err.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error Patterns */}
      {patterns.length > 0 && (
        <Card className={borderColor}>
          <CardHeader>
            <h3 className={`text-md font-semibold ${textColor}`}>⚠️ Detected Patterns</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {patterns.slice(0, 5).map((pattern, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-md ${theme.isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-medium ${textColor}`}>{pattern.pattern}</span>
                    <span className={`text-sm font-semibold ${textColor}`}>{pattern.count}x</span>
                  </div>
                  <div className={`text-xs ${secondaryTextColor}`}>
                    First: {new Date(pattern.firstOccurrence).toLocaleTimeString()} | Last:{' '}
                    {new Date(pattern.lastOccurrence).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ErrorAnalytics;
