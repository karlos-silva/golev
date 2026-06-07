'use client';

import { Menu } from 'lucide-react';
import { AppSidebar } from '@/components/app/sidebar';
import { StaffAuthGate } from '@/components/app/staff-auth-gate';
import { Logo } from '@/components/app/logo';
import { useSidebar } from '@/stores/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toggle } = useSidebar();

  return (
    <StaffAuthGate>
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--gl-paper)' }}>
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top bar mobile (esconde em lg+) */}
        <header
          className="flex lg:hidden items-center justify-between h-14 px-4 flex-shrink-0"
          style={{ background: 'var(--gl-primary-strong)' }}
        >
          <Logo size="sm" className="gl-wordmark--on-dark" />
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col">
          {children}
        </main>
      </div>
    </div>
    </StaffAuthGate>
  );
}
