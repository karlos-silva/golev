import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Páginas de autenticação públicas (login compartilhado entre app do cliente e portal).
const AUTH_PAGES = ['/login', '/forgot-password', '/redefinir-senha'];
// Rotas logadas do APP DO CLIENTE (paciente) — vivem no domínio principal.
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
    // rotas de metadata do Next, sem extensão (OG/twitter/apple-icon) — em route
    // groups o Next adiciona um sufixo de hash (ex.: /opengraph-image-pwu6ef).
    /\/(opengraph-image|twitter-image|apple-icon)(-[a-zA-Z0-9]+)?(\/|$)/.test(pathname)
  );
}

function matchesPath(pathname: string, paths: string[]): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function requireAuth(request: NextRequest, pathname: string): NextResponse {
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';

  if (isStaticAsset(pathname)) return NextResponse.next();

  const isDev = host.startsWith('localhost') || host.startsWith('127.');

  // ── Portal interno (portal.golev.app.br) ───────────────────────────────
  if (host.startsWith('portal.')) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (matchesPath(pathname, AUTH_PAGES)) return NextResponse.next();
    return requireAuth(request, pathname);
  }

  // ── Dev (localhost) ─────────────────────────────────────────────────────
  // Marketing, portal e app do cliente coexistem: tudo público é liberado,
  // o resto (portal + cliente) pede auth.
  if (isDev) {
    if (matchesPath(pathname, [...MARKETING_PUBLIC, ...AUTH_PAGES])) {
      return NextResponse.next();
    }
    return requireAuth(request, pathname);
  }

  // ── Domínio principal (golev.app.br) — marketing + APP DO CLIENTE ───────
  // Rotas do portal interno não pertencem aqui.
  if (matchesPath(pathname, PORTAL_ROUTES)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Login/recuperação do cliente são públicos aqui.
  if (matchesPath(pathname, AUTH_PAGES)) return NextResponse.next();

  if (matchesPath(pathname, MARKETING_PUBLIC)) return NextResponse.next();

  // Rotas logadas do cliente (e qualquer outra) exigem auth.
  if (matchesPath(pathname, CLIENT_ROUTES)) {
    return requireAuth(request, pathname);
  }

  return requireAuth(request, pathname);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
