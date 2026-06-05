'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, Phone, Scale } from 'lucide-react';
import {
  type PatientStatus,
  PATIENT_STATUS_CONFIG,
  COMORBIDADE_LABELS,
  formatWhatsapp,
} from '@/lib/anamnese';
import { Select } from '@/components/ui/select';
import { FilterBar, FilterSlot } from '@/components/ui/filter-bar';

interface PatientUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface PatientAnamnese {
  id: string;
  imc: string;
  pesoKg: string;
  alturaCm: number;
  idade: number;
  sexo: string;
  comorbidades: string[];
  whatsapp: string;
}

interface Patient {
  id: string;
  status: PatientStatus;
  startedAt: string;
  notes: string | null;
  createdAt: string;
  user: PatientUser;
  anamnese: PatientAnamnese | null;
}

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: () => api('/patients'),
  });

  const ativos = data?.filter(p => p.status === 'active').length ?? 0;
  const total = data?.length ?? 0;

  const q = search.trim().toLowerCase();
  const filtered = (data ?? []).filter((p) => {
    if (q && !p.user.name.toLowerCase().includes(q) && !p.user.email.toLowerCase().includes(q)) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });
  const hasFilters = Boolean(q || statusFilter);

  return (
    <div className="flex flex-col flex-1 gap-6">
      {/* Cabeçalho */}
      <div className="gl-in flex items-end justify-between flex-shrink-0">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--gl-ink-3)' }}>
            Acompanhamento
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>Clientes</h1>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium rounded-full px-3 py-1.5"
              style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}>
              {ativos} ativos
            </span>
            <span className="text-xs font-medium rounded-full px-3 py-1.5"
              style={{ background: 'var(--gl-line)', color: 'var(--gl-ink-2)' }}>
              {total} total
            </span>
          </div>
        )}
      </div>

      {/* Filtros */}
      <FilterBar search={search} onSearch={setSearch} searchPlaceholder="Buscar por nome ou email…">
        <FilterSlot>
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="Todos os status"
            options={[
              { value: '', label: 'Todos os status' },
              { value: 'active', label: 'Ativo' },
              { value: 'paused', label: 'Pausado' },
              { value: 'discharged', label: 'Encerrado' },
            ]} />
        </FilterSlot>
      </FilterBar>

      {/* Tabela */}
      <div className="gl-in rounded-xl flex-1 min-h-0 overflow-hidden flex flex-col"
        style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)', animationDelay: '80ms' }}>

        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider flex-shrink-0"
          style={{ borderBottom: '1px solid var(--gl-line)', color: 'var(--gl-ink-3)' }}>
          <span>Paciente</span>
          <span className="w-20 text-center">IMC</span>
          <span className="w-32">WhatsApp</span>
          <span className="w-28">Início</span>
          <span className="w-24 text-center">Status</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: 'var(--gl-line)' }}>
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm" style={{ color: 'var(--gl-ink-3)' }}>Carregando…</p>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-destructive">Erro ao carregar clientes.</p>
            </div>
          )}

          {filtered.map((p, i) => {
            const statusCfg = PATIENT_STATUS_CONFIG[p.status];
            const comorbidades = p.anamnese?.comorbidades.filter(c => c !== 'nenhuma') ?? [];

            return (
              <Link key={p.id} href={`/clients/${p.id}`}
                className="gl-in grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center transition-colors"
                style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--gl-support-tint)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {/* Paciente */}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--gl-ink)' }}>
                    {p.user.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs truncate" style={{ color: 'var(--gl-ink-3)' }}>
                      {p.user.email}
                    </span>
                    {comorbidades.length > 0 && (
                      <span className="flex gap-1">
                        {comorbidades.map(c => (
                          <span key={c} className="text-xs rounded px-1.5 py-0.5"
                            style={{ background: 'var(--gl-accent-tint)', color: 'var(--gl-accent-strong)' }}>
                            {COMORBIDADE_LABELS[c] ?? c}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>

                {/* IMC */}
                <div className="w-20 text-center">
                  {p.anamnese ? (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold rounded-lg px-2 py-1"
                      style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}>
                      <Scale className="h-3 w-3" />
                      {parseFloat(p.anamnese.imc).toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>—</span>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="w-32">
                  {p.anamnese ? (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--gl-ink-2)' }}>
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      {formatWhatsapp(p.anamnese.whatsapp)}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>—</span>
                  )}
                </div>

                {/* Início */}
                <div className="w-28">
                  <span className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                    {format(new Date(p.startedAt), "d 'de' MMM", { locale: ptBR })}
                  </span>
                </div>

                {/* Status */}
                <div className="w-24 flex justify-center">
                  <span className="flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 whitespace-nowrap"
                    style={{ background: statusCfg.bg, color: statusCfg.color }}>
                    <Activity className="h-3 w-3" />
                    {statusCfg.label}
                  </span>
                </div>
              </Link>
            );
          })}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-sm font-medium" style={{ color: 'var(--gl-ink-2)' }}>
                {hasFilters ? 'Nenhum cliente para os filtros' : 'Nenhum cliente ainda'}
              </p>
              {hasFilters ? (
                <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-xs font-medium" style={{ color: 'var(--gl-primary)' }}>
                  Limpar filtros
                </button>
              ) : (
                <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                  Converta um lead aprovado em paciente na aba Avaliações.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
