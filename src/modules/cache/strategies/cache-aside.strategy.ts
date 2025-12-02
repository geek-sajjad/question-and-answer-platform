import { Injectable } from '@nestjs/common';
import { RedisServer } from '../../redis/redis.service';
import {
  ICacheStrategy,
  CacheStrategyOptions,
} from '../interfaces/cache-strategy.interface';

/**
 * Cache-Aside (Lazy Loading) Strategy
 * Application is responsible for loading data into cache
 * Cache is checked first, then data source if miss
 */
@Injectable()
export class CacheAsideStrategy implements ICacheStrategy {
  private readonly defaultTtl: number = 1800; // 30 minutes default

  constructor(private readonly redisService: RedisServer) {}

  getStrategyName(): string {
    return 'CACHE_ASIDE';
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisService.get(key);
      if (!value) {
        return null; // Cache miss - application should load from data source
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[Cache-Aside] Error getting key ${key}:`, error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options?: CacheStrategyOptions,
  ): Promise<boolean> {
    try {
      const ttl = options?.ttl ?? this.defaultTtl;
      const serializedValue = JSON.stringify(value);
      await this.redisService.set(key, serializedValue, ttl);
      return true;
    } catch (error) {
      console.error(`[Cache-Aside] Error setting key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redisService.del(key);
      return result > 0;
    } catch (error) {
      console.error(`[Cache-Aside] Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisService.exists(key);
      return result === 1;
    } catch (error) {
      console.error(
        `[Cache-Aside] Error checking existence of key ${key}:`,
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
        `[Cache-Aside] Error clearing cache with pattern ${pattern}:`,
        error,
      );
      throw error;
    }
  }
}
