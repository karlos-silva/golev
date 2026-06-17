import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@golev/shared';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Exige TODAS as permissions informadas (AND). Espelha @Roles, mas autoriza por
 * capability (RBAC) em vez de papel específico — ver ROLE_PERMISSIONS em @golev/shared.
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
