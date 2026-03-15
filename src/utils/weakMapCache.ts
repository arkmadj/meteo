/**
 * A WeakMap-based cache that automatically releases memory when keys are no longer referenced.
 * Keys must be objects, and the cache uses weak references to prevent memory leaks.
 */
class WeakMapCache<K extends object, V> {
  private readonly cache = new WeakMap<K, V>();

  /**
   * Retrieves the value associated with the given key.
   * @param key The key to look up (must be an object).
   * @returns The value if found, otherwise undefined.
   */
  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  /**
   * Stores a value associated with the given key.
   * @param key The key to store (must be an object).
   * @param value The value to store.
   */
  set(key: K, value: V): void {
    this.cache.set(key, value);
  }

  /**
   * Checks if a key exists in the cache.
   * @param key The key to check (must be an object).
   * @returns True if the key exists, false otherwise.
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Removes the entry for the given key.
   * @param key The key to remove (must be an object).
   * @returns True if the key was found and removed, false otherwise.
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

export default WeakMapCache;
