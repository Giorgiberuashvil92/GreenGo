import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for mobile app
  app.enableCors({
    origin: true, // In production, specify exact origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Allow extra fields for now
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
  console.log(`📱 Make sure your device is on the same network and use your computer's IP address`);
}

bootstrap();
