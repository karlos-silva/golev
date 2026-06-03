---
scope: drizzle
globs: "apps/api/drizzle/**"
---

# Drizzle ORM Rules

## Driver
- Usar `postgres.js` (não node-postgres)
- Inicializar com `drizzle({ client, schema })`

## Schema
- Tabelas: snake_case, plural (`refresh_tokens`)
- Colunas: snake_case (`created_at`)
- Schema TS: camelCase (`refreshTokens`, `createdAt`)
- Sempre incluir `createdAt` e `updatedAt`
- Soft delete com `deletedAt` quando apropriado

## Types
- Inferir com `$inferSelect` / `$inferInsert`
- Nunca definir tipos de tabela manualmente

## Relations
- Definir `relations()` para todo schema usado com `db.query.*`
- Relations no mesmo arquivo do schema

## Zod (drizzle-zod)
- Gerar schemas base com `createInsertSchema` / `createSelectSchema`
- Refinar com `.pick()`, `.omit()`, `.extend()`
- Exportar de `packages/shared`

## Migrations
- Nunca usar `drizzle-kit push` em staging/produção
- Toda mudança com migration versionada
- Commitar schema + migration juntos
- Expand-contract para mudanças destrutivas


## Naming Conventions
| Onde | Convenção | Exemplo |
|------|-----------|---------|
| Tabelas (DB) | snake_case, plural | `refresh_tokens` |
| Colunas (DB) | snake_case | `created_at` |
| Schema (TS) | camelCase | `refreshTokens` |
| Schema file | Domínio singular | `auth.ts`, `billing.ts` |
