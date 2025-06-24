import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { createLogger } from './common/logger/winston.config';

async function bootstrap() {
  // Create logger instance
  const logger = createLogger();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: logger,
    }),
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3000);
  const nodeEnv = configService.get('NODE_ENV', 'development');

  // Security middlewares
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', 'http://localhost:3001').split(','),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation setup
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Wingtel MVNO Platform API')
      .setDescription('AI-enhanced MVNO operations platform API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Subscribers', 'Subscriber management operations')
      .addTag('Plans', 'Plan catalog management')
      .addTag('Accounts', 'Account and organization management')
      .addTag('Billing', 'Billing and payment operations')
      .addTag('AI', 'AI-powered features and analytics')
      .addTag('Carrier', 'Carrier integration endpoints')
      .addTag('Health', 'System health and monitoring')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  await app.listen(port);
  logger.info(`🚀 Wingtel MVNO Platform API running on port ${port}`);
  
  if (nodeEnv !== 'production') {
    logger.info(`📖 API Documentation available at http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
}); 