type MetadataKey = string | symbol;
type PropertyIdentifier = string | symbol | undefined;

type MetadataMap = Map<PropertyIdentifier, Map<MetadataKey, unknown>>;

const metadataStore = new WeakMap<object, MetadataMap>();

const normalizePropertyKey = (propertyKey?: string | symbol): PropertyIdentifier =>
  typeof propertyKey === 'undefined' ? undefined : propertyKey;

const ensureMetadataMap = (target: object): MetadataMap => {
  let targetMap = metadataStore.get(target);
  if (!targetMap) {
    targetMap = new Map();
    metadataStore.set(target, targetMap);
  }
  return targetMap;
};

const defineMetadataPolyfill = (
  metadataKey: MetadataKey,
  metadataValue: unknown,
  target: object,
  propertyKey?: string | symbol
): void => {
  const targetMap = ensureMetadataMap(target);
  const key = normalizePropertyKey(propertyKey);
  let propertyMap = targetMap.get(key);
  if (!propertyMap) {
    propertyMap = new Map();
    targetMap.set(key, propertyMap);
  }
  propertyMap.set(metadataKey, metadataValue);
};

const getMetadataPolyfill = <T = unknown>(
  metadataKey: MetadataKey,
  target: object,
  propertyKey?: string | symbol
): T | undefined => {
  const targetMap = metadataStore.get(target);
  if (!targetMap) {
    return undefined;
  }
  const propertyMap = targetMap.get(normalizePropertyKey(propertyKey));
  return propertyMap?.get(metadataKey) as T | undefined;
};

const hasMetadataPolyfill = (
  metadataKey: MetadataKey,
  target: object,
  propertyKey?: string | symbol
): boolean => {
  const targetMap = metadataStore.get(target);
  if (!targetMap) {
    return false;
  }
  const propertyMap = targetMap.get(normalizePropertyKey(propertyKey));
  return propertyMap?.has(metadataKey) ?? false;
};

const deleteMetadataPolyfill = (
  metadataKey: MetadataKey,
  target: object,
  propertyKey?: string | symbol
): boolean => {
  const targetMap = metadataStore.get(target);
  if (!targetMap) {
    return false;
  }
  const key = normalizePropertyKey(propertyKey);
  const propertyMap = targetMap.get(key);
  if (!propertyMap || !propertyMap.delete(metadataKey)) {
    return false;
  }
  if (propertyMap.size === 0) {
    targetMap.delete(key);
  }
  if (targetMap.size === 0) {
    metadataStore.delete(target);
  }
  return true;
};

export const setMetadata = defineMetadataPolyfill;
export const getMetadata = getMetadataPolyfill;
export const hasMetadata = hasMetadataPolyfill;
export const deleteMetadata = deleteMetadataPolyfill;

const reflectObject = Reflect as Record<string, unknown>;

if (typeof reflectObject.defineMetadata !== 'function') {
  reflectObject.defineMetadata = defineMetadataPolyfill;
}

if (typeof reflectObject.getMetadata !== 'function') {
  reflectObject.getMetadata = getMetadataPolyfill;
}

if (typeof reflectObject.hasMetadata !== 'function') {
  reflectObject.hasMetadata = hasMetadataPolyfill;
}

if (typeof reflectObject.deleteMetadata !== 'function') {
  reflectObject.deleteMetadata = deleteMetadataPolyfill;
}
