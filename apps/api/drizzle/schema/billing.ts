import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenants';

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .unique()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id').unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const customersRelations = relations(customers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [customers.tenantId],
    references: [tenants.id],
  }),
  subscriptions: many(subscriptions),
}));

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripePriceId: text('stripe_price_id'),
  status: text('status').notNull().default('active'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: timestamp('cancel_at_period_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  customer: one(customers, {
    fields: [subscriptions.customerId],
    references: [customers.id],
  }),
}));

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  stripeInvoiceId: text('stripe_invoice_id').unique(),
  amountDue: integer('amount_due').notNull(),
  amountPaid: integer('amount_paid').notNull().default(0),
  status: text('status').notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));
