import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { tap, type Observable } from 'rxjs';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class GrpcMetricsInterceptor implements NestInterceptor {
  private SERVICE_NAME: string;

  constructor(
    @InjectMetric('grpc_requests_total')
    private readonly total: Counter<string>,
    @InjectMetric('grpc_request_duration_seconds')
    private readonly duration: Histogram<string>,
  ) {
    this.SERVICE_NAME = 'gateway';
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const handler = context.getHandler().name;

    const endTimer = this.duration.startTimer({
      service: this.SERVICE_NAME,
      method: handler,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          this.total.inc({
            service: this.SERVICE_NAME,
            method: handler,
            status: 'OK',
          });
          endTimer();
        },
        error: () => {
          this.total.inc({
            service: this.SERVICE_NAME,
            method: handler,
            status: 'ERROR',
          });
          endTimer();
        },
      }),
    );
  }
}
