import { describe, it, expect } from 'vitest';
import {
  anamneseSubmissionSchema,
  anamneseFieldsSchema,
  computeBmi,
  computeEligibility,
} from './anamnese';
import {
  Comorbidade,
  Contraindicacao,
  EligibilityReason,
  Medicacao,
  Objetivo,
  Sexo,
  Tentativas,
  TratamentoPrevio,
} from '../domain/anamnese';

function validInput(over: Record<string, unknown> = {}) {
  return {
    objetivos: [Objetivo.SAUDE_GERAL],
    sexo: Sexo.MASCULINO,
    birthDate: '1990-01-01',
    alturaCm: 165,
    pesoKg: 95,
    tentativas: Tentativas.ALGUMAS,
    comorbidades: [Comorbidade.NENHUMA],
    contraindicacoes: [Contraindicacao.NENHUMA],
    tratamentoPrevio: TratamentoPrevio.NAO,
    medicacoes: [],
    nome: 'Maria Silva',
    email: 'maria@example.com',
    whatsapp: '(11) 91234-5678',
    consent: true,
    ...over,
  };
}

describe('computeBmi', () => {
  it('arredonda a 1 casa', () => {
    expect(computeBmi(95, 165)).toBe(34.9);
    expect(computeBmi(55, 180)).toBe(17);
    expect(computeBmi(100, 200)).toBe(25);
  });
  it('é resiliente a zero', () => {
    expect(computeBmi(0, 170)).toBe(0);
    expect(computeBmi(80, 0)).toBe(0);
  });
});

describe('computeEligibility', () => {
  const base = { idade: 35, contraindicacoes: [Contraindicacao.NENHUMA] };

  it('IMC >= 25 → elegível', () => {
    const r = computeEligibility({ ...base, alturaCm: 165, pesoKg: 95 });
    expect(r.eligible).toBe(true);
    expect(r.reasons).toContain(EligibilityReason.IMC_SUFICIENTE);
  });

  it('IMC exatamente 25 → elegível (limite inclusivo)', () => {
    expect(
      computeEligibility({ ...base, alturaCm: 200, pesoKg: 100 }).eligible,
    ).toBe(true);
  });

  it('IMC < 25 (magro) → inelegível', () => {
    const r = computeEligibility({ ...base, alturaCm: 180, pesoKg: 55 });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain(EligibilityReason.IMC_ABAIXO_MINIMO);
  });

  it('idade < 18 → inelegível mesmo com IMC ok', () => {
    const r = computeEligibility({ ...base, idade: 17, alturaCm: 165, pesoKg: 95 });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain(EligibilityReason.IDADE_MENOR_18);
  });

  it('gravidez/amamentação → inelegível', () => {
    const r = computeEligibility({
      ...base,
      alturaCm: 165,
      pesoKg: 95,
      gravidaOuAmamentando: true,
    });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain(EligibilityReason.CONTRAINDICACAO_GRAVIDEZ);
  });

  it('câncer medular de tireoide/MEN2 → inelegível', () => {
    const r = computeEligibility({
      ...base,
      alturaCm: 165,
      pesoKg: 95,
      contraindicacoes: [Contraindicacao.CANCER_TIREOIDE_MEN2],
    });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain(
      EligibilityReason.CONTRAINDICACAO_CANCER_TIREOIDE,
    );
  });

  it('pancreatite/transtorno alimentar não bloqueiam (flags p/ a médica)', () => {
    const r = computeEligibility({
      ...base,
      alturaCm: 165,
      pesoKg: 95,
      contraindicacoes: [
        Contraindicacao.PANCREATITE,
        Contraindicacao.TRANSTORNO_ALIMENTAR,
      ],
    });
    expect(r.eligible).toBe(true);
  });

  it('coleta múltiplos motivos', () => {
    const r = computeEligibility({
      ...base,
      idade: 17,
      alturaCm: 180,
      pesoKg: 55,
    });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toEqual(
      expect.arrayContaining([
        EligibilityReason.IDADE_MENOR_18,
        EligibilityReason.IMC_ABAIXO_MINIMO,
      ]),
    );
  });
});

describe('anamneseSubmissionSchema', () => {
  it('aceita um envio válido e normaliza whatsapp/email', () => {
    const r = anamneseSubmissionSchema.safeParse(
      validInput({ email: '  Maria@Example.COM ', whatsapp: '(11) 91234-5678' }),
    );
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe('maria@example.com');
      expect(r.data.whatsapp).toBe('11912345678');
    }
  });

  it('rejeita data inválida, formato errado ou menor de idade', () => {
    expect(anamneseFieldsSchema.shape.birthDate.safeParse('abc').success).toBe(false);
    expect(anamneseFieldsSchema.shape.birthDate.safeParse('01/01/1990').success).toBe(false);
    expect(anamneseFieldsSchema.shape.birthDate.safeParse('2015-01-01').success).toBe(false);
    expect(anamneseFieldsSchema.shape.birthDate.safeParse('1990-01-01').success).toBe(true);
  });

  it('rejeita altura em metros e peso absurdo/negativo', () => {
    expect(anamneseFieldsSchema.shape.alturaCm.safeParse(1.75).success).toBe(false);
    expect(anamneseFieldsSchema.shape.pesoKg.safeParse(-5).success).toBe(false);
    expect(anamneseFieldsSchema.shape.pesoKg.safeParse('abc').success).toBe(false);
    expect(anamneseFieldsSchema.shape.pesoKg.safeParse(82).success).toBe(true);
  });

  it('exige consentimento', () => {
    expect(anamneseSubmissionSchema.safeParse(validInput({ consent: false })).success).toBe(false);
  });

  it('valida whatsapp inválido', () => {
    expect(anamneseSubmissionSchema.safeParse(validInput({ whatsapp: '123' })).success).toBe(false);
  });

  it('"Nenhuma" é exclusiva nas comorbidades', () => {
    expect(
      anamneseSubmissionSchema.safeParse(
        validInput({ comorbidades: [Comorbidade.NENHUMA, Comorbidade.DIABETES_T2] }),
      ).success,
    ).toBe(false);
  });

  it('medicações obrigatórias quando tratamentoPrévio = Sim', () => {
    expect(
      anamneseSubmissionSchema.safeParse(
        validInput({ tratamentoPrevio: TratamentoPrevio.SIM, medicacoes: [] }),
      ).success,
    ).toBe(false);
    expect(
      anamneseSubmissionSchema.safeParse(
        validInput({
          tratamentoPrevio: TratamentoPrevio.SIM,
          medicacoes: [Medicacao.SEMAGLUTIDA],
        }),
      ).success,
    ).toBe(true);
  });

  it('"Nenhum desses" é exclusivo nas medicações', () => {
    expect(
      anamneseSubmissionSchema.safeParse(
        validInput({
          tratamentoPrevio: TratamentoPrevio.SIM,
          medicacoes: [Medicacao.NENHUM, Medicacao.TIRZEPATIDA],
        }),
      ).success,
    ).toBe(false);
  });
});
