import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, '');
  const configuredOrigins =
    process.env.CORS_ORIGINS?.split(',').map(normalizeOrigin).filter(Boolean) ??
    [];
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
    'http://localhost:19006',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:19006',
    'https://greengo.up.railway.app',
    'https://green-go-admin.vercel.app',
    ...configuredOrigins,
  ];
  const allowedOriginPatterns = [
    /^https:\/\/green-go-admin(?:-[a-z0-9-]+)?\.vercel\.app$/i,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = normalizeOrigin(origin);

      // Check if origin is in allowed list
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        allowedOriginPatterns.some((pattern) => pattern.test(normalizedOrigin))
      ) {
        callback(null, true);
      } else {
        // Log for debugging
        console.log(`⚠️ CORS blocked origin: ${normalizedOrigin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
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
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  });

  // Global validation pipe
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

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  // Listen on 0.0.0.0 to accept connections from all network interfaces (mobile devices)
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 GreenGo Backend is running on: http://localhost:${port}/api`);
  console.log(`🌐 Network accessible at: http://0.0.0.0:${port}/api`);
  console.log(
    `📱 Make sure your device is on the same network and use your computer's IP address`,
  );
}

bootstrap();
