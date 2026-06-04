import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'brand' | 'support' | 'outline' | 'solid';

const variants: Record<BadgeVariant, string> = {
  // pêssego suave — destaque editorial
  brand: 'bg-brand-tint text-brand',
  // azul-acinzentado — neutro de marca
  support: 'bg-support-tint text-primary-strong',
  // contorno em vidro — sobre fundos com gradiente
  outline: 'border border-white/55 bg-white/45 text-brand backdrop-blur',
  // sólido primário
  solid: 'bg-primary text-primary-foreground',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Mostra um ponto colorido antes do texto. */
  dot?: boolean;
}

export function Badge({ className, variant = 'support', dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-soft" />}
      {children}
    </span>
  );
}
