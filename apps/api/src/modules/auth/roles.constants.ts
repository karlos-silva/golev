/**
 * Roles do produto Go Lev. Fonte única em `@golev/shared` (domain/roles) —
 * este arquivo só re-exporta para manter a superfície de import do back estável
 * (vários módulos importam `STAFF_ROLES`/`isStaffRole` daqui).
 *
 * - admin/doctor → STAFF_ROLES (portal interno, deny-by-default p/ os demais)
 * - patient      → cliente final (acessa apenas os próprios dados via /me)
 */
export {
  AppRole,
  STAFF_ROLES,
  CLIENT_ROLES,
  isStaffRole,
  isPatientRole,
} from '@golev/shared';
export type { StaffRole, ClientRole } from '@golev/shared';
