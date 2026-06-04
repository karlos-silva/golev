import { z } from 'zod';
import {
  OBJETIVO_VALUES,
  SEXO_VALUES,
  TENTATIVAS_VALUES,
  COMORBIDADE_VALUES,
  CONTRAINDICACAO_VALUES,
  TRATAMENTO_PREVIO_VALUES,
  MEDICACAO_VALUES,
  Comorbidade,
  Contraindicacao,
  Medicacao,
  TratamentoPrevio,
  EligibilityReason,
} from '../domain/anamnese';

/** Texto de consentimento (LGPD) exibido no front e gravado como snapshot no back. */
export const CONSENT_TEXT =
  'Concordo em ser contatado(a) pela Go Lev e com o tratamento dos meus dados de saúde para esta avaliação, conforme a Política de Privacidade.';

const exclusiveNone =
  (none: string) =>
  (arr: readonly string[]): boolean =>
    !arr.includes(none) || arr.length === 1;

/**
 * Campos do questionário (sem o cross-field refine), exposto à parte para o
 * front validar campo a campo via `anamneseFieldsSchema.shape.<campo>`.
 */
export const anamneseFieldsSchema = z.object({
  objetivos: z
    .array(z.enum(OBJETIVO_VALUES))
    .min(1, 'Selecione ao menos um objetivo'),
  sexo: z.enum(SEXO_VALUES),
  idade: z.coerce
    .number({ invalid_type_error: 'Informe sua idade' })
    .int('Use um número inteiro')
    .min(18, 'É necessário ter 18 anos ou mais')
    .max(99, 'Confira a idade informada'),
  alturaCm: z.coerce
    .number({ invalid_type_error: 'Informe sua altura' })
    .int('Use a altura em centímetros (ex.: 168)')
    .min(120, 'Informe a altura em centímetros (ex.: 168)')
    .max(230, 'Confira a altura informada'),
  pesoKg: z.coerce
    .number({ invalid_type_error: 'Informe seu peso' })
    .min(30, 'Confira o peso informado')
    .max(350, 'Confira o peso informado'),
  tentativas: z.enum(TENTATIVAS_VALUES),
  comorbidades: z
    .array(z.enum(COMORBIDADE_VALUES))
    .min(1, 'Selecione uma opção')
    .refine(exclusiveNone(Comorbidade.NENHUMA), {
      message: 'Se marcou "Nenhuma", desmarque as outras',
    }),
  contraindicacoes: z
    .array(z.enum(CONTRAINDICACAO_VALUES))
    .min(1, 'Selecione uma opção')
    .refine(exclusiveNone(Contraindicacao.NENHUMA), {
      message: 'Se marcou "Nenhuma", desmarque as outras',
    }),
  gravidaOuAmamentando: z.boolean().optional(),
  tratamentoPrevio: z.enum(TRATAMENTO_PREVIO_VALUES),
  medicacoes: z.array(z.enum(MEDICACAO_VALUES)).default([]),
  nome: z.string().trim().min(2, 'Informe seu nome'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  whatsapp: z
    .string()
    .transform((s) => s.replace(/\D/g, ''))
    .refine((d) => d.length === 10 || d.length === 11, 'WhatsApp inválido'),
  consent: z
    .boolean()
    .refine((v) => v === true, 'É necessário concordar para continuar'),
  utmSource: z.string().max(255).optional(),
  utmMedium: z.string().max(255).optional(),
  utmCampaign: z.string().max(255).optional(),
  referrer: z.string().max(500).optional(),
});

export const anamneseSubmissionSchema = anamneseFieldsSchema.superRefine(
  (data, ctx) => {
    if (data.tratamentoPrevio === TratamentoPrevio.SIM) {
      if (data.medicacoes.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['medicacoes'],
          message: 'Selecione ao menos uma opção',
        });
      }
    } else if (data.medicacoes.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['medicacoes'],
        message: 'Inconsistência nas medicações informadas',
      });
    }
    if (
      data.medicacoes.includes(Medicacao.NENHUM) &&
      data.medicacoes.length > 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['medicacoes'],
        message: 'Se marcou "Nenhum desses", desmarque as outras',
      });
    }
  },
);

export type AnamneseInput = z.infer<typeof anamneseSubmissionSchema>;

/**
 * Regra de elegibilidade — knob único. Hoje: IMC >= 25 é elegível.
 * Para endurecer no futuro (ex.: ">= 30, ou >= 27 com comorbidade") basta
 * ajustar aqui e estender `computeEligibility` usando `COMORBIDITY_BMI`.
 */
export const ELIGIBILITY_CONFIG = {
  MIN_AGE: 18,
  MIN_BMI: 25,
  // COMORBIDITY_BMI: 27,
} as const;

export interface EligibilityResult {
  eligible: boolean;
  imc: number;
  reasons: EligibilityReason[];
}

/** IMC = peso(kg) / altura(m)². Arredondado a 1 casa. */
export function computeBmi(pesoKg: number, alturaCm: number): number {
  if (!pesoKg || !alturaCm) return 0;
  const m = alturaCm / 100;
  return Math.round((pesoKg / (m * m)) * 10) / 10;
}

type EligibilityInput = {
  idade: number;
  alturaCm: number;
  pesoKg: number;
  contraindicacoes: readonly string[];
  gravidaOuAmamentando?: boolean;
};

/**
 * Fonte da verdade da elegibilidade. Pura — o front usa para preview e o back
 * recalcula no servidor (autoridade). Coleta TODOS os motivos aplicáveis.
 */
export function computeEligibility(input: EligibilityInput): EligibilityResult {
  const imc = computeBmi(input.pesoKg, input.alturaCm);
  const reasons: EligibilityReason[] = [];

  if (input.idade < ELIGIBILITY_CONFIG.MIN_AGE) {
    reasons.push(EligibilityReason.IDADE_MENOR_18);
  }
  if (input.gravidaOuAmamentando === true) {
    reasons.push(EligibilityReason.CONTRAINDICACAO_GRAVIDEZ);
  }
  if (input.contraindicacoes.includes(Contraindicacao.CANCER_TIREOIDE_MEN2)) {
    reasons.push(EligibilityReason.CONTRAINDICACAO_CANCER_TIREOIDE);
  }
  if (imc < ELIGIBILITY_CONFIG.MIN_BMI) {
    reasons.push(EligibilityReason.IMC_ABAIXO_MINIMO);
  }

  const eligible = reasons.length === 0;
  if (eligible) reasons.push(EligibilityReason.IMC_SUFICIENTE);

  return { eligible, imc, reasons };
}
