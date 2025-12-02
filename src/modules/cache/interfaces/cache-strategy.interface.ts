/**
 * Abstract interface for cache strategies
 * Follows Strategy Pattern and Dependency Inversion Principle
 */
export interface ICacheStrategy {
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param options Optional strategy-specific options
   * @returns True if successful, false otherwise
   */
  set<T>(
    key: string,
    value: T,
    options?: CacheStrategyOptions,
  ): Promise<boolean>;

  /**
   * Delete a value from cache
   * @param key Cache key
   * @returns True if deleted, false if key didn't exist
   */
  delete(key: string): Promise<boolean>;

  /**
   * Check if a key exists in cache
   * @param key Cache key
   * @returns True if exists, false otherwise
   */
  exists(key: string): Promise<boolean>;

  /**
   * Clear all cache entries (strategy-specific implementation)
   * @param pattern Optional pattern to match keys
   */
  clear(pattern?: string): Promise<void>;

  /**
   * Get the strategy name/identifier
   */
  getStrategyName(): string;
}

/**
 * Options that can be passed to cache strategies
 */
export interface CacheStrategyOptions {
  /**
   * Time to live in seconds
   */
  ttl?: number;

  /**
   * Additional strategy-specific options
   */
  [key: string]: any;
}
