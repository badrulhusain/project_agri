import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { setupApplication } from './setup.js';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    process.env.OBSERVE_APP_KEY && process.env.OBSERVE_APP_SECRET
      ? { instrument: ObserveInstrument }
      : {},
  );
  setupApplication(app);
  app.enableShutdownHooks();
  await app.listen(
    app.get(ConfigService).get<number>('PORT', 3001),
    '127.0.0.1',
  );
  console.log(`Backend listening on ${await app.getUrl()}/api`);
}
await bootstrap();
