/**
 * PollenDetailModal Component
 * Expanded pollen and allergy details with health guidance and pollen breakdown.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

import PollenMeter from './PollenMeter';
import AccessibleModal from '@/components/ui/molecules/AccessibleModal';
import { useTheme } from '@/design-system/theme';
import { POLLEN_INFO, type PollenData } from '@/types/pollen';

export interface PollenDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Complete pollen data for the current location */
  pollenData: PollenData;
}

const PollenDetailModal: React.FC<PollenDetailModalProps> = ({ isOpen, onClose, pollenData }) => {
  const { t } = useTranslation(['weather']);
  const { theme } = useTheme();

  const {
    category,
    color,
    description,
    healthAdvice,
    pollens,
    dominantPollen,
    isPollenSeason,
    lastUpdated,
    availableInRegion,
  } = pollenData;

  const pollenEntries = Object.entries(pollens).filter(([, pollen]) => pollen !== undefined);

  const cardBackground = theme.isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.96)';
  const highlightBorder = theme.isDark ? 'rgba(34, 197, 94, 0.7)' : 'rgba(22, 163, 74, 0.85)';
  const subtleBorder = theme.isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(226, 232, 240, 0.9)';

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('weather:pollen.modalTitle', 'Pollen & Allergy Forecast')}
      size="lg"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      className="pollen-detail-modal"
    >
      <div className="space-y-6 p-2">
        {/* Not available message */}
        {!availableInRegion && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-2">
              {t('weather:pollen.notAvailableTitle', 'Pollen Data Not Available')}
            </h3>
            <p className="text-sm text-[var(--theme-text-secondary)]">
              {t(
                'weather:pollen.notAvailableDescription',
                'Pollen forecasts are currently only available for European locations. ' +
                  'This feature uses the CAMS European Air Quality forecast data.'
              )}
            </p>
          </div>
        )}

        {availableInRegion && (
          <>
            {/* Large Pollen meter */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <PollenMeter
                  pollenData={pollenData}
                  className="w-full"
                  size="lg"
                  showGauge={true}
                  showProgressBar={true}
                  showValue={true}
                  showCategory={true}
                />
              </div>
            </div>

            {/* Current pollen status */}
            <div
              className="rounded-lg border p-4"
              style={{
                backgroundColor: cardBackground,
                borderColor: highlightBorder,
              }}
            >
              <h3 className="mb-1 text-lg font-semibold text-[var(--theme-text)]">
                {t('weather:pollen.currentStatusLabel', 'Current Pollen Level')}:{' '}
                <span style={{ color }}>{category}</span>
              </h3>
              <p className="text-sm text-[var(--theme-text-secondary)]">{description}</p>

              <div className="mt-3 flex flex-wrap gap-3">
                {/* Season Status */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">{isPollenSeason ? '🌸' : '❄️'}</span>
                  <span className="text-sm text-[var(--theme-text-secondary)]">
                    {isPollenSeason
                      ? t('weather:pollen.activeSeasonLabel', 'Active Pollen Season')
                      : t('weather:pollen.offSeasonLabel', 'Off Season')}
                  </span>
                </div>

                {/* Dominant Pollen */}
                {dominantPollen && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm text-[var(--theme-text-secondary)]">
                      {t('weather:pollen.dominantLabel', 'Dominant')}: {dominantPollen}
                    </span>
                  </div>
                )}
              </div>

              {lastUpdated && (
                <p className="mt-2 text-xs text-[var(--theme-text-secondary)]">
                  {t('weather:labels.lastUpdated', 'Last updated')}: {lastUpdated}
                </p>
              )}
            </div>

            {/* Health guidance */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--theme-text)]">
                <span>💡</span>
                <span>{t('weather:pollen.healthAdviceHeading', 'Allergy Guidance')}</span>
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <HealthAdviceCard
                  icon="👥"
                  title={t('weather:pollen.generalPopulation', 'General')}
                  advice={healthAdvice.general}
                  theme={theme}
                  subtleBorder={subtleBorder}
                  bgType="blue"
                />
                <HealthAdviceCard
                  icon="🤧"
                  title={t('weather:pollen.allergySufferers', 'Allergy Sufferers')}
                  advice={healthAdvice.allergySufferers}
                  theme={theme}
                  subtleBorder={subtleBorder}
                  bgType="amber"
                />
                <HealthAdviceCard
                  icon="🏃"
                  title={t('weather:pollen.outdoorActivities', 'Outdoor Activities')}
                  advice={healthAdvice.outdoor}
                  theme={theme}
                  subtleBorder={subtleBorder}
                  bgType="green"
                />
              </div>
            </div>

            {/* Pollen breakdown */}
            {pollenEntries.length > 0 && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--theme-text)]">
                  <span>🌿</span>
                  <span>{t('weather:pollen.pollenBreakdownHeading', 'Pollen Types')}</span>
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {pollenEntries.map(([key, pollen]) => {
                    if (!pollen) return null;
                    const pollenInfo = POLLEN_INFO[pollen.type];
                    return (
                      <div
                        key={key}
                        className="rounded-lg border p-3 text-xs"
                        style={{
                          backgroundColor: cardBackground,
                          borderColor: subtleBorder,
                        }}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{pollen.icon}</span>
                            <div className="font-semibold text-[var(--theme-text)]">
                              {pollen.name}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-[var(--theme-text)]">
                            {Math.round(pollen.value)} grains/m³
                          </div>
                        </div>
                        <p className="mb-2 text-[var(--theme-text-secondary)]">
                          {t('weather:pollen.seasonLabel', 'Season')}: {pollenInfo?.season}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--theme-text-secondary)]">
                            {t('weather:pollen.levelLabel', 'Risk Level')}
                          </span>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${pollen.color}20`,
                              color: pollen.color,
                            }}
                          >
                            {pollen.level.replace('_', ' ').charAt(0).toUpperCase() +
                              pollen.level.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info note */}
            <div className="rounded-lg border border-dashed p-3">
              <p className="text-center text-xs text-[var(--theme-text-secondary)]">
                {t(
                  'weather:pollen.infoNote',
                  'Pollen data is provided by the CAMS European Air Quality forecast. ' +
                    'Levels are measured in grains per cubic meter (grains/m³). ' +
                    'Actual allergen exposure may vary based on local conditions.'
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </AccessibleModal>
  );
};

// Helper component for health advice cards
interface HealthAdviceCardProps {
  icon: string;
  title: string;
  advice: string;
  theme: { isDark: boolean };
  subtleBorder: string;
  bgType: 'blue' | 'amber' | 'green';
}

const HealthAdviceCard: React.FC<HealthAdviceCardProps> = ({
  icon,
  title,
  advice,
  theme,
  subtleBorder,
  bgType,
}) => {
  const bgColors = {
    blue: theme.isDark ? 'rgba(30, 64, 175, 0.35)' : 'rgba(219, 234, 254, 0.95)',
    amber: theme.isDark ? 'rgba(120, 53, 15, 0.4)' : 'rgba(255, 237, 213, 0.96)',
    green: theme.isDark ? 'rgba(5, 46, 22, 0.45)' : 'rgba(220, 252, 231, 0.96)',
  };

  return (
    <div
      className="rounded-lg border p-3 text-xs"
      style={{
        backgroundColor: bgColors[bgType],
        borderColor: subtleBorder,
      }}
    >
      <div className="mb-1 font-semibold text-[var(--theme-text)]">
        {icon} {title}
      </div>
      <p className="text-[var(--theme-text-secondary)]">{advice}</p>
    </div>
  );
};

export default PollenDetailModal;
