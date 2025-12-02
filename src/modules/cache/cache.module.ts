import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisModule } from '../redis/redis.module';
import { TtlCacheStrategy } from './strategies/ttl-cache.strategy';
import { WriteThroughCacheStrategy } from './strategies/write-through-cache.strategy';
import { CacheAsideStrategy } from './strategies/cache-aside.strategy';
import { ICacheStrategy } from './interfaces/cache-strategy.interface';

/**
 * Cache Module
 * Global module that provides cache service with multiple strategy implementations
 * Follows SOLID principles:
 * - Single Responsibility: Each strategy handles one caching pattern
 * - Open/Closed: Easy to add new strategies without modifying existing code
 * - Liskov Substitution: All strategies implement ICacheStrategy interface
 * - Interface Segregation: Clean, focused interface
 * - Dependency Inversion: CacheService depends on ICacheStrategy abstraction
 */
@Global()
@Module({
  imports: [RedisModule],
  providers: [
    // Cache strategies
    TtlCacheStrategy,
    WriteThroughCacheStrategy,
    CacheAsideStrategy,
    // Provide all strategies as an array for injection
    {
      provide: 'CACHE_STRATEGIES',
      useFactory: (
        ttlStrategy: TtlCacheStrategy,
        writeThroughStrategy: WriteThroughCacheStrategy,
        cacheAsideStrategy: CacheAsideStrategy,
      ): ICacheStrategy[] => {
        return [ttlStrategy, writeThroughStrategy, cacheAsideStrategy];
      },
      inject: [TtlCacheStrategy, WriteThroughCacheStrategy, CacheAsideStrategy],
    },
    // Cache service
    CacheService,
  ],
  exports: [CacheService],
})
export class CacheModule {}
