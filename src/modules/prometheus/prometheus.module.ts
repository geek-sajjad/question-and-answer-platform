import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusService } from './prometheus.service';
import { PrometheusController } from './prometheus.controller';
import { HttpMetricsInterceptor } from './interceptors/http-metrics.interceptor';
import { DatabaseMetricsInterceptor } from './interceptors/database-metrics.interceptor';
import { CacheMetricsInterceptor } from './interceptors/cache-metrics.interceptor';
import { SystemMetricsService } from './services/system-metrics.service';

@Global()
@Module({
  providers: [
    PrometheusService,
    SystemMetricsService,
    HttpMetricsInterceptor,
    DatabaseMetricsInterceptor,
    CacheMetricsInterceptor,
    // Register HTTP metrics interceptor globally
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
  controllers: [PrometheusController],
  exports: [
    PrometheusService,
    SystemMetricsService,
    HttpMetricsInterceptor,
    DatabaseMetricsInterceptor,
    CacheMetricsInterceptor,
  ],
})
export class PrometheusModule {}
