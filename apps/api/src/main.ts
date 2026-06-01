import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { parseAllowedOrigins } from './config/allowed-origins';

const DEFAULT_BODY_LIMIT = 1_048_576; // 1 MiB

function resolveBodyLimitBytes(): number {
  const raw = process.env.REQUEST_BODY_LIMIT_BYTES?.trim();
  if (!raw) {
    return DEFAULT_BODY_LIMIT;
  }
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_BODY_LIMIT;
}

async function bootstrap() {
  const allowedOrigins = parseAllowedOrigins();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: resolveBodyLimitBytes() }),
    {
      cors: {
        origin: (
          origin: string | undefined,
          cb: (err: Error | null, allow?: boolean) => void,
        ) => {
          if (origin === undefined || origin === '') {
            cb(null, true);
            return;
          }
          cb(null, allowedOrigins.includes(origin));
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      },
    },
  );

  await app.register(helmet);

  await app.listen(process.env.PORT ?? 3333, '0.0.0.0');
  console.log(`API running on ${await app.getUrl()}`);
}

void bootstrap();
