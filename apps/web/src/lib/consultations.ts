import type { StatusVisual } from './anamnese';

/** Visual das solicitações de consulta (status do pedido feito pelo paciente). */
export const CONSULTATION_REQUEST_STATUS_CONFIG: Record<string, StatusVisual> = {
  pendente: {
    label: 'Em análise',
    bg: 'var(--gl-accent-tint)',
    color: 'var(--gl-accent-strong)',
    dot: 'var(--gl-accent-strong)',
  },
  confirmada: {
    label: 'Confirmada',
    bg: 'var(--gl-support-tint)',
    color: 'var(--gl-primary)',
    dot: 'var(--gl-primary)',
  },
  recusada: {
    label: 'Não foi possível',
    bg: '#F2E1DD',
    color: '#BC4B3C',
    dot: '#BC4B3C',
  },
  cancelada: {
    label: 'Cancelada',
    bg: 'var(--gl-line)',
    color: 'var(--gl-ink-3)',
    dot: 'var(--gl-ink-3)',
  },
};

export const CONSULTATION_PERIOD_LABELS: Record<string, string> = {
  manha: 'De manhã',
  tarde: 'À tarde',
  noite: 'À noite',
  qualquer: 'Qualquer horário',
};
