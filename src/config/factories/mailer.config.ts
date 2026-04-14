import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export function getMailerConfig(configService: ConfigService): MailerOptions {
  return {
    transport: {
      host: configService.getOrThrow<string>('smtp.host'),
      port: configService.getOrThrow<number>('smtp.port'),
      auth: {
        user: configService.getOrThrow<string>('smtp.username'),
        pass: configService.getOrThrow<string>('smtp.password'),
      },
      secure: configService.getOrThrow<boolean>('smtp.secure'),
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    },
    defaults: {
      from: `"Dimgit" ${configService.getOrThrow<string>('smtp.fromAddress')}`,
    },
  };
}
