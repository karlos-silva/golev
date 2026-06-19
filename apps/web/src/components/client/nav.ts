import {
  Home,
  LineChart,
  CalendarHeart,
  Salad,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

export interface ClientNavItem {
  /** Rótulo completo (sidebar desktop). */
  name: string;
  /** Rótulo curto (tab bar mobile). */
  short: string;
  href: string;
  icon: LucideIcon;
}

/** Navegação única do app do cliente — consumida pela sidebar (desktop) e pela tab bar (mobile). */
export const CLIENT_NAV: ClientNavItem[] = [
  { name: 'Início', short: 'Início', href: '/inicio', icon: Home },
  { name: 'Minha evolução', short: 'Evolução', href: '/evolucao', icon: LineChart },
  { name: 'Consultas', short: 'Consultas', href: '/consultas', icon: CalendarHeart },
  { name: 'Meu plano', short: 'Plano', href: '/plano', icon: Salad },
  { name: 'Minha conta', short: 'Conta', href: '/conta', icon: UserRound },
];

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
