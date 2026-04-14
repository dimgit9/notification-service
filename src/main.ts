import './observability/tracing';

import { NestFactory } from '@nestjs/core';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('rmq.url')],
      queue: configService.getOrThrow<string>('rmq.queue'),
      queueOptions: {
        durable: true,
      },
      noAck: false,
      prefetchCount: 1,
      persistent: true,
    },
  });

  await app.startAllMicroservices();
  await app.listen(9102);
}
bootstrap();
