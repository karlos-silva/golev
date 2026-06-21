import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { and, eq, desc, asc } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import {
  patients,
  weightLogs,
  dietPlans,
  users,
  anamneseSubmissions,
} from '../../../drizzle/schema';
import { PasswordService } from '../auth/password.service';
import { TokenService } from '../auth/token.service';
import { MailService } from '../mail/mail.service';
import { isStaffRole } from '../auth/roles.constants';
import type { DietPlanUpsertInput } from '@golev/shared';

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
    private tokenService: TokenService,
    private mail: MailService,
  ) {}

  async findAll() {
    return this.db.query.patients.findMany({
      orderBy: [desc(patients.createdAt)],
      with: {
        user: {
          columns: { id: true, name: true, email: true, isActive: true },
        },
        // Só o IMC da avaliação inicial (snapshot). O perfil vivo (telefone,
        // comorbidades) vem das colunas de patients — reflete edições do paciente.
        anamnese: {
          columns: {
            id: true,
            imc: true,
          },
        },
      },
      columns: {
        id: true,
        status: true,
        startedAt: true,
        notes: true,
        createdAt: true,
        phone: true,
        comorbidities: true,
      },
    });
  }

  /**
   * Provisiona a conta do paciente a partir de um lead elegível. Idempotente: o
   * uniqueIndex(patients.anamneseId) impede conversão dupla (seguro p/ ser
   * chamado tanto pela equipe no portal quanto pelo webhook de pagamento).
   * 1. Cria/reusa a conta user (role=patient) com senha temporária + mustReset
   * 2. Cria registro patients
   * 3. Marca anamnese como convertida
   * 4. Para conta NOVA, envia o e-mail de boas-vindas com link de 1º acesso
   */
  async provisionPatientAccount(anamneseId: string) {
    const anamnese = await this.db.query.anamneseSubmissions.findFirst({
      where: eq(anamneseSubmissions.id, anamneseId),
      columns: {
        id: true,
        nome: true,
        email: true,
        eligible: true,
        userId: true,
        // Snapshot do lead → copiado pro perfil do paciente na conversão.
        sexo: true,
        idade: true,
        birthDate: true,
        alturaCm: true,
        pesoKg: true,
        whatsapp: true,
        objetivos: true,
        comorbidades: true,
        medicacoes: true,
        contraindicacoes: true,
        consentAt: true,
        createdAt: true,
      },
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
            // Senha temporária → paciente define a própria no 1º acesso.
            mustResetPassword: true,
          })
          .returning({ id: users.id });
        userId = newUser!.id;
      }

      // Snapshot do lead vira o perfil do paciente — a partir daqui ele vive em
      // `patients` e o lead pode ser purgado sem perder o perfil clínico.
      // Usa a data de nascimento exata do funil; lead antigo (sem ela) cai no
      // fallback aproximado do ano (1º de janeiro).
      const birthYear = anamnese.createdAt.getFullYear() - anamnese.idade;
      const birthDate = anamnese.birthDate ?? `${birthYear}-01-01`;
      const [patient] = await tx
        .insert(patients)
        .values({
          userId,
          anamneseId,
          sex: anamnese.sexo,
          birthDate,
          heightCm: anamnese.alturaCm,
          phone: anamnese.whatsapp,
          goals: anamnese.objetivos,
          comorbidities: anamnese.comorbidades,
          medications: anamnese.medicacoes,
          contraindications: anamnese.contraindicacoes,
        })
        .returning();

      // Peso da avaliação inicial entra como o 1º ponto da série de pesagens.
      await tx.insert(weightLogs).values({
        patientId: patient!.id,
        weightKg: anamnese.pesoKg,
        measuredAt: anamnese.consentAt ?? anamnese.createdAt,
        source: 'anamnese',
      });

      await tx
        .update(anamneseSubmissions)
        .set({ leadStatus: 'convertido', updatedAt: new Date() })
        .where(eq(anamneseSubmissions.id, anamneseId));

      return patient!;
    });

    // Conta nova → e-mail de boas-vindas com link mágico p/ definir a senha
    // (não depende de a equipe repassar a senha temporária manualmente).
    if (isNewAccount) {
      const token = await this.tokenService.createPasswordResetToken(
        result.userId,
        60 * 24 * 7, // 7 dias para o 1º acesso
      );
      await this.mail.sendWelcome({
        to: anamnese.email,
        name: anamnese.nome,
        token,
      });
    }

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
        sex: true,
        birthDate: true,
        heightCm: true,
        phone: true,
        goals: true,
        comorbidities: true,
        medications: true,
        contraindications: true,
      },
      with: {
        user: {
          columns: { id: true, name: true, email: true, isActive: true },
        },
        // Perfil clínico vem das colunas de patients acima; o peso inicial é o
        // 1º weight_log (source='anamnese'). A anamnese não é mais lida aqui.
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

  /* ── Plano alimentar (escrito pela equipe, lido pelo paciente) ─────────── */

  async getDietPlan(patientId: string) {
    const patient = await this.db.query.patients.findFirst({
      where: eq(patients.id, patientId),
      columns: { id: true },
    });
    if (!patient) throw new NotFoundException('Paciente não encontrado');

    const plan = await this.db.query.dietPlans.findFirst({
      where: and(
        eq(dietPlans.patientId, patientId),
        eq(dietPlans.status, 'active'),
      ),
      orderBy: [desc(dietPlans.updatedAt)],
      with: { doctor: { columns: { id: true, name: true } } },
    });
    return plan ?? null;
  }

  /** Cria ou atualiza o plano alimentar ativo do paciente. */
  async upsertDietPlan(
    patientId: string,
    doctorId: string,
    input: DietPlanUpsertInput,
  ) {
    const patient = await this.db.query.patients.findFirst({
      where: eq(patients.id, patientId),
      columns: { id: true },
    });
    if (!patient) throw new NotFoundException('Paciente não encontrado');

    const existing = await this.db.query.dietPlans.findFirst({
      where: and(
        eq(dietPlans.patientId, patientId),
        eq(dietPlans.status, 'active'),
      ),
      orderBy: [desc(dietPlans.updatedAt)],
      columns: { id: true },
    });

    const status = input.status ?? 'active';

    if (existing) {
      const [row] = await this.db
        .update(dietPlans)
        .set({
          title: input.title,
          content: input.content,
          fileUrl: input.fileUrl ?? null,
          status,
          doctorId,
          updatedAt: new Date(),
        })
        .where(eq(dietPlans.id, existing.id))
        .returning();
      return row!;
    }

    try {
      const [row] = await this.db
        .insert(dietPlans)
        .values({
          patientId,
          doctorId,
          title: input.title,
          content: input.content,
          fileUrl: input.fileUrl ?? null,
          status,
        })
        .returning();
      return row!;
    } catch (e) {
      // Corrida com o índice único parcial (um plano ativo por paciente):
      // já existe um ativo — atualiza ele em vez de inserir.
      if ((e as { code?: string }).code === '23505') {
        const active = await this.db.query.dietPlans.findFirst({
          where: and(
            eq(dietPlans.patientId, patientId),
            eq(dietPlans.status, 'active'),
          ),
          orderBy: [desc(dietPlans.updatedAt)],
          columns: { id: true },
        });
        if (active) {
          const [row] = await this.db
            .update(dietPlans)
            .set({
              title: input.title,
              content: input.content,
              fileUrl: input.fileUrl ?? null,
              status,
              doctorId,
              updatedAt: new Date(),
            })
            .where(eq(dietPlans.id, active.id))
            .returning();
          return row!;
        }
      }
      throw e;
    }
  }
}
