import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.enableCors({
    origin: ['htttp://localhost:4200', 'https://localhost:4300', 'https://localhost:5000'],
    credentials: true // the cookie will be stored in the frontend

  });
  await app.listen(3000);
}
bootstrap();
