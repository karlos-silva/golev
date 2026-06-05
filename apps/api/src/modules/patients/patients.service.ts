import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { eq, desc, asc } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import {
  patients,
  weightLogs,
  users,
  anamneseSubmissions,
} from '../../../drizzle/schema';
import { PasswordService } from '../auth/password.service';
import { isStaffRole } from '../auth/roles.constants';

export type PatientStatus = 'active' | 'paused' | 'discharged';

/** Senha temporária forte (16 chars, base64url) + sufixo p/ garantir complexidade. */
function generateTempPassword(): string {
  return randomBytes(12).toString('base64url') + 'G@1';
}

@Injectable()
export class PatientsService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private passwordService: PasswordService,
  ) {}

  async findAll() {
    return this.db.query.patients.findMany({
      orderBy: [desc(patients.createdAt)],
      with: {
        user: {
          columns: { id: true, name: true, email: true, isActive: true },
        },
        anamnese: {
          columns: {
            id: true,
            imc: true,
            pesoKg: true,
            alturaCm: true,
            idade: true,
            sexo: true,
            comorbidades: true,
            whatsapp: true,
          },
        },
      },
      columns: {
        id: true,
        status: true,
        startedAt: true,
        notes: true,
        createdAt: true,
      },
    });
  }

  /**
   * Converte um lead elegível em paciente:
   * 1. Cria conta user (role=patient) com senha temporária
   * 2. Cria registro patients
   * 3. Marca anamnese como convertida
   */
  async convertFromAnamnese(anamneseId: string) {
    const anamnese = await this.db.query.anamneseSubmissions.findFirst({
      where: eq(anamneseSubmissions.id, anamneseId),
      columns: { id: true, nome: true, email: true, eligible: true, userId: true },
    });

    if (!anamnese) throw new NotFoundException('Avaliação não encontrada');
    if (!anamnese.eligible) throw new ConflictException('Lead não é elegível');

    const existing = await this.db.query.patients.findFirst({
      where: eq(patients.anamneseId, anamneseId),
      columns: { id: true },
    });
    if (existing) throw new ConflictException('Lead já foi convertido em paciente');

    // Procura conta pré-existente (do anamnese ou pelo e-mail). Não rebaixamos
    // contas internas a paciente — protege contra converter um membro da equipe.
    const linkedUser = anamnese.userId
      ? await this.db.query.users.findFirst({
          where: eq(users.id, anamnese.userId),
          columns: { id: true, role: true },
        })
      : await this.db.query.users.findFirst({
          where: eq(users.email, anamnese.email),
          columns: { id: true, role: true },
        });

    if (linkedUser && isStaffRole(linkedUser.role)) {
      throw new ConflictException(
        'Este e-mail pertence a uma conta interna da equipe e não pode ser convertido em paciente.',
      );
    }

    const tempPassword = generateTempPassword();
    const isNewAccount = !linkedUser;

    // Tudo numa transação: se qualquer passo falhar, nada é persistido.
    const result = await this.db.transaction(async (tx) => {
      let userId: string;

      if (linkedUser) {
        userId = linkedUser.id;
      } else {
        const passwordHash = await this.passwordService.hash(tempPassword);
        const [newUser] = await tx
          .insert(users)
          .values({
            email: anamnese.email,
            name: anamnese.nome,
            passwordHash,
            role: 'patient',
          })
          .returning({ id: users.id });
        userId = newUser!.id;
      }

      const [patient] = await tx
        .insert(patients)
        .values({ userId, anamneseId })
        .returning();

      await tx
        .update(anamneseSubmissions)
        .set({ leadStatus: 'convertido', updatedAt: new Date() })
        .where(eq(anamneseSubmissions.id, anamneseId));

      return patient!;
    });

    return {
      patient: result,
      email: anamnese.email,
      tempPassword: isNewAccount ? tempPassword : null,
      isNewAccount,
    };
  }

  async findOne(id: string) {
    const patient = await this.db.query.patients.findFirst({
      where: eq(patients.id, id),
      columns: {
        id: true,
        status: true,
        startedAt: true,
        notes: true,
        createdAt: true,
      },
      with: {
        user: {
          columns: { id: true, name: true, email: true, isActive: true },
        },
        anamnese: true,
        weightLogs: {
          orderBy: [asc(weightLogs.measuredAt)],
        },
      },
    });

    if (!patient) throw new NotFoundException('Paciente não encontrado');
    return patient;
  }

  async updatePatient(
    id: string,
    input: { status?: PatientStatus; notes?: string },
  ) {
    const [row] = await this.db
      .update(patients)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning({
        id: patients.id,
        status: patients.status,
        notes: patients.notes,
      });

    if (!row) throw new NotFoundException('Paciente não encontrado');
    return row;
  }

  async addWeightLog(
    patientId: string,
    input: { weightKg: number; measuredAt: Date; notes?: string },
  ) {
    const patient = await this.db.query.patients.findFirst({
      where: eq(patients.id, patientId),
      columns: { id: true },
    });
    if (!patient) throw new NotFoundException('Paciente não encontrado');

    const [row] = await this.db
      .insert(weightLogs)
      .values({
        patientId,
        weightKg: String(input.weightKg),
        measuredAt: input.measuredAt,
        source: 'portal',
        notes: input.notes ?? null,
      })
      .returning();

    return row!;
  }

  async findWeightLogs(patientId: string) {
    const patient = await this.db.query.patients.findFirst({
      where: eq(patients.id, patientId),
      columns: { id: true },
    });
    if (!patient) throw new NotFoundException('Paciente não encontrado');

    return this.db.query.weightLogs.findMany({
      where: eq(weightLogs.patientId, patientId),
      orderBy: [desc(weightLogs.measuredAt)],
    });
  }
}
