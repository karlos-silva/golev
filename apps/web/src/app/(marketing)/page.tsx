import type { Metadata } from 'next';
import { Landing } from '@/components/app/landing';

export const metadata: Metadata = {
  title: 'Emagrecimento com acompanhamento médico',
  description:
    'A Go Lev une avaliação e acompanhamento médico para você emagrecer com segurança — sem dietas malucas, sem julgamento, no seu ritmo.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Go Lev — emagrecimento com acompanhamento médico',
    description:
      'Avaliação e acompanhamento médico para emagrecer com segurança, no seu ritmo.',
    type: 'website',
    url: '/',
  },
};

export default function HomePage() {
  return <Landing />;
}
