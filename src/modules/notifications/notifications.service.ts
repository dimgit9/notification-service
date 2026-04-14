import { MailService } from '@/infrastructure/mail/mail.service';
import { EmailChangedEvent, OtpRequestedEvent } from '@dimgit9/contracts';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  constructor(private readonly mailService: MailService) {}

  async sendOtp(data: OtpRequestedEvent) {
    const { identifier, type, code } = data;
    if (type === 'email') await this.mailService.sendOtp(identifier, code);
    else console.log('SMS', data);
  }

  async sendEmailChange(data: EmailChangedEvent) {
    const { email, code } = data;
    return await this.mailService.sendEmailChange(email, code);
  }
}
