---
scope: frontend
globs: "apps/web/**"
---

# Frontend Rules

## Princípios
- Pages são thin: delegam para components
- Server Components por padrão, Client Components apenas quando necessário
- `NEXT_PUBLIC_API_URL` para base URL da API
- Validação de formulários com Zod

## State Management
- TanStack Query para server state (dados da API)
- Zustand para client state (UI: sidebar, modal, wizard)

## Componentes
- `components/ui/` — Primitives (shadcn/ui)
- `components/app/` — Componentes de produto
- `components/app/animations.tsx` — Componentes de animação (FadeIn, SlideUp, SlideIn, ScaleIn, ScrollReveal, Parallax, GrowLine, StaggerChildren, StaggerItem)
- `components/app/scroll-gradient-background.tsx` — Background com gradientes scroll-linked (useScroll + useTransform)

## Estilização
- Tailwind CSS v4 (CSS-first, sem tailwind.config.ts)
- PostCSS com `@tailwindcss/postcss`
- shadcn/ui com `cssVariables: true`
- Dark mode via next-themes com transição suave em `globals.css`

## Animações (framer-motion)
- Usar componentes de `@/components/app/animations` para landing pages
- `viewport={{ once: true }}` — animar só na primeira aparição
- Duração: 300ms a 600ms, curva `easeOut`
- Não animar elementos acima do fold que afetem LCP
- Delay incremental (0, 0.1, 0.2) para efeito cascata

## Landing Pages — Ferramentas
- **framer-motion** — animações de scroll reveal e transições
- **Magic MCP (21st.dev)** — buscar/gerar componentes UI profissionais
- **ui-ux-pro-max** — estilos, paletas, guidelines (`.cursor/skills/ui-ux-pro-max/`)

## Sempre
- Usar `next/image` para imagens
- Usar `next/font` para fontes
- Importar tipos de `@trianox/shared`
- Exportar metadata em páginas marketing

## Nunca
- Definir DTOs como fonte de verdade no frontend
- Hardcodar URLs de API
- Importar de `apps/api` diretamente
- Animações em loop infinito (exceto loading states)
- Mais de 5 elementos animando simultaneamente
- Usar emojis como ícones — sempre usar `lucide-react` para ícones consistentes
