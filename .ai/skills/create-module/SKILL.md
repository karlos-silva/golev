---
name: create-module
description: Cria um novo módulo NestJS seguindo o padrão do projeto
---

# Create Module

## Inputs
- `moduleName`: nome do módulo (ex: `notifications`)

## Pre-check
- Verificar se módulo já existe em `apps/api/src/modules/<moduleName>`
- Verificar se schema já existe em `apps/api/drizzle/schema/`

## Steps

1. **Criar schema Drizzle** em `apps/api/drizzle/schema/<moduleName>.ts`
   - Tabela com UUIDs, timestamps, tenantId
   - Definir relations
   - Re-exportar em `drizzle/schema/index.ts`

2. **Criar Zod schemas** em `packages/shared/src/schemas/<moduleName>.ts`
   - Base com `drizzle-zod`
   - Schemas de input (create, update)
   - Re-exportar em `packages/shared/src/schemas/index.ts`

3. **Criar service** em `apps/api/src/modules/<moduleName>/<moduleName>.service.ts`
   - Injetar `DATABASE`
   - CRUD básico
   - Filtrar por tenantId

4. **Criar controller** em `apps/api/src/modules/<moduleName>/<moduleName>.controller.ts`
   - Rotas REST
   - Validação com Zod
   - `@UseGuards(JwtAuthGuard)`
   - `@CurrentUser('tenantId')` para tenant isolation

5. **Criar module** em `apps/api/src/modules/<moduleName>/<moduleName>.module.ts`
   - Registrar controller e service

6. **Registrar no AppModule** — adicionar ao array de imports

7. **Gerar migration** — `pnpm --filter api db:generate`

## Validação
- [ ] TypeScript compila (`pnpm turbo typecheck`)
- [ ] Todas as queries filtram por tenantId
- [ ] Zod schemas exportados de shared
- [ ] Migration gerada e revisada
