import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Apenas páginas reais e indexáveis. O /blog está `noindex` até termos conteúdo
 * real (Fase 1) — ao publicar artigos com revisão médica, incluir os slugs aqui.
 * Hubs (/tratamentos/*, /emagrecimento, /caneta-emagrecedora) entram conforme
 * forem criados.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/avaliacao`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/calculadora-imc`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
