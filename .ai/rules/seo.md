---
scope: seo
globs: "apps/web/src/app/(marketing)/**"
---

# SEO Rules

## Metadata
- Toda página marketing DEVE exportar `metadata` ou `generateMetadata`
- Title: máx 60 chars
- Description: máx 155 chars, focada em conversão
- Open Graph: title, description, images, type
- Twitter card: `summary_large_image`
- Canonical URL: sempre definir `alternates.canonical`

## Sitemap
- Usar `app/sitemap.ts` com a Sitemap API do Next.js
- Incluir todas as páginas públicas

## Robots
- Configurar `app/robots.ts`
- Permitir crawling de páginas marketing
- Bloquear área autenticada

## Structured Data
- JSON-LD via `<script type="application/ld+json">`
- Ao menos Organization e WebSite na homepage

## Performance
- LCP < 2.5s, FID < 100ms, CLS < 0.1
- Imagens com `next/image`
- Fonts com `next/font`

## Analytics
- PostHog para product analytics (área autenticada)
- Plausible ou Umami para landing pages
- Google Search Console obrigatório
