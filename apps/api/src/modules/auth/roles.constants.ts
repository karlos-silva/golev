/**
 * Roles internas da equipe Go Lev — têm acesso ao portal e a dados de leads/
 * pacientes. Allowlist (deny-by-default): qualquer role fora desta lista
 * (ex.: 'patient') é tratada como externa e não acessa endpoints internos.
 *
 * - admin  → equipe / fundadores (acesso total)
 * - doctor → corpo médico (telas próprias no futuro; por ora vê tudo)
 */
export const STAFF_ROLES = ['admin', 'doctor'] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(role: string): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}
