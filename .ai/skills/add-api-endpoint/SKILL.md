---
name: add-api-endpoint
description: Adiciona um novo endpoint REST na API
---

# Add API Endpoint

## Inputs
- `method`: GET, POST, PUT, PATCH, DELETE
- `path`: caminho do endpoint
- `module`: módulo existente

## Steps

1. **Definir Zod schema** em `packages/shared/src/schemas/`
   - Input schema (body/params/query)
   - Output schema (response)

2. **Adicionar método no Service**
   - Regra de negócio
   - Acesso ao Drizzle

3. **Adicionar rota no Controller**
   - Decorator HTTP correto (`@Get`, `@Post`, etc.)
   - Validar input com Zod
   - `@UseGuards(JwtAuthGuard)` (ou `@Public()`)
   - `@CurrentUser()` para dados do usuário

4. **Testar**
   - Unit test do service
   - Integration test do controller

## Validação
- [ ] Schema Zod em shared
- [ ] Guard configurado
- [ ] Testes escritos
