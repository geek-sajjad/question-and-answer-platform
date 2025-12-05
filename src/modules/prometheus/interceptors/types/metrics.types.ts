export interface HttpMetricsData {
  method: string;
  route: string;
  statusCode: number;
  duration: number;
  error?: Error;
}

export interface DatabaseMetricsData {
  operation: string;
  table: string;
  duration: number;
  status: 'success' | 'error';
  error?: Error;
}

export interface CacheMetricsData {
  cacheType: string;
  keyPattern: string;
  isHit: boolean;
}

export enum MetricType {
  HTTP = 'http',
  DATABASE = 'database',
  CACHE = 'cache',
  SYSTEM = 'system',
}

export interface MetricsConfig {
  enabled: boolean;
  excludedRoutes?: string[];
  excludedMethods?: string[];
  sampleRate?: number;
}
