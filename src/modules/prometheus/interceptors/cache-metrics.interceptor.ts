import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusService } from '../prometheus.service';

/**
 * Cache Metrics Interceptor
 *
 * This interceptor tracks cache hits and misses for methods decorated with @TrackCache
 *
 * Usage:
 * @UseInterceptors(CacheMetricsInterceptor)
 * @TrackCache('redis', 'user:*')
 * async getUserFromCache(userId: string): Promise<User | null> {
 *   const cached = await this.redis.get(`user:${userId}`);
 *   return cached ? JSON.parse(cached) : null;
 * }
 *
 * The interceptor determines hit/miss based on whether the method returns a truthy value
 */
@Injectable()
export class CacheMetricsInterceptor implements NestInterceptor {
  constructor(private readonly prometheusService: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get metadata from custom decorator
    const cacheType =
      (Reflect.getMetadata('cache:type', context.getHandler()) as string) ||
      'unknown';
    const keyPattern =
      (Reflect.getMetadata('cache:pattern', context.getHandler()) as string) ||
      'unknown';

    // Skip if no metadata (not a cache operation)
    if (cacheType === 'unknown' && keyPattern === 'unknown') {
      return next.handle();
    }

    return next.handle().pipe(
      tap((result: unknown) => {
        // Determine if it's a cache hit or miss based on the result
        const isHit = this.isCacheHit(result);
        this.recordCacheMetrics(cacheType, keyPattern, isHit);
      }),
    );
  }

  private isCacheHit(result: unknown): boolean {
    // Consider it a hit if result is truthy (not null, undefined, false, or empty)
    if (result === null || result === undefined) {
      return false;
    }

    // For arrays, check if not empty
    if (Array.isArray(result)) {
      return result.length > 0;
    }

    // For objects, check if not an empty object
    if (typeof result === 'object') {
      return Object.keys(result).length > 0;
    }

    // For primitives, check truthiness
    return Boolean(result);
  }

  private recordCacheMetrics(
    cacheType: string,
    keyPattern: string,
    isHit: boolean,
  ): void {
    if (isHit) {
      this.prometheusService.cacheHitTotal.labels(cacheType, keyPattern).inc();
    } else {
      this.prometheusService.cacheMissTotal.labels(cacheType, keyPattern).inc();
    }
  }
}
