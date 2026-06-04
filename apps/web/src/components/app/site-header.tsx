'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/app/logo';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/#tratamentos', label: 'Tratamentos' },
  { href: '/#perguntas', label: 'Perguntas' },
];

/* Header da landing com estado de scroll: transparente sobre o hero,
   ganha fundo/blur/borda ao rolar. Inclui "Entrar" para quem já é cliente. */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300',
        scrolled
          ? 'border-b border-border bg-background/80 shadow-[0_1px_24px_-12px_rgba(31,59,76,0.25)] backdrop-blur supports-[backdrop-filter]:bg-background/65'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Go Lev — início">
          <Logo size="md" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-2 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/avaliacao" className={buttonVariants({ size: 'sm', className: 'group/btn' })}>
            Começar
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
