import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import MainHeader from '@/components/headers/MainHeader';
import SettingsNav, { type SettingsNavItem } from '@/components/navigation/SettingsNav';
import {
  AccentColorPicker,
  Button,
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  Switch,
  type DropdownItem,
} from '@/components/ui/atoms';
import { Container } from '@/components/ui/layout';
import NotificationPermissionStatus from '@/components/ui/notifications/NotificationPermissionStatus';
import PushNotificationConsentModal from '@/components/ui/notifications/PushNotificationConsentModal';
import FontSizeSelector from '@/components/ui/preferences/FontSizeSelector';
import KeyboardShortcutsEditor from '@/components/ui/preferences/KeyboardShortcutsEditor';
import UpdateFrequencySelector from '@/components/ui/preferences/UpdateFrequencySelector';
import VisibilityUnitSelector from '@/components/ui/preferences/VisibilityUnitSelector';
import WindSpeedUnitSelector from '@/components/ui/preferences/WindSpeedUnitSelector';
import { useMotionPreferences } from '@/contexts/MotionPreferencesContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useUserPreferencesContext } from '@/contexts/UserPreferencesContext';
import type { ThemeMode } from '@/design-system/theme';
import { useTheme } from '@/design-system/theme';
import { usePushNotificationPermission } from '@/hooks/usePushNotificationPermission';
import { useVisibilityUnit } from '@/hooks/useVisibilityUnit';
import { useWindSpeedUnit } from '@/hooks/useWindSpeedUnit';
import type { SupportedLanguage } from '@/i18n/config/types';
import { useLanguage } from '@/i18n/hooks/useLanguage';

/**
 * Settings page component - app configuration and preferences
 * Fully integrated with ThemeProvider for responsive theme switching
 */
const SettingsPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { theme, setThemeMode, isHighContrast, setHighContrast, accentColor, setAccentColor } =
    useTheme();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const { preferences: motionPreferences, setManualReducedMotion } = useMotionPreferences();
  const {
    preferences: userPreferences,
    updateWindSpeedUnit,
    updateVisibilityUnit,
    updateFontSize,
  } = useUserPreferencesContext();
  const { currentUnit: _windSpeedUnit } = useWindSpeedUnit();
  const { currentUnit: _visibilityUnit } = useVisibilityUnit();
  const { showSuccess, showError } = useSnackbar();

  const [settings, setSettings] = React.useState({
    theme: theme.mode,
    accentColor: accentColor,
    language: currentLanguage,
    units: 'metric',
    windSpeedUnit: userPreferences.windSpeedUnit,
    visibilityUnit: userPreferences.visibilityUnit,
    fontSize: userPreferences.fontSize,
    dateFormat: 'default',
    timeFormat: '12h',
    firstDayOfWeek: 'sunday',
    notifications: true,
    autoLocation: true,
    reducedMotion: motionPreferences.effectiveReducedMotion,
    highContrast: isHighContrast,
    lazyLoading: true,
    performanceMode: false,
  });

  const [isSaving, setIsSaving] = React.useState(false);

  // Push notification permission flow
  const {
    state: notificationState,
    actions: notificationActions,
    shouldShowPrompt,
  } = usePushNotificationPermission({
    onPermissionGranted: () => {
      showSuccess(t('notifications.permissionGranted', 'Notifications enabled successfully!'));
      updateSetting('notifications', true);
    },
    onPermissionDenied: () => {
      showError(t('notifications.permissionDenied', 'Notification permission was denied'));
      updateSetting('notifications', false);
    },
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate saving delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      // Settings are already applied via updateSetting, this confirms the save
      console.info('Settings saved successfully');
      showSuccess(t('settings.saveSuccess', 'Settings saved successfully!'));
    } finally {
      setIsSaving(false);
    }
  };

  // Sync local theme setting with global theme context
  useEffect(() => {
    setSettings(prev => ({ ...prev, theme: theme.mode }));
  }, [theme.mode]);

  // Sync local language setting with global language context
  useEffect(() => {
    setSettings(prev => ({ ...prev, language: currentLanguage }));
  }, [currentLanguage]);

  // Sync local high contrast setting with global theme context
  useEffect(() => {
    setSettings(prev => ({ ...prev, highContrast: isHighContrast }));
  }, [isHighContrast]);

  // Sync local accent color setting with global theme context
  useEffect(() => {
    setSettings(prev => ({ ...prev, accentColor }));
  }, [accentColor]);

  // Sync local reduced motion setting with global motion preferences context
  useEffect(() => {
    setSettings(prev => ({ ...prev, reducedMotion: motionPreferences.effectiveReducedMotion }));
  }, [motionPreferences.effectiveReducedMotion]);

  // Sync local wind speed unit setting with global user preferences context
  useEffect(() => {
    setSettings(prev => ({ ...prev, windSpeedUnit: userPreferences.windSpeedUnit }));
  }, [userPreferences.windSpeedUnit]);

  // Sync local visibility unit setting with global user preferences context
  useEffect(() => {
    setSettings(prev => ({ ...prev, visibilityUnit: userPreferences.visibilityUnit }));
  }, [userPreferences.visibilityUnit]);

  // Sync local font size setting with global user preferences context
  useEffect(() => {
    setSettings(prev => ({ ...prev, fontSize: userPreferences.fontSize }));
  }, [userPreferences.fontSize]);

  const updateSetting = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // If theme is being changed, update the global theme context
    if (key === 'theme') {
      setThemeMode(value as ThemeMode);
    }

    // If language is being changed, update the global language context
    if (key === 'language') {
      changeLanguage(value as SupportedLanguage);
    }

    // If high contrast is being changed, update the global theme context
    if (key === 'highContrast') {
      setHighContrast(value as boolean);
    }

    // If reduced motion is being changed, update the global motion preferences context
    if (key === 'reducedMotion') {
      setManualReducedMotion(value as boolean);
    }

    // If wind speed unit is being changed, update the global user preferences context
    if (key === 'windSpeedUnit') {
      updateWindSpeedUnit(value as 'ms' | 'kmh' | 'mph' | 'knots');
    }

    // If font size is being changed, update the global user preferences context
    if (key === 'fontSize') {
      updateFontSize(value as 'xs' | 'sm' | 'md' | 'lg' | 'xl');
    }
  };

  // ============================================================================
  // DROPDOWN OPTIONS
  // ============================================================================

  // Helper function to get display label for current value
  const getThemeLabel = (value: string) => {
    return t(`settings.options.theme.${value}`, value);
  };

  const getLanguageLabel = (value: string) => {
    return t(`settings.options.language.${value}`, value);
  };

  const getUnitsLabel = (value: string) => {
    return t(`settings.options.units.${value}`, value);
  };

  const getDateFormatLabel = (value: string) => {
    return t(`settings.options.dateFormat.${value}`, value);
  };

  const getTimeFormatLabel = (value: string) => {
    return t(`settings.options.timeFormat.${value}`, value);
  };

  const getFirstDayOfWeekLabel = (value: string) => {
    return t(`settings.options.firstDayOfWeek.${value}`, value);
  };

  const themeItems: DropdownItem[] = [
    {
      id: 'auto',
      label: t('settings.options.theme.auto'),
      icon: '🔄',
      onClick: () => updateSetting('theme', 'auto'),
    },
    {
      id: 'light',
      label: t('settings.options.theme.light'),
      icon: '☀️',
      onClick: () => updateSetting('theme', 'light'),
    },
    {
      id: 'dark',
      label: t('settings.options.theme.dark'),
      icon: '🌙',
      onClick: () => updateSetting('theme', 'dark'),
    },
  ];

  const languageItems: DropdownItem[] = [
    {
      id: 'en',
      label: t('settings.options.language.en'),
      icon: '🇺🇸',
      onClick: () => updateSetting('language', 'en'),
    },
    {
      id: 'es',
      label: t('settings.options.language.es'),
      icon: '🇪🇸',
      onClick: () => updateSetting('language', 'es'),
    },
    {
      id: 'fr',
      label: t('settings.options.language.fr'),
      icon: '🇫🇷',
      onClick: () => updateSetting('language', 'fr'),
    },
    {
      id: 'de',
      label: t('settings.options.language.de'),
      icon: '🇩🇪',
      onClick: () => updateSetting('language', 'de'),
    },
  ];

  const unitsItems: DropdownItem[] = [
    {
      id: 'metric',
      label: t('settings.options.units.metric'),
      icon: '🌡️',
      onClick: () => updateSetting('units', 'metric'),
    },
    {
      id: 'imperial',
      label: t('settings.options.units.imperial'),
      icon: '🌡️',
      onClick: () => updateSetting('units', 'imperial'),
    },
    {
      id: 'kelvin',
      label: t('settings.options.units.kelvin'),
      icon: '🌡️',
      onClick: () => updateSetting('units', 'kelvin'),
    },
  ];

  const dateFormatItems: DropdownItem[] = [
    {
      id: 'default',
      label: t('settings.options.dateFormat.default'),
      icon: '📅',
      onClick: () => updateSetting('dateFormat', 'default'),
    },
    {
      id: 'us',
      label: t('settings.options.dateFormat.us'),
      icon: '🇺🇸',
      onClick: () => updateSetting('dateFormat', 'us'),
    },
    {
      id: 'eu',
      label: t('settings.options.dateFormat.eu'),
      icon: '🇪🇺',
      onClick: () => updateSetting('dateFormat', 'eu'),
    },
    {
      id: 'iso',
      label: t('settings.options.dateFormat.iso'),
      icon: '🌐',
      onClick: () => updateSetting('dateFormat', 'iso'),
    },
  ];

  const timeFormatItems: DropdownItem[] = [
    {
      id: '12h',
      label: t('settings.options.timeFormat.12h'),
      icon: '🕐',
      onClick: () => updateSetting('timeFormat', '12h'),
    },
    {
      id: '24h',
      label: t('settings.options.timeFormat.24h'),
      icon: '🕐',
      onClick: () => updateSetting('timeFormat', '24h'),
    },
  ];

  const firstDayOfWeekItems: DropdownItem[] = [
    {
      id: 'sunday',
      label: t('settings.options.firstDayOfWeek.sunday'),
      icon: '📆',
      onClick: () => updateSetting('firstDayOfWeek', 'sunday'),
    },
    {
      id: 'monday',
      label: t('settings.options.firstDayOfWeek.monday'),
      icon: '📆',
      onClick: () => updateSetting('firstDayOfWeek', 'monday'),
    },
    {
      id: 'saturday',
      label: t('settings.options.firstDayOfWeek.saturday'),
      icon: '📆',
      onClick: () => updateSetting('firstDayOfWeek', 'saturday'),
    },
  ];

  // Navigation items for the side navigation
  const navigationItems: SettingsNavItem[] = [
    {
      id: 'localization',
      label: t('settings.sections.localization.title'),
      icon: '🌍',
    },
    {
      id: 'appearance',
      label: t('settings.sections.appearance.title'),
      icon: '🎨',
    },
    {
      id: 'weather',
      label: t('settings.sections.weather.title'),
      icon: '🌤️',
    },
    {
      id: 'accessibility',
      label: t('settings.sections.accessibility.title'),
      icon: '♿',
    },
    {
      id: 'keyboard-shortcuts',
      label: t('settings.sections.keyboardShortcuts.title', 'Keyboard Shortcuts'),
      icon: '⌨️',
    },
    {
      id: 'performance',
      label: t('settings.sections.performance.title'),
      icon: '⚡',
    },
  ];

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ backgroundColor: 'var(--theme-background)' }}
    >
      {/* Header */}
      <MainHeader
        sticky={true}
        variant="compact"
        currentLanguage={currentLanguage}
        supportedLanguages={supportedLanguages}
        changeLanguage={changeLanguage}
      />

      {/* Main Content */}
      <main className="py-6">
        <Container size="lg">
          {/* Page Title and Description */}
          <div className="mb-6 px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--theme-text)] mb-2">
              {t('settings.title')}
            </h1>
            <p className="text-sm md:text-base text-[var(--theme-text-secondary)]">
              {t('settings.subtitle')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Side Navigation - Hidden on mobile, visible on desktop */}
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              <SettingsNav items={navigationItems} />
            </aside>

            {/* Main Settings Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-6">
                {/* Localization & Language Settings */}
                <Card id="localization">
                  <CardHeader>
                    <h2
                      className="text-lg font-semibold transition-colors duration-200"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      🌍 {t('settings.sections.localization.title')}
                    </h2>
                    <p
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      {t('settings.sections.localization.description')}
                    </p>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {/* Language Dropdown */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium transition-colors duration-200"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('settings.options.language.label')}
                      </label>
                      <p
                        className="text-xs transition-colors duration-200"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {t('settings.options.language.description')}
                      </p>
                      <Dropdown
                        items={languageItems}
                        trigger={getLanguageLabel(settings.language)}
                        variant="default"
                        size="md"
                        placement="bottom-start"
                      />
                    </div>

                    {/* Temperature Units Dropdown */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium transition-colors duration-200"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('settings.options.units.label')}
                      </label>
                      <p
                        className="text-xs transition-colors duration-200"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {t('settings.options.units.description')}
                      </p>
                      <Dropdown
                        items={unitsItems}
                        trigger={getUnitsLabel(settings.units)}
                        variant="default"
                        size="md"
                        placement="bottom-start"
                      />
                    </div>

                    {/* Wind Speed Unit Selector */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium transition-colors duration-200"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('settings.options.windSpeedUnits.label')}
                      </label>
                      <p
                        className="text-xs transition-colors duration-200"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {t('settings.options.windSpeedUnits.description')}
                      </p>
                      <div className="mt-2">
                        <WindSpeedUnitSelector
                          windSpeedUnit={settings.windSpeedUnit}
                          onUnitChange={unit => updateSetting('windSpeedUnit', unit)}
                          variant="default"
                          showLabels={true}
                          showDescriptions={false}
                        />
                      </div>
                    </div>

                    {/* Visibility Unit Selector */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium transition-colors duration-200"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('settings.options.visibilityUnits.label')}
                      </label>
                      <p
                        className="text-xs transition-colors duration-200"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {t('settings.options.visibilityUnits.description')}
                      </p>
                      <div className="mt-2">
                        <VisibilityUnitSelector
                          visibilityUnit={settings.visibilityUnit}
                          onUnitChange={unit => updateVisibilityUnit(unit)}
                          variant="default"
                          showLabels={true}
                          showDescriptions={false}
                        />
                      </div>
                    </div>

                    {/* Update Frequency Selector */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium transition-colors duration-200"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('settings.options.updateFrequency.label')}
                      </label>
                      <p
                        className="text-xs transition-colors duration-200"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {t('settings.options.updateFrequency.description')}
                      </p>
                      <div className="mt-2">
                        <UpdateFrequencySelector showDescription={true} disabled={false} />
                      </div>
                    </div>

                    {/* Date Format Dropdown */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium transition-colors duration-200"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('settings.options.dateFormat.label')}
                      </label>
                      <p
                        className="text-xs transition-colors duration-200"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {t('settings.options.dateFormat.description')}
                      </p>
                      <Dropdown
                        items={dateFormatItems}
                        trigger={getDateFormatLabel(settings.dateFormat)}
                        variant="default"
                        size="md"
                        placement="bottom-start"
                      />
                    </div>

                    {/* Time Format Dropdown */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium transition-colors duration-200"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('settings.options.timeFormat.label')}
                      </label>
                      <p
                        className="text-xs transition-colors duration-200"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {t('settings.options.timeFormat.description')}
                      </p>
                      <Dropdown
                        items={timeFormatItems}
                        trigger={getTimeFormatLabel(settings.timeFormat)}
                        variant="default"
                        size="md"
                        placement="bottom-start"
                      />
                    </div>

                    {/* First Day of Week Dropdown */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium transition-colors duration-200"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('settings.options.firstDayOfWeek.label')}
                      </label>
                      <p
                        className="text-xs transition-colors duration-200"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {t('settings.options.firstDayOfWeek.description')}
                      </p>
                      <Dropdown
                        items={firstDayOfWeekItems}
                        trigger={getFirstDayOfWeekLabel(settings.firstDayOfWeek)}
                        variant="default"
                        size="md"
                        placement="bottom-start"
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Appearance Settings */}
                <Card id="appearance">
                  <CardHeader>
                    <h2
                      className="text-lg font-semibold transition-colors duration-200"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      🎨 {t('settings.sections.appearance.title')}
                    </h2>
                    <p
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      {t('settings.sections.appearance.description')}
                    </p>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {/* Theme Dropdown */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium transition-colors duration-200"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('settings.options.theme.label')}
                      </label>
                      <Dropdown
                        items={themeItems}
                        trigger={getThemeLabel(settings.theme)}
                        variant="default"
                        size="md"
                        placement="bottom-start"
                      />
                    </div>

                    {/* Accent Color Picker */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium transition-colors duration-200"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('settings.options.accentColor.label')}
                      </label>
                      <p
                        className="text-xs transition-colors duration-200"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {t('settings.options.accentColor.description')}
                      </p>
                      <div className="mt-2">
                        <AccentColorPicker
                          value={settings.accentColor}
                          onColorChange={color => {
                            updateSetting('accentColor', color);
                            setAccentColor(color);
                          }}
                          size="md"
                          label=""
                          helperText=""
                          showPresets={true}
                          showInput={true}
                        />
                      </div>
                    </div>

                    {/* High Contrast Switch */}
                    <Switch
                      label={t('settings.options.highContrast.label')}
                      description={t('settings.options.highContrast.description')}
                      checked={settings.highContrast}
                      onCheckedChange={checked => updateSetting('highContrast', checked)}
                      size="md"
                      variant="default"
                    />
                  </CardBody>
                </Card>

                {/* Weather Settings */}
                <Card id="weather">
                  <CardHeader>
                    <h2
                      className="text-lg font-semibold transition-colors duration-200"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      🌤️ {t('settings.sections.weather.title')}
                    </h2>
                    <p
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      {t('settings.sections.weather.description')}
                    </p>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {/* Auto Location Switch */}
                    <Switch
                      label={t('settings.options.autoLocation.label')}
                      description={t('settings.options.autoLocation.description')}
                      checked={settings.autoLocation}
                      onCheckedChange={checked => updateSetting('autoLocation', checked)}
                      size="md"
                      variant="default"
                    />

                    {/* Notifications Permission Status */}
                    <div className="space-y-3">
                      <div>
                        <h3
                          className="text-sm font-medium mb-1"
                          style={{ color: 'var(--theme-text)' }}
                        >
                          {t('settings.options.notifications.label', 'Push Notifications')}
                        </h3>
                        <p
                          className="text-xs mb-3"
                          style={{ color: 'var(--theme-text-secondary)' }}
                        >
                          {t(
                            'settings.options.notifications.description',
                            'Receive weather alerts and updates'
                          )}
                        </p>
                      </div>
                      <NotificationPermissionStatus
                        status={notificationState.browserPermission}
                        isFullyEnabled={notificationState.isFullyEnabled}
                        onEnable={notificationActions.showPrompt}
                        isLoading={notificationState.isRequesting}
                        size="md"
                        showDetails={true}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Accessibility Settings */}
                <Card id="accessibility">
                  <CardHeader>
                    <h2
                      className="text-lg font-semibold transition-colors duration-200"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      ♿ {t('settings.sections.accessibility.title')}
                    </h2>
                    <p
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      {t('settings.sections.accessibility.description')}
                    </p>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {/* Reduced Motion Switch */}
                    <Switch
                      label={t('settings.options.reducedMotion.label')}
                      description={t('settings.options.reducedMotion.description')}
                      checked={settings.reducedMotion}
                      onCheckedChange={checked => updateSetting('reducedMotion', checked)}
                      size="md"
                      variant="default"
                    />

                    {/* Font Size Adjustment */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2 transition-colors duration-200"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        {t('settings.options.fontSize.label')}
                      </label>
                      <p
                        className="text-xs mb-3 transition-colors duration-200"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {t('settings.options.fontSize.description')}
                      </p>
                      <FontSizeSelector
                        fontSize={settings.fontSize}
                        onFontSizeChange={size => updateSetting('fontSize', size)}
                        variant="default"
                        showLabels={true}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Keyboard Shortcuts Settings */}
                <Card id="keyboard-shortcuts">
                  <CardHeader>
                    <h2
                      className="text-lg font-semibold transition-colors duration-200"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      ⌨️ {t('settings.sections.keyboardShortcuts.title', 'Keyboard Shortcuts')}
                    </h2>
                    <p
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      {t(
                        'settings.sections.keyboardShortcuts.description',
                        'Customize keyboard shortcuts for quick actions'
                      )}
                    </p>
                  </CardHeader>
                  <CardBody>
                    <KeyboardShortcutsEditor />
                  </CardBody>
                </Card>

                {/* Performance Settings */}
                <Card id="performance">
                  <CardHeader>
                    <h2
                      className="text-lg font-semibold transition-colors duration-200"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      ⚡ {t('settings.sections.performance.title')}
                    </h2>
                    <p
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      {t('settings.sections.performance.description')}
                    </p>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {/* Lazy Loading Switch */}
                    <Switch
                      label={t('settings.options.lazyLoading.label')}
                      description={t('settings.options.lazyLoading.description')}
                      checked={settings.lazyLoading}
                      onCheckedChange={checked => updateSetting('lazyLoading', checked)}
                      size="md"
                      variant="default"
                    />

                    {/* Performance Mode Switch */}
                    <Switch
                      label={t('settings.options.performanceMode.label')}
                      description={t('settings.options.performanceMode.description')}
                      checked={settings.performanceMode}
                      onCheckedChange={checked => updateSetting('performanceMode', checked)}
                      size="md"
                      variant="default"
                    />
                  </CardBody>
                </Card>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  loading={isSaving}
                  onClick={() => {
                    void handleSaveSettings();
                  }}
                >
                  {t('settings.save')}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </main>

      {/* Push Notification Consent Modal */}
      <PushNotificationConsentModal
        isOpen={shouldShowPrompt}
        onAccept={() => {
          void notificationActions.acceptConsent();
        }}
        onDecline={() => {
          void notificationActions.declineConsent();
        }}
        onLater={() => {
          void notificationActions.postponeConsent();
        }}
        onNever={() => {
          void notificationActions.neverAskAgain();
        }}
        onClose={notificationActions.hidePrompt}
        isLoading={notificationState.isRequesting}
        permissionStatus={notificationState.browserPermission}
      />
    </div>
  );
};

export default SettingsPage;
