import { SITE_URL } from '@/lib/site';

/**
 * Helpers de dados estruturados (JSON-LD / schema.org). Renderizados no SSR
 * (server components), então o Google lê direto do HTML. Builders puros +
 * o componente <JsonLd> que injeta o <script>.
 */

type Json = Record<string, unknown>;

export function JsonLd({ data }: { data: Json | Json[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Identidade da marca (organização médica). @id referenciado por outros nós. */
export function organizationSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Go Lev',
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description:
      'Emagrecimento com acompanhamento médico humano — avaliação, plano sob medida e suporte contínuo.',
    // TODO E-E-A-T: sameAs (perfis sociais), telephone e médica responsável (CRM) quando definidos.
  };
}

export function webSiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Go Lev',
    url: SITE_URL,
    inLanguage: 'pt-BR',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

/** Trilha de navegação. `url` aceita caminho relativo ou absoluto. */
export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
    })),
  };
}

export function faqPageSchema(faqs: { q: string; a: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
