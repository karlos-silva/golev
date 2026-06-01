import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Página não encontrada.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
