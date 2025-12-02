import { Module, Global } from '@nestjs/common';
import { RedisServer } from './redis.service';

/**
 * Redis Module
 * Global module that provides RedisServer to the entire application
 */
@Global()
@Module({
  providers: [RedisServer],
  exports: [RedisServer],
})
export class RedisModule {}

