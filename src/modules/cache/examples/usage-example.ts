/**
 * Example usage of CacheService in a NestJS service
 * This file demonstrates how to use the cache service in your business logic
 */

import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache.service';

// Example: Using cache in a UserService
@Injectable()
export class ExampleUserService {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Example 1: Basic cache usage with getOrSet helper
   */
  async getUserById(id: string) {
    const cacheKey = `user:${id}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // This function is only called on cache miss
        // In real scenario, fetch from database
        // return await this.userRepository.findOne({ where: { id } });
        return { id, name: 'John Doe', email: 'john@example.com' };
      },
      {
        strategy: 'CACHE_ASIDE',
        ttl: 3600, // 1 hour
      },
    );
  }

  /**
   * Example 2: Manual cache get/set
   */
  async getUserByIdManual(id: string) {
    const cacheKey = `user:${id}`;

    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Cache miss - fetch from database
    // const user = await this.userRepository.findOne({ where: { id } });
    const user = { id, name: 'John Doe', email: 'john@example.com' };

    // Store in cache
    await this.cacheService.set(cacheKey, user, {
      strategy: 'TTL',
      ttl: 3600,
    });

    return user;
  }

  /**
   * Example 3: Using CacheKeyBuilder for consistent keys
   */
  async getUserWithKeyBuilder(id: string) {
    const cacheKey = CacheService.keyBuilder().forEntity('user', id);

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Fetch from database
        return { id, name: 'John Doe' };
      },
      { ttl: 1800 },
    );
  }

  /**
   * Example 4: Caching lists with filters
   */
  async getUsersList(page: number, limit: number) {
    const cacheKey = CacheService.keyBuilder().forList('users', {
      page,
      limit,
    });

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Fetch from database with pagination
        // return await this.userRepository.find({ skip, take });
        return [{ id: '1', name: 'User 1' }];
      },
      {
        strategy: 'TTL',
        ttl: 600, // 10 minutes for lists
      },
    );
  }

  /**
   * Example 5: Cache invalidation on update
   */
  async updateUser(id: string, updateData: any) {
    // Update in database
    // await this.userRepository.update(id, updateData);

    // Invalidate cache
    await this.cacheService.delete(`user:${id}`);

    // Optionally invalidate related caches
    await this.cacheService.invalidate('users:list:*');
  }

  /**
   * Example 6: Using different strategies for different use cases
   */
  async getCriticalData(id: string) {
    // Use write-through for critical data
    const key = `critical:${id}`;
    return this.cacheService.getOrSet(
      key,
      async () => {
        // Fetch critical data
        return { id, data: 'critical information' };
      },
      {
        strategy: 'WRITE_THROUGH',
        ttl: 7200, // 2 hours
      },
    );
  }

  /**
   * Example 7: Batch operations
   */
  async getMultipleUsers(ids: string[]) {
    const results = await Promise.all(
      ids.map((id) =>
        this.cacheService.getOrSet(
          `user:${id}`,
          async () => {
            // Fetch from database
            return { id, name: `User ${id}` };
          },
          { ttl: 3600 },
        ),
      ),
    );
    return results;
  }
}
