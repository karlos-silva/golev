---
scope: global
globs: "**/*"
---

# Regras Globais

## Sempre
- TypeScript `strict: true` em todo o código
- `noUncheckedIndexedAccess` habilitado
- Validar toda entrada externa com Zod na borda da API
- UUIDs como chaves primárias
- Datas em UTC com timezone
- Valores monetários em centavos (inteiro)
- Logs estruturados
- Correlation IDs por request
- Tenant isolation em toda query de dados tenant-scoped
- Importar tipos e schemas de `@trianox/shared`

## Nunca
- `any` no código (exceto type assertions documentadas)
- Comentários óbvios ou narrativos (`// Import the module`, `// Return the result`, `// Handle the error`) — código deve ser autoexplicativo. Comentários só para intenção não-óbvia, trade-offs ou restrições técnicas
- Dinheiro com ponto flutuante
- Push direto em main
- Hardcodar hostnames, segredos ou IDs
- Commitar `.env` com valores reais
- Deploy sem CI verde
- Criar Repository, Use Case ou Domain Entity classes
- Duplicar tipos que existem em `packages/shared`
