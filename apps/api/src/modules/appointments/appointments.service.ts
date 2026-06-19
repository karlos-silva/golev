import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, desc, eq, gte, lte, or } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import {
  appointments,
  anamneseSubmissions,
  patients,
  users,
  consultationRequests,
} from '../../../drizzle/schema';
import { isStaffRole } from '../auth/roles.constants';
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

  /** Garante que o doctorId atribuído pertence à equipe (admin/doctor). */
  private async assertDoctorIsStaff(doctorId?: string): Promise<void> {
    if (!doctorId) return;
    const u = await this.db.query.users.findFirst({
      where: eq(users.id, doctorId),
      columns: { role: true },
    });
    if (!u || !isStaffRole(u.role)) {
      throw new BadRequestException('Médico responsável inválido');
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
    await this.assertDoctorIsStaff(input.doctorId);

    // Persiste numa transação; o sync com o Google é best-effort e roda DEPOIS
    // do commit (nunca deixa estado parcial se a sincronização falhar/reiniciar).
    const row = await this.db.transaction(async (tx) => {
      const [r] = await tx
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
        await tx
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

      return r!;
    });

    await this.syncAppointment(row);

    return row;
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
    await this.assertDoctorIsStaff(input.doctorId);

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

  /* ── Solicitações de consulta do paciente (a equipe confirma) ──────────── */

  async listConsultationRequests(status?: string) {
    return this.db.query.consultationRequests.findMany({
      where: status
        ? eq(consultationRequests.status, status)
        : undefined,
      orderBy: [desc(consultationRequests.createdAt)],
      with: {
        patient: {
          columns: { id: true },
          with: { user: { columns: { id: true, name: true } } },
        },
      },
    });
  }

  /**
   * Confirma uma solicitação: cria a consulta (retorno) e marca como confirmada.
   * Tudo numa única transação — trava a solicitação com FOR UPDATE, insere a
   * consulta e atualiza o status atomicamente. Isso elimina (a) a janela de
   * appointment órfão se o processo falhar entre os passos e (b) a confirmação
   * dupla concorrente (a 2ª transação espera o lock e vê status != 'pendente').
   * O sync com o Google é best-effort e roda DEPOIS do commit.
   */
  async confirmConsultationRequest(
    id: string,
    input: {
      scheduledAt: Date;
      doctorId?: string;
      durationMin?: number;
      notes?: string;
    },
  ) {
    await this.assertDoctorIsStaff(input.doctorId);

    const appointment = await this.db.transaction(async (tx) => {
      const [req] = await tx
        .select({
          patientId: consultationRequests.patientId,
          status: consultationRequests.status,
          notes: consultationRequests.notes,
        })
        .from(consultationRequests)
        .where(eq(consultationRequests.id, id))
        .for('update')
        .limit(1);

      if (!req) throw new NotFoundException('Solicitação não encontrada');
      if (req.status !== 'pendente') {
        throw new BadRequestException('Solicitação já foi tratada');
      }

      const [appt] = await tx
        .insert(appointments)
        .values({
          patientId: req.patientId,
          doctorId: input.doctorId ?? null,
          scheduledAt: input.scheduledAt,
          durationMin: input.durationMin ?? 30,
          type: 'retorno',
          notes: input.notes ?? req.notes ?? null,
        })
        .returning();

      await tx
        .update(consultationRequests)
        .set({
          status: 'confirmada',
          appointmentId: appt!.id,
          updatedAt: new Date(),
        })
        .where(eq(consultationRequests.id, id));

      return appt!;
    });

    await this.syncAppointment(appointment);
    return appointment;
  }

  async rejectConsultationRequest(id: string) {
    const [row] = await this.db
      .update(consultationRequests)
      .set({ status: 'recusada', updatedAt: new Date() })
      .where(eq(consultationRequests.id, id))
      .returning({ id: consultationRequests.id });
    if (!row) throw new NotFoundException('Solicitação não encontrada');
    return row;
  }
}
