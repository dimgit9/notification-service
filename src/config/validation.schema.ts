import { z } from 'zod';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export default z.object({
  NODE_ENV: z.enum(Environment).default(Environment.Development),
  RMQ_URL: z.string().nonempty(),
  RMQ_QUEUE: z.string().nonempty(),

  SMTP_HOST: z.string().nonempty(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USERNAME: z.string().nonempty(),
  SMTP_PASSWORD: z.string().nonempty(),
  SMTP_FROM_ADDRESS: z.email().nonempty(),
  SMTP_SECURE: z.string().transform((v) => v === 'true'),
});
