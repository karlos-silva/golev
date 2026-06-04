import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/* Mesma linguagem do .gl-input (globals.css): raio 8px, altura confortável,
   foco com borda primária + anel suave em support-tint. Um só input no app. */
const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border border-input bg-surface px-4 text-[15px] text-foreground shadow-sm',
          'transition-[border-color,box-shadow] duration-150',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'placeholder:text-ink-3',
          'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-support-tint',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
