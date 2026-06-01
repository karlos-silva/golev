---

## title: Trianox SaaS Architecture Standard
version: 2.0
status: Ativo
owner: Trianox
scope: Todos os produtos SaaS da Trianox

# Trianox SaaS Architecture Standard

Documento que define a arquitetura padrão, tech stack, fluxo de Git, estratégia de deploy, organização de IA e guidelines para todos os produtos SaaS da Trianox. Todo novo produto deve seguir este padrão como ponto de partida.

---

## 1. Tech Stack Padrão

### 1.1 Linguagem e Runtime


| Camada      | Tecnologia    | Notas                                       |
| ----------- | ------------- | ------------------------------------------- |
| Linguagem   | TypeScript    | `strict: true` obrigatório em todo o código |
| Runtime     | Node.js (LTS) | Usar sempre a versão LTS mais recente       |
| Gerenciador | pnpm          | Único gerenciador permitido no monorepo     |


### 1.2 Frontend (Web)


| Responsabilidade | Tecnologia           |
| ---------------- | -------------------- |
| Framework        | Next.js (App Router) |
| UI Library       | React                |
| Componentes      | shadcn/ui            |
| Estilização      | Tailwind CSS (v4)    |
| Validação        | Zod (v4)             |
| Data fetching    | TanStack Query v5    |
| Client state     | Zustand              |
| HTTP Client      | fetch (nativo)       |
| Ícones           | lucide-react         |
| Temas            | next-themes          |
| Toasts           | sonner               |
| Datas            | date-fns             |
| Animações        | framer-motion        |


### 1.3 Backend (API)


| Responsabilidade | Tecnologia                  |
| ---------------- | --------------------------- |
| Framework        | NestJS + Fastify            |
| ORM              | Drizzle ORM                 |
| DB Driver        | postgres.js                 |
| Schema → Zod     | drizzle-zod                 |
| Migrations       | drizzle-kit                 |
| Banco de dados   | PostgreSQL                  |
| Validação        | Zod (v4)                    |
| Auth hashing     | argon2 (preferido)          |
| Auth tokens      | JWT (access + refresh)      |
| Upload           | multer + volume persistente |


### 1.4 Infraestrutura e Serviços


| Responsabilidade       | Tecnologia                  |
| ---------------------- | --------------------------- |
| Monorepo               | pnpm workspaces + Turborepo |
| Containerização        | Docker + Docker Compose     |
| Reverse proxy          | Caddy                       |
| Billing                | Stripe                      |
| Analytics de produto   | PostHog                     |
| Web analytics (landing)| Plausible ou Umami          |
| SEO monitoring         | Google Search Console       |
| E-mail transacional    | Resend (ou equivalente)     |
| CI/CD                  | GitHub Actions              |
| Git hooks              | Husky + lint-staged         |


### 1.5 Qualidade de Código


| Ferramenta      | Configuração obrigatória                                                                     |
| --------------- | -------------------------------------------------------------------------------------------- |
| ESLint          | typescript-eslint com regras sensíveis a tipos                                               |
| TypeScript      | `strict: true`, `noUncheckedIndexedAccess`                                                   |
| Regras críticas | `no-explicit-any` = error, `no-floating-promises` = error, `consistent-type-imports` = error |


### 1.6 Testing


| Tipo               | Ferramenta                            | Escopo                                    |
| ------------------ | ------------------------------------- | ----------------------------------------- |
| Unit tests         | Vitest                                | Services, utils, schemas, pure functions  |
| Integration tests  | Vitest + supertest (ou inject NestJS) | Controllers + DB                          |
| Component tests    | Vitest + Testing Library              | React components isolados                 |
| E2E                | Playwright                            | Fluxos críticos (login, billing, CRUD)    |

Sem forçar % de cobertura arbitrário. Foco em testar regras de negócio e fluxos críticos.


### 1.7 Git Hooks (Husky + lint-staged)

Validação local obrigatória antes do código sair da máquina do dev.

**pre-commit:**


| Check                     | Escopo                 | Tempo esperado |
| ------------------------- | ---------------------- | -------------- |
| ESLint (via lint-staged)  | Apenas arquivos staged | < 5s           |
| TypeScript (tsc --noEmit) | Projeto inteiro        | ~10-15s        |


**pre-push:**


| Check            | Escopo        | Tempo esperado |
| ---------------- | ------------- | -------------- |
| Testes unitários | Todos         | ~10-30s        |
| Build check      | Todos os apps | ~15-30s        |


O CI continua sendo a barreira final antes do merge, mas os hooks garantem que código quebrado nunca chegue ao remote.

**Setup automático:**

O `package.json` da raiz do monorepo deve conter:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

O script `prepare` roda automaticamente após `pnpm install`. Devs novos não precisam de nenhum passo extra - basta clonar e instalar.

---

## 2. Estrutura do Monorepo

Todo produto SaaS da Trianox segue a mesma estrutura de monorepo.

```text
<produto>/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── deploy.yml
│   ├── copilot-instructions.md      # Bridge Copilot → .ai/
│   └── PULL_REQUEST_TEMPLATE.md
├── .ai/
│   ├── AGENTS.md                    # Ponto de entrada universal para IA
│   ├── rules/
│   │   ├── global.md
│   │   ├── frontend.md
│   │   ├── backend.md
│   │   ├── drizzle.md
│   │   ├── testing.md
│   │   ├── seo.md
│   │   └── auth.md
│   ├── skills/
│   │   ├── create-module/SKILL.md
│   │   ├── create-page/SKILL.md
│   │   ├── create-landing-page/SKILL.md
│   │   ├── create-migration/SKILL.md
│   │   ├── add-api-endpoint/SKILL.md
│   │   └── full-stack-feature/SKILL.md
│   ├── agents/
│   │   ├── architect.md
│   │   ├── reviewer.md
│   │   ├── onboarding.md
│   │   └── migrator.md
│   ├── context/
│   │   ├── PRODUCT_PRD.md
│   │   ├── ARCHITECTURE.md
│   │   ├── DOMAIN_GLOSSARY.md
│   │   └── DATA_MODEL.md
│   └── prompts/
│       ├── code-review.md
│       ├── pr-description.md
│       ├── debug-help.md
│       └── refactor.md
├── .cursor/
│   └── rules/
│       └── bridge.mdc               # Bridge Cursor → .ai/
├── .husky/                          # Git hooks (pre-commit, pre-push)
├── .vscode/                         # Opcional: settings do time (format, TS)
├── AGENTS.md                        # Cópia/symlink do .ai/AGENTS.md (raiz)
├── CLAUDE.md                        # Bridge Claude Code → .ai/
├── e2e/                             # Playwright na raiz (fluxos web críticos)
│   ├── auth.spec.ts
│   └── landing.spec.ts
├── scripts/                         # Automação local e deploy (fora do turbo apps)
│   ├── init-template.sh
│   ├── setup-vps.sh
│   ├── deploy-staging.sh
│   └── deploy-prod.sh
├── apps/
│   ├── web/                         # Next.js App Router
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (marketing)/     # Páginas públicas, SEO
│   │   │   │   ├── (auth)/          # Login, signup, reset
│   │   │   │   └── (app)/           # Área autenticada
│   │   │   ├── components/
│   │   │   │   ├── ui/              # Primitives (shadcn)
│   │   │   │   └── app/             # Componentes de produto
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   │   ├── api.ts           # TanStack Query client + helpers
│   │   │   │   └── query-client.ts  # QueryClient config
│   │   │   ├── stores/              # Zustand stores
│   │   │   └── utils/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── components.json          # Config shadcn/ui
│   │   └── tsconfig.json
│   └── api/                         # NestJS + Fastify
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── tenants/
│       │   │   ├── billing/
│       │   │   └── <domain-modules>/
│       │   ├── database/
│       │   │   └── database.module.ts  # Provê instância Drizzle
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── filters/
│       │   │   └── decorators/
│       │   └── config/
│       │       └── allowed-origins.ts  # Parse ALLOWED_ORIGINS (CORS)
│       ├── drizzle/
│       │   ├── schema/
│       │   │   ├── auth.ts
│       │   │   ├── tenants.ts
│       │   │   ├── billing.ts
│       │   │   └── index.ts         # Re-export de todos os schemas
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── drizzle.config.ts
│       └── tsconfig.json
├── packages/
│   └── shared/                      # Fonte única de verdade para tipos
│       ├── src/
│       │   ├── contracts/           # Request/response shapes
│       │   ├── schemas/             # Zod schemas (base: drizzle-zod)
│       │   ├── domain/              # Enums, tipos de domínio
│       │   ├── permissions/         # Roles, permissions
│       │   ├── errors/              # Error codes tipados
│       │   └── utils/
│       ├── package.json
│       └── tsconfig.json
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   └── Dockerfile.db
│   ├── docker-compose.yml           # Ambiente local completo
│   ├── docker-compose.prod.yml      # Produção
│   └── caddy/
│       └── Caddyfile
├── .env.example                     # Template de variáveis (sem segredos)
├── .audit-ignore                    # Exceções temporárias ao pnpm audit (CI)
├── .gitignore
├── eslint.config.mjs                # ESLint flat config (monorepo)
├── playwright.config.ts             # E2E: baseURL, projetos, CI
├── pnpm-workspace.yaml
├── renovate.json                    # Renovate (deps automatizadas)
├── tsconfig.json                    # TypeScript base do monorepo
├── turbo.json
├── package.json                     # Root package.json
├── README.md
└── trianox-sass-architecture.md     # Este padrão (opcional por produto)
```

### 2.1 Regras de Importação

- `apps/web` **nunca** define DTOs como fonte de verdade
- `apps/api` **nunca** duplica tipos presentes em `packages/shared`
- Enums, permissões e error codes **sempre** vêm de `packages/shared`
- Nenhum app importa arquivos-fonte de outro app diretamente

### 2.2 Configuração do Turborepo (`turbo.json`)

```jsonc
{
  "$schema": "https://turborepo.dev/schema.json",
  "globalDependencies": [".env", "tsconfig.json"],
  "globalEnv": ["NODE_ENV", "CI"],
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test:unit": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "test:integration": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 2.3 Docker Compose (dev local)

- Rodar sempre da raiz do monorepo com **`--project-directory .`**:  
  `docker compose -f infra/docker-compose.yml --project-directory . up -d`  
  Assim o **contexto de build** é a raiz (Dockerfiles em `infra/docker/`); sem isso, o Compose pode resolver paths errados (`infra/infra`).
- O serviço **`api`** define `DATABASE_URL` com host **`db`** (rede Docker). O `.env` pode continuar com `localhost` para `pnpm dev` na máquina; dentro dos containers a URL aponta para o Postgres do compose.
- **`PORT`** explícito por serviço (`api` 3333, `web` 3000) evita o Next.js herdar `PORT=3333` quando api e web compartilham o mesmo `env_file`.

---

## 3. Arquitetura Backend

### 3.1 Princípio: Layered Pragmático

Arquitetura layered simples. **Sem** Clean Architecture, **sem** Repository Pattern.

**Por que não Clean Architecture:**

- Overhead desproporcional para time pequeno (2-4 devs)
- Repository Pattern perde sentido com Drizzle (já é camada fina sobre SQL)
- Use Cases como classes isoladas são burocracia quando o Service já faz isso
- YAGNI: adicionar camadas quando a complexidade pedir, não upfront

### 3.2 Camadas e Responsabilidades

```text
Controller
  → Recebe HTTP request
  → Valida input com Zod (via pipe ou decorator)
  → Delega para Service
  → Retorna response formatada
  → NUNCA contém regra de negócio

Service
  → Contém regra de negócio
  → Acessa Drizzle diretamente (sem repository intermediário)
  → Coordena transações
  → Lança exceções de domínio
  → NUNCA acessa request/response HTTP

Guard
  → Autorização (roles, permissions, tenant ownership)
  → Roda antes do controller
  → Lança UnauthorizedException/ForbiddenException

Interceptor
  → Cross-cutting: logging, timing, transform response
  → Não contém lógica de negócio
```

### 3.3 Estrutura Padrão de um Módulo

Um módulo começa simples:

```text
modules/billing/
  billing.module.ts
  billing.controller.ts       # HTTP layer: valida input, delega
  billing.service.ts           # Business logic + data access
  billing.types.ts             # Tipos locais do módulo (se necessário)
```

Quando o service ultrapassa ~200 linhas ou tem responsabilidades distintas, **então** split:

```text
modules/billing/
  billing.module.ts
  billing.controller.ts
  billing.service.ts               # Coordena (orquestra sub-services)
  stripe-billing.service.ts        # Integração com Stripe
  subscription.service.ts          # Lógica de subscriptions
  invoice.service.ts               # Lógica de invoices
```

**Regra: split when it hurts, not upfront.**

### 3.4 O que NÃO Fazer

- Criar interfaces de Repository — Drizzle é o data access layer
- Criar Domain Entities separadas — o schema Drizzle + tipos inferidos são o modelo
- Criar Use Case classes — o Service já é o use case
- Criar DTOs internos — Zod schemas em `packages/shared` são os contratos
- Criar Mapper/Presenter classes — transformar no controller ou com `.select()` do Drizzle

### 3.5 NestJS + Fastify — Bootstrap, Helmet, CORS e limite de body

Implementação de referência: `apps/api/src/main.ts` + `apps/api/src/config/allowed-origins.ts`.

- **`FastifyAdapter`** com **`bodyLimit`** — padrão 1 MiB; sobrescrever com `REQUEST_BODY_LIMIT_BYTES` (JSON/urlencoded). Uploads multipart seguem o multer, não este limite.
- **CORS** — origens em **`ALLOWED_ORIGINS`** (vírgula, trim em cada item). Fallback: **`CORS_ORIGIN`** (valor único, legado) → `http://localhost:3000` se ambos vazios. Com **`credentials: true`**, nunca usar `origin: '*'` em produção.
- **`@fastify/helmet`** — headers de segurança padrão; CSP estrito só quando o produto exigir (API JSON raramente precisa).
- Escutar em **`0.0.0.0`** para Docker.

```typescript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { parseAllowedOrigins } from './config/allowed-origins';

const DEFAULT_BODY_LIMIT = 1_048_576;

function resolveBodyLimitBytes(): number {
  const raw = process.env.REQUEST_BODY_LIMIT_BYTES?.trim();
  if (!raw) return DEFAULT_BODY_LIMIT;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_BODY_LIMIT;
}

async function bootstrap() {
  const allowedOrigins = parseAllowedOrigins();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: resolveBodyLimitBytes() }),
    {
      cors: {
        origin: (origin, cb) => {
          if (origin === undefined || origin === '') {
            cb(null, true);
            return;
          }
          cb(null, allowedOrigins.includes(origin));
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      },
    },
  );

  await app.register(helmet);
  await app.listen(process.env.PORT ?? 3333, '0.0.0.0');
}

bootstrap();
```

### 3.6 Injeção do Drizzle no NestJS

```typescript
// src/database/database.module.ts
import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        const client = postgres(process.env.DATABASE_URL!);
        return drizzle({ client, schema });
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}
```

Uso em qualquer service:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { customers } from '../../drizzle/schema';

@Injectable()
export class BillingService {
  constructor(@Inject('DATABASE') private db: Database) {}

  async getCustomer(tenantId: string) {
    return this.db.query.customers.findFirst({
      where: eq(customers.tenantId, tenantId),
    });
  }
}
```

---

## 4. Drizzle ORM — Convenções

### 4.1 Driver e Conexão

Driver recomendado: **postgres.js** (não node-postgres). Mais rápido, suporta pipelining.

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle({ client, schema });
```

### 4.2 drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/drizzle/schema/index.ts',
  out: './src/drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 4.3 Schema Definition

```typescript
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

### 4.4 Relations

Drizzle tem duas formas de fazer queries com joins:

1. **SQL-like:** `db.select().from(users).leftJoin(...)` — controle total
2. **Relational:** `db.query.users.findMany({ with: { posts: true } })` — DX similar ao Prisma

Para usar a relational API, definir `relations()` explicitamente:

```typescript
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  memberships: many(tenantMemberships),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
```

**Regra:** Definir relations para todo schema que participa de queries com `db.query.*`.

### 4.5 Type Inference

Drizzle infere tipos diretamente do schema, sem codegen:

```typescript
type User = typeof users.$inferSelect;       // tipo retornado por SELECT
type NewUser = typeof users.$inferInsert;     // tipo aceito por INSERT
```

**Regra:** Nunca definir tipos de tabela manualmente. Sempre usar `$inferSelect` / `$inferInsert`.

### 4.6 Integração com Zod (drizzle-zod)

O pacote `drizzle-zod` gera schemas Zod automaticamente a partir do schema Drizzle:

```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '../drizzle/schema';

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email(),
  name: (schema) => schema.min(2),
});

export const selectUserSchema = createSelectSchema(users);
```

**Regra:** Usar `drizzle-zod` para gerar schemas base. Refinar com `.pick()`, `.omit()`, `.extend()` conforme necessário. Exportar de `packages/shared`.

### 4.7 Transactions

```typescript
await db.transaction(async (tx) => {
  const [tenant] = await tx.insert(tenants).values({ name }).returning();
  await tx.insert(tenantMemberships).values({
    tenantId: tenant.id,
    userId,
    role: 'owner',
  });
});
```

**Regra:** Toda operação que envolve mais de uma tabela com dependência deve usar transaction.

### 4.8 Prepared Statements

Para queries executadas com alta frequência (hot paths):

```typescript
const getUserById = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder('id')))
  .prepare('get_user_by_id');

const user = await getUserById.execute({ id: userId });
```

**Regra:** Usar prepared statements para queries em hot paths (auth middleware, tenant resolution). Não usar para queries ad-hoc.

### 4.9 Multi-Tenancy Pattern

Toda query que acessa dados de tenant **deve** filtrar por `tenantId`:

```typescript
const getTenantUsers = (tenantId: string) =>
  db.select().from(users).where(eq(users.tenantId, tenantId));
```

**Regra crítica:** Nunca fazer query sem filtro de tenant em tabelas tenant-scoped.

### 4.10 Soft Delete Pattern

```typescript
export const users = pgTable('users', {
  // ... outros campos
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Queries devem filtrar por default
const activeUsers = db
  .select()
  .from(users)
  .where(and(eq(users.tenantId, tenantId), isNull(users.deletedAt)));
```

### 4.11 Naming Conventions


| Onde           | Convenção           | Exemplo                          |
| -------------- | ------------------- | -------------------------------- |
| Tabelas (DB)   | snake_case, plural  | `tenant_memberships`             |
| Colunas (DB)   | snake_case          | `created_at`, `tenant_id`        |
| Schema (TS)    | camelCase           | `tenantMemberships`, `createdAt` |
| Schema file    | Domínio singular    | `auth.ts`, `billing.ts`         |
| Relations      | Mesmo arquivo do schema | `usersRelations` em `auth.ts`  |

---

## 5. Autenticação

### 5.1 Estratégia

JWT custom com módulo NestJS bem estruturado. Sem dependência de serviços externos.

- **Access token:** 15 min, stateless, contém `userId`, `tenantId`, `role`
- **Refresh token:** 7 dias, armazenado no DB com hash, rotation obrigatória
- **Token blocklist:** Tabela no PostgreSQL para logout e revogação
- **Rate limiting:** Em endpoints de login/register/refresh (5 tentativas/min por IP)
- **Password policy:** Mínimo 8 chars, sem maxLength artificial, argon2id
- **Security headers:** `@fastify/helmet` no bootstrap (ver §3.5)
- **CORS:** `ALLOWED_ORIGINS` no `.env` da API, alinhado às URLs do front (§3.5)

### 5.2 Estrutura do Módulo Auth

```text
apps/api/src/modules/auth/
  auth.module.ts
  auth.controller.ts
  auth.service.ts              # Coordena login, register, refresh, logout
  token.service.ts             # Gera e valida JWT
  password.service.ts          # Hash/verify com argon2
  guards/
    jwt-auth.guard.ts          # Valida access token
    refresh-auth.guard.ts      # Valida refresh token
    roles.guard.ts             # Verifica roles
  strategies/
    jwt.strategy.ts
    refresh.strategy.ts
  decorators/
    current-user.decorator.ts
    roles.decorator.ts
    public.decorator.ts        # Marca rota como pública
```

---

## 6. Frontend — Convenções

### 6.1 Princípios

- Pages são thin: delegam para components
- Componentes de UI ficam em `components/ui/` (primitives)
- Componentes de produto ficam em `components/app/`
- Server Components por padrão, Client Components apenas quando necessário
- `NEXT_PUBLIC_API_URL` para base URL da API (nunca hardcodar)
- Validação de formulários com Zod v4

### 6.2 State Management

**TanStack Query** para server state (dados da API):

- Cache inteligente com invalidation automática
- Mutations com optimistic updates
- Retry, refetch on focus, stale-while-revalidate
- Suporta prefetching em Server Components

**Zustand** para client state (UI):

- Sidebar aberta/fechada, modal state, wizard steps
- API minimalista, TypeScript first
- Zero re-renders desnecessários

### 6.3 Tailwind CSS v4 (CSS-first)

Tailwind v4 eliminou `tailwind.config.ts`. Toda configuração fica no CSS:

```css
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.84 0.18 117.33);
  --breakpoint-3xl: 1920px;
}
```

PostCSS config obrigatório:

```js
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**shadcn/ui com Tailwind v4:**

No `components.json`, o campo `tailwind.config` deve ficar vazio:

```json
{
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "cssVariables": true
  }
}
```

### 6.4 SEO e Landing Pages

#### Estrutura do grupo `(marketing)/`

```text
apps/web/src/app/(marketing)/
  layout.tsx              # Layout marketing com header/footer públicos
  page.tsx                # Homepage / landing principal
  pricing/
    page.tsx              # Página de preços
  features/
    page.tsx              # Features overview
    [slug]/
      page.tsx            # Feature individual (escalável)
  blog/
    page.tsx
    [slug]/
      page.tsx
  legal/
    terms/page.tsx
    privacy/page.tsx
  sitemap.ts              # Gera sitemap.xml automaticamente
  robots.ts               # Gera robots.txt
```

#### Páginas legais (modelo)

- Rotas: `(marketing)/legal/terms` e `(marketing)/legal/privacy`, linkadas no footer do `layout` marketing.
- O template inclui texto **genérico** e o componente `LegalDocumentNotice` (aviso “documento modelo”) — **substituir conteúdo** e revisar juridicamente antes de produção; ajustar metadata (título, canonical) ao domínio final.
- Mencionar na política de privacidade os analytics usados (PostHog, Plausible/Umami, etc.).

#### Metadata obrigatória por página

Cada página em `(marketing)/` **deve** exportar metadata:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feature X | Produto',
  description: 'Descrição com até 155 chars focada em conversão',
  openGraph: {
    title: 'Feature X | Produto',
    description: '...',
    images: ['/og/feature-x.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: 'https://dominio.com/features/x',
  },
};
```

#### Checklist SEO

- Metadata API: toda página marketing exporta `metadata` ou `generateMetadata`
- Sitemap: usar `app/sitemap.ts` com a Sitemap API do Next.js
- robots.ts: configurar na raiz do app
- JSON-LD: structured data via `<script type="application/ld+json">`
- Open Graph images: `opengraph-image.tsx` para geração dinâmica
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Imagens com `next/image`, fonts com `next/font`
- Canonical URLs: sempre definir `alternates.canonical`

#### Analytics

- **PostHog** — product analytics (área autenticada)
- **Google Search Console** — monitorar indexação, CTR, posição (grátis, obrigatório)
- **Plausible ou Umami** — web analytics das landing pages (leve, privacy-friendly)

### 6.5 Shared (packages/shared)

- Schemas Zod (base gerada por `drizzle-zod`) são a fonte de verdade
- Tipos TypeScript inferidos dos schemas (`z.infer<typeof schema>`)
- Contratos de API definidos uma vez, consumidos por web e api
- Enums de domínio exportados daqui, nunca redefinidos localmente

### 6.6 Landing Pages — Animações e Design Profissional

#### Ferramentas

| Ferramenta      | Papel                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| framer-motion   | Animações React (scroll reveal, transitions, hover, page transitions)  |
| Magic MCP       | Busca e gera componentes UI profissionais via 21st.dev                 |
| ui-ux-pro-max   | AI skill com 67 estilos visuais, 95 paletas, guidelines por stack      |

#### Componentes de Animação Disponíveis

O template inclui componentes de animação prontos em `components/app/animations.tsx`:

```typescript
import {
  FadeIn,
  SlideUp,
  SlideIn,
  ScaleIn,
  StaggerChildren,
  StaggerItem,
} from '@/components/app/animations';
```

| Componente       | Uso                                          | Props                          |
| ---------------- | -------------------------------------------- | ------------------------------ |
| `FadeIn`         | Fade suave ao entrar na viewport             | `delay`, `duration`            |
| `SlideUp`        | Sobe de baixo com fade                       | `delay`, `duration`            |
| `SlideIn`        | Entra da esquerda ou direita                 | `delay`, `duration`, `direction` |
| `ScaleIn`        | Escala de 95% a 100% com fade                | `delay`, `duration`            |
| `StaggerChildren`| Container que anima filhos em sequência      | `staggerDelay`                 |
| `StaggerItem`    | Item dentro de `StaggerChildren`             | —                              |

#### Padrão de Uso em Landing Pages

```tsx
// Hero section com animações escalonadas
<section>
  <SlideUp>
    <h1>Título principal</h1>
  </SlideUp>
  <SlideUp delay={0.1}>
    <p>Subtítulo explicativo</p>
  </SlideUp>
  <SlideUp delay={0.2}>
    <Button>CTA</Button>
  </SlideUp>
</section>

// Grid de features com stagger
<StaggerChildren className="grid grid-cols-3 gap-8">
  {features.map((f) => (
    <StaggerItem key={f.title}>
      <FeatureCard {...f} />
    </StaggerItem>
  ))}
</StaggerChildren>
```

#### Regras de Animação

**Sempre:**

- Usar `viewport={{ once: true }}` — animar só na primeira vez que aparece
- Manter duração entre 300ms e 600ms — rápido o suficiente para não irritar
- Usar `delay` incremental em seções (0, 0.1, 0.2) para efeito cascata
- Preferir `easeOut` como curva de animação
- Testar em dispositivos lentos — animação não pode travar o scroll

**Nunca:**

- Animar elementos acima do fold que atrasem o LCP
- Usar animações em loop infinito (exceto loading states)
- Animar mais de 5 elementos simultaneamente
- Usar animações que dependem de JS para layout (causa CLS)

#### Workflow para Criar Landing Page Profissional

```text
1. Usar ui-ux-pro-max para escolher estilo visual e paleta
   → Buscar inspiração: python3 .cursor/skills/ui-ux-pro-max/scripts/search.py "saas landing"

2. Usar Magic MCP (21st.dev) para buscar componentes prontos
   → 21st_magic_component_builder: busca hero sections, pricing cards, etc.

3. Montar a página usando componentes de animação do template
   → FadeIn, SlideUp, StaggerChildren para scroll reveal

4. Validar SEO (metadata, sitemap, canonical, OG images)

5. Validar performance (LCP < 2.5s, CLS < 0.1)
```

---

## 7. Modelo de Git

### 7.1 Estratégia de Branches

Trunk-based development pragmático.

```text
main (protegida)
  │
  ├── feat/billing-stripe        ← branch curta de feature
  ├── fix/auth-token-refresh     ← branch curta de fix
  ├── chore/update-deps          ← branch curta de manutenção
  └── hotfix/payment-crash       ← hotfix urgente
```

**Regras:**

- `main` é a única branch de longa duração
- Todo trabalho sai de branch curta a partir de `main`
- Toda mudança entra via Pull Request
- Proibido push direto em `main`
- Deploy só roda após merge na `main`

### 7.2 Convenção de Nomes de Branch

```text
<tipo>/<descricao-curta>

Tipos permitidos:
  feat/     → nova funcionalidade
  fix/      → correção de bug
  chore/    → manutenção, deps, configs
  refactor/ → refatoração sem mudança funcional
  docs/     → documentação
  hotfix/   → correção urgente em produção
  test/     → adição ou ajuste de testes
```

### 7.3 Convenção de Commits (Conventional Commits)

```text
<tipo>(<escopo>): <descrição>

Exemplos:
  feat(billing): add Stripe webhook processing
  fix(auth): handle expired refresh tokens
  chore(deps): update drizzle-orm to latest
  refactor(api): extract payment service from controller
  docs(readme): add local setup instructions
```

**Tipos:** `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `ci`, `build`

**Escopos sugeridos:** `auth`, `billing`, `api`, `web`, `shared`, `drizzle`, `infra`, `ci`, `deps`

### 7.4 Regras de Pull Request

- PRs devem ser pequenas e focadas
- Preferir **squash merge**
- Mudanças de schema Drizzle devem ser sinalizadas no título da PR
- Template de PR deve conter: resumo, test plan, screenshots (se UI)
- Checks obrigatórios devem passar antes do merge

### 7.5 Template de PR

```markdown
## Resumo
<!-- O que esta PR faz e por quê -->

## Tipo de mudança
- [ ] Nova feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Infra / CI
- [ ] Schema / Migration

## Checklist
- [ ] TypeScript compila sem erros
- [ ] Lint passa
- [ ] Testes passam
- [ ] Migration incluída (se schema mudou)
- [ ] Schemas Zod atualizados em shared (se contratos mudaram)

## Test plan
<!-- Como testar esta mudança -->

## Screenshots
<!-- Se mudou UI -->
```

---

## 8. Pipeline de CI/CD

### 8.1 CI (GitHub Actions — em toda PR)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports: ['5432:5432']

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - name: Security audit
        run: pnpm audit --audit-level=high
      - run: pnpm turbo lint
      - run: pnpm turbo typecheck
      - run: pnpm turbo test:unit
      - run: pnpm turbo test:integration
      - run: pnpm turbo build
      - name: Validate migrations
        run: pnpm --filter api drizzle-kit migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
```

### 8.2 CD (GitHub Actions — `deploy.yml`)

**Staging não roda em PR automaticamente.** Depois que o **CI** da PR passou, alguém dispara **Actions → Deploy workflow** com `target: staging` e `git_ref` = branch da PR; o ambiente **`staging`** no GitHub pode exigir **aprovadores** antes do SSH na VPS. **Produção nunca é deployada a partir de evento de PR.**

**Push na `main`** (após merge): build e push das imagens `latest` (GHCR). **Produção:** tag `v*` → deploy automático (se secrets existirem); ou variável de repositório `AUTO_DEPLOY_PRODUCTION_ON_MAIN=true` para deploy em todo push na `main`; ou **workflow manual** com `target: production`. O ambiente **`production`** pode ter aprovadores adicionais.

```text
PR aberta
      │
      ▼
CI (ci.yml): lint, typecheck, testes, build, migrations
      │
      ▼
Deploy staging (manual): Actions → workflow **Deploy**, target=staging, git_ref=<branch>
      └── Opcional: approval no Environment "staging"
      └── SSH → VPS staging (tag stg-<run_id>)

merge → push na main
      │
      ▼
CD: build + push ghcr.io (latest + sha)
      │
      ├── Produção: tag v* → deploy automático (se configurado)
      ├── Produção: push main + AUTO_DEPLOY_PRODUCTION_ON_MAIN=true → deploy
      └── Ou: workflow manual target=production (ex.: após validar staging)
```

---

## 9. Estratégia de Deploy

### 9.1 Modelo de Infraestrutura

**Uma VPS por produto SaaS.** Cada produto da Trianox roda isolado.

Staging e produção rodam na **mesma VPS**, separados por Docker Compose projects com portas e domínios diferentes.

```text
VPS do Produto (única)
├── Caddy (reverse proxy + TLS automático)
│   ├── <dominio>                  → container web-prod (porta 3000)
│   ├── api.<dominio>              → container api-prod (porta 3333)
│   ├── stg.<dominio>              → container web-stg  (porta 4000)
│   └── api-stg.<dominio>          → container api-stg  (porta 4333)
├── Containers produção
│   ├── web-prod
│   ├── api-prod
│   └── db-prod (PostgreSQL, porta 5432)
├── Containers staging
│   ├── web-stg
│   ├── api-stg
│   └── db-stg (PostgreSQL, porta 5433)
└── Volumes
    ├── pgdata-prod
    ├── pgdata-stg
    ├── uploads-prod
    ├── uploads-stg
    └── caddy_data
```

### 9.2 Custo de Staging


| Recurso      | Produção          | Staging           | Notas                                |
| ------------ | ----------------- | ----------------- | ------------------------------------ |
| VPS          | Compartilhada     | Compartilhada     | Mesma máquina                        |
| Domínio/TLS  | Automático        | Automático        | Caddy resolve com Let's Encrypt      |
| PostgreSQL   | Instância própria | Instância própria | Portas diferentes, volumes separados |
| RAM estimada | ~1-2 GB           | ~512MB-1GB        | Staging recebe menos tráfego         |


**VPS recomendada:** 4GB RAM / 2 vCPU / 80GB disco para início. Escalar conforme necessidade.

### 9.3 Setup Inicial da VPS

```bash
# 1. Acesso SSH
ssh root@<ip-da-vps>

# 2. Criar usuário de deploy (nunca usar root)
adduser deploy
usermod -aG sudo deploy
su - deploy

# 3. Configurar SSH key para o usuário deploy
mkdir -p ~/.ssh
echo "<public-key-do-ci>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 4. Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker deploy
newgrp docker

# 5. Instalar Docker Compose (plugin)
sudo apt-get install docker-compose-plugin

# 6. Firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 7. Criar estrutura
mkdir -p ~/apps/<produto>/production
mkdir -p ~/apps/<produto>/staging

# 8. Configurar DNS
# A record: <dominio>         → <ip-da-vps>
# A record: api.<dominio>     → <ip-da-vps>
# A record: stg.<dominio>     → <ip-da-vps>
# A record: api-stg.<dominio> → <ip-da-vps>
```

### 9.4 Docker Compose — Produção

```yaml
# production/docker-compose.yml
services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - web
      - api
    restart: unless-stopped

  web:
    image: ghcr.io/trianox/<produto>-web:latest
    env_file: .env
    depends_on:
      - api
    restart: unless-stopped

  api:
    image: ghcr.io/trianox/<produto>-api:latest
    env_file: .env
    volumes:
      - uploads:/data/uploads
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:17-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    env_file: .env
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
  caddy_data:
  uploads:
```

### 9.5 Caddyfile

**Cache de assets imutáveis do Next.js:** para `/_next/static/*` (hashes no nome do ficheiro), o template define `Cache-Control: public, max-age=31536000, immutable` antes do `reverse_proxy`. HTML e rotas dinâmicas ficam no `handle` genérico, sem cache longo.

**VPS (`scripts/setup-vps.sh`):** existem **dois** Caddyfiles gerados (`production/caddy/` e `staging/caddy/`), cada um servido pelo Caddy **do mesmo** `docker-compose` da pasta. Em ambos, o upstream é o serviço **`web`** / **`api`** daquele stack (nomes fixos no `docker-compose.prod.yml`), não `web-stg`.

**Produção** (`~/apps/<produto>/production/caddy/Caddyfile`):

```text
<dominio> {
    handle /_next/static/* {
        header Cache-Control "public, max-age=31536000, immutable"
        reverse_proxy web:3000
    }
    handle {
        reverse_proxy web:3000
    }
}

api.<dominio> {
    reverse_proxy api:3333
}
```

**Staging** (`~/apps/<produto>/staging/caddy/Caddyfile`):

```text
stg.<dominio> {
    handle /_next/static/* {
        header Cache-Control "public, max-age=31536000, immutable"
        reverse_proxy web:3000
    }
    handle {
        reverse_proxy web:3000
    }
}

api-stg.<dominio> {
    reverse_proxy api:3333
}
```

Referência no repo (produção + `{$DOMAIN}` para substituição local): `infra/caddy/Caddyfile`.

### 9.6 Scripts de Deploy

```bash
#!/bin/bash
# scripts/deploy-prod.sh
set -euo pipefail

PRODUCT="<produto>"
ENV="production"
DIR="$HOME/apps/$PRODUCT/$ENV"

cd "$DIR"

echo "Pulling latest images..."
docker compose pull

echo "Running migrations..."
docker compose run --rm api npx drizzle-kit migrate

echo "Restarting services..."
docker compose up -d --remove-orphans

echo "Checking health..."
sleep 5
docker compose ps

echo "Deploy complete."
```

### 9.7 Gerenciamento de Variáveis de Ambiente

As envs ficam diretamente na VPS, em arquivos `.env` dentro de cada pasta de ambiente. Nunca passam pelo repositório.

**Template de `.env` (`.env.example` no repo):**

```bash
# ── Database ──
DATABASE_URL=postgresql://user:pass@db:5432/dbname
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

# ── API ──
PORT=3333
NODE_ENV=production
ALLOWED_ORIGINS=https://<dominio>,https://www.<dominio>
REQUEST_BODY_LIMIT_BYTES=1048576
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ── Frontend ──
NEXT_PUBLIC_API_URL=https://api.<dominio>
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# ── Stripe ──
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=

# ── Storage ──
UPLOADS_DIR=/data/uploads

# ── Email ──
RESEND_API_KEY=

# ── Analytics ──
POSTHOG_API_KEY=
```

### 9.8 Ambientes Resumo


| Ambiente     | Onde roda           | Domínio          | Deploy                  | Banco                         |
| ------------ | ------------------- | ---------------- | ----------------------- | ----------------------------- |
| `local`      | Máquina do dev      | localhost        | `docker compose up`     | Container local               |
| `staging`    | VPS (compartilhada) | stg.\<dominio\>  | Manual: workflow Deploy + approval opcional (Environment) | Container na VPS (porta 5433) |
| `production` | VPS (compartilhada) | \<dominio\>      | Tag `v*`, ou push `main` se `AUTO_DEPLOY_PRODUCTION_ON_MAIN`, ou workflow manual | Container na VPS (porta 5432) |


### 9.9 Logs na VPS (Docker)

**Por que em §9:** logs de produção são operação de **runtime na VPS** (Docker), não decisão de stack de aplicação — por isso ficam junto de deploy, e não em Drizzle ou frontend.

**Onde os logs “moram” na prática:**

1. **Padrão recomendado (início):** a API e o Next.js escrevem em **stdout/stderr** (JSON estruturado + correlation ID, conforme §13). O Docker captura isso no driver `json-file`. Na VPS você inspeciona com `docker compose logs -f api` / `web` (ou `docker logs`). Nada de arquivo de log **dentro** do container sem volume e rotação — enche disco e some com o restart.

2. **Rotação no disco da VPS:** configurar o daemon Docker ou, por serviço no `docker-compose.yml`, logging com limite, para não crescer sem teto:

```yaml
# Exemplo por serviço (api / web)
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

3. **Quando precisar busca, retenção longa ou alertas:** encaminhar stdout para um destino externo ou leve na mesma VPS:
   - **SaaS:** Grafana Cloud (Loki), Axiom, Better Stack, Datadog, etc. — agente ou `docker logging driver` / forwarder (ex.: Vector, Promtail).
   - **Self-hosted na VPS:** stack **Grafana + Loki + Promtail** (ou **Vector** → Loki) no mesmo Compose do produto, com volume dedicado e backup da config — aceitável para um time pequeno; monitorar RAM/disco.

**Resumo:** desenvolvimento e primeiros meses em produção = **stdout + `docker compose logs` + rotação `json-file`**. Evolui para **Loki (ou SaaS)** quando precisar de painel, busca em todos os containers e retenção.

---

## 10. Política de Migrations

- **Nunca** usar `drizzle-kit push` em staging ou produção
- Toda mudança de schema sai com migration versionada
- Toda migration deve ser revisada (SQL gerado, não apenas schema)
- CI valida migrations em banco efêmero
- Produção aplica migrations antes de servir a nova versão

### Fluxo de Migration

```text
1. Alterar schema TypeScript em drizzle/schema/
2. drizzle-kit generate — gera SQL em drizzle/migrations/
3. Revisar o SQL gerado (obrigatório)
4. drizzle-kit migrate — aplica no banco local
5. Commitar schema + migration juntos
6. Na PR, sinalizar "Schema Change" no título
7. CI valida migration em banco efêmero
8. Após merge, deploy aplica migration antes de subir a nova versão
```

### Expand-Contract para Mudanças Destrutivas

1. Adicionar nova estrutura (expand)
2. Fazer backfill/dual-write
3. Migrar leituras no app
4. Remover campos antigos em release posterior (contract)

---

## 11. Fluxo Completo de Git para Deploy

### 11.1 Fluxo Normal (Feature)

```text
1. Criar branch
   $ git checkout -b feat/nova-feature

2. Desenvolver e commitar
   $ git add .
   $ git commit -m "feat(modulo): add nova feature"

3. Push e abrir PR
   $ git push -u origin feat/nova-feature
   → Abrir PR no GitHub

4. CI roda automaticamente
   → lint ✓ → typecheck ✓ → tests ✓ → build ✓ → migration validate ✓

5. Deploy staging (manual): Actions → workflow **Deploy** → `target: staging`, `git_ref` = branch da PR (CI verde; **Environment staging** com aprovadores opcional)

6. Validação no staging (stg.\<dominio\>)

7. Code review + aprovação na PR

8. Squash merge na main → CD faz build/push **latest** no GHCR

9. Produção: tag `v*`, ou `AUTO_DEPLOY_PRODUCTION_ON_MAIN`, ou workflow **Deploy** com `target: production`
```

### 11.2 Fluxo de Hotfix

```text
1. git checkout main && git pull
2. git checkout -b hotfix/descricao-do-problema
3. Corrigir e commitar
4. PR com label "hotfix" → CI roda
5. Merge na main → conforme política do produto (tag `v*`, variável de auto-deploy, ou workflow manual para produção)
```

---

## 12. Organização de IA — `.ai/`

A pasta `.ai/` é o diretório padrão para configuração de assistentes de IA. É **agnóstica à ferramenta** (Cursor, Claude Code, Codex, Copilot).

### 12.1 Filosofia

O objetivo é que **qualquer dev do time, usando qualquer ferramenta de IA, consiga criar código que segue o padrão da arquitetura sem precisar decorar as regras.**

### 12.2 Estrutura Completa

```text
.ai/
├── AGENTS.md                     # Ponto de entrada universal
├── rules/                        # Regras que restringem comportamento da IA
│   ├── global.md                 # Regras universais
│   ├── backend.md                # Arquitetura layered, NestJS patterns
│   ├── frontend.md               # Next.js, TanStack Query, Zustand
│   ├── drizzle.md                # Schema, migrations, naming
│   ├── testing.md                # Vitest, Playwright
│   ├── seo.md                    # Metadata, OG, sitemap
│   └── auth.md                   # JWT, guards, roles
├── skills/                       # Guias passo-a-passo
│   ├── create-module/SKILL.md
│   ├── create-page/SKILL.md
│   ├── create-landing-page/SKILL.md
│   ├── create-migration/SKILL.md
│   ├── add-api-endpoint/SKILL.md
│   └── full-stack-feature/SKILL.md
├── agents/                       # Personas pré-configuradas
│   ├── architect.md              # Decisões de design
│   ├── reviewer.md               # Code review rigoroso
│   ├── onboarding.md             # Mentor para devs novos
│   └── migrator.md               # Mudanças de schema
├── context/                      # Contexto de negócio
│   ├── PRODUCT_PRD.md
│   ├── ARCHITECTURE.md
│   ├── DOMAIN_GLOSSARY.md
│   └── DATA_MODEL.md
└── prompts/                      # Prompts copy-paste
    ├── code-review.md
    ├── pr-description.md
    ├── debug-help.md
    └── refactor.md
```

### 12.3 AGENTS.md

O `AGENTS.md` fica na **raiz do repo** (e dentro de `.ai/`). Toda ferramenta de IA lê este arquivo primeiro. Autocontido com regras críticas e ponteiros para detalhes.

### 12.4 Bridges para Ferramentas Específicas

`.ai/` é a fonte de verdade. Cada ferramenta tem um arquivo-ponte mínimo:


| Ferramenta  | Config nativa                     | Bridge                                 |
| ----------- | --------------------------------- | -------------------------------------- |
| Cursor      | `.cursor/rules/`                  | `.cursor/rules/bridge.mdc` → `.ai/`   |
| Claude Code | `CLAUDE.md`                       | `CLAUDE.md` → `.ai/`                  |
| Codex       | `AGENTS.md`                       | `AGENTS.md` na raiz (lê `.ai/`)       |
| Copilot     | `.github/copilot-instructions.md` | Aponta para `.ai/`                     |

### 12.5 Formato de Rule (`.ai/rules/*.md`)

```markdown
---
scope: frontend
globs: "apps/web/**"
---

# Nome da Regra

## Sempre
- Usar TypeScript strict
- Validar inputs com Zod
- Importar tipos de `@shared/`

## Nunca
- Usar `any`
- Definir DTOs locais que já existem em shared
```

### 12.6 Formato de Skill (`.ai/skills/<nome>/SKILL.md`)

```markdown
---
name: create-module
description: Cria um novo módulo NestJS seguindo o padrão do projeto
---

# Create Module

## Inputs
- `moduleName`: nome do módulo

## Pre-check
- Verificar se já existe

## Steps
1. Criar schema Drizzle
2. Criar Zod schemas em shared
3. Criar service
4. Criar controller
5. Criar module
6. Gerar migration

## Validação
- [ ] TypeScript compila
- [ ] Queries filtram por tenantId
```

### 12.7 Agentes Pré-Configurados

Contextos de personalidade que o dev ativa para tarefas específicas:

- **Architect** — para decisões de design (nunca sugere overengineering)
- **Reviewer** — code review rigoroso contra as rules
- **Onboarding** — mentor paciente para devs novos
- **Migrator** — especialista em mudanças de schema seguras

### 12.8 Fluxo de Uso para o Time

```text
Dev quer criar feature nova
  │
  ├─ Sabe o que fazer:
  │    └─ "Siga a skill create-module para criar módulo de billing"
  │       → IA lê a skill, cria tudo no padrão
  │
  ├─ Não sabe como começar:
  │    └─ Ativa agente "Onboarding"
  │       → IA guia passo-a-passo referenciando a arquitetura
  │
  ├─ Quer revisar código:
  │    └─ Cola prompt de code-review.md
  │       → IA revisa contra as rules
  │
  └─ Quer mudar schema:
       └─ Ativa agente "Migrator"
          → IA guia pela migration de forma segura
```

---

## 13. Regras Universais de Implementação

### Sempre

- TypeScript strict em tudo
- Validar toda entrada externa na borda da API com Zod
- Valores monetários em inteiro (unidade mínima: centavos)
- UUIDs como chaves primárias
- Datas em UTC
- Logs estruturados
- Correlation IDs por request
- Tenant isolation em toda query
- CORS na API: `ALLOWED_ORIGINS` explícito em staging/produção, alinhado às URLs do Next (§3.5)

### Nunca

- `any` no código (exceto em type assertions documentadas)
- Dinheiro com ponto flutuante
- Push direto em main
- `drizzle-kit push` em staging/produção
- Hardcodar hostnames, segredos ou IDs de provider
- CORS aberto (`*`) com `credentials: true` em ambientes expostos
- Colocar contratos compartilhados dentro de pastas locais de app
- Misturar camadas (controller com lógica de negócio)
- Commitar `.env` com valores reais
- Deploy sem CI verde
- Criar Repository classes ou interfaces
- Criar Use Case classes separadas
- Criar Domain Entities separadas do schema Drizzle

---

## 14. Checklist de Novo Produto SaaS

Ao iniciar um novo produto SaaS na Trianox:

- [ ] Criar repositório a partir de template (se existir)
- [ ] Configurar monorepo: `pnpm-workspace.yaml` + `turbo.json`
- [ ] Criar `apps/web`, `apps/api`, `packages/shared`
- [ ] Configurar TypeScript strict em todos os packages
- [ ] Configurar ESLint com typescript-eslint
- [ ] Configurar Drizzle ORM com postgres.js
- [ ] Criar `infra/docker/` com Dockerfiles
- [ ] Criar `docker-compose.yml` para dev local
- [ ] Criar `.env.example` com todas as variáveis
- [ ] Configurar `.github/workflows/ci.yml`
- [ ] Configurar `.github/workflows/deploy.yml`
- [ ] Proteger branch `main` no GitHub
- [ ] Criar `.ai/` com rules, skills, agents, prompts e context
- [ ] Criar `AGENTS.md` na raiz
- [ ] Criar bridges (`.cursor/rules/bridge.mdc`, `CLAUDE.md`, `.github/copilot-instructions.md`)
- [ ] Configurar Vitest + Playwright
- [ ] Configurar PostHog
- [ ] Configurar Plausible/Umami para landing pages
- [ ] Configurar Google Search Console
- [ ] Configurar Stripe (se billing)
- [ ] Configurar domínio e DNS
- [ ] Provisionar VPS
- [ ] Rodar `scripts/setup-vps.sh` (Caddy com `/_next/static` cacheável, `.env` por ambiente com `ALLOWED_ORIGINS` alinhado ao Next)
- [ ] Configurar backups automáticos do PostgreSQL
- [ ] Criar PR template em `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] Instalar [Renovate GitHub App](https://github.com/apps/renovate) no repositório
- [ ] Revisar `.audit-ignore` se necessário

## 15. Gestão de Dependências e Segurança

O template usa duas camadas de proteção para manter dependências atualizadas e seguras.

### 15.1 Renovate (atualizações automáticas)

O [Renovate](https://github.com/apps/renovate) é um GitHub App que abre PRs automaticamente quando há atualizações de dependências. A configuração fica em `renovate.json` na raiz.

**Comportamento por tipo de update:**

| Tipo de update | Exemplo | Auto-merge? | Ação necessária |
|---|---|---|---|
| Patch | `1.0.0` → `1.0.1` | Sim, se CI passar | Nenhuma |
| Minor | `1.0.0` → `1.1.0` | Sim, se CI passar | Nenhuma |
| Major | `1.0.0` → `2.0.0` | Nunca | Review manual obrigatório |
| Lockfile | `pnpm-lock.yaml` | Sim, se CI passar | Nenhuma |

**Agrupamento de PRs:**

O Renovate agrupa atualizações relacionadas em uma única PR para evitar ruído:

- **dev dependencies** — todas as devDeps juntas
- **lint and format** — eslint, prettier, typescript-eslint, globals
- **testing tools** — vitest, playwright
- **nestjs** — todos os `@nestjs/*`
- **drizzle** — todos os `drizzle-*`
- **react and next** — next, react, react-dom e seus types

**Schedule:** segundas-feiras antes das 9h (America/Sao_Paulo).

**Setup:** instalar o [Renovate GitHub App](https://github.com/apps/renovate) e dar acesso ao repositório. O `renovate.json` já está incluído no template.

### 15.2 Security Audit no CI

Toda PR passa por `pnpm audit --audit-level=high` no CI. Se houver vulnerabilidades classificadas como **high** ou **critical**, o CI falha e o merge é bloqueado.

```text
pnpm install
      │
      ▼
pnpm audit --audit-level=high
      │
      ├── Sem vulnerabilidades high/critical → CI continua
      └── Vulnerabilidade encontrada → CI falha, merge bloqueado
```

### 15.3 Exceções de audit (`.audit-ignore`)

Quando uma vulnerabilidade não tem fix disponível (a lib ainda não lançou patch), o CI ficaria bloqueado indefinidamente. Para isso, existe o arquivo `.audit-ignore` na raiz:

```
# CVEs ignorados temporariamente (sem fix disponivel)
# Revisar mensalmente e remover quando fix estiver disponivel
GHSA-xxxx-xxxx-xxxx
CVE-2024-00000
```

O step de audit no CI lê esse arquivo e ignora os CVEs listados. **Regras:**

- Só adicionar CVEs que realmente não têm fix disponível
- Sempre adicionar comentário explicando por que está ignorado
- Revisar mensalmente — remover quando fix for lançado
- Nunca ignorar CVEs que têm fix (atualizar a dependência em vez disso)

### 15.4 Fluxo completo

```text
Renovate detecta update
      │
      ├── patch/minor → Abre PR com auto-merge
      └── major → Abre PR sem auto-merge
              │
              ▼
        CI roda na PR:
        ├── pnpm audit (segurança)
        ├── lint + typecheck
        ├── test:unit + test:integration
        └── build
              │
              ├── Tudo passou + auto-merge habilitado → Merge automático
              ├── Tudo passou + sem auto-merge → Espera review humano
              └── Algo falhou → PR fica aberta, notifica dev
```
