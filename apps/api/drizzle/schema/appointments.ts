import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
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

/**
 * Solicitação de consulta feita pelo PACIENTE no app. A equipe confirma (vira
 * um `appointment`) ou recusa. Mantém o acompanhamento próximo: o paciente pede,
 * a equipe agenda — sem expor a agenda dos médicos ao cliente.
 */
export const consultationRequests = pgTable(
  'consultation_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),

    /** manha | tarde | noite | qualquer */
    preferredPeriod: text('preferred_period'),
    /** Data preferida do paciente (opcional). */
    preferredDate: timestamp('preferred_date', { withTimezone: true }),
    reason: text('reason'),
    notes: text('notes'),

    /** pendente | confirmada | recusada | cancelada */
    status: text('status').notNull().default('pendente'),

    /** Consulta criada quando a equipe confirma a solicitação. */
    appointmentId: uuid('appointment_id').references(() => appointments.id, {
      onDelete: 'set null',
    }),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('consultation_requests_patient_id_idx').on(t.patientId),
    index('consultation_requests_status_idx').on(t.status),
    // No máximo uma solicitação pendente por paciente (blinda a race do dedup).
    uniqueIndex('consultation_requests_one_pending_per_patient_idx')
      .on(t.patientId)
      .where(sql`status = 'pendente'`),
  ],
);

export const consultationRequestsRelations = relations(
  consultationRequests,
  ({ one }) => ({
    patient: one(patients, {
      fields: [consultationRequests.patientId],
      references: [patients.id],
    }),
    appointment: one(appointments, {
      fields: [consultationRequests.appointmentId],
      references: [appointments.id],
    }),
  }),
);
