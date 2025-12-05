# Monitoring Setup - Quick Start Guide

## Overview

A comprehensive monitoring and observability stack has been set up for your NestJS PostgreSQL application using:

- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards  
- **PostgreSQL Exporter** - Database metrics
- **Redis Exporter** - Cache metrics

## Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   pnpm install
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Access the services**:
   - **Grafana**: http://localhost:3001 (admin/admin)
   - **Prometheus**: http://localhost:9090
   - **Application Metrics**: http://localhost:3000/api/metrics
   - **PostgreSQL Exporter**: http://localhost:9187/metrics
   - **Redis Exporter**: http://localhost:9121/metrics

## What's Included

### Application Metrics
- HTTP request rate, duration, and error rates
- Database query performance
- Cache hit/miss rates
- System metrics (CPU, memory, event loop)

### Pre-configured Dashboards
1. **Application Metrics** - HTTP requests, errors, latency
2. **Database Metrics** - PostgreSQL performance
3. **Cache Metrics** - Redis performance and hit rates
4. **System Metrics** - CPU, memory, Node.js metrics

### Automatic Instrumentation
- All HTTP requests are automatically tracked
- Request duration, status codes, and errors are recorded
- Ready for custom business metrics

## Files Created

```
monitoring/
├── prometheus/
│   └── prometheus.yml          # Prometheus configuration
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── prometheus.yml  # Grafana datasource config
│   │   └── dashboards/
│   │       └── default.yml     # Dashboard provisioning
│   └── dashboards/
│       ├── application-metrics.json
│       ├── database-metrics.json
│       ├── cache-metrics.json
│       └── system-metrics.json
└── README.md                    # Detailed documentation

src/modules/prometheus/
├── prometheus.service.ts        # Metrics service
├── prometheus.controller.ts     # Metrics endpoint
├── prometheus.module.ts         # NestJS module
└── interceptors/
    └── metrics.interceptor.ts   # HTTP metrics interceptor
```

## Environment Variables (Optional)

Add to `.env`:
```env
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin
```

## Next Steps

1. **Verify metrics collection**:
   - Check Prometheus targets: http://localhost:9090/targets
   - View application metrics: http://localhost:3000/api/metrics

2. **Explore dashboards**:
   - Login to Grafana
   - Navigate to Dashboards
   - All 4 dashboards should be available

3. **Add custom metrics** (see `monitoring/README.md` for examples)

4. **Set up alerts** (optional):
   - Configure alert rules in Prometheus
   - Set up Alertmanager for notifications

## Troubleshooting

- **Metrics not appearing**: Check if application is running and accessible
- **Grafana login issues**: Verify credentials in docker-compose.yml
- **Exporters not working**: Check logs with `docker-compose logs <service-name>`

For detailed documentation, see `monitoring/README.md`.



