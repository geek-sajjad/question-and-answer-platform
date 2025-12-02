import { Injectable } from '@nestjs/common';
import { RedisServer } from '../../redis/redis.service';
import {
  ICacheStrategy,
  CacheStrategyOptions,
} from '../interfaces/cache-strategy.interface';

/**
 * Write-Through Cache Strategy
 * Writes to cache and persists data immediately
 * Useful for critical data that must always be in sync
 */
@Injectable()
export class WriteThroughCacheStrategy implements ICacheStrategy {
  constructor(private readonly redisService: RedisServer) {}

  getStrategyName(): string {
    return 'WRITE_THROUGH';
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisService.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[Write-Through Cache] Error getting key ${key}:`, error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options?: CacheStrategyOptions,
  ): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);

      // Write to cache with optional TTL
      if (options?.ttl) {
        await this.redisService.set(key, serializedValue, options.ttl);
      } else {
        await this.redisService.set(key, serializedValue);
      }

      // In a real write-through scenario, you would also persist to database here
      // This is handled by the service layer, but the strategy ensures cache is updated

      return true;
    } catch (error) {
      console.error(`[Write-Through Cache] Error setting key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redisService.del(key);
      return result > 0;
    } catch (error) {
      console.error(`[Write-Through Cache] Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisService.exists(key);
      return result === 1;
    } catch (error) {
      console.error(
        `[Write-Through Cache] Error checking existence of key ${key}:`,
        error,
      );
      return false;
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      const searchPattern = pattern || '*';
      const keys = await this.redisService.keys(searchPattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => this.redisService.del(key)));
      }
    } catch (error) {
      console.error(
        `[Write-Through Cache] Error clearing cache with pattern ${pattern}:`,
        error,
      );
      throw error;
    }
  }
}
