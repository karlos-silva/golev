import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AppNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div>
        <p
          className="text-8xl font-bold tracking-tight font-serif italic"
          style={{ color: 'var(--gl-line)' }}
        >
          404
        </p>
        <h1
          className="mt-2 text-xl font-semibold tracking-tight"
          style={{ color: 'var(--gl-ink)' }}
        >
          Página não encontrada
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--gl-ink-3)' }}>
          A rota que você tentou acessar não existe.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        style={{
          background: 'var(--gl-primary)',
          color: 'var(--gl-paper)',
        }}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao início
      </Link>
    </div>
  );
}
