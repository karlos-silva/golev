'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/app/logo';
import { useSessionFromPayment } from '@/hooks/use-billing';

const MAX_ATTEMPTS = 30; // ~90s de polling (cobre confirmação assíncrona do Pix)

function Processando() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const sessionFromPayment = useSessionFromPayment();
  const [gaveUp, setGaveUp] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;
    let attempts = 0;

    async function loop() {
      if (cancelled) return;
      attempts += 1;
      try {
        // Confirma o pagamento e já loga (auto-login). A verdade última vem do
        // webhook → provisionPatientAccount; aqui é só a entrada imediata.
        await sessionFromPayment.mutateAsync(sessionId as string);
        if (!cancelled) router.replace('/inicio');
      } catch {
        if (cancelled) return;
        if (attempts >= MAX_ATTEMPTS) {
          setGaveUp(true);
          return;
        }
        window.setTimeout(() => void loop(), 3000);
      }
    }
    void loop();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

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
        {gaveUp ? (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Estamos confirmando seu pagamento
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Assim que confirmar, enviamos um e-mail com o link de acesso à sua
              conta. Você também pode{' '}
              <Link href="/login" className="font-semibold text-brand hover:underline">
                entrar
              </Link>{' '}
              quando tiver definido sua senha.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Confirmando seu pagamento…
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Estamos preparando o seu acesso à Go Lev. Isso costuma levar só
              alguns segundos — pode deixar esta página aberta.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function ProcessandoPage() {
  return (
    <Suspense fallback={null}>
      <Processando />
    </Suspense>
  );
}
