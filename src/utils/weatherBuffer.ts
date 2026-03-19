import { getLogger } from '@/utils/logger';

import type { TemperatureUnit } from '@/services/weatherService';
import type { CurrentWeatherData, ForecastDay } from '@/types/weather';

const weatherBufferLogger = getLogger('Weather:Buffer');

const WEATHER_BUFFER_PREFIX = 'weather_buffer:';
const WEATHER_BUFFER_VERSION = 1;
const WEATHER_BUFFER_DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const WEATHER_BUFFER_MAX_ENTRIES = 10;

export interface WeatherBufferPayload {
  current: CurrentWeatherData;
  forecast: ForecastDay[];
}

export interface WeatherBufferKey {
  query: string;
  unit: TemperatureUnit;
  days: number;
}

interface WeatherBufferRecord {
  version: number;
  timestamp: number;
  expiresAt: number;
  payload: WeatherBufferPayload;
  metadata: {
    query: string;
    normalizedQuery: string;
    unit: TemperatureUnit;
    days: number;
  };
}

export interface WeatherBufferReadOptions extends WeatherBufferKey {
  allowExpired?: boolean;
}

export interface WeatherBufferReadResult {
  payload: WeatherBufferPayload;
  timestamp: number;
  expiresAt: number;
  metadata: WeatherBufferRecord['metadata'];
  expired: boolean;
}

const hasLocalStorage = (): Storage | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const testKey = `${WEATHER_BUFFER_PREFIX}__test__`;
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);

    return window.localStorage;
  } catch (error) {
    weatherBufferLogger.warn('LocalStorage unavailable for weather buffering', {
      reason: error instanceof Error ? error.message : 'unknown',
    });
    return null;
  }
};

const normalizeQuery = (query: string): string => query.trim().toLowerCase();

const createBufferKey = ({ query, unit, days }: WeatherBufferKey): string => {
  const normalized = normalizeQuery(query);
  return `${WEATHER_BUFFER_PREFIX}${encodeURIComponent(normalized)}::${unit}::${days}`;
};

const parseRecord = (raw: string | null): WeatherBufferRecord | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as WeatherBufferRecord;

    if (parsed?.version !== WEATHER_BUFFER_VERSION) {
      return null;
    }

    if (!parsed.payload?.current || !parsed.payload?.forecast) {
      return null;
    }

    return parsed;
  } catch (error) {
    weatherBufferLogger.warn('Failed to parse weather buffer entry', {
      reason: error instanceof Error ? error.message : 'unknown',
    });
    return null;
  }
};

const pruneStaleEntries = (storage: Storage) => {
  const entries: Array<{ key: string; timestamp: number }> = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || !key.startsWith(WEATHER_BUFFER_PREFIX)) {
      continue;
    }

    const record = parseRecord(storage.getItem(key));
    if (!record) {
      storage.removeItem(key);
      continue;
    }

    entries.push({ key, timestamp: record.timestamp });
  }

  if (entries.length <= WEATHER_BUFFER_MAX_ENTRIES) {
    return;
  }

  entries.sort((a, b) => a.timestamp - b.timestamp);
  const removeCount = entries.length - WEATHER_BUFFER_MAX_ENTRIES;

  for (let idx = 0; idx < removeCount; idx += 1) {
    storage.removeItem(entries[idx].key);
  }
};

export const persistWeatherBuffer = (
  key: WeatherBufferKey,
  payload: WeatherBufferPayload,
  ttlMs: number = WEATHER_BUFFER_DEFAULT_TTL_MS
): void => {
  const storage = hasLocalStorage();
  if (!storage) {
    return;
  }

  const now = Date.now();
  const expiresAt = now + Math.max(ttlMs, 1000);

  const record: WeatherBufferRecord = {
    version: WEATHER_BUFFER_VERSION,
    timestamp: now,
    expiresAt,
    payload,
    metadata: {
      query: key.query,
      normalizedQuery: normalizeQuery(key.query),
      unit: key.unit,
      days: key.days,
    },
  };

  try {
    storage.setItem(createBufferKey(key), JSON.stringify(record));
    pruneStaleEntries(storage);
  } catch (error) {
    weatherBufferLogger.warn('Failed to persist weather buffer entry', {
      reason: error instanceof Error ? error.message : 'unknown',
    });
  }
};

export const loadWeatherBuffer = (
  options: WeatherBufferReadOptions
): WeatherBufferReadResult | null => {
  const storage = hasLocalStorage();
  if (!storage) {
    return null;
  }

  const record = parseRecord(storage.getItem(createBufferKey(options)));
  if (!record) {
    return null;
  }

  const now = Date.now();
  const expired = record.expiresAt <= now;

  if (expired && !options.allowExpired) {
    storage.removeItem(createBufferKey(options));
    return null;
  }

  return {
    payload: record.payload,
    timestamp: record.timestamp,
    expiresAt: record.expiresAt,
    metadata: record.metadata,
    expired,
  };
};

export const clearWeatherBuffer = (key?: WeatherBufferKey): void => {
  const storage = hasLocalStorage();
  if (!storage) {
    return;
  }

  if (!key) {
    const keysToRemove: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const storageKey = storage.key(index);
      if (storageKey && storageKey.startsWith(WEATHER_BUFFER_PREFIX)) {
        keysToRemove.push(storageKey);
      }
    }

    keysToRemove.forEach(k => storage.removeItem(k));
    return;
  }

  storage.removeItem(createBufferKey(key));
};

export const getWeatherBufferKey = (key: WeatherBufferKey): string => createBufferKey(key);
