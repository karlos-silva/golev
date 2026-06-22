import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  date,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { users } from './auth';
import { anamneseSubmissions } from './anamnese';

export const patients = pgTable(
  'patients',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    /** Conta de login do paciente no app */
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),

    /** Lead de origem — preservado mesmo se a anamnese for limpa */
    anamneseId: uuid('anamnese_id').references(() => anamneseSubmissions.id, {
      onDelete: 'set null',
    }),

    /** Médico responsável pelo acompanhamento */
    doctorId: uuid('doctor_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    /** active | paused | discharged */
    status: text('status').notNull().default('active'),

    /* ── Perfil clínico do paciente ────────────────────────────────────────
     * Mora aqui (não na anamnese/lead): é o estado ATUAL, editável pela equipe,
     * e não some se o lead for purgado. A `anamnese_submissions` fica só com o
     * snapshot imutável da avaliação. Backfillado a partir do lead na migration. */
    /** feminino | masculino | outro */
    sex: text('sex'),
    /** Data de nascimento — idade é derivada (substitui o `idade` int do lead). */
    birthDate: date('birth_date'),
    /** Altura em cm — estável, base do cálculo de IMC. */
    heightCm: integer('height_cm'),
    /** Telefone/WhatsApp de contato do paciente. */
    phone: text('phone'),
    /**
     * Foto de perfil — data URL de uma imagem PEQUENA (redimensionada no client
     * p/ ~256px, ~20-30KB). Tamanho limitado na borda (Zod) p/ não inchar a base.
     * Null = sem foto (app mostra as iniciais).
     */
    avatarDataUrl: text('avatar_data_url'),
    /** Objetivos do acompanhamento. */
    goals: text('goals')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /** Comorbidades atuais (estado vivo, editável pela equipe). */
    comorbidities: text('comorbidities')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /** Medicações em uso (estado vivo, editável pela equipe). */
    medications: text('medications')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /** Contraindicações conhecidas. */
    contraindications: text('contraindications')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    /**
     * Quando o paciente revisou/confirmou o próprio perfil (data de nascimento
     * etc.). Null = ainda não confirmou → o app pede a confirmação no /inicio.
     * Necessário porque o `birth_date` backfillado é aproximado (só o ano).
     */
    profileConfirmedAt: timestamp('profile_confirmed_at', {
      withTimezone: true,
    }),

    /**
     * Etapa dos exames no onboarding (a médica pede → paciente envia pelo
     * WhatsApp → equipe marca recebido → médica revisa e inicia o tratamento):
     * nao_solicitado | solicitado | recebido | revisado. Sem arquivo aqui — os
     * exames chegam pelo WhatsApp; isto só rastreia o ESTÁGIO p/ a equipe.
     */
    examsStatus: text('exams_status').notNull().default('nao_solicitado'),
    examsStatusAt: timestamp('exams_status_at', { withTimezone: true }),

    startedAt: timestamp('started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Notas internas da equipe (texto livre por enquanto) */
    notes: text('notes'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('patients_user_id_idx').on(t.userId),
    index('patients_status_idx').on(t.status),
    // Um lead só pode virar paciente uma vez (blinda a race no convert).
    uniqueIndex('patients_anamnese_id_unique').on(t.anamneseId),
  ],
);

export const weightLogs = pgTable(
  'weight_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),

    weightKg: numeric('weight_kg', { precision: 5, scale: 1 }).notNull(),
    measuredAt: timestamp('measured_at', { withTimezone: true }).notNull(),

    /** patient_app | portal */
    source: text('source').notNull().default('portal'),

    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('weight_logs_patient_id_idx').on(t.patientId),
    index('weight_logs_measured_at_idx').on(t.measuredAt),
  ],
);

/**
 * Plano alimentar do paciente — escrito pela equipe (texto/markdown) com anexo
 * opcional (PDF). O paciente vê o plano `active` mais recente na área do cliente.
 */
export const dietPlans = pgTable(
  'diet_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),

    /** Profissional que montou o plano. */
    doctorId: uuid('doctor_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    title: text('title').notNull(),
    /** Conteúdo em texto/markdown escrito pela equipe. */
    content: text('content').notNull().default(''),
    /** Anexo opcional (link do PDF do plano). */
    fileUrl: text('file_url'),

    /** active | archived */
    status: text('status').notNull().default('active'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('diet_plans_patient_id_idx').on(t.patientId),
    index('diet_plans_status_idx').on(t.status),
    // No máximo um plano ativo por paciente (blinda a race do upsert).
    uniqueIndex('diet_plans_one_active_per_patient_idx')
      .on(t.patientId)
      .where(sql`status = 'active'`),
  ],
);

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  anamnese: one(anamneseSubmissions, {
    fields: [patients.anamneseId],
    references: [anamneseSubmissions.id],
  }),
  doctor: one(users, { fields: [patients.doctorId], references: [users.id] }),
  weightLogs: many(weightLogs),
  dietPlans: many(dietPlans),
}));

export const weightLogsRelations = relations(weightLogs, ({ one }) => ({
  patient: one(patients, {
    fields: [weightLogs.patientId],
    references: [patients.id],
  }),
}));

export const dietPlansRelations = relations(dietPlans, ({ one }) => ({
  patient: one(patients, {
    fields: [dietPlans.patientId],
    references: [patients.id],
  }),
  doctor: one(users, {
    fields: [dietPlans.doctorId],
    references: [users.id],
  }),
}));
