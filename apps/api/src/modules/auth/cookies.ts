import type { FastifyReply } from 'fastify';
import type { ConfigService } from '@nestjs/config';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
export const ROLE_COOKIE = 'gl_role';

// 7 dias (em segundos) — alinhado à validade do refresh token.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

interface CookieBase {
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  domain?: string;
}

function baseOptions(config: ConfigService): CookieBase {
  // Secure só em produção (https). Domain só em prod (ex.: ".golev.app.br") para
  // o cookie ser legível tanto pela api.* quanto pelo domínio principal.
  const secure = config.get<string>('NODE_ENV') === 'production';
  const domain = config.get<string>('COOKIE_DOMAIN')?.trim() || undefined;
  return { secure, sameSite: 'lax', path: '/', domain };
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Seta os cookies de sessão. `access_token`/`refresh_token` são httpOnly (JS não
 * lê → imune a roubo por XSS). `gl_role` é legível (hint p/ middleware/UI). CSRF
 * é mitigado por SameSite=Lax (a API não tem GET que muta estado) + allowlist
 * de CORS.
 */
export function setAuthCookies(
  reply: FastifyReply,
  config: ConfigService,
  tokens: TokenPair,
  role: string,
): void {
  const base = baseOptions(config);
  reply.setCookie(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
  });
  reply.setCookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...base,
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
  });
  reply.setCookie(ROLE_COOKIE, role, {
    ...base,
    httpOnly: false,
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAuthCookies(
  reply: FastifyReply,
  config: ConfigService,
): void {
  const base = baseOptions(config);
  reply.clearCookie(ACCESS_COOKIE, base);
  reply.clearCookie(REFRESH_COOKIE, base);
  reply.clearCookie(ROLE_COOKIE, base);
}
