import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const features: Record<string, { title: string; description: string; details: string }> = {
  autenticacao: {
    title: 'Autenticação Segura',
    description: 'JWT com refresh tokens e rate limiting.',
    details:
      'Sistema de autenticação com access tokens de curta duração, refresh tokens rotativos, blocklist de tokens e hashing com argon2.',
  },
  billing: {
    title: 'Billing com Stripe',
    description: 'Integração completa com Stripe para cobranças recorrentes.',
    details:
      'Webhooks, gestão de assinaturas, faturas e portal do cliente. Tudo integrado com a plataforma.',
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const feature = features[slug];
  if (!feature) return {};

  return {
    title: `${feature.title} | Features | Go Lev`,
    description: feature.description,
    openGraph: {
      title: `${feature.title} | Go Lev`,
      description: feature.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
    alternates: {
      canonical: `/features/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(features).map((slug) => ({ slug }));
}

export default async function FeatureDetailPage({ params }: Props) {
  const { slug } = await params;
  const feature = features[slug];

  if (!feature) notFound();

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight">{feature.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{feature.description}</p>
      <div className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
        <p>{feature.details}</p>
      </div>
    </section>
  );
}
