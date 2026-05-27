import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT) || 3001;
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';

  // CORS: ლოკალური და production frontend-ებისთვის (origin: true + credentials)
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'Referer',
      'User-Agent',
    ],
    exposedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        console.error('❌ Validation errors:', JSON.stringify(errors, null, 2));
        return errors[0];
      },
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(port, '0.0.0.0');

  const localUrl = `http://localhost:${port}/api`;
  console.log(`🚀 GreenGo Backend [${nodeEnv}] on port ${port}`);
  console.log(`📡 Local API:  ${localUrl}`);
  if (!isProduction) {
    console.log(`💡 Admin (dev): NEXT_PUBLIC_API_URL=${localUrl}`);
    console.log(`💡 Production API: set NEXT_PUBLIC_API_MODE=production in admin .env.local`);
  }
}

bootstrap();
