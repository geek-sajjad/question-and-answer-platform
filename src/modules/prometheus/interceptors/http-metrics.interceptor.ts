import {
  Injectable,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { PrometheusService } from '../prometheus.service';
import { BaseMetricsInterceptor } from './base-metrics.interceptor';
import { HttpMetricsData } from './types/metrics.types';

@Injectable()
export class HttpMetricsInterceptor extends BaseMetricsInterceptor {
  constructor(private readonly prometheusService: PrometheusService) {
    super({
      enabled: true,
      excludedRoutes: ['/metrics', '/health', '/favicon.ico'],
      excludedMethods: [],
      sampleRate: 1.0,
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode?: number }>();

    const method = this.getMethodFromContext(context);
    const route = this.getRouteFromContext(context);

    // Skip metrics collection if configured
    if (!this.shouldCollectMetrics(method, route)) {
      return next.handle();
    }

    const startTime = Date.now();
    let statusCode: number = HttpStatus.OK;
    let hasError = false;

    return next.handle().pipe(
      tap(() => {
        statusCode = response.statusCode || HttpStatus.OK;
      }),
      catchError((error) => {
        hasError = true;
        statusCode =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        // Record error metrics immediately
        this.recordErrorMetrics(method, route, statusCode);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return throwError(() => error);
      }),
      finalize(() => {
        const duration = (Date.now() - startTime) / 1000;

        // Record metrics in finalize to ensure they're always recorded
        if (!hasError) {
          this.recordSuccessMetrics(method, route, statusCode, duration);
        } else {
          // Just record duration and total for errors (error counter already recorded)
          this.recordErrorDuration(method, route, statusCode, duration);
        }
      }),
    );
  }

  private recordSuccessMetrics(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    const statusCodeStr = statusCode.toString();

    // Record request duration
    this.prometheusService.httpRequestDuration
      .labels(method, route, statusCodeStr)
      .observe(duration);

    // Record total requests
    this.prometheusService.httpRequestTotal
      .labels(method, route, statusCodeStr)
      .inc();

    // Record errors if status code is 4xx or 5xx
    if (statusCode >= 400) {
      this.prometheusService.httpRequestErrors
        .labels(method, route, statusCodeStr)
        .inc();
    }
  }

  private recordErrorMetrics(
    method: string,
    route: string,
    statusCode: number,
  ): void {
    const statusCodeStr = statusCode.toString();

    // Record error count immediately
    this.prometheusService.httpRequestErrors
      .labels(method, route, statusCodeStr)
      .inc();
  }

  private recordErrorDuration(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    const statusCodeStr = statusCode.toString();

    // Record request duration
    this.prometheusService.httpRequestDuration
      .labels(method, route, statusCodeStr)
      .observe(duration);

    // Record total requests
    this.prometheusService.httpRequestTotal
      .labels(method, route, statusCodeStr)
      .inc();
  }

  private createMetricsData(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
    error?: Error,
  ): HttpMetricsData {
    return {
      method,
      route,
      statusCode,
      duration,
      error,
    };
  }
}
