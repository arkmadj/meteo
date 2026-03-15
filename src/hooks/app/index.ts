/**
 * App-specific hooks barrel export
 * Centralized export of all app-related custom hooks
 */

export { useWeatherActions, type WeatherActionsHook } from './useWeatherActions';
export {
  useWeatherAnnouncement,
  type UseWeatherAnnouncementReturn,
  type WeatherAnnouncement,
  type WeatherAnnouncementConfig,
} from './useWeatherAnnouncement';
export { useWeatherEffects, type WeatherEffectsHook } from './useWeatherEffects';
export { useWeatherFormatting, type WeatherFormattingHook } from './useWeatherFormatting';
export { useWeatherState, type WeatherStateHook } from './useWeatherState';
