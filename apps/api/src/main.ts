import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module';
import { parseAllowedOrigins } from './config/allowed-origins';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';
import { StripeExceptionFilter } from './common/filters/stripe-exception.filter';

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
    // trustProxy: atrás do Cloudflare/Caddy, para o rate-limit enxergar o IP real.
    new FastifyAdapter({ bodyLimit: resolveBodyLimitBytes(), trustProxy: true }),
    // rawBody: preserva o corpo bruto (req.rawBody) p/ verificar a assinatura do
    // webhook Stripe, sem quebrar o parse JSON das demais rotas.
    { rawBody: true },
  );

  // CORS deve ser registrado antes do helmet para garantir que preflights
  // OPTIONS sejam interceptados antes de qualquer outra lógica de rota.
  app.enableCors({
    origin: (
      origin: string | undefined,
      cb: (err: Error | null, allow: boolean) => void,
    ) => {
      if (!origin) { cb(null, true); return; }
      cb(null, allowedOrigins.includes(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.register(helmet);
  // Cookies de sessão httpOnly (set + parse de request.cookies).
  await app.register(fastifyCookie);

  app.useGlobalFilters(new ZodExceptionFilter(), new StripeExceptionFilter());

  await app.listen(process.env.PORT ?? 3333, '0.0.0.0');
  console.log(`API running on ${await app.getUrl()}`);
}

void bootstrap();
