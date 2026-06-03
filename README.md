# Go Lev Template

[![CI](https://github.com/go-lev/plataform/actions/workflows/ci.yml/badge.svg)](https://github.com/go-lev/plataform/actions/workflows/ci.yml)
[![Deploy](https://github.com/go-lev/plataform/actions/workflows/deploy.yml/badge.svg)](https://github.com/go-lev/plataform/actions/workflows/deploy.yml)
[![site](https://img.shields.io/website?url=https%3A%2F%2Fgolev.app.br&label=golev.app.br)](https://golev.app.br)

Template padrão para produtos SaaS da Go Lev. Monorepo com Next.js, NestJS, Drizzle ORM e infraestrutura completa.

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js (App Router) + shadcn/ui + Tailwind CSS v4 |
| Backend | NestJS + Fastify |
| ORM | Drizzle ORM + postgres.js |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens) + argon2 |
| Billing | Stripe |
| Monorepo | pnpm workspaces + Turborepo |
| CI/CD | GitHub Actions |
| Deploy | Docker + Caddy |

## Quick Start

```bash
# 1. Clonar e instalar
git clone <repo-url>
cd <produto>
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 3. Subir banco de dados (use --project-directory . para o contexto do build ficar na raiz do monorepo)
docker compose -f infra/docker-compose.yml --project-directory . up db -d

# 4. Rodar migrations
pnpm --filter @golev/api db:migrate

# 5. Iniciar dev
pnpm dev
```

Isso inicia:
- **Web:** http://localhost:3000
- **API:** http://localhost:3333

**Só Docker (api + web + Postgres):** `docker compose -f infra/docker-compose.yml --project-directory . up -d --build`. O `docker-compose` define `DATABASE_URL` com host `db` e `PORT` por serviço (evita conflito com `PORT` do `.env`). Migrações dentro do container: `docker compose -f infra/docker-compose.yml --project-directory . run --rm api npx drizzle-kit migrate`.

## Estrutura

```
├── apps/
│   ├── web/          # Next.js App Router
│   └── api/          # NestJS + Fastify + Drizzle
├── packages/
│   └── shared/       # Tipos, schemas Zod, contratos
├── infra/
│   ├── docker/       # Dockerfiles
│   ├── caddy/        # Caddyfile
│   └── docker-compose.yml
├── e2e/              # Testes E2E (Playwright)
├── .ai/              # Configuração de IA
├── .github/          # CI/CD + PR template
└── scripts/          # Deploy scripts
```

## Scripts Principais

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia todos os apps em dev |
| `pnpm build` | Build de todos os apps |
| `pnpm lint` | Lint de todos os apps |
| `pnpm typecheck` | Type check de todos os apps |
| `pnpm test:unit` | Roda testes unitários |
| `pnpm test:e2e` | Roda testes E2E (Playwright) |
| `pnpm --filter @golev/api db:generate` | Gera migration |
| `pnpm --filter @golev/api db:migrate` | Aplica migrations |
| `pnpm --filter @golev/api db:studio` | Abre Drizzle Studio |

---

## Checklist — Novo Produto SaaS

Ao criar um novo produto a partir deste template, siga o checklist abaixo. Marque cada item conforme for concluído.

### Repositório e Monorepo

> **Atalho:** rode `pnpm init` para fazer tudo abaixo automaticamente (renomeia, limpa placeholders, reseta git).

- [ ] Criar repositório a partir deste template
- [ ] Rodar `pnpm init` — o script interativo faz:
  - Substituir `@golev/` pelo scope do seu produto em todos os arquivos
  - Renomear `Go Lev` pelo nome da sua empresa em textos e configs
  - Atualizar defaults de deploy (GHCR org, product name)
  - Limpar conteúdo placeholder (blog, legal, feature pages)
  - Remover `golev-architecture.md`
  - Gerar README limpo
  - Resetar histórico git (opcional)
  - Reinstalar dependências (opcional)
- [ ] Trocar `apps/web/public/logo.svg` pelo logo do produto
- [ ] Configurar `.env` com valores reais (copiar de `.env.example`)

### Código e Configuração (já incluso no template)

- [x] Monorepo: `pnpm-workspace.yaml` + `turbo.json`
- [x] `apps/web`, `apps/api`, `packages/shared`
- [x] TypeScript strict em todos os packages
- [x] ESLint com typescript-eslint (`no-explicit-any`, `no-floating-promises`, `consistent-type-imports`)
- [x] Drizzle ORM com postgres.js
- [x] `infra/docker/` com Dockerfiles
- [x] `docker-compose.yml` para dev local
- [x] `.env.example` com todas as variáveis
- [x] `.github/workflows/ci.yml`
- [x] `.github/workflows/deploy.yml`
- [x] `.ai/` com rules, skills, agents, prompts e context
- [x] `AGENTS.md` na raiz
- [x] Bridges (`.cursor/rules/bridge.mdc`, `CLAUDE.md`, `.github/copilot-instructions.md`)
- [x] Vitest (unit + integration configs)
- [x] Playwright (E2E config + testes base)
- [x] PR template em `.github/PULL_REQUEST_TEMPLATE.md`
- [x] Husky + lint-staged (pre-commit, pre-push)
- [x] Renovate config (`renovate.json`) para updates automáticos de dependências
- [x] Security audit (`pnpm audit`) no CI com suporte a `.audit-ignore`
- [x] Auth completo (login, register, forgot password, JWT, guards)
- [x] SEO base (sitemap.ts, robots.ts, metadata nas páginas)
- [x] Páginas marketing (home, pricing, features, blog, legal/terms, legal/privacy)

### GitHub

- [ ] Proteger branch `main` (require PR, require CI pass)
- [ ] Configurar squash merge como padrão
- [ ] Instalar [Renovate GitHub App](https://github.com/apps/renovate) e dar acesso ao repositório
- [ ] Adicionar secrets no repositório (Settings > Secrets and variables > Actions):
  - [ ] `VPS_SSH_KEY` — chave privada SSH para deploy na VPS
  - [ ] `VPS_HOST` — IP/hostname da VPS
  - [ ] `VPS_USER` — usuário de deploy (nunca root)
- [ ] **GHCR (GitHub Container Registry):**
  - O push de imagens durante o CI usa o `GITHUB_TOKEN` automático — **não precisa configurar nada**
  - Para a VPS puxar imagens, crie um **Personal Access Token (classic)**:
    1. Acesse https://github.com/settings/tokens
    2. Gere um token com scope **`read:packages`**
    3. Na VPS, autentique: `echo TOKEN | docker login ghcr.io -u SEU_USER --password-stdin`
  - Se o repositório for **privado**, vá em Settings > Packages e garanta que as imagens são acessíveis

### Integração — Stripe (Billing)

- [ ] Criar conta Stripe (ou usar existente)
- [ ] Criar Products e Prices no Stripe Dashboard
- [ ] Configurar Webhooks (`checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`)
- [ ] Preencher no `.env`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`
- [ ] Implementar módulo de billing no backend (webhook handler, subscription sync)
- [ ] Implementar checkout flow no frontend (redirect para Stripe Checkout)
- [ ] Implementar portal do cliente (Stripe Customer Portal)

### Integração — Analytics

- [ ] **PostHog** — product analytics (área autenticada)
  - [ ] Criar projeto no PostHog
  - [ ] Preencher no `.env`: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
  - [ ] Adicionar PostHog provider no layout da área `(app)/`
  - [ ] Configurar eventos de tracking (signup, feature usage, etc.)
- [ ] **Plausible ou Umami** — web analytics (landing pages)
  - [ ] Criar conta e adicionar domínio
  - [ ] Adicionar script no layout de `(marketing)/`
- [ ] **Google Search Console**
  - [ ] Verificar propriedade do domínio
  - [ ] Submeter sitemap.xml

### Integração — Email

- [ ] **Resend** (ou equivalente)
  - [ ] Criar conta e verificar domínio
  - [ ] Preencher no `.env`: `RESEND_API_KEY`
  - [ ] Criar módulo de email no backend
  - [ ] Templates: welcome, forgot-password, invoice, trial-ending

### Infraestrutura — VPS e Deploy

- [ ] Provisionar VPS (recomendado: 4GB RAM / 2 vCPU / 80GB disco)
- [ ] Criar usuário de deploy na VPS (nunca usar root):
  ```bash
  adduser deploy && usermod -aG sudo deploy
  ```
- [ ] Instalar Docker e Docker Compose na VPS
- [ ] **Rodar o script de setup automatizado:**
  ```bash
  ./scripts/setup-vps.sh <IP_DA_VPS> deploy <dominio.com.br> <nome-do-produto>
  ```
  O script cria toda a estrutura, copia configs, gera `.env` com JWT secrets aleatórios, configura GHCR e firewall.
- [ ] Editar os `.env` na VPS com credenciais reais (DB, Stripe, Resend, etc.):
  ```bash
  ssh deploy@<IP_DA_VPS>
  nano ~/apps/<produto>/production/.env
  nano ~/apps/<produto>/staging/.env
  ```
  - O `setup-vps.sh` já preenche **`ALLOWED_ORIGINS`** (URL do Next no browser) e **`REQUEST_BODY_LIMIT_BYTES`**; revise se usar `www`, preview ou domínios extra — a API rejeita origens fora da lista.

### Infraestrutura — Domínio e DNS

- [ ] Registrar domínio (se novo)
- [ ] Configurar DNS (A records):
  - [ ] `<dominio>` → IP da VPS
  - [ ] `api.<dominio>` → IP da VPS
  - [ ] `stg.<dominio>` → IP da VPS
  - [ ] `api-stg.<dominio>` → IP da VPS
- [ ] Confirmar `Caddyfile` em `production/caddy/` e `staging/caddy/` (o setup já gera com cache em `/_next/static`); ajustar se o domínio mudar
- [ ] Atualizar `.env` de produção/staging com URLs reais e **`ALLOWED_ORIGINS`** coerente com o Next

### Infraestrutura — Backups

- [ ] Configurar backup automático do PostgreSQL (cron + pg_dump)
- [ ] Testar restore do backup
- [ ] Configurar retenção (ex: 7 dias rolling)

### Pré-launch

- [ ] Atualizar `.ai/context/PRODUCT_PRD.md` com PRD real do produto
- [ ] Atualizar `.ai/context/DOMAIN_GLOSSARY.md` com termos do domínio
- [ ] Atualizar `.ai/context/DATA_MODEL.md` com modelo de dados
- [ ] Atualizar páginas de legal (termos, privacidade) com conteúdo jurídico real
- [ ] Atualizar pricing page com planos reais
- [ ] Adicionar favicon e OG images
- [ ] Testar fluxo completo: signup → login → uso → billing → logout
- [ ] Verificar Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Primeiro deploy para staging
- [ ] Validar staging
- [ ] Deploy para produção

---

## Documentação

- [Arquitetura Completa](./golev-architecture.md)
- [AI Guidelines](./.ai/AGENTS.md)
- [Rules](./.ai/rules/)
- [Skills](./.ai/skills/)

## Convenções de Git

- **Branches:** `feat/`, `fix/`, `chore/`, `refactor/`, `hotfix/`
- **Commits:** Conventional Commits (`feat(billing): add stripe webhooks`)
- **PRs:** Squash merge, template obrigatório
