import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { redisStore } from 'cache-manager-redis-store';

// Core modules
import { AuthModule } from './auth/auth.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { PlansModule } from './plans/plans.module';
import { AccountsModule } from './accounts/accounts.module';
import { BillingModule } from './billing/billing.module';
import { CarrierModule } from './carrier/carrier.module';
import { AiModule } from './ai/ai.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';

// Common modules
import { DatabaseModule } from './common/database/database.module';
import { LoggerModule } from './common/logger/logger.module';

// Configuration
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    // Caching
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        if (redisUrl) {
          return {
            store: redisStore,
            url: redisUrl,
            ttl: configService.get('REDIS_TTL', 3600),
          };
        }
        return {
          ttl: configService.get('CACHE_TTL', 300),
        };
      },
    }),

    // Background jobs
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('RATE_LIMIT_WINDOW_MS', 900000),
        limit: configService.get('RATE_LIMIT_MAX_REQUESTS', 100),
      }),
    }),

    // Event system
    EventEmitterModule.forRoot(),

    // Common modules
    DatabaseModule,
    LoggerModule,

    // Feature modules
    AuthModule,
    UsersModule,
    SubscribersModule,
    PlansModule,
    AccountsModule,
    BillingModule,
    CarrierModule,
    AiModule,
    AuditModule,
  ],
})
export class AppModule {} 