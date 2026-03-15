/**
 * Push Notification Types
 * Type definitions for push notification payloads, options, and service worker messages
 */

/**
 * Weather alert severity levels
 */
export type WeatherAlertSeverity = 'info' | 'warning' | 'severe' | 'critical';

/**
 * Push notification action button
 */
export interface PushNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

/**
 * Push notification payload from server
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  renotify?: boolean;
  vibrate?: number[];
  actions?: PushNotificationAction[];
  data?: PushNotificationData;
}

/**
 * Custom data attached to push notifications
 */
export interface PushNotificationData {
  url?: string;
  timestamp?: number;
  type?: 'weather-alert' | 'weather-update' | 'forecast' | 'general';
  severity?: WeatherAlertSeverity;
  locationId?: string;
  locationName?: string;
  alertId?: string;
  expiresAt?: number;
  [key: string]: unknown;
}

/**
 * Service worker message types
 */
export type ServiceWorkerMessageType =
  | 'NOTIFICATION_ACTION'
  | 'NOTIFICATION_CLOSED'
  | 'PUSH_SUBSCRIPTION_CHANGED';

/**
 * Service worker message payload
 */
export interface ServiceWorkerMessage {
  type: ServiceWorkerMessageType;
  action?: string;
  tag?: string;
  data?: PushNotificationData;
  oldSubscription?: PushSubscription | null;
  newSubscription?: PushSubscription | null;
}

/**
 * Push notification permission status
 */
export type PushPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * Push notification subscription state
 */
export interface PushSubscriptionState {
  isSupported: boolean;
  permission: PushPermissionStatus;
  subscription: PushSubscription | null;
  isSubscribed: boolean;
}

/**
 * Push notification service configuration
 */
export interface PushNotificationConfig {
  /** VAPID public key for Web Push subscription (base64url encoded) */
  vapidPublicKey?: string;
  /** Alternative name for VAPID public key (applicationServerKey is the Web Push API term) */
  applicationServerKey?: string;
  /** VAPID subject (mailto: or https: URL identifying the application) */
  vapidSubject?: string;
  /** Path to the service worker file */
  swPath?: string;
  /** Scope for the service worker registration */
  swScope?: string;
  /** Whether to auto-configure VAPID from environment variables */
  autoConfigureVapid?: boolean;
}

/**
 * VAPID configuration status
 */
export interface VapidStatus {
  /** Whether VAPID is properly configured */
  isConfigured: boolean;
  /** The public key (if configured) */
  publicKey?: string;
  /** The subject URL (if configured) */
  subject?: string;
  /** Any validation errors */
  errors: string[];
}

/**
 * Push notification subscription options
 */
export interface SubscribeOptions {
  userVisibleOnly?: boolean;
  applicationServerKey?: BufferSource | string | null;
}

/**
 * Result of push notification operations
 */
export interface PushNotificationResult<T = void> {
  success: boolean;
  data?: T;
  error?: Error;
  errorCode?:
    | 'UNSUPPORTED'
    | 'PERMISSION_DENIED'
    | 'SUBSCRIPTION_FAILED'
    | 'REGISTRATION_FAILED'
    | 'UNKNOWN';
}

/**
 * Weather alert notification options
 */
export interface WeatherAlertNotificationOptions {
  alertType: string;
  severity: WeatherAlertSeverity;
  headline: string;
  description: string;
  locationName: string;
  expiresAt?: Date;
  url?: string;
}

/**
 * Local notification options for showing notifications from the app
 */
export interface LocalNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: PushNotificationData;
  actions?: PushNotificationAction[];
}

/**
 * Notification click callback
 */
export type NotificationClickCallback = (action: string | null, data: PushNotificationData) => void;

/**
 * Notification close callback
 */
export type NotificationCloseCallback = (tag: string, data: PushNotificationData) => void;

/**
 * Subscription change callback
 */
export type SubscriptionChangeCallback = (
  oldSubscription: PushSubscription | null,
  newSubscription: PushSubscription | null
) => void;

// =============================================================================
// PUSH NOTIFICATION PERMISSION FLOW TYPES
// =============================================================================

/**
 * Steps in the permission consent flow
 */
export type PermissionFlowStep =
  | 'initial' // User hasn't been prompted yet
  | 'prompt' // Showing the consent modal/banner
  | 'requesting' // Browser permission dialog is showing
  | 'granted' // Permission was granted
  | 'denied' // Permission was denied
  | 'blocked' // Permission was denied and browser blocks further requests
  | 'unsupported'; // Browser doesn't support notifications

/**
 * Consent decision made by the user
 */
export type ConsentDecision = 'accepted' | 'declined' | 'later' | 'never';

/**
 * Timestamp tracking for permission flow
 */
export interface PermissionTimestamps {
  /** When consent was first requested */
  firstPromptAt?: Date;
  /** When consent was last requested */
  lastPromptAt?: Date;
  /** When consent was granted */
  grantedAt?: Date;
  /** When consent was denied */
  deniedAt?: Date;
  /** When user chose "ask later" */
  postponedAt?: Date;
  /** When user chose "never ask again" */
  neverAskAt?: Date;
}

/**
 * State of the push notification permission flow
 */
export interface PushPermissionFlowState {
  /** Current step in the flow */
  step: PermissionFlowStep;
  /** Browser's actual permission status */
  browserPermission: PushPermissionStatus;
  /** User's consent decision */
  consentDecision: ConsentDecision | null;
  /** Whether the consent modal/banner is visible */
  isPromptVisible: boolean;
  /** Whether a permission request is in progress */
  isRequesting: boolean;
  /** Number of times user has been prompted */
  promptCount: number;
  /** Timestamps for various permission events */
  timestamps: PermissionTimestamps;
  /** Any error that occurred during the flow */
  error: string | null;
  /** Whether notifications are fully enabled (granted + subscribed) */
  isFullyEnabled: boolean;
}

/**
 * Actions available in the permission flow
 */
export interface PushPermissionFlowActions {
  /** Show the consent prompt (modal or banner) */
  showPrompt: () => void;
  /** Hide the consent prompt */
  hidePrompt: () => void;
  /** Request browser permission */
  requestPermission: () => Promise<boolean>;
  /** Handle user accepting consent */
  acceptConsent: () => Promise<boolean>;
  /** Handle user declining consent */
  declineConsent: () => void;
  /** Handle user choosing "ask later" */
  postponeConsent: () => void;
  /** Handle user choosing "never ask again" */
  neverAskAgain: () => void;
  /** Reset the flow state (for testing/development) */
  resetFlow: () => void;
  /** Clear any error */
  clearError: () => void;
}

/**
 * Configuration options for the permission flow
 */
export interface PushPermissionFlowConfig {
  /** Key for storing permission state in localStorage */
  storageKey?: string;
  /** Minimum days between prompts when user chooses "later" */
  postponeDays?: number;
  /** Maximum number of times to prompt user */
  maxPromptCount?: number;
  /** Whether to auto-show prompt on mount */
  autoPrompt?: boolean;
  /** Delay in ms before auto-prompting */
  autoPromptDelay?: number;
  /** Callback when permission is granted */
  onPermissionGranted?: () => void;
  /** Callback when permission is denied */
  onPermissionDenied?: () => void;
  /** Callback when user declines consent */
  onConsentDeclined?: () => void;
  /** Callback when consent flow step changes */
  onStepChange?: (step: PermissionFlowStep) => void;
}

/**
 * Persisted state for the permission flow (stored in localStorage)
 */
export interface PersistedPermissionState {
  consentDecision: ConsentDecision | null;
  promptCount: number;
  timestamps: PermissionTimestamps;
  version: number; // Schema version for migrations
}

/**
 * Props for the consent prompt component
 */
export interface ConsentPromptProps {
  /** Whether the prompt is visible */
  isOpen: boolean;
  /** Handler for when user accepts */
  onAccept: () => void;
  /** Handler for when user declines */
  onDecline: () => void;
  /** Handler for when user chooses "later" */
  onLater?: () => void;
  /** Handler for when user chooses "never" */
  onNever?: () => void;
  /** Handler for closing the prompt */
  onClose: () => void;
  /** Whether a request is in progress */
  isLoading?: boolean;
  /** Current permission status */
  permissionStatus?: PushPermissionStatus;
  /** Custom title for the prompt */
  title?: string;
  /** Custom description for the prompt */
  description?: string;
  /** Custom benefits to display */
  benefits?: string[];
}

/**
 * Props for the permission status display component
 */
export interface PermissionStatusDisplayProps {
  /** Current permission status */
  status: PushPermissionStatus;
  /** Whether notifications are fully enabled */
  isFullyEnabled: boolean;
  /** Handler for enabling notifications */
  onEnable?: () => void;
  /** Handler for opening settings (when blocked) */
  onOpenSettings?: () => void;
  /** Whether an operation is in progress */
  isLoading?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show detailed status */
  showDetails?: boolean;
}

/**
 * Banner prompt props for non-modal permission requests
 */
export interface PermissionBannerProps {
  /** Whether the banner is visible */
  isVisible: boolean;
  /** Handler for enabling notifications */
  onEnable: () => void;
  /** Handler for dismissing the banner */
  onDismiss: () => void;
  /** Handler for "don't show again" */
  onDontShowAgain?: () => void;
  /** Whether a request is in progress */
  isLoading?: boolean;
  /** Position of the banner */
  position?: 'top' | 'bottom';
  /** Custom message */
  message?: string;
}
