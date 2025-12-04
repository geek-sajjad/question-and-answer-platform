import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const configRedis = (configService: ConfigService): Redis => {
  const redisUrl = configService.get<string>('REDIS_URL')  || 'localhost:6379';
  return new Redis(redisUrl);
};
