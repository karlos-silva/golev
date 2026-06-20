import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { users } from './auth';

/**
 * Pré-anamnese / questionário de elegibilidade. Captura de lead, ligada a um
 * `user` quando o e-mail já tem conta (senão `user_id` fica null — não criamos
 * conta automaticamente). Persistimos apenas os elegíveis que concluem o fluxo;
 * `imc`, `eligible` e `reasons` são calculados no servidor (fonte da verdade).
 */
export const anamneseSubmissions = pgTable(
  'anamnese_submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    objetivos: text('objetivos').array().notNull(),
    sexo: text('sexo').notNull(),
    idade: integer('idade').notNull(),
    alturaCm: integer('altura_cm').notNull(),
    pesoKg: numeric('peso_kg', { precision: 5, scale: 1 }).notNull(),
    tentativas: text('tentativas').notNull(),
    comorbidades: text('comorbidades').array().notNull(),
    contraindicacoes: text('contraindicacoes').array().notNull(),
    gravidaOuAmamentando: boolean('gravida_ou_amamentando'),
    tratamentoPrevio: text('tratamento_previo').notNull(),
    medicacoes: text('medicacoes')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    imc: numeric('imc', { precision: 4, scale: 1 }).notNull(),
    eligible: boolean('eligible').notNull(),
    reasons: text('reasons').array().notNull(),

    nome: text('nome').notNull(),
    email: text('email').notNull(),
    whatsapp: text('whatsapp').notNull(),
    consentAt: timestamp('consent_at', { withTimezone: true }).notNull(),
    consentText: text('consent_text'),

    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    referrer: text('referrer'),

    /**
     * Pipeline de contato interno. Atualizado pela equipe no portal.
     * Valores: 'novo' | 'contatado' | 'consulta_marcada' | 'descartado'
     */
    leadStatus: text('lead_status').notNull().default('novo'),

    /**
     * Carimbo de quando o lead chegou ao pagamento (gerou/abriu o checkout).
     * Null = nunca chegou ao billing. Usado para recuperar checkout abandonado.
     */
    checkoutStartedAt: timestamp('checkout_started_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('anamnese_submissions_email_idx').on(t.email),
    index('anamnese_submissions_created_at_idx').on(t.createdAt),
    index('anamnese_submissions_user_id_idx').on(t.userId),
  ],
);

export const anamneseSubmissionsRelations = relations(
  anamneseSubmissions,
  ({ one }) => ({
    user: one(users, {
      fields: [anamneseSubmissions.userId],
      references: [users.id],
    }),
  }),
);
