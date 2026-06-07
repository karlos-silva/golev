'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Salad, FileDown } from 'lucide-react';
import {
  PageHeader,
  Accent,
  SectionCard,
  EmptyState,
  CenteredMessage,
} from '@/components/client/primitives';
import { MarkdownLite } from '@/components/client/markdown-lite';
import { useMeDietPlan } from '@/hooks/use-me';

export default function PlanoPage() {
  const { data: plan, isLoading, error } = useMeDietPlan();

  if (isLoading) return <CenteredMessage>Carregando seu plano…</CenteredMessage>;
  if (error) return <CenteredMessage>Não conseguimos carregar agora. Tente recarregar.</CenteredMessage>;

  return (
    <>
      <PageHeader
        kicker="Meu plano"
        title="Seu plano alimentar"
        subtitle={
          <>
            Um ponto de partida flexível, montado pela equipe para o seu momento — feito com <Accent>cuidado</Accent>, não como regra rígida.
          </>
        }
      />

      {!plan ? (
        <div className="gl-in">
          <EmptyState icon={<Salad className="h-5 w-5" />} title="Seu plano ainda está sendo preparado">
            Assim que a equipe montar seu plano alimentar, ele aparece aqui — com calma e do seu jeito.
          </EmptyState>
        </div>
      ) : (
        <div className="gl-in">
          <SectionCard
            title={plan.title}
            icon={<Salad className="h-4 w-4" />}
            action={
              // Defesa em profundidade: só renderiza o link se for http(s)
              // (bloqueia javascript:/data: mesmo que algo escape da validação).
              plan.fileUrl && /^https?:\/\//i.test(plan.fileUrl) ? (
                <a
                  href={plan.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{ background: 'var(--gl-support-tint)', color: 'var(--gl-primary)' }}
                >
                  <FileDown className="h-3.5 w-3.5" /> Baixar PDF
                </a>
              ) : undefined
            }
          >
            <MarkdownLite content={plan.content} />

            <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--gl-line)' }}>
              <p className="text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                {plan.doctor ? `Montado por ${plan.doctor.name} · ` : ''}
                Atualizado em {format(new Date(plan.updatedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </SectionCard>

          <p className="mt-4 px-1 text-xs leading-relaxed" style={{ color: 'var(--gl-ink-3)' }}>
            Este conteúdo é informativo e faz parte do seu acompanhamento. Em caso de dúvida ou
            desconforto, fale com a equipe — a gente ajusta junto com você.
          </p>
        </div>
      )}
    </>
  );
}
