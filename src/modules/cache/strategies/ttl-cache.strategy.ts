import { Injectable } from '@nestjs/common';
import { RedisServer } from '../../redis/redis.service';
import {
  ICacheStrategy,
  CacheStrategyOptions,
} from '../interfaces/cache-strategy.interface';

/**
 * TTL (Time To Live) Cache Strategy
 * Automatically expires cache entries after a specified time
 */
@Injectable()
export class TtlCacheStrategy implements ICacheStrategy {
  private readonly defaultTtl: number = 3600; // 1 hour default

  constructor(private readonly redisService: RedisServer) {}

  getStrategyName(): string {
    return 'TTL';
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisService.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[TTL Cache] Error getting key ${key}:`, error);
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
      console.error(`[TTL Cache] Error setting key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redisService.del(key);
      return result > 0;
    } catch (error) {
      console.error(`[TTL Cache] Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisService.exists(key);
      return result === 1;
    } catch (error) {
      console.error(
        `[TTL Cache] Error checking existence of key ${key}:`,
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
        `[TTL Cache] Error clearing cache with pattern ${pattern}:`,
        error,
      );
      throw error;
    }
  }
}
