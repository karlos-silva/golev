/**
 * Fonte única de labels, formatação e cores de status do domínio de anamnese/
 * pacientes. Centralizado para evitar divergência entre as telas Avaliações e
 * Clientes. Cores derivam da paleta da marca (Azul & Creme) — sem hex avulso.
 */

export type LeadStatus =
  | 'novo'
  | 'contatado'
  | 'consulta_agendada'
  | 'consulta_realizada'
  | 'exames_enviados'
  | 'aprovado'
  | 'convertido'
  | 'descartado';

export type PatientStatus = 'active' | 'paused' | 'discharged';

export interface StatusVisual {
  label: string;
  bg: string;
  color: string;
  dot: string;
  /** Estado final — não pode ser revertido pelo dropdown. */
  terminal?: boolean;
}

/**
 * Pipeline de lead. Progressão de azul (claro → escuro) comunica avanço no
 * funil; coral marca os momentos de "ação humana"; `aprovado` é sólido (pop);
 * `descartado` usa o vinho (destructive da marca).
 */
export const LEAD_STATUS_CONFIG: Record<LeadStatus, StatusVisual> = {
  novo:               { label: 'Novo',               bg: 'var(--gl-support-tint)', color: 'var(--gl-primary)',        dot: 'var(--gl-primary)' },
  contatado:          { label: 'Contatado',          bg: 'var(--gl-accent-tint)',  color: 'var(--gl-accent-strong)',  dot: 'var(--gl-accent-strong)' },
  consulta_agendada:  { label: 'Consulta agendada',  bg: '#DCE6EA',                color: 'var(--gl-primary)',        dot: 'var(--gl-primary-soft)' },
  consulta_realizada: { label: 'Consulta realizada', bg: '#C2D4DB',                color: 'var(--gl-primary-strong)', dot: 'var(--gl-primary-strong)' },
  exames_enviados:    { label: 'Exames enviados',    bg: 'var(--gl-accent-tint)',  color: 'var(--gl-accent-strong)',  dot: 'var(--gl-accent)' },
  aprovado:           { label: 'Aprovado',           bg: 'var(--gl-primary-strong)', color: 'var(--gl-paper)',        dot: 'var(--gl-accent)' },
  convertido:         { label: 'Convertido',         bg: 'var(--gl-line)',         color: 'var(--gl-ink-3)',          dot: 'var(--gl-ink-3)', terminal: true },
  descartado:         { label: 'Descartado',         bg: '#F2E1DD',                color: 'var(--gl-destructive, #BC4B3C)', dot: '#BC4B3C', terminal: true },
};

export const PATIENT_STATUS_CONFIG: Record<PatientStatus, StatusVisual> = {
  active:     { label: 'Ativo',     bg: 'var(--gl-support-tint)', color: 'var(--gl-primary)', dot: 'var(--gl-primary)' },
  paused:     { label: 'Pausado',   bg: 'var(--gl-accent-tint)',  color: 'var(--gl-accent-strong)', dot: 'var(--gl-accent-strong)' },
  discharged: { label: 'Encerrado', bg: 'var(--gl-line)',         color: 'var(--gl-ink-3)', dot: 'var(--gl-ink-3)' },
};

export const OBJETIVO_LABELS: Record<string, string> = {
  saude_geral: 'Saúde geral',
  prevenir_problemas: 'Prevenção',
  corpo: 'Corpo',
  energia: 'Energia',
  saude_mental: 'Saúde mental',
  sono: 'Sono',
};

export const COMORBIDADE_LABELS: Record<string, string> = {
  diabetes_t2: 'Diabetes T2',
  pre_diabetes: 'Pré-diabetes',
  hipertensao: 'Hipertensão',
  colesterol: 'Colesterol',
  apneia: 'Apneia',
  nenhuma: 'Nenhuma',
};

export const CONTRAINDICACAO_LABELS: Record<string, string> = {
  pancreatite: 'Pancreatite',
  cancer_tireoide_men2: 'Câncer de tireoide / MEN2',
  transtorno_alimentar: 'Transtorno alimentar',
  nenhuma: 'Nenhuma',
};

export const TENTATIVA_LABELS: Record<string, string> = {
  primeira: 'Primeira tentativa',
  algumas: 'Algumas tentativas',
  muitas: 'Muitas tentativas',
};

export const MEDICACAO_LABELS: Record<string, string> = {
  tirzepatida: 'Tirzepatida',
  semaglutida: 'Semaglutida',
  nenhum: 'Nenhum',
};

export const SEX_LABELS: Record<string, string> = {
  feminino: 'Feminino',
  masculino: 'Masculino',
  na: 'Prefere não dizer',
};

export const REASON_LABELS: Record<string, string> = {
  imc_abaixo_minimo: 'IMC abaixo do mínimo (< 25)',
  contraindicacao_gravidez: 'Grávida ou amamentando',
  contraindicacao_cancer_tireoide: 'Histórico de câncer de tireoide / MEN2',
  idade_menor_18: 'Menor de 18 anos',
};

export function formatWhatsapp(n: string): string {
  const d = n.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return n;
}

/** Classificação do IMC para exibição. */
export function imcClass(imc: number): string {
  if (imc >= 30) return 'Obesidade';
  if (imc >= 25) return 'Sobrepeso';
  return 'Normal';
}
