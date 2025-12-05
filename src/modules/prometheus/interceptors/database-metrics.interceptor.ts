import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PrometheusService } from '../prometheus.service';

/**
 * Database Metrics Interceptor
 *
 * This interceptor is designed to be used with custom decorators on repository methods
 * or service methods that perform database operations.
 *
 * Usage:
 * @UseInterceptors(DatabaseMetricsInterceptor)
 * @DatabaseOperation('find', 'users')
 * async findUser(id: string) { ... }
 */
@Injectable()
export class DatabaseMetricsInterceptor implements NestInterceptor {
  constructor(private readonly prometheusService: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get metadata from custom decorator
    const operation =
      (Reflect.getMetadata('db:operation', context.getHandler()) as string) ||
      'unknown';
    const table =
      (Reflect.getMetadata('db:table', context.getHandler()) as string) ||
      'unknown';

    // Skip if no metadata (not a database operation)
    if (operation === 'unknown' && table === 'unknown') {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000;
        this.recordDatabaseMetrics(operation, table, 'success', duration);
      }),
      catchError((error: Error) => {
        const duration = (Date.now() - startTime) / 1000;
        this.recordDatabaseMetrics(operation, table, 'error', duration);
        return throwError(() => error);
      }),
    );
  }

  private recordDatabaseMetrics(
    operation: string,
    table: string,
    status: 'success' | 'error',
    duration: number,
  ): void {
    // Record query duration
    this.prometheusService.databaseQueryDuration
      .labels(operation, table)
      .observe(duration);

    // Record total queries
    this.prometheusService.databaseQueryTotal
      .labels(operation, table, status)
      .inc();
  }
}
