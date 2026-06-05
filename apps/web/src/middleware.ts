import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PORTAL_PUBLIC = ['/login', '/forgot-password'];
const PORTAL_APP = ['/dashboard'];
const MARKETING_PUBLIC = ['/', '/avaliacao', '/calculadora-imc', '/pricing', '/features', '/blog', '/legal'];

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
    if (matchesPath(pathname, PORTAL_PUBLIC)) return NextResponse.next();
    return requireAuth(request, pathname);
  }

  // ── Dev (localhost) ─────────────────────────────────────────────────────
  // Marketing e portal coexistem: tudo que é público (dos dois) é liberado,
  // rotas protegidas do portal pedem auth. Sem hijack da landing.
  if (isDev) {
    if (matchesPath(pathname, [...MARKETING_PUBLIC, ...PORTAL_PUBLIC])) {
      return NextResponse.next();
    }
    return requireAuth(request, pathname);
  }

  // ── Domínio principal (golev.app.br) ────────────────────────────────────
  // Rotas do portal não pertencem aqui — /login é reservado pro app do cliente.
  if (matchesPath(pathname, [...PORTAL_PUBLIC, ...PORTAL_APP])) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (matchesPath(pathname, MARKETING_PUBLIC)) return NextResponse.next();

  // Futuras rotas protegidas do app do cliente entram aqui
  return requireAuth(request, pathname);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
