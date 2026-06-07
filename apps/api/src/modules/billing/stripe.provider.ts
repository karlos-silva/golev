import Stripe from 'stripe';
import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

/**
 * Versão da API pinada na mesma do SDK instalado (stripe@22 → dahlia). Pinar
 * mantém runtime e tipos em sincronia; um bump do SDK vira erro de tipo aqui,
 * sinalizando que o handler de eventos precisa ser revisado.
 */
export const STRIPE_API_VERSION = '2026-05-27.dahlia';

export const stripeProvider: Provider = {
  provide: STRIPE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) =>
    new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY'), {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
      appInfo: { name: 'golev-platform' },
    }),
};
