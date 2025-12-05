import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { MetricsConfig } from './types/metrics.types';

@Injectable()
export abstract class BaseMetricsInterceptor implements NestInterceptor {
  protected readonly config: MetricsConfig;

  constructor(config?: Partial<MetricsConfig>) {
    this.config = {
      enabled: true,
      excludedRoutes: [],
      excludedMethods: [],
      sampleRate: 1.0,
      ...config,
    };
  }

  abstract intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any>;

  protected shouldCollectMetrics(method: string, route: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    if (this.config.excludedRoutes?.includes(route)) {
      return false;
    }

    if (this.config.excludedMethods?.includes(method)) {
      return false;
    }

    if (this.config.sampleRate && this.config.sampleRate < 1.0) {
      return Math.random() < this.config.sampleRate;
    }

    return true;
  }

  protected sanitizeRoutePath(path: string): string {
    // Remove query parameters and normalize route
    return path.split('?')[0].replace(/\/+$/, '') || '/';
  }

  protected getRouteFromContext(context: ExecutionContext): string {
    const request = context
      .switchToHttp()
      .getRequest<{ route?: { path?: string }; url: string }>();
    return request.route?.path || this.sanitizeRoutePath(request.url);
  }

  protected getMethodFromContext(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest<{ method: string }>();
    return request.method;
  }
}
