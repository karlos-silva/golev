/** URL pública do site (absoluta, sem barra final). Fonte única p/ metadata,
 * canonical, sitemap, robots e JSON-LD. Em prod vem do Infisical; o fallback é
 * o domínio de produção (não localhost) p/ gerar URLs absolutas mesmo sem env. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://golev.app.br'
).replace(/\/+$/, '');
