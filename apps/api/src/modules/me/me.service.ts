import {
  Inject,
  Injectable,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { and, asc, desc, eq, gte } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import {
  patients,
  weightLogs,
  appointments,
  dietPlans,
  consultationRequests,
} from '../../../drizzle/schema';
import { computeBmi } from '@golev/shared';
import type {
  MeOverview,
  MeProfile,
  MeJourney,
  MeAppointment,
  MeWeightLog,
  MeDietPlan,
  MeConsultationRequest,
  SelfWeightLogInput,
  ConsultationRequestCreateInput,
} from '@golev/shared';

type AppointmentWithDoctor = typeof appointments.$inferSelect & {
  doctor: { id: string; name: string } | null;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

@Injectable()
export class MeService {
  constructor(@Inject(DATABASE) private db: Database) {}

  /**
   * Resolve o paciente a partir do userId do JWT. É a ÚNICA porta de entrada —
   * o cliente nunca informa um patientId, então só acessa o próprio registro.
   * Seleciona apenas colunas visíveis ao paciente (NUNCA `patients.notes`).
   */
  private async requirePatient(userId: string) {
    const patient = await this.db.query.patients.findFirst({
      where: eq(patients.userId, userId),
      columns: {
        id: true,
        status: true,
        startedAt: true,
        anamneseId: true,
        doctorId: true,
      },
      with: {
        user: { columns: { name: true, email: true } },
        doctor: { columns: { id: true, name: true } },
        anamnese: {
          columns: {
            pesoKg: true,
            alturaCm: true,
            imc: true,
            idade: true,
            sexo: true,
            objetivos: true,
          },
        },
      },
    });

    if (!patient) {
      throw new ForbiddenException('Nenhum paciente vinculado a esta conta.');
    }
    return patient;
  }

  private toMeAppointment(row: AppointmentWithDoctor): MeAppointment {
    return {
      id: row.id,
      scheduledAt: row.scheduledAt.toISOString(),
      durationMin: row.durationMin,
      type: row.type,
      status: row.status,
      doctor: row.doctor ? { id: row.doctor.id, name: row.doctor.name } : null,
    };
  }

  async getOverview(userId: string): Promise<MeOverview> {
    const patient = await this.requirePatient(userId);

    const logs = await this.db.query.weightLogs.findMany({
      where: eq(weightLogs.patientId, patient.id),
      orderBy: [asc(weightLogs.measuredAt)],
    });

    const nextAppt = await this.db.query.appointments.findFirst({
      where: and(
        eq(appointments.patientId, patient.id),
        eq(appointments.status, 'agendada'),
        gte(appointments.scheduledAt, new Date()),
      ),
      orderBy: [asc(appointments.scheduledAt)],
      with: { doctor: { columns: { id: true, name: true } } },
    });

    const hasDietPlan = await this.db.query.dietPlans.findFirst({
      where: and(
        eq(dietPlans.patientId, patient.id),
        eq(dietPlans.status, 'active'),
      ),
      columns: { id: true },
    });

    const pendingRequest = await this.db.query.consultationRequests.findFirst({
      where: and(
        eq(consultationRequests.patientId, patient.id),
        eq(consultationRequests.status, 'pendente'),
      ),
      columns: { id: true },
    });

    const a = patient.anamnese;
    const alturaCm = a?.alturaCm ?? null;
    const initialWeightKg = a?.pesoKg != null ? Number(a.pesoKg) : null;

    const lastLog = logs.at(-1);
    const currentWeightKg = lastLog ? Number(lastLog.weightKg) : initialWeightKg;

    const deltaKg =
      currentWeightKg != null && initialWeightKg != null
        ? round1(currentWeightKg - initialWeightKg)
        : null;
    const deltaPct =
      deltaKg != null && initialWeightKg
        ? round1((deltaKg / initialWeightKg) * 100)
        : null;

    const initialBmi =
      a?.imc != null
        ? Number(a.imc)
        : initialWeightKg != null && alturaCm != null
          ? computeBmi(initialWeightKg, alturaCm)
          : null;
    const currentBmi =
      currentWeightKg != null && alturaCm != null
        ? computeBmi(currentWeightKg, alturaCm)
        : null;

    const startedAt = patient.startedAt;
    const daysInProgram = Math.max(
      0,
      Math.floor((Date.now() - startedAt.getTime()) / 86_400_000),
    );

    const chart = [
      ...(initialWeightKg != null
        ? [{ measuredAt: startedAt.toISOString(), weightKg: initialWeightKg }]
        : []),
      ...logs.map((l) => ({
        measuredAt: l.measuredAt.toISOString(),
        weightKg: Number(l.weightKg),
      })),
    ];

    const profile: MeProfile = {
      patientId: patient.id,
      name: patient.user.name,
      email: patient.user.email,
      status: patient.status,
      startedAt: startedAt.toISOString(),
      doctor: patient.doctor
        ? { id: patient.doctor.id, name: patient.doctor.name }
        : null,
      sexo: a?.sexo ?? null,
      idade: a?.idade ?? null,
      alturaCm,
      objetivos: a?.objetivos ?? [],
    };

    const journey: MeJourney = {
      startedAt: startedAt.toISOString(),
      daysInProgram,
      alturaCm,
      initialWeightKg,
      currentWeightKg,
      deltaKg,
      deltaPct,
      initialBmi,
      currentBmi,
      weighInCount: logs.length,
      lastWeighInAt: lastLog ? lastLog.measuredAt.toISOString() : null,
      nextAppointment: nextAppt
        ? this.toMeAppointment(nextAppt as AppointmentWithDoctor)
        : null,
      chart,
    };

    return {
      profile,
      journey,
      hasDietPlan: !!hasDietPlan,
      pendingConsultationRequest: !!pendingRequest,
    };
  }

  async listWeightLogs(userId: string): Promise<MeWeightLog[]> {
    const patient = await this.requirePatient(userId);
    const logs = await this.db.query.weightLogs.findMany({
      where: eq(weightLogs.patientId, patient.id),
      orderBy: [desc(weightLogs.measuredAt)],
    });
    return logs.map((l) => ({
      id: l.id,
      weightKg: Number(l.weightKg),
      measuredAt: l.measuredAt.toISOString(),
      source: l.source,
      notes: l.notes,
    }));
  }

  async addWeightLog(
    userId: string,
    input: SelfWeightLogInput,
  ): Promise<MeWeightLog> {
    const patient = await this.requirePatient(userId);
    const [row] = await this.db
      .insert(weightLogs)
      .values({
        patientId: patient.id,
        weightKg: String(input.weightKg),
        measuredAt: input.measuredAt ? new Date(input.measuredAt) : new Date(),
        // Diferencia pesagens feitas pelo paciente no app das lançadas no portal.
        source: 'patient_app',
        notes: input.notes ?? null,
      })
      .returning();

    return {
      id: row!.id,
      weightKg: Number(row!.weightKg),
      measuredAt: row!.measuredAt.toISOString(),
      source: row!.source,
      notes: row!.notes,
    };
  }

  async listAppointments(userId: string): Promise<MeAppointment[]> {
    const patient = await this.requirePatient(userId);
    const rows = await this.db.query.appointments.findMany({
      where: eq(appointments.patientId, patient.id),
      orderBy: [desc(appointments.scheduledAt)],
      with: { doctor: { columns: { id: true, name: true } } },
    });
    return rows.map((r) => this.toMeAppointment(r as AppointmentWithDoctor));
  }

  async getDietPlan(userId: string): Promise<MeDietPlan | null> {
    const patient = await this.requirePatient(userId);
    const plan = await this.db.query.dietPlans.findFirst({
      where: and(
        eq(dietPlans.patientId, patient.id),
        eq(dietPlans.status, 'active'),
      ),
      orderBy: [desc(dietPlans.updatedAt)],
      with: { doctor: { columns: { id: true, name: true } } },
    });
    if (!plan) return null;
    return {
      id: plan.id,
      title: plan.title,
      content: plan.content,
      fileUrl: plan.fileUrl,
      status: plan.status,
      updatedAt: plan.updatedAt.toISOString(),
      doctor: plan.doctor ? { id: plan.doctor.id, name: plan.doctor.name } : null,
    };
  }

  async listConsultationRequests(
    userId: string,
  ): Promise<MeConsultationRequest[]> {
    const patient = await this.requirePatient(userId);
    const rows = await this.db.query.consultationRequests.findMany({
      where: eq(consultationRequests.patientId, patient.id),
      orderBy: [desc(consultationRequests.createdAt)],
    });
    return rows.map((r) => ({
      id: r.id,
      preferredPeriod: r.preferredPeriod,
      preferredDate: r.preferredDate ? r.preferredDate.toISOString() : null,
      reason: r.reason,
      notes: r.notes,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async createConsultationRequest(
    userId: string,
    input: ConsultationRequestCreateInput,
  ): Promise<MeConsultationRequest> {
    const patient = await this.requirePatient(userId);

    const existingPending = await this.db.query.consultationRequests.findFirst({
      where: and(
        eq(consultationRequests.patientId, patient.id),
        eq(consultationRequests.status, 'pendente'),
      ),
      columns: { id: true },
    });
    if (existingPending) {
      throw new ConflictException(
        'Você já tem uma solicitação de consulta em análise. A gente entra em contato em breve.',
      );
    }

    try {
      const [row] = await this.db
        .insert(consultationRequests)
        .values({
          patientId: patient.id,
          preferredPeriod: input.preferredPeriod ?? null,
          preferredDate: input.preferredDate
            ? new Date(input.preferredDate)
            : null,
          reason: input.reason ?? null,
          notes: input.notes ?? null,
        })
        .returning();

      return {
        id: row!.id,
        preferredPeriod: row!.preferredPeriod,
        preferredDate: row!.preferredDate
          ? row!.preferredDate.toISOString()
          : null,
        reason: row!.reason,
        notes: row!.notes,
        status: row!.status,
        createdAt: row!.createdAt.toISOString(),
      };
    } catch (e) {
      // Índice único parcial (uma pendente por paciente) — perde a corrida.
      if ((e as { code?: string }).code === '23505') {
        throw new ConflictException(
          'Você já tem uma solicitação de consulta em análise. A gente entra em contato em breve.',
        );
      }
      throw e;
    }
  }
}
