import { CacheStrategyOptions } from '../interfaces/cache-strategy.interface';

/**
 * Options for cache operations
 */
export interface CacheOptions extends CacheStrategyOptions {
  /**
   * Strategy to use for this operation
   * If not specified, uses the default strategy
   */
  strategy?: string;
}

/**
 * Cache key builder options
 */
export interface CacheKeyOptions {
  /**
   * Prefix for the cache key
   */
  prefix?: string;

  /**
   * Separator between key parts
   */
  separator?: string;
}
