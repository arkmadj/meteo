import { MetadataUnavailableError } from '@/errors/domainErrors';
import { deleteMetadata, getMetadata, hasMetadata, setMetadata } from './metadataPolyfill';

type PropertyKeyLike = string | symbol;

export type MetadataToken<TValue, TTarget extends object = object> = Readonly<{
  key: symbol;
  description: string;
}> & {
  readonly __valueType?: TValue;
  readonly __targetType?: TTarget;
};

export const createMetadataToken = <TValue, TTarget extends object = object>(
  description: string
): MetadataToken<TValue, TTarget> =>
  Object.freeze({
    key: Symbol(description),
    description,
  }) as MetadataToken<TValue, TTarget>;

export const setMetadataValue = <TValue, TTarget extends object>(
  token: MetadataToken<TValue, TTarget>,
  value: TValue,
  target: TTarget,
  propertyKey?: PropertyKeyLike
): void => {
  setMetadata(token.key, value, target, propertyKey);
};

export const getMetadataValue = <TValue, TTarget extends object>(
  token: MetadataToken<TValue, TTarget>,
  target: TTarget,
  propertyKey?: PropertyKeyLike
): TValue | undefined => getMetadata<TValue>(token.key, target, propertyKey);

export const getRequiredMetadataValue = <TValue, TTarget extends object>(
  token: MetadataToken<TValue, TTarget>,
  target: TTarget,
  propertyKey?: PropertyKeyLike,
  errorFactory?: () => Error
): TValue => {
  const value = getMetadataValue(token, target, propertyKey);
  if (typeof value === 'undefined') {
    throw errorFactory?.() ??
      new MetadataUnavailableError(
        `Metadata '${token.description}' is not available on the provided target${
          typeof propertyKey === 'undefined' ? '' : ` (property: ${String(propertyKey)})`
        }.`
      );
  }
  return value;
};

export const hasMetadataValue = <TValue, TTarget extends object>(
  token: MetadataToken<TValue, TTarget>,
  target: TTarget,
  propertyKey?: PropertyKeyLike
): boolean => hasMetadata(token.key, target, propertyKey);

export const deleteMetadataValue = <TValue, TTarget extends object>(
  token: MetadataToken<TValue, TTarget>,
  target: TTarget,
  propertyKey?: PropertyKeyLike
): boolean => deleteMetadata(token.key, target, propertyKey);

