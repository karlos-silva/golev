'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/stores/auth';
import { isStaffRole, isPatientRole } from '@golev/shared';

/**
 * Garante que só a EQUIPE (admin/doctor) acessa o portal interno — simétrico ao
 * ClientAuthGate. Defesa-em-profundidade no front (o backend já barra por role);
 * evita que o shell do portal renderize para paciente. Fail-closed.
 */
export function StaffAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.mustResetPassword) {
      router.replace('/definir-senha');
      return;
    }
    if (isPatientRole(user.role)) {
      router.replace('/inicio');
      return;
    }
    if (!isStaffRole(user.role)) {
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
