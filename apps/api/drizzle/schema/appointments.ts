import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';
import { anamneseSubmissions } from './anamnese';
import { patients } from './patients';

/**
 * Consultas. Fonte da verdade nativa, ligada ao lead (anamnese) e/ou paciente.
 * `google_calendar_event_id` reservado para o sync futuro com Google Calendar
 * (empurrar o evento pro calendário do médico) — nulo enquanto não houver sync.
 */
export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    /** Lead de origem (pré-conversão). */
    anamneseId: uuid('anamnese_id').references(() => anamneseSubmissions.id, {
      onDelete: 'set null',
    }),
    /** Paciente (consultas de retorno pós-conversão). */
    patientId: uuid('patient_id').references(() => patients.id, {
      onDelete: 'cascade',
    }),
    /** Médico responsável. */
    doctorId: uuid('doctor_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    durationMin: integer('duration_min').notNull().default(30),

    /** primeira | retorno */
    type: text('type').notNull().default('primeira'),
    /** agendada | realizada | cancelada | falta */
    status: text('status').notNull().default('agendada'),

    notes: text('notes'),

    /** Reservado p/ sync Google Calendar (Fase 2). */
    googleCalendarEventId: text('google_calendar_event_id'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('appointments_scheduled_at_idx').on(t.scheduledAt),
    index('appointments_anamnese_id_idx').on(t.anamneseId),
    index('appointments_patient_id_idx').on(t.patientId),
    index('appointments_status_idx').on(t.status),
  ],
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  anamnese: one(anamneseSubmissions, {
    fields: [appointments.anamneseId],
    references: [anamneseSubmissions.id],
  }),
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(users, {
    fields: [appointments.doctorId],
    references: [users.id],
  }),
}));
