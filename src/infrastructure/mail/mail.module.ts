import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { getMailerConfig } from '@/config/factories';

import { MailService } from './mail.service';
import { TemplateService } from './template.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: getMailerConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [MailService, TemplateService],
  exports: [MailService],
})
export class MailModule {}
