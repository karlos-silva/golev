---
name: full-stack-feature
description: Implementa uma feature full-stack (schema → API → UI)
---

# Full-Stack Feature

## Inputs
- `featureName`: nome da feature
- `description`: descrição do que a feature faz

## Steps

### 1. Schema (Drizzle)
- Criar/alterar schema em `apps/api/drizzle/schema/`
- Gerar migration
- Revisar SQL

### 2. Shared (Contratos)
- Zod schemas de input/output em `packages/shared/src/schemas/`
- Tipos de contrato em `packages/shared/src/contracts/`
- Enums/domain types em `packages/shared/src/domain/`

### 3. Backend (NestJS)
- Service com regra de negócio
- Controller com rotas REST
- Guards e validação

### 4. Frontend (Next.js)
- Hooks com TanStack Query para fetching
- Componentes em `components/app/`
- Páginas com validação Zod

### 5. Testes
- Unit tests do service
- Component tests (se UI complexa)

## Validação
- [ ] TypeScript compila em todos os packages
- [ ] Migration gerada e revisada
- [ ] Dados fluem corretamente E2E
- [ ] Testes passam
