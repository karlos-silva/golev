'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, ClipboardList, Users, CalendarDays, Inbox, CreditCard, Settings, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/app/logo';
import { useLogout } from '@/hooks/use-auth';
import { useSidebar } from '@/stores/sidebar';
import { useAuth } from '@/stores/auth';
import { hasPermission, Permission } from '@golev/shared';

// Cada área declara a capability que exige (RBAC). O menu deriva da matriz
// papel→permissões em @golev/shared — mesma fonte do middleware e da API.
const navigation = [
  { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard, permission: Permission.VIEW_DASHBOARD },
  { name: 'Avaliações', href: '/avaliacoes', icon: ClipboardList, permission: Permission.VIEW_LEADS },
  { name: 'Clientes', href: '/clients', icon: Users, permission: Permission.VIEW_PATIENTS },
  { name: 'Consultas', href: '/appointments', icon: CalendarDays, permission: Permission.MANAGE_APPOINTMENTS },
  { name: 'Solicitações', href: '/solicitacoes', icon: Inbox, permission: Permission.MANAGE_REQUESTS },
  { name: 'Faturamento', href: '/billing', icon: CreditCard, permission: Permission.MANAGE_BILLING },
  { name: 'Configurações', href: '/settings', icon: Settings, permission: Permission.MANAGE_SETTINGS },
];

export function AppSidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const { isOpen, close } = useSidebar();
  const role = useAuth((s) => s.user?.role);
  const items = navigation.filter((item) => hasPermission(role, item.permission));

  // Fecha a gaveta ao trocar de rota (mobile).
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      {/* Backdrop (só mobile, com a gaveta aberta) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(30,36,38,0.5)' }}
          onClick={close}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-200 ease-out',
          'lg:relative lg:translate-x-0 lg:z-auto flex-shrink-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        style={{ background: 'var(--gl-primary-strong)' }}
      >
        {/* Logo + fechar (mobile) */}
        <div className="flex h-16 items-center justify-between px-5 flex-shrink-0">
          <Link href="/dashboard" className="transition-opacity hover:opacity-80">
            <Logo size="sm" className="gl-wordmark--on-dark" />
          </Link>
          <button
            onClick={close}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'text-white' : 'hover:text-white/80 transition-colors',
                )}
                style={
                  isActive
                    ? { background: 'rgba(255,255,255,0.12)', color: 'white' }
                    : { color: 'rgba(255,255,255,0.55)' }
                }
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé — logout */}
        <div className="flex-shrink-0 px-3 pb-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => logout.mutate()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
