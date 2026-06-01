import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

export type AuthenticatedUser = {
  userId: string;
  tenantId: string;
  role: string;
};

type RequestWithUser = { user?: AuthenticatedUser };

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser] | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) {
      return undefined;
    }
    if (data === undefined) {
      return user;
    }
    return user[data];
  },
);
