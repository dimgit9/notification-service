import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import type { OtpRequestedEvent, EmailChangedEvent } from '@dimgit9/contracts';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

import { RmqService } from '@/infrastructure/rmq/rmq.service';

import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  private readonly SERVICE_NAME: string;
  constructor(
    private readonly rmqService: RmqService,
    private readonly notificationService: NotificationsService,
    @InjectMetric('rmq_event_processing_duration_seconds')
    private readonly processingDuration: Histogram<string>,
    @InjectMetric('rmq_events_total')
    private readonly eventsTotal: Counter<string>,
  ) {
    this.SERVICE_NAME = 'notification-service';
  }

  @EventPattern('auth.otp.requested')
  async otpRequested(
    @Payload() data: OtpRequestedEvent,
    @Ctx() ctx: RmqContext,
  ) {
    const event = 'auth.otp.requested';

    const endTimer = this.processingDuration.startTimer({
      service: this.SERVICE_NAME,
      event,
    });

    try {
      await this.notificationService.sendOtp(data);

      this.eventsTotal.inc({
        service: this.SERVICE_NAME,
        event,
        status: 'success',
      });

      this.rmqService.ack(ctx, event);
    } catch (error: unknown) {
      this.eventsTotal.inc({
        service: this.SERVICE_NAME,
        event,
        status: 'error',
      });

      if (error instanceof Error) {
        console.log('OTP processing error: ', error.message ?? '');
      } else {
        console.log('Unknown OTP processing error');
      }

      this.rmqService.nack(ctx, event);

      throw error;
    } finally {
      endTimer();
    }
  }

  @EventPattern('account.email.changed')
  async emailChanged(
    @Payload() data: EmailChangedEvent,
    @Ctx() ctx: RmqContext,
  ) {
    const event = 'account.email.changed';

    const endTimer = this.processingDuration.startTimer({
      service: this.SERVICE_NAME,
      event,
    });

    try {
      await this.notificationService.sendEmailChange(data);

      this.rmqService.ack(ctx, event);

      this.eventsTotal.inc({
        service: this.SERVICE_NAME,
        event,
        status: 'success',
      });
    } catch (error: unknown) {
      this.eventsTotal.inc({
        service: this.SERVICE_NAME,
        event,
        status: 'error',
      });

      if (error instanceof Error) {
        console.log('Email change error: ', error.message ?? '');
      } else {
        console.log('Unknown Email change error');
      }

      this.rmqService.nack(ctx, event);
    } finally {
      endTimer();
    }
  }
}
