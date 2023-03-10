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
    origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost' , 'http://138.197.58.229:80', 'http://138.197.58.229'],
    credentials: true // the cookie will be stored in the frontend

  });
  await app.listen(process.env.PORT || 80);
}
bootstrap();
