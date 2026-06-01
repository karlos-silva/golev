'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Settings, BarChart3, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/app/logo';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { useLogout } from '@/hooks/use-auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Membros', href: '/members', icon: Users },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/dashboard" className="transition-opacity hover:opacity-80">
          <Logo size="md" />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        <button
          onClick={() => logout.mutate()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
