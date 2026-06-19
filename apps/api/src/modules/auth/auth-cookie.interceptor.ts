import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply } from 'fastify';
import type { AuthResponse } from '@golev/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { setAuthCookies } from './cookies';

function isAuthResponse(value: unknown): value is AuthResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'tokens' in value &&
    'user' in value
  );
}

/**
 * Para respostas { user, tokens }, seta os tokens como cookies httpOnly e os
 * REMOVE do corpo JSON — o JS nunca vê o token (defesa contra roubo via XSS).
 */
@Injectable()
export class AuthCookieInterceptor implements NestInterceptor {
  constructor(private config: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    return next.handle().pipe(
      map((data: unknown) => {
        if (isAuthResponse(data)) {
          setAuthCookies(reply, this.config, data.tokens, data.user.role);
          return { user: data.user };
        }
        return data;
      }),
    );
  }
}
