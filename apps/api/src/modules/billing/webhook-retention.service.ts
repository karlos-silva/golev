import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { and, isNotNull, lt } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import { stripeWebhookEvents } from '../../../drizzle/schema';

/**
 * Retenção do log de webhooks (LGPD / minimização). Mantemos o payload completo
 * por uma janela (debug/reconciliação) e depois o nulificamos — preservando
 * `stripe_event_id` (barreira de idempotência), `type` e `processedAt`.
 */
const RETENTION_DAYS = 90;

@Injectable()
export class WebhookRetentionService {
  private readonly logger = new Logger('WebhookRetention');

  constructor(@Inject(DATABASE) private db: Database) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeOldPayloads(): Promise<void> {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000);
    const purged = await this.db
      .update(stripeWebhookEvents)
      .set({ payload: null })
      .where(
        and(
          lt(stripeWebhookEvents.receivedAt, cutoff),
          isNotNull(stripeWebhookEvents.payload),
        ),
      )
      .returning({ id: stripeWebhookEvents.id });

    if (purged.length > 0) {
      this.logger.log(
        `Retenção: ${purged.length} payload(s) de webhook > ${RETENTION_DAYS}d nulificados.`,
      );
    }
  }
}
