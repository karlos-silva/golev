import { Injectable, CanActivate, ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../decorators/current-user.decorator';

type RequestWithUser = { user?: AuthenticatedUser };

/**
 * Barra qualquer acesso enquanto a conta ainda usa senha temporária
 * (mustResetPassword=true no JWT). O usuário precisa chamar POST
 * /auth/change-password primeiro — que emite um token novo sem a flag.
 */
@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.user?.mustResetPassword) {
      throw new ForbiddenException(
        'Defina sua nova senha para continuar.',
      );
    }
    return true;
  }
}
