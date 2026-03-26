/**
 * ARIA Live Debug Panel Component
 * Visual debugging tool for monitoring aria-live announcements
 * Helps identify and resolve conflicts between screen reader announcements
 */

import React, { useCallback, useEffect, useState } from 'react';

import { BORDER_RADIUS, COLORS, SPACING } from '@/design-system/tokens';
import {
  type AnnouncementConflict,
  type AriaAnnouncement,
  useAriaLiveDebugger,
} from '@/utils/AriaLiveDebugger';

const AriaLiveDebugPanel: React.FC = () => {
  const ariaDebugger = useAriaLiveDebugger();
  const [isEnabled, setIsEnabled] = useState(false);
  const [announcements, setAnnouncements] = useState<AriaAnnouncement[]>([]);
  const [conflicts, setConflicts] = useState<AnnouncementConflict[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    byType: {} as Record<string, number>,
    byRole: {} as Record<string, number>,
    averageInterval: 0,
  });

  const updateStatistics = useCallback(() => {
    setStatistics(ariaDebugger.getStatistics());
  }, [ariaDebugger]);

  useEffect(() => {
    if (!isEnabled) return;

    // Subscribe to announcements
    const unsubscribeAnnouncement = ariaDebugger.onAnnouncement(announcement => {
      setAnnouncements(prev => [...prev, announcement].slice(-50)); // Keep last 50
      updateStatistics();
    });

    // Subscribe to conflicts
    const unsubscribeConflict = ariaDebugger.onConflict(conflict => {
      setConflicts(prev => [...prev, conflict].slice(-20)); // Keep last 20
    });

    return () => {
      unsubscribeAnnouncement();
      unsubscribeConflict();
    };
  }, [isEnabled, ariaDebugger, updateStatistics]);

  const handleToggle = () => {
    if (isEnabled) {
      ariaDebugger.stop();
      setIsEnabled(false);
    } else {
      ariaDebugger.start();
      setIsEnabled(true);
    }
  };

  const handleClear = () => {
    ariaDebugger.clear();
    setAnnouncements([]);
    setConflicts([]);
    setStatistics({
      total: 0,
      byType: {},
      byRole: {},
      averageInterval: 0,
    });
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    } as Intl.DateTimeFormatOptions);
  };

  const getConflictColor = (type: AnnouncementConflict['type']) => {
    switch (type) {
      case 'duplicate':
        return COLORS.semantic.warning[500];
      case 'rapid-fire':
        return COLORS.semantic.error[500];
      case 'interruption':
        return COLORS.primary[500];
      case 'nested':
        return COLORS.semantic.warning[600];
      default:
        return COLORS.neutral[500];
    }
  };

  const getAriaLiveColor = (ariaLive: string) => {
    switch (ariaLive) {
      case 'assertive':
        return COLORS.semantic.error[400];
      case 'polite':
        return COLORS.semantic.success[400];
      default:
        return COLORS.neutral[400];
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: SPACING[4],
        right: SPACING[4],
        width: '500px',
        maxHeight: '600px',
        background: COLORS.neutral[900],
        color: COLORS.neutral[50],
        borderRadius: BORDER_RADIUS.lg,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        border: `2px solid ${isEnabled ? COLORS.semantic.success[500] : COLORS.neutral[700]}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: SPACING[4],
          borderBottom: `1px solid ${COLORS.neutral[700]}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>ARIA Live Debugger</h2>
          <p
            style={{
              margin: 0,
              marginTop: SPACING[1],
              fontSize: '11px',
              color: COLORS.neutral[400],
            }}
          >
            {isEnabled ? '🟢 Monitoring active' : '⚫ Monitoring inactive'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: SPACING[2] }}>
          <button
            onClick={handleToggle}
            style={{
              padding: `${SPACING[2]} ${SPACING[3]}`,
              background: isEnabled ? COLORS.semantic.error[600] : COLORS.semantic.success[600],
              color: COLORS.neutral[50],
              border: 'none',
              borderRadius: BORDER_RADIUS.md,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {isEnabled ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={handleClear}
            style={{
              padding: `${SPACING[2]} ${SPACING[3]}`,
              background: COLORS.neutral[700],
              color: COLORS.neutral[50],
              border: 'none',
              borderRadius: BORDER_RADIUS.md,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div
        style={{
          padding: SPACING[3],
          background: COLORS.neutral[800],
          borderBottom: `1px solid ${COLORS.neutral[700]}`,
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: SPACING[2] }}>
          <div>
            <div style={{ color: COLORS.neutral[400] }}>Total</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '2px' }}>
              {statistics.total}
            </div>
          </div>
          <div>
            <div style={{ color: COLORS.neutral[400] }}>Conflicts</div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 600,
                marginTop: '2px',
                color: COLORS.semantic.error[400],
              }}
            >
              {conflicts.length}
            </div>
          </div>
          <div>
            <div style={{ color: COLORS.neutral[400] }}>Avg Interval</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '2px' }}>
              {statistics.averageInterval > 0
                ? `${Math.round(statistics.averageInterval)}ms`
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div
          style={{
            padding: SPACING[3],
            background: COLORS.semantic.error[950],
            borderBottom: `1px solid ${COLORS.neutral[700]}`,
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: SPACING[2],
              color: COLORS.semantic.error[300],
            }}
          >
            ⚠️ Conflicts Detected
          </div>
          {conflicts.map((conflict, index) => (
            <div
              key={index}
              style={{
                marginBottom: SPACING[2],
                padding: SPACING[2],
                background: COLORS.neutral[900],
                borderRadius: BORDER_RADIUS.sm,
                borderLeft: `3px solid ${getConflictColor(conflict.type)}`,
                fontSize: '11px',
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: getConflictColor(conflict.type),
                  marginBottom: '4px',
                }}
              >
                {conflict.type.toUpperCase()}
              </div>
              <div style={{ color: COLORS.neutral[300] }}>{conflict.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Announcements */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: SPACING[3],
          fontSize: '11px',
          fontFamily: 'monospace',
        }}
      >
        {announcements.length === 0 ? (
          <div
            style={{
              color: COLORS.neutral[500],
              fontStyle: 'italic',
              textAlign: 'center',
              padding: SPACING[4],
            }}
          >
            {isEnabled ? 'Waiting for announcements...' : 'Click "Start" to begin monitoring'}
          </div>
        ) : (
          announcements.map(announcement => (
            <div
              key={announcement.id}
              style={{
                marginBottom: SPACING[2],
                padding: SPACING[2],
                background: COLORS.neutral[800],
                borderRadius: BORDER_RADIUS.sm,
                borderLeft: `3px solid ${getAriaLiveColor(announcement.ariaLive)}`,
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}
              >
                <span style={{ color: COLORS.neutral[400] }}>
                  {formatTimestamp(announcement.timestamp)}
                </span>
                <span
                  style={{
                    color: getAriaLiveColor(announcement.ariaLive),
                    fontWeight: 600,
                    fontSize: '10px',
                  }}
                >
                  {announcement.ariaLive.toUpperCase()}
                </span>
              </div>
              <div style={{ color: COLORS.neutral[100], marginBottom: '4px' }}>
                {announcement.message}
              </div>
              <div style={{ color: COLORS.neutral[500], fontSize: '10px' }}>
                role="{announcement.role}" • {announcement.element}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: SPACING[3],
          borderTop: `1px solid ${COLORS.neutral[700]}`,
          fontSize: '10px',
          color: COLORS.neutral[500],
          textAlign: 'center',
        }}
      >
        Monitor aria-live announcements in real-time • Detect conflicts • Debug screen reader issues
      </div>
    </div>
  );
};

export default AriaLiveDebugPanel;
