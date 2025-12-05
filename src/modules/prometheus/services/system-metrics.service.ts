import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrometheusService } from '../prometheus.service';
import * as os from 'os';

/**
 * System Metrics Service
 *
 * Periodically collects and updates system-level metrics like:
 * - Memory usage (heap, RSS, external)
 * - CPU usage
 * - Active connections (HTTP, database, etc.)
 */
@Injectable()
export class SystemMetricsService implements OnModuleInit, OnModuleDestroy {
  private metricsInterval: NodeJS.Timeout;
  private readonly updateIntervalMs = 5000; // Update every 5 seconds
  private previousCpuUsage = process.cpuUsage();
  private previousTime = Date.now();

  constructor(private readonly prometheusService: PrometheusService) {}

  onModuleInit() {
    // Start collecting system metrics periodically
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, this.updateIntervalMs);

    // Collect immediately on startup
    this.collectSystemMetrics();
  }

  onModuleDestroy() {
    // Clean up interval on shutdown
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  private collectSystemMetrics(): void {
    this.collectMemoryMetrics();
    this.collectCpuMetrics();
  }

  private collectMemoryMetrics(): void {
    const memoryUsage = process.memoryUsage();

    // Heap used
    this.prometheusService.memoryUsage
      .labels('heap_used')
      .set(memoryUsage.heapUsed);

    // Heap total
    this.prometheusService.memoryUsage
      .labels('heap_total')
      .set(memoryUsage.heapTotal);

    // RSS (Resident Set Size)
    this.prometheusService.memoryUsage.labels('rss').set(memoryUsage.rss);

    // External memory
    this.prometheusService.memoryUsage
      .labels('external')
      .set(memoryUsage.external);

    // Array buffers
    if (memoryUsage.arrayBuffers) {
      this.prometheusService.memoryUsage
        .labels('array_buffers')
        .set(memoryUsage.arrayBuffers);
    }
  }

  private collectCpuMetrics(): void {
    const currentCpuUsage = process.cpuUsage();
    const currentTime = Date.now();

    // Calculate CPU usage percentage
    const timeDiff = currentTime - this.previousTime;
    const userDiff = currentCpuUsage.user - this.previousCpuUsage.user;
    const systemDiff = currentCpuUsage.system - this.previousCpuUsage.system;

    // Convert microseconds to milliseconds and calculate percentage
    const cpuPercent = ((userDiff + systemDiff) / 1000 / timeDiff) * 100;

    this.prometheusService.cpuUsage.set(cpuPercent);

    // Update for next calculation
    this.previousCpuUsage = currentCpuUsage;
    this.previousTime = currentTime;
  }

  /**
   * Manually track active connections
   * This should be called by connection managers (e.g., database, WebSocket)
   */
  setActiveConnections(type: string, count: number): void {
    this.prometheusService.activeConnections.labels(type).set(count);
  }

  /**
   * Increment active connections
   */
  incrementActiveConnections(type: string): void {
    this.prometheusService.activeConnections.labels(type).inc();
  }

  /**
   * Decrement active connections
   */
  decrementActiveConnections(type: string): void {
    this.prometheusService.activeConnections.labels(type).dec();
  }

  /**
   * Get current system metrics snapshot
   */
  getSystemSnapshot() {
    return {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg(),
    };
  }
}
