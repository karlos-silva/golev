'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import type { SubscriptionResponse } from '@golev/shared';
import { Logo } from '@/components/app/logo';
import { buttonVariants } from '@/components/ui/button';
import { useSubscription, usePortal } from '@/hooks/use-billing';

type Subscription = NonNullable<SubscriptionResponse['subscription']>;

type Tone = 'good' | 'warn' | 'bad' | 'muted';

const STATUS_META: Record<string, { label: string; tone: Tone }> = {
  active: { label: 'Ativa', tone: 'good' },
  trialing: { label: 'Em período de teste', tone: 'good' },
  past_due: { label: 'Pagamento pendente', tone: 'warn' },
  unpaid: { label: 'Pagamento em aberto', tone: 'warn' },
  incomplete: { label: 'Aguardando pagamento', tone: 'warn' },
  incomplete_expired: { label: 'Expirada', tone: 'bad' },
  canceled: { label: 'Cancelada', tone: 'bad' },
  paused: { label: 'Pausada', tone: 'muted' },
};

const TONE_STYLE: Record<Tone, { bg: string; color: string }> = {
  good: { bg: 'var(--gl-support-tint)', color: 'var(--gl-primary)' },
  warn: { bg: 'var(--gl-accent-tint)', color: 'var(--gl-accent-strong)' },
  bad: { bg: 'var(--gl-accent-tint)', color: 'var(--gl-accent-strong)' },
  muted: { bg: 'var(--gl-line)', color: 'var(--gl-ink-3)' },
};

function fmt(iso: string | null): string | null {
  if (!iso) return null;
  return format(new Date(iso), "d 'de' MMM 'de' yyyy", { locale: ptBR });
}

export default function AssinaturaPage() {
  const { data, isLoading } = useSubscription();
  const portal = usePortal();
  const sub = data?.subscription ?? null;

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-6 py-12">
      <div className="w-full max-w-lg">
        <Link href="/" className="inline-block">
          <Logo size="md" />
        </Link>

        <h1 className="mt-10 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Minha assinatura
        </h1>

        {isLoading ? (
          <div className="mt-10 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        ) : sub ? (
          <SubscriptionCard
            sub={sub}
            onManage={() => portal.mutate()}
            managing={portal.isPending}
          />
        ) : (
          <EmptyState />
        )}

        <p className="mt-8 flex items-center gap-2 text-xs text-ink-3">
          <ShieldCheck className="h-4 w-4" /> Pagamentos e dados de cartão são processados com
          segurança pela Stripe.
        </p>
      </div>
    </main>
  );
}

function SubscriptionCard({
  sub,
  onManage,
  managing,
}: {
  sub: Subscription;
  onManage: () => void;
  managing: boolean;
}) {
  const meta = STATUS_META[sub.status] ?? { label: sub.status, tone: 'muted' as Tone };
  const tone = TONE_STYLE[meta.tone];
  const periodEnd = fmt(sub.currentPeriodEnd);

  return (
    <div
      className="mt-8 rounded-2xl p-6"
      style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-wider text-ink-3">
          Acompanhamento Go Lev
        </span>
        <span
          className="rounded-lg px-2.5 py-1 text-xs font-semibold"
          style={{ background: tone.bg, color: tone.color }}
        >
          {meta.label}
        </span>
      </div>

      {periodEnd && (
        <p className="mt-5 text-sm text-muted-foreground">
          {sub.cancelAtPeriodEnd ? 'Acesso garantido até' : 'Próxima renovação em'}{' '}
          <span className="font-semibold text-foreground">{periodEnd}</span>.
        </p>
      )}

      <button
        onClick={onManage}
        disabled={managing}
        className={buttonVariants({ size: 'lg', className: 'mt-6 w-full disabled:opacity-50' })}
      >
        {managing ? (
          <>Abrindo… <Loader2 className="h-4 w-4 animate-spin" /></>
        ) : (
          <>Gerenciar assinatura <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="mt-8 rounded-2xl p-6"
      style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}
    >
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Você ainda não tem uma assinatura ativa. Faça sua avaliação para começar o acompanhamento
        com a Go Lev.
      </p>
      <Link href="/avaliacao" className={buttonVariants({ size: 'lg', className: 'mt-6' })}>
        Fazer minha avaliação <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
