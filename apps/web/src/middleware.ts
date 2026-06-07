import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Páginas de autenticação públicas (login compartilhado entre app do cliente e portal).
const AUTH_PAGES = ['/login', '/forgot-password', '/redefinir-senha'];
// Rotas logadas do APP DO CLIENTE (paciente).
const CLIENT_ROUTES = [
  '/inicio',
  '/evolucao',
  '/consultas',
  '/plano',
  '/conta',
  '/definir-senha',
];
// Rotas logadas do PORTAL INTERNO (equipe) — vivem em portal.golev.app.br.
const PORTAL_ROUTES = [
  '/dashboard',
  '/avaliacoes',
  '/clients',
  '/appointments',
  '/settings',
  '/billing',
  '/solicitacoes',
];
const MARKETING_PUBLIC = [
  '/',
  '/avaliacao',
  // Pós-checkout: o paciente chega aqui DESLOGADO (a conta nasce no pagamento);
  // a página faz o auto-login via session-from-payment.
  '/pagamento',
  '/calculadora-imc',
  '/pricing',
  '/features',
  '/blog',
  '/legal',
];

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') || // files with extension (favicon.ico, logo.svg, etc.)
    /\/(opengraph-image|twitter-image|apple-icon)(-[a-zA-Z0-9]+)?(\/|$)/.test(pathname)
  );
}

function matchesPath(pathname: string, paths: string[]): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * CSP híbrida:
 * - Páginas de marketing (estáticas, SEO): forte por header, SEM nonce
 *   (`script-src 'self' 'unsafe-inline'`) → preserva renderização estática/CDN.
 * - Rotas logadas/auth (já dinâmicas): nonce + `strict-dynamic` (sem unsafe-inline)
 *   → proteção forte contra XSS onde a sessão vive.
 */
function buildCsp(nonce: string | null): string {
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? '';
  const posthog = 'https://us.i.posthog.com https://us-assets.i.posthog.com';
  const scriptSrc = nonce
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin} ${posthog}`.replace(/\s+/g, ' ').trim(),
    "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com",
    "form-action 'self' https://checkout.stripe.com",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
  ].join('; ');
}

/** Decisão de auth: URL de redirect, ou null (libera). */
function authRedirect(request: NextRequest, pathname: string): URL | null {
  const host = request.headers.get('host') ?? '';
  const isDev = host.startsWith('localhost') || host.startsWith('127.');

  const needsAuth = (): URL | null => {
    const token = request.cookies.get('access_token')?.value;
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return url;
    }
    return null;
  };

  // Portal interno (portal.golev.app.br)
  if (host.startsWith('portal.')) {
    if (pathname === '/') return new URL('/login', request.url);
    if (matchesPath(pathname, AUTH_PAGES)) return null;
    return needsAuth();
  }

  // Dev (localhost): público liberado, resto pede auth.
  if (isDev) {
    if (matchesPath(pathname, [...MARKETING_PUBLIC, ...AUTH_PAGES])) return null;
    return needsAuth();
  }

  // Domínio principal: rotas do portal não pertencem aqui.
  if (matchesPath(pathname, PORTAL_ROUTES)) return new URL('/', request.url);
  if (matchesPath(pathname, AUTH_PAGES)) return null;
  if (matchesPath(pathname, MARKETING_PUBLIC)) return null;
  return needsAuth();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) return NextResponse.next();

  const redirectTo = authRedirect(request, pathname);
  // Rotas com nonce = grupos (auth) e (cliente), renderizados DINAMICAMENTE via
  // force-dynamic (são server layouts). O portal (app) é client layout → fica
  // estático; marketing também → CSP sem nonce (unsafe-inline) p/ não quebrar a
  // hidratação dos scripts estáticos.
  const isStrict = matchesPath(pathname, [...AUTH_PAGES, ...CLIENT_ROUTES]);

  // Redirect: sem nonce (nenhuma página é renderizada).
  if (redirectTo) {
    const res = NextResponse.redirect(redirectTo);
    res.headers.set('Content-Security-Policy', buildCsp(null));
    return res;
  }

  // Estático (marketing e afins): CSP sem nonce → a página continua estática.
  if (!isStrict) {
    const res = NextResponse.next();
    res.headers.set('Content-Security-Policy', buildCsp(null));
    return res;
  }

  // App/auth (dinâmico): nonce + strict-dynamic. O nonce na request faz o Next
  // aplicá-lo aos próprios scripts (e optar por render dinâmico).
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('Content-Security-Policy', csp);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
