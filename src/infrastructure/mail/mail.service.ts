import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Transporter } from 'nodemailer';

import { TemplateService } from './template.service';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly templateService: TemplateService,
  ) {}

  async onModuleInit() {
    try {
      const transporter = this.mailerService[
        'transporter'
      ] as unknown as Transporter;
      await transporter.verify();
      this.logger.log('SMTP transporter is ready');
    } catch (error) {
      this.logger.error('SMTP verify failed', error);
    }
  }

  async sendOtp(email: string, code: string) {
    const html = this.templateService.render('otp', { code });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Ваш код подтверждения',
      html,
    });
  }

  async sendEmailChange(email: string, code: string) {
    const html = this.templateService.render('email-change', { code });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Ваш код подтверждения для смены почты',
      html,
    });
  }
}
