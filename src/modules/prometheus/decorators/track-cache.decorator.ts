import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark a method for cache metrics tracking
 *
 * @param cacheType - The type of cache (redis, memory, etc.)
 * @param keyPattern - The pattern or prefix of the cache key
 *
 * @example
 * @TrackCache('redis', 'user:*')
 * async getUserFromCache(userId: string) { ... }
 *
 * @example
 * @TrackCache('memory', 'question:*')
 * async getQuestionFromCache(questionId: string) { ... }
 */
export const TrackCache = (cacheType: string, keyPattern: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('cache:type', cacheType)(target, propertyKey, descriptor);
    SetMetadata('cache:pattern', keyPattern)(target, propertyKey, descriptor);
    return descriptor;
  };
};
