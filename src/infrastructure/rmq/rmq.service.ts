import { Injectable, Logger } from '@nestjs/common';
import type { RmqContext } from '@nestjs/microservices';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Channel, ConsumeMessage } from 'amqplib';
import { Counter } from 'prom-client';

@Injectable()
export class RmqService {
  private readonly SERVICE_NAME: string;
  private readonly logger = new Logger(RmqService.name);

  constructor(
    @InjectMetric('rmq_events_ack_total')
    private readonly ackTotal: Counter<string>,
    @InjectMetric('rmq_events_nack_total')
    private readonly nackTotal: Counter<string>,
  ) {
    this.SERVICE_NAME = 'notification-service';
  }

  ack(ctx: RmqContext, event: string) {
    const channel = ctx.getChannelRef() as Channel;
    const msg = ctx.getMessage() as ConsumeMessage;
    const tag = msg?.fields?.deliveryTag;
    if (!tag) return;

    channel.ack(msg);

    this.ackTotal.inc({
      service: this.SERVICE_NAME,
      event,
    });

    this.logger.debug(`ACK (pattern: ${ctx.getPattern()}, tag: ${tag})`);
  }

  nack(ctx: RmqContext, event: string, requeue = false) {
    const channel = ctx.getChannelRef() as Channel;
    const msg = ctx.getMessage() as ConsumeMessage;
    const tag = msg?.fields?.deliveryTag;

    if (!tag) return;

    channel.nack(msg, false, requeue);

    this.nackTotal.inc({
      service: this.SERVICE_NAME,
      event,
    });

    if (requeue) {
      this.logger.warn(
        `NACK response (pattern: ${ctx.getPattern()}, tag: ${tag})`,
      );
    } else {
      this.logger.error(
        `NACK drop (pattern: ${ctx.getPattern()}, tag: ${tag})`,
      );
    }
  }
}
