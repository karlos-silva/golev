import type { Metadata } from 'next';
import { AvaliacaoFunnel } from '@/components/app/avaliacao-funnel';

export const metadata: Metadata = {
  title: 'Avaliação gratuita de elegibilidade',
  description:
    'Responda algumas perguntas sobre sua saúde e descubra, pelo seu IMC, se você tem indicação para o acompanhamento médico de emagrecimento da Go Lev. Sem compromisso.',
  alternates: { canonical: '/avaliacao' },
  openGraph: {
    title: 'Avaliação gratuita de elegibilidade — Go Lev',
    description:
      'Descubra em minutos se você tem indicação para o tratamento, com avaliação médica. Grátis e sem compromisso.',
    type: 'website',
    url: '/avaliacao',
  },
};

export default function AvaliacaoPage() {
  return <AvaliacaoFunnel />;
}
