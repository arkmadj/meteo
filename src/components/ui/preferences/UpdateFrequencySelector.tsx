/**
 * Update Frequency Selector Component
 * Allows users to configure how often weather data is refreshed
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import { RadioGroup } from '@/components/ui/atoms';
import { useTheme } from '@/design-system/theme';
import { useUserPreferencesContext } from '@/contexts/UserPreferencesContext';

export type UpdateFrequency = 'off' | 'low' | 'medium' | 'high' | 'realtime';

interface UpdateFrequencySelectorProps {
  className?: string;
  disabled?: boolean;
  showDescription?: boolean;
}

const UpdateFrequencySelector: React.FC<UpdateFrequencySelectorProps> = ({
  className = '',
  disabled = false,
  showDescription = true,
}) => {
  const { t } = useTranslation('settings');
  const { _theme } = useTheme();
  const { preferences, getUpdateFrequencyInterval, updateUpdateFrequency } =
    useUserPreferencesContext();

  const frequencyOptions = [
    {
      value: 'off' as UpdateFrequency,
      label: t('updateFrequency.off.label', 'Off'),
      description: t(
        'updateFrequency.off.description',
        'No automatic refresh - refresh manually only'
      ),
    },
    {
      value: 'low' as UpdateFrequency,
      label: t('updateFrequency.low.label', 'Low (30 min)'),
      description: t(
        'updateFrequency.low.description',
        'Refresh every 30 minutes - saves battery and data'
      ),
    },
    {
      value: 'medium' as UpdateFrequency,
      label: t('updateFrequency.medium.label', 'Medium (10 min)'),
      description: t(
        'updateFrequency.medium.description',
        'Refresh every 10 minutes - balanced approach'
      ),
    },
    {
      value: 'high' as UpdateFrequency,
      label: t('updateFrequency.high.label', 'High (5 min)'),
      description: t(
        'updateFrequency.high.description',
        'Refresh every 5 minutes - more frequent updates'
      ),
    },
    {
      value: 'realtime' as UpdateFrequency,
      label: t('updateFrequency.realtime.label', 'Real-time (1 min)'),
      description: t(
        'updateFrequency.realtime.description',
        'Refresh every minute - latest data, higher usage'
      ),
    },
  ];

  const handleFrequencyChange = (value: string) => {
    updateUpdateFrequency(value as UpdateFrequency);
  };

  const getCurrentIntervalDisplay = () => {
    const interval = getUpdateFrequencyInterval();
    if (interval === false) {
      return t('updateFrequency.current.off', 'No automatic refresh');
    }
    const minutes = Math.round(interval / (60 * 1000));
    return t('updateFrequency.current.interval', 'Refreshes every {{count}} minute', {
      count: minutes,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <RadioGroup
        value={preferences.updateFrequency}
        onChange={handleFrequencyChange}
        options={frequencyOptions}
        disabled={disabled}
        helperText={
          showDescription
            ? t(
                'updateFrequency.helperText',
                'Choose how often weather data should be updated. More frequent updates use more battery and data.'
              )
            : undefined
        }
      />

      {showDescription && (
        <div
          className="mt-2 text-sm transition-colors duration-200"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          <p>{getCurrentIntervalDisplay()}</p>
        </div>
      )}
    </div>
  );
};

export default UpdateFrequencySelector;
