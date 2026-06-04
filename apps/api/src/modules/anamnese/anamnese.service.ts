import { Inject, Injectable } from '@nestjs/common';
import {
  computeEligibility,
  CONSENT_TEXT,
  type AnamneseInput,
  type AnamneseResponse,
} from '@golev/shared';
import { sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../../database/database.module';
import { anamneseSubmissions, users } from '../../../drizzle/schema';

/**
 * Decisão de produto: persistimos apenas os elegíveis que concluem o fluxo.
 * Para também gravar inelegíveis, troque para `true`.
 */
const PERSIST_INELIGIBLE = false;

@Injectable()
export class AnamneseService {
  constructor(@Inject(DATABASE) private db: Database) {}

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
