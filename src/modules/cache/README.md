# Cache Module

A SOLID-compliant caching system built on top of Redis with a flexible strategy pattern.

## Architecture

This cache module follows SOLID principles:

- **Single Responsibility**: Each strategy handles one caching pattern
- **Open/Closed**: Easy to add new strategies without modifying existing code
- **Liskov Substitution**: All strategies implement `ICacheStrategy` interface
- **Interface Segregation**: Clean, focused interface
- **Dependency Inversion**: `CacheService` depends on `ICacheStrategy` abstraction

## Structure

```
cache/
├── interfaces/
│   └── cache-strategy.interface.ts    # Abstract strategy interface
├── strategies/
│   ├── ttl-cache.strategy.ts          # TTL (Time To Live) strategy
│   ├── write-through-cache.strategy.ts # Write-through strategy
│   └── cache-aside.strategy.ts        # Cache-aside (lazy loading) strategy
├── types/
│   └── cache-options.interface.ts     # Type definitions
├── utils/
│   └── cache-key-builder.util.ts      # Utility for building cache keys
├── cache.service.ts                    # Main cache service
└── cache.module.ts                     # NestJS module configuration
```

## Available Strategies

### 1. TTL (Time To Live) Strategy
Automatically expires cache entries after a specified time (default: 1 hour).

```typescript
await cacheService.set('user:123', userData, { 
  strategy: 'TTL', 
  ttl: 3600 // 1 hour
});
```

### 2. Write-Through Strategy
Writes to cache and ensures data is immediately available. Useful for critical data.

```typescript
await cacheService.set('critical:data', data, { 
  strategy: 'WRITE_THROUGH',
  ttl: 7200 
});
```

### 3. Cache-Aside Strategy
Application is responsible for loading data. Cache is checked first, then data source on miss.

```typescript
// Using getOrSet helper
const user = await cacheService.getOrSet(
  'user:123',
  async () => await userRepository.findById('123'),
  { strategy: 'CACHE_ASIDE', ttl: 1800 }
);
```

## Usage Examples

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class UserService {
  constructor(private readonly cacheService: CacheService) {}

  async getUser(id: string) {
    // Try to get from cache first
    const cached = await this.cacheService.get(`user:${id}`);
    if (cached) {
      return cached;
    }

    // Cache miss - load from database
    const user = await this.userRepository.findOne(id);
    
    // Store in cache
    await this.cacheService.set(`user:${id}`, user, { 
      ttl: 3600 
    });

    return user;
  }
}
```

### Using getOrSet Helper

```typescript
async getUser(id: string) {
  return this.cacheService.getOrSet(
    `user:${id}`,
    async () => await this.userRepository.findOne(id),
    { ttl: 3600 }
  );
}
```

### Using Cache Key Builder

```typescript
import { CacheService } from '../cache/cache.service';

// Build consistent cache keys
const userKey = CacheService.keyBuilder().forEntity('user', userId);
const listKey = CacheService.keyBuilder().forList('users', { page: 1, limit: 10 });

await this.cacheService.set(userKey, userData);
await this.cacheService.set(listKey, usersList);
```

### Specifying Strategy

```typescript
// Use specific strategy
await this.cacheService.set('key', value, { 
  strategy: 'TTL',
  ttl: 1800 
});

await this.cacheService.get('key', { strategy: 'CACHE_ASIDE' });
```

### Cache Invalidation

```typescript
// Delete specific key
await this.cacheService.delete('user:123');

// Invalidate by pattern
await this.cacheService.invalidate('user:*');

// Clear all cache
await this.cacheService.clear();
```

## Adding a New Strategy

To add a new caching strategy:

1. Create a new strategy file in `strategies/`:

```typescript
import { Injectable } from '@nestjs/common';
import { RedisServer } from '../../redis/redis.service';
import {
  ICacheStrategy,
  CacheStrategyOptions,
} from '../interfaces/cache-strategy.interface';

@Injectable()
export class MyCustomStrategy implements ICacheStrategy {
  constructor(private readonly redisService: RedisServer) {}

  getStrategyName(): string {
    return 'MY_CUSTOM';
  }

  async get<T>(key: string): Promise<T | null> {
    // Implementation
  }

  async set<T>(key: string, value: T, options?: CacheStrategyOptions): Promise<boolean> {
    // Implementation
  }

  async delete(key: string): Promise<boolean> {
    // Implementation
  }

  async exists(key: string): Promise<boolean> {
    // Implementation
  }

  async clear(pattern?: string): Promise<void> {
    // Implementation
  }
}
```

2. Register it in `cache.module.ts`:

```typescript
import { MyCustomStrategy } from './strategies/my-custom.strategy';

@Module({
  // ...
  providers: [
    // ... existing strategies
    MyCustomStrategy,
    {
      provide: 'CACHE_STRATEGIES',
      useFactory: (
        // ... existing strategies
        myCustomStrategy: MyCustomStrategy,
      ): ICacheStrategy[] => {
        return [
          // ... existing strategies
          myCustomStrategy,
        ];
      },
      inject: [
        // ... existing strategies
        MyCustomStrategy,
      ],
    },
    // ...
  ],
})
export class CacheModule {}
```

That's it! Your new strategy is now available for use.

## Benefits

- **Extensible**: Add new strategies without modifying existing code
- **Testable**: Each strategy can be tested independently
- **Flexible**: Choose the right strategy for each use case
- **Type-safe**: Full TypeScript support
- **SOLID**: Follows all SOLID principles

