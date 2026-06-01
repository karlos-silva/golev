---
name: create-landing-page
description: Cria uma landing page animada, otimizada para SEO e conversão
---

# Create Landing Page

## Inputs
- `pageName`: nome da página
- `pagePath`: caminho em `(marketing)/`
- `style`: estilo visual desejado (opcional — usar ui-ux-pro-max para sugestões)

## Ferramentas Disponíveis

- **framer-motion** — Componentes de animação em `@/components/app/animations`
- **Magic MCP (21st.dev)** — Buscar componentes UI prontos via `21st_magic_component_builder`
- **ui-ux-pro-max** — Buscar estilos, paletas e guidelines em `.cursor/skills/ui-ux-pro-max/`

## Steps

1. **Escolher estilo e paleta** (opcional)
   - Usar ui-ux-pro-max para buscar inspiração de estilo
   - Ou usar Magic MCP para buscar componentes existentes

2. **Criar page.tsx** em `apps/web/src/app/(marketing)/<pagePath>/page.tsx`

3. **Metadata obrigatória:**
   ```typescript
   export const metadata: Metadata = {
     title: '...',
     description: '... (até 155 chars, focado em conversão)',
     openGraph: { title, description, images, type: 'website' },
     twitter: { card: 'summary_large_image' },
     alternates: { canonical: 'https://...' },
   };
   ```

4. **Estrutura da página com animações:**
   ```typescript
   import { SlideUp, FadeIn, StaggerChildren, StaggerItem } from '@/components/app/animations';

   // Hero: usar SlideUp com delay incremental
   <SlideUp><h1>...</h1></SlideUp>
   <SlideUp delay={0.1}><p>...</p></SlideUp>
   <SlideUp delay={0.2}><Button>CTA</Button></SlideUp>

   // Features/cards: usar StaggerChildren
   <StaggerChildren className="grid grid-cols-3 gap-8">
     {items.map(item => (
       <StaggerItem key={item.title}>...</StaggerItem>
     ))}
   </StaggerChildren>

   // Seções alternadas: usar SlideIn com direction
   <SlideIn direction="left">...</SlideIn>
   <SlideIn direction="right">...</SlideIn>
   ```

5. **Structured Data** (JSON-LD) quando relevante

6. **Performance:**
   - Imagens com `next/image`
   - Above the fold otimizado para LCP < 2.5s (não animar elementos críticos acima do fold)
   - Sem layout shifts (CLS < 0.1)
   - Animações com duração entre 300ms e 600ms

7. **Atualizar sitemap** em `apps/web/src/app/sitemap.ts`

## Regras de Animação

- `viewport={{ once: true }}` — animar só na primeira aparição
- Delay incremental em seções (0, 0.1, 0.2) para efeito cascata
- Curva `easeOut` por padrão
- Máximo 5 elementos animando simultaneamente
- Nunca animar o hero de forma que atrase o LCP

## Validação
- [ ] Metadata completa (title, description, OG, twitter, canonical)
- [ ] Animações suaves e não-bloqueantes
- [ ] Imagens otimizadas com next/image
- [ ] Responsivo (mobile-first)
- [ ] Core Web Vitals OK (LCP < 2.5s, CLS < 0.1)
- [ ] Sitemap atualizado
