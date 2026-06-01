---
name: create-page
description: Cria uma nova página Next.js seguindo o padrão do projeto
---

# Create Page

## Inputs
- `pagePath`: caminho da página (ex: `(app)/settings`)
- `pageType`: `marketing`, `auth` ou `app`

## Steps

1. **Criar diretório** em `apps/web/src/app/<pagePath>/`

2. **Criar page.tsx**
   - Se marketing: exportar `metadata` com title, description, OG
   - Se app: usar client state e TanStack Query conforme necessário
   - Se auth: form com Zod validation

3. **Criar componentes** em `apps/web/src/components/app/` se necessário
   - Server Components por padrão
   - `'use client'` apenas quando necessário

4. **Criar hooks** se houver lógica de fetching customizada

## Validação
- [ ] TypeScript compila
- [ ] Se marketing: metadata exportada
- [ ] Se app: dados vêm via TanStack Query
- [ ] Responsivo (mobile first)
