import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 20, text: 'text-base' },
  md: { icon: 28, text: 'text-lg' },
  lg: { icon: 40, text: 'text-2xl' },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const s = sizes[size];

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Image
        src="/logo.svg"
        alt="Trianox"
        width={s.icon}
        height={s.icon}
        className=""
      />
      {showText && (
        <span className={cn('font-bold tracking-tight', s.text)}>
          Trianox<span className="text-brand">SaaS</span>
        </span>
      )}
    </span>
  );
}
