# Go Lev — AI Agent Guidelines

Você é um assistente de desenvolvimento para um produto SaaS da Go Lev. Siga estas diretrizes rigorosamente.

## Regras Globais

- **TypeScript strict** em todo código (`strict: true`, `noUncheckedIndexedAccess`)
- **Nunca** usar `any` — use tipos explícitos ou `unknown` + narrowing
- **Nunca** criar Repository classes, Use Case classes ou Domain Entities separadas
- **Nunca** adicionar comentários óbvios ou narrativos no código — o código deve ser autoexplicativo. Comentários só para intenção não-óbvia, trade-offs ou restrições técnicas
- **Sempre** validar entrada externa com Zod na borda da API
- **Sempre** usar tipos de `@golev/shared` — nunca redefinir localmente
- Valores monetários em **centavos** (inteiro)
- UUIDs como **chaves primárias**
- Datas em **UTC**

## Arquitetura

- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend:** Next.js App Router + shadcn/ui + Tailwind CSS v4 + TanStack Query + Zustand
- **Backend:** NestJS + Fastify + Drizzle ORM + postgres.js
- **Shared:** `packages/shared` — Zod schemas, tipos, contratos, permissions, error codes
- **Camadas backend:** Controller → Service → Drizzle (sem Repository, sem Use Case classes)

## Regras por Contexto

Para detalhes, consulte os arquivos em `.ai/rules/`:

- `global.md` — Regras universais
- `backend.md` — NestJS, Fastify, layered architecture
- `frontend.md` — Next.js, TanStack Query, Zustand, Tailwind
- `drizzle.md` — Schema, migrations, naming conventions
- `testing.md` — Vitest, Playwright
- `seo.md` — Metadata, OG, sitemap
- `auth.md` — JWT, guards, roles

## Skills Disponíveis

Guias passo-a-passo em `.ai/skills/`:

- `create-module/` — Criar módulo NestJS completo
- `create-page/` — Criar página Next.js
- `create-landing-page/` — Criar landing page com SEO
- `create-migration/` — Gerar e aplicar migration Drizzle
- `add-api-endpoint/` — Adicionar endpoint na API
- `full-stack-feature/` — Feature full-stack (schema → API → UI)
- `deploy/` — Deploy de produção, preview efêmero e acesso ao banco de prod

## Deploy & Infraestrutura

Como a app roda em produção (VPS + Docker + Caddy + Cloudflare + Infisical +
runner self-hosted), CI/CD, previews e acesso ao banco: ver
`.ai/context/DEPLOYMENT.md` (arquitetura) e a skill `.ai/skills/deploy/`
(procedimentos). **Leia antes de mexer em deploy, infra ou secrets.**

## Agentes Pré-configurados

Personas em `.ai/agents/`:

- `architect.md` — Decisões de design
- `reviewer.md` — Code review rigoroso
- `onboarding.md` — Mentor para devs novos
- `migrator.md` — Mudanças de schema seguras

## Convenções de Git

- Conventional Commits: `<tipo>(<escopo>): <descrição>`
- Branches: `feat/`, `fix/`, `chore/`, `refactor/`, `hotfix/`
- Squash merge, PRs pequenas e focadas
