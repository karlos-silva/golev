# Architecture

Para a arquitetura completa, consulte `golev-architecture.md` na raiz do repositório.

## Resumo

- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend:** Next.js App Router + shadcn/ui + Tailwind CSS v4
- **Backend:** NestJS + Fastify + Drizzle ORM + postgres.js
- **Database:** PostgreSQL
- **Auth:** JWT (access + refresh tokens)
- **Billing:** Stripe
- **Deploy:** Docker + Caddy + GitHub Actions
