'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/app/logo';
import { useSubscription } from '@/hooks/use-billing';

const ACTIVE = new Set(['active', 'trialing']);

export default function BillingProcessingPage() {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);

  // Verdade vem do webhook → DB; aqui só fazemos polling do status real.
  // Polling com teto: para após ~2,5 min para não bater na API indefinidamente.
  const { data } = useSubscription({
    refetchInterval: elapsed < 150 ? 3000 : false,
  });
  const status = data?.subscription?.status;

  useEffect(() => {
    if (status && ACTIVE.has(status)) {
      router.replace('/assinatura');
    }
  }, [status, router]);

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const slow = elapsed > 20;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Link href="/">
        <Logo size="md" />
      </Link>
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'var(--gl-support-tint)' }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <div className="max-w-md">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Confirmando seu pagamento…
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Estamos confirmando a sua assinatura com a Stripe. Isso costuma levar só
          alguns segundos — pode deixar esta página aberta.
        </p>
        {slow && (
          <p className="mt-5 text-sm text-ink-3">
            Está demorando mais que o normal.{' '}
            <Link href="/assinatura" className="font-semibold text-brand hover:underline">
              Ver minha assinatura
            </Link>
            .
          </p>
        )}
      </div>
    </main>
  );
}
