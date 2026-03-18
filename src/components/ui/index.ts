/**
 * UI Components Barrel Export
 * Centralized export of all UI components for easy importing
 *
 * Organized structure:
 * - atoms: Atomic design components (from atoms folder)
 * - base: Base UI components (Button, Card, Badge, Input)
 * - feedback: User feedback components (Alert, Loading, Skeleton, etc.)
 * - navigation: Navigation components (Modal, Drawer, Carousel)
 * - forms: Form components (Dropdowns, Autocomplete)
 * - layout: Layout components (Box, Container, Flex, Grid, Stack)
 * - weather: Weather-specific components
 * - notifications: Notification components
 * - preferences: User preference components
 * - accessibility: Accessibility components
 * - favorites: Favorites components
 * - utils: Utility components
 */

// ============================================================================
// ATOMS - Atomic Design Components
// ============================================================================
export {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Icon,
  Input,
  Label,
  NativeSelect,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from './atoms';

export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardPadding,
  CardProps,
  CardShadow,
  CardSize,
  CardVariant,
  CheckboxGroupOption,
  CheckboxGroupProps,
  CheckboxGroupSize,
  CheckboxProps,
  CheckboxSize,
  IconColor,
  IconName,
  IconProps,
  IconSize,
  InputProps,
  InputSize,
  InputType,
  InputVariant,
  LabelProps,
  LabelSize,
  LabelVariant,
  NativeSelectOption,
  NativeSelectProps,
  NativeSelectSize,
  NativeSelectVariant,
  RadioGroupOption,
  RadioGroupProps,
  RadioGroupSize,
  RadioProps,
  RadioSize,
  SelectOption,
  SelectProps,
  SelectSize,
  SelectVariant,
  SwitchProps,
  SwitchSize,
  SwitchVariant,
  TextareaProps,
  TextareaResize,
  TextareaSize,
  TextareaVariant,
} from './atoms';

// ============================================================================
// BASE COMPONENTS
// ============================================================================
export { Badge, Button as BaseButton, Card as BaseCard, Input as BaseInput } from './base';
export type {
  BadgeProps,
  BadgeSize,
  BadgeVariant,
  ButtonProps as BaseButtonProps,
  CardProps as BaseCardProps,
  InputProps as BaseInputProps,
} from './base';

// ============================================================================
// FEEDBACK COMPONENTS
// ============================================================================
export {
  Alert,
  CurrentWeatherDetailsSkeleton,
  ForecastSkeleton,
  HistoricalWeatherComparisonSkeleton,
  HourlyForecastTimelineSkeleton,
  Loading,
  LoadingWithSkeleton,
  Skeleton,
  SkeletonCard,
  SkeletonCircle,
  SkeletonList,
  SkeletonRectangle,
  SkeletonRounded,
  SkeletonTable,
  SkeletonText,
  Snackbar,
  SnackbarContainer,
  Tooltip,
  WeatherCardSkeleton,
  WeatherContentSkeleton,
} from './feedback';

export type {
  AlertProps,
  AlertVariant,
  CurrentWeatherDetailsSkeletonProps,
  ForecastSkeletonProps,
  HistoricalWeatherComparisonSkeletonProps,
  HourlyForecastTimelineSkeletonProps,
  LoadingColor,
  LoadingProps,
  LoadingSize,
  LoadingWithSkeletonProps,
  SkeletonCardProps,
  SkeletonListProps,
  SkeletonProps,
  SkeletonTableProps,
  SnackbarProps,
  TooltipPosition,
  TooltipProps,
  WeatherCardSkeletonProps,
  WeatherContentSkeletonProps,
} from './feedback';

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================
export {
  Carousel,
  EmblaCarousel,
  EmblaCarouselPlugins,
  Modal,
  SideDrawer,
  SideDrawerExamples,
  WeatherEmblaCarousel,
} from './navigation';
export type {
  DrawerPosition,
  DrawerSize,
  DrawerVariant,
  ModalProps,
  ModalSize,
  SideDrawerProps,
} from './navigation';

// ============================================================================
// FORM COMPONENTS
// ============================================================================
export { AccessibleDropdown, AutocompleteDropdown, CustomScrollbar } from './forms';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================
export { Box, Container, Flex, Grid, Stack } from './layout';

// ============================================================================
// WEATHER COMPONENTS
// ============================================================================

// Weather Metrics - Temperature
export {
  TemperatureDetailCard,
  TemperatureDetailModal,
  TemperatureGauge,
  TemperatureToggle,
} from './weather/metrics/temperature';

// Weather Metrics - Humidity
export { HumidityDetailCard, HumidityDetailModal, HumidityMeter } from './weather/metrics/humidity';

// Weather Metrics - Pressure
export { PressureDetailCard, PressureDetailModal, PressureGauge } from './weather/metrics/pressure';

// Weather Metrics - Wind
export {
  DualWindCompass,
  WindCompass,
  WindDetailCard,
  WindDetailModal,
  WindGustIndicator,
} from './weather/metrics/wind';

// Weather Metrics - Visibility
export {
  VisibilityDetailCard,
  VisibilityDetailModal,
  VisibilityMeter,
} from './weather/metrics/visibility';

// Weather Metrics - UV Index
export { UVIndexDetailCard, UVIndexDetailModal, UVIndexMeter } from './weather/metrics/uv-index';

// Weather Metrics - Air Quality
export { AQIDetailCard, AQIMeter, AirQualityDetailModal } from './weather/metrics/air-quality';
export type { AQIDetailCardProps, AQIMeterProps } from './weather/metrics/air-quality';

// Weather Metrics - Pollen
export { PollenDetailCard, PollenDetailModal, PollenMeter } from './weather/metrics/pollen';

// Weather Metrics - Sun & Moon
export { SunMoonDetailCard, SunMoonDetailModal } from './weather/metrics/sun-moon';
export type { SunMoonDetailCardProps, SunMoonDetailModalProps } from './weather/metrics/sun-moon';

// Weather Metrics - Coordinates
export {
  CoordinatesDetailCard,
  CoordinatesDisplay,
  CoordinatesMapModal,
} from './weather/metrics/coordinates';

// Weather Forecast
export {
  EnhancedForecastGrid,
  ForecastCard,
  ForecastCarousel,
  ForecastMetricMeter,
  HourlyForecastTimeline,
  HourlyTimelineItem,
} from './weather/forecast';
export type { HourlyForecastTimelineProps, HourlyTimelineItemProps } from './weather/forecast';

// Weather Display
export {
  AnimatedCard,
  CVDStatusBadge,
  WeatherDetailCard,
  WeatherDetailsGrid,
} from './weather/display';

// Weather Charts
export { PrecipitationTrendChart, PressureTrendChart } from './weather/charts';
export type { PrecipitationDataPoint, PrecipitationTrendChartProps } from './weather/charts';

// Weather Comparison
export { HistoricalWeatherComparison, PressureHistoryComparison } from './weather/comparison';
export type { HistoricalWeatherComparisonProps } from './weather/comparison';

// Weather Sharing
export { ShareButton, ShareWeatherModal, ShareableWeatherCard } from './weather/sharing';
export type {
  ShareButtonProps,
  ShareButtonSize,
  ShareButtonVariant,
  ShareWeatherModalProps,
  ShareableWeatherCardProps,
} from './weather/sharing';

// ============================================================================
// NOTIFICATION COMPONENTS
// ============================================================================
export {
  NotificationBell,
  NotificationHistoryFilters,
  NotificationHistoryItem,
  NotificationHistoryPanel,
  NotificationPermissionStatus,
  PushNotificationBanner,
  PushNotificationConsentModal,
} from './notifications';

export type {
  NotificationBellProps,
  NotificationHistoryFiltersProps,
  NotificationHistoryItemProps,
  NotificationHistoryPanelProps,
} from './notifications';

// ============================================================================
// PREFERENCE COMPONENTS
// ============================================================================
export {
  FontSizeSelector,
  KeyboardShortcutsEditor,
  ThemeToggle,
  ThemeToggleTestComponent,
  UpdateFrequencySelector,
  VisibilityUnitSelector,
  WindSpeedUnitSelector,
} from './preferences';

// ============================================================================
// ACCESSIBILITY COMPONENTS
// ============================================================================
export { MotionSafe, PreferenceAwareComponents, WeatherLiveRegion } from './accessibility';
export type { WeatherLiveRegionProps } from './accessibility';

// ============================================================================
// FAVORITES COMPONENTS
// ============================================================================
export { FavoriteLocationsDrawer, FavoriteLocationsDrawerTrigger } from './favorites';

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================
export {
  DashboardSuspense,
  InlineSuspense,
  RouteSuspense,
  ShowcaseSuspense,
  SkeletonSuspense,
  SuspenseWrapper,
  TestSuspense,
  useSuspenseWithErrorBoundary,
  withSuspense,
} from './utils';

// ============================================================================
// COMMON TYPES
// ============================================================================
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
