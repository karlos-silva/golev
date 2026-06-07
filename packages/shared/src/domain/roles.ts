/**
 * Roles reais do produto Go Lev (a coluna `users.role` é texto livre; estes são
 * os valores em uso). Fonte única — front e back importam daqui em vez de
 * repetir strings. O enum legado `Role` (owner/admin/member) do template SaaS
 * permanece em ./index para o sistema de permissions herdado; estes são os
 * papéis que o produto de saúde realmente usa.
 *
 * - admin   → equipe / fundadores (acesso total ao portal)
 * - doctor  → corpo médico (portal)
 * - patient → cliente final (app do paciente, self-service /me)
 */
export const AppRole = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
} as const;

export type AppRole = (typeof AppRole)[keyof typeof AppRole];

/** Roles internas da equipe — acesso ao portal e a dados de leads/pacientes. */
export const STAFF_ROLES = [AppRole.ADMIN, AppRole.DOCTOR] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

/** Roles do cliente final — acesso apenas aos próprios dados via /me. */
export const CLIENT_ROLES = [AppRole.PATIENT] as const;
export type ClientRole = (typeof CLIENT_ROLES)[number];

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return !!role && (STAFF_ROLES as readonly string[]).includes(role);
}

export function isPatientRole(
  role: string | null | undefined,
): role is ClientRole {
  return role === AppRole.PATIENT;
}
