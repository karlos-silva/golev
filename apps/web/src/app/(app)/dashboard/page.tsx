'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, PhoneCall, ClipboardList, TrendingUp, ArrowRight, Scale } from 'lucide-react';
import { formatWhatsapp } from '@/lib/anamnese';

interface RecentAnamnese {
  id: string;
  nome: string;
  imc: string;
  eligible: boolean;
  leadStatus: string;
  createdAt: string;
}
interface AwaitingLead {
  id: string;
  nome: string;
  imc: string;
  whatsapp: string;
  createdAt: string;
}
interface Stats {
  activeClients: number;
  totalClients: number;
  anamnesesThisMonth: number;
  awaitingContact: number;
  conversionRate: number;
  retentionRate: number;
  recentAnamneses: RecentAnamnese[];
  awaitingContactList: AwaitingLead[];
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api('/dashboard/stats'),
  });

  const v = (n: number | undefined) => (isLoading || n === undefined ? '—' : String(n));

  const cards = [
    {
      title: 'Clientes ativos',
      value: v(data?.activeClients),
      description: 'Em acompanhamento',
      icon: Users,
      accentColor: 'var(--gl-primary)',
      iconBg: 'var(--gl-support-tint)',
      iconColor: 'var(--gl-primary)',
    },
    {
      title: 'Avaliações no mês',
      value: v(data?.anamnesesThisMonth),
      description: 'Pré-anamneses recebidas',
      icon: ClipboardList,
      accentColor: 'var(--gl-primary)',
      iconBg: 'var(--gl-support-tint)',
      iconColor: 'var(--gl-primary)',
    },
    {
      title: 'Aguardando contato',
      value: v(data?.awaitingContact),
      description: 'Leads elegíveis sem contato',
      icon: PhoneCall,
      accentColor: 'var(--gl-accent)',
      iconBg: 'var(--gl-accent-tint)',
      iconColor: 'var(--gl-accent-strong)',
    },
    {
      title: 'Conversão',
      value: data && !isLoading ? `${data.conversionRate}%` : '—',
      description: 'Elegíveis → pacientes',
      icon: TrendingUp,
      accentColor: 'var(--gl-accent)',
      iconBg: 'var(--gl-accent-tint)',
      iconColor: 'var(--gl-accent-strong)',
    },
  ];

  return (
    <div className="flex flex-col flex-1 gap-6">
      {/* Cabeçalho */}
      <div className="gl-in flex items-end justify-between flex-shrink-0">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--gl-ink-3)' }}>
            Portal Interno
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>
            Visão Geral
          </h1>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
          style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}
        >
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--gl-primary)' }} />
          Ao vivo
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4 flex-shrink-0">
        {cards.map((stat, i) => (
          <div
            key={stat.title}
            className="gl-in rounded-xl p-5 flex flex-col gap-4"
            style={{
              background: 'var(--gl-surface)',
              border: '1px solid var(--gl-line)',
              borderTop: `3px solid ${stat.accentColor}`,
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gl-ink-3)' }}>
                {stat.title}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: stat.iconBg }}>
                <stat.icon className="h-3.5 w-3.5" style={{ color: stat.iconColor }} />
              </div>
            </div>
            <div>
              <div className="text-4xl tracking-tight" style={{ color: 'var(--gl-ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500 }}>
                {stat.value}
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--gl-ink-3)' }}>{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Painéis inferiores */}
      <div className="gl-in grid gap-4 lg:grid-cols-2 flex-1 min-h-0" style={{ animationDelay: '260ms' }}>
        {/* Avaliações recentes */}
        <Panel title="Avaliações recentes" subtitle="Últimas pré-anamneses recebidas" href="/avaliacoes">
          {data?.recentAnamneses?.length ? (
            <ul className="divide-y" style={{ borderColor: 'var(--gl-line)' }}>
              {data.recentAnamneses.map((r) => (
                <li key={r.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--gl-ink)' }}>{r.nome}</p>
                    <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                      {format(new Date(r.createdAt), "d 'de' MMM", { locale: ptBR })}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold rounded-lg px-2 py-1 flex-shrink-0"
                    style={{
                      background: r.eligible ? 'var(--gl-support-tint)' : 'var(--gl-line)',
                      color: r.eligible ? 'var(--gl-primary)' : 'var(--gl-ink-3)',
                    }}>
                    <Scale className="h-3 w-3" />{parseFloat(r.imc).toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState loading={isLoading} text="Nenhuma avaliação ainda" />
          )}
        </Panel>

        {/* Aguardando contato — acionável */}
        <Panel title="Aguardando contato" subtitle="Leads elegíveis que precisam de contato" href="/avaliacoes">
          {data?.awaitingContactList?.length ? (
            <ul className="divide-y" style={{ borderColor: 'var(--gl-line)' }}>
              {data.awaitingContactList.map((l) => (
                <li key={l.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--gl-ink)' }}>{l.nome}</p>
                    <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>{formatWhatsapp(l.whatsapp)}</p>
                  </div>
                  <a
                    href={`https://wa.me/55${l.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs font-medium rounded-lg px-2.5 py-1 flex-shrink-0 transition-opacity hover:opacity-80"
                    style={{ background: 'var(--gl-accent-tint)', color: 'var(--gl-accent-strong)' }}
                  >
                    <PhoneCall className="h-3 w-3" /> Chamar
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState loading={isLoading} text="Nenhum lead aguardando" />
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, href, children }: {
  title: string;
  subtitle: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl flex flex-col h-full overflow-hidden"
      style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}>
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--gl-line)' }}>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--gl-ink)' }}>{title}</h2>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--gl-ink-3)' }}>{subtitle}</p>
        </div>
        {href && (
          <Link href={href} className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--gl-primary)' }}>
            Ver tudo <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

function EmptyState({ loading, text }: { loading: boolean; text: string }) {
  return (
    <div className="h-full flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, var(--gl-primary) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <p className="relative text-sm" style={{ color: 'var(--gl-ink-3)' }}>{loading ? 'Carregando…' : text}</p>
    </div>
  );
}
