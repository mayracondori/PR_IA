import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Ignora propiedades que no están en el DTO
    forbidNonWhitelisted: true,  // Lanza error si se pasan propiedades no permitidas
    transform: true,  // Transforma los tipos según el DTO
  }));


  const corsOptions: CorsOptions = {
    origin: ['http://localhost:9000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  };

  app.enableCors(corsOptions);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT') || 3000;
  await app.listen(port);
  console.log(`App running in port ${port}`);
}
bootstrap();
