'use client';

import Link from 'next/link';
import { Logo } from '@/components/app/logo';
import { useAuth } from '@/stores/auth';

/**
 * Top bar slim estilo app (mobile): pena + wordmark à esquerda, avatar à direita
 * (atalho para "Minha conta"). Respeita a safe-area do topo (notch). Só em <lg.
 */
export function MobileTopBar() {
  const user = useAuth((s) => s.user);
  const initial = (user?.name?.trim()?.[0] ?? 'V').toUpperCase();

  return (
    <header
      className="lg:hidden flex-shrink-0 flex items-center justify-between h-14 px-4"
      style={{
        background: 'rgba(248,248,245,0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--gl-line)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <Link href="/inicio" className="transition-opacity active:opacity-70" aria-label="Início">
        <Logo size="sm" />
      </Link>
      <Link
        href="/conta"
        aria-label="Minha conta"
        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-transform active:scale-95"
        style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)', WebkitTapHighlightColor: 'transparent' }}
      >
        {initial}
      </Link>
    </header>
  );
}
