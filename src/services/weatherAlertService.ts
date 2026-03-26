/**
 * Weather Alert Processing Service
 *
 * Evaluates weather conditions against configurable thresholds,
 * triggers alerts, and manages notification delivery.
 */

import type { CurrentWeatherData } from '@/types/weather';
import type {
  AlertCondition,
  AlertConditionType,
  AlertEvaluationSummary,
  AlertEvent,
  AlertEventCallback,
  AlertEventType,
  AlertFilterOptions,
  AlertPreferences,
  AlertSeverity,
  AlertStatistics,
  AlertThreshold,
  ConditionEvaluationResult,
  WeatherAlert,
  WeatherAlertServiceConfig,
  WeatherEvaluationInput,
} from '@/types/weatherAlert';

import { AlertNotFoundError, AlertServiceNotInitializedError } from '@/errors/domainErrors';
import { getLogger } from '@/utils/logger';
import { notificationService } from './notificationService';

// Logger instance
const logger = getLogger('WeatherAlertService');

// Default configuration
const DEFAULT_CONFIG: Required<WeatherAlertServiceConfig> = {
  evaluationIntervalMs: 5 * 60 * 1000, // 5 minutes
  defaultCooldownMs: 30 * 60 * 1000, // 30 minutes
  maxAlertHistory: 100,
  debug: false,
  storageKeyPrefix: 'weather_alert_',
  alertExpirationMs: 24 * 60 * 60 * 1000, // 24 hours
};

// Severity priority for comparison
const SEVERITY_PRIORITY: Record<AlertSeverity, number> = {
  info: 0,
  warning: 1,
  severe: 2,
  critical: 3,
};

// Default alert preferences
const DEFAULT_PREFERENCES: AlertPreferences = {
  enabled: true,
  minimumSeverity: 'warning',
  enabledConditions: {},
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
    allowCritical: true,
  },
  soundEnabled: true,
};

/**
 * Generate unique alert ID
 */
const generateAlertId = (): string =>
  `alert_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

/**
 * Default weather alert conditions with thresholds
 */
const DEFAULT_CONDITIONS: AlertCondition[] = [
  {
    id: 'temp_high',
    type: 'temperature_high',
    name: 'High Temperature',
    description: 'Alert when temperature exceeds threshold',
    thresholds: {
      warning: { operator: 'gte', value: 35, unit: '°C' },
      severe: { operator: 'gte', value: 40, unit: '°C' },
      critical: { operator: 'gte', value: 45, unit: '°C' },
    },
    enabled: true,
    cooldownPeriod: 60 * 60 * 1000,
  },
  {
    id: 'temp_low',
    type: 'temperature_low',
    name: 'Low Temperature',
    description: 'Alert when temperature drops below threshold',
    thresholds: {
      info: { operator: 'lte', value: 5, unit: '°C' },
      warning: { operator: 'lte', value: 0, unit: '°C' },
      severe: { operator: 'lte', value: -10, unit: '°C' },
      critical: { operator: 'lte', value: -20, unit: '°C' },
    },
    enabled: true,
    cooldownPeriod: 60 * 60 * 1000,
  },
  {
    id: 'wind_speed',
    type: 'wind_speed',
    name: 'High Wind Speed',
    description: 'Alert when wind speed exceeds threshold',
    thresholds: {
      warning: { operator: 'gte', value: 50, unit: 'km/h' },
      severe: { operator: 'gte', value: 75, unit: 'km/h' },
      critical: { operator: 'gte', value: 100, unit: 'km/h' },
    },
    enabled: true,
    cooldownPeriod: 30 * 60 * 1000,
  },
  {
    id: 'uv_index',
    type: 'uv_index',
    name: 'High UV Index',
    description: 'Alert when UV index reaches dangerous levels',
    thresholds: {
      info: { operator: 'gte', value: 6, unit: '' },
      warning: { operator: 'gte', value: 8, unit: '' },
      severe: { operator: 'gte', value: 10, unit: '' },
      critical: { operator: 'gte', value: 11, unit: '' },
    },
    enabled: true,
    cooldownPeriod: 2 * 60 * 60 * 1000,
  },
  {
    id: 'visibility_low',
    type: 'visibility_low',
    name: 'Low Visibility',
    description: 'Alert when visibility drops below threshold',
    thresholds: {
      warning: { operator: 'lte', value: 1000, unit: 'm' },
      severe: { operator: 'lte', value: 500, unit: 'm' },
      critical: { operator: 'lte', value: 200, unit: 'm' },
    },
    enabled: true,
    cooldownPeriod: 30 * 60 * 1000,
  },
  {
    id: 'humidity_high',
    type: 'humidity_high',
    name: 'High Humidity',
    description: 'Alert when humidity is uncomfortably high',
    thresholds: {
      info: { operator: 'gte', value: 80, unit: '%' },
      warning: { operator: 'gte', value: 90, unit: '%' },
    },
    enabled: true,
    cooldownPeriod: 2 * 60 * 60 * 1000,
  },
];

/**
 * Weather Alert Processing Service
 * Singleton service for evaluating conditions and managing alerts
 */
class WeatherAlertService {
  private static instance: WeatherAlertService;
  private config: Required<WeatherAlertServiceConfig>;
  private isInitialized = false;
  private conditions: Map<string, AlertCondition> = new Map();
  private alerts: Map<string, WeatherAlert> = new Map();
  private alertHistory: WeatherAlert[] = [];
  private preferences: AlertPreferences;
  private eventListeners: Map<AlertEventType, Set<AlertEventCallback>> = new Map();
  private evaluationInterval: ReturnType<typeof setInterval> | null = null;
  private lastAlertTimes: Map<string, number> = new Map();
  private currentWeatherData: CurrentWeatherData | null = null;

  private constructor(config: WeatherAlertServiceConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<WeatherAlertServiceConfig>;
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.initializeDefaultConditions();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: WeatherAlertServiceConfig): WeatherAlertService {
    if (!WeatherAlertService.instance) {
      WeatherAlertService.instance = new WeatherAlertService(config);
    }
    return WeatherAlertService.instance;
  }

  /**
   * Reset singleton instance (for testing)
   */
  public static resetInstance(): void {
    if (WeatherAlertService.instance) {
      WeatherAlertService.instance.destroy();
      WeatherAlertService.instance = null as unknown as WeatherAlertService;
    }
  }

  /**
   * Initialize the alert service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.log('Initializing weather alert service...');

    await this.loadFromStorage();
    this.expireOldAlerts();
    this.isInitialized = true;

    this.log('Weather alert service initialized');
  }

  /**
   * Destroy the service and clean up resources
   */
  public destroy(): void {
    this.stopAutoEvaluation();
    this.eventListeners.clear();
    this.conditions.clear();
    this.alerts.clear();
    this.isInitialized = false;
    this.log('Weather alert service destroyed');
  }

  /**
   * Initialize default alert conditions
   */
  private initializeDefaultConditions(): void {
    for (const condition of DEFAULT_CONDITIONS) {
      this.conditions.set(condition.id, { ...condition });
    }
  }

  // ============================================
  // Condition Management
  // ============================================

  /**
   * Add or update an alert condition
   */
  public setCondition(condition: AlertCondition): void {
    this.conditions.set(condition.id, { ...condition });
    this.saveToStorage();
    this.log('Condition updated:', condition.id);
  }

  /**
   * Remove an alert condition
   */
  public removeCondition(conditionId: string): boolean {
    const removed = this.conditions.delete(conditionId);
    if (removed) {
      this.saveToStorage();
      this.log('Condition removed:', conditionId);
    }
    return removed;
  }

  /**
   * Get a specific condition
   */
  public getCondition(conditionId: string): AlertCondition | undefined {
    return this.conditions.get(conditionId);
  }

  /**
   * Get all conditions
   */
  public getConditions(): AlertCondition[] {
    return Array.from(this.conditions.values());
  }

  /**
   * Enable or disable a condition
   */
  public setConditionEnabled(conditionId: string, enabled: boolean): void {
    const condition = this.conditions.get(conditionId);
    if (condition) {
      condition.enabled = enabled;
      this.saveToStorage();
    }
  }

  // ============================================
  // Weather Data & Evaluation
  // ============================================

  /**
   * Update current weather data for evaluation
   */
  public updateWeatherData(data: CurrentWeatherData): void {
    this.currentWeatherData = data;
  }

  /**
   * Evaluate all conditions against weather data
   */
  public evaluate(input: WeatherEvaluationInput): AlertEvaluationSummary {
    this.ensureInitialized();

    const results: ConditionEvaluationResult[] = [];
    const newAlerts: WeatherAlert[] = [];
    const now = new Date();

    // Store weather data for reference
    this.currentWeatherData = input.current;

    // Evaluate each enabled condition
    for (const condition of this.conditions.values()) {
      if (!condition.enabled) continue;
      if (!this.isConditionEnabledInPreferences(condition.type)) continue;

      try {
        const result = this.evaluateCondition(condition, input);
        results.push(result);

        if (result.triggered && result.severity) {
          // Check cooldown
          if (!this.isInCooldown(condition.id)) {
            const alert = this.createAlert(condition, result, input.current);
            newAlerts.push(alert);
            this.alerts.set(alert.id, alert);
            this.alertHistory.unshift(alert);
            this.lastAlertTimes.set(condition.id, Date.now());
            this.emitEvent('alert:created', { alert });
            void this.deliverAlertNotification(alert);
          }
        }
      } catch (error) {
        this.log('Error evaluating condition:', condition.id, error);
      }
    }

    // Trim history
    this.trimAlertHistory();
    this.saveToStorage();

    const summary: AlertEvaluationSummary = {
      evaluatedAt: now,
      conditionsEvaluated: results.length,
      alertsTriggered: newAlerts.length,
      results,
      newAlerts,
      location: {
        city: input.current.city,
        country: input.current.country,
      },
    };

    this.emitEvent('evaluation:complete', { evaluation: summary });
    return summary;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: AlertCondition,
    input: WeatherEvaluationInput
  ): ConditionEvaluationResult {
    const currentValue = this.extractValueForCondition(condition.type, input.current);
    const now = new Date();

    // Find highest severity threshold that's exceeded
    let triggeredSeverity: AlertSeverity | undefined;
    let triggeredThreshold: AlertThreshold | undefined;

    const severities: AlertSeverity[] = ['critical', 'severe', 'warning', 'info'];

    for (const severity of severities) {
      const threshold = condition.thresholds[severity];
      if (threshold && this.evaluateThreshold(currentValue, threshold)) {
        triggeredSeverity = severity;
        triggeredThreshold = threshold;
        break;
      }
    }

    return {
      conditionId: condition.id,
      triggered: triggeredSeverity !== undefined,
      severity: triggeredSeverity,
      currentValue,
      threshold: triggeredThreshold,
      evaluatedAt: now,
    };
  }

  /**
   * Extract the relevant value from weather data for a condition type
   */
  private extractValueForCondition(type: AlertConditionType, data: CurrentWeatherData): number {
    switch (type) {
      case 'temperature_high':
      case 'temperature_low':
      case 'heat_wave':
      case 'cold_snap':
      case 'freezing':
        return data.temperature.current;
      case 'wind_speed':
        return data.wind.speed;
      case 'wind_gust':
        return data.wind.gust ?? data.wind.speed;
      case 'humidity_high':
      case 'humidity_low':
        return data.humidity;
      case 'pressure_change':
        return data.pressure;
      case 'uv_index':
        return data.uvIndex;
      case 'visibility_low':
        return data.visibility;
      default:
        return 0;
    }
  }

  /**
   * Evaluate a value against a threshold
   */
  private evaluateThreshold(value: number, threshold: AlertThreshold): boolean {
    switch (threshold.operator) {
      case 'gt':
        return value > threshold.value;
      case 'gte':
        return value >= threshold.value;
      case 'lt':
        return value < threshold.value;
      case 'lte':
        return value <= threshold.value;
      case 'eq':
        return value === threshold.value;
      case 'between':
        return (
          threshold.secondaryValue !== undefined &&
          value >= threshold.value &&
          value <= threshold.secondaryValue
        );
      case 'outside':
        return (
          threshold.secondaryValue !== undefined &&
          (value < threshold.value || value > threshold.secondaryValue)
        );
      default:
        return false;
    }
  }

  // ============================================
  // Alert Management
  // ============================================

  /**
   * Create an alert from evaluation result
   */
  private createAlert(
    condition: AlertCondition,
    result: ConditionEvaluationResult,
    weatherData: CurrentWeatherData
  ): WeatherAlert {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.alertExpirationMs);

    return {
      id: generateAlertId(),
      conditionId: condition.id,
      conditionType: condition.type,
      severity: result.severity!,
      title: this.generateAlertTitle(condition, result),
      message: this.generateAlertMessage(condition, result, weatherData),
      status: 'active',
      location: {
        city: weatherData.city,
        country: weatherData.country,
        latitude: weatherData.latitude,
        longitude: weatherData.longitude,
      },
      triggerValues: {
        current: result.currentValue,
        threshold: result.threshold!.value,
        unit: result.threshold!.unit,
      },
      createdAt: now,
      updatedAt: now,
      expiresAt,
      notificationSent: false,
    };
  }

  /**
   * Generate alert title
   */
  private generateAlertTitle(condition: AlertCondition, result: ConditionEvaluationResult): string {
    const severityLabels: Record<AlertSeverity, string> = {
      info: 'Info',
      warning: 'Warning',
      severe: 'Severe Alert',
      critical: 'Critical Alert',
    };
    return `${severityLabels[result.severity!]}: ${condition.name}`;
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(
    condition: AlertCondition,
    result: ConditionEvaluationResult,
    weatherData: CurrentWeatherData
  ): string {
    const unit = result.threshold?.unit || '';
    return (
      `${condition.name} alert for ${weatherData.city}, ${weatherData.country}. ` +
      `Current value: ${result.currentValue}${unit} ` +
      `(threshold: ${result.threshold?.value}${unit})`
    );
  }

  /**
   * Get an alert by ID
   */
  public getAlert(alertId: string): WeatherAlert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Get all active alerts
   */
  public getActiveAlerts(): WeatherAlert[] {
    return Array.from(this.alerts.values()).filter(a => a.status === 'active');
  }

  /**
   * Get alerts with filtering
   */
  public getAlerts(options?: AlertFilterOptions): WeatherAlert[] {
    let results = [...this.alertHistory];

    if (options) {
      if (options.severity?.length) {
        results = results.filter(a => options.severity!.includes(a.severity));
      }
      if (options.status?.length) {
        results = results.filter(a => options.status!.includes(a.status));
      }
      if (options.conditionTypes?.length) {
        results = results.filter(a => options.conditionTypes!.includes(a.conditionType));
      }
      if (options.location) {
        results = results.filter(
          a =>
            a.location.city.toLowerCase().includes(options.location!.toLowerCase()) ||
            a.location.country.toLowerCase().includes(options.location!.toLowerCase())
        );
      }
      if (options.startDate) {
        results = results.filter(a => a.createdAt >= options.startDate!);
      }
      if (options.endDate) {
        results = results.filter(a => a.createdAt <= options.endDate!);
      }

      const offset = options.offset || 0;
      const limit = options.limit || results.length;
      results = results.slice(offset, offset + limit);
    }

    return results;
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new AlertNotFoundError(`Alert not found: ${alertId}`);
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.updatedAt = new Date();

    this.emitEvent('alert:acknowledged', { alert });
    this.saveToStorage();
  }

  /**
   * Resolve an alert
   */
  public resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new AlertNotFoundError(`Alert not found: ${alertId}`);
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.updatedAt = new Date();

    this.emitEvent('alert:resolved', { alert });
    this.saveToStorage();
  }

  /**
   * Get alert statistics
   */
  public getStatistics(): AlertStatistics {
    const stats: AlertStatistics = {
      totalAlerts: this.alertHistory.length,
      activeAlerts: 0,
      bySeverity: { info: 0, warning: 0, severe: 0, critical: 0 },
      byConditionType: {},
      byStatus: { active: 0, acknowledged: 0, resolved: 0, expired: 0 },
    };

    for (const alert of this.alertHistory) {
      stats.bySeverity[alert.severity]++;
      stats.byStatus[alert.status]++;
      stats.byConditionType[alert.conditionType] =
        (stats.byConditionType[alert.conditionType] || 0) + 1;

      if (alert.status === 'active') {
        stats.activeAlerts++;
      }
    }

    if (this.alertHistory.length > 0) {
      stats.lastAlertAt = this.alertHistory[0].createdAt;
    }

    return stats;
  }

  // ============================================
  // Notification Delivery
  // ============================================

  /**
   * Deliver notification for an alert
   */
  private async deliverAlertNotification(alert: WeatherAlert): Promise<void> {
    if (!this.preferences.enabled) {
      this.log('Alert notifications disabled');
      return;
    }

    // Check minimum severity
    if (SEVERITY_PRIORITY[alert.severity] < SEVERITY_PRIORITY[this.preferences.minimumSeverity]) {
      this.log('Alert severity below minimum threshold');
      return;
    }

    // Check quiet hours
    if (this.isInQuietHours() && alert.severity !== 'critical') {
      if (!this.preferences.quietHours?.allowCritical) {
        this.log('In quiet hours, skipping notification');
        return;
      }
    }

    try {
      await notificationService.notify({
        title: alert.title,
        body: alert.message,
        category: 'weather-alert',
        priority: this.mapSeverityToPriority(alert.severity),
        tag: `weather-alert-${alert.conditionId}`,
        data: {
          alertId: alert.id,
          conditionId: alert.conditionId,
          severity: alert.severity,
          location: alert.location,
        },
      });

      alert.notificationSent = true;
      alert.updatedAt = new Date();
      this.emitEvent('alert:notification_sent', { alert });
      this.log('Alert notification sent:', alert.id);
    } catch (error) {
      this.log('Failed to send alert notification:', error);
    }
  }

  /**
   * Map alert severity to notification priority
   */
  private mapSeverityToPriority(severity: AlertSeverity): 'low' | 'normal' | 'high' | 'urgent' {
    switch (severity) {
      case 'info':
        return 'low';
      case 'warning':
        return 'normal';
      case 'severe':
        return 'high';
      case 'critical':
        return 'urgent';
    }
  }

  // ============================================
  // Preferences Management
  // ============================================

  /**
   * Get current alert preferences
   */
  public getPreferences(): AlertPreferences {
    return { ...this.preferences };
  }

  /**
   * Update alert preferences
   */
  public updatePreferences(updates: Partial<AlertPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...updates,
      enabledConditions: {
        ...this.preferences.enabledConditions,
        ...(updates.enabledConditions || {}),
      },
    };
    this.saveToStorage();
    this.log('Preferences updated');
  }

  // ============================================
  // Auto-Evaluation
  // ============================================

  /**
   * Start automatic evaluation at configured interval
   */
  public startAutoEvaluation(): void {
    if (this.evaluationInterval) {
      return;
    }

    this.evaluationInterval = setInterval(() => {
      if (this.currentWeatherData) {
        this.evaluate({ current: this.currentWeatherData });
      }
    }, this.config.evaluationIntervalMs);

    this.log('Auto-evaluation started');
  }

  /**
   * Stop automatic evaluation
   */
  public stopAutoEvaluation(): void {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
      this.log('Auto-evaluation stopped');
    }
  }

  // ============================================
  // Event Handling
  // ============================================

  /**
   * Add event listener
   */
  public on(event: AlertEventType, callback: AlertEventCallback): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  /**
   * Remove event listener
   */
  public off(event: AlertEventType, callback: AlertEventCallback): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  /**
   * Emit an event
   */
  private emitEvent(
    type: AlertEventType,
    data?: { alert?: WeatherAlert; evaluation?: AlertEvaluationSummary }
  ): void {
    const event: AlertEvent = {
      type,
      alert: data?.alert,
      evaluation: data?.evaluation,
      timestamp: new Date(),
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          this.log('Event listener error:', error);
        }
      });
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new AlertServiceNotInitializedError('Weather alert service not initialized');
    }
  }

  /**
   * Check if condition is enabled in user preferences
   */
  private isConditionEnabledInPreferences(type: AlertConditionType): boolean {
    const setting = this.preferences.enabledConditions[type];
    return setting === undefined || setting === true;
  }

  /**
   * Check if condition is in cooldown period
   */
  private isInCooldown(conditionId: string): boolean {
    const condition = this.conditions.get(conditionId);
    if (!condition?.cooldownPeriod) return false;

    const lastAlertTime = this.lastAlertTimes.get(conditionId);
    if (!lastAlertTime) return false;

    return Date.now() - lastAlertTime < condition.cooldownPeriod;
  }

  /**
   * Check if currently in quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.preferences.quietHours?.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    const { start, end } = this.preferences.quietHours;

    if (start > end) {
      return currentTime >= start || currentTime < end;
    }
    return currentTime >= start && currentTime < end;
  }

  /**
   * Expire old alerts
   */
  private expireOldAlerts(): void {
    const now = new Date();
    for (const alert of this.alerts.values()) {
      if (alert.expiresAt && alert.expiresAt <= now && alert.status === 'active') {
        alert.status = 'expired';
        alert.updatedAt = now;
        this.emitEvent('alert:expired', { alert });
      }
    }
  }

  /**
   * Trim alert history to max size
   */
  private trimAlertHistory(): void {
    if (this.alertHistory.length > this.config.maxAlertHistory) {
      this.alertHistory = this.alertHistory.slice(0, this.config.maxAlertHistory);
    }
  }

  /**
   * Clear all alerts
   */
  public clearAlerts(): void {
    this.alerts.clear();
    this.alertHistory = [];
    this.lastAlertTimes.clear();
    this.saveToStorage();
    this.log('All alerts cleared');
  }

  // ============================================
  // Storage
  // ============================================

  /**
   * Load data from storage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const alertsKey = `${this.config.storageKeyPrefix}alerts`;
      const historyKey = `${this.config.storageKeyPrefix}history`;
      const conditionsKey = `${this.config.storageKeyPrefix}conditions`;
      const preferencesKey = `${this.config.storageKeyPrefix}preferences`;
      const cooldownsKey = `${this.config.storageKeyPrefix}cooldowns`;

      const storedAlerts = localStorage.getItem(alertsKey);
      if (storedAlerts) {
        const parsed = JSON.parse(storedAlerts) as [string, WeatherAlert][];
        for (const [id, alert] of parsed) {
          alert.createdAt = new Date(alert.createdAt);
          alert.updatedAt = new Date(alert.updatedAt);
          if (alert.expiresAt) alert.expiresAt = new Date(alert.expiresAt);
          if (alert.acknowledgedAt) alert.acknowledgedAt = new Date(alert.acknowledgedAt);
          if (alert.resolvedAt) alert.resolvedAt = new Date(alert.resolvedAt);
          this.alerts.set(id, alert);
        }
      }

      const storedHistory = localStorage.getItem(historyKey);
      if (storedHistory) {
        this.alertHistory = JSON.parse(storedHistory).map((alert: WeatherAlert) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          updatedAt: new Date(alert.updatedAt),
          expiresAt: alert.expiresAt ? new Date(alert.expiresAt) : undefined,
          acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined,
          resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : undefined,
        }));
      }

      const storedConditions = localStorage.getItem(conditionsKey);
      if (storedConditions) {
        const parsed = JSON.parse(storedConditions) as AlertCondition[];
        for (const condition of parsed) {
          this.conditions.set(condition.id, condition);
        }
      }

      const storedPreferences = localStorage.getItem(preferencesKey);
      if (storedPreferences) {
        this.preferences = { ...this.preferences, ...JSON.parse(storedPreferences) };
      }

      const storedCooldowns = localStorage.getItem(cooldownsKey);
      if (storedCooldowns) {
        const parsed = JSON.parse(storedCooldowns) as [string, number][];
        for (const [id, time] of parsed) {
          this.lastAlertTimes.set(id, time);
        }
      }

      this.log('Data loaded from storage');
    } catch (error) {
      this.log('Failed to load from storage:', error);
    }
  }

  /**
   * Save data to storage
   */
  private saveToStorage(): void {
    try {
      const alertsKey = `${this.config.storageKeyPrefix}alerts`;
      const historyKey = `${this.config.storageKeyPrefix}history`;
      const conditionsKey = `${this.config.storageKeyPrefix}conditions`;
      const preferencesKey = `${this.config.storageKeyPrefix}preferences`;
      const cooldownsKey = `${this.config.storageKeyPrefix}cooldowns`;

      localStorage.setItem(alertsKey, JSON.stringify(Array.from(this.alerts.entries())));
      localStorage.setItem(historyKey, JSON.stringify(this.alertHistory));
      localStorage.setItem(conditionsKey, JSON.stringify(Array.from(this.conditions.values())));
      localStorage.setItem(preferencesKey, JSON.stringify(this.preferences));
      localStorage.setItem(cooldownsKey, JSON.stringify(Array.from(this.lastAlertTimes.entries())));
    } catch (error) {
      this.log('Failed to save to storage:', error);
    }
  }

  /**
   * Debug logging
   */
  private log(...args: unknown[]): void {
    if (this.config.debug) {
      logger.debug(args.map(String).join(' '));
    }
  }
}

// Export singleton instance
export const weatherAlertService = WeatherAlertService.getInstance();

// Export class for testing or custom instances
export { WeatherAlertService };
