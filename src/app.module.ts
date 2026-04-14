import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';

import { RmqModule } from './infrastructure/rmq/rmq.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { ObservabilityModule } from './observability/observability.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `.env.${process.env.NODE_ENV}.local`,
        `.env.${process.env.NODE_ENV}`,
        '.env',
      ],
      isGlobal: true,
      load: [configuration],
      expandVariables: true,
    }),
    RmqModule,
    ObservabilityModule,
    NotificationsModule,
    MailModule,
  ],
})
export class AppModule {}
