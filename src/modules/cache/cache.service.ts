import { Injectable, Inject, Optional } from '@nestjs/common';
import { ICacheStrategy } from './interfaces/cache-strategy.interface';
import { CacheOptions } from './types/cache-options.interface';
import { CacheKeyBuilder } from './utils/cache-key-builder.util';

/**
 * Main Cache Service
 * Follows Dependency Inversion Principle - depends on abstraction (ICacheStrategy)
 * Uses Strategy Pattern to support multiple caching strategies
 */
@Injectable()
export class CacheService {
  private readonly defaultStrategy: string = 'TTL';
  private strategies: Map<string, ICacheStrategy> = new Map();

  constructor(
    @Optional()
    @Inject('CACHE_STRATEGIES')
    strategies?: ICacheStrategy[],
  ) {
    // Register all provided strategies
    if (strategies) {
      strategies.forEach((strategy) => {
        this.strategies.set(strategy.getStrategyName(), strategy);
      });
    }
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @param options Optional cache options
   * @returns Cached value or null if not found
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const strategy = this.getStrategy(options?.strategy);
    return strategy.get<T>(key);
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param options Optional cache options
   * @returns True if successful, false otherwise
   */
  async set<T>(
    key: string,
    value: T,
    options?: CacheOptions,
  ): Promise<boolean> {
    const strategy = this.getStrategy(options?.strategy);
    return strategy.set(key, value, options);
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   * @param options Optional cache options
   * @returns True if deleted, false if key didn't exist
   */
  async delete(key: string, options?: CacheOptions): Promise<boolean> {
    const strategy = this.getStrategy(options?.strategy);
    return strategy.delete(key);
  }

  /**
   * Check if a key exists in cache
   * @param key Cache key
   * @param options Optional cache options
   * @returns True if exists, false otherwise
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    const strategy = this.getStrategy(options?.strategy);
    return strategy.exists(key);
  }

  /**
   * Clear cache entries
   * @param pattern Optional pattern to match keys
   * @param strategyName Optional strategy name, if not provided clears all strategies
   */
  async clear(pattern?: string, strategyName?: string): Promise<void> {
    if (strategyName) {
      const strategy = this.getStrategy(strategyName);
      await strategy.clear(pattern);
    } else {
      // Clear all strategies
      const clearPromises = Array.from(this.strategies.values()).map(
        (strategy) => strategy.clear(pattern),
      );
      await Promise.all(clearPromises);
    }
  }

  /**
   * Get or set pattern (Cache-Aside)
   * If cache miss, executes the factory function and caches the result
   * @param key Cache key
   * @param factory Function to execute on cache miss
   * @param options Optional cache options
   * @returns Cached or newly computed value
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - compute value
    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Invalidate cache by pattern
   * @param pattern Pattern to match keys
   * @param strategyName Optional strategy name
   */
  async invalidate(pattern: string, strategyName?: string): Promise<void> {
    await this.clear(pattern, strategyName);
  }

  /**
   * Get cache key builder utility
   */
  static keyBuilder(): typeof CacheKeyBuilder {
    return CacheKeyBuilder;
  }

  /**
   * Register a new cache strategy
   * @param strategy Strategy to register
   */
  registerStrategy(strategy: ICacheStrategy): void {
    this.strategies.set(strategy.getStrategyName(), strategy);
  }

  /**
   * Get a strategy by name, falls back to default if not found
   * @param strategyName Strategy name
   * @returns Cache strategy instance
   */
  private getStrategy(strategyName?: string): ICacheStrategy {
    const name = strategyName || this.defaultStrategy;
    const strategy = this.strategies.get(name);

    if (!strategy) {
      throw new Error(
        `Cache strategy "${name}" not found. Available strategies: ${Array.from(
          this.strategies.keys(),
        ).join(', ')}`,
      );
    }

    return strategy;
  }
}
