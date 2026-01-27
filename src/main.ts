import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Application entrypoint. Default port: 3000 (or PORT env var).
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();
