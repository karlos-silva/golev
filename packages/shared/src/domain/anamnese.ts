/**
 * Domínio da pré-anamnese (questionário de elegibilidade para emagrecimento).
 * Fonte única dos `value`s usados tanto no front (render das opções) quanto no
 * back (validação Zod + lógica de elegibilidade). Os labels são apresentação e
 * vivem na config de perguntas do front.
 */

type EnumValues<T extends Record<string, string>> = [T[keyof T], ...T[keyof T][]];

function values<T extends Record<string, string>>(obj: T): EnumValues<T> {
  return Object.values(obj) as EnumValues<T>;
}

export const Objetivo = {
  SAUDE_GERAL: 'saude_geral',
  PREVENIR_PROBLEMAS: 'prevenir_problemas',
  CORPO: 'corpo',
  ENERGIA: 'energia',
  SAUDE_MENTAL: 'saude_mental',
  SONO: 'sono',
} as const;
export type Objetivo = (typeof Objetivo)[keyof typeof Objetivo];
export const OBJETIVO_VALUES = values(Objetivo);

export const Sexo = {
  FEMININO: 'feminino',
  MASCULINO: 'masculino',
  NA: 'na',
} as const;
export type Sexo = (typeof Sexo)[keyof typeof Sexo];
export const SEXO_VALUES = values(Sexo);

export const Tentativas = {
  MUITAS: 'muitas',
  ALGUMAS: 'algumas',
  PRIMEIRA: 'primeira',
} as const;
export type Tentativas = (typeof Tentativas)[keyof typeof Tentativas];
export const TENTATIVAS_VALUES = values(Tentativas);

export const Comorbidade = {
  DIABETES_T2: 'diabetes_t2',
  PRE_DIABETES: 'pre_diabetes',
  HIPERTENSAO: 'hipertensao',
  COLESTEROL: 'colesterol',
  APNEIA: 'apneia',
  NENHUMA: 'nenhuma',
} as const;
export type Comorbidade = (typeof Comorbidade)[keyof typeof Comorbidade];
export const COMORBIDADE_VALUES = values(Comorbidade);

export const Contraindicacao = {
  PANCREATITE: 'pancreatite',
  CANCER_TIREOIDE_MEN2: 'cancer_tireoide_men2',
  TRANSTORNO_ALIMENTAR: 'transtorno_alimentar',
  NENHUMA: 'nenhuma',
} as const;
export type Contraindicacao = (typeof Contraindicacao)[keyof typeof Contraindicacao];
export const CONTRAINDICACAO_VALUES = values(Contraindicacao);

export const TratamentoPrevio = {
  SIM: 'sim',
  NAO: 'nao',
} as const;
export type TratamentoPrevio = (typeof TratamentoPrevio)[keyof typeof TratamentoPrevio];
export const TRATAMENTO_PREVIO_VALUES = values(TratamentoPrevio);

export const Medicacao = {
  TIRZEPATIDA: 'tirzepatida',
  SEMAGLUTIDA: 'semaglutida',
  NENHUM: 'nenhum',
} as const;
export type Medicacao = (typeof Medicacao)[keyof typeof Medicacao];
export const MEDICACAO_VALUES = values(Medicacao);

/** Códigos (não prosa) do resultado de `computeEligibility`. O front mapeia para texto. */
export const EligibilityReason = {
  IMC_SUFICIENTE: 'imc_suficiente',
  IMC_ABAIXO_MINIMO: 'imc_abaixo_minimo',
  IDADE_MENOR_18: 'idade_menor_18',
  CONTRAINDICACAO_GRAVIDEZ: 'contraindicacao_gravidez',
  CONTRAINDICACAO_CANCER_TIREOIDE: 'contraindicacao_cancer_tireoide',
} as const;
export type EligibilityReason =
  (typeof EligibilityReason)[keyof typeof EligibilityReason];
