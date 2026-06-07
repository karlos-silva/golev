'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

/* ============================================================================
   Primitivos da ÁREA DO CLIENTE (paciente). Tom acolhedor e sereno da Go Lev:
   superfícies claras, cantos suaves, hairlines (sem sombras pesadas), acento
   pêssego com contenção e números grandes em Newsreader itálico (a métrica é o
   herói emocional da jornada). Cores sempre via tokens var(--gl-*).
   ========================================================================== */

/* ── Cabeçalho de página ──────────────────────────────────────────────────── */
export function PageHeader({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="gl-in flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {kicker && (
          <p
            className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--gl-ink-3)' }}
          >
            {kicker}
          </p>
        )}
        <h1
          className="text-[1.7rem] sm:text-3xl font-bold tracking-tight leading-tight"
          style={{ color: 'var(--gl-ink)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/** Palavra de ênfase editorial (Newsreader itálico, acento). Uma por tela. */
export function Accent({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500, color: 'var(--gl-accent-strong)' }}>
      {children}
    </span>
  );
}

/* ── Cartão de seção ──────────────────────────────────────────────────────── */
export function SectionCard({
  title,
  icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`rounded-2xl overflow-hidden ${className ?? ''}`}
      style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}
    >
      {(title || action) && (
        <header
          className="flex items-center justify-between gap-3 px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--gl-line)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}
              >
                {icon}
              </span>
            )}
            {title && (
              <h2
                className="text-[13px] font-semibold uppercase tracking-wider truncate"
                style={{ color: 'var(--gl-ink-2)' }}
              >
                {title}
              </h2>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName ?? 'p-5'}>{children}</div>
    </section>
  );
}

/* ── Métrica (número grande em serifa itálica) ───────────────────────────── */
export function Metric({
  label,
  value,
  sub,
  icon,
  accent,
  tone,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  accent?: boolean;
  /** Cor do número (ex.: verde de "perdeu peso"). Default ink. */
  tone?: string;
}) {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl p-5"
      style={{
        background: 'var(--gl-surface)',
        border: '1px solid var(--gl-line)',
        borderTop: `3px solid ${accent ? 'var(--gl-accent)' : 'var(--gl-primary)'}`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gl-ink-3)' }}>
          {label}
        </span>
        {icon && (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{
              background: accent ? 'var(--gl-accent-tint)' : 'var(--gl-support-tint)',
              color: accent ? 'var(--gl-accent-strong)' : 'var(--gl-primary)',
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <div>
        <div
          className="text-[1.9rem] leading-none tracking-tight"
          style={{ color: tone ?? 'var(--gl-ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500 }}
        >
          {value}
        </div>
        {sub && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Pílula de status ─────────────────────────────────────────────────────── */
export function StatusPill({
  label,
  bg,
  color,
  dot,
}: {
  label: string;
  bg: string;
  color: string;
  dot?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />}
      {label}
    </span>
  );
}

/* ── Estado vazio (gentil) ────────────────────────────────────────────────── */
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-12 text-center"
      style={{
        border: '1px dashed var(--gl-line)',
        backgroundImage: 'radial-gradient(var(--gl-line) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}
    >
      {icon && (
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}
        >
          {icon}
        </span>
      )}
      <p className="text-base font-semibold" style={{ color: 'var(--gl-ink)' }}>
        {title}
      </p>
      {children && (
        <p className="max-w-sm text-sm leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
          {children}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

/* ── Campo de formulário ──────────────────────────────────────────────────── */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium" style={{ color: 'var(--gl-ink)' }}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
          {hint}
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ── Modal (overlay + ESC + lock scroll) ──────────────────────────────────── */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="gl-overlay fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(30,36,38,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="gl-modal w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--gl-line)' }}
        >
          <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--gl-ink-3)' }}
            aria-label="Fechar"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </header>
        <div className="px-5 py-5">{children}</div>
        {footer && (
          <footer className="px-5 py-4" style={{ borderTop: '1px solid var(--gl-line)' }}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/* ── Telas utilitárias ───────────────────────────────────────────────────── */
export function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <p className="text-sm" style={{ color: 'var(--gl-ink-3)' }}>
        {children}
      </p>
    </div>
  );
}
