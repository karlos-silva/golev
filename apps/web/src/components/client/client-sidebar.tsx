'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/app/logo';
import { useLogout } from '@/hooks/use-auth';
import { useAuth } from '@/stores/auth';
import { CLIENT_NAV, isNavActive } from './nav';

/**
 * Sidebar do app do cliente — APENAS desktop (lg+). No mobile a navegação é a
 * MobileTabBar (tab bar inferior). Tom claro e acolhedor, distinto do portal
 * escuro da equipe.
 */
export function ClientSidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const user = useAuth((s) => s.user);

  const firstName = user?.name?.split(' ')[0] ?? 'Você';
  const initial = (user?.name?.trim()?.[0] ?? 'V').toUpperCase();

  return (
    <aside
      className="hidden lg:flex w-64 flex-col flex-shrink-0"
      style={{ background: 'var(--gl-surface)', borderRight: '1px solid var(--gl-line)' }}
    >
      <div className="flex h-16 items-center px-5 flex-shrink-0">
        <Link href="/inicio" className="transition-opacity hover:opacity-80">
          <Logo size="sm" />
        </Link>
      </div>

      <div className="px-5 pb-4 pt-1">
        <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
          Seu acompanhamento
        </p>
        <p
          className="text-lg leading-tight"
          style={{ color: 'var(--gl-ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500 }}
        >
          Olá, {firstName}
        </p>
      </div>

      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {CLIENT_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
              style={
                active
                  ? { background: 'var(--gl-support-tint)', color: 'var(--gl-primary-strong)', fontWeight: 600 }
                  : { color: 'var(--gl-ink-2)' }
              }
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'var(--gl-support-tint)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = '';
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
                  style={{ background: 'var(--gl-accent)' }}
                />
              )}
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex-shrink-0 p-3">
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
          style={{ background: 'var(--gl-support-tint)' }}
        >
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
          >
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold" style={{ color: 'var(--gl-ink)' }}>
              {user?.name ?? 'Você'}
            </p>
            <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
              Paciente
            </p>
          </div>
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
            style={{ color: 'var(--gl-ink-3)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gl-ink)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gl-ink-3)')}
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
