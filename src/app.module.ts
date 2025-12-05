import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TagModule } from './modules/tag/tag.module';
import { QuestionModule } from './modules/question/question.module';
import { Question } from './modules/question/entities/question.entity';
import { Answer } from './modules/answer/entities/answer.entity';
import { Tag } from './modules/tag/entities/tag.entity';
import { Vote } from './modules/vote/entities/vote.entity';
import { VoteModule } from './modules/vote/vote.module';
import { AnswerModule } from './modules/answer/answer.module';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/entities/user.entity';
import { CacheModule } from './modules/cache/cache.module';
import { RedisModule } from './modules/redis/redis.module';
import { PrometheusModule } from './modules/prometheus/prometheus.module';
import { MetricsInterceptor } from './modules/prometheus/interceptors/metrics.interceptor';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'default',
    //     ttl: 60000,
    //     limit: 10,
    //   },
    // ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Path to .env file
    }),
    RedisModule,
    CacheModule,
    PrometheusModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'myapp'),
        entities: [Question, Answer, Tag, Vote, User],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TagModule,
    QuestionModule,
    VoteModule,
    AnswerModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
