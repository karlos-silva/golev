import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
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

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  anamnese: one(anamneseSubmissions, {
    fields: [patients.anamneseId],
    references: [anamneseSubmissions.id],
  }),
  doctor: one(users, { fields: [patients.doctorId], references: [users.id] }),
  weightLogs: many(weightLogs),
}));

export const weightLogsRelations = relations(weightLogs, ({ one }) => ({
  patient: one(patients, {
    fields: [weightLogs.patientId],
    references: [patients.id],
  }),
}));
