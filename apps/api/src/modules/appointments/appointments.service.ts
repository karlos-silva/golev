import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, gte, lte, or } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import {
  appointments,
  anamneseSubmissions,
  patients,
  users,
} from '../../../drizzle/schema';
import {
  GoogleCalendarService,
  type EventInput,
} from '../integrations/google-calendar.service';

const TYPE_LABEL: Record<string, string> = {
  primeira: 'Primeira consulta',
  retorno: 'Retorno',
};

type AppointmentRow = typeof appointments.$inferSelect;

export type AppointmentStatus =
  | 'agendada'
  | 'realizada'
  | 'cancelada'
  | 'falta';

interface CreateInput {
  anamneseId?: string;
  patientId?: string;
  doctorId?: string;
  scheduledAt: Date;
  durationMin?: number;
  type?: 'primeira' | 'retorno';
  notes?: string;
}

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @Inject(DATABASE) private db: Database,
    private google: GoogleCalendarService,
  ) {}

  private async personName(
    anamneseId: string | null,
    patientId: string | null,
  ): Promise<string> {
    if (anamneseId) {
      const a = await this.db.query.anamneseSubmissions.findFirst({
        where: eq(anamneseSubmissions.id, anamneseId),
        columns: { nome: true },
      });
      if (a) return a.nome;
    }
    if (patientId) {
      const p = await this.db.query.patients.findFirst({
        where: eq(patients.id, patientId),
        with: { user: { columns: { name: true } } },
        columns: { id: true },
      });
      if (p?.user) return p.user.name;
    }
    return 'Consulta';
  }

  private buildEvent(row: AppointmentRow, name: string): EventInput {
    const start = new Date(row.scheduledAt);
    const end = new Date(start.getTime() + row.durationMin * 60_000);
    const tipo = TYPE_LABEL[row.type] ?? row.type;
    return {
      summary: `Consulta — ${name}`,
      description: `${tipo} · Go Lev${row.notes ? `\n\n${row.notes}` : ''}`,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    };
  }

  /** Sincroniza com o Google Calendar do médico. Idempotente, nunca lança. */
  private async syncAppointment(row: AppointmentRow): Promise<void> {
    if (!row.doctorId) return;
    try {
      if (row.status === 'cancelada') {
        if (row.googleCalendarEventId) {
          await this.google.deleteEvent(row.doctorId, row.googleCalendarEventId);
          await this.db
            .update(appointments)
            .set({ googleCalendarEventId: null })
            .where(eq(appointments.id, row.id));
        }
        return;
      }
      const name = await this.personName(row.anamneseId, row.patientId);
      const ev = this.buildEvent(row, name);
      if (row.googleCalendarEventId) {
        await this.google.updateEvent(row.doctorId, row.googleCalendarEventId, ev);
      } else {
        const eventId = await this.google.createEvent(row.doctorId, ev);
        if (eventId) {
          await this.db
            .update(appointments)
            .set({ googleCalendarEventId: eventId })
            .where(eq(appointments.id, row.id));
        }
      }
    } catch (e) {
      this.logger.error(`Sync Google falhou (appointment ${row.id}): ${String(e)}`);
    }
  }

  /** Médicos/equipe atribuíveis a uma consulta. */
  async assignees() {
    // Só quem atende consultas (médicos) — não todo staff.
    return this.db
      .select({ id: users.id, name: users.name, role: users.role })
      .from(users)
      .where(and(eq(users.isDoctor, true), eq(users.isActive, true)));
  }

  async findAll(range?: { from?: Date; to?: Date }) {
    const conds = [];
    if (range?.from) conds.push(gte(appointments.scheduledAt, range.from));
    if (range?.to) conds.push(lte(appointments.scheduledAt, range.to));

    return this.db.query.appointments.findMany({
      where: conds.length ? and(...conds) : undefined,
      orderBy: [asc(appointments.scheduledAt)],
      with: {
        anamnese: { columns: { id: true, nome: true, whatsapp: true, email: true } },
        patient: { with: { user: { columns: { id: true, name: true } } }, columns: { id: true } },
        doctor: { columns: { id: true, name: true } },
      },
    });
  }

  async create(input: CreateInput) {
    if (!input.anamneseId && !input.patientId) {
      throw new BadRequestException('Informe o lead ou o paciente da consulta');
    }

    const [row] = await this.db
      .insert(appointments)
      .values({
        anamneseId: input.anamneseId ?? null,
        patientId: input.patientId ?? null,
        doctorId: input.doctorId ?? null,
        scheduledAt: input.scheduledAt,
        durationMin: input.durationMin ?? 30,
        type: input.type ?? 'primeira',
        notes: input.notes ?? null,
      })
      .returning();

    // Ao agendar a partir de um lead, avança o pipeline.
    if (input.anamneseId) {
      await this.db
        .update(anamneseSubmissions)
        .set({ leadStatus: 'consulta_agendada', updatedAt: new Date() })
        .where(
          and(
            eq(anamneseSubmissions.id, input.anamneseId),
            // só avança se ainda estiver em estágios iniciais
            or(
              eq(anamneseSubmissions.leadStatus, 'novo'),
              eq(anamneseSubmissions.leadStatus, 'contatado'),
            ),
          ),
        );
    }

    await this.syncAppointment(row!);

    return row!;
  }

  async update(
    id: string,
    input: {
      status?: AppointmentStatus;
      scheduledAt?: Date;
      doctorId?: string;
      notes?: string;
    },
  ) {
    const [row] = await this.db
      .update(appointments)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    if (!row) throw new NotFoundException('Consulta não encontrada');
    await this.syncAppointment(row);
    return row;
  }

  async remove(id: string) {
    const existing = await this.db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      columns: { id: true, doctorId: true, googleCalendarEventId: true },
    });
    if (!existing) throw new NotFoundException('Consulta não encontrada');

    // Remove o evento do Google antes de apagar a consulta.
    if (existing.doctorId && existing.googleCalendarEventId) {
      await this.google.deleteEvent(existing.doctorId, existing.googleCalendarEventId);
    }

    await this.db.delete(appointments).where(eq(appointments.id, id));
    return { id: existing.id };
  }
}
