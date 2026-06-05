import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

/**
 * Conexão Google Calendar por usuário (profissional). O refresh_token é
 * persistente (acesso contínuo à agenda) e fica CIFRADO em repouso.
 * Uma conexão por usuário.
 */
export const googleCalendarConnections = pgTable('google_calendar_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  googleEmail: text('google_email').notNull(),
  /** Cifrado (AES-256-GCM). Nunca em texto puro. */
  refreshTokenEnc: text('refresh_token_enc').notNull(),
  /** Cache do access token (curto). Cifrado. */
  accessTokenEnc: text('access_token_enc'),
  tokenExpiry: timestamp('token_expiry', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const googleCalendarConnectionsRelations = relations(
  googleCalendarConnections,
  ({ one }) => ({
    user: one(users, {
      fields: [googleCalendarConnections.userId],
      references: [users.id],
    }),
  }),
);
