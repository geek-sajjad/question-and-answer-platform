# Prometheus Metrics Module

A comprehensive, well-organized metrics collection system for NestJS applications using Prometheus.

## Architecture

The module follows clean architecture principles with separation of concerns:

```
prometheus/
├── interceptors/           # Metric collection interceptors
│   ├── base-metrics.interceptor.ts
│   ├── http-metrics.interceptor.ts
│   ├── database-metrics.interceptor.ts
│   ├── cache-metrics.interceptor.ts
│   └── types/
│       └── metrics.types.ts
├── decorators/            # Custom decorators for metrics
│   ├── database-operation.decorator.ts
│   └── track-cache.decorator.ts
├── services/              # Metric services
│   └── system-metrics.service.ts
├── prometheus.service.ts  # Core metrics registry
├── prometheus.controller.ts
└── prometheus.module.ts
```

## Features

### 1. HTTP Metrics (Automatic)
Automatically tracks all HTTP requests:
- Request duration
- Total requests
- Error rates
- Status codes

**Configuration:**
The HTTP metrics interceptor is registered globally and excludes common routes like `/metrics`, `/health`, and `/favicon.ico`.

### 2. Database Metrics
Track database operations with custom decorator:

```typescript
import { Injectable } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { DatabaseMetricsInterceptor, DatabaseOperation } from '../prometheus';

@Injectable()
export class UsersService {
  @UseInterceptors(DatabaseMetricsInterceptor)
  @DatabaseOperation('find', 'users')
  async findUserById(id: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  @UseInterceptors(DatabaseMetricsInterceptor)
  @DatabaseOperation('save', 'users')
  async createUser(data: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(data);
    return await this.usersRepository.save(user);
  }

  @UseInterceptors(DatabaseMetricsInterceptor)
  @DatabaseOperation('update', 'users')
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, data);
    return await this.findUserById(id);
  }

  @UseInterceptors(DatabaseMetricsInterceptor)
  @DatabaseOperation('delete', 'users')
  async deleteUser(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

### 3. Cache Metrics
Track cache hits and misses:

```typescript
import { Injectable } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { CacheMetricsInterceptor, TrackCache } from '../prometheus';

@Injectable()
export class CacheService {
  @UseInterceptors(CacheMetricsInterceptor)
  @TrackCache('redis', 'user:*')
  async getUserFromCache(userId: string): Promise<User | null> {
    const cached = await this.redis.get(`user:${userId}`);
    return cached ? JSON.parse(cached) : null;
  }

  @UseInterceptors(CacheMetricsInterceptor)
  @TrackCache('redis', 'question:*')
  async getQuestionFromCache(questionId: string): Promise<Question | null> {
    const cached = await this.redis.get(`question:${questionId}`);
    return cached ? JSON.parse(cached) : null;
  }
}
```

### 4. System Metrics (Automatic)
Automatically collects system metrics every 5 seconds:
- Memory usage (heap, RSS, external)
- CPU usage
- Active connections

**Manual Connection Tracking:**

```typescript
import { Injectable } from '@nestjs/common';
import { SystemMetricsService } from '../prometheus';

@Injectable()
export class WebSocketGateway {
  constructor(private readonly systemMetrics: SystemMetricsService) {}

  handleConnection() {
    this.systemMetrics.incrementActiveConnections('websocket');
  }

  handleDisconnect() {
    this.systemMetrics.decrementActiveConnections('websocket');
  }
}
```

## Available Metrics

### HTTP Metrics
- `http_request_duration_seconds` - Histogram of request durations
- `http_requests_total` - Counter of total requests
- `http_request_errors_total` - Counter of request errors

### Database Metrics
- `database_query_duration_seconds` - Histogram of query durations
- `database_queries_total` - Counter of total queries

### Cache Metrics
- `cache_hits_total` - Counter of cache hits
- `cache_misses_total` - Counter of cache misses

### System Metrics
- `active_connections` - Gauge of active connections
- `memory_usage_bytes` - Gauge of memory usage
- `cpu_usage_percent` - Gauge of CPU usage

## Usage in Your Application

### 1. Import the Module

```typescript
import { Module } from '@nestjs/common';
import { PrometheusModule } from './modules/prometheus/prometheus.module';

@Module({
  imports: [
    PrometheusModule, // HTTP metrics are now automatic
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. Use in Services

```typescript
import { Injectable, UseInterceptors } from '@nestjs/common';
import {
  DatabaseMetricsInterceptor,
  DatabaseOperation,
  CacheMetricsInterceptor,
  TrackCache,
} from './modules/prometheus';

@Injectable()
export class QuestionsService {
  // Database operations
  @UseInterceptors(DatabaseMetricsInterceptor)
  @DatabaseOperation('find', 'questions')
  async findAll(): Promise<Question[]> {
    return await this.questionsRepository.find();
  }

  @UseInterceptors(DatabaseMetricsInterceptor)
  @DatabaseOperation('findOne', 'questions')
  async findOne(id: string): Promise<Question> {
    // Check cache first
    const cached = await this.getFromCache(id);
    if (cached) return cached;

    const question = await this.questionsRepository.findOne({ where: { id } });
    await this.setCache(id, question);
    return question;
  }

  // Cache operations
  @UseInterceptors(CacheMetricsInterceptor)
  @TrackCache('redis', 'question:*')
  private async getFromCache(id: string): Promise<Question | null> {
    const cached = await this.redis.get(`question:${id}`);
    return cached ? JSON.parse(cached) : null;
  }
}
```

### 3. Access Metrics

Metrics are exposed at `/metrics` endpoint in Prometheus format:

```bash
curl http://localhost:3000/metrics
```

## Configuration

### Custom HTTP Metrics Configuration

You can customize the HTTP metrics interceptor behavior:

```typescript
import { HttpMetricsInterceptor } from './modules/prometheus';

const customInterceptor = new HttpMetricsInterceptor(prometheusService);
// Custom configuration is done in the constructor
```

### Excluded Routes

By default, these routes are excluded from HTTP metrics:
- `/metrics`
- `/health`
- `/favicon.ico`

## Best Practices

1. **Use Decorators**: Always use `@DatabaseOperation` and `@TrackCache` decorators for better metric organization
2. **Meaningful Labels**: Use descriptive operation names and table names
3. **Cache Patterns**: Use consistent key patterns for cache metrics (e.g., `user:*`, `question:*`)
4. **Connection Tracking**: Track WebSocket, database, and other connections manually
5. **Error Handling**: All interceptors handle errors gracefully and record error metrics

## Grafana Integration

The metrics can be visualized in Grafana using the provided dashboards:
- `monitoring/grafana/dashboards/application-metrics.json`
- `monitoring/grafana/dashboards/database-metrics.json`

## Example Queries

### HTTP Request Rate
```promql
rate(http_requests_total[5m])
```

### Average Request Duration
```promql
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

### Database Query Duration (p95)
```promql
histogram_quantile(0.95, rate(database_query_duration_seconds_bucket[5m]))
```

### Cache Hit Rate
```promql
sum(rate(cache_hits_total[5m])) / (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))
```

## Architecture Benefits

1. **Separation of Concerns**: Each interceptor handles a specific type of metric
2. **Reusability**: Base interceptor provides common functionality
3. **Type Safety**: TypeScript types for all metric data
4. **Clean Code**: Decorators make metric collection declarative
5. **Maintainability**: Easy to add new metrics or modify existing ones
6. **Performance**: Metrics collection has minimal overhead
7. **Flexibility**: Can enable/disable specific metrics easily

## Troubleshooting

### Metrics Not Appearing

1. Check if the module is imported in `AppModule`
2. Verify decorators are applied correctly
3. Check Prometheus scrape configuration
4. Ensure `/metrics` endpoint is accessible

### High Cardinality

Avoid high-cardinality labels (e.g., user IDs, timestamps). Use patterns instead:
- ❌ Bad: `user:12345`
- ✅ Good: `user:*`

### Performance Impact

The metrics collection is designed to be lightweight, but if you notice performance issues:
1. Use sampling for high-traffic endpoints
2. Reduce metric collection frequency
3. Disable specific metrics if not needed

