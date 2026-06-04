import { cn } from '@/lib/utils';

/* Rótulo editorial numerado usado no topo das seções da landing:
   número em serifa pêssego + label em caixa alta + filete que se estende.
   Promovido de page.tsx para virar primitivo de marca reutilizável. */
export function Kicker({
  n,
  label,
  className,
}: {
  n: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-8 flex items-center gap-3', className)}>
      <span className="font-serif text-sm italic text-brand">{n}</span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-3">{label}</span>
      <span aria-hidden className="ml-1 h-px flex-1 bg-border" />
    </div>
  );
}
