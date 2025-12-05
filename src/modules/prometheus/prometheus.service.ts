import { Injectable } from '@nestjs/common';
import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly registry: Registry;
  public readonly httpRequestDuration: Histogram<string>;
  public readonly httpRequestTotal: Counter<string>;
  public readonly httpRequestErrors: Counter<string>;
  public readonly databaseQueryDuration: Histogram<string>;
  public readonly databaseQueryTotal: Counter<string>;
  public readonly cacheHitTotal: Counter<string>;
  public readonly cacheMissTotal: Counter<string>;
  public readonly activeConnections: Gauge<string>;
  public readonly memoryUsage: Gauge<string>;
  public readonly cpuUsage: Gauge<string>;

  constructor() {
    this.registry = new Registry();
    this.registry.setDefaultLabels({ app: 'question-answer-platform' });

    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ register: this.registry });

    // HTTP Metrics
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    // Database Metrics
    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.databaseQueryTotal = new Counter({
      name: 'database_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table', 'status'],
      registers: [this.registry],
    });

    // Cache Metrics
    this.cacheHitTotal = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type', 'key_pattern'],
      registers: [this.registry],
    });

    this.cacheMissTotal = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type', 'key_pattern'],
      registers: [this.registry],
    });

    // System Metrics
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.memoryUsage = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.cpuUsage = new Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage',
      registers: [this.registry],
    });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getRegistry(): Registry {
    return this.registry;
  }
}
