import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { configRedis } from './redis.config';

@Injectable()
export class RedisServer implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger: Logger = new Logger(RedisServer.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    // Connection is already established in constructor
    // You can add connection event listeners here if needed
    this.client = configRedis(this.configService);
    this.client.on('connect', () => {
      this.logger.debug('Redis client is connected');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  /**
   * Get the Redis client instance
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Get a value by key
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Set a key-value pair
   */
  async set(key: string, value: string, expirySeconds?: number): Promise<'OK'> {
    if (expirySeconds) {
      return this.client.set(key, value, 'EX', expirySeconds);
    }
    return this.client.set(key, value);
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  /**
   * Increment a key's value
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Decrement a key's value
   */
  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  /**
   * Increment by a specific amount
   */
  async incrby(key: string, increment: number): Promise<number> {
    return this.client.incrby(key, increment);
  }

  /**
   * Get multiple keys
   */
  async mget(...keys: string[]): Promise<(string | null)[]> {
    return this.client.mget(...keys);
  }

  /**
   * Set multiple key-value pairs
   */
  async mset(keyValuePairs: Record<string, string>): Promise<'OK'> {
    const args: string[] = [];
    for (const [key, value] of Object.entries(keyValuePairs)) {
      args.push(key, value);
    }
    return this.client.mset(...args);
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  /**
   * Set a key-value pair only if the key doesn't exist (NX)
   */
  async setnx(key: string, value: string): Promise<number> {
    return this.client.setnx(key, value);
  }

  /**
   * Get and set a value atomically
   */
  async getset(key: string, value: string): Promise<string | null> {
    return this.client.getset(key, value);
  }

  /**
   * Hash operations - Set field in hash
   */
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value);
  }

  /**
   * Hash operations - Get field from hash
   */
  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  /**
   * Hash operations - Get all fields and values from hash
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  /**
   * Hash operations - Delete field from hash
   */
  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.client.hdel(key, ...fields);
  }

  /**
   * List operations - Push to left
   */
  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.client.lpush(key, ...values);
  }

  /**
   * List operations - Push to right
   */
  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.client.rpush(key, ...values);
  }

  /**
   * List operations - Pop from left
   */
  async lpop(key: string): Promise<string | null> {
    return this.client.lpop(key);
  }

  /**
   * List operations - Pop from right
   */
  async rpop(key: string): Promise<string | null> {
    return this.client.rpop(key);
  }

  /**
   * List operations - Get range of elements
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lrange(key, start, stop);
  }
}
