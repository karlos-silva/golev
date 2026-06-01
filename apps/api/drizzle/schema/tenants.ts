import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const tenantsRelations = relations(tenants, ({ many }) => ({
  memberships: many(tenantMemberships),
}));

export const tenantMemberships = pgTable('tenant_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tenantMembershipsRelations = relations(
  tenantMemberships,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenantMemberships.tenantId],
      references: [tenants.id],
    }),
    user: one(users, {
      fields: [tenantMemberships.userId],
      references: [users.id],
    }),
  }),
);
