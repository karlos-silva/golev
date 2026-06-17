import { Injectable, CanActivate, ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission, type Permission } from '@golev/shared';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { AuthenticatedUser } from '../decorators/current-user.decorator';

type RequestWithUser = { user?: AuthenticatedUser };

/**
 * Autoriza por capability (RBAC). Lê as permissions exigidas via @RequirePermissions
 * e as checa contra a matriz papel→permissões (@golev/shared). Espelha o RolesGuard,
 * mas desacoplado de papéis específicos. Requer o JwtAuthGuard antes (popula req.user).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !required.every((p) => hasPermission(user.role, p))) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
