/**
 * WindGustIndicator Component
 * A visual indicator for wind gust speeds with clear distinction from regular wind speed
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindSpeedUnit } from '@/hooks/useWindSpeedUnit';

interface WindGustIndicatorProps {
  windSpeed: number;
  gustSpeed: number;
  size?: 'sm' | 'md' | 'lg';
  showValues?: boolean;
  showGustFactor?: boolean;
  showAnimation?: boolean;
  className?: string;
}

const WindGustIndicator: React.FC<WindGustIndicatorProps> = ({
  windSpeed,
  gustSpeed,
  size = 'md',
  showValues = true,
  showGustFactor = true,
  showAnimation = true,
  className = '',
}) => {
  const { t } = useTranslation(['weather']);
  const { formatWindSpeed, getUnitSymbol, currentUnit } = useWindSpeedUnit();
  const [animatedGust, setAnimatedGust] = useState(gustSpeed);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'h-16',
      bar: 'h-3',
      text: 'text-xs',
      valueText: 'text-sm',
      spacing: 'space-y-2',
    },
    md: {
      container: 'h-20',
      bar: 'h-4',
      text: 'text-sm',
      valueText: 'text-base',
      spacing: 'space-y-3',
    },
    lg: {
      container: 'h-24',
      bar: 'h-5',
      text: 'text-base',
      valueText: 'text-lg',
      spacing: 'space-y-4',
    },
  };

  const config = sizeConfig?.[size];

  // Animate gust fluctuations
  useEffect(() => {
    if (!showAnimation) {
      setAnimatedGust(gustSpeed);
      return;
    }

    const interval = setInterval(() => {
      // Simulate gust fluctuations (±10% of gust speed)
      const fluctuation = (Math.random() - 0.5) * 0.2 * gustSpeed;
      const newGust = Math.max(windSpeed, gustSpeed + fluctuation);
      setAnimatedGust(newGust);
    }, 1500);

    return () => clearInterval(interval);
  }, [gustSpeed, windSpeed, showAnimation]);

  // Calculate gust factor
  const gustFactor = gustSpeed > 0 ? gustSpeed / windSpeed : 1;

  // Get gust intensity level
  const getGustIntensity = (factor: number) => {
    if (factor < 1.2)
      return { level: 'Minimal', color: 'bg-green-400', textColor: 'text-green-600' };
    if (factor < 1.5)
      return { level: 'Light', color: 'bg-yellow-400', textColor: 'text-yellow-600' };
    if (factor < 1.8)
      return { level: 'Moderate', color: 'bg-orange-400', textColor: 'text-orange-600' };
    if (factor < 2.2) return { level: 'Strong', color: 'bg-red-400', textColor: 'text-red-600' };
    return { level: 'Severe', color: 'bg-purple-500', textColor: 'text-purple-600' };
  };

  const gustIntensity = getGustIntensity(gustFactor);

  // Calculate scale based on current wind speed unit
  const getScaleForUnit = (unit: string) => {
    switch (unit) {
      case 'kmh':
        return { maxScale: 180, markers: [36, 72, 108, 144] }; // 50 m/s = 180 km/h
      case 'mph':
        return { maxScale: 112, markers: [22, 45, 67, 90] }; // 50 m/s = 112 mph
      case 'knots':
        return { maxScale: 97, markers: [19, 39, 58, 78] }; // 50 m/s = 97 knots
      default: // ms
        return { maxScale: 50, markers: [10, 20, 30, 40] };
    }
  };

  const scale = getScaleForUnit(currentUnit);
  const windBarWidth = Math.min((windSpeed / scale.maxScale) * 100, 100);
  const gustBarWidth = Math.min((animatedGust / scale.maxScale) * 100, 100);

  return (
    <div className={`wind-gust-indicator ${config.container} ${className}`}>
      <div className={config.spacing}>
        {/* Values Display */}
        {showValues && (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`font-bold text-gray-700 ${config.valueText}`}>
                  {formatWindSpeed(windSpeed, { showUnit: false, decimals: 1 })}
                </div>
                <div className={`${config.text} text-gray-500`}>
                  {t('weather:wind.sustained', 'Sustained')}
                </div>
              </div>
              <div className="text-center">
                <div className={`font-bold ${gustIntensity.textColor} ${config.valueText}`}>
                  {formatWindSpeed(animatedGust, { showUnit: false, decimals: 1 })}
                </div>
                <div className={`${config.text} text-gray-500`}>
                  {t('weather:wind.gusts', 'Gusts')}
                </div>
              </div>
            </div>
            {showGustFactor && (
              <div className="text-right">
                <div className={`font-semibold ${gustIntensity.textColor} ${config.valueText}`}>
                  {gustFactor.toFixed(1)}x
                </div>
                <div className={`${config.text} text-gray-500`}>
                  {t('weather:wind.gustFactor', 'Factor')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Visual Bars */}
        <div className="space-y-3">
          <div className="relative">
            {/* Background Scale */}
            <div
              className={`w-full ${config.bar} bg-gray-100 rounded-full relative overflow-hidden`}
            >
              {/* Scale markers */}
              <div className="absolute inset-0 flex">
                {scale.markers.map(marker => (
                  <div
                    key={marker}
                    className="border-l border-gray-300 h-full"
                    style={{ left: `${(marker / scale.maxScale) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Sustained Wind Bar */}
            <div
              className={`absolute top-0 ${config.bar} bg-blue-400 rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${windBarWidth}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" />
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
            </div>

            {/* Wind Gust Bar */}
            <div
              className={`absolute top-0 ${config.bar} ${gustIntensity.color} rounded-full transition-all duration-500 ease-out opacity-80`}
              style={{ width: `${gustBarWidth}%` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${gustIntensity.color} rounded-full`}
              />
              <div
                className={`absolute right-0 top-0 bottom-0 w-1 ${gustIntensity.color.replace('bg-', 'bg-').replace('-400', '-600').replace('-500', '-700')} rounded-r-full`}
              />

              {/* Gust pulse animation */}
              {showAnimation && (
                <div
                  className={`absolute inset-0 ${gustIntensity.color} rounded-full animate-pulse opacity-50`}
                />
              )}
            </div>
          </div>

          {/* Speed Labels */}
          <div className="flex items-center justify-between text-xs font-medium text-gray-400">
            <span>0</span>
            {scale.markers.map(marker => (
              <span key={marker}>{marker}</span>
            ))}
            <span>
              {scale.maxScale} {getUnitSymbol()}
            </span>
          </div>
        </div>

        {/* Gust Intensity Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100/70 bg-white/60 px-3 py-2 text-left shadow-sm dark:border-white/10 dark:bg-slate-900/40">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${gustIntensity.color}`} />
            <span className={`${config.text} font-medium ${gustIntensity.textColor}`}>
              {t(`weather:wind.gust${gustIntensity.level}`, gustIntensity.level)}{' '}
              {t('weather:wind.gusts', 'Gusts')}
            </span>
          </div>

          {/* Gust vs Wind Comparison */}
          <div className={`${config.text} text-gray-500`}>
            {gustSpeed > windSpeed * 1.5 ? (
              <span className="text-orange-600 font-medium">
                ⚠️ {t('weather:wind.gustyConditions', 'Gusty Conditions')}
              </span>
            ) : gustSpeed > windSpeed * 1.2 ? (
              <span className="text-yellow-600">
                {t('weather:wind.breezyConditions', 'Breezy Conditions')}
              </span>
            ) : (
              <span className="text-green-600">{t('weather:wind.steadyWind', 'Steady Wind')}</span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-blue-400 rounded-sm" />
            <span className={`${config.text} text-gray-600`}>
              {t('weather:wind.sustainedWind', 'Sustained Wind')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-2 ${gustIntensity.color} rounded-sm opacity-80`} />
            <span className={`${config.text} text-gray-600`}>
              {t('weather:wind.windGusts', 'Wind Gusts')}
            </span>
          </div>
        </div>

        {/* Gust Information */}
        <div className={`${config.text} text-gray-500 text-center italic`}>
          {gustFactor >= 2.0
            ? t('weather:wind.severeGustWarning', 'Severe gusts - exercise caution outdoors')
            : gustFactor >= 1.5
              ? t('weather:wind.moderateGustInfo', 'Noticeable gusts - secure loose objects')
              : gustFactor >= 1.2
                ? t('weather:wind.lightGustInfo', 'Light gusts - typical wind variation')
                : t('weather:wind.steadyWindInfo', 'Steady wind conditions')}
        </div>
      </div>
    </div>
  );
};

export default WindGustIndicator;
