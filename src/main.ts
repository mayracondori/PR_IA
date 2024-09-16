import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors(); // Habilitar CORS

  const port =
    process.env.PORT || configService.get<number>('APP_PORT') || 3000;

  await app.listen(port);
  console.log(`App running on port ${port}`);
}
bootstrap();
