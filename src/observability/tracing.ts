import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const traceExporter = new OTLPTraceExporter({
  url: 'http://jaeger:4317',
});

export const otelSdk = new NodeSDK({
  traceExporter,
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'notification-service',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-nestjs-core': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
    }),
  ],
});

otelSdk.start();
