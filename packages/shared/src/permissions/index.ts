/**
 * RBAC por capability do portal Go Lev. A política de autorização vive AQUI —
 * uma matriz única papel→permissões + o mapa área→permissão. O menu (sidebar),
 * o middleware e o redirect de login DERIVAM deste arquivo; a API faz o deny
 * real via PermissionsGuard. Não repita listas de rotas/papéis pelo código.
 *
 * Capabilities, não papéis: checar `hasPermission(role, MANAGE_BILLING)` em vez
 * de `role === 'admin'` torna adicionar papéis (recepção, enfermagem, financeiro…)
 * uma questão de editar a matriz — sem caçar `if (isAdmin)` espalhado.
 */
import { AppRole } from '../domain/roles';

export const Permission = {
  // Gestão — exclusivo do admin.
  VIEW_DASHBOARD: 'dashboard:view', // métricas de negócio (conversão, funil)
  MANAGE_BILLING: 'billing:manage', // faturamento da empresa
  MANAGE_SETTINGS: 'settings:manage', // configurações de sistema
  // Operacional — equipe clínica (admin + doctor).
  VIEW_LEADS: 'leads:view', // avaliações / pré-anamneses
  VIEW_PATIENTS: 'patients:view', // clientes / pacientes
  MANAGE_APPOINTMENTS: 'appointments:manage', // consultas
  MANAGE_REQUESTS: 'requests:manage', // solicitações de consulta
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

const OPERATIONAL: Permission[] = [
  Permission.VIEW_LEADS,
  Permission.VIEW_PATIENTS,
  Permission.MANAGE_APPOINTMENTS,
  Permission.MANAGE_REQUESTS,
];

/** Matriz única papel→permissões — a fonte de verdade da autorização do portal. */
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  [AppRole.ADMIN]: Object.values(Permission), // admin = todas
  [AppRole.DOCTOR]: OPERATIONAL, // doctor = só operacional
  [AppRole.PATIENT]: [], // patient não acessa o portal
};

export function hasPermission(
  role: string | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role as AppRole];
  return !!perms && perms.includes(permission);
}

/**
 * Mapa área→permissão do portal: cada prefixo de rota exige uma capability.
 * Fonte única consumida pelo menu, pelo middleware e pelo redirect de login.
 */
export const PORTAL_AREAS = [
  { prefix: '/dashboard', permission: Permission.VIEW_DASHBOARD },
  { prefix: '/avaliacoes', permission: Permission.VIEW_LEADS },
  { prefix: '/clients', permission: Permission.VIEW_PATIENTS },
  { prefix: '/appointments', permission: Permission.MANAGE_APPOINTMENTS },
  { prefix: '/solicitacoes', permission: Permission.MANAGE_REQUESTS },
  { prefix: '/billing', permission: Permission.MANAGE_BILLING },
  { prefix: '/settings', permission: Permission.MANAGE_SETTINGS },
] as const;

/** A permissão exigida por um pathname do portal, ou null se não é área guardada. */
export function permissionForPath(pathname: string): Permission | null {
  const area = PORTAL_AREAS.find(
    (a) => pathname === a.prefix || pathname.startsWith(`${a.prefix}/`),
  );
  return area ? area.permission : null;
}

/** Home do portal conforme as permissões do papel (admin→dashboard, demais→clientes). */
export function portalHome(role: string | null | undefined): string {
  return hasPermission(role, Permission.VIEW_DASHBOARD)
    ? '/dashboard'
    : '/clients';
}
