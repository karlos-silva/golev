export type AppointmentStatus = 'agendada' | 'realizada' | 'cancelada' | 'falta';
export type AppointmentType = 'primeira' | 'retorno';

export interface StatusVisual {
  label: string;
  bg: string;
  color: string;
  dot: string;
}

export const APPOINTMENT_STATUS_CONFIG: Record<AppointmentStatus, StatusVisual> = {
  agendada:  { label: 'Agendada',  bg: 'var(--gl-support-tint)',  color: 'var(--gl-primary)',        dot: 'var(--gl-primary)' },
  realizada: { label: 'Realizada', bg: 'var(--gl-primary-strong)', color: 'var(--gl-paper)',          dot: 'var(--gl-accent)' },
  cancelada: { label: 'Cancelada', bg: '#F2E1DD',                 color: '#BC4B3C',                  dot: '#BC4B3C' },
  falta:     { label: 'Falta',     bg: 'var(--gl-accent-tint)',   color: 'var(--gl-accent-strong)',  dot: 'var(--gl-accent-strong)' },
};

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  primeira: 'Primeira consulta',
  retorno: 'Retorno',
};
