import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import { tenants, tenantMemberships } from '../../../drizzle/schema';

@Injectable()
export class TenantsService {
  constructor(@Inject(DATABASE) private db: Database) {}

  async findById(id: string) {
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(tenants.id, id),
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async getMembers(tenantId: string) {
    return this.db.query.tenantMemberships.findMany({
      where: eq(tenantMemberships.tenantId, tenantId),
      with: { user: true },
    });
  }
}
