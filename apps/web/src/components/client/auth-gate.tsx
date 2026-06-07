'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/stores/auth';
import { isPatientRole, isStaffRole } from '@golev/shared';

/**
 * Garante que só o PACIENTE acessa a área do cliente (defesa em profundidade no
 * front; o backend já barra por ownership/role). Redireciona staff p/ o portal,
 * conta sem senha definida p/ o 1º acesso, e quem não está logado p/ /login.
 */
export function ClientAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Fail-closed: sem usuário hidratado → login (o cookie httpOnly é a verdade
    // server-side; aqui é só guard de UX, o backend barra por role).
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.mustResetPassword) {
      router.replace('/definir-senha');
      return;
    }
    if (isStaffRole(user.role)) {
      router.replace('/dashboard');
      return;
    }
    if (!isPatientRole(user.role)) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [user, router]);

  if (!ready) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: 'var(--gl-paper)' }}
      >
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--gl-primary)' }} />
      </div>
    );
  }

  return <>{children}</>;
}
