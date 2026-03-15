/**
 * usePushNotificationPermission Hook
 *
 * A comprehensive hook for managing the push notification permission flow.
 * Handles requesting, tracking, and persisting user consent for push notifications.
 *
 * Features:
 * - Tracks permission state across browser sessions
 * - Supports "ask later" and "never ask again" options
 * - Rate-limits permission prompts
 * - Integrates with existing push notification service
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   showPrompt,
 *   acceptConsent,
 *   declineConsent,
 *   postponeConsent,
 * } = usePushNotificationPermission({
 *   onPermissionGranted: () => console.log('Enabled!'),
 * });
 * ```
 */

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { pushNotificationService } from '@/services/pushNotificationService';
import type {
  PermissionFlowStep,
  PersistedPermissionState,
  PushPermissionFlowActions,
  PushPermissionFlowConfig,
  PushPermissionFlowState,
  PushPermissionStatus,
} from '@/types/pushNotification';

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY_DEFAULT = 'push_notification_permission_state';
const STORAGE_VERSION = 1;
const POSTPONE_DAYS_DEFAULT = 3;
const MAX_PROMPT_COUNT_DEFAULT = 5;
const AUTO_PROMPT_DELAY_DEFAULT = 3000;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Load persisted state from localStorage
 */
const loadPersistedState = (storageKey: string): PersistedPermissionState | null => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as PersistedPermissionState;

    // Handle version migrations if needed
    if (parsed.version !== STORAGE_VERSION) {
      return null; // Reset on version mismatch
    }

    // Convert ISO strings back to Dates
    if (parsed.timestamps) {
      const timestamps = parsed.timestamps as Record<string, string | Date | undefined>;
      Object.keys(timestamps).forEach(key => {
        const value = timestamps[key];
        if (typeof value === 'string') {
          timestamps[key] = new Date(value);
        }
      });
    }

    return parsed;
  } catch {
    return null;
  }
};

/**
 * Save state to localStorage
 */
const savePersistedState = (storageKey: string, state: PersistedPermissionState): void => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (e) {
    console.warn('[usePushNotificationPermission] Failed to persist state:', e);
  }
};

/**
 * Determine if we should auto-prompt based on persisted state
 */
const shouldAutoPrompt = (
  persisted: PersistedPermissionState | null,
  browserPermission: PushPermissionStatus,
  config: PushPermissionFlowConfig
): boolean => {
  // Don't prompt if permission already granted or denied
  if (browserPermission === 'granted' || browserPermission === 'denied') {
    return false;
  }

  // Don't prompt if browser doesn't support
  if (browserPermission === 'unsupported') {
    return false;
  }

  // No persisted state - first time user
  if (!persisted) {
    return true;
  }

  // User chose "never ask again"
  if (persisted.consentDecision === 'never') {
    return false;
  }

  // Max prompts reached
  const maxPrompts = config.maxPromptCount ?? MAX_PROMPT_COUNT_DEFAULT;
  if (persisted.promptCount >= maxPrompts) {
    return false;
  }

  // Check postpone period
  if (persisted.consentDecision === 'later' && persisted.timestamps.postponedAt) {
    const postponeDays = config.postponeDays ?? POSTPONE_DAYS_DEFAULT;
    const postponeMs = postponeDays * 24 * 60 * 60 * 1000;
    const timeSincePostpone = Date.now() - new Date(persisted.timestamps.postponedAt).getTime();
    if (timeSincePostpone < postponeMs) {
      return false;
    }
  }

  return true;
};

/**
 * Get the initial flow step based on browser permission
 */
const getInitialStep = (browserPermission: PushPermissionStatus): PermissionFlowStep => {
  switch (browserPermission) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'blocked';
    case 'unsupported':
      return 'unsupported';
    default:
      return 'initial';
  }
};

// =============================================================================
// REDUCER
// =============================================================================

type PermissionAction =
  | { type: 'SHOW_PROMPT' }
  | { type: 'HIDE_PROMPT' }
  | { type: 'START_REQUEST' }
  | { type: 'PERMISSION_GRANTED' }
  | { type: 'PERMISSION_DENIED' }
  | { type: 'CONSENT_ACCEPTED' }
  | { type: 'CONSENT_DECLINED' }
  | { type: 'CONSENT_POSTPONED' }
  | { type: 'CONSENT_NEVER' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_FULLY_ENABLED'; payload: boolean }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: Partial<PushPermissionFlowState> };

const createInitialState = (browserPermission: PushPermissionStatus): PushPermissionFlowState => ({
  step: getInitialStep(browserPermission),
  browserPermission,
  consentDecision: null,
  isPromptVisible: false,
  isRequesting: false,
  promptCount: 0,
  timestamps: {},
  error: null,
  isFullyEnabled: browserPermission === 'granted',
});

function permissionReducer(
  state: PushPermissionFlowState,
  action: PermissionAction
): PushPermissionFlowState {
  switch (action.type) {
    case 'SHOW_PROMPT':
      return {
        ...state,
        step: 'prompt',
        isPromptVisible: true,
        promptCount: state.promptCount + 1,
        timestamps: {
          ...state.timestamps,
          lastPromptAt: new Date(),
          firstPromptAt: state.timestamps.firstPromptAt || new Date(),
        },
      };

    case 'HIDE_PROMPT':
      return {
        ...state,
        isPromptVisible: false,
        step: state.browserPermission === 'granted' ? 'granted' : 'initial',
      };

    case 'START_REQUEST':
      return {
        ...state,
        step: 'requesting',
        isRequesting: true,
        error: null,
      };

    case 'PERMISSION_GRANTED':
      return {
        ...state,
        step: 'granted',
        browserPermission: 'granted',
        isRequesting: false,
        isPromptVisible: false,
        consentDecision: 'accepted',
        timestamps: { ...state.timestamps, grantedAt: new Date() },
      };

    case 'PERMISSION_DENIED':
      return {
        ...state,
        step: 'denied',
        browserPermission: 'denied',
        isRequesting: false,
        timestamps: { ...state.timestamps, deniedAt: new Date() },
      };

    case 'CONSENT_ACCEPTED':
      return {
        ...state,
        consentDecision: 'accepted',
      };

    case 'CONSENT_DECLINED':
      return {
        ...state,
        step: 'initial',
        isPromptVisible: false,
        consentDecision: 'declined',
      };

    case 'CONSENT_POSTPONED':
      return {
        ...state,
        step: 'initial',
        isPromptVisible: false,
        consentDecision: 'later',
        timestamps: { ...state.timestamps, postponedAt: new Date() },
      };

    case 'CONSENT_NEVER':
      return {
        ...state,
        step: 'initial',
        isPromptVisible: false,
        consentDecision: 'never',
        timestamps: { ...state.timestamps, neverAskAt: new Date() },
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isRequesting: false,
      };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_FULLY_ENABLED':
      return { ...state, isFullyEnabled: action.payload };

    case 'RESET':
      return createInitialState(pushNotificationService.getPermissionStatus());

    case 'HYDRATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// =============================================================================
// HOOK
// =============================================================================

export interface UsePushNotificationPermissionReturn {
  state: PushPermissionFlowState;
  actions: PushPermissionFlowActions;
  /** Convenience: whether the prompt should be shown */
  shouldShowPrompt: boolean;
  /** Convenience: whether notifications can be enabled */
  canEnable: boolean;
  /** Convenience: whether user has permanently dismissed */
  isPermanentlyDismissed: boolean;
}

export function usePushNotificationPermission(
  config: PushPermissionFlowConfig = {}
): UsePushNotificationPermissionReturn {
  const {
    storageKey = STORAGE_KEY_DEFAULT,
    autoPrompt = false,
    autoPromptDelay = AUTO_PROMPT_DELAY_DEFAULT,
    onPermissionGranted,
    onPermissionDenied,
    onConsentDeclined,
    onStepChange,
  } = config;

  const browserPermission = pushNotificationService.getPermissionStatus();
  const [state, dispatch] = useReducer(permissionReducer, browserPermission, createInitialState);

  const configRef = useRef(config);
  configRef.current = config;

  // Hydrate from localStorage on mount
  useEffect(() => {
    const persisted = loadPersistedState(storageKey);
    if (persisted) {
      dispatch({
        type: 'HYDRATE',
        payload: {
          consentDecision: persisted.consentDecision,
          promptCount: persisted.promptCount,
          timestamps: persisted.timestamps,
        },
      });
    }
  }, [storageKey]);

  // Persist state changes
  useEffect(() => {
    const persisted: PersistedPermissionState = {
      consentDecision: state.consentDecision,
      promptCount: state.promptCount,
      timestamps: state.timestamps,
      version: STORAGE_VERSION,
    };
    savePersistedState(storageKey, persisted);
  }, [storageKey, state.consentDecision, state.promptCount, state.timestamps]);

  // Handle step changes callback
  useEffect(() => {
    onStepChange?.(state.step);
  }, [state.step, onStepChange]);

  // Auto-prompt logic
  useEffect(() => {
    if (!autoPrompt) return;

    const persisted = loadPersistedState(storageKey);
    if (!shouldAutoPrompt(persisted, browserPermission, configRef.current)) return;

    const timer = setTimeout(() => {
      dispatch({ type: 'SHOW_PROMPT' });
    }, autoPromptDelay);

    return () => clearTimeout(timer);
  }, [autoPrompt, autoPromptDelay, browserPermission, storageKey]);

  // Actions
  const showPrompt = useCallback(() => {
    dispatch({ type: 'SHOW_PROMPT' });
  }, []);

  const hidePrompt = useCallback(() => {
    dispatch({ type: 'HIDE_PROMPT' });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    dispatch({ type: 'START_REQUEST' });

    const result = await pushNotificationService.requestPermission();

    if (result.success && result.data === 'granted') {
      dispatch({ type: 'PERMISSION_GRANTED' });
      onPermissionGranted?.();
      return true;
    } else {
      dispatch({ type: 'PERMISSION_DENIED' });
      onPermissionDenied?.();
      if (result.error) {
        dispatch({ type: 'SET_ERROR', payload: result.error.message });
      }
      return false;
    }
  }, [onPermissionGranted, onPermissionDenied]);

  const acceptConsent = useCallback(async (): Promise<boolean> => {
    dispatch({ type: 'CONSENT_ACCEPTED' });
    return requestPermission();
  }, [requestPermission]);

  const declineConsent = useCallback(() => {
    dispatch({ type: 'CONSENT_DECLINED' });
    onConsentDeclined?.();
  }, [onConsentDeclined]);

  const postponeConsent = useCallback(() => {
    dispatch({ type: 'CONSENT_POSTPONED' });
  }, []);

  const neverAskAgain = useCallback(() => {
    dispatch({ type: 'CONSENT_NEVER' });
  }, []);

  const resetFlow = useCallback(() => {
    localStorage.removeItem(storageKey);
    dispatch({ type: 'RESET' });
  }, [storageKey]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const actions: PushPermissionFlowActions = useMemo(
    () => ({
      showPrompt,
      hidePrompt,
      requestPermission,
      acceptConsent,
      declineConsent,
      postponeConsent,
      neverAskAgain,
      resetFlow,
      clearError,
    }),
    [
      showPrompt,
      hidePrompt,
      requestPermission,
      acceptConsent,
      declineConsent,
      postponeConsent,
      neverAskAgain,
      resetFlow,
      clearError,
    ]
  );

  // Computed values
  const shouldShowPrompt = state.isPromptVisible;
  const canEnable = state.browserPermission === 'default' || state.browserPermission === 'granted';
  const isPermanentlyDismissed = state.consentDecision === 'never';

  return {
    state,
    actions,
    shouldShowPrompt,
    canEnable,
    isPermanentlyDismissed,
  };
}

export default usePushNotificationPermission;
