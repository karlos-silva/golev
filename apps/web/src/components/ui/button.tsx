import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'default'
  | 'accent'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

/* ----------------------------------------------------------------------------
   Linguagem de botão da marca Go Lev. Os mesmos estilos são usados pelo
   componente <Button> e pelos <Link> da landing/funil via buttonVariants(),
   para que tudo fale a mesma língua (raio, peso, hover, foco).
   --------------------------------------------------------------------------- */

const base =
  'group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-45 active:translate-y-px';

const variantStyles: Record<ButtonVariant, string> = {
  default:
    'bg-primary text-primary-foreground shadow-sm hover:bg-primary-strong hover:shadow-md',
  accent:
    'bg-brand-soft text-on-accent shadow-sm hover:bg-brand hover:text-white hover:shadow-md',
  destructive:
    'bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-md',
  outline:
    'border border-border bg-surface text-foreground hover:border-foreground/40 hover:bg-support-tint/50',
  secondary:
    'bg-support-tint text-primary-strong hover:bg-support/40',
  ghost: 'text-foreground hover:bg-support-tint',
  link: 'text-brand underline-offset-4 hover:underline',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[13px]',
  default: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-[15px]',
  icon: 'h-11 w-11',
};

export interface ButtonVariantsOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** Devolve o conjunto de classes do botão — reutilizável por <Link>/<a>. */
export function buttonVariants({
  variant = 'default',
  size = 'default',
  className,
}: ButtonVariantsOptions = {}) {
  return cn(base, variantStyles[variant], sizeStyles[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
