import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/app/logo';
import { ThemeToggle } from '@/components/app/theme-toggle';

export const metadata: Metadata = {
  title: 'Trianox SaaS',
  description: 'Plataforma SaaS moderna construída com a stack Trianox.',
  openGraph: {
    title: 'Trianox SaaS',
    description: 'Plataforma SaaS moderna construída com a stack Trianox.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Preços
            </Link>
            <Link
              href="/features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/login"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Começar grátis
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <Logo size="sm" />
            <div className="flex items-center gap-6">
              <Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Termos
              </Link>
              <Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Trianox. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
