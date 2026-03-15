declare global {
  interface Reflect {
    defineMetadata(
      metadataKey: string | symbol,
      metadataValue: unknown,
      target: object,
      propertyKey?: string | symbol
    ): void;

    getMetadata<T = unknown>(
      metadataKey: string | symbol,
      target: object,
      propertyKey?: string | symbol
    ): T | undefined;

    hasMetadata(
      metadataKey: string | symbol,
      target: object,
      propertyKey?: string | symbol
    ): boolean;

    deleteMetadata(
      metadataKey: string | symbol,
      target: object,
      propertyKey?: string | symbol
    ): boolean;
  }
}

export { };
