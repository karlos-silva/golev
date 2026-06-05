import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  computeEligibility,
  CONSENT_TEXT,
  type AnamneseInput,
  type AnamneseResponse,
} from '@golev/shared';
import { sql, desc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import { anamneseSubmissions, users } from '../../../drizzle/schema';

export type LeadStatus =
  | 'novo'
  | 'contatado'
  | 'consulta_agendada'
  | 'consulta_realizada'
  | 'exames_enviados'
  | 'aprovado'
  | 'convertido'
  | 'descartado';

/**
 * Decisão de produto: persistimos apenas os elegíveis que concluem o fluxo.
 * Para também gravar inelegíveis, troque para `true`.
 */
const PERSIST_INELIGIBLE = false;

@Injectable()
export class AnamneseService {
  constructor(@Inject(DATABASE) private db: Database) {}

  async findAll() {
    return this.db.query.anamneseSubmissions.findMany({
      orderBy: [desc(anamneseSubmissions.createdAt)],
      columns: {
        id: true,
        leadStatus: true,
        nome: true,
        email: true,
        whatsapp: true,
        imc: true,
        eligible: true,
        idade: true,
        pesoKg: true,
        alturaCm: true,
        sexo: true,
        objetivos: true,
        comorbidades: true,
        contraindicacoes: true,
        tentativas: true,
        tratamentoPrevio: true,
        medicacoes: true,
        gravidaOuAmamentando: true,
        reasons: true,
        consentAt: true,
        createdAt: true,
      },
    });
  }

  async updateLeadStatus(id: string, status: LeadStatus) {
    const [row] = await this.db
      .update(anamneseSubmissions)
      .set({ leadStatus: status, updatedAt: new Date() })
      .where(eq(anamneseSubmissions.id, id))
      .returning({ id: anamneseSubmissions.id, leadStatus: anamneseSubmissions.leadStatus });

    if (!row) throw new NotFoundException('Avaliação não encontrada');
    return row;
  }

  async create(input: AnamneseInput): Promise<AnamneseResponse> {
    const result = computeEligibility(input);

    if (!result.eligible && !PERSIST_INELIGIBLE) {
      return {
        id: null,
        eligible: false,
        imc: result.imc,
        reasons: result.reasons,
      };
    }

    // Liga a um usuário existente se o e-mail já tem conta (não criamos conta
    // automaticamente). E-mail do input já vem normalizado em minúsculas.
    const existingUser = await this.db.query.users.findFirst({
      where: sql`lower(${users.email}) = ${input.email}`,
      columns: { id: true },
    });

    const [row] = await this.db
      .insert(anamneseSubmissions)
      .values({
        userId: existingUser?.id ?? null,
        objetivos: input.objetivos,
        sexo: input.sexo,
        idade: input.idade,
        alturaCm: input.alturaCm,
        pesoKg: String(input.pesoKg),
        tentativas: input.tentativas,
        comorbidades: input.comorbidades,
        contraindicacoes: input.contraindicacoes,
        gravidaOuAmamentando: input.gravidaOuAmamentando ?? null,
        tratamentoPrevio: input.tratamentoPrevio,
        medicacoes: input.medicacoes,
        imc: String(result.imc),
        eligible: result.eligible,
        reasons: result.reasons,
        nome: input.nome,
        email: input.email,
        whatsapp: input.whatsapp,
        consentAt: new Date(),
        consentText: CONSENT_TEXT,
        utmSource: input.utmSource ?? null,
        utmMedium: input.utmMedium ?? null,
        utmCampaign: input.utmCampaign ?? null,
        referrer: input.referrer ?? null,
      })
      .returning({ id: anamneseSubmissions.id });

    return {
      id: row!.id,
      eligible: result.eligible,
      imc: result.imc,
      reasons: result.reasons,
    };
  }
}
