import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import { customers } from '../../../drizzle/schema';

@Injectable()
export class BillingService {
  constructor(@Inject(DATABASE) private db: Database) {}

  async getSubscription(tenantId: string) {
    const customer = await this.db.query.customers.findFirst({
      where: eq(customers.tenantId, tenantId),
      with: { subscriptions: true },
    });

    if (!customer) {
      return { subscription: null };
    }

    return {
      subscription: customer.subscriptions[0] ?? null,
    };
  }
}
