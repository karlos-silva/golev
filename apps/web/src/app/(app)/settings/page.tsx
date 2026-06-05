'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Calendar, Check, Link2, Unlink } from 'lucide-react';

interface GoogleStatus {
  connected: boolean;
  email?: string;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Feedback do retorno do OAuth (?google=connected|error).
  useEffect(() => {
    const g = searchParams.get('google');
    if (g === 'connected') {
      toast.success('Google Calendar conectado');
      void qc.invalidateQueries({ queryKey: ['google-status'] });
      router.replace('/settings');
    } else if (g === 'error') {
      toast.error('Falha ao conectar o Google Calendar');
      router.replace('/settings');
    }
  }, [searchParams, qc, router]);

  const { data, isLoading } = useQuery<GoogleStatus>({
    queryKey: ['google-status'],
    queryFn: () => api('/integrations/google/status'),
  });

  const connect = useMutation({
    mutationFn: () => api<{ url: string }>('/integrations/google/connect'),
    onSuccess: ({ url }) => { window.location.href = url; },
    onError: (e: Error) => toast.error(e.message || 'Integração indisponível'),
  });

  const disconnect = useMutation({
    mutationFn: () => api('/integrations/google', { method: 'DELETE' }),
    onSuccess: () => { toast.success('Google Calendar desconectado'); void qc.invalidateQueries({ queryKey: ['google-status'] }); },
  });

  return (
    <div className="flex flex-col flex-1 gap-6">
      {/* Cabeçalho */}
      <div className="gl-in flex-shrink-0">
        <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--gl-ink-3)' }}>Conta</p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>Configurações</h1>
      </div>

      {/* Integrações */}
      <div className="gl-in max-w-2xl" style={{ animationDelay: '60ms' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--gl-ink-3)' }}>Integrações</h2>

        <div className="rounded-xl p-5" style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0" style={{ background: 'var(--gl-support-tint)' }}>
                <Calendar className="h-5 w-5" style={{ color: 'var(--gl-primary)' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--gl-ink)' }}>Google Calendar</h3>
                <p className="text-xs mt-0.5 max-w-sm" style={{ color: 'var(--gl-ink-2)' }}>
                  Conecte sua agenda para que as consultas atribuídas a você apareçam automaticamente no seu Google Calendar, com lembretes.
                </p>
                {data?.connected && data.email && (
                  <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium rounded-full px-2.5 py-1" style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}>
                    <Check className="h-3 w-3" /> {data.email}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              {isLoading ? (
                <span className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>…</span>
              ) : data?.connected ? (
                <button
                  onClick={() => disconnect.mutate()}
                  disabled={disconnect.isPending}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50"
                  style={{ border: '1px solid var(--gl-line)', color: 'var(--gl-ink-2)' }}
                >
                  <Unlink className="h-3.5 w-3.5" /> Desconectar
                </button>
              ) : (
                <button
                  onClick={() => connect.mutate()}
                  disabled={connect.isPending}
                  className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 whitespace-nowrap"
                  style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
                >
                  <Link2 className="h-4 w-4" /> {connect.isPending ? 'Abrindo…' : 'Conectar'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
