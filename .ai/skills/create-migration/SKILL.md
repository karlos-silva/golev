---
name: create-migration
description: Gera e aplica uma migration Drizzle de forma segura
---

# Create Migration

## Inputs
- Descrição da mudança de schema

## Steps

1. **Alterar schema** em `apps/api/drizzle/schema/`

2. **Gerar migration:**
   ```bash
   pnpm --filter @golev/api db:generate
   ```

3. **Revisar SQL gerado** em `apps/api/drizzle/migrations/`
   - Verificar se não há data loss
   - Verificar se índices estão corretos
   - Se destrutiva: usar expand-contract

4. **Aplicar no banco local:**
   ```bash
   pnpm --filter @golev/api db:migrate
   ```

5. **Atualizar Zod schemas** em `packages/shared` se contratos mudaram

6. **Commitar schema + migration juntos**

7. **Na PR:** sinalizar "Schema Change" no título

## Expand-Contract (mudanças destrutivas)
1. Adicionar nova estrutura (expand)
2. Backfill/dual-write
3. Migrar leituras no app
4. Remover campos antigos em release posterior (contract)

## Validação
- [ ] SQL revisado
- [ ] Migration aplica sem erro
- [ ] Tipos inferidos atualizados
- [ ] Shared schemas atualizados
